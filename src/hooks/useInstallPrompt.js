import { useState, useEffect, useCallback } from 'react';

/**
 * Drives the "Install App" menu item across every real device/browser case:
 *  - Android Chrome/Edge/Samsung Internet: captures `beforeinstallprompt`,
 *    exposes `canInstall` + `promptInstall()` to trigger the native dialog.
 *  - iOS Safari/Chrome/Firefox: iOS never fires that event (Apple doesn't
 *    support it) — `showIOSInstructions` is exposed instead so callers can
 *    show manual "Share > Add to Home Screen" instructions.
 *  - Firefox and any other browser without install support: neither flag is
 *    ever set, so callers render nothing — no dead/non-functional button.
 *  - Already installed (standalone display mode, either platform): both
 *    flags stay false, since there's nothing left to install.
 *
 * All browser/platform detection runs inside useEffect, never during render,
 * so this is safe in a component that Next.js server-renders on first load
 * ("use client" still means the function body runs once on the server) —
 * window/navigator don't exist there, and reading them during render would
 * crash that render instead of just skipping the feature.
 */
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    try {
      const ua = window.navigator?.userAgent || '';
      const iOSDevice = /iphone|ipad|ipod/i.test(ua);
      const standalone = Boolean(
        window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone
      );
      setIsIOS(iOSDevice);
      setIsStandalone(standalone);
    } catch {
      // Any failure here (older browser missing matchMedia, etc.) should
      // just mean no install UI is offered — never crash the page over it.
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredEvent(e);
    };
    const onInstalled = () => {
      setDeferredEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return false;
    try {
      deferredEvent.prompt();
      const choice = await deferredEvent.userChoice;
      setDeferredEvent(null);
      return choice?.outcome === 'accepted';
    } catch {
      // A second prompt() call on the same event, or the dialog being
      // dismissed in an unusual way, throws in some browsers — treat it the
      // same as "not installed" rather than letting it bubble up.
      setDeferredEvent(null);
      return false;
    }
  }, [deferredEvent]);

  return {
    canInstall: Boolean(deferredEvent) && !isStandalone,
    showIOSInstructions: isIOS && !isStandalone && !deferredEvent,
    promptInstall,
  };
}
