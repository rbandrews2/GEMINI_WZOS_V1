import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import L from 'leaflet';
import {
  Navigation,
  MapPin,
  Compass,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  Clock,
  Car,
} from 'lucide-react';

export const WorkZoneMapTab: React.FC = () => {
  const { jobs, selectedJobForNav, setSelectedJobForNav, playBeep } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const jobMarkersRef = useRef<L.Marker[]>([]);

  // Current active navigation destination
  const [activeNavJob, setActiveNavJob] = useState<Job>(() => {
    return selectedJobForNav || jobs[0];
  });

  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [currentSpeed, setCurrentSpeed] = useState<number>(42);
  const [distanceRemainingMi, setDistanceRemainingMi] = useState<number>(6.8);
  const [etaMinutes, setEtaMinutes] = useState<number>(11);
  const [currentInstruction, setCurrentInstruction] = useState<string>(
    'Head north on US-101 towards work zone closure'
  );
  const [nextTurnDist, setNextTurnDist] = useState<string>('800 ft');
  const [mapLayer, setMapLayer] = useState<'streets' | 'satellite' | 'dark'>('dark');

  // Simulated GPS waypoints between yard and job site
  const simulationStepRef = useRef<number>(0);
  const simulationTimerRef = useRef<any>(null);

  // Default Staging Yard (Starting point)
  const yardCoords: [number, number] = [37.3688, -121.9299]; // San Jose / Santa Clara yard

  useEffect(() => {
    if (selectedJobForNav) {
      setActiveNavJob(selectedJobForNav);
    }
  }, [selectedJobForNav]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix default Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const targetCoords = activeNavJob?.coordinates || yardCoords;

    const map = L.map(mapContainerRef.current, {
      center: targetCoords,
      zoom: 13,
      zoomControl: false,
    });

    // Dark carto tiles for rugged high-contrast field navigation
    const tileLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route, Markers & Destination
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeNavJob) return;

    // Clear existing job markers
    jobMarkersRef.current.forEach((m) => m.remove());
    jobMarkersRef.current = [];

    // Add all jobs as pins
    jobs.forEach((job) => {
      const isSelected = job.id === activeNavJob.id;
      const markerHtml = `
        <div style="background: ${isSelected ? '#F97316' : '#1E293B'}; border: 2px solid ${isSelected ? '#FFF' : '#F97316'}; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5); color: white; font-weight: bold; font-size: 11px;">
          ${job.jobNumber.replace('WZ-', '')}
        </div>
      `;
      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-job-pin',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker(job.coordinates, { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <div style="font-weight: 800; color: #F97316; font-size: 13px;">${job.jobNumber}</div>
          <div style="font-weight: 700; color: #FFF; font-size: 12px; margin-top: 2px;">${job.title}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 4px;">${job.address}</div>
          <div style="color: #CBD5E1; font-size: 11px; margin-top: 4px;">Closure: <b>${job.closureType}</b></div>
        </div>
      `);
      jobMarkersRef.current.push(marker);
    });

    // Create realistic route waypoints between Yard and Active Job
    const [destLat, destLng] = activeNavJob.coordinates;
    const midLat = (yardCoords[0] + destLat) / 2 + 0.008;
    const midLng = (yardCoords[1] + destLng) / 2 - 0.005;

    const routeCoords: [number, number][] = [
      yardCoords,
      [yardCoords[0] + 0.005, yardCoords[1] + 0.002],
      [midLat, midLng],
      [destLat - 0.006, destLng - 0.002],
      [destLat, destLng],
    ];

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
    }

    const poly = L.polyline(routeCoords, {
      color: '#3B82F6',
      weight: 6,
      opacity: 0.85,
      dashArray: isNavigating ? undefined : '8, 8',
    }).addTo(map);

    routePolylineRef.current = poly;

    // Vehicle Marker
    if (!vehicleMarkerRef.current) {
      const vehicleHtml = `
        <div style="background: #2563EB; border: 3px solid #FFF; border-radius: 9999px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(37,99,235,0.9);">
          <div style="width: 8px; height: 8px; background: white; border-radius: 9999px;"></div>
        </div>
      `;
      const vehicleIcon = L.divIcon({
        html: vehicleHtml,
        className: 'vehicle-pos',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      vehicleMarkerRef.current = L.marker(yardCoords, { icon: vehicleIcon }).addTo(map);
    }

    map.fitBounds(poly.getBounds(), { padding: [50, 50] });
  }, [activeNavJob, jobs]);

  // Turn-by-Turn Speech synthesizer
  const speakInstruction = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      playBeep('alert');
    }
  };

  // Simulated Drive Loop
  useEffect(() => {
    if (!isSimulatingDrive) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      return;
    }

    const [destLat, destLng] = activeNavJob.coordinates;
    const waypoints: [number, number, string, string, number][] = [
      [yardCoords[0], yardCoords[1], 'Head north on Depot Way towards US-101', '500 ft', 25],
      [yardCoords[0] + 0.005, yardCoords[1] + 0.002, 'Merge onto US-101 Northbound towards work site', '1.2 mi', 55],
      [(yardCoords[0] + destLat) / 2 + 0.008, (yardCoords[1] + destLng) / 2 - 0.005, 'Continue on US-101 NB. Caution: Approaching Highway Work Zone in 1 mile', '2.4 mi', 50],
      [destLat - 0.006, destLng - 0.002, 'Reduce speed to 45 MPH. Flashing arrow board active ahead on right shoulder', '800 ft', 38],
      [destLat, destLng, 'You have arrived at Work Zone Job Site. Park TMA in buffer zone.', 'Arrived', 0],
    ];

    simulationStepRef.current = 0;
    speakInstruction(waypoints[0][2]);

    simulationTimerRef.current = setInterval(() => {
      simulationStepRef.current += 1;
      const step = simulationStepRef.current;

      if (step >= waypoints.length) {
        setIsSimulatingDrive(false);
        setDistanceRemainingMi(0);
        setEtaMinutes(0);
        setCurrentSpeed(0);
        setCurrentInstruction('Arrived at Work Zone Site. Ready to Clock In.');
        speakInstruction('You have arrived at your work zone assignment.');
        playBeep('success');
        clearInterval(simulationTimerRef.current);
        return;
      }

      const [lat, lng, instruction, dist, speed] = waypoints[step];
      setCurrentInstruction(instruction);
      setNextTurnDist(dist);
      setCurrentSpeed(speed);
      setDistanceRemainingMi(Math.max(0.1, Number((6.8 - step * 1.5).toFixed(1))));
      setEtaMinutes(Math.max(1, 11 - step * 2.5));

      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.setLatLng([lat, lng]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([lat, lng], { animate: true });
      }

      speakInstruction(instruction);
      playBeep('punch');
    }, 4500);

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isSimulatingDrive, activeNavJob]);

  const handleStartNav = () => {
    setIsNavigating(true);
    setIsSimulatingDrive(true);
    speakInstruction(`Starting route guidance to ${activeNavJob.title}. Follow highlighted corridor.`);
    playBeep('success');
  };

  const handleStopNav = () => {
    setIsNavigating(false);
    setIsSimulatingDrive(false);
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setCurrentSpeed(0);
    if (vehicleMarkerRef.current) {
      vehicleMarkerRef.current.setLatLng(yardCoords);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && vehicleMarkerRef.current) {
      mapInstanceRef.current.setView(vehicleMarkerRef.current.getLatLng(), 15, { animate: true });
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Destination Selector & Navigation Launcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-orange-400" />
              <h2 className="font-display font-bold text-base text-white">Work Zone GPS Navigation</h2>
            </div>
            <p className="text-xs text-slate-400">
              Turn-by-turn guidance, speed compliance & work zone hazard warnings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceEnabled((v) => !v)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                voiceEnabled
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Voice Guidance"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4 text-orange-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">Voice</span>
            </button>

            {!isNavigating ? (
              <button
                onClick={handleStartNav}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-transform active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Navigation</span>
              </button>
            ) : (
              <button
                onClick={handleStopNav}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-[0.98]"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Exit Route</span>
              </button>
            )}
          </div>
        </div>

        {/* Job Dropdown Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Selected Destination Job</label>
            <select
              value={activeNavJob?.id}
              onChange={(e) => {
                const found = jobs.find((j) => j.id === e.target.value);
                if (found) {
                  setActiveNavJob(found);
                  setSelectedJobForNav(found);
                }
              }}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-xs text-white"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  [{job.jobNumber}] {job.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
            <div>
              <span className="text-[10px] uppercase text-slate-500 block">Closure Type</span>
              <span className="font-semibold text-orange-400">{activeNavJob?.closureType}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-500 block">Work Zone Limit</span>
              <span className="font-mono font-bold text-white">{activeNavJob?.speedLimit} MPH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Viewport with Google Maps Inspired Turn-by-Turn HUD */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 h-[460px] sm:h-[520px]">
        {/* Leaflet Canvas Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* HUD OVERLAY 1: Google Maps Green Turn Banner (Top) */}
        {isNavigating && (
          <div className="absolute top-3 left-3 right-3 z-30 bg-emerald-700/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-xl border border-emerald-500/50 flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900/90 flex items-center justify-center shrink-0 border border-emerald-500">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-mono-numbers text-xl font-black leading-none">{nextTurnDist}</div>
                <div className="text-xs font-semibold text-emerald-100 line-clamp-1 mt-0.5">
                  {currentInstruction}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">Work Zone</span>
              <span className="text-xs font-bold text-white">Exit In Vicinity</span>
            </div>
          </div>
        )}

        {/* HUD OVERLAY 2: Speedometer & Cone Zone Speed Alert (Top Left or Right) */}
        <div className="absolute left-3 bottom-24 z-30 flex flex-col gap-2">
          {/* Real Speed vs Work Zone Limit Gauge */}
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-2.5 shadow-xl text-center min-w-[76px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Speed</span>
            <span
              className={`font-mono-numbers text-2xl font-black block leading-none ${
                currentSpeed > (activeNavJob?.speedLimit || 45) ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {currentSpeed}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold block">MPH</span>

            {/* Work Zone Speed Sign */}
            <div className="mt-1.5 pt-1.5 border-t border-slate-800">
              <div className="border border-orange-500 rounded p-0.5 bg-orange-950/60">
                <span className="text-[8px] font-extrabold text-orange-400 block leading-tight">LIMIT</span>
                <span className="text-xs font-black text-white leading-none">
                  {activeNavJob?.speedLimit || 45}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* HUD OVERLAY 3: Floating Action Controls (Right side) */}
        <div className="absolute right-3 bottom-24 z-30 flex flex-col gap-2">
          <button
            onClick={handleRecenter}
            className="w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-xl flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            title="Recenter Camera"
          >
            <Compass className="w-5 h-5 text-orange-400" />
          </button>
        </div>

        {/* HUD OVERLAY 4: Google Maps Bottom Trip Summary Card */}
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-numbers text-2xl font-black text-emerald-400 leading-none">
                  {etaMinutes}
                </span>
                <span className="text-xs font-bold text-emerald-400">min</span>
                <span className="text-slate-500">·</span>
                <span className="font-mono-numbers text-sm font-semibold text-slate-300">
                  {distanceRemainingMi} mi
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-[190px] sm:max-w-xs mt-0.5">
                {activeNavJob?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isNavigating ? (
              <button
                onClick={handleStartNav}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-md shadow-orange-600/30"
              >
                Drive
              </button>
            ) : (
              <button
                onClick={handleStopNav}
                className="px-3.5 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold"
              >
                End
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Work Zone Safety Protocol for this Destination */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Active Work Zone Permit & Safety Notes</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {activeNavJob?.safetyNotes || 'Follow standard MUTCD Chapter 6 guidelines. Set advance signs first, then taper.'}
        </p>
        <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
          <span>Client: <b className="text-slate-200">{activeNavJob?.client}</b></span>
          <span>·</span>
          <span>Address: <b className="text-slate-200">{activeNavJob?.address}</b></span>
        </div>
      </div>
    </div>
  );
};
