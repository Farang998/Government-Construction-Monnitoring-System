import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { UserDirectory } from './pages/UserDirectory';
import {
  Building2,
  FileCheck2,
  GitPullRequest,
  LayoutDashboard,
  MapPin,
  ScrollText,
  ShieldAlert,
  Sliders,
  FileSpreadsheet,
  Bell,
  Search,
  UserCheck,
  LogOut,
  Users,
  IndianRupee,
  Award,
  Globe,
} from 'lucide-react';

const DashboardContent: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}> = ({ currentPage, onNavigate, selectedProjectId, onSelectProject }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gov-surface font-sans text-gov-darkSlate">
      {/* Sidebar Navigation */}
      <aside className="flex w-64 flex-col border-r border-gov-border bg-gov-navy text-white shrink-0">
        <div className="flex h-16 items-center gap-3 border-b border-blue-900/50 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-gov-gold font-bold text-gov-navy">
            🏛️
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">State Infrastructure</div>
            <div className="text-sm font-bold text-white">Works Monitoring</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'dashboard' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('projects')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'projects' || currentPage === 'project_detail'
                ? 'bg-gov-blue text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Project Registry</span>
            <span className="ml-auto rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
              Phase 2
            </span>
          </button>

          <button
            onClick={() => onNavigate('directory')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'directory' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 text-gov-gold" />
            <span>User & Org Directory</span>
          </button>
          <button
            onClick={() => onNavigate('approvals')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'approvals' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileCheck2 className="h-4 w-4 text-emerald-400" />
            <span>Workflow & Approvals</span>
            <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Phase 3</span>
          </button>
          <button
            onClick={() => onNavigate('contracts')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'contracts' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ScrollText className="h-4 w-4 text-indigo-400" />
            <span>Contracts & Tenders</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 4</span>
          </button>
          <button
            onClick={() => onNavigate('monitoring')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'monitoring' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GitPullRequest className="h-4 w-4 text-sky-400" />
            <span>Site & Quality Monitoring</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 5</span>
          </button>
          <button
            onClick={() => onNavigate('gis')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'gis' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapPin className="h-4 w-4 text-amber-400" />
            <span>GIS Map Explorer</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 6</span>
          </button>
          <button
            onClick={() => onNavigate('risks')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'risks' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>Delays & Escalations</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 7</span>
          </button>
          <button
            onClick={() => onNavigate('financials')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'financials' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            <span>Financials & RA Bills</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 8</span>
          </button>
          <button
            onClick={() => onNavigate('completion')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'completion' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4 text-amber-400" />
            <span>Completion & DLP</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 9</span>
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'analytics' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-sky-400" />
            <span>Executive Analytics & Dossiers</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 10</span>
          </button>
          <button
            onClick={() => onNavigate('public')}
            className={`flex w-full items-center gap-3 rounded px-3 py-2 ${
              currentPage === 'public' ? 'bg-gov-blue text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Globe className="h-4 w-4 text-emerald-400" />
            <span>Public Citizen Portal</span>
            <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">Phase 10</span>
          </button>
          <a href="#admin" className="flex items-center gap-3 rounded px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white">
            <Sliders className="h-4 w-4" />
            <span>Administration</span>
          </a>
        </nav>

        {/* User Identity Context Card */}
        <div className="border-t border-blue-900/50 p-3 bg-slate-900/80">
          <div className="flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-white truncate max-w-[140px]">{user?.fullName}</div>
              <div className="text-[10px] text-gov-gold">{user?.designation}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5">
            <span>Limit:</span>
            <span className="font-bold text-emerald-400">
              {user?.financialApprovalLimitInr && user.financialApprovalLimitInr >= 10000000
                ? `₹ ${(user.financialApprovalLimitInr / 10000000).toFixed(0)} Cr`
                : user?.financialApprovalLimitInr
                ? `₹ ${(user.financialApprovalLimitInr / 100000).toFixed(0)} L`
                : '₹0'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-gov-border bg-white px-6">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Project ID, Name, Department, District..."
                className="w-full rounded border border-gov-border py-1.5 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative rounded p-1.5 text-slate-600 hover:bg-slate-100" title="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-600"></span>
            </button>

            <div className="flex items-center gap-3 border-l border-gov-border pl-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gov-navy text-xs font-bold text-white">
                {user?.fullName.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-gov-darkSlate">{user?.fullName}</div>
                <div className="text-[11px] text-slate-500">{user?.office}</div>
              </div>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
        </header>

        {/* Dynamic Inner View */}
        <main className="flex-1 overflow-y-auto p-6">
          <MainView
            currentPage={currentPage}
            onNavigate={onNavigate}
            selectedProjectId={selectedProjectId}
            onSelectProject={onSelectProject}
          />
        </main>
      </div>
    </div>
  );
};

import { ProjectRegistry } from './pages/ProjectRegistry';
import { ProjectDetail } from './pages/ProjectDetail';
import { ApprovalInbox } from './pages/ApprovalInbox';
import { TendersAndContracts } from './pages/TendersAndContracts';
import { SiteMonitoring } from './pages/SiteMonitoring';
import { GisExplorer } from './pages/GisExplorer';
import { RiskAndIssueConsole } from './pages/RiskAndIssueConsole';
import { FinancialsConsole } from './pages/FinancialsConsole';
import { CompletionConsole } from './pages/CompletionConsole';
import { ExecutiveAnalyticsDashboard } from './pages/ExecutiveAnalyticsDashboard';
import { PublicCitizenPortal } from './pages/PublicCitizenPortal';

const MainView: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}> = ({ currentPage, onNavigate, selectedProjectId, onSelectProject }) => {
  const { user } = useAuth();

  if (currentPage === 'directory') {
    return <UserDirectory />;
  }

  if (currentPage === 'approvals') {
    return <ApprovalInbox />;
  }

  if (currentPage === 'contracts') {
    return <TendersAndContracts />;
  }

  if (currentPage === 'monitoring') {
    return <SiteMonitoring />;
  }

  if (currentPage === 'gis') {
    return <GisExplorer />;
  }

  if (currentPage === 'risks') {
    return <RiskAndIssueConsole />;
  }

  if (currentPage === 'financials') {
    return <FinancialsConsole />;
  }

  if (currentPage === 'completion') {
    return <CompletionConsole />;
  }

  if (currentPage === 'analytics') {
    return <ExecutiveAnalyticsDashboard />;
  }

  if (currentPage === 'public') {
    return <PublicCitizenPortal />;
  }

  if (currentPage === 'project_detail' && selectedProjectId) {
    return (
      <ProjectDetail
        projectId={selectedProjectId}
        onBack={() => {
          onSelectProject(null);
          onNavigate('projects');
        }}
      />
    );
  }

  if (currentPage === 'projects') {
    return (
      <ProjectRegistry
        onSelectProject={(id) => {
          onSelectProject(id);
          onNavigate('project_detail');
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gov-navy">State Infrastructure Command Dashboard</h1>
          <p className="text-xs text-slate-500">
            Logged in as <strong className="text-slate-800">{user?.fullName}</strong> ({user?.designation}) | Department: {user?.department}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('projects')}
            className="flex items-center gap-1.5 rounded bg-gov-blue px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-gov-navy"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Open Project Registry</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Total Sanctioned Projects</div>
          <div className="mt-1 text-2xl font-bold text-gov-navy">1,428</div>
          <div className="mt-1 text-[11px] text-emerald-600">Across 33 Districts</div>
        </div>
        <div className="rounded border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Sanctioned Value</div>
          <div className="mt-1 text-2xl font-bold text-gov-navy">₹ 14,850 Cr</div>
          <div className="mt-1 text-[11px] text-slate-500">FY 2026-2027 Allocation</div>
        </div>
        <div className="rounded border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Active Construction</div>
          <div className="mt-1 text-2xl font-bold text-gov-blue">894</div>
          <div className="mt-1 text-[11px] text-slate-500">Physical Progress Avg: 58.4%</div>
        </div>
        <div className="rounded border border-gov-border bg-white p-4 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Statutory Signing Power</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {user?.financialApprovalLimitInr && user.financialApprovalLimitInr >= 10000000
              ? `₹ ${(user.financialApprovalLimitInr / 10000000).toFixed(0)} Crore`
              : user?.financialApprovalLimitInr
              ? `₹ ${(user.financialApprovalLimitInr / 100000).toFixed(0)} Lakhs`
              : '₹0'}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Evaluated via ABAC Engine</div>
        </div>
      </div>

      {/* Phase 2 Live Status Notice */}
      <div className="rounded border border-emerald-300 bg-emerald-50 p-5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
          <h3 className="text-sm font-bold text-emerald-900">
            Phase 2 Active: Project Registry & Proposal Core Engine Online
          </h3>
        </div>
        <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
          Central Project Registry active with unique immutable code generator (`GJ-RNB-AHM-2026-XXXXXX`), multi-step proposal wizard, faceted search/filters, and project aggregate views.
        </p>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthShell />
    </AuthProvider>
  );
};

const AuthShell: React.FC = () => {
  const { token, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white text-xs font-semibold">
        Authenticating session against Government Identity Server...
      </div>
    );
  }

  if (!token) {
    return <Login />;
  }

  return (
    <DashboardContent
      currentPage={currentPage}
      onNavigate={(page) => setCurrentPage(page)}
      selectedProjectId={selectedProjectId}
      onSelectProject={(id) => setSelectedProjectId(id)}
    />
  );
};
