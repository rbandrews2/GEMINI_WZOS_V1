import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { WorkZoneDashboardTab } from './components/dashboard/WorkZoneDashboardTab';
import { TimeClockTab } from './components/clock/TimeClockTab';
import { TimeSheetsTab } from './components/timesheets/TimeSheetsTab';
import { WorkZoneMapTab } from './components/navigation/WorkZoneMapTab';
import { JobsTab } from './components/jobs/JobsTab';
import { ContactsTab } from './components/contacts/ContactsTab';
import { FormsHubTab } from './components/forms/FormsHubTab';
import { NotificationsTab } from './components/notifications/NotificationsTab';
import { WorkZoneTrainingTab } from './components/training/WorkZoneTrainingTab';
import { GoogleMeetTab } from './components/meetings/GoogleMeetTab';
import { AtlasChatModal } from './components/atlas/AtlasChatModal';
import { AtlasFloatingAssistant } from './components/atlas/AtlasFloatingAssistant';
import { OfflineFieldBanner } from './components/offline/OfflineFieldBanner';
import { PWAInstallNudgeBanner } from './components/pwa/PWAInstallNudgeBanner';
import { LoginView } from './components/auth/LoginView';
import { AdminUserManagementModal } from './components/admin/AdminUserManagementModal';
import {
  Wifi,
  BatteryMedium,
  Signal,
  Smartphone,
  ShieldCheck,
  HardHat,
  Monitor,
} from 'lucide-react';

function MainApp() {
  const { currentUser, activeTab, isAndroidViewFrame, setIsAndroidViewFrame } = useApp();
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState(false);

  // If unauthenticated, show persistent login view
  if (!currentUser) {
    return <LoginView />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <WorkZoneDashboardTab onOpenAtlas={() => setIsAtlasModalOpen(true)} />;
      case 'clock':
        return <TimeClockTab />;
      case 'timesheets':
        return <TimeSheetsTab />;
      case 'nav':
        return <WorkZoneMapTab />;
      case 'jobs':
        return <JobsTab />;
      case 'contacts':
        return <ContactsTab />;
      case 'forms':
        return <FormsHubTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'training':
        return <WorkZoneTrainingTab />;
      case 'meetings':
        return <GoogleMeetTab />;
      case 'atlas':
        return <WorkZoneDashboardTab onOpenAtlas={() => setIsAtlasModalOpen(true)} />;
      default:
        return <WorkZoneDashboardTab onOpenAtlas={() => setIsAtlasModalOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-slate-100 relative overflow-hidden flex flex-col items-center justify-start">
      {/* Subtle work zone background with kinetic motion effect */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none scale-105 animate-ambient-drift"
        style={{
          backgroundImage: `url('/src/assets/images/work_zone_ambient_bg_1792226589482.jpg')`,
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#090a0c]/80 via-[#090a0c]/95 to-[#090a0c] pointer-events-none" />

      {/* Main Wrapper: Switchable between Realistic Android Device Frame and Expanded View */}
      {isAndroidViewFrame ? (
        /* ANDROID SMARTPHONE VIEWPORT CONTAINER */
        <div className="relative z-10 w-full max-w-md my-0 sm:my-4 sm:rounded-[42px] shadow-2xl border-0 sm:border-[8px] border-[#1f2127] bg-[#090a0c] min-h-screen sm:min-h-[860px] sm:max-h-[92vh] flex flex-col overflow-hidden ring-1 ring-amber-500/20">
          {/* Android Status Bar (Camera punch-hole, time, 5G, battery) */}
          <div className="bg-[#0d0e12]/95 px-6 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-300 select-none shrink-0 border-b border-[#1f2127]">
            <span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {/* Front Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#2b2d35] shadow-inner mx-auto" />
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-extrabold text-[#ff6700]">5G</span>
              <Signal className="w-3 h-3 text-amber-400" />
              <Wifi className="w-3 h-3 text-amber-400" />
              <BatteryMedium className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>

          {/* Top Application Header */}
          <TopHeader onOpenUserManagement={() => setIsUserMgmtOpen(true)} />

          {/* PWA Installation Nudge Banner */}
          <PWAInstallNudgeBanner />

          {/* Offline & Cellular Field Status Banner */}
          <OfflineFieldBanner />

          {/* Scrollable Viewport Content */}
          <main className="flex-1 overflow-y-auto px-4 py-4 relative scrollbar-none">
            {renderActiveTab()}
          </main>

          {/* Android Bottom Navigation Bar */}
          <BottomNav />

          {/* Android Native Gesture Pill */}
          <div className="bg-[#0d0e12] py-1 flex items-center justify-center shrink-0 border-t border-[#1f2127]">
            <div className="w-32 h-1 bg-[#373a44] rounded-full" />
          </div>
        </div>
      ) : (
        /* EXPANDED DESKTOP / TABLET DASHBOARD MODE (Full 1440px layout) */
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          <TopHeader onOpenUserManagement={() => setIsUserMgmtOpen(true)} />

          {/* PWA Installation Nudge Banner */}
          <PWAInstallNudgeBanner />

          {/* Offline & Cellular Field Status Banner */}
          <OfflineFieldBanner />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Desktop breadcrumb & enterprise bar */}
            <div className="mb-4 flex items-center justify-between p-3.5 rounded-2xl bg-[#121316] border border-[#212328] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-white uppercase tracking-wider">
                  Work Zone OS
                </span>
                <span className="text-[#4b4e58]">/</span>
                <span className="text-amber-400 font-bold capitalize">{activeTab} View</span>
                <span className="text-[#4b4e58]">·</span>
                <span className="text-[#8e929b]">Molecular Project Development LLC · Superior LLC Operations</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAndroidViewFrame(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#18191f] hover:bg-[#20222a] text-slate-200 font-semibold text-xs border border-[#2b2e38] transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#ff6700]" />
                  <span>Switch to Android Phone View</span>
                </button>
              </div>
            </div>

            {renderActiveTab()}
          </main>

          <BottomNav />
        </div>
      )}

      {/* Floating Atlas Assistant Widget from Screenshot 2 */}
      <AtlasFloatingAssistant onOpenChat={() => setIsAtlasModalOpen(true)} />

      {/* Multi-turn Atlas Chatbot Modal */}
      <AtlasChatModal
        isOpen={isAtlasModalOpen}
        onClose={() => setIsAtlasModalOpen(false)}
      />

      {/* Admin User & Password Management Modal */}
      <AdminUserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
