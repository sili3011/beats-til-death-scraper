import fs from 'node:fs/promises';
import path from 'node:path';
import { ExerciseEffect, ExerciseEffectSchema } from '../types.js';
import { log, logError } from '../lib/log.js';

const TIMESTAMP = process.env.TIMESTAMP || new Date().toISOString().split('T')[0]!;

/**
 * Curated exercise effect data
 * Based on WHO guidelines, CDC summaries, and meta-analyses
 */
const EXERCISE_EFFECT_DATA: ExerciseEffect = {
  none: 0,                     // No exercise = baseline
  mod_150min_week_gain: 2.5,   // Moderate exercise (150+ min/week) gains ~2.5 years
  high_300min_week_gain: 4.2,  // High exercise (300+ min/week) gains ~4.2 years
  citations: [
    "WHO Global Recommendations on Physical Activity for Health (2010)",
    "CDC Physical Activity Guidelines for Americans, 2nd edition (2018)",
    "Wen CP, et al. Minimum amount of physical activity for reduced mortality and extended life expectancy. Lancet 2011;378:1244-53 (DOI: 10.1016/S0140-6736(11)60749-6)",
    "Moore SC, et al. Leisure time physical activity of moderate to vigorous intensity and mortality: a large pooled cohort analysis. PLoS Med 2012;9:e1001335 (DOI: 10.1371/journal.pmed.1001335)",
    "Zhao M, et al. Recommended physical activity and all cause and cause specific mortality in US adults: prospective cohort study. BMJ 2020;370:m2031 (DOI: 10.1136/bmj.m2031)"
  ],
  retrieved_at: new Date().toISOString().split('T')[0]!,
  notes: "Years gained are approximate and conservative estimates from large cohort studies. Effects may vary by age, baseline fitness, and type of activity."
};

export async function runExerciseEffectPipeline(): Promise<void> {
  try {
    log('Starting exercise effects data pipeline...');
    
    // Validate the curated data
    const validatedData = ExerciseEffectSchema.parse(EXERCISE_EFFECT_DATA);
    log('✓ Exercise effects data validation passed');
    
    // Create directories
    const processedDir = path.join(process.cwd(), 'data', 'processed', TIMESTAMP);
    const latestDir = path.join(process.cwd(), 'data', 'latest');
    
    await fs.mkdir(processedDir, { recursive: true });
    await fs.mkdir(latestDir, { recursive: true });
    
    // Write processed data
    const processedPath = path.join(processedDir, 'exercise_effect.json');
    await fs.writeFile(processedPath, JSON.stringify(validatedData, null, 2));
    log(`Written: ${processedPath}`);
    
    // Write to latest
    const latestPath = path.join(latestDir, 'exercise_effect.json');
    await fs.writeFile(latestPath, JSON.stringify(validatedData, null, 2));
    log(`Written: ${latestPath}`);
    
    log('✓ Exercise effects pipeline completed successfully');
    
  } catch (error) {
    logError('Exercise effects pipeline failed', error);
    throw error;
  }
}

// Run if called directly
runExerciseEffectPipeline().catch(console.error);