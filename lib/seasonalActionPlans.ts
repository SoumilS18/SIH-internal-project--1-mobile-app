/**
 * lib/seasonalActionPlans.ts
 * Agronomic Day-by-Day Seasonal Action Plans for Kharif, Rabi, and Zaid seasons.
 * Generates structured, chronologically sound farm operations.
 */

import { getCropDisplayName } from '@/i18n/cropNames';
import type { DailyAction, WeekPlan } from '@/types/planLifecycle';

export const SEASON_WEEKS_COUNT: Record<'Kharif' | 'Rabi' | 'Zaid', number> = {
  Kharif: 18,
  Rabi: 20,
  Zaid: 10,
};

export function getSeasonWeeksCount(season: 'Kharif' | 'Rabi' | 'Zaid'): number {
  return SEASON_WEEKS_COUNT[season] || 18;
}

export type CropCategory = 'vegetable' | 'cereal' | 'pulse' | 'fibre_cane' | 'oilseed' | 'general';

export function detectCropCategory(cropName: string): CropCategory {
  const c = (cropName || '').toLowerCase().trim();
  if (
    c.includes('tomato') ||
    c.includes('potato') ||
    c.includes('onion') ||
    c.includes('chilli') ||
    c.includes('brinjal') ||
    c.includes('vegetable') ||
    c.includes('okra') ||
    c.includes('cucumber')
  ) {
    return 'vegetable';
  }

  if (
    c.includes('rice') ||
    c.includes('paddy') ||
    c.includes('wheat') ||
    c.includes('maize') ||
    c.includes('corn') ||
    c.includes('bajra') ||
    c.includes('jowar') ||
    c.includes('barley')
  ) {
    return 'cereal';
  }

  if (
    c.includes('gram') ||
    c.includes('chickpea') ||
    c.includes('moong') ||
    c.includes('urad') ||
    c.includes('tur') ||
    c.includes('arhar') ||
    c.includes('lentil') ||
    c.includes('masoor') ||
    c.includes('pea')
  ) {
    return 'pulse';
  }

  if (
    c.includes('cotton') ||
    c.includes('sugarcane') ||
    c.includes('jute')
  ) {
    return 'fibre_cane';
  }

  if (
    c.includes('soybean') ||
    c.includes('soyabean') ||
    c.includes('mustard') ||
    c.includes('groundnut') ||
    c.includes('sunflower') ||
    c.includes('sesame')
  ) {
    return 'oilseed';
  }

  return 'general';
}

/**
 * Returns structured weekly action plan with localized text.
 */
export function getWeeklyActionPlan(
  season: 'Kharif' | 'Rabi' | 'Zaid',
  weekNumber: number,
  language: 'en' | 'hi' = 'en',
  cropNames: string[] = []
): WeekPlan {
  const totalWeeks = getSeasonWeeksCount(season);
  const safeWeek = Math.max(1, Math.min(totalWeeks, weekNumber));
  const isHi = language === 'hi';

  const primaryCropName = cropNames[0] || (isHi ? 'मुख्य फसल' : 'Primary Crop');
  const localizedCrop = getCropDisplayName(primaryCropName, language);
  const category = detectCropCategory(primaryCropName);

  // Week 1: Soil Preparation & Field Baseline
  if (safeWeek === 1) {
    return {
      weekNumber: 1,
      stageName: isHi ? `खेत की तैयारी एवं जुताई` : `Field Preparation & Soil Health`,
      primaryFocus: isHi ? `गहरी जुताई, गोबर की खाद (FYM) का फैलाव एवं मेड़बंदी` : `Deep ploughing, organic manure application, and bund preparation`,
      days: [
        {
          dayOfSeason: 1,
          dayIndexInWeek: 0,
          title: isHi ? 'गहरी जुताई (Deep Ploughing)' : 'Deep Summer Ploughing',
          desc: isHi ? 'मिट्टी पलटने वाले हल से 8-10 इंच गहरी जुताई करें ताकि धूप से कीट-फफूंद नष्ट हों।' : 'Plough 8-10 inches deep to expose soil pests and weed roots to the sun.',
          category: 'prep',
        },
        {
          dayOfSeason: 2,
          dayIndexInWeek: 1,
          title: isHi ? 'खेत का समतलीकरण (Field Leveling)' : 'Field Leveling & Clod Breaking',
          desc: isHi ? 'पाटा चलाकर मिट्टी के ढेलों को तोड़ें और खेत को समतल करें ताकि पानी समान रूप से फैले।' : 'Use a leveler to break hard clods and ensure uniform water and nutrient distribution.',
          category: 'prep',
        },
        {
          dayOfSeason: 3,
          dayIndexInWeek: 2,
          title: isHi ? 'देसी खाद / कम्पोस्ट का फैलाव' : 'Apply Well-Decomposed FYM',
          desc: isHi ? 'प्रति एकड़ 4-5 ट्रॉली अच्छी तरह सड़ी हुई गोबर की खाद समान रूप से फैलाएं।' : 'Broadcast 4-5 tonnes of well-rotted farmyard manure per acre across the field.',
          category: 'nutrient',
        },
        {
          dayOfSeason: 4,
          dayIndexInWeek: 3,
          title: isHi ? 'मिट्टी में खाद मिलाना' : 'Harrowing & Manure Mixing',
          desc: isHi ? 'हल्की जुताई या कल्टीवेटर चलाकर खाद को ऊपरी 6 इंच मिट्टी में अच्छी तरह मिलाएं।' : 'Light cultivator pass to incorporate organic manure into the top 6 inches of soil.',
          category: 'prep',
        },
        {
          dayOfSeason: 5,
          dayIndexInWeek: 4,
          title: isHi ? 'मेड़बंदी एवं जल निकासी नालियां' : 'Bund Formation & Drainage Channels',
          desc: isHi ? 'मजबूत मेड़ बनाएं और अधिक वर्षा का अतिरिक्त पानी निकालने हेतु निकासी नालियां तैयार करें।' : 'Construct sturdy boundary bunds and clear natural drainage channels for excess rainfall.',
          category: 'prep',
        },
        {
          dayOfSeason: 6,
          dayIndexInWeek: 5,
          title: isHi ? 'सिंचाई प्रणाली की जांच' : 'Inspect Irrigation & Water Lines',
          desc: isHi ? 'बोरवेल, मोटर, पाइपलाइन या ड्रिप नोजल चलाकर पानी का दबाव और बहाव जांचें।' : 'Test motor pump, main water lines, and drip/sprinkler nozzles for uniform pressure.',
          category: 'irrigation',
        },
        {
          dayOfSeason: 7,
          dayIndexInWeek: 6,
          title: isHi ? 'बीज एवं इनपुट की तैयारी' : 'Seed & Bio-Inoculant Readiness',
          desc: isHi ? `${localizedCrop} के प्रमाणित बीज और बीजोपचार हेतु ट्राइकोडर्मा / राइजोबियम सुरक्षित रखें।` : `Procure certified seeds of ${localizedCrop} and keep bio-inoculants ready for seed treatment.`,
          category: 'monitoring',
        },
      ],
    };
  }

  // Week 2: Seed Treatment & Sowing / Transplanting
  if (safeWeek === 2) {
    return {
      weekNumber: 2,
      stageName: isHi ? `${localizedCrop} की बुवाई एवं बीजोपचार` : `Sowing & Seed Inoculation for ${localizedCrop}`,
      primaryFocus: isHi ? `बीज उपचार, उचित दूरी पर कतारबद्ध बुवाई एवं प्राथमिक नमी` : `Bio-fungicide seed treatment, line sowing at optimal depth, and germination check`,
      days: [
        {
          dayOfSeason: 8,
          dayIndexInWeek: 0,
          title: isHi ? 'जैविक बीजोपचार (Seed Treatment)' : 'Bio-Fungicide Seed Treatment',
          desc: isHi ? 'बीजों को ट्राइकोडर्मा विरिडी या अनुशंसित फफूंदनाशक से उपचारित कर छाया में सुखाएं।' : 'Treat seeds with Trichoderma viride or recommended bio-culture and dry in shade.',
          category: 'protection',
        },
        {
          dayOfSeason: 9,
          dayIndexInWeek: 1,
          title: isHi ? 'बुवाई पूर्व आधारीय खाद (Basal Dose)' : 'Apply Basal Nutrient Dose',
          desc: isHi ? 'अनुशंसा अनुसार डीएपी / एनपीके एवं पोटाश की आधारीय खुराक कतारों में डालें।' : 'Apply recommended basal NPK fertilizer dose along the sowing furrows.',
          category: 'nutrient',
        },
        {
          dayOfSeason: 10,
          dayIndexInWeek: 2,
          title: isHi ? 'कतारबद्ध बुवाई (Line Sowing)' : 'Precision Line Sowing',
          desc: isHi ? 'सीड ड्रिल या कतार में उचित गहराई (2-3 सेमी) और पौधे से पौधे की दूरी पर बुवाई करें।' : 'Sow seeds in lines maintaining recommended row-to-row and plant spacing.',
          category: 'sowing',
        },
        {
          dayOfSeason: 11,
          dayIndexInWeek: 3,
          title: isHi ? 'हल्की सिंचाई (Life-saving Irrigation)' : 'Light Germination Irrigation',
          desc: isHi ? 'बुवाई के तुरंत बाद हल्की सिंचाई दें ताकि बीज अंकुरण के लिए आवश्यक नमी मिले।' : 'Provide a light, gentle watering to settle soil around seeds without waterlogging.',
          category: 'irrigation',
        },
        {
          dayOfSeason: 12,
          dayIndexInWeek: 4,
          title: isHi ? 'पक्षियों एवं कीटों से बचाव' : 'Protect Sown Seeds from Birds',
          desc: isHi ? 'खेत की निगरानी करें और चिड़ियों से बीजों की सुरक्षा सुनिश्चित करें।' : 'Inspect sown area and install bird scaring ribbons or reflectors over the fresh rows.',
          category: 'monitoring',
        },
        {
          dayOfSeason: 13,
          dayIndexInWeek: 5,
          title: isHi ? 'अंकुरण की जांच (Germination Check)' : 'Initial Germination Inspection',
          desc: isHi ? 'अंकुरों का बाहर आना देखें और देखें कि क्या मिट्टी में पपड़ी (crust) तो नहीं जमी।' : 'Check for healthy emerging radicles and break soil surface crust if hardened.',
          category: 'monitoring',
        },
        {
          dayOfSeason: 14,
          dayIndexInWeek: 6,
          title: isHi ? 'रिक्त स्थानों की भराई (Gap Filling Plan)' : 'Plan Gap Filling / Re-sowing',
          desc: isHi ? 'जहां अंकुरण कम हुआ हो वहां तत्काल अतिरिक्त बीज लगाकर कतारें पूरी करें।' : 'Identify low-germination patches and prepare seeds for immediate gap filling.',
          category: 'sowing',
        },
      ],
    };
  }

  // Generic progressive stages for Weeks 3..totalWeeks
  const isVegetative = safeWeek <= Math.floor(totalWeeks * 0.45);
  const isFlowering = safeWeek > Math.floor(totalWeeks * 0.45) && safeWeek <= Math.floor(totalWeeks * 0.75);
  const isMaturity = safeWeek > Math.floor(totalWeeks * 0.75);

  let stageTitleEn = `Vegetative Growth & Weed Management (Week ${safeWeek})`;
  let stageTitleHi = `वानस्पतिक वृद्धि एवं खरपतवार नियंत्रण (सप्ताह ${safeWeek})`;
  let focusEn = `Weed control, nitrogen top-dressing, and soil aeration.`;
  let focusHi = `निराई-गुड़ाई, यूरिया टॉप-ड्रेसिंग और मिट्टी में वायु संचार।`;

  if (isFlowering) {
    stageTitleEn = `Flowering & Pod / Ear Formation (Week ${safeWeek})`;
    stageTitleHi = `फूल एवं फल/दाने बनने की अवस्था (सप्ताह ${safeWeek})`;
    focusEn = `Critical moisture maintenance, micro-nutrient spray, and pest barrier protection.`;
    focusHi = `पर्याप्त नमी का प्रबंधन, सूक्ष्म पोषक तत्व छिड़काव और कीट सुरक्षा।`;
  } else if (isMaturity) {
    stageTitleEn = `Maturity, Ripening & Harvest Preparation (Week ${safeWeek})`;
    stageTitleHi = `फसल परिपक्वता, कटाई एवं भंडारण तैयारी (सप्ताह ${safeWeek})`;
    focusEn = `Stop late irrigation, assess 80%+ grain hardness, plan harvesting and mandi transport.`;
    focusHi = `अंतिम सिंचाई बंद करें, दानों के पकने की जांच करें और कटाई व मंडी परिवहन की योजना बनाएं।`;
  }

  const startDay = (safeWeek - 1) * 7 + 1;

  const days: DailyAction[] = [
    {
      dayOfSeason: startDay,
      dayIndexInWeek: 0,
      title: isHi ? 'खेत का स्वास्थ्य एवं कीट निरीक्षण' : 'Field Health & Pest Scouting',
      desc: isHi ? 'खेत के चारों कोनों और बीच में पौधों की पत्तियों के नीचे कीट व रोगों की जांच करें।' : 'Walk across field diagonally, inspect underside of leaves for sucking pests or spots.',
      category: 'monitoring',
    },
    {
      dayOfSeason: startDay + 1,
      dayIndexInWeek: 1,
      title: isHi ? (isFlowering ? 'सूक्ष्म पोषक तत्व / 19:19:19 का छिड़काव' : 'निराई-गुड़ाई एवं खरपतवार निकालना') : (isFlowering ? 'Foliar Nutrient / Micronutrient Spray' : 'Intercultural Weeding & Soil Aeration'),
      desc: isHi ? (isFlowering ? 'फूलों की संख्या और फल वृद्धि हेतु 19:19:19 या बोरॉन का हल्का पर्णीय छिड़काव करें।' : 'खुरपी या कल्टीवेटर से खरपतवार निकालें ताकि पौधों की जड़ों को हवा और पोषण मिले।') : (isFlowering ? 'Apply water-soluble 19:19:19 NPK or Boron to promote vigorous bloom set.' : 'Hoe between rows to remove competing weeds and loosen topsoil for root aeration.'),
      category: isFlowering ? 'nutrient' : 'prep',
    },
    {
      dayOfSeason: startDay + 2,
      dayIndexInWeek: 2,
      title: isHi ? 'नमी अनुसार सिंचाई का प्रबंधन' : 'Regulated Root Zone Irrigation',
      desc: isHi ? 'मिट्टी में 2-3 इंच गहराई पर नमी जांचें; मौसम पूर्वानुमान देखकर ही पानी लगाएं।' : 'Check moisture at 2-3 inch depth. Irrigate based on root demand and rain forecast.',
      category: 'irrigation',
    },
    {
      dayOfSeason: startDay + 3,
      dayIndexInWeek: 3,
      title: isHi ? (isMaturity ? 'दाने की परिपक्वता की जांच' : 'जैविक कीट नियंत्रक / नीम तेल का छिड़काव') : (isMaturity ? 'Grain Hardness & Moisture Test' : 'Proactive Neem Oil / Bio-Pesticide Spray'),
      desc: isHi ? (isMaturity ? 'दानों को दबाकर देखें; यदि 80% सुनहरे व कठोर हो चुके हों तो कटाई की तैयारी करें।' : 'शुरुआती कीट प्रकोप रोकने हेतु 1500 पीपीएम नीम तेल (5 मिली/लीटर) का छिड़काव करें।') : (isMaturity ? 'Press representative grain heads; prepare sickle/combine when moisture drops below 14%.' : 'Spray 1500 ppm Azadirachtin (Neem oil) as prophylactic defense against leaf-eating caterpillars.'),
      category: isMaturity ? 'monitoring' : 'protection',
    },
    {
      dayOfSeason: startDay + 4,
      dayIndexInWeek: 4,
      title: isHi ? 'नालियों एवं मेड़ों की सफाई' : 'Channel Cleaning & Drainage Check',
      desc: isHi ? 'सिंचाई और जल निकासी की नालियों से खरपतवार व कचरा हटाकर साफ रखें।' : 'Clear silt and weeds from field drains to prevent stagnation during sudden rain.',
      category: 'prep',
    },
    {
      dayOfSeason: startDay + 5,
      dayIndexInWeek: 5,
      title: isHi ? 'पौधों की बढ़वार एवं पोषण समीक्षा' : 'Crop Vigour & Nutrient Review',
      desc: isHi ? 'पौधों का हरापन और फैलाव देखें। आवश्यकतानुसार जैविक खाद या वर्मीवाश दें।' : 'Assess canopy density and leaf chlorophyll index. Supplement organic compost tea if needed.',
      category: 'nutrient',
    },
    {
      dayOfSeason: startDay + 6,
      dayIndexInWeek: 6,
      title: isHi ? 'साप्ताहिक कार्य एवं मंडी भाव समीक्षा' : 'Weekly Review & Market Rate Check',
      desc: isHi ? 'साप्ताहिक प्रगति दर्ज करें और आगामी कार्यों के लिए इनपुट व साधनों की योजना बनाएं।' : 'Log weekly observations into Sentinel and check local APMC mandi price trends.',
      category: 'monitoring',
    },
  ];

  return {
    weekNumber: safeWeek,
    stageName: isHi ? stageTitleHi : stageTitleEn,
    primaryFocus: isHi ? focusHi : focusEn,
    days,
  };
}
