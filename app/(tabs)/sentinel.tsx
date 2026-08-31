/**
 * app/(tabs)/sentinel.tsx
 * Sentinel Autonomous Watchdog Screen
 * A calm, watchful farm companion that alerts only when attention is required.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Button } from '@/components/common/Button';
import { TelemetryTile } from '@/components/sentinel/TelemetryTile';
import { getItem, STORAGE_KEYS } from '@/lib/storage';
import { runAutonomousSentinelCycle } from '@/services/autonomousSentinel';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FarmDecisionResponse, SentinelAnalysisResult, ActionableAdvisory } from '@/types/farm';

export default function SentinelScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [analysis, setAnalysis] = useState<SentinelAnalysisResult | null>(null);

  const loadSentinelData = useCallback(async () => {
    try {
      const savedDecision = await getItem<FarmDecisionResponse>(
        STORAGE_KEYS.DECISION_RESULT,
        null
      );
      if (savedDecision) {
        setDecision(savedDecision);
      }

      const savedSentinel = await getItem<SentinelAnalysisResult>(
        STORAGE_KEYS.LAST_SENTINEL_RUN,
        null
      );
      if (savedSentinel) {
        setAnalysis(savedSentinel);
      } else if (savedDecision) {
        const fresh = await runAutonomousSentinelCycle(savedDecision);
        setAnalysis(fresh);
      }
    } catch (err) {
      console.warn('[Sentinel] Load error:', err);
    }
  }, []);

  useEffect(() => {
    loadSentinelData();
  }, [loadSentinelData]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (decision) {
      const fresh = await runAutonomousSentinelCycle(decision);
      setAnalysis(fresh);
    }
    setRefreshing(false);
  };

  const handleManualScan = async () => {
    if (!decision) return;
    setIsScanning(true);
    try {
      const fresh = await runAutonomousSentinelCycle(decision);
      setAnalysis(fresh);
    } finally {
      setIsScanning(false);
    }
  };

  const isAlert = Boolean(
    analysis &&
      (analysis.actionable_advisories.length > 0 ||
        analysis.telemetry.weather_condition.risk_level === 'high' ||
        analysis.telemetry.weather_condition.risk_level === 'extreme')
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('nav.sentinel')}
        subtitle={
          decision?.request.district_name
            ? `${decision.request.district_name} · 24/7 Monitoring`
            : 'Autonomous Farm Guardian'
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary.main]}
            tintColor={Colors.primary.main}
          />
        }
      >
        {/* 1. STATUS COMPANION CARD */}
        <View style={[styles.companionCard, isAlert ? styles.companionCardAlert : undefined]}>
          <View style={styles.companionHeader}>
            <View
              style={[
                styles.companionIconCircle,
                isAlert ? styles.companionIconAlert : undefined,
              ]}
            >
              <Ionicons
                name={isAlert ? 'alert-circle' : 'shield-checkmark'}
                size={24}
                color={isAlert ? Colors.accent.ochre : Colors.primary.main}
              />
            </View>

            <View style={styles.companionTitleCol}>
              <Text style={styles.companionTag}>
                {isAlert ? 'ATTENTION REQUIRED' : 'FARM COMPANION'}
              </Text>
              <Text style={styles.companionTitle}>
                {isAlert ? 'Advisory Detected' : 'Everything Looks Stable'}
              </Text>
            </View>
          </View>

          <Text style={styles.companionBody}>
            {isAlert
              ? 'Sentinel detected weather and agro-climatic conditions that may impact your upcoming tasks.'
              : 'Soil moisture, monsoon forecast, and pest risk levels for your district are within optimal ranges.'}
          </Text>

          <View style={styles.scanActionRow}>
            <Text style={styles.lastCheckedText}>
              Last checked: {analysis ? new Date(analysis.timestamp).toLocaleTimeString() : 'Just now'}
            </Text>

            <TouchableOpacity
              style={styles.scanNowBtn}
              onPress={handleManualScan}
              disabled={isScanning}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isScanning ? 'sync' : 'refresh'}
                size={14}
                color={Colors.primary.main}
              />
              <Text style={styles.scanNowText}>
                {isScanning ? 'Scanning...' : 'Scan Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. WHAT CHANGED & WHAT TO DO */}
        {isAlert && analysis?.actionable_advisories[0] ? (
          <View style={styles.actionableSection}>
            <View style={styles.changeCard}>
              <Text style={styles.sectionHeader}>WHAT CHANGED?</Text>
              <Text style={styles.changeHeadline}>
                {analysis.actionable_advisories[0].headline}
              </Text>
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationHeader}>WHAT SHOULD I DO?</Text>
              <Text style={styles.recommendationBody}>
                {analysis.actionable_advisories[0].recommendation}
              </Text>
            </View>
          </View>
        ) : null}

        {/* 3. ACTIVE ADVISORIES LIST */}
        {analysis && analysis.actionable_advisories.length > 0 ? (
          <View style={styles.advisoriesSection}>
            <Text style={styles.sectionTitle}>Active Advisories</Text>
            {analysis.actionable_advisories.map((adv: ActionableAdvisory, idx: number) => (
              <View key={idx} style={styles.advisoryItem}>
                <View style={styles.advisoryTop}>
                  <View style={styles.severityBadge}>
                    <Text style={styles.severityText}>
                      {adv.severity.toUpperCase()} PRIORITY
                    </Text>
                  </View>
                </View>
                <Text style={styles.advisoryHeadline}>{adv.headline}</Text>
                <Text style={styles.advisoryRec}>{adv.recommendation}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* 4. PROGRESSIVE DISCLOSURE FOR TELEMETRY */}
        <View style={styles.telemetrySection}>
          <TouchableOpacity
            style={styles.telemetryToggle}
            onPress={() => setShowTelemetry(!showTelemetry)}
            activeOpacity={0.8}
          >
            <View style={styles.telemetryToggleLeft}>
              <Ionicons name="stats-chart-outline" size={18} color={Colors.primary.main} />
              <Text style={styles.telemetryToggleTitle}>Live Environmental Telemetry</Text>
            </View>
            <Ionicons
              name={showTelemetry ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.neutral.textMuted}
            />
          </TouchableOpacity>

          {showTelemetry && analysis ? (
            <View style={styles.telemetryGrid}>
              <TelemetryTile
                icon="water"
                label="Soil Moisture"
                value={`${analysis.telemetry.soil_moisture.current_m3m3.toFixed(2)} m³/m³`}
                subtext={analysis.telemetry.soil_moisture.status.toUpperCase()}
                status={analysis.telemetry.soil_moisture.status === 'optimal' ? 'optimal' : 'warning'}
              />

              <TelemetryTile
                icon="rainy"
                label="7-Day Rainfall"
                value={`${analysis.telemetry.weather_condition.rainfall_7d_mm} mm`}
                subtext={`${analysis.telemetry.weather_condition.risk_level.toUpperCase()} RISK`}
                status={analysis.telemetry.weather_condition.risk_level === 'low' ? 'optimal' : 'warning'}
              />

              <TelemetryTile
                icon="thermometer"
                label="Max Temp"
                value={`${analysis.telemetry.weather_condition.max_temp_c}°C`}
                subtext="District Average"
                status="optimal"
              />

              <TelemetryTile
                icon="shield"
                label="Drought Risk"
                value={analysis.telemetry.drought_risk.level.toUpperCase()}
                subtext={`Index: ${analysis.telemetry.drought_risk.spei_index.toFixed(2)}`}
                status={analysis.telemetry.drought_risk.level === 'none' ? 'optimal' : 'warning'}
              />
            </View>
          ) : null}
        </View>

        {/* 5. LOG AUDIT LINK */}
        <TouchableOpacity
          style={styles.activityLink}
          onPress={() => router.push('/sentinel/activity')}
          activeOpacity={0.7}
        >
          <Ionicons name="time-outline" size={16} color={Colors.neutral.textSecondary} />
          <Text style={styles.activityLinkText}>View Sentinel Activity History</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.neutral.textMuted} />
        </TouchableOpacity>
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
  companionCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.md,
  },
  companionCardAlert: {
    backgroundColor: Colors.accent.ochreBg,
    borderColor: Colors.accent.ochreBorder,
  },
  companionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  companionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companionIconAlert: {
    backgroundColor: Colors.neutral.white,
    borderWidth: 1,
    borderColor: Colors.accent.ochreBorder,
  },
  companionTitleCol: {
    flex: 1,
  },
  companionTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.5,
  },
  companionTitle: {
    fontSize: Typography.fontSizes.lg - 1,
    fontWeight: '800',
    color: Colors.primary.dark,
  },
  companionBody: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  scanActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  lastCheckedText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
  },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  scanNowText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  actionableSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  changeCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  changeHeadline: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    lineHeight: 22,
  },
  recommendationCard: {
    backgroundColor: Colors.accent.terracottaBg,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent.terracottaBorder,
  },
  recommendationHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recommendationBody: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral.textPrimary,
    lineHeight: 20,
  },
  advisoriesSection: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: Spacing.sm,
  },
  advisoryItem: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.sm,
  },
  advisoryTop: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  severityBadge: {
    backgroundColor: Colors.accent.terracottaBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.4,
  },
  advisoryHeadline: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginVertical: 4,
  },
  advisoryRec: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
  },
  telemetrySection: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  telemetryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.base,
  },
  telemetryToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  telemetryToggleTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.base,
    paddingTop: 0,
  },
  activityLink: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  activityLinkText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
    flex: 1,
    marginLeft: Spacing.sm,
  },
});
