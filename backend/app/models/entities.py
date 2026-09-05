import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import (
    Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON, Float
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)  # PATIENT, DOCTOR, LAB, ADMIN
    full_name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    practitioner_profile = relationship("Practitioner", back_populates="user", uselist=False, cascade="all, delete-orphan")
    lab_profile = relationship("Lab", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    abha_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., 91-1234-5678-9012 or user@abdm
    date_of_birth = Column(String(20), nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    emergency_contact = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="patient_profile")
    encounters = relationship("Encounter", back_populates="patient", cascade="all, delete-orphan")
    conditions = relationship("Condition", back_populates="patient", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete-orphan")
    allergies = relationship("Allergy", back_populates="patient", cascade="all, delete-orphan")
    lab_orders = relationship("LabOrder", back_populates="patient", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="patient", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete-orphan")


class Practitioner(Base):
    __tablename__ = "practitioners"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    registration_number = Column(String(100), unique=True, index=True, nullable=False)  # State Medical Council / NMC
    specialization = Column(String(100), nullable=False)
    hospital_name = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    qualification = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="practitioner_profile")
    encounters = relationship("Encounter", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
    lab_orders = relationship("LabOrder", back_populates="doctor")
    consents_received = relationship("Consent", back_populates="doctor")
    appointments = relationship("Appointment", back_populates="doctor")


class Lab(Base):
    __tablename__ = "labs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    lab_name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, index=True, nullable=False)
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="lab_profile")
    lab_orders = relationship("LabOrder", back_populates="lab")


class Encounter(Base):
    __tablename__ = "encounters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="SET NULL"), nullable=True, index=True)
    encounter_type = Column(String(50), default="AMBULATORY")  # AMBULATORY, INPATIENT, EMERGENCY, TELECONSULTATION
    reason = Column(String(255), nullable=True)
    clinical_notes = Column(Text, nullable=True)
    status = Column(String(30), default="COMPLETED")  # PLANNED, IN_PROGRESS, COMPLETED
    encounter_date = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="encounters")
    doctor = relationship("Practitioner", back_populates="encounters")
    conditions = relationship("Condition", back_populates="encounter", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="encounter", cascade="all, delete-orphan")


class Condition(Base):
    __tablename__ = "conditions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    encounter_id = Column(String(36), ForeignKey("encounters.id", ondelete="SET NULL"), nullable=True)
    snomed_code = Column(String(50), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    clinical_status = Column(String(30), default="ACTIVE")  # ACTIVE, RECURRENCE, RELAPSE, REMISSION, RESOLVED
    verification_status = Column(String(30), default="CONFIRMED")  # PROVISIONAL, CONFIRMED, REFUTED
    severity = Column(String(30), default="MODERATE")  # MILD, MODERATE, SEVERE
    onset_date = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="conditions")
    encounter = relationship("Encounter", back_populates="conditions")


class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    substance = Column(String(255), nullable=False)
    reaction = Column(String(255), nullable=True)
    severity = Column(String(30), default="MODERATE")  # MILD, MODERATE, SEVERE
    verification_status = Column(String(30), default="CONFIRMED")
    snomed_code = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="allergies")


class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="SET NULL"), nullable=True, index=True)
    encounter_id = Column(String(36), ForeignKey("encounters.id", ondelete="SET NULL"), nullable=True)
    medication_name = Column(String(255), nullable=False)
    dosage = Column(String(100), nullable=False)  # e.g., "500 mg"
    frequency = Column(String(100), nullable=False)  # e.g., "Once daily after food"
    duration = Column(String(100), nullable=False)  # e.g., "14 days"
    instructions = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, COMPLETED, STOPPED
    prescribed_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Practitioner", back_populates="prescriptions")
    encounter = relationship("Encounter", back_populates="prescriptions")


class LabOrder(Base):
    __tablename__ = "lab_orders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="SET NULL"), nullable=True, index=True)
    lab_id = Column(String(36), ForeignKey("labs.id", ondelete="SET NULL"), nullable=True, index=True)
    test_name = Column(String(255), nullable=False)
    test_code = Column(String(50), nullable=True)  # LOINC / SNOMED code
    priority = Column(String(30), default="ROUTINE")  # ROUTINE, URGENT, STAT
    status = Column(String(30), default="PENDING")  # PENDING, SAMPLE_COLLECTED, IN_PROGRESS, COMPLETED, CANCELLED
    clinical_notes = Column(Text, nullable=True)
    ordered_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="lab_orders")
    doctor = relationship("Practitioner", back_populates="lab_orders")
    lab = relationship("Lab", back_populates="lab_orders")
    observations = relationship("Observation", back_populates="lab_order", cascade="all, delete-orphan")
    diagnostic_report = relationship("DiagnosticReport", back_populates="lab_order", uselist=False, cascade="all, delete-orphan")


class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lab_order_id = Column(String(36), ForeignKey("lab_orders.id", ondelete="CASCADE"), nullable=True, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    test_code = Column(String(50), nullable=False)
    test_name = Column(String(255), nullable=False)
    value = Column(String(100), nullable=False)
    unit = Column(String(50), nullable=True)
    reference_range = Column(String(100), nullable=True)  # e.g., "70-99 mg/dL"
    is_abnormal = Column(Boolean, default=False)
    status = Column(String(30), default="FINAL")
    observation_date = Column(DateTime, default=utc_now)

    lab_order = relationship("LabOrder", back_populates="observations")


class DiagnosticReport(Base):
    __tablename__ = "diagnostic_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lab_order_id = Column(String(36), ForeignKey("lab_orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    conclusion = Column(Text, nullable=True)
    status = Column(String(30), default="FINAL")  # REGISTERED, PRELIMINARY, FINAL, AMENDED
    issued_at = Column(DateTime, default=utc_now)

    lab_order = relationship("LabOrder", back_populates="diagnostic_report")


class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="CASCADE"), nullable=False, index=True)
    purpose = Column(String(100), nullable=False)  # CONSULTATION, CARE_MANAGEMENT, EMERGENCY, SECOND_OPINION
    categories = Column(JSON, nullable=False)  # ["DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION", "ALL_RECORDS"]
    status = Column(String(30), default="GRANTED")  # REQUESTED, GRANTED, REVOKED, EXPIRED
    valid_from = Column(DateTime, default=utc_now)
    valid_to = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=utc_now)
    revoked_at = Column(DateTime, nullable=True)

    patient = relationship("Patient", back_populates="consents")
    doctor = relationship("Practitioner", back_populates="consents_received")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("practitioners.id", ondelete="CASCADE"), nullable=False, index=True)
    appointment_time = Column(DateTime, nullable=False)
    reason = Column(String(255), nullable=True)
    status = Column(String(30), default="SCHEDULED")  # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    created_at = Column(DateTime, default=utc_now)

    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Practitioner", back_populates="appointments")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), nullable=True)
    type = Column(String(50), nullable=False)  # APPOINTMENT, MEDICATION, LAB_TEST, LAB_RESULT_AVAILABLE, FOLLOW_UP
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(30), default="PENDING")  # PENDING, SENT, READ, DISMISSED
    channel = Column(String(30), default="IN_APP")  # IN_APP, EMAIL, SMS
    scheduled_time = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), nullable=False, index=True)
    actor_role = Column(String(30), nullable=False)  # PATIENT, DOCTOR, LAB, SYSTEM
    patient_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # VIEW_HEALTH_RECORD, VIEW_LAB_RESULT, CREATE_ENCOUNTER, GRANT_CONSENT, etc.
    consent_id = Column(String(36), nullable=True)
    purpose = Column(String(100), nullable=True)
    status = Column(String(30), default="SUCCESS")  # SUCCESS, DENIED
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
