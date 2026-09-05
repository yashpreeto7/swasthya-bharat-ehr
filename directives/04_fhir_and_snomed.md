# Directive 04: ABDM / FHIR R4 Interoperability & SNOMED CT Terminology

## Goal
Build an interoperability and clinical terminology layer conforming to ABDM standards:
- Internal data model separated from FHIR R4 transfer representations
- FHIR R4 serializers/adapters for:
  - `Patient`
  - `Practitioner`
  - `Encounter`
  - `Condition` (Diagnosis)
  - `Observation` (Vitals / Lab values)
  - `DiagnosticReport` (Lab test summaries)
  - `MedicationRequest` (Prescriptions)
  - `Consent` (ABDM consent artifact)
- SNOMED CT terminology abstraction preventing fabricated medical codes, using verified clinical concept dictionaries.

## Inputs & Prerequisites
- Pydantic models for FHIR R4 resources
- Validated SNOMED CT concept catalog (Diabetes, Hypertension, Dengue, Asthma, Blood Sugar, CBC, etc.)
- Internal relational entities

## Execution Steps
1. **SNOMED CT Terminology Registry**:
   - Create `backend/app/terminology/snomed.py`:
     - Dictionary of authentic SNOMED CT codes (code, display, system: `http://snomed.info/sct`).
     - Validation helper `get_snomed_concept(code_or_query)` to look up official codes.
     - Never invent random numeric strings as SNOMED codes.
2. **FHIR R4 Serializer Pipeline**:
   - Map `Patient` -> FHIR R4 `Patient` resource (ABHA identifier, telecom, gender, birthDate).
   - Map `Practitioner` -> FHIR R4 `Practitioner` resource.
   - Map `Encounter` -> FHIR R4 `Encounter` resource (period, class, subject).
   - Map `Condition` -> FHIR R4 `Condition` resource (code with SNOMED concept, clinicalStatus).
   - Map `Observation` -> FHIR R4 `Observation` resource (code, valueQuantity/valueString, referenceRange).
   - Map `DiagnosticReport` -> FHIR R4 `DiagnosticReport` resource (code, status, result references).
   - Map `Prescription` -> FHIR R4 `MedicationRequest` resource (medicationCodeableConcept, dosageInstruction).
   - Map `Consent` -> FHIR R4 `Consent` resource.
3. **FHIR Endpoints**:
   - Expose standard FHIR endpoints under `/api/fhir/*`:
     - `/api/fhir/Patient/{id}`
     - `/api/fhir/Condition?patient={id}`
     - `/api/fhir/Observation?patient={id}`
     - `/api/fhir/DiagnosticReport?patient={id}`
     - `/api/fhir/MedicationRequest?patient={id}`
     - `/api/fhir/Consent?patient={id}`

## Scripts Used
- `execution/validate_fhir_schema.py` — Validates generated FHIR R4 JSON documents against standard FHIR schemas.

## Outputs & Deliverables
- Clean FHIR R4 compliant REST endpoints and validated SNOMED CT concept search.

## Edge Cases & Learnings
- FHIR R4 strictness requires valid datetime formats (`YYYY-MM-DDThh:mm:ssZ`) and system URIs.
- Ensure identifiers use official ABDM naming systems (`https://healthid.abdm.gov.in`).
