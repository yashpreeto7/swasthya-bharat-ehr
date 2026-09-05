from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import (
    Patient, Practitioner, Encounter, Condition,
    Observation, DiagnosticReport, Prescription, Consent, LabOrder
)
from backend.app.fhir.serializers import FhirSerializer

router = APIRouter(prefix="/fhir", tags=["FHIR R4 Interoperability"])

@router.get("/Patient/{id}")
async def get_fhir_patient(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Patient).where(Patient.id == id).options(selectinload(Patient.user))
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="FHIR Resource Patient not found")
    return FhirSerializer.patient_to_fhir(patient)

@router.get("/Practitioner/{id}")
async def get_fhir_practitioner(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Practitioner).where(Practitioner.id == id).options(selectinload(Practitioner.user))
    res = await db.execute(stmt)
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="FHIR Resource Practitioner not found")
    return FhirSerializer.practitioner_to_fhir(doc)

@router.get("/Encounter/{id}")
async def get_fhir_encounter(id: str, db: AsyncSession = Depends(get_db)):
    stmt = select(Encounter).where(Encounter.id == id)
    res = await db.execute(stmt)
    enc = res.scalar_one_or_none()
    if not enc:
        raise HTTPException(status_code=404, detail="FHIR Resource Encounter not found")
    return FhirSerializer.encounter_to_fhir(enc)

@router.get("/Condition")
async def get_fhir_conditions(patient: str = Query(..., description="Patient ID"), db: AsyncSession = Depends(get_db)):
    stmt = select(Condition).where(Condition.patient_id == patient)
    res = await db.execute(stmt)
    conditions = res.scalars().all()
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(conditions),
        "entry": [{"resource": FhirSerializer.condition_to_fhir(c)} for c in conditions]
    }

@router.get("/Observation")
async def get_fhir_observations(patient: str = Query(..., description="Patient ID"), db: AsyncSession = Depends(get_db)):
    stmt = select(Observation).where(Observation.patient_id == patient)
    res = await db.execute(stmt)
    obs_list = res.scalars().all()
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(obs_list),
        "entry": [{"resource": FhirSerializer.observation_to_fhir(o)} for o in obs_list]
    }

@router.get("/DiagnosticReport")
async def get_fhir_diagnostic_reports(patient: str = Query(..., description="Patient ID"), db: AsyncSession = Depends(get_db)):
    stmt = select(DiagnosticReport).where(DiagnosticReport.patient_id == patient).options(
        selectinload(DiagnosticReport.lab_order).selectinload(LabOrder.observations)
    )
    res = await db.execute(stmt)
    reports = res.scalars().all()
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(reports),
        "entry": [
            {
                "resource": FhirSerializer.diagnostic_report_to_fhir(
                    r, r.lab_order.observations if r.lab_order else []
                )
            }
            for r in reports
        ]
    }

@router.get("/MedicationRequest")
async def get_fhir_medication_requests(patient: str = Query(..., description="Patient ID"), db: AsyncSession = Depends(get_db)):
    stmt = select(Prescription).where(Prescription.patient_id == patient)
    res = await db.execute(stmt)
    rxs = res.scalars().all()
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(rxs),
        "entry": [{"resource": FhirSerializer.prescription_to_fhir(rx)} for rx in rxs]
    }

@router.get("/Consent")
async def get_fhir_consents(patient: str = Query(..., description="Patient ID"), db: AsyncSession = Depends(get_db)):
    stmt = select(Consent).where(Consent.patient_id == patient)
    res = await db.execute(stmt)
    consents = res.scalars().all()
    return {
        "resourceType": "Bundle",
        "type": "searchset",
        "total": len(consents),
        "entry": [{"resource": FhirSerializer.consent_to_fhir(c)} for c in consents]
    }
