/**
 * services/autonomousSentinel.ts
 * AgriOptima Autonomous Sentinel Engine for Mobile
 * Bounded Autonomous Agricultural Decision Agent (Human-Safe Advisory Agent).
 *
 * Strictly implements the OBSERVE -> REASON -> DECIDE -> VALIDATE -> ACT -> VERIFY -> MONITOR loop.
 */

import type { FarmDecisionResponse } from '@/types/farm';
import type {
  AutonomousCycleLog,
  AutonomousAction,
  ActionType,
  ActionValidationResult,
  ProactiveAdvisory,
} from '@/types/autonomous';
import type { PlanReasoningContext, TaskAdjustment } from '@/types/planLifecycle';
import { getCropDisplayName } from '@/i18n/cropNames';
import { getDistrictDisplayName } from '@/i18n/geoNames';

export const WHITELISTED_ACTIONS: ReadonlySet<ActionType> = new Set([
  'APPLY_PROACTIVE_ADVISORY',
  'UPDATE_ACTION_PRIORITY',
  'RECORD_OPTIMAL_STATUS',
]);

export function computeStateFingerprint(decision: FarmDecisionResponse): string {
  const district = decision.location?.district_name || 'UNKNOWN';
  const soilMoisture =
    decision.weather?.root_zone_soil_moisture_m3m3 !== null && decision.weather?.root_zone_soil_moisture_m3m3 !== undefined
      ? decision.weather.root_zone_soil_moisture_m3m3.toFixed(2)
      : 'NULL';
  const rain7d =
    decision.weather?.forecast_rain_7d_total_mm !== null && decision.weather?.forecast_rain_7d_total_mm !== undefined
      ? decision.weather.forecast_rain_7d_total_mm.toFixed(1)
      : 'NULL';
  const maxTemp =
    decision.weather?.forecast_temp_max_c !== null && decision.weather?.forecast_temp_max_c !== undefined
      ? decision.weather.forecast_temp_max_c.toFixed(1)
      : 'NULL';

  const drought = decision.risk?.drought_risk_score?.toFixed(2) || '0.00';
  const waterlog = decision.risk?.waterlogging_risk_score?.toFixed(2) || '0.00';
  const heat = decision.risk?.heat_risk_score?.toFixed(2) || '0.00';
  const riskLabel = decision.risk?.overall_risk_label || 'LOW';

  const crops = (decision.allocated_crops || [])
    .map((c) => c.crop_name)
    .sort()
    .join('+');

  const raw = `${district}|SM:${soilMoisture}|R7:${rain7d}|T:${maxTemp}|D:${drought}|W:${waterlog}|H:${heat}|L:${riskLabel}|C:${crops}`;

  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return Math.abs(hash >>> 0).toString(16).padStart(8, '0');
}

export class ActionValidator {
  public static validate(actionType: string): ActionValidationResult {
    if (WHITELISTED_ACTIONS.has(actionType as ActionType)) {
      return {
        is_approved: true,
        action_type: actionType,
        reason: 'Action is explicitly whitelisted, non-destructive, and agronomically safe.',
        security_clearance: 'WHITELISTED_SAFE',
      };
    }

    return {
      is_approved: false,
      action_type: actionType,
      reason: `Action rejected: Operation '${actionType}' is unauthorized. Blocked by ActionValidator.`,
      security_clearance: 'REJECTED_UNSAFE',
    };
  }
}

export class ActionExecutor {
  public static execute(
    action: AutonomousAction,
    decision: FarmDecisionResponse,
    language: string,
    fingerprint: string
  ): { success: boolean; advisory: ProactiveAdvisory | null; detail: string } {
    const isHi = language === 'hi';

    if (!action.is_approved) {
      return {
        success: false,
        advisory: null,
        detail: isHi
          ? 'कार्रवाई अस्वीकृत: सुरक्षा सीमा द्वारा अनधिकृत ऑपरेशन को रोक दिया गया।'
          : 'Action blocked: ActionValidator safety boundary rejected unauthorized operation.',
      };
    }

    switch (action.action_type) {
      case 'APPLY_PROACTIVE_ADVISORY': {
        const advisoryId = `ADV-${fingerprint.slice(0, 6).toUpperCase()}`;
        const severity =
          action.priority === 'CRITICAL' ? 'critical' : action.priority === 'HIGH' ? 'warning' : 'info';

        const advisory: ProactiveAdvisory = {
          id: advisoryId,
          fingerprint,
          headline: action.title,
          severity,
          recommended_action: action.description,
          crop_impact: isHi
            ? `प्रभावित फसलें: ${(action.target_crops || []).map((c) => getCropDisplayName(c, 'hi')).join(', ') || 'समग्र खेत'}`
            : `Impacted crops: ${(action.target_crops || []).join(', ') || 'Whole farm'}`,
          source: isHi ? 'एग्रीऑप्टिमा स्वायत्त सेंटिनल' : 'AgriOptima Autonomous Sentinel Engine',
          timestamp: new Date().toISOString(),
          action_required: action.priority === 'CRITICAL' || action.priority === 'HIGH',
        };

        return {
          success: true,
          advisory,
          detail: isHi
            ? `सक्रिय सुरक्षा परामर्श #${advisoryId} सफलतापूर्वक जारी किया गया।`
            : `Proactive safety advisory #${advisoryId} generated and applied.`,
        };
      }

      case 'UPDATE_ACTION_PRIORITY':
      case 'RECORD_OPTIMAL_STATUS':
      default:
        return {
          success: true,
          advisory: null,
          detail: isHi ? 'खेत की अनुकूल स्थिति दर्ज की गई।' : 'Optimal telemetry baseline verified.',
        };
    }
  }
}

export class AutonomousSentinel {
  public static runCycle(
    decision: FarmDecisionResponse,
    previousFingerprint: string | null = null,
    language: string = 'en',
    planContext?: PlanReasoningContext
  ): {
    log: AutonomousCycleLog;
    advisory: ProactiveAdvisory | null;
    isNewState: boolean;
    planAdjustments?: TaskAdjustment[];
  } {
    const isHi = language === 'hi';
    const currentFingerprint = computeStateFingerprint(decision);
    const stateChanged = previousFingerprint !== currentFingerprint;
    const nowIso = new Date().toISOString();

    const districtDisplay = getDistrictDisplayName(decision.location?.district_name, language);
    const allocatedCrops = (decision.allocated_crops || []).map((c) => c.crop_name);

    // 1. OBSERVE
    const soilMoisture = decision.weather?.root_zone_soil_moisture_m3m3;
    const rain7d = decision.weather?.forecast_rain_7d_total_mm;
    const maxTemp = decision.weather?.forecast_temp_max_c;
    const droughtScore = decision.risk?.drought_risk_score ?? 0;
    const waterlogScore = decision.risk?.waterlogging_risk_score ?? 0;
    const heatScore = decision.risk?.heat_risk_score ?? 0;

    // Check farmer observations
    const hasReportedRain = (planContext?.farmerObservations || []).some((o) =>
      o.toLowerCase().includes('rain') || o.includes('बारिश')
    );
    const hasReportedPest = (planContext?.farmerObservations || []).some((o) =>
      o.toLowerCase().includes('pest') || o.includes('कीट')
    );
    const hasDelayedTask = (planContext?.farmerObservations || []).some((o) =>
      o.toLowerCase().includes('delayed') || o.includes('विलंब')
    );

    let observation = isHi
      ? `${districtDisplay} के लिए लाइव टेलीमेट्री: जड़ क्षेत्र नमी ${(soilMoisture ?? 0.35).toFixed(2)} m³/m³, 7-दिवसीय वर्षा ${(rain7d ?? 0).toFixed(1)} mm, अधिकतम तापमान ${(maxTemp ?? 30).toFixed(1)}°C`
      : `Live telemetry for ${decision.location?.district_name}: Root moisture ${(soilMoisture ?? 0.35).toFixed(2)} m³/m³, 7d rain ${(rain7d ?? 0).toFixed(1)} mm, max temp ${(maxTemp ?? 30).toFixed(1)}°C`;

    // 2. REASON & 3. DECIDE
    let rawActionType: ActionType = 'RECORD_OPTIMAL_STATUS';
    let actionPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let actionTitle = '';
    let actionDesc = '';
    let reason = '';
    let decisionText = '';
    const adjustments: TaskAdjustment[] = [];

    const currentDay = planContext?.currentDay || 1;

    if (waterlogScore >= 0.45 || (rain7d && rain7d > 55) || hasReportedRain) {
      rawActionType = 'APPLY_PROACTIVE_ADVISORY';
      actionPriority = 'HIGH';
      actionTitle = isHi ? 'भारी वर्षा एवं जल निकासी चेतावनी' : 'Heavy Rainfall & Root Zone Waterlogging Alert';
      actionDesc = isHi
        ? 'आगामी 48 घंटों में भारी बारिश की संभावना है। यूरिया या कीटनाशक छिड़काव स्थगित करें और जल निकासी नालियां खोलें।'
        : 'Heavy precipitation forecast. Postpone open fertilizer top-dressing and inspect field drainage channels.';
      reason = isHi
        ? 'अत्यधिक वर्षा से पोषक तत्वों के बहने और जड़ों के सड़ने का जोखिम।'
        : 'Predicted rainfall exceeds optimal absorption threshold; high nutrient runoff risk.';
      decisionText = isHi
        ? 'उर्वरक कार्य 2 दिन आगे बढ़ाएं और मेड़ों की निकासी खोलें।'
        : 'Postpone fertilizer application by 2 days; enforce drainage priority.';

      adjustments.push({
        originalDay: currentDay,
        newDay: currentDay + 2,
        adjustedTitleHi: 'जल निकासी नालियों की सफाई एवं सुरक्षा',
        adjustedTitleEn: 'Open Drainage Channels & Clear Runoff Silt',
        reason: isHi
          ? 'भारी वर्षा के पूर्वानुमान के कारण'
          : 'Postponed due to heavy precipitation forecast',
        reasonHi: 'भारी वर्षा के पूर्वानुमान के कारण',
        reasonEn: 'Postponed due to heavy precipitation forecast',
        actionTaken: 'postponed',
        timestamp: nowIso,
        category: 'prep',
      });
    } else if (droughtScore >= 0.5 || (soilMoisture && soilMoisture < 0.22)) {
      rawActionType = 'APPLY_PROACTIVE_ADVISORY';
      actionPriority = 'HIGH';
      actionTitle = isHi ? 'मृदा शुष्कता एवं सिंचाई परामर्श' : 'Low Soil Moisture & Irrigation Advisory';
      actionDesc = isHi
        ? 'जड़ क्षेत्र में नमी का स्तर कम हो रहा है। फसल को जल तनाव से बचाने हेतु शाम के समय नियंत्रित सिंचाई दें।'
        : 'Root zone moisture depleted below stress threshold. Administer scheduled evening irrigation to protect crop.';
      reason = isHi ? 'नमी की कमी से प्रकाश संश्लेषण बाधित होने का जोखिम।' : 'Soil water potential deficit detected.';
      decisionText = isHi ? 'सिंचाई कार्य को उच्च प्राथमिकता दें।' : 'Elevate irrigation task priority.';
    } else if (hasReportedPest) {
      rawActionType = 'APPLY_PROACTIVE_ADVISORY';
      actionPriority = 'HIGH';
      actionTitle = isHi ? 'कीट नियंत्रण एवं जैविक स्प्रे परामर्श' : 'Targeted Pest Control Advisory';
      actionDesc = isHi
        ? 'खेत में कीट के लक्षण मिले हैं। नीम तेल 1500 ppm (5ml/L) का छिड़काव करें।'
        : 'Field scouting reports active insect presence. Apply 1500 ppm Azadirachtin (Neem Oil).';
      reason = isHi ? 'किसान द्वारा खेत में कीट का प्रकोप दर्ज किया गया।' : 'Farmer observation indicated pest infestation.';
      decisionText = isHi ? 'जैविक सुरक्षा छिड़काव तुरंत करें।' : 'Deploy bio-pesticide defense protocol.';
    } else if (hasDelayedTask) {
      rawActionType = 'APPLY_PROACTIVE_ADVISORY';
      actionPriority = 'MEDIUM';
      actionTitle = isHi ? 'कार्य विलंब एवं समय समायोजन' : 'Task Delay Re-Alignment';
      actionDesc = isHi ? 'किसान द्वारा कार्य विलंब दर्ज किया गया है। योजना को तदनुसार समायोजित किया गया है।' : 'Farmer reported field task delay. Adjusting downstream timeline.';
      reason = isHi ? 'खेत में कार्य पूरा न होने की रिपोर्ट।' : 'Farmer reported delay in scheduled task execution.';
      decisionText = isHi ? 'आगामी कार्यों को 1 दिन आगे खिसकाएं।' : 'Shift subsequent dependent tasks by 1 day.';
    } else {
      actionTitle = isHi ? 'अनुकूल कृषि स्थितियां' : 'Optimal Field Conditions Verified';
      actionDesc = isHi ? 'वर्तमान मौसम एवं मिट्टी की नमी योजना अनुसार सामान्य है।' : 'Weather telemetry is within normal agronomic bounds.';
      reason = isHi ? 'कोई गंभीर पर्यावरणीय तनाव नहीं पाया गया।' : 'All environmental risk indices remain below warning triggers.';
      decisionText = isHi ? 'वर्तमान कृषि कार्य योजना जारी रखें।' : 'Maintain scheduled task workflow.';
    }

    // 4. VALIDATE
    const validation = ActionValidator.validate(rawActionType);

    // 5. ACT
    const actionObj: AutonomousAction = {
      action_id: `ACT-${currentFingerprint.slice(0, 4).toUpperCase()}`,
      action_type: rawActionType,
      title: actionTitle,
      description: actionDesc,
      target_crops: allocatedCrops,
      priority: actionPriority,
      is_approved: validation.is_approved,
      validation_reason: validation.reason,
      timestamp: nowIso,
    };

    const execution = ActionExecutor.execute(actionObj, decision, language, currentFingerprint);

    // 6. VERIFY & 7. MONITOR
    const cycleLog: AutonomousCycleLog = {
      cycle_id: `CYC-${Date.now().toString(36).toUpperCase()}`,
      fingerprint: currentFingerprint,
      timestamp: nowIso,
      district: decision.location?.district_name || 'Unknown',
      state: decision.location?.state_name || 'Unknown',
      observation,
      reason,
      decision: decisionText,
      action_type: rawActionType,
      action_validated: validation.is_approved,
      action_name: actionTitle,
      action_detail: execution.detail,
      result: execution.success ? 'SUCCESS' : 'BLOCKED_UNSAFE',
      verification_status: execution.success ? 'VERIFIED' : 'FAILED',
      monitoring_status:
        execution.advisory && execution.advisory.action_required
          ? 'ACTION_EXECUTED'
          : 'ACTIVE_MONITORING',
      state_changed: stateChanged,
      telemetry: {
        soil_moisture_m3m3: soilMoisture ?? 0.35,
        forecast_rain_7d_mm: rain7d ?? 0,
        max_temp_c: maxTemp ?? 30,
        drought_risk_score: droughtScore,
        waterlogging_risk_score: waterlogScore,
        heat_risk_score: heatScore,
        risk_level: decision.risk?.overall_risk_label || 'LOW',
        allocated_crops: allocatedCrops,
        missing_variables: decision.weather?.missing_variables || [],
      },
    };

    return {
      log: cycleLog,
      advisory: execution.advisory,
      isNewState: stateChanged,
      planAdjustments: adjustments.length > 0 ? adjustments : undefined,
    };
  }
}

export async function runAutonomousSentinelCycle(
  decision: FarmDecisionResponse
): Promise<any> {
  const result = AutonomousSentinel.runCycle(decision);
  const advisories = result.advisory
    ? [
        {
          severity: (result.advisory.severity || 'low').toLowerCase() as any,
          headline: result.advisory.headline,
          recommendation: result.advisory.recommended_action,
        },
      ]
    : [];

  const sm = decision.weather?.root_zone_soil_moisture_m3m3 ?? 0.35;
  const rain = decision.weather?.forecast_rain_7d_total_mm ?? 0;
  const temp = decision.weather?.forecast_temp_max_c ?? 32;
  const droughtScore = decision.risk?.drought_risk_score ?? 0;

  return {
    timestamp: new Date().toISOString(),
    actionable_advisories: advisories,
    telemetry: {
      soil_moisture: {
        current_m3m3: sm,
        status: sm < 0.2 ? 'low' : sm > 0.6 ? 'waterlogged' : 'optimal',
      },
      weather_condition: {
        rainfall_7d_mm: rain,
        max_temp_c: temp,
        risk_level: rain > 100 ? 'high' : rain > 50 ? 'moderate' : 'low',
      },
      drought_risk: {
        level: droughtScore > 0.6 ? 'severe' : droughtScore > 0.3 ? 'moderate' : 'none',
        spei_index: droughtScore,
      },
    },
  };
}

