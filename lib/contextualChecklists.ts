/**
 * lib/contextualChecklists.ts
 * Generates dynamic, context-aware farmer observation checklists
 * tailored to today's active agricultural task and seasonal stage.
 */

import type { DailyAction, ContextualQuestion, TaskSpecificChecklist } from '@/types/planLifecycle';

export interface UniversalObservation {
  id: string;
  label: { en: string; hi: string };
  icon?: string;
  suggestedActionType?: 'reschedule' | 'irrigate' | 'drain' | 'protect';
}

export const UNIVERSAL_OBSERVATIONS: UniversalObservation[] = [
  {
    id: 'rain_heavy',
    label: {
      en: 'Unexpected heavy rainfall occurred',
      hi: 'अचानक भारी बारिश हुई',
    },
    suggestedActionType: 'drain',
  },
  {
    id: 'pest_symptoms',
    label: {
      en: 'Pest or disease symptoms noticed',
      hi: 'खेत में कीट या रोग के लक्षण दिखाई दिए',
    },
    suggestedActionType: 'protect',
  },
  {
    id: 'leaf_yellowing',
    label: {
      en: 'Crop color changed / leaves yellowing',
      hi: 'पत्तियों का रंग पीला या असामान्य हुआ',
    },
    suggestedActionType: 'protect',
  },
  {
    id: 'irrigation_fault',
    label: {
      en: 'Water or irrigation problem occurred',
      hi: 'सिंचाई या पानी की आपूर्ति में समस्या आई',
    },
    suggestedActionType: 'irrigate',
  },
  {
    id: 'task_delayed',
    label: {
      en: "Today's scheduled task could not be completed",
      hi: 'आज का निर्धारित कार्य पूरा नहीं हो पाया',
    },
    suggestedActionType: 'reschedule',
  },
];

/**
 * Returns dynamic contextual checklist questions specifically for today's task.
 */
export function getContextualTaskChecklist(
  day: number,
  week: number,
  task: DailyAction | null,
  cropName: string = 'Crop'
): TaskSpecificChecklist {
  if (!task) {
    return {
      day,
      week,
      taskTitle: 'Field Inspection',
      taskCategory: 'monitoring',
      questions: [
        {
          id: 'q_gen_moisture',
          label: {
            en: 'Is soil moisture adequate today?',
            hi: 'क्या आज खेत में पर्याप्त नमी है?',
          },
          category: 'soil_condition',
        },
        {
          id: 'q_gen_growth',
          label: {
            en: 'Is crop growth uniform and healthy?',
            hi: 'क्या फसल की वृद्धि सामान्य और हरी-भरी है?',
          },
          category: 'pest_disease',
        },
      ],
    };
  }

  const category = task.category;
  const questions: ContextualQuestion[] = [];

  // 1. Task Completion
  questions.push({
    id: `q_${day}_completed`,
    label: {
      en: `Was "${task.title}" completed fully?`,
      hi: `क्या "${task.title}" कार्य सफलतापूर्वक पूरा हुआ?`,
    },
    category: 'task_completion',
    impactsAdjustment: true,
  });

  // 2. Category Specific Checks
  switch (category) {
    case 'prep':
      questions.push(
        {
          id: `q_${day}_soil_hardness`,
          label: {
            en: 'Was the soil too hard or cloddy during tilling?',
            hi: 'क्या जुताई के दौरान मिट्टी बहुत कठोर या ढेलेदार थी?',
          },
          category: 'soil_condition',
        },
        {
          id: `q_${day}_tractor_avail`,
          label: {
            en: 'Were machinery/tractor and implements functioning smoothly?',
            hi: 'क्या ट्रैक्टर या कृषि उपकरण सुचारू रूप से कार्य कर रहे थे?',
          },
          category: 'machinery',
        }
      );
      break;

    case 'sowing':
      questions.push(
        {
          id: `q_${day}_seed_quality`,
          label: {
            en: `Were certified seeds of ${cropName} treated with bio-fungicide?`,
            hi: `क्या ${cropName} के बीजों का बीजोपचार किया गया था?`,
          },
          category: 'input_quality',
        },
        {
          id: `q_${day}_sowing_depth`,
          label: {
            en: 'Was proper seed spacing and moisture maintained during sowing?',
            hi: 'क्या बुवाई के समय उचित दूरी और पर्याप्त नमी बनी रही?',
          },
          category: 'soil_condition',
        }
      );
      break;

    case 'irrigation':
      questions.push(
        {
          id: `q_${day}_water_avail`,
          label: {
            en: 'Was adequate water pressure and electricity available?',
            hi: 'क्या पर्याप्त जल दबाव और बिजली उपलब्ध थी?',
          },
          category: 'machinery',
        },
        {
          id: `q_${day}_waterlogging`,
          label: {
            en: 'Did any waterlogging or standing water occur in low areas?',
            hi: 'क्या खेत के निचले हिस्सों में पानी का जमाव हुआ?',
          },
          category: 'soil_condition',
        }
      );
      break;

    case 'nutrient':
      questions.push(
        {
          id: `q_${day}_fert_avail`,
          label: {
            en: 'Was the recommended fertilizer grade available at local cooperative?',
            hi: 'क्या अनुशंसित खाद/उर्वरक स्थानीय स्तर पर उपलब्ध था?',
          },
          category: 'input_quality',
        },
        {
          id: `q_${day}_rain_forecast`,
          label: {
            en: 'Was soil moist without imminent heavy wash-away rainfall?',
            hi: 'क्या खाद डालते समय मिट्टी नम थी और तेज बारिश का खतरा नहीं था?',
          },
          category: 'weather',
        }
      );
      break;

    case 'protection':
      questions.push(
        {
          id: `q_${day}_pest_type`,
          label: {
            en: 'Were specific insect pests or leaf spots visible?',
            hi: 'क्या पत्तियों पर विशेष कीट या फफूंद के धब्बे दिखे?',
          },
          category: 'pest_disease',
        },
        {
          id: `q_${day}_spray_condition`,
          label: {
            en: 'Was spray performed in calm morning/evening without strong wind?',
            hi: 'क्या छिड़काव शांत मौसम में (सुबह या शाम) किया गया?',
          },
          category: 'weather',
        }
      );
      break;

    case 'harvest':
      questions.push(
        {
          id: `q_${day}_maturity`,
          label: {
            en: 'Has the crop reached 80%+ maturity with dry foliage?',
            hi: 'क्या फसल 80% से अधिक पककर कटाई योग्य हो चुकी है?',
          },
          category: 'task_completion',
        },
        {
          id: `q_${day}_mandi_rate`,
          label: {
            en: 'Have you checked today’s mandi arrival rates before bagging?',
            hi: 'क्या आपने भंडारण या बिक्री से पूर्व स्थानीय मंडी भाव देखे?',
          },
          category: 'market',
        }
      );
      break;

    default:
      questions.push({
        id: `q_${day}_growth_status`,
        label: {
          en: 'Is crop growth on schedule for this stage?',
          hi: 'क्या इस चरण में फसल की वृद्धि सामान्य है?',
        },
        category: 'pest_disease',
      });
      break;
  }

  return {
    day,
    week,
    taskTitle: task.title,
    taskCategory: category,
    questions,
  };
}
