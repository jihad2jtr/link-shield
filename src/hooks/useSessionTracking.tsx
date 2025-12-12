import { useEffect, useState } from 'react';
import { sessions } from '@/lib/api';
import { useAuth } from './useAuth';

interface SessionData {
  sessionId: string;
  ipAddress?: string;
  userAgent: string;
  browserInfo: any;
  locationInfo?: any;
  cookiesData: any;
  referrer: string;
  deviceType: string;
  screenResolution: string;
}

export const useSessionTracking = () => {
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  // Generate or get session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  // Get browser info
  const getBrowserInfo = () => {
    const nav = navigator as any;
    return {
      language: nav.language,
      languages: nav.languages,
      platform: nav.platform,
      cookieEnabled: nav.cookieEnabled,
      onLine: nav.onLine,
      hardwareConcurrency: nav.hardwareConcurrency,
      memory: nav.deviceMemory,
    };
  };

  // Get device type
  const getDeviceType = () => {
    const width = window.screen.width;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Get cookies data
  const getCookiesData = () => {
    const cookies: any = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = value;
    });
    return cookies;
  };

  // Track session
  const trackSession = async () => {
    try {
      const sessionId = getSessionId();
      const data: SessionData = {
        sessionId,
        userAgent: navigator.userAgent,
        browserInfo: getBrowserInfo(),
        cookiesData: getCookiesData(),
        referrer: document.referrer,
        deviceType: getDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
      };

      setSessionData(data);

      await sessions.track({
        ...data,
        userId: user?.id
      });
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  };

  useEffect(() => {
    trackSession();

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  return { sessionData, trackSession };
};
