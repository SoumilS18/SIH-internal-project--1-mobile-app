/**
 * app/(tabs)/index.tsx
 * Mobile Home Screen: Designed around ONE core question — "WHAT SHOULD I DO TODAY?"
 * Clear visual rhythm, calm agricultural tones, and fast access to daily decisions.
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
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { TodayTaskCard } from '@/components/home/TodayTaskCard';
import { SentinelAlertCard } from '@/components/home/SentinelAlertCard';
import { VoiceBar } from '@/components/home/VoiceBar';
import { TaskDelayModal } from '@/components/modals/TaskDelayModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { getLocalizedCropName } from '@/i18n/cropNames';
import { runAutonomousSentinelCycle } from '@/services/autonomousSentinel';
import type {
  FarmDecisionResponse,
  SentinelAnalysisResult,
  PlanProgress,
  DailyAction,
} from '@/types/farm';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, isDemo } = useAuth();
  const { language } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [sentinelAnalysis, setSentinelAnalysis] = useState<SentinelAnalysisResult | null>(null);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);

  const [progress, setProgress] = useState<PlanProgress>({
    currentDay: 8,
    currentWeek: 2,
    totalWeeks: 8,
    completedDays: [1, 2, 3, 4, 5, 6, 7],
    delayedTasks: [],
    todayTask: {
      day_number: 8,
      week_number: 2,
      title: 'Top-Dress Nitrogen & Bio-Stimulant',
      description: 'Apply split dose of nitrogen (Urea / Bio-NPK) along the root zone before scheduled evening irrigation.',
      category: 'nutrient',
      critical: true,
      inputs: [
        { name: 'Bio-NPK Consortium', quantity_per_acre: 1.5, unit: 'liters' },
        { name: 'Neem-Coated Urea', quantity_per_acre: 22, unit: 'kg' },
      ],
    },
  });

  const loadHomeData = useCallback(async () => {
    try {
      const savedDecision = await getItem<FarmDecisionResponse>(
        STORAGE_KEYS.DECISION_RESULT,
        null
      );
      if (savedDecision) {
        setDecision(savedDecision);
      }

      const savedProgress = await getItem<PlanProgress>(STORAGE_KEYS.PLAN_PROGRESS, null);
      if (savedProgress) {
        setProgress(savedProgress);
      } else if (savedDecision && savedDecision.calendar && savedDecision.calendar.actions.length > 0) {
        const todayAction =
          savedDecision.calendar.actions.find((a: DailyAction) => a.day_number === 8) ||
          savedDecision.calendar.actions[0];

        const initialProgress: PlanProgress = {
          currentDay: todayAction?.day_number || 1,
          currentWeek: todayAction?.week_number || 1,
          totalWeeks: savedDecision.calendar.total_weeks || 8,
          completedDays: [1, 2, 3, 4, 5, 6, 7],
          delayedTasks: [],
          todayTask: todayAction || null,
        };
        setProgress(initialProgress);
        await setItem(STORAGE_KEYS.PLAN_PROGRESS, initialProgress);
      }

      // Check Sentinel live status
      const savedSentinel = await getItem<SentinelAnalysisResult>(
        STORAGE_KEYS.LAST_SENTINEL_RUN,
        null
      );
      if (savedSentinel) {
        setSentinelAnalysis(savedSentinel);
      } else if (savedDecision) {
        const freshAnalysis = await runAutonomousSentinelCycle(savedDecision);
        setSentinelAnalysis(freshAnalysis);
      }
    } catch (err) {
      console.warn('[Home] Load error:', err);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (decision) {
      const freshAnalysis = await runAutonomousSentinelCycle(decision);
      setSentinelAnalysis(freshAnalysis);
    }
    await loadHomeData();
    setRefreshing(false);
  };

  const handleCompleteTodayTask = async () => {
    if (!progress.todayTask) return;
    const isAlreadyDone = progress.completedDays.includes(progress.currentDay);
    const updatedCompleted = isAlreadyDone
      ? progress.completedDays.filter((d: number) => d !== progress.currentDay)
      : [...progress.completedDays, progress.currentDay];

    const updatedProgress: PlanProgress = {
      ...progress,
      completedDays: updatedCompleted,
    };

    setProgress(updatedProgress);
    await setItem(STORAGE_KEYS.PLAN_PROGRESS, updatedProgress);
  };

  const handleSubmitDelay = async (days: number, reason: string) => {
    setIsDelayModalOpen(false);
    if (!progress.todayTask) return;

    const newDelayedTask = {
      day_number: progress.currentDay,
      task_title: progress.todayTask.title,
      delay_days: days,
      reason,
      delayed_at: new Date().toISOString(),
    };

    const updatedProgress: PlanProgress = {
      ...progress,
      delayedTasks: [...(progress.delayedTasks || []), newDelayedTask],
    };

    setProgress(updatedProgress);
    await setItem(STORAGE_KEYS.PLAN_PROGRESS, updatedProgress);
  };

  const farmerDisplayName =
    profile?.full_name || (isDemo ? 'Farmer Ramesh' : user?.email?.split('@')[0] || 'Farmer');
  const cropRaw = decision?.request.primary_crop_id || decision?.allocated_crops?.[0]?.crop_name || 'soybean';
  const localizedCrop = getLocalizedCropName(cropRaw, language);
  const isTodayDone = progress.completedDays.includes(progress.currentDay);

  return (
    <View style={styles.container}>
      <AppHeader
        title="AgriOptima AI"
        subtitle={
          decision?.request.district_name
            ? `${decision.request.district_name}, ${decision.request.state_name || 'India'}`
            : 'Autonomous Decision Intelligence'
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
        {/* 1. GREETING & JOURNEY CONTEXT */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingPrefix}>Welcome back,</Text>
            <Text style={styles.farmerName}>{farmerDisplayName}</Text>
          </View>

          <View style={styles.journeyPill}>
            <Text style={styles.journeyPillText}>
              Week {progress.currentWeek} of {progress.totalWeeks}
            </Text>
          </View>
        </View>

        {/* 2. HERO TODAY'S TASK */}
        <View style={styles.section}>
          <TodayTaskCard
            task={progress.todayTask}
            dayNumber={progress.currentDay}
            isCompleted={isTodayDone}
            cropName={localizedCrop}
            onComplete={handleCompleteTodayTask}
            onDelayOrReport={() => setIsDelayModalOpen(true)}
            onPressDetails={() => router.push('/(tabs)/plan')}
          />
        </View>

        {/* 3. SENTINEL COMPANION UPDATE */}
        <View style={styles.section}>
          <SentinelAlertCard
            analysis={sentinelAnalysis}
            onPressDetails={() => router.push('/(tabs)/sentinel')}
          />
        </View>

        {/* 4. ASK AGRIOPTIMA VOICE BAR */}
        <View style={styles.section}>
          <VoiceBar
            onTapMic={() => router.push('/(tabs)/assistant')}
            onSelectQuickQuestion={(q) => {
              router.push({
                pathname: '/(tabs)/assistant',
                params: { initialQuery: q },
              });
            }}
          />
        </View>

        {/* 5. TYPOGRAPHIC FARM SNAPSHOT */}
        {decision ? (
          <View style={styles.snapshotSection}>
            <View style={styles.snapshotHeader}>
              <Text style={styles.snapshotHeading}>Farm Snapshot</Text>
              <TouchableOpacity
                onPress={() => router.push('/plan/details')}
                activeOpacity={0.7}
              >
                <Text style={styles.snapshotLink}>View Plan Details →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.snapshotGrid}>
              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Land Area</Text>
                <Text style={styles.snapshotValue}>
                  {decision.request.land_size_acres} Acres
                </Text>
              </View>

              <View style={styles.snapshotDivider} />

              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Primary Crop</Text>
                <Text style={styles.snapshotValue}>{localizedCrop}</Text>
              </View>

              <View style={styles.snapshotDivider} />

              <View style={styles.snapshotItem}>
                <Text style={styles.snapshotLabel}>Irrigation</Text>
                <Text style={styles.snapshotValue}>
                  {decision.request.irrigation_type}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Task Delay & Issue Modal */}
      <TaskDelayModal
        visible={isDelayModalOpen}
        dayNumber={progress.currentDay}
        taskTitle={progress.todayTask?.title || 'Daily Task'}
        onClose={() => setIsDelayModalOpen(false)}
        onSubmitDelay={handleSubmitDelay}
      />
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
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.sm,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingPrefix: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    fontWeight: '500',
  },
  farmerName: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '800',
    color: Colors.primary.dark,
    letterSpacing: -0.3,
  },
  journeyPill: {
    backgroundColor: Colors.neutral.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  journeyPillText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  section: {
    marginVertical: Spacing.xs + 2,
  },
  snapshotSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm + 2,
  },
  snapshotHeading: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snapshotLink: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.primary.main,
  },
  snapshotGrid: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
  },
  snapshotItem: {
    alignItems: 'center',
    flex: 1,
  },
  snapshotDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.neutral.borderLight,
  },
  snapshotLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
    marginBottom: 2,
    fontWeight: '500',
  },
  snapshotValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.neutral.textPrimary,
  },
});
