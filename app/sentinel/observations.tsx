/**
 * app/sentinel/observations.tsx
 * Progressive Farmer Field Observation & Issue Logger Screen
 * Designed for effortless field reporting with 3-choice quick sentiment and contextual checklists.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { AppHeader } from '@/components/common/AppHeader';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import {
  loadPlanExecutionState,
  savePlanExecutionState,
  calculatePlanProgress,
  applyPlanAdjustments,
} from '@/lib/planProgress';
import {
  UNIVERSAL_OBSERVATIONS,
  getContextualTaskChecklist,
} from '@/lib/contextualChecklists';
import { AutonomousSentinel } from '@/services/autonomousSentinel';
import type { FarmDecisionResponse } from '@/types/farm';
import type { PlanExecutionState, PlanProgressInfo, FarmerObservationLog } from '@/types/planLifecycle';

type OutcomeSentiment = 'smooth' | 'issues' | 'failed' | null;

export default function ObservationsScreen() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const [decision, setDecision] = useState<FarmDecisionResponse | null>(null);
  const [planState, setPlanState] = useState<PlanExecutionState | null>(null);
  const [outcome, setOutcome] = useState<OutcomeSentiment>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [selectedUniversal, setSelectedUniversal] = useState<string[]>([]);
  const [customText, setCustomText] = useState<string>('');
  const [recentLogs, setRecentLogs] = useState<FarmerObservationLog[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const dec = await getItem<FarmDecisionResponse>(STORAGE_KEYS.DECISION_RESULT, null);
      const pState = await loadPlanExecutionState();
      const logs = await getItem<FarmerObservationLog[]>(STORAGE_KEYS.RECENT_OBSERVATIONS, []);

      setDecision(dec);
      setPlanState(pState);
      setRecentLogs(logs || []);
    }
    load();
  }, []);

  const progress: PlanProgressInfo = planState
    ? calculatePlanProgress(
        planState,
        decision?.request?.season || 'Kharif',
        decision?.allocated_crops?.map((c) => c.crop_name) || [],
        language as any
      )
    : {
        isStarted: false,
        startDate: null,
        currentDay: 8,
        currentWeek: 2,
        totalDays: 126,
        totalWeeks: 8,
        isCompleted: false,
        todayTask: null,
        planStatus: 'ACTIVE',
        statusLabelEn: 'Active',
        statusLabelHi: 'सक्रिय',
      };

  const primaryCrop =
    decision?.request.primary_crop_id ||
    decision?.allocated_crops?.[0]?.crop_name ||
    'soybean';
  const taskChecklist = getContextualTaskChecklist(
    progress.currentDay,
    progress.currentWeek,
    progress.todayTask,
    primaryCrop
  );

  const toggleQuestion = (id: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleUniversal = (id: string) => {
    setSelectedUniversal((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!outcome && selectedQuestions.length === 0 && selectedUniversal.length === 0 && !customText.trim()) {
      Alert.alert('Notice', 'Please select how today went or add an observation.');
      return;
    }

    setSubmitting(true);

    const newLog: FarmerObservationLog = {
      id: `OBS-${Date.now()}`,
      dayNumber: progress.currentDay,
      taskTitle: progress.todayTask?.title || 'Daily Field Inspection',
      selectedQuestions: [
        ...(outcome ? [`outcome_${outcome}`] : []),
        ...selectedQuestions,
        ...selectedUniversal,
      ],
      customText: customText.trim() || undefined,
      timestamp: new Date().toISOString(),
      synced: true,
    };

    const updatedLogs = [newLog, ...recentLogs];
    setRecentLogs(updatedLogs);
    await setItem(STORAGE_KEYS.RECENT_OBSERVATIONS, updatedLogs);

    // Run Sentinel re-evaluation with farmer observations
    if (decision && planState) {
      const allObservations = [
        ...(outcome ? [`Outcome: ${outcome}`] : []),
        ...selectedQuestions,
        ...selectedUniversal,
        customText.trim(),
      ].filter(Boolean);

      const sentinelResult = AutonomousSentinel.runCycle(
        decision,
        null,
        language,
        {
          isStarted: planState.isStarted,
          currentDay: progress.currentDay,
          currentWeek: progress.currentWeek,
          totalDays: progress.totalDays,
          totalWeeks: progress.totalWeeks,
          todayTask: progress.todayTask,
          primaryCrop,
          allocatedCrops: decision.allocated_crops?.map((c) => c.crop_name) || [],
          planStatus: progress.planStatus,
          farmerObservations: allObservations,
          customReportText: customText.trim(),
        }
      );

      if (sentinelResult.planAdjustments && sentinelResult.planAdjustments.length > 0) {
        const nextPlanState = applyPlanAdjustments(planState, sentinelResult.planAdjustments);
        setPlanState(nextPlanState);
        await savePlanExecutionState(nextPlanState);
      }
    }

    setSubmitting(false);
    setOutcome(null);
    setSelectedQuestions([]);
    setSelectedUniversal([]);
    setCustomText('');

    Alert.alert(
      isHi ? 'अवलोकन दर्ज हुआ' : 'Observation Recorded',
      isHi
        ? 'आपके अवलोकन को सेंटिनल द्वारा विश्लेषित कर योजना अद्यतन कर दी गई है।'
        : 'Your observation was recorded and analyzed by Sentinel.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Field Observation"
        subtitle={`Day ${progress.currentDay} Task Feedback`}
        showBack
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Context Banner */}
        <View style={styles.contextBanner}>
          <View style={styles.contextHeader}>
            <Text style={styles.contextDay}>DAY {progress.currentDay}</Text>
            <Badge
              label={(progress.todayTask?.category || 'General').toUpperCase()}
              variant="primary"
              size="sm"
            />
          </View>
          <Text style={styles.contextTitle}>
            {progress.todayTask?.title || 'Daily Field Inspection'}
          </Text>
          <Text style={styles.contextDesc}>
            {progress.todayTask?.desc || 'Inspect crop growth and soil moisture conditions.'}
          </Text>
        </View>

        {/* 1. SIMPLE 3-OPTION SENTIMENT SELECTOR */}
        <Text style={styles.sectionHeader}>HOW DID TODAY'S TASK GO?</Text>
        <View style={styles.sentimentRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOutcome('smooth')}
            style={[
              styles.sentimentCard,
              outcome === 'smooth' ? styles.sentimentCardSuccess : undefined,
            ]}
          >
            <Text style={styles.sentimentEmoji}>😊</Text>
            <Text
              style={[
                styles.sentimentLabel,
                outcome === 'smooth' ? styles.sentimentLabelActive : undefined,
              ]}
            >
              Completed Smoothly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOutcome('issues')}
            style={[
              styles.sentimentCard,
              outcome === 'issues' ? styles.sentimentCardWarning : undefined,
            ]}
          >
            <Text style={styles.sentimentEmoji}>⚠️</Text>
            <Text
              style={[
                styles.sentimentLabel,
                outcome === 'issues' ? styles.sentimentLabelActive : undefined,
              ]}
            >
              Had Some Issues
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setOutcome('failed')}
            style={[
              styles.sentimentCard,
              outcome === 'failed' ? styles.sentimentCardDanger : undefined,
            ]}
          >
            <Text style={styles.sentimentEmoji}>❌</Text>
            <Text
              style={[
                styles.sentimentLabel,
                outcome === 'failed' ? styles.sentimentLabelActive : undefined,
              ]}
            >
              Could Not Complete
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. CONTEXTUAL TASK CHECKLIST */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
          CHECK APPLICABLE CONDITIONS
        </Text>
        <View style={styles.checklistGroup}>
          {taskChecklist.questions.map((q) => {
            const isSelected = selectedQuestions.includes(q.id);
            return (
              <TouchableOpacity
                key={q.id}
                style={[
                  styles.checkItem,
                  isSelected ? styles.checkItemActive : undefined,
                ]}
                onPress={() => toggleQuestion(q.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected ? styles.checkboxActive : undefined,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color={Colors.neutral.white} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.checkLabel,
                    isSelected ? styles.checkLabelActive : undefined,
                  ]}
                >
                  {isHi ? q.label.hi : q.label.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 3. UNIVERSAL FIELD CONDITIONS */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
          GENERAL FIELD OBSERVATIONS
        </Text>
        <View style={styles.checklistGroup}>
          {UNIVERSAL_OBSERVATIONS.map((u) => {
            const isSelected = selectedUniversal.includes(u.id);
            return (
              <TouchableOpacity
                key={u.id}
                style={[
                  styles.checkItem,
                  isSelected ? styles.checkItemActive : undefined,
                ]}
                onPress={() => toggleUniversal(u.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.checkbox,
                    isSelected ? styles.checkboxActive : undefined,
                  ]}
                >
                  {isSelected ? (
                    <Ionicons name="checkmark" size={14} color={Colors.neutral.white} />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.checkLabel,
                    isSelected ? styles.checkLabelActive : undefined,
                  ]}
                >
                  {isHi ? u.label.hi : u.label.en}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. OPTIONAL NOTES */}
        <Text style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
          ADDITIONAL NOTES (OPTIONAL)
        </Text>
        <TextInput
          style={styles.textInputArea}
          placeholder={
            isHi
              ? 'यहाँ अपने खेत की कोई अन्य समस्या या टिप्पणी लिखें...'
              : 'Write any specific pest symptoms, soil texture, or notes...'
          }
          placeholderTextColor={Colors.neutral.textMuted}
          value={customText}
          onChangeText={setCustomText}
          multiline
          numberOfLines={3}
        />

        {/* Submit Action */}
        <Button
          title={submitting ? 'Saving Observation...' : 'Submit Field Observation'}
          onPress={handleSubmit}
          loading={submitting}
          variant="primary"
          size="lg"
          style={styles.submitBtn}
          icon={<Ionicons name="cloud-upload-outline" size={18} color={Colors.neutral.white} />}
        />

        {/* Recent Submitted Logs */}
        {recentLogs.length > 0 ? (
          <View style={styles.recentSection}>
            <Text style={styles.sectionHeader}>RECENT OBSERVATIONS</Text>
            {recentLogs.slice(0, 4).map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <Text style={styles.logDay}>Day {log.dayNumber}: {log.taskTitle}</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                {log.customText ? <Text style={styles.logCustomText}>"{log.customText}"</Text> : null}
                <Text style={styles.logCountText}>
                  {log.selectedQuestions.length} checklist items evaluated by Sentinel
                </Text>
              </View>
            ))}
          </View>
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
  contextBanner: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.md,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  contextDay: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent.terracotta,
    letterSpacing: 0.5,
  },
  contextTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '800',
    color: Colors.primary.dark,
    marginBottom: 4,
  },
  contextDesc: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.neutral.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sentimentRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sentimentCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    minHeight: 90,
    justifyContent: 'center',
  },
  sentimentCardSuccess: {
    backgroundColor: Colors.status.successBg,
    borderColor: Colors.status.success,
  },
  sentimentCardWarning: {
    backgroundColor: Colors.accent.ochreBg,
    borderColor: Colors.accent.ochre,
  },
  sentimentCardDanger: {
    backgroundColor: Colors.status.dangerBg,
    borderColor: Colors.status.danger,
  },
  sentimentEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  sentimentLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '700',
    color: Colors.neutral.textSecondary,
    textAlign: 'center',
  },
  sentimentLabelActive: {
    color: Colors.neutral.textPrimary,
  },
  checklistGroup: {
    gap: Spacing.xs + 2,
  },
  checkItem: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    gap: Spacing.md,
  },
  checkItemActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.subtle,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.white,
  },
  checkboxActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  checkLabel: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    color: Colors.neutral.textPrimary,
    fontWeight: '500',
    lineHeight: 20,
  },
  checkLabelActive: {
    fontWeight: '700',
    color: Colors.primary.dark,
  },
  textInputArea: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    fontSize: Typography.fontSizes.sm + 1,
    color: Colors.neutral.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  recentSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.borderLight,
  },
  logCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral.border,
    marginBottom: Spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logDay: {
    fontSize: Typography.fontSizes.xs + 1,
    fontWeight: '700',
    color: Colors.primary.dark,
    flex: 1,
  },
  logTime: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.neutral.textMuted,
  },
  logCustomText: {
    fontSize: Typography.fontSizes.xs + 1,
    color: Colors.neutral.textSecondary,
    fontStyle: 'italic',
    marginVertical: 2,
  },
  logCountText: {
    fontSize: 10,
    color: Colors.neutral.textMuted,
    marginTop: 2,
  },
});
