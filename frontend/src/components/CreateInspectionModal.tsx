import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ScheduleInspectionInput, InspectionRating } from '@gov-platform/shared';
import { X, HardHat, Camera, Send } from 'lucide-react';

interface CreateInspectionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateInspectionModal: React.FC<CreateInspectionModalProps> = ({ onClose, onSuccess }) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState('');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]!);
  const [overallRating, setOverallRating] = useState<InspectionRating>('SATISFACTORY' as InspectionRating);
  const [findings, setFindings] = useState('');
  const [defectsIdentified, setDefectsIdentified] = useState('');
  const [correctiveMeasures, setCorrectiveMeasures] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('Geo-Tagged Field Quality Inspection Photograph');
  const [evidenceFileUrl, setEvidenceFileUrl] = useState('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80');
  const [latitude, setLatitude] = useState<number>(23.0225);
  const [longitude, setLongitude] = useState<number>(72.5714);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getProjects({ page: 1 }).then((res) => {
      if (res.items) {
        setProjects(res.items);
        if (res.items.length > 0) {
          const p = res.items[0];
          setProjectId(p.id);
          if (p.latitude) setLatitude(Number(p.latitude));
          if (p.longitude) setLongitude(Number(p.longitude));
        }
      }
    }).catch(() => {});
  }, []);

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const p = projects.find((x) => x.id === id);
    if (p) {
      if (p.latitude) setLatitude(Number(p.latitude));
      if (p.longitude) setLongitude(Number(p.longitude));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError('Please select a target project for inspection');
      return;
    }
    if (!findings.trim()) {
      setError('Official auditor findings notes are mandatory.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const input: ScheduleInspectionInput = {
        projectId,
        inspectionDate,
        overallRating,
        findings,
        defectsIdentified: defectsIdentified || undefined,
        correctiveMeasures: correctiveMeasures || undefined,
        evidenceTitle,
        evidenceFileUrl,
        latitude,
        longitude,
      };

      await api.createInspection(input);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to record quality inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Record Quality Inspection & Site Audit</h3>
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

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Target Civil Works Project <span className="text-red-500">*</span></label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full p-2.5 rounded border border-slate-300 font-medium bg-slate-50 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name} ({p.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Inspection Conducted Date</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full p-2.5 rounded border border-slate-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Overall Quality Rating <span className="text-red-500">*</span></label>
              <select
                value={overallRating}
                onChange={(e) => setOverallRating(e.target.value as any)}
                className="w-full p-2.5 rounded border border-slate-300 font-bold bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="OUTSTANDING">OUTSTANDING (Grade A+ Passed)</option>
                <option value="SATISFACTORY">SATISFACTORY (Grade A Passed)</option>
                <option value="NEEDS_IMPROVEMENT">NEEDS IMPROVEMENT (Minor Defect Notice)</option>
                <option value="CRITICAL_DEFECTS_REJECTED">CRITICAL DEFECTS REJECTED (Work Order Suspension)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Auditor Technical Observations & Findings <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="Record structural testing observations, concrete cube strength test results, soil compaction readings..."
              className="w-full p-3 rounded border border-slate-300 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {(overallRating === 'NEEDS_IMPROVEMENT' || overallRating === 'CRITICAL_DEFECTS_REJECTED') && (
            <div className="space-y-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="space-y-1">
                <label className="block font-bold text-red-900">Identified Technical Defects</label>
                <textarea
                  rows={2}
                  value={defectsIdentified}
                  onChange={(e) => setDefectsIdentified(e.target.value)}
                  placeholder="Specify non-compliant material grade, structural cracks, or honeycombing..."
                  className="w-full p-2.5 rounded border border-red-300 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-red-900">Required Corrective Action & Rectification Timeframe</label>
                <input
                  type="text"
                  value={correctiveMeasures}
                  onChange={(e) => setCorrectiveMeasures(e.target.value)}
                  placeholder="e.g. Demolish and recast pier beam P-04 within 14 days"
                  className="w-full p-2.5 rounded border border-red-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Geo-tagged Photo Evidence Input */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <label className="block font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-indigo-600" /> Geo-Tagged Site Photo Evidence Attachment
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Photo Title / Measurement Ref</span>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Site Photo Image URL</span>
                <input
                  type="text"
                  value={evidenceFileUrl}
                  onChange={(e) => setEvidenceFileUrl(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500">GPS Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full p-1.5 rounded border border-slate-300 font-mono"
                />
              </div>
              <div>
                <span className="text-slate-500">GPS Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full p-1.5 rounded border border-slate-300 font-mono"
                />
              </div>
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Submitting Audit...' : 'Submit Quality Audit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
