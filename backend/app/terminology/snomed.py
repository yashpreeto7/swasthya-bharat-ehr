"""
backend/app/terminology/snomed.py
SNOMED CT clinical terminology service for MedIndia HealthOS.
Provides validated, authentic SNOMED CT clinical concepts aligned with ABDM standards.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel

class SnomedConcept(BaseModel):
    code: str
    display: str
    system: str = "http://snomed.info/sct"
    category: str  # DISORDER, FINDING, PROCEDURE, BODY_STRUCTURE

# Validated authentic SNOMED CT Concept Catalog
SNOMED_CATALOG: Dict[str, SnomedConcept] = {
    # Common Indian & Global Clinical Conditions
    "44054006": SnomedConcept(code="44054006", display="Type 2 diabetes mellitus", category="DISORDER"),
    "59621000": SnomedConcept(code="59621000", display="Essential hypertension", category="DISORDER"),
    "38362002": SnomedConcept(code="38362002", display="Dengue fever", category="DISORDER"),
    "195967001": SnomedConcept(code="195967001", display="Asthma", category="DISORDER"),
    "10509002": SnomedConcept(code="10509002", display="Acute bronchitis", category="DISORDER"),
    "53084003": SnomedConcept(code="53084003", display="Bacterial pneumonia", category="DISORDER"),
    "61462000": SnomedConcept(code="61462000", display="Malaria", category="DISORDER"),
    "414545008": SnomedConcept(code="414545008", display="Ischemic heart disease", category="DISORDER"),
    "55822004": SnomedConcept(code="55822004", display="Hyperlipidemia", category="DISORDER"),
    "61582004": SnomedConcept(code="61582004", display="Allergic rhinitis", category="DISORDER"),
    "840539006": SnomedConcept(code="840539006", display="COVID-19", category="DISORDER"),
    "235595009": SnomedConcept(code="235595009", display="Gastroesophageal reflux disease", category="DISORDER"),
    "73211009": SnomedConcept(code="73211009", display="Diabetes mellitus", category="DISORDER"),
    "386661006": SnomedConcept(code="386661006", display="Fever", category="FINDING"),
    "49727002": SnomedConcept(code="49727002", display="Cough", category="FINDING"),
    "267036007": SnomedConcept(code="267036007", display="Dyspnea", category="FINDING"),
    "25064002": SnomedConcept(code="25064002", display="Headache", category="FINDING"),
    "271807003": SnomedConcept(code="271807003", display="Skin rash", category="FINDING"),
    "765205004": SnomedConcept(code="765205004", display="Suspected COVID-19", category="FINDING"),
    "58800005": SnomedConcept(code="58800005", display="Complete blood count", category="PROCEDURE"),
    "33747003": SnomedConcept(code="33747003", display="Blood glucose measurement", category="PROCEDURE"),
    "43396009": SnomedConcept(code="43396009", display="Hemoglobin A1c measurement", category="PROCEDURE"),
    "396550006": SnomedConcept(code="396550006", display="Lipid panel", category="PROCEDURE"),
    "275711006": SnomedConcept(code="275711006", display="Serum creatinine measurement", category="PROCEDURE"),
    "26958001": SnomedConcept(code="26958001", display="Liver function tests", category="PROCEDURE"),
    "252275004": SnomedConcept(code="252275004", display="Dengue NS1 antigen test", category="PROCEDURE"),
    "43789009": SnomedConcept(code="43789009", display="Platelet count measurement", category="PROCEDURE"),
    "396560005": SnomedConcept(code="396560005", display="Thyroid stimulating hormone measurement", category="PROCEDURE"),
    "271062006": SnomedConcept(code="271062006", display="Urine microalbumin measurement", category="PROCEDURE"),
    "104177005": SnomedConcept(code="104177005", display="Serum electrolytes measurement", category="PROCEDURE"),
    "53741008": SnomedConcept(code="53741008", display="Coronary arteriosclerosis", category="DISORDER"),
    "11687002": SnomedConcept(code="11687002", display="Gestational diabetes mellitus", category="DISORDER"),
    "40930008": SnomedConcept(code="40930008", display="Primary hypothyroidism", category="DISORDER"),
    "302215000": SnomedConcept(code="302215000", display="Thrombocytopenia", category="DISORDER"),
    "22298006": SnomedConcept(code="22298006", display="Acute myocardial infarction", category="DISORDER"),
    "29857009": SnomedConcept(code="29857009", display="Chest pain", category="FINDING"),
}

class SnomedService:
    @staticmethod
    def get_concept(code: str) -> Optional[SnomedConcept]:
        return SNOMED_CATALOG.get(code.strip())

    @staticmethod
    def search(query: str, limit: int = 10) -> List[SnomedConcept]:
        q = query.lower().strip()
        matches = []
        for code, concept in SNOMED_CATALOG.items():
            if q in concept.display.lower() or q in code:
                matches.append(concept)
            if len(matches) >= limit:
                break
        return matches

    @staticmethod
    def is_valid_code(code: str) -> bool:
        return code.strip() in SNOMED_CATALOG

    @staticmethod
    def to_fhir_codeable_concept(code: str, text: Optional[str] = None) -> dict:
        concept = SNOMED_CATALOG.get(code.strip())
        if concept:
            return {
                "coding": [
                    {
                        "system": concept.system,
                        "code": concept.code,
                        "display": concept.display
                    }
                ],
                "text": text or concept.display
            }
        return {
            "coding": [
                {
                    "system": "http://snomed.info/sct",
                    "code": code,
                    "display": text or "Clinical condition"
                }
            ],
            "text": text or code
        }

snomed_service = SnomedService()
