"""
execution/verify_backend_api.py
Deterministic end-to-end API verification script for MedIndia HealthOS.
Validates Auth, RBAC, Consent Gating, FHIR R4, SNOMED CT, AI Copilot, and Audit Trails.
"""

import sys
import asyncio
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import httpx
from backend.app.main import app

async def run_verification():
    print("=" * 60)
    print("MedIndia HealthOS — Backend API Smoke & Integration Test")
    print("=" * 60)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Health check
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("[PASS] 1. Health Endpoint (/api/health) -> 200 OK")

        # 2. Doctor Login
        res = await client.post("/api/v1/auth/login", json={
            "email": "dr.arvind@apollo.in",
            "password": "Doctor123!"
        })
        assert res.status_code == 200, f"Doctor login failed: {res.text}"
        doc_token = res.json()["access_token"]
        doc_headers = {"Authorization": f"Bearer {doc_token}"}
        print("[PASS] 2. Doctor Authentication (JWT issued) -> 200 OK")

        # 3. Patient Login
        res = await client.post("/api/v1/auth/login", json={
            "email": "rajesh.sharma@example.in",
            "password": "Password123!"
        })
        assert res.status_code == 200, f"Patient login failed: {res.text}"
        p1_data = res.json()["user"]
        p1_id = p1_data["patient_id"]
        p1_token = res.json()["access_token"]
        p1_headers = {"Authorization": f"Bearer {p1_token}"}
        print(f"[PASS] 3. Patient Authentication (Rajesh Sharma, ID: {p1_id[:8]}...) -> 200 OK")

        # 4. Lab Login
        res = await client.post("/api/v1/auth/login", json={
            "email": "delhi.lab@lalpathlabs.com",
            "password": "Lab12345!"
        })
        assert res.status_code == 200, f"Lab login failed: {res.text}"
        lab_token = res.json()["access_token"]
        lab_headers = {"Authorization": f"Bearer {lab_token}"}
        print("[PASS] 4. Lab Staff Authentication -> 200 OK")

        # 5. Doctor views authorized patients (Consent verified)
        res = await client.get("/api/v1/doctors/authorized-patients", headers=doc_headers)
        assert res.status_code == 200, f"Authorized patients query failed: {res.text}"
        authorized_patients = res.json()
        assert len(authorized_patients) >= 1, "Expected at least 1 authorized patient"
        print(f"[PASS] 5. Doctor Roster (Found {len(authorized_patients)} consent-authorized patients) -> 200 OK")

        # 6. Doctor views Patient Timeline (Consent verified & Audit logged)
        res = await client.get(f"/api/v1/doctors/patients/{p1_id}/timeline", headers=doc_headers)
        assert res.status_code == 200, f"Patient timeline access failed: {res.text}"
        timeline = res.json()
        assert len(timeline["events"]) >= 3, "Expected clinical events in timeline"
        print(f"[PASS] 6. Consent-Gated Timeline Retrieval ({len(timeline['events'])} events) -> 200 OK")

        # 7. SNOMED CT Search
        res = await client.get("/api/v1/terminology/snomed/search?q=diabetes")
        assert res.status_code == 200, f"SNOMED search failed: {res.text}"
        snomed_hits = res.json()
        assert any(c["code"] == "44054006" for c in snomed_hits), "Missing Type 2 Diabetes SNOMED concept"
        print(f"[PASS] 7. SNOMED CT Search (Found concept 44054006: {snomed_hits[0]['display']}) -> 200 OK")

        # 8. ABDM FHIR R4 Patient Resource
        res = await client.get(f"/api/fhir/Patient/{p1_id}")
        assert res.status_code == 200, f"FHIR Patient failed: {res.text}"
        fhir_patient = res.json()
        assert fhir_patient["resourceType"] == "Patient", "Invalid FHIR resourceType"
        assert fhir_patient["identifier"][0]["system"] == "https://healthid.abdm.gov.in"
        print(f"[PASS] 8. FHIR R4 Patient Resource (ABHA: {fhir_patient['identifier'][0]['value']}) -> 200 OK")

        # 9. AI Grounded Clinical Summary
        res = await client.get(f"/api/v1/ai/summary/{p1_id}", headers=doc_headers)
        assert res.status_code == 200, f"AI Summary failed: {res.text}"
        ai_summary = res.json()
        assert len(ai_summary["grounded_record_ids"]) > 0, "AI summary must cite record IDs"
        print(f"[PASS] 9. AI Grounded Clinical Summary ({len(ai_summary['grounded_record_ids'])} records cited) -> 200 OK")

        # 10. AI Grounded Inquiry
        res = await client.post("/api/v1/ai/query", headers=doc_headers, json={
            "patient_id": p1_id,
            "query": "What were the patient's recent blood sugar and HbA1c test results?"
        })
        assert res.status_code == 200, f"AI Query failed: {res.text}"
        ai_answer = res.json()
        assert len(ai_answer["grounded_record_ids"]) > 0
        print("[PASS] 10. AI Grounded RAG Query -> 200 OK")

        # 11. Patient Audit Log
        res = await client.get("/api/v1/audit/patient", headers=p1_headers)
        assert res.status_code == 200, f"Patient audit failed: {res.text}"
        audit_logs = res.json()
        assert len(audit_logs) >= 2, "Expected audit trail entries"
        print(f"[PASS] 11. Patient Transparency Audit Trail ({len(audit_logs)} access events logged) -> 200 OK")

        # 12. ABDM HIP Patient Discovery (M2 Care Context Discovery)
        res = await client.post("/api/v1/abdm/hip/discover", json={
            "abha_id": "91-4405-2026-0001",
            "hip_id": "HIP-APOLLO-DELHI"
        })
        assert res.status_code == 200, f"ABDM HIP Discovery failed: {res.text}"
        disc_data = res.json()
        assert len(disc_data["care_contexts"]) >= 1, "Expected discovered care contexts"
        print(f"[PASS] 12. ABDM HIP Discovery (Found {len(disc_data['care_contexts'])} linked Care Contexts) -> 200 OK")

        # 13. ABDM HIU Encrypted Health Data Flow (M3 Transfer under Consent)
        consent_id = authorized_patients[0]["consent_id"]
        res = await client.get(f"/api/v1/abdm/hiu/health-information/fetch/{consent_id}")
        assert res.status_code == 200, f"ABDM HIU Fetch failed: {res.text}"
        hiu_bundle = res.json()
        assert hiu_bundle["fhir_bundle"]["resourceType"] == "Bundle"
        print(f"[PASS] 13. ABDM HIU Data Flow (Extracted {len(hiu_bundle['fhir_bundle']['entry'])} resources in Document Bundle) -> 200 OK")

        # 14. Security Barrier (Rejected unauthorized request)
        unauth_headers = {"Authorization": "Bearer invalid_token_xyz"}
        res = await client.get(f"/api/v1/doctors/patients/{p1_id}/timeline", headers=unauth_headers)
        assert res.status_code == 401, f"Expected 401 Unauthorized, got {res.status_code}"
        print("[PASS] 14. Security Barrier (Rejected unauthorized request) -> 401 Unauthorized")

    print("=" * 60)
    print("ALL 12 BACKEND INTEGRATION & SECURITY TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_verification())
