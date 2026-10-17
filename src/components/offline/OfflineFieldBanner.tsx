import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FieldSyncState } from '../../types';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  CloudOff,
  SignalZero,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Zap,
  Bug,
  PlusCircle,
} from 'lucide-react';

export const OfflineFieldBanner: React.FC = () => {
  const {
    isOnline,
    isSimulatedOffline,
    setIsSimulatedOffline,
    syncOfflineQueue,
    lastSyncTime,
    timeClockSyncState,
    formSyncState,
    overallSyncState,
    queuedTimeEntriesCount,
    queuedFormsCount,
    errorCount,
    syncErrorMessage,
    simulatedSyncError,
    setSimulatedSyncError,
    queueSampleOfflinePunch,
    queueSampleOfflineForm,
  } = useApp();

  const [expanded, setExpanded] = useState(false);

  // Helper to render state badge styling
  const renderSyncBadge = (state: FieldSyncState, label?: string) => {
    switch (state) {
      case 'Error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.25)] animate-pulse">
            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
            <span>{label || 'Error'}</span>
          </span>
        );
      case 'Queued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <Clock className="w-3 h-3 text-amber-400 shrink-0 animate-spin-slow" />
            <span>{label || 'Queued'}</span>
          </span>
        );
      case 'Synced':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/35">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{label || 'Synced'}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full transition-all select-none">
      {/* Primary Status Strip with Live Sync Indicator */}
      <div
        className={`px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors border-b flex-wrap gap-2 ${
          overallSyncState === 'Error'
            ? 'bg-red-950/40 border-red-700/60 text-red-300'
            : !isOnline || overallSyncState === 'Queued'
            ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            : 'bg-[#101115] border-[#1f2127] text-[#8e929b]'
        }`}
      >
        {/* Left: Cellular Connectivity */}
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <SignalZero className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-extrabold text-white text-[11px] sm:text-xs">
                OFFLINE MODE ACTIVE
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] sm:text-xs text-slate-300">Cellular Connected</span>
            </div>
          )}

          <span className="hidden md:inline text-slate-700">|</span>

          {/* Center: Explicit Visual Indicator for Sync Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sync Status:</span>
            {renderSyncBadge(
              overallSyncState,
              overallSyncState === 'Error'
                ? `Error (${errorCount})`
                : overallSyncState === 'Queued'
                ? `Queued (${queuedTimeEntriesCount + queuedFormsCount})`
                : 'Synced'
            )}

            {/* Subsystem mini breakdown pills */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] pl-1 text-slate-400">
              <span className="bg-[#181920] px-1.5 py-0.5 rounded border border-[#2b2d35]">
                Punches: <strong className={timeClockSyncState === 'Error' ? 'text-red-400' : timeClockSyncState === 'Queued' ? 'text-amber-400' : 'text-emerald-400'}>{timeClockSyncState}</strong>
                {queuedTimeEntriesCount > 0 && ` (${queuedTimeEntriesCount})`}
              </span>
              <span className="bg-[#181920] px-1.5 py-0.5 rounded border border-[#2b2d35]">
                Forms: <strong className={formSyncState === 'Error' ? 'text-red-400' : formSyncState === 'Queued' ? 'text-amber-400' : 'text-emerald-400'}>{formSyncState}</strong>
                {queuedFormsCount > 0 && ` (${queuedFormsCount})`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {overallSyncState === 'Error' && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Sync</span>
            </button>
          )}

          {overallSyncState === 'Queued' && (
            <button
              onClick={syncOfflineQueue}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync {queuedTimeEntriesCount + queuedFormsCount} Queued</span>
            </button>
          )}

          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-[#15161b] hover:bg-[#1d1f27] border border-[#272a33] transition-colors cursor-pointer"
          >
            <span>Sync Details</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Sync Details Drawer */}
      {expanded && (
        <div className="p-3.5 bg-[#0d0e12] border-b border-[#212328] text-xs space-y-3 animate-in fade-in duration-200">
          {/* Subsystem Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Time Clock Entries Sync Status */}
            <div className="p-3 rounded-2xl bg-[#14151a] border border-[#23252c] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#ff6700]" />
                  <span>Time Clock Entries</span>
                </span>
                {renderSyncBadge(timeClockSyncState)}
              </div>
              <div className="font-bold text-white text-sm">
                {timeClockSyncState === 'Synced'
                  ? 'All Punches Synced'
                  : timeClockSyncState === 'Queued'
                  ? `${queuedTimeEntriesCount} Punch(es) Queued`
                  : 'Time Punch Sync Error'}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {queuedTimeEntriesCount > 0
                  ? 'Punches stored in local device cache awaiting cellular uplink.'
                  : 'Current shift hours verified with central dispatch timesheet.'}
              </p>
              <div className="pt-1">
                <button
                  onClick={queueSampleOfflinePunch}
                  className="w-full py-1 px-2 rounded-lg bg-[#1d1f27] hover:bg-[#252833] text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 border border-amber-500/30"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Simulate Queued Offline Punch</span>
                </button>
              </div>
            </div>

            {/* 2. Field Form Submissions Sync Status */}
            <div className="p-3 rounded-2xl bg-[#14151a] border border-[#23252c] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
                  <FileCheck2 className="w-3 h-3 text-amber-400" />
                  <span>Form Submissions</span>
                </span>
                {renderSyncBadge(formSyncState)}
              </div>
              <div className="font-bold text-white text-sm">
                {formSyncState === 'Synced'
                  ? 'All Forms Delivered'
                  : formSyncState === 'Queued'
                  ? `${queuedFormsCount} Form(s) Queued`
                  : 'Form Submission Error'}
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                {queuedFormsCount > 0
                  ? 'MUTCD / JHA field forms saved offline in LocalStorage queue.'
                  : 'All signatures & daily logs confirmed delivered.'}
              </p>
              <div className="pt-1">
                <button
                  onClick={queueSampleOfflineForm}
                  className="w-full py-1 px-2 rounded-lg bg-[#1d1f27] hover:bg-[#252833] text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 border border-amber-500/30"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>Simulate Queued Offline Form</span>
                </button>
              </div>
            </div>

            {/* 3. Dispatch Relay & Storage Engine */}
            <div className="p-3 rounded-2xl bg-[#14151a] border border-[#23252c] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#8e929b] flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  <span>Dispatch Relay Gateway</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {lastSyncTime}
                </span>
              </div>
              <div className="font-bold text-white text-sm flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>IndexedDB + ServiceWorker</span>
              </div>
              {syncErrorMessage ? (
                <div className="p-1.5 rounded bg-red-950/70 border border-red-700/60 text-red-300 text-[10px] font-mono">
                  {syncErrorMessage}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 leading-tight">
                  Auto-sync triggers automatically whenever cell signal reconnects.
                </p>
              )}
              <div className="pt-1">
                <button
                  onClick={syncOfflineQueue}
                  className="w-full py-1 px-2 rounded-lg bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-[10px] flex items-center justify-center gap-1 shadow-sm"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Force Relay Sync Now</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test & Simulation Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#1f2128]">
            {/* Dead-Zone Simulator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14151a] border border-[#23252c]">
              <div>
                <span className="font-bold text-slate-200 text-xs">Simulate Tunnel / Dead Zone</span>
                <p className="text-[10px] text-[#8e929b]">Forces offline cellular condition to test queueing</p>
              </div>

              <button
                onClick={() => setIsSimulatedOffline((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSimulatedOffline
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-[#1b1c24] border border-[#2e313d] text-slate-300 hover:text-white'
                }`}
              >
                {isSimulatedOffline ? 'Simulating Offline' : 'Simulate Dead Zone'}
              </button>
            </div>

            {/* Error Simulator */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#14151a] border border-[#23252c]">
              <div>
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5 text-red-400" />
                  <span>Simulate Dispatch Sync Error</span>
                </span>
                <p className="text-[10px] text-[#8e929b]">Tests the 'Error' state display & retry flow</p>
              </div>

              <button
                onClick={() => setSimulatedSyncError((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  simulatedSyncError
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-[#1b1c24] border border-[#2e313d] text-slate-300 hover:text-white'
                }`}
              >
                {simulatedSyncError ? 'Simulating Error' : 'Simulate Error'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
