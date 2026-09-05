"""
backend/app/fhir/serializers.py
ABDM-aligned FHIR R4 resource serializers.
Maps internal relational models into standard FHIR R4 JSON documents.
"""

from typing import Dict, Any, List
from backend.app.models.entities import (
    Patient, Practitioner, Encounter, Condition, Observation,
    DiagnosticReport, Prescription, Consent, Appointment
)

class FhirSerializer:
    @staticmethod
    def patient_to_fhir(patient: Patient) -> Dict[str, Any]:
        user_name = patient.user.full_name if patient.user else "Unknown Patient"
        name_parts = user_name.split(" ")
        given = name_parts[:-1] if len(name_parts) > 1 else name_parts
        family = name_parts[-1] if len(name_parts) > 1 else ""

        telecom = []
        if patient.phone:
            telecom.append({"system": "phone", "value": patient.phone, "use": "mobile"})
        if patient.user and patient.user.email:
            telecom.append({"system": "email", "value": patient.user.email})

        return {
            "resourceType": "Patient",
            "id": patient.id,
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient"]
            },
            "identifier": [
                {
                    "system": "https://healthid.abdm.gov.in",
                    "value": patient.abha_id,
                    "type": {
                        "coding": [
                            {"system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR"}
                        ]
                    }
                }
            ],
            "name": [
                {
                    "use": "official",
                    "text": user_name,
                    "family": family,
                    "given": given
                }
            ],
            "telecom": telecom,
            "gender": patient.gender.lower() if patient.gender else "unknown",
            "birthDate": patient.date_of_birth or "1990-01-01"
        }

    @staticmethod
    def practitioner_to_fhir(doctor: Practitioner) -> Dict[str, Any]:
        user_name = doctor.user.full_name if doctor.user else "Practitioner"
        return {
            "resourceType": "Practitioner",
            "id": doctor.id,
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner"]
            },
            "identifier": [
                {
                    "system": "https://doctor.nmc.org.in",
                    "value": doctor.registration_number
                }
            ],
            "name": [{"text": user_name}],
            "qualification": [
                {
                    "code": {
                        "text": f"{doctor.qualification or 'MBBS'} - {doctor.specialization}"
                    }
                }
            ]
        }

    @staticmethod
    def encounter_to_fhir(encounter: Encounter) -> Dict[str, Any]:
        return {
            "resourceType": "Encounter",
            "id": encounter.id,
            "status": "finished" if encounter.status == "COMPLETED" else "in-progress",
            "class": {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                "code": "AMB",
                "display": "ambulatory"
            },
            "subject": {
                "reference": f"Patient/{encounter.patient_id}"
            },
            "participant": [
                {
                    "individual": {
                        "reference": f"Practitioner/{encounter.doctor_id}"
                    }
                }
            ] if encounter.doctor_id else [],
            "period": {
                "start": encounter.encounter_date.isoformat() if encounter.encounter_date else None
            },
            "reasonCode": [
                {"text": encounter.reason or "Routine clinical consultation"}
            ]
        }

    @staticmethod
    def condition_to_fhir(condition: Condition) -> Dict[str, Any]:
        return {
            "resourceType": "Condition",
            "id": condition.id,
            "meta": {
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition"]
            },
            "clinicalStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": condition.clinical_status.lower() if condition.clinical_status else "active"
                    }
                ]
            },
            "verificationStatus": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": condition.verification_status.lower() if condition.verification_status else "confirmed"
                    }
                ]
            },
            "code": {
                "coding": [
                    {
                        "system": "http://snomed.info/sct",
                        "code": condition.snomed_code,
                        "display": condition.display_name
                    }
                ],
                "text": condition.display_name
            },
            "subject": {
                "reference": f"Patient/{condition.patient_id}"
            },
            "encounter": {
                "reference": f"Encounter/{condition.encounter_id}"
            } if condition.encounter_id else None
        }

    @staticmethod
    def observation_to_fhir(obs: Observation) -> Dict[str, Any]:
        return {
            "resourceType": "Observation",
            "id": obs.id,
            "status": "final",
            "code": {
                "coding": [
                    {
                        "system": "http://loinc.org" if obs.test_code.isdigit() else "http://snomed.info/sct",
                        "code": obs.test_code,
                        "display": obs.test_name
                    }
                ],
                "text": obs.test_name
            },
            "subject": {
                "reference": f"Patient/{obs.patient_id}"
            },
            "effectiveDateTime": obs.observation_date.isoformat() if obs.observation_date else None,
            "valueString": f"{obs.value} {obs.unit or ''}".strip(),
            "interpretation": [
                {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                            "code": "A" if obs.is_abnormal else "N",
                            "display": "Abnormal" if obs.is_abnormal else "Normal"
                        }
                    ]
                }
            ],
            "referenceRange": [
                {
                    "text": obs.reference_range or "Standard physiological range"
                }
            ]
        }

    @staticmethod
    def diagnostic_report_to_fhir(report: DiagnosticReport, observations: List[Observation]) -> Dict[str, Any]:
        return {
            "resourceType": "DiagnosticReport",
            "id": report.id,
            "status": "final",
            "code": {
                "text": report.title
            },
            "subject": {
                "reference": f"Patient/{report.patient_id}"
            },
            "issued": report.issued_at.isoformat() if report.issued_at else None,
            "conclusion": report.conclusion,
            "result": [
                {"reference": f"Observation/{obs.id}", "display": obs.test_name}
                for obs in observations
            ]
        }

    @staticmethod
    def prescription_to_fhir(rx: Prescription) -> Dict[str, Any]:
        return {
            "resourceType": "MedicationRequest",
            "id": rx.id,
            "status": "active" if rx.status == "ACTIVE" else "completed",
            "intent": "order",
            "medicationCodeableConcept": {
                "text": rx.medication_name
            },
            "subject": {
                "reference": f"Patient/{rx.patient_id}"
            },
            "requester": {
                "reference": f"Practitioner/{rx.doctor_id}"
            } if rx.doctor_id else None,
            "authoredOn": rx.prescribed_at.isoformat() if rx.prescribed_at else None,
            "dosageInstruction": [
                {
                    "text": f"{rx.dosage}, {rx.frequency} for {rx.duration}. {rx.instructions or ''}".strip()
                }
            ]
        }

    @staticmethod
    def consent_to_fhir(consent: Consent) -> Dict[str, Any]:
        return {
            "resourceType": "Consent",
            "id": consent.id,
            "status": "active" if consent.status == "GRANTED" else "inactive",
            "scope": {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/consentscope",
                        "code": "patient-privacy"
                    }
                ]
            },
            "patient": {
                "reference": f"Patient/{consent.patient_id}"
            },
            "dateTime": consent.created_at.isoformat() if consent.created_at else None,
            "performer": [
                {"reference": f"Practitioner/{consent.doctor_id}"}
            ],
            "provision": {
                "type": "permit",
                "period": {
                    "start": consent.valid_from.isoformat() if consent.valid_from else None,
                    "end": consent.valid_to.isoformat() if consent.valid_to else None
                },
                "purpose": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
                        "code": consent.purpose
                    }
                ]
            }
        }
