import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeEntry, TaskCategory } from '../../types';
import {
  FileSpreadsheet,
  Calendar,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle,
  Plus,
  ShieldCheck,
  User as UserIcon,
  Briefcase,
  Clock,
  Car,
  HardHat,
  Users2,
  HelpCircle,
  X,
  FileCheck2,
} from 'lucide-react';

export const TimeSheetsTab: React.FC = () => {
  const {
    currentUser,
    users,
    jobs,
    timeEntries,
    updateTimeEntry,
    deleteTimeEntry,
    addManualTimeEntry,
    approveTimeEntry,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Filters
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(isAdmin ? 'all' : (currentUser?.id || 'all'));
  const [selectedTaskFilter, setSelectedTaskFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Edit / Add Modal state
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Form fields for Edit / Add
  const [modalUserId, setModalUserId] = useState<string>(currentUser?.id || '');
  const [modalJobId, setModalJobId] = useState<string>(jobs[0]?.id || '');
  const [modalTask, setModalTask] = useState<TaskCategory>('Job Site');
  const [modalDate, setModalDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalStartTime, setModalStartTime] = useState<string>('07:00');
  const [modalEndTime, setModalEndTime] = useState<string>('15:30');
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<'submitted' | 'approved' | 'flagged'>('submitted');

  // Filter entries
  const filteredEntries = timeEntries.filter((entry) => {
    if (selectedUserFilter !== 'all' && entry.userId !== selectedUserFilter) return false;
    if (selectedTaskFilter !== 'all' && entry.task !== selectedTaskFilter) return false;
    if (selectedStatusFilter !== 'all' && entry.status !== selectedStatusFilter) return false;
    return true;
  });

  // Calculate totals
  const totalMinutes = filteredEntries.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const taskTotals = {
    'Travel Time': filteredEntries
      .filter((e) => e.task === 'Travel Time')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60,
    'Job Site': filteredEntries
      .filter((e) => e.task === 'Job Site')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60,
    'Meeting': filteredEntries
      .filter((e) => e.task === 'Meeting')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60,
    'Other': filteredEntries
      .filter((e) => e.task === 'Other')
      .reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60,
  };

  const handleOpenEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setModalUserId(entry.userId);
    setModalJobId(entry.jobId);
    setModalTask(entry.task);
    setModalDate(entry.date);

    const sTime = new Date(entry.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const eTime = entry.endTime ? new Date(entry.endTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '15:30';
    setModalStartTime(sTime);
    setModalEndTime(eTime);
    setModalNotes(entry.notes || '');
    setModalStatus(entry.status);
    setIsAddingNew(false);
  };

  const handleOpenAddNew = () => {
    setEditingEntry(null);
    setModalUserId(currentUser?.id || users[0]?.id || '');
    setModalJobId(jobs[0]?.id || '');
    setModalTask('Job Site');
    setModalDate(new Date().toISOString().split('T')[0]);
    setModalStartTime('07:00');
    setModalEndTime('15:30');
    setModalNotes('');
    setModalStatus('submitted');
    setIsAddingNew(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const userObj = users.find((u) => u.id === modalUserId);
    const jobObj = jobs.find((j) => j.id === modalJobId);

    // Calculate duration
    const [startH, startM] = modalStartTime.split(':').map(Number);
    const [endH, endM] = modalEndTime.split(':').map(Number);
    let durationMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMins <= 0) durationMins = 60; // fallback minimum 1 hour

    const startIso = new Date(`${modalDate}T${modalStartTime}:00`).toISOString();
    const endIso = new Date(`${modalDate}T${modalEndTime}:00`).toISOString();

    if (isAddingNew) {
      addManualTimeEntry({
        userId: userObj?.id || 'usr-gen',
        userName: userObj?.name || 'Field Crew',
        jobId: jobObj?.id || 'job-gen',
        jobNumber: jobObj?.jobNumber || 'WZ-GEN',
        jobTitle: jobObj?.title || 'General Road Work',
        task: modalTask,
        startTime: startIso,
        endTime: endIso,
        durationMinutes: durationMins,
        notes: modalNotes,
        status: modalStatus,
        date: modalDate,
      });
    } else if (editingEntry) {
      updateTimeEntry(editingEntry.id, {
        userId: userObj?.id || editingEntry.userId,
        userName: userObj?.name || editingEntry.userName,
        jobId: jobObj?.id || editingEntry.jobId,
        jobNumber: jobObj?.jobNumber || editingEntry.jobNumber,
        jobTitle: jobObj?.title || editingEntry.jobTitle,
        task: modalTask,
        startTime: startIso,
        endTime: endIso,
        durationMinutes: durationMins,
        notes: modalNotes,
        status: modalStatus,
        date: modalDate,
      });
    }

    setEditingEntry(null);
    setIsAddingNew(false);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Worker', 'Job Number', 'Job Title', 'Task Category', 'Start Time', 'End Time', 'Hours', 'Status', 'Notes'];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.date,
      `"${e.userName}"`,
      e.jobNumber,
      `"${e.jobTitle}"`,
      e.task,
      new Date(e.startTime).toLocaleTimeString(),
      e.endTime ? new Date(e.endTime).toLocaleTimeString() : 'Active',
      (e.durationMinutes / 60).toFixed(2),
      e.status,
      `"${e.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WZOS_TimeSheet_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTaskIcon = (task: TaskCategory) => {
    switch (task) {
      case 'Travel Time':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'Job Site':
        return <HardHat className="w-4 h-4 text-orange-400" />;
      case 'Meeting':
        return <Users2 className="w-4 h-4 text-sky-400" />;
      case 'Other':
        return <HelpCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header and Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-lg text-white">Time Sheets Hub</h2>
              {isAdmin && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Elevated Edit Access
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Certified labor hours with subcategory breakdown & audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>Export CSV</span>
            </button>

            {isAdmin && (
              <button
                onClick={handleOpenAddNew}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 text-xs font-bold shadow-md shadow-orange-600/30 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Punch</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
          {/* Worker Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <UserIcon className="w-3 h-3 text-slate-400" />
              <span>Crew Member</span>
            </label>
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Workers ({users.length})</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Task Subcategory Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Subcategory Task</span>
            </label>
            <select
              value={selectedTaskFilter}
              onChange={(e) => setSelectedTaskFilter(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Tasks</option>
              <option value="Travel Time">Travel Time</option>
              <option value="Job Site">Job Site</option>
              <option value="Meeting">Meeting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>Approval Status</span>
            </label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-lg px-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="submitted">Submitted</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Task Breakdown Card */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-2xl bg-orange-950/40 border border-orange-600/40 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-orange-400">Total Hours</span>
          <div className="mt-1">
            <span className="font-mono-numbers text-3xl font-black text-white">{totalHours}</span>
            <span className="text-xs text-orange-400 ml-1">hrs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Car className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Travel Time</span>
          </div>
          <div className="mt-1">
            <span className="font-mono-numbers text-xl font-bold text-white">{taskTotals['Travel Time'].toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">hrs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <HardHat className="w-3.5 h-3.5 text-orange-400" />
            <span className="truncate">Job Site</span>
          </div>
          <div className="mt-1">
            <span className="font-mono-numbers text-xl font-bold text-white">{taskTotals['Job Site'].toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">hrs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Users2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Meeting</span>
          </div>
          <div className="mt-1">
            <span className="font-mono-numbers text-xl font-bold text-white">{taskTotals['Meeting'].toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">hrs</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Other</span>
          </div>
          <div className="mt-1">
            <span className="font-mono-numbers text-xl font-bold text-white">{taskTotals['Other'].toFixed(1)}</span>
            <span className="text-xs text-slate-400 ml-1">hrs</span>
          </div>
        </div>
      </div>

      {/* Time Entries Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-sm text-white">
            Punches & Timesheet Entries ({filteredEntries.length})
          </h3>
          <span className="text-xs text-slate-400">
            {isAdmin ? 'Click Edit to adjust time as Admin' : 'Review personal hours'}
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No timesheet records found matching selected filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredEntries.map((entry) => {
              const startStr = new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const endStr = entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active';
              const hours = (entry.durationMinutes / 60).toFixed(1);

              return (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white">{entry.userName}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-xs font-mono font-bold text-orange-400">[{entry.jobNumber}]</span>
                      <span className="text-xs font-medium text-slate-300 truncate max-w-[200px]">{entry.jobTitle}</span>

                      {entry.editedByAdmin && (
                        <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-medium">
                          Admin Adjusted
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        {getTaskIcon(entry.task)}
                        {entry.task}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {entry.date}
                      </span>
                      <span>·</span>
                      <span>{startStr} – {endStr}</span>
                    </div>

                    {entry.notes && (
                      <p className="text-xs text-slate-400 italic pt-0.5">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div className="text-right">
                      <div className="font-mono-numbers text-base font-extrabold text-white">
                        {hours} <span className="text-xs text-slate-400 font-normal">hrs</span>
                      </div>
                      <span
                        className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          entry.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/30'
                            : entry.status === 'flagged'
                            ? 'bg-red-500/20 text-red-300 border border-red-600/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-600/30'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    {/* Elevated Admin Controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        {entry.status !== 'approved' && (
                          <button
                            onClick={() => approveTimeEntry(entry.id)}
                            title="Approve Entry"
                            className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(entry)}
                          title="Edit Entry (Admin)"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-orange-400" />
                        </button>

                        <button
                          onClick={() => deleteTimeEntry(entry.id)}
                          title="Delete Entry"
                          className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Add Modal (Elevated Admin) */}
      {(editingEntry || isAddingNew) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  {isAddingNew ? 'Add Manual Time Entry' : 'Admin: Edit Punch Record'}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Elevated operational edit · Changes are logged in audit trail
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setIsAddingNew(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5">
              {/* Worker Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Crew Member</label>
                <select
                  value={modalUserId}
                  onChange={(e) => setModalUserId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Work Zone Job</label>
                <select
                  value={modalJobId}
                  onChange={(e) => setModalJobId(e.target.value)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      [{j.jobNumber}] {j.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Task Category</label>
                <select
                  value={modalTask}
                  onChange={(e) => setModalTask(e.target.value as TaskCategory)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value="Travel Time">Travel Time</option>
                  <option value="Job Site">Job Site</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date & Time Range */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Start Time</label>
                  <input
                    type="time"
                    value={modalStartTime}
                    onChange={(e) => setModalStartTime(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">End Time</label>
                  <input
                    type="time"
                    value={modalEndTime}
                    onChange={(e) => setModalEndTime(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Approval Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as any)}
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes / Adjustment Reason</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Adjusted start time due to delayed lane opening by highway patrol."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntry(null);
                    setIsAddingNew(false);
                  }}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  {isAddingNew ? 'Create Time Entry' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
