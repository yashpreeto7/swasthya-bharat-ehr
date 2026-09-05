from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import User, Patient, Practitioner, Consent, utc_now
from backend.app.schemas.models import ConsentGrantRequest, ConsentResponse
from backend.app.api.deps import get_current_user, require_roles
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/consent", tags=["Consent Management"])

@router.post("/grant", response_model=ConsentResponse)
async def grant_consent(
    req: ConsentGrantRequest,
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt_p = select(Patient).where(Patient.user_id == current_user.id)
    patient = (await db.execute(stmt_p)).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    stmt_d = select(Practitioner).where(Practitioner.id == req.doctor_id).options(selectinload(Practitioner.user))
    doc = (await db.execute(stmt_d)).scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Selected doctor does not exist")

    now = utc_now()
    valid_to = now + timedelta(days=req.valid_days)

    consent = Consent(
        patient_id=patient.id,
        doctor_id=doc.id,
        purpose=req.purpose,
        categories=req.categories,
        status="GRANTED",
        valid_from=now,
        valid_to=valid_to
    )
    db.add(consent)
    await db.commit()
    await db.refresh(consent)

    # Log audit event
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="PATIENT",
        action="GRANT_CONSENT",
        patient_id=patient.id,
        consent_id=consent.id,
        purpose=req.purpose,
        status="SUCCESS",
        details={"doctor_id": doc.id, "categories": req.categories, "valid_days": req.valid_days}
    )

    return ConsentResponse(
        id=consent.id,
        patient_id=patient.id,
        patient_name=current_user.full_name,
        doctor_id=doc.id,
        doctor_name=doc.user.full_name if doc.user else "Doctor",
        purpose=consent.purpose,
        categories=consent.categories,
        status=consent.status,
        valid_from=consent.valid_from,
        valid_to=consent.valid_to,
        created_at=consent.created_at
    )

@router.post("/{consent_id}/revoke")
async def revoke_consent(
    consent_id: str,
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt_p = select(Patient).where(Patient.user_id == current_user.id)
    patient = (await db.execute(stmt_p)).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    stmt = select(Consent).where(
        and_(Consent.id == consent_id, Consent.patient_id == patient.id)
    )
    consent = (await db.execute(stmt)).scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=404, detail="Consent artifact not found")

    now = utc_now()
    consent.status = "REVOKED"
    consent.revoked_at = now
    await db.commit()

    # Log audit event
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="PATIENT",
        action="REVOKE_CONSENT",
        patient_id=patient.id,
        consent_id=consent.id,
        status="SUCCESS",
        details={"revoked_at": now.isoformat()}
    )

    return {"message": "Consent successfully revoked. Doctor access terminated.", "consent_id": consent.id}

@router.get("/patient", response_model=List[ConsentResponse])
async def get_patient_consents(
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt_p = select(Patient).where(Patient.user_id == current_user.id)
    patient = (await db.execute(stmt_p)).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    stmt = (
        select(Consent)
        .where(Consent.patient_id == patient.id)
        .options(selectinload(Consent.doctor).selectinload(Practitioner.user))
        .order_by(Consent.created_at.desc())
    )
    consents = (await db.execute(stmt)).scalars().all()

    return [
        ConsentResponse(
            id=c.id,
            patient_id=c.patient_id,
            patient_name=current_user.full_name,
            doctor_id=c.doctor_id,
            doctor_name=c.doctor.user.full_name if c.doctor and c.doctor.user else "Doctor",
            purpose=c.purpose,
            categories=c.categories,
            status=c.status,
            valid_from=c.valid_from,
            valid_to=c.valid_to,
            created_at=c.created_at,
            revoked_at=c.revoked_at
        )
        for c in consents
    ]

@router.get("/doctors-list")
async def get_all_registered_doctors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Allows patient to pick a doctor when granting consent."""
    stmt = select(Practitioner).options(selectinload(Practitioner.user))
    docs = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": d.id,
            "full_name": d.user.full_name if d.user else "Doctor",
            "specialization": d.specialization,
            "hospital_name": d.hospital_name,
            "registration_number": d.registration_number
        }
        for d in docs
    ]
