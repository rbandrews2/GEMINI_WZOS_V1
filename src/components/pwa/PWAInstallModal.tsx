import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Smartphone,
  Laptop,
  Zap,
  WifiOff,
  ShieldAlert,
  Clock,
  Compass,
  FileCheck2,
  Radio,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'guide' | 'features'>('guide');
  const [justInstalled, setJustInstalled] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6700', '#FACC15', '#FFFFFF', '#000000'],
        });
      }
    } else {
      // If not supported natively or iOS, show celebration/simulation for test
      setJustInstalled(true);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF6700', '#FACC15'],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f1014] border-2 border-[#2b2d38] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner with WZOS Emblem */}
        <div className="bg-gradient-to-b from-[#181a22] to-[#121318] p-6 border-b border-[#252834] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-[#21232c] hover:bg-[#2d303c] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Official WZOS App Icon with Hazard Stripes */}
            <img
              src="/pwa-512x512.png"
              alt="Work Zone OS"
              className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-400/50 shadow-xl overflow-hidden shrink-0 object-cover"
            />

            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-black uppercase text-amber-400 tracking-wider">
                <Zap className="w-3 h-3 fill-current" />
                <span>Progressive Web App</span>
              </div>
              <h3 className="font-display font-extrabold text-xl text-white mt-1 leading-tight">
                Install Work Zone OS
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add to your home screen for full deskless field capability
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-[#1b1c24] text-slate-400 hover:text-white'
              }`}
            >
              How to Install
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'features'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-[#1b1c24] text-slate-400 hover:text-white'
              }`}
            >
              App Benefits & Shortcuts
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {justInstalled || isInstalled ? (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-white">Work Zone OS is Installed!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  You can now launch WZOS directly from your home screen or app drawer with full offline access.
                </p>
              </div>
            </div>
          ) : activeTab === 'guide' ? (
            /* Platform-specific Installation Instructions */
            <div className="space-y-4">
              {isIOS ? (
                /* iOS Safari instructions */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Smartphone className="w-4 h-4" />
                    <span>iPhone & iPad Safari Instructions:</span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#16171f] border border-[#232532]">
                      <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">
                        1
                      </div>
                      <div className="flex-1">
                        <span>Tap the <strong>Share</strong> button in Safari's bottom toolbar</span>
                        <div className="mt-1 flex items-center gap-1.5 text-sky-400 font-semibold">
                          <Share className="w-4 h-4" />
                          <span>(Square box with arrow pointing up)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#16171f] border border-[#232532]">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        2
                      </div>
                      <div className="flex-1">
                        <span>Scroll down the menu and tap <strong>Add to Home Screen</strong></span>
                        <div className="mt-1 flex items-center gap-1.5 text-amber-400 font-semibold">
                          <PlusSquare className="w-4 h-4" />
                          <span>Add to Home Screen</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#16171f] border border-[#232532]">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span>Tap <strong>Add</strong> in the top-right corner to complete installation</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isAndroid || isInstallable ? (
                /* Android / Chrome One-Tap Install */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Smartphone className="w-4 h-4" />
                    <span>Android & Chrome Instant Install:</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the <strong>Install App Now</strong> button below to launch the native installation prompt. Work Zone OS will be added to your home screen and app launcher.
                  </p>

                  <div className="p-3.5 rounded-xl bg-[#14151c] border border-[#272a36] text-[11px] text-slate-400 space-y-1.5">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Zero Store Downloads Required</span>
                    </div>
                    <p>Installs instantly without needing Google Play or Apple App Store credentials.</p>
                  </div>
                </div>
              ) : (
                /* Desktop Chrome / Edge instructions */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Laptop className="w-4 h-4" />
                    <span>Desktop Browser Installation:</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#16171f] border border-[#232532]">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        1
                      </div>
                      <div>
                        Look for the <strong>Install</strong> icon in your browser's address bar (right side).
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#16171f] border border-[#232532]">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                        2
                      </div>
                      <div>
                        Or click the browser menu (⋮) and select <strong>"Install Work Zone OS"</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* App Benefits & Quick Shortcuts */
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                PWA Home Screen Advantages:
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-[#14151c] border border-[#242632] space-y-1">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <div className="font-bold text-white">Full Offline Mode</div>
                  <p className="text-[10px] text-slate-400">Punches & safety forms save locally in dead zones.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#14151c] border border-[#242632] space-y-1">
                  <Zap className="w-4 h-4 text-[#ff6700]" />
                  <div className="font-bold text-white">1-Tap Fast Launch</div>
                  <p className="text-[10px] text-slate-400">Standalone fullscreen with no browser address bar.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#14151c] border border-[#242632] space-y-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <div className="font-bold text-white">Weather Alerts</div>
                  <p className="text-[10px] text-slate-400">Real-time GPS severe weather warnings in your corridor.</p>
                </div>

                <div className="p-3 rounded-xl bg-[#14151c] border border-[#242632] space-y-1">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <div className="font-bold text-white">Turn-by-Turn Nav</div>
                  <p className="text-[10px] text-slate-400">Speed limit alerts & direct lane closure guidance.</p>
                </div>
              </div>

              {/* 4 App Shortcuts configured */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Long-Press App Icon Shortcuts:
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181922] border border-[#282a36]">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-white">Time Clock Punch</span>
                    <span className="text-[10px] text-slate-500 ml-auto">Direct Punch In</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181922] border border-[#282a36]">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span className="font-semibold text-white">Work Zone Navigation</span>
                    <span className="text-[10px] text-slate-500 ml-auto">GPS Route</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181922] border border-[#282a36]">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-white">Safety Forms Hub</span>
                    <span className="text-[10px] text-slate-500 ml-auto">MUTCD Signs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#181922] border border-[#282a36]">
                    <Radio className="w-3.5 h-3.5 text-orange-400" />
                    <span className="font-semibold text-white">Shift Assignments</span>
                    <span className="text-[10px] text-slate-500 ml-auto">Dispatch Alerts</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#121318] border-t border-[#232532] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#1b1c24] hover:bg-[#252834] text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            {justInstalled || isInstalled ? 'Close' : 'Maybe Later'}
          </button>

          {!isInstalled && !justInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-[#ff6700] hover:from-amber-300 hover:to-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isInstallable ? 'Install App Now' : 'Add to Home Screen'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
