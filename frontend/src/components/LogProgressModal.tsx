import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { LogProgressInput, MilestoneDto } from '@gov-platform/shared';
import { X, TrendingUp, IndianRupee, Send } from 'lucide-react';

interface LogProgressModalProps {
  projectId: string;
  projectName: string;
  milestones: MilestoneDto[];
  onClose: () => void;
  onSuccess: () => void;
}

export const LogProgressModal: React.FC<LogProgressModalProps> = ({
  projectId,
  projectName,
  milestones,
  onClose,
  onSuccess,
}) => {
  const [milestoneId, setMilestoneId] = useState('');
  const [milestoneCompletionPct, setMilestoneCompletionPct] = useState<number>(50);
  const [financialExpenditureInr, setFinancialExpenditureInr] = useState<number>(0);
  const [reportingDate, setReportingDate] = useState(new Date().toISOString().split('T')[0]!);
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (milestones.length > 0) {
      const active = milestones.find((m) => m.status === ('IN_PROGRESS' as any)) || milestones[0];
      if (active) {
        setMilestoneId(active.id);
        setMilestoneCompletionPct(active.completionPct || 50);
      }
    }
  }, [milestones]);

  const handleMilestoneChange = (id: string) => {
    setMilestoneId(id);
    const m = milestones.find((x) => x.id === id);
    if (m) {
      setMilestoneCompletionPct(m.completionPct || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setError('Official progress verification remarks are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: LogProgressInput = {
        projectId,
        milestoneId: milestoneId || undefined,
        milestoneCompletionPct: Number(milestoneCompletionPct),
        financialExpenditureInr: Number(financialExpenditureInr),
        reportingDate,
        remarks,
      };

      await api.logProgressUpdate(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to log physical progress update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Log Site Physical & Financial Progress</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded font-medium">
              {error}
            </div>
          )}

          <div className="bg-slate-50 border p-3 rounded-lg">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Target Project</span>
            <div className="font-bold text-slate-900 text-sm">{projectName}</div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Construction Milestone</label>
            <select
              value={milestoneId}
              onChange={(e) => handleMilestoneChange(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- General Project Level Update --</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} (Weight: {m.weightagePct}%, Curr: {m.completionPct}%)
                </option>
              ))}
            </select>
          </div>

          {milestoneId && (
            <div className="space-y-1.5 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>Milestone Physical Completion %</span>
                <span className="text-emerald-800 font-mono text-sm">{milestoneCompletionPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={milestoneCompletionPct}
                onChange={(e) => setMilestoneCompletionPct(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Expenditure Voucher (INR)
              </label>
              <input
                type="number"
                value={financialExpenditureInr}
                onChange={(e) => setFinancialExpenditureInr(Number(e.target.value))}
                placeholder="0.00"
                className="w-full p-2.5 rounded border border-slate-300 font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Site Reporting Date</label>
              <input
                type="date"
                value={reportingDate}
                onChange={(e) => setReportingDate(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">
              Site Verification & Measurement Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter site verification details, measurement book references, or structural progress notes..."
              className="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting...' : 'Log Progress Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
