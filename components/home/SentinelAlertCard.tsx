/**
 * components/home/SentinelAlertCard.tsx
 * Sentinel Watchful Companion Banner for Home Screen
 * Displays calm farm stability or actionable weather/pest advisory with clear next steps.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import type { SentinelAnalysisResult } from '@/types/farm';

interface SentinelAlertCardProps {
  analysis: SentinelAnalysisResult | null;
  onPressDetails: () => void;
}

export const SentinelAlertCard: React.FC<SentinelAlertCardProps> = ({
  analysis,
  onPressDetails,
}) => {
  const isAlert = Boolean(
    analysis &&
      (analysis.actionable_advisories.length > 0 ||
        analysis.telemetry.weather_condition.risk_level === 'high' ||
        analysis.telemetry.weather_condition.risk_level === 'extreme')
  );

  const topAdvisory = analysis?.actionable_advisories[0];

  if (!isAlert) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPressDetails}
        style={styles.stableContainer}
      >
        <View style={styles.stableIconCircle}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.status.success} />
        </View>
        <View style={styles.stableTextContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.stableHeading}>Farm Conditions Stable</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>SENTINEL ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.stableDesc}>
            Weather, soil moisture, and pest risks are within optimal range today.
          </Text>

          {/* Quick telemetry chips */}
          <View style={styles.miniChipsRow}>
            <View style={styles.miniChip}>
              <Ionicons name="thermometer-outline" size={11} color={Colors.weather.temp} />
              <Text style={styles.miniChipText}>28°C Clear</Text>
            </View>
            <View style={styles.miniChip}>
              <Ionicons name="water-outline" size={11} color={Colors.weather.rainy} />
              <Text style={styles.miniChipText}>62% Soil Moisture</Text>
            </View>
            <View style={styles.miniChip}>
              <Ionicons name="bug-outline" size={11} color={Colors.status.success} />
              <Text style={styles.miniChipText}>Low Pest Risk</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.neutral.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPressDetails}
      style={styles.alertContainer}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertBadge}>
          <Ionicons name="warning" size={14} color={Colors.accent.ochre} />
          <Text style={styles.alertBadgeText}>ATTENTION NEEDED</Text>
        </View>
        <View style={styles.liveAlertTag}>
          <View style={styles.liveAlertDot} />
          <Text style={styles.timeTag}>Live Sentinel</Text>
        </View>
      </View>

      <Text style={styles.alertHeadline}>
        {topAdvisory?.headline || 'Weather or pest advisory detected for your district'}
      </Text>

      {topAdvisory?.recommendation ? (
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationLabel}>RECOMMENDED ACTION:</Text>
          <Text style={styles.recommendationText} numberOfLines={2}>
            {topAdvisory.recommendation}
          </Text>
        </View>
      ) : null}

      <View style={styles.alertFooter}>
        <Text style={styles.footerLink}>See Sentinel Analysis & Adjustments</Text>
        <Ionicons name="arrow-forward" size={15} color={Colors.accent.terracotta} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  stableContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: Spacing.md,
    ...Shadows.base,
  },
  stableIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.status.successBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.status.successBorder,
  },
  stableTextContainer: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stableHeading: {
    fontSize: Typography.fontSizes.base - 0.5,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: -0.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.status.successBg,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.status.success,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.status.success,
    letterSpacing: 0.3,
  },
  stableDesc: {
    fontSize: Typography.fontSizes.xs + 0.5,
    color: Colors.neutral.textSecondary,
    lineHeight: 17,
  },
  miniChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  miniChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.neutral.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: BorderRadius.sm,
  },
  miniChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
  },
  alertContainer: {
    backgroundColor: Colors.accent.ochreBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.accent.ochreBorder,
    ...Shadows.base,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent.ochreBorder,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.ochre,
    letterSpacing: 0.5,
  },
  liveAlertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveAlertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.ochre,
  },
  timeTag: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.accent.ochre,
  },
  alertHeadline: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
    letterSpacing: -0.2,
  },
  recommendationBox: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm + 2,
    borderLeftWidth: 3.5,
    borderLeftColor: Colors.accent.terracotta,
    marginBottom: Spacing.sm,
  },
  recommendationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textPrimary,
    lineHeight: 18,
    fontWeight: '500',
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  footerLink: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.accent.terracotta,
  },
});

