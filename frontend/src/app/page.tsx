"use client";

import React, { useState, useEffect } from "react";
import {
  Activity, ShieldCheck, Stethoscope, User, FlaskConical, Bell,
  FileText, CheckCircle2, AlertTriangle, Clock, Calendar, Lock,
  Search, Plus, Sparkles, Send, RefreshCw, ChevronRight, X, Eye, FileCode2
} from "lucide-react";

export default function Home() {
  const [activePortal, setActivePortal] = useState<"doctor" | "patient" | "lab" | "consent" | "fhir" | "audit">("doctor");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [timeline, setTimeline] = useState<any>(null);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [consents, setConsents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // AI state
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<any>(null);
  const [loadingAiQuery, setLoadingAiQuery] = useState(false);
  const [explainingReport, setExplainingReport] = useState<any>(null);
  const [loadingLabExplainer, setLoadingLabExplainer] = useState(false);

  // Encounter & Lab form state
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

  // Lab submit modal
  const [selectedLabOrder, setSelectedLabOrder] = useState<any>(null);
  const [labObsValue, setLabObsValue] = useState("");
  const [labObsRange, setLabObsRange] = useState("");
  const [labObsAbnormal, setLabObsAbnormal] = useState(false);
  const [labConclusion, setLabConclusion] = useState("");

  // Consent form
  const [grantDoctorId, setGrantDoctorId] = useState("");
  const [grantPurpose, setGrantPurpose] = useState("CONSULTATION");
  const [grantCategory, setGrantCategory] = useState("ALL_RECORDS");
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  // FHIR viewer
  const [fhirResource, setFhirResource] = useState<any>(null);
  const [selectedFhirType, setSelectedFhirType] = useState("Patient");

  // Auth tokens (demo profiles)
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    initAuthAndData();
  }, []);

  const initAuthAndData = async () => {
    try {
      // 1. Login doctor
      const docRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "dr.arvind@apollo.in", password: "Doctor123!" })
      });
      const docData = await docRes.json();

      // 2. Login patient
      const patRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "rajesh.sharma@example.in", password: "Password123!" })
      });
      const patData = await patRes.json();

      // 3. Login lab
      const labRes = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "delhi.lab@lalpathlabs.com", password: "Lab12345!" })
      });
      const labData = await labRes.json();

      const newTokens = {
        doctor: docData.access_token,
        patient: patData.access_token,
        lab: labData.access_token
      };
      setTokens(newTokens);

      // Load authorized patients for doctor
      const pRes = await fetch("http://localhost:8000/api/v1/doctors/authorized-patients", {
        headers: { Authorization: `Bearer ${newTokens.doctor}` }
      });
      const pList = await pRes.json();
      if (Array.isArray(pList) && pList.length > 0) {
        setPatients(pList);
        setSelectedPatientId(pList[0].patient_id);
        fetchTimeline(pList[0].patient_id, newTokens.doctor);
      }

      // Load lab orders
      fetchLabOrders(newTokens.lab);

      // Load notifications
      fetchNotifications(newTokens.patient);

      // Load consents & doctors
      fetchConsents(newTokens.patient);
      fetchDoctorsList(newTokens.patient);

      // Load audit logs
      fetchAuditLogs(newTokens.patient);

    } catch (err) {
      console.error("Initialization error:", err);
    }
  };

  const fetchTimeline = async (patientId: string, token = tokens.doctor) => {
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
      console.error("Error fetching timeline:", err);
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

  const fetchDoctorsList = async (token = tokens.patient) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/consent/doctors-list", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDoctorsList(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setGrantDoctorId(data[0].id);
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
    if (!selectedPatientId) return;
    try {
      let url = `http://localhost:8000/api/fhir/${resourceType}/${selectedPatientId}`;
      if (resourceType !== "Patient") {
        url = `http://localhost:8000/api/fhir/${resourceType}?patient=${selectedPatientId}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setFhirResource(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Grounded AI Summary
  const handleGenerateSummary = async () => {
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

  // AI Grounded Query
  const handleAskQuery = async (queryText?: string) => {
    const q = queryText || aiQuery;
    if (!q || !selectedPatientId) return;
    setLoadingAiQuery(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({ patient_id: selectedPatientId, query: q })
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

  // Lab report explanation
  const handleExplainLab = async (reportId: string) => {
    setLoadingLabExplainer(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/ai/explain-lab/${reportId}`, {
        headers: { Authorization: `Bearer ${tokens.patient}` }
      });
      const data = await res.json();
      setExplainingReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLabExplainer(false);
    }
  };

  // SNOMED CT Search
  const searchSnomed = async (q: string) => {
    setSnomedSearchQuery(q);
    if (!q || q.length < 2) {
      setSnomedResults([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/v1/terminology/snomed/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSnomedResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Encounter
  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedSnomed) return;

    try {
      const res = await fetch("http://localhost:8000/api/v1/doctors/encounters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.doctor}`
        },
        body: JSON.stringify({
          patient_id: selectedPatientId,
          encounter_type: "AMBULATORY",
          reason: encounterReason || "Clinical Evaluation",
          clinical_notes: encounterNotes,
          conditions: [
            {
              snomed_code: selectedSnomed.code,
              display_name: selectedSnomed.display,
              clinical_status: "ACTIVE",
              severity: "MODERATE"
            }
          ],
          prescriptions: rxMedName ? [
            {
              medication_name: rxMedName,
              dosage: rxDosage,
              frequency: rxFrequency,
              duration: rxDuration
            }
          ] : []
        })
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

  // Submit Lab Results
  const handleSubmitLabResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabOrder) return;

    try {
      const res = await fetch(`http://localhost:8000/api/v1/labs/orders/${selectedLabOrder.id}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokens.lab}`
        },
        body: JSON.stringify({
          conclusion: labConclusion || "Diagnostic investigation completed. Report verified by Laboratory Specialist.",
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

  // Grant Consent
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

  // Revoke Consent
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MedIndia HealthOS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                  ABDM &bull; FHIR R4
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                  SNOMED CT
                </span>
              </div>
              <p className="text-xs text-slate-400">Consent-Driven Electronic Health Record Platform for India</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActivePortal("doctor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "doctor"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Doctor Workspace
            </button>

            <button
              onClick={() => setActivePortal("patient")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "patient"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Patient Health Portal
            </button>

            <button
              onClick={() => setActivePortal("lab")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "lab"
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              Lab Operations
            </button>

            <button
              onClick={() => setActivePortal("consent")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "consent"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Consent Hub
            </button>

            <button
              onClick={() => {
                setActivePortal("fhir");
                fetchFhir("Patient");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "fhir"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              FHIR Inspector
            </button>

            <button
              onClick={() => setActivePortal("audit")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePortal === "audit"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Audit Trail
            </button>
          </nav>

          {/* Quick Stats / Active User */}
          <div className="flex items-center gap-3">
            <div className="relative cursor-pointer" title="Reminders & Notifications">
              <div className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-semibold text-white">
                {activePortal === "doctor" && "Dr. Arvind Swaminathan, MD"}
                {activePortal === "patient" && "Rajesh Sharma (Patient)"}
                {activePortal === "lab" && "Dr. Lal PathLabs Tech"}
                {["consent", "fhir", "audit"].includes(activePortal) && "Rajesh Sharma (ABHA Owner)"}
              </div>
              <div className="text-[11px] text-teal-400 font-mono">
                {activePortal === "doctor" && "MCI-74892 &bull; Apollo Hospitals"}
                {activePortal === "patient" && "ABHA: 91-4405-2026-0001"}
                {activePortal === "lab" && "NABL-DL-2026-891"}
                {["consent", "fhir", "audit"].includes(activePortal) && "ABHA Connected"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* ========================================================================= */}
        {/* PORTAL 1: DOCTOR WORKSPACE                                                */}
        {/* ========================================================================= */}
        {activePortal === "doctor" && (
          <div className="space-y-6">
            {/* Patient Selector & Consent Gate Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Select Consent-Authorized Patient
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => {
                      setSelectedPatientId(e.target.value);
                      fetchTimeline(e.target.value);
                    }}
                    className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.full_name} (ABHA: {p.abha_id}) &bull; {p.purpose}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatient && (
                  <div className="border-l border-slate-200 pl-4 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{selectedPatient.full_name}</span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {selectedPatient.gender}, DOB: {selectedPatient.date_of_birth}
                      </span>
                      <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                        Allergy: Penicillin
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Consent Active ({selectedPatient.categories?.join(", ")})
                      </span>
                      <span>&bull;</span>
                      <span>Valid until {new Date(selectedPatient.valid_until).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEncounterModal(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition"
                >
                  <Plus className="w-4 h-4 text-teal-400" />
                  Record Encounter (SNOMED + Rx)
                </button>
              </div>
            </div>

            {/* Main Grid: Clinical Timeline & AI Copilot */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Clinical Timeline */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600" />
                        Longitudinal Health Record Timeline
                      </h2>
                      <p className="text-xs text-slate-500">Chronological clinical events across consultations, diagnoses, and lab results</p>
                    </div>
                    <button
                      onClick={() => fetchTimeline(selectedPatientId)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                      title="Refresh timeline"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingTimeline ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {loadingTimeline ? (
                    <div className="py-12 text-center text-slate-400 text-sm">Loading longitudinal health records...</div>
                  ) : timeline?.events?.length > 0 ? (
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      {timeline.events.map((ev: any) => (
                        <div key={ev.id} className="relative group">
                          {/* Dot Icon */}
                          <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow ${
                            ev.type === "ENCOUNTER" ? "bg-teal-600" :
                            ev.type === "DIAGNOSIS" ? "bg-indigo-600" :
                            ev.type === "PRESCRIPTION" ? "bg-amber-600" : "bg-sky-600"
                          }`}>
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>

                          <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200/60 transition">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                                {ev.type === "ENCOUNTER" && <Stethoscope className="w-3.5 h-3.5 text-teal-600" />}
                                {ev.type === "DIAGNOSIS" && <Activity className="w-3.5 h-3.5 text-indigo-600" />}
                                {ev.type === "PRESCRIPTION" && <FileText className="w-3.5 h-3.5 text-amber-600" />}
                                {ev.type === "LAB_REPORT" && <FlaskConical className="w-3.5 h-3.5 text-sky-600" />}
                                {ev.type}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            </div>

                            <h3 className="text-sm font-semibold text-slate-900">{ev.title}</h3>

                            {/* Diagnosis Details */}
                            {ev.snomed_code && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                                  SNOMED CT: {ev.snomed_code}
                                </span>
                                <span className="text-xs text-slate-500">Status: {ev.status}</span>
                              </div>
                            )}

                            {/* Prescription Details */}
                            {ev.dosage && (
                              <div className="mt-2 text-xs text-slate-600 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
                                <p className="font-semibold text-amber-900">{ev.dosage} &bull; {ev.frequency} ({ev.duration})</p>
                                {ev.instructions && <p className="text-slate-500 mt-0.5">{ev.instructions}</p>}
                              </div>
                            )}

                            {/* Lab Observations */}
                            {ev.observations && ev.observations.length > 0 && (
                              <div className="mt-2.5 space-y-1.5">
                                {ev.observations.map((obs: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                                    <span className="font-medium text-slate-700">{obs.name}</span>
                                    <div className="flex items-center gap-3">
                                      <span className={`font-mono font-bold ${obs.is_abnormal ? "text-red-600" : "text-slate-800"}`}>
                                        {obs.value} {obs.unit}
                                      </span>
                                      <span className="text-[11px] text-slate-400">Ref: {obs.range}</span>
                                      {obs.is_abnormal && (
                                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                                          HIGH
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {ev.conclusion && (
                                  <p className="text-xs text-slate-600 italic mt-1">Conclusion: {ev.conclusion}</p>
                                )}
                              </div>
                            )}

                            {/* Notes */}
                            {ev.notes && (
                              <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                                {ev.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-sm">No clinical events found for this patient.</div>
                  )}
                </div>
              </div>

              {/* Right Col: AI Clinical Copilot */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      AI Clinical Copilot
                    </h2>
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded border border-teal-200">
                      Grounded in EHR
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Decision-support assistant querying longitudinal patient records. Strict anti-hallucination citations.
                  </p>

                  <button
                    onClick={handleGenerateSummary}
                    disabled={loadingAiSummary}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {loadingAiSummary ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate Grounded Clinical Brief
                  </button>

                  {/* AI Summary Output */}
                  {aiSummary && (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-teal-200/80 text-xs space-y-2">
                      <div className="font-semibold text-slate-800">Synthesized Summary:</div>
                      <p className="text-slate-600 leading-relaxed">{aiSummary.summary}</p>

                      <div className="pt-2 border-t border-slate-200">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Grounded Citations ({aiSummary.grounded_record_ids?.length}):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {aiSummary.grounded_record_ids?.map((id: string, i: number) => (
                            <span key={i} className="text-[10px] font-mono bg-white text-teal-800 px-1.5 py-0.5 rounded border border-slate-200">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 italic pt-1">{aiSummary.disclaimer}</p>
                    </div>
                  )}

                  {/* Interactive EHR Chat */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Inquire Patient History (RAG Retrieval)
                    </label>

                    {/* Pre-canned query chips */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => handleAskQuery("What were the patient's recent blood sugar and HbA1c test results?")}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition text-left"
                      >
                        Recent blood sugar & HbA1c?
                      </button>
                      <button
                        onClick={() => handleAskQuery("What active medications are prescribed?")}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded transition text-left"
                      >
                        Active medications?
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ask anything about this patient..."
                        className="flex-1 bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleAskQuery()}
                        disabled={loadingAiQuery || !aiQuery}
                        className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {aiAnswer && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2 mt-2">
                        <div className="font-semibold text-slate-800">Answer:</div>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed font-sans">{aiAnswer.answer}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {aiAnswer.grounded_record_ids?.map((id: string, i: number) => (
                            <span key={i} className="text-[10px] font-mono bg-white text-slate-600 px-1 py-0.5 rounded border">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PORTAL 2: PATIENT HEALTH PORTAL                                           */}
        {/* ========================================================================= */}
        {activePortal === "patient" && (
          <div className="space-y-6">
            {/* Indian ABHA Digital Health Card */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-teal-500/30">
              <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 font-bold text-2xl">
                    RS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight">Rajesh Sharma</h2>
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                    </div>
                    <p className="text-xs text-slate-300 font-mono mt-0.5">
                      ABHA ID: <span className="text-teal-300 font-bold">91-4405-2026-0001</span> &bull; rajesh.sharma@abdm
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span>Age: 48 (Male)</span>
                      <span>&bull;</span>
                      <span>Blood Group: B+</span>
                      <span>&bull;</span>
                      <span>Dwarka Sector 12, New Delhi</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/80 backdrop-blur border border-teal-500/30 p-3 rounded-2xl text-right space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Consent Status</div>
                  <div className="text-xs font-bold text-teal-300 flex items-center justify-end gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    1 Doctor Authorized (Apollo Hospitals)
                  </div>
                  <button
                    onClick={() => setActivePortal("consent")}
                    className="text-[11px] text-slate-300 underline hover:text-white"
                  >
                    Manage Consent Permissions
                  </button>
                </div>
              </div>
            </div>

            {/* Patient Records: Timeline, Labs, & AI Explainer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    My Health Records & Timeline
                  </h3>

                  {timeline?.events?.map((ev: any) => (
                    <div key={ev.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{ev.title}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(ev.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {ev.observations && (
                        <div className="space-y-1.5 pt-1">
                          {ev.observations.map((obs: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                              <span className="text-slate-600">{obs.name}</span>
                              <span className={`font-mono font-bold ${obs.is_abnormal ? "text-red-600" : "text-slate-800"}`}>
                                {obs.value} {obs.unit} (Normal: {obs.range})
                              </span>
                            </div>
                          ))}

                          {ev.report_id && (
                            <button
                              onClick={() => handleExplainLab(ev.report_id)}
                              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                              AI: Explain My Lab Report in Simple Words
                            </button>
                          )}
                        </div>
                      )}

                      {ev.dosage && (
                        <p className="text-xs text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-200/60">
                          Dosage: {ev.dosage}, {ev.frequency} ({ev.duration}). Doctor: {ev.doctor}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders & Notifications Inbox */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-600" />
                    Patient Reminder Center
                  </h3>
                  <p className="text-xs text-slate-500">Scheduled reminders for appointments, medications, and lab reports</p>

                  <div className="space-y-2.5">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-teal-700 font-mono bg-teal-50 px-1.5 py-0.5 rounded">
                            {n.type}
                          </span>
                        </div>
                        <p className="text-slate-600">{n.message}</p>
                        <div className="text-[10px] text-slate-400">
                          Scheduled: {new Date(n.scheduled_time).toLocaleString("en-IN", { hour: "numeric", minute: "numeric", month: "short", day: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PORTAL 3: LAB OPERATIONS WORKFLOW                                         */}
        {/* ========================================================================= */}
        {activePortal === "lab" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-teal-600" />
                    Laboratory Diagnostic Test Orders Queue
                  </h2>
                  <p className="text-xs text-slate-500">Dr. Lal PathLabs National Reference Lab &bull; NABL-DL-2026-891</p>
                </div>
                <button
                  onClick={() => fetchLabOrders()}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Patient</th>
                      <th className="py-3 px-3">ABHA ID</th>
                      <th className="py-3 px-3">Ordered Test</th>
                      <th className="py-3 px-3">Ordering Doctor</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {labOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-mono text-slate-500">#{o.id.slice(0, 8)}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{o.patient_name}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{o.abha_id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-800">{o.test_name}</td>
                        <td className="py-3 px-3 text-slate-600">{o.doctor_name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            o.priority === "URGENT" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {o.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            o.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {o.status !== "COMPLETED" ? (
                            <button
                              onClick={() => {
                                setSelectedLabOrder(o);
                                setLabObsValue("135");
                                setLabObsRange("70-99 mg/dL");
                                setLabObsAbnormal(true);
                              }}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                            >
                              Enter Results
                            </button>
                          ) : (
                            <span className="text-slate-400 font-medium">Results Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PORTAL 4: CONSENT MANAGEMENT HUB                                          */}
        {/* ========================================================================= */}
        {activePortal === "consent" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Patient Consent & Record Sharing Controls
                  </h2>
                  <p className="text-xs text-slate-500">
                    ABDM Consent Architecture: Control which doctors access your health records, specify purpose, duration, and revoke anytime.
                  </p>
                </div>
              </div>

              {/* Grant New Consent Form */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600" />
                  Grant Record Access to Doctor
                </h3>

                <form onSubmit={handleGrantConsent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Select Doctor</label>
                    <select
                      value={grantDoctorId}
                      onChange={(e) => setGrantDoctorId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3 py-2"
                    >
                      {doctorsList.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.full_name} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Purpose of Access</label>
                    <select
                      value={grantPurpose}
                      onChange={(e) => setGrantPurpose(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3 py-2"
                    >
                      <option value="CONSULTATION">Medical Consultation</option>
                      <option value="CARE_MANAGEMENT">Chronic Care Management</option>
                      <option value="SECOND_OPINION">Second Medical Opinion</option>
                      <option value="EMERGENCY">Emergency Access</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Record Category</label>
                    <select
                      value={grantCategory}
                      onChange={(e) => setGrantCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-xs rounded-xl px-3 py-2"
                    >
                      <option value="ALL_RECORDS">All Medical Records (Complete Timeline)</option>
                      <option value="DIAGNOSTIC_REPORT">Diagnostic & Lab Reports Only</option>
                      <option value="PRESCRIPTION">Prescriptions Only</option>
                      <option value="CONDITION">Past Diagnoses Only</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow transition"
                  >
                    Grant Consent (30 Days)
                  </button>
                </form>
              </div>

              {/* Active & Historical Consents Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Your Active & Historical Consents</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Consent ID</th>
                        <th className="py-2.5 px-3">Authorized Doctor</th>
                        <th className="py-2.5 px-3">Purpose</th>
                        <th className="py-2.5 px-3">Authorized Categories</th>
                        <th className="py-2.5 px-3">Validity Window</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {consents.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono text-slate-500">#{c.id.slice(0, 8)}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{c.doctor_name}</td>
                          <td className="py-3 px-3 text-slate-600">{c.purpose}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {c.categories?.map((cat: string, i: number) => (
                                <span key={i} className="bg-slate-100 text-slate-700 font-mono text-[10px] px-1.5 py-0.5 rounded">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {new Date(c.valid_from).toLocaleDateString()} &rarr; {new Date(c.valid_to).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              c.status === "GRANTED" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {c.status === "GRANTED" ? (
                              <button
                                onClick={() => handleRevokeConsent(c.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded border border-red-200 transition"
                              >
                                Revoke Immediately
                              </button>
                            ) : (
                              <span className="text-slate-400">Revoked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PORTAL 5: ABDM FHIR R4 INSPECTOR                                          */}
        {/* ========================================================================= */}
        {activePortal === "fhir" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-sky-600" />
                    ABDM FHIR R4 Resource Inspector
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live serializer mapping internal relational database entities into HL7 FHIR Release 4 JSON models.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {["Patient", "Condition", "Observation", "DiagnosticReport", "MedicationRequest", "Consent"].map((type) => (
                    <button
                      key={type}
                      onClick={() => fetchFhir(type)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                        selectedFhirType === type ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[500px] border border-slate-800">
                <pre>{JSON.stringify(fhirResource, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PORTAL 6: IMMUTABLE AUDIT TRAIL                                           */}
        {/* ========================================================================= */}
        {activePortal === "audit" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    Transparent Access Audit Log
                  </h2>
                  <p className="text-xs text-slate-500">
                    Every sensitive record retrieval, diagnosis, lab submission, and consent action is logged immutably.
                  </p>
                </div>
                <button
                  onClick={() => fetchAuditLogs()}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Timestamp (UTC)</th>
                      <th className="py-2.5 px-3">Action Performed</th>
                      <th className="py-2.5 px-3">Actor Role</th>
                      <th className="py-2.5 px-3">Consent ID Attached</th>
                      <th className="py-2.5 px-3">Purpose</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {new Date(log.timestamp).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{log.action}</td>
                        <td className="py-3 px-3">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[10px]">
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {log.consent_id ? `#${log.consent_id.slice(0, 8)}` : "None"}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{log.purpose || "N/A"}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: Record Encounter (Doctor)                                          */}
      {/* ========================================================================= */}
      {showEncounterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Record Clinical Consultation Encounter
              </h3>
              <button
                onClick={() => setShowEncounterModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEncounter} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reason for Visit</label>
                <input
                  type="text"
                  required
                  value={encounterReason}
                  onChange={(e) => setEncounterReason(e.target.value)}
                  placeholder="e.g. Follow-up for Glycemic & BP Control"
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2"
                />
              </div>

              {/* SNOMED CT Terminology Lookup */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Diagnosis (Validated SNOMED CT Concept Search)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={snomedSearchQuery}
                    onChange={(e) => searchSnomed(e.target.value)}
                    placeholder="Search clinical term e.g. diabetes, asthma, dengue..."
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 pl-8"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {snomedResults.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto p-1 space-y-1">
                    {snomedResults.map((c) => (
                      <div
                        key={c.code}
                        onClick={() => {
                          setSelectedSnomed(c);
                          setSnomedSearchQuery(c.display);
                          setSnomedResults([]);
                        }}
                        className="p-2 hover:bg-teal-50 cursor-pointer rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{c.display}</span>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {c.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedSnomed && (
                  <div className="text-xs bg-indigo-50 text-indigo-800 p-2 rounded-lg border border-indigo-200 flex items-center justify-between">
                    <span>Selected: <strong>{selectedSnomed.display}</strong> (SNOMED: {selectedSnomed.code})</span>
                    <button type="button" onClick={() => setSelectedSnomed(null)} className="text-indigo-500 hover:text-indigo-800">
                      &times;
                    </button>
                  </div>
                )}
              </div>

              {/* Prescription */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Prescription (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={rxMedName}
                    onChange={(e) => setRxMedName(e.target.value)}
                    placeholder="Drug name (e.g. Metformin 500 mg)"
                    className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5"
                  />
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    placeholder="Dosage (e.g. 500 mg)"
                    className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Notes</label>
                <textarea
                  rows={2}
                  value={encounterNotes}
                  onChange={(e) => setEncounterNotes(e.target.value)}
                  placeholder="Doctor's clinical observations and patient advice..."
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEncounterModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSnomed}
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow disabled:opacity-50"
                >
                  Save Encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Submit Lab Results                                                 */}
      {/* ========================================================================= */}
      {selectedLabOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-slate-900">
                Submit Test Results: {selectedLabOrder.test_name}
              </h3>
              <button onClick={() => setSelectedLabOrder(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLabResults} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Measured Value</label>
                  <input
                    type="text"
                    required
                    value={labObsValue}
                    onChange={(e) => setLabObsValue(e.target.value)}
                    placeholder="e.g. 142"
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Normal Reference Range</label>
                  <input
                    type="text"
                    required
                    value={labObsRange}
                    onChange={(e) => setLabObsRange(e.target.value)}
                    placeholder="e.g. 70-99 mg/dL"
                    className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="abnormalToggle"
                  checked={labObsAbnormal}
                  onChange={(e) => setLabObsAbnormal(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <label htmlFor="abnormalToggle" className="text-xs font-semibold text-slate-700">
                  Flag as Abnormal / Out of Range
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Specialist Conclusion</label>
                <textarea
                  rows={2}
                  value={labConclusion}
                  onChange={(e) => setLabConclusion(e.target.value)}
                  placeholder="Diagnostic impression..."
                  className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedLabOrder(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow"
                >
                  Submit & Notify Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI Lab Explainer                                                   */}
      {/* ========================================================================= */}
      {explainingReport && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                AI Lab Report Explainer
              </h3>
              <button onClick={() => setExplainingReport(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-800 text-sm">{explainingReport.title}</div>
              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 text-slate-700 leading-relaxed font-medium">
                {explainingReport.explanation}
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-slate-700">Detailed Test Findings:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {explainingReport.key_findings?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <strong>Medical Notice:</strong> {explainingReport.disclaimer}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setExplainingReport(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
