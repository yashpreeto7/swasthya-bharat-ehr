from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.entities import AuditLog, utc_now

async def log_audit_event(
    db: AsyncSession,
    actor_id: str,
    actor_role: str,
    action: str,
    patient_id: Optional[str] = None,
    consent_id: Optional[str] = None,
    purpose: Optional[str] = None,
    status: str = "SUCCESS",
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Appends an immutable audit event to the database.
    """
    event = AuditLog(
        actor_id=actor_id,
        actor_role=actor_role,
        patient_id=patient_id,
        action=action,
        consent_id=consent_id,
        purpose=purpose,
        status=status,
        details=details or {},
        timestamp=utc_now()
    )
    db.add(event)
    await db.commit()
    return event
