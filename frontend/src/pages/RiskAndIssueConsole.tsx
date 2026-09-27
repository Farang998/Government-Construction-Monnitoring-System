import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { DelayRecordDto, RiskRecordDto, IssueRecordDto } from '@gov-platform/shared';
import { LogDelayModal } from '../components/LogDelayModal';
import { RaiseIssueModal } from '../components/RaiseIssueModal';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  Plus,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export const RiskAndIssueConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'delays' | 'issues' | 'risks'>('issues');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [delays, setDelays] = useState<DelayRecordDto[]>([]);
  const [issues, setIssues] = useState<IssueRecordDto[]>([]);
  const [risks, setRisks] = useState<RiskRecordDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [showLogDelayModal, setShowLogDelayModal] = useState(false);
  const [showRaiseIssueModal, setShowRaiseIssueModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchGovernanceData(selectedProjectId);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects({ page: 1 });
      if (res.items && res.items.length > 0) {
        setProjects(res.items);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchGovernanceData = async (projId?: string) => {
    setLoading(true);
    try {
      const [dRes, iRes, rRes] = await Promise.all([
        api.getDelays(projId || undefined),
        api.getIssues(projId || undefined),
        api.getRisks(projId || undefined),
      ]);

      setDelays(dRes.data || []);
      setIssues(iRes.data || []);
      setRisks(rRes.data || []);
    } catch (err) {
      console.error('Failed to fetch governance data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    const notes = prompt('Enter issue resolution verification notes & compliance summary:');
    if (!notes) return;

    try {
      await api.resolveIssue(issueId, notes);
      fetchGovernanceData(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to resolve issue');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-red-600" /> CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded font-bold text-[10px] inline-flex items-center gap-1">
            <Activity className="w-3 h-3 text-blue-600" /> MEDIUM
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded font-bold text-[10px]">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900 text-white shadow">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gov-navy">Risk, Delays & Inter-Departmental Escalations Command</h1>
            <p className="text-xs text-slate-500">
              Statewide Obstruction Governance, Root-Cause Delay Analytics & Administrative SLA Escalation Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogDelayModal(true)}
            className="flex items-center gap-1.5 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Record Project Delay</span>
          </button>
          <button
            onClick={() => setShowRaiseIssueModal(true)}
            className="flex items-center gap-1.5 rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Raise Critical Blocker Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-lg border border-gov-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
            >
              <option value="">All Projects Statewide ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Open Blockers:</span>
            <span className="rounded bg-red-100 px-2 py-0.5 font-bold text-red-800">
              {issues.filter((i) => i.status !== 'RESOLVED').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">SLA Escalations:</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
              {issues.filter((i) => i.isEscalated && i.status !== 'RESOLVED').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500">Recorded Delays:</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">{delays.length}</span>
          </div>
        </div>
      </div>

      {/* Faceted Tab Switcher */}
      <div className="border-b border-gov-border">
        <nav className="-mb-px flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'issues'
                ? 'border-red-600 text-red-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-red-600" />
            <span>Active Field Issues & Escalations ({issues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('delays')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'delays'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Delays & Schedule Variance Log ({delays.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'risks'
                ? 'border-gov-blue text-gov-blue font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-4 w-4 text-gov-blue" />
            <span>Risk Register Matrix ({risks.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Active Field Issues & Escalations */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading active field blockers...</div>
          ) : issues.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No active field blockers or statutory issues recorded.
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
                  issue.isEscalated && issue.status !== 'RESOLVED'
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-gov-border'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gov-navy text-xs">{issue.projectCode}</span>
                      <span className="text-xs text-slate-500">• {issue.projectName}</span>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <h3 className="mt-1 font-bold text-slate-900 text-sm">{issue.issueTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {issue.isEscalated && issue.status !== 'RESOLVED' && (
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm animate-pulse flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> ESCALATED TO {issue.escalatedToRole}
                      </span>
                    )}

                    {issue.status === 'RESOLVED' ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> RESOLVED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleResolveIssue(issue.id)}
                        className="rounded bg-emerald-600 px-2.5 py-1 font-bold text-white text-xs hover:bg-emerald-700 shadow"
                      >
                        Verify Resolution
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed">{issue.issueDescription}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <strong>Raised By:</strong> {issue.raisedByName} | Department: {issue.departmentName} ({issue.departmentCode})
                    </div>
                    <div>{new Date(issue.createdAt).toLocaleString()}</div>
                  </div>

                  {issue.resolutionNotes && (
                    <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px]">
                      <strong>Compliance Verification Notes:</strong> {issue.resolutionNotes}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Delays & Schedule Variance Log */}
      {activeTab === 'delays' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading delay records...</div>
          ) : delays.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No project delay records logged.
            </div>
          ) : (
            delays.map((d) => (
              <div key={d.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gov-navy">{d.projectCode}</span>
                      <span className="text-slate-500">• {d.projectName}</span>
                      <span className="rounded bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 border border-amber-200">
                        {d.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-700 text-sm font-mono">+{d.delayDays} Days Impact</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed"><strong>Root Cause:</strong> {d.reasonDescription}</p>
                  {d.mitigationPlan && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px]">
                      <strong>Mitigation & Acceleration Strategy:</strong> {d.mitigationPlan}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
                    <span>Reported By: {d.reportedByName}</span>
                    <span>Date: {new Date(d.reportingDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Risk Register Matrix */}
      {activeTab === 'risks' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading risk matrix...</div>
          ) : risks.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No risk entries registered.
            </div>
          ) : (
            risks.map((r) => (
              <div key={r.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gov-navy">{r.projectCode}</span>
                      <span className="text-slate-500">• {r.projectName}</span>
                      {getSeverityBadge(r.severity)}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{r.riskTitle}</h3>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-700">Probability: {r.probabilityPct}%</div>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-amber-500" style={{ width: `${r.probabilityPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-2">
                  <p className="leading-relaxed"><strong>Mitigation Strategy:</strong> {r.mitigationStrategy}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Assigned Risk Officer: {r.assignedOfficerName}</span>
                    <span>Created: {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showLogDelayModal && (
        <LogDelayModal
          onClose={() => setShowLogDelayModal(false)}
          onSuccess={() => fetchGovernanceData(selectedProjectId)}
        />
      )}

      {showRaiseIssueModal && (
        <RaiseIssueModal
          onClose={() => setShowRaiseIssueModal(false)}
          onSuccess={() => fetchGovernanceData(selectedProjectId)}
        />
      )}
    </div>
  );
};
