import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TenderDto, ContractDto, ContractorDto } from '@gov-platform/shared';
import { CreateTenderModal } from '../components/CreateTenderModal';
import { AwardContractModal } from '../components/AwardContractModal';
import {
  ScrollText,
  FileText,
  Award,
  Users,
  Plus,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

export const TendersAndContracts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tenders' | 'matrix' | 'contracts' | 'contractors'>('tenders');
  const [tenders, setTenders] = useState<TenderDto[]>([]);
  const [contracts, setContracts] = useState<ContractDto[]>([]);
  const [contractors, setContractors] = useState<ContractorDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected tender for Bid Matrix & Award
  const [selectedTender, setSelectedTender] = useState<TenderDto | null>(null);

  // Modals
  const [showCreateTender, setShowCreateTender] = useState(false);
  const [showAwardContract, setShowAwardContract] = useState<TenderDto | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, ctrRes] = await Promise.all([
        api.getTenders(),
        api.getContracts(),
        api.getContractors(),
      ]);

      if (tRes.data) {
        setTenders(tRes.data);
        if (tRes.data.length > 0 && !selectedTender) {
          setSelectedTender(tRes.data[0]);
        }
      }
      if (cRes.data) setContracts(cRes.data);
      if (ctrRes.data) setContractors(ctrRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '₹ 0.00';
    if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} Lakhs`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold tracking-tight">Tenders, Contracts & Vendor Management</h1>
          </div>
          <p className="text-slate-300 text-xs mt-1">
            E-procurement Notice Inviting Tenders (NIT), Comparative L1/L2/L3 Bid Matrix, Work Orders & Performance Bank Guarantees.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateTender(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 shadow transition-all"
          >
            <Plus className="w-4 h-4" /> Publish NIT Notice
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold text-slate-600 bg-white px-3 rounded-t-xl border">
        <button
          onClick={() => setActiveTab('tenders')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'tenders' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Active Tenders (NIT) ({tenders.length})
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'matrix' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> L1/L2/L3 Bid Evaluation Matrix
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'contracts' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" /> Executed Contracts & Work Orders ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab('contractors')}
          className={`py-3.5 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'contractors' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Contractor Registry ({contractors.length})
        </button>
      </div>

      {/* Main Tab Panels */}
      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500 animate-pulse">
          Loading procurement data from server...
        </div>
      ) : (
        <div>
          {/* TAB 1: ACTIVE TENDERS */}
          {activeTab === 'tenders' && (
            <div className="space-y-4">
              {tenders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border text-center text-slate-500 text-xs">
                  No active tender notices published. Click "Publish NIT Notice" to publish a new tender.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenders.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            {t.tenderNoticeNo}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 mt-1">{t.projectName}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">Project: {t.projectCode}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            t.status === 'AWARDED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.status === 'EVALUATED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border">
                        <div>
                          <span className="text-[11px] text-slate-400">Est. Tender Amount</span>
                          <div className="font-bold text-slate-900 font-mono text-sm">{formatCurrency(t.estimatedTenderAmount)}</div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400">Total Bids Submitted</span>
                          <div className="font-bold text-indigo-700 font-mono text-sm">{t.bidCount} Bids</div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400">NIT Publish Date</span>
                          <div>{new Date(t.nitPublishDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400">Submission End</span>
                          <div>{new Date(t.bidSubmissionEndDate).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedTender(t);
                            setActiveTab('matrix');
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1"
                        >
                          <BarChart3 className="w-3.5 h-3.5" /> View L1 Matrix
                        </button>

                        {t.status !== 'AWARDED' && (
                          <button
                            onClick={() => setShowAwardContract(t)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                          >
                            <Award className="w-3.5 h-3.5" /> Award Contract
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: L1/L2/L3 BID EVALUATION MATRIX */}
          {activeTab === 'matrix' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              {/* Tender Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Comparative Financial Bid Evaluation Matrix</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ranks bids strictly by financial price (L1 Lowest Bidder) with variance against statutory estimate.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Tender Notice:</label>
                  <select
                    value={selectedTender?.id || ''}
                    onChange={(e) => {
                      const t = tenders.find((x) => x.id === e.target.value);
                      if (t) setSelectedTender(t);
                    }}
                    className="text-xs p-2 rounded border border-slate-300 font-mono font-bold bg-slate-50"
                  >
                    {tenders.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tenderNoticeNo} - {t.projectName.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedTender ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-indigo-900 font-mono text-sm">{selectedTender.tenderNoticeNo}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedTender.projectName}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500">Departmental Estimated Tender Cost</div>
                      <div className="text-base font-bold text-slate-900 font-mono">{formatCurrency(selectedTender.estimatedTenderAmount)}</div>
                    </div>
                  </div>

                  {!selectedTender.bids || selectedTender.bids.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No contractor bids registered for this tender notice.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-3">Financial Rank</th>
                            <th className="p-3">Contractor Name</th>
                            <th className="p-3">Class Grade</th>
                            <th className="p-3 text-right">Quoted Bid Amount (INR)</th>
                            <th className="p-3 text-right">Estimate Variance (%)</th>
                            <th className="p-3 text-center">Status / Determination</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedTender.bids.map((bid) => {
                            const isL1 = bid.rank === 1;

                            return (
                              <tr
                                key={bid.id}
                                className={`transition-colors ${
                                  isL1 ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                                }`}
                              >
                                <td className="p-3 font-bold font-mono">
                                  {isL1 ? (
                                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                                      L1 LOWEST BIDDER
                                    </span>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                                      L{bid.rank} BIDDER
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 font-bold text-slate-900">{bid.contractorName}</td>
                                <td className="p-3 text-slate-600">{bid.contractorGrade}</td>
                                <td className="p-3 text-right font-bold font-mono text-slate-900">
                                  {formatCurrency(bid.bidAmountInr)}
                                </td>
                                <td className="p-3 text-right font-mono">
                                  {bid.variancePct <= 0 ? (
                                    <span className="text-emerald-700 font-bold flex items-center justify-end gap-0.5">
                                      <TrendingDown className="w-3.5 h-3.5" /> {bid.variancePct}%
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-bold flex items-center justify-end gap-0.5">
                                      <TrendingUp className="w-3.5 h-3.5" /> +{bid.variancePct}%
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  {isL1 ? (
                                    <button
                                      onClick={() => setShowAwardContract(selectedTender)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shadow"
                                    >
                                      Recommend for LOA Award
                                    </button>
                                  ) : (
                                    <span className="text-slate-500 font-mono text-[11px]">Rank L{bid.rank} Qualified</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* TAB 3: EXECUTED CONTRACTS & WORK ORDERS */}
          {activeTab === 'contracts' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Executed Contracts & Statutory Work Orders</h3>
              {contracts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No contracts awarded yet. Complete bid evaluation and execute contract award.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Agreement No.</th>
                        <th className="p-3">Work Order No. & Date</th>
                        <th className="p-3">Project / Tender</th>
                        <th className="p-3">Awarded Contractor</th>
                        <th className="p-3 text-right">Contract Value (INR)</th>
                        <th className="p-3 text-center">PBG Security (5%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold font-mono text-indigo-700">{c.contractAgreementNo}</td>
                          <td className="p-3">
                            <div className="font-bold font-mono text-slate-900">{c.workOrderNo}</div>
                            <div className="text-[11px] text-slate-500">{new Date(c.workOrderDate).toLocaleDateString()}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{c.projectName}</div>
                            <div className="text-[11px] font-mono text-slate-500">{c.projectCode}</div>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{c.contractorName}</td>
                          <td className="p-3 text-right font-bold font-mono text-slate-900">
                            {formatCurrency(c.originalValueInr)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {formatCurrency(c.pbgAmountInr)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CONTRACTOR REGISTRY */}
          {activeTab === 'contractors' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900">Registered Civil & Infrastructure Contractors</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Reg. No</th>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Class Grade</th>
                      <th className="p-3">PAN / GSTIN</th>
                      <th className="p-3">Nodal Contact Person</th>
                      <th className="p-3">Contact Email & Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {contractors.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold font-mono text-indigo-700">{c.registrationNo}</td>
                        <td className="p-3 font-bold text-slate-900">{c.companyName}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.classGrade}</td>
                        <td className="p-3 font-mono text-slate-600">
                          <div>PAN: {c.panNumber}</div>
                          <div>GST: {c.gstin}</div>
                        </td>
                        <td className="p-3 font-medium text-slate-800">{c.contactPerson}</td>
                        <td className="p-3 text-slate-600">
                          <div>{c.email}</div>
                          <div className="font-mono text-[11px]">{c.phone}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateTender && (
        <CreateTenderModal
          onClose={() => setShowCreateTender(false)}
          onSuccess={() => {
            setShowCreateTender(false);
            fetchData();
          }}
        />
      )}

      {showAwardContract && (
        <AwardContractModal
          tender={showAwardContract}
          onClose={() => setShowAwardContract(null)}
          onSuccess={() => {
            setShowAwardContract(null);
            fetchData();
            setActiveTab('contracts');
          }}
        />
      )}
    </div>
  );
};
