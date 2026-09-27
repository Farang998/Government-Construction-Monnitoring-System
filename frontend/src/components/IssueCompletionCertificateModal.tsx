import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IssueCompletionCertificateInput } from '@gov-platform/shared';
import { X, Award, CheckCircle, ShieldCheck } from 'lucide-react';

interface IssueCompletionCertificateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueCompletionCertificateModal: React.FC<IssueCompletionCertificateModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [certificateType, setCertificateType] = useState<'PROVISIONAL' | 'FINAL'>('PROVISIONAL');
  const [dlpDurationMonths, setDlpDurationMonths] = useState<number>(24);
  const [remarks, setRemarks] = useState(
    'Infrastructure work completed in accordance with PWD standards and approved technical specifications.'
  );

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
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: IssueCompletionCertificateInput = {
        projectId,
        certificateType,
        dlpDurationMonths: Number(dlpDurationMonths),
        remarks,
      };

      await api.issueCompletionCertificate(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to issue completion certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl border border-gov-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gov-border bg-gov-navy px-5 py-4 text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Award className="h-5 w-5 text-amber-400" />
            <span>Issue Official Infrastructure Completion Certificate</span>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-800 text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Infrastructure Project <span className="text-red-500">*</span></label>
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
              <label className="block font-bold text-slate-700">Certificate Type</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as any)}
                className="w-full p-2.5 rounded border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PROVISIONAL">Provisional Completion Certificate (PCC)</option>
                <option value="FINAL">Final Completion Certificate (FCC)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">DLP Warranty Duration (Months)</label>
              <select
                value={dlpDurationMonths}
                onChange={(e) => setDlpDurationMonths(Number(e.target.value))}
                className="w-full p-2.5 rounded border border-slate-300 font-bold text-emerald-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
                <option value={60}>60 Months (5 Years)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Superintendent Inspection & Clearance Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 text-slate-700 font-medium"
            />
          </div>

          {/* Statutory Compliance Notice */}
          <div className="rounded border border-amber-300 bg-amber-50 p-3 flex items-start gap-2 text-[11px] text-amber-900">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Statutory Warranty Trigger:</strong> Issuing the Provisional Completion Certificate (PCC) automatically starts the <strong>{dlpDurationMonths}-month Defect Liability Period (DLP)</strong> warranty and updates project status to <strong>COMPLETION_CERTIFIED</strong>.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
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
              <CheckCircle className="h-4 w-4" />
              <span>{loading ? 'Issuing Certificate...' : 'Issue Completion Certificate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
