"""
backend/app/services/reminder_service.py
Patient reminders and notification dispatcher service for MedIndia HealthOS.
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from backend.app.models.entities import Notification, User, utc_now

class ReminderService:
    @staticmethod
    async def create_notification(
        db: AsyncSession,
        user_id: str,
        notif_type: str,
        title: str,
        message: str,
        patient_id: Optional[str] = None,
        scheduled_time: Optional[datetime] = None,
        channel: str = "IN_APP"
    ) -> Notification:
        notif = Notification(
            user_id=user_id,
            patient_id=patient_id,
            type=notif_type,
            title=title,
            message=message,
            scheduled_time=scheduled_time or utc_now(),
            status="SENT",
            channel=channel
        )
        db.add(notif)
        await db.commit()
        await db.refresh(notif)
        return notif

    @staticmethod
    async def trigger_lab_result_available_notification(
        db: AsyncSession,
        patient_user_id: str,
        patient_id: str,
        test_name: str
    ) -> Notification:
        return await ReminderService.create_notification(
            db=db,
            user_id=patient_user_id,
            patient_id=patient_id,
            notif_type="LAB_RESULT_AVAILABLE",
            title="Lab Test Results Available",
            message=f"Your diagnostic results for '{test_name}' have been verified and are now available in your health records.",
            channel="IN_APP"
        )

    @staticmethod
    async def get_user_notifications(
        db: AsyncSession,
        user_id: str,
        limit: int = 50
    ) -> List[Notification]:
        stmt = (
            select(Notification)
            .where(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

reminder_service = ReminderService()
