# Findings & Architectural Decisions: MedIndia HealthOS

## System & Toolchain Discoveries
- **Python**: v3.14.7 installed.
- **Node.js**: v24.19.0 installed.
- **npm**: 11.17.0 installed.
- **Docker**: Docker CLI version 29.7.2 installed.
- **OS**: Windows 11 with PowerShell shell environment.

## Architectural Patterns & Decisions
1. **3-Layer Architecture (`Agents.md`)**:
   - Directives: Living SOPs in `directives/`
   - Orchestration: Antigravity agent intelligently coordinating tasks
   - Execution: Deterministic Python scripts in `execution/`
2. **Modular Monolith**:
   - Instead of microservices, start with a modular monolith backend in `backend/app/` with clean module boundaries (`auth`, `patients`, `doctors`, `labs`, `encounters`, `consent`, `fhir`, `reminders`, `ai`, `audit`).
3. **Database & Dual-Mode Connection**:
   - PostgreSQL is the production target, but local development supports SQLite async fallback so developers can run immediately without starting a Postgres container.
4. **ABDM FHIR R4 & SNOMED CT Standards**:
   - Never mock or fabricate SNOMED CT concept codes. Use authentic standard codes (`http://snomed.info/sct`).
   - FHIR serializers isolate internal relational database models from ABDM external exchange formats.
5. **Real Backend Consent Enforcement**:
   - Consent checks are mandatory backend authorization gates, rejecting unauthorized clinician access with 403 Forbidden.
6. **AI Grounding Protocol**:
   - AI outputs must strictly cite EHR record IDs and never hallucinate clinical history.
