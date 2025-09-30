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

  // Structured source info with links for easy attribution
  const sourceInfo = {
    datasets: {
      worldbank_life_expectancy: {
        name: 'World Bank: Life expectancy at birth (SP.DYN.LE00.IN)',
        url: 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN',
        api: 'https://api.worldbank.org/v2/country/all/indicator/SP.DYN.LE00.IN',
        license: 'World Bank Open Data',
      },
      who_life_expectancy: {
        name: 'WHO GHO: Life expectancy at birth (WHOSIS_000001)',
        url: 'https://ghoapi.azureedge.net/api/WHOSIS_000001',
        docs: 'https://ghoapi.azureedge.net',
      },
      who_alcohol_consumption: {
        name: 'WHO GHO: Total alcohol per capita consumption (SA_0000001400)',
        url: 'https://ghoapi.azureedge.net/api/SA_0000001400',
      },
      who_bmi_obesity: {
        name: 'WHO GHO: Obesity prevalence BMI >= 30 (NCD_BMI_30A)',
        url: 'https://ghoapi.azureedge.net/api/NCD_BMI_30A',
      },
      who_bmi_overweight: {
        name: 'WHO GHO: Overweight prevalence BMI >= 25 (NCD_BMI_25A)',
        url: 'https://ghoapi.azureedge.net/api/NCD_BMI_25A',
      },
      oecd_life_expectancy: {
        name: 'OECD: Life expectancy at birth',
        url: 'https://data.oecd.org/healthstat/life-expectancy-at-birth.htm',
        note: 'Direct API currently restricted; manual retrieval suggested.'
      },
      manual_life_expectancy: {
        name: 'Manual life expectancy CSV',
        url: 'data/manual/life_expectancy.csv',
      },
    },
    effects: {
      rhr: data.rhrEffect && {
        name: 'Resting heart rate meta-analyses',
        references: (data.rhrEffect.references ?? [
          { title: 'RHR and mortality meta-analysis (Heart)', url: 'https://doi.org/10.1136/heartjnl-2013-304498' },
          { title: 'RHR and mortality (Copenhagen City Heart Study)', url: 'https://doi.org/10.1136/hrt.2012.307542' },
          { title: 'RHR predictor of coronary events (Framingham)', url: 'https://doi.org/10.1016/j.amjmed.2009.12.015' },
        ])
      },
      smoking: data.smokingEffect && {
        name: 'Smoking effects meta-analyses & reports',
        references: (data.smokingEffect.references ?? [
          { title: 'WHO GHO: Tobacco and mortality', url: 'https://www.who.int/data/gho/data/themes/topics/topic-details/GHO/tobacco-use' },
          { title: 'US Surgeon General 2014: The Health Consequences of Smoking', url: 'https://www.hhs.gov/surgeongeneral/reports-and-publications/tobacco/index.html' },
          { title: "Mortality in relation to smoking: 50 years' observations (BMJ 2004)", url: 'https://doi.org/10.1136/bmj.38142.554479.AE' },
          { title: '21st-century hazards of smoking and benefits of cessation (NEJM 2013)', url: 'https://doi.org/10.1056/NEJMsa1211128' },
        ])
      },
      exercise: data.exerciseEffect && {
        name: 'Physical activity guidelines and cohort analyses',
        references: (data.exerciseEffect.references ?? [
          { title: 'WHO Global Recommendations on Physical Activity for Health (2010)', url: 'https://apps.who.int/iris/handle/10665/44399' },
          { title: 'CDC Physical Activity Guidelines for Americans, 2nd edition (2018)', url: 'https://health.gov/our-work/physical-activity/current-guidelines' },
          { title: 'Minimum amount of physical activity (Lancet 2011)', url: 'https://doi.org/10.1016/S0140-6736(11)60749-6' },
          { title: 'Leisure time physical activity and mortality (PLoS Med 2012)', url: 'https://doi.org/10.1371/journal.pmed.1001335' },
          { title: 'Recommended physical activity and mortality (BMJ 2020)', url: 'https://doi.org/10.1136/bmj.m2031' },
        ])
      },
      alcohol: data.alcoholEffect && {
        name: 'Alcohol consumption and mortality meta-analyses',
        references: (data.alcoholEffect.references ?? [
          { title: 'Alcohol dosing and total mortality (Arch Intern Med 2006)', url: 'https://doi.org/10.1001/archinte.166.22.2437' },
          { title: 'Risk thresholds for alcohol consumption (Lancet 2018)', url: 'https://doi.org/10.1016/S0140-6736(18)30134-X' },
          { title: 'Alcohol use and burden (Lancet 2018)', url: 'https://doi.org/10.1016/S0140-6736(18)31310-2' },
          { title: 'GBD 2016 Alcohol and Drug Use (Lancet Psychiatry 2018)', url: 'https://doi.org/10.1016/S2215-0366(18)30337-7' },
        ])
      },
      weight: data.weightEffect && {
        name: 'BMI and mortality meta-analyses',
        references: (data.weightEffect.references ?? [
          { title: 'BMI and all-cause mortality (Lancet 2016)', url: 'https://doi.org/10.1016/S0140-6736(16)30175-1' },
          { title: 'BMI and all cause mortality (BMJ 2016)', url: 'https://doi.org/10.1136/bmj.i2156' },
          { title: 'BMI and cause-specific mortality (Lancet 2009)', url: 'https://doi.org/10.1016/S0140-6736(09)60318-4' },
          { title: 'Years of life lost due to obesity (JAMA 2003)', url: 'https://doi.org/10.1001/jama.289.2.187' },
        ])
      },
    },
  };

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
  indexJsLines.push("export const sourceInfo = " + JSON.stringify(sourceInfo, null, 2) + ";");
  indexJsLines.push("");
  indexJsLines.push("export const metadata = {\n  lastUpdated: \"" + new Date().toISOString() + "\",\n  lifeExpectancyRecords: " + (data.lifeExpectancy?.length || 0) + ",\n  sources: [\"worldbank\", \"who\", \"oecd\", \"manual\"],\n  version: \"" + (process.env.npm_package_version || "0.0.0") + "\",\n  effectTypes: [\"rhr\", \"smoking\", \"exercise\", \"lifestyle\", \"alcohol\", \"weight\"],\n};");
  indexJsLines.push("");
  indexJsLines.push("export function getAllData() {\n  return {\n    lifeExpectancy,\n    lifestyleEffects,\n    rhrEffect,\n    smokingEffect,\n    exerciseEffect,\n    alcoholEffect,\n    weightEffect,\n    metadata,\n    sourceInfo,\n  };\n}");
  indexJsLines.push("");
  indexJsLines.push("export default {\n  lifeExpectancy,\n  lifestyleEffects,\n  rhrEffect,\n  smokingEffect,\n  exerciseEffect,\n  alcoholEffect,\n  weightEffect,\n  metadata,\n  sourceInfo,\n  getAllData,\n};");
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
  dts.push("export interface SourceRef { title: string; url: string }");
  dts.push("export interface SourceInfo {\n  datasets: Record<string, { name: string; url: string; api?: string; docs?: string; license?: string; note?: string }>;\n  effects: Record<string, { name: string; references: SourceRef[] } | null>;\n}");
  dts.push("");
  dts.push("export declare const lifeExpectancy: LifeRow[];");
  dts.push("export declare const lifestyleEffects: Effects;");
  dts.push("export declare const rhrEffect: RhrEffect | null;");
  dts.push("export declare const smokingEffect: SmokingEffect | null;");
  dts.push("export declare const exerciseEffect: ExerciseEffect | null;");
  dts.push("export declare const alcoholEffect: AlcoholEffect | null;");
  dts.push("export declare const weightEffect: WeightEffect | null;");
  dts.push("export declare const metadata: Metadata;");
  dts.push("export declare const sourceInfo: SourceInfo;");
  dts.push("");
  dts.push("export declare function getAllData(): {\n  lifeExpectancy: LifeRow[];\n  lifestyleEffects: Effects;\n  rhrEffect: RhrEffect | null;\n  smokingEffect: SmokingEffect | null;\n  exerciseEffect: ExerciseEffect | null;\n  alcoholEffect: AlcoholEffect | null;\n  weightEffect: WeightEffect | null;\n  metadata: Metadata;\n  sourceInfo: SourceInfo;\n};");
  dts.push("");
  dts.push("declare const _default: {\n  lifeExpectancy: LifeRow[];\n  lifestyleEffects: Effects;\n  rhrEffect: RhrEffect | null;\n  smokingEffect: SmokingEffect | null;\n  exerciseEffect: ExerciseEffect | null;\n  alcoholEffect: AlcoholEffect | null;\n  weightEffect: WeightEffect | null;\n  metadata: Metadata;\n  sourceInfo: SourceInfo;\n  getAllData: typeof getAllData;\n};");
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
