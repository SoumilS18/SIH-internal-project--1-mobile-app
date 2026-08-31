/**
 * lib/districtsCatalog.ts
 * 786-district agro-climatic & coordinates catalog for AgriOptima AI Mobile
 */

import type { DistrictLocationItem } from '@/types/farm';
import catalogData from './districtsCatalog.json';

export const ALL_INDIAN_DISTRICTS: DistrictLocationItem[] = catalogData as DistrictLocationItem[];

export function getDistrictsByState(stateName: string): DistrictLocationItem[] {
  if (!stateName) return [];
  return ALL_INDIAN_DISTRICTS.filter(
    (d) => d.state_name.toLowerCase() === stateName.toLowerCase()
  );
}

export function getAllStates(): string[] {
  const set = new Set<string>();
  for (const d of ALL_INDIAN_DISTRICTS) {
    if (d.state_name) set.add(d.state_name);
  }
  return Array.from(set).sort();
}

export function findDistrictByName(
  stateName: string,
  districtName: string
): DistrictLocationItem | undefined {
  return ALL_INDIAN_DISTRICTS.find(
    (d) =>
      d.state_name.toLowerCase() === stateName.toLowerCase() &&
      d.district_name.toLowerCase() === districtName.toLowerCase()
  );
}

/**
 * Finds the nearest district from geographic coordinates (Haversine formula).
 */
export function findNearestDistrict(
  latitude: number,
  longitude: number
): DistrictLocationItem | null {
  if (!ALL_INDIAN_DISTRICTS.length) return null;

  let minDistance = Infinity;
  let nearest: DistrictLocationItem | null = null;

  for (const item of ALL_INDIAN_DISTRICTS) {
    const dLat = (item.latitude - latitude) * (Math.PI / 180);
    const dLon = (item.longitude - longitude) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(latitude * (Math.PI / 180)) *
        Math.cos(item.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = 6371 * c; // Earth radius in km

    if (d < minDistance) {
      minDistance = d;
      nearest = item;
    }
  }

  return nearest;
}
