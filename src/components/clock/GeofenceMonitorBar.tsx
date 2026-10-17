import React, { useState } from 'react';
import { Job } from '../../types';
import { GeofenceEvaluation, GEOFENCE_PRESETS } from '../../utils/geofencing';
import { GpsStatus } from '../../hooks/useGeofencing';
import {
  Satellite,
  Compass,
  MapPin,
  Settings2,
  Car,
  HardHat,
  RotateCcw,
  Check,
  Shield,
  Radio,
  Sliders,
  ChevronDown,
} from 'lucide-react';

interface GeofenceMonitorBarProps {
  gpsStatus: GpsStatus;
  accuracy: number | null;
  nearestEvaluation: GeofenceEvaluation | null;
  isSimulated: boolean;
  simulatedJobName: string | null;
  geofenceRadius: number;
  onSetGeofenceRadius: (radius: number) => void;
  jobs: Job[];
  onSimulateArrival: (job: Job) => void;
  onSimulateEnRoute: (job: Job) => void;
  onResetRealGps: () => void;
  autoSelectJob: boolean;
  onToggleAutoSelect: (value: boolean) => void;
}

export const GeofenceMonitorBar: React.FC<GeofenceMonitorBarProps> = ({
  gpsStatus,
  accuracy,
  nearestEvaluation,
  isSimulated,
  simulatedJobName,
  geofenceRadius,
  onSetGeofenceRadius,
  jobs,
  onSimulateArrival,
  onSimulateEnRoute,
  onResetRealGps,
  autoSelectJob,
  onToggleAutoSelect,
}) => {
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  const getStatusBadge = () => {
    if (isSimulated) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
          <Radio className="w-3 h-3 text-[#ff6700] animate-pulse" />
          <span>Simulated: {simulatedJobName ? simulatedJobName.split(' ')[0] : 'Test'}</span>
        </span>
      );
    }

    switch (gpsStatus) {
      case 'active':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GPS Active {accuracy ? `(±${accuracy}m)` : ''}</span>
          </span>
        );
      case 'searching':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Acquiring Fix...</span>
          </span>
        );
      case 'denied':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>GPS Permission Denied</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-slate-400 font-medium">GPS Ready</span>
        );
    }
  };

  return (
    <>
      <div className="bg-[#0f1013] border border-[#23252d] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs shadow-inner">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Satellite className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Geofence
            </span>
          </div>

          {getStatusBadge()}

          {nearestEvaluation && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#8e929b] border-l border-[#2a2d36] pl-2.5">
              <MapPin className="w-3 h-3 text-[#ff6700]" />
              <span>Nearest:</span>
              <strong className="text-white">[{nearestEvaluation.job.jobNumber}]</strong>
              <span className="text-amber-400 font-mono font-bold">
                ({nearestEvaluation.distanceFormatted})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181920] hover:bg-[#22242e] text-slate-300 hover:text-white border border-[#2b2e38] text-[11px] font-bold transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>Test / Config</span>
        </button>
      </div>

      {/* Geofence Configuration & Field Testing Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121316] border-2 border-[#2b2e38] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#232630] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ff6700]/20 border border-[#ff6700]/40 flex items-center justify-center text-[#ff6700]">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Work Zone Geofencing Utility
                  </h3>
                  <p className="text-[11px] text-[#8e929b]">
                    Automatic site detection and arrival check-in verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {/* Live Status Overview */}
            <div className="p-3 bg-[#0a0b0d] rounded-xl border border-[#22252e] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Position Status</span>
                {getStatusBadge()}
              </div>
              {nearestEvaluation && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1c1e26]">
                  <span className="text-slate-400">Closest Work Zone</span>
                  <span className="text-white font-medium">
                    [{nearestEvaluation.job.jobNumber}] {nearestEvaluation.job.title.slice(0, 24)}... (
                    <strong className="text-amber-400">{nearestEvaluation.distanceFormatted}</strong>)
                  </span>
                </div>
              )}
            </div>

            {/* Geofence Perimeter Sensitivity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Geofence Detection Radius</span>
                <span className="text-amber-400 font-mono font-bold">{geofenceRadius} meters (~{Math.round(geofenceRadius * 3.28)} ft)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GEOFENCE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onSetGeofenceRadius(preset.value)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      geofenceRadius === preset.value
                        ? 'card-amber-active bg-[#181920] text-amber-300'
                        : 'bg-[#090a0c] border-[#252830] text-slate-400 hover:text-white hover:border-[#353945]'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.value}m</div>
                    <div className="text-[10px] text-[#8e929b] truncate">{preset.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-select Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#0a0b0d] rounded-xl border border-[#22252e]">
              <div>
                <div className="text-xs font-bold text-white">Auto-Select Job on Arrival</div>
                <div className="text-[11px] text-[#8e929b]">
                  Pre-populates punch selector when arriving inside work zone perimeter
                </div>
              </div>
              <button
                onClick={() => onToggleAutoSelect(!autoSelectJob)}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  autoSelectJob ? 'bg-[#ff6700]' : 'bg-[#2b2d35]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoSelectJob ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Field Simulator Controls (For testing arrival without being on the highway) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Field Test Simulator
                </span>
                <span className="text-[10px] text-amber-400">Test arrival prompts immediately</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2.5 bg-[#090a0c] border border-[#22252d] rounded-xl hover:border-amber-500/40 text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-white truncate">
                        [{job.jobNumber}] {job.title}
                      </div>
                      <div className="text-[10px] text-[#8e929b] truncate">{job.locationName}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onSimulateArrival(job);
                          setShowConfigModal(false);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#ff6700] to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-extrabold text-[10px] uppercase shadow-sm"
                      >
                        Arrive Here
                      </button>
                      <button
                        onClick={() => {
                          onSimulateEnRoute(job);
                          setShowConfigModal(false);
                        }}
                        title="Simulate 4.5 mi away"
                        className="p-1.5 rounded-lg bg-[#191b22] hover:bg-[#22242f] text-slate-300 border border-[#2c303c]"
                      >
                        <Car className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {isSimulated && (
                <button
                  onClick={() => {
                    onResetRealGps();
                    setShowConfigModal(false);
                  }}
                  className="w-full h-10 rounded-xl bg-[#1a1b24] hover:bg-[#252835] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-amber-500/30 mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Real Device GPS Coordinates</span>
                </button>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowConfigModal(false)}
                className="w-full h-11 rounded-xl bg-[#1f212a] hover:bg-[#282b36] text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
