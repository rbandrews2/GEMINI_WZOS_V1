import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskCategory, Job } from '../../types';
import { useGeofencing } from '../../hooks/useGeofencing';
import { GeofenceArrivalCard } from './GeofenceArrivalCard';
import { GeofenceMonitorBar } from './GeofenceMonitorBar';
import {
  Clock,
  Play,
  Square,
  Repeat,
  MapPin,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Car,
  HardHat,
  Users2,
  HelpCircle,
  Navigation,
  Zap,
  ShieldCheck,
  Radio,
  Satellite,
} from 'lucide-react';

export const TimeClockTab: React.FC = () => {
  const {
    currentUser,
    jobs,
    activeEntry,
    activeSeconds,
    clockIn,
    clockOut,
    switchTask,
    timeEntries,
    setActiveTab,
    setSelectedJobForNav,
    playBeep,
  } = useApp();

  const [selectedJobId, setSelectedJobId] = useState<string>(() => {
    return jobs.length > 0 ? jobs[0].id : '';
  });

  const [selectedTask, setSelectedTask] = useState<TaskCategory>('Job Site');
  const [punchNotes, setPunchNotes] = useState<string>('');
  const [showSwitchModal, setShowSwitchModal] = useState<boolean>(false);
  const [newSwitchTask, setNewSwitchTask] = useState<TaskCategory>('Job Site');

  // Work Zone Geofencing Hook
  const {
    coords,
    accuracy,
    gpsStatus,
    geofenceRadius,
    setGeofenceRadius,
    evaluations,
    nearestEvaluation,
    arrivedEvaluation,
    isInsideGeofence,
    isSimulated,
    simulatedJobName,
    autoSelectJob,
    setAutoSelectJob,
    simulateArrivalAtJob,
    simulateEnRoute,
    resetToRealGps,
    dismissArrivalSuggestion,
  } = useGeofencing({
    jobs,
    onArrival: (job) => {
      playBeep('alert');
      if (autoSelectJob && !activeEntry) {
        setSelectedJobId(job.id);
        setSelectedTask('Job Site');
      }
    },
  });

  const taskOptions: { task: TaskCategory; icon: React.ReactNode; desc: string; color: string }[] = [
    {
      task: 'Travel Time',
      icon: <Car className="w-5 h-5 text-amber-400" />,
      desc: 'Vehicle transport & mobilization',
      color: 'border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10',
    },
    {
      task: 'Job Site',
      icon: <HardHat className="w-5 h-5 text-[#ff6700]" />,
      desc: 'Taper setup, flagging & attenuator ops',
      color: 'border-orange-500/40 hover:border-orange-400 hover:bg-orange-500/10',
    },
    {
      task: 'Meeting',
      icon: <Users2 className="w-5 h-5 text-amber-300" />,
      desc: 'Tailgate safety briefing & DOT sync',
      color: 'border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10',
    },
    {
      task: 'Other',
      icon: <HelpCircle className="w-5 h-5 text-[#ff8c42]" />,
      desc: 'Yard maintenance & truck inspection',
      color: 'border-orange-500/40 hover:border-orange-400 hover:bg-orange-500/10',
    },
  ];

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentJob = jobs.find((j) => j.id === (activeEntry ? activeEntry.jobId : selectedJobId));

  // Calculate today's stats for current user
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayEntries = timeEntries.filter(
    (e) => e.userId === currentUser?.id && e.date === todayStr
  );

  const totalMinutesToday = userTodayEntries.reduce((acc, curr) => acc + curr.durationMinutes, 0) +
    (activeEntry ? Math.floor(activeSeconds / 60) : 0);

  const hoursToday = (totalMinutesToday / 60).toFixed(1);

  const taskBreakdownMinutes: Record<TaskCategory, number> = {
    'Travel Time': 0,
    'Job Site': 0,
    'Meeting': 0,
    'Other': 0,
  };

  userTodayEntries.forEach((e) => {
    if (taskBreakdownMinutes[e.task] !== undefined) {
      taskBreakdownMinutes[e.task] += e.durationMinutes;
    }
  });

  if (activeEntry && taskBreakdownMinutes[activeEntry.task] !== undefined) {
    taskBreakdownMinutes[activeEntry.task] += Math.floor(activeSeconds / 60);
  }

  const handleStartPunch = () => {
    if (!selectedJobId) return;
    clockIn(selectedJobId, selectedTask, punchNotes);
    setPunchNotes('');
  };

  const handleStopPunch = () => {
    clockOut(punchNotes);
    setPunchNotes('');
  };

  const handleConfirmSwitch = () => {
    switchTask(newSwitchTask, punchNotes);
    setShowSwitchModal(false);
    setPunchNotes('');
  };

  const currentJobEval = evaluations.find(
    (e) => e.job.id === (activeEntry ? activeEntry.jobId : selectedJobId)
  );

  const handleGeofenceClockIn = (job: Job, task: TaskCategory) => {
    setSelectedJobId(job.id);
    setSelectedTask(task);
    const distText = arrivedEvaluation ? arrivedEvaluation.distanceFormatted : 'Work Zone Area';
    clockIn(job.id, task, `Verified arrival via GPS Geofence (${distText})`);
  };

  const handleGeofenceSwitchTask = (task: TaskCategory) => {
    switchTask(task, `Auto-switched to ${task} on GPS Geofence arrival`);
  };

  const handleGeofenceSelectJobOnly = (job: Job) => {
    setSelectedJobId(job.id);
    setSelectedTask('Job Site');
    playBeep('punch');
  };

  const handleNavigateToJob = (job: typeof currentJob) => {
    if (!job) return;
    setSelectedJobForNav(job);
    setActiveTab('nav');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner: Worker Profile & Operational Status */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ff6700] to-amber-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#0a0b0d] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-base">
                {currentUser?.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{currentUser?.name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1c1d24] text-amber-400 border border-[#2c2f38]">
                  {currentUser?.employeeId}
                </span>
              </div>
              <p className="text-xs text-[#8e929b]">{currentUser?.position}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase text-[#8e929b] block">Today's Shift</span>
            <span className="font-mono-numbers text-xl font-black text-amber-400">
              {hoursToday} <span className="text-xs font-normal text-[#8e929b]">hrs</span>
            </span>
          </div>
        </div>
      </div>

      {/* Geofence Operational Monitor & Test Utility */}
      <GeofenceMonitorBar
        gpsStatus={gpsStatus}
        accuracy={accuracy}
        nearestEvaluation={nearestEvaluation}
        isSimulated={isSimulated}
        simulatedJobName={simulatedJobName}
        geofenceRadius={geofenceRadius}
        onSetGeofenceRadius={setGeofenceRadius}
        jobs={jobs}
        onSimulateArrival={simulateArrivalAtJob}
        onSimulateEnRoute={simulateEnRoute}
        onResetRealGps={resetToRealGps}
        autoSelectJob={autoSelectJob}
        onToggleAutoSelect={setAutoSelectJob}
      />

      {/* Geofence Arrival Suggestion / Verification Card */}
      {arrivedEvaluation && (
        <GeofenceArrivalCard
          evaluation={arrivedEvaluation}
          accuracy={accuracy}
          isClockedIn={Boolean(activeEntry)}
          activeTask={activeEntry?.task}
          activeJobId={activeEntry?.jobId}
          onAcceptClockIn={handleGeofenceClockIn}
          onAcceptSwitchTask={handleGeofenceSwitchTask}
          onSelectJobOnly={handleGeofenceSelectJobOnly}
          onDismiss={() => dismissArrivalSuggestion(arrivedEvaluation.job.id)}
        />
      )}

      {/* Primary Punch Clock Card (Styled with Black, Amber, and Safety Orange) */}
      <div className="bg-[#121316] border-2 border-[#252830] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle top safety orange hazard strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff6700] via-amber-500 to-[#ff6700]" />

        {activeEntry ? (
          /* ACTIVE PUNCH STATE */
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Active Punch Session</span>
              </div>
              <span className="text-xs font-mono text-[#8e929b]">
                Punched {new Date(activeEntry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Giant Live Digital Stopwatch Display */}
            <div className="text-center py-5 bg-[#090a0c] rounded-2xl border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#8e929b] font-bold mb-1">
                Time Tracker Live Elapsed
              </div>
              <div className="font-mono-numbers text-5xl sm:text-6xl font-black text-white tracking-wider drop-shadow-md">
                {formatTimer(activeSeconds)}
              </div>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/40">
                <Zap className="w-3.5 h-3.5 text-[#ff6700] fill-[#ff6700]" />
                <span>Task: {activeEntry.task}</span>
              </div>
            </div>

            {/* Current Active Job Details with Geofence Status */}
            <div className="p-3.5 bg-[#17181e] rounded-xl border border-[#272a33] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#ff6700]">[{activeEntry.jobNumber}]</span>
                  {currentJobEval?.isInside ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>On-Site ({currentJobEval.distanceFormatted})</span>
                    </span>
                  ) : currentJobEval ? (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentJobEval.distanceFormatted} away
                    </span>
                  ) : null}
                </div>
                <span className="text-[#8e929b] truncate max-w-[160px]">{currentJob?.client}</span>
              </div>
              <p className="font-bold text-sm text-white line-clamp-1">
                {activeEntry.jobTitle}
              </p>
              <div className="flex items-center justify-between pt-1 text-xs text-[#8e929b]">
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {currentJob?.address}
                </span>
                {currentJob && (
                  <button
                    onClick={() => handleNavigateToJob(currentJob)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold shrink-0"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons: Switch Task & Clock Out */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setNewSwitchTask(activeEntry.task);
                  setShowSwitchModal(true);
                }}
                className="h-14 rounded-2xl bg-[#1a1b22] hover:bg-[#23252d] active:scale-[0.98] border border-[#2e313b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform"
              >
                <Repeat className="w-5 h-5 text-amber-400" />
                <span>Switch Task</span>
              </button>

              <button
                onClick={handleStopPunch}
                className="h-14 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Clock Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* CLOCKED OUT STATE: Select Job & Subcategory */
          <div className="space-y-5 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8e929b] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#ff6700] fill-[#ff6700]" />
                <span>Time Tracker · Punch Station</span>
              </div>
              <span className="text-xs font-semibold text-amber-400">Shift Ready</span>
            </div>

            {/* 1. Job Selector from Admin Job List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Work Zone Job</span>
                </label>
                {arrivedEvaluation && (
                  <span className="text-[10px] text-[#ff6700] font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#ff6700] animate-pulse" />
                    <span>Detected: {arrivedEvaluation.job.jobNumber}</span>
                  </span>
                )}
              </div>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full h-12 bg-[#090a0c] border border-[#2b2d35] rounded-xl px-3.5 text-sm font-medium text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                {jobs.map((job) => {
                  const ev = evaluations.find((e) => e.job.id === job.id);
                  const isJobHere = ev?.isInside;
                  return (
                    <option key={job.id} value={job.id}>
                      [{job.jobNumber}] {job.title} {ev ? `(${ev.distanceFormatted}${isJobHere ? ' • ON-SITE' : ''})` : ''}
                    </option>
                  );
                })}
              </select>
              {currentJob && (
                <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#8e929b]">
                  <div className="flex items-center gap-1 truncate pr-2">
                    <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="truncate">{currentJob.address}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-[#ff6700] font-bold">{currentJob.closureType}</span>
                  </div>
                  {currentJobEval && (
                    <span className={`shrink-0 font-mono font-bold ${currentJobEval.isInside ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {currentJobEval.isInside ? '✓ Inside Geofence' : currentJobEval.distanceFormatted}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 2. Subcategory Tasks Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Select Work Category / Task</span>
                </span>
                <span className="text-[11px] text-[#ff6700] font-black uppercase">{selectedTask}</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {taskOptions.map((opt) => {
                  const isChosen = selectedTask === opt.task;
                  return (
                    <button
                      key={opt.task}
                      type="button"
                      onClick={() => setSelectedTask(opt.task)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[74px] ${
                        isChosen
                          ? 'card-amber-active bg-[#181920]'
                          : `bg-[#090a0c] border-[#252830] ${opt.color}`
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="p-1 rounded-lg bg-[#141519] border border-[#2b2e38]">
                          {opt.icon}
                        </div>
                        {isChosen && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="mt-1">
                        <div className="font-bold text-xs text-white leading-tight">
                          {opt.task}
                        </div>
                        <div className="text-[10px] text-[#8e929b] line-clamp-1 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Optional Punch Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#8e929b]">
                Shift Notes / Work Vehicle (Optional)
              </label>
              <input
                type="text"
                value={punchNotes}
                onChange={(e) => setPunchNotes(e.target.value)}
                placeholder="e.g. Operating TMA-04 with Sam; setting 3-lane taper"
                className="w-full h-11 bg-[#090a0c] border border-[#2b2d35] rounded-xl px-3.5 text-xs text-white placeholder-[#5d616c] focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Giant High-Visibility Safety Orange Punch Button */}
            <button
              onClick={handleStartPunch}
              disabled={!selectedJobId}
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#ff6700] to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-black font-black text-lg tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-orange-600/30 uppercase transition-all cursor-pointer"
            >
              <Zap className="w-6 h-6 fill-current" />
              <span>CLOCK IN NOW</span>
            </button>
          </div>
        )}
      </div>

      {/* Task Summary Badges for Today */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl p-4 shadow-lg">
        <h3 className="font-display font-bold text-sm text-white mb-3 flex items-center justify-between">
          <span>Today's Task Breakdown</span>
          <span className="text-xs font-normal text-[#8e929b]">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['Travel Time', 'Job Site', 'Meeting', 'Other'] as TaskCategory[]).map((task) => {
            const minutes = taskBreakdownMinutes[task];
            const hrs = (minutes / 60).toFixed(1);
            return (
              <div
                key={task}
                className="p-3.5 rounded-xl bg-[#090a0c] border border-[#23252c] flex flex-col justify-between"
              >
                <span className="text-xs font-bold text-[#8e929b] truncate">{task}</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-mono-numbers text-xl font-black text-white">{hrs}</span>
                  <span className="text-[11px] text-amber-400 font-semibold">hrs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Punches Today */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-sm text-white">Today's Punch Log</h3>
          <button
            onClick={() => setActiveTab('timesheets')}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold"
          >
            Work Zone Report →
          </button>
        </div>

        {userTodayEntries.length === 0 && !activeEntry ? (
          <div className="text-center py-6 text-[#8e929b] text-xs">
            No punches logged yet today. Select a job above and clock in!
          </div>
        ) : (
          <div className="space-y-2">
            {activeEntry && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300">ACTIVE: {activeEntry.task}</span>
                    <span className="text-[10px] font-mono text-[#ff6700] font-bold">[{activeEntry.jobNumber}]</span>
                  </div>
                  <div className="text-xs text-white mt-0.5">{activeEntry.jobTitle}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono-numbers font-black text-sm text-amber-400">
                    {formatTimer(activeSeconds)}
                  </span>
                  <span className="block text-[10px] text-amber-500 font-bold">In Progress</span>
                </div>
              </div>
            )}

            {userTodayEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl bg-[#090a0c] border border-[#212328] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{entry.task}</span>
                    <span className="text-[10px] font-mono text-[#ff6700] font-bold">[{entry.jobNumber}]</span>
                  </div>
                  <div className="text-xs text-[#8e929b] line-clamp-1 mt-0.5">{entry.jobTitle}</div>
                </div>
                <div className="text-right">
                  <span className="font-mono-numbers font-bold text-sm text-white">
                    {(entry.durationMinutes / 60).toFixed(1)}h
                  </span>
                  <span className="block text-[10px] text-[#8e929b]">
                    {entry.durationMinutes} mins
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Switch Task Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121316] border border-[#2c2f38] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Switch Active Task</h3>
              <p className="text-xs text-[#8e929b]">
                Closes previous task subcategory and starts next task under this active job.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">New Task Subcategory</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Travel Time', 'Job Site', 'Meeting', 'Other'] as TaskCategory[]).map((task) => (
                  <button
                    key={task}
                    onClick={() => setNewSwitchTask(task)}
                    className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                      newSwitchTask === task
                        ? 'card-amber-active bg-[#171820] text-amber-300'
                        : 'bg-[#090a0c] border-[#252830] text-slate-300 hover:border-amber-500/40'
                    }`}
                  >
                    {task}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Switch Note (Optional)</label>
              <input
                type="text"
                value={punchNotes}
                onChange={(e) => setPunchNotes(e.target.value)}
                placeholder="e.g. Finished travel; arrived on site"
                className="w-full h-11 bg-[#090a0c] border border-[#2c2f38] rounded-xl px-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="flex-1 h-12 rounded-xl bg-[#1b1c22] hover:bg-[#252731] text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="flex-1 h-12 rounded-xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs shadow-md shadow-orange-600/30"
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
