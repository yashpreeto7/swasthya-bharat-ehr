from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.patients import router as patients_router
from backend.app.api.v1.doctors import router as doctors_router
from backend.app.api.v1.labs import router as labs_router
from backend.app.api.v1.consent import router as consent_router
from backend.app.api.v1.reminders import router as reminders_router
from backend.app.api.v1.ai import router as ai_router
from backend.app.api.v1.audit import router as audit_router
from backend.app.api.v1.terminology import router as terminology_router
from backend.app.api.v1.abdm import router as abdm_router
from backend.app.api.fhir.router import router as fhir_router

api_router = APIRouter()

# v1 Routes
api_router.include_router(auth_router, prefix="/v1")
api_router.include_router(patients_router, prefix="/v1")
api_router.include_router(doctors_router, prefix="/v1")
api_router.include_router(labs_router, prefix="/v1")
api_router.include_router(consent_router, prefix="/v1")
api_router.include_router(reminders_router, prefix="/v1")
api_router.include_router(ai_router, prefix="/v1")
api_router.include_router(audit_router, prefix="/v1")
api_router.include_router(terminology_router, prefix="/v1")
api_router.include_router(abdm_router, prefix="/v1")

# FHIR R4 Routes
api_router.include_router(fhir_router, prefix="")
