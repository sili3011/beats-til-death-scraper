// Auto-generated TypeScript definitions for lifedata
// Generated on: 2025-09-23T22:58:35.833Z

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

export interface Metadata {
  lastUpdated: string;
  lifeExpectancyRecords: number;
  sources: string[];
  version: string;
}

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const metadata: Metadata;

export declare function getAllData(): {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  metadata: Metadata;
};

declare const _default: {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  metadata: Metadata;
  getAllData: typeof getAllData;
};

export default _default;
