# 🚀 TeamSync - Team Project & Task Management Application

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v5.0-emerald.svg)](https://github.com/RajkumarPadmanabhan/TeamSync/releases)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/RajkumarPadmanabhan/TeamSync)

**TeamSync** is a full-stack, enterprise-grade project and task management web application designed for high-performance engineering teams. Built with Django 5 (Python), Next.js 15 (TypeScript), Vanilla CSS, and Tailwind utilities, TeamSync features multi-role security (Admin vs Team Member), project join invitation workflows, real-time project progress calculation, 1-click task completion toggling, custom toast alert notifications, and historical deadline revision audit logging.

---

## 📂 Deliverables Directory Overview

This repository includes a dedicated `Deliverables/` folder containing all required project submission artifacts in both Markdown and PDF formats with copyright **Rajkumar PR**:

| Document | PDF Version | Markdown Source | Description |
| :--- | :--- | :--- | :--- |
| **1. README & Setup Guide** | [`Deliverables/README_Installation_Guide.pdf`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/README_Installation_Guide.pdf) | [`README.md`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/README.md) | Complete installation, Docker containerization, local execution, and role account guide |
| **2. Database Schema & ER Diagram** | [`Deliverables/Database_Schema_ER_Diagram.pdf`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/Database_Schema_ER_Diagram.pdf) | [`DATABASE_SCHEMA_ER_DIAGRAM.md`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/DATABASE_SCHEMA_ER_DIAGRAM.md) | Relational ER diagram, table schemas, foreign keys, fields, and constraints |
| **3. API Documentation** | [`Deliverables/API_Documentation.pdf`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/API_Documentation.pdf) | [`API_DOCUMENTATION.md`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/API_DOCUMENTATION.md) | Complete REST API specification with endpoints, request/response JSON schemas, and RBAC rules |

---

> **Copyright Notice**:  
> **Copyright © 2026 Rajkumar PR. All Rights Reserved.**

---

## 🛠️ Tech Stack & Key Technologies

### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript, React 19)
- **Styling**: Vanilla CSS tokens & Tailwind CSS utilities
- **State Management & Auth**: React Context API (`AuthContext.tsx`) & LocalStorage JWT Persistence
- **UI Components & Icons**: Lucide React Icons & Custom Animated Toast Notifications (`ToastNotification.tsx`)

### Backend
- **Framework**: Django 5.0 & Django REST Framework (DRF 3.14)
- **Authentication**: SimpleJWT (JSON Web Tokens - Access & Refresh Tokens)
- **Database**: SQLite3 (Development) / PostgreSQL (Production ready via Django ORM)
- **Email Notifications**: Django Console Email Dispatcher (`django.core.mail.send_mail`)

---

## 📦 Local Installation & Setup Instructions

### Prerequisites
- **Python**: v3.10 or higher
- **Node.js**: v18.0 or higher (`npm`)
- **Git**: Installed

---

### Step 1: Clone Repository
```bash
git clone https://github.com/RajkumarPadmanabhan/TeamSync.git
cd TeamSync
```

---

### Step 2: Backend Setup (Django REST API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv ..\venv
   ..\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv ../venv
   source ../venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed sample test data (Admin & Member accounts, projects, tasks):
   ```bash
   python manage.py seed_data
   ```

6. Start Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   *Backend REST API running at `http://localhost:8000/api/`*

---

### Step 3: Frontend Setup (Next.js Application)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd TeamSync/frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start Next.js development server:
   ```bash
   npm run dev
   ```
   *Frontend Dashboard running at `http://localhost:3000/`*

---

## 🐳 Docker Deployment Setup (Optional)

Run the entire full-stack application (Django + Next.js) using Docker Compose:

```bash
cd TeamSync/backend
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/api/`

---

## 🔑 Pre-Configured Test User Accounts

The database seed script (`python manage.py seed_data`) creates the following accounts:

| Role | Username | Password | Email Address | Department |
| :--- | :--- | :--- | :--- | :--- |
| **👑 ADMIN** | `admin` | `admin123` | `admin@teamsync.com` | Engineering |
| **👤 MEMBER** | `alice` | `alice123` | `alice@teamsync.com` | Frontend Dev |
| **👤 MEMBER** | `bob` | `bob123` | `bob@teamsync.com` | Backend Dev |
| **👤 MEMBER** | `david` | `david123` | `david@teamsync.com` | Security |

---

## ✨ Features Checklist

- [x] **JWT Authentication**: Login, Signup, Auto-login session restoration, Logout.
- [x] **Role-Based Access Control (RBAC)**: Admin 👑 vs Team Member 👤 permissions.
- [x] **Project Management**: Create, Edit, Delete projects with real-time completion progress tracking.
- [x] **Project Join Requests**: Admin invitation requests ➔ Member approval banner & dedicated **Project Requests 📩** tab.
- [x] **Task Management**: Create, Edit, Delete tasks, Assign priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and Deadlines.
- [x] **1-Click Completion Checkbox**: Toggle `COMPLETED` vs `IN_PROGRESS` directly from task cards.
- [x] **Deadline Revision History**: Historical audit tracking of previous vs new deadline, editor profile, timestamp, and justification reason.
- [x] **Custom Email Notifications**: Console emails sent on invitation requests and task assignments.
- [x] **Custom Toast Notifications**: Animated toast banners (`success`, `warning`, `error`, `info`) replacing browser popups.
- [x] **Profile Info Management**: Edit email, name, role, and department via `UserProfileModal`.
