import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { WorkflowInstanceDto } from '@gov-platform/shared';
import { GisMap } from '../components/GisMap';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  UserCheck,
  Building,
  GitPullRequest,
} from 'lucide-react';

export const ProjectDetail: React.FC<{ projectId: string; onBack: () => void }> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<any>(null);
  const [workflow, setWorkflow] = useState<WorkflowInstanceDto | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wfLoading, setWfLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workflow' | 'overview' | 'ownership' | 'financials' | 'contracts' | 'milestones' | 'inspections' | 'delays' | 'location' | 'history'>('workflow');

  useEffect(() => {
    setLoading(true);
    api
      .getProjectById(projectId)
      .then((res) => {
        if (res.success) {
          setProject(res.data);
        }
      })
      .finally(() => setLoading(false));

    setWfLoading(true);
    api
      .getProjectWorkflow(projectId)
      .then((res) => {
        if (res.success) {
          setWorkflow(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setWfLoading(false));

    api.getContracts(projectId).then((res) => {
      if (res.data) setContracts(res.data);
    }).catch(() => {});

    api.getMilestones(projectId).then((res) => {
      if (res.data) setMilestones(res.data);
    }).catch(() => {});

    api.getInspections(projectId).then((res) => {
      if (res.data) setInspections(res.data);
    }).catch(() => {});

    api.getDelays(projectId).then((res) => {
      if (res.data) setDelays(res.data);
    }).catch(() => {});

    api.getIssues(projectId).then((res) => {
      if (res.data) setIssues(res.data);
    }).catch(() => {});
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-500">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-xs text-red-600">
        Project not found or access restricted.
      </div>
    );
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '₹ 0';
    if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Crore`;
    if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Back Button */}
      <div className="flex items-center justify-between border-b border-gov-border pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Project Registry
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gov-blue bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            Immutable ID: {project.projectCode}
          </span>
        </div>
      </div>

      {/* Executive Project Header Banner */}
      <div className="rounded border border-gov-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-gov-navy px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {project.projectType.name}
              </span>
              <span className="text-xs font-semibold text-slate-500">{project.administrativeDepartment.name}</span>
            </div>
            <h1 className="text-xl font-bold text-gov-navy leading-snug">{project.name}</h1>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{project.shortDescription}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-right">
              <div className="text-[10px] font-semibold uppercase text-emerald-800">Estimated Project Cost</div>
              <div className="text-lg font-bold text-emerald-900 font-mono">
                {formatCurrency(project.estimatedCostInr)}
              </div>
            </div>
          </div>
        </div>

        {/* Status Stepper / Progress Bar Summary */}
        <div className="mt-6 border-t border-slate-200 pt-4 grid grid-cols-4 gap-4 text-xs">
          <div className="border-r border-slate-200 pr-4">
            <div className="text-slate-500 text-[11px]">Current Status</div>
            <div className="font-bold text-gov-blue">{project.status}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{project.currentStage}</div>
          </div>

          <div className="border-r border-slate-200 pr-4">
            <div className="text-slate-500 text-[11px]">Physical Progress</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{project.physicalProgressPct}%</span>
              <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600"
                  style={{ width: `${project.physicalProgressPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="border-r border-slate-200 pr-4">
            <div className="text-slate-500 text-[11px]">Financial Expenditure</div>
            <div className="font-bold text-slate-800">{formatCurrency(project.totalExpenditureInr)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Financial: {project.financialProgressPct}%
            </div>
          </div>

          <div>
            <div className="text-slate-500 text-[11px]">Schedule Window</div>
            <div className="font-semibold text-slate-800">
              {project.plannedStartDate} to {project.plannedEndDate}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Variance: <span className={project.scheduleVariancePct < 0 ? 'text-red-600 font-bold' : ''}>{project.scheduleVariancePct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gov-border text-xs font-semibold text-slate-600 bg-white px-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'workflow' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          Workflow DAG & Stage Clearances
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Project Overview & Scope
        </button>
        <button
          onClick={() => setActiveTab('ownership')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'ownership' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Ownership & Hierarchy
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'financials' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Cost & Financial Sanctions
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'contracts' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Tenders & Executed Contracts ({contracts.length})
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'milestones' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Physical Milestones ({milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('inspections')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'inspections' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Quality Audits ({inspections.length})
        </button>
        <button
          onClick={() => setActiveTab('delays')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'delays' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Delays & Blockers ({delays.length + issues.length})
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'location' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Location & GIS Bounds
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 border-b-2 transition-colors ${
            activeTab === 'history' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          Status & Transition Trail
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded border border-gov-border bg-white p-6 shadow-sm">
        {activeTab === 'workflow' && (
          <WorkflowStepper workflow={workflow} loading={wfLoading} />
        )}
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs">
            <div>
              <h3 className="font-bold text-gov-navy text-sm mb-2">Detailed Technical Scope</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
                {project.detailedDescription || 'No detailed scope notes logged.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Initial Checks & Land Status
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  Preliminary feasibility cleared. Revenue land survey & site handover completed without encumbrance.
                </p>
              </div>

              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-blue-600" /> Statutory Clearances Required
                </div>
                <p className="text-slate-600 text-[11px] leading-normal">
                  Environmental Clearance (State SEIAA) and Forest NOC clearance applied.
                </p>
              </div>

              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-600" /> Key Target Dates
                </div>
                <div className="text-slate-600 text-[11px] space-y-1">
                  <div>Planned Start: {project.plannedStartDate}</div>
                  <div>Planned End: {project.plannedEndDate}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ownership' && (
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="rounded border border-slate-200 p-4 space-y-3 bg-slate-50">
              <h3 className="font-bold text-gov-navy text-sm border-b border-slate-200 pb-2">
                Departmental Ownership & Offices
              </h3>
              <div>
                <div className="text-slate-500">Administrative Department:</div>
                <div className="font-bold text-slate-800">{project.administrativeDepartment.name} ({project.administrativeDepartment.code})</div>
              </div>
              <div>
                <div className="text-slate-500">Implementing Agency:</div>
                <div className="font-bold text-slate-800">{project.implementingDepartment.name} ({project.implementingDepartment.code})</div>
              </div>
              <div>
                <div className="text-slate-500">Executing Division Office:</div>
                <div className="font-bold text-slate-800">{project.executingOffice.name} ({project.executingOffice.district})</div>
              </div>
            </div>

            <div className="rounded border border-slate-200 p-4 space-y-3 bg-slate-50">
              <h3 className="font-bold text-gov-navy text-sm border-b border-slate-200 pb-2">
                Designated Responsible Officers
              </h3>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gov-blue shrink-0" />
                <div>
                  <div className="text-slate-500">Project Owner (Nodal Officer):</div>
                  <div className="font-bold text-slate-800">{project.projectOwner.fullName} ({project.projectOwner.designation.title})</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-gov-blue shrink-0" />
                <div>
                  <div className="text-slate-500">Project Manager (Division Officer):</div>
                  <div className="font-bold text-slate-800">{project.projectManager.fullName} ({project.projectManager.designation.title})</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm">Financial Estimate Breakdown & Head of Account</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-slate-500">Estimated Cost</div>
                <div className="text-lg font-bold text-gov-navy font-mono">{formatCurrency(project.estimatedCostInr)}</div>
              </div>
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-slate-500">Sanctioned Amount</div>
                <div className="text-lg font-bold text-emerald-800 font-mono">{formatCurrency(project.sanctionedCostInr)}</div>
              </div>
              <div className="rounded border border-slate-200 p-4 bg-slate-50">
                <div className="text-slate-500">Funding Source</div>
                <div className="text-sm font-bold text-slate-800">{project.fundingSource}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm">Executing Contracts & Statutory Work Orders</h3>
            {contracts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded border border-slate-200">
                No contract agreement executed yet for this project.
              </div>
            ) : (
              <div className="space-y-3">
                {contracts.map((c: any) => (
                  <div key={c.id} className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-gov-blue">{c.contractAgreementNo}</span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{c.contractorName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-800 text-base">{formatCurrency(c.originalValueInr)}</div>
                        <div className="text-[10px] text-slate-500 font-mono">PBG: {formatCurrency(c.pbgAmountInr)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600">
                      <div>Work Order: <strong className="text-slate-800 font-mono">{c.workOrderNo}</strong></div>
                      <div>WO Date: <strong className="text-slate-800">{new Date(c.workOrderDate).toLocaleDateString()}</strong></div>
                      <div>PBG Validity: <strong className="text-emerald-700">{new Date(c.pbgValidityDate).toLocaleDateString()}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm">Construction Milestones & Physical Progress Schedule</h3>
            {milestones.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded border border-slate-200">
                No milestone schedule initialized for this project.
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m: any, idx: number) => (
                  <div key={m.id} className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-gov-navy text-white text-xs flex items-center justify-center font-mono">{idx + 1}</span>
                        {m.title}
                      </div>
                      <span className="font-mono font-bold text-emerald-800 text-sm">{m.completionPct}% Completed</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${m.completionPct}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-mono">
                      <span>Weightage: {m.weightagePct}%</span>
                      <span>Target: {new Date(m.plannedStartDate).toLocaleDateString()} - {new Date(m.plannedEndDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm">Field Quality Audits & Site Inspections</h3>
            {inspections.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded border border-slate-200">
                No field inspections logged yet for this project.
              </div>
            ) : (
              <div className="space-y-3">
                {inspections.map((i: any) => (
                  <div key={i.id} className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <div>
                        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">{i.overallRating}</span>
                        <div className="font-semibold text-slate-800 text-xs mt-1">Auditor: {i.inspectorName} ({i.inspectorDesignation})</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(i.inspectionDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{i.findings}</p>
                    {i.defectsIdentified && (
                      <div className="p-2 bg-red-50 text-red-900 rounded text-[11px]">
                        <strong>Defects:</strong> {i.defectsIdentified}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gov-gold" /> Geographic Location Details
            </h3>
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <div className="text-slate-500">State:</div>
                <div className="font-bold text-slate-800">{project.state}</div>
              </div>
              <div>
                <div className="text-slate-500">District:</div>
                <div className="font-bold text-slate-800">{project.district}</div>
              </div>
              <div>
                <div className="text-slate-500">Taluka:</div>
                <div className="font-bold text-slate-800">{project.taluka}</div>
              </div>
              <div>
                <div className="text-slate-500">City / Village:</div>
                <div className="font-bold text-slate-800">{project.cityVillage}</div>
              </div>
            </div>

            <div className="h-[360px] w-full rounded border border-slate-300 overflow-hidden mt-3 shadow-inner">
              <GisMap
                markers={[
                  {
                    id: project.id,
                    projectCode: project.projectCode,
                    name: project.name,
                    departmentCode: project.administrativeDepartment.code,
                    departmentName: project.administrativeDepartment.name,
                    status: project.status as any,
                    currentStage: project.currentStage,
                    district: project.district,
                    taluka: project.taluka,
                    latitude: project.latitude ? Number(project.latitude) : 23.0225,
                    longitude: project.longitude ? Number(project.longitude) : 72.5714,
                    estimatedCostInr: Number(project.estimatedCostInr),
                    sanctionedCostInr: project.sanctionedCostInr ? Number(project.sanctionedCostInr) : null,
                    physicalProgressPct: Number(project.physicalProgressPct),
                    financialProgressPct: Number(project.financialProgressPct),
                    executingOfficeName: project.executingOfficeName || 'Division Office',
                    projectManagerName: project.projectManagerName || 'Superintending Engineer',
                  },
                ]}
                centerLat={project.latitude ? Number(project.latitude) : 23.0225}
                centerLng={project.longitude ? Number(project.longitude) : 72.5714}
                zoom={12}
              />
            </div>
          </div>
        )}

        {activeTab === 'delays' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" /> Statutory Delays & Inter-Departmental Blockers
            </h3>
            
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recorded Delays ({delays.length})</h4>
              {delays.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-500">No project delays logged.</div>
              ) : (
                delays.map((d: any) => (
                  <div key={d.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Category: {d.category}</span>
                      <span className="text-red-700">+{d.delayDays} Days Impact</span>
                    </div>
                    <p className="text-slate-600">{d.reasonDescription}</p>
                  </div>
                ))
              )}

              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mt-4">Field Blocker Issues & Escalations ({issues.length})</h4>
              {issues.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-slate-500">No active field issues reported.</div>
              ) : (
                issues.map((i: any) => (
                  <div key={i.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{i.issueTitle}</span>
                      <span className="text-red-600 font-bold">{i.severity}</span>
                    </div>
                    <p className="text-slate-600">{i.issueDescription}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-gov-navy text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-500" /> Immutable State Transition Trail
            </h3>
            <div className="space-y-2">
              {project.statusHistories.map((h: any) => (
                <div key={h.id} className="flex items-start justify-between rounded border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="font-bold text-slate-800">
                      Transition to <span className="text-gov-blue">{h.newStatus}</span> (from {h.previousStatus})
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{h.reason}</div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
