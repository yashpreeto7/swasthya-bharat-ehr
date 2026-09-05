"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldCheck, Stethoscope, User, FlaskConical, Bell,
  FileText, CheckCircle2, AlertTriangle, Clock, Calendar, Lock,
  Search, Plus, Sparkles, Send, RefreshCw, ChevronRight, X, Eye, FileCode2,
  Network, ArrowRight, KeyRound, LogIn, LogOut, Check, ChevronDown,
  Moon, Sun, HelpCircle, HeartPulse, Pill, FileSpreadsheet, ShieldAlert
} from "lucide-react";

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
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
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

  // ── FHIR Viewer State ──
  const [fhirResource, setFhirResource] = useState<any>(null);
  const [selectedFhirType, setSelectedFhirType] = useState("Patient");

  // ── ABDM Gateway Simulator State (HIP & HIU) ──
  const [abdmAbhaInput, setAbdmAbhaInput] = useState("91-4405-2026-0001");
  const [abdmDiscovered, setAbdmDiscovered] = useState<any>(null);
  const [abdmOtpInput, setAbdmOtpInput] = useState("123456");
  const [abdmLinkStatus, setAbdmLinkStatus] = useState<string>("");
  const [abdmHiuConsentId, setAbdmHiuConsentId] = useState<string>("");
  const [abdmHiuTransferResult, setAbdmHiuTransferResult] = useState<any>(null);
  const [loadingAbdm, setLoadingAbdm] = useState(false);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  };

  // Initial load
  useEffect(() => {
    initAuthAndData();
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
      setSnomedResults(data.results || []);
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
        fetchTimeline(selectedPatientId);
        fetchAuditLogs(tokens.patient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateAiSummary = async () => {
    if (!selectedPatientId) return;
    setLoadingAiSummary(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai/summary/${selectedPatientId}`, {
        headers: { Authorization: `Bearer ${tokens.doctor}` }
      });
      const data = await res.json();
      setAiSummary(data);
      fetchAuditLogs(tokens.patient);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const askAiAssistant = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q.trim() || !selectedPatientId) return;
    setLoadingAiQuery(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          query: q
        })
      });
      const data = await res.json();
      setAiAnswer(data);
      fetchAuditLogs(tokens.patient);
    } catch (err) {
      console.error(err);
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

  const selectedPatient = patients.find(p => p.patient_id === selectedPatientId);

  // Filtered timeline events
  const filteredEvents = timeline?.events?.filter((evt: any) => {
    if (timelineFilter === "ALL") return true;
    return evt.event_type === timelineFilter;
  }) || [];

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ── REVAMPED MODERN HEALTHCARE NAVBAR ── */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 px-4 md:px-8 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand Logo & Clinical OS Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-white">
                    MedIndia <span className="text-teal-400 font-semibold">HealthOS</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                    ABDM M1-M3
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  National Interoperable Health Record Architecture
                </p>
              </div>
            </div>

            {/* Mobile persona indicator */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-white"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentRole === "DOCTOR" ? "bg-teal-400" : currentRole === "PATIENT" ? "bg-amber-400" : "bg-cyan-400"
              }`} />
              <span>{currentRole}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* ── ROLE-SPECIFIC SEGMENTED NAVIGATION PILLS ── */}
          <nav className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700/80 overflow-x-auto w-full md:w-auto">
            
            {/* 1. DOCTOR NAVIGATION */}
            {currentRole === "DOCTOR" && (
              <>
                <button
                  onClick={() => setActivePortal("doctor_workspace")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "doctor_workspace"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Clinical Workstation
                </button>

                <button
                  onClick={() => setActivePortal("doctor_encounters")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "doctor_encounters"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Encounters & SNOMED
                </button>

                <button
                  onClick={() => setActivePortal("doctor_ai")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "doctor_ai"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Clinical AI Copilot
                </button>

                <button
                  onClick={() => setActivePortal("doctor_abdm_hiu")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "doctor_abdm_hiu"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  ABDM HIU Transfer
                </button>

                <button
                  onClick={() => {
                    setActivePortal("fhir_inspector");
                    fetchFhir("Patient");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "fhir_inspector"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  FHIR R4 Inspector
                </button>
              </>
            )}

            {/* 2. PATIENT NAVIGATION */}
            {currentRole === "PATIENT" && (
              <>
                <button
                  onClick={() => setActivePortal("patient_abha")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "patient_abha"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  My ABHA Card
                </button>

                <button
                  onClick={() => setActivePortal("patient_records")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "patient_records"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Health Timeline
                </button>

                <button
                  onClick={() => setActivePortal("patient_consent")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "patient_consent"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Consent Manager
                </button>

                <button
                  onClick={() => setActivePortal("patient_audit")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "patient_audit"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Privacy Audit Log
                </button>

                <button
                  onClick={() => setActivePortal("patient_reminders")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "patient_reminders"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "lab_queue"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Diagnostic Queue ({labOrders.length})
                </button>

                <button
                  onClick={() => setActivePortal("lab_abdm_hip")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "lab_abdm_hip"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  ABDM HIP Discovery
                </button>

                <button
                  onClick={() => setActivePortal("lab_nabl")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activePortal === "lab_nabl"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  NABL Quality Profile
                </button>
              </>
            )}

          </nav>

          {/* ── CONTROLS: DARK MODE & PERSONA SWITCHER ── */}
          <div className="flex items-center gap-2.5">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            {/* Persona Switcher Button */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-left transition-all"
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs text-white ${
                currentRole === "DOCTOR" ? "bg-indigo-600" :
                currentRole === "PATIENT" ? "bg-teal-600" : "bg-cyan-600"
              }`}>
                {currentRole === "DOCTOR" ? "Dr" : currentRole === "PATIENT" ? "Pt" : "Lb"}
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="truncate max-w-[130px]">{currentUserName}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    {currentRole}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {currentUserSubtitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

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
                      onClick={() => setShowEncounterModal(true)}
                      className="btn-primary px-3.5 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Document Encounter (SNOMED)
                    </button>
                    <button
                      onClick={generateAiSummary}
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
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Consent Active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Patient Summary Header Card */}
                {selectedPatient && (
                  <div className="medical-card p-5 border-l-4 border-l-indigo-600">
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
                  <div className="medical-card p-5 bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                          Grounded Clinical AI Synthesis • Zero Hallucination
                        </span>
                      </div>
                      <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                        {aiSummary.records_cited?.length || 0} Records Cited
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {aiSummary.summary}
                    </p>

                    {aiSummary.records_cited && aiSummary.records_cited.length > 0 && (
                      <div className="pt-2 border-t border-amber-200 dark:border-amber-800/60 flex flex-wrap gap-1.5">
                        {aiSummary.records_cited.map((rec: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                            {rec}
                          </span>
                        ))}
                      </div>
                    )}
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
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Document Clinical Encounter (SNOMED CT)
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active Patient: {selectedPatient?.full_name || "Select Patient from Workstation"}
                  </p>
                </div>

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
                        className="w-full p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
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
                        className="w-full p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
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
                          className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={rxDosage}
                          onChange={e => setRxDosage(e.target.value)}
                          placeholder="Dosage (e.g. 500 mg)"
                          className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={rxFrequency}
                          onChange={e => setRxFrequency(e.target.value)}
                          placeholder="Frequency (e.g. Twice daily after meals)"
                          className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                        <input
                          type="text"
                          value={rxDuration}
                          onChange={e => setRxDuration(e.target.value)}
                          placeholder="Duration (e.g. 30 days)"
                          className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateEncounter}
                      className="btn-primary w-full py-2.5 text-xs uppercase tracking-wide font-semibold mt-2"
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
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none pr-8"
                        />
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Selected Concept Card */}
                    {selectedSnomed ? (
                      <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-1">
                        <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">Selected Diagnosis:</div>
                        <div className="font-bold text-xs text-emerald-900 dark:text-emerald-200">{selectedSnomed.display_name}</div>
                        <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">ID: {selectedSnomed.concept_id}</div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-400 rounded-md border border-dashed border-slate-200 dark:border-slate-800">
                        No concept selected. Type above to search SNOMED concepts.
                      </div>
                    )}

                    {/* Search Results */}
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {snomedResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedSnomed(item)}
                          className="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 cursor-pointer transition-all"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white">{item.display_name}</div>
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">Concept ID: {item.concept_id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View A3: Clinical AI Copilot with Clickable Questions */}
            {activePortal === "doctor_ai" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Grounded Clinical AI Copilot
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clinical Decision Support strictly grounded in verified EHR records • Active Patient: {selectedPatient?.full_name}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Synthesis Brief Box */}
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
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    My Medical Records & Lab History
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complete longitudinal view across outpatient consultations, prescriptions, and laboratory reports
                  </p>
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

                <div className="space-y-3">
                  {timeline?.events?.map((evt: any, i: number) => (
                    <div key={i} className="medical-card p-5 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            evt.event_type === "ENCOUNTER" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                            evt.event_type === "PRESCRIPTION" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}>
                            {evt.event_type}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {evt.title}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{evt.timestamp}</span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">{evt.description}</p>

                      {evt.event_type === "DIAGNOSTIC_REPORT" && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleExplainReport(evt.record_id)}
                            disabled={loadingLabExplainer}
                            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 hover:bg-teal-100 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {loadingLabExplainer ? "Analyzing..." : "Explain This Report in Plain English"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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
            {/* View C1: Requisition Queue */}
            {activePortal === "lab_queue" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Diagnostic Testing Queue & Specimen Intake
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dr. Lal PathLabs National Reference Lab • NABL License: NABL-DL-2026-891
                  </p>
                </div>

                {/* Result Entry Drawer */}
                {selectedLabOrder && (
                  <div className="medical-card p-6 bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-teal-200 dark:border-teal-800 pb-2">
                      <h3 className="text-base font-bold text-teal-950 dark:text-teal-200">
                        Record Test Result: {selectedLabOrder.test_name}
                      </h3>
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
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
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
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="abnormalCheck"
                          checked={labObsAbnormal}
                          onChange={e => setLabObsAbnormal(e.target.checked)}
                          className="w-4 h-4 accent-red-600"
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
                          className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <button
                          type="submit"
                          className="btn-teal w-full py-2.5 text-xs uppercase font-semibold"
                        >
                          Sign, Verify & Publish to ABDM Care Context
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Orders List */}
                <div className="medical-card p-6 space-y-3">
                  {labOrders.map(order => (
                    <div
                      key={order.order_id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{order.test_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            order.priority === "URGENT"
                              ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {order.priority || "ROUTINE"}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          Patient ABHA: {order.patient_id} • Doctor: {order.doctor_id}
                        </div>
                      </div>

                      {order.status !== "COMPLETED" && (
                        <button
                          onClick={() => setSelectedLabOrder(order)}
                          className="btn-teal px-3 py-1.5 text-xs uppercase font-semibold"
                        >
                          Enter Results
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View C2: ABDM HIP Discovery */}
            {activePortal === "lab_abdm_hip" && (
              <div className="space-y-6">
                <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    ABDM Care Context Discovery & Linking
                  </h1>
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
                        className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAbdmDiscover}
                        disabled={loadingAbdm}
                        className="btn-primary w-full py-2 text-xs uppercase font-semibold"
                      >
                        {loadingAbdm ? "Discovering..." : "Discover Care Contexts"}
                      </button>
                    </div>
                  </div>

                  {abdmDiscovered && (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mt-4">
                      <div className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        Discovered {abdmDiscovered.care_contexts?.length} Care Contexts:
                      </div>

                      <div className="space-y-2">
                        {abdmDiscovered.care_contexts?.map((cc: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
                            <span className="font-semibold text-slate-900 dark:text-white">{cc.display}</span>
                            <span className="text-slate-500 font-mono">{cc.referenceNumber}</span>
                          </div>
                        ))}
                      </div>

                      {/* OTP Confirm */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                        <input
                          type="text"
                          value={abdmOtpInput}
                          onChange={e => setAbdmOtpInput(e.target.value)}
                          placeholder="OTP (123456)"
                          className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-xs font-mono w-28 bg-white dark:bg-slate-900"
                        />
                        <button
                          onClick={handleAbdmConfirmLink}
                          disabled={loadingAbdm}
                          className="btn-primary px-3 py-1.5 text-xs uppercase font-semibold"
                        >
                          Verify OTP & Link
                        </button>
                        {abdmLinkStatus && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{abdmLinkStatus}</span>
                        )}
                      </div>
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

      {/* ── Modern Professional Healthcare Footer ── */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">MedIndia HealthOS</span>
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
