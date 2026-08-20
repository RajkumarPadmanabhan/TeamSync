# TeamSync REST API Integration Guide & Endpoints Reference (`apiguide.md`)

**Base URL**: `http://localhost:8000/api`  
**Authentication Standard**: JSON Web Token (JWT) Bearer Authentication  
**Content-Type**: `application/json` (or `multipart/form-data` for file uploads)

---

## Global API Request & Response Conventions

### Request Headers
| Header Name | Type | Description | Mandatory | Example |
| :--- | :--- | :--- | :--- | :--- |
| `Content-Type` | string | Media format of request payload | Yes (JSON / Multipart) | `application/json` |
| `Authorization` | string | SimpleJWT Bearer Access Token | Yes (Authenticated endpoints) | `Bearer eyJhbGciOiJIUzI1Ni...` |

### HTTP Response Status Codes
- `200 OK`: Request processed successfully. Returns requested object or list.
- `201 Created`: Resource successfully created. Returns created object details.
- `204 No Content`: Resource deleted successfully. Empty response body.
- `400 Bad Request`: Validation failure, missing required body parameters, or invalid data types.
- `401 Unauthorized`: Missing, expired, or invalid JWT Bearer token.
- `403 Forbidden`: Authenticated user lacks required role permissions (e.g., Team Member attempting Admin action).
- `404 Not Found`: Targeted resource ID does not exist in database.

---

## 1. Authentication & User Management (`/api/auth/`)

### 1.1 User Login & JWT Token Retrieval
- **URL**: `http://localhost:8000/api/auth/login/`
- **Method**: `POST`
- **Access**: Public
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "username": "admin@teamsync.com",
    "password": "password123"
  }
  ```
- **Success Response (`200 OK`)**:
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
- **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "detail": "No active account found with the given credentials"
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "username": ["This field is required."],
    "password": ["This field is required."]
  }
  ```

---

### 1.2 User Registration & Role Assignment
- **URL**: `http://localhost:8000/api/auth/register/`
- **Method**: `POST`
- **Access**: Public
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Request Body**:
  ```json
  {
    "username": "sarahc",
    "email": "sarah@teamsync.com",
    "password": "password123",
    "first_name": "Sarah",
    "last_name": "Connor",
    "role": "ADMIN",
    "department": "Infrastructure"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 5,
    "username": "sarahc",
    "email": "sarah@teamsync.com",
    "first_name": "Sarah",
    "last_name": "Connor",
    "role": "ADMIN",
    "department": "Infrastructure",
    "avatar_url": "https://ui-avatars.com/api/?name=Sarah+Connor&background=6366f1&color=fff",
    "is_staff": true
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "username": ["A user with that username already exists."],
    "email": ["Enter a valid email address."]
  }
  ```

---

### 1.3 Get Current Authenticated User Profile
- **URL**: `http://localhost:8000/api/auth/me/`
- **Method**: `GET`
- **Access**: Authenticated (`Bearer <access_token>`)
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "username": "admin",
    "email": "admin@teamsync.com",
    "first_name": "Rajkumar",
    "last_name": "Padmanabhan",
    "role": "ADMIN",
    "department": "Engineering Leadership",
    "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
  }
  ```
- **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid"
  }
  ```

---

### 1.4 List All Registered Users / Team Directory
- **URL**: `http://localhost:8000/api/auth/users/`
- **Method**: `GET`
- **Access**: Authenticated
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Success Response (`200 OK`)**:
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

## 2. Project Management Endpoints (`/api/projects/`)

### 2.1 List All Projects & Metrics
- **URL**: `http://localhost:8000/api/projects/`
- **Method**: `GET`
- **Access**: Authenticated
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "name": "Enterprise Cloud Migration",
      "description": "Migrate core microservices to AWS Elastic Kubernetes Service",
      "status": "ACTIVE",
      "start_date": "2026-08-01",
      "end_date": "2026-10-31",
      "total_tasks": 3,
      "completed_tasks": 2,
      "progress_percentage": 67,
      "members": [1, 2, 3],
      "members_detail": [
        { "id": 1, "first_name": "Rajkumar", "role": "ADMIN" },
        { "id": 2, "first_name": "Alice", "role": "MEMBER" }
      ],
      "created_at": "2026-08-20T07:13:47Z"
    }
  ]
  ```

---

### 2.2 Create New Project
- **URL**: `http://localhost:8000/api/projects/`
- **Method**: `POST`
- **Access**: Admin Only (`ADMIN` role required)
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <admin_access_token>
  ```
- **Request Body**:
  ```json
  {
    "name": "Mobile Banking Portal 2.0",
    "description": "Revamp native banking UI with biometric authentication",
    "status": "ACTIVE",
    "start_date": "2026-08-05",
    "end_date": "2026-09-20",
    "member_ids": [2, 3]
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 2,
    "name": "Mobile Banking Portal 2.0",
    "description": "Revamp native banking UI with biometric authentication",
    "status": "ACTIVE",
    "progress_percentage": 0,
    "members": [1, 2, 3]
  }
  ```
- **Error Response (`403 Forbidden`)**:
  ```json
  {
    "detail": "You do not have permission to perform this action."
  }
  ```
- **Error Response (`400 Bad Request`)**:
  ```json
  {
    "name": ["This field is required."]
  }
  ```

---

### 2.3 Add Member to Project
- **URL**: `http://localhost:8000/api/projects/{id}/add_member/`
- **Method**: `POST`
- **Access**: Admin Only
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <admin_access_token>
  ```
- **Request Body**:
  ```json
  {
    "user_id": 4
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "detail": "Charlie Zhang added to project successfully.",
    "project": {
      "id": 1,
      "name": "Enterprise Cloud Migration",
      "members": [1, 2, 3, 4]
    }
  }
  ```
- **Error Response (`404 Not Found`)**:
  ```json
  {
    "detail": "User not found."
  }
  ```

---

## 3. Task Management & Audit Endpoints (`/api/tasks/`)

### 3.1 List & Filter Tasks
- **URL**: `http://localhost:8000/api/tasks/`
- **Method**: `GET`
- **Access**: Authenticated
- **Query Parameters**:
  - `project`: Filter by Project ID (`?project=1`)
  - `assigned_to_me`: Filter tasks assigned to logged-in user (`?assigned_to_me=true`)
  - `status`: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`
  - `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "title": "Implement JWT Auth & Role Security",
      "description": "Configure DRF SimpleJWT token authentication with permission classes",
      "project": 1,
      "project_name": "Enterprise Cloud Migration",
      "assigned_to": 2,
      "assigned_to_detail": {
        "id": 2,
        "first_name": "Alice",
        "last_name": "Vance",
        "avatar_url": "https://ui-avatars.com/api/?name=Alice+Vance"
      },
      "priority": "URGENT",
      "status": "COMPLETED",
      "deadline": "2026-08-25T18:00:00Z",
      "deadline_history_count": 1,
      "comments_count": 2,
      "created_at": "2026-08-20T07:13:47Z"
    }
  ]
  ```

---

### 3.2 Create Task & Assign Member
- **URL**: `http://localhost:8000/api/tasks/`
- **Method**: `POST`
- **Access**: Admin Only
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <admin_access_token>
  ```
- **Request Body**:
  ```json
  {
    "title": "Setup OAuth Security",
    "description": "Implement OAuth2 JWT security tokens with rate limiting",
    "project": 1,
    "assigned_to": 2,
    "priority": "URGENT",
    "status": "TODO",
    "deadline": "2026-09-15T18:00:00Z"
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 5,
    "title": "Setup OAuth Security",
    "project": 1,
    "assigned_to": 2,
    "priority": "URGENT",
    "status": "TODO",
    "deadline": "2026-09-15T18:00:00Z"
  }
  ```
- **Error Response (`403 Forbidden`)**:
  ```json
  {
    "detail": "Only admins can create tasks."
  }
  ```

---

### 3.3 Update Task & Deadline Audit Log (Additional Challenge)
- **URL**: `http://localhost:8000/api/tasks/{id}/`
- **Method**: `PATCH` / `PUT`
- **Access**: Team Member (status update); Admin (full update including deadline/priority)
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <access_token>
  ```
- **Request Body (Admin Modifying Deadline)**:
  ```json
  {
    "deadline": "2026-10-15T18:00:00Z",
    "deadline_reason": "Scope expansion for multi-factor authentication compliance."
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 5,
    "title": "Setup OAuth Security",
    "deadline": "2026-10-15T18:00:00Z",
    "deadline_history_count": 1
  }
  ```
- **System Action**: Automatically logs an audit entry in `DeadlineHistory` storing `previous_deadline`, `new_deadline`, `changed_by`, `changed_at`, and `reason`, and dispatches an email notification to the assignee.

---

### 3.4 Get Task Deadline History Audit Log
- **URL**: `http://localhost:8000/api/tasks/{id}/deadline_history/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "task": 5,
      "previous_deadline": "2026-09-15T18:00:00Z",
      "new_deadline": "2026-10-15T18:00:00Z",
      "changed_by": 1,
      "changed_by_detail": {
        "first_name": "Rajkumar",
        "role": "ADMIN",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
      },
      "reason": "Scope expansion for multi-factor authentication compliance.",
      "changed_at": "2026-08-20T12:51:00Z"
    }
  ]
  ```

---

### 3.5 Task Activity History Audit Feed (Optional Enhancement)
- **URL**: `http://localhost:8000/api/tasks/{id}/activity_history/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "task": 5,
      "user": 1,
      "user_detail": { "first_name": "Rajkumar", "role": "ADMIN" },
      "activity_type": "DEADLINE_CHANGED",
      "description": "Deadline updated from 2026-09-15 to 2026-10-15. Reason: 'Scope expansion'",
      "created_at": "2026-08-20T12:51:00Z"
    }
  ]
  ```

---

### 3.6 Task Comments / Technical Progress Updates
- **URL**: `http://localhost:8000/api/tasks/{id}/comments/`
- **Method**: `GET` (List) | `POST` (Add Comment)
- **Access**: Authenticated
- **POST Request Body**:
  ```json
  {
    "content": "Completed unit testing for OAuth security tokens and verified rate limits."
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 3,
    "task": 5,
    "author": 2,
    "author_detail": {
      "first_name": "Alice",
      "last_name": "Vance",
      "avatar_url": "https://ui-avatars.com/api/?name=Alice+Vance"
    },
    "content": "Completed unit testing for OAuth security tokens and verified rate limits.",
    "created_at": "2026-08-20T13:00:00Z"
  }
  ```

---

### 3.7 Task File Attachments (Optional Enhancement)
- **URL**: `http://localhost:8000/api/tasks/{id}/attachments/`
- **Method**: `GET` (List) | `POST` (Upload file)
- **Access**: Authenticated
- **POST Headers**: `Content-Type: multipart/form-data`
- **POST Request Form Data**:
  - `file`: `<binary file attachment>`
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "task": 5,
    "uploaded_by": 2,
    "uploaded_by_detail": { "first_name": "Alice", "role": "MEMBER" },
    "file": "/media/attachments/architecture_spec.pdf",
    "file_name": "architecture_spec.pdf",
    "file_size": 245120,
    "created_at": "2026-08-20T13:05:00Z"
  }
  ```

---

### 3.8 Executive Dashboard Stats Summary
- **URL**: `http://localhost:8000/api/tasks/dashboard_stats/`
- **Method**: `GET`
- **Access**: Authenticated
- **Success Response (`200 OK`)**:
  ```json
  {
    "total_projects": 3,
    "total_tasks": 5,
    "completed_tasks": 2,
    "overall_completion_rate": 40,
    "total_deadline_changes": 2,
    "todo_tasks": 1,
    "in_progress_tasks": 1,
    "in_review_tasks": 1
  }
  ```
