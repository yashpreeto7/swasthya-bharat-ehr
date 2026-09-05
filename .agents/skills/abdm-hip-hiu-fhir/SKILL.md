---
name: abdm-hip-hiu-fhir
description: "Guidelines and architecture for Ayushman Bharat Digital Mission (ABDM) integration: Health Information Provider (HIP), Health Information User (HIU), Care Context linking, Consent Flow, and NRCES-compliant FHIR R4 Bundles."
user-invocable: true
---

# ABDM HIP / HIU & FHIR R4 Architecture Skill

Use this skill when designing, building, or auditing Indian digital health integrations aligned with National Health Authority (NHA) ABDM standards.

## 1. ABDM Core Ecosystem Roles

1. **ABHA (Ayushman Bharat Health Account)**:
   - 14-digit unique health identifier (format: `XX-XXXX-XXXX-XXXX`) and ABHA Address (`name@abdm`).
   - Universal patient identifier used for discovery and care-context linkage.

2. **HIP (Health Information Provider)**:
   - Hospitals, diagnostic laboratories, and clinics that generate and store clinical records.
   - Responsibilities:
     - **Discovery**: Match incoming patient demographics/ABHA to internal patient records.
     - **Linking**: Bind clinical episodes ("Care Contexts") to the patient's ABHA after authentication/OTP.
     - **Data Transfer**: Encrypt and push standard FHIR R4 data bundles upon receiving a verified ABDM consent artifact.

3. **HIU (Health Information User)**:
   - Clinics, telemedicine apps, or doctor workspaces requesting medical history.
   - Responsibilities:
     - **Consent Request**: Initiate consent requests specifying categories, date ranges, and care purpose.
     - **Consent Polling/Webhook**: Receive granted consent notification from ABDM Gateway.
     - **Health Data Fetch**: Request encrypted health records from the designated HIP, decrypt via Diffie-Hellman keys, and display the longitudinal timeline.

4. **Gateway / Consent Manager (CM)**:
   - Neutral government-operated trust broker.
   - Routes discovery, consent requests, and public keys; never stores health data.

---

## 2. ABDM Milestones (M1, M2, M3)

- **M1 (ABHA Creation & Verification)**:
  - Generate ABHA via Aadhaar / Mobile OTP.
  - Verify ABHA address and extract demographic token.
- **M2 (HIP Care Context Linking)**:
  - Patient visits hospital -> Hospital creates Care Context (e.g. `OPD-ENC-2026-001`, `LAB-ORDER-892`).
  - Discovery request -> User verifies via OTP -> Care Context permanently linked to ABHA.
- **M3 (HIU Consent & Health Data Flow)**:
  - Doctor creates consent request -> Patient approves on ABHA app -> HIU requests data from HIP -> HIP encrypts FHIR Bundle -> HIU decrypts and renders timeline.

---

## 3. Care Context Structure

Each record must be bound to a Care Context:
```json
{
  "patientReference": "91-4405-2026-0001",
  "careContexts": [
    {
      "referenceNumber": "OPD-2026-0906-01",
      "display": "General Medicine Consultation - Dr. Arvind Swaminathan"
    },
    {
      "referenceNumber": "LAB-2026-0906-89",
      "display": "HbA1c & Fasting Blood Sugar - Dr. Lal PathLabs"
    }
  ]
}
```

---

## 4. FHIR R4 ABDM Bundles

ABDM requires HL7 FHIR Release 4 document bundles (`Bundle.type = "document"`):
- `Bundle.entry[0]`: `Composition` resource detailing author, custodian, and section references.
- `Bundle.entry[...]`: Core resources:
  - `Patient`: ABHA identifier (`https://healthid.abdm.gov.in`).
  - `Practitioner`: NMC Registration (`https://doctor.nmc.org.in`).
  - `Encounter`: Clinical visit context.
  - `Condition`: Diagnoses with **authentic SNOMED CT concepts** (`http://snomed.info/sct`).
  - `MedicationRequest`: Prescriptions.
  - `DiagnosticReport` & `Observation`: Lab values with reference ranges.
  - `Consent`: ABDM consent artifact.

---

## 5. Security & Decoupling Principles

- **Zero-Knowledge Gateway**: Gateway only sees consent metadata; clinical records pass directly between HIP and HIU encrypted end-to-end.
- **Strict Decoupling**: Internal database models must never be tightly coupled to FHIR schemas; always use a dedicated serializer/adapter layer.
- **Immutable Consent Enforcement**: Any HIU data fetch must fail if the consent artifact is expired or revoked.
