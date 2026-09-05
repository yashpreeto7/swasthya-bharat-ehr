# Directive 00: Master Roadmap — MedIndia HealthOS

## Goal
Guide the end-to-end development of MedIndia HealthOS, a production-quality EHR prototype aligned with ABDM, FHIR R4, SNOMED CT, robust Consent Management, RBAC, Auditability, Reminders, and AI Clinical Copilot.

## Architecture Blueprint
- **Architecture Style**: Modular Monolith
- **Backend**: Python 3.14+, FastAPI, Pydantic v2, SQLAlchemy (async), Alembic
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide icons
- **Database**: PostgreSQL (relational source of truth, foreign keys, constraints) with async SQLite local dev support
- **Terminology**: SNOMED CT abstraction layer with validated concept mappings
- **Interoperability**: FHIR R4 mapping layer (`/api/fhir/*`) for ABDM compatibility
- **Consent**: First-class consent-gated backend authorization middleware
- **AI/RAG**: Provider-agnostic copilot grounded in EHR records (clinical summary, Q&A, lab explanation)

## Phased Execution Pipeline

| Phase | Directive | Scope & Key Deliverables |
|---|---|---|
| **Phase 1** | `01_project_scaffolding.md` | Modular monorepo scaffolding, FastAPI backend, Next.js frontend, database models, Docker setup, local runners |
| **Phase 2** | `02_auth_and_rbac.md` | Auth system: Registration, JWT tokens, RBAC (`PATIENT`, `DOCTOR`, `LAB`), resource authorization guards |
| **Phase 3** | `03_consent_engine.md` | Consent artifacts, category-based permissions, validity time-window, revocation mechanics, consent enforcement middleware |
| **Phase 4** | `04_fhir_and_snomed.md` | Internal to FHIR R4 bidirectional serializers (`Patient`, `Practitioner`, `Encounter`, `Observation`, `DiagnosticReport`, `Condition`, `MedicationRequest`, `Consent`) + SNOMED CT terminology registry |
| **Phase 5** | `05_clinical_workflows.md` | Patient health timeline, Doctor encounter workspace, prescription generation, Lab order tracking, result submission |
| **Phase 6** | `06_reminders_and_notifications.md` | Background notification scheduler, multi-type reminders (meds, appointments, lab tests), in-app notification center |
| **Phase 7** | `07_ai_clinical_copilot.md` | Grounded clinical summary generator, retrieval-augmented patient history Q&A, patient-friendly lab report explainer |
| **Phase 8** | `08_audit_and_security.md` | Immutable access audit logging, security hardening, input validation, end-to-end automated test suite |

## Scripts Used
- `execution/verify_env.py` — Verifies local toolchain, ports, and environment variables.
- `execution/init_project.py` — Sets up frontend and backend modular monolith.
- `execution/seed_demo_data.py` — Populates realistic Indian healthcare clinical demo data.
- `execution/run_tests.py` — Runs backend unit/integration tests and frontend type-checks.

## Key Operating Principles
1. **Separation of Concerns**: Directives define the SOP; the Agent orchestrates; scripts in `execution/` execute deterministically.
2. **Never Mock Consent**: Consent must be enforced at the API layer, blocking unauthorized queries with 403 Forbidden.
3. **No Fabricated Medical Codes**: SNOMED CT concepts must be strictly typed using verified standard codes or explicit demo catalogs.
4. **AI Grounding**: LLM outputs must cite underlying clinical record IDs and never hallucinate patient history.
