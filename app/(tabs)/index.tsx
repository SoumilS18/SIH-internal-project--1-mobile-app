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
import {
  loadPlanExecutionState,
  savePlanExecutionState,
  calculatePlanProgress,
  startPlanExecution,
  toggleTaskCompletion,
  delayTask,
} from '@/lib/planProgress';
import { getSeasonWeeksCount } from '@/lib/seasonalActionPlans';
import type {
  FarmDecisionResponse,
  SentinelAnalysisResult,
  DailyAction,
} from '@/types/farm';
import type { PlanExecutionState, PlanProgressInfo } from '@/types/planLifecycle';

export default function HomeScreen() {
  const router = useRouter();
  const { user, profile, isDemo } = useAuth();
  const { language } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [sentinelAnalysis, setSentinelAnalysis] = useState<SentinelAnalysisResult | null>(null);
  const [isDelayModalOpen, setIsDelayModalOpen] = useState(false);
  const [planState, setPlanState] = useState<PlanExecutionState | null>(null);
  const [progressInfo, setProgressInfo] = useState<PlanProgressInfo>({
    isStarted: false,
    startDate: null,
    currentDay: 1,
    currentWeek: 1,
    totalDays: 126,
    totalWeeks: 18,
    isCompleted: false,
    todayTask: null,
    planStatus: 'NOT_STARTED',
    statusLabelEn: 'Not Started',
    statusLabelHi: 'प्रारंभ नहीं हुआ',
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

      const pState = await loadPlanExecutionState();
      setPlanState(pState);

      const season = (savedDecision?.request?.season as any) || 'Kharif';
      const cropNames = savedDecision?.allocated_crops?.map((c) => c.crop_name) || [
        savedDecision?.request?.primary_crop_id || 'Soybean',
      ];
      const pInfo = calculatePlanProgress(pState, season, cropNames, language as any);
      setProgressInfo(pInfo);

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
  }, [language]);

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

  const handleStartPlan = async () => {
    if (!planState) return;
    const startedState = startPlanExecution(planState);
    setPlanState(startedState);
    await savePlanExecutionState(startedState);

    const season = (decision?.request?.season as any) || 'Kharif';
    const cropNames = decision?.allocated_crops?.map((c) => c.crop_name) || [
      decision?.request?.primary_crop_id || 'Soybean',
    ];
    const updatedInfo = calculatePlanProgress(startedState, season, cropNames, language as any);
    setProgressInfo(updatedInfo);
  };

  const handleCompleteTodayTask = async () => {
    if (!planState) return;
    const updatedState = toggleTaskCompletion(planState, progressInfo.currentDay);
    setPlanState(updatedState);
    await savePlanExecutionState(updatedState);

    const season = (decision?.request?.season as any) || 'Kharif';
    const cropNames = decision?.allocated_crops?.map((c) => c.crop_name) || [
      decision?.request?.primary_crop_id || 'Soybean',
    ];
    const updatedInfo = calculatePlanProgress(updatedState, season, cropNames, language as any);
    setProgressInfo(updatedInfo);
  };

  const handleSubmitDelay = async (days: number, reason: string) => {
    setIsDelayModalOpen(false);
    if (!planState) return;

    const updatedState = delayTask(planState, progressInfo.currentDay, reason, days);
    setPlanState(updatedState);
    await savePlanExecutionState(updatedState);

    const season = (decision?.request?.season as any) || 'Kharif';
    const cropNames = decision?.allocated_crops?.map((c) => c.crop_name) || [
      decision?.request?.primary_crop_id || 'Soybean',
    ];
    const updatedInfo = calculatePlanProgress(updatedState, season, cropNames, language as any);
    setProgressInfo(updatedInfo);
  };

  const farmerDisplayName =
    profile?.full_name || (isDemo ? 'Farmer Ramesh' : user?.email?.split('@')[0] || 'Farmer');
  const cropRaw = decision?.request.primary_crop_id || decision?.allocated_crops?.[0]?.crop_name || 'soybean';
  const localizedCrop = getLocalizedCropName(cropRaw, language);
  const isTodayDone = planState?.completedDays?.includes(progressInfo.currentDay) || false;

  const activeDailyAction: DailyAction | null = progressInfo.todayTask
    ? {
        day_number: progressInfo.todayTask.dayOfSeason,
        week_number: progressInfo.currentWeek,
        title: progressInfo.todayTask.title,
        description: progressInfo.todayTask.desc,
        category: (progressInfo.todayTask.category === 'prep'
          ? 'monitoring'
          : progressInfo.todayTask.category === 'protection'
          ? 'pest'
          : progressInfo.todayTask.category) as any,
        critical:
          progressInfo.todayTask.category === 'irrigation' ||
          progressInfo.todayTask.category === 'protection' ||
          progressInfo.todayTask.category === 'sowing',
        inputs:
          progressInfo.todayTask.category === 'nutrient'
            ? [
                { name: 'Neem-Coated Urea', quantity_per_acre: 25, unit: 'kg' },
                { name: 'Zinc Sulfate (21%)', quantity_per_acre: 5, unit: 'kg' },
              ]
            : progressInfo.todayTask.category === 'protection'
            ? [{ name: 'Neem Oil (1500 ppm)', quantity_per_acre: 1, unit: 'L' }]
            : [],
      }
    : null;

  return (
    <View style={styles.container}>
      <AppHeader
        title="AgriOptima AI"
        subtitle={
          decision?.request.district_name
            ? `${decision.request.district_name}, ${decision.request.state_name || 'India'} (${decision.request.season || 'Kharif'})`
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
            <Text style={styles.greetingPrefix}>
              {language === 'hi' ? 'स्वागत है,' : 'Welcome back,'}
            </Text>
            <Text style={styles.farmerName}>{farmerDisplayName}</Text>
          </View>

          <View style={styles.journeyPill}>
            <Text style={styles.journeyPillText}>
              {!progressInfo.isStarted
                ? (language === 'hi' ? `पूर्वावलोकन · ${progressInfo.totalWeeks} सप्ताह` : `Preview · ${progressInfo.totalWeeks} Weeks`)
                : (language === 'hi' ? `दिन ${progressInfo.currentDay} · सप्ताह ${progressInfo.currentWeek}/${progressInfo.totalWeeks}` : `Day ${progressInfo.currentDay} · Week ${progressInfo.currentWeek} of ${progressInfo.totalWeeks}`)}
            </Text>
          </View>
        </View>

        {/* 2. HERO TODAY'S TASK */}
        <View style={styles.section}>
          <TodayTaskCard
            task={activeDailyAction}
            dayNumber={progressInfo.currentDay}
            isCompleted={isTodayDone}
            cropName={localizedCrop}
            isStarted={progressInfo.isStarted}
            onStartPlan={handleStartPlan}
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
        dayNumber={progressInfo.currentDay}
        taskTitle={activeDailyAction?.title || 'Daily Task'}
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
