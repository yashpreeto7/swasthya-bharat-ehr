"""
execution/seed_demo_data.py
Deterministic clinical demo seeder for MedIndia HealthOS.
Populates realistic Indian healthcare clinical scenarios, verified SNOMED CT codes,
encounters, prescriptions, lab orders, observations, consents, and notifications.
"""

import sys
import asyncio
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import AsyncSessionLocal, init_db
from backend.app.core.security import get_password_hash
from backend.app.models.entities import (
    User, Patient, Practitioner, Lab, Encounter, Condition,
    Prescription, Allergy, LabOrder, Observation, DiagnosticReport,
    Consent, Appointment, Notification, AuditLog
)

def utc_now():
    return datetime.now(timezone.utc)

async def seed():
    print("[Seeder] Initializing database tables...")
    await init_db()

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(User).where(User.email == "rajesh.sharma@example.in"))
        if res.scalar_one_or_none():
            print("[Seeder] Demo data already exists. Skipping seed.")
            return

        print("[Seeder] Seeding Indian healthcare clinical demo dataset...")
        now = utc_now()

        # -------------------------------------------------------------
        # 1. Doctors
        # -------------------------------------------------------------
        doc1_user = User(
            email="dr.arvind@apollo.in",
            hashed_password=get_password_hash("Doctor123!"),
            role="DOCTOR",
            full_name="Dr. Arvind Swaminathan"
        )
        db.add(doc1_user)
        await db.flush()

        doc1 = Practitioner(
            user_id=doc1_user.id,
            registration_number="MCI-74892",
            specialization="Internal Medicine & Diabetology",
            hospital_name="Apollo Hospitals, New Delhi",
            department="General Medicine",
            qualification="MBBS, MD (Medicine)"
        )
        db.add(doc1)

        doc2_user = User(
            email="dr.sunita@aiims.in",
            hashed_password=get_password_hash("Doctor123!"),
            role="DOCTOR",
            full_name="Dr. Sunita Deshmukh"
        )
        db.add(doc2_user)
        await db.flush()

        doc2 = Practitioner(
            user_id=doc2_user.id,
            registration_number="MCI-58210",
            specialization="Pulmonology",
            hospital_name="AIIMS New Delhi",
            department="Pulmonary Medicine",
            qualification="MBBS, DNB (Respiratory Diseases)"
        )
        db.add(doc2)

        # -------------------------------------------------------------
        # 2. Laboratory
        # -------------------------------------------------------------
        lab_user = User(
            email="delhi.lab@lalpathlabs.com",
            hashed_password=get_password_hash("Lab12345!"),
            role="LAB",
            full_name="Dr. Lal PathLabs Main Diagnostic Centre"
        )
        db.add(lab_user)
        await db.flush()

        lab = Lab(
            user_id=lab_user.id,
            lab_name="Dr. Lal PathLabs National Reference Lab",
            license_number="NABL-DL-2026-891",
            contact_email="care@lalpathlabs.com",
            phone="+91-11-4988-5000",
            address="Block E, Okhla Phase II, New Delhi, 110020"
        )
        db.add(lab)

        # -------------------------------------------------------------
        # 3. Patient 1: Rajesh Sharma (Type 2 Diabetes + Hypertension)
        # -------------------------------------------------------------
        p1_user = User(
            email="rajesh.sharma@example.in",
            hashed_password=get_password_hash("Password123!"),
            role="PATIENT",
            full_name="Rajesh Sharma"
        )
        db.add(p1_user)
        await db.flush()

        p1 = Patient(
            user_id=p1_user.id,
            abha_id="91-4405-2026-0001",
            date_of_birth="1976-04-12",
            gender="Male",
            blood_group="B+",
            phone="+91-98765-43210",
            address="Flat 402, Shivalik Apartments, Dwarka Sector 12, New Delhi",
            emergency_contact="Sunita Sharma (+91-98765-43211) - Spouse"
        )
        db.add(p1)
        await db.flush()

        # Conditions for Patient 1
        cond1 = Condition(
            patient_id=p1.id,
            snomed_code="44054006",
            display_name="Type 2 diabetes mellitus",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2022-03-15",
            notes="Diagnosed during executive health check. Managed with oral hypoglycemic agents."
        )
        cond2 = Condition(
            patient_id=p1.id,
            snomed_code="59621000",
            display_name="Essential hypertension",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MILD",
            onset_date="2023-01-10",
            notes="Stage 1 hypertension noted on repeat seated readings."
        )
        db.add_all([cond1, cond2])

        # Allergy
        allergy1 = Allergy(
            patient_id=p1.id,
            substance="Penicillin",
            reaction="Maculopapular rash, pruritus",
            severity="MODERATE",
            verification_status="CONFIRMED",
            snomed_code="91936005"
        )
        db.add(allergy1)

        # Encounter
        enc1 = Encounter(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_type="AMBULATORY",
            reason="Follow-up consultation for Glycemic and BP Control",
            clinical_notes="Patient reports mild postprandial lethargy. BP today 134/84 mmHg. Prescriptions updated. Ordered Fasting Blood Sugar and HbA1c.",
            status="COMPLETED",
            encounter_date=now - timedelta(days=5)
        )
        db.add(enc1)
        await db.flush()

        # Prescriptions
        rx1 = Prescription(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_id=enc1.id,
            medication_name="Metformin Hydrochloride 500 mg",
            dosage="500 mg",
            frequency="Twice daily after meals",
            duration="90 days",
            instructions="Take with breakfast and dinner to avoid gastrointestinal upset.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=5)
        )
        rx2 = Prescription(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_id=enc1.id,
            medication_name="Telmisartan 40 mg",
            dosage="40 mg",
            frequency="Once daily in the morning",
            duration="90 days",
            instructions="Take consistently at 8:00 AM.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=5)
        )
        db.add_all([rx1, rx2])

        # Lab Order & Diagnostic Report
        lo1 = LabOrder(
            patient_id=p1.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_name="Diabetic Comprehensive Evaluation",
            test_code="43396009",
            priority="ROUTINE",
            status="COMPLETED",
            clinical_notes="Routine 3-month glycemic evaluation",
            ordered_at=now - timedelta(days=5),
            completed_at=now - timedelta(days=4)
        )
        db.add(lo1)
        await db.flush()

        rep1 = DiagnosticReport(
            lab_order_id=lo1.id,
            patient_id=p1.id,
            doctor_id=doc1.id,
            title="Diabetic Profile & Glycemic Monitoring Report",
            conclusion="Fasting blood sugar and HbA1c indicate suboptimally controlled Type 2 Diabetes. Renal markers are within normal physiological range.",
            status="FINAL",
            issued_at=now - timedelta(days=4)
        )
        db.add(rep1)

        obs1 = Observation(
            lab_order_id=lo1.id,
            patient_id=p1.id,
            test_code="33747003",
            test_name="Fasting Blood Glucose",
            value="142",
            unit="mg/dL",
            reference_range="70-99 mg/dL",
            is_abnormal=True,
            status="FINAL",
            observation_date=now - timedelta(days=4)
        )
        obs2 = Observation(
            lab_order_id=lo1.id,
            patient_id=p1.id,
            test_code="43396009",
            test_name="Glycated Hemoglobin (HbA1c)",
            value="7.8",
            unit="%",
            reference_range="4.0-5.6 %",
            is_abnormal=True,
            status="FINAL",
            observation_date=now - timedelta(days=4)
        )
        obs3 = Observation(
            lab_order_id=lo1.id,
            patient_id=p1.id,
            test_code="275711006",
            test_name="Serum Creatinine",
            value="0.9",
            unit="mg/dL",
            reference_range="0.7-1.3 mg/dL",
            is_abnormal=False,
            status="FINAL",
            observation_date=now - timedelta(days=4)
        )
        db.add_all([obs1, obs2, obs3])

        # Active Consent from Rajesh Sharma to Dr. Arvind Swaminathan
        consent1 = Consent(
            patient_id=p1.id,
            doctor_id=doc1.id,
            purpose="CONSULTATION",
            categories=["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION"],
            status="GRANTED",
            valid_from=now - timedelta(days=10),
            valid_to=now + timedelta(days=30),
            created_at=now - timedelta(days=10)
        )
        db.add(consent1)

        # Appointment
        app1 = Appointment(
            patient_id=p1.id,
            doctor_id=doc1.id,
            appointment_time=now + timedelta(days=7),
            reason="Quarterly Diabetic Review Consultation",
            status="SCHEDULED"
        )
        db.add(app1)

        # Notifications
        notif1 = Notification(
            user_id=p1_user.id,
            patient_id=p1.id,
            type="LAB_RESULT_AVAILABLE",
            title="Lab Test Results Ready",
            message="Your Diabetic Comprehensive Evaluation results from Dr. Lal PathLabs are now available for review.",
            status="SENT",
            scheduled_time=now - timedelta(days=4)
        )
        notif2 = Notification(
            user_id=p1_user.id,
            patient_id=p1.id,
            type="MEDICATION",
            title="Medication Reminder: Metformin 500 mg",
            message="Please remember to take your evening dose of Metformin 500 mg with dinner.",
            status="SENT",
            scheduled_time=now - timedelta(hours=2)
        )
        db.add_all([notif1, notif2])

        # -------------------------------------------------------------
        # 4. Patient 2: Priya Patel (Dengue Fever Follow-up)
        # -------------------------------------------------------------
        p2_user = User(
            email="priya.patel@example.in",
            hashed_password=get_password_hash("Password123!"),
            role="PATIENT",
            full_name="Priya Patel"
        )
        db.add(p2_user)
        await db.flush()

        p2 = Patient(
            user_id=p2_user.id,
            abha_id="91-3836-2026-0002",
            date_of_birth="1995-08-23",
            gender="Female",
            blood_group="O+",
            phone="+91-98111-22334",
            address="A-14, Green Park Extension, New Delhi",
            emergency_contact="Nitin Patel (+91-98111-22335) - Brother"
        )
        db.add(p2)
        await db.flush()

        cond_p2 = Condition(
            patient_id=p2.id,
            snomed_code="38362002",
            display_name="Dengue fever",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="SEVERE",
            onset_date="2026-08-28",
            notes="High grade fever with retro-orbital pain, myalgia, and thrombocytopenia."
        )
        db.add(cond_p2)

        lo_p2 = LabOrder(
            patient_id=p2.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_name="Complete Blood Count & Platelet Monitoring",
            test_code="58800005",
            priority="URGENT",
            status="COMPLETED",
            ordered_at=now - timedelta(days=2),
            completed_at=now - timedelta(days=1)
        )
        db.add(lo_p2)
        await db.flush()

        rep_p2 = DiagnosticReport(
            lab_order_id=lo_p2.id,
            patient_id=p2.id,
            doctor_id=doc1.id,
            title="Hematology Report: Platelet Count Trend",
            conclusion="Moderate thrombocytopenia observed. Platelet count stabilizing. Daily monitoring advised.",
            status="FINAL",
            issued_at=now - timedelta(days=1)
        )
        db.add(rep_p2)

        obs_p2_1 = Observation(
            lab_order_id=lo_p2.id,
            patient_id=p2.id,
            test_code="58800005",
            test_name="Platelet Count",
            value="85000",
            unit="/mcL",
            reference_range="150000-450000 /mcL",
            is_abnormal=True,
            status="FINAL",
            observation_date=now - timedelta(days=1)
        )
        db.add(obs_p2_1)

        consent2 = Consent(
            patient_id=p2.id,
            doctor_id=doc1.id,
            purpose="CARE_MANAGEMENT",
            categories=["DIAGNOSTIC_REPORT"],
            status="GRANTED",
            valid_from=now - timedelta(days=3),
            valid_to=now + timedelta(days=14),
            created_at=now - timedelta(days=3)
        )
        db.add(consent2)

        # Initial audit log
        audit1 = AuditLog(
            actor_id=doc1_user.id,
            actor_role="DOCTOR",
            patient_id=p1.id,
            action="VIEW_HEALTH_RECORD",
            consent_id=consent1.id,
            purpose="CONSULTATION",
            status="SUCCESS",
            details={"notes": "Doctor accessed full EHR timeline during ambulatory consultation"}
        )
        db.add(audit1)

        await db.commit()
        print("[Seeder] Successfully seeded demo dataset!")
        print("  - Doctor: dr.arvind@apollo.in (Password: Doctor123!)")
        print("  - Patient 1: rajesh.sharma@example.in (Password: Password123!)")
        print("  - Patient 2: priya.patel@example.in (Password: Password123!)")
        print("  - Lab: delhi.lab@lalpathlabs.com (Password: Lab12345!)")

if __name__ == "__main__":
    asyncio.run(seed())
