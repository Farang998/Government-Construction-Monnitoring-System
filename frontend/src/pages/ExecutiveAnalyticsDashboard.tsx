import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ExecutiveAnalyticsDto } from '@gov-platform/shared';
import {
  FileSpreadsheet,
  Download,
  Building2,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ExecutiveAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<ExecutiveAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aRes, pRes] = await Promise.all([
        api.getExecutiveAnalytics(),
        api.getProjects({ page: 1 }),
      ]);
      setAnalytics(aRes.data);
      if (pRes.items) {
        setProjects(pRes.items);
        if (pRes.items.length > 0) setSelectedProjectId(pRes.items[0].id);
      }
    } catch (err) {
      console.error('Failed to load executive analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDossier = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await api.getProjectDossier(selectedProjectId);
      const jsonStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_Dossier_${res.data.projectSummary?.code || 'Export'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download project dossier');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Compiling statewide executive analytics...</div>;
  }

  const COLORS = ['#1e3a8a', '#0284c7', '#059669', '#d97706', '#dc2626', '#7c3aed'];

  const districtChartData = (analytics?.districtMetrics || []).map((d) => ({
    name: d.district,
    expenditureCr: parseFloat((d.expenditureInr / 10000000).toFixed(2)),
    physicalProgressPct: d.avgPhysicalProgressPct,
  }));

  const deptChartData = (analytics?.departmentMetrics || []).map((d) => ({
    name: d.departmentCode,
    sanctionedCr: parseFloat((d.sanctionedCostInr / 10000000).toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gov-blue text-white shadow">
            <FileSpreadsheet className="h-5 w-5 text-sky-200" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gov-navy">State Infrastructure Executive Command Dashboard</h1>
            <p className="text-xs text-slate-500">
              Statewide Financial Allocation, District Physical Progress Heatmaps & Executive Dossier Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded border border-slate-300 p-1.5 text-xs font-semibold focus:border-gov-blue focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.projectCode} - {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownloadDossier}
            className="flex items-center gap-1.5 rounded bg-gov-navy px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Project Dossier</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Sanctioned Budget</div>
          <div className="mt-1 text-2xl font-bold text-gov-navy">
            ₹ {((analytics?.totalSanctionedCostInr || 0) / 10000000).toFixed(2)} Cr
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{analytics?.totalProjects || 0} Registered Projects</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Treasury Expenditure</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            ₹ {((analytics?.totalExpenditureInr || 0) / 10000000).toFixed(2)} Cr
          </div>
          <div className="mt-1 text-[11px] text-emerald-600">Financial Progress: {analytics?.avgFinancialProgressPct}%</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Average Physical Progress</div>
          <div className="mt-1 text-2xl font-bold text-sky-700">{analytics?.avgPhysicalProgressPct}%</div>
          <div className="mt-1 text-[11px] text-slate-500">Weighted Milestone Progress</div>
        </div>

        <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Active High Severity Escalations</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{analytics?.activeEscalationsCount || 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">SLA Gate Monitoring</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* District Expenditure Bar Chart */}
        <div className="rounded-lg border border-gov-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gov-blue" /> District-Wise Expenditure Distribution (₹ Cr)
            </h3>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`₹ ${value} Crore`, 'Expenditure']} />
                <Bar dataKey="expenditureCr" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Budget Allocation Pie Chart */}
        <div className="rounded-lg border border-gov-border bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-emerald-600" /> Department-Wise Budget Allocation (₹ Cr)
            </h3>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptChartData}
                  dataKey="sanctionedCr"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.name}: ₹${entry.sanctionedCr} Cr`}
                >
                  {deptChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`₹ ${val} Cr`, 'Sanctioned Budget']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Metrics Data Table */}
      <div className="rounded-lg border border-gov-border bg-white p-5 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-gov-navy text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gov-blue" /> District Infrastructure Performance Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">District</th>
                <th className="p-3 text-center">Projects Count</th>
                <th className="p-3 text-right">Total Expenditure</th>
                <th className="p-3 text-center">Avg Physical Progress</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(analytics?.districtMetrics || []).map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{d.district}</td>
                  <td className="p-3 text-center font-semibold">{d.projectCount}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    ₹ {(d.expenditureInr / 10000000).toFixed(2)} Cr
                  </td>
                  <td className="p-3 text-center font-bold text-sky-700">{d.avgPhysicalProgressPct}%</td>
                  <td className="p-3 text-center">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-300">
                      ON TRACK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
