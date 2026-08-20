# TeamSync REST API Integration Documentation (`apiguide`)

**Base URL**: `http://localhost:8000/api`  
**Authentication Standard**: JSON Web Token (JWT) Bearer Authentication  
**Content-Type**: `application/json` (or `multipart/form-data` for file uploads)

---

## Global Request Headers

| Header Name | Type | Description | Required | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Content-Type` | string | Payload format | Yes | `application/json` |
| `Authorization` | string | Bearer JWT access token | Yes (Authenticated endpoints) | `Bearer eyJhbGciOiJIUzI1Ni...` |

---

## Common HTTP Response Status Codes

- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Validation error or missing required payload fields.
- `401 Unauthorized`: Missing or invalid JWT Bearer token.
- `403 Forbidden`: Authenticated user does not possess required role (e.g. Team Member attempting Admin action).
- `404 Not Found`: Resource ID does not exist.

---

## 1. Authentication Endpoints (`/api/auth/`)

### 1.1 User Login
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "admin@teamsync.com",
  "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1Ni...",
  "access": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@teamsync.com",
    "first_name": "Rajkumar",
    "last_name": "Padmanabhan",
    "role": "ADMIN",
    "department": "Engineering Leadership",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "is_staff": true
  }
}
```
- **Error Response (401 Unauthorized)**:
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### 1.2 User Registration
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "alice",
  "email": "alice@teamsync.com",
  "password": "password123",
  "first_name": "Alice",
  "last_name": "Vance",
  "role": "MEMBER",
  "department": "Frontend Engineering"
}
```
- **Success Response (201 Created)**:
```json
{
  "id": 2,
  "username": "alice",
  "email": "alice@teamsync.com",
  "first_name": "Alice",
  "last_name": "Vance",
  "role": "MEMBER",
  "department": "Frontend Engineering"
}
```

---

## 2. Project Endpoints (`/api/projects/`)

### 2.1 List Projects
- **URL**: `/api/projects/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**: Array of Projects with `total_tasks`, `completed_tasks`, and `progress_percentage`.

### 2.2 Create Project
- **URL**: `/api/projects/`
- **Method**: `POST`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "Mobile Banking Portal 2.0",
  "description": "Revamp native mobile banking UI",
  "status": "ACTIVE",
  "start_date": "2026-08-05",
  "end_date": "2026-09-20",
  "member_ids": [2, 3]
}
```

---

## 3. Task Endpoints & Optional Enhancements (`/api/tasks/`)

### 3.1 List Tasks (Search & Filtering)
- **URL**: `/api/tasks/`
- **Method**: `GET`
- **Query Parameters**:
  - `project`: filter by Project ID (`?project=1`)
  - `assigned_to_me`: `true` to filter tasks assigned to logged-in user
  - `status`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

---

### 3.2 Update Task & Deadline Audit Log
- **URL**: `/api/tasks/{id}/`
- **Method**: `PATCH` / `PUT`
- **Access**: Team Member (status update), Admin (full update including priority, assignee, deadline)
- **Request Body**:
```json
{
  "deadline": "2026-09-05T18:00:00Z",
  "deadline_reason": "Extended sprint timeline due to client security review."
}
```
- **System Behavior**: Logs entry in `DeadlineHistory`, records event in `TaskActivity`, and dispatches email notification to task assignee.

---

### 3.3 Get Task Activity History Log (Optional Enhancement)
- **URL**: `/api/tasks/{id}/activity_history/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "task": 4,
    "user": 1,
    "user_detail": { "first_name": "Rajkumar", "role": "ADMIN" },
    "activity_type": "DEADLINE_CHANGED",
    "description": "Deadline updated from 2026-09-09 to 2026-10-15. Reason: 'Client deliverable'",
    "created_at": "2026-08-20T12:51:00Z"
  }
]
```

---

### 3.4 Task File Attachments (Optional Enhancement)
- **URL**: `/api/tasks/{id}/attachments/`
- **Method**: `GET` (List attachments) | `POST` (Upload file)
- **Access**: Authenticated
- **POST Request (Multipart Form Data)**:
  - `file`: `<binary file>`
- **Success Response (201 Created)**:
```json
{
  "id": 1,
  "task": 4,
  "uploaded_by": 1,
  "file": "/media/attachments/architecture_spec.pdf",
  "file_name": "architecture_spec.pdf",
  "file_size": 245120,
  "created_at": "2026-08-20T12:53:00Z"
}
```
