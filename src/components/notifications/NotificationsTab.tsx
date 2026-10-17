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
} from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    acknowledgeNotification,
    addNotification,
    currentUser,
    users,
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'assignment' | 'safety' | 'dispatch'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter !== 'all' && n.type !== activeFilter) return false;
    return true;
  });

  const handleOpenCompose = () => {
    setComposeTitle("Tomorrow's Shift Assignment: Job #WZ-104 US-101 NB");
    setComposeMessage('Report Time: 05:30 AM at Main Equipment Yard. Assigned Role: Lead TCS & Taper Setup. TMA Unit #04 assigned. Please confirm receipt.');
    setComposeType('assignment');
    setComposeTarget('all');
    setComposeShiftDate('Tomorrow • 05:30 AM');
    setIsComposeOpen(true);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeMessage.trim()) return;

    const targetUserObj = users.find((u) => u.id === composeTarget);

    addNotification({
      title: composeTitle,
      message: composeMessage,
      type: composeType,
      targetUserId: composeTarget,
      targetUserName: targetUserObj ? targetUserObj.name : 'All Crew Members',
      shiftDate: composeShiftDate,
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

  return (
    <div className="space-y-5 pb-24">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-400" />
              <h2 className="font-display font-bold text-lg text-white">Daily Assignments & Shift Alerts</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Work schedule broadcasts, weather warnings & field crew dispatch directives.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenCompose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Assignment</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pt-2 border-t border-slate-800">
          {(['all', 'assignment', 'safety', 'dispatch'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                activeFilter === cat
                  ? 'bg-orange-600 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Broadcasts' : cat === 'assignment' ? "Tomorrow's Assignments" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filteredNotifs.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 text-xs">
            No notifications or assignments in this category.
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-5 rounded-2xl border transition-all ${
                !item.read
                  ? 'bg-slate-900 border-orange-500/50 shadow-lg shadow-orange-950/20'
                  : 'bg-slate-900/80 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-bold text-sm text-white">{item.title}</h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
                      )}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.type}
                      </span>
                    </div>

                    {item.shiftDate && (
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>{item.shiftDate}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{item.message}</p>

                    <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                      <span>Sender: <b className="text-slate-300">{item.senderName}</b></span>
                      <span>·</span>
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {item.targetUserName && (
                        <>
                          <span>·</span>
                          <span>Target: <b className="text-slate-300">{item.targetUserName}</b></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Acknowledge / Confirm Shift */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                {item.acknowledged ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Shift Confirmed & Acknowledged</span>
                    {item.acknowledgedAt && (
                      <span className="text-[10px] text-slate-400">
                        ({new Date(item.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeNotification(item.id);
                    }}
                    className="h-10 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm & Acknowledge Shift</span>
                  </button>
                )}

                <span className="text-[11px] text-slate-400">
                  {item.acknowledged ? 'Dispatch Notified' : 'Tap to notify dispatch'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Admin Broadcast Composer Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Broadcast Shift Assignment</h3>
                <p className="text-xs text-orange-400 font-medium">Send real-time alerts directly to field crew mobile app</p>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Broadcast Title</label>
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. Tomorrow's Shift Assignment: Job #WZ-104"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category Type</label>
                  <select
                    value={composeType}
                    onChange={(e) => setComposeType(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                  >
                    <option value="assignment">Assignment (Next Day)</option>
                    <option value="safety">Safety Advisory</option>
                    <option value="dispatch">Dispatch Directive</option>
                    <option value="weather">Weather Alert</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Recipient</label>
                  <select
                    value={composeTarget}
                    onChange={(e) => setComposeTarget(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                  >
                    <option value="all">All Field Crew</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Shift Date / Report Time</label>
                <input
                  type="text"
                  value={composeShiftDate}
                  onChange={(e) => setComposeShiftDate(e.target.value)}
                  placeholder="e.g. Tomorrow • 05:30 AM at Main Yard"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Detailed Message Instructions</label>
                <textarea
                  value={composeMessage}
                  onChange={(e) => setComposeMessage(e.target.value)}
                  rows={4}
                  placeholder="Details on equipment assigned, meeting coordinates, safety requirements..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
