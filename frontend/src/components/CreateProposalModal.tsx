import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Check, ArrowRight, ArrowLeft, Building2, MapPin, IndianRupee, Calendar } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProposalModal: React.FC<ModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [projectTypeId, setProjectTypeId] = useState('');
  const [administrativeDepartmentId, setAdministrativeDepartmentId] = useState('');
  const [implementingDepartmentId, setImplementingDepartmentId] = useState('');
  const [executingOfficeId, setExecutingOfficeId] = useState('');
  const [projectOwnerId, setProjectOwnerId] = useState('');
  const [projectManagerId, setProjectManagerId] = useState('');
  const [estimatedCostInr, setEstimatedCostInr] = useState('');
  const [fundingSource, setFundingSource] = useState('STATE_BUDGET');
  const [state] = useState('Gujarat');
  const [district, setDistrict] = useState('Ahmedabad');
  const [taluka, setTaluka] = useState('Dholera');
  const [cityVillage, setCityVillage] = useState('Bavla-Dholera Highway');
  const [latitude, setLatitude] = useState('22.2534');
  const [longitude, setLongitude] = useState('72.1983');
  const [plannedStartDate, setPlannedStartDate] = useState('2026-10-01');
  const [plannedEndDate, setPlannedEndDate] = useState('2028-09-30');

  // Master options
  const [projectTypes, setProjectTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getProjectTypes().then((res) => res.success && setProjectTypes(res.data));
      api.getDepartments().then((res) => {
        if (res.success && res.data.length > 0) {
          setDepartments(res.data);
          setAdministrativeDepartmentId(res.data[0].id);
          setImplementingDepartmentId(res.data[0].id);
        }
      });
      api.getOffices().then((res) => {
        if (res.success && res.data.length > 0) {
          setOffices(res.data);
          setExecutingOfficeId(res.data[0].id);
        }
      });
      api.getUsers().then((res) => {
        if (res.success && res.items.length > 0) {
          setOfficers(res.items);
          setProjectOwnerId(res.items[0].id);
          setProjectManagerId(res.items[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name,
        shortDescription,
        detailedDescription,
        projectTypeId,
        administrativeDepartmentId,
        implementingDepartmentId,
        executingOfficeId,
        projectOwnerId,
        projectManagerId,
        estimatedCostInr: parseFloat(estimatedCostInr),
        fundingSource,
        state,
        district,
        taluka,
        cityVillage,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        plannedStartDate,
        plannedEndDate,
      };

      const res = await api.createProjectProposal(payload);
      if (res.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit project proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-lg border border-gov-border bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gov-border bg-gov-navy px-6 py-4 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gov-gold" />
            <div>
              <h2 className="text-sm font-bold">Propose New Capital Works Project</h2>
              <p className="text-[11px] text-slate-300">
                Logged as: {user?.fullName} ({user?.designation})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-300 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wizard Stepper Header */}
        <div className="flex items-center justify-between border-b border-gov-border bg-slate-50 px-6 py-2.5 text-xs font-semibold text-slate-600">
          <span className={step === 1 ? 'text-gov-blue font-bold' : ''}>1. Identity & Type</span>
          <span>→</span>
          <span className={step === 2 ? 'text-gov-blue font-bold' : ''}>2. Location & Budget</span>
          <span>→</span>
          <span className={step === 3 ? 'text-gov-blue font-bold' : ''}>3. Schedule & Review</span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-xs text-red-700">{error}</div>
          )}

          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name (Official Title) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Four-Laning of Ahmedabad-Dholera Expressway Package II"
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Administrative Department *</label>
                  <select
                    value={administrativeDepartmentId}
                    onChange={(e) => {
                      setAdministrativeDepartmentId(e.target.value);
                      setImplementingDepartmentId(e.target.value);
                    }}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Type Master *</label>
                  <select
                    value={projectTypeId}
                    onChange={(e) => setProjectTypeId(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  >
                    <option value="">Select Project Type</option>
                    {projectTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name} ({pt.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Executing Division Office *</label>
                <select
                  value={executingOfficeId}
                  onChange={(e) => setExecutingOfficeId(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                >
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Owner / Nodal Officer *</label>
                <select
                  value={projectOwnerId}
                  onChange={(e) => {
                    setProjectOwnerId(e.target.value);
                    setProjectManagerId(e.target.value);
                  }}
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.fullName} ({off.designation} - {off.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief summary of civil scope..."
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Technical Scope & Objectives</label>
                <textarea
                  rows={3}
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Detailed engineering objectives, problem statement, expected benefits..."
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-gov-gold" /> Estimated Project Cost (INR in Bytes) *
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedCostInr}
                    onChange={(e) => setEstimatedCostInr(e.target.value)}
                    placeholder="e.g. 450000000 for ₹45 Crore"
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none font-mono"
                  />
                  {estimatedCostInr && (
                    <span className="text-[11px] font-bold text-emerald-700 mt-1 block">
                      Equivalent: ₹ {(parseFloat(estimatedCostInr) / 10000000).toFixed(2)} Crore
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Funding Source *</label>
                  <select
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  >
                    <option value="STATE_BUDGET">State Budget Allocation</option>
                    <option value="CENTRAL_SPONSORED">Central Sponsored Scheme (CSS)</option>
                    <option value="NABARD_RIDF">NABARD RIDF Loan</option>
                    <option value="WORLD_BANK">World Bank Assistance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> District *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taluka *</label>
                  <input
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Village *</label>
                  <input
                    type="text"
                    value={cityVillage}
                    onChange={(e) => setCityVillage(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Latitude Coordinate</label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs font-mono focus:border-gov-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Longitude Coordinate</label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs font-mono focus:border-gov-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Planned Start Date *
                  </label>
                  <input
                    type="date"
                    value={plannedStartDate}
                    onChange={(e) => setPlannedStartDate(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> Planned Completion Date *
                  </label>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={(e) => setPlannedEndDate(e.target.value)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-gov-blue focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded border border-blue-200 bg-blue-50 p-4 space-y-2">
                <div className="font-bold text-blue-900 border-b border-blue-200 pb-1">
                  Proposal Verification Summary:
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-800">
                  <div>
                    <strong>Title:</strong> {name || 'Not specified'}
                  </div>
                  <div>
                    <strong>Estimated Cost:</strong> ₹{' '}
                    {estimatedCostInr ? (parseFloat(estimatedCostInr) / 10000000).toFixed(2) : 0} Crore
                  </div>
                  <div>
                    <strong>District:</strong> {district}, {taluka}
                  </div>
                  <div>
                    <strong>Initial State:</strong> <span className="font-bold text-emerald-700">PROPOSED</span>
                  </div>
                  <div>
                    <strong>Code Auto-Gen:</strong> GJ-RNB-AHM-2026-XXXXXX
                  </div>
                  <div>
                    <strong>Submitting Officer:</strong> {user?.fullName} ({user?.employeeId})
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gov-border bg-slate-50 px-6 py-3">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1 rounded bg-gov-blue px-4 py-1.5 text-xs font-semibold text-white hover:bg-gov-navy"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1 rounded bg-emerald-700 px-5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {loading ? 'Submitting Proposal...' : 'Submit Proposal'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
