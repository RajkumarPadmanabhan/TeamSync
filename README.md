# 🚀 TeamSync - Team Project & Task Management Application

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/badge/Release-v5.0-emerald.svg)](https://github.com/RajkumarPadmanabhan/TeamSync/releases)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](https://github.com/RajkumarPadmanabhan/TeamSync)

**TeamSync** is a full-stack, enterprise-grade project and task management web application built with Django 5 (Python), Next.js 15 (TypeScript), Vanilla CSS, and Tailwind utilities.

---

## 📂 Deliverables Folder

All requested project evaluation deliverables are stored inside the [`Deliverables/`](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/README.md) directory:

1. 📄 **[Installation & Setup Instructions (`Deliverables/README.md`)](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/README.md)**
   - Local setup guide (Python, virtualenv, Node.js, seed script)
   - Docker Compose containerization instructions
   - Pre-configured Admin & Member account credentials

2. 🗄️ **[Database Schema & ER Diagram (`Deliverables/DATABASE_SCHEMA_ER_DIAGRAM.md`)](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/DATABASE_SCHEMA_ER_DIAGRAM.md)**
   - Complete Mermaid Relational Entity-Relationship (ER) Diagram
   - Detailed specifications for all 7 database tables, fields, types, foreign keys, and constraints

3. 🔌 **[API Documentation (`Deliverables/API_DOCUMENTATION.md`)](file:///c:/Users/Rajkumar/Downloads/TeamSync/Deliverables/API_DOCUMENTATION.md)**
   - Complete technical specification for all REST API endpoints (`/api/auth/`, `/api/projects/`, `/api/tasks/`, `/api/projects/invitations/`)
   - Headers, authentication schemas, payload JSON examples, and RBAC rules

---

## ⚡ Quick Start Command Summary

```bash
# 1. Clone Repository
git clone https://github.com/RajkumarPadmanabhan/TeamSync.git
cd TeamSync

# 2. Start Backend (Django REST API on http://localhost:8000/api/)
cd backend
python -m venv ..\venv
..\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver 8000

# 3. Start Frontend (Next.js App on http://localhost:3000)
cd ../frontend
npm install
npm run dev
```

---

## 👥 Pre-Configured Test Accounts

- **👑 ADMIN**: `admin` / `admin123`
- **👤 MEMBER**: `alice` / `alice123`
- **👤 MEMBER**: `bob` / `bob123`
- **👤 MEMBER**: `david` / `david123`
