import urllib.request
import json
import sys

# Ensure UTF-8 output encoding for Windows terminal
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

def make_request(url, method="GET", payload=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    data = json.dumps(payload).encode('utf-8') if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        return e.code, json.loads(body) if body else {}

def verify_admin_and_member_roles():
    print("================================================================================")
    print("      TEAMS ROLE VERIFICATION SUITE (ADMIN vs TEAM MEMBER PERMISSION CHECKS)")
    print("================================================================================\n")

    # --------------------------------------------------------------------------
    # PART 1: ADMIN ROLE VERIFICATION
    # --------------------------------------------------------------------------
    print("▶ PART 1: TESTING ADMIN PERSONA (Rajkumar Padmanabhan)")
    status, login_res = make_request(f"{BASE_URL}/auth/login/", "POST", {"username": "admin", "password": "password123"})
    assert status == 200, f"Admin login failed: {login_res}"
    admin_token = login_res["access"]
    print(f"  [PASS] Admin Login Successful. Role: {login_res['user']['role']}")

    # 1.1 Admin Creates Project
    status, proj_res = make_request(
        f"{BASE_URL}/projects/", "POST",
        {
            "name": "Enterprise Portal v3",
            "description": "High-availability MNC cloud platform",
            "status": "ACTIVE"
        },
        token=admin_token
    )
    assert status == 201, f"Admin project creation failed: {proj_res}"
    project_id = proj_res["id"]
    print(f"  [PASS] Admin Created Project #{project_id}: '{proj_res['name']}'")

    # 1.2 Admin Creates Team Member
    status, user_res = make_request(
        f"{BASE_URL}/auth/users/", "POST",
        {
            "username": "david",
            "email": "david@teamsync.com",
            "password": "password123",
            "first_name": "David",
            "last_name": "Beckham",
            "role": "MEMBER",
            "department": "Security Engineering"
        },
        token=admin_token
    )
    if status == 400 and "username" in user_res:
        print("  [INFO] User 'david' already exists.")
        status, users_list = make_request(f"{BASE_URL}/auth/users/", "GET", token=admin_token)
        david_user = next(u for u in users_list if u['username'] == 'david')
        david_id = david_user['id']
    else:
        assert status == 201, f"Admin user onboarding failed: {user_res}"
        david_id = user_res["id"]
        print(f"  [PASS] Admin Onboarded New Team Member #{david_id}: David Beckham (MEMBER)")

    # 1.3 Admin Creates & Assigns Task
    status, task_res = make_request(
        f"{BASE_URL}/tasks/", "POST",
        {
            "title": "Configure OAuth2 Security Framework",
            "description": "Implement OAuth2 JWT security tokens with rate limiting",
            "project": project_id,
            "assigned_to": david_id,
            "priority": "URGENT",
            "status": "TODO",
            "deadline": "2026-09-15T18:00:00Z"
        },
        token=admin_token
    )
    assert status == 201, f"Admin task creation failed: {task_res}"
    task_id = task_res["id"]
    print(f"  [PASS] Admin Created & Assigned Task #{task_id} to David Beckham with URGENT priority")

    # 1.4 Admin Modifies Deadline (Triggers Additional Challenge Audit Log)
    status, update_res = make_request(
        f"{BASE_URL}/tasks/{task_id}/", "PATCH",
        {
            "deadline": "2026-09-30T18:00:00Z",
            "deadline_reason": "Scope expansion for multi-factor authentication compliance."
        },
        token=admin_token
    )
    assert status == 200, f"Admin deadline update failed: {update_res}"
    
    status, history_res = make_request(f"{BASE_URL}/tasks/{task_id}/deadline_history/", "GET", token=admin_token)
    assert status == 200 and len(history_res) > 0, f"Deadline history missing: {history_res}"
    print(f"  [PASS] Admin Updated Deadline & Audit History Log Recorded (Reason: '{history_res[0]['reason']}')")

    # --------------------------------------------------------------------------
    # PART 2: TEAM MEMBER ROLE VERIFICATION
    # --------------------------------------------------------------------------
    print("\n▶ PART 2: TESTING TEAM MEMBER PERSONA (Alice Vance / Bob Miller / David Beckham)")
    status, login_res = make_request(f"{BASE_URL}/auth/login/", "POST", {"username": "alice", "password": "password123"})
    assert status == 200, f"Member login failed: {login_res}"
    member_token = login_res["access"]
    print(f"  [PASS] Team Member Login Successful. User: {login_res['user']['username']} | Role: {login_res['user']['role']}")

    # 2.1 Team Member Views Assigned Tasks
    status, my_tasks = make_request(f"{BASE_URL}/tasks/?assigned_to_me=true", "GET", token=member_token)
    assert status == 200, f"Fetching assigned tasks failed: {my_tasks}"
    print(f"  [PASS] Team Member Fetched {len(my_tasks)} Assigned Tasks")

    # 2.2 Team Member Updates Task Status (To Do -> In Progress -> Completed)
    status, all_tasks = make_request(f"{BASE_URL}/tasks/", "GET", token=member_token)
    target_task = all_tasks[0]
    target_id = target_task["id"]

    status, status_res = make_request(
        f"{BASE_URL}/tasks/{target_id}/", "PATCH",
        {"status": "IN_PROGRESS"},
        token=member_token
    )
    assert status == 200, f"Member status update failed: {status_res}"
    print(f"  [PASS] Team Member Updated Task #{target_id} Status to 'IN_PROGRESS'")

    # 2.3 Team Member Posts Technical Comment
    status, comment_res = make_request(
        f"{BASE_URL}/tasks/{target_id}/comments/", "POST",
        {"content": "Completed unit testing for authentication flow and verified status updates."},
        token=member_token
    )
    assert status == 201, f"Member comment posting failed: {comment_res}"
    print(f"  [PASS] Team Member Posted Comment on Task #{target_id}")

    # --------------------------------------------------------------------------
    # PART 3: ROLE PERMISSION GUARD ENFORCEMENT
    # --------------------------------------------------------------------------
    print("\n▶ PART 3: TESTING ROLE SECURITY GUARDS (Preventing Unauthorized Member Actions)")
    
    # 3.1 Team Member Tries to Create Project (Should be FORBIDDEN - HTTP 403)
    status, err_res = make_request(
        f"{BASE_URL}/projects/", "POST",
        {"name": "Unauthorized Project"},
        token=member_token
    )
    assert status == 403, f"Expected 403 Forbidden but got {status}: {err_res}"
    print("  [PASS] Role Security Guard Blocked Unauthorized Member Project Creation (HTTP 403 Forbidden)")

    # 3.2 Team Member Tries to Delete Task (Should be FORBIDDEN - HTTP 403)
    status, err_res = make_request(
        f"{BASE_URL}/tasks/{target_id}/", "DELETE",
        token=member_token
    )
    assert status == 403, f"Expected 403 Forbidden but got {status}: {err_res}"
    print("  [PASS] Role Security Guard Blocked Unauthorized Member Task Deletion (HTTP 403 Forbidden)")

    print("\n================================================================================")
    print("     🎉 ALL ADMIN AND TEAM MEMBER ROLE WORKFLOWS & GUARDS PASSED 100%!")
    print("================================================================================")

if __name__ == "__main__":
    verify_admin_and_member_roles()
