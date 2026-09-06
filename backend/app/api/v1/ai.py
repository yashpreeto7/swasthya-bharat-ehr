from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.models.entities import User
from backend.app.schemas.models import (
    ClinicalSummaryResponse, AskEHRRequest, AskEHRResponse,
    ExplainLabRequest, ExplainLabResponse,
    DictationParseRequest, DictationParseResponse
)
from backend.app.api.deps import get_current_user, require_roles, verify_consent_access
from backend.app.services.ai_service import ai_service
from backend.app.core.audit_logger import log_audit_event

router = APIRouter(prefix="/ai", tags=["AI Clinical Copilot"])

@router.post("/parse-dictation", response_model=DictationParseResponse)
async def parse_clinical_dictation(
    req: DictationParseRequest,
    current_user: User = Depends(require_roles("DOCTOR")),
):
    """
    Parses a clinical speech transcript into structured complaints,
    authentic SNOMED CT diagnoses, prescriptions, and lab orders.
    """
    parsed = ai_service.parse_dictation(req.transcript)
    return DictationParseResponse(**parsed)


@router.get("/summary/{patient_id}", response_model=ClinicalSummaryResponse)
async def get_clinical_summary(
    patient_id: str,
    focus_area: str = "COMPREHENSIVE",
    time_window: str = "ALL",
    audience: str = "PHYSICIAN",
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Verify access: if Doctor, verify consent; if Patient, verify ownership
    if current_user.role == "DOCTOR":
        consent = await verify_consent_access(
            patient_id=patient_id,
            category="ALL_RECORDS",
            doctor_user=current_user,
            db=db
        )
        await log_audit_event(
            db=db,
            actor_id=current_user.id,
            actor_role="DOCTOR",
            action="AI_GENERATE_CLINICAL_SUMMARY",
            patient_id=patient_id,
            consent_id=consent.id if consent else None,
            status="SUCCESS",
            details={"focus_area": focus_area, "audience": audience, "time_window": time_window}
        )
    elif current_user.role == "PATIENT":
        # Check patient ownership
        if current_user.patient_profile and current_user.patient_profile.id != patient_id:
            raise HTTPException(status_code=403, detail="Cannot access another patient's clinical summary")

    res = await ai_service.generate_clinical_summary(
        patient_id=patient_id,
        db=db,
        focus_area=focus_area,
        time_window=time_window,
        audience=audience
    )
    return ClinicalSummaryResponse(**res)

@router.post("/query", response_model=AskEHRResponse)
async def ask_patient_history(
    req: AskEHRRequest,
    current_user: User = Depends(require_roles("DOCTOR")),
    db: AsyncSession = Depends(get_db)
):
    consent = await verify_consent_access(
        patient_id=req.patient_id,
        category="ALL_RECORDS",
        doctor_user=current_user,
        db=db
    )

    res = await ai_service.ask_patient_history(
        patient_id=req.patient_id,
        query=req.query,
        db=db
    )

    await log_audit_event(
        db=db,
        actor_id=current_user.id,
        actor_role="DOCTOR",
        action="AI_GROUNDED_QUERY",
        patient_id=req.patient_id,
        consent_id=consent.id if consent else None,
        status="SUCCESS",
        details={"query": req.query, "citations_count": len(res["grounded_record_ids"])}
    )

    return AskEHRResponse(**res)

@router.get("/explain-lab/{report_id}", response_model=ExplainLabResponse)
async def explain_lab_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await ai_service.explain_lab_report(diagnostic_report_id=report_id, db=db)
    return ExplainLabResponse(**res)
