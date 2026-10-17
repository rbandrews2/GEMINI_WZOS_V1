import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';
import { Download, X, Smartphone, Zap, Sparkles } from 'lucide-react';

export const PWAInstallNudgeBanner: React.FC = () => {
  const { isInstallable, isInstalled, isNudgeDismissed, install, dismissNudge } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already installed in standalone mode, or if user dismissed the nudge, do not render
  if (isInstalled || isNudgeDismissed) {
    return null;
  }

  const handleQuickInstall = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#181920] via-[#1f1b14] to-[#181920] border-b-2 border-amber-400/40 p-3 shadow-xl relative overflow-hidden transition-all animate-in slide-in-from-top-2 duration-300">
        {/* Subtle background hazard pattern accent */}
        <div
          className="absolute inset-y-0 right-0 w-32 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #FACC15 0, #FACC15 10px, transparent 10px, transparent 20px)',
          }}
        />

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          {/* Left: App Logo & Nudge Copy */}
          <div className="flex items-center gap-3">
            {/* WZOS App Icon */}
            <img
              src="/pwa-192x192.png"
              alt="WZOS App Icon"
              className="w-10 h-10 rounded-xl border border-amber-400/60 shadow-md shrink-0 object-cover bg-black"
            />

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-white tracking-wide">
                  Install Work Zone OS
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-400 text-black">
                  APP AVAILABLE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                Install to home screen for 1-tap punch, dead-zone offline mode, and road work alerts.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#262833] hover:bg-[#323544] text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Guide
            </button>

            <button
              onClick={handleQuickInstall}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#ff6700] hover:from-amber-300 hover:to-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install App</span>
            </button>

            <button
              onClick={dismissNudge}
              title="Dismiss for 48 hours"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <PWAInstallModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
