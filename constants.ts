
import { TcmDatabase, Syndrome } from './types';

// Helper to parse strings into arrays for the DB
const toArray = (str: string) => str.split(/[,;]\s?/).map(s => s.trim()).filter(s => s);
const parsePoints = (str: string) => toArray(str).map(s => {
    // Normalize codes: "HE-9" -> "HT9", "LIV-3" -> "LR3", "Ren-12" -> "CV12", "Du-20" -> "GV20"
    return s.split(' ')[0].replace('HE-', 'HT').replace('LIV-', 'LR').replace('Ren-', 'CV').replace('Du-', 'GV').replace('P-', 'PC').replace('-', '');
});

const MACIOCIA_DATA: Syndrome[] = [
  // 1. HEART FIRE BLAZING
  {
    id: "HEART_FIRE_BLAZING",
    name_id: "Api Jantung Berkobar",
    name_en: "Heart Fire Blazing",
    name_zh: "心火旺",
    name_pinyin: "Xīn Huǒ Wàng",
    primary_organs: ["Heart"],
    wuxing_element: "Fire",
    pattern_type: "full_heat_excess",
    clinical_manifestations: toArray("Palpitations, Thirst, Mouth and tongue ulcers, Mental restlessness, Agitation, Feeling of heat, Red face, Insomnia, Dream-disturbed sleep, Dark urine, Blood in urine, Bitter taste"),
    tongue: toArray("Red, Tip redder and swollen with red points, Yellow coating, Midline crack to tip"),
    pulse: toArray("Full-Rapid-Overflowing (Left Front), Hasty"),
    key_symptoms: toArray("Tongue ulcers, Thirst, Palpitations, Red tongue"),
    treatment_principle: toArray("Clear the Heart, Drain Fire, Calm the Mind"),
    acupuncture_points: parsePoints("HE-9 Shaochong, HE-8 Shaofu, HE-7 Shenmen, Ren-15 Jiuwei, SP-6 Sanyinjiao, KI-6 Zhaohai, LI-11 Quchi, Du-24 Shenting, Du-19 Houding"),
    needling_method: "Reducing; no moxa. SP-6/KI-6 reinforced.",
    diagnostic_tip: "Look for the red tip of the tongue."
  },
  // 2. LIVER FIRE BLAZING
  {
    id: "LIVER_FIRE_BLAZING",
    name_id: "Api Hati Berkobar",
    name_en: "Liver Fire Blazing",
    name_zh: "肝火旺",
    name_pinyin: "Gān Huǒ Wàng",
    primary_organs: ["Liver"],
    wuxing_element: "Wood",
    pattern_type: "full_heat_excess",
    clinical_manifestations: toArray("Headache, Dizziness, Red face and eyes, Irritability, Outbursts of anger, Bitter taste, Dry throat, Constipation, Dark-yellow urine, Tinnitus, Epistaxis, Hematemesis"),
    tongue: toArray("Red body, Redder sides, Yellow coating"),
    pulse: toArray("Wiry, Rapid"),
    key_symptoms: toArray("Red eyes, Red face, Anger, Bitter taste, Wiry-Rapid pulse"),
    treatment_principle: toArray("Clear Liver-Fire, Drain Heat, Subdue rising Qi"),
    acupuncture_points: parsePoints("LIV-2 Xingjian, LIV-3 Taichong, GB-20 Fengchi, LI-11 Quchi, Du-24 Shenting, Taiyang"),
    needling_method: "Reducing; no moxa."
  },
  // 3. INVASION OF LUNGS BY WIND-HEAT
  {
    id: "INVASION_LUNGS_WIND_HEAT",
    name_id: "Invasi Angin-Panas ke Paru",
    name_en: "Invasion of Lungs by Wind-Heat",
    name_zh: "风热犯肺",
    name_pinyin: "Fēng Rè Fàn Fèi",
    primary_organs: ["Lung"],
    wuxing_element: "Metal",
    pattern_type: "excess_heat_external",
    clinical_manifestations: toArray("Fever, Aversion to cold, Headache, Sore throat, Cough, Stuffy nose, Yellow nasal discharge, Slight body aches, Thirst, Red face"),
    tongue: toArray("Red front/sides, Thin yellow coating"),
    pulse: toArray("Floating, Rapid"),
    key_symptoms: toArray("Fever, Sore throat, Floating-Rapid pulse"),
    treatment_principle: toArray("Release Exterior, Expel Wind-Heat, Restore Lung descending"),
    acupuncture_points: parsePoints("LI-4 Hegu, LI-11 Quchi, LU-7 Lieque, GB-20 Fengchi, Du-14 Dazhui, BL-12 Fengmen"),
    needling_method: "Reducing."
  },
  // 4. INVASION OF LUNGS BY WIND-COLD
  {
    id: "INVASION_LUNGS_WIND_COLD",
    name_id: "Invasi Angin-Dingin ke Paru",
    name_en: "Invasion of Lungs by Wind-Cold",
    name_zh: "风寒犯肺",
    name_pinyin: "Fēng Hán Fàn Fèi",
    primary_organs: ["Lung"],
    wuxing_element: "Metal",
    pattern_type: "excess_cold_external",
    clinical_manifestations: toArray("Aversion to cold, Mild fever, No sweating, Body aches, Stiff neck, Cough with thin white sputum, Runny nose (clear), Blocked nose"),
    tongue: toArray("Thin white coating"),
    pulse: toArray("Floating, Tight"),
    key_symptoms: toArray("Aversion to cold, No sweating, Stiff neck, Floating-Tight pulse"),
    treatment_principle: toArray("Release Exterior, Expel Wind-Cold, Restore Lung diffusing"),
    acupuncture_points: parsePoints("LU-7 Lieque, LI-4 Hegu, BL-12 Fengmen, GB-20 Fengchi"),
    needling_method: "Reducing. Cupping on BL-12."
  },
  // 5. STAGNATION OF COLD IN LIVER CHANNEL
  {
    id: "STAGNATION_COLD_LIVER_CHANNEL",
    name_id: "Stagnasi Dingin di Meridian Hati",
    name_en: "Stagnation of Cold in Liver Channel",
    name_zh: "寒滞肝脉",
    name_pinyin: "Hán Zhì Gān Mài",
    primary_organs: ["Liver"],
    wuxing_element: "Wood",
    pattern_type: "excess_cold",
    clinical_manifestations: toArray("Severe lower abdominal pain, Pain radiates to genitals/testes, Scrotum contraction, Pain worse with cold, Pain better with warmth, Cold limbs"),
    tongue: toArray("Pale, White coating"),
    pulse: toArray("Deep, Wiry, Slow/Tight"),
    key_symptoms: toArray("Hypogastric pain radiating to genitals, Alleviated by warmth"),
    treatment_principle: toArray("Warm Liver Channel, Expel Cold, Move Qi"),
    acupuncture_points: parsePoints("LIV-3 Taichong, LIV-8 Ququan, ST-29 Guilai, SP-6 Sanyinjiao"),
    needling_method: "Reducing with Moxa."
  },
  // 6. COLD-PHLEGM IN LUNGS
  {
    id: "COLD_PHLEGM_LUNGS",
    name_id: "Dahak-Dingin di Paru",
    name_en: "Cold-Phlegm in Lungs",
    name_zh: "寒痰阻肺",
    name_pinyin: "Hán Tán Zǔ Fèi",
    primary_organs: ["Lung"],
    wuxing_element: "Metal",
    pattern_type: "excess_cold_phlegm",
    clinical_manifestations: toArray("Cough with copious white watery sputum, Chest oppression, Cold feeling in chest, Phlegm in throat, Heaviness, Muzzy head, Dizziness"),
    tongue: toArray("Swollen, Sticky white coating"),
    pulse: toArray("Slippery, Slow"),
    key_symptoms: toArray("Cough with white watery sputum, Chest oppression, Swollen tongue"),
    treatment_principle: toArray("Resolve Phlegm, Warm Lungs, Restore descending"),
    acupuncture_points: parsePoints("LU-5 Chize, LU-7 Lieque, LU-1 Zhongfu, Ren-17 Shanzhong, ST-40 Fenglong, P-6 Neiguan, Ren-12 Zhongwan, BL-20 Pishu"),
    needling_method: "Reducing."
  },
  // 7. COLD-DAMPNESS INVADING SPLEEN
  {
    id: "COLD_DAMPNESS_SPLEEN",
    name_id: "Lembap-Dingin Menginvasi Limpa",
    name_en: "Cold-Dampness Invading Spleen",
    name_zh: "寒湿困脾",
    name_pinyin: "Hán Shī Kùn Pí",
    primary_organs: ["Spleen"],
    wuxing_element: "Earth",
    pattern_type: "excess_damp_cold",
    clinical_manifestations: toArray("Abdominal fullness, Poor appetite, Nausea, Loose stools, Heaviness of body, Tiredness, Edema, White vaginal discharge"),
    tongue: toArray("Pale, Sticky white coating"),
    pulse: toArray("Slippery, Slow"),
    key_symptoms: toArray("Abdominal fullness, Heaviness, Sticky white coating"),
    treatment_principle: toArray("Resolve Dampness, Expel Cold, Tonify Spleen"),
    acupuncture_points: parsePoints("Ren-12 Zhongwan, ST-36 Zusanli, SP-9 Yinlingquan, SP-6 Sanyinjiao, SP-3 Taibai, BL-20 Pishu"),
    needling_method: "Reducing (Damp), Reinforcing (Spleen). Moxa applicable."
  },
  // 8. COLD INVADING STOMACH
  {
    id: "COLD_INVADING_STOMACH",
    name_id: "Dingin Menginvasi Lambung",
    name_en: "Cold Invading Stomach",
    name_zh: "寒邪犯胃",
    name_pinyin: "Hán Xié Fàn Wèi",
    primary_organs: ["Stomach"],
    wuxing_element: "Earth",
    pattern_type: "excess_cold",
    clinical_manifestations: toArray("Sudden epigastric pain, Pain better with warmth, Vomiting clear fluids, Feeling cold, Cold limbs, No thirst"),
    tongue: toArray("Pale, Thick white coating"),
    pulse: toArray("Deep, Tight, Slow"),
    key_symptoms: toArray("Epigastric pain better with warmth, Vomiting clear fluids"),
    treatment_principle: toArray("Warm Stomach, Expel Cold, Relieve pain"),
    acupuncture_points: parsePoints("Ren-12 Zhongwan, ST-36 Zusanli, ST-21 Liangmen, SP-4 Gongsun"),
    needling_method: "Reducing. Heavy Moxa."
  },
  // 9. COLD INVADING LARGE INTESTINE
  {
    id: "COLD_INVADING_LARGE_INTESTINE",
    name_id: "Dingin Menginvasi Usus Besar",
    name_en: "Cold Invading Large Intestine",
    name_zh: "寒邪犯大肠",
    name_pinyin: "Hán Xié Fàn Dà Cháng",
    primary_organs: ["Large Intestine"],
    wuxing_element: "Metal",
    pattern_type: "excess_cold",
    clinical_manifestations: toArray("Sudden abdominal pain, Diarrhea with pain, Feeling cold, Cold limbs"),
    tongue: toArray("Pale, White coating"),
    pulse: toArray("Deep, Tight"),
    key_symptoms: toArray("Abdominal pain, Diarrhea, Cold limbs"),
    treatment_principle: toArray("Expel Cold, Warm Large Intestine"),
    acupuncture_points: parsePoints("ST-25 Tianshu, ST-37 Shangjuxu, ST-36 Zusanli"),
    needling_method: "Reducing; moxa."
  }
];

export const TCM_DB: TcmDatabase = {
  metadata: {
    db_name: "TCM Maciocia Database",
    version: "2.1.0",
    sources_used: ["Giovanni Maciocia - Foundations of Chinese Medicine"],
    scope_note: "Core syndromes and protocols for clinical CDSS."
  },
  clinical_config: {},
  patient_form_schema: {},
  core_rules: {},
  wuxing_map: {
    "Wood": ["Liver", "Gall Bladder"],
    "Fire": ["Heart", "Small Intestine", "Pericardium", "San Jiao"],
    "Earth": ["Spleen", "Stomach"],
    "Metal": ["Lung", "Large Intestine"],
    "Water": ["Kidney", "Bladder"]
  },
  organ_details: {
    "Liver": {
      name: "Liver", type: "Zang", element: "Wood",
      main_functions: ["Stores Blood", "Ensures smooth flow of Qi", "Controls tendons", "Manifests in the eyes"],
      emotion: "Anger", season: "Spring", sense_organ: "Eyes", tissues: "Tendons", flavor: "Sour", color: "Green/Blue", time_of_day: "1-3 AM"
    },
    "Heart": {
      name: "Heart", type: "Zang", element: "Fire",
      main_functions: ["Governs Blood", "Controls the blood vessels", "Houses the Mind (Shen)", "Manifests in the complexion"],
      emotion: "Joy", season: "Summer", sense_organ: "Tongue", tissues: "Blood vessels", flavor: "Bitter", color: "Red", time_of_day: "11 AM - 1 PM"
    },
    "Spleen": {
      name: "Spleen", type: "Zang", element: "Earth",
      main_functions: ["Governs transformation and transportation", "Controls Blood", "Controls the muscles and the four limbs", "Opens into the mouth"],
      emotion: "Pensiveness/Worry", season: "Late Summer", sense_organ: "Mouth", tissues: "Muscles", flavor: "Sweet", color: "Yellow", time_of_day: "9-11 AM"
    },
    "Lung": {
      name: "Lung", type: "Zang", element: "Metal",
      main_functions: ["Governs Qi and respiration", "Controls channels and blood vessels", "Controls diffusing and descending", "Regulates water passages"],
      emotion: "Sadness/Grief", season: "Autumn", sense_organ: "Nose", tissues: "Skin", flavor: "Pungent", color: "White", time_of_day: "3-5 AM"
    },
    "Kidney": {
      name: "Kidney", type: "Zang", element: "Water",
      main_functions: ["Stores Essence (Jing)", "Governs birth, growth, reproduction and development", "Produces Marrow", "Governs Water"],
      emotion: "Fear", season: "Winter", sense_organ: "Ears", tissues: "Bones", flavor: "Salty", color: "Black/Dark Blue", time_of_day: "5-7 PM"
    }
  },
  special_point_tables: {},
  syndromes: {
    FILLED_FROM_PDF: MACIOCIA_DATA,
    TODO_FROM_PDF: []
  },
  herbal_guidelines: {
    per_syndrome_overrides_for_current_DB_snippet: {},
    herbal_rules_by_pattern_type: {
      "full_heat_excess": { suggest_chief: ["Huang Lian", "Zhi Zi"], notes: "Clear Heat Formula" },
      "excess_cold": { suggest_chief: ["Gan Jiang", "Rou Gui"], notes: "Warm Internal Formula" }
    }
  },
  stroke_protocols: {
    etiologies: [
      { name: "Wind-Stroke (Meridians)", pathogen: "Wind", points: ["GV-20", "GB-20"], focus: "Expel Wind" }
    ],
    scalp_zones: [
      { name: "Motor Area", desc: "For motor paralysis on contralateral side" }
    ],
    jins_three_needles: [
      { name: "Nie San Zhen", points: ["Temporal Points"], indication: "Motor/Speech issues" }
    ],
    research_highlights: [
      { context: "Neuroplasticity", mechanism: "Scalp acupuncture increases BDNF", effect: "Improved motor recovery" }
    ],
    case_studies: [
      { title: "Post-Ischemic Stroke", patient_profile: "65yo Male", history: "Right sided hemiparesis", diagnosis: "Liver Wind", points_used: ["GV-20", "ST-36"], results: ["Significant improvement in gait"] }
    ]
  }
};
