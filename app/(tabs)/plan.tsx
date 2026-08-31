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
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedCropName } from '@/i18n/cropNames';
import type { FarmDecisionResponse, PlanProgress, DailyAction, CropAllocation } from '@/types/farm';

export default function PlanScreen() {
  const router = useRouter();
  const { language, t } = useLanguage();

  const [refreshing, setRefreshing] = useState(false);
  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(2);
  const [progress, setProgress] = useState<PlanProgress>({
    currentDay: 8,
    currentWeek: 2,
    totalWeeks: 8,
    completedDays: [1, 2, 3, 4, 5, 6, 7],
    delayedTasks: [],
    todayTask: null,
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

      const savedProgress = await getItem<PlanProgress>(STORAGE_KEYS.PLAN_PROGRESS, null);
      if (savedProgress) {
        setProgress(savedProgress);
        setSelectedWeek(savedProgress.currentWeek || 2);
      }
    } catch (err) {
      console.warn('[Plan] Load error:', err);
    }
  }, []);

  useEffect(() => {
    loadPlanData();
  }, [loadPlanData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlanData();
    setRefreshing(false);
  };

  const handleToggleCompleteDay = async (dayNumber: number) => {
    const isDone = progress.completedDays.includes(dayNumber);
    const updated = isDone
      ? progress.completedDays.filter((d: number) => d !== dayNumber)
      : [...progress.completedDays, dayNumber];

    const updatedProgress: PlanProgress = {
      ...progress,
      completedDays: updated,
    };

    setProgress(updatedProgress);
    await setItem(STORAGE_KEYS.PLAN_PROGRESS, updatedProgress);
  };

  const allActions: DailyAction[] = decision?.calendar?.actions || [
    {
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
    {
      day_number: 10,
      week_number: 2,
      title: 'Soil Moisture & Pest Scrutiny',
      description: 'Check field corners for early stem borer infestation and inspect root aeration.',
      category: 'monitoring',
      critical: false,
    },
    {
      day_number: 12,
      week_number: 2,
      title: 'Micronutrient Foliar Spray',
      description: 'Foliar application of Zinc Sulphate and Boron to boost vegetative vigor.',
      category: 'nutrient',
      critical: false,
    },
    {
      day_number: 14,
      week_number: 2,
      title: 'Supplemental Furrow Irrigation',
      description: 'Light furrow watering to sustain root zone moisture ahead of forecast dry spell.',
      category: 'irrigation',
      critical: true,
    },
  ];

  const actionsForSelectedWeek = allActions.filter(
    (action: DailyAction) => action.week_number === selectedWeek
  );

  const cropRaw = decision?.request.primary_crop_id || decision?.allocated_crops?.[0]?.crop_name || 'soybean';
  const localizedCrop = getLocalizedCropName(cropRaw, language);
  const totalWeeks = decision?.calendar?.total_weeks || 8;

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
          currentDay={progress.currentDay}
          completedDays={progress.completedDays}
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
