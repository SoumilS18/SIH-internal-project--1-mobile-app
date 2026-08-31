/**
 * components/home/SentinelAlertCard.tsx
 * Sentinel Watchful Companion Banner for Home Screen
 * Displays calm farm stability or actionable weather/pest advisory with clear next steps.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
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
        activeOpacity={0.8}
        onPress={onPressDetails}
        style={styles.stableContainer}
      >
        <View style={styles.stableIconCircle}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.primary.main} />
        </View>
        <View style={styles.stableTextContainer}>
          <View style={styles.statusRow}>
            <Text style={styles.stableHeading}>Farm Conditions Stable</Text>
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.stableDesc}>
            Weather, soil moisture, and pest risks are within optimal range today.
          </Text>
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
        <Text style={styles.timeTag}>Live Sentinel</Text>
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
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: Spacing.md,
  },
  stableIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stableTextContainer: {
    flex: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stableHeading: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.status.success,
  },
  stableDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 17,
  },
  alertContainer: {
    backgroundColor: Colors.accent.ochreBg,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.accent.ochreBorder,
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
  timeTag: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textMuted,
  },
  alertHeadline: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  recommendationBox: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    borderLeftWidth: 3,
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
