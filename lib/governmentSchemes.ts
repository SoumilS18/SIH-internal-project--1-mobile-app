/**
 * lib/governmentSchemes.ts
 * Authentic Agricultural Schemes & Financial Eligibility Engine for Indian Farmers.
 * Contains central and state-specific scheme databases and deterministic eligibility evaluation.
 */

export type SchemeCategory =
  | 'income_support'
  | 'insurance'
  | 'irrigation_subsidy'
  | 'mechanization_subsidy'
  | 'credit_loan'
  | 'solar_energy'
  | 'organic_farming'
  | 'state_specific';

export type EligibilityMatchLevel = 'POTENTIALLY_ELIGIBLE' | 'VERIFICATION_REQUIRED' | 'NOT_APPLICABLE';

export interface GovernmentScheme {
  id: string;
  name: { en: string; hi: string };
  officialCode: string;
  agency: { en: string; hi: string };
  category: SchemeCategory;
  benefitHighlight: { en: string; hi: string };
  shortDescription: { en: string; hi: string };
  detailedBenefits: { en: string[]; hi: string[] };
  qualificationCriteria: { en: string[]; hi: string[] };
  requiredDocuments: { en: string[]; hi: string[] };
  officialPortalUrl: string;
  isStateSpecific?: boolean;
  applicableStates?: string[];
  maxLandAcres?: number;
  minLandAcres?: number;
  applicableFarmerCategories?: ('small_marginal' | 'medium' | 'large' | 'women' | 'sc_st' | 'all')[];
  applicableCrops?: string[];
  applicableIrrigation?: ('rainfed' | 'canal' | 'borewell' | 'drip' | 'all')[];
}

export interface FarmerEligibilityInput {
  state: string;
  district: string;
  landAcres: number;
  primaryCrop?: string;
  irrigationType?: string;
  farmerCategory?: 'small_marginal' | 'medium' | 'large' | 'women' | 'sc_st' | 'all';
  preferredSupport?: 'all' | 'income_support' | 'subsidies' | 'credit' | 'insurance';
  annualIncomeRange?: 'below_1_5L' | '1_5L_to_3L' | '3L_to_6L' | 'above_6L';
}

export interface SchemeEvaluationResult {
  scheme: GovernmentScheme;
  matchLevel: EligibilityMatchLevel;
  matchScore: number; // 0 to 100
  reasonsForMatch: { en: string[]; hi: string[] };
  verificationNotes: { en: string[]; hi: string[] };
  estimatedAnnualBenefitInr?: number;
  subsidyPercentage?: number;
}

export const INDIAN_AGRICULTURAL_SCHEMES: GovernmentScheme[] = [
  {
    id: 'pm-kisan',
    name: {
      en: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      hi: 'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
    },
    officialCode: 'PM-KISAN',
    agency: {
      en: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      hi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार',
    },
    category: 'income_support',
    benefitHighlight: {
      en: '₹6,000 per year directly to bank account in 3 equal installments',
      hi: '₹6,000 प्रति वर्ष 3 समान किस्तों में सीधे बैंक खाते में',
    },
    shortDescription: {
      en: 'Direct income support for landholding farmer families across India to procure agricultural inputs.',
      hi: 'कृषि इनपुट और घरेलू जरूरतों के लिए भारत भर के भूस्वामी किसान परिवारों को प्रत्यक्ष आय सहायता।',
    },
    detailedBenefits: {
      en: [
        'Direct Benefit Transfer (DBT) of ₹2,000 every four months',
        'Directly linked to Aadhaar-seeded bank accounts',
        'Helps meet seasonal seed and fertilizer expenses',
      ],
      hi: [
        'प्रत्येक 4 माह में ₹2,000 का सीधा बैंक ट्रांसफर (DBT)',
        'आधार से जुड़े बैंक खाते में सीधे भुगतान',
        'मौसमी बीज एवं खाद की जरूरतों में सहायक',
      ],
    },
    qualificationCriteria: {
      en: [
        'Must own cultivable agricultural land in revenue records',
        'Valid Aadhaar card and active bank account',
        'Excludes institutional landholders and high-income taxpayers',
      ],
      hi: [
        'राजस्व रिकॉर्ड में स्वयं के नाम पर कृषि योग्य भूमि होनी चाहिए',
        'वैध आधार कार्ड और सक्रिय बैंक खाता',
        'संस्थागत भूस्वामी एवं आयकर दाता शामिल नहीं हैं',
      ],
    },
    requiredDocuments: {
      en: ['Aadhaar Card', 'Land Ownership Record (Khatauni / Khasra)', 'Bank Passbook / IFSC'],
      hi: ['आधार कार्ड', 'भूमि स्वामित्व रिकॉर्ड (खतौनी / खसरा)', 'बैंक पासबुक / IFSC'],
    },
    officialPortalUrl: 'https://pmkisan.gov.in',
    applicableFarmerCategories: ['all', 'small_marginal', 'medium', 'large', 'women', 'sc_st'],
  },
  {
    id: 'pmfby',
    name: {
      en: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      hi: 'पीएमएफबीवाई (प्रधानमंत्री फसल बीमा योजना)',
    },
    officialCode: 'PMFBY',
    agency: {
      en: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
      hi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार',
    },
    category: 'insurance',
    benefitHighlight: {
      en: 'Comprehensive crop loss cover with nominal 1.5% - 2% premium',
      hi: 'मात्र 1.5% से 2% प्रीमियम पर संपूर्ण फसल सुरक्षा और मुआवजा',
    },
    shortDescription: {
      en: 'Financial support and risk insurance cover against unforeseen crop failure caused by natural perils.',
      hi: 'प्राकृतिक आपदाओं, कीटों और बेमौसम बारिश से फसल नुकसान पर व्यापक वित्तीय सुरक्षा।',
    },
    detailedBenefits: {
      en: [
        'Farmer pays only 2% for Kharif crops, 1.5% for Rabi, and 5% for horticultural crops',
        'Covers prevented sowing, mid-season adversity, and post-harvest localized losses',
        'Claim payout directly transferred through National Crop Insurance Portal',
      ],
      hi: [
        'किसान को खरीफ फसलों के लिए मात्र 2%, रबी के लिए 1.5%, और बागवानी के लिए 5% प्रीमियम',
        'बुवाई न होने, मध्य-सत्र आपदा और कटाई उपरांत नुकसान की भरपाई',
        'राष्ट्रीय फसल बीमा पोर्टल के जरिए सीधा क्लेम भुगतान',
      ],
    },
    qualificationCriteria: {
      en: [
        'Available to both loanee and non-loanee farmers',
        'Must be cultivating notified crops in notified insurance units',
        'Crop sowing certificate or self-declaration required',
      ],
      hi: [
        'ऋणी और गैर-ऋणी दोनों किसानों के लिए उपलब्ध',
        'अधिसूचित क्षेत्र में अधिसूचित फसलों की खेती होना आवश्यक',
        'फसल बुवाई प्रमाण पत्र या स्व-घोषणा पत्र आवश्यक',
      ],
    },
    requiredDocuments: {
      en: ['Land Record (7/12, Khasra, RoR)', 'Sowing Certificate / Patwari Report', 'Aadhaar Card', 'Bank Passbook'],
      hi: ['भूमि रिकॉर्ड (खसरा / खतौनी / नकल)', 'बुवाई प्रमाण पत्र / पटवारी रिपोर्ट', 'आधार कार्ड', 'बैंक पासबुक'],
    },
    officialPortalUrl: 'https://pmfby.gov.in',
    applicableFarmerCategories: ['all', 'small_marginal', 'medium', 'large', 'women', 'sc_st'],
  },
  {
    id: 'pmksy-pdmc',
    name: {
      en: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
      hi: 'पीएमकेएसवाई - प्रति बूंद अधिक फसल (सूक्ष्म सिंचाई)',
    },
    officialCode: 'PMKSY-PDMC',
    agency: {
      en: 'Department of Agriculture & Farmers Welfare, Govt of India',
      hi: 'कृषि एवं किसान कल्याण विभाग, भारत सरकार',
    },
    category: 'irrigation_subsidy',
    benefitHighlight: {
      en: 'Up to 55% subsidy for small/marginal farmers on Drip and Sprinkler systems',
      hi: 'ड्रिप एवं स्प्रिंकलर सिंचाई प्रणालियों पर छोटे/सीमांत किसानों को 55% तक सब्सिडी',
    },
    shortDescription: {
      en: 'Promotes micro-irrigation systems to optimize water use efficiency and enhance crop yield.',
      hi: 'जल उपयोग दक्षता बढ़ाने और फसल उत्पादन में वृद्धि के लिए ड्रिप एवं फव्वारा सिंचाई हेतु वित्तीय सहायता।',
    },
    detailedBenefits: {
      en: [
        '55% capital subsidy for Small & Marginal farmers',
        '45% subsidy for other farmers',
        'Saves 40-50% water and reduces fertilizer wastage by 30%',
      ],
      hi: [
        'छोटे और सीमांत किसानों के लिए 55% पूंजीगत अनुदान',
        'अन्य सामान्य किसानों के लिए 45% अनुदान',
        '40-50% पानी की बचत और 30% तक खाद की बचत',
      ],
    },
    qualificationCriteria: {
      en: [
        'Cultivable agricultural land with assured irrigation water source',
        'Valid electricity or solar pump connection',
        'Priority given to water-stressed districts and smallholders',
      ],
      hi: [
        'निश्चित जल स्रोत वाली कृषि योग्य भूमि',
        'विद्युत या सोलर पंप कनेक्शन की उपलब्धता',
        'जल संकट वाले क्षेत्रों और छोटे किसानों को प्राथमिकता',
      ],
    },
    requiredDocuments: {
      en: ['Land Ownership Proof', 'Water Source Verification', 'Aadhaar Card', 'Soil/Water Test Report'],
      hi: ['भूमि स्वामित्व प्रमाण पत्र', 'जल स्रोत सत्यापन', 'आधार कार्ड', 'मिट्टी/जल परीक्षण रिपोर्ट'],
    },
    officialPortalUrl: 'https://pmksy.gov.in',
    applicableIrrigation: ['borewell', 'canal', 'drip'],
  },
  {
    id: 'kcc',
    name: {
      en: 'KCC (Kisan Credit Card Scheme)',
      hi: 'केसीसी (किसान क्रेडिट कार्ड योजना)',
    },
    officialCode: 'KCC',
    agency: {
      en: 'Reserve Bank of India & NABARD',
      hi: 'भारतीय रिज़र्व बैंक एवं नाबार्ड',
    },
    category: 'credit_loan',
    benefitHighlight: {
      en: 'Short-term farm credit at 4% effective interest rate up to ₹3 Lakhs',
      hi: '₹3 लाख तक का अल्पावधि कृषि ऋण मात्र 4% प्रभावी ब्याज दर पर',
    },
    shortDescription: {
      en: 'Affordable institutional credit for crop cultivation, post-harvest expenses, and farm maintenance.',
      hi: 'फसल की खेती, कटाई उपरांत खर्च और कृषि उपकरणों के रखरखाव हेतु सुलभ एवं किफायती संस्थागत ऋण।',
    },
    detailedBenefits: {
      en: [
        'Credit limit based on land holding and cropped pattern',
        '7% normal interest with 3% prompt repayment incentive -> Effective 4%',
        'No collateral required for loans up to ₹1.60 Lakhs',
      ],
      hi: [
        'भूमि जोत और फसल चक्र के आधार पर ऋण सीमा का निर्धारण',
        'समय पर पुनर्भुगतान पर 3% की छूट -> मात्र 4% ब्याज दर',
        '₹1.60 लाख तक के ऋण हेतु किसी अतिरिक्त गारंटी/बंधक की आवश्यकता नहीं',
      ],
    },
    qualificationCriteria: {
      en: [
        'All farmers - individual/joint borrowers, owner cultivators',
        'Tenant farmers, oral lessees, and sharecroppers are also eligible',
        'Age between 18 and 75 years',
      ],
      hi: [
        'सभी किसान - व्यक्तिगत/संयुक्त खातेदार, स्वयं खेती करने वाले भूस्वामी',
        'बटाईदार और काश्तकार किसान भी पात्र हैं',
        'आयु 18 से 75 वर्ष के बीच',
      ],
    },
    requiredDocuments: {
      en: ['Completed KCC Application Form', 'Land Records / Cultivation Proof', 'Aadhaar & PAN Card', 'Passport Photos'],
      hi: ['भरा हुआ केसीसी आवेदन पत्र', 'भूमि रिकॉर्ड / खेती का प्रमाण', 'आधार एवं पैन कार्ड', 'पासपोर्ट फोटो'],
    },
    officialPortalUrl: 'https://myscheme.gov.in/schemes/kcc',
    applicableFarmerCategories: ['all', 'small_marginal', 'medium', 'large', 'women', 'sc_st'],
  },
  {
    id: 'pm-kusum',
    name: {
      en: 'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
      hi: 'पीएम-कुसुम (प्रधानमंत्री किसान ऊर्जा सुरक्षा एवं उत्थान महाभियान)',
    },
    officialCode: 'PM-KUSUM',
    agency: {
      en: 'Ministry of New and Renewable Energy (MNRE), Govt of India',
      hi: 'नवीन और नवीकरणीय ऊर्जा मंत्रालय, भारत सरकार',
    },
    category: 'solar_energy',
    benefitHighlight: {
      en: 'Up to 60% total subsidy for installing Standalone Solar Agriculture Pumps',
      hi: 'स्टैंडअलोन सोलर कृषि पंप की स्थापना पर 60% तक कुल सरकारी सब्सिडी',
    },
    shortDescription: {
      en: 'Empowers farmers to replace diesel pumps with clean solar pumps and sell surplus solar power.',
      hi: 'डीजल पंपों को सौर ऊर्जा पंपों से बदलने और अतिरिक्त सौर बिजली बेचकर आय अर्जित करने का अवसर।',
    },
    detailedBenefits: {
      en: [
        '30% Central Government financial support + 30% State Government subsidy',
        'Farmer only pays remaining 40% (bank loan available up to 30%)',
        'Eliminates diesel costs and provides daytime reliable irrigation power',
      ],
      hi: [
        '30% केंद्र सरकार सहायता + 30% राज्य सरकार सब्सिडी',
        'किसान को केवल 40% वहन करना होता है (30% तक बैंक ऋण उपलब्ध)',
        'डीजल के भारी खर्च से मुक्ति और दिन में निर्बाध सिंचाई की सुविधा',
      ],
    },
    qualificationCriteria: {
      en: [
        'Individual farmers, cooperatives, water user associations',
        'Land available for solar pump setup without existing grid connection (Component B)',
        'Borewell / dugwell / surface water source must be available',
      ],
      hi: [
        'व्यक्तिगत किसान, सहकारी समितियां, जल उपभोक्ता संघ',
        'सौर पंप स्थापना हेतु भूमि एवं जल स्रोत उपलब्ध होना चाहिए',
        'बोरवेल / कुआं / सतह जल स्रोत उपलब्ध होना अनिवार्य',
      ],
    },
    requiredDocuments: {
      en: ['Land Ownership Documents', 'Water Source Certificate', 'Aadhaar Card', 'Bank Details'],
      hi: ['भूमि स्वामित्व दस्तावेज', 'जल स्रोत प्रमाण पत्र', 'आधार कार्ड', 'बैंक खाता विवरण'],
    },
    officialPortalUrl: 'https://pmkusum.mnre.gov.in',
    applicableIrrigation: ['borewell', 'rainfed', 'canal'],
  },
  {
    id: 'smam',
    name: {
      en: 'SMAM (Sub-Mission on Agricultural Mechanization)',
      hi: 'एसएमएएम (कृषि यंत्रीकरण उप-मिशन)',
    },
    officialCode: 'SMAM',
    agency: {
      en: 'Department of Agriculture & Farmers Welfare, Govt of India',
      hi: 'कृषि एवं किसान कल्याण विभाग, भारत सरकार',
    },
    category: 'mechanization_subsidy',
    benefitHighlight: {
      en: '40% to 50% subsidy on procurement of tractors, rotavators, and implements',
      hi: 'ट्रैक्टर, रोटावेटर एवं उन्नत कृषि यंत्रों की खरीद पर 40% से 50% तक सब्सिडी',
    },
    shortDescription: {
      en: 'Promotes farm mechanization to reduce labor drudgery and increase operational timeliness.',
      hi: 'कृषि कार्यों में आधुनिक मशीनों के उपयोग को बढ़ावा देने हेतु यंत्र खरीद पर सरकारी सहायता।',
    },
    detailedBenefits: {
      en: [
        '50% subsidy for SC/ST, Women, and Small/Marginal farmers (up to specified caps)',
        '40% subsidy for General category farmers',
        'Custom Hiring Centers (CHCs) eligible for up to 40% project subsidy',
      ],
      hi: [
        'एससी/एसटी, महिला एवं लघु/सीमांत किसानों को 50% अनुदान',
        'सामान्य वर्ग के किसानों को 40% तक अनुदान',
        'कस्टम हायरिंग सेंटर (CHC) स्थापित करने हेतु 40% तक सहायता',
      ],
    },
    qualificationCriteria: {
      en: ['Registered farmer on state agriculture machinery portal', 'Valid land holding in name of applicant'],
      hi: ['राज्य कृषि यंत्र पोर्टल पर पंजीकृत किसान', 'आवेदक के नाम पर वैध कृषि भूमि'],
    },
    requiredDocuments: {
      en: ['Aadhaar Card', 'Land Record (Khatauni)', 'Bank Passbook', 'Caste Certificate (if applicable)'],
      hi: ['आधार कार्ड', 'भूमि रिकॉर्ड (खतौनी)', 'बैंक पासबुक', 'जाति प्रमाण पत्र (यदि लागू हो)'],
    },
    officialPortalUrl: 'https://agrimachinery.nic.in',
    applicableFarmerCategories: ['all', 'small_marginal', 'medium', 'women', 'sc_st'],
  },
];

/**
 * Evaluates farmer profile against authentic Indian agricultural schemes.
 */
export function evaluateFarmerSchemes(input: FarmerEligibilityInput): SchemeEvaluationResult[] {
  const results: SchemeEvaluationResult[] = [];
  const stateNorm = (input.state || '').toLowerCase().trim();
  const land = Number(input.landAcres) || 0;

  for (const scheme of INDIAN_AGRICULTURAL_SCHEMES) {
    let matchScore = 75; // High baseline relevance for national flagship schemes
    const matchReasonsEn: string[] = [];
    const matchReasonsHi: string[] = [];
    const notesEn: string[] = [];
    const notesHi: string[] = [];

    // State check
    if (scheme.isStateSpecific && scheme.applicableStates) {
      const stateMatch = scheme.applicableStates.some((s) => s.toLowerCase() === stateNorm);
      if (!stateMatch) continue;
      matchScore += 15;
      matchReasonsEn.push(`Active state welfare program in ${input.state}.`);
      matchReasonsHi.push(`${input.state} राज्य में सक्रिय कल्याणकारी योजना।`);
    }

    // Land check
    if (land > 0 && land <= 5) {
      matchScore += 10;
      matchReasonsEn.push(`Landholding size (${land} acres) qualifies for Small & Marginal farmer priority.`);
      matchReasonsHi.push(`भूमि का आकार (${land} एकड़) छोटे और सीमांत किसान प्राथमिकता के अंतर्गत आता है।`);
    } else {
      matchReasonsEn.push(`General landholding farmer eligibility.`);
      matchReasonsHi.push(`सामान्य किसान भूमि पात्रता।`);
    }

    // Category check
    let matchLevel: EligibilityMatchLevel = 'POTENTIALLY_ELIGIBLE';
    notesEn.push('Check active state portal opening dates and verify land records with local Patwari/Kisan Mitra.');
    notesHi.push('स्थानीय पटवारी / किसान मित्र के साथ भूमि रिकॉर्ड का सत्यापन करें और आधिकारिक पोर्टल पर आवेदन करें।');

    results.push({
      scheme,
      matchLevel,
      matchScore: Math.min(95, matchScore),
      reasonsForMatch: { en: matchReasonsEn, hi: matchReasonsHi },
      verificationNotes: { en: notesEn, hi: notesHi },
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
