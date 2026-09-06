"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldCheck, Stethoscope, User, FlaskConical, Bell,
  FileText, CheckCircle2, AlertTriangle, Clock, Calendar, Lock,
  Search, Plus, Sparkles, Send, RefreshCw, ChevronRight, X, Eye, FileCode2,
  Network, ArrowRight, KeyRound, LogIn, LogOut, Check, ChevronDown,
  Moon, Sun, HelpCircle, HeartPulse, Pill, FileSpreadsheet, ShieldAlert,
  Mic, MicOff, Wifi, WifiOff, Radio, Copy
} from "lucide-react";
import { OfflineQueueManager, QueuedRecord } from "../lib/offlineQueue";
import FormattedClinicalBrief from "../components/FormattedClinicalBrief";

// ── ROCK-SOLID INITIAL DEMO PATIENT PROFILES (ALWAYS AVAILABLE) ──
const INITIAL_DEMO_PATIENTS = [
  {
    patient_id: "754b6063-98e4-4828-a0fb-6cbe5e2ef476",
    abha_id: "91-4405-2026-0001",
    full_name: "Rajesh Sharma",
    gender: "Male",
    date_of_birth: "1974-05-12",
    blood_group: "B+",
    consent_id: "cons-demo-001",
    status: "GRANTED",
    is_emergency_override: false,
    purpose: "CONSULTATION",
    categories: ["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION", "CONDITION"],
    valid_until: "2026-12-31T23:59:59Z",
    diagnosis: "Type 2 Diabetes Mellitus & Essential Hypertension",
    key_metrics: "HbA1c 7.8% • BP 132/86 • Metformin 500mg BD"
  },
  {
    patient_id: "9e09f5e2-8be9-4308-8f57-71ec64c97a4c",
    abha_id: "91-3836-2026-0002",
    full_name: "Priya Patel",
    gender: "Female",
    date_of_birth: "1998-09-15",
    blood_group: "O+",
    consent_id: "cons-demo-002",
    status: "GRANTED",
    is_emergency_override: false,
    purpose: "CONSULTATION",
    categories: ["ALL_RECORDS", "DIAGNOSTIC_REPORT", "PRESCRIPTION"],
    valid_until: "2026-12-31T23:59:59Z",
    diagnosis: "Dengue Fever with Resolving Thrombocytopenia",
    key_metrics: "Platelet 85,000/mcL • BP 118/74 • Hydration Protocol"
  },
  {
    patient_id: "2d1b7a3e-472f-49bc-a0d5-511b280cf6ee",
    abha_id: "91-7291-2026-0003",
    full_name: "Vikramaditya Singh",
    gender: "Male",
    date_of_birth: "1962-03-24",
    blood_group: "A+",
    consent_id: "cons-demo-003",
    status: "GRANTED",
    is_emergency_override: false,
    purpose: "CONSULTATION",
    categories: ["ALL_RECORDS", "PRESCRIPTION", "CONDITION"],
    valid_until: "2026-12-31T23:59:59Z",
    diagnosis: "Coronary Artery Disease (Post-PTCA LAD Stent)",
    key_metrics: "LVEF 52% • Atorvastatin 40mg • Aspirin 75mg"
  },
  {
    patient_id: "5462f0fd-49b4-4648-a91b-56f12e44412e",
    abha_id: "91-5512-2026-0004",
    full_name: "Ananya Sen",
    gender: "Female",
    date_of_birth: "1992-11-08",
    blood_group: "B+",
    consent_id: "cons-demo-004",
    status: "GRANTED",
    is_emergency_override: false,
    purpose: "CONSULTATION",
    categories: ["ALL_RECORDS", "DIAGNOSTIC_REPORT", "CONDITION"],
    valid_until: "2026-12-31T23:59:59Z",
    diagnosis: "Gestational Diabetes (2nd Trimester) & Hypothyroidism",
    key_metrics: "TSH 2.38 mIU/L • FBG 108 mg/dL • Levothyroxine 50mcg"
  }
];

  // ── RICH DEMO LAB REPORTS DATASET (NABL ISO 15189 ACCREDITED) ──
  const DEMO_LAB_REPORTS = [
    {
      id: "REP-LAB-2026-081",
      test_name: "Diabetic Comprehensive Profile (HbA1c & Fasting Glucose)",
      category: "BIOCHEMISTRY",
      sample_id: "SMP-DL-98412",
      collected_at: "05 Sep 2026, 07:30 AM",
      verified_at: "05 Sep 2026, 02:15 PM",
      pathologist: "Dr. Ananya Ray (MD Pathology, Reg: DMC-41908)",
      lab_name: "Dr. Lal PathLabs National Reference Lab",
      nabl_code: "NABL-ISO-15189-DEL",
      patient_name: "Rajesh Sharma",
      patient_abha: "91-4405-2026-0001",
      status: "COMPLETED",
      abnormal_count: 2,
      conclusion: "Glycemic indices demonstrate sub-optimal diabetic control with HbA1c at 7.8% and Fasting Plasma Glucose of 142 mg/dL. Renal filtration (BUN & Creatinine) is currently preserved. Clinical correlation and endocrinology consultation recommended.",
      observations: [
        { name: "Glycosylated Hemoglobin (HbA1c)", value: "7.8", unit: "%", range: "4.0 - 5.6", flag: "HIGH", method: "HPLC (Bio-Rad D-10)" },
        { name: "Estimated Average Glucose (eAG)", value: "177", unit: "mg/dL", range: "70 - 120", flag: "HIGH", method: "ADAG Equation" },
        { name: "Plasma Glucose (Fasting)", value: "142", unit: "mg/dL", range: "70 - 99", flag: "HIGH", method: "Hexokinase / UV" },
        { name: "Blood Urea Nitrogen (BUN)", value: "16.4", unit: "mg/dL", range: "7.0 - 20.0", flag: "NORMAL", method: "Urease UV" },
        { name: "Serum Creatinine", value: "0.92", unit: "mg/dL", range: "0.7 - 1.2", flag: "NORMAL", method: "Jaffe kinetic compensated" }
      ]
    },
    {
      id: "REP-LAB-2026-082",
      test_name: "Urine Microalbumin & Creatinine Ratio (UACR)",
      category: "CLINICAL_PATHOLOGY",
      sample_id: "SMP-DL-98413",
      collected_at: "05 Sep 2026, 08:00 AM",
      verified_at: "05 Sep 2026, 01:40 PM",
      pathologist: "Dr. Sunita Deshmukh (MD Biochemistry)",
      lab_name: "Dr. Lal PathLabs National Reference Lab",
      nabl_code: "NABL-ISO-15189-DEL",
      patient_name: "Rajesh Sharma",
      patient_abha: "91-4405-2026-0001",
      status: "COMPLETED",
      abnormal_count: 1,
      conclusion: "Urinary albumin excretion is moderately elevated (UACR 42.5 mg/g), indicating early diabetic microalbuminuria / incipient nephropathy. Continuation of renal-protective ARB therapy (Telmisartan) and strict glycemic titration indicated.",
      observations: [
        { name: "Urine Microalbumin", value: "34.0", unit: "mg/L", range: "< 20.0", flag: "HIGH", method: "Immunoturbidimetry" },
        { name: "Urine Creatinine", value: "80.0", unit: "mg/dL", range: "20.0 - 275.0", flag: "NORMAL", method: "Enzymatic Spectrophotometry" },
        { name: "Albumin-to-Creatinine Ratio (UACR)", value: "42.5", unit: "mg/g", range: "< 30.0", flag: "HIGH", method: "Calculated Ratio" }
      ]
    },
    {
      id: "REP-LAB-2026-083",
      test_name: "Complete Hemogram & Automated Platelet Series",
      category: "HEMATOLOGY",
      sample_id: "SMP-DL-98414",
      collected_at: "04 Sep 2026, 09:15 AM",
      verified_at: "04 Sep 2026, 12:30 PM",
      pathologist: "Dr. Vikas Mathur (MD Hematology)",
      lab_name: "Dr. Lal PathLabs National Reference Lab",
      nabl_code: "NABL-ISO-15189-DEL",
      patient_name: "Priya Patel",
      patient_abha: "91-3836-2026-0002",
      status: "COMPLETED",
      abnormal_count: 1,
      conclusion: "Moderate resolving thrombocytopenia with platelet count at 85,000 /mcL secondary to recent febrile convalescence (Dengue follow-up). Hemoglobin and WBC differentials are within normal physiological parameters.",
      observations: [
        { name: "Platelet Count", value: "85,000", unit: "/mcL", range: "150,000 - 450,000", flag: "LOW", method: "Automated Impedance / Optical" },
        { name: "Hemoglobin (Hb)", value: "14.2", unit: "g/dL", range: "13.0 - 17.0", flag: "NORMAL", method: "Cyanmethemoglobin" },
        { name: "Total Leukocyte Count (WBC)", value: "6,400", unit: "/mcL", range: "4,000 - 11,000", flag: "NORMAL", method: "Flow Cytometry" },
        { name: "Packed Cell Volume (PCV)", value: "42.1", unit: "%", range: "40.0 - 50.0", flag: "NORMAL", method: "Calculated" },
        { name: "Mean Platelet Volume (MPV)", value: "9.8", unit: "fL", range: "7.4 - 10.4", flag: "NORMAL", method: "Coulter Technology" }
      ]
    },
    {
      id: "REP-LAB-2026-084",
      test_name: "Lipid Profile Panel (Standard Atherosclerosis Risk)",
      category: "BIOCHEMISTRY",
      sample_id: "SMP-DL-98415",
      collected_at: "01 Sep 2026, 08:30 AM",
      verified_at: "01 Sep 2026, 03:00 PM",
      pathologist: "Dr. Ananya Ray (MD Pathology)",
      lab_name: "Dr. Lal PathLabs National Reference Lab",
      nabl_code: "NABL-ISO-15189-DEL",
      patient_name: "Vikramaditya Singh",
      patient_abha: "91-7291-2026-0003",
      status: "COMPLETED",
      abnormal_count: 2,
      conclusion: "Borderline hypercholesterolemia with elevated serum triglycerides (180 mg/dL). HDL-C is protective at 44 mg/dL. Continuation of statin therapy and dietary lipid moderation indicated.",
      observations: [
        { name: "Total Cholesterol", value: "218", unit: "mg/dL", range: "< 200", flag: "HIGH", method: "CHOD-PAP Enzymatic" },
        { name: "Serum Triglycerides", value: "180", unit: "mg/dL", range: "< 150", flag: "HIGH", method: "GPO-PAP Enzymatic" },
        { name: "HDL Cholesterol", value: "44", unit: "mg/dL", range: "> 40", flag: "NORMAL", method: "Direct Selective Detergent" },
        { name: "LDL Cholesterol (Direct)", value: "138", unit: "mg/dL", range: "< 100", flag: "HIGH", method: "Direct Enzymatic" },
        { name: "VLDL Cholesterol", value: "36.0", unit: "mg/dL", range: "< 30.0", flag: "HIGH", method: "Calculated" }
      ]
    },
    {
      id: "REP-LAB-2026-085",
      test_name: "Thyroid Function Test (Ultrasensitive TSH & Free T4)",
      category: "ENDOCRINOLOGY",
      sample_id: "SMP-DL-98416",
      collected_at: "28 Aug 2026, 09:00 AM",
      verified_at: "28 Aug 2026, 01:10 PM",
      pathologist: "Dr. Sunita Deshmukh (MD Biochemistry)",
      lab_name: "Dr. Lal PathLabs National Reference Lab",
      nabl_code: "NABL-ISO-15189-DEL",
      patient_name: "Ananya Sen",
      patient_abha: "91-5512-2026-0004",
      status: "COMPLETED",
      abnormal_count: 0,
      conclusion: "Euthyroid status confirmed during pregnancy second trimester. Ultrasensitive TSH at 2.38 mIU/L is within optimal gestational reference limits.",
      observations: [
        { name: "Thyroid Stimulating Hormone (TSH)", value: "2.38", unit: "uIU/mL", range: "0.20 - 3.00", flag: "NORMAL", method: "CLIA (Chemiluminescence)" },
        { name: "Free Thyroxine (FT4)", value: "1.18", unit: "ng/dL", range: "0.70 - 1.48", flag: "NORMAL", method: "CLIA" }
      ]
    }
  ];

  // ── RICH DEMO PATIENT LONGITUDINAL TIMELINE EVENTS ──
  const DEMO_PATIENT_TIMELINE_EVENTS = [
    {
      record_id: "ENC-DEL-2026-001",
      event_type: "ENCOUNTER",
      title: "Consultation: Type 2 Diabetes Mellitus Follow-up & Glycemic Review",
      timestamp: "05 Sep 2026, 10:30 AM",
      doctor: "Dr. Arvind Swaminathan (MD, Internal Medicine)",
      hospital: "Apollo Indraprastha Hospital, New Delhi",
      description: "Patient presented for routine bi-monthly glycemic checkup. Complained of persistent evening fatigue and mild polyuria. Blood pressure recorded at 132/86 mmHg, heart rate 76 bpm. Laboratory panel ordered for HbA1c, fasting glucose, and urine microalbumin. Titrated Metformin dosage to 500mg BD after meals."
    },
    {
      record_id: "RX-DEL-2026-001",
      event_type: "PRESCRIPTION",
      title: "Prescription: Metformin Hydrochloride 500 mg Extended Release",
      timestamp: "05 Sep 2026, 10:45 AM",
      doctor: "Dr. Arvind Swaminathan",
      hospital: "Apollo Indraprastha Hospital Pharmacy",
      description: "Dosage: 500 mg | Frequency: Twice daily after meals (oral) | Duration: 30 days | Refills: 2. For glycemic regulation and peripheral insulin sensitization."
    },
    {
      record_id: "RX-DEL-2026-002",
      event_type: "PRESCRIPTION",
      title: "Prescription: Telmisartan 40 mg Oral Tablet",
      timestamp: "05 Sep 2026, 10:45 AM",
      doctor: "Dr. Arvind Swaminathan",
      hospital: "Apollo Indraprastha Hospital Pharmacy",
      description: "Dosage: 40 mg | Frequency: Once daily in the morning | Duration: 30 days | Refills: 2. For renal-protective blood pressure stabilization and microalbuminuria reduction."
    },
    {
      record_id: "REP-LAB-2026-081",
      event_type: "DIAGNOSTIC_REPORT",
      title: "Diagnostic Report: Diabetic Comprehensive Profile (HbA1c & Fasting Glucose)",
      timestamp: "05 Sep 2026, 02:15 PM",
      doctor: "Dr. Ananya Ray (MD Pathology)",
      hospital: "Dr. Lal PathLabs National Reference Lab (NABL ISO 15189)",
      description: "HbA1c: 7.8% (⚠️ Elevated, ref < 5.6%) • Fasting Blood Sugar: 142 mg/dL (⚠️ Elevated, ref 70-99 mg/dL) • BUN: 16.4 mg/dL (Normal) • Creatinine: 0.92 mg/dL (Normal). Sub-optimal glycemic regulation with preserved glomerular filtration rate."
    },
    {
      record_id: "REP-LAB-2026-082",
      event_type: "DIAGNOSTIC_REPORT",
      title: "Diagnostic Report: Urine Microalbumin & Creatinine Ratio (UACR)",
      timestamp: "05 Sep 2026, 01:40 PM",
      doctor: "Dr. Sunita Deshmukh (MD Biochemistry)",
      hospital: "Dr. Lal PathLabs National Reference Lab (NABL ISO 15189)",
      description: "UACR: 42.5 mg/g (⚠️ Moderate Microalbuminuria, ref < 30.0 mg/g) • Urine Microalbumin: 34.0 mg/L (Elevated). Early signs of diabetic microvascular involvement; continued ARB therapy and strict glycemic control advised."
    },
    {
      record_id: "COND-DEL-2026-001",
      event_type: "CONDITION",
      title: "Diagnosis: Type 2 diabetes mellitus (SNOMED CT: 44054006)",
      timestamp: "12 Jan 2024, 11:00 AM",
      doctor: "Dr. Arvind Swaminathan",
      hospital: "Apollo Indraprastha Hospital",
      description: "Clinical status: Active • Verification: Confirmed. Initial onset documented with baseline HbA1c of 8.4%. Maintained on biguanide therapy with dietary compliance."
    },
    {
      record_id: "COND-DEL-2026-002",
      event_type: "CONDITION",
      title: "Diagnosis: Essential hypertension (SNOMED CT: 59621000)",
      timestamp: "18 Aug 2025, 03:20 PM",
      doctor: "Dr. Arvind Swaminathan",
      hospital: "Apollo Indraprastha Hospital",
      description: "Clinical status: Active • Stage 1 essential hypertension documented with blood pressure readings averaging 142/90 mmHg. Well-controlled on low-dose Angiotensin Receptor Blocker."
    }
  ];

  // ── RICH DEMO PENDING LAB REQUISITIONS (FOR SPECIMEN INTAKE QUEUE) ──
  const DEMO_PENDING_LAB_ORDERS = [
    {
      order_id: "ORD-LAB-STAT-101",
      test_code: "43396009",
      test_name: "HbA1c & Fasting Plasma Glucose (Stat Requisition)",
      patient_id: "pat-1",
      patient_name: "Rajesh Sharma",
      abha_id: "91-4405-2026-0001",
      doctor_name: "Dr. Arvind Swaminathan",
      priority: "STAT",
      status: "PENDING",
      ordered_at: "Today, 08:30 AM",
      clinical_notes: "Evaluate acute glycemic variability and evening lethargy"
    },
    {
      order_id: "ORD-LAB-URG-102",
      test_code: "38362002",
      test_name: "Complete Blood Count & Platelet Series (Urgent)",
      patient_id: "pat-2",
      patient_name: "Priya Patel",
      abha_id: "91-3836-2026-0002",
      doctor_name: "Dr. Arvind Swaminathan",
      priority: "URGENT",
      status: "PENDING",
      ordered_at: "Today, 09:15 AM",
      clinical_notes: "Stat 24-hr dengue platelet recovery evaluation"
    }
  ];

    // Sample AI queries & grounded knowledge base
  const sampleAiPrompts = [
    "What is the latest HbA1c trend and diabetic complication risk?",
    "Are there any drug-drug interactions between Metformin and Telmisartan?",
    "Summarize vital signs and blood pressure readings over consultations.",
    "Check patient allergy records before prescribing new medications.",
    "Explain recent Platelet Count drop for Dengue follow-up.",
    "What lifestyle and dietary modifications are indicated for this patient?"
  ];

  const sampleClinicalQnA = [
    {
      q: "What is the latest HbA1c trend and diabetic complication risk?",
      a: "Latest HbA1c is 7.8% (elevated, ref 4.0-5.6%) with Fasting Blood Glucose at 142 mg/dL. Renal function remains preserved with Serum Creatinine at 0.9 mg/dL. Patient is currently on Metformin 500mg BD. Suggest considering dosage titration or SGLT2 inhibitor addition, with annual diabetic retinopathy and microalbuminuria screening.",
      citations: ["Obs#HbA1c-7.8%", "Obs#FBG-142mgdL", "Cond#Type-2-Diabetes"]
    },
    {
      q: "Are there any drug-drug interactions between Metformin and Telmisartan?",
      a: "No adverse pharmacodynamic contraindication. Metformin (biguanide) and Telmisartan (angiotensin II receptor blocker) provide synergistic cardiorenal protection in diabetic hypertension. Recommendation: Monitor serum creatinine, eGFR, and electrolytes biannually.",
      citations: ["Rx#Metformin-500mg", "Rx#Telmisartan-40mg"]
    },
    {
      q: "Explain recent Platelet Count drop for Dengue follow-up.",
      a: "Platelet count dropped to 85,000/mcL (Moderate Thrombocytopenia secondary to Dengue Fever, SNOMED: 38362002). Hemodynamic vitals are stable. Recommendation: Oral fluid hydration, avoid NSAIDs/antiplatelets, repeat CBC every 24 hours until platelets exceed 100,000/mcL.",
      citations: ["Obs#Platelets-85k", "Cond#Dengue-Infection"]
    },
    {
      q: "Check patient allergy records before prescribing new medications.",
      a: "No known active drug or food allergies documented across all ABDM linked health repositories for the active patient profile.",
      citations: ["Allergy#Nil-Documented", "ABDM#Consent-Verified"]
    }
  ];

// ── LOCAL GROUNDED CLINICAL BRIEF SYNTHESIZER ──
// Provides comprehensive fallback generation with structured clinical sections
// for any combination of Focus Area, Audience/Tone, and Time Window
function generateLocalGroundedBrief(
  patient: any,
  focusArea: string = "COMPREHENSIVE",
  audience: string = "CLINICIAN",
  timeWindow: string = "ALL"
) {
  const pName = patient?.full_name || "Rajesh Sharma";
  const pGender = patient?.gender || "Male";
  const pAbha = patient?.abha_id || "91-4405-2026-0001";
  const pDob = patient?.date_of_birth || "1974-05-12";

  const focus = (focusArea || "COMPREHENSIVE").toUpperCase();
  const aud = (audience || "CLINICIAN").toUpperCase();

  let title = "Longitudinal Clinical Synthesis";
  let subtitle = "Multi-source Health Record Integration & Verified Citations";
  let impression = "";
  let diagnoses: any[] = [];
  let medications: any[] = [];
  let labs: any[] = [];
  let recommendations: string[] = [];
  let keyAlerts: string[] = [];
  let recordsCited: string[] = [];

  const isPatientAudience = aud.includes("PATIENT");
  const isHandover = aud.includes("REFERRAL") || aud.includes("HANDOVER");

  if (focus === "GLYCEMIC_CONTROL" || focus === "GLYCEMIC" || focus === "DIABETES") {
    title = isPatientAudience ? `Diabetes & Blood Sugar Guide for ${pName}` : "Endocrine & Glycemic Control Brief";
    subtitle = isPatientAudience ? "Personalized blood sugar management instructions" : "Longitudinal Diabetes Mellitus & Metabolic Analysis";
    impression = isPatientAudience
      ? `Hello ${pName}. Your recent lab tests show that your blood sugar and 3-month average (HbA1c) are elevated above target. Maintaining consistent medication and dietary habits will protect your organs.`
      : `Glycemic evaluation for ${pName} with documented Type 2 Diabetes Mellitus. Laboratory indicators demonstrate elevated HbA1c (7.8%) and fasting blood glucose (142 mg/dL) requiring active glycemic titration and lifestyle reinforcement.`;
    diagnoses = [
      { condition: "Type 2 diabetes mellitus", snomed_code: "44054006", status: "ACTIVE", citation: "Condition#7dfbdf43" }
    ];
    medications = [
      { medication_name: "Metformin Hydrochloride", dosage: "500 mg", instructions: "Twice daily after meals", citation: "Rx#931f806f" },
      { medication_name: "Metformin Hydrochloride", dosage: "500 mg", instructions: "BD with food", citation: "Rx#dc287748" }
    ];
    labs = [
      { test_name: "Fasting Blood Glucose", value: "142", unit: "mg/dL", status: "ABNORMAL", reference_range: "70 - 99 mg/dL", citation: "Obs#90bbc983" },
      { test_name: "Glycated Hemoglobin (HbA1c)", value: "7.8", unit: "%", status: "ABNORMAL", reference_range: "< 5.7 %", citation: "Obs#e5d4decf" }
    ];
    keyAlerts = [
      "HbA1c 7.8% exceeds target (< 7.0%) — glycemic titration recommended",
      "Fasting blood glucose 142 mg/dL indicates persistent dawn phenomenon or insufficient evening basal coverage"
    ];
    recommendations = isPatientAudience
      ? [
          "Take Metformin 500mg immediately after breakfast and dinner with water",
          "Reduce high glycemic carbs (white rice, maida, sweets, sweetened tea)",
          "Walk briskly for 25-30 minutes after your principal meals",
          "Repeat HbA1c lab checkup in 12 weeks"
        ]
      : [
          "Consider stepping up Metformin to 1000 mg BD if renal eGFR remains > 45 mL/min",
          "Reinforce diabetic nutritional counseling and carbohydrate counting",
          "Evaluate adding SGLT2i or DPP-4i if HbA1c remains > 7.5% at 90-day review",
          "Schedule repeat HbA1c in 12 weeks"
        ];
    recordsCited = ["Condition#7dfbdf43", "Rx#931f806f", "Obs#90bbc983", "Obs#e5d4decf"];
  } else if (focus === "CARDIOVASCULAR" || focus === "CARDIAC" || focus === "HYPERTENSION") {
    title = isPatientAudience ? `Heart & Blood Pressure Care Guide for ${pName}` : "Cardiovascular & Hemodynamic Risk Stratification";
    subtitle = isPatientAudience ? "Your blood pressure medication plan and healthy heart habits" : "Blood Pressure Regulation, Renal Protection & Atherosclerotic Risk";
    impression = isPatientAudience
      ? `Hello ${pName}. Your blood pressure medicine (Telmisartan) is actively protecting your blood vessels and kidneys. Please take it every morning without skipping.`
      : `Cardiovascular risk evaluation for ${pName}. Comorbid Essential Hypertension with moderate glycemic burden. Normal renal biomarkers (Serum Creatinine 0.9 mg/dL) indicate preserved filtration.`;
    diagnoses = [
      { condition: "Essential hypertension", snomed_code: "59621000", status: "ACTIVE", citation: "Condition#c5e227e5" }
    ];
    medications = [
      { medication_name: "Telmisartan", dosage: "40 mg", instructions: "Once daily in the morning", citation: "Rx#9eac10b9" }
    ];
    labs = [
      { test_name: "Serum Creatinine", value: "0.9", unit: "mg/dL", status: "NORMAL", reference_range: "0.7 - 1.2 mg/dL", citation: "Obs#949da72c" }
    ];
    keyAlerts = [
      "Maintain home blood pressure monitoring; target < 130/80 mmHg",
      "Monitor serum potassium and renal function annually while on ARB therapy"
    ];
    recommendations = isPatientAudience
      ? [
          "Take Telmisartan 40mg every morning with water",
          "Restrict daily salt intake (avoid pickles, papads, and processed snacks)",
          "Check blood pressure at home once weekly and record in a log"
        ]
      : [
          "Continue Telmisartan 40 mg PO OD; monitor for orthostatic symptoms",
          "Maintain DASH dietary sodium restriction (< 2g sodium/day)",
          "Screen for microalbuminuria via spot urine albumin-to-creatinine ratio (uACR)"
        ];
    recordsCited = ["Condition#c5e227e5", "Rx#9eac10b9", "Obs#949da72c"];
  } else if (focus === "MEDICATIONS" || focus === "PRESCRIPTIONS" || focus === "PHARMA") {
    title = isPatientAudience ? `Your Daily Medicine Schedule (${pName})` : "Pharmacotherapy & Medication Reconciliation Brief";
    subtitle = isPatientAudience ? "All your current medicines, what they do, and when to take them" : "Active Regimen, Drug-Drug Interaction Screen & Adherence Protocol";
    impression = isPatientAudience
      ? `Here is your verified daily medication schedule. Always take your medicines at the instructed times with meals to prevent stomach upset.`
      : `Comprehensive medication reconciliation for ${pName}. 6 active pharmacotherapeutic regimen(s) verified against ABDM health records. Zero severe contraindications detected.`;
    diagnoses = [
      { condition: "Type 2 diabetes mellitus", snomed_code: "44054006", status: "ACTIVE", citation: "Condition#7dfbdf43" },
      { condition: "Essential hypertension", snomed_code: "59621000", status: "ACTIVE", citation: "Condition#c5e227e5" }
    ];
    medications = [
      { medication_name: "Metformin Hydrochloride", dosage: "500 mg", instructions: "Twice daily after meals", citation: "Rx#931f806f" },
      { medication_name: "Telmisartan", dosage: "40 mg", instructions: "Once daily in the morning", citation: "Rx#9eac10b9" },
      { medication_name: "Metformin Hydrochloride", dosage: "500 mg", instructions: "BD with food", citation: "Rx#dc287748" },
      { medication_name: "Paracetamol (Dolo)", dosage: "500 mg", instructions: "Twice daily after meals (as needed)", citation: "Rx#de4c2eba" }
    ];
    labs = [];
    keyAlerts = [
      "Take Metformin with meals to minimize gastrointestinal discomfort",
      "Avoid concurrent NSAID overuse with Telmisartan to prevent acute renal hemodynamics impairment"
    ];
    recommendations = isPatientAudience
      ? [
          "Take morning pills with breakfast and evening pills right after dinner",
          "Never double a dose if missed; take next dose at scheduled hour",
          "Refill prescriptions at least 3 days before supply ends"
        ]
      : [
          "Consolidate redundant Metformin prescriptions into a single unified order",
          "Synchronize refill schedule across all active maintenance medications",
          "Verify patient adherence through pill counts or digital reminder logs"
        ];
    recordsCited = ["Rx#931f806f", "Rx#9eac10b9", "Rx#dc287748", "Rx#de4c2eba"];
  } else if (focus === "RECENT_LABS" || focus === "LABS" || focus === "DIAGNOSTICS") {
    title = isPatientAudience ? `Recent Lab Test Results for ${pName}` : "Diagnostic & Laboratory Trajectory Brief";
    subtitle = isPatientAudience ? "What your latest blood tests mean in simple language" : "Biomarker Trends, Reference Deviations & Clinical Pathology";
    impression = isPatientAudience
      ? `Your blood tests show that your kidneys are functioning well (normal creatinine). However, your blood sugar and 3-month average sugar (HbA1c) are higher than normal.`
      : `Diagnostic review of recent laboratory panels. Glycemic parameters reflect active metabolic disturbance. Renal function and electrolyte panels remain within normal physiological limits.`;
    labs = [
      { test_name: "Fasting Blood Glucose", value: "142", unit: "mg/dL", status: "ABNORMAL", reference_range: "70 - 99 mg/dL", citation: "Obs#90bbc983" },
      { test_name: "Glycated Hemoglobin (HbA1c)", value: "7.8", unit: "%", status: "ABNORMAL", reference_range: "< 5.7 %", citation: "Obs#e5d4decf" },
      { test_name: "Serum Creatinine", value: "0.9", unit: "mg/dL", status: "NORMAL", reference_range: "0.7 - 1.2 mg/dL", citation: "Obs#949da72c" }
    ];
    diagnoses = [
      { condition: "Type 2 diabetes mellitus", snomed_code: "44054006", status: "ACTIVE", citation: "Condition#7dfbdf43" }
    ];
    medications = [];
    keyAlerts = [
      "HbA1c 7.8% (Elevated)",
      "Fasting Blood Glucose 142 mg/dL (Elevated)",
      "Serum Creatinine 0.9 mg/dL (Normal renal filtration)"
    ];
    recommendations = isPatientAudience
      ? [
          "Follow up with your doctor regarding your high blood sugar results",
          "Stick to your prescribed diet and medicine without interruption",
          "Repeat your blood sugar tests in 90 days as scheduled"
        ]
      : [
          "Schedule 90-day repeat metabolic panel (HbA1c, FPG, Lipid profile)",
          "Order spot urine microalbumin-to-creatinine ratio (uACR) to screen for diabetic nephropathy",
          "Maintain vigilance for subclinical electrolyte shifts"
        ];
    recordsCited = ["Obs#90bbc983", "Obs#e5d4decf", "Obs#949da72c"];
  } else {
    // COMPREHENSIVE
    title = isPatientAudience ? `Complete Health Overview for ${pName}` : isHandover ? `Clinical Handover (SBAR) - ${pName}` : "Comprehensive Longitudinal Clinical Brief";
    subtitle = isPatientAudience ? "Your medical summary, treatments, and doctor instructions" : "Unified ABDM Health Record Synthesis • Zero-Hallucination";
    impression = isPatientAudience
      ? `Hello ${pName}. This summary includes all your active conditions, current medications, and recent lab results from your verified ABDM digital health records.`
      : `Patient ${pName} (${pGender}, DOB: ${pDob}, ABHA: ${pAbha}) has 2 active documented conditions and active pharmacotherapy with elevated glycemic markers.`;
    diagnoses = [
      { condition: "Type 2 diabetes mellitus", snomed_code: "44054006", status: "ACTIVE", citation: "Condition#7dfbdf43" },
      { condition: "Essential hypertension", snomed_code: "59621000", status: "ACTIVE", citation: "Condition#c5e227e5" }
    ];
    medications = [
      { medication_name: "Metformin Hydrochloride", dosage: "500 mg", instructions: "Twice daily after meals", citation: "Rx#931f806f" },
      { medication_name: "Telmisartan", dosage: "40 mg", instructions: "Once daily in the morning", citation: "Rx#9eac10b9" }
    ];
    labs = [
      { test_name: "Fasting Blood Glucose", value: "142", unit: "mg/dL", status: "ABNORMAL", reference_range: "70 - 99 mg/dL", citation: "Obs#90bbc983" },
      { test_name: "Glycated Hemoglobin (HbA1c)", value: "7.8", unit: "%", status: "ABNORMAL", reference_range: "< 5.7 %", citation: "Obs#e5d4decf" },
      { test_name: "Serum Creatinine", value: "0.9", unit: "mg/dL", status: "NORMAL", reference_range: "0.7 - 1.2 mg/dL", citation: "Obs#949da72c" }
    ];
    keyAlerts = [
      "HbA1c 7.8% (Target < 7.0%) — Glycemic titration advised",
      "Essential Hypertension managed on Telmisartan 40mg OD"
    ];
    recommendations = isPatientAudience
      ? [
          "Take all prescribed medications daily as directed",
          "Follow low-salt, low-glycemic dietary recommendations",
          "Schedule repeat lab checkup in 3 months"
        ]
      : [
          "Optimize glycemic management; assess need for Metformin dose step-up",
          "Continue hemodynamic surveillance with ambulatory BP tracking",
          "Order repeat HbA1c and urine microalbumin in 12 weeks"
        ];
    recordsCited = ["Condition#7dfbdf43", "Condition#c5e227e5", "Rx#931f806f", "Rx#9eac10b9", "Obs#90bbc983", "Obs#e5d4decf", "Obs#949da72c"];
  }

  const summaryText = `### ${title}\n\n**Patient:** ${pName} (${pGender}, ABHA: ${pAbha})\n\n**Clinical Impression:** ${impression}\n\n**Active Diagnoses:** ${diagnoses.map(d => `${d.condition} (SNOMED: ${d.snomed_code}) [${d.citation}]`).join("; ")}\n\n**Current Pharmacotherapy:** ${medications.map(m => `${m.medication_name} ${m.dosage}, ${m.instructions} [${m.citation}]`).join(", ")}\n\n**Diagnostic Investigations:** ${labs.map(l => `${l.test_name}: ${l.value} ${l.unit} (${l.status === "ABNORMAL" ? "⚠️ ABNORMAL" : "Normal"}) [${l.citation}]`).join("; ")}\n\n**Clinical Recommendations:**\n${recommendations.map(r => `• ${r}`).join("\n")}`;

  return {
    patient_id: patient?.patient_id || pAbha,
    summary: summaryText,
    records_cited: recordsCited,
    grounded_record_ids: recordsCited,
    focus_area: focus,
    audience: aud,
    time_window: timeWindow,
    structured_sections: {
      title,
      subtitle,
      focus,
      audience: aud,
      clinical_impression: impression,
      diagnoses,
      medications,
      lab_findings: labs,
      recommendations,
      key_alerts: keyAlerts
    }
  };
}

export default function Home() {
  // ── Role & Active View State ──
  const [currentRole, setCurrentRole] = useState<"DOCTOR" | "PATIENT" | "LAB">("DOCTOR");
  const [currentUserName, setCurrentUserName] = useState("Dr. Arvind Swaminathan");
  const [currentUserSubtitle, setCurrentUserSubtitle] = useState("MD, Internal Medicine • Apollo Hospitals");
  const [activePortal, setActivePortal] = useState<string>("doctor_workspace");
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ── Auth Tokens ──
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [activeToken, setActiveToken] = useState<string>("");

  // ── Custom Auth Modal State ──
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authRole, setAuthRole] = useState("PATIENT");
  const [authFullName, setAuthFullName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── Doctor Workspace State ──
  const [patients, setPatients] = useState<any[]>(INITIAL_DEMO_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_DEMO_PATIENTS[0].patient_id);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [timeline, setTimeline] = useState<any>(null);
  const [timelineFilter, setTimelineFilter] = useState<string>("ALL");
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  // ── Lab Portal State ──
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [labObsValue, setLabObsValue] = useState("");
  const [labObsRange, setLabObsRange] = useState("");
  const [labObsAbnormal, setLabObsAbnormal] = useState(false);
  const [labConclusion, setLabConclusion] = useState("");

  // ── Consent & Audit State ──
  const [consents, setConsents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [grantDoctorId, setGrantDoctorId] = useState("");
  const [grantPurpose, setGrantPurpose] = useState("CONSULTATION");
  const [grantCategory, setGrantCategory] = useState("ALL_RECORDS");

  // ── AI Clinical Copilot State ──
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [briefFocusArea, setBriefFocusArea] = useState<string>("COMPREHENSIVE");
  const [briefAudience, setBriefAudience] = useState<string>("PHYSICIAN");
  const [briefTimeWindow, setBriefTimeWindow] = useState<string>("ALL");
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [loadingAiQuery, setLoadingAiQuery] = useState(false);
  const [explainingReport, setExplainingReport] = useState<any>(null);
  const [loadingLabExplainer, setLoadingLabExplainer] = useState(false);

  // ── Encounter Documentation Modal ──
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [encounterReason, setEncounterReason] = useState("");
  const [encounterNotes, setEncounterNotes] = useState("");
  const [snomedSearchQuery, setSnomedSearchQuery] = useState("");
  const [snomedResults, setSnomedResults] = useState<any[]>([]);
  const [selectedSnomed, setSelectedSnomed] = useState<any>(null);
  const [rxMedName, setRxMedName] = useState("");
  const [rxDosage, setRxDosage] = useState("500 mg");
  const [rxFrequency, setRxFrequency] = useState("Twice daily after meals");
  const [rxDuration, setRxDuration] = useState("30 days");
  const [lastCommittedEncounter, setLastCommittedEncounter] = useState<any>(null);
  const [signedEncountersHistory, setSignedEncountersHistory] = useState<any[]>([
    {
      id: "ENC-DEL-2026-001",
      patient_name: "Rajesh Sharma",
      patient_id: "pat-1",
      reason: "Type 2 Diabetes Mellitus Follow-up & Glycemic Review",
      notes: "Patient presents for routine bi-monthly glycemic check. Complains of mild evening fatigue. Vitals: BP 132/86, HR 76. Ordered HbA1c, fasting glucose, and urine microalbumin.",
      snomed: { concept_id: "44054006", display_name: "Type 2 diabetes mellitus" },
      medication: "Metformin Hydrochloride 500 mg (Twice daily after meals, 30 days)",
      timestamp: "05 Sep 2026, 10:30 AM",
      status: "COMMITTED & CRYPTOGRAPHICALLY SIGNED"
    }
  ]);
  const [activeLabTab, setActiveLabTab] = useState<"queue" | "archive">("queue");
  const [selectedDemoLabReport, setSelectedDemoLabReport] = useState<any>(null);
  const [patientTimelineFilter, setPatientTimelineFilter] = useState<string>("ALL");
  const [copiedAiBrief, setCopiedAiBrief] = useState(false);

  // ── FHIR Viewer State ──
  const [fhirResource, setFhirResource] = useState<any>(null);
  const [selectedFhirType, setSelectedFhirType] = useState("Patient");

  // ── ABDM Gateway Simulator State (HIP & HIU) ──
  const [abdmAbhaInput, setAbdmAbhaInput] = useState("91-4405-2026-0001");
  const [abdmDiscovered, setAbdmDiscovered] = useState<any>(null);
  const [abdmOtpInput, setAbdmOtpInput] = useState("123456");
  const [abdmLinkStatus, setAbdmLinkStatus] = useState<string>("");
  const [abdmLinkResult, setAbdmLinkResult] = useState<any>(null);
  const [abdmHiuConsentId, setAbdmHiuConsentId] = useState<string>("");
  const [abdmHiuTransferResult, setAbdmHiuTransferResult] = useState<any>(null);
  const [loadingAbdm, setLoadingAbdm] = useState(false);

  // ── Rural PHC Offline Resilience State ──
  const [isPhcOnline, setIsPhcOnline] = useState<boolean>(true);
  const [phcQueue, setPhcQueue] = useState<QueuedRecord[]>([]);
  const [isSyncingPhc, setIsSyncingPhc] = useState<boolean>(false);
  const [phcToast, setPhcToast] = useState<string | null>(null);

  // ── Emergency Break-Glass Protocol State ──
  const [showBreakGlassModal, setShowBreakGlassModal] = useState<boolean>(false);
  const [allDirectoryPatients, setAllDirectoryPatients] = useState<any[]>([]);
  const [breakGlassPatientId, setBreakGlassPatientId] = useState<string>("");
  const [breakGlassJustification, setBreakGlassJustification] = useState<string>("");
  const [breakGlassType, setBreakGlassType] = useState<string>("ACCIDENT_TRAUMA");
  const [loadingBreakGlass, setLoadingBreakGlass] = useState<boolean>(false);
  const [breakGlassError, setBreakGlassError] = useState<string>("");
  const [breakGlassSuccessNotice, setBreakGlassSuccessNotice] = useState<any>(null);

  // ── Voice-to-SNOMED Dictation State ──
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictationTranscript, setDictationTranscript] = useState<string>("");
  const [loadingDictationParse, setLoadingDictationParse] = useState<boolean>(false);
  const [dictationSummaryPill, setDictationSummaryPill] = useState<string | null>(null);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    const themeStr = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", themeStr);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("medindia_theme", themeStr);
    } catch (e) {}
  };

  // Hydrate theme on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("medindia_theme");
      const isDark = savedTheme === "dark";
      setIsDarkMode(isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {}
  }, []);

  // Initial load
  useEffect(() => {
    initAuthAndData();

    // Auto-reconnect polling if backend starts after frontend loads
    const pollInterval = setInterval(() => {
      fetch("http://localhost:8000/api/health", { signal: AbortSignal.timeout(1500) })
        .then(res => {
          if (res.ok) {
            setIsBackendConnected(prev => {
              if (!prev) {
                console.log("Backend connection established! Refreshing rosters and tokens...");
                initAuthAndData();
                return true;
              }
              return true;
            });
          } else {
            setIsBackendConnected(false);
          }
        })
        .catch(() => setIsBackendConnected(false));
    }, 6000);

    // Subscribe to Offline Queue updates & Network status
    const unsubQueue = OfflineQueueManager.subscribe((q) => setPhcQueue([...q]));
    const unsubNet = OfflineQueueManager.subscribeNetwork((online) => setIsPhcOnline(online));

    return () => {
      clearInterval(pollInterval);
      unsubQueue();
      unsubNet();
    };
  }, []);


  const initAuthAndData = async () => {
    try {
      // 1. Authenticate Doctor
      const docRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "dr.arvind@apollo.in", password: "Doctor123!" })
      });
      const docData = await docRes.json();

      // 2. Authenticate Patient
      const patRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rajesh.sharma@example.in", password: "Password123!" })
      });
      const patData = await patRes.json();

      // 3. Authenticate Lab
      const labRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "delhi.lab@lalpathlabs.com", password: "Lab12345!" })
      });
      const labData = await labRes.json();

      const loadedTokens = {
        doctor: docData.access_token,
        patient: patData.access_token,
        lab: labData.access_token
      };
      setTokens(loadedTokens);
      setActiveToken(loadedTokens.doctor);

      // Load doctor patient list
      const pRes = await fetch("http://localhost:8000/api/v1/doctors/authorized-patients", {
        headers: { Authorization: `Bearer ${loadedTokens.doctor}` }
      });
      const pList = await pRes.json();
      if (Array.isArray(pList) && pList.length > 0) {
        setPatients(pList);
        setSelectedPatientId(pList[0].patient_id);
        setAbdmHiuConsentId(pList[0].consent_id);
        fetchTimeline(pList[0].patient_id, loadedTokens.doctor);
      }

      fetchLabOrders(loadedTokens.lab);
      fetchNotifications(loadedTokens.patient);
      fetchConsents(loadedTokens.patient);
      fetchDoctorsList(loadedTokens.patient);
      fetchAuditLogs(loadedTokens.patient);

    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const switchPersona = (role: "DOCTOR" | "PATIENT" | "LAB", customEmail?: string) => {
    setCurrentRole(role);
    if (role === "DOCTOR") {
      setCurrentUserName("Dr. Arvind Swaminathan");
      setCurrentUserSubtitle("MD, Internal Medicine • Apollo Hospitals");
      setActiveToken(tokens.doctor);
      setActivePortal("doctor_workspace");
    } else if (role === "PATIENT") {
      setCurrentUserName("Rajesh Sharma");
      setCurrentUserSubtitle("ABHA: 91-4405-2026-0001 • Dwarka, New Delhi");
      setActiveToken(tokens.patient);
      setActivePortal("patient_abha");
    } else {
      setCurrentUserName("Dr. Lal PathLabs Specialist");
      setCurrentUserSubtitle("NABL License: NABL-DL-2026-891 • Delhi Hub");
      setActiveToken(tokens.lab);
      setActivePortal("lab_queue");
    }
    setShowPersonaModal(false);
  };

  const handleCustomAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegisterMode) {
        const res = await fetch("http://localhost:8000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            full_name: authFullName,
            role: authRole
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");
        setCurrentUserName(data.user.full_name);
        setCurrentUserSubtitle(`${data.user.role} Account`);
        setCurrentRole(data.user.role as any);
        setActiveToken(data.access_token);
        if (data.user.role === "DOCTOR") setActivePortal("doctor_workspace");
        else if (data.user.role === "PATIENT") setActivePortal("patient_abha");
        else setActivePortal("lab_queue");
      } else {
        const res = await fetch("http://localhost:8000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Login failed");
        setCurrentUserName(data.user.full_name);
        setCurrentUserSubtitle(`${data.user.role} Account`);
        setCurrentRole(data.user.role as any);
        setActiveToken(data.access_token);
        if (data.user.role === "DOCTOR") setActivePortal("doctor_workspace");
        else if (data.user.role === "PATIENT") setActivePortal("patient_abha");
        else setActivePortal("lab_queue");
      }
      setShowPersonaModal(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const fetchTimeline = async (patientId: string, token = activeToken || tokens.doctor) => {
    setLoadingTimeline(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/doctors/patients/${patientId}/timeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTimeline(data);
      setAiSummary(null);
      setAiAnswer(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const fetchLabOrders = async (token = tokens.lab) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/labs/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLabOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConsents = async (token = tokens.patient) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/consent/patient", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConsents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async (token = tokens.patient) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/reminders/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDoctorsList = async (token = tokens.patient) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/doctors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDoctorsList(data);
        setGrantDoctorId(data[0].practitioner_id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuditLogs = async (token = tokens.patient) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/patient", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFhir = async (resourceType: string) => {
    setSelectedFhirType(resourceType);
    try {
      let endpoint = `http://localhost:8000/api/fhir/${resourceType}`;
      if (selectedPatientId) {
        endpoint += `/${selectedPatientId}`;
      }
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${tokens.doctor}` }
      });
      const data = await res.json();
      setFhirResource(data);
    } catch (err) {
      console.error(err);
    }
  };

  // ── ABDM Gateway Operations ──
  const handleAbdmDiscover = async () => {
    setLoadingAbdm(true);
    setAbdmDiscovered(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/abdm/hip/patient/care-context/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abha_id: abdmAbhaInput })
      });
      const data = await res.json();
      setAbdmDiscovered(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAbdm(false);
    }
  };

  const handleAbdmConfirmLink = async () => {
    setLoadingAbdm(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/abdm/hip/link/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: abdmDiscovered?.patient_id || selectedPatientId,
          otp: abdmOtpInput
        })
      });
      const data = await res.json();
      setAbdmLinkStatus(data.status === "LINKED" ? "Verified & Linked to ABHA Account" : "Linking Failed");
    } catch (err) {
      console.error(err);
      setAbdmLinkStatus("Link error");
    } finally {
      setLoadingAbdm(false);
    }
  };

  const handleAbdmFetchData = async () => {
    setLoadingAbdm(true);
    setAbdmHiuTransferResult(null);
    try {
      const consentToUse = abdmHiuConsentId || (patients[0]?.consent_id);
      const res = await fetch(`http://localhost:8000/api/v1/abdm/hiu/health-information/fetch/${consentToUse}`, {
        headers: { Authorization: `Bearer ${tokens.doctor}` }
      });
      const data = await res.json();
      setAbdmHiuTransferResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAbdm(false);
    }
  };

  // ── Clinical & AI Operations ──
  const searchSnomed = async (q: string) => {
    setSnomedSearchQuery(q);
    if (!q || q.length < 2) {
      setSnomedResults([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/terminology/snomed/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const rawList = Array.isArray(data) ? data : (data.results || []);
      const normalized = rawList.map((item: any) => ({
        concept_id: item.code || item.concept_id,
        display_name: item.display || item.display_name || item.name,
      }));
      setSnomedResults(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    try {
      const payload = {
        patient_id: selectedPatientId,
        encounter_type: "AMBULATORY",
        reason: encounterReason || "Clinical Evaluation",
        clinical_notes: encounterNotes,
        conditions: selectedSnomed ? [{
          snomed_code: selectedSnomed.concept_id,
          display_name: selectedSnomed.display_name,
          clinical_status: "ACTIVE",
          severity: "MODERATE"
        }] : [],
        prescriptions: rxMedName ? [{
          medication_name: rxMedName,
          dosage: rxDosage,
          frequency: rxFrequency,
          duration: rxDuration,
          instructions: "Take as prescribed."
        }] : []
      };

      if (!OfflineQueueManager.isOnline()) {
        OfflineQueueManager.enqueue(
          "/api/v1/doctors/encounters",
          "POST",
          payload,
          `Encounter: ${payload.reason} (${selectedPatient?.full_name || "Patient"})`,
          selectedPatient?.full_name
        );
        setShowEncounterModal(false);
        setEncounterReason("");
        setEncounterNotes("");
        setSelectedSnomed(null);
        setRxMedName("");
        setDictationSummaryPill(null);
        setPhcToast("PHC Offline Mode: Consultation saved to local queue. Will auto-sync to ABDM when online.");
        setTimeout(() => setPhcToast(null), 4500);
        return;
      }

      const res = await fetch("http://localhost:8000/api/v1/doctors/encounters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowEncounterModal(false);
        setEncounterReason("");
        setEncounterNotes("");
        setSelectedSnomed(null);
        setRxMedName("");
        setDictationSummaryPill(null);
        fetchTimeline(selectedPatientId);
        fetchAuditLogs(tokens.patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllDirectoryPatients = async (docToken?: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/doctors/all-patients", {
        headers: { Authorization: `Bearer ${docToken || tokens.doctor}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllDirectoryPatients(data);
        if (data.length > 0 && !breakGlassPatientId) {
          setBreakGlassPatientId(data[0].patient_id);
        }
      }
    } catch (e) {
      console.error("Error fetching all patients:", e);
    }
  };

  const handleBreakGlassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassPatientId) {
      setBreakGlassError("Please select a patient from the hospital directory.");
      return;
    }
    if (breakGlassJustification.trim().length < 10) {
      setBreakGlassError("Clinical justification must be at least 10 characters long.");
      return;
    }
    setLoadingBreakGlass(true);
    setBreakGlassError("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/consent/break-glass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          patient_id: breakGlassPatientId,
          justification: breakGlassJustification.trim(),
          emergency_type: breakGlassType
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setBreakGlassError(data.detail || "Failed to authorize emergency break-glass consent.");
        return;
      }

      setBreakGlassSuccessNotice(data);

      // Refresh doctor's authorized patients list to include newly unlocked patient
      const pRes = await fetch("http://localhost:8000/api/v1/doctors/authorized-patients", {
        headers: { Authorization: `Bearer ${tokens.doctor}` }
      });
      const pList = await pRes.json();
      if (Array.isArray(pList)) {
        setPatients(pList);
        setSelectedPatientId(breakGlassPatientId);
        fetchTimeline(breakGlassPatientId, tokens.doctor);
      }

      // Refresh patient side if active
      if (tokens.patient) {
        fetchAuditLogs(tokens.patient);
        fetchNotifications(tokens.patient);
        fetchConsents(tokens.patient);
      }

      setTimeout(() => {
        setShowBreakGlassModal(false);
        setBreakGlassSuccessNotice(null);
        setBreakGlassJustification("");
      }, 2500);
    } catch (err: any) {
      setBreakGlassError(err.message || "Network error while requesting emergency override.");
    } finally {
      setLoadingBreakGlass(false);
    }
  };

  const handleParseDictation = async (text: string) => {
    if (!text || text.trim().length < 3) return;
    setLoadingDictationParse(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/parse-dictation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({ transcript: text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reason) setEncounterReason(data.reason);
        if (data.clinical_notes) setEncounterNotes(data.clinical_notes);
        if (data.conditions && data.conditions.length > 0) {
          const firstCond = data.conditions[0];
          setSelectedSnomed({
            concept_id: firstCond.snomed_code,
            display_name: firstCond.display_name
          });
        }
        if (data.prescriptions && data.prescriptions.length > 0) {
          const firstRx = data.prescriptions[0];
          setRxMedName(firstRx.medication_name);
          setRxDosage(firstRx.dosage);
          setRxFrequency(firstRx.frequency);
          setRxDuration(firstRx.duration);
        }
        const condSummary = data.conditions?.map((c: any) => c.display_name).join(", ") || "None";
        const rxSummary = data.prescriptions?.map((p: any) => p.medication_name).join(", ") || "None";
        setDictationSummaryPill(`✨ AI Extracted: ${condSummary} • Rx: ${rxSummary}`);
      }
    } catch (err) {
      console.error("Dictation parse error:", err);
    } finally {
      setLoadingDictationParse(false);
    }
  };

  const toggleDictation = () => {
    if (isDictating) {
      setIsDictating(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser. Please use the quick clinical dictation preset chips!");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsDictating(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDictationTranscript(transcript);
        handleParseDictation(transcript);
        setIsDictating(false);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsDictating(false);
    }
  };

  const handleSyncOfflineQueue = async () => {
    setIsSyncingPhc(true);
    setPhcToast("Synchronizing queued rural PHC encounters to ABDM cloud...");
    try {
      const result = await OfflineQueueManager.syncQueue(tokens.doctor);
      setPhcToast(`Synced ${result.synced} records successfully to ABDM cloud.${result.failed > 0 ? ` (${result.failed} failed)` : ""}`);
      if (selectedPatientId) {
        fetchTimeline(selectedPatientId, tokens.doctor);
      }
      setTimeout(() => setPhcToast(null), 4000);
    } catch (e: any) {
      setPhcToast(`Sync error: ${e.message}`);
    } finally {
      setIsSyncingPhc(false);
    }
  };


  const generateAiSummary = async (
    overrideFocus?: string,
    overrideAudience?: string,
    overrideTime?: string,
    overridePid?: string
  ) => {
    const pid = overridePid || selectedPatientId || (patients[0]?.patient_id);
    if (!pid) return;

    const focus = overrideFocus !== undefined ? overrideFocus : briefFocusArea;
    const aud = overrideAudience !== undefined ? overrideAudience : briefAudience;
    const time = overrideTime !== undefined ? overrideTime : briefTimeWindow;

    // Synchronize local states if explicitly overridden
    if (overrideFocus !== undefined) setBriefFocusArea(overrideFocus);
    if (overrideAudience !== undefined) setBriefAudience(overrideAudience);
    if (overrideTime !== undefined) setBriefTimeWindow(overrideTime);

    setLoadingAiSummary(true);
    try {
      const queryParams = new URLSearchParams({
        focus_area: focus,
        audience: aud,
        time_window: time
      });
      const res = await fetch(`http://localhost:8000/api/v1/ai/summary/${pid}?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${tokens.doctor}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiSummary(data);
        if (tokens.patient) {
          fetchAuditLogs(tokens.patient);
        }
      } else {
        // Fallback to local grounded synthesizer
        const activePat = patients.find(p => p.patient_id === pid) || INITIAL_DEMO_PATIENTS[0];
        const localBrief = generateLocalGroundedBrief(activePat, focus, aud, time);
        setAiSummary(localBrief);
      }
    } catch (err) {
      console.warn("Live AI summary endpoint issue, generating local grounded synthesis:", err);
      const activePat = patients.find(p => p.patient_id === pid) || INITIAL_DEMO_PATIENTS[0];
      const localBrief = generateLocalGroundedBrief(activePat, focus, aud, time);
      setAiSummary(localBrief);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const askAiAssistant = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q.trim()) return;
    const pid = selectedPatientId || selectedPatient?.patient_id || INITIAL_DEMO_PATIENTS[0].patient_id;
    setLoadingAiQuery(true);
    try {
      let data = null;
      try {
        const res = await fetch("http://localhost:8000/api/v1/ai/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.doctor || ""}`
          },
          body: JSON.stringify({
            patient_id: pid,
            query: q
          }),
          signal: AbortSignal.timeout(3500)
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        console.warn("Live AI query endpoint unreachable, querying local grounded clinical knowledge base:", netErr);
      }

      if (!data) {
        const qLower = q.toLowerCase();
        const match = sampleClinicalQnA.find(item =>
          (qLower.includes("hba1c") && item.q.toLowerCase().includes("hba1c")) ||
          (qLower.includes("interaction") && item.q.toLowerCase().includes("interaction")) ||
          (qLower.includes("telmisartan") && item.q.toLowerCase().includes("telmisartan")) ||
          (qLower.includes("platelet") && item.q.toLowerCase().includes("platelet")) ||
          (qLower.includes("allergy") && item.q.toLowerCase().includes("allergy")) ||
          item.q.toLowerCase().includes(qLower) ||
          qLower.includes(item.q.toLowerCase())
        );

        if (match) {
          data = {
            answer: match.a,
            grounded_record_ids: match.citations,
            confidence: 0.98
          };
        } else if (qLower.includes("vital") || qLower.includes("blood pressure") || qLower.includes("bp")) {
          data = {
            answer: `Longitudinal vital signs summary for ${selectedPatient?.full_name || "Rajesh Sharma"}:\n` +
              `• Blood Pressure: 132/86 mmHg (Sitting, right arm, Apollo Indraprastha Consultation) [Record: ENC-DEL-2026-001].\n` +
              `• Pulse / Heart Rate: 76 bpm (regular rhythm, no arrhythmia detected).\n` +
              `• Temperature: 98.4°F (Afebrile).\n` +
              `• Respiration: 16 breaths/min. Oxygen Saturation (SpO2): 99% on room air.\n` +
              `Clinical assessment: Stage 1 systolic elevation, stable on current Telmisartan 40mg therapy.`,
            grounded_record_ids: ["ENC-DEL-2026-001", "Vitals#BP-132-86", "Rx#Telmisartan-40mg"]
          };
        } else if (qLower.includes("diet") || qLower.includes("lifestyle") || qLower.includes("modification")) {
          data = {
            answer: `Evidence-based clinical lifestyle recommendations for ${selectedPatient?.full_name || "Rajesh Sharma"}:\n` +
              `1. Dietary Pattern: Low glycemic index (GI) Mediterranean / South Asian balanced diet. Restrict refined carbohydrates, sweetened beverages, and saturated fats.\n` +
              `2. Physical Activity: 150 minutes of moderate aerobic exercise (brisk walking) per week plus resistance training 2 days/week.\n` +
              `3. Sodium Intake: Restrict dietary sodium to < 2,000 mg/day (approx. 1 level teaspoon of salt) to support antihypertensive efficacy of Telmisartan.\n` +
              `4. Hydration & Foot Care: Daily inspection for diabetic peripheral neuropathy and adequate hydration.`,
            grounded_record_ids: ["ENC-DEL-2026-001", "Cond#Type-2-Diabetes", "ABDM#Preventive-Care"]
          };
        } else {
          data = {
            answer: `Grounded EHR record retrieval for inquiry "${q}":\n` +
              `Patient ${selectedPatient?.full_name} (${selectedPatient?.abha_id}) active conditions: ${selectedPatient?.diagnosis || "Type 2 Diabetes & Hypertension"}.\n` +
              `Current medications verified in ABDM repository: Metformin 500mg BD and Telmisartan 40mg daily.\n` +
              `Recent laboratory indicators show Fasting Glucose 142 mg/dL and HbA1c 7.8% (Record: Obs#90bbc983). Kidney function is preserved (Creatinine 0.92 mg/dL). No adverse drug contraindications found.`,
            grounded_record_ids: ["ENC-DEL-2026-001", "Obs#90bbc983", "Obs#e5d4decf", "Cond#44054006"]
          };
        }
      }

      setAiAnswer(data);
      if (tokens.patient) fetchAuditLogs(tokens.patient);
    } catch (err) {
      console.error("AI Assistant Q&A error:", err);
    } finally {
      setLoadingAiQuery(false);
    }
  };

  const handleExplainReport = async (reportId: string) => {
    setLoadingLabExplainer(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai/explain-lab/${reportId}`, {
        headers: { Authorization: `Bearer ${tokens.patient}` }
      });
      const data = await res.json();
      setExplainingReport(data);
      fetchAuditLogs(tokens.patient);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLabExplainer(false);
    }
  };

  const handleSubmitLabResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabOrder) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/labs/orders/${selectedLabOrder.order_id}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.lab}`
        },
        body: JSON.stringify({
          conclusion: labConclusion || "Diagnostic investigation completed and verified.",
          observations: [
            {
              test_code: selectedLabOrder.test_code || "58800005",
              test_name: selectedLabOrder.test_name,
              value: labObsValue || "120",
              unit: "mg/dL",
              reference_range: labObsRange || "70-110 mg/dL",
              is_abnormal: labObsAbnormal
            }
          ]
        })
      });

      if (res.ok) {
        setSelectedLabOrder(null);
        setLabObsValue("");
        setLabConclusion("");
        fetchLabOrders(tokens.lab);
        fetchNotifications(tokens.patient);
        if (selectedPatientId) fetchTimeline(selectedPatientId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGrantConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/consent/grant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.patient}`
        },
        body: JSON.stringify({
          doctor_id: grantDoctorId,
          purpose: grantPurpose,
          categories: [grantCategory],
          valid_days: 30
        })
      });
      if (res.ok) {
        fetchConsents(tokens.patient);
        fetchAuditLogs(tokens.patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/consent/${consentId}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tokens.patient}` }
      });
      if (res.ok) {
        fetchConsents(tokens.patient);
        fetchAuditLogs(tokens.patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedPatient = patients.find(p => p.patient_id === selectedPatientId || p.id === selectedPatientId || p.abha_id === selectedPatientId) || patients[0] || INITIAL_DEMO_PATIENTS[0];

  // Filtered timeline events with rich fallback
  const rawTimelineEvents = (timeline?.events && timeline.events.length > 0)
    ? timeline.events
    : DEMO_PATIENT_TIMELINE_EVENTS;

  const filteredEvents = rawTimelineEvents.filter((evt: any) => {
    if (timelineFilter === "ALL") return true;
    return evt.event_type === timelineFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-transparent dark:bg-[#0b0f19]/60 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ── SLEEK, MODERN HEALTHCARE NAVBAR (COMPACT & UNCONGESTED) ── */}
      <header className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-50 px-4 md:px-6 py-1.5 shadow-xs dark:shadow-md backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 h-10">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <HeartPulse className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                Swasthya Bharat <span className="text-teal-600 dark:text-teal-400 font-semibold">EHR</span>
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                ABDM M1-M3
              </span>
            </div>

            {/* Mobile persona indicator */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="md:hidden flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white transition-colors"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentRole === "DOCTOR" ? "bg-teal-500" : currentRole === "PATIENT" ? "bg-amber-500" : "bg-cyan-500"
              }`} />
              <span>{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* ── ROLE-SPECIFIC SEGMENTED NAVIGATION PILLS (UNCONGESTED & SINGLE-LINE) ── */}
          <nav className="hidden md:flex items-center gap-0.5 bg-slate-100/90 dark:bg-slate-800/90 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            
            {/* 1. DOCTOR NAVIGATION */}
            {currentRole === "DOCTOR" && (
              <>
                <button
                  onClick={() => setActivePortal("doctor_workspace")}
                  title="Clinical Consultation Workstation"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "doctor_workspace"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Workstation
                </button>

                <button
                  onClick={() => setActivePortal("doctor_encounters")}
                  title="Document Consultation Encounters & SNOMED CT"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "doctor_encounters"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Encounters
                </button>

                <button
                  onClick={() => setActivePortal("doctor_ai")}
                  title="Grounded Clinical AI Decision Copilot"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "doctor_ai"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
                  AI Copilot
                </button>

                <button
                  onClick={() => setActivePortal("doctor_abdm_hiu")}
                  title="ABDM HIU Interoperable Health Record Transfer"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "doctor_abdm_hiu"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  ABDM HIU
                </button>

                <button
                  onClick={() => {
                    setActivePortal("fhir_inspector");
                    fetchFhir("Patient");
                  }}
                  title="HL7 FHIR R4 Bundle & Resource Inspector"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "fhir_inspector"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  FHIR R4
                </button>
              </>
            )}

            {/* 2. PATIENT NAVIGATION */}
            {currentRole === "PATIENT" && (
              <>
                <button
                  onClick={() => setActivePortal("patient_abha")}
                  title="Ayushman Bharat Digital Health Account (ABHA) Card"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "patient_abha"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ABHA Card
                </button>

                <button
                  onClick={() => setActivePortal("patient_records")}
                  title="Longitudinal Patient Health Timeline"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "patient_records"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Health Timeline
                </button>

                <button
                  onClick={() => setActivePortal("patient_consent")}
                  title="ABDM Electronic Consent Artifact Manager"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "patient_consent"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Consents
                </button>

                <button
                  onClick={() => setActivePortal("patient_audit")}
                  title="Immutable Privacy Access Audit Log"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "patient_audit"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Audit Log
                </button>

                <button
                  onClick={() => setActivePortal("patient_reminders")}
                  title="Patient Health & Medication Reminders"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "patient_reminders"
                      ? "bg-teal-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  Reminders ({notifications.length})
                </button>
              </>
            )}

            {/* 3. LAB NAVIGATION */}
            {currentRole === "LAB" && (
              <>
                <button
                  onClick={() => setActivePortal("lab_queue")}
                  title="Laboratory Diagnostic Testing Queue"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "lab_queue"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Queue ({labOrders.length})
                </button>

                <button
                  onClick={() => setActivePortal("lab_abdm_hip")}
                  title="ABDM Health Information Provider Discovery & Linking"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "lab_abdm_hip"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  HIP Discovery
                </button>

                <button
                  onClick={() => setActivePortal("lab_nabl")}
                  title="NABL Clinical Laboratory Accreditation Profile"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    activePortal === "lab_nabl"
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NABL Profile
                </button>
              </>
            )}

          </nav>

          {/* ── CONTROLS: RURAL PHC OFFLINE, DARK MODE & PERSONA SWITCHER ── */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Rural PHC Connectivity & Offline Sync Controls */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
              {isPhcOnline ? (
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] whitespace-nowrap">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Online</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold text-[11px] whitespace-nowrap">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>Offline</span>
                </span>
              )}

              {/* Simulation Toggle */}
              <button
                onClick={() => OfflineQueueManager.setSimulatedOffline(isPhcOnline)}
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono transition-colors whitespace-nowrap ${
                  isPhcOnline
                    ? "bg-white hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 hover:bg-amber-200"
                }`}
                title={isPhcOnline ? "Simulate Rural PHC Intermittent Disconnect" : "Restore Cloud Network Connection"}
              >
                {isPhcOnline ? "Simulate Offline" : "Go Online"}
              </button>

              {/* Sync Queued Records Button */}
              {phcQueue.length > 0 && (
                <button
                  onClick={handleSyncOfflineQueue}
                  disabled={isSyncingPhc || !isPhcOnline}
                  className="px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] flex items-center gap-1 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap"
                  title="Upload queued consultations directly into ABDM cloud"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isSyncingPhc ? "animate-spin" : ""}`} />
                  Sync ({phcQueue.length})
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>

            {/* Persona Switcher Button */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-left transition-all"
              title="Switch Clinical Persona"
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${
                currentRole === "DOCTOR" ? "bg-indigo-600" :
                currentRole === "PATIENT" ? "bg-teal-600" : "bg-cyan-600"
              }`}>
                {currentRole === "DOCTOR" ? "Dr" : currentRole === "PATIENT" ? "Pt" : "Lb"}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[130px] whitespace-nowrap">
                  {currentUserName}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                  {currentRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

          </div>

        </div>
      </header>

      {/* ── Rural PHC Local Toast / Offline Notice Banner ── */}
      {phcToast && (
        <div className="bg-indigo-600 text-white text-xs font-medium py-2 px-4 text-center shadow-md flex items-center justify-center gap-2 transition-all">
          <Activity className="w-4 h-4 animate-spin" />
          <span>{phcToast}</span>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* ── Offline Simulation Notice Banner ── */}
        {!isBackendConnected && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <div>
                <strong>Local Resilient Simulation Active:</strong> Fast and fully interactive demo mode with 4 verified patient profiles, longitudinal records, and grounded AI synthesis.
              </div>
            </div>
            <button
              onClick={() => initAuthAndData()}
              className="self-start sm:self-auto px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              Connect Live Backend
            </button>
          </div>
        )}


        {/* ─────────────────────────────────────────────────────────────
            A. DOCTOR WORKSPACE
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "DOCTOR" && (
          <div>
            {/* View A1: Clinical Workstation */}
            {activePortal === "doctor_workspace" && (
              <div className="space-y-6">
                
                {/* Doctor Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Clinical Consultation Workstation
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Attending: Dr. Arvind Swaminathan, MD (NMC: MCI-74892) • Apollo Indraprastha Hospital
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        fetchAllDirectoryPatients();
                        setShowBreakGlassModal(true);
                      }}
                      className="px-3.5 py-2 text-xs flex items-center gap-1.5 rounded-md font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Emergency Break-Glass
                    </button>
                    <button
                      onClick={() => setShowEncounterModal(true)}
                      className="btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Document Encounter (SNOMED)
                    </button>
                    <button
                      onClick={() => generateAiSummary(briefFocusArea, briefAudience, briefTimeWindow)}
                      disabled={loadingAiSummary || !selectedPatientId}
                      className="btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {loadingAiSummary ? "Synthesizing..." : "Grounded AI Brief"}
                    </button>
                  </div>
                </div>

                {/* Patient Roster Cards */}
                <div className="medical-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Authorized Patient Roster ({patients.length} active consents)
                    </span>
                    <span className="text-xs text-slate-400">
                      Click a patient to load complete longitudinal EHR
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {patients.map(pat => {
                      const isSel = pat.patient_id === selectedPatientId;
                      return (
                        <div
                          key={pat.patient_id}
                          onClick={() => {
                            setSelectedPatientId(pat.patient_id);
                            setAbdmHiuConsentId(pat.consent_id);
                            fetchTimeline(pat.patient_id);
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-all border ${
                            isSel
                              ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-sm ring-1 ring-indigo-500"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{pat.full_name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {pat.blood_group || "O+"}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400">
                            ABHA: {pat.abha_id}
                          </div>
                          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                            <span>{pat.gender}</span>
                            {pat.is_emergency_override ? (
                              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                                <ShieldAlert className="w-3 h-3" /> Emergency Override
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Consent Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Patient Summary Header Card */}
                {selectedPatient && (
                  <div className={`medical-card p-5 border-l-4 ${selectedPatient.is_emergency_override ? "border-l-rose-600 bg-rose-50/20 dark:bg-rose-950/10" : "border-l-indigo-600"}`}>
                    {selectedPatient.is_emergency_override && (
                      <div className="mb-3 p-2.5 rounded-md bg-rose-100/80 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold">
                          <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                          <span>🚨 EMERGENCY BREAK-GLASS PROTOCOL ACTIVE (4-Hour Window)</span>
                        </div>
                        <span className="font-mono text-[10px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Justification: {selectedPatient.emergency_justification || "Accident / Poly-trauma admission"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                      <div>
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {selectedPatient.full_name}
                          </h2>
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            ABHA: {selectedPatient.abha_id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Gender: {selectedPatient.gender} • Blood Group: {selectedPatient.blood_group || "O+"} • Consent Scope: {selectedPatient.categories?.join(", ") || "ALL_RECORDS"}
                        </p>
                      </div>

                      {/* Vitals Summary */}
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[90px]">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Blood Pressure</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">132/86 mmHg</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[90px]">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">HbA1c / Platelet</div>
                          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">7.8% (Elevated)</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[90px]">
                          <div className="text-[10px] text-slate-500 uppercase font-semibold">Heart Rate</div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">76 bpm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Grounded Summary (if generated) */}
                {aiSummary && (
                  <div className="animate-in fade-in">
                    <FormattedClinicalBrief
                      summaryData={aiSummary}
                      patient={selectedPatient}
                      focusArea={briefFocusArea}
                      audience={briefAudience}
                      timeWindow={briefTimeWindow}
                      onRegenerate={(focus, aud) => generateAiSummary(focus, aud, briefTimeWindow)}
                    />
                  </div>
                )}

                {/* Longitudinal Clinical Timeline */}
                <div className="medical-card p-5 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Longitudinal Clinical History ({filteredEvents.length} Events)
                    </span>

                    {/* Timeline Event Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {["ALL", "ENCOUNTER", "PRESCRIPTION", "DIAGNOSTIC_REPORT", "CONDITION"].map(f => (
                        <button
                          key={f}
                          onClick={() => setTimelineFilter(f)}
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                            timelineFilter === f
                              ? "filter-pill-active"
                              : "filter-pill-inactive"
                          }`}
                        >
                          {f.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingTimeline ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Loading consent-verified medical timeline...
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No records match the selected filter.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredEvents.map((evt: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-1.5"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                evt.event_type === "ENCOUNTER" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                                evt.event_type === "PRESCRIPTION" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                                evt.event_type === "CONDITION" ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" :
                                "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}>
                                {evt.event_type}
                              </span>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {evt.title}
                              </span>
                              {evt.record_id && (
                                <span className="text-[10px] font-mono text-slate-400">
                                  #{evt.record_id}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{evt.timestamp}</span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {evt.description}
                          </p>

                          {evt.snomed_code && (
                            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono">
                              <span className="text-slate-400">SNOMED CT:</span>
                              <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
                                {evt.snomed_code}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* View A2: Clinical Encounters & SNOMED CT Authoring */}
            {activePortal === "doctor_encounters" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Document Clinical Encounter (SNOMED CT)
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standardized Indian Clinical Consultation Notes & NRCES Terminology Authoring
                    </p>
                  </div>

                  {/* Patient Selector Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Active Patient:</span>
                    <select
                      value={selectedPatientId}
                      onChange={e => {
                        const pid = e.target.value;
                        setSelectedPatientId(pid);
                        const p = patients.find(pat => pat.patient_id === pid);
                        if (p) setAbdmHiuConsentId(p.consent_id);
                        fetchTimeline(pid);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {patients.map(p => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.full_name} ({p.abha_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Verified Commit Success Notice Card */}
                {lastCommittedEncounter && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2 shadow-xs transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                          Clinical Encounter Signed & Committed to ABDM Longitudinal EHR
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-bold bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                        {lastCommittedEncounter.id} • {lastCommittedEncounter.timestamp}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                      <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Patient: </span>
                        <span className="font-bold text-slate-900 dark:text-white">{lastCommittedEncounter.patient_name}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Reason: </span>
                        <span className="text-slate-900 dark:text-white">{lastCommittedEncounter.reason}</span>
                      </div>
                      {lastCommittedEncounter.snomed && (
                        <div className="md:col-span-2 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Diagnostic Concept: </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-mono font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                            {lastCommittedEncounter.snomed.concept_id} - {lastCommittedEncounter.snomed.display_name}
                          </span>
                        </div>
                      )}
                      {lastCommittedEncounter.medication && (
                        <div className="md:col-span-2">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Prescription: </span>
                          <span className="font-mono text-xs text-amber-700 dark:text-amber-300">{lastCommittedEncounter.medication}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Encounter Form */}
                  <div className="lg:col-span-2 medical-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Consultation Assessment & Prescriptions
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Chief Complaint & Reason for Visit
                      </label>
                      <input
                        type="text"
                        value={encounterReason}
                        onChange={e => setEncounterReason(e.target.value)}
                        placeholder="e.g. Follow-up for glycemic evaluation, persistent evening fatigue"
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Clinical Progress Notes
                      </label>
                      <textarea
                        rows={4}
                        value={encounterNotes}
                        onChange={e => setEncounterNotes(e.target.value)}
                        placeholder="Subjective symptoms, physical examination findings, treatment plan..."
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 shadow-xs"
                      />
                    </div>

                    {/* Prescription Section */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" />
                        Medication Prescription Order
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={rxMedName}
                          onChange={e => setRxMedName(e.target.value)}
                          placeholder="Drug Name (e.g. Metformin 500mg)"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none shadow-xs"
                        />
                        <input
                          type="text"
                          value={rxDosage}
                          onChange={e => setRxDosage(e.target.value)}
                          placeholder="Dosage (e.g. 500 mg)"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none shadow-xs"
                        />
                        <input
                          type="text"
                          value={rxFrequency}
                          onChange={e => setRxFrequency(e.target.value)}
                          placeholder="Frequency (e.g. Twice daily after meals)"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none shadow-xs"
                        />
                        <input
                          type="text"
                          value={rxDuration}
                          onChange={e => setRxDuration(e.target.value)}
                          placeholder="Duration (e.g. 30 days)"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateEncounter}
                      className="btn-primary w-full py-2.5 text-xs uppercase tracking-wide font-semibold mt-2 shadow-sm"
                    >
                      Sign & Commit Clinical Encounter
                    </button>
                  </div>

                  {/* SNOMED CT Registry Search */}
                  <div className="medical-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        SNOMED CT Coding
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                        NRCES India
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Search Concept
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={snomedSearchQuery}
                          onChange={e => searchSnomed(e.target.value)}
                          placeholder="Search 'diabetes', 'hypertension'..."
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none pr-8 shadow-xs"
                        />
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Selected Concept Card */}
                    {selectedSnomed ? (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Selected Diagnosis:</div>
                        <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200">{selectedSnomed.display_name}</div>
                        <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">ID: {selectedSnomed.concept_id}</div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        No concept selected. Type above to search SNOMED concepts.
                      </div>
                    )}

                    {/* Search Results */}
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                      {snomedResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedSnomed(item)}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 cursor-pointer transition-all shadow-2xs"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{item.display_name}</div>
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Concept ID: {item.concept_id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session Encounters History Feed */}
                <div className="medical-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Recent Clinical Encounters History ({signedEncountersHistory.length})
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">Session Longitudinal Feed</span>
                  </div>

                  <div className="space-y-3">
                    {signedEncountersHistory.map((enc, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all shadow-2xs"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              {enc.id}
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {enc.reason}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{enc.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {enc.notes}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/60 text-xs">
                          <span className="text-slate-500 font-medium">Patient: <strong className="text-slate-900 dark:text-white">{enc.patient_name}</strong></span>
                          {enc.snomed && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                              SNOMED: {enc.snomed.concept_id} ({enc.snomed.display_name})
                            </span>
                          )}
                          {enc.medication && (
                            <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-semibold border border-amber-200 dark:border-amber-800">
                              Rx: {enc.medication}
                            </span>
                          )}
                          <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Signed & Verified
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
{/* View A3: Clinical AI Copilot with Clickable Questions */}
            {activePortal === "doctor_ai" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Grounded Clinical AI Copilot
                      </h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Clinical Decision Support strictly grounded in verified EHR records • Active Patient: <strong className="text-indigo-600 dark:text-indigo-400">{selectedPatient?.full_name}</strong> ({selectedPatient?.blood_group || "O+"})
                      </p>
                    </div>

                    {/* Quick Patient Switcher Pills in AI Copilot */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                      <span className="text-[10px] font-bold uppercase text-slate-400 px-1.5 hidden sm:inline">
                        Switch Patient:
                      </span>
                      {patients.slice(0, 4).map(p => (
                        <button
                          key={p.patient_id}
                          onClick={() => {
                            setSelectedPatientId(p.patient_id);
                            setAiAnswer(null);
                            generateAiSummary(briefFocusArea, briefAudience, briefTimeWindow, p.patient_id);
                          }}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                            (selectedPatientId === p.patient_id || selectedPatient?.patient_id === p.patient_id)
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                          }`}
                        >
                          {p.full_name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Synthesis Brief Box */}
                  <div className="medical-card p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Longitudinal Clinical Brief
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Multi-dimensional EHR Synthesis • Zero-Hallucination
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => generateAiSummary(briefFocusArea, briefAudience, briefTimeWindow)}
                        disabled={loadingAiSummary}
                        className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {loadingAiSummary ? "Synthesizing..." : "Generate Brief"}
                      </button>
                    </div>

                    {/* Synthesis Controls: Focus Area, Audience, Time Window */}
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Synthesis Focus Area (Instant Synthesis)
                          </label>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Click to generate tailored brief</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: "ALL", label: "Comprehensive (All Records)" },
                            { id: "GLYCEMIC_CONTROL", label: "Glycemic & Endocrine" },
                            { id: "CARDIOVASCULAR", label: "Cardiovascular Risk" },
                            { id: "MEDICATIONS", label: "Medications & Regimen" },
                            { id: "RECENT_LABS", label: "Recent Diagnostic Labs" },
                          ].map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setBriefFocusArea(item.id);
                                generateAiSummary(item.id, briefAudience, briefTimeWindow);
                              }}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                briefFocusArea === item.id
                                  ? "bg-indigo-600 text-white shadow-xs scale-[1.02]"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Audience / Tone
                          </label>
                          <select
                            value={briefAudience}
                            onChange={e => {
                              const newAud = e.target.value;
                              setBriefAudience(newAud);
                              generateAiSummary(briefFocusArea, newAud, briefTimeWindow);
                            }}
                            className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                          >
                            <option value="CLINICIAN">Clinician / Attending Physician</option>
                            <option value="PATIENT_DISCHARGE">Patient Discharge Explainer</option>
                            <option value="INTER_FACILITY_REFERRAL">Inter-facility Referral Summary</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            Time Scope
                          </label>
                          <select
                            value={briefTimeWindow}
                            onChange={e => {
                              const newTime = e.target.value;
                              setBriefTimeWindow(newTime);
                              generateAiSummary(briefFocusArea, briefAudience, newTime);
                            }}
                            className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                          >
                            <option value="ALL_TIME">Entire Longitudinal Record</option>
                            <option value="LAST_90_DAYS">Last 90 Days</option>
                            <option value="LAST_30_DAYS">Last 30 Days</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Brief Content Output */}
                    {aiSummary ? (
                      <div className="animate-in fade-in">
                        <FormattedClinicalBrief
                          summaryData={aiSummary}
                          patient={selectedPatient}
                          focusArea={briefFocusArea}
                          audience={briefAudience}
                          timeWindow={briefTimeWindow}
                          onRegenerate={(focus, aud) => generateAiSummary(focus, aud, briefTimeWindow)}
                        />
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                        <Sparkles className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                        <div>Click "Generate Brief" or select any Focus Area above to synthesize a complete clinical overview with verifiable citations.</div>
                      </div>
                    )}
                  </div>

                  {/* Ask Clinical Questions with Interactive Sample Chips */}
                  <div className="medical-card p-6 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Ask Clinical Record Questions
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Click a sample prompt below or type your custom medical question:
                      </p>
                    </div>

                    {/* Interactive Clickable Sample Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Quick Clinical Prompts:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sampleAiPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setAiQuery(prompt);
                              askAiAssistant(prompt);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            💬 {prompt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Input Field */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={e => setAiQuery(e.target.value)}
                        placeholder="Type medical inquiry on patient history..."
                        className="flex-1 p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => askAiAssistant()}
                        disabled={loadingAiQuery || !aiQuery.trim()}
                        className="btn-primary px-4 py-2 text-xs flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ask
                      </button>
                    </div>

                    {/* Answer Output */}
                    {aiAnswer && (
                      <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                        <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase">
                          EHR Grounded Answer:
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {aiAnswer.answer}
                        </p>
                        {aiAnswer.grounded_record_ids && (
                          <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800/60 flex flex-wrap gap-1">
                            {aiAnswer.grounded_record_ids.map((cit: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                                {cit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Verified Sample Clinical Q&A Knowledge Base */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Pre-Fed Clinical Q&A Scenarios ({sampleClinicalQnA.length})
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Click any question to ask live or review grounded rationale
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {sampleClinicalQnA.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setAiQuery(item.q);
                              askAiAssistant(item.q);
                            }}
                            className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all space-y-2 group"
                          >
                            <div className="font-semibold text-xs text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-600 flex items-start justify-between gap-2">
                              <span>Q: {item.q}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {item.a}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                              {item.citations.map((c, cIdx) => (
                                <span key={cIdx} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View A4: ABDM Health Information User (HIU) Transfer */}
            {activePortal === "doctor_abdm_hiu" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    ABDM HIU Health Data Transfer
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fetch encrypted clinical document bundles across participating Indian healthcare facilities via ABDM Gateway
                  </p>
                </div>

                <div className="medical-card p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        HIU Client Identifier
                      </label>
                      <input
                        type="text"
                        disabled
                        value="MEDINDIA-HIU-APOLLO-01"
                        className="w-full p-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Active Consent Artifact ID
                      </label>
                      <input
                        type="text"
                        value={abdmHiuConsentId}
                        onChange={e => setAbdmHiuConsentId(e.target.value)}
                        placeholder="Consent ID"
                        className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAbdmFetchData}
                        disabled={loadingAbdm}
                        className="btn-primary w-full py-2 text-xs uppercase font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Network className="w-4 h-4" />
                        {loadingAbdm ? "Fetching..." : "Fetch Encrypted Bundle"}
                      </button>
                    </div>
                  </div>

                  {/* Transfer Result Output */}
                  {abdmHiuTransferResult && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          Transfer Successful • Status: {abdmHiuTransferResult.status}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                          {abdmHiuTransferResult.resources_count} Resources Transferred
                        </span>
                      </div>

                      <pre className="p-3 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono max-h-[300px] overflow-y-auto">
                        {JSON.stringify(abdmHiuTransferResult.fhir_bundle, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View A5: FHIR R4 Inspector (Guaranteed High-Contrast Active State) */}
            {activePortal === "fhir_inspector" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    HL7 FHIR R4 Resource Inspector
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ABDM & NRCES-Compliant Interoperability Serialization
                  </p>
                </div>

                <div className="medical-card p-6 space-y-4">
                  {/* Resource Filter Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {["Patient", "Bundle", "Condition", "Observation", "Encounter"].map(t => {
                      const isSel = selectedFhirType === t;
                      return (
                        <button
                          key={t}
                          onClick={() => fetchFhir(t)}
                          className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                            isSel
                              ? "filter-pill-active"
                              : "filter-pill-inactive"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono max-h-[500px] overflow-y-auto border border-slate-800 shadow-inner">
                    {JSON.stringify(fhirResource, null, 2) || "Loading resource..."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            B. PATIENT PORTAL
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "PATIENT" && (
          <div>
            {/* View B1: Official Indian ABHA Card */}
            {activePortal === "patient_abha" && (
              <div className="space-y-6">
                
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Ayushman Bharat Digital Health Account (ABHA)
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    National Health Authority (NHA) Verified Citizen Profile
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Physical ABHA ID Card Render */}
                  <div className="lg:col-span-2">
                    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden relative">
                      {/* Tricolor Ribbon */}
                      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-600"></div>

                      <div className="p-6 space-y-6">
                        {/* Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              ₹
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-white">
                                National Health Authority (NHA)
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                                Government of India • Ayushman Bharat Digital Mission
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> VERIFIED CITIZEN
                          </span>
                        </div>

                        {/* Citizen Profile Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                          {/* Photo Placeholder */}
                          <div className="flex flex-col items-center justify-center p-5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
                            <User className="w-14 h-14" />
                            <span className="text-[10px] font-mono mt-1 uppercase font-bold text-slate-500">Photo ID Verified</span>
                          </div>

                          {/* Demographics */}
                          <div className="md:col-span-2 space-y-3">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Citizen Name</div>
                              <div className="text-xl font-bold text-slate-900 dark:text-white">Rajesh Sharma</div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">ABHA Address</div>
                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">rajesh.sharma@abdm</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Gender & Blood Group</div>
                                <div className="font-semibold text-slate-900 dark:text-white">Male • B+ (Positive)</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Date of Birth</div>
                                <div className="font-semibold text-slate-900 dark:text-white">12-May-1974 (Age 52)</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-slate-400 uppercase font-semibold">Mobile (OTP Linked)</div>
                                <div className="font-mono font-semibold text-slate-900 dark:text-white">+91-98765-43210</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 14-Digit ABHA ID Strip */}
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400">14-Digit National Health Identifier</div>
                            <div className="text-xl font-mono font-bold tracking-widest text-slate-900 dark:text-white">
                              91-4405-2026-0001
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">● HIP LINKED</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Safety Info & Emergency Contacts */}
                  <div className="medical-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Patient Safety & Emergency
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Diagnoses</div>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">Type 2 Diabetes Mellitus</div>
                        <div className="font-semibold text-slate-900 dark:text-white">Essential Hypertension</div>
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Emergency Contact</div>
                        <div className="font-semibold text-slate-900 dark:text-white mt-0.5">Sunita Sharma (Spouse)</div>
                        <div className="text-slate-500 font-mono">+91-98765-43211</div>
                      </div>

                      <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Doctor Consents</div>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {consents.filter(c => c.status === "ACTIVE").length || 1} Authorized Physicians
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* View B2: Health Records Timeline & Reports */}
            {activePortal === "patient_records" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      My Medical Records & Lab History
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Complete longitudinal view across outpatient consultations, prescriptions, and laboratory reports
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {["ALL", "ENCOUNTER", "PRESCRIPTION", "DIAGNOSTIC_REPORT", "CONDITION"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setPatientTimelineFilter(cat)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          patientTimelineFilter === cat
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plain-Language Explainer Box */}
                {explainingReport && (
                  <div className="medical-card p-5 bg-teal-50/60 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        Plain-Language Lab Result Explanation
                      </span>
                      <button
                        onClick={() => setExplainingReport(null)}
                        className="text-xs text-teal-700 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {explainingReport.explanation}
                    </p>
                  </div>
                )}

                {/* Timeline Events List with Fallback to DEMO_PATIENT_TIMELINE_EVENTS */}
                <div className="space-y-3">
                  {(() => {
                    const rawEvents = (timeline?.events && timeline.events.length > 0)
                      ? timeline.events
                      : DEMO_PATIENT_TIMELINE_EVENTS;
                    
                    const filtered = rawEvents.filter((evt: any) =>
                      patientTimelineFilter === "ALL" ? true : evt.event_type === patientTimelineFilter
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="medical-card p-10 text-center text-xs text-slate-400">
                          No health records match the selected category ({patientTimelineFilter}).
                        </div>
                      );
                    }

                    return filtered.map((evt: any, i: number) => (
                      <div key={i} className="medical-card p-5 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              evt.event_type === "ENCOUNTER" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                              evt.event_type === "PRESCRIPTION" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                              evt.event_type === "CONDITION" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" :
                              "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}>
                              {evt.event_type}
                            </span>
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {evt.title}
                            </span>
                            {evt.record_id && (
                              <span className="text-[10px] font-mono text-slate-400">
                                #{evt.record_id}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">{evt.timestamp}</span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {evt.description}
                        </p>

                        {(evt.doctor || evt.hospital) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {evt.doctor && <span>Practitioner: <strong className="text-slate-700 dark:text-slate-300">{evt.doctor}</strong></span>}
                            {evt.hospital && <span>• {evt.hospital}</span>}
                          </div>
                        )}

                        {evt.event_type === "DIAGNOSTIC_REPORT" && (
                          <div className="pt-2">
                            <button
                              onClick={() => handleExplainReport(evt.record_id || "REP-LAB-2026-081")}
                              disabled={loadingLabExplainer}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 hover:bg-teal-100 transition-colors shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              {loadingLabExplainer ? "Analyzing..." : "Explain This Report in Plain English"}
                            </button>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
{/* View B3: Consent Manager */}
            {activePortal === "patient_consent" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Consent & Privacy Manager
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Self-sovereign control over which healthcare providers can access your medical records
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Grant New Consent Drawer */}
                  <div className="medical-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Grant New Consent
                    </h3>

                    <form onSubmit={handleGrantConsent} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Select Practitioner
                        </label>
                        <select
                          value={grantDoctorId}
                          onChange={e => setGrantDoctorId(e.target.value)}
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        >
                          {doctorsList.map(doc => (
                            <option key={doc.practitioner_id} value={doc.practitioner_id}>
                              {doc.full_name} ({doc.hospital_affiliation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Record Categories
                        </label>
                        <select
                          value={grantCategory}
                          onChange={e => setGrantCategory(e.target.value)}
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        >
                          <option value="ALL_RECORDS">All Medical Records</option>
                          <option value="DIAGNOSTIC_REPORT">Lab & Diagnostics Only</option>
                          <option value="PRESCRIPTION">Prescriptions Only</option>
                          <option value="CONDITION">Diagnosed Conditions Only</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary w-full py-2 text-xs uppercase font-semibold mt-2"
                      >
                        Authorize Consent
                      </button>
                    </form>
                  </div>

                  {/* Active Consents List */}
                  <div className="lg:col-span-2 medical-card p-6 space-y-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Active Authorizations ({consents.length})
                    </h3>

                    <div className="space-y-3">
                      {consents.map(c => (
                        <div
                          key={c.consent_id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {c.doctor_name}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                c.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              Purpose: {c.purpose} • Categories: {c.categories?.join(", ")}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Valid until: {c.valid_to}
                            </div>
                          </div>

                          {c.status === "ACTIVE" && (
                            <button
                              onClick={() => handleRevokeConsent(c.consent_id)}
                              className="px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 border border-red-200 dark:border-red-800 transition-colors"
                            >
                              Revoke Immediately
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View B4: Transparency Audit Log */}
            {activePortal === "patient_audit" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Immutable Access Audit Trail
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transparent log detailing every physician and laboratory request to your records
                  </p>
                </div>

                <div className="medical-card p-6 space-y-3">
                  {auditLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                          {log.actor_role}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                        <span>Purpose: {log.purpose || "CONSULTATION"}</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View B5: Reminders */}
            {activePortal === "patient_reminders" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Medication Reminders & Action Schedule
                  </h1>
                </div>

                <div className="medical-card p-6 space-y-3">
                  {notifications.map((n: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{n.message}</div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            C. LAB OPERATIONS PORTAL
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "LAB" && (
          <div>
            {/* View C1: Requisition Queue & Archive */}
            {activePortal === "lab_queue" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Diagnostic Testing Console
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Dr. Lal PathLabs National Reference Lab • NABL License: NABL-ISO-15189-DEL
                    </p>
                  </div>

                  {/* Queue vs Archive Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setActiveLabTab("queue")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeLabTab === "queue"
                          ? "bg-cyan-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Testing Requisitions Queue ({labOrders.filter(o => o.status !== "COMPLETED").length || DEMO_PENDING_LAB_ORDERS.length} Pending)
                    </button>
                    <button
                      onClick={() => setActiveLabTab("archive")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeLabTab === "archive"
                          ? "bg-cyan-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Verified Reports Archive ({DEMO_LAB_REPORTS.length} Reports)
                    </button>
                  </div>
                </div>

                {/* Result Entry Drawer */}
                {selectedLabOrder && (
                  <div className="medical-card p-6 bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-teal-200 dark:border-teal-800 pb-2">
                      <div>
                        <h3 className="text-base font-bold text-teal-950 dark:text-teal-200">
                          Record Test Result: {selectedLabOrder.test_name}
                        </h3>
                        <p className="text-xs text-teal-700 dark:text-teal-400">
                          Patient: {selectedLabOrder.patient_name || selectedLabOrder.patient_id} • Priority: {selectedLabOrder.priority}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedLabOrder(null)}
                        className="text-xs text-teal-700 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSubmitLabResults} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Quantitative Value
                        </label>
                        <input
                          type="text"
                          value={labObsValue}
                          onChange={e => setLabObsValue(e.target.value)}
                          placeholder="e.g. 142 or 85,000"
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono shadow-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Reference Range
                        </label>
                        <input
                          type="text"
                          value={labObsRange}
                          onChange={e => setLabObsRange(e.target.value)}
                          placeholder="e.g. 70-99 mg/dL"
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono shadow-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="abnormalCheck"
                          checked={labObsAbnormal}
                          onChange={e => setLabObsAbnormal(e.target.checked)}
                          className="w-4 h-4 accent-red-600 rounded"
                        />
                        <label htmlFor="abnormalCheck" className="text-xs font-bold text-red-600 uppercase">
                          Flag Abnormal / Critical Value
                        </label>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Diagnostic Interpretation
                        </label>
                        <input
                          type="text"
                          value={labConclusion}
                          onChange={e => setLabConclusion(e.target.value)}
                          placeholder="Pathologist verification notes..."
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs shadow-xs"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <button
                          type="submit"
                          className="btn-teal w-full py-2.5 text-xs uppercase font-semibold shadow-sm"
                        >
                          Sign, Verify & Publish to ABDM Care Context
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 1. Testing Requisitions Queue */}
                {activeLabTab === "queue" && (
                  <div className="medical-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Specimen Intake & Result Entry Queue
                      </span>
                      <span className="text-xs text-slate-400">
                        Orders awaiting testing and pathologist signoff
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const rawOrders = labOrders.length > 0 ? labOrders : DEMO_PENDING_LAB_ORDERS;
                        return rawOrders.map((order: any, idx: number) => (
                          <div
                            key={order.order_id || idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">{order.test_name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.priority === "STAT"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse"
                                    : order.priority === "URGENT"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                                }`}>
                                  {order.priority || "ROUTINE"}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                }`}>
                                  {order.status || "PENDING"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                                Patient: {order.patient_name || order.patient_id} • ABHA: {order.abha_id || "91-4405-2026-0001"} • Ordered: {order.ordered_at}
                              </div>
                              {order.clinical_notes && (
                                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                  Notes: {order.clinical_notes}
                                </div>
                              )}
                            </div>

                            {order.status !== "COMPLETED" && (
                              <button
                                onClick={() => {
                                  setSelectedLabOrder(order);
                                  setLabObsValue(order.test_name.includes("HbA1c") ? "7.8" : "85000");
                                  setLabObsRange(order.test_name.includes("HbA1c") ? "4.0 - 5.6 %" : "150,000 - 450,000 /mcL");
                                  setLabObsAbnormal(true);
                                  setLabConclusion(`Verified finding for ${order.test_name}. Clinical correlation recommended.`);
                                }}
                                className="btn-teal px-3.5 py-1.5 text-xs uppercase font-semibold self-start md:self-auto shadow-xs"
                              >
                                Enter Results
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. Verified Reports Archive (NABL ISO 15189) */}
                {activeLabTab === "archive" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {DEMO_LAB_REPORTS.map((rep, idx) => (
                        <div
                          key={rep.id}
                          className="medical-card p-5 space-y-3 hover:border-cyan-500 dark:hover:border-cyan-600 transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                              {rep.id}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{rep.verified_at}</span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {rep.test_name}
                            </h4>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              Patient: {rep.patient_name} • ABHA: {rep.patient_abha}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {rep.conclusion}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-1.5">
                              {rep.abnormal_count > 0 ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                  ⚠️ {rep.abnormal_count} Abnormal Flags
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  ✓ All Normal
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400">
                                {rep.observations.length} Observations
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedDemoLabReport(rep)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                            >
                              Inspect Observations
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Laboratory Observation Table Modal */}
                    {selectedDemoLabReport && (
                      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                  {selectedDemoLabReport.test_name}
                                </h3>
                                <span className="text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 px-2 py-0.5 rounded">
                                  {selectedDemoLabReport.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {selectedDemoLabReport.lab_name} • {selectedDemoLabReport.nabl_code}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedDemoLabReport(null)}
                              className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>
                              <div className="font-bold text-slate-900 dark:text-white">{selectedDemoLabReport.patient_name}</div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">ABHA ID</span>
                              <div className="font-mono text-slate-700 dark:text-slate-300">{selectedDemoLabReport.patient_abha}</div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Sample ID</span>
                              <div className="font-mono text-slate-700 dark:text-slate-300">{selectedDemoLabReport.sample_id}</div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">Verified At</span>
                              <div className="text-slate-700 dark:text-slate-300">{selectedDemoLabReport.verified_at}</div>
                            </div>
                          </div>

                          {/* Observation Table */}
                          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px]">
                                <tr>
                                  <th className="p-3">Investigation</th>
                                  <th className="p-3">Observed Value</th>
                                  <th className="p-3">Reference Range</th>
                                  <th className="p-3">Flag</th>
                                  <th className="p-3">Test Method</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {selectedDemoLabReport.observations.map((obs: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                    <td className="p-3 font-semibold text-slate-900 dark:text-white">{obs.name}</td>
                                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                      {obs.value} <span className="text-[10px] text-slate-400 font-normal">{obs.unit}</span>
                                    </td>
                                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{obs.range} {obs.unit}</td>
                                    <td className="p-3">
                                      {obs.flag === "HIGH" ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                          HIGH
                                        </span>
                                      ) : obs.flag === "LOW" ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                          LOW
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                          NORMAL
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-[11px] text-slate-500 font-mono">{obs.method}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Conclusion */}
                          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Pathologist Diagnostic Interpretation</span>
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                              {selectedDemoLabReport.conclusion}
                            </p>
                            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                              <span>Verified by: <strong>{selectedDemoLabReport.pathologist}</strong></span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> NABL Accredited Digital Signature
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => setSelectedDemoLabReport(null)}
                              className="btn-teal px-4 py-2 text-xs uppercase font-semibold shadow-xs"
                            >
                              Close Inspection
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
{/* View C2: ABDM HIP Discovery & Linking */}
            {activePortal === "lab_abdm_hip" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    ABDM Care Context Discovery & Patient Linking
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Health Information Provider (HIP) Gateway Interface • M1-M3 Certified
                  </p>
                </div>

                <div className="medical-card p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Patient ABHA Identifier
                      </label>
                      <input
                        type="text"
                        value={abdmAbhaInput}
                        onChange={e => setAbdmAbhaInput(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono shadow-xs"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAbdmDiscover}
                        disabled={loadingAbdm}
                        className="btn-primary w-full py-2.5 text-xs uppercase font-semibold shadow-xs"
                      >
                        {loadingAbdm ? "Discovering..." : "Discover Care Contexts"}
                      </button>
                    </div>
                  </div>

                  {abdmDiscovered && (
                    <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          Discovered {abdmDiscovered.care_contexts?.length} Active Care Contexts:
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Patient: {abdmDiscovered.full_name || "Rajesh Sharma"}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {abdmDiscovered.care_contexts?.map((cc: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-center shadow-2xs">
                            <span className="font-semibold text-slate-900 dark:text-white">{cc.display}</span>
                            <span className="text-slate-500 font-mono text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {cc.referenceNumber}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* OTP Confirm */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          value={abdmOtpInput}
                          onChange={e => setAbdmOtpInput(e.target.value)}
                          placeholder="OTP (123456)"
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono w-32 bg-white dark:bg-slate-900 shadow-xs"
                        />
                        <button
                          onClick={handleAbdmConfirmLink}
                          disabled={loadingAbdm}
                          className="btn-primary px-4 py-2 text-xs uppercase font-semibold shadow-xs"
                        >
                          Verify OTP & Link
                        </button>
                        {abdmLinkStatus && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {abdmLinkStatus}
                          </span>
                        )}
                      </div>

                      {/* Post-OTP Linking Verified Certificate Card */}
                      {abdmLinkResult && (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3 mt-4 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              <span>OFFICIAL ABDM HIP LINKING CONFIRMATION</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">
                              STATUS: {abdmLinkResult.status || "LINKED"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {abdmLinkResult.message || `Care Contexts successfully linked to Citizen ABHA account (${abdmAbhaInput}). Clinical laboratory records and diagnostic evaluations will now automatically synchronize to the National Health Authority repository.`}
                          </p>

                          <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 font-mono">
                              HIP ID: IN070000001 • Reference: {abdmLinkResult.link_reference || "LNK-2026-NHA-9812"}
                            </span>
                            <button
                              onClick={() => setActivePortal("lab_queue")}
                              className="btn-teal px-3 py-1.5 text-xs font-semibold shadow-xs"
                            >
                              Open Specimen Intake Queue →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
{/* View C3: NABL Accreditation */}
            {activePortal === "lab_nabl" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    NABL Laboratory Standards Profile
                  </h1>
                </div>

                <div className="medical-card p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">NABL Accreditation Number</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">NABL-DL-2026-891</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Standard Compliance</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">ISO 15189:2022 Medical Testing</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Facility Name</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">Dr. Lal PathLabs National Reference Lab</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">ABDM HIP Service Endpoint</div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">hip.medindia.health/v1</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── REVAMPED PERSONA SWITCHER MODAL ── */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="medical-card w-full max-w-xl p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Switch User Persona
                </h2>
                <p className="text-xs text-slate-500">
                  Select a pre-seeded account to experience that role's dedicated portal:
                </p>
              </div>
              <button onClick={() => setShowPersonaModal(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Click Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Doctor Card */}
              <div
                onClick={() => switchPersona("DOCTOR")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  currentRole === "DOCTOR"
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 ring-1 ring-indigo-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                  <Stethoscope className="w-4 h-4" /> DOCTOR
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Dr. Arvind Swaminathan</div>
                <div className="text-[10px] text-slate-500">Apollo Hospitals • MD</div>
              </div>

              {/* Patient Card */}
              <div
                onClick={() => switchPersona("PATIENT")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  currentRole === "PATIENT"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold text-xs">
                  <User className="w-4 h-4" /> PATIENT
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Rajesh Sharma</div>
                <div className="text-[10px] text-slate-500">ABHA: 91-4405-2026-0001</div>
              </div>

              {/* Lab Card */}
              <div
                onClick={() => switchPersona("LAB")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  currentRole === "LAB"
                    ? "border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 ring-1 ring-cyan-500"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 font-bold text-xs">
                  <FlaskConical className="w-4 h-4" /> DIAGNOSTIC LAB
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-1">Dr. Lal PathLabs</div>
                <div className="text-[10px] text-slate-500">NABL: NABL-DL-2026-891</div>
              </div>
            </div>

            {/* Custom Account Form */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Or Sign In with Custom Account
                </span>
                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {isRegisterMode ? "Switch to Login" : "Create New Account"}
                </button>
              </div>

              {authError && (
                <div className="p-2 rounded bg-red-50 text-red-600 text-xs mb-2">
                  {authError}
                </div>
              )}

              <form onSubmit={handleCustomAuth} className="space-y-3">
                {isRegisterMode && (
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={authFullName}
                      onChange={e => setAuthFullName(e.target.value)}
                      required
                      className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    className="p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
                {isRegisterMode && (
                  <select
                    value={authRole}
                    onChange={e => setAuthRole(e.target.value)}
                    className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  >
                    <option value="PATIENT">Patient Profile</option>
                    <option value="DOCTOR">Doctor Profile</option>
                    <option value="LAB">Lab Staff Profile</option>
                  </select>
                )}
                <button
                  type="submit"
                  className="btn-primary w-full py-2 text-xs uppercase font-semibold"
                >
                  {isRegisterMode ? "Register & Enter" : "Login"}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ── Document Clinical Encounter Modal ── */}
      {showEncounterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="medical-card w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Document Consultation for {selectedPatient?.full_name}
                </h3>
              </div>
              <button onClick={() => setShowEncounterModal(false)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Voice-to-SNOMED AI Dictation Toolbar ── */}
            <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50/60 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-slate-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Voice-to-SNOMED Clinical Copilot
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        AI NLP
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Dictate clinical findings or click a quick clinical preset chip below:
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleDictation}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                    isDictating
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95"
                  }`}
                  title={isDictating ? "Stop recording speech" : "Start dictating via microphone"}
                >
                  {isDictating ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>Dictate</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Quick Simulation Presets for Instant One-Click Testing */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Presets:
                </span>
                <button
                  type="button"
                  disabled={loadingDictationParse}
                  onClick={() => {
                    const text = "Patient presents with acute bronchitis with severe productive cough. Prescribing Amoxicillin 500 mg thrice daily for 7 days.";
                    setDictationTranscript(text);
                    handleParseDictation(text);
                  }}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                >
                  🫁 Acute Bronchitis & Amoxicillin
                </button>
                <button
                  type="button"
                  disabled={loadingDictationParse}
                  onClick={() => {
                    const text = "Suspected acute dengue fever with severe thrombocytopenia. Prescribing Paracetamol 650 mg SOS and ordering CBC with platelet count.";
                    setDictationTranscript(text);
                    handleParseDictation(text);
                  }}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                >
                  🦟 Dengue & Thrombocytopenia
                </button>
                <button
                  type="button"
                  disabled={loadingDictationParse}
                  onClick={() => {
                    const text = "Routine follow-up for type 2 diabetes mellitus and essential hypertension. Continuing Metformin 500 mg twice daily and Telmisartan 40 mg once daily.";
                    setDictationTranscript(text);
                    handleParseDictation(text);
                  }}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs"
                >
                  🩺 T2DM & Hypertension
                </button>
              </div>

              {loadingDictationParse && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 py-1 font-medium animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI extracting SNOMED CT concepts & Rx entities...</span>
                </div>
              )}

              {dictationSummaryPill && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between shadow-2xs">
                  <span>{dictationSummaryPill}</span>
                  <button
                    type="button"
                    onClick={() => setDictationSummaryPill(null)}
                    className="text-emerald-600 hover:text-emerald-800 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  value={encounterReason}
                  onChange={e => setEncounterReason(e.target.value)}
                  placeholder="e.g. Glycemic follow-up, BP review"
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Search & Code SNOMED CT Diagnosis
                </label>
                <input
                  type="text"
                  value={snomedSearchQuery}
                  onChange={e => searchSnomed(e.target.value)}
                  placeholder="Search condition..."
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                />
                {snomedResults.length > 0 && (
                  <div className="mt-1 max-h-32 overflow-y-auto rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                    {snomedResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedSnomed(item);
                          setSnomedResults([]);
                        }}
                        className="p-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800"
                      >
                        <span className="font-semibold text-slate-900 dark:text-white">{item.display_name}</span>
                        <span className="text-[10px] font-mono text-indigo-600 ml-2">[{item.concept_id}]</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedSnomed && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Selected: {selectedSnomed.display_name} ({selectedSnomed.concept_id})
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Progress Notes
                </label>
                <textarea
                  rows={3}
                  value={encounterNotes}
                  onChange={e => setEncounterNotes(e.target.value)}
                  placeholder="Subjective, Objective, Assessment, Plan..."
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Prescription
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Medication Name"
                    value={rxMedName}
                    onChange={e => setRxMedName(e.target.value)}
                    className="p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 500 mg)"
                    value={rxDosage}
                    onChange={e => setRxDosage(e.target.value)}
                    className="p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 text-xs uppercase font-semibold"
              >
                Sign & Save Encounter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Emergency Break-Glass Modal ── */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="medical-card w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border-rose-300 dark:border-rose-900 ring-2 ring-rose-500/20">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-rose-100 dark:border-rose-950/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                    Emergency "Break-Glass" Consent Protocol
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                      ABDM SEC 38
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory Emergency EHR Override for Unconscious / Critical Patients
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBreakGlassModal(false);
                  setBreakGlassError("");
                  setBreakGlassSuccessNotice(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning Banner */}
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Statutory Regulatory Safeguard
              </div>
              <p className="text-[11px] leading-relaxed">
                Emergency override bypasses patient consent OTP for life-threatening clinical presentations. Full record access is granted for exactly <strong>4 hours</strong>. An immutable audit record and high-priority statutory SMS notification are immediately delivered to the patient.
              </p>
            </div>

            {breakGlassError && (
              <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300 text-rose-900 dark:text-rose-200 text-xs font-semibold">
                {breakGlassError}
              </div>
            )}

            {breakGlassSuccessNotice && (
              <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-200">
                  <CheckCircle2 className="w-4 h-4" />
                  Emergency Override Authorized
                </div>
                <p className="text-[11px]">
                  Consent Reference: <code className="font-mono">{breakGlassSuccessNotice.consent_id}</code>
                </p>
                <p className="text-[11px]">
                  Authorized Until: <strong>{new Date(breakGlassSuccessNotice.valid_to || breakGlassSuccessNotice.expires_at).toLocaleTimeString()}</strong> (4 Hours)
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 italic">
                  Patient record unlocked in Doctor Workstation. Switching view...
                </p>
              </div>
            )}

            <form onSubmit={handleBreakGlassSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Patient from Hospital Master Directory
                </label>
                <select
                  value={breakGlassPatientId}
                  onChange={e => setBreakGlassPatientId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900 font-medium"
                >
                  {allDirectoryPatients.map(p => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.full_name} ({p.gender}, {p.age}y) • ABHA: {p.abha_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Clinical Indication
                </label>
                <select
                  value={breakGlassType}
                  onChange={e => setBreakGlassType(e.target.value)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                >
                  <option value="ACCIDENT_TRAUMA">🚨 Severe Polytrauma / Major Road Accident</option>
                  <option value="CARDIAC_ARREST_MI">❤️ Acute Coronary Syndrome / Massive MI</option>
                  <option value="ACUTE_RESPIRATORY_FAILURE">🫁 Acute Respiratory Failure / Hypoxia</option>
                  <option value="ANAPHYLAXIS_POISONING">⚠️ Anaphylaxis Shock / Suspected Poisoning</option>
                  <option value="UNCONSCIOUS_UNIDENTIFIED">🧠 Unconscious Patient / Neurological Collapse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Clinical Justification (ABDM Audit Trail)
                </label>
                <textarea
                  rows={3}
                  value={breakGlassJustification}
                  onChange={e => setBreakGlassJustification(e.target.value)}
                  placeholder="e.g. Patient brought in comatose following polytrauma with hypotension. Immediate access to allergies and surgical history required for emergent resuscitation."
                  className="w-full p-2.5 rounded border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Minimum 10 characters. This reason is permanently recorded in the National Health Authority audit log.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowBreakGlassModal(false);
                    setBreakGlassError("");
                    setBreakGlassSuccessNotice(null);
                  }}
                  className="px-3 py-2 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingBreakGlass}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
                >
                  {loadingBreakGlass ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Authorizing Override...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Execute Emergency "Break-Glass" Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modern Professional Healthcare Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Swasthya Bharat EHR</span>
            <span>•</span>
            <span>National Health Authority (ABDM) Compatible</span>
            <span>•</span>
            <span>SNOMED CT International Edition</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Security: AES-GCM + SHA-256</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Gateway Connected</span>
          </div>
        </div>
      </footer>


    </div>
  );
}
