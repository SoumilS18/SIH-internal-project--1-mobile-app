/**
 * services/voiceAgentService.ts
 * AgriOptima Voice & AI Advisory Service for Mobile
 * Integrates Gemini Farm Advisory and Sarvam Indic Voice via secure backend proxy,
 * with expo-speech and expo-av native audio playback and local NLP fallback.
 */

import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { FarmDecisionResponse } from '@/types/farm';
import type { PlanReasoningContext, TaskAdjustment } from '@/types/planLifecycle';
import { getCropDisplayName } from '@/i18n/cropNames';
import { getDistrictDisplayName } from '@/i18n/geoNames';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface VoiceAgentResponse {
  intent: string;
  spoken_text: string;
  display_text: string;
  action_required: boolean;
  recommended_action?: string;
  reason: string;
  checked_steps: string[];
  telemetry_facts: Record<string, string>;
  is_unsupported_language?: boolean;
  source: 'gemini' | 'rule_based' | 'system';
  plan_adjustments?: TaskAdjustment[];
}

/**
 * Deterministic local NLP fallback when offline.
 */
export function askLocalDeterministicAgent(
  query: string,
  decision: FarmDecisionResponse | null,
  language: string = 'en',
  planContext?: PlanReasoningContext
): VoiceAgentResponse {
  const isHi = language === 'hi';
  const q = (query || '').toLowerCase().trim();

  const district = decision?.location?.district_name || 'Farm';
  const districtDisplay = getDistrictDisplayName(district, language);
  const primaryCrop = planContext?.primaryCrop || decision?.allocated_crops?.[0]?.crop_name || 'Crop';
  const cropDisplay = getCropDisplayName(primaryCrop, language);
  const moisture = decision?.weather?.root_zone_soil_moisture_m3m3 ?? 0.35;
  const rain7d = decision?.weather?.forecast_rain_7d_total_mm ?? 0;
  const currentDay = planContext?.currentDay || 1;
  const todayTask = planContext?.todayTask?.title || 'Field Inspection';

  // 1. Irrigation queries
  if (
    q.includes('irrigate') ||
    q.includes('water') ||
    q.includes('पानी') ||
    q.includes('सिंचाई')
  ) {
    if (rain7d > 25 || moisture > 0.4) {
      return {
        intent: 'IRRIGATION_DECISION',
        spoken_text: isHi
          ? `आज सिंचाई करने की आवश्यकता नहीं है। खेत में पर्याप्त नमी (${Math.round(moisture * 100)}%) है और आगामी दिनों में ${rain7d} मिमी वर्षा का अनुमान है।`
          : `Irrigation is not required today. Root zone moisture is adequate at ${Math.round(moisture * 100)}% with ${rain7d}mm rain forecast.`,
        display_text: isHi
          ? `सिंचाई स्थगित रखें। मिट्टी में पर्याप्त नमी उपलब्ध है।`
          : `Postpone irrigation. Soil moisture is optimal and rain is expected.`,
        action_required: false,
        reason: isHi ? 'अत्यधिक नमी से जलभराव का खतरा।' : 'Sufficient root zone water potential.',
        checked_steps: ['root_zone_moisture', 'rainfall_forecast', 'crop_stage'],
        telemetry_facts: {
          'Root Moisture': `${(moisture * 100).toFixed(0)}%`,
          '7-Day Rain': `${rain7d} mm`,
        },
        source: 'rule_based',
      };
    } else {
      return {
        intent: 'IRRIGATION_DECISION',
        spoken_text: isHi
          ? `हां, आज शाम के समय ${cropDisplay} के लिए हल्की सिंचाई अनुशंसित है क्योंकि जड़ क्षेत्र में नमी कम हो रही है।`
          : `Yes, a light evening irrigation is recommended for ${cropDisplay} as root zone moisture is declining.`,
        display_text: isHi
          ? `शाम को हल्की सिंचाई करें।`
          : `Administer light evening irrigation.`,
        action_required: true,
        recommended_action: isHi ? 'शाम को हल्की सिंचाई करें' : 'Light evening irrigation',
        reason: isHi ? 'फसल को जल तनाव से बचाना।' : 'Prevent atmospheric moisture deficit.',
        checked_steps: ['soil_moisture', 'crop_stage'],
        telemetry_facts: {
          'Root Moisture': `${(moisture * 100).toFixed(0)}%`,
        },
        source: 'rule_based',
      };
    }
  }

  // 2. Weather queries
  if (
    q.includes('weather') ||
    q.includes('rain') ||
    q.includes('मौसम') ||
    q.includes('बारिश')
  ) {
    return {
      intent: 'WEATHER_ADVISORY',
      spoken_text: isHi
        ? `${districtDisplay} में आगामी 7 दिनों में कुल ${rain7d} मिमी वर्षा और अधिकतम तापमान ${decision?.weather?.forecast_temp_max_c ?? 32}°C रहने का अनुमान है।`
        : `In ${district}, 7-day rainfall is projected at ${rain7d}mm with max temperature around ${decision?.weather?.forecast_temp_max_c ?? 32}°C.`,
      display_text: isHi
        ? `7-दिवसीय वर्षा: ${rain7d} mm | अधिकतम तापमान: ${decision?.weather?.forecast_temp_max_c ?? 32}°C`
        : `7-Day Rain: ${rain7d} mm | Max Temp: ${decision?.weather?.forecast_temp_max_c ?? 32}°C`,
      action_required: false,
      reason: isHi ? 'ओपन-मेटियो लाइव पूर्वानुमान' : 'Live Open-Meteo telemetry forecast',
      checked_steps: ['weather_provider', 'precipitation', 'temperature'],
      telemetry_facts: {
        '7-Day Rain': `${rain7d} mm`,
        'Max Temp': `${decision?.weather?.forecast_temp_max_c ?? 32}°C`,
      },
      source: 'rule_based',
    };
  }

  // 3. Today's task queries
  if (
    q.includes('task') ||
    q.includes('today') ||
    q.includes('कार्य') ||
    q.includes('काम') ||
    q.includes('आज')
  ) {
    return {
      intent: 'TASK_GUIDANCE',
      spoken_text: isHi
        ? `आज दिन ${currentDay} का निर्धारित कार्य "${todayTask}" है। इसे पूरा करने के बाद ऐप में पूर्ण दर्ज करें।`
        : `Today on Day ${currentDay}, your scheduled task is "${todayTask}". Mark it complete in the app once finished.`,
      display_text: isHi
        ? `आज का कार्य (दिन ${currentDay}): ${todayTask}`
        : `Today's Task (Day ${currentDay}): ${todayTask}`,
      action_required: true,
      recommended_action: todayTask,
      reason: isHi ? 'मौसमी कृषि कार्य योजना' : 'Seasonal agronomic action timeline',
      checked_steps: ['plan_day', 'task_schedule'],
      telemetry_facts: {
        'Day': `${currentDay}`,
        'Task': todayTask,
      },
      source: 'rule_based',
    };
  }

  // 4. Default general agricultural answer
  return {
    intent: 'GENERAL_ADVISORY',
    spoken_text: isHi
      ? `आपके ${districtDisplay} के खेत के लिए वर्तमान में ${cropDisplay} की फसल अनुकूल है। दिन ${currentDay} का कार्य "${todayTask}" निर्धारित है।`
      : `For your farm in ${district}, ${cropDisplay} cultivation is progressing on Day ${currentDay} with scheduled task: "${todayTask}".`,
    display_text: isHi
      ? `खेत स्थिति: ${cropDisplay} (दिन ${currentDay}) | कार्य: ${todayTask}`
      : `Farm Status: ${cropDisplay} (Day ${currentDay}) | Task: ${todayTask}`,
    action_required: false,
    reason: isHi ? 'एग्रीऑप्टिमा स्वायत्त कृषि बुद्धिमत्ता' : 'AgriOptima Autonomous Decision Intelligence',
    checked_steps: ['farm_profile', 'plan_progress'],
    telemetry_facts: {
      'Crop': cropDisplay,
      'Day': `${currentDay}`,
    },
    source: 'rule_based',
  };
}

/**
 * Queries Gemini Farm Advisory via secure backend proxy, falling back to local reasoning if offline.
 */
export async function askAgriOptimaAI(
  query: string,
  decision: FarmDecisionResponse | null,
  language: string = 'en',
  planContext?: PlanReasoningContext,
  conversationHistory: { role: 'user' | 'assistant'; text: string }[] = []
): Promise<VoiceAgentResponse> {
  const effectiveLang = language === 'hi' ? 'hi' : 'en';

  if (decision) {
    const farmContext = {
      district: decision.location?.district_name,
      state: decision.location?.state_name,
      soil_type: decision.location?.major_soil_type,
      land_acres: decision.request?.land_size_acres,
      irrigation_type: decision.request?.irrigation_type,
      season: decision.request?.season,
      allocated_crops: (decision.allocated_crops || []).map((c) => ({
        crop_name: c.crop_name,
        acres: c.allocated_acres,
        expected_yield: c.expected_yield_qtl_acre,
      })),
      weather: {
        current_temp: decision.weather?.current_temperature_c,
        root_moisture: decision.weather?.root_zone_soil_moisture_m3m3,
        rain_7d_mm: decision.weather?.forecast_rain_7d_total_mm,
      },
      risk: {
        overall_risk: decision.risk?.overall_risk_label,
        drought_risk: decision.risk?.drought_risk_score,
        waterlogging_risk: decision.risk?.waterlogging_risk_score,
      },
      plan: {
        is_started: planContext?.isStarted ?? false,
        current_day: planContext?.currentDay ?? 1,
        current_week: planContext?.currentWeek ?? 1,
        today_task: planContext?.todayTask?.title,
        status: planContext?.planStatus ?? 'ACTIVE',
        farmer_observations: planContext?.farmerObservations || [],
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${API_BASE_URL}/api/voice/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          language: effectiveLang,
          farm_context: farmContext,
          conversation_history: (conversationHistory || []).slice(-4),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.answer) {
          const parsedAdjustments: TaskAdjustment[] = (data.plan_adjustments || []).map((adj: any) => ({
            originalDay: (planContext?.currentDay || 1) + (adj.day_offset || 0),
            newDay: adj.new_day !== undefined ? adj.new_day : undefined,
            adjustedTitle: adj.adjusted_title,
            adjustedDesc: adj.adjusted_desc,
            reason: adj.reason || (effectiveLang === 'hi' ? 'एआई द्वारा समायोजित' : 'AI Recommended Adjustment'),
            actionTaken: adj.action_type || 'modified',
            timestamp: new Date().toISOString(),
            category: adj.category,
          }));

          return {
            intent: 'GEMINI_ADVISORY',
            spoken_text: data.answer,
            display_text: data.answer,
            action_required: data.action_required || parsedAdjustments.length > 0,
            recommended_action: data.recommended_action,
            reason: effectiveLang === 'hi' ? 'लाइव कृषि टेलीमेट्री पर आधारित एआई परामर्श' : 'AgriOptima AI grounded in live farm telemetry.',
            checked_steps: ['weather', 'soil', 'crop', 'risk'],
            telemetry_facts: {
              District: decision.location?.district_name || '',
              Moisture: `${((decision.weather?.root_zone_soil_moisture_m3m3 ?? 0.35) * 100).toFixed(0)}%`,
            },
            source: 'gemini',
            plan_adjustments: parsedAdjustments.length > 0 ? parsedAdjustments : undefined,
          };
        }
      }
    } catch {
      // Backend unavailable -> use local deterministic agent
    }
  }

  return askLocalDeterministicAgent(query, decision, effectiveLang, planContext);
}

/**
 * Text-to-Speech playback using expo-speech or backend Sarvam audio proxy.
 */
let currentSound: Audio.Sound | null = null;

export async function speakText(
  text: string,
  language: string = 'en',
  onStart?: () => void,
  onDone?: () => void
): Promise<void> {
  // Stop existing sound
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    } catch {}
  }

  // Try Sarvam AI TTS from backend first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language: language === 'hi' ? 'hi' : 'en',
        speaker: 'anushka',
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.audio_base64) {
        const soundObject = new Audio.Sound();
        currentSound = soundObject;
        if (onStart) onStart();
        await soundObject.loadAsync({
          uri: `data:audio/wav;base64,${data.audio_base64}`,
        });
        soundObject.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            if (onDone) onDone();
          }
        });
        await soundObject.playAsync();
        return;
      }
    }
  } catch {
    // Fallback to Native Expo Speech
  }

  // Native Speech fallback
  if (onStart) onStart();
  Speech.speak(text, {
    language: language === 'hi' ? 'hi-IN' : 'en-IN',
    pitch: 1.0,
    rate: 0.95,
    onDone: () => {
      if (onDone) onDone();
    },
    onError: () => {
      if (onDone) onDone();
    },
  });
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
    if (currentSound) {
      currentSound.stopAsync();
      currentSound.unloadAsync();
      currentSound = null;
    }
  } catch {}
}
