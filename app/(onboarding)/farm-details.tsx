/**
 * app/(onboarding)/farm-details.tsx
 * Step 2 of Farm Onboarding: Land Area, Soil, and Irrigation Systems
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/common/AppHeader';
import { getItem, setItem } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FarmDecisionRequest } from '@/types/farm';

export default function FarmDetailsScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [landSize, setLandSize] = useState<string>('5.0');
  const [irrigationType, setIrrigationType] = useState<FarmDecisionRequest['irrigation_type']>('Borewell');
  const [irrigationReliability, setIrrigationReliability] = useState<FarmDecisionRequest['irrigation_reliability']>('High');

  useEffect(() => {
    getItem<any>('agrioptima_onboarding_draft', {}).then((draft) => {
      if (draft?.land_size_acres) setLandSize(String(draft.land_size_acres));
      if (draft?.irrigation_type) setIrrigationType(draft.irrigation_type);
      if (draft?.irrigation_reliability) setIrrigationReliability(draft.irrigation_reliability);
    });
  }, []);

  const irrigationOptions: { id: FarmDecisionRequest['irrigation_type']; labelKey: string; icon: string }[] = [
    { id: 'Borewell', labelKey: 'onboarding.options.borewell', icon: 'water' },
    { id: 'Rainfed', labelKey: 'onboarding.options.rainfed', icon: 'rainy' },
    { id: 'Canal', labelKey: 'onboarding.options.canal', icon: 'git-branch' },
    { id: 'Drip', labelKey: 'onboarding.options.drip', icon: 'color-filter' },
    { id: 'Sprinkler', labelKey: 'onboarding.options.sprinkler', icon: 'sparkles' },
  ];

  const reliabilityOptions: { id: FarmDecisionRequest['irrigation_reliability']; labelKey: string; color: string }[] = [
    { id: 'High', labelKey: 'onboarding.options.high', color: Colors.status.success },
    { id: 'Medium', labelKey: 'onboarding.options.medium', color: Colors.status.warning },
    { id: 'Low', labelKey: 'onboarding.options.low', color: Colors.status.danger },
  ];

  const handleContinue = async () => {
    const acres = parseFloat(landSize) || 5.0;
    const prev = await getItem<any>('agrioptima_onboarding_draft', {});

    await setItem('agrioptima_onboarding_draft', {
      ...prev,
      land_size_acres: acres,
      irrigation_type: irrigationType,
      irrigation_reliability: irrigationReliability,
    });

    router.push('/(onboarding)/preferences');
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('onboarding.step2Title')} subtitle="Step 2 of 3" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.headline}>{t('onboarding.step2Title')}</Text>
          <Text style={styles.subhead}>{t('onboarding.step2Subtitle')}</Text>
        </View>

        {/* Land Size Input */}
        <Text style={styles.fieldLabel}>{t('onboarding.landSizeLabel')}</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.landInput}
            value={landSize}
            onChangeText={setLandSize}
            keyboardType="decimal-pad"
            placeholder="5.0"
            placeholderTextColor={Colors.neutral.textMuted}
          />
          <Text style={styles.unitText}>{t('home.acresUnit')}</Text>
        </View>

        {/* Quick Land Size Presets */}
        <View style={styles.presetRow}>
          {['1.0', '2.5', '5.0', '10.0', '20.0'].map((preset) => (
            <TouchableOpacity
              key={preset}
              style={[
                styles.presetPill,
                landSize === preset ? styles.presetPillActive : undefined,
              ]}
              onPress={() => setLandSize(preset)}
            >
              <Text
                style={[
                  styles.presetText,
                  landSize === preset ? styles.presetTextActive : undefined,
                ]}
              >
                {preset} ac
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Irrigation Type Grid */}
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
          {t('onboarding.irrigationTypeLabel')}
        </Text>
        <View style={styles.optionsGrid}>
          {irrigationOptions.map((opt) => {
            const isSelected = irrigationType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionCard,
                  isSelected ? styles.optionCardActive : undefined,
                ]}
                onPress={() => setIrrigationType(opt.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionIconBg,
                    isSelected ? styles.optionIconBgActive : undefined,
                  ]}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={20}
                    color={isSelected ? Colors.neutral.white : Colors.primary.main}
                  />
                </View>
                <Text
                  style={[
                    styles.optionTitle,
                    isSelected ? styles.optionTitleActive : undefined,
                  ]}
                >
                  {t(opt.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Irrigation Reliability */}
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
          {t('onboarding.irrigationReliabilityLabel')}
        </Text>
        <View style={styles.reliabilityGroup}>
          {reliabilityOptions.map((rel) => {
            const isSelected = irrigationReliability === rel.id;
            return (
              <TouchableOpacity
                key={rel.id}
                style={[
                  styles.reliabilityCard,
                  isSelected ? styles.reliabilityCardActive : undefined,
                ]}
                onPress={() => setIrrigationReliability(rel.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.statusDot, { backgroundColor: rel.color }]} />
                <Text
                  style={[
                    styles.reliabilityText,
                    isSelected ? styles.reliabilityTextActive : undefined,
                  ]}
                >
                  {t(rel.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={t('onboarding.nextButton')}
          onPress={handleContinue}
          variant="primary"
          size="lg"
          style={styles.nextBtn}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.neutral.white} />}
        />
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
  titleSection: {
    marginVertical: Spacing.base,
  },
  headline: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  subhead: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  landInput: {
    flex: 1,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  unitText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: '600',
    color: Colors.neutral.textMuted,
  },
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  presetPill: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
  },
  presetPillActive: {
    backgroundColor: Colors.primary.bg,
    borderColor: Colors.primary.main,
  },
  presetText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    fontWeight: '600',
  },
  presetTextActive: {
    color: Colors.primary.dark,
  },
  optionsGrid: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  optionCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
    backgroundColor: Colors.primary.bg,
  },
  optionIconBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.primary.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionIconBgActive: {
    backgroundColor: Colors.primary.main,
  },
  optionTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  optionTitleActive: {
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  reliabilityGroup: {
    gap: Spacing.sm,
  },
  reliabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  reliabilityCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
    backgroundColor: Colors.primary.bg,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.md,
  },
  reliabilityText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  reliabilityTextActive: {
    color: Colors.primary.dark,
    fontWeight: '700',
  },
  nextBtn: {
    marginTop: Spacing.xxl,
  },
});
