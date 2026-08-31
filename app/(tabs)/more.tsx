/**
 * app/(tabs)/more.tsx
 * Ecosystem Hub & Utilities Menu for AgriOptima AI
 * Clean categorized menu connecting farmer tools, diagnostics, language preferences, and profile.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { getLocalizedCropName } from '@/i18n/cropNames';
import type { FarmDecisionResponse } from '@/types/farm';

export default function MoreScreen() {
  const router = useRouter();
  const { user, profile, isDemo, signOut } = useAuth();
  const { language, languageOption, t } = useLanguage();

  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);

  useEffect(() => {
    async function load() {
      const dec = await getItem<FarmDecisionResponse>(STORAGE_KEYS.DECISION_RESULT, null);
      if (dec) setDecision(dec);
    }
    load();
  }, []);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of AgriOptima AI?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const farmerName =
    profile?.full_name || (isDemo ? 'Farmer Ramesh' : user?.email?.split('@')[0] || 'Farmer');
  const cropRaw = decision?.request.primary_crop_id || decision?.allocated_crops?.[0]?.crop_name || 'soybean';
  const localizedCrop = getLocalizedCropName(cropRaw, language);

  return (
    <View style={styles.container}>
      <AppHeader title={t('nav.more')} subtitle="Tools & Account Settings" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. FARMER PROFILE BANNER */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/profile')}
          activeOpacity={0.85}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{farmerName.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{farmerName}</Text>
              {isDemo ? (
                <Badge label="DEMO FARMER" variant="accent" size="sm" />
              ) : null}
            </View>
            <Text style={styles.profileSub}>
              {decision?.request.district_name || 'Bhopal'} · {decision?.request.land_size_acres || 5} Acres · {localizedCrop}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color={Colors.neutral.textMuted} />
        </TouchableOpacity>

        {/* 2. FARM INTELLIGENCE TOOLS */}
        <Text style={styles.sectionTitle}>FARM DECISION TOOLS</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/sentinel/observations')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="clipboard-outline" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Field Observations</Text>
              <Text style={styles.menuSubtitle}>Record pest, crop stand, and irrigation feedback</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/plan/details')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="analytics-outline" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Crop Decision Analytics</Text>
              <Text style={styles.menuSubtitle}>Detailed LP solver allocations and stress tests</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/sentinel/activity')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Sentinel Audit Timeline</Text>
              <Text style={styles.menuSubtitle}>History of autonomous weather & soil adjustments</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/crop-health')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="camera-outline" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Crop Health Scanner</Text>
              <Text style={styles.menuSubtitle}>Visual AI leaf disease diagnostics (Coming Soon)</Text>
            </View>
            <Badge label="PREVIEW" variant="neutral" size="sm" />
          </TouchableOpacity>
        </View>

        {/* 3. SUPPORT & SCHEMES */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>SUPPORT & WELFARE</Text>
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/support/government-benefits')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: Colors.accent.terracottaBg }]}>
              <Ionicons name="business-outline" size={18} color={Colors.accent.terracotta} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Government Benefits & Subsidies</Text>
              <Text style={styles.menuSubtitle}>PM-KISAN, PMFBY, and micro-irrigation schemes</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconCircle}>
              <Ionicons name="globe-outline" size={18} color={Colors.primary.main} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={styles.menuTitle}>Language & Voice Settings</Text>
              <Text style={styles.menuSubtitle}>{languageOption.label} · 22 Indic Languages</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 4. SIGN OUT ACTION */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.75}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.status.danger} />
          <Text style={styles.signOutText}>
            {language === 'hi' ? 'लॉग आउट (Sign Out)' : 'Sign Out of AgriOptima AI'}
          </Text>
        </TouchableOpacity>

        {/* 5. APP METADATA & BUILD VERSION */}
        <View style={styles.versionContainer}>
          <View style={styles.versionRow}>
            <Ionicons name="leaf" size={14} color={Colors.primary.main} />
            <Text style={styles.versionTitle}>AgriOptima AI</Text>
          </View>
          <Text style={styles.versionSub}>
            Autonomous Indic Farm Advisory · Version 1.0.0 (Preview APK)
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl + Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.neutral.white,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  profileName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
  },
  profileSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs + 2,
  },
  menuGroup: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: Typography.fontSizes.sm + 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.neutral.borderLight,
    marginLeft: Spacing.base + 36 + Spacing.md,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.status.dangerBg,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.status.dangerBorder,
    marginTop: Spacing.xl,
  },
  signOutText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.status.danger,
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: 4,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionTitle: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: 0.2,
  },
  versionSub: {
    fontSize: 11,
    color: Colors.neutral.textMuted,
  },
});
