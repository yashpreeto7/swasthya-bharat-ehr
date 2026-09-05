# Directives

Standard Operating Procedures (SOPs) written in Markdown defining the goals, inputs, tools, execution steps, deliverables, and edge cases for the MedIndia HealthOS EHR system.

## The 3-Layer Architecture Context

1. **Directive (This folder)**: Human/Agent instructions detailing *what* needs to be done.
2. **Orchestration**: The Agent deciding *how* and *when* to execute tasks and handle unexpected errors.
3. **Execution (`execution/`)**: Deterministic Python scripts performing the actual computations, migrations, test runs, and verification.

## Structure of a Directive

Each directive must specify:
- **Goal**: Clear objective of the procedure
- **Inputs**: Prerequisites, schemas, database tables, or config variables
- **Execution Steps**: Ordered, actionable tasks referencing execution scripts
- **Scripts Used**: Listing scripts in `execution/`
- **Outputs / Deliverables**: API endpoints, DB models, UI routes, or artifacts
- **Edge Cases & Learnings**: Discovered constraints (e.g. SNOMED validation, FHIR R4 requirements, JWT expiration, consent revocation race conditions)

## Index of Directives

- `_template.md`: Baseline template for new directives
- `00_master_roadmap.md`: Full end-to-end implementation plan for MedIndia HealthOS
- `01_project_scaffolding.md`: Monorepo structure, backend (FastAPI), frontend (Next.js), database setup
- `02_auth_and_rbac.md`: Authentication, JWT, and Patient/Doctor/Lab RBAC
- `03_consent_engine.md`: Purpose-driven, category-scoped, time-bound consent verification
- `04_fhir_and_snomed.md`: ABDM FHIR R4 resource mapper and SNOMED CT terminology abstraction
- `05_clinical_workflows.md`: Encounters, diagnoses, prescriptions, and lab orders/results
- `06_reminders_and_notifications.md`: Scheduled notification pipeline for appointments, meds, and lab results
- `07_ai_clinical_copilot.md`: Grounded EHR clinical summaries, RAG Q&A, and lab report explainer
- `08_audit_and_security.md`: Immutable audit logging, security controls, and RBAC enforcement
