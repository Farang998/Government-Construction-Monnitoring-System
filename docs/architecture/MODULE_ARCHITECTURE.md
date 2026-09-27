# Module Architecture & Domain Boundaries

## Government Construction Project Workflow & Monitoring Platform

---

### 1. Modular Monolith Design Principles

The platform is structured as a **Modular Monolith**. Each domain module owns its entities, DTOs, service rules, and repository queries. Cross-module communication occurs strictly through strongly typed service contracts and domain events—never through direct cross-boundary database mutations.

```text
                                  ┌─────────────────────────────┐
                                  │      PROJECT REGISTRY       │
                                  │       (Core Aggregate)      │
                                  └──────────────┬──────────────┘
                                                 │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Workflow & Gate │ │ Milestones &    │ │ Contracts &     │ │ Documents &     │ │ Field Evidence  │
│ Approvals       │ │ Progress        │ │ Financials      │ │ Versioning      │ │ & Inspections   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │                   │                   │
         └───────────────────┼───────────────────┼───────────────────┼───────────────────┘
                             ▼                   ▼                   ▼
                    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                    │ Audit Trail     │ │ Notifications   │ │ GIS & Spatial   │
                    │ (Append-Only)   │ │ Engine          │ │ Service         │
                    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

### 2. Module Catalogue & Specifications

#### 1. Identity & Organization Module (`backend/src/modules/identity/`)
* **Responsibilities:**
  * Multi-tiered government organizational hierarchy (`State → Department → Circle → Division → Sub-Division → Office`).
  * Officer user accounts, designations, jurisdictions, contact details, and account lifecycles.
  * Role and permission catalog (RBAC).
  * Contextual attribute resolution for authorization (ABAC).
* **Dependencies:** None (Foundation module).

#### 2. Project Registry Module (`backend/src/modules/project/`)
* **Responsibilities:**
  * Master project record, unique immutable project code generation (e.g., `GJ-RNB-AHM-2026-000145`).
  * Scope definition, objectives, problem statements, expected beneficiaries.
  * Geolocation (district, taluka, city, GPS coordinates, spatial bounds).
  * Multi-department ownership mapping (administrative department vs. implementing agency).
  * Project search, filtering, faceted querying, and lifecycle status summaries.
* **Dependencies:** Identity & Organization, Workflow Engine.

#### 3. Workflow Engine Module (`backend/src/modules/workflow/`)
* **Responsibilities:**
  * Workflow template definitions by project type.
  * Directed Acyclic Graph (DAG) stage execution (sequential, parallel branches, conditional gates).
  * State transition validation and invariant enforcement.
  * SLA tracking, warning timers, and automated escalation dispatching.
* **Dependencies:** Identity & Organization, Project Registry.

#### 4. Approvals Module (`backend/src/modules/approval/`)
* **Responsibilities:**
  * Task assignment to officer queues.
  * Maker-checker segregation enforcement.
  * Approval actions: Recommend, Approve, Reject (with mandatory remarks), Return for Rework (non-destructive history).
  * Approval aggregation gates (e.g., Fire clearance AND Forest clearance required before Technical Sanction).
  * Temporary delegation of signing authority during leave/deputation.
* **Dependencies:** Workflow Engine, Identity & Organization, Audit Trail.

#### 5. Documents Module (`backend/src/modules/document/`)
* **Responsibilities:**
  * Document upload, categorization (DPR, Administrative Sanction Order, Technical Drawing, Tender Notice, Measurement Book, Completion Certificate).
  * Cryptographic SHA-256 hash generation and verification.
  * Revision and version control (Version 1, 2, ... N; pinned Approved Version).
  * Secure download streams with ABAC access verification.
* **Dependencies:** Identity & Organization, Project Registry, Audit Trail.

#### 6. Milestones Module (`backend/src/modules/milestone/`)
* **Responsibilities:**
  * Work Breakdown Structure (WBS) milestone definitions.
  * Baseline dates vs. revised dates vs. actual completion dates.
  * Inter-milestone dependencies (Finish-to-Start, Start-to-Start).
  * Weightage calculation contributing to overall physical completion percentage.
* **Dependencies:** Project Registry.

#### 7. Progress Tracking Module (`backend/src/modules/progress/`)
* **Responsibilities:**
  * Physical progress vs. Financial progress vs. Planned schedule curve.
  * Schedule Variance (SV) and Cost Variance (CV) calculations.
  * Historical progress snapshots for trend analysis and S-curve generation.
* **Dependencies:** Project Registry, Milestones, Financials.

#### 8. Delays Module (`backend/src/modules/delay/`)
* **Responsibilities:**
  * Categorization of delays (Land Acquisition, Environmental Clearance, Design Revision, Contractor Inaction, Utility Shifting, Adverse Weather, Legal Stay).
  * Days lost calculation, financial implication estimation, and root-cause analysis.
  * Corrective action plans and resolution verification.
* **Dependencies:** Project Registry, Milestones.

#### 9. Risks Module (`backend/src/modules/risk/`)
* **Responsibilities:**
  * Risk register management (Probability [1-5] × Impact [1-5] = Severity score).
  * Mitigation strategy formulation and risk owner assignment.
  * Escalation thresholds for critical risks impacting state-level infrastructure.
* **Dependencies:** Project Registry.

#### 10. Issues Module (`backend/src/modules/issue/`)
* **Responsibilities:**
  * Site issues and operational impediments logged by field officers.
  * Issue priority, severity, assignment, resolution tracking, and sign-off.
* **Dependencies:** Project Registry, Identity & Organization.

#### 11. Contracts Module (`backend/src/modules/contract/`)
* **Responsibilities:**
  * Contractor company profiles, registration grades, performance history.
  * Tender management (Notice Inviting Tender, bid opening, comparative statements, evaluation).
  * Contract awards, work order generation, original contract value, validity periods, time extensions.
* **Dependencies:** Project Registry, Identity & Organization.

#### 12. Financials Module (`backend/src/modules/financial/`)
* **Responsibilities:**
  * Multi-stage financial tracking: Estimated Cost → Administrative Sanction → Technical Estimate → Tender Value → Contract Value → Revised Sanction → Actual Expenditure.
  * Budget heads, treasury allocations, and fund releases.
  * Financial variations, excess/saving statements, and price escalation claims.
  * Immutable revision trail for all financial figures.
* **Dependencies:** Project Registry, Contracts.

#### 13. Inspections & Field Evidence Module (`backend/src/modules/inspection/`)
* **Responsibilities:**
  * Scheduled and surprise site inspections by quality assurance teams and senior officers.
  * Measurement Book (MB) recordings and site observation logs.
  * Geotagged photographic and video evidence collection (GPS, timestamp, device metadata).
  * Quality check scorecards and defect rectifications.
  * Offline sync schema readiness.
* **Dependencies:** Project Registry, Milestones, Identity & Organization, Documents.

#### 14. GIS Module (`backend/src/modules/gis/`)
* **Responsibilities:**
  * Spatial indexing of project locations (points, line strings for road/canals, polygons for campuses/reservoirs).
  * Layered map rendering (Department filters, District/Taluka boundaries, Status heatmaps).
  * Proximity spatial queries (e.g., projects within 10 km of flood-prone zones).
* **Dependencies:** Project Registry.

#### 15. Notifications Module (`backend/src/modules/notification/`)
* **Responsibilities:**
  * Role-based task alerts, pending action reminders, SLA breach escalations.
  * Multi-channel dispatch abstractions: In-app notification center, Email, SMS gateway.
* **Dependencies:** Identity & Organization, Workflow Engine.

#### 16. Reports & Analytics Module (`backend/src/modules/report/`)
* **Responsibilities:**
  * State, Department, District, and Project level aggregate summaries.
  * Standardized government compliance exports (Chief Minister / Chief Secretary review dossiers, Monthly Progress Reports, Delayed Projects Whitepaper).
* **Dependencies:** All Domain Modules (Read-only aggregation layer).

#### 17. Audit Trail Module (`backend/src/modules/audit/`)
* **Responsibilities:**
  * Immutable, tamper-evident record keeping of every state change, document download, approval action, and financial adjustment.
  * Structural forensic query interface with cryptographic checksum verification.
* **Dependencies:** Global cross-cutting infrastructure.

#### 18. Administration Module (`backend/src/modules/admin/`)
* **Responsibilities:**
  * Master data management (Project types, delay categories, risk types, workflow templates, SLA configurations, office master, designation master).
* **Dependencies:** Identity & Organization, Workflow Engine.

#### 19. Integrations Module (`backend/src/modules/integration/`)
* **Responsibilities:**
  * Adapters for external government systems: e-Procurement (e-Tenders), Treasury (IFMS), GIS (Bhuvan/State RSAC), Single Sign-On (e-Pramaan / Jan Parichay).
  * Tracking external synchronization state, payloads, and sync logs.
* **Dependencies:** Project Registry, Contracts, Financials.
