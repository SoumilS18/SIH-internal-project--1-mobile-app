/**
 * app/plan/details.tsx
 * Progressive Disclosure: Detailed LP Solver Analytics, Cost C2, and Stress Scenarios
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { getCropDisplayName } from '@/i18n/cropNames';
import type { FarmDecisionResponse } from '@/types/farm';

export default function PlanDetailsScreen() {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);

  useEffect(() => {
    getItem<FarmDecisionResponse>(STORAGE_KEYS.FARM_DECISION, null).then((dec) => {
      setDecision(dec);
    });
  }, []);

  if (!decision) {
    return (
      <View style={styles.container}>
        <AppHeader title={t('plan.technicalDetailsTitle')} showBack />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No farm plan loaded.</Text>
        </View>
      </View>
    );
  }

  const totals = decision.farm_totals;
  const scenarios = decision.scenarios ? Object.values(decision.scenarios) : [];

  return (
    <View style={styles.container}>
      <AppHeader title={t('plan.technicalDetailsTitle')} subtitle="LP Solver & Economic Model" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Macro Economic Totals Card */}
        <View style={styles.macroCard}>
          <Text style={styles.cardHeaderTitle}>Macro Economic Portfolio Totals</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Land</Text>
              <Text style={styles.metricVal}>{totals.total_land_acres} ac</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Cultivated Area</Text>
              <Text style={styles.metricVal}>{totals.total_allocated_acres} ac</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Fallow Land</Text>
              <Text style={styles.metricVal}>{totals.fallow_acres} ac</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Working Capital</Text>
              <Text style={styles.metricVal}>₹{totals.budget_capital_inr.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Total Investment</Text>
              <Text style={styles.metricVal}>₹{totals.total_investment_inr.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Budget Utilized</Text>
              <Text style={styles.metricVal}>{totals.budget_utilization_pct}%</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Gross Revenue</Text>
              <Text style={styles.metricVal}>₹{totals.total_expected_revenue_inr.toLocaleString('en-IN')}</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Net Profit</Text>
              <Text style={[styles.metricVal, { color: Colors.status.success }]}>
                ₹{totals.total_expected_net_profit_inr.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Expected ROI</Text>
              <Text style={[styles.metricVal, { color: Colors.status.success }]}>
                +{totals.expected_farm_roi_pct}%
              </Text>
            </View>
          </View>

          <View style={styles.solverBadgeRow}>
            <Ionicons name="hardware-chip-outline" size={16} color={Colors.primary.main} />
            <Text style={styles.solverText}>
              Solver: {totals.solver_method || 'SciPy HiGHS Dual-Simplex'}
            </Text>
          </View>
        </View>

        {/* 2. Crop-by-Crop Evaluated Matrix */}
        <Text style={styles.sectionTitle}>Evaluated Candidate Crops Matrix</Text>
        <View style={styles.evalList}>
          {(decision.crop_evaluations || []).map((c, i) => {
            const locName = getCropDisplayName(c.crop_name, language);
            return (
              <View key={i} style={styles.cropEvalCard}>
                <View style={styles.cropEvalHeader}>
                  <Text style={styles.cropEvalName}>{locName}</Text>
                  <Badge
                    label={c.is_allocated ? `${c.allocated_acres} ac (ALLOCATED)` : 'NOT ALLOCATED'}
                    variant={c.is_allocated ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>

                <View style={styles.cropMetricsGrid}>
                  <View style={styles.evalCol}>
                    <Text style={styles.evalLabel}>Expected Yield</Text>
                    <Text style={styles.evalVal}>{c.expected_yield_qtl_acre} Q/ac</Text>
                  </View>

                  <View style={styles.evalCol}>
                    <Text style={styles.evalLabel}>Mandi Price</Text>
                    <Text style={styles.evalVal}>₹{c.modal_price_per_qtl}/Q</Text>
                  </View>

                  <View style={styles.evalCol}>
                    <Text style={styles.evalLabel}>C2 Cost</Text>
                    <Text style={styles.evalVal}>₹{c.cost_c2_per_acre}/ac</Text>
                  </View>

                  <View style={styles.evalCol}>
                    <Text style={styles.evalLabel}>Net Profit/ac</Text>
                    <Text style={[styles.evalVal, { color: Colors.status.success }]}>
                      ₹{c.expected_profit_per_acre}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* 3. 4-Way Stress Testing Scenarios */}
        {scenarios.length > 0 ? (
          <View style={styles.scenariosSection}>
            <Text style={styles.sectionTitle}>Environmental Stress Scenarios</Text>
            {scenarios.map((sc, i) => (
              <View key={i} style={styles.scenarioCard}>
                <View style={styles.scenarioHeader}>
                  <Text style={styles.scenarioTitle}>{sc.scenario_name}</Text>
                  <Badge label={`ROI: ${sc.roi_pct}%`} variant="primary" size="sm" />
                </View>
                <Text style={styles.scenarioDesc}>{sc.description}</Text>
                <Text style={styles.scenarioProfit}>
                  Projected Profit: ₹{sc.total_profit_inr.toLocaleString('en-IN')} (Delta: ₹{sc.profit_delta_from_live_inr.toLocaleString('en-IN')})
                </Text>
              </View>
            ))}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.neutral.textMuted,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  macroCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
    marginBottom: Spacing.lg,
  },
  cardHeaderTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.primary.dark,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricItem: {
    width: '30.5%',
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  solverBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
    gap: 6,
  },
  solverText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: Spacing.sm,
  },
  evalList: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cropEvalCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
  },
  cropEvalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cropEvalName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  cropMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  evalCol: {
    flex: 1,
  },
  evalLabel: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
  },
  evalVal: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
    marginTop: 2,
  },
  scenariosSection: {
    gap: Spacing.sm,
  },
  scenarioCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.sm,
    marginBottom: Spacing.xs,
  },
  scenarioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scenarioTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  scenarioDesc: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  scenarioProfit: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.primary.dark,
  },
});
