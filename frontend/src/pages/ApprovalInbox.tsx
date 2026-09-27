import React, { useState, useEffect } from 'react';
import { api, ApiError } from '../services/api';
import { WorkflowTaskDto } from '@gov-platform/shared';

export enum ApprovalAction {
  RECOMMEND = 'RECOMMEND',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  RETURN_FOR_REWORK = 'RETURN_FOR_REWORK',
  DELEGATE = 'DELEGATE',
}
import {
  Inbox,
  CheckCircle,
  Clock,
  AlertOctagon,
  ArrowRight,
  RotateCcw,
  XCircle,
  UserCheck,
  Building2,
  IndianRupee,
  Calendar,
  X,
  Send,
} from 'lucide-react';

export const ApprovalInbox: React.FC = () => {
  const [tasks, setTasks] = useState<WorkflowTaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected task for action drawer
  const [selectedTask, setSelectedTask] = useState<WorkflowTaskDto | null>(null);
  const [action, setAction] = useState<ApprovalAction>(ApprovalAction.APPROVE);
  const [remarks, setRemarks] = useState('');
  const [conditions, setConditions] = useState('');
  const [delegatedToId, setDelegatedToId] = useState('');
  const [targetReworkStageKey, setTargetReworkStageKey] = useState('PROPOSAL_SCRUTINY');
  const [submitting, setSubmitting] = useState(false);

  // Officer list for delegation
  const [officers, setOfficers] = useState<any[]>([]);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOfficerInbox();
      setTasks(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load officer inbox tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
    // Fetch officers for delegation
    api.getUsers({ page: 1 }).then((res) => {
      if (res.items) setOfficers(res.items);
    }).catch(() => {});
  }, []);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!remarks.trim()) {
      setError('Official justification remarks are mandatory for statutory auditing.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await api.executeApprovalAction(selectedTask.id, {
        action,
        remarks,
        conditions: conditions || undefined,
        delegatedToId: action === ApprovalAction.DELEGATE ? delegatedToId : undefined,
        targetReworkStageKey: action === ApprovalAction.RETURN_FOR_REWORK ? targetReworkStageKey : undefined,
      });

      setSuccessMsg(res.message || 'Action executed successfully!');
      setSelectedTask(null);
      setRemarks('');
      setConditions('');
      fetchInbox();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to process approval action');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '₹0.00';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Statutory Approval & Workflow Inbox</h1>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            Officer pending task queue with ABAC financial limits and Maker-Checker segregation enforcement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">
            Pending Tasks: {tasks.length}
          </span>
          <button
            onClick={fetchInbox}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-md text-red-800 text-sm flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold">Authorization Error / System Failure</h4>
            <p className="mt-0.5 text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-md text-emerald-800 text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Task Queue List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-lg border border-slate-200 animate-pulse h-28"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Your Approval Queue is Empty</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            All pending statutory reviews, administrative approvals, and clearance tasks assigned to your officer account or office queue have been processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isEscalated = task.isEscalated;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border transition-all shadow-sm hover:shadow-md ${
                  isEscalated ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
                }`}
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left Column: Task & Project info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                        {task.projectCode}
                      </span>
                      <span className="bg-slate-100 text-slate-800 font-semibold text-xs px-2.5 py-0.5 rounded">
                        Stage: {task.stageName}
                      </span>
                      {isEscalated ? (
                        <span className="bg-red-100 text-red-700 font-bold text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" /> SLA ESCALATION WARNING
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-semibold text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" /> NORMAL SLA
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{task.projectName}</h3>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {task.departmentName || 'Public Works'}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        Est. Cost: {formatCurrency(task.estimatedCostInr)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due Date: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Action Button */}
                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setAction(ApprovalAction.APPROVE);
                        setError(null);
                      }}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Drawer Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-base">Execute Statutory Task Action</h3>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedTask.projectCode}</p>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <form onSubmit={handleActionSubmit} className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Task Summary Banner */}
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg space-y-2">
                <h4 className="font-bold text-xs text-indigo-900 uppercase tracking-wide">Project Target</h4>
                <p className="text-sm font-bold text-slate-900">{selectedTask.projectName}</p>
                <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-indigo-100">
                  <span>Current Stage: <strong className="text-slate-800">{selectedTask.stageName}</strong></span>
                  <span>Cost: <strong className="text-slate-800">{formatCurrency(selectedTask.estimatedCostInr)}</strong></span>
                </div>
              </div>

              {/* Action Selection Cards */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Select Officer Determination
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAction(ApprovalAction.APPROVE)}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start gap-1 transition-all ${
                      action === ApprovalAction.APPROVE
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>APPROVE / SANCTION</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Advance project to next stage</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction(ApprovalAction.RECOMMEND)}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start gap-1 transition-all ${
                      action === ApprovalAction.RECOMMEND
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>RECOMMEND</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Forward to higher sanctioning authority</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction(ApprovalAction.RETURN_FOR_REWORK)}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start gap-1 transition-all ${
                      action === ApprovalAction.RETURN_FOR_REWORK
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>REWORK LOOP</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Return to prior stage for compliance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction(ApprovalAction.REJECT)}
                    className={`p-3 rounded-lg border text-left flex flex-col items-start gap-1 transition-all ${
                      action === ApprovalAction.REJECT
                        ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>REJECT PROPOSAL</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Cancel & archive proposal</span>
                  </button>
                </div>
              </div>

              {/* Rework Stage Selector if Rework */}
              {action === ApprovalAction.RETURN_FOR_REWORK && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Target Rework Stage</label>
                  <select
                    value={targetReworkStageKey}
                    onChange={(e) => setTargetReworkStageKey(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="PROPOSAL_SCRUTINY">Stage 1: Proposal Scrutiny</option>
                    <option value="PRELIMINARY_FEASIBILITY">Stage 2: Preliminary Feasibility</option>
                    <option value="DPR_TECHNICAL_SANCTION">Stage 5: DPR Preparation</option>
                  </select>
                </div>
              )}

              {/* Delegation Officer Picker if Delegate */}
              {action === ApprovalAction.DELEGATE && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Delegate to Officer</label>
                  <select
                    value={delegatedToId}
                    onChange={(e) => setDelegatedToId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 bg-slate-50 font-medium"
                  >
                    <option value="">-- Select Target Officer --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.fullName} ({off.designationTitle || off.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mandatory Official Remarks */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Official Justification & Audit Remarks <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter statutory justification, technical observations, or compliance requirements..."
                  className="w-full text-xs p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Optional Sanction Conditions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Stipulated Sanction Conditions (Optional)</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="e.g. Subject to clearance of forest NOC within 30 days"
                  className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting Action...' : 'Confirm Determination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
