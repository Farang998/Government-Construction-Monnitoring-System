import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { ProjectGisMarkerDto } from '@gov-platform/shared';
import { GisMap } from '../components/GisMap';
import {
  MapPin,
  Filter,
  Search,
  RotateCcw,
} from 'lucide-react';

export const GisExplorer: React.FC = () => {
  const [markers, setMarkers] = useState<ProjectGisMarkerDto[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<ProjectGisMarkerDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [district, setDistrict] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [minCostInr, setMinCostInr] = useState<number | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState<number | undefined>(undefined);
  const [centerLat, setCenterLat] = useState<number>(23.0225);
  const [centerLng, setCenterLng] = useState<number>(72.5714);

  useEffect(() => {
    fetchMarkers();
  }, [district, departmentCode, statusFilter, minCostInr, radiusKm]);

  const fetchMarkers = async () => {
    setLoading(true);
    try {
      const res = await api.getGisMarkers({
        district: district || undefined,
        departmentCode: departmentCode || undefined,
        status: statusFilter || undefined,
        minCostInr: minCostInr || undefined,
        radiusKm: radiusKm || undefined,
        centerLat: radiusKm ? centerLat : undefined,
        centerLng: radiusKm ? centerLng : undefined,
        search: search || undefined,
      });

      if (res.data) {
        setMarkers(res.data);
        if (res.data.length > 0 && !selectedMarker) {
          setSelectedMarker(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load GIS project markers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarkers();
  };

  const handleResetFilters = () => {
    setDistrict('');
    setDepartmentCode('');
    setStatusFilter('');
    setSearch('');
    setMinCostInr(undefined);
    setRadiusKm(undefined);
  };

  const totalSanctionedCost = markers.reduce((sum, m) => sum + (m.sanctionedCostInr || m.estimatedCostInr), 0);
  const avgPhysicalProgress =
    markers.length > 0 ? (markers.reduce((sum, m) => sum + m.physicalProgressPct, 0) / markers.length).toFixed(1) : '0';

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {/* Top GIS Command Bar */}
      <div className="flex items-center justify-between rounded-lg border border-gov-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gov-navy text-white shadow">
            <MapPin className="h-5 w-5 text-gov-gold" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gov-navy">State Infrastructure GIS Map Explorer</h1>
            <p className="text-xs text-slate-500">
              Real-time Spatial Asset & Project Monitoring Dashboard | State of Gujarat
            </p>
          </div>
        </div>

        {/* Spatial Summary Indicators */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Mapped Projects</div>
            <div className="text-lg font-extrabold text-gov-navy">{markers.length}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Sanctioned Value</div>
            <div className="text-lg font-extrabold text-emerald-700">
              ₹ {(totalSanctionedCost / 10000000).toFixed(1)} Cr
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Avg Physical Completion</div>
            <div className="text-lg font-extrabold text-gov-blue">{avgPhysicalProgress}%</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Control Sidebar & Right Leaflet Map Canvas */}
      <div className="flex flex-1 gap-4 overflow-hidden min-h-[600px]">
        {/* Left Filter & Asset List Sidebar */}
        <div className="flex w-96 flex-col rounded-lg border border-gov-border bg-white shadow-sm overflow-hidden shrink-0">
          <div className="flex items-center justify-between border-b border-gov-border bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gov-navy">
              <Filter className="h-4 w-4 text-gov-blue" />
              <span>Spatial Controls & Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-gov-blue"
              title="Reset Filters"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="p-3 border-b border-gov-border bg-white space-y-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Project Code, Name, District..."
                className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-3 text-xs focus:border-gov-blue focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </form>

            <div className="grid grid-cols-2 gap-2">
              {/* District Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
                >
                  <option value="">All Districts (33)</option>
                  <option value="AHMEDABAD">Ahmedabad</option>
                  <option value="SURAT">Surat</option>
                  <option value="VADODARA">Vadodara</option>
                  <option value="RAJKOT">Rajkot</option>
                  <option value="GANDHINAGAR">Gandhinagar</option>
                  <option value="BHAVNAGAR">Bhavnagar</option>
                  <option value="JAMNAGAR">Jamnagar</option>
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Department</label>
                <select
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="RNB">Roads & Buildings (R&B)</option>
                  <option value="WRD">Water Resources (WRD)</option>
                  <option value="HFW">Health & Family Welfare</option>
                  <option value="UDD">Urban Development</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Project Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="IN_CONSTRUCTION">In Construction</option>
                  <option value="CONTRACT_AWARDED">Contract Awarded</option>
                  <option value="TENDER_PUBLISHED">Tender Published</option>
                  <option value="PROPOSED">Proposed</option>
                  <option value="COMPLETION_CERTIFIED">Completed</option>
                </select>
              </div>

              {/* Radius Proximity Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Radius Search</label>
                <select
                  value={radiusKm || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setRadiusKm(val);
                    if (val && selectedMarker) {
                      setCenterLat(selectedMarker.latitude);
                      setCenterLng(selectedMarker.longitude);
                    }
                  }}
                  className="w-full rounded border border-slate-300 p-1.5 text-xs font-medium focus:border-gov-blue focus:outline-none"
                >
                  <option value="">Whole State</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Within 50 km</option>
                </select>
              </div>
            </div>
          </div>

          {/* Asset List Header */}
          <div className="bg-slate-100 px-3 py-1.5 border-b border-gov-border text-[11px] font-bold text-slate-600 flex justify-between">
            <span>Filtered Projects ({markers.length})</span>
            <span>Click card to re-center</span>
          </div>

          {/* Asset Cards List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Querying Spatial GIS Database...</div>
            ) : markers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No project assets match selected spatial filters.</div>
            ) : (
              markers.map((m) => {
                const isSelected = selectedMarker?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMarker(m);
                      setCenterLat(m.latitude);
                      setCenterLng(m.longitude);
                    }}
                    className={`cursor-pointer rounded-lg border p-3 transition-all ${
                      isSelected
                        ? 'border-gov-blue bg-blue-50/80 shadow-md ring-1 ring-gov-blue'
                        : 'border-gov-border bg-white hover:border-slate-400 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="text-gov-blue">{m.projectCode}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">{m.district}</span>
                    </div>

                    <h4 className="mt-1 text-xs font-bold text-gov-darkSlate line-clamp-2">{m.name}</h4>

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">₹ {(m.estimatedCostInr / 10000000).toFixed(2)} Cr</span>
                      <span className="font-bold text-emerald-700">{m.physicalProgressPct}% Physical</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-600" style={{ width: `${m.physicalProgressPct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Interactive GIS Map Canvas */}
        <div className="flex flex-1 flex-col rounded-lg border border-gov-border bg-white shadow-sm overflow-hidden">
          <GisMap
            markers={markers}
            selectedMarkerId={selectedMarker?.id}
            onSelectMarker={(m) => {
              setSelectedMarker(m);
              setCenterLat(m.latitude);
              setCenterLng(m.longitude);
            }}
            centerLat={centerLat}
            centerLng={centerLng}
            zoom={8}
            radiusKm={radiusKm}
          />
        </div>
      </div>
    </div>
  );
};
