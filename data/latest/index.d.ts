// Auto-generated TypeScript definitions for lifedata
// Generated on: 2025-09-26T22:39:29.637Z

export interface LifeRow {
  country_code: string;
  country_name: string;
  year: number;
  life_expectancy: number;
  source: string;
  retrieved_at: string;
}

export interface Effects {
  smoking: {
    current_vs_never_years?: [number, number];
    quit_gain_years_after_5?: number;
  };
  exercise: {
    mod_150min_week_gain?: number;
    high_300min_week_gain?: number;
  };
  alcohol: {
    heavy_vs_moderate_years?: number;
  };
  diet: {
    mediterranean_adherence_gain?: number;
  };
  notes?: string;
  citations: string[];
}

export interface RhrEffect {
  neutral_bpm: number;
  hr_per_10bpm: {
    low: number;
    mid: number;
    high: number;
  };
  bands: Array<{
    min: number;
    max: number;
    rr_allcause: number;
  }>;
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

export interface Metadata {
  lastUpdated: string;
  lifeExpectancyRecords: number;
  sources: string[];
  version: string;
  effectTypes: string[];
}

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const rhrEffect: RhrEffect | null;
export declare const smokingEffect: SmokingEffect | null;
export declare const exerciseEffect: ExerciseEffect | null;
export declare const metadata: Metadata;

export declare function getAllData(): {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  rhrEffect: RhrEffect | null;
  smokingEffect: SmokingEffect | null;
  exerciseEffect: ExerciseEffect | null;
  metadata: Metadata;
};

declare const _default: {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  rhrEffect: RhrEffect | null;
  smokingEffect: SmokingEffect | null;
  exerciseEffect: ExerciseEffect | null;
  metadata: Metadata;
  getAllData: typeof getAllData;
};

export default _default;
