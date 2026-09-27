import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { BudgetSanctionDto, ExpenditureDto } from '@gov-platform/shared';
import { CreateRaBillModal } from '../components/CreateRaBillModal';
import {
  Building2,
  Plus,
  Receipt,
  Landmark,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const FinancialsConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bills' | 'sanctions' | 'ledger'>('bills');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [sanctions, setSanctions] = useState<BudgetSanctionDto[]>([]);
  const [bills, setBills] = useState<ExpenditureDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRaBillModal, setShowRaBillModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchFinancialData(selectedProjectId);
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects({ page: 1 });
      if (res.items && res.items.length > 0) {
        setProjects(res.items);
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const fetchFinancialData = async (projId?: string) => {
    setLoading(true);
    try {
      const [sRes, bRes] = await Promise.all([
        api.getBudgetSanctions(projId || undefined),
        api.getExpenditures(projId || undefined),
      ]);

      setSanctions(sRes.data || []);
      setBills(bRes.data || []);
    } catch (err) {
      console.error('Failed to load financial data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisbursePayment = async (expenditureId: string) => {
    const treasuryNo = prompt('Enter Treasury Voucher Disbursement Reference Number:', `TV-TREASURY-${Date.now().toString().slice(-6)}`);
    if (!treasuryNo) return;

    try {
      await api.disbursePayment(expenditureId, {
        treasuryVoucherNo: treasuryNo,
        disbursementMode: 'PFMS_DIRECT_DISBURSEMENT',
        remarks: 'State Cyber Treasury E-Payment Advice Executed',
      });
      fetchFinancialData(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to disburse treasury payment');
    }
  };

  const totalGrossBills = bills.reduce((sum, b) => sum + b.grossClaimAmountInr, 0);
  const totalNetDisbursed = bills.reduce((sum, b) => sum + b.netPayableAmountInr, 0);
  const totalDeductions = bills.reduce((sum, b) => sum + b.totalDeductionsInr, 0);

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-800 text-white shadow">
            <Landmark className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gov-navy">State Financials, RA Bills & Treasury Disbursement Command</h1>
            <p className="text-xs text-slate-500">
              Measurement Book (MB) Billing, Statutory Tax Deductions (TDS/GST-TDS/Retention/Cess) & Treasury Voucher Ledger
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaBillModal(true)}
            className="flex items-center gap-1.5 rounded bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-800"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Generate Contractor RA Bill</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Gross RA Bills Claimed</div>
          <div className="mt-1 text-2xl font-bold text-gov-navy">₹ {(totalGrossBills / 10000000).toFixed(2)} Cr</div>
          <div className="mt-1 text-[11px] text-slate-500">{bills.length} Running Account Vouchers</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Net Disbursed Payout</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">₹ {(totalNetDisbursed / 10000000).toFixed(2)} Cr</div>
          <div className="mt-1 text-[11px] text-emerald-600">Treasury E-Payment Advice</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Statutory Tax & Retention Deductions</div>
          <div className="mt-1 text-2xl font-bold text-amber-700">₹ {(totalDeductions / 100000).toFixed(2)} Lakhs</div>
          <div className="mt-1 text-[11px] text-slate-500">IT-TDS (2%) + GST-TDS (2%) + Retention (5%) + Cess (1%)</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Sanction Orders Registered</div>
          <div className="mt-1 text-2xl font-bold text-gov-blue">{sanctions.length}</div>
          <div className="mt-1 text-[11px] text-slate-500">FY 2026-2027 Allocation Orders</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-lg border border-gov-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <Building2 className="h-4 w-4 text-slate-400" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
          >
            <option value="">All Projects Statewide ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode} - {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Faceted Tab Switcher */}
      <div className="border-b border-gov-border">
        <nav className="-mb-px flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'bills'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="h-4 w-4 text-emerald-600" />
            <span>Contractor Running Account (RA) Bills ({bills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sanctions')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'sanctions'
                ? 'border-gov-blue text-gov-blue font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="h-4 w-4 text-gov-blue" />
            <span>Budget Sanctions & Head of Account ({sanctions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'ledger'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <span>Treasury Disbursement Ledger</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Contractor Running Account (RA) Bills */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading contractor RA bills...</div>
          ) : bills.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No contractor RA bills generated.
            </div>
          ) : (
            bills.map((b) => (
              <div key={b.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gov-navy">{b.projectCode}</span>
                      <span className="text-slate-500">• {b.projectName}</span>
                      <span className="rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2 py-0.5 border border-emerald-200 font-mono">
                        Voucher #{b.voucherNo}
                      </span>
                    </div>
                    <h3 className="mt-1 font-bold text-slate-900 text-sm">Payee: {b.payeeName}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Net Payable Claim</div>
                      <div className="text-lg font-extrabold text-emerald-700 font-mono">
                        ₹ {b.netPayableAmountInr.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDisbursePayment(b.id)}
                      className="rounded bg-emerald-600 px-3 py-1.5 font-bold text-white text-xs hover:bg-emerald-700 shadow flex items-center gap-1"
                    >
                      <ShieldCheck className="w-4 h-4" /> Disburse Treasury Advice
                    </button>
                  </div>
                </div>

                {/* Tax Breakdown Matrix */}
                <div className="grid grid-cols-5 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500">Gross Claim:</div>
                    <div className="font-bold text-slate-800">₹ {b.grossClaimAmountInr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">IT TDS (2%):</div>
                    <div className="font-semibold text-red-700">₹ {b.itTdsInr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">GST TDS (2%):</div>
                    <div className="font-semibold text-red-700">₹ {b.gstTdsInr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Retention (5%):</div>
                    <div className="font-semibold text-amber-700">₹ {b.retentionInr.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Labour Cess (1%):</div>
                    <div className="font-semibold text-red-700">₹ {b.labourCessInr.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Measurement Book Ref: <strong className="text-slate-700 font-mono">{b.measurementBookRef}</strong></span>
                  <span>Head of Account: <strong className="text-slate-700 font-mono">{b.headOfAccount}</strong></span>
                  <span>Date: {new Date(b.voucherDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Budget Sanctions */}
      {activeTab === 'sanctions' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading budget sanctions...</div>
          ) : sanctions.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No budget sanctions recorded.
            </div>
          ) : (
            sanctions.map((s) => (
              <div key={s.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="font-bold text-gov-navy">{s.projectCode} - {s.projectName}</div>
                    <div className="text-slate-500">Sanction Order: <strong className="text-slate-800">{s.orderNumber}</strong> ({s.sanctionType})</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-800 font-mono">₹ {(s.sanctionAmount / 10000000).toFixed(2)} Cr</div>
                    <div className="text-[10px] text-slate-400">FY {s.financialYear}</div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Head of Account: <strong className="font-mono text-gov-blue">{s.headOfAccount}</strong></span>
                  <span>Order Date: {new Date(s.orderDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Treasury Disbursement Ledger */}
      {activeTab === 'ledger' && (
        <div className="rounded-lg border border-gov-border bg-white p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" /> Statewide Treasury E-Payment Advice & Financial Audit Trail
          </h3>
          <p className="text-xs text-slate-600">
            Real-time integration with State Cyber Treasury for direct contractor bank account credit and statutory tax remittance.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Voucher Ref</th>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Payee Contractor</th>
                  <th className="p-3">Head of Account</th>
                  <th className="p-3 text-right">Gross Claim</th>
                  <th className="p-3 text-right">Deductions</th>
                  <th className="p-3 text-right">Net Payout</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-gov-navy">{b.voucherNo}</td>
                    <td className="p-3 font-semibold text-slate-800">{b.projectCode}</td>
                    <td className="p-3">{b.payeeName}</td>
                    <td className="p-3 font-mono text-[11px]">{b.headOfAccount}</td>
                    <td className="p-3 text-right font-mono">₹ {b.grossClaimAmountInr.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono text-red-700">₹ {b.totalDeductionsInr.toLocaleString()}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ {b.netPayableAmountInr.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                        DISBURSED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showRaBillModal && (
        <CreateRaBillModal
          onClose={() => setShowRaBillModal(false)}
          onSuccess={() => fetchFinancialData(selectedProjectId)}
        />
      )}
    </div>
  );
};
