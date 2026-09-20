import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GasIncident } from '../data/gasAppData';

interface OperationsMapProps {
  incidents: GasIncident[];
  activeFilter: string;
  onSelectIncident?: (incident: GasIncident) => void;
  flyToCoords?: [number, number] | null;
}

export const OperationsMap: React.FC<OperationsMapProps> = ({
  incidents,
  activeFilter,
  onSelectIncident,
  flyToCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([-0.5022, 117.1536], 8);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors • RISPK Kaltim'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Fly-To when trigger simulation or select
  useEffect(() => {
    if (mapInstanceRef.current && flyToCoords) {
      mapInstanceRef.current.flyTo(flyToCoords, 13, {
        duration: 1.5
      });
    }
  }, [flyToCoords]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const activeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div class='beacon-pulse' style='background-color:#ef4444; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.6);'></div>",
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });

    const monitoringIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='background-color:#f59e0b; width:16px; height:16px; border-radius:50%; border:2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.6);'></div>",
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const finishedIcon = L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='background-color:#10b981; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);'></div>",
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const filtered = incidents.filter(inc => {
      if (activeFilter === 'Semua') return true;
      if (activeFilter === 'Kebakaran Rumah') return inc.type === 'Kebakaran Rumah' || inc.type.includes('Rumah') || inc.type.includes('Pemukiman');
      if (activeFilter === 'Bangunan Gedung / Komersial') return inc.type.includes('Bangunan') || inc.type.includes('Gedung') || inc.type.includes('Komersial') || inc.type.includes('Publik') || inc.type.includes('Industri');
      if (activeFilter === 'Penyelamatan & Evakuasi') return inc.type.includes('Penyelamatan') || inc.type.includes('Rescue') || inc.type.includes('Gas');
      return true;
    });

    filtered.forEach(inc => {
      let icon = activeIcon;
      if (inc.status === 'Selesai') icon = finishedIcon;
      else if (inc.status === 'Monitoring') icon = monitoringIcon;

      const marker = L.marker(inc.coords, { icon }).addTo(map);

      const statusBadge = inc.status === 'Aktif'
        ? `<span style="background:#fee2e2; color:#ef4444; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800; letter-spacing:0.5px;">AKTIF PENANGANAN</span>`
        : inc.status === 'Monitoring'
          ? `<span style="background:#fef3c7; color:#d97706; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">MONITORING</span>`
          : `<span style="background:#d1fae5; color:#059669; padding:2px 7px; border-radius:6px; font-size:10px; font-weight:800;">SELESAI</span>`;

      const priorityBadge = inc.priority === 'Tinggi'
        ? `<span style="background:#fecdd3; color:#e11d48; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700;">PRIORITAS TINGGI</span>`
        : `<span style="background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700;">${inc.priority}</span>`;

      const popupHtml = `
        <div style="font-family:'Inter', sans-serif; min-width:220px; padding:2px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            ${statusBadge}
            ${priorityBadge}
          </div>
          <h4 style="margin:4px 0 2px 0; font-size:13px; font-weight:800; color:#0f172a; line-height:1.3;">${inc.title}</h4>
          <p style="margin:0 0 6px 0; font-size:11px; color:#64748b; font-weight:500;">
            📍 ${inc.location}
          </p>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px; margin-bottom:6px;">
            <p style="margin:0; font-size:11px; color:#334155; line-height:1.4;">${inc.desc}</p>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:10px; color:#475569; border-top:1px solid #e2e8f0; pt:4px; margin-top:4px;">
            <span>⏱️ <strong>Waktu:</strong> ${inc.time}</span>
            <span>🚒 <strong>SPM:</strong> ${inc.responseTimeMinutes || 8} mnt</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(inc);
        }
      });

      markersRef.current.push(marker);
    });
  }, [incidents, activeFilter, onSelectIncident]);

  return (
    <div className="relative w-full h-[400px] lg:h-[460px] rounded-xl overflow-hidden border border-slate-800 shadow-inner z-10">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
