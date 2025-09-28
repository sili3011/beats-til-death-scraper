#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Generate the main index.js and index.d.ts files for NPM package exports
 */
async function generateExports() {
  console.log("Generating NPM package exports...");

  const latestDir = "data/latest";

  // Check if data files exist
  const files = {
    lifeExpectancy: path.join(latestDir, "life_expectancy.json"),
    lifestyleEffects: path.join(latestDir, "lifestyle_effects.json"),
    rhrEffect: path.join(latestDir, "rhr_effect.json"),
    smokingEffect: path.join(latestDir, "smoking_effect.json"),
    exerciseEffect: path.join(latestDir, "exercise_effect.json"),
    alcoholEffect: path.join(latestDir, "alcohol_effect.json"),
    weightEffect: path.join(latestDir, "weight_effect.json"),
  };

  // Check if core files exist
  const lifeExpectancyExists = await fs
    .access(files.lifeExpectancy)
    .then(() => true)
    .catch(() => false);
  const lifestyleEffectsExists = await fs
    .access(files.lifestyleEffects)
    .then(() => true)
    .catch(() => false);

  if (!lifeExpectancyExists || !lifestyleEffectsExists) {
    throw new Error("Core data files not found. Run data pipeline first.");
  }

  // Read all data files
  const data = {};
  const dataStrings = {};

  for (const [key, filePath] of Object.entries(files)) {
    try {
      const content = await fs.readFile(filePath, "utf8");
      data[key] = JSON.parse(content);
      dataStrings[key] = content;
    } catch (error) {
      console.log(`Optional file not found: ${filePath}`);
      data[key] = null;
      dataStrings[key] = "null";
    }
  }

  // Generate index.js
  const indexJs = `// Auto-generated NPM package exports for lifedata
// Generated on: ${new Date().toISOString()}

/**
 * Life expectancy data from multiple sources
 * @type {Array<import('./types.js').LifeRow>}
 */
export const lifeExpectancy = ${dataStrings.lifeExpectancy};

/**
 * Lifestyle effects data with conservative estimates (legacy format)
 * @type {import('./types.js').Effects}
 */
export const lifestyleEffects = ${dataStrings.lifestyleEffects};

/**
 * Resting heart rate effect data
 * @type {import('./types.js').RhrEffect | null}
 */
export const rhrEffect = ${dataStrings.rhrEffect};

/**
 * Smoking effect data
 * @type {import('./types.js').SmokingEffect | null}
 */
export const smokingEffect = ${dataStrings.smokingEffect};

/**
 * Exercise effect data
 * @type {import('./types.js').ExerciseEffect | null}
 */
export const exerciseEffect = ${dataStrings.exerciseEffect};


/**
 * Alcohol effect data
 * @type {import('./types.js').AlcoholEffect | null}
 */
export const alcoholEffect = ${dataStrings.alcoholEffect};

/**
 * Weight effect data
 * @type {import('./types.js').WeightEffect | null}
 */
export const weightEffect = ${dataStrings.weightEffect};

/**
 * Package metadata
 */
export const metadata = {
  lastUpdated: "${new Date().toISOString()}",
  lifeExpectancyRecords: ${data.lifeExpectancy?.length || 0},
  sources: ["worldbank", "who", "oecd", "manual"],
  version: "${process.env.npm_package_version || "1.0.0"}",
  effectTypes: ["rhr", "smoking", "exercise", "lifestyle", "alcohol", "weight"]
};

/**
 * Get all data as a single object
 */
export function getAllData() {
  return {
    lifeExpectancy,
    lifestyleEffects,
    rhrEffect,
    smokingEffect,
    exerciseEffect,
    alcoholEffect,
    weightEffect,
    metadata
  };
}

// Default export
export default {
  lifeExpectancy,
  lifestyleEffects,
  rhrEffect,
  smokingEffect,
  exerciseEffect,
  alcoholEffect,
  weightEffect,
  metadata,
  getAllData
};
`;

  // Generate index.d.ts
  const indexDts = `// Auto-generated TypeScript definitions for lifedata
// Generated on: ${new Date().toISOString()}

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

export interface WeightEffect {
  normal_bmi: [number, number];
  overweight_years_lost: number;
  obese_years_lost: number;
  severely_obese_years_lost: number;
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

export interface Metadata {
  normal_bmi: [number, number];
  overweight_years_lost: number;
  obese_years_lost: number;
  severely_obese_years_lost: number;
  citations: string[];
  retrieved_at: string;
  notes: string;
}

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const rhrEffect: RhrEffect | null;
export declare const smokingEffect: SmokingEffect | null;
export declare const exerciseEffect: ExerciseEffect | null;
export declare const weightEffect: WeightEffect | null;
export declare const alcoholEffect: AlcoholEffect | null;
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
  weightEffect: WeightEffect | null;
  alcoholEffect: AlcoholEffect | null;
  metadata: Metadata;
  getAllData: typeof getAllData;
};

export default _default;
`;

  // Write the files
  await fs.writeFile(path.join(latestDir, "index.js"), indexJs);
  await fs.writeFile(path.join(latestDir, "index.d.ts"), indexDts);

  const effectCount = [
    data.rhrEffect,
    data.smokingEffect,
    data.exerciseEffect,
    data.weightEffect,
    data.alcoholEffect,
    data.lifestyleEffects,
  ].filter(Boolean).length;

  console.log("✅ Generated package exports:");
  console.log(`   - ${path.join(latestDir, "index.js")}`);
  console.log(`   - ${path.join(latestDir, "index.d.ts")}`);
  console.log(
    `   - Life expectancy records: ${data.lifeExpectancy?.length || 0}`
  );
  console.log(
    `   - Effect types available: ${effectCount + 1} (${Object.entries(files)
      .map(([key]) => key)
      .join(", ")})`
  );
}

generateExports().catch((error) => {
  console.error("Failed to generate exports:", error);
  process.exit(1);
});
