"""
backend/app/api/v1/abdm.py
ABDM (Ayushman Bharat Digital Mission) Gateway Simulator.
Implements:
- HIP (Health Information Provider): Patient Discovery, Care-Context Linking, FHIR Data Extraction
- HIU (Health Information User): Consent Initiation, Health Information Data Transfer
"""

import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import (
    Patient, Practitioner, Encounter, Condition, Prescription,
    LabOrder, Observation, DiagnosticReport, Consent, User, utc_now
)
from backend.app.fhir.serializers import FhirSerializer
from backend.app.api.deps import get_current_user, require_roles
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/abdm", tags=["ABDM HIP & HIU Integration"])

# --- Request/Response Schemas ---
class HipDiscoverRequest(BaseModel):
    abha_id: str = Field(..., description="Patient 14-digit ABHA or ABHA address")
    hip_id: str = Field(default="HIP-APOLLO-DELHI", description="Health Information Provider Identifier")

class CareContextItem(BaseModel):
    referenceNumber: str
    display: str

class HipDiscoverResponse(BaseModel):
    patient_id: str
    patient_name: str
    abha_id: str
    gender: str
    care_contexts: List[CareContextItem]

class HipLinkInitRequest(BaseModel):
    patient_id: str
    abha_id: str

class HipLinkConfirmRequest(BaseModel):
    patient_id: str
    otp: str = Field(..., description="Demo OTP: 123456")

class HiuConsentRequest(BaseModel):
    patient_id: str
    doctor_id: str
    purpose: str = "CONSULTATION"
    hiu_id: str = "HIU-APOLLO-CLINIC"
    categories: List[str] = ["ALL_RECORDS"]
    valid_days: int = 30

class HiuDataFetchResponse(BaseModel):
    transaction_id: str
    consent_id: str
    status: str
    hip_id: str
    hiu_id: str
    fhir_bundle: Dict[str, Any]

# --- In-Memory Demo OTP Store ---
DEMO_OTP_STORE: Dict[str, str] = {}

# =========================================================================
# 1. HIP (Health Information Provider) Endpoints
# =========================================================================

@router.post("/hip/discover", response_model=HipDiscoverResponse)
async def hip_patient_discovery(
    req: HipDiscoverRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    ABDM M2: Health Information Provider (HIP) searches internal registry
    to discover Care Contexts for an ABHA holder.
    """
    stmt = (
        select(Patient)
        .where(Patient.abha_id == req.abha_id.strip())
        .options(
            selectinload(Patient.user),
            selectinload(Patient.encounters),
            selectinload(Patient.lab_orders)
        )
    )
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail=f"No patient found matching ABHA ID '{req.abha_id}' in this HIP registry")

    care_contexts = []
    for enc in patient.encounters:
        care_contexts.append(CareContextItem(
            referenceNumber=f"ENC-{enc.id[:8]}",
            display=f"OPD Consultation: {enc.reason or 'General Evaluation'}"
        ))

    for lo in patient.lab_orders:
        care_contexts.append(CareContextItem(
            referenceNumber=f"LAB-{lo.id[:8]}",
            display=f"Diagnostic Investigation: {lo.test_name}"
        ))

    return HipDiscoverResponse(
        patient_id=patient.id,
        patient_name=patient.user.full_name if patient.user else "Patient",
        abha_id=patient.abha_id,
        gender=patient.gender or "Unknown",
        care_contexts=care_contexts
    )

@router.post("/hip/link/init")
async def hip_init_care_context_link(req: HipLinkInitRequest):
    """
    ABDM M2: Initiates OTP challenge for linking Care Contexts to ABHA account.
    """
    otp = "123456"  # Demo fixed OTP
    DEMO_OTP_STORE[req.patient_id] = otp
    return {
        "status": "OTP_SENT",
        "message": "Authentication OTP dispatched to registered mobile number (Demo OTP: 123456)",
        "patient_id": req.patient_id
    }

@router.post("/hip/link/confirm")
async def hip_confirm_care_context_link(
    req: HipLinkConfirmRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    ABDM M2: Verifies OTP and binds Care Contexts to the user's ABHA account.
    """
    expected_otp = DEMO_OTP_STORE.get(req.patient_id, "123456")
    if req.otp != expected_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please use demo OTP: 123456")

    stmt = select(Patient).options(
        selectinload(Patient.encounters),
        selectinload(Patient.lab_orders),
        selectinload(Patient.user)
    ).where(Patient.id == req.patient_id)
    patient = (await db.execute(stmt)).scalar_one_or_none()

    linked_care_contexts = []
    if patient:
        for enc in patient.encounters:
            linked_care_contexts.append({
                "referenceNumber": f"ENC-{enc.id[:8]}",
                "display": f"OPD Consultation: {enc.reason or 'General Evaluation'}",
                "type": "ENCOUNTER",
                "status": "LINKED_AND_VERIFIED",
                "date": enc.created_at.strftime("%d %b %Y, %I:%M %p") if enc.created_at else "Recent"
            })
        for lo in patient.lab_orders:
            dt = getattr(lo, "ordered_at", None) or getattr(lo, "completed_at", None)
            linked_care_contexts.append({
                "referenceNumber": f"LAB-{lo.id[:8]}",
                "display": f"Diagnostic Investigation: {lo.test_name}",
                "type": "DIAGNOSTIC_REPORT",
                "status": "LINKED_AND_VERIFIED",
                "date": dt.strftime("%d %b %Y, %I:%M %p") if dt else "Recent"
            })

    return {
        "status": "LINKED",
        "message": "Care Contexts successfully linked to ABHA profile under ABDM Gateway",
        "patient_id": req.patient_id,
        "patient_name": patient.user.full_name if patient and patient.user else "Rajesh Sharma",
        "abha_id": patient.abha_id if patient else "91-4405-2026-0001",
        "linked_at": datetime.now(timezone.utc).isoformat(),
        "hip_id": "IN0810000023",
        "hip_name": "Dr. Lal PathLabs National Reference Lab",
        "care_contexts": linked_care_contexts
    }

# =========================================================================
# 2. HIU (Health Information User) Endpoints
# =========================================================================

@router.post("/hiu/consent/request")
async def hiu_request_consent(
    req: HiuConsentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    ABDM M3: HIU initiates a formal consent request via ABDM Consent Manager.
    """
    stmt_p = select(Patient).where(Patient.id == req.patient_id)
    patient = (await db.execute(stmt_p)).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Target patient not found")

    now = utc_now()
    consent = Consent(
        patient_id=req.patient_id,
        doctor_id=req.doctor_id,
        purpose=req.purpose,
        categories=req.categories,
        status="GRANTED",  # In simulation, auto-approved or pending approval
        valid_from=now,
        valid_to=now + timedelta(days=req.valid_days)
    )
    db.add(consent)
    await db.commit()
    await db.refresh(consent)

    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="ABDM_HIU_CONSENT_REQUEST",
        patient_id=patient.id,
        consent_id=consent.id,
        purpose=req.purpose,
        status="SUCCESS",
        details={"hiu_id": req.hiu_id, "categories": req.categories}
    )

    return {
        "status": "CONSENT_GRANTED",
        "consent_artifact_id": consent.id,
        "valid_until": consent.valid_to.isoformat(),
        "message": "Consent artifact verified and active in ABDM Consent Manager"
    }

@router.get("/hiu/health-information/fetch/{consent_id}", response_model=HiuDataFetchResponse)
async def hiu_fetch_health_information(
    consent_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    ABDM M3: HIU retrieves verified, encrypted FHIR R4 Health Information Bundle
    from the HIP under active consent artifact.
    """
    stmt = (
        select(Consent)
        .where(Consent.id == consent_id)
        .options(
            selectinload(Consent.patient).selectinload(Patient.user),
            selectinload(Consent.patient).selectinload(Patient.encounters),
            selectinload(Consent.patient).selectinload(Patient.conditions),
            selectinload(Consent.patient).selectinload(Patient.prescriptions),
            selectinload(Consent.patient).selectinload(Patient.lab_orders).selectinload(LabOrder.observations),
            selectinload(Consent.patient).selectinload(Patient.lab_orders).selectinload(LabOrder.diagnostic_report),
            selectinload(Consent.doctor).selectinload(Practitioner.user)
        )
    )
    res = await db.execute(stmt)
    consent = res.scalar_one_or_none()
    if not consent or consent.status != "GRANTED":
        raise HTTPException(status_code=403, detail="Consent artifact is expired, revoked, or invalid")

    patient = consent.patient
    doctor = consent.doctor

    # Construct standard ABDM FHIR R4 Document Bundle
    fhir_entries = []

    # 1. Patient
    fhir_entries.append({"resource": FhirSerializer.patient_to_fhir(patient)})

    # 2. Practitioner
    if doctor:
        fhir_entries.append({"resource": FhirSerializer.practitioner_to_fhir(doctor)})

    # 3. Encounters
    for enc in patient.encounters:
        fhir_entries.append({"resource": FhirSerializer.encounter_to_fhir(enc)})

    # 4. Conditions
    for cond in patient.conditions:
        fhir_entries.append({"resource": FhirSerializer.condition_to_fhir(cond)})

    # 5. Prescriptions
    for rx in patient.prescriptions:
        fhir_entries.append({"resource": FhirSerializer.prescription_to_fhir(rx)})

    # 6. Lab Observations and Diagnostic Reports
    for lo in patient.lab_orders:
        for obs in lo.observations:
            fhir_entries.append({"resource": FhirSerializer.observation_to_fhir(obs)})
        if lo.diagnostic_report:
            fhir_entries.append({
                "resource": FhirSerializer.diagnostic_report_to_fhir(lo.diagnostic_report, lo.observations)
            })

    # Composition header
    composition = {
        "resourceType": "Composition",
        "id": f"COMP-{consent.id[:8]}",
        "status": "final",
        "type": {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": "371530004",
                    "display": "Clinical consultation report"
                }
            ],
            "text": "ABDM Longitudinal Clinical Summary"
        },
        "subject": {"reference": f"Patient/{patient.id}"},
        "date": utc_now().isoformat(),
        "author": [{"reference": f"Practitioner/{doctor.id}" if doctor else "System"}],
        "title": "ABDM Patient Health Record",
        "section": [
            {"title": "Encounters", "entry": [{"reference": f"Encounter/{e.id}"} for e in patient.encounters]},
            {"title": "Diagnoses", "entry": [{"reference": f"Condition/{c.id}"} for c in patient.conditions]},
            {"title": "Prescriptions", "entry": [{"reference": f"MedicationRequest/{p.id}"} for p in patient.prescriptions]}
        ]
    }

    fhir_bundle = {
        "resourceType": "Bundle",
        "id": f"BUNDLE-{uuid.uuid4().hex[:12]}",
        "meta": {
            "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"],
            "lastUpdated": utc_now().isoformat()
        },
        "type": "document",
        "timestamp": utc_now().isoformat(),
        "entry": [{"resource": composition}] + fhir_entries
    }

    return HiuDataFetchResponse(
        transaction_id=f"TXN-{uuid.uuid4().hex[:8].upper()}",
        consent_id=consent.id,
        status="TRANSFERRED",
        hip_id="HIP-APOLLO-DELHI",
        hiu_id="HIU-APOLLO-CLINIC",
        fhir_bundle=fhir_bundle
    )
