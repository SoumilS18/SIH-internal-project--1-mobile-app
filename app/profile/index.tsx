/**
 * app/profile/index.tsx
 * Farmer Account Profile & Synchronized Farm Attributes Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { getDistrictDisplayName, getStateDisplayName } from '@/i18n/geoNames';
import type { FarmDecisionResponse } from '@/types/farm';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, userName, isDemo } = useAuth();
  const { t, language } = useLanguage();

  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);

  useEffect(() => {
    getItem<FarmDecisionResponse>(STORAGE_KEYS.FARM_DECISION, null).then((dec) => {
      setDecision(dec);
    });
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader title={t('profile.title')} subtitle={t('profile.subtitle')} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.card}>
          <View style={styles.userAvatar}>
            <Text style={{ fontSize: 32 }}>👨‍🌾</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{user?.email || 'demo@agrioptima.ai'}</Text>
          <Badge
            label={isDemo ? t('profile.demoUser') : t('profile.realUser')}
            variant={isDemo ? 'accent' : 'success'}
            size="sm"
            style={{ marginTop: Spacing.xs }}
          />
        </View>

        {/* Farm Attributes */}
        {decision ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('profile.farmDetailsTitle')}</Text>

            <View style={styles.attributesCard}>
              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('profile.location')}</Text>
                <Text style={styles.attrVal}>
                  {getDistrictDisplayName(decision.location.district_name, language)},{' '}
                  {getStateDisplayName(decision.location.state_name, language)}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('home.landSizeLabel')}</Text>
                <Text style={styles.attrVal}>
                  {decision.request.land_size_acres} {t('home.acresUnit')}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('home.soilTypeLabel')}</Text>
                <Text style={styles.attrVal}>{decision.location.major_soil_type}</Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('home.irrigationLabel')}</Text>
                <Text style={styles.attrVal}>
                  {decision.request.irrigation_type} ({decision.request.irrigation_reliability})
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('onboarding.seasonLabel')}</Text>
                <Text style={styles.attrVal}>{decision.request.season}</Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('onboarding.budgetLabel')}</Text>
                <Text style={styles.attrVal}>
                  ₹{decision.request.budget_inr.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.attrKey}>{t('onboarding.riskToleranceLabel')}</Text>
                <Text style={styles.attrVal}>{decision.request.risk_tolerance}</Text>
              </View>
            </View>

            <Button
              title="Change Farm Configuration"
              onPress={() => router.push('/(onboarding)/location')}
              variant="outline"
              size="md"
              style={{ marginTop: Spacing.base }}
              icon={<Ionicons name="create-outline" size={18} color={Colors.primary.main} />}
            />
          </View>
        ) : null}
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
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  userEmail: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    marginTop: 2,
  },
  section: {
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  attributesCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
    gap: Spacing.md,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.borderLight,
  },
  attrKey: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
  },
  attrVal: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
});
