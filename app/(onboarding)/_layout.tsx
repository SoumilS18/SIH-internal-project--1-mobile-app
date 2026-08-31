/**
 * app/(onboarding)/_layout.tsx
 * Onboarding Stack Layout
 */

import React from 'react';
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="location" />
      <Stack.Screen name="farm-details" />
      <Stack.Screen name="preferences" />
    </Stack>
  );
}
