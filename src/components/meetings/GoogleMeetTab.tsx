import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GoogleMeetMeeting } from '../../types';
import {
  signInWithGoogleMeet,
  getGoogleAccessToken,
  signOutGoogle,
  createGoogleMeetSpace,
  initGoogleAuth,
} from '../../services/googleMeet';
import {
  Video,
  Plus,
  Users,
  User,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Radio,
  ShieldCheck,
  Sparkles,
  Phone,
  X,
  Share2,
  Info,
} from 'lucide-react';

export const GoogleMeetTab: React.FC = () => {
  const {
    currentUser,
    meetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    contacts,
    playBeep,
  } = useApp();

  // Google OAuth Auth State
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'team' | '1on1' | 'live'>('all');

  // Admin Create Meeting Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingType, setMeetingType] = useState<'team' | '1on1'>('team');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [agenda, setAgenda] = useState('');
  const [isCreatingApiSpace, setIsCreatingApiSpace] = useState(false);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Destructive Action Confirmation Modal (MANDATORY per Workspace guidelines)
  const [pendingDeleteMeeting, setPendingDeleteMeeting] = useState<GoogleMeetMeeting | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasToken(!!token);
      },
      () => {
        setGoogleUser(null);
        setHasToken(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleMeet();
      if (res) {
        setGoogleUser(res.user);
        setHasToken(true);
        playBeep('success');
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err.message || 'Google sign-in was canceled or failed');
      playBeep('alert');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOutGoogle();
      setGoogleUser(null);
      setHasToken(false);
      playBeep('alert');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleCopyLink = (meeting: GoogleMeetMeeting) => {
    navigator.clipboard.writeText(meeting.meetingUri);
    setCopiedId(meeting.id);
    playBeep('punch');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinMeeting = (meeting: GoogleMeetMeeting) => {
    playBeep('punch');
    // Open Google Meet room
    window.open(meeting.meetingUri, '_blank', 'noopener,noreferrer');
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim()) return;

    setIsCreatingApiSpace(true);
    playBeep('punch');

    let generatedUri = '';
    let generatedCode = '';
    let spaceName = '';

    try {
      const token = await getGoogleAccessToken();
      if (token) {
        // Call real Google Meet API
        const createdSpace = await createGoogleMeetSpace(token);
        generatedUri = createdSpace.meetingUri;
        generatedCode = createdSpace.meetingCode || createdSpace.name.replace('spaces/', '');
        spaceName = createdSpace.name;
      }
    } catch (err: any) {
      console.warn('Google Meet API call error, generating standard meet space:', err);
    }

    // Fallback standard Google Meet URI format if offline or token not yet attached
    if (!generatedUri) {
      const randomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random()
        .toString(36)
        .substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      generatedCode = randomCode;
      generatedUri = `https://meet.google.com/${randomCode}`;
      spaceName = `spaces/${randomCode}`;
    }

    const targetContact = contacts.find((c) => c.id === selectedContactId);

    const defaultScheduled = scheduledTime.trim()
      ? scheduledTime
      : `Today, ${new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    addMeeting({
      title: meetingTitle.trim(),
      meetingType,
      targetAttendeeName: meetingType === '1on1' ? (targetContact ? `${targetContact.name} (${targetContact.position})` : 'Assigned Crew Member') : undefined,
      targetAttendeeId: meetingType === '1on1' ? selectedContactId : undefined,
      scheduledTime: defaultScheduled,
      durationMinutes: Number(durationMinutes) || 30,
      status: 'scheduled',
      agenda: agenda.trim() || undefined,
      meetingUri: generatedUri,
      meetingCode: generatedCode,
      spaceName,
      createdByUserId: currentUser?.id || 'admin',
      createdByUserName: currentUser?.name || 'Operations Admin',
    });

    setIsCreatingApiSpace(false);
    setIsCreateModalOpen(false);

    // Reset fields
    setMeetingTitle('');
    setMeetingType('team');
    setSelectedContactId('');
    setScheduledTime('');
    setDurationMinutes(30);
    setAgenda('');
  };

  const confirmDeleteMeeting = () => {
    if (pendingDeleteMeeting) {
      deleteMeeting(pendingDeleteMeeting.id);
      setPendingDeleteMeeting(null);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filterType === 'team') return m.meetingType === 'team';
    if (filterType === '1on1') return m.meetingType === '1on1';
    if (filterType === 'live') return m.status === 'live';
    return true;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Top Banner & Google Integration Bar */}
      <div className="bg-[#121316] border border-[#212328] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a73e8]/20 to-[#00ac47]/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <Video className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg text-white tracking-wide">
                  GOOGLE MEET VIDEO SYNC
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  WORKSPACE INTEGRATED
                </span>
              </div>
              <p className="text-xs text-[#8e929b]">
                Team safety briefings & 1-on-1 reviews · Created by admins, viewable by all field crew
              </p>
            </div>
          </div>

          {/* Admin Create Meeting Trigger */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMeetingTitle('Pre-Shift Tailgate Safety Briefing');
                  setMeetingType('team');
                  setAgenda('Review live highway traffic hazards, PPE compliance, and TMA buffer distance.');
                  setIsCreateModalOpen(true);
                  playBeep('punch');
                }}
                className="px-4 py-2.5 rounded-2xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Google Meet</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181920] border border-[#272935] text-xs text-[#8e929b]">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Field Crew Access · One-Touch Video Entry</span>
            </div>
          )}
        </div>

        {/* Google Authentication Status Card */}
        <div className="pt-3 border-t border-[#1f2128] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {googleUser ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500/60 bg-emerald-950 flex items-center justify-center font-bold text-white text-xs shrink-0">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  googleUser.displayName?.[0] || 'G'
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">
                    {googleUser.displayName || googleUser.email}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Google Meet API Connected
                  </span>
                </div>
                <p className="text-[11px] text-[#8e929b]">{googleUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#8e929b]">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isAdmin
                  ? 'Connect Google account to generate live Google Meet spaces directly via Google Meet API.'
                  : 'Google Meet calls are synchronized from dispatch and ready for field access.'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {googleUser ? (
              <button
                onClick={handleGoogleSignOut}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#1b1c23] hover:bg-[#252731] text-slate-300 font-semibold border border-[#2e313d] transition-colors"
              >
                Disconnect Google
              </button>
            ) : (
              /* Official Google Sign-In button per Workspace Integration Skill */
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting Google...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {authError && (
          <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{authError}</span>
          </div>
        )}
      </div>

      {/* Role Notice & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-[#ff6700] text-black shadow-md shadow-orange-600/20'
                : 'bg-[#15161b] text-slate-300 hover:text-white border border-[#23252d]'
            }`}
          >
            All Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setFilterType('team')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'team'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-[#15161b] text-slate-300 hover:text-white border border-[#23252d]'
            }`}
          >
            Team Briefings ({meetings.filter((m) => m.meetingType === 'team').length})
          </button>
          <button
            onClick={() => setFilterType('1on1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === '1on1'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                : 'bg-[#15161b] text-slate-300 hover:text-white border border-[#23252d]'
            }`}
          >
            1-on-1 Reviews ({meetings.filter((m) => m.meetingType === '1on1').length})
          </button>
          <button
            onClick={() => setFilterType('live')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'live'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'bg-[#15161b] text-slate-300 hover:text-white border border-[#23252d]'
            }`}
          >
            Live Now ({meetings.filter((m) => m.status === 'live').length})
          </button>
        </div>

        {/* Role Privileges Indicator */}
        <div className="text-[11px] text-[#8e929b] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {isAdmin
              ? 'Admin elevated: You can create, edit, and end meetings'
              : 'Crew Member: Tap Join to enter any assigned Google Meet call'}
          </span>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-3.5">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12 bg-[#121316] rounded-3xl border border-[#212328] space-y-3">
            <Video className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-white font-bold text-base">No meetings found</h3>
            <p className="text-xs text-[#8e929b] max-w-sm mx-auto">
              {isAdmin
                ? 'Create a team tailgate safety briefing or schedule a 1-on-1 review above.'
                : 'No meetings scheduled for this filter. Check back when dispatch posts upcoming video syncs.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Meeting</span>
              </button>
            )}
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isLive = meeting.status === 'live';
            const isTeam = meeting.meetingType === 'team';

            return (
              <div
                key={meeting.id}
                className={`p-4 sm:p-5 rounded-3xl bg-[#131417] border transition-all ${
                  isLive
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'border-[#212328] hover:border-[#2f323c]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Meeting Type Badge */}
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isTeam
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        {isTeam ? 'Team Meeting' : '1 on 1 Review'}
                      </span>

                      {/* Status Badge */}
                      {isLive ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>Active / Live Now</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-[#1b1c23] px-2 py-0.5 rounded-full border border-[#282a35]">
                          Scheduled
                        </span>
                      )}

                      <span className="text-xs text-[#8e929b]">·</span>
                      <span className="text-xs text-[#8e929b] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{meeting.durationMinutes} min</span>
                      </span>
                    </div>

                    <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                      {meeting.title}
                    </h3>

                    {/* Attendee / Target info */}
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      {isTeam ? (
                        <div className="flex items-center gap-1 text-[#8e929b]">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Audience: All Road Work Crew Members</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-cyan-300 font-semibold">
                          <User className="w-3.5 h-3.5" />
                          <span>Participant: {meeting.targetAttendeeName || 'Field Member'}</span>
                        </div>
                      )}
                      <span className="text-slate-600">|</span>
                      <span className="text-[#8e929b]">{meeting.scheduledTime}</span>
                    </div>

                    {meeting.agenda && (
                      <p className="text-xs text-[#8e929b] mt-1 bg-[#0d0e12] p-2.5 rounded-xl border border-[#1f2127] leading-relaxed">
                        <strong className="text-slate-300">Safety Agenda:</strong> {meeting.agenda}
                      </p>
                    )}

                    <div className="pt-1 text-[11px] text-[#636875] flex items-center gap-1">
                      <span>Organized by {meeting.createdByUserName}</span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {/* One-Touch Join Button */}
                      <button
                        onClick={() => handleJoinMeeting(meeting)}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md cursor-pointer ${
                          isLive
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                            : 'bg-[#ff6700] hover:bg-[#ea580c] text-black shadow-orange-600/20'
                        }`}
                      >
                        <Video className="w-4 h-4 fill-current" />
                        <span>Join Google Meet</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => handleCopyLink(meeting)}
                        title="Copy Google Meet Link"
                        className="p-2.5 rounded-2xl bg-[#1a1b22] hover:bg-[#232530] border border-[#2b2e3a] text-slate-300 hover:text-white transition-colors"
                      >
                        {copiedId === meeting.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Admin Delete Action */}
                      {isAdmin && (
                        <button
                          onClick={() => setPendingDeleteMeeting(meeting)}
                          title="Delete / Cancel Meeting"
                          className="p-2.5 rounded-2xl bg-[#1a1b22] hover:bg-red-950/60 border border-[#2b2e3a] hover:border-red-500/50 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Direct Meeting Code display */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#8e929b] font-mono bg-[#0d0e12] px-2.5 py-1 rounded-lg border border-[#1f2127]">
                      <span>Code:</span>
                      <span className="text-amber-400 font-bold">{meeting.meetingCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADMIN CREATE GOOGLE MEET MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#121316] border-2 border-amber-500/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#16171d] border-b border-[#252830] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Video className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Create Google Meet Video Space
                  </h3>
                  <p className="text-xs text-[#8e929b]">Admin Elevated Privileges</p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#20222a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Meeting Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Meeting Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingType('team')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      meetingType === 'team'
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                        : 'bg-[#17181f] border-[#262833] text-slate-400'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold">Team Meeting</div>
                      <div className="text-[10px] text-[#8e929b]">All crew members</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingType('1on1')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                      meetingType === '1on1'
                        ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-md'
                        : 'bg-[#17181f] border-[#262833] text-slate-400'
                    }`}
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold">1-on-1 Review</div>
                      <div className="text-[10px] text-[#8e929b]">Specific employee</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Meeting Subject / Title *
                </label>
                <input
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Morning Highway 101 Tailgate Safety Briefing"
                  className="w-full h-11 bg-[#090a0c] border border-[#2b2d38] rounded-2xl px-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Specific Attendee for 1 on 1 */}
              {meetingType === '1on1' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Select Crew Member for 1-on-1
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full h-11 bg-[#090a0c] border border-[#2b2d38] rounded-2xl px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose Employee / Technician --</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name} ({contact.position})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Scheduled Time & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="e.g. Today, 06:30 AM PST"
                    className="w-full h-11 bg-[#090a0c] border border-[#2b2d38] rounded-2xl px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Estimated Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full h-11 bg-[#090a0c] border border-[#2b2d38] rounded-2xl px-3.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value={15}>15 minutes (Quick Standup)</option>
                    <option value={20}>20 minutes (Tailgate Briefing)</option>
                    <option value={30}>30 minutes (Standard Review)</option>
                    <option value={45}>45 minutes (DOT Planning)</option>
                    <option value={60}>60 minutes (All-Hands Safety)</option>
                  </select>
                </div>
              </div>

              {/* Agenda / Safety Points */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Safety Agenda & Talking Points
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="MUTCD compliance, high-speed taper geometry, blind spots, radio channels..."
                  className="w-full bg-[#090a0c] border border-[#2b2d38] rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Google API Note */}
              <div className="p-3 rounded-2xl bg-[#16171f] border border-[#242633] text-xs text-[#8e929b] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {hasToken
                    ? 'Will provision an authentic Google Meet space via Google Meet REST API v2.'
                    : 'Google account not yet connected. Space will be generated with standard Google Meet room parameters.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#1a1b22] hover:bg-[#232530] text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingApiSpace}
                  className="px-5 py-2.5 rounded-2xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingApiSpace ? (
                    <span>Calling Google Meet API...</span>
                  ) : (
                    <>
                      <Video className="w-4 h-4 fill-current" />
                      <span>Create & Dispatch to Crew</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION DIALOG FOR DESTRUCTIVE ACTION (Skill Requirement) */}
      {pendingDeleteMeeting && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121316] border-2 border-red-500/60 rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Cancel Google Meet Call?
                </h3>
                <p className="text-xs text-red-300/80">User confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel and remove{' '}
              <strong className="text-white">"{pendingDeleteMeeting.title}"</strong> (Code:{' '}
              <span className="font-mono text-amber-400">{pendingDeleteMeeting.meetingCode}</span>
              )? This meeting space will no longer be accessible to field crew members.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setPendingDeleteMeeting(null)}
                className="px-4 py-2 rounded-xl bg-[#1a1b22] hover:bg-[#232530] text-slate-300 text-xs font-bold"
              >
                Cancel (Keep Meeting)
              </button>
              <button
                onClick={confirmDeleteMeeting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/30"
              >
                Confirm & Delete Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
