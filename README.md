# Attendance Management System

A full-stack MERN application for tracking employee attendance using live selfie verification and geolocation, with role-based dashboards for Employees, Managers, and Admins.

## Tech Stack

**Frontend:** React (Vite), Redux Toolkit + RTK Query, React Router
**Backend:** Node.js, Express.js
**Database:** MongoDB (Mongoose)
**Auth:** JWT (stored in localStorage, sent via Authorization header)
**Image Storage:** ImageKit
**Real-time:** Socket.IO
**Logging:** Winston + Morgan

## Live Links

* Frontend: https://attendance-management-system-xi-topaz.vercel.app
* Backend API: https://attendance-backend-8gqx.onrender.com
* Production API Base URL: https://attendance-backend-8gqx.onrender.com/api

## Architecture Overview

This is a monorepo with two independent apps:

attendance-management-system/
├── client/ → React frontend (Vite)
└── server/ → Express REST API + Socket.IO server


**Backend** follows an MVC-style structure — `models/` (Mongoose schemas), `controllers/` (business logic), `routes/` (endpoint definitions), `middlewares/` (auth, RBAC, error handling), `config/` (DB, ImageKit, Socket.IO setup), `utils/` (logger, JWT, hours calculation, shared filters).

**Frontend** follows a feature-based structure — `features/` holds RTK Query API slices per domain (auth, attendance, overtime, users, reports), `pages/` holds role-specific dashboards, `components/` holds reusable UI (camera capture, location capture, navbar, loader).

**Auth flow:** JWT is issued on login/signup, stored in `localStorage`, and attached to every request via an `Authorization: Bearer <token>` header (set automatically by RTK Query's `prepareHeaders`). Backend middleware (`protect` + `authorize`) verifies the token and checks role on every protected route.

**Real-time updates:** Socket.IO is used so that when an employee punches in/out or a manager reviews an overtime request, connected dashboards refetch their data automatically without a manual refresh.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier)
- ImageKit account (free tier)

### Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `server/` (use `.env.example` as reference):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
CLIENT_URL=http://localhost:5173
```

Run the server:

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the app:

```bash
npm run dev
```

App runs on `http://localhost:5173`.

## Features Implemented

### Authentication & Authorization
- Signup/Login with hashed passwords (bcrypt)
- JWT-based authentication
- Role-based access control (Employee, Manager, Admin)
- Protected routes on both frontend (route guards) and backend (middleware)

### Attendance
- Punch In / Punch Out with live camera selfie capture (no file upload)
- Geolocation capture (latitude/longitude) via browser Geolocation API
- Automatic working hours calculation
- Status: Completed (≥8 hrs) / Incomplete (<8 hrs)
- Duplicate punch prevention (one punch-in/out cycle per day)

### Overtime Workflow
- Employees can request overtime with hours and reason
- Managers/Admins can approve or reject requests
- Status reflected on both employee and manager views

### Dashboards
- **Employee:** Punch in/out, attendance history, overtime requests
- **Manager:** Team attendance, selfie validation, pending overtime approvals
- **Admin:** All users, user activation/deactivation, manager assignment, system-wide attendance

### Attendance Validation
- Managers/Admins can view punch-in selfies
- Mark attendance as Valid / Invalid with remarks

### Reports
- Daily attendance report with name, punch times, selfie, location, hours, status
- Role-scoped access (employees see their own, managers see their team, admins see all)

### Bonus
- Real-time dashboard updates via Socket.IO (attendance and overtime changes reflect live for connected users, in most flows)
- Pagination and date-range filtering on attendance/overtime/user lists

## Assumptions Made

- Signup allows selecting any role (Employee/Manager/Admin) for ease of testing. In a production system, only Employee signup would be public; Manager/Admin roles would be assigned internally.
- Manager-employee relationships are assigned manually by an Admin from the Admin dashboard (no self-service "join team" flow).
- One attendance record per employee per calendar day; overtime can only be requested for a day with an existing attendance record.
- Out of scope for this submission (due to the 48-hour timeframe): geofencing, push/email notifications for missed punches or overtime decisions, dark mode, and PDF/Excel export. These are listed as optional bonus items in the requirements.
- Real-time updates via Socket.IO cover attendance punch/validation and overtime request/review events; there is a known edge case where an employee's own overtime-status view may need a manual refresh to reflect a decision made while their tab was idle.

## Test Credentials

You can sign up fresh accounts for each role, or use these once created:

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | admin123 |