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

  // index.js content built without template literals (robust to embedded chars)
  const indexJsLines = [];
  indexJsLines.push("// Auto-generated NPM package exports for lifedata");
  indexJsLines.push("// Generated on: " + new Date().toISOString());
  indexJsLines.push("");
  indexJsLines.push("export const lifeExpectancy = " + dataStrings.lifeExpectancy + ";");
  indexJsLines.push("export const lifestyleEffects = " + dataStrings.lifestyleEffects + ";");
  indexJsLines.push("export const rhrEffect = " + dataStrings.rhrEffect + ";");
  indexJsLines.push("export const smokingEffect = " + dataStrings.smokingEffect + ";");
  indexJsLines.push("export const exerciseEffect = " + dataStrings.exerciseEffect + ";");
  indexJsLines.push("export const alcoholEffect = " + dataStrings.alcoholEffect + ";");
  indexJsLines.push("export const weightEffect = " + dataStrings.weightEffect + ";");
  indexJsLines.push("");
  indexJsLines.push("export const metadata = {\n  lastUpdated: \"" + new Date().toISOString() + "\",\n  lifeExpectancyRecords: " + (data.lifeExpectancy?.length || 0) + ",\n  sources: [\"worldbank\", \"who\", \"oecd\", \"manual\"],\n  version: \"" + (process.env.npm_package_version || "0.0.0") + "\",\n  effectTypes: [\"rhr\", \"smoking\", \"exercise\", \"lifestyle\", \"alcohol\", \"weight\"],\n};");
  indexJsLines.push("");
  indexJsLines.push("export function getAllData() {\n  return {\n    lifeExpectancy,\n    lifestyleEffects,\n    rhrEffect,\n    smokingEffect,\n    exerciseEffect,\n    alcoholEffect,\n    weightEffect,\n    metadata,\n  };\n}");
  indexJsLines.push("");
  indexJsLines.push("export default {\n  lifeExpectancy,\n  lifestyleEffects,\n  rhrEffect,\n  smokingEffect,\n  exerciseEffect,\n  alcoholEffect,\n  weightEffect,\n  metadata,\n  getAllData,\n};");
  const indexJs = indexJsLines.join("\n");

  // index.d.ts content aligned with src/types.ts (no template literals)
  const dts = [];
  dts.push("// Auto-generated TypeScript definitions for lifedata");
  dts.push("// Generated on: " + new Date().toISOString());
  dts.push("");
  dts.push("export interface LifeRow {\n  country_code: string;\n  country_name: string;\n  year: number;\n  life_expectancy: number;\n  source: string;\n  retrieved_at: string;\n}");
  dts.push("");
  dts.push("export interface RhrEffect {\n  neutral_bpm: number;\n  hr_per_10bpm: { low: number; mid: number; high: number };\n  bands: Array<{ min: number; max: number; rr_allcause: number }>;\n  citations: string[];\n  retrieved_at: string;\n  notes: string;\n}");
  dts.push("");
  dts.push("export interface SmokingEffect {\n  current_vs_never_years: [number, number];\n  quit_gain_years_after_5: number;\n  quit_gain_years_after_10: number;\n  citations: string[];\n  retrieved_at: string;\n  notes: string;\n}");
  dts.push("");
  dts.push("export interface ExerciseEffect {\n  none: number;\n  mod_150min_week_gain: number;\n  high_300min_week_gain: number;\n  citations: string[];\n  retrieved_at: string;\n  notes: string;\n}");
  dts.push("");
  dts.push("export interface AlcoholEffect {\n  none: number;\n  light_years_gain: number;\n  light_consumption_range: [number, number];\n  moderate_years_gain: number;\n  moderate_consumption_range: [number, number];\n  heavy_vs_moderate_years: number;\n  heavy_consumption_threshold: number;\n  citations: string[];\n  retrieved_at: string;\n  notes: string;\n}");
  dts.push("");
  dts.push("export interface WeightEffect {\n  normal_bmi: [number, number];\n  overweight_years_lost: number;\n  obese_years_lost: number;\n  severely_obese_years_lost: number;\n  citations: string[];\n  retrieved_at: string;\n  notes: string;\n}");
  dts.push("");
  dts.push("export interface Effects {\n  smoking: { current_vs_never_years?: [number, number]; quit_gain_years_after_5?: number };\n  exercise: { mod_150min_week_gain?: number; high_300min_week_gain?: number };\n  alcohol: { heavy_vs_moderate_years?: number };\n  diet: { mediterranean_adherence_gain?: number };\n  notes?: string;\n  citations: string[];\n}");
  dts.push("");
  dts.push("export interface Metadata {\n  lastUpdated: string;\n  lifeExpectancyRecords: number;\n  sources: string[];\n  version: string;\n  effectTypes: string[];\n}");
  dts.push("");
  dts.push("export declare const lifeExpectancy: LifeRow[];");
  dts.push("export declare const lifestyleEffects: Effects;");
  dts.push("export declare const rhrEffect: RhrEffect | null;");
  dts.push("export declare const smokingEffect: SmokingEffect | null;");
  dts.push("export declare const exerciseEffect: ExerciseEffect | null;");
  dts.push("export declare const alcoholEffect: AlcoholEffect | null;");
  dts.push("export declare const weightEffect: WeightEffect | null;");
  dts.push("export declare const metadata: Metadata;");
  dts.push("");
  dts.push("export declare function getAllData(): {\n  lifeExpectancy: LifeRow[];\n  lifestyleEffects: Effects;\n  rhrEffect: RhrEffect | null;\n  smokingEffect: SmokingEffect | null;\n  exerciseEffect: ExerciseEffect | null;\n  alcoholEffect: AlcoholEffect | null;\n  weightEffect: WeightEffect | null;\n  metadata: Metadata;\n};");
  dts.push("");
  dts.push("declare const _default: {\n  lifeExpectancy: LifeRow[];\n  lifestyleEffects: Effects;\n  rhrEffect: RhrEffect | null;\n  smokingEffect: SmokingEffect | null;\n  exerciseEffect: ExerciseEffect | null;\n  alcoholEffect: AlcoholEffect | null;\n  weightEffect: WeightEffect | null;\n  metadata: Metadata;\n  getAllData: typeof getAllData;\n};");
  dts.push("");
  dts.push("export default _default;");
  const indexDts = dts.join("\n");

  await fs.mkdir(latestDir, { recursive: true });
  await fs.writeFile(path.join(latestDir, "index.js"), indexJs, "utf8");
  await fs.writeFile(path.join(latestDir, "index.d.ts"), indexDts, "utf8");

  console.log("Exports generated:", path.join(latestDir, "index.js"), path.join(latestDir, "index.d.ts"));
}

generateExports().catch((err) => {
  console.error(err);
  process.exit(1);
});
