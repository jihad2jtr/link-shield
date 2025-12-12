import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);

      // Optionally verify token/get user details from backend
      auth.getUser().then(({ data, error }) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          // Token might be invalid
          localStorage.removeItem('session');
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string, recaptchaToken?: string | null) => {
    const { data, error } = await auth.signUp({ email, password, data: { full_name: fullName }, recaptchaToken });
    if (data && data.session) {
      setSession(data.session);
      setUser(data.user);
      localStorage.setItem('session', JSON.stringify(data.session));
      // Reload page to trigger navigation
      setTimeout(() => window.location.reload(), 500);
    }
    return { data, error };
  };

  const signIn = async (email: string, password: string, recaptchaToken?: string | null) => {
    const { data, error } = await auth.signInWithPassword({ email, password, recaptchaToken });
    if (data && data.session) {
      setSession(data.session);
      setUser(data.user);
      localStorage.setItem('session', JSON.stringify(data.session));
      // Reload page to trigger navigation
      setTimeout(() => window.location.reload(), 500);
    }
    return { data, error };
  };

  const signOut = async () => {
    await auth.signOut();
    localStorage.removeItem('session');
    localStorage.removeItem('session_id');
    setSession(null);
    setUser(null);
    // Reload page to go back to login
    setTimeout(() => window.location.reload(), 300);
    return { error: null };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
