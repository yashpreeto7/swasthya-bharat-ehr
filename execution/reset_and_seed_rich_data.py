"""
execution/reset_and_seed_rich_data.py
Clean reset & deterministic seeder for MedIndia HealthOS.
Populates 4 comprehensive Indian clinical patient scenarios with verified SNOMED CT codes,
prescriptions, lab orders, observations, active consents, and notifications.
"""

import sys
import os
import asyncio
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from backend.app.core.security import get_password_hash
from backend.app.models.entities import (
    Base, User, Patient, Practitioner, Lab, Encounter, Condition,
    Prescription, Allergy, LabOrder, Observation, DiagnosticReport,
    Consent, Appointment, Notification, AuditLog
)

DB_PATH = ROOT_DIR / ".tmp" / "medindia_dev.db"
DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"

def utc_now():
    return datetime.now(timezone.utc)

async def main():
    print("[Reset & Seed] Preparing database...")
    if DB_PATH.exists():
        try:
            os.remove(DB_PATH)
            print(f"[Reset & Seed] Removed existing database: {DB_PATH}")
        except Exception as e:
            print(f"[Reset & Seed] Note on file delete: {e}")

    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("[Reset & Seed] Fresh database schema created.")

    Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
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
        doc2_user = User(
            email="dr.sunita@aiims.in",
            hashed_password=get_password_hash("Doctor123!"),
            role="DOCTOR",
            full_name="Dr. Sunita Deshmukh"
        )
        db.add_all([doc1_user, doc2_user])
        await db.flush()

        doc1 = Practitioner(
            user_id=doc1_user.id,
            registration_number="MCI-74892",
            specialization="Internal Medicine & Diabetology",
            hospital_name="Apollo Hospitals, New Delhi",
            department="General Medicine",
            qualification="MBBS, MD (Medicine)"
        )
        doc2 = Practitioner(
            user_id=doc2_user.id,
            registration_number="MCI-58210",
            specialization="Pulmonology",
            hospital_name="AIIMS New Delhi",
            department="Pulmonary Medicine",
            qualification="MBBS, DNB (Respiratory Diseases)"
        )
        db.add_all([doc1, doc2])

        # -------------------------------------------------------------
        # 2. Laboratory
        # -------------------------------------------------------------
        lab_user = User(
            email="delhi.lab@lalpathlabs.com",
            hashed_password=get_password_hash("Lab12345!"),
            role="LAB_STAFF",
            full_name="Dr. Lal PathLabs Specialist"
        )
        db.add(lab_user)
        await db.flush()

        lab = Lab(
            user_id=lab_user.id,
            lab_name="Dr. Lal PathLabs National Reference Lab",
            license_number="NABL-DL-2026-891",
            contact_email="delhi.lab@lalpathlabs.com",
            phone="+91-11-4988-5000",
            address="Sector 18, Rohini, New Delhi"
        )
        db.add(lab)

        # -------------------------------------------------------------
        # 3. Patient 1: Rajesh Sharma (Type 2 Diabetes & HTN)
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
            date_of_birth="1974-05-12",
            gender="Male",
            blood_group="B+",
            phone="+91-98765-43210",
            address="Flat 302, Palm Grove Apartments, Sector 12, Dwarka, New Delhi",
            emergency_contact="Sunita Sharma (+91-98765-43211) - Spouse"
        )
        db.add(p1)
        await db.flush()

        c1_1 = Condition(
            patient_id=p1.id,
            snomed_code="44054006",
            display_name="Type 2 diabetes mellitus",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2020-04-10",
            notes="Suboptimally controlled with oral hypoglycemics. Target HbA1c < 7.0%."
        )
        c1_2 = Condition(
            patient_id=p1.id,
            snomed_code="59621000",
            display_name="Essential hypertension",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MILD",
            onset_date="2018-09-15",
            notes="Stage 1 essential hypertension under daily Telmisartan therapy."
        )
        db.add_all([c1_1, c1_2])

        enc1 = Encounter(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_type="AMBULATORY",
            reason="Diabetic Follow-up & Glycemic Control Review",
            clinical_notes="Patient presents for routine 3-month diabetic review. Complains of occasional evening fatigue. BP 132/86 mmHg, Pulse 76 bpm. Advised lifestyle modifications.",
            status="COMPLETED",
            encounter_date=now - timedelta(days=5)
        )
        db.add(enc1)

        rx1_1 = Prescription(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_id=enc1.id,
            medication_name="Metformin Hydrochloride",
            dosage="500 mg",
            frequency="Twice daily after meals",
            duration="90 days",
            instructions="Take one tablet after breakfast and one after dinner with water.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=5)
        )
        rx1_2 = Prescription(
            patient_id=p1.id,
            doctor_id=doc1.id,
            encounter_id=enc1.id,
            medication_name="Telmisartan",
            dosage="40 mg",
            frequency="Once daily in the morning",
            duration="90 days",
            instructions="Take consistently at 8:00 AM with water.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=5)
        )
        db.add_all([rx1_1, rx1_2])

        lo1 = LabOrder(
            patient_id=p1.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_name="Diabetic Comprehensive Evaluation",
            test_code="43396009",
            priority="ROUTINE",
            status="COMPLETED",
            clinical_notes="Routine glycemic evaluation and microvascular risk check",
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
            conclusion="Fasting blood sugar (142 mg/dL) and HbA1c (7.8%) indicate suboptimally controlled Type 2 Diabetes. Renal markers within physiological range.",
            status="FINAL",
            issued_at=now - timedelta(days=4)
        )
        db.add(rep1)

        obs1_1 = Observation(
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
        obs1_2 = Observation(
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
        obs1_3 = Observation(
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
        db.add_all([obs1_1, obs1_2, obs1_3])

        consent1 = Consent(
            patient_id=p1.id,
            doctor_id=doc1.id,
            purpose="CONSULTATION",
            categories=["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION"],
            status="GRANTED",
            valid_from=now - timedelta(days=10),
            valid_to=now + timedelta(days=60),
            created_at=now - timedelta(days=10)
        )
        db.add(consent1)

        notif1_1 = Notification(
            user_id=p1_user.id,
            patient_id=p1.id,
            type="LAB_RESULT_AVAILABLE",
            title="Lab Test Results Ready",
            message="Your Diabetic Comprehensive Evaluation results from Dr. Lal PathLabs are available for review.",
            status="SENT",
            scheduled_time=now - timedelta(days=4)
        )
        notif1_2 = Notification(
            user_id=p1_user.id,
            patient_id=p1.id,
            type="MEDICATION",
            title="Medication Reminder: Metformin 500 mg",
            message="Please remember to take your evening dose of Metformin 500 mg after dinner.",
            status="SENT",
            scheduled_time=now - timedelta(hours=2)
        )
        db.add_all([notif1_1, notif1_2])

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

        c2_1 = Condition(
            patient_id=p2.id,
            snomed_code="38362002",
            display_name="Dengue fever",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2026-08-28",
            notes="High grade fever with retro-orbital pain, myalgia, and thrombocytopenia. Recovery phase."
        )
        db.add(c2_1)

        enc2 = Encounter(
            patient_id=p2.id,
            doctor_id=doc1.id,
            encounter_type="AMBULATORY",
            reason="Post-Dengue Thrombocytopenia Monitoring",
            clinical_notes="Afebrile for 48 hours. Appetite improving. No hemorrhagic spots. Repeat platelet count advised.",
            status="COMPLETED",
            encounter_date=now - timedelta(days=2)
        )
        db.add(enc2)

        rx2_1 = Prescription(
            patient_id=p2.id,
            doctor_id=doc1.id,
            encounter_id=enc2.id,
            medication_name="Paracetamol (Dolo 650)",
            dosage="650 mg",
            frequency="SOS (As needed for fever > 100°F)",
            duration="5 days",
            instructions="Maximum 3 tablets per 24 hours. Maintain oral hydration.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=2)
        )
        db.add(rx2_1)

        lo2 = LabOrder(
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
        db.add(lo2)
        await db.flush()

        rep2 = DiagnosticReport(
            lab_order_id=lo2.id,
            patient_id=p2.id,
            doctor_id=doc1.id,
            title="Hematology Report: Platelet Count Trend",
            conclusion="Moderate thrombocytopenia observed. Platelet count stabilizing at 85,000/mcL. Continue oral hydration.",
            status="FINAL",
            issued_at=now - timedelta(days=1)
        )
        db.add(rep2)

        obs2_1 = Observation(
            lab_order_id=lo2.id,
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
        db.add(obs2_1)

        consent2 = Consent(
            patient_id=p2.id,
            doctor_id=doc1.id,
            purpose="CARE_MANAGEMENT",
            categories=["ALL_RECORDS", "DIAGNOSTIC_REPORT", "CONDITION", "PRESCRIPTION"],
            status="GRANTED",
            valid_from=now - timedelta(days=3),
            valid_to=now + timedelta(days=30),
            created_at=now - timedelta(days=3)
        )
        db.add(consent2)

        # -------------------------------------------------------------
        # 5. Patient 3: Vikramaditya Singh (CAD & Post-PTCA Stent)
        # -------------------------------------------------------------
        p3_user = User(
            email="vikram.singh@example.in",
            hashed_password=get_password_hash("Password123!"),
            role="PATIENT",
            full_name="Vikramaditya Singh"
        )
        db.add(p3_user)
        await db.flush()

        p3 = Patient(
            user_id=p3_user.id,
            abha_id="91-7291-2026-0003",
            date_of_birth="1960-03-14",
            gender="Male",
            blood_group="A+",
            phone="+91-98100-44556",
            address="C-8, Vasant Vihar, New Delhi",
            emergency_contact="Col. R.S. Singh (+91-98100-44557) - Son"
        )
        db.add(p3)
        await db.flush()

        c3_1 = Condition(
            patient_id=p3.id,
            snomed_code="53741008",
            display_name="Coronary arteriosclerosis",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2023-11-10",
            notes="Post-PTCA with drug-eluting stent to LAD (2024). Stable angina."
        )
        c3_2 = Condition(
            patient_id=p3.id,
            snomed_code="55822004",
            display_name="Hyperlipidemia",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2022-05-18",
            notes="Under statin therapy. Target LDL < 70 mg/dL."
        )
        db.add_all([c3_1, c3_2])

        enc3 = Encounter(
            patient_id=p3.id,
            doctor_id=doc1.id,
            encounter_type="AMBULATORY",
            reason="Post-PTCA Cardiology Follow-up & Statin Review",
            clinical_notes="Asymptomatic on daily exertion. No chest tightness or dyspnea on walking 2 km. BP 124/78 mmHg, HR 68 bpm regular. Advised continued antiplatelet therapy.",
            status="COMPLETED",
            encounter_date=now - timedelta(days=15)
        )
        db.add(enc3)

        rx3_1 = Prescription(
            patient_id=p3.id,
            doctor_id=doc1.id,
            encounter_id=enc3.id,
            medication_name="Atorvastatin",
            dosage="20 mg",
            frequency="Once daily at bedtime",
            duration="180 days",
            instructions="Strict lipid target adherence. Take at night.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=15)
        )
        rx3_2 = Prescription(
            patient_id=p3.id,
            doctor_id=doc1.id,
            encounter_id=enc3.id,
            medication_name="Aspirin (Ecosprin)",
            dosage="75 mg",
            frequency="Once daily after lunch",
            duration="180 days",
            instructions="Antiplatelet maintenance post stent. Do not skip.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=15)
        )
        rx3_3 = Prescription(
            patient_id=p3.id,
            doctor_id=doc1.id,
            encounter_id=enc3.id,
            medication_name="Metoprolol Succinate",
            dosage="25 mg",
            frequency="Once daily in the morning",
            duration="90 days",
            instructions="Beta-blocker for cardioprotection. Monitor resting pulse.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=15)
        )
        db.add_all([rx3_1, rx3_2, rx3_3])

        lo3 = LabOrder(
            patient_id=p3.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_name="Cardiology Lipid Profile & hs-CRP",
            test_code="39702008",
            priority="ROUTINE",
            status="COMPLETED",
            ordered_at=now - timedelta(days=15),
            completed_at=now - timedelta(days=14)
        )
        db.add(lo3)
        await db.flush()

        rep3 = DiagnosticReport(
            lab_order_id=lo3.id,
            patient_id=p3.id,
            doctor_id=doc1.id,
            title="Cardiovascular Lipid & Biomarker Panel",
            conclusion="LDL cholesterol well-controlled at 68 mg/dL under high-intensity statin therapy. hs-CRP indicates low cardiovascular risk.",
            status="FINAL",
            issued_at=now - timedelta(days=14)
        )
        db.add(rep3)

        obs3_1 = Observation(
            lab_order_id=lo3.id,
            patient_id=p3.id,
            test_code="39702008",
            test_name="LDL Cholesterol",
            value="68",
            unit="mg/dL",
            reference_range="< 100 mg/dL (Target < 70 post-CAD)",
            is_abnormal=False,
            status="FINAL",
            observation_date=now - timedelta(days=14)
        )
        obs3_2 = Observation(
            lab_order_id=lo3.id,
            patient_id=p3.id,
            test_code="102795000",
            test_name="High-Sensitivity CRP (hs-CRP)",
            value="1.2",
            unit="mg/L",
            reference_range="< 1.0 mg/L",
            is_abnormal=False,
            status="FINAL",
            observation_date=now - timedelta(days=14)
        )
        db.add_all([obs3_1, obs3_2])

        consent3 = Consent(
            patient_id=p3.id,
            doctor_id=doc1.id,
            purpose="CONSULTATION",
            categories=["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION"],
            status="GRANTED",
            valid_from=now - timedelta(days=30),
            valid_to=now + timedelta(days=90),
            created_at=now - timedelta(days=30)
        )
        db.add(consent3)

        # -------------------------------------------------------------
        # 6. Patient 4: Ananya Sen (Gestational Diabetes & Hypothyroidism)
        # -------------------------------------------------------------
        p4_user = User(
            email="ananya.sen@example.in",
            hashed_password=get_password_hash("Password123!"),
            role="PATIENT",
            full_name="Ananya Sen"
        )
        db.add(p4_user)
        await db.flush()

        p4 = Patient(
            user_id=p4_user.id,
            abha_id="91-5512-2026-0004",
            date_of_birth="1992-11-04",
            gender="Female",
            blood_group="B+",
            phone="+91-98222-33445",
            address="Flat 402, Mayur Vihar Phase 1, New Delhi",
            emergency_contact="Arjun Sen (+91-98222-33446) - Husband"
        )
        db.add(p4)
        await db.flush()

        c4_1 = Condition(
            patient_id=p4.id,
            snomed_code="40930008",
            display_name="Primary hypothyroidism",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MILD",
            onset_date="2021-02-14",
            notes="Under Levothyroxine replacement. Pregnancy trimester-adjusted dose."
        )
        c4_2 = Condition(
            patient_id=p4.id,
            snomed_code="11687002",
            display_name="Gestational diabetes mellitus",
            clinical_status="ACTIVE",
            verification_status="CONFIRMED",
            severity="MODERATE",
            onset_date="2026-07-15",
            notes="Detected during 24-week OGTT screening. Diet control and regular monitoring."
        )
        db.add_all([c4_1, c4_2])

        enc4 = Encounter(
            patient_id=p4.id,
            doctor_id=doc1.id,
            encounter_type="AMBULATORY",
            reason="Antenatal Endocrine & Glycemic Assessment",
            clinical_notes="Gestational age 26 weeks. Fetal heart rate regular. Blood glucose log reviewed: fasting 88-94 mg/dL. TSH 2.38 mIU/L on current levothyroxine dose.",
            status="COMPLETED",
            encounter_date=now - timedelta(days=8)
        )
        db.add(enc4)

        rx4_1 = Prescription(
            patient_id=p4.id,
            doctor_id=doc1.id,
            encounter_id=enc4.id,
            medication_name="Levothyroxine Sodium",
            dosage="75 mcg",
            frequency="Once daily early morning empty stomach",
            duration="90 days",
            instructions="Take with plain water 45 minutes before breakfast.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=8)
        )
        rx4_2 = Prescription(
            patient_id=p4.id,
            doctor_id=doc1.id,
            encounter_id=enc4.id,
            medication_name="Regular Human Insulin (Huminsulin R)",
            dosage="4 units",
            frequency="Twice daily before major meals",
            duration="30 days",
            instructions="Subcutaneous injection 20 minutes before meals as per sliding scale.",
            status="ACTIVE",
            prescribed_at=now - timedelta(days=8)
        )
        db.add_all([rx4_1, rx4_2])

        lo4 = LabOrder(
            patient_id=p4.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_name="Thyroid Stimulating Hormone (TSH) Pregnancy Screen",
            test_code="396495007",
            priority="ROUTINE",
            status="COMPLETED",
            ordered_at=now - timedelta(days=8),
            completed_at=now - timedelta(days=7)
        )
        db.add(lo4)
        await db.flush()

        rep4 = DiagnosticReport(
            lab_order_id=lo4.id,
            patient_id=p4.id,
            doctor_id=doc1.id,
            title="Antenatal Thyroid & Endocrine Profile",
            conclusion="TSH level is 2.38 mIU/L, within recommended second trimester target (< 3.0 mIU/L).",
            status="FINAL",
            issued_at=now - timedelta(days=7)
        )
        db.add(rep4)

        obs4_1 = Observation(
            lab_order_id=lo4.id,
            patient_id=p4.id,
            test_code="396495007",
            test_name="Serum TSH",
            value="2.38",
            unit="mIU/L",
            reference_range="0.2-3.0 mIU/L (Pregnancy 2nd Trimester)",
            is_abnormal=False,
            status="FINAL",
            observation_date=now - timedelta(days=7)
        )
        db.add(obs4_1)

        consent4 = Consent(
            patient_id=p4.id,
            doctor_id=doc1.id,
            purpose="CONSULTATION",
            categories=["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION"],
            status="GRANTED",
            valid_from=now - timedelta(days=15),
            valid_to=now + timedelta(days=60),
            created_at=now - timedelta(days=15)
        )
        db.add(consent4)

        # -------------------------------------------------------------
        # Active Pending Lab Orders for Intake Queue Testing
        # -------------------------------------------------------------
        pending_lo1 = LabOrder(
            patient_id=p2.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_code="58800005",
            test_name="Repeat Platelet Count & Hematocrit",
            priority="URGENT",
            status="ORDERED",
            ordered_at=now - timedelta(hours=3),
            clinical_notes="Dengue fever follow-up day 6. Re-evaluate platelet count to verify marrow recovery."
        )
        pending_lo2 = LabOrder(
            patient_id=p1.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_code="271062006",
            test_name="Urine Microalbumin & Creatinine Ratio",
            priority="ROUTINE",
            status="ORDERED",
            ordered_at=now - timedelta(hours=6),
            clinical_notes="Annual diabetic nephropathy screening for T2DM on Metformin therapy."
        )
        pending_lo3 = LabOrder(
            patient_id=p3.id,
            doctor_id=doc1.id,
            lab_id=lab.id,
            test_code="104177005",
            test_name="Serum Electrolytes & Cardiac Biomarkers",
            priority="STAT",
            status="ORDERED",
            ordered_at=now - timedelta(hours=1),
            clinical_notes="Post-PTCA routine cardiac electrolyte check (Sodium, Potassium, Magnesium)."
        )
        db.add_all([pending_lo1, pending_lo2, pending_lo3])

        # -------------------------------------------------------------
        # 7. Audit Logs
        # -------------------------------------------------------------
        audit1 = AuditLog(
            actor_id=doc1_user.id,
            actor_role="DOCTOR",
            patient_id=p1.id,
            action="VIEW_HEALTH_RECORD",
            consent_id=consent1.id,
            purpose="CONSULTATION",
            status="SUCCESS",
            details={"notes": "Doctor accessed full longitudinal EHR timeline during ambulatory consultation"}
        )
        audit2 = AuditLog(
            actor_id=doc1_user.id,
            actor_role="DOCTOR",
            patient_id=p3.id,
            action="VIEW_HEALTH_RECORD",
            consent_id=consent3.id,
            purpose="CONSULTATION",
            status="SUCCESS",
            details={"notes": "Cardiologist reviewed coronary stent history and lipid biomarker panels"}
        )
        db.add_all([audit1, audit2])

        await db.commit()
        print("[Reset & Seed] SUCCESS! Seeded 4 complete Indian patient scenarios:")
        print("  1. Rajesh Sharma (52M, ABHA: 91-4405-2026-0001) - Type 2 Diabetes, HTN, Metformin, Telmisartan")
        print("  2. Priya Patel (28F, ABHA: 91-3836-2026-0002) - Dengue Thrombocytopenia, Dolo, Platelet Trends")
        print("  3. Vikramaditya Singh (64M, ABHA: 91-7291-2026-0003) - CAD, Stent LAD, Atorvastatin, Aspirin")
        print("  4. Ananya Sen (34F, ABHA: 91-5512-2026-0004) - Gestational Diabetes, Hypothyroidism, Levothyroxine")

if __name__ == "__main__":
    asyncio.run(main())
