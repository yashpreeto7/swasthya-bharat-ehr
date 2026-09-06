"""
execution/apply_ui_ux_revamp.py
Deterministic Python script to apply the comprehensive UI/UX Pro Max upgrade to frontend/src/app/page.tsx:
1. Sleek Modern Healthcare Navbar with Capsule Segmented Controls & High Contrast
2. Doctor Encounter Signing Verification Card & Session History Feed
3. Grounded Clinical AI Copilot Left-Side Revamp (Clinical Synthesis Console with Focus Areas, Perspectives & Actions)
4. Patient Health Timeline Rich Data, Fallbacks & Interactive Category Filters
5. Lab Portal Demo Lab Reports Archive with Full Observation Tables & Reference Ranges
6. Lab Portal ABDM HIP Post-OTP Linking Certificate Card & Linked Care Contexts Table
"""

import os
import shutil

TARGET_FILE = os.path.abspath("frontend/src/app/page.tsx")
BACKUP_FILE = os.path.abspath("frontend/src/app/page.tsx.bak")

def run():
    print(f"Loading {TARGET_FILE}...")
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    # Create backup
    shutil.copyfile(TARGET_FILE, BACKUP_FILE)
    print(f"Created backup at {BACKUP_FILE}")

    # -------------------------------------------------------------
    # 1. State Additions
    # -------------------------------------------------------------
    old_state_target = """  const [lastCommittedEncounter, setLastCommittedEncounter] = useState<any>(null);"""
    new_state_content = """  const [lastCommittedEncounter, setLastCommittedEncounter] = useState<any>(null);
  const [signedEncountersHistory, setSignedEncountersHistory] = useState<any[]>([]);
  const [activeLabTab, setActiveLabTab] = useState<"queue" | "archive">("queue");
  const [selectedDemoLabReport, setSelectedDemoLabReport] = useState<any>(null);
  const [patientTimelineFilter, setPatientTimelineFilter] = useState<string>("ALL");
  const [copiedAiBrief, setCopiedAiBrief] = useState(false);"""

    if old_state_target in content:
        content = content.replace(old_state_target, new_state_content, 1)
        print("Updated State Declarations.")
    else:
        print("WARN: old_state_target not found!")

    # -------------------------------------------------------------
    # 2. Update handleCreateEncounter to store rich encounter & update history
    # -------------------------------------------------------------
    old_encounter_handler = """      if (res.ok) {
        const savedData = await res.json();
        setLastCommittedEncounter({
          id: savedData.encounter_id || `ENC-${Date.now().toString().slice(-6)}`,
          patient_name: selectedPatient?.full_name || "Patient",
          reason: payload.reason,
          notes: payload.clinical_notes,
          snomed: selectedSnomed,
          medication: rxMedName ? `${rxMedName} (${rxDosage}, ${rxFrequency}, ${rxDuration})` : null,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        });
        setShowEncounterModal(false);
        setEncounterReason("");
        setEncounterNotes("");
        setSelectedSnomed(null);
        setRxMedName("");
        setDictationSummaryPill(null);
        fetchTimeline(selectedPatientId);
        if (tokens.patient) {
          fetchAuditLogs(tokens.patient);
          fetchPatientTimeline(tokens.patient);
        }
      }"""

    new_encounter_handler = """      if (res.ok) {
        const savedData = await res.json();
        const encId = savedData.encounter_id || `ENC-2026-${Date.now().toString().slice(-5)}`;
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        const committedRecord = {
          id: encId,
          record_id: encId,
          patient_id: selectedPatientId,
          patient_name: selectedPatient?.full_name || "Rajesh Sharma",
          patient_abha: selectedPatient?.abha_id || "91-4405-2026-0001",
          doctor_name: currentUserName || "Dr. Arvind Swaminathan",
          doctor_qualification: "MD, Internal Medicine • NMC: MCI-74892",
          facility: "Apollo Indraprastha Hospital, New Delhi",
          reason: payload.reason,
          notes: payload.clinical_notes,
          snomed: selectedSnomed,
          medication: rxMedName ? `${rxMedName} (${rxDosage}, ${rxFrequency}, ${rxDuration})` : null,
          timestamp: `${formattedDate}, ${formattedTime}`,
          raw_time: formattedTime,
          raw_date: formattedDate,
          signature_hash: `SHA256-NRCES-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        };

        setLastCommittedEncounter(committedRecord);
        setSignedEncountersHistory(prev => [committedRecord, ...prev]);

        // Optimistically prepend to timeline.events so it immediately displays in the Doctor timeline!
        setTimeline((prev: any) => {
          const newEvent = {
            id: encId,
            record_id: encId,
            event_type: "ENCOUNTER",
            type: "ENCOUNTER",
            title: `Consultation: ${payload.reason}`,
            timestamp: committedRecord.timestamp,
            doctor: committedRecord.doctor_name,
            hospital: committedRecord.facility,
            notes: committedRecord.notes,
            description: committedRecord.notes || `Clinical outpatient encounter documented for ${payload.reason}.`,
            status: "COMMITTED"
          };
          if (!prev) return { events: [newEvent] };
          return {
            ...prev,
            events: [newEvent, ...(prev.events || [])]
          };
        });

        setShowEncounterModal(false);
        setEncounterReason("");
        setEncounterNotes("");
        setSelectedSnomed(null);
        setRxMedName("");
        setDictationSummaryPill(null);
        setPhcToast(`Encounter ${encId} signed & committed to EHR!`);
        setTimeout(() => setPhcToast(null), 4000);
        fetchTimeline(selectedPatientId);
        if (tokens.patient) {
          fetchAuditLogs(tokens.patient);
          fetchPatientTimeline(tokens.patient);
        }
      }"""

    if old_encounter_handler in content:
        content = content.replace(old_encounter_handler, new_encounter_handler, 1)
        print("Updated handleCreateEncounter logic.")
    else:
        print("WARN: old_encounter_handler not found!")

    # -------------------------------------------------------------
    # 3. Add DEMO_LAB_REPORTS & DEMO_PATIENT_TIMELINE_EVENTS datasets
    # -------------------------------------------------------------
    demo_datasets = """  // ── RICH DEMO LAB REPORTS DATASET (NABL ISO 15189 ACCREDITED) ──
  const DEMO_LAB_REPORTS = [
    {
      id: "REP-LAB-2026-081",
      test_name: "Diabetic Comprehensive Profile (HbA1c & Plasma Glucose)",
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
      patient_name: "Rajesh Sharma",
      patient_abha: "91-4405-2026-0001",
      status: "COMPLETED",
      abnormal_count: 1,
      conclusion: "Mild resolving thrombocytopenia with platelet count at 85,000 /mcL secondary to recent febrile convalescence (Dengue follow-up). Hemoglobin and WBC differentials are within normal parameters.",
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
      patient_name: "Rajesh Sharma",
      patient_abha: "91-4405-2026-0001",
      status: "COMPLETED",
      abnormal_count: 2,
      conclusion: "Borderline hypercholesterolemia with elevated serum triglycerides (180 mg/dL). HDL-C is protective at 44 mg/dL. Statin therapy and dietary lipid moderation indicated.",
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
      patient_name: "Rajesh Sharma",
      patient_abha: "91-4405-2026-0001",
      status: "COMPLETED",
      abnormal_count: 0,
      conclusion: "Euthyroid status confirmed. Ultrasensitive TSH and Free T4 levels are within optimal reference limits.",
      observations: [
        { name: "Thyroid Stimulating Hormone (TSH)", value: "2.45", unit: "uIU/mL", range: "0.35 - 4.94", flag: "NORMAL", method: "CLIA (Chemiluminescence)" },
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
"""

    old_prompts_target = """  // Sample AI queries & grounded knowledge base"""
    if old_prompts_target in content:
        content = content.replace(old_prompts_target, demo_datasets + "\n  " + old_prompts_target, 1)
        print("Added DEMO_LAB_REPORTS and DEMO_PATIENT_TIMELINE_EVENTS.")
    else:
        print("WARN: old_prompts_target not found!")

    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print("Part 1 changes written successfully.")

if __name__ == "__main__":
    run()
