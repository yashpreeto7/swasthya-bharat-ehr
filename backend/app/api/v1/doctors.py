from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import User, Patient, Practitioner, Consent, Encounter, Condition, Prescription, LabOrder, utc_now
from backend.app.schemas.models import EncounterCreate, LabOrderCreate
from backend.app.api.deps import get_current_user, require_roles, verify_consent_access
from backend.app.api.v1.patients import build_patient_timeline
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("")
async def list_practitioners(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Practitioner).options(selectinload(Practitioner.user))
    practitioners = (await db.execute(stmt)).scalars().all()
    return [
        {
            "practitioner_id": p.id,
            "id": p.id,
            "full_name": p.user.full_name if p.user else "Doctor",
            "specialization": p.specialization,
            "hospital_name": p.hospital_name,
            "registration_number": p.registration_number,
            "department": p.department
        }
        for p in practitioners
    ]

@router.get("/all-patients")
async def get_all_patients_directory(
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    """Allows clinicians to view hospital patient registry for emergency break-glass selection."""
    stmt = select(Patient).options(selectinload(Patient.user)).limit(50)
    patients = (await db.execute(stmt)).scalars().all()
    return [
        {
            "patient_id": p.id,
            "abha_id": p.abha_id,
            "full_name": p.user.full_name if p.user else "Patient",
            "gender": p.gender,
            "date_of_birth": p.date_of_birth,
            "blood_group": p.blood_group
        }
        for p in patients
    ]

@router.get("/authorized-patients")
async def get_authorized_patients(
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    stmt_doc = select(Practitioner).where(Practitioner.user_id == current_user.id)
    doc = (await db.execute(stmt_doc)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    now = utc_now()
    stmt_consent = (
        select(Consent)
        .where(
            and_(
                Consent.doctor_id == doc.id,
                Consent.status.in_(["GRANTED", "EMERGENCY_OVERRIDE"]),
                Consent.valid_from <= now,
                Consent.valid_to >= now,
                Consent.revoked_at.is_(None)
            )
        )
        .options(selectinload(Consent.patient).selectinload(Patient.user))
    )
    consents = (await db.execute(stmt_consent)).scalars().all()

    patients = []
    seen_patient_ids = set()
    for c in consents:
        if c.patient and c.patient_id not in seen_patient_ids:
            seen_patient_ids.add(c.patient_id)
            patients.append({
                "patient_id": c.patient.id,
                "abha_id": c.patient.abha_id,
                "full_name": c.patient.user.full_name if c.patient.user else "Patient",
                "gender": c.patient.gender,
                "date_of_birth": c.patient.date_of_birth,
                "blood_group": c.patient.blood_group,
                "consent_id": c.id,
                "status": c.status,
                "is_emergency_override": c.status == "EMERGENCY_OVERRIDE",
                "purpose": c.purpose,
                "categories": c.categories,
                "valid_until": c.valid_to.isoformat()
            })

    return patients

@router.get("/patients/{patient_id}/timeline")
async def get_patient_timeline_for_doctor(
    patient_id: str,
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    # Verify consent before accessing protected patient timeline
    consent = await verify_consent_access(
        patient_id=patient_id,
        category="ALL_RECORDS",
        doctor_user=current_user,
        db=db
    )

    # Log authorized audit event
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="DOCTOR",
        action="VIEW_PATIENT_TIMELINE",
        patient_id=patient_id,
        consent_id=consent.id if consent else None,
        purpose=consent.purpose if consent else "CONSULTATION",
        status="SUCCESS",
        details={"accessed_category": "ALL_RECORDS"}
    )

    return await build_patient_timeline(patient_id, db)

@router.post("/encounters")
async def create_encounter(
    req: EncounterCreate,
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    stmt_doc = select(Practitioner).where(Practitioner.user_id == current_user.id)
    doc = (await db.execute(stmt_doc)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # Verify doctor is authorized for this patient
    consent = await verify_consent_access(
        patient_id=req.patient_id,
        category="ALL_RECORDS",
        doctor_user=current_user,
        db=db
    )

    # Create encounter
    encounter = Encounter(
        patient_id=req.patient_id,
        doctor_id=doc.id,
        encounter_type=req.encounter_type,
        reason=req.reason,
        clinical_notes=req.clinical_notes,
        status="COMPLETED"
    )
    db.add(encounter)
    await db.flush()

    # Add conditions (diagnoses)
    for c in req.conditions:
        cond = Condition(
            patient_id=req.patient_id,
            encounter_id=encounter.id,
            snomed_code=c.snomed_code,
            display_name=c.display_name,
            clinical_status=c.clinical_status,
            severity=c.severity,
            onset_date=c.onset_date,
            notes=c.notes
        )
        db.add(cond)

    # Add prescriptions
    for p in req.prescriptions:
        rx = Prescription(
            patient_id=req.patient_id,
            doctor_id=doc.id,
            encounter_id=encounter.id,
            medication_name=p.medication_name,
            dosage=p.dosage,
            frequency=p.frequency,
            duration=p.duration,
            instructions=p.instructions
        )
        db.add(rx)

    await db.commit()

    # Log audit event
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="DOCTOR",
        action="CREATE_ENCOUNTER",
        patient_id=req.patient_id,
        consent_id=consent.id if consent else None,
        purpose=consent.purpose if consent else "CONSULTATION",
        status="SUCCESS",
        details={"encounter_id": encounter.id, "diagnoses_count": len(req.conditions)}
    )

    return {"message": "Encounter recorded successfully", "encounter_id": encounter.id}

@router.post("/lab-orders")
async def create_lab_order(
    req: LabOrderCreate,
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    stmt_doc = select(Practitioner).where(Practitioner.user_id == current_user.id)
    doc = (await db.execute(stmt_doc)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    consent = await verify_consent_access(
        patient_id=req.patient_id,
        category="DIAGNOSTIC_REPORT",
        doctor_user=current_user,
        db=db
    )

    lab_order = LabOrder(
        patient_id=req.patient_id,
        doctor_id=doc.id,
        lab_id=req.lab_id,
        test_name=req.test_name,
        test_code=req.test_code,
        priority=req.priority,
        clinical_notes=req.clinical_notes,
        status="PENDING"
    )
    db.add(lab_order)
    await db.commit()
    await db.refresh(lab_order)

    # Audit log
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="DOCTOR",
        action="ORDER_LAB_TEST",
        patient_id=req.patient_id,
        consent_id=consent.id if consent else None,
        status="SUCCESS",
        details={"lab_order_id": lab_order.id, "test_name": req.test_name}
    )

    return {"message": "Lab order created successfully", "lab_order_id": lab_order.id}
