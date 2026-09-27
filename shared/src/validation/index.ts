import { z } from 'zod';
import {
  ApprovalAction,
  DelayCategory,
  InspectionRating,
  SeverityLevel,
} from '../types';

// ==========================================
// AUTH SCHEMAS
// ==========================================

export const LoginRequestSchema = z.object({
  employeeId: z.string().min(3, 'Employee ID must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ==========================================
// PROJECT SCHEMAS
// ==========================================

export const CreateProjectProposalSchema = z.object({
  name: z.string().min(5, 'Project name must be at least 5 characters').max(300),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters').max(500),
  detailedDescription: z.string().optional(),
  projectTypeId: z.string().uuid('Invalid Project Type UUID'),
  administrativeDepartmentId: z.string().uuid('Invalid Department UUID'),
  implementingDepartmentId: z.string().uuid('Invalid Implementing Department UUID'),
  executingOfficeId: z.string().uuid('Invalid Office UUID'),
  projectOwnerId: z.string().uuid('Invalid Project Owner UUID'),
  projectManagerId: z.string().uuid('Invalid Project Manager UUID'),
  estimatedCostInr: z.number().positive('Estimated cost must be greater than zero'),
  fundingSource: z.string().min(2, 'Funding source is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  taluka: z.string().min(2, 'Taluka is required'),
  cityVillage: z.string().min(2, 'City / Village is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  plannedStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  plannedEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
});

export type CreateProjectProposalInput = z.infer<typeof CreateProjectProposalSchema>;

// ==========================================
// WORKFLOW ACTION SCHEMAS
// ==========================================

export const WorkflowActionSchema = z.object({
  action: z.nativeEnum(ApprovalAction),
  remarks: z.string().min(5, 'Remarks are mandatory and must exceed 5 characters'),
  targetReworkStageKey: z.string().optional(),
  delegateToUserId: z.string().uuid().optional(),
  conditions: z.string().optional(),
});

export type WorkflowActionInput = z.infer<typeof WorkflowActionSchema>;

// ==========================================
// PROGRESS & MONITORING SCHEMAS
// ==========================================

export const ProgressUpdateSchema = z.object({
  milestoneId: z.string().uuid().optional(),
  physicalProgressPct: z.number().min(0).max(100),
  financialExpenditureInr: z.number().min(0).optional(),
  remarks: z.string().min(5, 'Remarks are required for audit trail'),
});

export type ProgressUpdateInput = z.infer<typeof ProgressUpdateSchema>;

export const DelayRecordSchema = z.object({
  category: z.nativeEnum(DelayCategory),
  severity: z.nativeEnum(SeverityLevel),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  expectedResolutionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  reason: z.string().min(10, 'Detailed delay explanation is required'),
  impactDescription: z.string().min(5),
  correctiveAction: z.string().min(5),
  responsibleParty: z.string().min(2),
});

export type DelayRecordInput = z.infer<typeof DelayRecordSchema>;

export const InspectionSubmissionSchema = z.object({
  inspectionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  overallRating: z.nativeEnum(InspectionRating),
  findings: z.string().min(10, 'Inspection findings are required'),
  defectsIdentified: z.string().optional(),
  correctiveMeasures: z.string().optional(),
});

export type InspectionSubmissionInput = z.infer<typeof InspectionSubmissionSchema>;
