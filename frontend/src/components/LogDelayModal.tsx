import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CreateDelayInput } from '@gov-platform/shared';
import { X, Clock, AlertTriangle, Send } from 'lucide-react';

interface LogDelayModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LogDelayModal: React.FC<LogDelayModalProps> = ({ onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('LAND_ACQUISITION');
  const [delayDays, setDelayDays] = useState(30);
  const [financialImpactInr, setFinancialImpactInr] = useState<number | undefined>(undefined);
  const [reasonDescription, setReasonDescription] = useState('');
  const [mitigationPlan, setMitigationPlan] = useState('');

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
    if (!projectId || !reasonDescription) {
      setError('Please select a project and provide delay reason description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateDelayInput = {
        projectId,
        category: category as any,
        delayDays: Number(delayDays),
        financialImpactInr: financialImpactInr ? Number(financialImpactInr) : undefined,
        reasonDescription,
        mitigationPlan,
      };

      await api.logDelay(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record delay');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-gov-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gov-border bg-gov-navy px-5 py-4 text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className="h-5 w-5 text-amber-400" />
            <span>Record Statutory Project Delay & Schedule Variance</span>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-800 text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Infrastructure Project <span className="text-red-500">*</span></label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
              required
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Root-Cause Delay Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-medium focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="LAND_ACQUISITION">Land Acquisition Bottleneck</option>
                <option value="UTILITY_SHIFTING">Utility Shifting (Water/Power)</option>
                <option value="DESIGN_REVISION">Design & Drawing Revision</option>
                <option value="STATUTORY_APPROVAL">Statutory Clearances (Forest/NOC)</option>
                <option value="FUNDING_BUDGET">Budget / Financial Allocation Delay</option>
                <option value="CONTRACTOR_INACTION">Contractor Inaction / Slow Mobilization</option>
                <option value="ENVIRONMENTAL">Environmental & Forest Stay</option>
                <option value="LEGAL_STAY">Court Injunction / Legal Dispute</option>
                <option value="WEATHER_DISASTER">Monsoon / Geological Disaster</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Estimated Days Lost <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                max="1000"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full p-2.5 rounded border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500 text-amber-700"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Estimated Financial Impact (INR)</label>
            <input
              type="number"
              value={financialImpactInr || ''}
              onChange={(e) => setFinancialImpactInr(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 5000000 for ₹50 Lakhs"
              className="w-full p-2.5 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Detailed Delay Justification & Root Cause <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={reasonDescription}
              onChange={(e) => setReasonDescription(e.target.value)}
              placeholder="Describe specific obstruction details, survey numbers involved, inter-departmental notices issued..."
              className="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Schedule Acceleration & Mitigation Strategy</label>
            <textarea
              rows={2}
              value={mitigationPlan}
              onChange={(e) => setMitigationPlan(e.target.value)}
              placeholder="Deploy additional night shifts, re-allocate heavy machinery, issue 14-day statutory notice to contractor..."
              className="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              className="flex items-center gap-1.5 rounded bg-amber-600 px-5 py-2 font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Logging Delay...' : 'Log Delay & Update Variance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
