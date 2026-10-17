import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveNavTab } from '../../types';
import {
  LayoutDashboard,
  Zap,
  Navigation,
  Briefcase,
  Menu,
  X,
  FileText,
  Users,
  Bell,
  Play,
  FileSpreadsheet,
  ShieldCheck,
  Crosshair,
  Video,
  Download,
} from 'lucide-react';
import { PWAInstallModal } from '../pwa/PWAInstallModal';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeEntry, notifications, currentUser } = useApp();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleSelectTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setShowMoreDrawer(false);
  };

  const navItems: { id: ActiveNavTab; label: string; icon: React.ReactNode; badge?: number | boolean }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'clock',
      label: 'Time Tracker',
      icon: <Zap className="w-5 h-5" />,
      badge: !!activeEntry,
    },
    {
      id: 'nav',
      label: 'Navigation',
      icon: <Crosshair className="w-5 h-5" />,
    },
    {
      id: 'jobs',
      label: 'My Jobs',
      icon: <Briefcase className="w-5 h-5" />,
    },
  ];

  const moreItems: { id: ActiveNavTab; label: string; description: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'timesheets',
      label: 'Work Zone Report',
      description: 'Time sheets & certified labor audit log',
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'forms',
      label: 'Forms Hub',
      description: 'MUTCD inspection, JHA safety, TMA pre-trip',
      icon: <FileText className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'notifications',
      label: 'Schedule / Messaging',
      description: 'Daily assignments & dispatch bulletins',
      icon: <Bell className="w-5 h-5 text-amber-400" />,
      badge: unreadNotifs,
    },
    {
      id: 'contacts',
      label: 'Employees Directory',
      description: 'Crew telephone roster & 24/7 dispatch hotline',
      icon: <Users className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'meetings',
      label: 'Google Meet Video Sync',
      description: 'Team safety briefings & 1-on-1 reviews (Google Workspace)',
      icon: <Video className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'training',
      label: 'Video Training & Courses',
      description: 'MUTCD certification video modules & flagger tests',
      icon: <Play className="w-5 h-5 text-amber-400" />,
    },
  ];

  const isMoreActive = ['forms', 'contacts', 'notifications', 'timesheets', 'training', 'meetings', 'admin'].includes(activeTab);

  return (
    <>
      {/* "More" Bottom Sheet Drawer */}
      {showMoreDrawer && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end"
          onClick={() => setShowMoreDrawer(false)}
        >
          <div
            className="bg-[#121316] border-t border-[#252830] rounded-t-3xl p-5 max-w-lg mx-auto w-full shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-[#2c2f38] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#212328]">
              <div>
                <h3 className="font-display font-extrabold text-base text-white tracking-wide">
                  WORK ZONE OS MENU
                </h3>
                <p className="text-xs text-[#8e929b]">Deskless Traffic Control & Highway Operations</p>
              </div>
              <button
                onClick={() => setShowMoreDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1b22] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto pr-1">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    activeTab === item.id
                      ? 'card-amber-active bg-[#16171d] text-amber-300'
                      : 'bg-[#15161a] hover:bg-[#1c1d24] border-[#252830] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#0e0f12] border border-[#23252c] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-black rounded bg-[#ff6700] text-black">
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-[#8e929b] mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-bold">Open</span>
                </button>
              ))}

              {/* Install PWA App Card */}
              <button
                onClick={() => {
                  setShowMoreDrawer(false);
                  setShowPwaModal(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#181920] to-[#201d14] border border-amber-500/40 text-left transition-all hover:border-amber-400 cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Install Work Zone OS App</span>
                      <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-amber-400 text-black">
                        PWA
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Fast launch, full offline dead-zone mode & home screen icon
                    </div>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-extrabold">Install</span>
              </button>

              {currentUser?.role === 'admin' && (
                <div className="pt-2">
                  <div className="px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Elevated Administrator Tools</span>
                  </div>
                  <p className="text-xs text-[#8e929b] px-1 mb-2">
                    Admins can adjust timesheet punches, upload jobs, dispatch assignments, and create custom forms.
                  </p>
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-[#8e929b] pt-1">
              Molecular Project Development LLC · Superior LLC Road Work Platform
            </div>
          </div>
        </div>
      )}

      {/* PWA Installation Modal */}
      <PWAInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />

      {/* Main Bottom Nav Bar */}
      <nav
        aria-label="Work Zone OS Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e12]/95 backdrop-blur-md border-t border-[#212328] px-2 py-1 max-w-lg mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
      >
        <div className="grid grid-cols-5 items-center gap-1 h-16">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[48px] rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
                    : 'text-[#8e929b] hover:text-white hover:bg-[#15161a]'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && item.id === 'clock' && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ff6700] rounded-full animate-ping" />
                  )}
                </div>
                <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-5 h-0.5 bg-amber-400 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={() => setShowMoreDrawer(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[48px] rounded-2xl transition-all relative ${
              isMoreActive
                ? 'text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30'
                : 'text-[#8e929b] hover:text-white hover:bg-[#15161a]'
            }`}
          >
            <div className="relative">
              <Menu className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#ff6700] text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
              More
            </span>
            {isMoreActive && (
              <span className="absolute bottom-1 w-5 h-0.5 bg-amber-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
