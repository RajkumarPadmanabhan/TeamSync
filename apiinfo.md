# TeamSync REST API Integration Documentation (`apiinfo`)

**Base URL**: `http://localhost:8000/api`  
**Authentication Standard**: JSON Web Token (JWT) Bearer Authentication  
**Content-Type**: `application/json`

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
  "department": "Frontend Engineering",
  "avatar_url": null
}
```
- **Error Response (400 Bad Request)**:
```json
{
  "username": ["A user with that username already exists."],
  "password": ["This password is too short. It must contain at least 6 characters."]
}
```

---

### 1.3 Get Current User Profile
- **URL**: `/api/auth/me/`
- **Method**: `GET`
- **Access**: Authenticated (Admin / Team Member)
- **Success Response (200 OK)**:
```json
{
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
```

---

### 1.4 List All Users / Team Members
- **URL**: `/api/auth/users/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@teamsync.com",
    "first_name": "Rajkumar",
    "last_name": "Padmanabhan",
    "role": "ADMIN",
    "department": "Engineering Leadership"
  },
  {
    "id": 2,
    "username": "alice",
    "email": "alice@teamsync.com",
    "first_name": "Alice",
    "last_name": "Vance",
    "role": "MEMBER",
    "department": "Frontend Engineering"
  }
]
```

---

## 2. Project Endpoints (`/api/projects/`)

### 2.1 List Projects
- **URL**: `/api/projects/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Enterprise Cloud Migration",
    "description": "Migrate on-premise infrastructure to AWS & Google Cloud high-availability cluster.",
    "status": "ACTIVE",
    "created_by": 1,
    "created_by_detail": {
      "id": 1,
      "username": "admin",
      "first_name": "Rajkumar",
      "last_name": "Padmanabhan"
    },
    "members": [1, 2, 3],
    "members_detail": [
      { "id": 2, "first_name": "Alice", "last_name": "Vance", "role": "MEMBER" },
      { "id": 3, "first_name": "Bob", "last_name": "Miller", "role": "MEMBER" }
    ],
    "start_date": "2026-08-01",
    "end_date": "2026-10-01",
    "total_tasks": 3,
    "completed_tasks": 2,
    "progress_percentage": 67
  }
]
```

---

### 2.2 Create Project
- **URL**: `/api/projects/`
- **Method**: `POST`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "name": "Mobile Banking Portal 2.0",
  "description": "Revamp native mobile banking UI with Next.js microfrontend.",
  "status": "ACTIVE",
  "start_date": "2026-08-05",
  "end_date": "2026-09-20",
  "member_ids": [2, 4]
}
```
- **Success Response (201 Created)**:
```json
{
  "id": 2,
  "name": "Mobile Banking Portal 2.0",
  "description": "Revamp native mobile banking UI with Next.js microfrontend.",
  "status": "ACTIVE",
  "total_tasks": 0,
  "completed_tasks": 0,
  "progress_percentage": 0
}
```
- **Error Response (403 Forbidden)**:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

---

### 2.3 Add Member to Project
- **URL**: `/api/projects/{id}/add_member/`
- **Method**: `POST`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "user_id": 4
}
```
- **Success Response (200 OK)**:
```json
{
  "detail": "Charlie Zhang added to project successfully.",
  "project": { ... }
}
```

---

## 3. Task Endpoints (`/api/tasks/`)

### 3.1 List Tasks
- **URL**: `/api/tasks/`
- **Method**: `GET`
- **Query Parameters**:
  - `project`: filter by Project ID (e.g. `?project=1`)
  - `assigned_to_me`: `true` to filter tasks assigned to current logged in user
  - `status`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
[
  {
    "id": 3,
    "title": "Task Deadline Change Audit Log System",
    "description": "Implement backend model & frontend timeline modal to maintain history of previous vs updated task deadlines.",
    "project": 1,
    "project_name": "Enterprise Cloud Migration",
    "assigned_to": 3,
    "assigned_to_detail": {
      "id": 3,
      "first_name": "Bob",
      "last_name": "Miller",
      "email": "bob@teamsync.com"
    },
    "priority": "URGENT",
    "status": "IN_PROGRESS",
    "deadline": "2026-09-01T17:00:00Z",
    "created_by": 1,
    "deadline_history_count": 1,
    "comments_count": 2
  }
]
```

---

### 3.2 Create Task
- **URL**: `/api/tasks/`
- **Method**: `POST`
- **Access**: Admin Only
- **Request Body**:
```json
{
  "title": "Build Micro-frontend Router",
  "description": "Configure Next.js App Router for high-density dashboard components.",
  "project": 1,
  "assigned_to": 2,
  "priority": "HIGH",
  "status": "TODO",
  "deadline": "2026-08-28T18:00:00Z"
}
```
- **Success Response (201 Created)**: Returns created Task object with HTTP 201.

---

### 3.3 Update Task & Deadline Change History
- **URL**: `/api/tasks/{id}/`
- **Method**: `PATCH` / `PUT`
- **Access**:
  - **Team Member**: Can update `status` ("TODO" -> "IN_PROGRESS" -> "COMPLETED").
  - **Admin**: Can update `status`, `priority`, `assigned_to`, `title`, and `deadline`.
- **Request Body (Updating Deadline as Admin)**:
```json
{
  "deadline": "2026-09-05T18:00:00Z",
  "deadline_reason": "Extended sprint timeline due to client security review."
}
```
- **System Behavior**: Whenever `deadline` is updated, the Django REST Framework backend automatically generates a new record in `DeadlineHistory` with `previous_deadline`, `new_deadline`, `changed_by`, `changed_at`, and `reason`.
- **Success Response (200 OK)**: Returns updated task object.

---

### 3.4 Get Task Deadline History (Audit Log)
- **URL**: `/api/tasks/{id}/deadline_history/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "task": 3,
    "previous_deadline": "2026-08-20T17:00:00Z",
    "new_deadline": "2026-09-01T17:00:00Z",
    "changed_by": 1,
    "changed_by_detail": {
      "id": 1,
      "username": "admin",
      "first_name": "Rajkumar",
      "last_name": "Padmanabhan"
    },
    "changed_at": "2026-08-20T12:00:00Z",
    "reason": "Extended sprint timeline due to additional security audit scope."
  }
]
```

---

### 3.5 Task Comments / Progress Updates
- **URL**: `/api/tasks/{id}/comments/`
- **Method**: `GET` (List comments) | `POST` (Add comment/progress update)
- **Access**: Authenticated (Admin / Team Member)
- **POST Request Body**:
```json
{
  "content": "Completed unit testing for task deadline serialization."
}
```
- **Success Response (201 Created)**:
```json
{
  "id": 1,
  "task": 3,
  "author": 3,
  "author_detail": {
    "id": 3,
    "first_name": "Bob",
    "last_name": "Miller"
  },
  "content": "Completed unit testing for task deadline serialization.",
  "created_at": "2026-08-20T12:15:00Z"
}
```

---

### 3.6 Dashboard Summary Statistics
- **URL**: `/api/tasks/dashboard_stats/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (200 OK)**:
```json
{
  "total_projects": 3,
  "total_tasks": 4,
  "completed_tasks": 2,
  "in_progress_tasks": 1,
  "todo_tasks": 1,
  "in_review_tasks": 0,
  "completion_rate": 50,
  "total_deadline_changes": 1,
  "my_tasks_count": 2,
  "my_completed_tasks": 1
}
```
