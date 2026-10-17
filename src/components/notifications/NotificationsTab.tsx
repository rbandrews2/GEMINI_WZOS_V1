import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import {
  Bell,
  Calendar,
  ShieldAlert,
  Radio,
  CloudRain,
  CheckCircle2,
  Plus,
  Send,
  X,
  Clock,
  User,
  Check,
  Users,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    acknowledgeNotification,
    addNotification,
    currentUser,
    users,
    playBeep,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Compose Modal State (Admin)
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeType, setComposeType] = useState<'assignment' | 'safety' | 'dispatch' | 'weather'>('assignment');
  const [composeTarget, setComposeTarget] = useState('all');
  const [composeShiftDate, setComposeShiftDate] = useState('Tomorrow • 05:30 AM');

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'direct' | 'assignment' | 'safety' | 'dispatch' | 'weather'>('all');

  // Filter notifications based on role
  const filteredNotifs = notifications.filter((n) => {
    // If not admin, only show announcements for 'all' or specifically targeted to this user
    if (!isAdmin && currentUser) {
      if (n.targetUserId && n.targetUserId !== 'all' && n.targetUserId !== currentUser.id) {
        return false;
      }
    }

    if (activeFilter === 'direct') {
      return n.targetUserId && n.targetUserId !== 'all';
    }

    if (activeFilter !== 'all' && n.type !== activeFilter) {
      return false;
    }

    return true;
  });

  const handleOpenComposeAll = () => {
    setComposeTitle("Tomorrow's Shift Assignment: Job #WZ-104 US-101 NB");
    setComposeMessage('Report Time: 05:30 AM at Main Equipment Yard. Assigned Role: Lead TCS & Taper Setup. TMA Unit #04 assigned. Please confirm receipt.');
    setComposeType('assignment');
    setComposeTarget('all');
    setComposeShiftDate('Tomorrow • 05:30 AM');
    setIsComposeOpen(true);
  };

  const handleOpenComposeDirect = (userId?: string) => {
    const target = userId || (users.find((u) => u.role !== 'admin')?.id || 'all');
    const targetUser = users.find((u) => u.id === target);
    setComposeTitle(`Direct Dispatch Directive: ${targetUser ? targetUser.name : 'Crew Member'}`);
    setComposeMessage(`Reporting instructions: Proceed to Job #WZ-104 Mile Marker 14.8. Inspect taper placement and verify arrow board battery levels.`);
    setComposeType('dispatch');
    setComposeTarget(target);
    setComposeShiftDate('Immediate • On Site');
    setIsComposeOpen(true);
  };

  const handleApplyTemplate = (templateKey: 'assignment' | 'safety' | 'directive' | 'weather') => {
    if (templateKey === 'assignment') {
      setComposeTitle("Tomorrow's Shift Assignment: Job #WZ-104 US-101 NB");
      setComposeMessage('Report Time: 05:30 AM at Main Equipment Yard. Lead TCS and Taper crew dispatch. Bring Class 3 high-vis outerwear.');
      setComposeType('assignment');
      setComposeShiftDate('Tomorrow • 05:30 AM');
    } else if (templateKey === 'safety') {
      setComposeTitle('Safety Stand-Down: High Wind Ballasting Alert');
      setComposeMessage('Severe crosswinds detected in corridor. All crews must double-sandbag portable sign stands and check taper cone alignment immediately.');
      setComposeType('safety');
      setComposeShiftDate('Immediate Action Required');
    } else if (templateKey === 'directive') {
      setComposeTitle('Dispatch Directive: TMA Truck #04 Reassignment');
      setComposeMessage('Reassigning TMA #04 to back of buffer space. Report to Lead TCS Marcus Vance upon staging.');
      setComposeType('dispatch');
      setComposeShiftDate('Current Shift');
    } else if (templateKey === 'weather') {
      setComposeTitle('Severe Weather Warning: Lightning Protocol Suspension');
      setComposeMessage('Lightning detected within 8 miles. Cease elevated boom operations and barrier crane shifts. Personnel seek shelter in work trucks.');
      setComposeType('weather');
      setComposeShiftDate('Active Weather Hazard');
    }
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeMessage.trim()) return;

    const targetUserObj = users.find((u) => u.id === composeTarget);

    addNotification({
      title: composeTitle.trim(),
      message: composeMessage.trim(),
      type: composeType,
      targetUserId: composeTarget,
      targetUserName: targetUserObj ? `${targetUserObj.name} (${targetUserObj.position})` : 'All Field Crew Members',
      shiftDate: composeShiftDate.trim(),
      senderName: currentUser ? `${currentUser.name} (Admin)` : 'Operations Dispatch',
    });

    setIsComposeOpen(false);
  };

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment':
        return <Calendar className="w-5 h-5 text-orange-400" />;
      case 'safety':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'dispatch':
        return <Radio className="w-5 h-5 text-sky-400" />;
      case 'weather':
        return <CloudRain className="w-5 h-5 text-teal-400" />;
    }
  };

  const unreadCount = filteredNotifs.filter((n) => !n.read).length;

  return (
    <div className="space-y-5 pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-display font-bold text-lg text-white">Daily Assignments & In-App Dispatch</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-slate-950 animate-pulse">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time shift assignments, direct member messaging, weather advisories & worker shift acknowledgments.
            </p>
          </div>

          {/* Admin Dispatch Action Buttons */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleOpenComposeDirect()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                title="Send direct message to a specific crew member"
              >
                <User className="w-3.5 h-3.5 text-orange-400" />
                <span>Message Member</span>
              </button>

              <button
                onClick={handleOpenComposeAll}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-orange-600/30 transition-all active:scale-95 cursor-pointer"
                title="Broadcast assignment to all crew members"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Broadcast All Crew</span>
              </button>
            </div>
          )}
        </div>

        {/* Category & Scope Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-800/80 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-orange-600 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Messages ({notifications.length})
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveFilter('direct')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeFilter === 'direct'
                  ? 'bg-orange-600 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Direct to Member
            </button>
          )}

          <button
            onClick={() => setActiveFilter('assignment')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === 'assignment'
                ? 'bg-orange-600 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Shift Assignments
          </button>

          <button
            onClick={() => setActiveFilter('safety')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === 'safety'
                ? 'bg-orange-600 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Safety Advisories
          </button>

          <button
            onClick={() => setActiveFilter('dispatch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === 'dispatch'
                ? 'bg-orange-600 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Dispatch Directives
          </button>

          <button
            onClick={() => setActiveFilter('weather')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === 'weather'
                ? 'bg-orange-600 text-slate-950 shadow-sm'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Weather Alerts
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-300">No notifications found in this view</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAdmin
                ? 'Use the "Broadcast All Crew" or "Message Member" button above to send your first message.'
                : 'All shift assignments, weather alerts, and dispatch instructions will appear here.'}
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => {
            const isTargetedToMe = !item.targetUserId || item.targetUserId === 'all' || item.targetUserId === currentUser?.id;
            const isDirectToMember = item.targetUserId && item.targetUserId !== 'all';

            return (
              <div
                key={item.id}
                onClick={() => markNotificationRead(item.id)}
                className={`p-5 rounded-3xl border transition-all ${
                  !item.read
                    ? 'bg-slate-900 border-orange-500/50 shadow-xl shadow-orange-950/20 ring-1 ring-orange-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-bold text-sm text-white">{item.title}</h3>
                        {!item.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-500/20 animate-pulse" />
                        )}
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          {item.type}
                        </span>

                        {isDirectToMember ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>Direct: {item.targetUserName}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>Broadcast: All Crew</span>
                          </span>
                        )}
                      </div>

                      {item.shiftDate && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2.5 py-0.5 rounded-lg">
                          <Clock className="w-3 h-3" />
                          <span>{item.shiftDate}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed pt-1 whitespace-pre-line">{item.message}</p>

                      <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 flex-wrap">
                        <span>Sender: <b className="text-slate-200">{item.senderName}</b></span>
                        <span>·</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span className="text-slate-500 font-mono text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acknowledgment & Receipt Status Block */}
                <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  {item.acknowledged ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Confirmed & Acknowledged by Member</span>
                      {item.acknowledgedAt && (
                        <span className="text-[11px] text-emerald-300 font-mono">
                          at {new Date(item.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* If the current user is a member receiving this notification */}
                      {isTargetedToMe && !isAdmin ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeNotification(item.id);
                          }}
                          className="h-10 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-[0.98] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Confirm & Acknowledge Shift</span>
                        </button>
                      ) : (
                        /* If Admin is viewing, show waiting status */
                        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/40 px-3 py-1.5 rounded-xl">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin-slow" />
                          <span>Awaiting Member Confirmation ({item.targetUserName || 'All Crew'})</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{item.acknowledged ? 'Dispatch receipt verified' : 'Real-time in-app delivery'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin In-App Message / Broadcast Composer Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-orange-400" />
                  <span>Send In-App Notification / Message</span>
                </h3>
                <p className="text-xs text-orange-400 font-medium">Deliver instant directives directly to member devices</p>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Strip */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Dispatch Templates</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('assignment')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 text-left text-xs text-slate-300 transition-colors"
                >
                  <strong className="text-white block">Next-Day Shift</strong>
                  <span className="text-[10px] text-slate-500">Report time & yard assignment</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate('directive')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 text-left text-xs text-slate-300 transition-colors"
                >
                  <strong className="text-white block">TMA / Taper Directive</strong>
                  <span className="text-[10px] text-slate-500">Immediate lane closure instruction</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate('safety')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 text-left text-xs text-slate-300 transition-colors"
                >
                  <strong className="text-white block">Safety Stand-Down</strong>
                  <span className="text-[10px] text-slate-500">High wind & sign ballasting</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate('weather')}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-orange-500/60 text-left text-xs text-slate-300 transition-colors"
                >
                  <strong className="text-white block">Lightning Suspension</strong>
                  <span className="text-[10px] text-slate-500">OSHA 30-30 electrical stop</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Message / Broadcast Title</label>
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. Tomorrow's Shift Assignment: Job #WZ-104"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Recipient</label>
                  <select
                    value={composeTarget}
                    onChange={(e) => setComposeTarget(e.target.value)}
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-xs text-white font-medium"
                  >
                    <option value="all">📢 All Field Crew (Broadcast)</option>
                    <optgroup label="Direct to Individual Member">
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          👤 {u.name} — {u.position} ({u.employeeId})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category Type</label>
                  <select
                    value={composeType}
                    onChange={(e) => setComposeType(e.target.value as any)}
                    className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-2.5 text-xs text-white"
                  >
                    <option value="assignment">Assignment (Next Day)</option>
                    <option value="dispatch">Dispatch Directive</option>
                    <option value="safety">Safety Advisory</option>
                    <option value="weather">Weather Alert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Shift Date / Effective Time</label>
                <input
                  type="text"
                  value={composeShiftDate}
                  onChange={(e) => setComposeShiftDate(e.target.value)}
                  placeholder="e.g. Tomorrow • 05:30 AM at Main Yard"
                  className="w-full h-11 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Message Instructions</label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  rows={4}
                  placeholder="Specific job site details, assigned TMA unit, reporting location, lane closure coordinates..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
