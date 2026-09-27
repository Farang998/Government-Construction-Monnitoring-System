import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Search, UserCheck, ShieldCheck, Award, Building, Filter } from 'lucide-react';

interface UserItem {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  office: string;
  district: string;
  designation: string;
  hierarchyLevel: number;
  approvalLimitInr: number;
  role: string;
  isActive: boolean;
}

export const UserDirectory: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    api.getDepartments().then((res) => {
      if (res.success) setDepartments(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .getUsers({ search, departmentId: selectedDepartment })
      .then((res) => {
        if (res.success) {
          setUsers(res.items);
        }
      })
      .finally(() => setLoading(false));
  }, [search, selectedDepartment]);

  const formatLimit = (limit: number) => {
    if (limit === 0) return 'No Signing Limit';
    if (limit >= 10000000) return `₹ ${(limit / 10000000).toFixed(0)} Crore`;
    if (limit >= 100000) return `₹ ${(limit / 100000).toFixed(0)} Lakhs`;
    return `₹ ${limit.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gov-border pb-4">
        <div>
          <h1 className="text-lg font-bold text-gov-navy">Government Officer & User Directory</h1>
          <p className="text-xs text-slate-500">
            Multi-tiered user catalog, statutory financial limits, and active jurisdictions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
            RBAC + ABAC Active
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-gov-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gov-border py-1.5 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong className="text-slate-800">{users.length}</strong> registered officers
        </div>
      </div>

      {/* High Density Data Table */}
      <div className="overflow-hidden rounded border border-gov-border bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-gov-border">
            <tr>
              <th className="px-4 py-3">Officer Details</th>
              <th className="px-4 py-3">Designation & Rank</th>
              <th className="px-4 py-3">Office & Jurisdiction</th>
              <th className="px-4 py-3">Statutory Signing Limit</th>
              <th className="px-4 py-3">Role & ABAC Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  Loading user directory...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No officers found matching the filter criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gov-navy">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">
                      ID: <span className="font-mono text-slate-700">{u.employeeId}</span> | {u.email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-gov-gold shrink-0" />
                      <span className="font-semibold text-slate-800">{u.designation}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Rank Level: {u.hierarchyLevel}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-800 font-medium">{u.office}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {u.department} ({u.district})
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span
                      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold ${
                        u.approvalLimitInr >= 100000000
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : u.approvalLimitInr >= 10000000
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : u.approvalLimitInr > 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {formatLimit(u.approvalLimitInr)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-300">
                        <ShieldCheck className="h-3 w-3 text-gov-blue" />
                        {u.role}
                      </span>
                      {u.isActive && (
                        <span title="Account Active">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
