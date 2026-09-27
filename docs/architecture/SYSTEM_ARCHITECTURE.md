### 2. High-Level Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (Web & Mobile)                          │
│                                                                                  │
│  React 18+ (SPA) │ TypeScript │ Tailwind CSS │ TanStack Query │ React Hook Form  │
│  Leaflet GIS │ Recharts / ECharts Data Visuals │ High-Density Data Tables        │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ HTTPS / TLS 1.3 (JSON REST API)
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY & SECURITY PERIMETER                      │
│                                                                                  │
│  Rate Limiting │ Helmet (CSP, HSTS) │ CORS │ Request Sanitization │ Auth Guards  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER (Modular Monolith)                      │
│                                                                                  │
│  Routes  ──▶  Controllers  ──▶  Services  ──▶  Repositories  ──▶  Prisma ORM   │
│                                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐ │
│  │   Identity & Auth      │  │    Project Registry    │  │   Workflow Engine   │ │
│  └────────────────────────┘  └────────────────────────┘  └─────────────────────┘ │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐ │
│  │   Approvals & Gates    │  │   Milestone & Progress │  │   Field & Evidence  │ │
│  └────────────────────────┘  └────────────────────────┘  └─────────────────────┘ │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌─────────────────────┐ │
│  │  Contracts & Tenders   │  │   Financial Sanctions  │  │   Audit & Security  │ │
│  └────────────────────────┘  └────────────────────────┘  └─────────────────────┘ │
└────────────────────────────┬────────────────────────────┬────────────────────────┘
                             │                            │
                             ▼                            ▼
┌──────────────────────────────────────────────┐ ┌─────────────────────────────────┐
│              PERSISTENCE LAYER               │ │         STORAGE LAYER           │
│                                              │ │                                 │
│  PostgreSQL 16 (Relational Integrity)        │ │  S3-Compatible Object Store     │
│  - Foreign Keys & Composite Constraints      │ │  - Geotagged Site Photos/Videos │
│  - Check Constraints & Indexing              │ │  - Technical Drawings / DPRs    │
│  - PostGIS Extension (Spatial Geometries)    │ │  - Cryptographic SHA-256 Hashes │
└──────────────────────────────────────────────┘ └─────────────────────────────────┘
```

---