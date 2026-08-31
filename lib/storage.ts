/**
 * lib/storage.ts
 * Type-safe AsyncStorage cache manager for AgriOptima AI Mobile
 * Supports seamless offline retrieval, optimistic state updates, and persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  SESSION_STATE: 'agrioptima_session_state_v1',
  FARM_PARAMS: 'agrioptima_farm_params_v1',
  FARM_DECISION: 'agrioptima_farm_decision_v1',
  DECISION_RESULT: 'agrioptima_farm_decision_v1',
  PLAN_LIFECYCLE: 'agrioptima_plan_lifecycle_v1',
  PLAN_PROGRESS: 'agrioptima_plan_progress_v1',
  RECENT_OBSERVATIONS: 'agrioptima_recent_obs_v1',
  SAVED_LANGUAGE: 'agrioptima_language_v1',
  IS_DEMO: 'agrioptima_is_demo_v1',
  DEMO_NAME: 'agrioptima_demo_name_v1',
  LAST_SYNC: 'agrioptima_last_sync_v1',
  SENTINEL_STATE: 'agrioptima_sentinel_state_v1',
  LAST_SENTINEL_RUN: 'agrioptima_last_sentinel_v1',
} as const;

export async function getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Storage] Failed to read ${key}:`, err);
    return defaultValue;
  }
}

export async function setItem<T>(key: string, value: T): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`[Storage] Failed to write ${key}:`, err);
    return false;
  }
}

export async function removeItem(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[Storage] Failed to remove ${key}:`, err);
    return false;
  }
}

export async function clearAllFarmCache(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SESSION_STATE,
      STORAGE_KEYS.FARM_PARAMS,
      STORAGE_KEYS.FARM_DECISION,
      STORAGE_KEYS.PLAN_LIFECYCLE,
      STORAGE_KEYS.PLAN_PROGRESS,
      STORAGE_KEYS.RECENT_OBSERVATIONS,
      STORAGE_KEYS.IS_DEMO,
      STORAGE_KEYS.DEMO_NAME,
      STORAGE_KEYS.SENTINEL_STATE,
      STORAGE_KEYS.LAST_SENTINEL_RUN,
    ]);
  } catch (err) {
    console.warn('[Storage] Failed to clear farm cache:', err);
  }
}
