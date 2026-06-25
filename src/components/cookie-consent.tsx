'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aisr_cookie_consent';

/**
 * Slim bottom cookie-consent bar. Dismissal persists in localStorage so it only
 * shows once. Mounts hidden and reveals after mount to avoid SSR/hydration flash.
 */
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setShow(true);
    } catch {
      /* private mode / blocked storage — just don't show */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 animate-fade-up border-t border-border bg-bg/90 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 px-4 py-3 text-center text-sm text-muted sm:flex-row">
        <span>This site requires cookies in order for us to provide proper service to you.</span>
        <button onClick={accept} className="btn-ghost shrink-0 !py-1.5 !px-4 text-fg">
          Accept
        </button>
      </div>
    </div>
  );
}
