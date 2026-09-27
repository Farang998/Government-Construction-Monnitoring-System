// ==========================================
// GOVERNMENT ROLES & IDENTITY ENUMS
// ==========================================

export enum UserRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEPT_SECRETARY = 'DEPT_SECRETARY',
  CHIEF_ENGINEER = 'CHIEF_ENGINEER',
  SUPERINTENDING_ENGINEER = 'SUPERINTENDING_ENGINEER',
  EXECUTIVE_ENGINEER = 'EXECUTIVE_ENGINEER',
  ASSISTANT_ENGINEER = 'ASSISTANT_ENGINEER',
  JUNIOR_ENGINEER = 'JUNIOR_ENGINEER',
  FINANCE_CONTROLLER = 'FINANCE_CONTROLLER',
  QUALITY_AUDITOR = 'QUALITY_AUDITOR',
  CONTRACTOR = 'CONTRACTOR',
  PUBLIC_AUDITOR = 'PUBLIC_AUDITOR',
}

export enum OfficeType {
  HEAD_OFFICE = 'HEAD_OFFICE',
  CIRCLE_OFFICE = 'CIRCLE_OFFICE',
  DIVISION_OFFICE = 'DIVISION_OFFICE',
  SUB_DIVISION_OFFICE = 'SUB_DIVISION_OFFICE',
  FIELD_OFFICE = 'FIELD_OFFICE',
}

export enum OrganizationType {
  STATE_GOVERNMENT = 'STATE_GOVERNMENT',
  CENTRAL_GOVERNMENT = 'CENTRAL_GOVERNMENT',
  PUBLIC_SECTOR_UNDERTAKING = 'PUBLIC_SECTOR_UNDERTAKING',
  MUNICIPAL_CORPORATION = 'MUNICIPAL_CORPORATION',
}

// ==========================================
// PROJECT REGISTRY ENUMS
// ==========================================

export enum ProjectStatus {
  PROPOSED = 'PROPOSED',
  UNDER_SCRUTINY = 'UNDER_SCRUTINY',
  FEASIBILITY_APPROVED = 'FEASIBILITY_APPROVED',
  ADMINISTRATIVELY_APPROVED = 'ADMINISTRATIVELY_APPROVED',
  LAND_CLEARANCE_IN_PROGRESS = 'LAND_CLEARANCE_IN_PROGRESS',
  DPR_PREPARATION = 'DPR_PREPARATION',
  TECHNICAL_SANCTIONED = 'TECHNICAL_SANCTIONED',
  FINANCIAL_APPROVED = 'FINANCIAL_APPROVED',
  STATUTORY_CLEARANCES = 'STATUTORY_CLEARANCES',
  TENDER_PREPARATION = 'TENDER_PREPARATION',
  TENDER_PUBLISHED = 'TENDER_PUBLISHED',
  BID_EVALUATION = 'BID_EVALUATION',
  CONTRACT_AWARDED = 'CONTRACT_AWARDED',
  WORK_ORDER_ISSUED = 'WORK_ORDER_ISSUED',
  SITE_MOBILIZATION = 'SITE_MOBILIZATION',
  IN_CONSTRUCTION = 'IN_CONSTRUCTION',
  WORK_SUSPENDED = 'WORK_SUSPENDED',
  TESTING_COMMISSIONING = 'TESTING_COMMISSIONING',
  COMPLETION_CERTIFIED = 'COMPLETION_CERTIFIED',
  HANDED_OVER = 'HANDED_OVER',
  DEFECT_LIABILITY = 'DEFECT_LIABILITY',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

// ==========================================
// WORKFLOW & APPROVAL ENUMS
// ==========================================

export enum WorkflowExecutionType {
  SEQUENTIAL = 'SEQUENTIAL',
  PARALLEL_GATE = 'PARALLEL_GATE',
  CONDITIONAL_BRANCH = 'CONDITIONAL_BRANCH',
}

export enum WorkflowTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RECOMMENDED = 'RECOMMENDED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REWORK_REQUESTED = 'REWORK_REQUESTED',
  ESCALATED = 'ESCALATED',
}

export enum ApprovalAction {
  RECOMMEND = 'RECOMMEND',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RETURN_FOR_REWORK = 'RETURN_FOR_REWORK',
  DELEGATE = 'DELEGATE',
}

// ==========================================
// MONITORING, RISKS, DELAYS & ISSUES ENUMS
// ==========================================

export enum MilestoneStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  FAILED = 'FAILED',
}

export enum DelayCategory {
  LAND_ACQUISITION = 'LAND_ACQUISITION',
  DESIGN_REVISION = 'DESIGN_REVISION',
  STATUTORY_APPROVAL = 'STATUTORY_APPROVAL',
  FUNDING_BUDGET = 'FUNDING_BUDGET',
  TENDER_DISPUTE = 'TENDER_DISPUTE',
  CONTRACTOR_INACTION = 'CONTRACTOR_INACTION',
  LABOUR_SHORTAGE = 'LABOUR_SHORTAGE',
  MATERIAL_SHORTAGE = 'MATERIAL_SHORTAGE',
  WEATHER_DISASTER = 'WEATHER_DISASTER',
  UTILITY_SHIFTING = 'UTILITY_SHIFTING',
  LEGAL_STAY = 'LEGAL_STAY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  SCOPE_CHANGE = 'SCOPE_CHANGE',
  TECHNICAL_GEOLOGICAL = 'TECHNICAL_GEOLOGICAL',
  QUALITY_RECTIFICATION = 'QUALITY_RECTIFICATION',
  GOVERNMENT_POLICY = 'GOVERNMENT_POLICY',
  OTHER = 'OTHER',
}

export enum SeverityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum DocumentType {
  CONCEPT_NOTE = 'CONCEPT_NOTE',
  FEASIBILITY_REPORT = 'FEASIBILITY_REPORT',
  ADMIN_SANCTION_ORDER = 'ADMIN_SANCTION_ORDER',
  LAND_CLEARANCE_NOC = 'LAND_CLEARANCE_NOC',
  DPR = 'DPR',
  TECHNICAL_SANCTION_ORDER = 'TECHNICAL_SANCTION_ORDER',
  FINANCIAL_CONCURRENCE = 'FINANCIAL_CONCURRENCE',
  ENV_CLEARANCE = 'ENV_CLEARANCE',
  FOREST_CLEARANCE = 'FOREST_CLEARANCE',
  FIRE_CLEARANCE = 'FIRE_CLEARANCE',
  TENDER_NIT = 'TENDER_NIT',
  BID_EVALUATION_REPORT = 'BID_EVALUATION_REPORT',
  LETTER_OF_ACCEPTANCE = 'LETTER_OF_ACCEPTANCE',
  CONTRACT_AGREEMENT = 'CONTRACT_AGREEMENT',
  WORK_ORDER = 'WORK_ORDER',
  MEASUREMENT_BOOK = 'MEASUREMENT_BOOK',
  SITE_PHOTOGRAPH = 'SITE_PHOTOGRAPH',
  INSPECTION_REPORT = 'INSPECTION_REPORT',
  COMPLETION_CERTIFICATE = 'COMPLETION_CERTIFICATE',
  HANDOVER_MEMO = 'HANDOVER_MEMO',
}

export enum InspectionRating {
  OUTSTANDING = 'OUTSTANDING',
  SATISFACTORY = 'SATISFACTORY',
  NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',
  CRITICAL_DEFECTS_REJECTED = 'CRITICAL_DEFECTS_REJECTED',
}

// ==========================================
// CORE DOMAIN DTO INTERFACES
// ==========================================

export interface UserSummaryDto {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: UserRoleType;
  designationTitle: string;
  officeName: string;
  departmentCode: string;
  financialApprovalLimitInr: number;
}

export interface ProjectSummaryDto {
  id: string;
  projectCode: string;
  name: string;
  shortDescription: string;
  projectTypeCode: string;
  departmentCode: string;
  departmentName: string;
  status: ProjectStatus;
  currentStage: string;
  state: string;
  district: string;
  taluka: string;
  estimatedCostInr: number;
  sanctionedCostInr: number | null;
  totalExpenditureInr: number;
  physicalProgressPct: number;
  financialProgressPct: number;
  plannedProgressPct: number;
  scheduleVariancePct: number;
  plannedStartDate: string;
  plannedEndDate: string;
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  detailedDescription: string;
  cityVillage: string;
  latitude: number | null;
  longitude: number | null;
  fundingSource: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  revisedEndDate: string | null;
  contractValueInr: number | null;
  executingOfficeName: string;
  projectOwnerName: string;
  projectManagerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowTaskDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  stageKey: string;
  stageName: string;
  executionType: WorkflowExecutionType;
  status: WorkflowTaskStatus;
  assignedUserId: string | null;
  assignedUserName?: string;
  assignedDesignationTitle?: string;
  estimatedCostInr?: number;
  departmentName?: string;
  dueDate: string;
  isEscalated: boolean;
}

export interface ApprovalHistoryDto {
  id: string;
  taskId: string;
  actorId: string;
  actorName: string;
  actorDesignation: string;
  action: ApprovalAction;
  remarks: string;
  conditions: string | null;
  delegatedToId: string | null;
  delegatedToName?: string;
  createdAt: string;
}

export interface WorkflowStageStatusDto {
  stageKey: string;
  stageName: string;
  orderIndex: number;
  executionType: WorkflowExecutionType;
  prerequisiteStageKeys: string[];
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REWORK_REQUESTED';
  completedAt?: string;
  completedBy?: string;
  tasks: WorkflowTaskDto[];
}

export interface WorkflowInstanceDto {
  id: string;
  projectId: string;
  templateCode: string;
  templateName: string;
  currentStageKey: string;
  isCompleted: boolean;
  stages: WorkflowStageStatusDto[];
  history: ApprovalHistoryDto[];
}

export interface WorkflowActionRequestDto {
  action: ApprovalAction;
  remarks: string;
  conditions?: string;
  delegatedToId?: string;
  targetReworkStageKey?: string;
}

// ==========================================
// TENDERS, CONTRACTS & VENDOR DTOs
// ==========================================

export interface ContractorDto {
  id: string;
  registrationNo: string;
  companyName: string;
  panNumber: string;
  gstin: string;
  classGrade: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface TenderBidDto {
  id: string;
  tenderId: string;
  contractorId: string;
  contractorName: string;
  contractorGrade: string;
  bidAmountInr: number;
  variancePct: number;
  submissionDate: string;
  isQualified: boolean;
  rank: number | null;
  remarks: string | null;
}

export interface TenderDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  tenderNoticeNo: string;
  portalReferenceId: string | null;
  estimatedTenderAmount: number;
  nitPublishDate: string;
  bidSubmissionEndDate: string;
  bidOpeningDate: string;
  status: string;
  bidCount: number;
  bids?: TenderBidDto[];
  createdAt: string;
}

export interface ContractDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  tenderNoticeNo: string;
  contractorId: string;
  contractorName: string;
  contractAgreementNo: string;
  workOrderNo: string;
  workOrderDate: string;
  originalValueInr: number;
  revisedValueInr: number | null;
  scheduledStartDate: string;
  scheduledEndDate: string;
  actualEndDate: string | null;
  pbgAmountInr: number;
  pbgValidityDate: string;
  createdAt: string;
}

export interface CreateTenderInput {
  projectId: string;
  tenderNoticeNo: string;
  portalReferenceId?: string;
  estimatedTenderAmount: number;
  nitPublishDate: string;
  bidSubmissionEndDate: string;
  bidOpeningDate: string;
}

export interface SubmitBidInput {
  tenderId: string;
  contractorId: string;
  bidAmountInr: number;
  remarks?: string;
}

export interface AwardContractInput {
  tenderId: string;
  contractorId: string;
  contractAgreementNo: string;
  workOrderNo: string;
  workOrderDate: string;
  contractValueInr: number;
  scheduledStartDate: string;
  scheduledEndDate: string;
  pbgAmountInr: number;
  pbgValidityDate: string;
}

// ==========================================
// MONITORING, MILESTONES & INSPECTION DTOs
// ==========================================

export interface MilestoneDto {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  weightagePct: number;
  completionPct: number;
  status: MilestoneStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  createdAt: string;
}

export interface ProgressUpdateDto {
  id: string;
  projectId: string;
  milestoneId: string | null;
  milestoneTitle?: string;
  physicalProgressPct: number;
  financialExpenditureInr: number;
  reportingDate: string;
  remarks: string;
  submittedByName: string;
  createdAt: string;
}

export interface SiteEvidenceDto {
  id: string;
  inspectionId: string;
  title: string;
  mediaType: string;
  fileUrl: string;
  latitude: number | null;
  longitude: number | null;
  capturedAt: string;
}

export interface InspectionDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  inspectorId: string;
  inspectorName: string;
  inspectorDesignation: string;
  inspectionDate: string;
  overallRating: InspectionRating;
  findings: string;
  defectsIdentified: string | null;
  correctiveMeasures: string | null;
  isRectified: boolean;
  evidence: SiteEvidenceDto[];
  createdAt: string;
}

export interface LogProgressInput {
  projectId: string;
  milestoneId?: string;
  milestoneCompletionPct?: number;
  financialExpenditureInr?: number;
  reportingDate?: string;
  remarks: string;
}

export interface ScheduleInspectionInput {
  projectId: string;
  inspectionDate: string;
  overallRating: InspectionRating;
  findings: string;
  defectsIdentified?: string;
  correctiveMeasures?: string;
  evidenceTitle?: string;
  evidenceFileUrl?: string;
  latitude?: number;
  longitude?: number;
}

// ==========================================
// GIS & GEOSPATIAL MAPPING DTOs
// ==========================================

export interface ProjectGisMarkerDto {
  id: string;
  projectCode: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  status: ProjectStatus;
  currentStage: string;
  district: string;
  taluka: string;
  latitude: number;
  longitude: number;
  estimatedCostInr: number;
  sanctionedCostInr: number | null;
  physicalProgressPct: number;
  financialProgressPct: number;
  executingOfficeName: string;
  projectManagerName: string;
}

export interface GisQueryFilterInput {
  district?: string;
  departmentCode?: string;
  status?: ProjectStatus;
  minCostInr?: number;
  maxCostInr?: number;
  centerLat?: number;
  centerLng?: number;
  radiusKm?: number;
  search?: string;
}

export interface GisLayerDto {
  id: string;
  layerName: string;
  layerType: 'DISTRICT_BOUNDARY' | 'CIRCLE_JURISDICTION' | 'SECTOR_OVERLAY';
  geoJson: any;
}

// ==========================================
// DELAYS, RISKS & ISSUES DTOs
// ==========================================

export interface DelayRecordDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  category: DelayCategory;
  delayDays: number;
  financialImpactInr: number | null;
  reasonDescription: string;
  mitigationPlan: string | null;
  reportingDate: string;
  reportedByName: string;
  createdAt: string;
}

export interface RiskRecordDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  riskTitle: string;
  riskDescription: string;
  severity: SeverityLevel;
  probabilityPct: number;
  mitigationStrategy: string;
  assignedOfficerName: string;
  isMitigated: boolean;
  createdAt: string;
}

export interface IssueRecordDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  issueTitle: string;
  issueDescription: string;
  severity: SeverityLevel;
  departmentCode: string;
  departmentName: string;
  isEscalated: boolean;
  escalatedToRole: string | null;
  status: 'OPEN' | 'IN_RESOLUTION' | 'RESOLVED';
  resolutionNotes: string | null;
  raisedByName: string;
  createdAt: string;
}

export interface CreateDelayInput {
  projectId: string;
  category: DelayCategory;
  delayDays: number;
  financialImpactInr?: number;
  reasonDescription: string;
  mitigationPlan?: string;
  reportingDate?: string;
}

export interface CreateRiskInput {
  projectId: string;
  riskTitle: string;
  riskDescription: string;
  severity: SeverityLevel;
  probabilityPct: number;
  mitigationStrategy: string;
}

export interface CreateIssueInput {
  projectId: string;
  issueTitle: string;
  issueDescription: string;
  severity: SeverityLevel;
  targetDepartmentCode?: string;
}

export interface ResolveIssueInput {
  issueId: string;
  resolutionNotes: string;
}

// ==========================================
// FINANCIALS, RA BILLS & DISBURSEMENT DTOs
// ==========================================

export interface BudgetSanctionDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  sanctionType: string;
  orderNumber: string;
  orderDate: string;
  sanctionAmount: number;
  headOfAccount: string;
  financialYear: string;
  remarks: string | null;
  createdAt: string;
}

export interface ExpenditureDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  voucherNo: string;
  voucherDate: string;
  grossClaimAmountInr: number;
  itTdsInr: number;
  gstTdsInr: number;
  retentionInr: number;
  labourCessInr: number;
  totalDeductionsInr: number;
  netPayableAmountInr: number;
  paymentMode: string;
  payeeName: string;
  headOfAccount: string;
  measurementBookRef?: string;
  createdAt: string;
}

export interface CreateBudgetSanctionInput {
  projectId: string;
  sanctionType?: string;
  orderNumber: string;
  orderDate?: string;
  sanctionAmount: number;
  headOfAccount: string;
  financialYear?: string;
  remarks?: string;
}

export interface CreateRaBillInput {
  projectId: string;
  grossClaimAmountInr: number;
  measurementBookRef?: string;
  payeeName?: string;
  headOfAccount?: string;
  billDate?: string;
}

export interface DisbursePaymentInput {
  expenditureId: string;
  treasuryVoucherNo: string;
  bankAdviceRef?: string;
}

// ==========================================
// COMPLETION, DLP & ASSET HANDOVER DTOs
// ==========================================

export interface CompletionCertificateDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  certificateType: 'PROVISIONAL' | 'FINAL';
  certificateNumber: string;
  issueDate: string;
  dlpStartDate: string;
  dlpEndDate: string;
  dlpDurationMonths: number;
  remarks: string | null;
  issuedByName: string;
  createdAt: string;
}

export interface DlpDefectDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  defectTitle: string;
  description: string;
  locationRef: string | null;
  reportedDate: string;
  severity: SeverityLevel;
  isRectified: boolean;
  rectifiedDate: string | null;
  rectificationNotes: string | null;
  reportedByName: string;
  createdAt: string;
}

export interface AssetHandoverDto {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  assetCode: string;
  assetName: string;
  handoverDate: string;
  receivingDepartment: string;
  assetValuationInr: number;
  maintenanceDivision: string;
  handoverStatus: string;
  remarks: string | null;
  recordedByName: string;
  createdAt: string;
}

export interface IssueCompletionCertificateInput {
  projectId: string;
  certificateType: 'PROVISIONAL' | 'FINAL';
  certificateNumber?: string;
  issueDate?: string;
  dlpDurationMonths?: number; // e.g. 12, 24, 36 months
  remarks?: string;
}

export interface LogDlpDefectInput {
  projectId: string;
  defectTitle: string;
  description: string;
  locationRef?: string;
  severity?: SeverityLevel;
}

export interface RectifyDlpDefectInput {
  defectId: string;
  rectificationNotes: string;
}

export interface ReleaseGuaranteeInput {
  projectId: string;
  guaranteeType: 'RETENTION_DEPOSIT' | 'PERFORMANCE_BANK_GUARANTEE' | 'BOTH';
  executiveEngineerSignOff: boolean;
  superintendingEngineerSignOff: boolean;
  remarks?: string;
}

export interface CompleteAssetHandoverInput {
  projectId: string;
  assetCode?: string;
  assetName: string;
  receivingDepartment: string;
  assetValuationInr: number;
  maintenanceDivision: string;
  remarks?: string;
}

// ==========================================
// PHASE 10: ANALYTICS, PUBLIC PORTAL & REPORTS DTOs
// ==========================================

export interface ExecutiveAnalyticsDto {
  totalProjects: number;
  totalSanctionedCostInr: number;
  totalExpenditureInr: number;
  avgPhysicalProgressPct: number;
  avgFinancialProgressPct: number;
  activeEscalationsCount: number;
  dlpDefectsCount: number;
  districtMetrics: {
    district: string;
    projectCount: number;
    expenditureInr: number;
    avgPhysicalProgressPct: number;
  }[];
  departmentMetrics: {
    departmentCode: string;
    departmentName: string;
    projectCount: number;
    sanctionedCostInr: number;
  }[];
}

export interface PublicProjectDto {
  id: string;
  projectCode: string;
  name: string;
  shortDescription: string;
  departmentName: string;
  status: string;
  currentStage: string;
  district: string;
  taluka: string;
  latitude: number | null;
  longitude: number | null;
  sanctionedCostInr: number | null;
  physicalProgressPct: number;
  financialProgressPct: number;
  plannedEndDate: string;
}

export interface CitizenFeedbackDto {
  id: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
  citizenName: string;
  contactPhone: string | null;
  feedbackType: string;
  subject: string;
  details: string;
  status: string;
  createdAt: string;
}

export interface CreateCitizenFeedbackInput {
  projectId: string;
  citizenName: string;
  contactPhone?: string;
  feedbackType?: 'INQUIRY' | 'DEFECT_REPORT' | 'APPRECIATION' | 'GRIEVANCE';
  subject: string;
  details: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
