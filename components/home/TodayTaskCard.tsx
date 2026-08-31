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
  isStarted?: boolean;
  onStartPlan?: () => void;
  onComplete: () => void;
  onDelayOrReport: () => void;
  onPressDetails?: () => void;
}

export const TodayTaskCard: React.FC<TodayTaskCardProps> = ({
  task,
  dayNumber,
  isCompleted,
  cropName,
  isStarted = true,
  onStartPlan,
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
      {/* Top Accent Gradient/Color Strip */}
      <View
        style={[
          styles.accentStrip,
          task.critical ? styles.criticalStrip : styles.normalStrip,
          isCompleted ? styles.completedStrip : undefined,
        ]}
      />

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
        {!isStarted ? (
          <View style={styles.previewPill}>
            <Ionicons name="flag-outline" size={11} color={Colors.primary.main} />
            <Text style={styles.previewText}>READY TO START</Text>
          </View>
        ) : task.critical ? (
          <View style={styles.criticalPill}>
            <Ionicons name="flash" size={11} color={Colors.accent.terracotta} />
            <Text style={styles.criticalText}>TIME SENSITIVE</Text>
          </View>
        ) : null}
      </View>

      {/* Main Task Title & Description */}
      <TouchableOpacity
        activeOpacity={0.85}
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
        <View style={styles.inputsContainer}>
          <Text style={styles.inputsLabel}>FIELD INPUTS REQUIRED:</Text>
          <View style={styles.inputsGrid}>
            {task.inputs.map((inp: DailyActionInput, idx: number) => (
              <View key={idx} style={styles.inputChip}>
                <Ionicons name="cube-outline" size={12} color={Colors.primary.main} />
                <Text style={styles.inputChipText}>
                  <Text style={styles.inputChipBold}>{inp.name}: </Text>
                  {inp.quantity_per_acre} {inp.unit}/acre
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Action Footer */}
      <View style={styles.actionFooter}>
        {!isStarted ? (
          <Button
            title="Start Farm Plan (Day 1)"
            onPress={onStartPlan || onComplete}
            variant="primary"
            size="md"
            icon={<Ionicons name="play" size={18} color={Colors.neutral.white} />}
          />
        ) : isCompleted ? (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.status.success} />
            <View>
              <Text style={styles.completedText}>Completed for Today</Text>
              <Text style={styles.completedSub}>Logged to crop execution timeline</Text>
            </View>
          </View>
        ) : (
          <View style={styles.buttonGroup}>
            <Button
              title="Mark as Done"
              onPress={onComplete}
              variant="primary"
              size="md"
              style={styles.completeBtn}
              icon={<Ionicons name="checkmark-done" size={18} color={Colors.neutral.white} />}
            />
            <TouchableOpacity
              style={styles.problemBtn}
              onPress={onDelayOrReport}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={16} color={Colors.neutral.textSecondary} />
              <Text style={styles.problemBtnText}>Delay</Text>
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
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.md,
  },
  accentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  normalStrip: {
    backgroundColor: Colors.primary.main,
  },
  criticalStrip: {
    backgroundColor: Colors.accent.terracotta,
  },
  completedStrip: {
    backgroundColor: Colors.status.success,
  },
  completedCard: {
    backgroundColor: Colors.status.successBg + '30',
    borderColor: Colors.status.successBorder,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  dayBadge: {
    backgroundColor: Colors.primary.dark,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  dayBadgeText: {
    color: Colors.neutral.white,
    fontSize: Typography.fontSizes.xs,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary.subtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary.subtle,
  },
  previewText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: 0.4,
  },
  criticalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent.terracottaBg,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs - 1,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.accent.terracottaBorder,
  },
  criticalText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.4,
  },
  contentSection: {
    marginBottom: Spacing.md,
  },
  taskTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '800',
    color: Colors.neutral.textPrimary,
    lineHeight: 26,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  taskTitleCompleted: {
    color: Colors.status.success,
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: Typography.fontSizes.sm + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 21,
  },
  inputsContainer: {
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
    marginBottom: Spacing.base,
    gap: Spacing.xs,
  },
  inputsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neutral.textMuted,
    letterSpacing: 0.5,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.neutral.surfaceMuted,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.neutral.borderLight,
  },
  inputChipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textSecondary,
  },
  inputChipBold: {
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
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
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.base,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    minHeight: 48,
  },
  problemBtnText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.status.successBg,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.status.successBorder,
  },
  completedText: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '800',
    color: Colors.status.success,
  },
  completedSub: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.status.success + 'CC',
    marginTop: 1,
  },
  emptyCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    ...Shadows.base,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.md + 1,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
});

