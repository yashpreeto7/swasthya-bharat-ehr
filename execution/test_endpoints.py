import urllib.request
import json

def test():
    # 1. Login doctor
    login_data = json.dumps({'email': 'dr.arvind@apollo.in', 'password': 'Doctor123!'}).encode('utf-8')
    req = urllib.request.Request('http://localhost:8000/api/v1/auth/login', data=login_data, headers={'Content-Type': 'application/json'})
    token_doc = json.loads(urllib.request.urlopen(req).read().decode())['access_token']

    # Test authorized patients timeline
    pts_req = urllib.request.Request('http://localhost:8000/api/v1/doctors/authorized-patients', headers={'Authorization': f'Bearer {token_doc}'})
    pts = json.loads(urllib.request.urlopen(pts_req).read().decode())
    print("--- TIMELINE VERIFICATION ---")
    for p in pts:
        pid = p['patient_id']
        t_req = urllib.request.Request(f'http://localhost:8000/api/v1/doctors/patients/{pid}/timeline', headers={'Authorization': f'Bearer {token_doc}'})
        events = json.loads(urllib.request.urlopen(t_req).read().decode()).get('events', [])
        print(f"Patient {p['full_name']} has {len(events)} events.")
        for e in events:
            print(f"   [{e['event_type']}] {e['title']} -> {e.get('description', '')[:50]}")

    # 2. Login patient & test GET /api/v1/doctors
    print("\n--- PRACTITIONERS FOR CONSENT VERIFICATION ---")
    login_pat = json.dumps({'email': 'rajesh.sharma@example.in', 'password': 'Password123!'}).encode('utf-8')
    req_p = urllib.request.Request('http://localhost:8000/api/v1/auth/login', data=login_pat, headers={'Content-Type': 'application/json'})
    token_pat = json.loads(urllib.request.urlopen(req_p).read().decode())['access_token']

    docs_req = urllib.request.Request('http://localhost:8000/api/v1/doctors', headers={'Authorization': f'Bearer {token_pat}'})
    docs = json.loads(urllib.request.urlopen(docs_req).read().decode())
    print(f"Registered practitioners available for consent: {len(docs)}")
    for d in docs:
        print(f"   Dr. {d['full_name']} | {d['specialization']} | ID: {d['id']}")

    # 3. Login lab & test GET /api/v1/labs/orders
    print("\n--- LAB ORDERS VERIFICATION ---")
    login_lab = json.dumps({'email': 'delhi.lab@lalpathlabs.com', 'password': 'Lab12345!'}).encode('utf-8')
    req_l = urllib.request.Request('http://localhost:8000/api/v1/auth/login', data=login_lab, headers={'Content-Type': 'application/json'})
    token_lab = json.loads(urllib.request.urlopen(req_l).read().decode())['access_token']

    orders_req = urllib.request.Request('http://localhost:8000/api/v1/labs/orders', headers={'Authorization': f'Bearer {token_lab}'})
    orders = json.loads(urllib.request.urlopen(orders_req).read().decode())
    print(f"Diagnostic testing orders available: {len(orders)}")
    for o in orders:
        print(f"   Order #{o['order_id']} | Test: {o['test_name']} | Patient: {o['patient_name']} | Status: {o['status']}")

if __name__ == '__main__':
    test()
