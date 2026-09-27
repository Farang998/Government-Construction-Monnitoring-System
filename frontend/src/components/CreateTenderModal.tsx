import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CreateTenderInput } from '@gov-platform/shared';
import { X, FileText, Send } from 'lucide-react';

interface CreateTenderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTenderModal: React.FC<CreateTenderModalProps> = ({ onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [tenderNoticeNo, setTenderNoticeNo] = useState('');
  const [portalReferenceId, setPortalReferenceId] = useState('');
  const [estimatedTenderAmount, setEstimatedTenderAmount] = useState<number>(0);
  const [nitPublishDate, setNitPublishDate] = useState(new Date().toISOString().split('T')[0]!);
  const [bidSubmissionEndDate, setBidSubmissionEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]!
  );
  const [bidOpeningDate, setBidOpeningDate] = useState(
    new Date(Date.now() + 33 * 24 * 3600 * 1000).toISOString().split('T')[0]!
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects({ page: 1 }).then((res) => {
      if (res.items) {
        setProjects(res.items);
        if (res.items.length > 0) {
          const p = res.items[0];
          setProjectId(p.id);
          setEstimatedTenderAmount(Number(p.estimatedCostInr));
          setTenderNoticeNo(`TN-${new Date().getFullYear()}-${p.projectCode.split('-').slice(1, 3).join('-')}-00${res.items.length + 1}`);
        }
      }
    }).catch(() => {});
  }, []);

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      setEstimatedTenderAmount(Number(p.estimatedCostInr));
      setTenderNoticeNo(`TN-${new Date().getFullYear()}-${p.projectCode.split('-').slice(1, 3).join('-')}-00${Math.floor(Math.random() * 90 + 10)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a project');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: CreateTenderInput = {
        projectId,
        tenderNoticeNo,
        portalReferenceId: portalReferenceId || undefined,
        estimatedTenderAmount: Number(estimatedTenderAmount),
        nitPublishDate,
        bidSubmissionEndDate,
        bidOpeningDate,
      };

      await api.createTender(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to publish tender notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Publish Notice Inviting Tender (NIT)</h3>
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

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Sanctioned Project <span className="text-red-500">*</span></label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name} (Est: ₹{(Number(p.estimatedCostInr)/10000000).toFixed(2)} Cr)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Tender Notice No. <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={tenderNoticeNo}
                onChange={(e) => setTenderNoticeNo(e.target.value)}
                placeholder="e.g. TN-2026-RNB-AHM-001"
                className="w-full p-2.5 rounded border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">E-Procurement Portal Ref ID</label>
              <input
                type="text"
                value={portalReferenceId}
                onChange={(e) => setPortalReferenceId(e.target.value)}
                placeholder="e.g. E-PROC-GUJ-2026-98124"
                className="w-full p-2.5 rounded border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Estimated Tender Amount (INR) <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={estimatedTenderAmount}
              onChange={(e) => setEstimatedTenderAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">NIT Publish Date</label>
              <input
                type="date"
                value={nitPublishDate}
                onChange={(e) => setNitPublishDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Submission End Date</label>
              <input
                type="date"
                value={bidSubmissionEndDate}
                onChange={(e) => setBidSubmissionEndDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Bid Opening Date</label>
              <input
                type="date"
                value={bidOpeningDate}
                onChange={(e) => setBidOpeningDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Publishing...' : 'Publish NIT Notice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
