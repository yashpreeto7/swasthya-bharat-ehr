from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.models.entities import User, Notification, Patient
from backend.app.schemas.models import NotificationResponse
from backend.app.api.deps import get_current_user
from backend.app.services.reminder_service import reminder_service

router = APIRouter(prefix="/reminders", tags=["Reminders & Notifications"])

class ScheduleReminderRequest(BaseModel):
    type: str  # APPOINTMENT, MEDICATION, LAB_TEST, FOLLOW_UP
    title: str
    message: str
    delay_minutes: int = 1

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    notifs = await reminder_service.get_user_notifications(db=db, user_id=current_user.id)
    return [
        NotificationResponse(
            id=n.id,
            type=n.type,
            title=n.title,
            message=n.message,
            status=n.status,
            channel=n.channel,
            scheduled_time=n.scheduled_time,
            created_at=n.created_at
        )
        for n in notifs
    ]

@router.post("/schedule", response_model=NotificationResponse)
async def schedule_reminder(
    req: ScheduleReminderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    scheduled = now + timedelta(minutes=req.delay_minutes)
    notif = await reminder_service.create_notification(
        db=db,
        user_id=current_user.id,
        notif_type=req.type,
        title=req.title,
        message=req.message,
        scheduled_time=scheduled,
        channel="IN_APP"
    )
    return NotificationResponse(
        id=notif.id,
        type=notif.type,
        title=notif.title,
        message=notif.message,
        status=notif.status,
        channel=notif.channel,
        scheduled_time=notif.scheduled_time,
        created_at=notif.created_at
    )
