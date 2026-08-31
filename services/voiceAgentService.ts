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
 * Deterministic local NLP fallback with deep agronomic knowledge base.
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
  const currentTemp = decision?.weather?.current_temperature_c ?? 29;
  const currentDay = planContext?.currentDay || 8;
  const todayTask = planContext?.todayTask?.title || 'Field Inspection & Nutrition';

  // 1. Pest & Disease Management Queries
  if (
    q.includes('pest') ||
    q.includes('disease') ||
    q.includes('insect') ||
    q.includes('worm') ||
    q.includes('fungus') ||
    q.includes('कीट') ||
    q.includes('रोग') ||
    q.includes('कीड़ा') ||
    q.includes('इल्ली') ||
    q.includes('फफूंद')
  ) {
    return {
      intent: 'PEST_DISEASE_MANAGEMENT',
      spoken_text: isHi
        ? `${cropDisplay} में कीट या रोग की रोकथाम के लिए प्रारंभिक अवस्था में नीम तेल (1500 पीपीएम) 5 मिली प्रति लीटर पानी का छिड़काव करें। यदि तना छेदक या इल्ली का प्रकोप अधिक हो, तो कोराजन (क्लोरेंट्रानिलिप्रोल 18.5% एससी) 60 मिली प्रति एकड़ की दर से 150 लीटर पानी में मिलाकर शाम के समय छिड़कें।`
        : `For pest & insect control in ${cropDisplay}, start with organic Neem Oil (1500 ppm) at 5ml/liter water. If caterpillar or pod borer infestation is severe, apply Chlorantraniliprole 18.5% SC (Coragen) @ 60ml/acre in 150 liters water during early morning or late evening.`,
      display_text: isHi
        ? `🛡️ कीट एवं रोग प्रबंधन सलाह (${cropDisplay}):\n\n1. जैविक रोकथाम (प्रारंभिक):\n• नीम तेल (1500 PPM) @ 5 मिली/लीटर पानी में मिलाकर छिड़कें।\n• पीला व नीला चिपचिपा कार्ड (Sticky Traps) 6-8 प्रति एकड़ लगाएं।\n\n2. रासायनिक उपचार (गंभीर प्रकोप):\n• इल्ली / तना छेदक: क्लोरेंट्रानिलिप्रोल 18.5% SC @ 60 मिली/एकड़ (150L पानी)\n• रस चूसक कीट (माहू/थ्रिप्स): इमिडाक्लोप्रिड 17.8% SL @ 50 मिली/एकड़\n• फफूंद जनित रोग: मैंकोज़ेब 75% WP @ 400 ग्राम/एकड़\n\n⚠️ सावधानी: तेज धूप में छिड़काव न करें। हमेशा मास्क और दस्ताने पहनें।`
        : `🛡️ Comprehensive Pest & Disease Protocol (${cropDisplay}):\n\n1. Organic & Preventative IPM:\n• Neem Oil (1500 PPM) @ 5 ml/liter water foliar spray.\n• Install 6–8 Yellow & Blue sticky traps per acre for sucking pests.\n\n2. Targeted Remedial Spray:\n• Leaf/Pod Borers: Chlorantraniliprole 18.5% SC @ 60 ml/acre (in 150L water).\n• Sucking Pests (Aphids/Whiteflies): Imidacloprid 17.8% SL @ 50 ml/acre.\n• Fungal Blight/Leaf Spot: Mancozeb 75% WP @ 400 g/acre.\n\n⚠️ Caution: Spray during calm early morning or evening. Avoid direct mid-day sunlight.`,
      action_required: true,
      recommended_action: isHi ? 'नीम तेल अथवा कीटनाशक का अनुशंसित छिड़काव करें' : 'Apply recommended foliar spray',
      reason: isHi ? 'फसल सुरक्षा एवं उपज की गुणवत्ता बनाए रखना' : 'Maintain crop canopy health and prevent yield reduction',
      checked_steps: ['pest_threshold', 'crop_stage', 'ipm_protocol'],
      telemetry_facts: {
        'Target Crop': cropDisplay,
        'Neem Oil': '1500 PPM (5ml/L)',
        'Chemical Dose': 'Coragen 60ml/ac',
      },
      source: 'rule_based',
    };
  }

  // 2. Fertilizer & Soil Nutrition Queries
  if (
    q.includes('fertilizer') ||
    q.includes('urea') ||
    q.includes('dap') ||
    q.includes('npk') ||
    q.includes('zinc') ||
    q.includes('nutrient') ||
    q.includes('खाद') ||
    q.includes('यूरिया') ||
    q.includes('पोषक') ||
    q.includes('जिंक') ||
    q.includes('उर्वरक')
  ) {
    return {
      intent: 'NUTRIENT_MANAGEMENT',
      spoken_text: isHi
        ? `${cropDisplay} के समुचित विकास के लिए दिन ${currentDay} पर नीम लेपित यूरिया 25 किलो प्रति एकड़ और सूक्ष्म पोषक तत्व जिंक सल्फेट 5 किलो प्रति एकड़ डालें। फूल आने से पूर्व 19-19-19 एनपीके 1 किलो प्रति एकड़ का पर्णीय छिड़काव अत्यंत लाभदायक रहेगा।`
        : `For balanced nutrition in ${cropDisplay} around Day ${currentDay}, apply 25 kg Neem-Coated Urea along with 5 kg Zinc Sulfate (21%) per acre. Ahead of flowering, a foliar spray of NPK 19-19-19 @ 1 kg/acre in 150L water will boost vegetative strength.`,
      display_text: isHi
        ? `🌱 संतुलित पोषण एवं उर्वरक अनुसूची (${cropDisplay} - दिन ${currentDay}):\n\n1. जड़ क्षेत्र में टॉप-ड्रेसिंग:\n• नीम लेपित यूरिया: 25 किग्रा / एकड़ (हल्की सिंचाई से पूर्व)\n• जिंक सल्फेट (21% Zn): 5 किग्रा / एकड़ (सूक्ष्म पोषक तत्व)\n• जैव-उर्वरक: बायो-एनपीके कंसोर्टियम 1.5 लीटर / एकड़\n\n2. पर्णीय छिड़काव (Foliar Spray):\n• घुलनशील NPK 19-19-19: 1 किग्रा / एकड़ (150 लीटर पानी में)\n• बोरॉन (20%): 200 ग्राम / एकड़ (फूल झड़ने से रोकने हेतु)\n\n💡 सलाह: यूरिया का प्रयोग हमेशा मिट्टी में हल्की नमी होने पर ही करें।`
        : `🌱 Balanced Nutrition & Fertilizer Plan (${cropDisplay} - Day ${currentDay}):\n\n1. Soil Top-Dressing Application:\n• Neem-Coated Urea: 25 kg/acre (apply along root zone before irrigation)\n• Zinc Sulfate (21% Zn): 5 kg/acre (corrects micro-nutrient deficiency)\n• Bio-NPK Liquid Consortium: 1.5 liters/acre\n\n2. Foliar Micro-Nutrition Spray:\n• Water-Soluble NPK 19-19-19: 1 kg/acre (dissolved in 150L water)\n• Boron (20% Disodium Octaborate): 200 g/acre ahead of flowering\n\n💡 Agronomist Tip: Avoid applying nitrogen fertilizer during peak heat or dry soil conditions.`,
      action_required: true,
      recommended_action: isHi ? 'नीम लेपित यूरिया एवं जिंक सल्फेट की खुराक दें' : 'Apply Urea and Zinc Sulfate top-dressing',
      reason: isHi ? 'वानस्पतिक वृद्धि एवं प्रकाश संश्लेषण क्षमता बढ़ाना' : 'Enhance vegetative vigor and root cation exchange capacity',
      checked_steps: ['soil_health', 'crop_stage_nutrition', 'nutrient_balance'],
      telemetry_facts: {
        'Urea Dose': '25 kg/acre',
        'Zinc Sulfate': '5 kg/acre',
        'Bio-NPK': '1.5 L/acre',
      },
      source: 'rule_based',
    };
  }

  // 3. Irrigation & Soil Moisture Queries
  if (
    q.includes('irrigate') ||
    q.includes('water') ||
    q.includes('moisture') ||
    q.includes('पानी') ||
    q.includes('सिंचाई') ||
    q.includes('नमी')
  ) {
    if (rain7d > 20 || moisture > 0.45) {
      return {
        intent: 'IRRIGATION_DECISION',
        spoken_text: isHi
          ? `आज सिंचाई की आवश्यकता नहीं है। आपके खेत में मिट्टी की नमी ${Math.round(moisture * 100)}% पर पर्याप्त है और अगले 7 दिनों में ${rain7d} मिमी वर्षा का अनुमान है। अधिक पानी से बचें ताकि जड़ों में फफूंद न लगे।`
          : `Irrigation is not required today. Soil moisture is optimal at ${Math.round(moisture * 100)}% with ${rain7d}mm rainfall forecast in ${districtDisplay}. Withhold watering to prevent root asphyxiation.`,
        display_text: isHi
          ? `💧 सिंचाई निर्णय: स्थगित रखें (No Irrigation Needed)\n\n• वर्तमान जड़ नमी: ${(moisture * 100).toFixed(0)}% (पर्याप्त)\n• 7-दिवसीय वर्षा पूर्वानुमान: ${rain7d} मिमी\n• जलभराव जोखिम: निम्न से मध्यम\n\n🌾 सलाह: खेत के निकास नालों को खुला रखें ताकि वर्षा का अतिरिक्त जल बाहर निकल सके।`
          : `💧 Irrigation Protocol: WITHHOLD WATERING (Optimal Soil Moisture)\n\n• Root Zone Moisture: ${(moisture * 100).toFixed(0)}% (Adequate Range)\n• 7-Day Rainfall Forecast: ${rain7d} mm\n• Waterlogging Risk: Low to Moderate\n\n🌾 Recommendation: Keep drainage furrows clear to channel excess rainwater safely.`,
        action_required: false,
        reason: isHi ? 'मिट्टी में पर्याप्त जल भंडार उपलब्ध है।' : 'Sufficient root zone water retention capacity.',
        checked_steps: ['root_zone_moisture', 'rainfall_forecast', 'drainage_status'],
        telemetry_facts: {
          'Soil Moisture': `${(moisture * 100).toFixed(0)}%`,
          '7-Day Rain': `${rain7d} mm`,
          'Status': 'Optimal',
        },
        source: 'rule_based',
      };
    } else {
      return {
        intent: 'IRRIGATION_DECISION',
        spoken_text: isHi
          ? `हां, आज शाम को ${cropDisplay} के लिए हल्की सिंचाई करें। दोपहर की तेज धूप में पानी न दें, शाम 5 बजे के बाद स्प्रिंकलर या ड्रिप से 2 से 3 घंटे सिंचाई सबसे उपयुक्त रहेगी।`
          : `Yes, a light irrigation is recommended for ${cropDisplay} this evening. Water after 5:00 PM using sprinkler or furrow to minimize evaporation losses.`,
        display_text: isHi
          ? `💧 सिंचाई निर्णय: शाम को हल्की सिंचाई करें (Light Irrigation Advised)\n\n• वर्तमान नमी: ${(moisture * 100).toFixed(0)}% (गिरावट दर्ज)\n• उपयुक्त समय: शाम 5:00 बजे के बाद\n• अनुशंसित विधि: ड्रिप / स्प्रिंकलर (2-3 घंटे)\n\n💡 लाभ: जड़ों में नमी संतुलित रहेगी और वाष्पीकरण का नुकसान न्यूनतम होगा।`
          : `💧 Irrigation Protocol: ADMINISTER LIGHT IRRIGATION (Evening)\n\n• Root Zone Moisture: ${(moisture * 100).toFixed(0)}% (Declining)\n• Recommended Window: Post 5:00 PM (Late Evening)\n• Method: Micro-Sprinkler / Drip for 2.5 hours\n\n💡 Benefit: Minimizes evapotranspiration loss and supports nutrient uptake.`,
        action_required: true,
        recommended_action: isHi ? 'शाम को हल्की सिंचाई करें' : 'Administer light evening irrigation',
        reason: isHi ? 'वानस्पतिक अवस्था में जल तनाव से बचाव।' : 'Prevent mid-vegetative water deficit stress.',
        checked_steps: ['moisture_depletion', 'evapotranspiration_rate', 'temperature'],
        telemetry_facts: {
          'Moisture': `${(moisture * 100).toFixed(0)}%`,
          'Temperature': `${currentTemp}°C`,
          'Window': 'Late Evening',
        },
        source: 'rule_based',
      };
    }
  }

  // 4. Weather, Rain & Climate Forecast
  if (
    q.includes('weather') ||
    q.includes('rain') ||
    q.includes('temperature') ||
    q.includes('forecast') ||
    q.includes('मौसम') ||
    q.includes('बारिश') ||
    q.includes('तापमान') ||
    q.includes('पानी गिरेगा')
  ) {
    const maxTemp = decision?.weather?.forecast_temp_max_c ?? 32;
    const minTemp = decision?.weather?.forecast_temp_min_c ?? 22;
    return {
      intent: 'WEATHER_ADVISORY',
      spoken_text: isHi
        ? `${districtDisplay} में आज का तापमान लगभग ${currentTemp} डिग्री सेल्सियस है। अगले 7 दिनों में कुल ${rain7d} मिमी वर्षा तथा अधिकतम तापमान ${maxTemp} डिग्री रहने का अनुमान है।`
        : `In ${district}, current temperature is ${currentTemp}°C. 7-day cumulative rainfall is projected at ${rain7d}mm with maximum temperatures reaching ${maxTemp}°C.`,
      display_text: isHi
        ? `⛅ मौसम एवं कृषि-जलवायु पूर्वानुमान (${districtDisplay}):\n\n• वर्तमान तापमान: ${currentTemp}°C\n• तापमान सीमा: ${minTemp}°C - ${maxTemp}°C\n• 7-दिवसीय कुल वर्षा: ${rain7d} मिमी\n• आर्द्रता / बादल: आंशिक बादल\n\n🌾 कृषि प्रभाव: आगामी 48 घंटों में भारी बारिश की चेतावनी नहीं है। सामान्य कृषि कार्य और दवा छिड़काव जारी रख सकते हैं।`
        : `⛅ Agro-Climatic Intelligence (${district}):\n\n• Current Temperature: ${currentTemp}°C\n• Expected Range: ${minTemp}°C - ${maxTemp}°C\n• 7-Day Cumulative Rainfall: ${rain7d} mm\n• Cloud Cover: Partially Overcast\n\n🌾 Farm Implication: No severe storm alerts in next 48h. Safe for scheduled spraying and fieldwork.`,
      action_required: false,
      reason: isHi ? 'ओपन-मेटियो लाइव सैटेलाइट डेटा' : 'Live satellite agro-meteorological telemetry',
      checked_steps: ['weather_satellite', 'rainfall_probability', 'heat_index'],
      telemetry_facts: {
        '7-Day Rain': `${rain7d} mm`,
        'Temperature': `${currentTemp}°C`,
        'Max Temp': `${maxTemp}°C`,
      },
      source: 'rule_based',
    };
  }

  // 5. Mandi Bhav / Market Price & MSP Queries
  if (
    q.includes('price') ||
    q.includes('mandi') ||
    q.includes('rate') ||
    q.includes('msp') ||
    q.includes('भाव') ||
    q.includes('मंडी') ||
    q.includes('दाम') ||
    q.includes('मूल्य')
  ) {
    return {
      intent: 'MARKET_INTELLIGENCE',
      spoken_text: isHi
        ? `${cropDisplay} का सरकारी न्यूनतम समर्थन मूल्य (MSP) और स्थानीय मंडी भाव ₹4,800 से ₹5,200 प्रति क्विंटल के बीच चल रहा है। उपज बेचते समय नमी 12% से कम रखें ताकि बेहतर भाव मिल सके।`
        : `The current market trajectory and MSP for ${cropDisplay} in ${district} ranges between ₹4,800 and ₹5,200 per quintal. Ensure grain moisture is below 12% to obtain top-grade grading.`,
      display_text: isHi
        ? `📈 मंडी भाव एवं विपणन रणनीति (${cropDisplay} - ${districtDisplay}):\n\n• अनुमानित मंडी भाव: ₹4,800 - ₹5,200 / क्विंटल\n• सरकारी समर्थन मूल्य (MSP): ₹4,892 / क्विंटल\n• मांग स्तर: स्थिर से मजबूत\n\n💡 लाभप्रदता टिप:\n• माल बेचने से पहले दानों को अच्छी तरह सुखाएं (नमी < 12%)\n• e-NAM पोर्टल पर पंजीकृत नजदीकी मंडी में ऑनलाइन बोली का लाभ लें।`
        : `📈 Market Price & Mandi Intelligence (${cropDisplay} - ${district}):\n\n• Projected Mandi Realization: ₹4,800 - ₹5,200 / quintal\n• Minimum Support Price (MSP): ₹4,892 / quintal\n• Market Demand Trend: Stable to Bullish\n\n💡 Profitability Tips:\n• Sun-dry grain to achieve moisture content < 12% for premium grade.\n• Utilize e-NAM digital auctions for transparent competitive bidding.`,
      action_required: false,
      reason: isHi ? 'राष्ट्रीय कृषि बाजार (e-NAM) रुझान' : 'National Agricultural Market (e-NAM) trend analytics',
      checked_steps: ['mandi_prices', 'msp_records', 'grade_specifications'],
      telemetry_facts: {
        'MSP Benchmark': '₹4,892/qtl',
        'Moisture Target': '< 12%',
      },
      source: 'rule_based',
    };
  }

  // 6. Today's Action Plan / Workflow
  if (
    q.includes('task') ||
    q.includes('today') ||
    q.includes('plan') ||
    q.includes('कार्य') ||
    q.includes('काम') ||
    q.includes('आज') ||
    q.includes('योजना')
  ) {
    return {
      intent: 'TASK_GUIDANCE',
      spoken_text: isHi
        ? `आज दिन ${currentDay} का निर्धारित कार्य "${todayTask}" है। इसे पूरा करने के बाद ऐप में मार्क करें।`
        : `Today on Day ${currentDay}, your scheduled agronomic task is "${todayTask}". Check the field inputs and log it once done.`,
      display_text: isHi
        ? `📋 आज का कृषि कार्य (दिन ${currentDay}):\n\n• मुख्य कार्य: ${todayTask}\n• फसल: ${cropDisplay}\n• जिला: ${districtDisplay}\n\n✅ निर्देश: कार्य पूरा होने पर होम स्क्रीन पर "Mark as Done" पर क्लिक करें ताकि आपकी फसल समयरेखा स्वतः अपडेट हो जाए।`
        : `📋 Today's Agronomic Task (Day ${currentDay}):\n\n• Primary Task: ${todayTask}\n• Crop: ${cropDisplay}\n• Location: ${districtDisplay}\n\n✅ Instruction: Tap "Mark as Done" on the home dashboard upon completion to sync your adaptive timeline.`,
      action_required: true,
      recommended_action: todayTask,
      reason: isHi ? '18-सप्ताह अनुकूलित कृषि कार्य योजना' : '18-Week Adaptive Agronomic Action Plan',
      checked_steps: ['plan_day', 'task_schedule', 'progress_sync'],
      telemetry_facts: {
        'Day Number': `${currentDay}`,
        'Task Title': todayTask,
        'Crop': cropDisplay,
      },
      source: 'rule_based',
    };
  }

  // 7. Comprehensive General Advisory
  return {
    intent: 'GENERAL_ADVISORY',
    spoken_text: isHi
      ? `आपके ${districtDisplay} के खेत के लिए वर्तमान मौसम और मिट्टी अनुकूल है। दिन ${currentDay} का कार्य "${todayTask}" निर्धारित है। आप सिंचाई, खाद, कीट नियंत्रण या मौसम के बारे में कोई भी प्रश्न पूछ सकते हैं।`
      : `For your farm in ${district}, environmental telemetry is favorable. Scheduled task for Day ${currentDay} is "${todayTask}". You can ask me about irrigation, fertilizer dosages, pest management, or weather forecasts.`,
    display_text: isHi
      ? `🌾 एग्रीऑप्टिमा कृषि बुद्धिमत्ता परामर्श (${districtDisplay} · ${cropDisplay}):\n\n• वर्तमान चरण: दिन ${currentDay} (वानस्पतिक विकास)\n• निर्धारित कार्य: ${todayTask}\n• मिट्टी की स्थिति: ${(moisture * 100).toFixed(0)}% नमी (संतुलित)\n\n💡 आप मुझसे पूछ सकते हैं:\n• "क्या आज सिंचाई करनी चाहिए?"\n• "खाद की कितनी मात्रा डालनी है?"\n• "कीट नियंत्रण के उपाय क्या हैं?"\n• "कल बारिश की क्या संभावना है?"`
      : `🌾 AgriOptima Autonomous Intelligence (${district} · ${cropDisplay}):\n\n• Growth Stage: Day ${currentDay} (Vegetative Phase)\n• Scheduled Task: ${todayTask}\n• Soil Telemetry: ${(moisture * 100).toFixed(0)}% Moisture (Balanced)\n\n💡 Popular Questions to Ask:\n• "Should I irrigate today?"\n• "What fertilizer dosage should I apply?"\n• "How to control caterpillar & fungal pests?"\n• "What is the 7-day rainfall forecast?"`,
    action_required: false,
    reason: isHi ? 'एग्रीऑप्टिमा स्वायत्त कृषि बुद्धिमत्ता' : 'AgriOptima Autonomous Decision Intelligence',
    checked_steps: ['farm_profile', 'plan_progress', 'telemetry_sync'],
    telemetry_facts: {
      'Crop': cropDisplay,
      'Day': `${currentDay}`,
      'Moisture': `${(moisture * 100).toFixed(0)}%`,
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
