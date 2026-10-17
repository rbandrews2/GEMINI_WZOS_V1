import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavTab } from '../../types';
import { WorkZoneWeatherWidget } from '../weather/WorkZoneWeatherWidget';
import {
  FileText,
  Zap,
  Calendar,
  Navigation,
  Mail,
  Video,
  Play,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  MoreHorizontal,
  Clock,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Crosshair,
  Grid,
} from 'lucide-react';

interface WorkZoneDashboardTabProps {
  onOpenAtlas?: () => void;
}

export const WorkZoneDashboardTab: React.FC<WorkZoneDashboardTabProps> = ({ onOpenAtlas }) => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    activeEntry,
    activeSeconds,
    jobs,
    notifications,
    timeEntries,
  } = useApp();

  // Toggle between Screenshot 1 (Tile Grid) and Screenshot 2 (Oblong Dual-Column Menu)
  const [layoutMode, setLayoutMode] = useState<'cards' | 'grid'>('cards');

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const activeJobsCount = jobs.filter((j) => j.status === 'active').length;

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Menu items mirroring Screenshot 1 & Screenshot 2
  const menuItems = [
    {
      id: 'dashboard' as ActiveNavTab,
      title: 'Dashboard',
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      activeIconIndicator: '◇',
      action: () => setActiveTab('dashboard'),
    },
    {
      id: 'jobs' as ActiveNavTab,
      title: 'Work orders',
      subtitle: 'Active site contracts',
      badge: activeJobsCount > 0 ? activeJobsCount : undefined,
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
      action: () => setActiveTab('jobs'),
    },
    {
      id: 'jobs' as ActiveNavTab,
      title: 'My jobs',
      subtitle: 'Assigned lane closures',
      hasMorePill: true,
      icon: (
        <Users className="w-5 h-5 text-amber-400" />
      ),
      action: () => setActiveTab('jobs'),
    },
    {
      id: 'timesheets' as ActiveNavTab,
      title: 'Work Zone Report',
      subtitle: 'Labor hours & time sheets',
      icon: (
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      ),
      action: () => setActiveTab('timesheets'),
    },
    {
      id: 'atlas' as ActiveNavTab,
      title: 'Atlas assistant',
      subtitle: 'Work zone AI operations guardian',
      icon: (
        <Sparkles className="w-5 h-5 text-amber-400" />
      ),
      action: () => {
        if (onOpenAtlas) {
          onOpenAtlas();
        } else {
          setActiveTab('atlas');
        }
      },
    },
    {
      id: 'forms' as ActiveNavTab,
      title: 'Forms hub',
      subtitle: 'MUTCD inspection & JHA',
      icon: (
        /* Diagonal striped box icon from Screenshot 1 */
        <div className="w-5 h-5 border-2 border-amber-400/90 rounded-sm relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.5)_25%,rgba(245,158,11,0.5)_50%,transparent_50%,transparent_75%,rgba(245,158,11,0.5)_75%)] bg-[length:6px_6px]" />
        </div>
      ),
      action: () => setActiveTab('forms'),
    },
    {
      id: 'clock' as ActiveNavTab,
      title: 'Time Tracker',
      subtitle: 'Punch in/out with 4 subcategories',
      icon: (
        /* Orange lightning bolt from Screenshot 1 & 2 */
        <Zap className="w-5 h-5 text-[#ff6700] fill-[#ff6700]" />
      ),
      action: () => setActiveTab('clock'),
    },
    {
      id: 'notifications' as ActiveNavTab,
      title: 'Schedule management',
      subtitle: "Tomorrow's shift assignments",
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      icon: (
        /* Grid calendar icon from Screenshot 1 & 2 */
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
          <line x1="15" y1="21" x2="15" y2="9" />
        </svg>
      ),
      action: () => setActiveTab('notifications'),
    },
    {
      id: 'nav' as ActiveNavTab,
      title: 'Navigation',
      subtitle: 'Turn-by-turn road work GPS',
      icon: (
        /* Crosshair icon from Screenshot 1 & 2 */
        <Crosshair className="w-5 h-5 text-amber-400" />
      ),
      action: () => setActiveTab('nav'),
    },
    {
      id: 'notifications' as ActiveNavTab,
      title: 'Messaging / dispatch',
      subtitle: 'Dispatch alerts & field chat',
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      icon: (
        <Mail className="w-5 h-5 text-amber-400" />
      ),
      action: () => setActiveTab('notifications'),
    },
    {
      id: 'contacts' as ActiveNavTab,
      title: 'Employees',
      subtitle: 'Crew phonebook & supervisors',
      icon: (
        /* Chess pawn worker icon from Screenshot 1 */
        <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="6" r="3" />
          <path d="M12 9v4" />
          <path d="M8 17a4 4 0 0 1 8 0" />
          <path d="M6 21h12" />
        </svg>
      ),
      action: () => setActiveTab('contacts'),
    },
    {
      id: 'training' as ActiveNavTab,
      title: 'Video training',
      subtitle: 'MUTCD safety & flagger video course',
      icon: (
        <Play className="w-5 h-5 text-amber-400" />
      ),
      action: () => setActiveTab('training'),
    },
    {
      id: 'meetings' as ActiveNavTab,
      title: 'Google Meet sync',
      subtitle: 'Team briefings & 1-on-1 video reviews',
      icon: (
        <Video className="w-5 h-5 text-emerald-400" />
      ),
      action: () => setActiveTab('meetings'),
    },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Enterprise Sub-header banner from Screenshot 2 */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl px-4 py-2.5 shadow-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-white">Tidewater Field Team</span>
          <span className="text-[#8e929b]">Enterprise edition · synthetic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
            {currentUser?.role === 'admin' ? 'Admin Elevated' : 'Field Operator'}
          </span>
        </div>
      </div>

      {/* Real-Time GPS Work Zone Weather Integration & Severe Warnings */}
      <WorkZoneWeatherWidget />

      {/* Live Punch Quick Action Strip */}
      <div className="bg-[#131417] border border-[#212328] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#ff6700]/15 border border-[#ff6700]/40 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-[#ff6700] fill-[#ff6700]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white">
                {activeEntry ? 'ACTIVE SHIFT IN PROGRESS' : 'READY TO CLOCK IN'}
              </span>
              {activeEntry && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
                  {activeEntry.task}
                </span>
              )}
            </div>
            <p className="text-xs text-[#8e929b] mt-0.5">
              {activeEntry
                ? `Job #${activeEntry.jobNumber} · ${activeEntry.jobTitle}`
                : 'Select job and task (Travel Time, Job Site, Meeting, Other)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeEntry ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase text-[#8e929b] block font-semibold">Elapsed</span>
                <span className="font-mono-numbers text-base font-extrabold text-amber-400">
                  {formatTimer(activeSeconds)}
                </span>
              </div>
              <button
                onClick={() => setActiveTab('clock')}
                className="px-4 py-2.5 rounded-xl bg-[#ff6700] hover:bg-[#ea580c] text-black font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 transition-transform active:scale-[0.98]"
              >
                Manage Shift
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('clock')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6700] to-amber-500 hover:from-orange-500 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Clock In Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Menu Layout Switcher (Cards List vs Tiles Grid) */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8e929b]">
            Work Zone Operations Hub
          </span>
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-[#121316] rounded-xl border border-[#212328]">
          <button
            onClick={() => setLayoutMode('cards')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              layoutMode === 'cards'
                ? 'bg-[#1b1c22] text-amber-400 shadow-sm'
                : 'text-[#8e929b] hover:text-white'
            }`}
          >
            Menu List
          </button>
          <button
            onClick={() => setLayoutMode('grid')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              layoutMode === 'grid'
                ? 'bg-[#1b1c22] text-amber-400 shadow-sm'
                : 'text-[#8e929b] hover:text-white'
            }`}
          >
            Grid Tiles
          </button>
        </div>
      </div>

      {/* RENDER STYLE 1: DUAL COLUMN OBLONG MENU CARDS (Screenshot 2 Style) */}
      {layoutMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {menuItems.map((item, idx) => {
            const isDashboard = item.id === 'dashboard';
            return (
              <button
                key={idx}
                onClick={item.action}
                className={`w-full min-h-[58px] px-4 py-3 rounded-2xl flex items-center justify-between text-left transition-all ${
                  isDashboard
                    ? 'card-amber-active bg-[#141518]'
                    : 'bg-[#141518] hover:bg-[#1a1b20] border border-[#23252c]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {item.activeIconIndicator && (
                        <span className="text-amber-400 text-xs font-bold leading-none">
                          {item.activeIconIndicator}
                        </span>
                      )}
                      <span className={`font-bold text-sm leading-tight ${isDashboard ? 'text-amber-300' : 'text-white'}`}>
                        {item.title}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-[#7d828d] mt-0.5 line-clamp-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-md bg-[#ff6700] text-black font-extrabold text-[11px] flex items-center justify-center shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {item.hasMorePill && (
                    <span className="px-2 py-0.5 rounded-md bg-[#ff6700] text-black font-black text-xs leading-none flex items-center justify-center shadow-sm">
                      ...
                    </span>
                  )}
                  {!item.badge && !item.hasMorePill && (
                    <ChevronRight className="w-4 h-4 text-[#444852]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* RENDER STYLE 2: SCREENSHOT 1 JET BLACK TILES WITH GOLD/AMBER ICONS */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {menuItems.slice(0, 8).map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className="bg-[#121316] hover:bg-[#18191f] border border-[#23252c] hover:border-amber-500/50 rounded-2xl p-4 min-h-[110px] flex flex-col justify-between text-left transition-all group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#0d0e11] border border-[#212328] group-hover:border-amber-500/40 transition-colors">
                  {item.icon}
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded bg-[#ff6700] text-black font-black text-[10px]">
                    {item.badge}
                  </span>
                )}
              </div>

              <div>
                <span className="font-bold text-sm text-white group-hover:text-amber-300 block leading-tight">
                  {item.title}
                </span>
                <span className="text-[10px] text-[#7d828d] mt-0.5 line-clamp-1">
                  {item.subtitle}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Atlas Safety Field Guidelines Banner */}
      <div className="bg-[#121316] border border-[#212328] rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Atlas Work Zone Guidelines</h4>
            <p className="text-xs text-[#8e929b]">
              Caltrans Title 8 & MUTCD standard spacing for taper buffer zones and attenuator placement.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('forms')}
          className="px-3 py-1.5 rounded-xl bg-[#1a1b22] hover:bg-[#23252d] border border-[#2c2f38] text-xs font-semibold text-amber-400 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <span>View Specs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
