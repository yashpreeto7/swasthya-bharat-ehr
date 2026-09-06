from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# --- Auth Schemas ---
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = Field(..., description="PATIENT, DOCTOR, or LAB")
    
    # Optional role-specific fields
    abha_id: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    registration_number: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    lab_name: Optional[str] = None
    license_number: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    patient_id: Optional[str] = None
    practitioner_id: Optional[str] = None
    lab_id: Optional[str] = None
    abha_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Patient & Timeline Schemas ---
class PatientProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    abha_id: str
    date_of_birth: Optional[str]
    gender: Optional[str]
    blood_group: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    emergency_contact: Optional[str]


# --- Encounter & Clinical Schemas ---
class ConditionCreate(BaseModel):
    snomed_code: str
    display_name: str
    clinical_status: str = "ACTIVE"
    severity: str = "MODERATE"
    onset_date: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionCreate(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class EncounterCreate(BaseModel):
    patient_id: str
    encounter_type: str = "AMBULATORY"
    reason: str
    clinical_notes: Optional[str] = None
    conditions: List[ConditionCreate] = []
    prescriptions: List[PrescriptionCreate] = []


# --- Lab Schemas ---
class LabOrderCreate(BaseModel):
    patient_id: str
    test_name: str
    test_code: Optional[str] = None
    priority: str = "ROUTINE"
    clinical_notes: Optional[str] = None
    lab_id: Optional[str] = None

class ObservationEntry(BaseModel):
    test_code: str
    test_name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool = False

class LabResultSubmit(BaseModel):
    conclusion: str
    observations: List[ObservationEntry]


# --- Consent Schemas ---
class ConsentGrantRequest(BaseModel):
    doctor_id: str
    purpose: str = Field(..., description="CONSULTATION, CARE_MANAGEMENT, EMERGENCY, SECOND_OPINION")
    categories: List[str] = Field(..., description="e.g. ['DIAGNOSTIC_REPORT', 'PRESCRIPTION', 'CONDITION', 'ALL_RECORDS']")
    valid_days: int = Field(default=30, ge=1, le=365)

class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    doctor_id: str
    doctor_name: Optional[str] = None
    purpose: str
    categories: List[str]
    status: str
    valid_from: datetime
    valid_to: datetime
    created_at: datetime
    revoked_at: Optional[datetime] = None


# --- AI & Copilot Schemas ---
class ClinicalSummaryResponse(BaseModel):
    patient_id: str
    summary: str
    active_conditions: List[str]
    active_medications: List[str]
    recent_labs: List[str]
    grounded_record_ids: List[str]
    disclaimer: str
    focus_area: Optional[str] = "COMPREHENSIVE"
    audience: Optional[str] = "PHYSICIAN"
    time_window: Optional[str] = "ALL"
    structured_sections: Optional[Dict[str, Any]] = None

class AskEHRRequest(BaseModel):
    patient_id: str
    query: str

class AskEHRResponse(BaseModel):
    query: str
    answer: str
    grounded_record_ids: List[str]
    confidence: str = "HIGH"
    disclaimer: str

class ExplainLabRequest(BaseModel):
    diagnostic_report_id: str

class ExplainLabResponse(BaseModel):
    report_id: str
    title: str
    explanation: str
    key_findings: List[str]
    disclaimer: str


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    status: str
    channel: str
    scheduled_time: datetime
    created_at: datetime


# --- Break-Glass Emergency Consent Schemas ---
class BreakGlassRequest(BaseModel):
    patient_id: str
    justification: str = Field(..., min_length=10, description="Mandatory clinical rationale for emergency break-glass access")
    emergency_type: str = Field(default="ACUTE_EMERGENCY", description="TRAUMA, CARDIAC_ARREST, UNRESPONSIVE_TRIAGE, SEVERE_SEPSIS, STROKE")

class BreakGlassResponse(BaseModel):
    consent_id: str
    patient_id: str
    patient_name: str
    doctor_name: str
    status: str
    valid_from: datetime
    valid_to: datetime
    justification: str
    emergency_type: str
    message: str


# --- Dictation & Voice-to-SNOMED Schemas ---
class DictationParseRequest(BaseModel):
    transcript: str = Field(..., min_length=3, description="Raw dictated clinical speech transcript")

class ParsedCondition(BaseModel):
    snomed_code: str
    display_name: str
    clinical_status: str = "ACTIVE"
    severity: str = "MODERATE"
    notes: Optional[str] = None

class ParsedPrescription(BaseModel):
    medication_name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class ParsedLabOrder(BaseModel):
    test_name: str
    test_code: Optional[str] = None
    priority: str = "ROUTINE"

class DictationParseResponse(BaseModel):
    reason: str
    clinical_notes: str
    conditions: List[ParsedCondition]
    prescriptions: List[ParsedPrescription]
    lab_orders: List[ParsedLabOrder]
    raw_transcript: str


# --- Audit Schemas ---
class AuditLogResponse(BaseModel):
    id: str
    actor_id: str
    actor_role: str
    patient_id: Optional[str]
    action: str
    consent_id: Optional[str]
    purpose: Optional[str]
    status: str
    details: Optional[Dict[str, Any]]
    timestamp: datetime
