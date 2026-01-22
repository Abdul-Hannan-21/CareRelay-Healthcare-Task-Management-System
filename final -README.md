# CareRelay – Healthcare Task Management System

**Live Application:** https://kindly-oriole-892.convex.app/

CareRelay is a web-based hospital task management system designed to improve communication, coordination, and operational efficiency between patients, nurses, porters, and supervisors. The platform enables real-time task creation, assignment, tracking, and completion with role-based access control.

---

## Overview

CareRelay replaces fragmented, paper-based, or verbal workflows with a unified digital platform where:

- Patients can request assistance directly from their beds.
- Nurses can create and manage clinical and non-clinical tasks.
- Porters can accept and complete transport, equipment, and service tasks.
- Supervisors have system-wide visibility and performance analytics.

The system is designed to reflect real hospital workflows and prioritisation structures.

---

## Core Features

### Role-Based Dashboards
Each user role has a dedicated interface:
- Patient Dashboard  
- Nurse Dashboard  
- Porter Dashboard  
- Supervisor Dashboard  

### Real-Time Task Management
- Live updates using reactive queries  
- Full task lifecycle: create → assign → accept → in progress → completed  
- Automatic status synchronisation across all users  

### Priority System
Four levels of urgency:
- Low  
- Medium  
- High  
- Urgent  

Visual indicators ensure critical tasks are immediately identifiable.

### Task Categories
Supports six core hospital service types:
- Nursing  
- Transport  
- Meals  
- Cleaning  
- Interpreter  
- Equipment  

### Supervisor Analytics
Supervisors can:
- View task distributions  
- Monitor staff workload  
- Track completion rates  
- Assign tasks manually  

### Session & Identity Management
- Role selection on first login  
- Last-active timestamps   



---

## Technology Stack

### Frontend
- React 19  
- TypeScript  
- Vite  
- Tailwind CSS  

### Backend
- Convex (serverless backend & database)  
- Convex Auth (authentication & sessions)  
- Built-in file storage (for logos)  

### Development Tools
- npm-run-all  
- ESLint (TypeScript)  
- PostCSS & Autoprefixer  

---

## Why Convex?

Convex was selected as the backend because it provides:
- Real-time data updates without WebSockets  
- End-to-end type safety from schema to UI  
- Built-in authentication and file storage  
- Automatic scaling with no infrastructure management  
---

## Project Structure

```text
care-relay/
├── convex/
│   ├── auth.ts
│   ├── schema.ts
│   ├── tasks.ts
│   ├── users.ts
│   └── logos.ts
├── src/
│   ├── components/
│   │   ├── PatientDashboard.tsx
│   │   ├── NurseDashboard.tsx
│   │   ├── PorterDashboard.tsx
│   │   ├── SupervisorDashboard.tsx
│   │   ├── RoleSetup.tsx
│   │   └── LogoUpload.tsx
│   ├── App.tsx
│   ├── SignInForm.tsx
│   └── main.tsx
├── public/
│   └── favicon.svg
├── index.html
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Local Development and Github codespace

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd care-relay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```



3. **Run the application**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - http://localhost:5173

---

## Contributors

- Abdul Hannan
- Anusuya Kugavarathan
- Muhammad Ahmed Shabab
- Tanvi Tandale


