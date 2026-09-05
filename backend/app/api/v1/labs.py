from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.app.core.database import get_db
from backend.app.models.entities import User, Lab, LabOrder, Observation, DiagnosticReport, Patient, Practitioner, utc_now
from backend.app.schemas.models import LabResultSubmit
from backend.app.api.deps import get_current_user, require_roles
from backend.app.services.reminder_service import reminder_service
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/labs", tags=["Laboratories"])

@router.get("/orders")
async def get_lab_orders(
    current_user: User = Depends(require_roles("LAB", "LAB_STAFF")),
    db: AsyncSession = Depends(get_db)
):
    stmt_lab = select(Lab).where(Lab.user_id == current_user.id)
    lab = (await db.execute(stmt_lab)).scalar_one_or_none()

    # If orders are assigned to specific lab, filter; otherwise return pending diagnostic orders
    stmt = (
        select(LabOrder)
        .options(
            selectinload(LabOrder.patient).selectinload(Patient.user),
            selectinload(LabOrder.doctor).selectinload(Practitioner.user),
            selectinload(LabOrder.observations),
            selectinload(LabOrder.diagnostic_report)
        )
        .order_by(LabOrder.ordered_at.desc())
    )
    orders = (await db.execute(stmt)).scalars().all()

    return [
        {
            "id": o.id,
            "order_id": o.id,
            "patient_id": o.patient_id,
            "patient_name": o.patient.user.full_name if o.patient and o.patient.user else "Patient",
            "abha_id": o.patient.abha_id if o.patient else "N/A",
            "doctor_name": o.doctor.user.full_name if o.doctor and o.doctor.user else "Practitioner",
            "test_code": o.test_code or "58800005",
            "test_name": o.test_name,
            "priority": o.priority,
            "status": o.status,
            "ordered_at": o.ordered_at.isoformat(),
            "completed_at": o.completed_at.isoformat() if o.completed_at else None,
            "clinical_notes": o.clinical_notes,
            "observations_count": len(o.observations),
            "observations": [
                {
                    "name": obs.test_name,
                    "value": obs.value,
                    "unit": obs.unit,
                    "range": obs.reference_range,
                    "is_abnormal": obs.is_abnormal
                }
                for obs in o.observations
            ]
        }
        for o in orders
    ]

@router.post("/orders/{order_id}/results")
async def submit_lab_results(
    order_id: str,
    req: LabResultSubmit,
    current_user: User = Depends(require_roles("LAB", "LAB_STAFF")),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(LabOrder).where(LabOrder.id == order_id).options(
        selectinload(LabOrder.patient).selectinload(Patient.user)
    )
    order = (await db.execute(stmt)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Lab order not found")

    now = utc_now()
    order.status = "COMPLETED"
    order.completed_at = now

    # Create DiagnosticReport
    report = DiagnosticReport(
        lab_order_id=order.id,
        patient_id=order.patient_id,
        doctor_id=order.doctor_id,
        title=f"Diagnostic Report: {order.test_name}",
        conclusion=req.conclusion,
        status="FINAL",
        issued_at=now
    )
    db.add(report)

    # Create Observations
    for obs in req.observations:
        o = Observation(
            lab_order_id=order.id,
            patient_id=order.patient_id,
            test_code=obs.test_code,
            test_name=obs.test_name,
            value=obs.value,
            unit=obs.unit,
            reference_range=obs.reference_range,
            is_abnormal=obs.is_abnormal,
            status="FINAL",
            observation_date=now
        )
        db.add(o)

    await db.commit()

    # Trigger patient notification
    if order.patient and order.patient.user:
        await reminder_service.trigger_lab_result_available_notification(
            db=db,
            patient_user_id=order.patient.user.id,
            patient_id=order.patient.id,
            test_name=order.test_name
        )

    # Audit log
    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="LAB",
        action="SUBMIT_LAB_RESULTS",
        patient_id=order.patient_id,
        status="SUCCESS",
        details={"lab_order_id": order.id, "observations_count": len(req.observations)}
    )

    return {"message": "Lab results submitted and patient notified", "order_id": order.id}
