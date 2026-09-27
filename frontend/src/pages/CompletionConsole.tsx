import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type {
  CompletionCertificateDto,
  DlpDefectDto,
  AssetHandoverDto,
} from '@gov-platform/shared';
import { IssueCompletionCertificateModal } from '../components/IssueCompletionCertificateModal';
import {
  Award,
  ShieldCheck,
  Building2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Landmark,
} from 'lucide-react';

export const CompletionConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'certificates' | 'dlp' | 'guarantee' | 'assets'>('certificates');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [certificates, setCertificates] = useState<CompletionCertificateDto[]>([]);
  const [dlpDefects, setDlpDefects] = useState<DlpDefectDto[]>([]);
  const [assetHandovers, setAssetHandovers] = useState<AssetHandoverDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchCompletionData(selectedProjectId);
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

  const fetchCompletionData = async (projId?: string) => {
    setLoading(true);
    try {
      const [cRes, dRes, aRes] = await Promise.all([
        api.getCompletionCertificates(projId || undefined),
        api.getDlpDefects(projId || undefined),
        api.getAssetHandovers(projId || undefined),
      ]);

      setCertificates(cRes.data || []);
      setDlpDefects(dRes.data || []);
      setAssetHandovers(aRes.data || []);
    } catch (err) {
      console.error('Failed to load completion data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRectifyDefect = async (defectId: string) => {
    const notes = prompt('Enter Inspection Officer Verification Notes:', 'Defect rectified and re-inspected on site.');
    if (!notes) return;

    try {
      await api.rectifyDlpDefect(defectId, notes);
      fetchCompletionData(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to rectify DLP defect');
    }
  };

  const handleReleaseGuarantee = async (projectId: string) => {
    try {
      await api.releaseGuarantee({
        projectId,
        guaranteeType: 'BOTH',
        executiveEngineerSignOff: true,
        superintendingEngineerSignOff: true,
        remarks: 'DLP warranty successfully completed with zero active defects. Guarantee released.',
      });
      alert('Retention Security Deposit & PBG release cleared by EE and SE!');
      fetchCompletionData(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to release security guarantee');
    }
  };

  const handleHandoverAsset = async (projectId: string, name: string) => {
    const dept = prompt('Enter Receiving State Department / Authority:', 'Roads & Buildings Department (O&M Division)');
    if (!dept) return;

    try {
      await api.completeAssetHandover({
        projectId,
        assetName: name,
        receivingDepartment: dept,
        assetValuationInr: 100000000,
        maintenanceDivision: 'Ahmedabad Highway Maintenance Division 01',
      });
      alert('State Infrastructure Asset Handover completed and project closed successfully!');
      fetchCompletionData(selectedProjectId);
    } catch (err: any) {
      alert(err.message || 'Failed to complete asset handover');
    }
  };

  const activeDefects = dlpDefects.filter((d) => !d.isRectified);

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-600 text-white shadow">
            <Award className="h-5 w-5 text-amber-200" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gov-navy">Project Completion, DLP Warranty & Asset Handover Console</h1>
            <p className="text-xs text-slate-500">
              Provisional & Final Completion Certification, Defect Liability Period (DLP 12-36 Months), Security Deposit Release & State Asset Registration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center gap-1.5 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Issue Completion Certificate</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Completion Certificates Issued</div>
          <div className="mt-1 text-2xl font-bold text-gov-navy">{certificates.length}</div>
          <div className="mt-1 text-[11px] text-emerald-600">PCC / FCC Verification</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Active DLP Warranty Defects</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{activeDefects.length}</div>
          <div className="mt-1 text-[11px] text-slate-500">Mandatory Contractor Rectification</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Retention Deposit Sign-offs</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">Dual EE / SE</div>
          <div className="mt-1 text-[11px] text-slate-500">5% Retention & PBG Clearance</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Registered State Assets</div>
          <div className="mt-1 text-2xl font-bold text-gov-blue">{assetHandovers.length}</div>
          <div className="mt-1 text-[11px] text-slate-500">Transferred to State O&M Register</div>
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

      {/* Faceted Navigation Tabs */}
      <div className="border-b border-gov-border">
        <nav className="-mb-px flex gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'certificates'
                ? 'border-amber-600 text-amber-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="h-4 w-4 text-amber-600" />
            <span>Completion Certificates ({certificates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('dlp')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'dlp'
                ? 'border-red-600 text-red-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>DLP Warranty Defect Tickets ({dlpDefects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guarantee')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'guarantee'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Retention & PBG Release Clearance</span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 border-b-2 py-2.5 transition-colors ${
              activeTab === 'assets'
                ? 'border-gov-blue text-gov-blue font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Landmark className="h-4 w-4 text-gov-blue" />
            <span>State Asset Register & Handover ({assetHandovers.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Completion Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading completion certificates...</div>
          ) : certificates.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No completion certificates issued yet.
            </div>
          ) : (
            certificates.map((c) => (
              <div key={c.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gov-navy">{c.projectCode}</span>
                      <span className="text-slate-500">• {c.projectName}</span>
                      <span className="rounded bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 border border-amber-300 font-mono">
                        {c.certificateNumber}
                      </span>
                    </div>
                    <h3 className="mt-1 font-bold text-slate-900 text-sm">Certificate: {c.certificateType} COMPLETION</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-xs font-bold border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Physical Progress 100%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <div className="text-[10px] text-slate-500">Issue Date:</div>
                    <div className="font-bold text-slate-800">{new Date(c.issueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">DLP Warranty Window:</div>
                    <div className="font-bold text-emerald-700">{c.dlpDurationMonths} Months ({new Date(c.dlpStartDate).toLocaleDateString()} - {new Date(c.dlpEndDate).toLocaleDateString()})</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Issued By Officer:</div>
                    <div className="font-bold text-slate-800">{c.issuedByName}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">{c.remarks}</p>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleReleaseGuarantee(c.projectId)}
                    className="rounded bg-emerald-700 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-800 flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Sign-off Guarantee Release
                  </button>
                  <button
                    onClick={() => handleHandoverAsset(c.projectId, c.projectName)}
                    className="rounded bg-gov-navy px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 flex items-center gap-1"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Handover to State Asset Register
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: DLP Warranty Defect Tickets */}
      {activeTab === 'dlp' && (
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading DLP defects...</div>
          ) : dlpDefects.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              No DLP warranty defects logged.
            </div>
          ) : (
            dlpDefects.map((d) => (
              <div key={d.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gov-navy">{d.projectCode}</span>
                      <span className="rounded bg-red-100 text-red-700 font-bold text-[10px] px-2 py-0.5">
                        Severity: {d.severity}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{d.defectTitle}</h4>
                  </div>

                  <div>
                    {d.isRectified ? (
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-xs font-bold border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> RECTIFIED & VERIFIED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRectifyDefect(d.id)}
                        className="rounded bg-red-600 px-3 py-1 font-bold text-white text-xs hover:bg-red-700 shadow"
                      >
                        Verify Rectification
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-slate-700">{d.description}</p>

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Location Ref: <strong className="text-slate-700">{d.locationRef}</strong></span>
                  <span>Reported By: {d.reportedByName} ({new Date(d.reportedDate).toLocaleDateString()})</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Guarantee Release Clearance */}
      {activeTab === 'guarantee' && (
        <div className="rounded-lg border border-gov-border bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" /> Retention Money (5%) & Performance Bank Guarantee (PBG) Dual Clearance Gate
          </h3>
          <p className="text-slate-600 leading-relaxed">
            Statutory dual digital sign-off from Executive Engineer (EE) and Superintending Engineer (SE) required prior to releasing 5% retention deposit and PBG post DLP expiration.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Executive Engineer (EE) Verification
              </div>
              <p className="text-slate-600 text-[11px]">
                Inspects physical site, verifies zero active unrectified defect tickets, and signs off on contractor warranty fulfillment.
              </p>
            </div>

            <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Superintending Engineer (SE) Approval
              </div>
              <p className="text-slate-600 text-[11px]">
                Validates financial expenditure ledger and authorizes Treasury release advice for Retention Deposit and PBG refund.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: State Asset Handover Register */}
      {activeTab === 'assets' && (
        <div className="rounded-lg border border-gov-border bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
            <Landmark className="h-5 w-5 text-gov-blue" /> State Infrastructure Asset Register & Handover Logs
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Asset Code</th>
                  <th className="p-3">Asset Name</th>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Receiving Department</th>
                  <th className="p-3 text-right">Asset Valuation</th>
                  <th className="p-3">O&M Maintenance Division</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assetHandovers.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-gov-blue">{a.assetCode}</td>
                    <td className="p-3 font-bold text-slate-800">{a.assetName}</td>
                    <td className="p-3 font-semibold text-slate-600">{a.projectCode}</td>
                    <td className="p-3">{a.receivingDepartment}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800">
                      ₹ {(a.assetValuationInr / 10000000).toFixed(2)} Cr
                    </td>
                    <td className="p-3 text-slate-600">{a.maintenanceDivision}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                        {a.handoverStatus}
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
      {showCertModal && (
        <IssueCompletionCertificateModal
          onClose={() => setShowCertModal(false)}
          onSuccess={() => fetchCompletionData(selectedProjectId)}
        />
      )}
    </div>
  );
};
