from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import User, Patient, Practitioner, Encounter, Condition, Prescription, LabOrder, Allergy, Appointment
from backend.app.api.deps import get_current_user, require_roles, verify_consent_access
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/me/profile")
async def get_my_profile(
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Patient).where(Patient.user_id == current_user.id).options(selectinload(Patient.user))
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    return {
        "id": patient.id,
        "full_name": patient.user.full_name,
        "email": patient.user.email,
        "abha_id": patient.abha_id,
        "date_of_birth": patient.date_of_birth,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "address": patient.address,
        "emergency_contact": patient.emergency_contact
    }

@router.get("/me/timeline")
async def get_my_timeline(
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Patient).where(Patient.user_id == current_user.id)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    return await build_patient_timeline(patient.id, db)

async def build_patient_timeline(patient_id: str, db: AsyncSession):
    # Encounters
    enc_stmt = select(Encounter).where(Encounter.patient_id == patient_id).options(selectinload(Encounter.doctor).selectinload(Practitioner.user))
    encounters = (await db.execute(enc_stmt)).scalars().all()

    # Conditions
    cond_stmt = select(Condition).where(Condition.patient_id == patient_id)
    conditions = (await db.execute(cond_stmt)).scalars().all()

    # Prescriptions
    rx_stmt = select(Prescription).where(Prescription.patient_id == patient_id).options(selectinload(Prescription.doctor).selectinload(Practitioner.user))
    prescriptions = (await db.execute(rx_stmt)).scalars().all()

    # Lab Orders
    lo_stmt = select(LabOrder).where(LabOrder.patient_id == patient_id).options(
        selectinload(LabOrder.observations),
        selectinload(LabOrder.diagnostic_report),
        selectinload(LabOrder.lab)
    )
    lab_orders = (await db.execute(lo_stmt)).scalars().all()

    # Allergies
    all_stmt = select(Allergy).where(Allergy.patient_id == patient_id)
    allergies = (await db.execute(all_stmt)).scalars().all()

    # Appointments
    app_stmt = select(Appointment).where(Appointment.patient_id == patient_id).options(selectinload(Appointment.doctor).selectinload(Practitioner.user))
    appointments = (await db.execute(app_stmt)).scalars().all()

    timeline_events = []

    for e in encounters:
        timeline_events.append({
            "id": e.id,
            "type": "ENCOUNTER",
            "title": f"Consultation: {e.reason or 'Clinical Consultation'}",
            "date": e.encounter_date.isoformat(),
            "doctor": e.doctor.user.full_name if e.doctor and e.doctor.user else "Practitioner",
            "hospital": e.doctor.hospital_name if e.doctor else "Hospital",
            "notes": e.clinical_notes,
            "status": e.status
        })

    for c in conditions:
        timeline_events.append({
            "id": c.id,
            "type": "DIAGNOSIS",
            "title": f"Diagnosis: {c.display_name}",
            "date": c.created_at.isoformat(),
            "snomed_code": c.snomed_code,
            "status": c.clinical_status,
            "severity": c.severity,
            "notes": c.notes
        })

    for r in prescriptions:
        timeline_events.append({
            "id": r.id,
            "type": "PRESCRIPTION",
            "title": f"Prescription: {r.medication_name}",
            "date": r.prescribed_at.isoformat(),
            "dosage": r.dosage,
            "frequency": r.frequency,
            "duration": r.duration,
            "doctor": r.doctor.user.full_name if r.doctor and r.doctor.user else "Doctor",
            "instructions": r.instructions
        })

    for lo in lab_orders:
        timeline_events.append({
            "id": lo.id,
            "type": "LAB_REPORT",
            "title": f"Laboratory: {lo.test_name}",
            "date": lo.ordered_at.isoformat(),
            "status": lo.status,
            "conclusion": lo.diagnostic_report.conclusion if lo.diagnostic_report else None,
            "report_id": lo.diagnostic_report.id if lo.diagnostic_report else None,
            "observations": [
                {
                    "name": obs.test_name,
                    "value": obs.value,
                    "unit": obs.unit,
                    "range": obs.reference_range,
                    "is_abnormal": obs.is_abnormal
                }
                for obs in lo.observations
            ]
        })

    timeline_events.sort(key=lambda x: x["date"], reverse=True)

    return {
        "patient_id": patient_id,
        "events": timeline_events,
        "allergies": [{"substance": a.substance, "severity": a.severity} for a in allergies],
        "appointments": [
            {
                "id": app.id,
                "time": app.appointment_time.isoformat(),
                "reason": app.reason,
                "doctor": app.doctor.user.full_name if app.doctor and app.doctor.user else "Doctor",
                "status": app.status
            }
            for app in appointments
        ]
    }
