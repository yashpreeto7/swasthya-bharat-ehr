from datetime import datetime, timezone
from typing import Optional, List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from backend.app.core.database import get_db
from backend.app.core.security import decode_access_token
from backend.app.models.entities import User, Patient, Practitioner, Lab, Consent, utc_now
from backend.app.core.audit_logger import log_audit_event

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account inactive or not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def require_roles(*allowed_roles: str) -> Callable:
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: User role '{current_user.role}' is not authorized for this resource"
            )
        return current_user
    return role_checker

async def verify_consent_access(
    patient_id: str,
    category: str,
    doctor_user: User,
    db: AsyncSession
) -> Optional[Consent]:
    """
    Verifies that the doctor has an active, valid consent artifact
    covering the requested patient and category.
    """
    # 1. Fetch practitioner record
    stmt_doc = select(Practitioner).where(Practitioner.user_id == doctor_user.id)
    res_doc = await db.execute(stmt_doc)
    practitioner = res_doc.scalar_one_or_none()
    if not practitioner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not registered as a Practitioner"
        )

    now = utc_now()
    # 2. Query active consents
    stmt_consent = select(Consent).where(
        and_(
            Consent.patient_id == patient_id,
            Consent.doctor_id == practitioner.id,
            Consent.status == "GRANTED",
            Consent.valid_from <= now,
            Consent.valid_to >= now,
            Consent.revoked_at.is_(None)
        )
    )
    res_consent = await db.execute(stmt_consent)
    consents = res_consent.scalars().all()

    # 3. Check categories
    matched_consent = None
    for consent in consents:
        cats = consent.categories if isinstance(consent.categories, list) else []
        if "ALL_RECORDS" in cats or category in cats:
            matched_consent = consent
            break

    if not matched_consent:
        # Log unauthorized attempt
        await log_audit_event(
            db=db,
            actor_id=doctor_user.id,
            actor_role="DOCTOR",
            action=f"ACCESS_DENIED_{category.upper()}",
            patient_id=patient_id,
            status="DENIED",
            details={"reason": "No active valid consent found for requested category"}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: No valid patient consent for category '{category}'"
        )

    return matched_consent
