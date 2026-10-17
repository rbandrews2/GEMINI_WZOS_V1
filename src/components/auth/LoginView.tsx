import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  User,
  HardHat,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Zap,
  Fingerprint,
  Scan,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users, playBeep } = useApp();

  const [username, setUsername] = useState('mrodriguez');
  const [password, setPassword] = useState('worker123');
  const [errorMsg, setErrorMsg] = useState('');

  // Biometric state
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [selectedBioUser, setSelectedBioUser] = useState<string>('mrodriguez');
  const [isBioEnrolled, setIsBioEnrolled] = useState<boolean>(() => {
    return localStorage.getItem('wzos_biometric_enrolled') !== 'false';
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(username, password);
    if (!success) {
      setErrorMsg('Invalid username or password. Check credentials established by Admin.');
    }
  };

  const handleQuickFill = (uName: string, pWord: string) => {
    setUsername(uName);
    setPassword(pWord);
    setErrorMsg('');
  };

  // Trigger Biometric Verification (Fingerprint / Face ID)
  const handleStartBiometricAuth = async () => {
    setIsBiometricModalOpen(true);
    setBiometricScanning(true);
    setBiometricSuccess(false);
    playBeep('punch');

    try {
      // Check if WebAuthn is supported on the hardware
      if (
        typeof window !== 'undefined' &&
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ) {
        // Platform authenticator check
        await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
    } catch {
      // Continue to biometric prompt simulation if browser environment restricts WebAuthn
    }

    // High-tech scan simulation (1.2s authenticating sensor contact)
    setTimeout(() => {
      setBiometricScanning(false);
      setBiometricSuccess(true);
      playBeep('success');

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([60, 40, 100]);
      }

      // Auto login after brief verification animation
      setTimeout(() => {
        const targetUser = users.find((u) => u.username === selectedBioUser) || users[1];
        login(targetUser.username, targetUser.password);
      }, 700);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#090a0c]">
      {/* Background Work Zone Ambient with Motion Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15 animate-ambient-drift pointer-events-none scale-105"
        style={{
          backgroundImage: `url('/src/assets/images/work_zone_ambient_bg_1792226589482.jpg')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090a0c] via-[#090a0c]/85 to-transparent pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#121316]/95 border border-[#252830] rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
        {/* Brand Header matching Screenshot 2 */}
        <div className="text-center space-y-2">
          {/* Exact Logo: Orange square with black W */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff6700] shadow-xl shadow-orange-600/30 mb-1">
            <span className="font-display font-black text-2xl tracking-tight text-black">W</span>
          </div>

          <h1 className="font-display font-black text-2xl text-white tracking-wider uppercase">
            WORK ZONE
          </h1>
          <p className="text-[11px] text-[#8e929b] font-bold tracking-[0.25em] uppercase">
            OPERATING SYSTEM
          </p>

          <div className="pt-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#18191f] border border-[#2b2e38] text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Tidewater Field Team · Enterprise Synthetic
            </span>
          </div>
        </div>

        {/* Rapid Biometric Unlock Button (For Safety Gear / Glove Wearing Crews) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1a1309] to-[#121318] border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-[#ff6700]" />
              <span>Biometric Quick Unlock</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              Field Ready
            </span>
          </div>

          <p className="text-[11px] text-[#8e929b]">
            Designed for field workers wearing safety gloves or gear. Tap below for instant Face ID or Touch ID scan.
          </p>

          <button
            type="button"
            onClick={handleStartBiometricAuth}
            className="w-full h-13 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff6700] hover:from-amber-400 hover:to-orange-500 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform cursor-pointer"
          >
            <Scan className="w-4 h-4 animate-pulse" />
            <span>Scan Fingerprint / Face ID</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#252830]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#636874]">
            Or Sign In With Password
          </span>
          <div className="flex-1 h-px bg-[#252830]" />
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Username (Assigned by Admin)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="mrodriguez or admin"
              className="w-full h-12 bg-[#090a0c] border border-[#2b2d35] rounded-xl px-3.5 text-sm font-medium text-white placeholder-[#5d616c] focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 bg-[#090a0c] border border-[#2b2d35] rounded-xl px-3.5 text-sm font-medium text-white placeholder-[#5d616c] focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 rounded-2xl bg-[#1c1d25] hover:bg-[#252835] active:scale-[0.98] border border-amber-500/40 text-amber-300 hover:text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-transform cursor-pointer"
          >
            <span>Log In to Shift</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Established Demo Accounts */}
        <div className="pt-2 border-t border-[#212328] space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-[#8e929b] font-bold block text-center">
            Established Crew Accounts (1-Tap Fast Fill)
          </span>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="p-3 rounded-2xl bg-[#0d0e12] border border-[#252830] hover:border-amber-500/60 text-xs transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </div>
              <div className="text-[11px] text-white font-medium mt-0.5">Marcus Vance</div>
              <div className="text-[10px] text-[#8e929b] font-mono mt-0.5">admin / admin123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('mrodriguez', 'worker123')}
              className="p-3 rounded-2xl bg-[#0d0e12] border border-[#252830] hover:border-amber-500/60 text-xs transition-colors"
            >
              <div className="flex items-center gap-1.5 font-bold text-[#ff6700]">
                <HardHat className="w-3.5 h-3.5" />
                <span>Lead TCS</span>
              </div>
              <div className="text-[11px] text-white font-medium mt-0.5">Maria Rodriguez</div>
              <div className="text-[10px] text-[#8e929b] font-mono mt-0.5">mrodriguez / worker123</div>
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] text-[#8e929b]">
          Molecular Project Development LLC · Traffic Control & Road Work OS
        </div>
      </div>

      {/* Biometric Scan Modal */}
      {isBiometricModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121316] border-2 border-amber-500/70 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-5 relative">
            <button
              onClick={() => setIsBiometricModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Target Crew User Selection */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Select Worker for Biometric Sign-In
              </span>
              <div className="flex justify-center gap-2 pt-1">
                {users.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedBioUser(u.username)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      selectedBioUser === u.username
                        ? 'bg-[#ff6700] text-black shadow-sm'
                        : 'bg-[#181920] border border-[#272a33] text-slate-300'
                    }`}
                  >
                    {u.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Scanning Radar Graphic */}
            <div className="relative py-4 flex items-center justify-center">
              <div className="relative w-28 h-28 rounded-full border-2 border-amber-500/30 flex items-center justify-center">
                {/* Pulsing ring animation */}
                {biometricScanning && (
                  <div className="absolute inset-0 rounded-full border-2 border-[#ff6700] animate-ping opacity-60" />
                )}

                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                    biometricSuccess
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 scale-110'
                      : 'bg-gradient-to-br from-[#1a140b] to-[#14151b] border-2 border-amber-500 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {biometricSuccess ? (
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  ) : (
                    <Fingerprint className="w-10 h-10 animate-pulse text-[#ff6700]" />
                  )}
                </div>
              </div>
            </div>

            {/* Status text */}
            <div className="space-y-1">
              <h3 className="font-display font-bold text-lg text-white">
                {biometricSuccess
                  ? 'Identity Confirmed'
                  : biometricScanning
                  ? 'Verifying Touch ID / Face...'
                  : 'Place Finger on Sensor'}
              </h3>
              <p className="text-xs text-[#8e929b]">
                {biometricSuccess
                  ? `Authenticated as ${users.find((u) => u.username === selectedBioUser)?.name || 'Crew Member'}`
                  : 'Hold thumb or glance at camera to authenticate without removing safety gloves.'}
              </p>
            </div>

            {/* Cancel Button */}
            <button
              onClick={() => setIsBiometricModalOpen(false)}
              className="w-full h-11 rounded-xl bg-[#1b1c24] hover:bg-[#252835] text-slate-300 font-bold text-xs border border-[#2b2e38]"
            >
              Cancel & Use Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
