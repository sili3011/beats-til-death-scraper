// Auto-generated TypeScript definitions for lifedata
// Generated on: 2025-09-30T19:30:56.214Z

export interface LifeRow {
  country_code: string;
  country_name: string;
  year: number;
  life_expectancy: number;
  source: string;
  retrieved_at: string;
}

export interface RhrEffect {
  neutral_bpm: number;
  hr_per_10bpm: { low: number; mid: number; high: number };
  bands: Array<{ min: number; max: number; rr_allcause: number }>;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export interface SmokingEffect {
  current_vs_never_years: [number, number];
  quit_gain_years_after_5: number;
  quit_gain_years_after_10: number;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export interface ExerciseEffect {
  none: number;
  mod_150min_week_gain: number;
  high_300min_week_gain: number;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export interface AlcoholEffect {
  none: number;
  light_years_gain: number;
  light_consumption_range: [number, number];
  moderate_years_gain: number;
  moderate_consumption_range: [number, number];
  heavy_vs_moderate_years: number;
  heavy_consumption_threshold: number;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export interface WeightEffect {
  normal_bmi: [number, number];
  overweight_years_lost: number;
  obese_years_lost: number;
  severely_obese_years_lost: number;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export interface Effects {
  smoking: { current_vs_never_years?: [number, number]; quit_gain_years_after_5?: number };
  exercise: { mod_150min_week_gain?: number; high_300min_week_gain?: number };
  alcohol: { heavy_vs_moderate_years?: number };
  diet: { mediterranean_adherence_gain?: number };
  notes?: string;
  citations: string[];
}

export interface Metadata {
  lastUpdated: string;
  lifeExpectancyRecords: number;
  sources: string[];
  version: string;
  effectTypes: string[];
}

export interface DrugUseMortalityRow {\n  country_code: string;\n  country_name: string;\n  year: number;\n  drug_use_mortality_rate: number;\n  source: string;\n  retrieved_at: string;\n}

export interface SmokingRow {\n  country_code: string;\n  country_name: string;\n  year: number;\n  smoking_prevalence: number;\n  source: string;\n  retrieved_at: string;\n}

export interface SourceRef { title: string; url: string }
export interface SourceInfo {
  datasets: Record<string, { name: string; url: string; api?: string; docs?: string; license?: string; note?: string }>;
  effects: Record<string, { name: string; references: SourceRef[] } | null>;
}

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const rhrEffect: RhrEffect | null;
export declare const smokingEffect: SmokingEffect | null;
export declare const exerciseEffect: ExerciseEffect | null;
export declare const alcoholEffect: AlcoholEffect | null;
export declare const weightEffect: WeightEffect | null;
export declare const drugUseMortality: DrugUseMortalityRow[] | null;
export declare const smokingPrevalence: SmokingRow[] | null;
export declare const metadata: Metadata;
export declare const sourceInfo: SourceInfo;

export declare function getAllData(): {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  rhrEffect: RhrEffect | null;
  smokingEffect: SmokingEffect | null;
  exerciseEffect: ExerciseEffect | null;
  alcoholEffect: AlcoholEffect | null;
  weightEffect: WeightEffect | null;
  metadata: Metadata;
  sourceInfo: SourceInfo;
};

declare const _default: {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  rhrEffect: RhrEffect | null;
  smokingEffect: SmokingEffect | null;
  exerciseEffect: ExerciseEffect | null;
  alcoholEffect: AlcoholEffect | null;
  weightEffect: WeightEffect | null;
  metadata: Metadata;
  sourceInfo: SourceInfo;
  getAllData: typeof getAllData;
};

export default _default;