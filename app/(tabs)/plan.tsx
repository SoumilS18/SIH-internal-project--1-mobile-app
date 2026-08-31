/**
 * app/(tabs)/plan.tsx
 * Farm Plan Journey Screen for AgriOptima AI
 * Displays the complete agricultural lifecycle with week navigation, daily tasks, and crop economics.
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
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { WeekTimeline } from '@/components/plan/WeekTimeline';
import { CropAllocationList } from '@/components/plan/CropAllocationList';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { getLocalizedCropName } from '@/i18n/cropNames';
import {
  loadPlanExecutionState,
  savePlanExecutionState,
  calculatePlanProgress,
  toggleTaskCompletion,
  getAdjustedWeekPlan,
} from '@/lib/planProgress';
import { getSeasonWeeksCount } from '@/lib/seasonalActionPlans';
import type { FarmDecisionResponse, DailyAction, CropAllocation } from '@/types/farm';
import type { PlanExecutionState, PlanProgressInfo } from '@/types/planLifecycle';

export default function PlanScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
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

  const loadPlanData = useCallback(async () => {
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
      setSelectedWeek(pInfo.currentWeek || 1);
    } catch (err) {
      console.warn('[Plan] Load error:', err);
    }
  }, [language]);

  useEffect(() => {
    loadPlanData();
  }, [loadPlanData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlanData();
    setRefreshing(false);
  };

  const handleToggleCompleteDay = async (dayNumber: number) => {
    if (!planState) return;
    const updatedState = toggleTaskCompletion(planState, dayNumber);
    setPlanState(updatedState);
    await savePlanExecutionState(updatedState);

    const season = (decision?.request?.season as any) || 'Kharif';
    const cropNames = decision?.allocated_crops?.map((c) => c.crop_name) || [
      decision?.request?.primary_crop_id || 'Soybean',
    ];
    const updatedInfo = calculatePlanProgress(updatedState, season, cropNames, language as any);
    setProgressInfo(updatedInfo);
  };

  const season = (decision?.request?.season as any) || 'Kharif';
  const cropNames = decision?.allocated_crops?.map((c) => c.crop_name) || [
    decision?.request?.primary_crop_id || 'Soybean',
  ];
  const totalWeeks = getSeasonWeeksCount(season);

  // Generate dynamic 7-day action plan for currently selected week
  const currentWeekPlan = getAdjustedWeekPlan(
    season,
    selectedWeek,
    language as any,
    cropNames,
    planState?.adjustments
  );

  const actionsForSelectedWeek: DailyAction[] = currentWeekPlan.days.map((dayItem) => ({
    day_number: dayItem.dayOfSeason,
    week_number: selectedWeek,
    title: dayItem.title,
    description: dayItem.desc,
    category: (dayItem.category === 'prep'
      ? 'monitoring'
      : dayItem.category === 'protection'
      ? 'pest'
      : dayItem.category) as any,
    critical: dayItem.category === 'irrigation' || dayItem.category === 'protection' || dayItem.category === 'sowing',
    inputs:
      dayItem.category === 'nutrient'
        ? [
            { name: 'Neem-Coated Urea / Bio-NPK', quantity_per_acre: 25, unit: 'kg' },
            { name: 'Zinc Sulphate', quantity_per_acre: 5, unit: 'kg' },
          ]
        : dayItem.category === 'protection'
        ? [{ name: 'Neem Oil (1500 ppm)', quantity_per_acre: 1, unit: 'L' }]
        : [],
  }));

  const cropRaw = decision?.request.primary_crop_id || decision?.allocated_crops?.[0]?.crop_name || 'soybean';
  const localizedCrop = getLocalizedCropName(cropRaw, language);

  const cropAllocations: CropAllocation[] =
    decision?.allocations ||
    (decision?.allocated_crops || []).map((c) => ({
      crop_id: c.crop_name.toLowerCase(),
      crop_name: c.crop_name,
      allocated_acres: c.allocated_acres,
      expected_yield_kg: Math.round(c.expected_yield_qtl_acre * c.allocated_acres * 100),
      expected_revenue_inr: Math.round(c.total_revenue_inr),
      expected_net_profit_inr: Math.round(c.net_profit_inr),
      expected_roi_percent: Math.round(c.roi_pct),
    }));

  return (
    <View style={styles.container}>
      <AppHeader
        title={t('nav.plan')}
        subtitle={
          decision?.request.district_name
            ? `${localizedCrop} · ${decision.request.district_name}`
            : 'Operational Execution Plan'
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
        {/* 1. JOURNEY BANNER */}
        <View style={styles.journeyBanner}>
          <View style={styles.journeyHeader}>
            <View>
              <Text style={styles.journeyTag}>FARM JOURNEY</Text>
              <Text style={styles.journeyTitle}>
                Week {selectedWeek} of {totalWeeks}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => router.push('/plan/details')}
              activeOpacity={0.75}
            >
              <Ionicons name="analytics-outline" size={16} color={Colors.primary.main} />
              <Text style={styles.detailsBtnText}>Analytics</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.journeySub}>
            Follow the daily schedule below to maximize yield and optimize input costs.
          </Text>
        </View>

        {/* 2. WEEK SELECTOR & ACTIONS TIMELINE */}
        <WeekTimeline
          totalWeeks={totalWeeks}
          selectedWeek={selectedWeek}
          currentDay={progressInfo.currentDay}
          completedDays={planState?.completedDays || []}
          actionsForWeek={actionsForSelectedWeek}
          onSelectWeek={(w) => setSelectedWeek(w)}
          onToggleCompleteDay={handleToggleCompleteDay}
        />

        {/* 3. CROP ALLOCATION LIST */}
        {cropAllocations.length > 0 ? (
          <CropAllocationList
            allocations={cropAllocations}
            totalLandSize={decision?.request.land_size_acres || 5}
          />
        ) : null}
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
  journeyBanner: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.md,
  },
  journeyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  journeyTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.5,
  },
  journeyTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '800',
    color: Colors.primary.dark,
  },
  journeySub: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary.subtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  detailsBtnText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.primary.main,
  },
});
