/**
 * components/home/TodayTaskCard.tsx
 * Hero Decision Card for AgriOptima AI Home
 * The single most important card in the mobile application — "What Should I Do Today?"
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DailyAction, DailyActionInput } from '@/types/farm';

interface TodayTaskCardProps {
  task: DailyAction | null;
  dayNumber: number;
  isCompleted: boolean;
  cropName: string;
  onComplete: () => void;
  onDelayOrReport: () => void;
  onPressDetails?: () => void;
}

export const TodayTaskCard: React.FC<TodayTaskCardProps> = ({
  task,
  dayNumber,
  isCompleted,
  cropName,
  onComplete,
  onDelayOrReport,
  onPressDetails,
}) => {
  const { t } = useLanguage();

  if (!task) {
    return (
      <View style={styles.emptyCard}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="checkmark-circle-outline" size={28} color={Colors.primary.main} />
        </View>
        <Text style={styles.emptyTitle}>{t('home.allCaughtUp')}</Text>
        <Text style={styles.emptySubtitle}>{t('home.allCaughtUpDesc')}</Text>
      </View>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'irrigation':
        return 'water-outline';
      case 'fertilizer':
      case 'nutrient':
        return 'flask-outline';
      case 'pest':
      case 'protection':
        return 'shield-half-outline';
      case 'harvest':
        return 'bag-check-outline';
      case 'sowing':
      case 'planting':
        return 'flower-outline';
      default:
        return 'calendar-outline';
    }
  };

  return (
    <View style={[styles.heroCard, isCompleted ? styles.completedCard : undefined]}>
      {/* Top Meta Header */}
      <View style={styles.headerRow}>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>DAY {dayNumber}</Text>
        </View>
        <Badge
          label={task.category.toUpperCase()}
          variant={task.critical ? 'terracotta' : 'primary'}
          size="sm"
          icon={
            <Ionicons
              name={getCategoryIcon(task.category) as any}
              size={13}
              color={task.critical ? Colors.accent.terracotta : Colors.primary.main}
            />
          }
        />
        {task.critical ? (
          <View style={styles.criticalPill}>
            <Ionicons name="alert-circle" size={12} color={Colors.accent.terracotta} />
            <Text style={styles.criticalText}>CRITICAL</Text>
          </View>
        ) : null}
      </View>

      {/* Main Task Title & Description */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressDetails}
        style={styles.contentSection}
      >
        <Text style={[styles.taskTitle, isCompleted ? styles.taskTitleCompleted : undefined]}>
          {task.title}
        </Text>
        <Text style={styles.taskDescription} numberOfLines={3}>
          {task.description}
        </Text>
      </TouchableOpacity>

      {/* Resource Requirement Tags */}
      {task.inputs && task.inputs.length > 0 ? (
        <View style={styles.inputsRow}>
          <Text style={styles.inputsLabel}>Required:</Text>
          {task.inputs.map((inp: DailyActionInput, idx: number) => (
            <View key={idx} style={styles.inputChip}>
              <Text style={styles.inputChipText}>
                {inp.name} ({inp.quantity_per_acre} {inp.unit}/ac)
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Action Footer */}
      <View style={styles.actionFooter}>
        {isCompleted ? (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
            <Text style={styles.completedText}>Completed for Today</Text>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <Button
              title="Mark as Done"
              onPress={onComplete}
              variant="primary"
              size="md"
              style={styles.completeBtn}
              icon={<Ionicons name="checkmark-sharp" size={18} color={Colors.neutral.white} />}
            />
            <TouchableOpacity
              style={styles.problemBtn}
              onPress={onDelayOrReport}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={16} color={Colors.neutral.textSecondary} />
              <Text style={styles.problemBtnText}>Delay / Issue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base + 2,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.md,
  },
  completedCard: {
    backgroundColor: Colors.status.successBg + '40',
    borderColor: Colors.status.successBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dayBadge: {
    backgroundColor: Colors.primary.dark,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
  },
  dayBadgeText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  criticalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent.terracottaBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent.terracottaBorder,
  },
  criticalText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.4,
  },
  contentSection: {
    marginBottom: Spacing.md,
  },
  taskTitle: {
    fontSize: Typography.fontSizes.xl - 1,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    lineHeight: 26,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    color: Colors.status.success,
  },
  taskDescription: {
    fontSize: Typography.fontSizes.sm + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 20,
  },
  inputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
    marginBottom: Spacing.base,
  },
  inputsLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textMuted,
  },
  inputChip: {
    backgroundColor: Colors.neutral.surfaceMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  inputChipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textPrimary,
    fontWeight: '500',
  },
  actionFooter: {
    marginTop: Spacing.xs,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  completeBtn: {
    flex: 1,
  },
  problemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    minHeight: 48,
  },
  problemBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.neutral.textSecondary,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.status.successBg,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.status.successBorder,
  },
  completedText: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.status.success,
  },
  emptyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: '700',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
});
