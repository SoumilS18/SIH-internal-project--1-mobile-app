/**
 * components/plan/CropAllocationList.tsx
 * Crop Acreage Allocation & Financial Projection Cards for Farm Plan
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedCropName } from '@/i18n/cropNames';
import type { CropAllocation } from '@/types/farm';

interface CropAllocationListProps {
  allocations: CropAllocation[];
  totalLandSize: number;
}

export const CropAllocationList: React.FC<CropAllocationListProps> = ({
  allocations,
  totalLandSize,
}) => {
  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Optimized Crop Allocation</Text>

      <View style={styles.list}>
        {allocations.map((alloc) => {
          const localizedName = getLocalizedCropName(alloc.crop_id, language);
          const percentOfLand = totalLandSize > 0 ? (alloc.allocated_acres / totalLandSize) * 100 : 100;

          return (
            <View key={alloc.crop_id} style={styles.cropCard}>
              <View style={styles.cropHeader}>
                <View style={styles.cropIconTitle}>
                  <View style={styles.cropIconCircle}>
                    <Ionicons name="leaf" size={16} color={Colors.primary.main} />
                  </View>
                  <View>
                    <Text style={styles.cropName}>{localizedName}</Text>
                    <Text style={styles.acreageSubtitle}>
                      {alloc.allocated_acres} Acres ({percentOfLand.toFixed(0)}% of land)
                    </Text>
                  </View>
                </View>

                <View style={styles.roiPill}>
                  <Text style={styles.roiText}>+{alloc.expected_roi_percent}% ROI</Text>
                </View>
              </View>

              {/* Acreage Allocation Bar */}
              <View style={styles.allocationBarBg}>
                <View
                  style={[
                    styles.allocationBarFill,
                    { width: `${Math.min(100, percentOfLand)}%` },
                  ]}
                />
              </View>

              {/* Financial & Yield Metrics Row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Expected Yield</Text>
                  <Text style={styles.metricVal}>
                    {alloc.expected_yield_kg.toLocaleString()} kg
                  </Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Est. Revenue</Text>
                  <Text style={styles.metricVal}>
                    ₹{alloc.expected_revenue_inr.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.metricCol}>
                  <Text style={styles.metricLabel}>Net Profit</Text>
                  <Text style={[styles.metricVal, styles.profitVal]}>
                    ₹{alloc.expected_net_profit_inr.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: Spacing.sm,
  },
  list: {
    gap: Spacing.md,
  },
  cropCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  cropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cropIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cropIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  acreageSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  roiPill: {
    backgroundColor: Colors.status.successBg,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.status.successBorder,
  },
  roiText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    color: Colors.status.success,
  },
  allocationBarBg: {
    height: 6,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  allocationBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 3,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: Typography.fontSizes.xs - 1,
    color: Colors.neutral.textMuted,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  profitVal: {
    color: Colors.status.success,
  },
});
