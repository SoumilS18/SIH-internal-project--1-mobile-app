/**
 * lib/planProgress.ts
 * Plan Execution State, Calendar Math, and Dynamic Progression Engine for AgriOptima AI Mobile.
 */

import { getItem, setItem, STORAGE_KEYS } from './storage';
import {
  getWeeklyActionPlan,
  getSeasonWeeksCount,
} from './seasonalActionPlans';
import type {
  DailyAction,
  WeekPlan,
  PlanExecutionState,
  PlanProgressInfo,
  TaskAdjustment,
  PlanStatus,
} from '@/types/planLifecycle';

export const DEFAULT_PLAN_STATE: PlanExecutionState = {
  isStarted: false,
  startDate: null,
  lastActiveDate: null,
  currentStatus: 'NOT_STARTED',
  completedDays: [],
  skippedDays: [],
  taskNotes: {},
  taskStatusMap: {},
  adjustments: {},
};

export async function loadPlanExecutionState(): Promise<PlanExecutionState> {
  const cached = await getItem<PlanExecutionState>(STORAGE_KEYS.PLAN_LIFECYCLE, null);
  if (!cached) return { ...DEFAULT_PLAN_STATE };
  return {
    ...DEFAULT_PLAN_STATE,
    ...cached,
    completedDays: Array.isArray(cached.completedDays) ? cached.completedDays : [],
    skippedDays: Array.isArray(cached.skippedDays) ? cached.skippedDays : [],
    taskNotes: cached.taskNotes || {},
    taskStatusMap: cached.taskStatusMap || {},
    adjustments: cached.adjustments || {},
  };
}

export async function savePlanExecutionState(state: PlanExecutionState): Promise<void> {
  await setItem(STORAGE_KEYS.PLAN_LIFECYCLE, state);
}

function localizeAdjustment(
  adj: TaskAdjustment,
  language: 'en' | 'hi',
  baseDayTitle: string
): { title: string; desc: string; reason: string } {
  const isHi = language === 'hi';
  let title = isHi ? adj.adjustedTitleHi || adj.adjustedTitle : adj.adjustedTitleEn || adj.adjustedTitle;
  let desc = isHi ? adj.adjustedDescHi || adj.adjustedDesc : adj.adjustedDescEn || adj.adjustedDesc;
  let reason = isHi ? adj.reasonHi || adj.reason : adj.reasonEn || adj.reason;

  return {
    title: title || baseDayTitle,
    desc: desc || '',
    reason: reason || (isHi ? 'खेत की परिस्थितियों अनुसार समायोजित' : 'Adjusted based on field conditions'),
  };
}

export function getAdjustedWeekPlan(
  season: 'Kharif' | 'Rabi' | 'Zaid',
  weekNumber: number,
  language: 'en' | 'hi' = 'en',
  cropNames?: string[],
  adjustments?: Record<number, TaskAdjustment>
): WeekPlan & { days: (DailyAction & { isAdjusted?: boolean; adjustment?: TaskAdjustment })[] } {
  const basePlan = getWeeklyActionPlan(season, weekNumber, language, cropNames);
  if (!adjustments || Object.keys(adjustments).length === 0) {
    return basePlan;
  }

  const adjustedDays = basePlan.days.map((dayItem) => {
    const adj = adjustments[dayItem.dayOfSeason];
    if (adj) {
      const loc = localizeAdjustment(adj, language, dayItem.title);
      return {
        ...dayItem,
        title: loc.title,
        desc: loc.desc ? `${loc.desc} (${language === 'hi' ? 'कारण' : 'Reason'}: ${loc.reason})` : dayItem.desc,
        category: adj.category || dayItem.category,
        isAdjusted: true,
        adjustment: adj,
      };
    }
    return dayItem;
  });

  return {
    ...basePlan,
    days: adjustedDays,
  };
}

export function calculatePlanProgress(
  state: PlanExecutionState,
  season: 'Kharif' | 'Rabi' | 'Zaid',
  cropNames?: string[],
  language: 'en' | 'hi' = 'en'
): PlanProgressInfo {
  const totalWeeks = getSeasonWeeksCount(season);
  const totalDays = totalWeeks * 7;

  if (!state.isStarted || !state.startDate) {
    const week1Plan = getAdjustedWeekPlan(season, 1, language, cropNames, state.adjustments);
    const day1Action = week1Plan.days[0] || null;

    return {
      isStarted: false,
      startDate: null,
      currentDay: 1,
      currentWeek: 1,
      totalDays,
      totalWeeks,
      isCompleted: false,
      todayTask: day1Action,
      planStatus: 'NOT_STARTED',
      statusLabelEn: 'Not Started (Preview)',
      statusLabelHi: 'प्रारंभ नहीं हुआ (पूर्वावलोकन)',
    };
  }

  const start = new Date(state.startDate);
  const now = new Date();

  // Strip time components for precise calendar difference
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = nowMidnight - startMidnight;
  const dayDelta = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 0 on start date

  const currentDay = Math.max(1, Math.min(totalDays, dayDelta + 1));
  const currentWeek = Math.max(1, Math.min(totalWeeks, Math.floor((currentDay - 1) / 7) + 1));
  const isCompleted = dayDelta + 1 > totalDays;

  // Retrieve today's scheduled task with adjustments overlaid
  const weekPlan = getAdjustedWeekPlan(season, currentWeek, language, cropNames, state.adjustments);
  const dayIndexInWeek = (currentDay - 1) % 7;
  const todayTask = weekPlan.days[dayIndexInWeek] || weekPlan.days[0] || null;

  let status: PlanStatus = state.currentStatus;
  const hasRecentAdjustments = Object.keys(state.adjustments || {}).length > 0;

  if (isCompleted) {
    status = 'COMPLETED';
  } else if (hasRecentAdjustments && status === 'ACTIVE') {
    status = 'PLAN_UPDATED';
  } else if (status === 'NOT_STARTED') {
    status = 'ACTIVE';
  }

  const statusMap: Record<PlanStatus, { en: string; hi: string }> = {
    NOT_STARTED: { en: 'Not Started', hi: 'प्रारंभ नहीं हुआ' },
    ACTIVE: { en: 'Active', hi: 'सक्रिय' },
    ON_TRACK: { en: 'On Track', hi: 'योजना अनुसार' },
    NEEDS_ATTENTION: { en: 'Needs Attention', hi: 'ध्यान देने योग्य' },
    PLAN_UPDATED: { en: 'Plan Adjusted by AI', hi: 'एआई द्वारा समायोजित' },
    COMPLETED: { en: 'Completed', hi: 'सफलतापूर्वक पूर्ण' },
  };

  return {
    isStarted: true,
    startDate: start,
    currentDay,
    currentWeek,
    totalDays,
    totalWeeks,
    isCompleted,
    todayTask,
    planStatus: status,
    statusLabelEn: statusMap[status]?.en || 'Active',
    statusLabelHi: statusMap[status]?.hi || 'सक्रिय',
  };
}

export function startPlanExecution(
  currentState: PlanExecutionState
): PlanExecutionState {
  const nowIso = new Date().toISOString();
  return {
    ...currentState,
    isStarted: true,
    startDate: nowIso,
    lastActiveDate: nowIso,
    currentStatus: 'ACTIVE',
  };
}

export function toggleTaskCompletion(
  currentState: PlanExecutionState,
  dayNumber: number
): PlanExecutionState {
  const isDone = currentState.completedDays.includes(dayNumber);
  const newCompleted = isDone
    ? currentState.completedDays.filter((d) => d !== dayNumber)
    : [...currentState.completedDays, dayNumber];

  const newStatusMap = { ...currentState.taskStatusMap };
  newStatusMap[dayNumber] = isDone ? 'pending' : 'completed';

  return {
    ...currentState,
    completedDays: newCompleted,
    taskStatusMap: newStatusMap,
    lastActiveDate: new Date().toISOString(),
  };
}

export function applyPlanAdjustments(
  currentState: PlanExecutionState,
  adjustments: TaskAdjustment | TaskAdjustment[]
): PlanExecutionState {
  const adjList = Array.isArray(adjustments) ? adjustments : [adjustments];
  const newAdjustments = { ...currentState.adjustments };
  const newStatusMap = { ...currentState.taskStatusMap };

  for (const adj of adjList) {
    newAdjustments[adj.originalDay] = adj;
    if (adj.actionTaken === 'postponed') {
      newStatusMap[adj.originalDay] = 'delayed';
    }
  }

  return {
    ...currentState,
    currentStatus: 'PLAN_UPDATED',
    adjustments: newAdjustments,
    taskStatusMap: newStatusMap,
    lastActiveDate: new Date().toISOString(),
  };
}

export function delayTask(
  currentState: PlanExecutionState,
  dayNumber: number,
  reason: string,
  daysToPostpone: number = 1
): PlanExecutionState {
  const adjustment: TaskAdjustment = {
    originalDay: dayNumber,
    newDay: dayNumber + daysToPostpone,
    reason: reason || 'Task delayed by farmer',
    reasonHi: reason || 'किसान द्वारा कार्य स्थगित',
    actionTaken: 'postponed',
    timestamp: new Date().toISOString(),
  };

  return applyPlanAdjustments(currentState, adjustment);
}
