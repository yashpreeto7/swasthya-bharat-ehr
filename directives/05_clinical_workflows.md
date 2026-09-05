# Directive 05: Clinical Workflows (Patient, Doctor & Lab)

## Goal
Implement end-to-end clinical domain workflows across three primary actor portals:
1. **Patient Portal**: Longitudinal health timeline, ABHA id, diagnosis/medication review, lab reports, appointments, consent manager, and reminders.
2. **Doctor Portal**: Authorized patient directory, encounter creation, SNOMED-coded diagnosis recording, prescription generation, lab test ordering, clinical notes, and patient history review.
3. **Lab Portal**: Authorized lab order backlog, specimen status update, test result entry (`Observation` + `DiagnosticReport`), and automated patient notification trigger.

## Inputs & Prerequisites
- RBAC and Consent middleware active
- Relational tables: `encounters`, `conditions`, `prescriptions`, `lab_orders`, `diagnostic_reports`, `observations`.

## Execution Steps
1. **Clinical Encounters & Conditions**:
   - Doctor creates encounter (`type`, `notes`, `date`).
   - Doctor records diagnosis linked to encounter with validated SNOMED CT concept.
2. **Prescription Management**:
   - Doctor enters drug name, dosage, frequency, duration, and instructions.
3. **Diagnostic Lab Pipeline**:
   - Doctor places lab order (`test_name`, `priority`, `notes`).
   - Lab staff views pending orders, marks order status (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`).
   - Lab staff submits numerical and qualitative results with units and normal ranges.
   - Triggers patient notification upon completion.
4. **Patient Timeline Aggregation**:
   - Backend service joins encounters, conditions, prescriptions, and lab reports sorted chronologically.

## Scripts Used
- `execution/seed_clinical_flow.py` — Seeds end-to-end clinical scenario: Patient -> Doctor consultation -> Lab order -> Result entry -> Notification.

## Outputs & Deliverables
- REST APIs under `/api/v1/patients`, `/api/v1/doctors`, `/api/v1/labs`, `/api/v1/encounters`.
- Front-end dashboards for Patient, Doctor, and Lab with specialized views.

## Edge Cases & Learnings
- Lab results must include reference ranges (e.g. Fasting Blood Glucose: 70-99 mg/dL) so both doctors and AI can interpret abnormality accurately.
