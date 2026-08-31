/**
 * app/index.tsx
 * Initial Gateway Switcher for AgriOptima AI Mobile
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { Colors, Spacing, Typography } from '@/constants/theme';
import type { FarmDecisionRequest } from '@/types/farm';

export default function IndexGateway() {
  const router = useRouter();
  const { user, isDemo, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(async () => {
      const isAuthenticated = Boolean(user || isDemo);

      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }

      // Check if user already has a saved farm configuration
      const savedParams = await getItem<FarmDecisionRequest>(STORAGE_KEYS.FARM_PARAMS, null);

      if (savedParams && savedParams.state_name && savedParams.district_name) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(onboarding)/location');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, isDemo, loading, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.brandTitle}>AgriOptima AI</Text>
        <Text style={styles.brandTagline}>Autonomous Farm Decision Intelligence</Text>
        <ActivityIndicator size="large" color={Colors.primary.main} style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
    borderWidth: 2,
    borderColor: Colors.primary.subtle,
  },
  logoEmoji: {
    fontSize: 42,
  },
  brandTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: '800',
    color: Colors.neutral.white,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary.subtle,
    textAlign: 'center',
  },
  loader: {
    marginTop: Spacing.xxl,
  },
});
