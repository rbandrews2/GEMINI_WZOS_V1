import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Smartphone,
  Monitor,
  Bell,
  Clock,
  LogOut,
  ChevronDown,
  UserCheck,
  HardHat,
  Users,
  Zap,
} from 'lucide-react';

import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface TopHeaderProps {
  onOpenUserManagement?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenUserManagement }) => {
  const {
    currentUser,
    logout,
    switchUserRole,
    activeEntry,
    activeSeconds,
    notifications,
    setActiveTab,
    isAndroidViewFrame,
    setIsAndroidViewFrame,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0e12]/95 backdrop-blur-md border-b border-[#212328] text-slate-100 px-4 py-3 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Official WZOS Logo with Hazard Caution Stripes */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-xl bg-black border border-amber-400/60 shadow-lg shadow-amber-500/10 shrink-0 flex flex-col justify-between p-0.5 overflow-hidden">
            {/* Top Hazard Stripes */}
            <div
              className="h-1.5 w-full rounded-2xs"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #FACC15 0, #FACC15 4px, #121316 4px, #121316 8px)',
              }}
            />
            <span className="text-center font-black text-[10px] tracking-tight text-white font-mono leading-none">
              WZOS
            </span>
            {/* Bottom Hazard Stripes */}
            <div
              className="h-1.5 w-full rounded-2xs"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #FACC15 0, #FACC15 4px, #121316 4px, #121316 8px)',
              }}
            />
            {activeEntry && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full ring-2 ring-[#0d0e12] animate-pulse" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-display font-extrabold text-sm sm:text-base tracking-wider text-white uppercase leading-none flex items-center gap-1.5">
              <span>WORK ZONE OS</span>
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-[#8e929b] uppercase leading-none mt-1">
              OPERATING SYSTEM
            </div>
          </div>
        </div>

        {/* Center: Live Time Clock Tracker Status */}
        <div className="hidden md:flex items-center gap-2">
          {activeEntry ? (
            <button
              onClick={() => setActiveTab('clock')}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#16171c] border border-amber-500/70 rounded-xl text-amber-300 text-xs font-medium shadow-[0_0_12px_rgba(245,158,11,0.2)] hover:border-amber-400 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff6700] fill-[#ff6700]" />
              <span className="text-white font-semibold">Time Tracker:</span>
              <span className="font-mono-numbers font-bold text-amber-400 tracking-wide">
                {formatTimer(activeSeconds)}
              </span>
              <span className="text-slate-400 font-medium truncate max-w-[120px]">
                · {activeEntry.task}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[#8e929b] px-3 py-1.5 bg-[#131417] rounded-xl border border-[#212328]">
              <HardHat className="w-3.5 h-3.5 text-[#ff6700]" />
              <span>Shift Ready · Superior Traffic Services</span>
            </div>
          )}
        </div>

        {/* Right: Actions, Viewport Toggle & User Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Viewport Frame Toggle: Phone vs Desktop */}
          <button
            onClick={() => setIsAndroidViewFrame((prev) => !prev)}
            title={isAndroidViewFrame ? 'Switch to Full Screen View' : 'Switch to Android Phone View'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-[#15161a] hover:bg-[#1c1d24] hover:text-white border border-[#252830] transition-colors"
          >
            {isAndroidViewFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#ff6700]" />
                <span className="hidden sm:inline">Android</span>
              </>
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Notifications / Dispatch Messages Button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-[#15161a] hover:bg-[#1c1d24] border border-[#252830] transition-colors"
            title="Messaging & Assignments"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-[#ff6700] text-[10px] font-bold text-black rounded-full ring-2 ring-[#0d0e12]">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* User Menu & Role Indicator */}
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#15161a] hover:bg-[#1c1d24] border border-[#252830] text-left transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#ff6700] text-black flex items-center justify-center text-xs font-extrabold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block leading-none">
                  <div className="text-xs font-semibold text-slate-100 truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium capitalize mt-0.5">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-[#121317] border border-[#252830] rounded-2xl shadow-2xl py-2 z-50 text-slate-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-[#212328]">
                    <p className="text-xs font-bold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">{currentUser.position}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] font-mono text-slate-400">{currentUser.employeeId}</span>
                      <span className="text-slate-600">·</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          currentUser.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Switch Role Demonstration */}
                  <div className="px-2 py-1.5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 px-2 py-1 font-semibold">
                      Role Switcher
                    </div>
                    <button
                      onClick={() => switchUserRole('admin')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30'
                          : 'hover:bg-[#1a1b22] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>Elevated Admin</span>
                      </div>
                      {currentUser.role === 'admin' && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                    </button>

                    <button
                      onClick={() => switchUserRole('member')}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors ${
                        currentUser.role === 'member'
                          ? 'bg-orange-500/15 text-orange-300 font-bold border border-orange-500/30'
                          : 'hover:bg-[#1a1b22] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <HardHat className="w-3.5 h-3.5 text-[#ff6700]" />
                        <span>Field Member (TCS)</span>
                      </div>
                      {currentUser.role === 'member' && <UserCheck className="w-3.5 h-3.5 text-[#ff6700]" />}
                    </button>
                  </div>

                  {/* Admin User Management Modal Link */}
                  {currentUser.role === 'admin' && onOpenUserManagement && (
                    <div className="px-2 py-1 border-t border-[#212328]">
                      <button
                        onClick={onOpenUserManagement}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-slate-200 hover:bg-[#1a1b22] hover:text-white transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>Manage Crew Credentials</span>
                      </button>
                    </div>
                  )}

                  {/* Sign Out */}
                  <div className="px-2 pt-1 border-t border-[#212328]">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
