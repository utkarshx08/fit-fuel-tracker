import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured || !supabase) {
      // In demo/unconfigured mode, check if a demo session was active in localStorage
      const demoActive = localStorage.getItem('fitfuel_demo_auth');
      if (demoActive === 'true') {
        setUser({
          id: 'demo-user-01',
          email: 'demo@fitfuel.app',
          user_metadata: { full_name: 'Utkarsh' },
        });
      }
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Error fetching Supabase session:', error.message);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  // Sign up
  const signUp = async (email, password, fullName) => {
    setAuthError(null);
    if (!isConfigured || !supabase) {
      // Demo mock signup
      const mockUser = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || 'Athlete' },
      };
      localStorage.setItem('fitfuel_demo_auth', 'true');
      setUser(mockUser);
      return { user: mockUser, session: null, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  };

  // Sign in
  const signIn = async (email, password) => {
    setAuthError(null);
    if (!isConfigured || !supabase) {
      // Demo mock login
      const mockUser = {
        id: 'demo-user-01',
        email,
        user_metadata: { full_name: email.split('@')[0] || 'Utkarsh' },
      };
      localStorage.setItem('fitfuel_demo_auth', 'true');
      setUser(mockUser);
      return { user: mockUser, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  };

  // Resend Confirmation Email
  const resendConfirmationEmail = async (email) => {
    if (isConfigured && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      return true;
    }
    return false;
  };

  // Sign out
  const signOut = async () => {
    localStorage.removeItem('fitfuel_demo_auth');
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  // Continue as demo guest
  const continueAsDemo = () => {
    const demoUser = {
      id: 'demo-user-01',
      email: 'demo@fitfuel.app',
      user_metadata: { full_name: 'Utkarsh' },
    };
    localStorage.setItem('fitfuel_demo_auth', 'true');
    setUser(demoUser);
  };

  const value = {
    user,
    session,
    loading,
    authError,
    isConfigured,
    signUp,
    signIn,
    resendConfirmationEmail,
    signOut,
    continueAsDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
