'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: string) => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: (error?: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
}

const DEFAULT_TEST_SITE_KEY = '0x4AAAAAAEnYMFBP5bFvElJr';

export function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  className = '',
  theme = 'dark',
  size = 'normal',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Keep latest callbacks in refs so we NEVER re-render turnstile widget when parent re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  });

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  // 1. Load Cloudflare Turnstile script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.turnstile) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = 'cf-turnstile-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        console.error('[Turnstile] Script failed to load');
        onErrorRef.current?.('script-load-error');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setIsScriptLoaded(true));
    }
  }, []);

  // 2. Mount Turnstile Widget only once when script is ready
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || !window.turnstile) return;

    // If widget is already mounted in this container, don't mount again
    if (widgetIdRef.current) return;

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme,
        size: size,
        callback: (token: string) => {
          onSuccessRef.current(token);
        },
        'error-callback': (err?: string) => {
          onErrorRef.current?.(err);
        },
        'expired-callback': () => {
          onExpireRef.current?.();
        },
      });
      widgetIdRef.current = widgetId;
    } catch (err) {
      console.error('[Turnstile] Render error:', err);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [isScriptLoaded, siteKey, theme, size]);

  return (
    <div className={`turnstile-container flex justify-center ${className}`}>
      <div
        ref={containerRef}
        className={size === 'compact' ? 'min-h-[120px] min-w-[130px]' : 'min-h-[65px] min-w-[300px]'}
      />
    </div>
  );
}
