import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CreateRaBillInput } from '@gov-platform/shared';
import { X, FileSpreadsheet, Calculator, Send } from 'lucide-react';

interface CreateRaBillModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateRaBillModal: React.FC<CreateRaBillModalProps> = ({ onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [measurementBookRef, setMeasurementBookRef] = useState('');
  const [grossClaimAmountInr, setGrossClaimAmountInr] = useState<number>(5000000); // Default ₹50 Lakhs
  const [payeeName, setPayeeName] = useState('L&T Construction');
  const [headOfAccount, setHeadOfAccount] = useState('5054-03-337-01-Capital Works');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]!);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects({ page: 1 }).then((res) => {
      if (res.items && res.items.length > 0) {
        setProjects(res.items);
        setProjectId(res.items[0].id);
        setMeasurementBookRef(`MB-2026-${res.items[0].projectCode.slice(-4)}-01`);
      }
    }).catch(() => {});
  }, []);

  // Live Statutory Deduction Calculations
  const gross = grossClaimAmountInr || 0;
  const itTds = gross * 0.02;
  const gstTds = gross * 0.02;
  const retention = gross * 0.05;
  const labourCess = gross * 0.01;
  const totalDeductions = itTds + gstTds + retention + labourCess;
  const netPayable = gross - totalDeductions;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !grossClaimAmountInr || grossClaimAmountInr <= 0) {
      setError('Please select a project and enter a valid gross claim amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateRaBillInput = {
        projectId,
        grossClaimAmountInr: Number(grossClaimAmountInr),
        measurementBookRef,
        payeeName,
        headOfAccount,
        billDate,
      };

      await api.createRaBill(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to generate RA bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl border border-gov-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between border-b border-gov-border bg-gov-navy px-5 py-4 text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            <span>Generate Contractor Running Account (RA) Bill & Tax Voucher</span>
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
              onChange={(e) => {
                setProjectId(e.target.value);
                const p = projects.find((x) => x.id === e.target.value);
                if (p) setMeasurementBookRef(`MB-2026-${p.projectCode.slice(-4)}-01`);
              }}
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
              <label className="block font-bold text-slate-700">Measurement Book (MB) Ref <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={measurementBookRef}
                onChange={(e) => setMeasurementBookRef(e.target.value)}
                placeholder="e.g. MB-2026-AHM-088"
                className="w-full p-2.5 rounded border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Payee Contractor / Firm Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Gross Claim Value (INR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="1000"
                value={grossClaimAmountInr}
                onChange={(e) => setGrossClaimAmountInr(Number(e.target.value))}
                className="w-full p-2.5 rounded border border-slate-300 font-bold text-base text-emerald-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Head of Account Code</label>
              <input
                type="text"
                value={headOfAccount}
                onChange={(e) => setHeadOfAccount(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Bill Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-mono"
              />
            </div>
          </div>

          {/* Statutory Tax Deductions Preview Card */}
          <div className="rounded-lg border border-slate-300 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-gov-navy text-xs border-b border-slate-200 pb-1.5">
              <Calculator className="h-4 w-4 text-gov-blue" />
              <span>Statutory Tax & Retention Deductions Breakdown (10.0%)</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-500">Income Tax TDS (2%)</div>
                <div className="font-bold text-red-700">₹ {itTds.toLocaleString()}</div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-500">GST TDS (2%)</div>
                <div className="font-bold text-red-700">₹ {gstTds.toLocaleString()}</div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-500">Retention Deposit (5%)</div>
                <div className="font-bold text-amber-700">₹ {retention.toLocaleString()}</div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-500">Labour Cess (1%)</div>
                <div className="font-bold text-red-700">₹ {labourCess.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-xs font-bold">
              <span className="text-slate-600">Total Statutory Deductions: <strong className="text-red-700">₹ {totalDeductions.toLocaleString()}</strong></span>
              <span className="text-emerald-800 text-sm bg-emerald-100 px-2.5 py-1 rounded border border-emerald-300">
                Net Payable: ₹ {netPayable.toLocaleString()}
              </span>
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
              className="flex items-center gap-1.5 rounded bg-emerald-700 px-5 py-2 font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Processing Voucher...' : 'Generate Bill & Treasury Voucher'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
