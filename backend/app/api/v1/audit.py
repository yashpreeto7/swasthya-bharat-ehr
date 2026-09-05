from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.entities import User, AuditLog, Patient
from backend.app.schemas.models import AuditLogResponse
from backend.app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/audit", tags=["Audit Logging"])

@router.get("/patient", response_model=List[AuditLogResponse])
async def get_patient_audit_trail(
    current_user: User = Depends(require_roles("PATIENT")),
    db: AsyncSession = Depends(get_db)
):
    stmt_p = select(Patient).where(Patient.user_id == current_user.id)
    patient = (await db.execute(stmt_p)).scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    stmt = (
        select(AuditLog)
        .where(AuditLog.patient_id == patient.id)
        .order_by(AuditLog.timestamp.desc())
        .limit(100)
    )
    logs = (await db.execute(stmt)).scalars().all()

    return [
        AuditLogResponse(
            id=log.id,
            actor_id=log.actor_id,
            actor_role=log.actor_role,
            patient_id=log.patient_id,
            action=log.action,
            consent_id=log.consent_id,
            purpose=log.purpose,
            status=log.status,
            details=log.details,
            timestamp=log.timestamp
        )
        for log in logs
    ]

@router.get("/system", response_model=List[AuditLogResponse])
async def get_system_audit_trail(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100)
    logs = (await db.execute(stmt)).scalars().all()
    return [
        AuditLogResponse(
            id=log.id,
            actor_id=log.actor_id,
            actor_role=log.actor_role,
            patient_id=log.patient_id,
            action=log.action,
            consent_id=log.consent_id,
            purpose=log.purpose,
            status=log.status,
            details=log.details,
            timestamp=log.timestamp
        )
        for log in logs
    ]
