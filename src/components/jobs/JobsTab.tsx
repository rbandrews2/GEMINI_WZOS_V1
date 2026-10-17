import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Job } from '../../types';
import {
  Briefcase,
  Plus,
  MapPin,
  Clock,
  Navigation,
  Edit2,
  Trash2,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  X,
  Gauge,
  HardHat,
} from 'lucide-react';

export const JobsTab: React.FC = () => {
  const {
    jobs,
    addJob,
    updateJob,
    deleteJob,
    currentUser,
    users,
    setActiveTab,
    setSelectedJobForNav,
    clockIn,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'scheduled' | 'completed'>('all');

  // Modal State for Add / Edit Job (Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form State
  const [formJobNumber, setFormJobNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formLocationName, setFormLocationName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('37.3382');
  const [formLng, setFormLng] = useState('-121.8863');
  const [formClosureType, setFormClosureType] = useState('Right 2 Lanes & Shoulder Taper');
  const [formStatus, setFormStatus] = useState<'active' | 'scheduled' | 'completed'>('active');
  const [formSpeedLimit, setFormSpeedLimit] = useState('45');
  const [formSafetyNotes, setFormSafetyNotes] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAssignedMembers, setFormAssignedMembers] = useState<string[]>([]);

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        job.jobNumber.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q) ||
        job.client.toLowerCase().includes(q) ||
        job.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingJob(null);
    setFormJobNumber(`WZ-${Math.floor(100 + Math.random() * 899)}`);
    setFormTitle('');
    setFormClient('Superior Traffic Services / Caltrans');
    setFormLocationName('');
    setFormAddress('');
    setFormLat('37.3382');
    setFormLng('-121.8863');
    setFormClosureType('Right 2 Lanes & Shoulder Taper');
    setFormStatus('active');
    setFormSpeedLimit('45');
    setFormSafetyNotes('MUTCD Chapter 6 compliance. Class 3 apparel mandatory. Check attenuator buffer.');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormAssignedMembers([currentUser?.id || 'usr-member-1']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setFormJobNumber(job.jobNumber);
    setFormTitle(job.title);
    setFormClient(job.client);
    setFormLocationName(job.locationName);
    setFormAddress(job.address);
    setFormLat(job.coordinates[0].toString());
    setFormLng(job.coordinates[1].toString());
    setFormClosureType(job.closureType);
    setFormStatus(job.status);
    setFormSpeedLimit(job.speedLimit.toString());
    setFormSafetyNotes(job.safetyNotes);
    setFormStartDate(job.startDate);
    setFormAssignedMembers(job.assignedMemberIds || []);
    setIsModalOpen(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(formLat) || 37.3382;
    const lng = parseFloat(formLng) || -121.8863;
    const speed = parseInt(formSpeedLimit, 10) || 45;

    if (editingJob) {
      updateJob(editingJob.id, {
        jobNumber: formJobNumber,
        title: formTitle,
        client: formClient,
        locationName: formLocationName,
        address: formAddress,
        coordinates: [lat, lng],
        closureType: formClosureType,
        status: formStatus,
        speedLimit: speed,
        safetyNotes: formSafetyNotes,
        startDate: formStartDate,
        assignedMemberIds: formAssignedMembers,
      });
    } else {
      addJob({
        jobNumber: formJobNumber,
        title: formTitle,
        client: formClient,
        locationName: formLocationName || formTitle,
        address: formAddress || 'Corridor MP 0.0',
        coordinates: [lat, lng],
        closureType: formClosureType,
        status: formStatus,
        speedLimit: speed,
        safetyNotes: formSafetyNotes,
        startDate: formStartDate,
        assignedMemberIds: formAssignedMembers,
      });
    }
    setIsModalOpen(false);
  };

  const handleClockInHere = (job: Job) => {
    clockIn(job.id, 'Job Site', `Clocked in directly from Job List: ${job.jobNumber}`);
    setActiveTab('clock');
  };

  const handleNavigateHere = (job: Job) => {
    setSelectedJobForNav(job);
    setActiveTab('nav');
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-400" />
              <h2 className="font-display font-bold text-lg text-white">Work Zone Job Directory</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin-curated project list. Select any job to clock in or initiate turn-by-turn navigation.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enter New Job</span>
            </button>
          )}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-800">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Job #, client, highway or address..."
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['all', 'active', 'scheduled', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === status
                    ? 'bg-orange-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredJobs.map((job) => {
          return (
            <div
              key={job.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2.5 py-1 rounded-md bg-orange-500/10 border border-orange-500/40 text-orange-400">
                      {job.jobNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        job.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/30'
                          : job.status === 'scheduled'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-600/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(job)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Job (Admin)"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-white line-clamp-1">{job.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{job.client}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{job.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-orange-300 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded">
                      {job.closureType}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Gauge className="w-3 h-3 text-amber-400" />
                      {job.speedLimit} MPH Zone
                    </span>
                  </div>
                </div>

                {job.safetyNotes && (
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{job.safetyNotes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Clock In & Navigate */}
              <div className="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleNavigateHere(job)}
                  className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-orange-400" />
                  <span>Navigate</span>
                </button>

                <button
                  onClick={() => handleClockInHere(job)}
                  className="h-11 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-transform active:scale-[0.98]"
                >
                  <Clock className="w-4 h-4 fill-current" />
                  <span>Clock In</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Add/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  {editingJob ? `Edit Job [${editingJob.jobNumber}]` : 'Create New Work Zone Job'}
                </h3>
                <p className="text-xs text-orange-400 font-medium">
                  Admin entries become immediately visible for all field crew clock-ins.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Job Number</label>
                  <input
                    type="text"
                    value={formJobNumber}
                    onChange={(e) => setFormJobNumber(e.target.value)}
                    placeholder="WZ-512"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  >
                    <option value="active">Active (In Progress)</option>
                    <option value="scheduled">Scheduled (Upcoming)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Job Title / Highway Segment</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. US-101 NB Night Lane Closure MP 44-48"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Client / Agency</label>
                <input
                  type="text"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  placeholder="e.g. Superior Traffic Services / Caltrans"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Physical Location / Address</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="e.g. US-101 NB Milepost 46.2, San Jose, CA"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Closure Type</label>
                  <input
                    type="text"
                    value={formClosureType}
                    onChange={(e) => setFormClosureType(e.target.value)}
                    placeholder="e.g. Right 2 Lanes & Taper"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Work Zone Speed (MPH)</label>
                  <input
                    type="number"
                    value={formSpeedLimit}
                    onChange={(e) => setFormSpeedLimit(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">GPS Latitude</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="37.3382"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">GPS Longitude</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="-121.8863"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Safety Notes / Required PPE</label>
                <textarea
                  value={formSafetyNotes}
                  onChange={(e) => setFormSafetyNotes(e.target.value)}
                  rows={2}
                  placeholder="Specific lane closure rules, attenuator standoff distances, or radio channels."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  {editingJob ? 'Update Job' : 'Publish Job to Crew'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
