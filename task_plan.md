# Task Plan: MedIndia HealthOS EHR Prototype

## Status Summary
- **Current Phase**: Phase 1 Complete -> End-to-End Prototype Operational & Verified
- **Active Goals**:
  1. Demonstrate end-to-end user workflows across Patient, Doctor, and Lab portals
  2. Verify ABDM FHIR R4 interoperability and SNOMED CT terminology lookups
  3. Validate consent enforcement and access revocation

## User Intent & Requirements
- Build a production-grade EHR prototype for India based on `MedIndia_HealthOS_Agent_Prompt.md`.
- Operate strictly within the 3-Layer Architecture defined in `Agents.md`.
- Prioritize working end-to-end prototype, modular monolith backend, clean modern medical UI, grounded AI copilot, and robust consent gating.

## Phase Breakdown

### Phase 0: System & Architecture Instantiation [COMPLETE]
- [x] Instantiate `Agents.md` 3-layer architecture (`directives/`, `execution/`, `.tmp/`, `.env`)
- [x] Install 22 specialized agent skills from `PERSONALAGENT` into `.agents/skills`
- [x] Create `.gitignore` and `.env.example`
- [x] Implement deterministic environment verification script (`execution/verify_env.py`)
- [x] Initialize git repository

### Phase 1: Modular Monolith Scaffolding & End-to-End Implementation [COMPLETE]
- [x] Create FastAPI backend with modular structure: `auth`, `patients`, `doctors`, `labs`, `encounters`, `consent`, `fhir`, `reminders`, `ai`, `audit`
- [x] Create Next.js 14+ frontend with Tailwind CSS and clinical design tokens
- [x] Configure async SQLAlchemy database models and migrations
- [x] Create `docker-compose.yml` for PostgreSQL + backend + frontend
- [x] Seed realistic Indian healthcare clinical demo scenarios (`execution/seed_demo_data.py`)
- [x] Create 12-point automated verification suite (`execution/verify_backend_api.py`)
- [x] Verify all 12 backend integration tests pass with 100% success rate
- [x] Validate production Next.js build (`npm run build` PASS)
- [x] Create unified dev runner (`execution/run_dev.py`) and project documentation (`README.md`)

### Phase 2: ABDM HIP/HIU, Superpowers & Agent Handoff [COMPLETE]
- [x] Implement ABDM HIP M1/M2 Care Context discovery, token generation & OTP confirmation (`backend/app/api/v1/abdm.py`)
- [x] Implement ABDM HIU M3 consent request and encrypted FHIR R4 health data bundle transfer
- [x] Add interactive ABDM Gateway Simulator panel to Next.js frontend (`frontend/src/app/page.tsx`)
- [x] Expand automated verification suite to 14/14 tests (`execution/verify_backend_api.py`)
- [x] Verify frontend static build (`npm run build` PASS)
- [x] Install specialized medical & planning skills (`abdm-hip-hiu-fhir`, `clinical_trials_database`, `openfda_database`, `pubmed_database`, `superpowers`, `brainstorming`)
- [x] Conduct superpowers brainstorming session for high-impact Indian healthcare innovations
- [x] Create comprehensive agent continuity document `HANDOFF.md` at workspace root

### Phase 3: Clinical UI Revamp, High Contrast Controls & Rich Dataset [COMPLETE]
- [x] Replace Old Regime parchment with clean, modern clinical architecture
- [x] Enforce 1.5px border-radius globally across buttons, cards, tabs, and inputs
- [x] Enforce crisp black drop shadows (`rgba(0, 0, 0, 0.08)` to `rgba(0, 0, 0, 0.25)`) with zero white shadows
- [x] Revamp navigation bar into sleek dark slate header with ABDM M1-M3 badge and role pills
- [x] Fix active selection contrast bug (white-on-white text resolved with `.filter-pill-active`)
- [x] Enrich AI Clinical Copilot with 6 quick prompt chips and 4 pre-fed grounded Q&A scenarios
- [x] Populate rich clinical dataset (`execution/reset_and_seed_rich_data.py`) with 4 diverse Indian patient scenarios
- [x] Verify production Next.js build (`npm run build` PASS with 0 errors)

### Phase 5: UI/UX Pro Max Revamp & Clinical Workflow Fixes [COMPLETE]
- [x] Overhaul navigation bar into sleek frosted-glass healthcare header with segmented role navigation
- [x] Eliminate harsh 1.5px squarish border radius override and implement modern clinical design tokens (`rounded-xl`, soft drop shadows, refined cards)
- [x] Fix broken light mode (configure Tailwind `darkMode: ['class', '[data-theme="dark"]']`, remove legacy `data-theme="sovereign-manifesto"`, adjust light mode contrast)
- [x] Fix empty Health Timeline (`patients.py` doctor attribute reference, route `/api/v1/patients/me/timeline` for patient persona, auto-load on tab selection)
- [x] Seed rich demo lab reports with LOINC codes, observations, and add pending tests for lab intake
- [x] Fix lab portal OTP linking view so linked Care Contexts and active lab tests display immediately after OTP
- [x] Fix doctor clinical encounters visibility (add patient selector, recent encounters history list, reactive update upon sign & submit)
- [x] Revamp Clinical AI Copilot (multi-format synthesis briefs with report types/focus/tone while preserving & polishing the right-side quick clinical reports/prompts)
- [x] Execute automated test suite (`verify_backend_api.py`, `verify_phase5_workflows.py`), verify Next.js build (`npm run build` PASS), and validate in browser (recorded WebP session)

### Phase 6: Zero-Break Resilience & AI Clinical Copilot Restoration [COMPLETE]
- [x] Diagnose root cause of empty patient roster and inert AI brief / quick question buttons
- [x] Hoist demo patient datasets (`INITIAL_DEMO_PATIENTS`, `DEMO_LAB_REPORTS`, `DEMO_PATIENT_TIMELINE_EVENTS`, `DEMO_PENDING_LAB_ORDERS`, `sampleAiPrompts`, `sampleClinicalQnA`) to top-level module scope to eliminate Temporal Dead Zone (TDZ)
- [x] Pre-populate default patient state so the Clinical Workstation roster is never blank (4 core Indian personas: Rajesh Sharma, Priya Patel, Vikramaditya Singh, Ananya Sen)
- [x] Implement robust offline/online dual-mode fallback in `generateAiSummary` and `askAiAssistant` with 3.5s fetch timeout and local grounded synthesis
- [x] Add horizontal quick patient switcher pills directly within the Clinical AI Copilot console
- [x] Add auto-reconnect heartbeat polling (6s interval) to automatically synchronize with live backend
- [x] Fix SNOMED CT terminology search parsing to normalize both list and dictionary payloads
- [x] Launch FastAPI backend daemon via `uv run uvicorn` on port 8000 and restart clean Next.js dev server on port 3000
- [x] In-browser end-to-end verification across Doctor, Patient, Lab portals, AI brief synthesis, quick Q&A, and ABDM HIU transfer

### Phase 7: Abstract Medical Template Wallpaper Integration & Locked Settings [COMPLETE]
- [x] Discovered and extracted high-res medical vector wallpaper (`abstract-medical-wallpaper-template-design.zip`) to `frontend/public/medical-bg.jpg`
- [x] Created ambient wallpaper layer `.medical-template-bg` in `frontend/src/app/layout.tsx` and tuned styling in `globals.css`
- [x] Created interactive live parameter calibration widget `BackgroundSettingsWidget.tsx` with opacity, framing presets, and card glassmorphism controls
- [x] User selected final locked configuration: Background Opacity 70%, Framing Center (Cover), Card Surface Opacity 60%
- [x] Hardcoded and locked in exact parameters in `frontend/src/app/globals.css`:
  - `--bg-template-opacity: 0.70;`
  - `--bg-template-size: cover;`
  - `--bg-template-pos: center center;`
  - `--card-surface-opacity: 0.60;`
  - `.medical-card` backdrop blur (`blur(12px)`) and `--bg-surface: rgba(255, 255, 255, 0.60)` (light) / `rgba(17, 24, 39, 0.60)` (dark)
- [x] Completely removed `BackgroundSettingsWidget.tsx`, cleaned imports, removed top navbar `[BG Settings]` toggle button
- [x] Verified error-free operation, clean visual presentation, and seamless Light/Dark mode transitions in browser via Playwright

### Phase 8: Platform Rebranding to Swasthya Bharat EHR [COMPLETE]
- [x] User requested replacing "HealthOS" branding
- [x] Selected new official identity: **Swasthya Bharat EHR** (grounded in national Indian healthcare terminology and Ayushman Bharat standards)
- [x] Updated frontend header logo, brand typography, and footer in `frontend/src/app/page.tsx`
- [x] Updated document metadata title and description in `frontend/src/app/layout.tsx`
- [x] Updated backend FastAPI application title, root endpoint payload, and settings in `backend/app/main.py` and `backend/app/core/config.py`
- [x] Updated clinical AI decision support service disclaimers in `backend/app/services/ai_service.py`
- [x] Verified live rendering in browser via Playwright across header, footer, and page title

### Phase 9: Sleek & Compact Navbar Redesign [COMPLETE]
- [x] Diagnosed navbar congestion and vertical bloat (~80px tall with multi-line wrapped text across 5 buttons)
- [x] Reduced navbar height from ~80px to ~48px (`h-10` inner, `py-1.5`)
- [x] Streamlined brand header to a single line with `Swasthya Bharat EHR` and compact `ABDM M1-M3` badge
- [x] Enforced `whitespace-nowrap` and concise labels with tooltips on navigation tabs (`Workstation`, `Encounters`, `AI Copilot`, `ABDM HIU`, `FHIR R4`)
- [x] Compacted Rural PHC connectivity indicator and doctor persona switcher into streamlined single-line pills
- [x] Verified in browser via Playwright in both light and dark modes with 100% interactive responsiveness

### Phase 10: GitHub Repository, Visual Assets & Submission Documentation [COMPLETE]
- [x] Created public GitHub repository: `https://github.com/yashpreeto7/swasthya-bharat-ehr`
- [x] Configured Vercel deployment readiness (`frontend/vercel.json`, root `vercel.json`, Next.js 14 production build verified 4/4 static pages)
- [x] Captured 8 high-resolution Light Mode screenshots in `docs/assets/screenshots/`:
  1. `01_doctor_workstation.png`
  2. `02_encounter_snomed_ai.png`
  3. `03_clinical_ai_copilot.png`
  4. `04_abdm_hiu_transfer.png`
  5. `05_fhir_r4_inspector.png`
  6. `06_patient_abha_card.png`
  7. `07_lab_operations_queue.png`
  8. `08_emergency_break_glass.png`
- [x] Recorded interactive Light Mode walkthrough video (`docs/assets/walkthrough_demo.webp`) via `browser_subagent`
- [x] Created exhaustive, submission-grade `README.md` with problem statement, screenshot showcase, system architecture Mermaid diagram, 3-layer layout, Vercel instructions, and verification report
- [x] Added MIT `LICENSE`
- [x] Staged, committed, and pushed complete codebase to GitHub `main` branch

## Errors Encountered & Solutions
| Error | Cause | Resolution |
|---|---|---|
| `ImportError: email-validator is not installed` | Missing Pydantic email dependency | Installed `email-validator>=2.3.0` via `uv pip` and updated `requirements.txt` |
| `AttributeError: module 'bcrypt' has no attribute '__about__'` | PassLib 1.7.4 compatibility bug with modern bcrypt | Replaced passlib wrapper with direct, clean native `bcrypt` calls |
| `NameError: name 'Practitioner' is not defined` | Missing import in `patients.py` | Added `Practitioner` to entity imports |
| `AttributeError: 'Practitioner' object has no attribute 'name'` | `build_patient_timeline` referenced `p.doctor.name` instead of `p.doctor.user.full_name` | Fixed property access to `p.doctor.user.full_name` |
| `403 Forbidden: User does not have required role: DOCTOR` | Patient persona called doctor's timeline endpoint `/api/v1/doctors/patients/{id}/timeline` | Route patient persona to `/api/v1/patients/me/timeline` |
| `Light mode broken` | Tailwind defaulted to media queries without selector config, and `layout.tsx` hardcoded `sovereign-manifesto` | Configured selector dark mode and synchronized class/attribute toggle |
| `Empty patient roster & inert AI buttons` | Backend wasn't running, frontend aborted on failed fetch leaving `patients=[]` and `selectedPatientId=""`, plus TDZ reference error on demo constants | Hoisted demo datasets to module scope, initialized non-empty state, added local fallback for AI synthesis & Q&A, and launched backend daemon |
| `SNOMED search returned empty results` | Backend returned array `[{code, display}]`, frontend expected `{results: [{concept_id, display_name}]}` | Normalized terminology search responses to handle both list and object shapes |
