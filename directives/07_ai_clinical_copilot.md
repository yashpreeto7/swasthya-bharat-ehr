# Directive 07: AI Clinical Copilot & Grounded RAG

## Goal
Implement a provider-agnostic AI clinical assistant over EHR records that acts as an informational copilot, strictly grounded in verifiable patient history:
1. **Concise Clinical Summary**: Synthesizes past conditions, allergies, active prescriptions, recent lab trends, and consultations.
2. **Grounded RAG Q&A**: Answers doctor inquiries about patient history with precise citations to underlying record IDs (`[Condition#12]`, `[LabReport#4]`).
3. **Lab Value Explainer**: Explains numerical lab metrics in plain language for patients with explicit non-diagnostic disclaimers.

## Inputs & Prerequisites
- Structured patient EHR records (PostgreSQL / SQLite source of truth)
- Configured LLM provider (Gemini / OpenRouter / OpenAI) via environment variables
- Fallback deterministic clinical summarizer for offline / local-only execution without API keys

## Execution Steps
1. **EHR Record Context Builder**:
   - `build_patient_clinical_context(patient_id, db)`: Retrieves and formats chronological medical records into a structured, typed context envelope.
2. **AI Provider Abstraction**:
   - Implement `backend/app/services/ai_service.py` with pluggable interface:
     - Direct Gemini API / OpenRouter / OpenAI support.
     - Robust offline mock engine that produces deterministic grounded summaries and citations when no API key is set.
3. **Strict Grounding Protocol**:
   - System prompt mandates:
     - "You are a clinical decision support assistant. You MUST ONLY reference facts present in the provided EHR context."
     - "Never invent diagnoses, medications, or test values."
     - "Cite record IDs for every factual statement."
4. **AI Endpoints**:
   - `POST /api/v1/ai/summary/{patient_id}`: Generates structured clinical brief.
   - `POST /api/v1/ai/query`: Answers clinician questions with grounded retrieval.
   - `POST /api/v1/ai/explain-lab/{diagnostic_report_id}`: Generates patient-friendly explanation with medical disclaimer.

## Scripts Used
- `execution/test_ai_grounding.py` — Tests prompt grounding and verifies that answers reference actual records and handle unmentioned facts properly without hallucinations.

## Outputs & Deliverables
- Provider-agnostic AI service with grounding validation and interactive clinician drawer in frontend.

## Edge Cases & Learnings
- If an API key is missing, fail gracefully with clear status or fallback to the deterministic offline summarizer so evaluations never fail.
