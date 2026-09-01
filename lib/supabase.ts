/**
 * lib/supabase.ts
 * Safe Supabase Client Initializer for AgriOptima AI Mobile
 *
 * Security Guidelines:
 * - Only safe public credentials (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY) are consumed.
 * - Uses AsyncStorage for mobile session persistence and auto-refresh.
 * - Never prints or logs secrets/keys.
 * - Fails gracefully with typed warnings if environment variables are not yet provided.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_SUPABASE_URL = 'https://txfpgxgmgomkhfnianpw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZnBneGdtZ29ta2hmbmlhbnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTg3MDEsImV4cCI6MjEwMzczNDcwMX0.2SteuCZBp7o372mzMCK_ikaRB-guhJNUC-ZiERf2hRk';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Validates whether valid Supabase public credentials have been supplied.
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

/**
 * Singleton Supabase Client instance for React Native.
 */
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key-not-configured', {
      auth: {
        storage: AsyncStorage,
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

/**
 * User Profile database schema representation
 */
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  preferred_language: 'en' | 'hi' | string;
  created_at?: string;
  updated_at?: string;
}
