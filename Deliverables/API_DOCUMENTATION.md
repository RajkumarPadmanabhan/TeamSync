# 🔌 REST API Documentation & Endpoint Specification

This document provides the complete technical specification for all REST API endpoints available in the **TeamSync** backend (`http://localhost:8000/api/`).

---

## 🔑 Base URL & Authentication Headers

- **Base URL**: `http://localhost:8000/api/`
- **Authentication Scheme**: JWT Bearer Token
- **Required Header for Authenticated Requests**:
  ```http
  Authorization: Bearer <access_token>
  Content-Type: application/json
  ```

---

## 🔐 1. Authentication & User Profile Endpoints (`/api/auth/`)

### 1.1 User Login (Obtain JWT Pair)
- **Endpoint**: `POST /api/auth/login/`
- **Permissions**: `AllowAny`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@teamsync.com",
      "first_name": "Rajkumar",
      "last_name": "Padmanabhan",
      "role": "ADMIN",
      "department": "Engineering",
      "avatar_url": null,
      "is_staff": true
    }
  }
  ```

---

### 1.2 User Registration
- **Endpoint**: `POST /api/auth/register/`
- **Permissions**: `AllowAny`
- **Request Body**:
  ```json
  {
    "username": "newuser",
    "email": "newuser@teamsync.com",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "role": "MEMBER",
    "first_name": "New",
    "last_name": "Member",
    "department": "QA Engineering"
  }
  ```
- **Response (`201 Created`)**: User profile object JSON.

---

### 1.3 Get or Update Current Logged-In User Profile
- **Endpoint**: `GET /api/auth/me/` | `PATCH /api/auth/me/`
- **Permissions**: `IsAuthenticated`
- **Request Body (`PATCH /api/auth/me/`)**:
  ```json
  {
    "first_name": "Rajkumar",
    "last_name": "P",
    "email": "rajkumar.updated@teamsync.com",
    "role": "ADMIN",
    "department": "Core Engineering"
  }
  ```
- **Response (`200 OK`)**: Updated User object JSON.

---

### 1.4 List All Users or Admin Create User
- **Endpoint**: `GET /api/auth/users/` | `POST /api/auth/users/`
- **Permissions**: `IsAuthenticated` (GET) | `Admin Only` (POST)
- **Response (`200 OK`)**: List of User profile objects.

---

## 📁 2. Projects Endpoints (`/api/projects/`)

### 2.1 List All Projects & Real-Time Progress Statistics
- **Endpoint**: `GET /api/projects/`
- **Permissions**: `IsAuthenticated`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "name": "Enterprise Cloud Migration",
      "description": "Migrate core infrastructure to AWS cloud microservices",
      "status": "ACTIVE",
      "start_date": "2026-01-15",
      "end_date": "2026-06-30",
      "created_by": 1,
      "created_by_name": "admin",
      "members": [1, 2, 3],
      "members_detail": [
        { "id": 1, "username": "admin", "first_name": "Rajkumar", "role": "ADMIN" },
        { "id": 2, "username": "alice", "first_name": "Alice", "role": "MEMBER" }
      ],
      "total_tasks": 5,
      "completed_tasks": 3,
      "progress_percentage": 60,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
  ```

---

### 2.2 Create New Project
- **Endpoint**: `POST /api/projects/`
- **Permissions**: `Admin Only` (`HTTP 403 Forbidden` if Team Member attempts)
- **Request Body**:
  ```json
  {
    "name": "AI Analytics Portal",
    "description": "Build real-time ML analytics dashboard",
    "status": "PLANNING",
    "start_date": "2026-03-01",
    "end_date": "2026-09-30",
    "member_ids": [2, 3]
  }
  ```
- **Response (`201 Created`)**: Created Project JSON.

---

### 2.3 Update or Delete Project
- **Endpoint**: `PATCH /api/projects/{id}/` | `DELETE /api/projects/{id}/`
- **Permissions**: `Admin Only`
- **Response (`200 OK` / `204 No Content`)**:
  - `PATCH`: Updated Project JSON.
  - `DELETE`: `HTTP 204 No Content` (Cascades deletion to associated tasks).

---

## 📩 3. Project Join Invitations Endpoints (`/api/projects/invitations/`)

### 3.1 Send Join Request to Team Member
- **Endpoint**: `POST /api/projects/invitations/send_request/`
- **Permissions**: `Admin Only`
- **Request Body**:
  ```json
  {
    "project_id": 1,
    "user_id": 2,
    "message": "Please join the Enterprise Cloud Migration project team."
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "id": 10,
    "detail": "Project invitation request sent to Alice Vance successfully."
  }
  ```
  *(Sends customized console email notification to `alice@teamsync.com`)*

---

### 3.2 List Pending Invitations for Logged-In User
- **Endpoint**: `GET /api/projects/invitations/my_invitations/`
- **Permissions**: `IsAuthenticated`
- **Response (`200 OK`)**: List of `ProjectInvitation` objects where `invited_user = request.user.id`.

---

### 3.3 Respond to Invitation Request (Accept / Reject)
- **Endpoint**: `POST /api/projects/invitations/{id}/respond/`
- **Permissions**: `IsAuthenticated` (Invited Member Only)
- **Request Body**:
  ```json
  {
    "action": "accept"  // or "reject"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "detail": "Invitation accepted. You have been added to project 'Enterprise Cloud Migration'."
  }
  ```
  *(Accepting automatically appends `request.user` to `project.members`)*

---

## 📋 4. Tasks & Audit Log Endpoints (`/api/tasks/`)

### 4.1 List & Filter Tasks
- **Endpoint**: `GET /api/tasks/`
- **Query Parameters**:
  - `project`: Filter by Project ID (`/api/tasks/?project=1`)
  - `assigned_to`: Filter by User ID (`/api/tasks/?assigned_to=2`)
  - `status`: Filter by Status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`)
  - `priority`: Filter by Priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "title": "Setup OAuth2 Authentication",
      "description": "Configure JWT tokens and role claims",
      "status": "COMPLETED",
      "priority": "HIGH",
      "deadline": "2026-03-15T18:00:00Z",
      "project": 1,
      "project_name": "Enterprise Cloud Migration",
      "assigned_to": 2,
      "assigned_to_detail": { "id": 2, "username": "alice", "first_name": "Alice Vance" },
      "deadline_history_count": 2,
      "comments_count": 3
    }
  ]
  ```

---

### 4.2 Create Task (With Automatic Assignment Email Notification)
- **Endpoint**: `POST /api/tasks/`
- **Permissions**: `Admin Only`
- **Request Body**:
  ```json
  {
    "title": "Database Optimization",
    "description": "Add missing indexes to user table",
    "status": "TODO",
    "priority": "URGENT",
    "deadline": "2026-04-01T17:00:00Z",
    "project": 1,
    "assigned_to": 3
  }
  ```
- **Response (`201 Created`)**: Created Task JSON.
  *(Sends customized task assignment console email to assigned member)*

---

### 4.3 Update Task & Record Deadline Revision Audit Log
- **Endpoint**: `PATCH /api/tasks/{id}/`
- **Permissions**: `IsAuthenticated` (Members can update status/comments; Admin can update title/deadline/assignee/priority)
- **Request Body (Updating Deadline)**:
  ```json
  {
    "deadline": "2026-04-15T17:00:00Z",
    "deadline_change_reason": "Scope expansion for multi-factor authentication compliance."
  }
  ```
- **Response (`200 OK`)**: Updated Task JSON with auto-created `DeadlineHistory` record.

---

### 4.4 Get Task Deadline Revision Audit History
- **Endpoint**: `GET /api/tasks/{id}/history/`
- **Permissions**: `IsAuthenticated`
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "task": 1,
      "previous_deadline": "2026-04-01T17:00:00Z",
      "updated_deadline": "2026-04-15T17:00:00Z",
      "reason": "Scope expansion for multi-factor authentication compliance.",
      "changed_by": 1,
      "changed_by_name": "admin",
      "created_at": "2026-03-20T14:30:00Z"
    }
  ]
  ```

---

### 4.5 Task Discussion Comments
- **Endpoint**: `GET /api/tasks/{id}/comments/` | `POST /api/tasks/{id}/comments/`
- **Permissions**: `IsAuthenticated`
- **Request Body (`POST`)**:
  ```json
  {
    "text": "Completed database index updates and verified performance."
  }
  ```
- **Response (`201 Created`)**: Created Comment JSON.
