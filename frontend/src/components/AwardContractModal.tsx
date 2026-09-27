import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AwardContractInput, TenderDto, ContractorDto } from '@gov-platform/shared';
import { X, Award, ShieldCheck, Send } from 'lucide-react';

interface AwardContractModalProps {
  tender: TenderDto;
  onClose: () => void;
  onSuccess: () => void;
}

export const AwardContractModal: React.FC<AwardContractModalProps> = ({ tender, onClose, onSuccess }) => {
  const [contractors, setContractors] = useState<ContractorDto[]>([]);
  const [contractorId, setContractorId] = useState('');
  const [contractAgreementNo, setContractAgreementNo] = useState('');
  const [workOrderNo, setWorkOrderNo] = useState('');
  const [workOrderDate, setWorkOrderDate] = useState(new Date().toISOString().split('T')[0]!);
  const [contractValueInr, setContractValueInr] = useState<number>(tender.estimatedTenderAmount);
  const [scheduledStartDate, setScheduledStartDate] = useState(new Date().toISOString().split('T')[0]!);
  const [scheduledEndDate, setScheduledEndDate] = useState(
    new Date(Date.now() + 547 * 24 * 3600 * 1000).toISOString().split('T')[0]!
  );
  const [pbgAmountInr, setPbgAmountInr] = useState<number>(Math.round(tender.estimatedTenderAmount * 0.05));
  const [pbgValidityDate, setPbgValidityDate] = useState(
    new Date(Date.now() + 730 * 24 * 3600 * 1000).toISOString().split('T')[0]!
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900 + 100);
    setContractAgreementNo(`GJ-RNB-CON-${year}-0${rand}`);
    setWorkOrderNo(`GJ-RNB-WO-${year}-0${rand}`);

    api.getContractors().then((res) => {
      if (res.data) {
        setContractors(res.data);
        // Pre-select L1 bidder if bids exist
        if (tender.bids && tender.bids.length > 0) {
          const l1 = tender.bids.find((b) => b.rank === 1) || tender.bids[0];
          if (l1) {
            setContractorId(l1.contractorId);
            setContractValueInr(l1.bidAmountInr);
            setPbgAmountInr(Math.round(l1.bidAmountInr * 0.05));
          }
        } else if (res.data.length > 0) {
          setContractorId(res.data[0]!.id);
        }
      }
    }).catch(() => {});
  }, [tender]);

  const handleContractValueChange = (val: number) => {
    setContractValueInr(val);
    setPbgAmountInr(Math.round(val * 0.05));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractorId) {
      setError('Please select an awarded contractor');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: AwardContractInput = {
        tenderId: tender.id,
        contractorId,
        contractAgreementNo,
        workOrderNo,
        workOrderDate,
        contractValueInr: Number(contractValueInr),
        scheduledStartDate,
        scheduledEndDate,
        pbgAmountInr: Number(pbgAmountInr),
        pbgValidityDate,
      };

      await api.awardContract(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to award contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Execute Contract Award & Issue Work Order</h3>
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

          {/* Tender Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-mono text-xs font-bold text-emerald-900">{tender.tenderNoticeNo}</span>
              <p className="text-xs text-emerald-800 font-semibold">{tender.projectName}</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border">
              Est: ₹{(tender.estimatedTenderAmount / 10000000).toFixed(2)} Cr
            </span>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Awarded Contractor (L1 Recommended) <span className="text-red-500">*</span></label>
            <select
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Contractor --</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.classGrade}) - Reg: {c.registrationNo}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Contract Agreement No. <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={contractAgreementNo}
                onChange={(e) => setContractAgreementNo(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Work Order No. <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={workOrderNo}
                onChange={(e) => setWorkOrderNo(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Contract Value (INR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                value={contractValueInr}
                onChange={(e) => handleContractValueChange(Number(e.target.value))}
                className="w-full p-2.5 rounded border border-slate-300 font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Work Order Issuance Date</label>
              <input
                type="date"
                value={workOrderDate}
                onChange={(e) => setWorkOrderDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Scheduled Commencement Date</label>
              <input
                type="date"
                value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Scheduled Completion Date</label>
              <input
                type="date"
                value={scheduledEndDate}
                onChange={(e) => setScheduledEndDate(e.target.value)}
                className="w-full p-2 rounded border border-slate-300"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> PBG Amount (5% Statutory)
              </label>
              <input
                type="number"
                value={pbgAmountInr}
                onChange={(e) => setPbgAmountInr(Number(e.target.value))}
                className="w-full p-2 rounded border border-slate-300 font-mono font-semibold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">PBG Guarantee Validity End</label>
              <input
                type="date"
                value={pbgValidityDate}
                onChange={(e) => setPbgValidityDate(e.target.value)}
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Awarding...' : 'Award Contract & Issue Work Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
