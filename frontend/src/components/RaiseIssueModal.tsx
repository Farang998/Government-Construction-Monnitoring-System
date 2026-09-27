import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CreateIssueInput } from '@gov-platform/shared';
import { X, AlertCircle, ShieldAlert, Send } from 'lucide-react';

interface RaiseIssueModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RaiseIssueModal: React.FC<RaiseIssueModalProps> = ({ onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [targetDepartmentCode, setTargetDepartmentCode] = useState('RNB');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects({ page: 1 }).then((res) => {
      if (res.items && res.items.length > 0) {
        setProjects(res.items);
        setProjectId(res.items[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !issueTitle || !issueDescription) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateIssueInput = {
        projectId,
        issueTitle,
        issueDescription,
        severity: severity as any,
        targetDepartmentCode,
      };

      await api.raiseIssue(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to raise issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-gov-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gov-border bg-red-900 px-5 py-4 text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="h-5 w-5 text-amber-300" />
            <span>Raise Field Blocker & Administrative Escalation</span>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-red-800 text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Infrastructure Project <span className="text-red-500">*</span></label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium focus:ring-2 focus:ring-red-500"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Issue / Blocker Subject Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="e.g. Unscheduled High Voltage Overhead Power Line Relocation Delay"
              className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-red-500 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Severity & Escalation Gate <span className="text-red-500">*</span></label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full p-2.5 rounded border border-slate-300 font-bold focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="CRITICAL">CRITICAL (Escalates to Department Secretary)</option>
                <option value="HIGH">HIGH (Escalates to Chief Engineer)</option>
                <option value="MEDIUM">MEDIUM (Division Level Resolution)</option>
                <option value="LOW">LOW (Field Level Resolution)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Target Inter-Dept Authority</label>
              <select
                value={targetDepartmentCode}
                onChange={(e) => setTargetDepartmentCode(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-medium focus:ring-2 focus:ring-red-500"
              >
                <option value="RNB">Roads & Buildings Department</option>
                <option value="WRD">Water Resources Department</option>
                <option value="GETCO">Gujarat Energy Transmission Corp (GETCO)</option>
                <option value="REV">Revenue & Land Records Dept</option>
                <option value="FOR">Forest & Climate Department</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Detailed Blocker Description & Technical Impact <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Explain physical impediment on site, safety hazards, contractor idle charges, inter-departmental correspondence history..."
              className="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-red-500"
              required
            />
          </div>

          {(severity === 'CRITICAL' || severity === 'HIGH') && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 leading-relaxed text-[11px]">
              <strong>⚡ Automatic SLA Escalation Notice:</strong> Selecting <strong>{severity}</strong> severity will automatically route an urgent administrative escalation alert to the <strong>{severity === 'CRITICAL' ? 'Department Secretary' : 'Chief Engineer'}</strong> and generate an immutable audit log.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-4 py-2 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded bg-red-700 px-5 py-2 font-bold text-white shadow hover:bg-red-800 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Raise & Trigger Escalation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
