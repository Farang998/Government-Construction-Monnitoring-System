import { LoginRequest, CreateProjectProposalInput } from '@gov-platform/shared';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gov_auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || 'An error occurred during request execution.');
  }

  return data;
}

export const api = {
  // Auth APIs
  login: (credentials: LoginRequest) =>
    request<{ success: boolean; data: { token: string; user: any } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request<{ success: boolean; data: any }>('/auth/me'),

  // Identity APIs
  getOrganizations: () => request<{ success: boolean; data: any[] }>('/identity/organizations'),

  getDepartments: (orgId?: string) =>
    request<{ success: boolean; data: any[] }>(`/identity/departments${orgId ? `?organizationId=${orgId}` : ''}`),

  getOffices: (deptId?: string) =>
    request<{ success: boolean; data: any[] }>(`/identity/offices${deptId ? `?departmentId=${deptId}` : ''}`),

  getDesignations: () => request<{ success: boolean; data: any[] }>('/identity/designations'),

  getUsers: (params?: { departmentId?: string; officeId?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.officeId) query.append('officeId', params.officeId);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    return request<{ success: boolean; total: number; page: number; totalPages: number; items: any[] }>(
      `/identity/users?${query.toString()}`,
    );
  },

  // Project Registry & Proposal APIs
  getProjectTypes: () => request<{ success: boolean; data: any[] }>('/projects/types'),

  getProjects: (params?: {
    search?: string;
    departmentId?: string;
    projectTypeId?: string;
    status?: string;
    district?: string;
    page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.projectTypeId) query.append('projectTypeId', params.projectTypeId);
    if (params?.status) query.append('status', params.status);
    if (params?.district) query.append('district', params.district);
    if (params?.page) query.append('page', params.page.toString());
    return request<{ success: boolean; total: number; page: number; totalPages: number; items: any[] }>(
      `/projects?${query.toString()}`,
    );
  },

  getProjectById: (id: string) => request<{ success: boolean; data: any }>(`/projects/${id}`),

  createProjectProposal: (input: CreateProjectProposalInput) =>
    request<{ success: boolean; message: string; data: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // Workflow & Approval APIs
  getOfficerInbox: () => request<{ success: boolean; data: any[] }>('/approvals/inbox'),

  executeApprovalAction: (taskId: string, body: { action: string; remarks: string; conditions?: string; delegatedToId?: string; targetReworkStageKey?: string }) =>
    request<{ success: boolean; message: string }> (`/approvals/tasks/${taskId}/action`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getProjectWorkflow: (projectId: string) => request<{ success: boolean; data: any }>(`/workflows/projects/${projectId}`),

  getWorkflowTemplates: () => request<{ success: boolean; data: any[] }>('/workflows/templates'),

  // Tender & Contract APIs
  getTenders: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/tenders${projectId ? `?projectId=${projectId}` : ''}`),

  createTender: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/tenders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  submitBid: (input: any) =>
    request<{ success: boolean; message: string }>('/tenders/bids', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getContracts: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/contracts${projectId ? `?projectId=${projectId}` : ''}`),

  getContractors: () => request<{ success: boolean; data: any[] }>('/contracts/contractors'),

  awardContract: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/contracts/award', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // Construction Monitoring & Inspection APIs
  getMilestones: (projectId: string) => request<{ success: boolean; data: any[] }>(`/monitoring/projects/${projectId}/milestones`),

  getProgressUpdates: (projectId: string) => request<{ success: boolean; data: any[] }>(`/monitoring/projects/${projectId}/progress`),

  logProgressUpdate: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/monitoring/progress', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getInspections: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/inspections${projectId ? `?projectId=${projectId}` : ''}`),

  createInspection: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/inspections', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  rectifyDefects: (inspectionId: string, notes: string) =>
    request<{ success: boolean; message: string }>(`/inspections/${inspectionId}/rectify`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // GIS & Geospatial APIs
  getGisMarkers: (filters?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
      });
    }
    const queryString = params.toString();
    return request<{ success: boolean; data: any[] }>(`/gis/projects${queryString ? `?${queryString}` : ''}`);
  },

  getGisLayers: () => request<{ success: boolean; data: any[] }>('/gis/layers'),

  updateProjectCoordinates: (projectId: string, latitude: number, longitude: number) =>
    request<{ success: boolean; message: string; data: any }>(`/gis/projects/${projectId}/coordinates`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    }),

  // Delays, Risks & Issues Governance APIs
  getDelays: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/governance/delays${projectId ? `?projectId=${projectId}` : ''}`),

  logDelay: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/governance/delays', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getRisks: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/governance/risks${projectId ? `?projectId=${projectId}` : ''}`),

  logRisk: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/governance/risks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getIssues: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/governance/issues${projectId ? `?projectId=${projectId}` : ''}`),

  raiseIssue: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/governance/issues', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  resolveIssue: (issueId: string, resolutionNotes: string) =>
    request<{ success: boolean; message: string }>(`/governance/issues/${issueId}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolutionNotes }),
    }),

  // Financials, Sanctions & Treasury Disbursements APIs
  getBudgetSanctions: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/financials/sanctions${projectId ? `?projectId=${projectId}` : ''}`),

  createBudgetSanction: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/financials/sanctions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getExpenditures: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/financials/bills${projectId ? `?projectId=${projectId}` : ''}`),

  createRaBill: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/financials/bills', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  disbursePayment: (expenditureId: string, input: { treasuryVoucherNo: string; disbursementMode: string; remarks?: string }) =>
    request<{ success: boolean; message: string; data: any }>(`/financials/bills/${expenditureId}/disburse`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // Completion, DLP & Asset Handover APIs
  getCompletionCertificates: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/completion/certificates${projectId ? `?projectId=${projectId}` : ''}`),

  issueCompletionCertificate: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/completion/certificates', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getDlpDefects: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/completion/dlp-defects${projectId ? `?projectId=${projectId}` : ''}`),

  logDlpDefect: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/completion/dlp-defects', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  rectifyDlpDefect: (defectId: string, rectificationNotes: string) =>
    request<{ success: boolean; message: string }>(`/completion/dlp-defects/${defectId}/rectify`, {
      method: 'PATCH',
      body: JSON.stringify({ rectificationNotes }),
    }),

  releaseGuarantee: (input: any) =>
    request<{ success: boolean; message: string }>('/completion/release-guarantee', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getAssetHandovers: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/completion/handovers${projectId ? `?projectId=${projectId}` : ''}`),

  completeAssetHandover: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/completion/handovers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // Phase 10: Executive Analytics & Public Portal APIs
  getExecutiveAnalytics: () =>
    request<{ success: boolean; data: any }>('/reports/executive-analytics'),

  getPublicProjects: (filters?: { district?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.district) params.append('district', filters.district);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString();
    return request<{ success: boolean; data: any[] }>(`/public/projects${qs ? `?${qs}` : ''}`);
  },

  submitCitizenFeedback: (input: any) =>
    request<{ success: boolean; message: string; data: any }>('/public/feedback', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getCitizenFeedback: (projectId?: string) =>
    request<{ success: boolean; data: any[] }>(`/reports/feedback${projectId ? `?projectId=${projectId}` : ''}`),

  getProjectDossier: (projectId: string) =>
    request<{ success: boolean; data: any }>(`/reports/projects/${projectId}/dossier`),
};
