import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PublicProjectDto } from '@gov-platform/shared';
import { GisMap } from '../components/GisMap';
import {
  Globe,
  Search,
  Building2,
  MapPin,
  MessageSquare,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const PublicCitizenPortal: React.FC = () => {
  const [projects, setProjects] = useState<PublicProjectDto[]>([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  // Feedback Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [citizenName, setCitizenName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [feedbackType, setFeedbackType] = useState<'INQUIRY' | 'DEFECT_REPORT' | 'APPRECIATION' | 'GRIEVANCE'>('DEFECT_REPORT');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicProjects();
  }, [district]);

  const fetchPublicProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getPublicProjects({ district, search });
      setProjects(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load public projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPublicProjects();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !citizenName || !subject || !details) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitCitizenFeedback({
        projectId: selectedProjectId,
        citizenName,
        contactPhone,
        feedbackType,
        subject,
        details,
      });

      setSuccessMsg('Thank you! Your citizen report / feedback has been lodged in the public transparency portal.');
      setSubject('');
      setDetails('');
      setTimeout(() => setSuccessMsg(null), 5000);
      setShowFeedbackModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const gisMarkers = projects.map((p) => ({
    id: p.id,
    projectCode: p.projectCode,
    name: p.name,
    departmentCode: 'R&B',
    departmentName: p.departmentName,
    status: p.status as any,
    currentStage: p.currentStage,
    district: p.district,
    taluka: p.taluka,
    latitude: p.latitude || 23.0225,
    longitude: p.longitude || 72.5714,
    estimatedCostInr: p.sanctionedCostInr || 10000000,
    sanctionedCostInr: p.sanctionedCostInr,
    physicalProgressPct: p.physicalProgressPct,
    financialProgressPct: p.financialProgressPct,
    executingOfficeName: 'State PWD Division',
    projectManagerName: 'Nodal Executive Engineer',
  }));

  return (
    <div className="space-y-6">
      {/* Portal Header */}
      <div className="flex items-center justify-between border-b border-gov-border pb-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-800 text-white shadow">
            <Globe className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">State Public Disclosure</div>
            <h1 className="text-xl font-extrabold text-gov-navy">Citizen Public Transparency & Infrastructure Portal</h1>
            <p className="text-xs text-slate-500">
              Open Access Public Scrutiny, Real-Time Physical & Financial Progress Disclosure, and Citizen Grievance Redressal
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFeedbackModal(true)}
          className="flex items-center gap-1.5 rounded bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Lodge Citizen Feedback / Report</span>
        </button>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Public Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 rounded-lg border border-gov-border bg-white p-3 shadow-sm text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search public infrastructure work by Project ID or Title..."
            className="w-full rounded border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-gov-blue focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-600">District:</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
          >
            <option value="">All Districts Statewide</option>
            <option value="Ahmedabad">Ahmedabad</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Surat">Surat</option>
            <option value="Vadodara">Vadodara</option>
            <option value="Rajkot">Rajkot</option>
            <option value="Mehsana">Mehsana</option>
          </select>
        </div>

        <button
          type="submit"
          className="rounded bg-gov-blue px-4 py-1.5 font-bold text-white shadow hover:bg-gov-navy"
        >
          Search Public Registry
        </button>
      </form>

      {/* Public GIS Infrastructure Explorer */}
      <div className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-bold text-gov-navy text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <MapPin className="h-4 w-4 text-amber-500" /> Public GIS Infrastructure Map ({projects.length} Works)
        </h3>

        <div className="h-[380px] w-full rounded border border-slate-300 overflow-hidden shadow-inner">
          <GisMap markers={gisMarkers} centerLat={23.0225} centerLng={72.5714} zoom={9} />
        </div>
      </div>

      {/* Public Project Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-gov-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-gov-blue" /> Public Work Order Registry & Progress Disclosure
        </h3>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading public projects...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No public projects found matching query.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded-lg border border-gov-border bg-white p-4 shadow-sm space-y-3 text-xs">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-gov-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.projectCode}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">{p.name}</h4>
                  </div>

                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                    {p.status}
                  </span>
                </div>

                <p className="text-slate-600 line-clamp-2 text-[11px]">{p.shortDescription}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500">Physical Progress:</span>
                    <div className="font-bold text-emerald-700">{p.physicalProgressPct}%</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Financial Progress:</span>
                    <div className="font-bold text-sky-700">{p.financialProgressPct}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>District: <strong className="text-slate-700">{p.district} ({p.taluka})</strong></span>
                  <span>Cost: <strong className="text-emerald-800 font-mono">₹ {((p.sanctionedCostInr || 0) / 10000000).toFixed(2)} Cr</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Citizen Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-gov-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gov-border bg-emerald-900 px-5 py-4 text-white">
              <div className="flex items-center gap-2 font-bold text-sm">
                <MessageSquare className="h-5 w-5 text-emerald-300" />
                <span>Submit Citizen Public Feedback & Defect Report</span>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="rounded p-1 hover:bg-slate-800 text-slate-300">
                ✕
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Select Infrastructure Work <span className="text-red-500">*</span></label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 font-medium"
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
                  <label className="block font-bold text-slate-700">Your Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Rajesh Patel"
                    className="w-full p-2.5 rounded border border-slate-300 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Contact Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98980 12345"
                    className="w-full p-2.5 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Feedback Category</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as any)}
                  className="w-full p-2.5 rounded border border-slate-300 font-bold"
                >
                  <option value="DEFECT_REPORT">Report Construction Defect / Quality Issue</option>
                  <option value="GRIEVANCE">Public Grievance / Delay Complaint</option>
                  <option value="INQUIRY">General Public Inquiry</option>
                  <option value="APPRECIATION">Appreciation / Positive Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Subject Summary <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Surface Pothole formation near Ch. 2+100"
                  className="w-full p-2.5 rounded border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Detailed Description & Field Evidence Notes <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide precise location, landmarks, and observed quality defects..."
                  className="w-full p-2.5 rounded border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="rounded px-4 py-2 border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded bg-emerald-700 px-5 py-2 font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting Report...' : 'Lodge Citizen Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
