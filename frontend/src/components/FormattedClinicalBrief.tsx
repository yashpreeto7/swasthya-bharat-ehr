"use client";

import React, { useState } from "react";
import {
  Sparkles, Stethoscope, Pill, Activity, AlertTriangle,
  CheckCircle2, Copy, Check, FlaskConical, ShieldCheck,
  ChevronDown, ChevronUp, Clock, Info
} from "lucide-react";

interface FormattedClinicalBriefProps {
  summaryData: any;
  patient: any;
  focusArea?: string;
  audience?: string;
  timeWindow?: string;
  onRegenerate?: (focus: string, audience: string) => void;
}

export default function FormattedClinicalBrief({
  summaryData,
  patient,
  focusArea,
  audience,
  timeWindow,
  onRegenerate
}: FormattedClinicalBriefProps) {
  const [copied, setCopied] = useState(false);
  const [showAllCitations, setShowAllCitations] = useState(false);

  if (!summaryData) return null;

  const rawSummary = typeof summaryData === "string" ? summaryData : summaryData.summary || "";
  const structured = summaryData.structured_sections || null;
  const citations = summaryData.grounded_record_ids || summaryData.records_cited || [];

  const handleCopy = () => {
    navigator.clipboard.writeText(rawSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Helper to parse raw text if structured sections are not provided by backend
  const parseRawMarkdownSections = (text: string) => {
    const sections: {
      impression?: string;
      diagnoses?: string[];
      medications?: string[];
      labs?: string[];
      recommendations?: string[];
      other?: string[];
    } = {};

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    let currentKey = "impression";

    for (const line of lines) {
      if (line.startsWith("###")) {
        // title line, skip or use
        continue;
      }
      if (line.includes("**Active Diagnoses:**")) {
        currentKey = "diagnoses";
        const content = line.replace(/.*?\*\*Active Diagnoses:\*\*/i, "").trim();
        if (content) sections.diagnoses = content.split(";").map(s => s.trim()).filter(Boolean);
        continue;
      }
      if (line.includes("**Current Pharmacotherapy:**") || line.includes("**Your Medications:**")) {
        currentKey = "medications";
        const content = line.replace(/.*?\*\*(Current Pharmacotherapy|Your Medications):\*\*/i, "").trim();
        if (content) sections.medications = content.split(/,(?![^\[]*\])/).map(s => s.trim()).filter(Boolean);
        continue;
      }
      if (line.includes("**Diagnostic Investigations:**") || line.includes("**Laboratory Observations") || line.includes("**Your Recent Lab Tests:**")) {
        currentKey = "labs";
        const content = line.replace(/.*?\*\*(Diagnostic Investigations|Laboratory Observations.*?|Your Recent Lab Tests):\*\*/i, "").trim();
        if (content) sections.labs = content.split(";").map(s => s.trim()).filter(Boolean);
        continue;
      }
      if (line.includes("**Clinical Impression:**") || line.includes("**Overview:**")) {
        currentKey = "impression";
        sections.impression = line.replace(/.*?\*\*(Clinical Impression|Overview):\*\*/i, "").trim();
        continue;
      }
      if (line.includes("**Recommendations:**") || line.includes("**What to do next:**") || line.includes("**Action Plan:**")) {
        currentKey = "recommendations";
        continue;
      }

      // Add to current section
      if (currentKey === "recommendations" && (line.match(/^\d+\./) || line.startsWith("-") || line.startsWith("•"))) {
        if (!sections.recommendations) sections.recommendations = [];
        sections.recommendations.push(line.replace(/^(\d+\.|\-|•)\s*/, ""));
      } else if (currentKey === "diagnoses" && (line.startsWith("-") || line.startsWith("•"))) {
        if (!sections.diagnoses) sections.diagnoses = [];
        sections.diagnoses.push(line.replace(/^(\-|\•)\s*/, ""));
      } else if (currentKey === "medications" && (line.startsWith("-") || line.startsWith("•"))) {
        if (!sections.medications) sections.medications = [];
        sections.medications.push(line.replace(/^(\-|\•)\s*/, ""));
      } else if (currentKey === "labs" && (line.startsWith("-") || line.startsWith("•"))) {
        if (!sections.labs) sections.labs = [];
        sections.labs.push(line.replace(/^(\-|\•)\s*/, ""));
      } else if (!sections.impression && !line.startsWith("**")) {
        sections.impression = line;
      }
    }

    return sections;
  };

  const parsed = structured ? null : parseRawMarkdownSections(rawSummary);

  // Focus Title Display
  const getFocusDisplayTitle = () => {
    if (structured?.title) return structured.title;
    switch (focusArea) {
      case "GLYCEMIC_CONTROL": return "Endocrine & Glycemic Control Brief";
      case "CARDIOVASCULAR": return "Cardiovascular & Hemodynamic Risk Brief";
      case "MEDICATIONS": return "Pharmacotherapy & Medication Reconciliation";
      case "RECENT_LABS": return "Diagnostic & Laboratory Trajectory Brief";
      case "DISCHARGE_PLAN": return "Follow-Up & Clinical Action Plan";
      default: return "Longitudinal Comprehensive Clinical Brief";
    }
  };

  const getFocusBadgeColor = () => {
    switch (focusArea) {
      case "GLYCEMIC_CONTROL": return "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
      case "CARDIOVASCULAR": return "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "MEDICATIONS": return "bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800";
      case "RECENT_LABS": return "bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800";
      default: return "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* ── 1. Top Clinical Header Banner ── */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-indigo-950/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs font-mono uppercase tracking-wider bg-indigo-600 text-white border-indigo-500">
                <Sparkles className="w-3 h-3 text-amber-300" />
                ABDM Clinical Synthesis
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getFocusBadgeColor()}`}>
                {focusArea?.replace("_", " ") || "COMPREHENSIVE"}
              </span>
              {audience && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {audience.replace("_", " ")}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {getFocusDisplayTitle()}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
              <span>Patient: <strong className="text-slate-800 dark:text-slate-200">{patient?.full_name || "Verified Citizen"}</strong></span>
              <span>•</span>
              <span>ABHA: <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{patient?.abha_id || "91-4405-2026-0001"}</span></span>
              <span>•</span>
              <span>Blood: <span className="font-bold text-slate-700 dark:text-slate-300">{patient?.blood_group || "O+"}</span></span>
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Copy structured brief to clinical clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Brief</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ── 2. Clinical Impression Callout ── */}
        {(structured?.clinical_impression || parsed?.impression) && (
          <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border-l-4 border-indigo-500 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical Assessment & Synthesis
            </div>
            <div>{structured?.clinical_impression || parsed?.impression}</div>
          </div>
        )}

        {/* ── 3. High-Priority Alerts (if any) ── */}
        {((structured?.key_alerts && structured.key_alerts.length > 0) || (structured?.lab_findings?.some((l: any) => l.is_abnormal))) && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Key Diagnostic Alerts & Clinical Considerations</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-200/90 pl-5 list-disc">
              {structured?.key_alerts && structured.key_alerts.map((alt: string, i: number) => (
                <li key={i}>{alt}</li>
              ))}
              {structured?.lab_findings?.filter((l: any) => l.is_abnormal).map((ab: any, i: number) => (
                <li key={`ab-${i}`}>
                  <strong>{ab.test_name}:</strong> <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{ab.value} {ab.unit}</span> (Ref: {ab.reference_range}) — ⚠️ Abnormal marker
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── 4. Diagnoses & SNOMED CT Section ── */}
        {((structured?.diagnoses && structured.diagnoses.length > 0) || (parsed?.diagnoses && parsed.diagnoses.length > 0)) && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Active Pathologies & NRCES Diagnoses
              </span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
                SNOMED CT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {structured?.diagnoses ? (
                structured.diagnoses.map((diag: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {diag.name}
                      </div>
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Concept ID: {diag.snomed_code}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        {diag.status || "ACTIVE"}
                      </span>
                      <span className="font-mono text-slate-400">
                        {diag.citation}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                parsed?.diagnoses?.map((diagStr: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium text-slate-800 dark:text-slate-200"
                  >
                    {diagStr}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 5. Current Pharmacotherapy & Medication Reconciliation ── */}
        {((structured?.medications && structured.medications.length > 0) || (parsed?.medications && parsed.medications.length > 0)) && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-500" />
              Current Pharmacotherapy & Regimens ({structured?.medications?.length || parsed?.medications?.length || 0})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {structured?.medications ? (
                structured.medications.map((med: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-teal-50/20 dark:bg-teal-950/10 hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between gap-1.5"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{med.name}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Schedule: <span className="font-medium text-slate-900 dark:text-slate-100">{med.frequency}</span>
                      </div>
                      {med.instructions && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          "{med.instructions}"
                        </div>
                      )}
                    </div>
                    <div className="pt-1.5 border-t border-teal-200/40 dark:border-teal-900/40 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{med.duration ? `Duration: ${med.duration}` : "Maintenance"}</span>
                      <span className="text-teal-700 dark:text-teal-400 font-semibold">{med.citation}</span>
                    </div>
                  </div>
                ))
              ) : (
                parsed?.medications?.map((medStr: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-teal-50/20 dark:bg-teal-950/10 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {medStr}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 6. Diagnostic Investigations & Biomarkers Grid ── */}
        {((structured?.lab_findings && structured.lab_findings.length > 0) || (parsed?.labs && parsed.labs.length > 0)) && (
          <div className="space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-500" />
              Laboratory Trajectory & Biomarkers
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {structured?.lab_findings ? (
                structured.lab_findings.map((lab: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                      lab.is_abnormal
                        ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                        : "bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 truncate" title={lab.test_name}>
                        {lab.test_name}
                      </div>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className={`text-sm font-bold ${lab.is_abnormal ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                          {lab.value}
                        </span>
                        <span className="text-[11px] text-slate-500">{lab.unit}</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        lab.is_abnormal
                          ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}>
                        {lab.is_abnormal ? "⚠️ ABNORMAL" : "Normal"}
                      </span>
                      <span className="font-mono text-slate-400">{lab.citation}</span>
                    </div>
                  </div>
                ))
              ) : (
                parsed?.labs?.map((labStr: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {labStr}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 7. Clinical Recommendations & Action Items ── */}
        {((structured?.recommendations && structured.recommendations.length > 0) || (parsed?.recommendations && parsed.recommendations.length > 0)) && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Clinical Recommendations & Follow-Up Plan
            </span>

            <div className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
              {(structured?.recommendations || parsed?.recommendations)?.map((rec: string, idx: number) => (
                <div key={idx} className="text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 8. Grounded Evidence Citations Tray ── */}
        {citations && citations.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Verified EHR Citations ({citations.length} Records)
              </span>
              <button
                onClick={() => setShowAllCitations(!showAllCitations)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
              >
                {showAllCitations ? "Show Less" : "Expand All"}
                {showAllCitations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(showAllCitations ? citations : citations.slice(0, 10)).map((rec: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-2xs"
                >
                  {rec}
                </span>
              ))}
              {!showAllCitations && citations.length > 10 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{citations.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
