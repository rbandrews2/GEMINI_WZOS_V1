import React from 'react';
import { Job, TaskCategory } from '../../types';
import { GeofenceEvaluation } from '../../utils/geofencing';
import {
  MapPin,
  CheckCircle2,
  Zap,
  Car,
  HardHat,
  X,
  Navigation2,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface GeofenceArrivalCardProps {
  evaluation: GeofenceEvaluation;
  accuracy: number | null;
  isClockedIn: boolean;
  activeTask?: TaskCategory;
  activeJobId?: string;
  onAcceptClockIn: (job: Job, task: TaskCategory) => void;
  onAcceptSwitchTask: (task: TaskCategory) => void;
  onSelectJobOnly: (job: Job) => void;
  onDismiss: () => void;
}

export const GeofenceArrivalCard: React.FC<GeofenceArrivalCardProps> = ({
  evaluation,
  accuracy,
  isClockedIn,
  activeTask,
  activeJobId,
  onAcceptClockIn,
  onAcceptSwitchTask,
  onSelectJobOnly,
  onDismiss,
}) => {
  const { job, distanceFormatted } = evaluation;

  // Case 1: Worker is already clocked in to THIS job under 'Job Site'
  if (isClockedIn && activeJobId === job.id && activeTask === 'Job Site') {
    return (
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Geofence Verified On-Site
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold">
                {distanceFormatted} to center
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              GPS confirmation active for <strong className="text-white">[{job.jobNumber}]</strong> {job.title}
              {accuracy && <span className="text-slate-400 text-[10px]"> (±{accuracy}m)</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Worker is clocked in under 'Travel Time', and has arrived at destination job site!
  if (isClockedIn && activeTask === 'Travel Time') {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1c1408] via-[#151210] to-[#0d0e12] border-2 border-amber-500/70 rounded-2xl p-4.5 shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-pulse-subtle">
        {/* Top orange accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#ff6700] to-amber-500" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-[#ff6700] p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-[#0a0b0d] rounded-[10px] flex items-center justify-center text-amber-400">
                <HardHat className="w-6 h-6 animate-bounce" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  📍 Destination Arrived
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {distanceFormatted} from work zone
                </span>
              </div>
              <h4 className="font-bold text-sm text-white leading-snug">
                Switch from Travel to <span className="text-amber-400">Job Site Task</span>?
              </h4>
              <p className="text-xs text-[#9aa0ac]">
                Geofence detected arrival at <strong className="text-amber-300">[{job.jobNumber}] {job.title}</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            title="Dismiss suggestion"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <button
            onClick={() => onAcceptSwitchTask('Job Site')}
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#ff6700] to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-transform"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Switch to Job Site</span>
          </button>
          <button
            onClick={onDismiss}
            className="h-11 px-4 rounded-xl bg-[#1b1d24] hover:bg-[#252833] text-slate-300 font-bold text-xs border border-[#2e323f]"
          >
            Stay on Travel
          </button>
        </div>
      </div>
    );
  }

  // Case 3: Worker is CLOCKED OUT and has arrived inside a work zone!
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#1a110a] via-[#141215] to-[#0b0c10] border-2 border-[#ff6700] rounded-2xl p-4.5 shadow-[0_0_35px_rgba(255,103,0,0.25)]">
      {/* Top safety hazard bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff6700] via-amber-400 to-[#ff6700]" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff6700] to-amber-500 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#0a0b0d] rounded-[10px] flex items-center justify-center text-[#ff6700]">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/20 text-[#ff8c42] border border-orange-500/40">
                📍 Geofence Arrival Detected
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-400">
                {distanceFormatted} away
              </span>
              {accuracy && (
                <span className="text-[10px] text-slate-400 font-mono">
                  (GPS ±{accuracy}m)
                </span>
              )}
            </div>

            <h4 className="font-bold text-base text-white leading-snug">
              Arrived at [{job.jobNumber}] {job.title}
            </h4>

            <p className="text-xs text-[#9ba0ad] flex items-center gap-1.5">
              <span>{job.address}</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-semibold">{job.closureType}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          title="Dismiss suggestion"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          onClick={() => onAcceptClockIn(job, 'Job Site')}
          className="h-12 rounded-xl bg-gradient-to-r from-[#ff6700] to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Clock In to {job.jobNumber} Now</span>
        </button>

        <button
          onClick={() => onSelectJobOnly(job)}
          className="h-12 rounded-xl bg-[#1c1d25] hover:bg-[#252835] text-amber-300 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>Select Job (Review First)</span>
        </button>
      </div>
    </div>
  );
};
