/**
 * components/plan/WeekTimeline.tsx
 * Horizontal Week Selector & Daily Action Timeline
 * Renders an intuitive farm journey with progress stepper and categorized day cards.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { Badge } from '@/components/common/Badge';
import type { DailyAction } from '@/types/farm';

interface WeekTimelineProps {
  totalWeeks: number;
  selectedWeek: number;
  currentDay: number;
  completedDays: number[];
  actionsForWeek: DailyAction[];
  onSelectWeek: (week: number) => void;
  onToggleCompleteDay: (day: number) => void;
}

export const WeekTimeline: React.FC<WeekTimelineProps> = ({
  totalWeeks,
  selectedWeek,
  currentDay,
  completedDays,
  actionsForWeek,
  onSelectWeek,
  onToggleCompleteDay,
}) => {
  const weeksArray = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* 1. HORIZONTAL WEEK SELECTOR CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.weekSelector}
      >
        {weeksArray.map((week) => {
          const isSelected = week === selectedWeek;
          const isCurrent = week === Math.ceil(currentDay / 7);

          return (
            <TouchableOpacity
              key={week}
              activeOpacity={0.75}
              onPress={() => onSelectWeek(week)}
              style={[
                styles.weekChip,
                isSelected ? styles.weekChipSelected : undefined,
              ]}
            >
              <Text
                style={[
                  styles.weekChipText,
                  isSelected ? styles.weekChipTextSelected : undefined,
                ]}
              >
                Week {week}
              </Text>
              {isCurrent ? <View style={styles.currentDot} /> : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 2. PROGRESS STEPPER BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>
            Week {selectedWeek} Timeline
          </Text>
          <Text style={styles.progressRatio}>
            {actionsForWeek.filter((a) => completedDays.includes(a.day_number)).length} /{' '}
            {actionsForWeek.length} Completed
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${
                  actionsForWeek.length > 0
                    ? (actionsForWeek.filter((a) => completedDays.includes(a.day_number)).length /
                        actionsForWeek.length) *
                      100
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {/* 3. DAILY ACTION CARDS */}
      <View style={styles.actionsList}>
        {actionsForWeek.length === 0 ? (
          <View style={styles.emptyWeek}>
            <Ionicons name="calendar-outline" size={24} color={Colors.neutral.textMuted} />
            <Text style={styles.emptyWeekText}>No specific actions scheduled for Week {selectedWeek}.</Text>
          </View>
        ) : (
          actionsForWeek.map((action) => {
            const isCompleted = completedDays.includes(action.day_number);
            const isToday = action.day_number === currentDay;

            return (
              <View
                key={action.day_number}
                style={[
                  styles.dayCard,
                  isToday ? styles.dayCardToday : undefined,
                  isCompleted ? styles.dayCardCompleted : undefined,
                ]}
              >
                <View style={styles.dayCardLeft}>
                  <TouchableOpacity
                    style={[
                      styles.checkCircle,
                      isCompleted ? styles.checkCircleDone : undefined,
                    ]}
                    onPress={() => onToggleCompleteDay(action.day_number)}
                    activeOpacity={0.7}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color={Colors.neutral.white} />
                    ) : (
                      <Text style={styles.dayNumText}>D{action.day_number}</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.dayCardContent}>
                  <View style={styles.dayCardMeta}>
                    <Text style={styles.dayText}>Day {action.day_number}</Text>
                    <Badge
                      label={action.category.toUpperCase()}
                      variant={action.critical ? 'terracotta' : 'neutral'}
                      size="sm"
                    />
                    {isToday ? (
                      <View style={styles.todayPill}>
                        <Text style={styles.todayPillText}>TODAY</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.actionTitle,
                      isCompleted ? styles.actionTitleDone : undefined,
                    ]}
                  >
                    {action.title}
                  </Text>
                  <Text style={styles.actionDesc}>{action.description}</Text>

                  {action.inputs && action.inputs.length > 0 ? (
                    <View style={styles.inputsList}>
                      {action.inputs.map((inp: any, i: number) => (
                        <Text key={i} style={styles.inputText}>
                          • {inp.name} ({inp.quantity_per_acre} {inp.unit}/ac)
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  weekSelector: {
    paddingVertical: Spacing.xs,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs + 2,
    marginBottom: Spacing.md,
  },
  weekChip: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekChipSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  weekChipText: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
  weekChipTextSelected: {
    color: Colors.neutral.white,
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent.ochre,
  },
  progressContainer: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.base,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  progressLabel: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  progressRatio: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.neutral.textMuted,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.neutral.surfaceMuted,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 3,
  },
  actionsList: {
    gap: Spacing.sm + 2,
  },
  dayCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadows.sm,
  },
  dayCardToday: {
    borderColor: Colors.primary.main,
    borderWidth: 1.5,
  },
  dayCardCompleted: {
    backgroundColor: Colors.status.successBg + '30',
    borderColor: Colors.status.successBorder,
  },
  dayCardLeft: {
    alignItems: 'center',
    paddingTop: 2,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral.surfaceMuted,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: Colors.status.success,
    borderColor: Colors.status.success,
  },
  dayNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neutral.textSecondary,
  },
  dayCardContent: {
    flex: 1,
  },
  dayCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
    marginBottom: 4,
  },
  dayText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textMuted,
  },
  todayPill: {
    backgroundColor: Colors.primary.dark,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  todayPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.neutral.white,
    letterSpacing: 0.5,
  },
  actionTitle: {
    fontSize: Typography.fontSizes.base - 1,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    marginBottom: 4,
  },
  actionTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.neutral.textMuted,
  },
  actionDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
  },
  inputsList: {
    marginTop: Spacing.xs + 2,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  inputText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    fontWeight: '500',
  },
  emptyWeek: {
    backgroundColor: Colors.neutral.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: Spacing.sm,
  },
  emptyWeekText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textMuted,
    textAlign: 'center',
  },
});
