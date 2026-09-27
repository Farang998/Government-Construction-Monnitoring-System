# Authorization Architecture: RBAC + ABAC Model

## Government Construction Project Workflow & Monitoring Platform

---

### 1. Dual-Layer Authorization Philosophy

Government civil infrastructure systems demand two orthogonal authorization dimensions:
1. **Role-Based Access Control (RBAC):** Determines what general types of actions an actor is certified to perform based on their official capacity (e.g., sanctioning, inspecting, editing budgets).
2. **Attribute-Based Access Control (ABAC):** Evaluates runtime contextual variables—such as whether the project falls within the officer's administrative jurisdiction, whether the project cost is within their statutory financial ceiling, and whether the workflow task is currently assigned to them.

```text
Request ──▶ Authentication Check (Valid JWT/Session)
                  │
                  ▼
            RBAC Check (Does user's Role grant the Permission?)
                  │
                  ▼ [PASS]
            ABAC Check (Contextual Policy Evaluation):
            ├── 1. Departmental Match / Oversight Jurisdiction?
            ├── 2. Geographic Boundary Match (Circle / Division / District)?
            ├── 3. Statutory Financial Sanction Limit >= Project Cost?
            ├── 4. Workflow Task Assigned to User or Acting Officer?
            └── 5. Maker-Checker Segregation Verified?
                  │
                  ▼ [PASS]
            Execute Controller & Service
```

---

### 2. Standard Government Roles & Hierarchy

| Role Key | Title / Rank | Canonical Level | Primary Jurisdiction |
| :--- | :--- | :--- | :--- |
| `SUPER_ADMIN` | System Administrator | 10 | State-wide / Cross-departmental |
| `DEPT_SECRETARY` | Principal Secretary / Secretary | 9 | Entire Administrative Department |
| `CHIEF_ENGINEER` | Chief Engineer (CE) | 8 | Department Zone / State Region |
| `SUPERINTENDING_ENGINEER`| Superintending Engineer (SE) | 7 | Engineering Circle (2-4 Divisions) |
| `EXECUTIVE_ENGINEER` | Executive Engineer (EE / Division Officer) | 6 | Engineering Division (District level) |
| `ASSISTANT_ENGINEER` | Assistant Engineer (AE / Sub-Divisional Officer)| 5 | Engineering Sub-Division (Taluka level)|
| `JUNIOR_ENGINEER` | Junior Engineer (JE / Section Officer / Field) | 4 | Section / Construction Site |
| `FINANCE_CONTROLLER` | Financial Adviser / Chief Accounts Officer | 7 | Department Finance Wing |
| `QUALITY_AUDITOR` | Quality Control / Vigilance Inspector | 6 | State / Regional Quality Wing |
| `CONTRACTOR` | Empanelled EPC / Civil Contractor | 2 | Assigned Contract Work Packages |
| `PUBLIC_AUDITOR` | CAG / State Accountant General Auditor | 5 | Read-Only Oversight |

---

### 3. Granular RBAC Permissions

* **Project Management:**
  * `project:create`, `project:view`, `project:edit`, `project:delete`, `project:archive`, `project:export`
* **Workflow & Approvals:**
  * `workflow:view_task`, `workflow:action:recommend`, `workflow:action:approve`, `workflow:action:reject`, `workflow:action:rework`, `workflow:action:delegate`
* **Technical & Administrative Sanction:**
  * `sanction:administrative:create`, `sanction:technical:create`, `sanction:statutory:record`
* **Contracts & Procurement:**
  * `tender:publish`, `tender:evaluate`, `contract:award`, `contract:edit_variation`
* **Field Monitoring & Quality Control:**
  * `milestone:update`, `inspection:schedule`, `inspection:submit`, `evidence:upload`, `defect:log`
* **Financial Management:**
  * `budget:allocate`, `expenditure:record`, `bill:verify`, `bill:approve`
* **Audit & Administration:**
  * `audit:read`, `admin:config:manage`, `user:manage`, `role:manage`, `department:manage`

---

### 4. Attribute-Based Access Control (ABAC) Policy Matrix

The ABAC policy evaluator inspects the request context against the target entity:

#### Rule 1: Geographic & Departmental Boundary
* An Executive Engineer (EE) in **Ahmedabad R&B Division** can only view and edit projects where `project.executing_office_id` belongs to their division or sub-divisions.
* A Chief Engineer has oversight across all Circles and Divisions in their appointed Zone.
* Cross-departmental viewing is restricted to State Administrators, Planning Department Secretaries, and Finance Controllers.

#### Rule 2: Statutory Financial Power Delegation Limits
Statutory financial powers in Public Works Departments are graded by rank:
* **Junior Engineer (JE):** Site measurement entries only; ₹0 sanctioning power.
* **Assistant Engineer (AE):** Up to **₹25 Lakhs** (Sub-division maintenance / minor estimates).
* **Executive Engineer (EE):** Up to **₹2 Crores** (Technical estimates and work orders).
* **Superintending Engineer (SE):** Up to **₹15 Crores** (Circle-level Technical Sanction).
* **Chief Engineer (CE):** Up to **₹50 Crores** (Zonal / State level Technical Sanction).
* **Principal Secretary / Cabinet:** **> ₹50 Crores** (Requires State Cabinet / Finance Department concurrence).

*Enforcement:* If an EE attempts to execute `workflow:action:approve` on a Technical Sanction task where `project.estimated_cost_inr > 20000000`, the ABAC policy evaluator aborts with an `ABAC_AUTHORITY_EXCEEDED` HTTP 403 error.

#### Rule 3: Separation of Duties (Maker-Checker Invariant)
* `actor.id != project.created_by` for Administrative Sanction tasks.
* `actor.id != dpr_preparer_id` for Technical Sanction approvals.
* `actor.id != bill_preparing_engineer_id` for Financial Disbursement approvals.

#### Rule 4: Active Stage Lock
* No user (regardless of rank) can modify physical progress or upload measurement book records unless the project is in `IN_CONSTRUCTION` or `TESTING_COMMISSIONING`.
* No documents in `APPROVED` status can be edited or deleted by anyone, including `SUPER_ADMIN`. They can only be superseded by a new version (`version_number + 1`).

---

### 5. Backend ABAC Evaluator Interface

```typescript
export interface AbacEvaluationContext {
  user: {
    id: string;
    role: string;
    departmentId: string;
    officeId: string;
    officeLevel: number;
    financialCeilingInr: number;
    jurisdictionDistricts: string[];
  };
  resource: {
    type: 'project' | 'task' | 'document' | 'contract' | 'financial';
    id: string;
    departmentId?: string;
    officeId?: string;
    district?: string;
    estimatedCostInr?: number;
    currentStage?: string;
    assignedUserId?: string;
    createdBy?: string;
    isApproved?: boolean;
  };
  action: string;
}

export interface AbacPolicyResult {
  allowed: boolean;
  denialReason?: string;
}
```
