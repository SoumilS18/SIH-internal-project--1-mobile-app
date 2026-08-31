/**
 * app/_layout.tsx
 * Root Layout for AgriOptima AI Mobile Application
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageComingSoonModal } from '@/components/modals/LanguageComingSoonModal';
import { registerForPushNotificationsAsync } from '@/services/pushNotificationService';

export default function RootLayout() {
  useEffect(() => {
    // Initialize push notifications safely on mobile launch
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="dark" />
          <View style={styles.container}>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="plan/details" options={{ presentation: 'card' }} />
              <Stack.Screen name="sentinel/observations" options={{ presentation: 'card' }} />
              <Stack.Screen name="sentinel/activity" options={{ presentation: 'card' }} />
              <Stack.Screen name="support/government-benefits" options={{ presentation: 'card' }} />
              <Stack.Screen name="crop-health/index" options={{ presentation: 'card' }} />
              <Stack.Screen name="profile/index" options={{ presentation: 'card' }} />
              <Stack.Screen name="settings/index" options={{ presentation: 'card' }} />
            </Stack>
          </View>
          <LanguageComingSoonModal />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});
