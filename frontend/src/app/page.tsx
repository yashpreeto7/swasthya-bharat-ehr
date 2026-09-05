"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldCheck, Stethoscope, User, FlaskConical, Bell,
  FileText, CheckCircle2, AlertTriangle, Clock, Calendar, Lock,
  Search, Plus, Sparkles, Send, RefreshCw, ChevronRight, X, Eye, FileCode2,
  Network, ArrowRight, KeyRound, LogIn, LogOut, Check, ChevronDown,
  Layers, Database, Moon, Sun, Palette, ShieldAlert, Cpu, HeartPulse
} from "lucide-react";

export default function Home() {
  // ── Role & Active View State ──
  const [currentRole, setCurrentRole] = useState<"DOCTOR" | "PATIENT" | "LAB">("DOCTOR");
  const [currentUserName, setCurrentUserName] = useState("Dr. Arvind Swaminathan, MD");
  const [activePortal, setActivePortal] = useState<string>("doctor_workspace");
  const [showPersonaModal, setShowPersonaModal] = useState(false);

  // ── Sovereign Theme Engine ──
  const [activeTheme, setActiveTheme] = useState<"sovereign-manifesto" | "sovereign-onyx" | "sovereign-slate">("sovereign-manifesto");

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

  // Apply theme to html tag
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

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

  const switchPersona = (role: "DOCTOR" | "PATIENT" | "LAB") => {
    setCurrentRole(role);
    if (role === "DOCTOR") {
      setCurrentUserName("Dr. Arvind Swaminathan, MD");
      setActiveToken(tokens.doctor);
      setActivePortal("doctor_workspace");
    } else if (role === "PATIENT") {
      setCurrentUserName("Rajesh Sharma (ABHA Owner)");
      setActiveToken(tokens.patient);
      setActivePortal("patient_abha");
    } else {
      setCurrentUserName("Dr. Lal PathLabs Specialist");
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
      const res = await fetch("http://localhost:8000/api/v1/consent/my-consents", {
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
      const res = await fetch("http://localhost:8000/api/v1/reminders/my-notifications", {
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
      const res = await fetch("http://localhost:8000/api/v1/audit/logs", {
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
      const res = await fetch("http://localhost:8000/api/v1/abdm/hip/link/token/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link_token_ref: abdmDiscovered?.link_token_ref || "HIP-LINK-TOKEN-REF",
          auth_code_otp: abdmOtpInput,
          abha_id: abdmAbhaInput
        })
      });
      const data = await res.json();
      setAbdmLinkStatus(data.status === "LINKED" ? "Successfully Linked to ABHA!" : "Link Failed");
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
      const res = await fetch("http://localhost:8000/api/v1/abdm/hiu/health-information/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          consent_id: abdmHiuConsentId || (patients[0]?.consent_id),
          hiu_id: "MEDINDIA-HIU-01"
        })
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
      const encRes = await fetch("http://localhost:8000/api/v1/doctors/encounters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          reason: encounterReason || "Clinical Evaluation",
          clinical_notes: encounterNotes,
          condition_name: selectedSnomed?.display_name || "General Consultation",
          snomed_code: selectedSnomed?.concept_id || "44054006"
        })
      });

      if (encRes.ok && rxMedName) {
        await fetch("http://localhost:8000/api/v1/doctors/prescriptions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.doctor}`
          },
          body: JSON.stringify({
            patient_id: selectedPatientId,
            medication_name: rxMedName,
            dosage: rxDosage,
            frequency: rxFrequency,
            duration: rxDuration,
            instructions: "Take as prescribed with water."
          })
        });
      }

      setShowEncounterModal(false);
      setEncounterReason("");
      setEncounterNotes("");
      setSelectedSnomed(null);
      setRxMedName("");
      fetchTimeline(selectedPatientId);
      fetchAuditLogs(tokens.patient);
    } catch (err) {
      console.error(err);
    }
  };

  const generateAiSummary = async () => {
    if (!selectedPatientId) return;
    setLoadingAiSummary(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai/clinical-brief/${selectedPatientId}`, {
        method: "POST",
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

  const askAiAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !selectedPatientId) return;
    setLoadingAiQuery(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          query: aiQuery
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
      const res = await fetch(`http://localhost:8000/api/v1/ai/lab-explainer/${reportId}`, {
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
          conclusion: labConclusion || "Diagnostic investigation completed. Verified by Lab Specialist.",
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

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#d42b2b] selection:text-white">
      {/* ── Top Sovereign Architectural Header ── */}
      <header className="bg-[var(--bg-card)] border-b border-[var(--border-main)] sticky top-0 z-40 px-4 md:px-8 py-3 shadow-[0_2px_0_var(--border-main)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[var(--color-brand)] text-white flex items-center justify-center border border-[var(--border-main)] shadow-[2px_2px_0_var(--border-main)]">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-editorial text-xl font-bold tracking-tight text-[var(--text-main)]">
                    MedIndia HealthOS
                  </span>
                  <span className="manifesto-badge bg-[#f5f0e8] text-[#0a0a0a]">
                    ABDM • FHIR R4
                  </span>
                  <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                    SNOMED CT
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[var(--text-muted)] tracking-wider">
                  NATIONAL ELECTRONIC HEALTH RECORD PLATFORM // INDIA
                </p>
              </div>
            </div>

            {/* Mobile quick indicator */}
            <div className="md:hidden flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase">{currentRole}</span>
            </div>
          </div>

          {/* ── ROLE-SPECIFIC DEDICATED NAVIGATION BAR ── */}
          {/* Note: Patient never sees Doctor tabs; Doctor never sees Patient profile; Lab has its own queue */}
          <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1">
            
            {/* 1. DOCTOR NAVIGATION */}
            {currentRole === "DOCTOR" && (
              <>
                <button
                  onClick={() => setActivePortal("doctor_workspace")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "doctor_workspace"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  Doctor Workstation
                </button>

                <button
                  onClick={() => setActivePortal("doctor_encounters")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "doctor_encounters"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  SNOMED Encounters
                </button>

                <button
                  onClick={() => setActivePortal("doctor_ai")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "doctor_ai"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Clinical AI Copilot
                </button>

                <button
                  onClick={() => setActivePortal("doctor_abdm_hiu")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "doctor_abdm_hiu"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "fhir_inspector"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "patient_abha"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  My ABHA Card
                </button>

                <button
                  onClick={() => setActivePortal("patient_records")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "patient_records"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  My Health Timeline
                </button>

                <button
                  onClick={() => setActivePortal("patient_consent")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "patient_consent"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Consent Manager
                </button>

                <button
                  onClick={() => setActivePortal("patient_audit")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "patient_audit"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Privacy Audit Log
                </button>

                <button
                  onClick={() => setActivePortal("patient_reminders")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "patient_reminders"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "lab_queue"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Diagnostic Queue ({labOrders.length})
                </button>

                <button
                  onClick={() => setActivePortal("lab_abdm_hip")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "lab_abdm_hip"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  ABDM HIP Discovery
                </button>

                <button
                  onClick={() => setActivePortal("lab_nabl")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all manifesto-border ${
                    activePortal === "lab_nabl"
                      ? "bg-[var(--color-brand)] text-white shadow-[2px_2px_0_var(--border-main)]"
                      : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  NABL Accreditation
                </button>
              </>
            )}

          </nav>

          {/* ── Controls: Theme Switcher & Persona Switcher ── */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle (Manifesto / Onyx / Slate) */}
            <div className="flex items-center manifesto-border bg-[var(--bg-card)] p-0.5 shadow-[1px_1px_0_var(--border-main)]">
              <button
                onClick={() => setActiveTheme("sovereign-manifesto")}
                title="Sovereign Manifesto (Editorial Swiss Parchment)"
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase ${
                  activeTheme === "sovereign-manifesto"
                    ? "bg-[#d42b2b] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Parchment
              </button>
              <button
                onClick={() => setActiveTheme("sovereign-onyx")}
                title="Sovereign Onyx (Dark Titanium)"
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase ${
                  activeTheme === "sovereign-onyx"
                    ? "bg-[#3b82f6] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Onyx
              </button>
              <button
                onClick={() => setActiveTheme("sovereign-slate")}
                title="Sovereign Slate (Deep Indigo)"
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase ${
                  activeTheme === "sovereign-slate"
                    ? "bg-[#6366f1] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                Slate
              </button>
            </div>

            {/* Persona Switcher Trigger */}
            <button
              onClick={() => setShowPersonaModal(true)}
              className="manifesto-btn px-3 py-1.5 flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-main)]"
            >
              <span className={`w-2 h-2 rounded-full ${
                currentRole === "DOCTOR" ? "bg-emerald-600" :
                currentRole === "PATIENT" ? "bg-amber-600" : "bg-cyan-600"
              }`} />
              <span className="truncate max-w-[130px]">{currentUserName}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>

        </div>
      </header>

      {/* ── Main Workspace Body ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">

        {/* ─────────────────────────────────────────────────────────────
            A. DOCTOR PORTAL VIEWS
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "DOCTOR" && (
          <div>
            {/* View A1: Doctor Workspace & Clinical Roster */}
            {activePortal === "doctor_workspace" && (
              <div className="space-y-6">
                
                {/* Doctor Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-main)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--color-brand)]">01 // CLINICAL WORKSTATION</span>
                      <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                        ACTIVE CONSENT ENFORCED
                      </span>
                    </div>
                    <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                      Practitioner Clinical Workspace
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                      Attending: Dr. Arvind Swaminathan, MD (NMC: MCI-74892) &bull; Apollo Hospitals, Delhi
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEncounterModal(true)}
                      className="manifesto-btn-primary px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 uppercase"
                    >
                      <Plus className="w-4 h-4" />
                      Document Visit (SNOMED CT)
                    </button>
                    <button
                      onClick={generateAiSummary}
                      disabled={loadingAiSummary || !selectedPatientId}
                      className="manifesto-btn px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 uppercase text-[var(--text-main)]"
                    >
                      <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
                      {loadingAiSummary ? "Synthesizing..." : "Grounded AI Brief"}
                    </button>
                  </div>
                </div>

                {/* Patient Selector Strip */}
                <div className="manifesto-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Authorized Patient Roster ({patients.length} under active consent)
                    </span>
                    <span className="font-mono text-[11px] text-[var(--text-subtle)]">
                      SELECT TO LOAD LONGITUDINAL EHR TIMELINE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          className={`manifesto-border p-3 cursor-pointer transition-all ${
                            isSel
                              ? "bg-[var(--bg-card)] shadow-[4px_4px_0_var(--color-brand)] border-[var(--color-brand)]"
                              : "bg-[var(--bg-card)] hover:shadow-[3px_3px_0_var(--border-main)] opacity-85 hover:opacity-100"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-[var(--text-main)]">{pat.full_name}</span>
                            <span className="manifesto-badge bg-[#f5f0e8] text-[#0a0a0a]">
                              ABHA: {pat.abha_id}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-[var(--text-muted)] flex items-center gap-3 font-mono">
                            <span>{pat.gender}</span>
                            <span>&bull;</span>
                            <span>Blood: {pat.blood_group || "O+"}</span>
                            <span>&bull;</span>
                            <span className="text-emerald-700 font-bold">Consent Valid</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Patient Summary Banner & Active Vitals */}
                {selectedPatient && (
                  <div className="manifesto-card p-5 border-l-4 border-l-[var(--color-brand)]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-editorial text-2xl font-bold text-[var(--text-main)]">
                            {selectedPatient.full_name}
                          </h2>
                          <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                            ABHA: {selectedPatient.abha_id}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-mono mt-1">
                          Consent ID: {selectedPatient.consent_id || "Active-Consent"} &bull; Categories: {selectedPatient.categories?.join(", ") || "ALL_RECORDS"}
                        </p>
                      </div>

                      {/* Quick Vitals */}
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="manifesto-border p-2 bg-[var(--bg-card)] text-center min-w-[90px]">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase">Blood Pressure</div>
                          <div className="font-bold text-sm text-[var(--text-main)]">132 / 86</div>
                        </div>
                        <div className="manifesto-border p-2 bg-[var(--bg-card)] text-center min-w-[90px]">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase">HbA1c</div>
                          <div className="font-bold text-sm text-[#b45309]">7.4 % (High)</div>
                        </div>
                        <div className="manifesto-border p-2 bg-[var(--bg-card)] text-center min-w-[90px]">
                          <div className="text-[10px] text-[var(--text-muted)] uppercase">Heart Rate</div>
                          <div className="font-bold text-sm text-emerald-700">76 bpm</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Brief Box (if generated) */}
                {aiSummary && (
                  <div className="manifesto-card p-5 bg-[#fefce8] border-[#b45309] shadow-[3px_3px_0_#b45309]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#b45309]" />
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#b45309]">
                          Grounded Clinical AI Synthesis &bull; Strictly Cited Records
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        {aiSummary.records_cited?.length || 0} Records Cited
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-main)] leading-relaxed whitespace-pre-wrap font-sans">
                      {aiSummary.summary}
                    </p>

                    {aiSummary.records_cited && aiSummary.records_cited.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#fde68a] flex flex-wrap gap-1.5">
                        {aiSummary.records_cited.map((rec: string, idx: number) => (
                          <span key={idx} className="manifesto-badge bg-white text-[#b45309] text-[10px]">
                            {rec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Longitudinal Clinical Timeline */}
                <div className="manifesto-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      02 // Longitudinal Health Timeline ({timeline?.events?.length || 0} Events)
                    </span>
                    <button
                      onClick={() => fetchTimeline(selectedPatientId)}
                      className="text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                  </div>

                  {loadingTimeline ? (
                    <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                      Loading consent-verified clinical timeline...
                    </div>
                  ) : !timeline?.events || timeline.events.length === 0 ? (
                    <div className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                      No clinical events recorded under this consent. Click "Document Visit" above to add an encounter.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timeline.events.map((evt: any, i: number) => (
                        <div
                          key={i}
                          className="manifesto-border p-4 bg-[var(--bg-card)] hover:shadow-[3px_3px_0_var(--border-main)] transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`manifesto-badge ${
                                evt.event_type === "ENCOUNTER" ? "bg-[#dbeafe] text-[#1e40af]" :
                                evt.event_type === "PRESCRIPTION" ? "bg-[#fef3c7] text-[#92400e]" :
                                evt.event_type === "CONDITION" ? "bg-[#fee2e2] text-[#b91c1c]" :
                                "bg-[#dcfce7] text-[#166534]"
                              }`}>
                                {evt.event_type}
                              </span>
                              <span className="font-bold text-sm text-[var(--text-main)]">{evt.title}</span>
                              {evt.record_id && (
                                <span className="font-mono text-[10px] text-[var(--text-subtle)]">
                                  #{evt.record_id}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-xs text-[var(--text-muted)]">{evt.timestamp}</span>
                          </div>

                          <p className="text-xs text-[var(--text-muted)] mt-2 font-sans">
                            {evt.description}
                          </p>

                          {evt.snomed_code && (
                            <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
                              <span className="text-[var(--text-subtle)]">SNOMED CT:</span>
                              <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
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
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">02 // CLINICAL ENCOUNTER AUTHORING</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      AUTHENTIC SNOMED CT CODING
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Document Clinical Encounter
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Coding diagnosis with validated National SNOMED CT concepts &bull; Patient: {selectedPatient?.full_name || "Select Patient"}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Encounter Form */}
                  <div className="lg:col-span-2 manifesto-card p-6 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                      Consultation Details
                    </h3>

                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        Chief Complaint / Encounter Reason
                      </label>
                      <input
                        type="text"
                        value={encounterReason}
                        onChange={e => setEncounterReason(e.target.value)}
                        placeholder="e.g. Routine diabetic checkup, persistent cough, high blood pressure follow-up"
                        className="w-full manifesto-border p-2.5 bg-[var(--bg-card)] text-sm font-sans text-[var(--text-main)] outline-none focus:border-[var(--color-brand)]"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        Clinical Progress Notes
                      </label>
                      <textarea
                        rows={4}
                        value={encounterNotes}
                        onChange={e => setEncounterNotes(e.target.value)}
                        placeholder="Subjective history, objective vitals, assessment notes..."
                        className="w-full manifesto-border p-2.5 bg-[var(--bg-card)] text-sm font-sans text-[var(--text-main)] outline-none focus:border-[var(--color-brand)]"
                      />
                    </div>

                    {/* Prescription Section */}
                    <div className="border-t border-[var(--border-main)] pt-4">
                      <h4 className="font-mono text-xs font-bold uppercase text-[var(--color-brand)] mb-2">
                        Prescription (Optional Medication Request)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={rxMedName}
                          onChange={e => setRxMedName(e.target.value)}
                          placeholder="Drug Name (e.g. Metformin 500mg)"
                          className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none"
                        />
                        <input
                          type="text"
                          value={rxDosage}
                          onChange={e => setRxDosage(e.target.value)}
                          placeholder="Dosage (e.g. 500 mg)"
                          className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none"
                        />
                        <input
                          type="text"
                          value={rxFrequency}
                          onChange={e => setRxFrequency(e.target.value)}
                          placeholder="Frequency (e.g. Twice daily)"
                          className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none"
                        />
                        <input
                          type="text"
                          value={rxDuration}
                          onChange={e => setRxDuration(e.target.value)}
                          placeholder="Duration (e.g. 30 days)"
                          className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateEncounter}
                      className="manifesto-btn-primary w-full py-2.5 text-xs font-mono font-bold uppercase mt-4"
                    >
                      Sign & Commit Clinical Encounter
                    </button>
                  </div>

                  {/* SNOMED CT Concept Search Sidebar */}
                  <div className="manifesto-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                        SNOMED CT Registry
                      </h3>
                      <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                        NRCES India
                      </span>
                    </div>

                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        Search Concept
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={snomedSearchQuery}
                          onChange={e => searchSnomed(e.target.value)}
                          placeholder="Type 'diabetes', 'hypertension'..."
                          className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none pr-8"
                        />
                        <Search className="w-3.5 h-3.5 absolute right-2.5 top-3 text-[var(--text-muted)]" />
                      </div>
                    </div>

                    {/* Selected Concept Card */}
                    {selectedSnomed ? (
                      <div className="manifesto-border p-3 bg-[#f0fdf4] border-emerald-600">
                        <div className="text-[10px] font-mono font-bold uppercase text-emerald-700">Selected Diagnosis Code:</div>
                        <div className="font-bold text-xs text-[var(--text-main)] mt-0.5">{selectedSnomed.display_name}</div>
                        <div className="font-mono text-xs text-emerald-800 font-bold mt-1">Concept ID: {selectedSnomed.concept_id}</div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs font-mono text-[var(--text-muted)] manifesto-border bg-[var(--bg-sidebar)]">
                        No concept selected yet. Search above.
                      </div>
                    )}

                    {/* Search Results */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {snomedResults.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedSnomed(item)}
                          className="manifesto-border p-2.5 text-xs cursor-pointer hover:bg-[var(--bg-card-hover)] transition-all"
                        >
                          <div className="font-bold text-[var(--text-main)]">{item.display_name}</div>
                          <div className="font-mono text-[10px] text-[var(--color-brand)]">ID: {item.concept_id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View A3: Clinical AI Copilot */}
            {activePortal === "doctor_ai" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">03 // CLINICAL DECISION SUPPORT</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      ZERO-HALLUCINATION RECORD CITATIONS
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Grounded Clinical AI Assistant
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Synthesizing longitudinal records strictly with explicit ID citations &bull; Patient: {selectedPatient?.full_name}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Synthesis Brief Box */}
                  <div className="manifesto-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                        Clinical Brief Synthesizer
                      </h3>
                      <button
                        onClick={generateAiSummary}
                        disabled={loadingAiSummary}
                        className="manifesto-btn-primary px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 uppercase"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {loadingAiSummary ? "Processing..." : "Generate Brief"}
                      </button>
                    </div>

                    {aiSummary ? (
                      <div className="space-y-3">
                        <div className="p-4 manifesto-border bg-[var(--bg-base)] text-xs text-[var(--text-main)] leading-relaxed whitespace-pre-wrap font-sans">
                          {aiSummary.summary}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-[var(--text-muted)]">Verified EHR Record Citations:</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {aiSummary.records_cited?.map((c: string, idx: number) => (
                              <span key={idx} className="manifesto-badge bg-white text-[#d42b2b] text-[10px]">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)] manifesto-border bg-[var(--bg-sidebar)]">
                        Click "Generate Brief" to synthesize a grounded summary of this patient's condition, vitals, and lab history.
                      </div>
                    )}
                  </div>

                  {/* Ask Clinical Questions Box */}
                  <div className="manifesto-card p-6 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                      Ask Questions on Patient History
                    </h3>

                    <form onSubmit={askAiAssistant} className="flex gap-2">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={e => setAiQuery(e.target.value)}
                        placeholder="e.g. What was the last HbA1c result and date?"
                        className="flex-1 manifesto-border p-2.5 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)] outline-none"
                      />
                      <button
                        type="submit"
                        disabled={loadingAiQuery || !aiQuery.trim()}
                        className="manifesto-btn-primary px-4 py-2 text-xs font-mono font-bold uppercase flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Ask
                      </button>
                    </form>

                    {aiAnswer && (
                      <div className="manifesto-border p-4 bg-[#fefce8] border-[#b45309] space-y-2">
                        <div className="font-mono text-xs font-bold text-[#b45309] uppercase">AI Response:</div>
                        <p className="text-xs text-[var(--text-main)] leading-relaxed font-sans">{aiAnswer.answer}</p>
                        {aiAnswer.citations && (
                          <div className="pt-2 border-t border-[#fde68a] flex flex-wrap gap-1">
                            {aiAnswer.citations.map((cit: string, idx: number) => (
                              <span key={idx} className="manifesto-badge bg-white text-[#b45309] text-[10px]">
                                {cit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* View A4: ABDM Health Information User (HIU) Transfer */}
            {activePortal === "doctor_abdm_hiu" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">04 // AYUSHMAN BHARAT DIGITAL MISSION</span>
                    <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                      HIU CONSENT-BASED EXCHANGE
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    ABDM HIU Health Data Transfer
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Fetch encrypted clinical document bundles across participating Indian healthcare facilities via ABDM Gateway
                  </p>
                </div>

                <div className="manifesto-card p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        HIU Client ID
                      </label>
                      <input
                        type="text"
                        disabled
                        value="MEDINDIA-HIU-APOLLO-01"
                        className="w-full manifesto-border p-2 bg-[var(--bg-sidebar)] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        Active Consent Artefact ID
                      </label>
                      <input
                        type="text"
                        value={abdmHiuConsentId}
                        onChange={e => setAbdmHiuConsentId(e.target.value)}
                        placeholder="Consent ID"
                        className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAbdmFetchData}
                        disabled={loadingAbdm}
                        className="manifesto-btn-primary w-full py-2 text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5"
                      >
                        <Network className="w-4 h-4" />
                        {loadingAbdm ? "Fetching..." : "Fetch Encrypted Bundle"}
                      </button>
                    </div>
                  </div>

                  {/* Transfer Result Output */}
                  {abdmHiuTransferResult && (
                    <div className="manifesto-border p-4 bg-[var(--bg-base)] space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold uppercase text-emerald-800">
                          Transfer Complete &bull; Status: {abdmHiuTransferResult.status}
                        </span>
                        <span className="manifesto-badge bg-[#dcfce7] text-[#166534]">
                          {abdmHiuTransferResult.resources_count} Resources Transferred
                        </span>
                      </div>

                      <div className="text-xs font-mono text-[var(--text-muted)]">
                        Bundle Type: {abdmHiuTransferResult.fhir_bundle?.resourceType} // ID: {abdmHiuTransferResult.fhir_bundle?.id}
                      </div>

                      <pre className="p-3 bg-[var(--bg-card)] manifesto-border text-[11px] font-mono max-h-[300px] overflow-y-auto">
                        {JSON.stringify(abdmHiuTransferResult.fhir_bundle, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View A5: FHIR R4 Inspector */}
            {activePortal === "fhir_inspector" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">05 // INTEROPERABILITY SPECIFICATION</span>
                    <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                      HL7 FHIR R4 &bull; NRCES
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    ABDM FHIR R4 Resource Inspector
                  </h1>
                </div>

                <div className="manifesto-card p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {["Patient", "Bundle", "Condition", "Observation", "Encounter"].map(t => (
                      <button
                        key={t}
                        onClick={() => fetchFhir(t)}
                        className={`manifesto-btn px-3 py-1.5 text-xs font-mono font-bold uppercase ${
                          selectedFhirType === t ? "bg-[var(--color-brand)] text-white" : ""
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <pre className="p-4 bg-[var(--bg-base)] manifesto-border text-xs font-mono text-[var(--text-main)] max-h-[500px] overflow-y-auto">
                    {JSON.stringify(fhirResource, null, 2) || "Loading resource..."}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            B. PATIENT PORTAL VIEWS (NO DOCTOR OR LAB BARS)
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "PATIENT" && (
          <div>
            {/* View B1: My Official ABHA Health Card */}
            {activePortal === "patient_abha" && (
              <div className="space-y-6">
                
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">01 // CITIZEN IDENTITY</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      NATIONAL HEALTH AUTHORITY
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Ayushman Bharat Health Account (ABHA)
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Your unique Indian digital health identifier &bull; Self-sovereign consent & medical history
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* The Physical ABHA Card Render */}
                  <div className="lg:col-span-2">
                    <div className="manifesto-border p-6 bg-[var(--bg-card)] shadow-[6px_6px_0_#0a0a0a] relative overflow-hidden">
                      {/* Tricolor Header Bar */}
                      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-white to-green-600 border-b border-[var(--border-main)] -mt-6 -mx-6 mb-6"></div>

                      <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#d42b2b] text-white flex items-center justify-center font-bold text-lg border border-[var(--border-main)]">
                            ₹
                          </div>
                          <div>
                            <div className="font-editorial text-lg font-bold text-[var(--text-main)]">
                              National Health Authority (NHA)
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                              Government of India &bull; Ayushman Bharat Digital Mission
                            </div>
                          </div>
                        </div>
                        <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                          VERIFIED CITIZEN
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                        {/* Profile Photo Placeholder */}
                        <div className="flex flex-col items-center justify-center p-4 manifesto-border bg-[var(--bg-base)]">
                          <User className="w-16 h-16 text-[var(--text-muted)]" />
                          <span className="text-[10px] font-mono mt-2 text-[var(--text-muted)]">PHOTO ID VERIFIED</span>
                        </div>

                        {/* Citizen Demographics */}
                        <div className="md:col-span-2 space-y-2">
                          <div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Cardholder Name</div>
                            <div className="font-editorial text-2xl font-bold text-[var(--text-main)]">
                              Rajesh Sharma
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">ABHA Address</div>
                              <div className="font-mono text-xs font-bold text-[var(--color-brand)]">rajesh.sharma@abdm</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Gender & Blood Group</div>
                              <div className="font-mono text-xs font-bold text-[var(--text-main)]">Male &bull; B Positive (B+)</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Year of Birth</div>
                              <div className="font-mono text-xs font-bold text-[var(--text-main)]">1974 (Age: 52)</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">Mobile (OTP Linked)</div>
                              <div className="font-mono text-xs font-bold text-[var(--text-main)]">+91 98765-43210</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ABHA 14-Digit Number Strip */}
                      <div className="manifesto-border p-3 bg-[var(--bg-base)] flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">14-Digit National ABHA ID Number</div>
                          <div className="font-mono text-xl font-bold tracking-widest text-[var(--text-main)]">
                            91-4405-2026-0001
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="manifesto-badge bg-[#dcfce7] text-[#166534]">
                            HIP ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Summary & Privacy Controls */}
                  <div className="manifesto-card p-6 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                      Patient Safety & Emergency
                    </h3>

                    <div className="space-y-3 font-mono text-xs">
                      <div className="manifesto-border p-2.5 bg-[var(--bg-base)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Chronic Diagnoses</div>
                        <div className="font-bold text-[var(--text-main)] mt-0.5">Type 2 Diabetes Mellitus</div>
                        <div className="font-bold text-[var(--text-main)]">Essential Hypertension</div>
                      </div>

                      <div className="manifesto-border p-2.5 bg-[var(--bg-base)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Emergency Contact</div>
                        <div className="font-bold text-[var(--text-main)] mt-0.5">Sunita Sharma (Spouse)</div>
                        <div className="text-[var(--text-muted)]">+91 98765-43211</div>
                      </div>

                      <div className="manifesto-border p-2.5 bg-[var(--bg-base)]">
                        <div className="text-[10px] text-[var(--text-muted)] uppercase">Active Consent Status</div>
                        <div className="font-bold text-emerald-700 mt-0.5">
                          {consents.filter(c => c.status === "ACTIVE").length} Authorized Doctors
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* View B2: My Health Records Timeline */}
            {activePortal === "patient_records" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">02 // PERSONAL HEALTH RECORDS</span>
                    <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                      LONGITUDINAL EHR
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    My Medical Records & Lab History
                  </h1>
                </div>

                {/* Explaining Lab Report Modal if active */}
                {explainingReport && (
                  <div className="manifesto-card p-5 bg-[#fefce8] border-[#b45309] shadow-[3px_3px_0_#b45309]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold uppercase text-[#b45309]">
                        Plain-Language Lab Explanation for Patients
                      </span>
                      <button
                        onClick={() => setExplainingReport(null)}
                        className="text-xs font-mono text-[#b45309] hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-xs text-[var(--text-main)] leading-relaxed whitespace-pre-wrap font-sans">
                      {explainingReport.explanation}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {timeline?.events?.map((evt: any, i: number) => (
                    <div
                      key={i}
                      className="manifesto-card p-5 space-y-2"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                            {evt.event_type}
                          </span>
                          <span className="font-bold text-sm text-[var(--text-main)]">{evt.title}</span>
                        </div>
                        <span className="font-mono text-xs text-[var(--text-muted)]">{evt.timestamp}</span>
                      </div>

                      <p className="text-xs text-[var(--text-muted)] font-sans">{evt.description}</p>

                      {evt.event_type === "DIAGNOSTIC_REPORT" && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleExplainReport(evt.record_id)}
                            disabled={loadingLabExplainer}
                            className="manifesto-btn px-3 py-1 text-[11px] font-mono font-bold text-[#b45309] flex items-center gap-1.5"
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

            {/* View B3: Consent Manager (Grant & Revoke) */}
            {activePortal === "patient_consent" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">03 // SELF-SOVEREIGN PRIVACY</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      ABDM CONSENT DIRECTIVE
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Consent & Data Access Manager
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Grant, scope, or immediately revoke access permissions for attending physicians and hospitals
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Grant New Consent Drawer */}
                  <div className="manifesto-card p-6 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                      Grant New Consent
                    </h3>

                    <form onSubmit={handleGrantConsent} className="space-y-3">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                          Select Practitioner
                        </label>
                        <select
                          value={grantDoctorId}
                          onChange={e => setGrantDoctorId(e.target.value)}
                          className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans"
                        >
                          {doctorsList.map(doc => (
                            <option key={doc.practitioner_id} value={doc.practitioner_id}>
                              {doc.full_name} ({doc.hospital_affiliation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                          Health Record Scope
                        </label>
                        <select
                          value={grantCategory}
                          onChange={e => setGrantCategory(e.target.value)}
                          className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans"
                        >
                          <option value="ALL_RECORDS">All Clinical Records</option>
                          <option value="DIAGNOSTIC_REPORT">Lab & Diagnostics Only</option>
                          <option value="PRESCRIPTION">Prescriptions Only</option>
                          <option value="CONDITION">Diagnosed Conditions Only</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="manifesto-btn-primary w-full py-2 text-xs font-mono font-bold uppercase mt-2"
                      >
                        Authorize Consent Artifact
                      </button>
                    </form>
                  </div>

                  {/* Active Consents List */}
                  <div className="lg:col-span-2 manifesto-card p-6 space-y-4">
                    <h3 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                      Active Access Consents ({consents.length})
                    </h3>

                    <div className="space-y-3">
                      {consents.map(c => (
                        <div
                          key={c.consent_id}
                          className="manifesto-border p-4 bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[var(--text-main)]">
                                {c.doctor_name}
                              </span>
                              <span className={`manifesto-badge ${c.status === "ACTIVE" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#d42b2b]"}`}>
                                {c.status}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                              Purpose: {c.purpose} &bull; Categories: {c.categories?.join(", ")}
                            </div>
                            <div className="text-[11px] text-[var(--text-subtle)] font-mono">
                              Valid until: {c.valid_to}
                            </div>
                          </div>

                          {c.status === "ACTIVE" && (
                            <button
                              onClick={() => handleRevokeConsent(c.consent_id)}
                              className="manifesto-btn px-3 py-1.5 text-xs font-mono font-bold uppercase text-[#d42b2b] hover:bg-[#fee2e2]"
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

            {/* View B4: Transparency & Audit Trail */}
            {activePortal === "patient_audit" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">04 // PRIVACY AUDIT TRAIL</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      IMMUTABLE LOG
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Transparent Data Access Audit Log
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Real-time verification of who accessed your records, which consent artifact was verified, and the purpose
                  </p>
                </div>

                <div className="manifesto-card p-6 space-y-4">
                  <div className="space-y-2">
                    {auditLogs.map((log: any, idx: number) => (
                      <div
                        key={idx}
                        className="manifesto-border p-3 bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between text-xs font-mono gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">{log.actor_role}</span>
                          <span className="font-bold text-[var(--text-main)]">{log.action}</span>
                          {log.resource_type && (
                            <span className="text-[var(--text-muted)]">[{log.resource_type}]</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[var(--text-subtle)]">
                          <span>Purpose: {log.purpose || "CONSULTATION"}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View B5: Reminders & Alerts */}
            {activePortal === "patient_reminders" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">05 // CARE REMINDERS</span>
                    <span className="manifesto-badge bg-[#fef3c7] text-[#92400e]">
                      MEDICATION SCHEDULE
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Care Reminders & Upcoming Actions
                  </h1>
                </div>

                <div className="manifesto-card p-6 space-y-3">
                  {notifications.map((n: any, idx: number) => (
                    <div
                      key={idx}
                      className="manifesto-border p-4 bg-[var(--bg-card)] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-[var(--text-main)]">{n.title}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{n.message}</div>
                      </div>
                      <span className="font-mono text-xs text-[var(--text-subtle)]">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            C. LAB OPERATIONS PORTAL VIEWS (NO DOCTOR OR PATIENT BARS)
            ───────────────────────────────────────────────────────────── */}
        {currentRole === "LAB" && (
          <div>
            {/* View C1: Requisition Queue */}
            {activePortal === "lab_queue" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">01 // LABORATORY QUEUE</span>
                    <span className="manifesto-badge bg-[#ccfbf1] text-[#0f766e]">
                      NABL ACCREDITED: NABL-DL-2026-891
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    Diagnostic Requisition & Testing Queue
                  </h1>
                  <p className="text-xs text-[var(--text-muted)] font-mono mt-0.5">
                    Dr. Lal PathLabs National Reference Lab &bull; New Delhi Central Hub
                  </p>
                </div>

                {/* Lab Result Entry Form (if order selected) */}
                {selectedLabOrder && (
                  <div className="manifesto-card p-6 bg-[#f0fdf4] border-emerald-600 shadow-[4px_4px_0_#15803d] space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-300 pb-2">
                      <h3 className="font-editorial text-lg font-bold text-emerald-950">
                        Record Test Result: {selectedLabOrder.test_name}
                      </h3>
                      <button
                        onClick={() => setSelectedLabOrder(null)}
                        className="text-xs font-mono text-emerald-800 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSubmitLabResults} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-emerald-900 mb-1">
                          Quantitative Value
                        </label>
                        <input
                          type="text"
                          value={labObsValue}
                          onChange={e => setLabObsValue(e.target.value)}
                          placeholder="e.g. 142 or 78,000"
                          className="w-full manifesto-border p-2 bg-white text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-mono text-xs font-bold uppercase text-emerald-900 mb-1">
                          Reference Range
                        </label>
                        <input
                          type="text"
                          value={labObsRange}
                          onChange={e => setLabObsRange(e.target.value)}
                          placeholder="e.g. 70-110 mg/dL"
                          className="w-full manifesto-border p-2 bg-white text-xs font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="abnormalCheck"
                          checked={labObsAbnormal}
                          onChange={e => setLabObsAbnormal(e.target.checked)}
                          className="w-4 h-4 accent-[#d42b2b]"
                        />
                        <label htmlFor="abnormalCheck" className="font-mono text-xs font-bold text-[#d42b2b] uppercase">
                          Flag Abnormal / Critical Panic Value
                        </label>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block font-mono text-xs font-bold uppercase text-emerald-900 mb-1">
                          Diagnostic Conclusion & Clinical Correlation
                        </label>
                        <input
                          type="text"
                          value={labConclusion}
                          onChange={e => setLabConclusion(e.target.value)}
                          placeholder="Conclusion notes signed by pathologist..."
                          className="w-full manifesto-border p-2 bg-white text-xs font-sans"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <button
                          type="submit"
                          className="manifesto-btn-primary w-full py-2.5 text-xs font-mono font-bold uppercase"
                        >
                          Sign, Verify & Publish to ABDM Care Context
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Orders List */}
                <div className="manifesto-card p-6 space-y-4">
                  <div className="space-y-3">
                    {labOrders.map(order => (
                      <div
                        key={order.order_id}
                        className="manifesto-border p-4 bg-[var(--bg-card)] flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--text-main)]">{order.test_name}</span>
                            <span className={`manifesto-badge ${order.priority === "URGENT" ? "bg-[#fee2e2] text-[#d42b2b]" : "bg-[#f5f0e8] text-[#0a0a0a]"}`}>
                              {order.priority || "ROUTINE"}
                            </span>
                            <span className="manifesto-badge bg-[#dbeafe] text-[#1e40af]">
                              {order.status}
                            </span>
                          </div>
                          <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                            Patient ABHA: {order.patient_id} &bull; Ordered by Doctor: {order.doctor_id}
                          </div>
                        </div>

                        {order.status !== "COMPLETED" && (
                          <button
                            onClick={() => setSelectedLabOrder(order)}
                            className="manifesto-btn-primary px-3 py-1.5 text-xs font-mono font-bold uppercase"
                          >
                            Enter Results
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View C2: ABDM HIP Care Context Discovery */}
            {activePortal === "lab_abdm_hip" && (
              <div className="space-y-6">
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">02 // HEALTH INFORMATION PROVIDER (HIP)</span>
                    <span className="manifesto-badge bg-[#fee2e2] text-[#d42b2b]">
                      ABDM MILESTONE 2
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    ABDM Care Context Discovery & Linking
                  </h1>
                </div>

                <div className="manifesto-card p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                        Patient ABHA Address
                      </label>
                      <input
                        type="text"
                        value={abdmAbhaInput}
                        onChange={e => setAbdmAbhaInput(e.target.value)}
                        className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleAbdmDiscover}
                        disabled={loadingAbdm}
                        className="manifesto-btn-primary w-full py-2 text-xs font-mono font-bold uppercase"
                      >
                        {loadingAbdm ? "Discovering..." : "Discover Care Contexts"}
                      </button>
                    </div>
                  </div>

                  {abdmDiscovered && (
                    <div className="manifesto-border p-4 bg-[var(--bg-base)] space-y-3 mt-4">
                      <div className="font-mono text-xs font-bold uppercase text-[var(--color-brand)]">
                        Discovered {abdmDiscovered.care_contexts?.length} Care Contexts at this HIP:
                      </div>

                      <div className="space-y-2">
                        {abdmDiscovered.care_contexts?.map((cc: any, idx: number) => (
                          <div key={idx} className="manifesto-border p-2 bg-white text-xs font-mono flex justify-between">
                            <span className="font-bold">{cc.display}</span>
                            <span className="text-[var(--text-muted)]">Ref: {cc.reference_number}</span>
                          </div>
                        ))}
                      </div>

                      {/* OTP Confirmation Simulator */}
                      <div className="pt-3 border-t border-[var(--border-main)] flex items-center gap-3">
                        <input
                          type="text"
                          value={abdmOtpInput}
                          onChange={e => setAbdmOtpInput(e.target.value)}
                          placeholder="OTP"
                          className="manifesto-border p-1.5 text-xs font-mono w-24 bg-white"
                        />
                        <button
                          onClick={handleAbdmConfirmLink}
                          disabled={loadingAbdm}
                          className="manifesto-btn px-3 py-1.5 text-xs font-mono font-bold uppercase"
                        >
                          Verify OTP & Link
                        </button>
                        {abdmLinkStatus && (
                          <span className="text-xs font-mono font-bold text-emerald-700">{abdmLinkStatus}</span>
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
                <div className="border-b border-[var(--border-main)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--color-brand)]">03 // ACCREDITATION & QUALITY</span>
                    <span className="manifesto-badge bg-[#ccfbf1] text-[#0f766e]">
                      ISO 15189:2022
                    </span>
                  </div>
                  <h1 className="font-editorial text-3xl font-bold text-[var(--text-main)] mt-1">
                    NABL Laboratory Standards Profile
                  </h1>
                </div>

                <div className="manifesto-card p-6 space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="manifesto-border p-3 bg-[var(--bg-base)]">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase">License Number</div>
                      <div className="font-bold text-sm text-[var(--text-main)] mt-0.5">NABL-DL-2026-891</div>
                    </div>
                    <div className="manifesto-border p-3 bg-[var(--bg-base)]">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase">Facility Name</div>
                      <div className="font-bold text-sm text-[var(--text-main)] mt-0.5">Dr. Lal PathLabs National Reference Lab</div>
                    </div>
                    <div className="manifesto-border p-3 bg-[var(--bg-base)]">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase">Scope of Accreditation</div>
                      <div className="font-bold text-sm text-[var(--text-main)] mt-0.5">Clinical Biochemistry, Hematology, Molecular Diagnostics</div>
                    </div>
                    <div className="manifesto-border p-3 bg-[var(--bg-base)]">
                      <div className="text-[10px] text-[var(--text-muted)] uppercase">ABDM HIP Endpoint</div>
                      <div className="font-bold text-sm text-[var(--text-main)] mt-0.5">hip.medindia.health/abdm/v1</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── PERSONA SWITCHER & LOGIN MODAL ── */}
      {showPersonaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="manifesto-card w-full max-w-xl bg-[var(--bg-card)] p-6 shadow-[8px_8px_0_#0a0a0a] space-y-5">
            
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
              <div>
                <div className="font-mono text-xs font-bold uppercase text-[var(--color-brand)]">
                  USER SWITCHER & AUTHENTICATION
                </div>
                <h2 className="font-editorial text-2xl font-bold text-[var(--text-main)]">
                  Switch Active Portal Persona
                </h2>
              </div>
              <button
                onClick={() => setShowPersonaModal(false)}
                className="manifesto-btn p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 1-Click Persona Cards */}
            <div>
              <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
                1-Click Preset Roles (Dedicated Application Experience)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                {/* Doctor Persona */}
                <div
                  onClick={() => switchPersona("DOCTOR")}
                  className={`manifesto-border p-3 cursor-pointer transition-all ${
                    currentRole === "DOCTOR"
                      ? "bg-[#fee2e2] border-[var(--color-brand)] shadow-[3px_3px_0_var(--color-brand)]"
                      : "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[var(--color-brand)] font-bold text-xs font-mono">
                    <Stethoscope className="w-4 h-4" /> DOCTOR
                  </div>
                  <div className="font-bold text-xs text-[var(--text-main)] mt-1">Dr. Arvind Swaminathan</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">NMC: MCI-74892</div>
                </div>

                {/* Patient Persona */}
                <div
                  onClick={() => switchPersona("PATIENT")}
                  className={`manifesto-border p-3 cursor-pointer transition-all ${
                    currentRole === "PATIENT"
                      ? "bg-[#fee2e2] border-[var(--color-brand)] shadow-[3px_3px_0_var(--color-brand)]"
                      : "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[var(--color-brand)] font-bold text-xs font-mono">
                    <User className="w-4 h-4" /> PATIENT
                  </div>
                  <div className="font-bold text-xs text-[var(--text-main)] mt-1">Rajesh Sharma</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">ABHA: 91-4405-2026-0001</div>
                </div>

                {/* Lab Persona */}
                <div
                  onClick={() => switchPersona("LAB")}
                  className={`manifesto-border p-3 cursor-pointer transition-all ${
                    currentRole === "LAB"
                      ? "bg-[#fee2e2] border-[var(--color-brand)] shadow-[3px_3px_0_var(--color-brand)]"
                      : "bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[var(--color-brand)] font-bold text-xs font-mono">
                    <FlaskConical className="w-4 h-4" /> LAB
                  </div>
                  <div className="font-bold text-xs text-[var(--text-main)] mt-1">Dr. Lal PathLabs</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono">NABL: DL-2026-891</div>
                </div>
              </div>
            </div>

            {/* Custom Credentials Form */}
            <div className="border-t border-[var(--border-main)] pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold uppercase text-[var(--text-muted)]">
                  Or Sign In with Custom Account
                </span>
                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-mono text-[var(--color-brand)] hover:underline"
                >
                  {isRegisterMode ? "Switch to Login" : "Create New Account"}
                </button>
              </div>

              {authError && (
                <div className="manifesto-border p-2 bg-[#fee2e2] text-[#d42b2b] text-xs font-mono mb-2">
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
                      className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    required
                    className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    required
                    className="manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                  />
                </div>
                {isRegisterMode && (
                  <div>
                    <select
                      value={authRole}
                      onChange={e => setAuthRole(e.target.value)}
                      className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                    >
                      <option value="PATIENT">Patient Account</option>
                      <option value="DOCTOR">Doctor / Practitioner</option>
                      <option value="LAB">Diagnostic Lab Staff</option>
                    </select>
                  </div>
                )}
                <button
                  type="submit"
                  className="manifesto-btn-primary w-full py-2 text-xs font-mono font-bold uppercase"
                >
                  {isRegisterMode ? "Register & Enter Portal" : "Authenticate Account"}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ── Document Clinical Encounter Modal (Doctor) ── */}
      {showEncounterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="manifesto-card w-full max-w-2xl bg-[var(--bg-card)] p-6 shadow-[8px_8px_0_#0a0a0a] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
              <div>
                <div className="font-mono text-xs font-bold uppercase text-[var(--color-brand)]">
                  EHR VISIT DOCUMENTATION
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[var(--text-main)]">
                  Consultation for {selectedPatient?.full_name}
                </h3>
              </div>
              <button onClick={() => setShowEncounterModal(false)} className="manifesto-btn p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Reason for Encounter
                </label>
                <input
                  type="text"
                  value={encounterReason}
                  onChange={e => setEncounterReason(e.target.value)}
                  placeholder="e.g. Follow-up consultation for HbA1c review"
                  className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Search & Select SNOMED CT Concept
                </label>
                <input
                  type="text"
                  value={snomedSearchQuery}
                  onChange={e => searchSnomed(e.target.value)}
                  placeholder="Type to search authentic SNOMED CT concepts..."
                  className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                />
                {snomedResults.length > 0 && (
                  <div className="mt-1 manifesto-border max-h-36 overflow-y-auto bg-[var(--bg-card)]">
                    {snomedResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedSnomed(item);
                          setSnomedResults([]);
                        }}
                        className="p-2 text-xs hover:bg-[var(--bg-card-hover)] cursor-pointer border-b border-[var(--border-subtle)]"
                      >
                        <span className="font-bold">{item.display_name}</span>
                        <span className="font-mono text-[10px] text-[var(--color-brand)] ml-2">[{item.concept_id}]</span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedSnomed && (
                  <div className="mt-2 text-xs font-mono text-emerald-800 font-bold">
                    Active Coded Diagnosis: {selectedSnomed.display_name} ({selectedSnomed.concept_id})
                  </div>
                )}
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase text-[var(--text-muted)] mb-1">
                  Clinical Progress Notes
                </label>
                <textarea
                  rows={3}
                  value={encounterNotes}
                  onChange={e => setEncounterNotes(e.target.value)}
                  placeholder="Clinical observations, vital signs assessment, management plan..."
                  className="w-full manifesto-border p-2 bg-[var(--bg-card)] text-xs font-sans text-[var(--text-main)]"
                />
              </div>

              <div className="border-t border-[var(--border-main)] pt-3">
                <h4 className="font-mono text-xs font-bold uppercase text-[var(--color-brand)] mb-2">
                  Prescription Order
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Medication Name"
                    value={rxMedName}
                    onChange={e => setRxMedName(e.target.value)}
                    className="manifesto-border p-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={rxDosage}
                    onChange={e => setRxDosage(e.target.value)}
                    className="manifesto-border p-2 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="manifesto-btn-primary w-full py-2.5 text-xs font-mono font-bold uppercase"
              >
                Sign & Save Encounter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Sovereign Old Regime Architectural Footer ── */}
      <footer className="bg-[var(--bg-card)] border-t border-[var(--border-main)] py-4 px-6 mt-12 text-xs font-mono text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-main)]">MedIndia HealthOS</span>
            <span>&bull;</span>
            <span>National Health Authority Compliant</span>
            <span>&bull;</span>
            <span>SNOMED CT Release 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Security: AES-GCM + SHA-256</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-bold">● Network Sync Healthy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
