import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isNudgeDismissed: boolean;
  install: () => Promise<boolean>;
  dismissNudge: () => void;
  resetNudge: () => void;
  installedAt: string | null;
}

export function usePWAInstall(): PWAInstallState {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isNudgeDismissed, setIsNudgeDismissed] = useState(false);
  const [installedAt, setInstalledAt] = useState<string | null>(null);

  useEffect(() => {
    // 1. Detect standalone mode (already running as installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandaloneMode);
      if (isStandaloneMode) {
        localStorage.setItem('wzos_pwa_installed', 'true');
      }
    };

    checkStandalone();

    // 2. Detect platform & OS
    const ua = (window.navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    const isDesktopDevice = !isIOSDevice && !isAndroidDevice;

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsDesktop(isDesktopDevice);

    // 3. Check saved nudge dismissal state
    const dismissedUntil = localStorage.getItem('wzos_pwa_nudge_dismissed_until');
    if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
      setIsNudgeDismissed(true);
    }

    const savedInstalledAt = localStorage.getItem('wzos_pwa_installed_at');
    if (savedInstalledAt) {
      setInstalledAt(savedInstalledAt);
    }

    // 4. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 5. Listen for appinstalled event
    const handleAppInstalled = () => {
      const now = new Date().toISOString();
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstalledAt(now);
      localStorage.setItem('wzos_pwa_installed', 'true');
      localStorage.setItem('wzos_pwa_installed_at', now);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === 'accepted') {
        const now = new Date().toISOString();
        setIsInstalled(true);
        setDeferredPrompt(null);
        setInstalledAt(now);
        localStorage.setItem('wzos_pwa_installed', 'true');
        localStorage.setItem('wzos_pwa_installed_at', now);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return false;
    }
  }, [deferredPrompt]);

  const dismissNudge = useCallback(() => {
    setIsNudgeDismissed(true);
    // Dismiss for 48 hours
    const expires = Date.now() + 48 * 60 * 60 * 1000;
    localStorage.setItem('wzos_pwa_nudge_dismissed_until', expires.toString());
  }, []);

  const resetNudge = useCallback(() => {
    setIsNudgeDismissed(false);
    localStorage.removeItem('wzos_pwa_nudge_dismissed_until');
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isDesktop,
    isNudgeDismissed,
    install,
    dismissNudge,
    resetNudge,
    installedAt,
  };
}
