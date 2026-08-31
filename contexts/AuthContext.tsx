/**
 * contexts/AuthContext.tsx
 * Supabase Authentication & User Profile Management for AgriOptima AI Mobile
 * Supports Real Supabase Accounts, Session Restoration, and Isolated Demo Farmer Mode.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, UserProfile } from '@/lib/supabase';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isDemo: boolean;
  userName: string;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    pass: string,
    fullName: string,
    preferredLanguage?: string
  ) => Promise<{ error: string | null; emailConfirmationRequired: boolean }>;
  signOut: () => Promise<void>;
  continueAsDemo: (name?: string) => void;
  updateLanguagePreference: (langCode: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatAuthError(err: any): string {
  if (!err) return 'Authentication failed. Please try again.';
  const msg: string = (err.message || String(err)).toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Invalid email or password. Please verify your credentials.';
  if (msg.includes('user already registered')) return 'An account already exists for this email address.';
  if (msg.includes('password should be at least')) return 'Password must be at least 6 characters long.';
  if (msg.includes('network request failed')) return 'Unable to connect to authentication server. Check your network.';
  return err.message || 'Authentication error occurred.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [demoName, setDemoName] = useState<string>('Demo Farmer');

  // Load or create user profile from Supabase
  const loadOrCreateProfile = useCallback(
    async (authUser: User, nameHint?: string, langHint = 'en'): Promise<void> => {
      if (!isSupabaseConfigured) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, preferred_language, created_at, updated_at')
          .eq('id', authUser.id)
          .single();

        if (!error && data) {
          setProfile(data as UserProfile);
          return;
        }

        // Create profile if missing
        const fallbackName =
          nameHint?.trim() ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'Farmer';

        const newProfile: UserProfile = {
          id: authUser.id,
          full_name: fallbackName,
          email: authUser.email || '',
          preferred_language: langHint,
        };

        const { data: inserted } = await supabase
          .from('profiles')
          .upsert(newProfile)
          .select()
          .single();

        if (inserted) {
          setProfile(inserted as UserProfile);
        } else {
          setProfile(newProfile);
        }
      } catch {
        setProfile({
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Farmer',
          email: authUser.email || '',
          preferred_language: 'en',
        });
      }
    },
    []
  );

  // Initialize and listen to Auth state changes
  useEffect(() => {
    let isMounted = true;

    // Check demo state first
    getItem<string>(STORAGE_KEYS.IS_DEMO, 'false').then((demoFlag) => {
      if (demoFlag === 'true' && isMounted) {
        setIsDemo(true);
        getItem<string>(STORAGE_KEYS.DEMO_NAME, 'Demo Farmer').then((name) => {
          if (name && isMounted) setDemoName(name);
        });
      }
    });

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const safetyTimer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2000);

    // Initial session check
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        const initialSession = data?.session ?? null;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          setIsDemo(false);
          removeItem(STORAGE_KEYS.IS_DEMO);
          loadOrCreateProfile(initialSession.user);
        }
        setLoading(false);
        clearTimeout(safetyTimer);
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false);
          clearTimeout(safetyTimer);
        }
      });

    // Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        setIsDemo(false);
        removeItem(STORAGE_KEYS.IS_DEMO);
        loadOrCreateProfile(newSession.user);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [loadOrCreateProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      if (!isSupabaseConfigured) {
        return {
          error: 'Supabase credentials not configured in .env. Please continue as Demo Farmer.',
        };
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { error: formatAuthError(error) };
        }

        if (data.user) {
          setIsDemo(false);
          await removeItem(STORAGE_KEYS.IS_DEMO);
          await loadOrCreateProfile(data.user);
        }

        return { error: null };
      } catch (err) {
        return { error: formatAuthError(err) };
      }
    },
    [loadOrCreateProfile]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      preferredLanguage = 'en'
    ): Promise<{ error: string | null; emailConfirmationRequired: boolean }> => {
      if (!isSupabaseConfigured) {
        return {
          error: 'Supabase credentials not configured in .env. Please continue as Demo Farmer.',
          emailConfirmationRequired: false,
        };
      }

      try {
        const cleanName = fullName.trim() || 'Farmer';
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: cleanName,
              preferred_language: preferredLanguage,
            },
          },
        });

        if (error) {
          return { error: formatAuthError(error), emailConfirmationRequired: false };
        }

        const emailConfirmationRequired = Boolean(data.user && !data.session);

        if (data.user) {
          setIsDemo(false);
          await removeItem(STORAGE_KEYS.IS_DEMO);
          await loadOrCreateProfile(data.user, cleanName, preferredLanguage);
        }

        return { error: null, emailConfirmationRequired };
      } catch (err) {
        return { error: formatAuthError(err), emailConfirmationRequired: false };
      }
    },
    [loadOrCreateProfile]
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsDemo(false);
      await removeItem(STORAGE_KEYS.IS_DEMO);
      await removeItem(STORAGE_KEYS.DEMO_NAME);
    }
  }, []);

  const updateLanguagePreference = useCallback(
    async (langCode: string): Promise<void> => {
      if (!user || !isSupabaseConfigured) return;
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            preferred_language: langCode,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (!error) {
          setProfile((prev) => (prev ? { ...prev, preferred_language: langCode } : null));
        }
      } catch (err) {
        console.warn('Could not sync language preference to Supabase:', err);
      }
    },
    [user]
  );

  const continueAsDemo = useCallback((name = 'Demo Farmer') => {
    setIsDemo(true);
    setDemoName(name);
    setItem(STORAGE_KEYS.IS_DEMO, 'true');
    setItem(STORAGE_KEYS.DEMO_NAME, name);
  }, []);

  const activeUserName = useMemo(() => {
    if (isDemo) return demoName;
    if (profile?.full_name?.trim()) return profile.full_name.trim();
    if (user?.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim();
    if (user?.email) return user.email.split('@')[0];
    return 'Farmer';
  }, [isDemo, demoName, profile, user]);

  const value = useMemo(
    () => ({
      user,
      profile,
      session,
      loading,
      isConfigured: isSupabaseConfigured,
      isDemo,
      userName: activeUserName,
      signIn,
      signUp,
      signOut,
      continueAsDemo,
      updateLanguagePreference,
    }),
    [
      user,
      profile,
      session,
      loading,
      isDemo,
      activeUserName,
      signIn,
      signUp,
      signOut,
      continueAsDemo,
      updateLanguagePreference,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
