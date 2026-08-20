import urllib.request
import json
import sys

# Ensure UTF-8 output encoding for Windows terminal
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

def test_api():
    print("--- 1. Testing Admin Login ---")
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login/",
        data=json.dumps({"username": "admin", "password": "password123"}).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        login_res = json.loads(resp.read().decode('utf-8'))
        token = login_res["access"]
        print(f"[SUCCESS] Login successful! User: {login_res['user']['username']} | Role: {login_res['user']['role']}")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    print("\n--- 2. Fetching Projects ---")
    req = urllib.request.Request(f"{BASE_URL}/projects/", headers=headers)
    with urllib.request.urlopen(req) as resp:
        projects = json.loads(resp.read().decode('utf-8'))
        print(f"[SUCCESS] Fetched {len(projects)} projects.")
        for p in projects:
            print(f"   * [{p['status']}] {p['name']} ({p['progress_percentage']}% completed)")

    print("\n--- 3. Fetching Tasks ---")
    req = urllib.request.Request(f"{BASE_URL}/tasks/", headers=headers)
    with urllib.request.urlopen(req) as resp:
        tasks = json.loads(resp.read().decode('utf-8'))
        print(f"[SUCCESS] Fetched {len(tasks)} tasks.")
        target_task = None
        for t in tasks:
            print(f"   * [{t['priority']}] {t['title']} -> Status: {t['status']}, Deadline: {t['deadline']}")
            if t['deadline_history_count'] > 0:
                target_task = t

    print("\n--- 4. Testing Deadline Revision History (Additional Challenge) ---")
    if target_task:
        req = urllib.request.Request(f"{BASE_URL}/tasks/{target_task['id']}/deadline_history/", headers=headers)
        with urllib.request.urlopen(req) as resp:
            history = json.loads(resp.read().decode('utf-8'))
            print(f"[SUCCESS] Fetched {len(history)} deadline change log entries for Task #{target_task['id']}:")
            for h in history:
                print(f"   * Previous Deadline: {h['previous_deadline']} -> New Deadline: {h['new_deadline']}")
                print(f"     Reason: '{h['reason']}'")

    print("\n--- 5. Updating Task Deadline to Trigger New Audit Entry ---")
    task_id = tasks[0]['id']
    req = urllib.request.Request(
        f"{BASE_URL}/tasks/{task_id}/",
        data=json.dumps({
            "deadline": "2026-10-15T18:00:00Z",
            "deadline_reason": "Updated deadline for client presentation deliverable."
        }).encode('utf-8'),
        headers=headers,
        method="PATCH"
    )
    with urllib.request.urlopen(req) as resp:
        updated = json.loads(resp.read().decode('utf-8'))
        print(f"[SUCCESS] Task #{task_id} deadline updated to {updated['deadline']}")

    req = urllib.request.Request(f"{BASE_URL}/tasks/{task_id}/deadline_history/", headers=headers)
    with urllib.request.urlopen(req) as resp:
        history = json.loads(resp.read().decode('utf-8'))
        print(f"[SUCCESS] New Deadline History count for Task #{task_id}: {len(history)}")
        latest = history[0]
        print(f"   * Latest Entry: Previous {latest['previous_deadline']} -> New {latest['new_deadline']}")
        print(f"     Reason: '{latest['reason']}'")

    print("\n--- 6. Testing Dashboard Stats ---")
    req = urllib.request.Request(f"{BASE_URL}/tasks/dashboard_stats/", headers=headers)
    with urllib.request.urlopen(req) as resp:
        stats = json.loads(resp.read().decode('utf-8'))
        print(f"[SUCCESS] Dashboard Analytics: Total Projects: {stats['total_projects']}, Total Tasks: {stats['total_tasks']}, Completion Rate: {stats['completion_rate']}%, Deadline Changes Logged: {stats['total_deadline_changes']}")

    print("\nALL BACKEND REST API ENDPOINTS VERIFIED PERFECTLY!")

if __name__ == "__main__":
    test_api()
