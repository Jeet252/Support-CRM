import urllib.request
import json
import time

API_BASE = "http://localhost:8000/api"

def run_tests():
    print("=== STARTING BACKEND REST API TEST ===")
    
    # 1. Create a support ticket (POST /api/tickets)
    print("\n1. Testing POST /api/tickets...")
    ticket_payload = {
        "customer_name": "Tony Stark",
        "customer_email": "tony@starkindustries.com",
        "subject": "Arc Reactor Power Ripple",
        "description": "My home grid is experiencing a 3% voltage ripple in the secondary output phase. Need to sync the telemetry data with support."
    }
    
    req = urllib.request.Request(
        f"{API_BASE}/tickets",
        data=json.dumps(ticket_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("Response status: 201 (Created)")
            print("Response body:", res_data)
            assert "ticket_id" in res_data
            assert "created_at" in res_data
            new_ticket_id = res_data["ticket_id"]
            print(f"SUCCESS: Created ticket {new_ticket_id}")
    except Exception as e:
        print("FAIL: Could not create ticket.", e)
        return

    # 2. Get list of all tickets (GET /api/tickets)
    print("\n2. Testing GET /api/tickets...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/tickets") as res:
            tickets = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print(f"Loaded {len(tickets)} tickets.")
            print("First ticket in list:", tickets[0])
            assert len(tickets) > 0
            print("SUCCESS: Listed tickets successfully")
    except Exception as e:
        print("FAIL: Could not list tickets.", e)
        return

    # 3. Filter tickets by status (GET /api/tickets?status=Open)
    print("\n3. Testing GET /api/tickets?status=Open...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/tickets?status=Open") as res:
            tickets = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print(f"Loaded {len(tickets)} Open tickets.")
            for t in tickets:
                assert t["status"] == "Open"
            print("SUCCESS: Status filtering works")
    except Exception as e:
        print("FAIL: Status filter query failed.", e)
        return

    # 4. Search tickets (GET /api/tickets?search=Tony)
    print("\n4. Testing GET /api/tickets?search=Tony...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/tickets?search=Tony") as res:
            tickets = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print(f"Found {len(tickets)} search matches.")
            assert len(tickets) > 0
            assert "Tony Stark" in tickets[0]["customer_name"]
            print("SUCCESS: Search query works")
    except Exception as e:
        print("FAIL: Search query failed.", e)
        return

    # 5. Get full ticket details (GET /api/tickets/{ticket_id})
    print(f"\n5. Testing GET /api/tickets/{new_ticket_id}...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/tickets/{new_ticket_id}") as res:
            ticket = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print("Full Details:")
            print(f"  ID: {ticket['ticket_id']}")
            print(f"  Name: {ticket['customer_name']}")
            print(f"  Email: {ticket['customer_email']}")
            print(f"  Subject: {ticket['subject']}")
            print(f"  Description: {ticket['description']}")
            print(f"  Status: {ticket['status']}")
            print(f"  Notes list count: {len(ticket['notes'])}")
            print(f"  First Note text: '{ticket['notes'][0]['note_text']}'")
            assert ticket["ticket_id"] == new_ticket_id
            assert len(ticket["notes"]) > 0
            print("SUCCESS: Ticket details retrieved successfully")
    except Exception as e:
        print("FAIL: Details retrieval failed.", e)
        return

    # 6. Update ticket status & add note (PUT /api/tickets/{ticket_id})
    print(f"\n6. Testing PUT /api/tickets/{new_ticket_id}...")
    update_payload = {
        "status": "In Progress",
        "notes": "System: Assigned to engineering. JARVIS is matching telemetry ripple files."
    }
    
    req = urllib.request.Request(
        f"{API_BASE}/tickets/{new_ticket_id}",
        data=json.dumps(update_payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print("Response body:", res_data)
            assert res_data["success"] is True
            print("SUCCESS: Ticket status and note updated")
    except Exception as e:
        print("FAIL: Could not update ticket.", e)
        return

    # 7. Re-verify notes timeline update (GET /api/tickets/{ticket_id})
    print(f"\n7. Re-verifying GET /api/tickets/{new_ticket_id} post-update...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/tickets/{new_ticket_id}") as res:
            ticket = json.loads(res.read().decode('utf-8'))
            print("Response status: 200 (OK)")
            print(f"  New Status: {ticket['status']}")
            print(f"  New Notes list count: {len(ticket['notes'])}")
            print("  Timeline Log:")
            for note in ticket['notes']:
                print(f"    - [{note['created_at']}] {note['note_text']}")
            
            assert ticket["status"] == "In Progress"
            assert len(ticket["notes"]) == 2 # Initial note + added note
            print("SUCCESS: Note timeline verification complete")
    except Exception as e:
        print("FAIL: Re-verification failed.", e)
        return

    print("\n=== ALL REST API ENDPOINTS TESTED AND VALIDATED SUCCESSFULLY! ===")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print("Test failed with error:", e)
