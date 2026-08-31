/**
 * components/sentinel/TelemetryTile.tsx
 * Environmental & Telemetry Metric Card with organic status indicator.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface TelemetryTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  subtext?: string;
  status?: 'optimal' | 'warning' | 'critical' | 'neutral';
}

export const TelemetryTile: React.FC<TelemetryTileProps> = ({
  icon,
  label,
  value,
  subtext,
  status = 'optimal',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return Colors.status.warning;
      case 'critical':
        return Colors.status.danger;
      case 'neutral':
        return Colors.neutral.textSecondary;
      case 'optimal':
      default:
        return Colors.status.success;
    }
  };

  return (
    <View style={styles.tile}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={16} color={Colors.primary.main} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>

      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
  },
  subtext: {
    fontSize: Typography.fontSizes.xs - 1,
    color: Colors.neutral.textSecondary,
    marginTop: 2,
  },
});
