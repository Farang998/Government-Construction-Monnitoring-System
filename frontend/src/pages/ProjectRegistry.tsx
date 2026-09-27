import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CreateProposalModal } from '../components/CreateProposalModal';
import {
  Search,
  Plus,
  Filter,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface ProjectItem {
  id: string;
  projectCode: string;
  name: string;
  shortDescription: string;
  projectTypeCode: string;
  projectTypeName: string;
  departmentCode: string;
  departmentName: string;
  status: string;
  currentStage: string;
  district: string;
  cityVillage: string;
  estimatedCostInr: number;
  physicalProgressPct: number;
  financialProgressPct: number;
  plannedProgressPct: number;
  scheduleVariancePct: number;
  plannedStartDate: string;
  plannedEndDate: string;
}

export const ProjectRegistry: React.FC<{ onSelectProject: (id: string) => void }> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = () => {
    setLoading(true);
    api
      .getProjects({
        search,
        departmentId: selectedDept,
        projectTypeId: selectedType,
        status: selectedStatus,
        district: selectedDistrict,
      })
      .then((res) => {
        if (res.success) {
          setProjects(res.items);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getDepartments().then((res) => res.success && setDepartments(res.data));
    api.getProjectTypes().then((res) => res.success && setProjectTypes(res.data));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [search, selectedDept, selectedType, selectedStatus, selectedDistrict]);

  const formatCurrency = (amount: number) => {
    if (!amount) return '₹ 0';
    if (amount >= 10000000) return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹ ${(amount / 100000).toFixed(2)} L`;
    return `₹ ${amount.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROPOSED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'UNDER_SCRUTINY':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'TECHNICAL_SANCTIONED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'IN_EXECUTION':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'COMPLETION_CERTIFIED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gov-border pb-4">
        <div>
          <h1 className="text-lg font-bold text-gov-navy">State Infrastructure Project Registry</h1>
          <p className="text-xs text-slate-500">
            Centralized master project catalog, immutable IDs, physical/financial progress & status transitions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded bg-gov-blue px-4 py-2 text-xs font-bold text-white shadow hover:bg-gov-navy"
        >
          <Plus className="h-4 w-4" /> Propose New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-gov-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Project Code, Name, District..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gov-border py-1.5 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="rounded border border-gov-border bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-gov-blue focus:outline-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded border border-gov-border bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-gov-blue focus:outline-none"
          >
            <option value="">All Project Types</option>
            {projectTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded border border-gov-border bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-gov-blue focus:outline-none"
          >
            <option value="">All Districts</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Surat">Surat</option>
            <option value="Rajkot">Rajkot</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded border border-gov-border bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-gov-blue focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PROPOSED">PROPOSED</option>
            <option value="UNDER_SCRUTINY">UNDER_SCRUTINY</option>
            <option value="TECHNICAL_SANCTIONED">TECHNICAL_SANCTIONED</option>
            <option value="IN_EXECUTION">IN_EXECUTION</option>
            <option value="COMPLETION_CERTIFIED">COMPLETION_CERTIFIED</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total Projects: <strong className="text-slate-800">{projects.length}</strong>
        </div>
      </div>

      {/* Projects Data Table */}
      <div className="overflow-hidden rounded border border-gov-border bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-gov-border">
            <tr>
              <th className="px-4 py-3">Project Identity & Name</th>
              <th className="px-4 py-3">Department & Type</th>
              <th className="px-4 py-3">District & Location</th>
              <th className="px-4 py-3">Est. Cost</th>
              <th className="px-4 py-3">Physical %</th>
              <th className="px-4 py-3">Status & Stage</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  Loading project registry...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No projects found matching the filter criteria.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-[11px] font-bold text-gov-blue">{p.projectCode}</div>
                    <div className="font-bold text-slate-800 line-clamp-1 max-w-xs">{p.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {p.plannedStartDate} to {p.plannedEndDate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{p.departmentName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{p.projectTypeName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{p.district}</div>
                    <div className="text-[11px] text-slate-500">{p.cityVillage}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 font-mono">
                    {formatCurrency(p.estimatedCostInr)}
                  </td>
                  <td className="px-4 py-3 w-36">
                    <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                      <span>{p.physicalProgressPct}%</span>
                      <span className="text-[10px] text-slate-400">Target {p.plannedProgressPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full ${
                          p.scheduleVariancePct < -5
                            ? 'bg-red-500'
                            : p.physicalProgressPct >= 100
                            ? 'bg-purple-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, p.physicalProgressPct))}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        p.status,
                      )}`}
                    >
                      {p.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">{p.currentStage}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectProject(p.id)}
                      className="flex items-center gap-1 rounded border border-gov-border bg-white px-2.5 py-1 text-[11px] font-semibold text-gov-blue hover:bg-gov-lightBlue"
                    >
                      <span>View</span> <ExternalLink className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchProjects()}
      />
    </div>
  );
};
