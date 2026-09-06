"""
execution/apply_phase5_ui_revamp.py
Comprehensive deterministic script to apply all Phase 5 UI/UX Pro Max and clinical workflow upgrades to frontend/src/app/page.tsx:
1. Rich datasets: DEMO_LAB_REPORTS, DEMO_PATIENT_TIMELINE_EVENTS, DEMO_PENDING_LAB_ORDERS
2. State additions: signedEncountersHistory, activeLabTab, selectedDemoLabReport, patientTimelineFilter, copiedAiBrief
3. Doctor Encounter Signing: patient selector, reactive update to signedEncountersHistory, verified commit card, session history feed
4. Clinical AI Copilot: multi-format synthesis brief console (Focus, Tone/Audience, Time Window), copy action, verified citations
5. Patient Records: category filter pills, resilient timeline with rich clinical cards and LOINC/SNOMED descriptions, explainer button
6. Lab Portal: tabs for Intake Queue and Verified Reports Archive, full observation tables modal, NABL ISO 15189 badge
7. Lab ABDM HIP: post-OTP linking certificate card with linked care contexts and quick actions
"""

import os
import shutil
import re

TARGET_FILE = os.path.abspath("frontend/src/app/page.tsx")
BACKUP_FILE = os.path.abspath("frontend/src/app/page.tsx.pre_p5.bak")

def run():
    print(f"[Phase 5] Reading {TARGET_FILE}...")
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    shutil.copyfile(TARGET_FILE, BACKUP_FILE)
    print(f"[Phase 5] Backup created at {BACKUP_FILE}")

    # -------------------------------------------------------------
    # 1. State additions
    # -------------------------------------------------------------
    old_state = """  const [rxDuration, setRxDuration] = useState("30 days");"""
    new_state = """  const [rxDuration, setRxDuration] = useState("30 days");
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
  const [copiedAiBrief, setCopiedAiBrief] = useState(false);"""

    if old_state in content and "signedEncountersHistory" not in content:
        content = content.replace(old_state, new_state, 1)
        print("[Phase 5] State declarations updated.")

    # -------------------------------------------------------------
    # 2. Update handleCreateEncounter to append to signedEncountersHistory
    # -------------------------------------------------------------
    old_handler = """      if (res.ok) {
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
        setShowEncounterModal(false);"""

    new_handler = """      if (res.ok) {
        const savedData = await res.json();
        const encEntry = {
          id: savedData.encounter_id || `ENC-${Date.now().toString().slice(-6)}`,
          patient_name: selectedPatient?.full_name || "Rajesh Sharma",
          patient_id: selectedPatientId,
          reason: payload.reason,
          notes: payload.clinical_notes,
          snomed: selectedSnomed,
          medication: rxMedName ? `${rxMedName} (${rxDosage}, ${rxFrequency}, ${rxDuration})` : null,
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          status: "COMMITTED & CRYPTOGRAPHICALLY SIGNED"
        };
        setLastCommittedEncounter(encEntry);
        setSignedEncountersHistory(prev => [encEntry, ...prev]);
        setShowEncounterModal(false);"""

    if old_handler in content:
        content = content.replace(old_handler, new_handler, 1)
        print("[Phase 5] handleCreateEncounter updated to append history.")

    # -------------------------------------------------------------
    # 3. Add DEMO datasets before sampleAiPrompts
    # -------------------------------------------------------------
    demo_datasets = """  // ── RICH DEMO LAB REPORTS DATASET (NABL ISO 15189 ACCREDITED) ──
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
"""

    old_prompts_target = """  // Sample AI queries & grounded knowledge base"""
    if old_prompts_target in content and "DEMO_LAB_REPORTS" not in content:
        content = content.replace(old_prompts_target, demo_datasets + "\n  " + old_prompts_target, 1)
        print("[Phase 5] Added DEMO_LAB_REPORTS, DEMO_PATIENT_TIMELINE_EVENTS, and DEMO_PENDING_LAB_ORDERS.")

    # -------------------------------------------------------------
    # 4. Revamp View A2: doctor_encounters
    # -------------------------------------------------------------
    old_a2_pattern = re.compile(r'\{\/\* View A2: Clinical Encounters & SNOMED CT Authoring \*\/\}[\s\S]*?(?=\{\/\* View A3: Clinical AI Copilot)')
    
    new_a2 = """{/* View A2: Clinical Encounters & SNOMED CT Authoring */}
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
"""

    if old_a2_pattern.search(content):
        content = old_a2_pattern.sub(new_a2, content)
        print("[Phase 5] Revamped View A2: doctor_encounters.")

    # -------------------------------------------------------------
    # 5. Revamp View A3: doctor_ai (Synthesis Console Controls)
    # -------------------------------------------------------------
    old_ai_box = """                  {/* Synthesis Brief Box */}
                  <div className="medical-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Longitudinal Clinical Brief
                      </h3>
                      <button
                        onClick={generateAiSummary}
                        disabled={loadingAiSummary}
                        className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {loadingAiSummary ? "Synthesizing..." : "Generate Brief"}
                      </button>
                    </div>

                    {aiSummary ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {aiSummary.summary}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400">Verified Citations:</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {aiSummary.records_cited?.map((c: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center text-xs text-slate-400 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                        Click "Generate Brief" to synthesize a complete clinical overview with citations.
                      </div>
                    )}
                  </div>"""

    new_ai_box = """                  {/* Synthesis Brief Box */}
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
                        onClick={generateAiSummary}
                        disabled={loadingAiSummary}
                        className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        {loadingAiSummary ? "Synthesizing..." : "Generate Brief"}
                      </button>
                    </div>

                    {/* Synthesis Controls: Focus Area, Audience, Time Window */}
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          Synthesis Focus Area
                        </label>
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
                              onClick={() => setBriefFocusArea(item.id)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                briefFocusArea === item.id
                                  ? "bg-indigo-600 text-white shadow-xs"
                                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
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
                            onChange={e => setBriefAudience(e.target.value)}
                            className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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
                            onChange={e => setBriefTimeWindow(e.target.value)}
                            className="w-full p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
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
                      <div className="space-y-3 animate-in fade-in">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {aiSummary.summary}
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400">Verified Citations:</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {aiSummary.records_cited?.map((c: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(aiSummary.summary);
                              setCopiedAiBrief(true);
                              setTimeout(() => setCopiedAiBrief(false), 2500);
                            }}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 self-start md:self-auto transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedAiBrief ? "Copied!" : "Copy Brief"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                        <Sparkles className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                        <div>Click "Generate Brief" to synthesize a complete clinical overview with verifiable citations.</div>
                      </div>
                    )}
                  </div>"""

    if old_ai_box in content:
        content = content.replace(old_ai_box, new_ai_box, 1)
        print("[Phase 5] Revamped View A3: doctor_ai Synthesis Console.")

    # -------------------------------------------------------------
    # 6. Revamp View B2: patient_records
    # -------------------------------------------------------------
    old_b2_pattern = re.compile(r'\{\/\* View B2: Health Records Timeline & Reports \*\/\}[\s\S]*?(?=\{\/\* View B3: Consent Manager)')
    
    new_b2 = """{/* View B2: Health Records Timeline & Reports */}
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
"""

    if old_b2_pattern.search(content):
        content = old_b2_pattern.sub(new_b2, content)
        print("[Phase 5] Revamped View B2: patient_records.")

    # -------------------------------------------------------------
    # 7. Revamp View C1: lab_queue (Intake vs Archive Tabs & Observation Modal)
    # -------------------------------------------------------------
    old_c1_pattern = re.compile(r'\{\/\* View C1: Requisition Queue \*\/\}[\s\S]*?(?=\{\/\* View C2: ABDM HIP Discovery)')
    
    new_c1 = """{/* View C1: Requisition Queue & Archive */}
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
"""

    if old_c1_pattern.search(content):
        content = old_c1_pattern.sub(new_c1, content)
        print("[Phase 5] Revamped View C1: lab_queue with Intake vs Archive tabs & observation table modal.")

    # -------------------------------------------------------------
    # 8. Revamp View C2: lab_abdm_hip (Post-OTP Linking Certificate Card)
    # -------------------------------------------------------------
    old_c2_pattern = re.compile(r'\{\/\* View C2: ABDM HIP Discovery \*\/\}[\s\S]*?(?=\{\/\* View C3: NABL Accreditation)')
    
    new_c2 = """{/* View C2: ABDM HIP Discovery & Linking */}
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
"""

    if old_c2_pattern.search(content):
        content = old_c2_pattern.sub(new_c2, content)
        print("[Phase 5] Revamped View C2: lab_abdm_hip with Post-OTP certificate card.")

    # -------------------------------------------------------------
    # Write back
    # -------------------------------------------------------------
    with open(TARGET_FILE, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[Phase 5] Successfully applied all UI/UX Pro Max upgrades to {TARGET_FILE}!")

if __name__ == "__main__":
    run()
