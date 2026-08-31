/**
 * app/(onboarding)/preferences.tsx
 * Step 3 of Farm Onboarding: Season, Budget, Risk Preference & Generate Plan
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/common/AppHeader';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { getFarmDecision } from '@/services/api';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FarmDecisionRequest } from '@/types/farm';

export default function PreferencesScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [season, setSeason] = useState<FarmDecisionRequest['season']>('Kharif');
  const [budget, setBudget] = useState<string>('120000');
  const [riskTolerance, setRiskTolerance] = useState<FarmDecisionRequest['risk_tolerance']>('Balanced');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const seasonOptions: { id: FarmDecisionRequest['season']; labelKey: string; subtext: string }[] = [
    { id: 'Kharif', labelKey: 'onboarding.options.kharif', subtext: 'June - Nov (Monsoon / Paddy, Maize, Cotton, Soybean)' },
    { id: 'Rabi', labelKey: 'onboarding.options.rabi', subtext: 'Oct - March (Winter / Wheat, Mustard, Gram, Potato)' },
    { id: 'Zaid', labelKey: 'onboarding.options.zaid', subtext: 'March - June (Summer / Moong, Urad, Vegetables)' },
  ];

  const riskOptions: { id: FarmDecisionRequest['risk_tolerance']; labelKey: string; icon: string }[] = [
    { id: 'Balanced', labelKey: 'onboarding.options.balanced', icon: 'scale' },
    { id: 'Conservative', labelKey: 'onboarding.options.conservative', icon: 'shield-checkmark' },
    { id: 'Aggressive', labelKey: 'onboarding.options.aggressive', icon: 'trending-up' },
  ];

  const handleGeneratePlan = async () => {
    setError(null);
    setLoading(true);

    try {
      const draft = await getItem<any>('agrioptima_onboarding_draft', {});
      const budgetNum = parseFloat(budget.replace(/[^0-9]/g, '')) || 100000;

      const requestPayload: FarmDecisionRequest = {
        state_name: draft.state_name || 'Madhya Pradesh',
        district_name: draft.district_name || 'Bhopal',
        land_size_acres: draft.land_size_acres || 5.0,
        budget_inr: budgetNum,
        irrigation_type: draft.irrigation_type || 'Borewell',
        irrigation_reliability: draft.irrigation_reliability || 'High',
        season,
        risk_tolerance: riskTolerance,
        custom_lat: draft.latitude || null,
        custom_lon: draft.longitude || null,
      };

      // 1. Calculate optimal decision (tries backend -> falls back to client solver)
      const decision = await getFarmDecision(requestPayload);

      // 2. Persist locally to storage
      await setItem(STORAGE_KEYS.FARM_PARAMS, requestPayload);
      await setItem(STORAGE_KEYS.FARM_DECISION, decision);

      // 3. Navigate to Main Application Tabs
      router.replace('/(tabs)');
    } catch (err: any) {
      console.warn('Plan generation error:', err);
      setError('Could not generate plan. Please verify inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={t('onboarding.step3Title')} subtitle="Step 3 of 3" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.headline}>{t('onboarding.step3Title')}</Text>
          <Text style={styles.subhead}>{t('onboarding.step3Subtitle')}</Text>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={Colors.status.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Season Selector */}
        <Text style={styles.fieldLabel}>{t('onboarding.seasonLabel')}</Text>
        <View style={styles.optionsGroup}>
          {seasonOptions.map((opt) => {
            const isSelected = season === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.seasonCard,
                  isSelected ? styles.seasonCardActive : undefined,
                ]}
                onPress={() => setSeason(opt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.radioRow}>
                  <View style={[styles.radioCircle, isSelected ? styles.radioCircleActive : undefined]}>
                    {isSelected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.seasonTitle, isSelected ? styles.seasonTitleActive : undefined]}>
                    {t(opt.labelKey)}
                  </Text>
                </View>
                <Text style={styles.seasonSub}>{opt.subtext}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Working Capital Budget */}
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
          {t('onboarding.budgetLabel')}
        </Text>
        <View style={styles.budgetInputCard}>
          <Text style={styles.rupeeSymbol}>₹</Text>
          <TextInput
            style={styles.budgetInput}
            value={budget}
            onChangeText={setBudget}
            keyboardType="number-pad"
            placeholder="120000"
            placeholderTextColor={Colors.neutral.textMuted}
          />
        </View>

        {/* Budget presets */}
        <View style={styles.presetRow}>
          {['50,000', '1,00,000', '1,50,000', '2,50,000'].map((p) => {
            const rawVal = p.replace(/,/g, '');
            return (
              <TouchableOpacity
                key={p}
                style={[
                  styles.presetPill,
                  budget === rawVal ? styles.presetPillActive : undefined,
                ]}
                onPress={() => setBudget(rawVal)}
              >
                <Text
                  style={[
                    styles.presetText,
                    budget === rawVal ? styles.presetTextActive : undefined,
                  ]}
                >
                  ₹{p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Risk Preference */}
        <Text style={[styles.fieldLabel, { marginTop: Spacing.xl }]}>
          {t('onboarding.riskToleranceLabel')}
        </Text>
        <View style={styles.riskGrid}>
          {riskOptions.map((risk) => {
            const isSelected = riskTolerance === risk.id;
            return (
              <TouchableOpacity
                key={risk.id}
                style={[
                  styles.riskCard,
                  isSelected ? styles.riskCardActive : undefined,
                ]}
                onPress={() => setRiskTolerance(risk.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={risk.icon as any}
                  size={20}
                  color={isSelected ? Colors.primary.dark : Colors.neutral.textSecondary}
                />
                <Text
                  style={[
                    styles.riskText,
                    isSelected ? styles.riskTextActive : undefined,
                  ]}
                >
                  {t(risk.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={loading ? t('onboarding.generatingPlan') : t('onboarding.generatePlanButton')}
          onPress={handleGeneratePlan}
          loading={loading}
          variant="primary"
          size="lg"
          style={styles.solveBtn}
          icon={<Ionicons name="sparkles" size={20} color={Colors.neutral.white} />}
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
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.dangerBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.dangerBorder,
    marginBottom: Spacing.base,
    gap: Spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: Typography.fontSizes.xs,
    color: Colors.status.danger,
  },
  fieldLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  optionsGroup: {
    gap: Spacing.sm,
  },
  seasonCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  seasonCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
    backgroundColor: Colors.primary.bg,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioCircleActive: {
    borderColor: Colors.primary.main,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.main,
  },
  seasonTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
  },
  seasonTitleActive: {
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  seasonSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    marginLeft: 28,
  },
  budgetInputCard: {
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
  rupeeSymbol: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.primary.main,
    marginRight: Spacing.xs,
  },
  budgetInput: {
    flex: 1,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
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
  riskGrid: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  riskCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    ...Shadows.sm,
  },
  riskCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
    backgroundColor: Colors.primary.bg,
  },
  riskText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  riskTextActive: {
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  solveBtn: {
    marginTop: Spacing.xxl,
  },
});
