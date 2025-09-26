import fs from 'node:fs/promises';
import path from 'node:path';
import { SmokingEffect, SmokingEffectSchema } from '../types.js';
import { log, logError } from '../lib/log.js';

const TIMESTAMP = process.env.TIMESTAMP || new Date().toISOString().split('T')[0]!;

/**
 * Curated smoking effect data
 * Based on WHO reports, CDC data, and meta-analyses
 */
const SMOKING_EFFECT_DATA: SmokingEffect = {
  current_vs_never_years: [-10, -6], // Range: 6-10 years lost for current vs never smokers
  quit_gain_years_after_5: 3,        // Years gained if quit for 5+ years
  quit_gain_years_after_10: 5,       // Years gained if quit for 10+ years
  citations: [
    "WHO Global Health Observatory: Tobacco and mortality data (accessed 2025-09-26)",
    "US Surgeon General Report: The Health Consequences of Smoking—50 Years of Progress (2014)",
    "Doll R, et al. Mortality in relation to smoking: 50 years' observations on male British doctors. BMJ 2004;328:1519 (DOI: 10.1136/bmj.38142.554479.AE)",
    "Jha P, et al. 21st-century hazards of smoking and benefits of cessation in the United States. N Engl J Med 2013;368:341-350 (DOI: 10.1056/NEJMsa1211128)"
  ],
  retrieved_at: new Date().toISOString().split('T')[0]!,
  notes: "Effect sizes are conservative averages based on large cohort studies and meta-analyses. Years lost/gained vary by age of initiation, intensity, and cessation age."
};

export async function runSmokingEffectPipeline(): Promise<void> {
  try {
    log('Starting smoking effects data pipeline...');
    
    // Validate the curated data
    const validatedData = SmokingEffectSchema.parse(SMOKING_EFFECT_DATA);
    log('✓ Smoking effects data validation passed');
    
    // Create directories
    const processedDir = path.join(process.cwd(), 'data', 'processed', TIMESTAMP);
    const latestDir = path.join(process.cwd(), 'data', 'latest');
    
    await fs.mkdir(processedDir, { recursive: true });
    await fs.mkdir(latestDir, { recursive: true });
    
    // Write processed data
    const processedPath = path.join(processedDir, 'smoking_effect.json');
    await fs.writeFile(processedPath, JSON.stringify(validatedData, null, 2));
    log(`Written: ${processedPath}`);
    
    // Write to latest
    const latestPath = path.join(latestDir, 'smoking_effect.json');
    await fs.writeFile(latestPath, JSON.stringify(validatedData, null, 2));
    log(`Written: ${latestPath}`);
    
    log('✓ Smoking effects pipeline completed successfully');
    
  } catch (error) {
    logError('Smoking effects pipeline failed', error);
    throw error;
  }
}

// Run if called directly
runSmokingEffectPipeline().catch(console.error);