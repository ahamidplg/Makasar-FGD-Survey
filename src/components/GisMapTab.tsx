import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  Crosshair,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Search,
} from 'lucide-react';
import { SurveyRecord } from '../types';
import { getPriorityColor } from '../utils/scoring';

interface GisMapTabProps {
  surveys: SurveyRecord[];
  onSelectSurvey: (survey: SurveyRecord) => void;
  onPickCoordinateForGroundCheck?: (lat: number, lng: number) => void;
}

export const GisMapTab: React.FC<GisMapTabProps> = ({
  surveys,
  onSelectSurvey,
  onPickCoordinateForGroundCheck,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'P1',
    'P2',
    'P3',
    'P4',
  ]);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('ALL');
  const [activeTileLayer, setActiveTileLayer] = useState<'osm' | 'satellite' | 'carto'>('osm');
  const [isPickingCoord, setIsPickingCoord] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SurveyRecord | null>(null);
  const [searchCorridor, setSearchCorridor] = useState('');

  // Makassar Center
  const defaultCenter: [number, number] = [-5.1477, 119.4327];

  // Distinct Kecamatans
  const allKecamatans = Array.from(
    new Set(surveys.map((s) => s.kecamatan).filter(Boolean))
  ).sort();

  // Create custom SVG marker icon based on color
  const createMarkerIcon = (colorHex: string, priorityLabel: string) => {
    const isP1 = priorityLabel.startsWith('P1');
    const isP2 = priorityLabel.startsWith('P2');
    const size = isP1 ? 34 : isP2 ? 30 : 26;

    const svgHtml = `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${colorHex};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid white;
      ">
        <div style="
          width: ${size * 0.4}px;
          height: ${size * 0.4}px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `;

    return L.divIcon({
      html: svgHtml,
      className: 'custom-gis-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on average of surveys if available
    const validSurveys = surveys.filter(
      (s) => typeof s.latitude === 'number' && typeof s.longitude === 'number' && !isNaN(s.latitude)
    );
    let center: [number, number] = defaultCenter;
    if (validSurveys.length > 0) {
      const avgLat =
        validSurveys.reduce((acc, curr) => acc + curr.latitude, 0) / validSurveys.length;
      const avgLng =
        validSurveys.reduce((acc, curr) => acc + curr.longitude, 0) / validSurveys.length;
      center = [avgLat, avgLng];
    }

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
    });

    // Tile Layers
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });

    osmLayer.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Click handler for coordinate picking
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      setPickedCoord({ lat, lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (activeTileLayer === 'satellite') {
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye',
          maxZoom: 18,
        }
      ).addTo(map);
    } else if (activeTileLayer === 'carto') {
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
    }
  }, [activeTileLayer]);

  // Update Markers on filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const valid = surveys.filter((s) => {
      if (typeof s.latitude !== 'number' || typeof s.longitude !== 'number' || isNaN(s.latitude)) {
        return false;
      }
      if (selectedKecamatan !== 'ALL' && s.kecamatan !== selectedKecamatan) {
        return false;
      }
      const matchPrio = selectedPriorities.some((p) => (s.prioritas || '').startsWith(p));
      if (!matchPrio) return false;

      if (searchCorridor.trim()) {
        const q = searchCorridor.toLowerCase();
        if (
          !s.nama_jalan.toLowerCase().includes(q) &&
          !s.kecamatan.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });

    valid.forEach((record) => {
      const color = getPriorityColor(record.prioritas);
      const icon = createMarkerIcon(color.hex, record.prioritas);

      const marker = L.marker([record.latitude, record.longitude], { icon });

      // Popup HTML content
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="background: ${color.hex}; color: white; font-weight: bold; font-size: 11px; padding: 2px 6px; border-radius: 4px;">
              ${record.prioritas.split(' - ')[0]}
            </span>
            <span style="font-size: 12px; font-weight: 800; color: #0f172a;">
              Score: ${record.score}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: bold; color: #1e293b; line-height: 1.2;">
            ${record.nama_jalan}
          </h4>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">
            Kec. ${record.kecamatan} • ${(record.panjang_m / 1000).toFixed(2)} km
          </div>
          <div style="font-size: 10px; background: #f1f5f9; padding: 3px 6px; border-radius: 4px; color: #334155; margin-bottom: 8px;">
            Status: <b>${record.status_verifikasi}</b> • Kabel: <b>${record.kepadatan_kabel}</b>
          </div>
          <button id="btn-detail-${record.id}" style="
            width: 100%;
            background: #4f46e5;
            color: white;
            border: none;
            padding: 5px 8px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
          ">
            Lihat Detail Ruas
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedRecord(record);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${record.id}`);
        if (btn) {
          btn.onclick = () => onSelectSurvey(record);
        }
      });

      layer.addLayer(marker);
    });
  }, [surveys, selectedPriorities, selectedKecamatan, searchCorridor]);

  // Center on specific corridor
  const handleCorridorJump = (record: SurveyRecord) => {
    setSelectedRecord(record);
    if (mapInstanceRef.current && record.latitude && record.longitude) {
      mapInstanceRef.current.setView([record.latitude, record.longitude], 15, {
        animate: true,
      });
    }
  };

  const togglePriority = (prio: string) => {
    if (selectedPriorities.includes(prio)) {
      if (selectedPriorities.length > 1) {
        setSelectedPriorities(selectedPriorities.filter((p) => p !== prio));
      }
    } else {
      setSelectedPriorities([...selectedPriorities, prio]);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Map Filter & Controller Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Priority Checkbox Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Prioritas:
          </span>
          {[
            { key: 'P1', label: 'P1 - Sangat Urgent', color: 'bg-red-600' },
            { key: 'P2', label: 'P2 - Urgent', color: 'bg-orange-500' },
            { key: 'P3', label: 'P3 - Menengah', color: 'bg-amber-500' },
            { key: 'P4', label: 'P4 - Jangka Panjang', color: 'bg-emerald-600' },
          ].map((item) => {
            const isChecked = selectedPriorities.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => togglePriority(item.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  isChecked
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span>{item.key}</span>
              </button>
            );
          })}
        </div>

        {/* Kecamatan Filter & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jalan di peta..."
              value={searchCorridor}
              onChange={(e) => setSearchCorridor(e.target.value)}
              className="pl-7 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 w-36 sm:w-44"
            />
          </div>

          <select
            value={selectedKecamatan}
            onChange={(e) => setSelectedKecamatan(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
          >
            <option value="ALL">Semua Kecamatan</option>
            {allKecamatans.map((kec) => (
              <option key={kec} value={kec}>
                Kec. {kec}
              </option>
            ))}
          </select>

          {/* Map Base Tile Switcher */}
          <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-100 p-0.5">
            <button
              onClick={() => setActiveTileLayer('osm')}
              className={`px-2 py-1 rounded font-medium cursor-pointer ${
                activeTileLayer === 'osm' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setActiveTileLayer('satellite')}
              className={`px-2 py-1 rounded font-medium cursor-pointer ${
                activeTileLayer === 'satellite' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Satelit
            </button>
            <button
              onClick={() => setActiveTileLayer('carto')}
              className={`px-2 py-1 rounded font-medium cursor-pointer ${
                activeTileLayer === 'carto' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600'
              }`}
            >
              Clean
            </button>
          </div>
        </div>
      </div>

      {/* Map Main Canvas with Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Leaflet Map Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative flex flex-col">
          <div
            ref={mapContainerRef}
            className="w-full h-[620px] z-10"
            style={{ minHeight: '500px' }}
          />

          {/* Map Overlay Helpers */}
          <div className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg border border-slate-700">
            <Crosshair className="w-4 h-4 text-sky-400 animate-spin-slow" />
            <span>
              {pickedCoord
                ? `GPS Klik: ${pickedCoord.lat}, ${pickedCoord.lng}`
                : 'Klik di peta untuk ambil koordinat GPS'}
            </span>
            {pickedCoord && onPickCoordinateForGroundCheck && (
              <button
                onClick={() =>
                  onPickCoordinateForGroundCheck(pickedCoord.lat, pickedCoord.lng)
                }
                className="ml-2 px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold text-[10px] cursor-pointer"
              >
                Pakai di Ground Check
              </button>
            )}
          </div>

          <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-slate-700 shadow border border-slate-200 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> P1: Sangat Urgent (≥80)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> P2: Urgent (60-79.9)
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> P3: Menengah
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> P4: Jangka Panjang
            </div>
          </div>
        </div>

        {/* Side Inspector Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Inspektor Koridor</h3>
              </div>
              <span className="text-[11px] text-slate-400">GIS Inspector</span>
            </div>

            {selectedRecord ? (
              <div className="space-y-3.5 pt-3 text-xs">
                <div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      getPriorityColor(selectedRecord.prioritas).badge
                    }`}
                  >
                    {selectedRecord.prioritas}
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                    {selectedRecord.nama_jalan}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Kec. {selectedRecord.kecamatan}, Kel. {selectedRecord.kelurahan || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Score Terbobot</span>
                    <span className="text-lg font-bold text-slate-900">{selectedRecord.score}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Panjang Segmen</span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedRecord.panjang_m.toLocaleString('id-ID')} m
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Kelas Jalan:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.kelas_jalan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kepadatan Kabel:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.kepadatan_kabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kelayakan Ducting:</span>
                    <span className="font-semibold text-slate-900">{selectedRecord.kelayakan_ducting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiang Telkom/PLN:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRecord.jumlah_tiang_telkom} / {selectedRecord.jumlah_tiang_pln_pju}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Verifikasi:</span>
                    <span className="font-semibold text-indigo-600">{selectedRecord.status_verifikasi}</span>
                  </div>
                </div>

                {selectedRecord.photo_path && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 text-[10px] block mb-1">Foto Lapangan:</span>
                    <img
                      src={selectedRecord.photo_path.split(';')[0]}
                      alt="Foto koridor"
                      referrerPolicy="no-referrer"
                      className="w-full h-28 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                <button
                  onClick={() => onSelectSurvey(selectedRecord)}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Detail Lengkap Ruas</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2 text-xs">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Klik pin pada peta GIS untuk melihat detail parameter teknis koridor.</p>
              </div>
            )}
          </div>

          {/* Quick Corridor Jump List */}
          <div className="border-t border-slate-100 pt-3">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilihan Cepat Koridor P1
            </h5>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {surveys
                .filter((s) => (s.prioritas || '').startsWith('P1'))
                .slice(0, 6)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCorridorJump(item)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-[11px] font-medium text-slate-800 flex items-center justify-between group cursor-pointer"
                  >
                    <span className="line-clamp-1 group-hover:text-indigo-600">{item.nama_jalan}</span>
                    <span className="text-[10px] font-bold text-red-600 ml-1">{item.score}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
