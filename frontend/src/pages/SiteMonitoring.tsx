import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MilestoneDto, ProgressUpdateDto, InspectionDto, InspectionRating } from '@gov-platform/shared';
import { LogProgressModal } from '../components/LogProgressModal';
import { CreateInspectionModal } from '../components/CreateInspectionModal';
import {
  HardHat,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Building2,
  ShieldCheck,
  FileCheck2,
  MapPin,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export const SiteMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'inspections' | 'updates'>('milestones');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [milestones, setMilestones] = useState<MilestoneDto[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdateDto[]>([]);
  const [inspections, setInspections] = useState<InspectionDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [showLogProgress, setShowLogProgress] = useState(false);
  const [showCreateInspection, setShowCreateInspection] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMonitoringData(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects({ page: 1 });
      if (res.items && res.items.length > 0) {
        setProjects(res.items);
        if (!selectedProjectId) {
          setSelectedProjectId(res.items[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchMonitoringData = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    try {
      const [mRes, uRes, iRes] = await Promise.all([
        api.getMilestones(projId),
        api.getProgressUpdates(projId),
        api.getInspections(projId),
      ]);
      setMilestones(mRes.data || []);
      setUpdates(uRes.data || []);
      setInspections(iRes.data || []);
    } catch (err) {
      console.error('Failed to fetch monitoring data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRectify = async (inspectionId: string) => {
    try {
      await api.rectifyDefects(inspectionId, 'Defects rectified per auditor directives and verified on site');
      if (selectedProjectId) fetchMonitoringData(selectedProjectId);
    } catch (err) {
      console.error('Failed to rectify defects', err);
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '₹ 0.00';
    if (val >= 10000000) return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹ ${(val / 100000).toFixed(2)} Lakhs`;
    return `₹ ${val.toLocaleString('en-IN')}`;
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const getRatingBadge = (rating: InspectionRating | string) => {
    switch (rating) {
      case 'OUTSTANDING':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded font-bold text-xs inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> GRADE A+ OUTSTANDING
          </span>
        );
      case 'SATISFACTORY':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-1 rounded font-bold text-xs inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> GRADE A SATISFACTORY
          </span>
        );
      case 'NEEDS_IMPROVEMENT':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded font-bold text-xs inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> NEEDS IMPROVEMENT
          </span>
        );
      case 'CRITICAL_DEFECTS_REJECTED':
        return (
          <span className="bg-red-100 text-red-800 border border-red-300 px-2.5 py-1 rounded font-bold text-xs inline-flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> CRITICAL DEFECTS REJECTED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 p-6 rounded-xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight">Construction Execution & Field Site Monitoring</h1>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Physical Milestone Progress, Geo-tagged Photographic Evidence, Quality Audits & Defect Rectification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowLogProgress(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <TrendingUp className="w-4 h-4" /> Log Physical Progress
          </button>

          <button
            onClick={() => setShowCreateInspection(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow transition-all"
          >
            <Camera className="w-4 h-4" /> Record Quality Audit
          </button>
        </div>
      </div>

      {/* Target Project Filter Selector Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Target Construction Project:</span>
        </div>

        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="text-xs p-2.5 rounded border border-slate-300 font-bold text-slate-900 bg-slate-50 min-w-[320px]"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectCode} - {p.name} ({p.district})
            </option>
          ))}
        </select>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-600 bg-white px-3 rounded-t-xl border">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'milestones' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Milestones & Physical Progress ({milestones.length})
        </button>

        <button
          onClick={() => setActiveTab('inspections')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'inspections' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4 text-amber-600" /> Quality Audits & Field Inspections ({inspections.length})
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'updates' ? 'border-amber-600 text-amber-700 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-indigo-600" /> Site Progress Reporting Log ({updates.length})
        </button>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
          Loading site monitoring metrics from server...
        </div>
      ) : (
        <div>
          {/* TAB 1: MILESTONES & PHYSICAL PROGRESS */}
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {/* Project Executive Summary Bar */}
              {selectedProject && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-4 gap-4 text-xs">
                  <div className="border-r pr-4">
                    <span className="text-slate-500 text-[11px]">Overall Physical Progress</span>
                    <div className="font-bold text-emerald-800 text-lg">{selectedProject.physicalProgressPct}%</div>
                    <div className="w-full h-2 rounded-full bg-slate-200 mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${selectedProject.physicalProgressPct}%` }}></div>
                    </div>
                  </div>

                  <div className="border-r pr-4">
                    <span className="text-slate-500 text-[11px]">Financial Expenditure Progress</span>
                    <div className="font-bold text-slate-900 text-lg">{selectedProject.financialProgressPct}%</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{formatCurrency(Number(selectedProject.totalExpenditureInr))}</div>
                  </div>

                  <div className="border-r pr-4">
                    <span className="text-slate-500 text-[11px]">Sanction Contract Cost</span>
                    <div className="font-bold text-slate-900 font-mono text-base">{formatCurrency(Number(selectedProject.contractValueInr || selectedProject.estimatedCostInr))}</div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[11px]">Schedule Window</span>
                    <div className="font-bold text-slate-800">{new Date(selectedProject.plannedStartDate).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-500">To {new Date(selectedProject.plannedEndDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              {/* Milestone Cards Grid */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-slate-900">Statutory Construction Milestones Breakdown</h3>
                {milestones.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No construction milestones initialized for this project.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {milestones.map((m, idx) => {
                      const isDone = m.status === ('COMPLETED' as any);
                      const isInProgress = m.status === ('IN_PROGRESS' as any);

                      return (
                        <div
                          key={m.id}
                          className={`p-5 rounded-xl border transition-all ${
                            isDone
                              ? 'bg-emerald-50/50 border-emerald-300'
                              : isInProgress
                              ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-200'
                              : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/60 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : isInProgress
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-300 text-slate-700'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                                <span className="text-xs text-slate-500">Weightage: <strong>{m.weightagePct}%</strong> of total physical scope</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : isInProgress
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {m.status}
                              </span>
                              <span className="font-bold font-mono text-sm text-slate-900">{m.completionPct}% Done</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 space-y-1">
                            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className={`h-full ${isDone ? 'bg-emerald-600' : 'bg-blue-600'}`}
                                style={{ width: `${m.completionPct}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                              <span>Start: {new Date(m.plannedStartDate).toLocaleDateString()}</span>
                              <span>Target Completion: {new Date(m.plannedEndDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FIELD INSPECTIONS & QUALITY AUDITS */}
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              {inspections.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border text-center text-slate-500 text-xs">
                  No quality audit inspections recorded yet for this project. Click "Record Quality Audit" to log a new site audit.
                </div>
              ) : (
                <div className="space-y-4">
                  {inspections.map((i) => (
                    <div
                      key={i.id}
                      className={`bg-white p-6 rounded-xl border shadow-sm space-y-4 ${
                        !i.isRectified ? 'border-red-300 bg-red-50/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {getRatingBadge(i.overallRating)}
                            <span className="text-xs text-slate-500 font-mono">
                              Date: {new Date(i.inspectionDate).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mt-2">
                            Auditor: {i.inspectorName} ({i.inspectorDesignation})
                          </h4>
                        </div>

                        {!i.isRectified && (
                          <button
                            onClick={() => handleRectify(i.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Verify Defect Rectification
                          </button>
                        )}
                      </div>

                      {/* Observations */}
                      <div className="text-xs space-y-2">
                        <div>
                          <strong className="text-slate-800">Auditor Technical Findings:</strong>
                          <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 mt-1">
                            {i.findings}
                          </p>
                        </div>

                        {i.defectsIdentified && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900">
                            <strong>Identified Defects:</strong> {i.defectsIdentified}
                            {i.correctiveMeasures && (
                              <div className="mt-1 border-t border-red-200 pt-1 text-red-800">
                                <strong>Required Corrective Action:</strong> {i.correctiveMeasures}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Photo Evidence Thumbnail */}
                      {i.evidence && i.evidence.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <strong className="text-xs text-slate-700 block mb-2">Geo-Tagged Site Photo Evidence:</strong>
                          <div className="flex flex-wrap gap-3">
                            {i.evidence.map((ev) => (
                              <div key={ev.id} className="relative group w-48 h-32 rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-slate-900">
                                <img src={ev.fileUrl} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent p-2 flex flex-col justify-end text-white text-[10px]">
                                  <div className="font-bold truncate">{ev.title}</div>
                                  {ev.latitude && (
                                    <div className="font-mono text-[9px] text-amber-300 flex items-center gap-0.5">
                                      <MapPin className="w-3 h-3" /> {ev.latitude}, {ev.longitude}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SITE PROGRESS REPORTING LOG */}
          {activeTab === 'updates' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Audit Trail of Site Progress Updates</h3>
              {updates.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No progress updates logged yet. Click "Log Physical Progress" to record site measurement logs.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Reporting Date</th>
                        <th className="p-3">Milestone Scope</th>
                        <th className="p-3 text-right">Physical Progress %</th>
                        <th className="p-3 text-right">Expenditure Voucher</th>
                        <th className="p-3">Logged Remarks</th>
                        <th className="p-3">Submitted By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {updates.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-indigo-700">
                            {new Date(u.reportingDate).toLocaleDateString()}
                          </td>
                          <td className="p-3 font-semibold text-slate-800">
                            {u.milestoneTitle || 'General Site Update'}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-800 font-mono">
                            {u.physicalProgressPct}%
                          </td>
                          <td className="p-3 text-right font-bold font-mono text-slate-900">
                            {formatCurrency(u.financialExpenditureInr)}
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs truncate">{u.remarks}</td>
                          <td className="p-3 text-slate-600 font-medium">{u.submittedByName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showLogProgress && (
        <LogProgressModal
          projectId={selectedProjectId}
          projectName={selectedProject?.name || 'Sanctioned Civil Work'}
          milestones={milestones}
          onClose={() => setShowLogProgress(false)}
          onSuccess={() => {
            setShowLogProgress(false);
            fetchProjects();
            fetchMonitoringData(selectedProjectId);
          }}
        />
      )}

      {showCreateInspection && (
        <CreateInspectionModal
          onClose={() => setShowCreateInspection(false)}
          onSuccess={() => {
            setShowCreateInspection(false);
            fetchMonitoringData(selectedProjectId);
            setActiveTab('inspections');
          }}
        />
      )}
    </div>
  );
};
