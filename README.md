# Government Construction Project Workflow & Monitoring Platform

A secure, scalable, and auditable government-grade construction and civil infrastructure lifecycle management platform.

---

## 🏛️ System Architecture Overview

The system is strictly **project-centric**. The central aggregate entity is `PROJECT`, governing the complete civil infrastructure lifecycle from **Proposal → Scrutiny → Administrative Sanction → Technical Sanction → Tendering → Contract Award → Mobilization → Construction → Inspections → Handover → Defect Liability → Closeout**.

---

## 📁 Repository Structure

```text
ConstructionMonitoring/
├── backend/                  # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   └── schema.prisma     # Complete 35+ entity relational schema
│   ├── src/
│   │   ├── config/           # Environment and runtime configurations
│   │   ├── middleware/       # Security, rate limiting, and request logging
│   │   ├── utils/            # Winston structured logger
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # HTTP server entry point
│   └── Dockerfile
├── frontend/                 # React 18+ + TypeScript + Tailwind CSS + Vite
│   ├── src/
│   │   ├── App.tsx           # High-density government UI shell
│   │   └── main.tsx
│   └── Dockerfile
├── shared/                   # Shared TypeScript models, enums, DTOs & Zod schemas
│   └── src/
│       ├── types/            # Domain enums & interfaces
│       └── validation/       # Zod request validators
├── docs/
│   ├── architecture/
│   │   ├── SYSTEM_ARCHITECTURE.md
│   │   ├── MODULE_ARCHITECTURE.md
│   │   ├── DATABASE_ERD.md
│   │   ├── STATE_TRANSITION_MODEL.md
│   │   └── AUTHORIZATION_MODEL.md
│   └── api/
│       └── openapi.yaml      # OpenAPI 3.0 REST API specification
├── docker-compose.yml        # PostgreSQL 16 (PostGIS), Redis 7, Backend, Frontend
└── package.json              # Monorepo workspace orchestrator
```

---

## 🚀 Quickstart & Development

### 1. Install Dependencies
```bash
npm.cmd install
```

### 2. Validate Database Schema
```bash
npx.cmd prisma validate --schema=backend/prisma/schema.prisma
```

### 3. Build All Workspaces
```bash
npm.cmd run build
```

### 4. Run Locally with Docker
```bash
docker compose up -d
```

---
## Deployment Link
https://gov-construction-monitoring.vercel.app/

## 🔐 Pre-seeded Test Credentials

All pre-seeded test accounts use the default password: **`GovPassword@2026`**

| Role | Employee ID | Email | Full Name | Office / Department | Access Level & Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Department Secretary** | `GJ-RNB-SEC-001` | `sec.rnb@gujarat.gov.in` | Shri A. K. Sharma, IAS | State Secretariat Head Office (`HO_GND`) | Administrative Approval (AS), Financial Sanctions (> ₹35 Cr), State Overview |
| **Chief Engineer** | `GJ-RNB-CE-101` | `ce.zone1@gujarat.gov.in` | Er. V. M. Solanki | State Secretariat Head Office (`HO_GND`) | Technical Sanction (TS), High-Value Variation Approvals, Major Risk Escalations |
| **Superintending Engineer** | `GJ-RNB-SE-201` | `se.ahm@gujarat.gov.in` | Er. D. N. Mehta | Ahmedabad R&B Circle Office (`CO_AHM`) | Circle Level Governance, Tender Approvals, Milestone Verification |
| **Executive Engineer** | `GJ-RNB-EE-301` | `ee.div1@gujarat.gov.in` | Er. R. K. Patel | Executive Division 1 (`DIV_AHM_01`) | Division In-Charge, Project Manager, Work Order Issuance, Bill Scrutiny |
| **Assistant Engineer** | `GJ-RNB-AE-401` | `ae.bavla@gujarat.gov.in` | Er. S. B. Joshi | Bavla Sub-Division Office (`SDIV_BAV`) | Site Inspection Lead, Quality Audits, Measurement Book (MB) Verification |
| **Junior Engineer** | `GJ-RNB-JE-501` | `je.bavla@gujarat.gov.in` | Er. M. P. Vaghela | Bavla Sub-Division Office (`SDIV_BAV`) | Field Officer, Daily Progress Reporting, Site Photo Uploads |
| **Finance Controller** | `GJ-FIN-FC-601` | `fc.rnb@gujarat.gov.in` | Shri P. R. Trivedi | State Secretariat Head Office (`HO_GND`) | Cyber Treasury Concurrence, Fund Allocation, Statutory Tax Deductions (TDS/GST) |
| **Authorized Contractor** | `GJ-CON-LNT-701` | `r.nambiar@lntinfra.com` | Mr. Rajesh Nambiar | L&T Construction Infra Div | Bid Submission, Milestone Claim Uploads, Billing Submissions |

> [!NOTE]
> Public citizen portal APIs (`/api/v1/public/projects`) and public executive dashboards do not require authentication.

