#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

// Generate the main index.js and index.d.ts files for NPM package exports
async function generateExports() {
  console.log("Generating NPM package exports...");

  const latestDir = "data/latest";

  // File map
  const files = {
    lifeExpectancy: path.join(latestDir, "life_expectancy.json"),
    lifestyleEffects: path.join(latestDir, "lifestyle_effects.json"),
    rhrEffect: path.join(latestDir, "rhr_effect.json"),
    smokingEffect: path.join(latestDir, "smoking_effect.json"),
    exerciseEffect: path.join(latestDir, "exercise_effect.json"),
    alcoholEffect: path.join(latestDir, "alcohol_effect.json"),
    weightEffect: path.join(latestDir, "weight_effect.json"),
  };

  // Ensure core files exist
  const core = await Promise.all([
    fs.access(files.lifeExpectancy).then(() => true).catch(() => false),
    fs.access(files.lifestyleEffects).then(() => true).catch(() => false),
  ]);
  if (!core.every(Boolean)) {
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
    } catch {
      console.log(`Optional file not found: ${filePath}`);
      data[key] = null;
      dataStrings[key] = "null";
    }
  }

  // index.js content (avoid JSDoc imports to non-existent files)
  const indexJs = `// Auto-generated NPM package exports for lifedata
// Generated on: ${new Date().toISOString()}

export const lifeExpectancy = ${dataStrings.lifeExpectancy};
export const lifestyleEffects = ${dataStrings.lifestyleEffects};
export const rhrEffect = ${dataStrings.rhrEffect};
export const smokingEffect = ${dataStrings.smokingEffect};
export const exerciseEffect = ${dataStrings.exerciseEffect};
export const alcoholEffect = ${dataStrings.alcoholEffect};
export const weightEffect = ${dataStrings.weightEffect};

export const metadata = {
  lastUpdated: "${new Date().toISOString()}",
  lifeExpectancyRecords: ${data.lifeExpectancy?.length || 0},
  sources: ["worldbank", "who", "oecd"],
  version: "${process.env.npm_package_version || "0.0.0"}",
  effectTypes: ["rhr", "smoking", "exercise", "lifestyle", "alcohol", "weight"],
};

export function getAllData() {
  return {
    lifeExpectancy,
    lifestyleEffects,
    rhrEffect,
    smokingEffect,
    exerciseEffect,
    alcoholEffect,
    weightEffect,
    metadata,
  };
}

export default {
  lifeExpectancy,
  lifestyleEffects,
  rhrEffect,
  smokingEffect,
  exerciseEffect,
  alcoholEffect,
  weightEffect,
  metadata,
  getAllData,
};
`;

  // index.d.ts content aligned with src/types.ts
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

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const rhrEffect: RhrEffect | null;
export declare const smokingEffect: SmokingEffect | null;
export declare const exerciseEffect: ExerciseEffect | null;
export declare const alcoholEffect: AlcoholEffect | null;
export declare const weightEffect: WeightEffect | null;
export declare const metadata: Metadata;

export declare function getAllData(): {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  rhrEffect: RhrEffect | null;
  smokingEffect: SmokingEffect | null;
  exerciseEffect: ExerciseEffect | null;
  alcoholEffect: AlcoholEffect | null;
  weightEffect: WeightEffect | null;
  metadata: Metadata;
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
  getAllData: typeof getAllData;
};

export default _default;
`;

  await fs.mkdir(latestDir, { recursive: true });
  await fs.writeFile(path.join(latestDir, "index.js"), indexJs, "utf8");
  await fs.writeFile(path.join(latestDir, "index.d.ts"), indexDts, "utf8");

  console.log("Exports generated:", path.join(latestDir, "index.js"), path.join(latestDir, "index.d.ts"));
}

generateExports().catch((err) => {
  console.error(err);
  process.exit(1);
});
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

  console.log("âœ… Generated package exports:");
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
