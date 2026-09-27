import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ProjectGisMarkerDto } from '@gov-platform/shared';

interface GisMapProps {
  markers: ProjectGisMarkerDto[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: ProjectGisMarkerDto) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  radiusKm?: number;
}

export const GisMap: React.FC<GisMapProps> = ({
  markers,
  selectedMarkerId,
  onSelectMarker,
  centerLat = 22.5,
  centerLng = 72.0,
  zoom = 7,
  radiusKm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Gujarat State Infrastructure GIS',
        maxZoom: 18,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center & Radius Overlay
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (centerLat && centerLng) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom);
    }

    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (radiusKm && radiusKm > 0 && centerLat && centerLng) {
      circleRef.current = L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000,
        color: '#1e3a8a',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '4, 4',
      }).addTo(mapInstanceRef.current);
    }
  }, [centerLat, centerLng, zoom, radiusKm]);

  // Render Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    markers.forEach((m) => {
      let colorClass = 'bg-blue-600';

      if (m.status === 'IN_CONSTRUCTION' || m.status === 'SITE_MOBILIZATION') {
        colorClass = 'bg-emerald-600';
      } else if (m.status === 'COMPLETION_CERTIFIED' || m.status === 'HANDED_OVER') {
        colorClass = 'bg-indigo-600';
      } else if (m.status === 'TENDER_PUBLISHED' || m.status === 'CONTRACT_AWARDED') {
        colorClass = 'bg-amber-600';
      } else if (m.status === 'PROPOSED' || m.status === 'UNDER_SCRUTINY') {
        colorClass = 'bg-purple-600';
      }

      const isSelected = selectedMarkerId === m.id;
      const size = isSelected ? 34 : 26;

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${isSelected ? '#f59e0b' : colorClass.includes('emerald') ? '#059669' : colorClass.includes('indigo') ? '#4f46e5' : colorClass.includes('amber') ? '#d97706' : '#2563eb'};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            🏛️
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const leafletMarker = L.marker([m.latitude, m.longitude], { icon: customIcon });

      // Build Rich Government GIS Popup Card
      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 250px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: bold; color: #1e3a8a;">${m.projectCode}</span>
            <span style="font-size: 9px; font-weight: bold; background: #e0f2fe; color: #0369a1; padding: 2px 6px; rounded: 4px;">${m.status}</span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; color: #0f172a; margin: 0 0 6px 0; line-height: 1.3;">${m.name}</h4>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>Department:</strong> ${m.departmentName} (${m.departmentCode})
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
            <strong>District / Taluka:</strong> ${m.district}, ${m.taluka}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            <strong>Estimated Cost:</strong> ₹ ${(m.estimatedCostInr / 10000000).toFixed(2)} Cr
          </div>

          <div style="margin-top: 6px; background: #f8fafc; padding: 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; color: #334155; margin-bottom: 2px;">
              <span>Physical Completion:</span>
              <span>${m.physicalProgressPct}%</span>
            </div>
            <div style="width: 100%; height: 6px; background: #cbd5e1; border-radius: 3px; overflow: hidden;">
              <div style="width: ${m.physicalProgressPct}%; height: 100%; background: #059669;"></div>
            </div>
          </div>

          <div style="margin-top: 8px; text-align: right;">
            <span style="font-size: 10px; color: #64748b;">Office: ${m.executingOfficeName}</span>
          </div>
        </div>
      `;

      leafletMarker.bindPopup(popupHtml);

      leafletMarker.on('click', () => {
        if (onSelectMarker) {
          onSelectMarker(m);
        }
      });

      layerGroupRef.current?.addLayer(leafletMarker);
    });
  }, [markers, selectedMarkerId, onSelectMarker]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-lg border border-gov-border overflow-hidden shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: '500px' }} />
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-300 p-2.5 rounded-lg shadow-md z-[1000] text-[11px] space-y-1 font-medium">
        <div className="font-bold text-gov-navy text-xs border-b border-slate-200 pb-1 mb-1">
          📍 Map Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block border border-white"></span>
          <span>In Construction / Mobilization</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block border border-white"></span>
          <span>Completed / Handed Over</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block border border-white"></span>
          <span>Tender / Contract Awarded</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block border border-white"></span>
          <span>Proposed / DPR Phase</span>
        </div>
      </div>
    </div>
  );
};
