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

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

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
