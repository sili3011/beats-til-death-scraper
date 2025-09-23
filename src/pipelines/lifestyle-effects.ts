import fs from 'node:fs/promises';
import path from 'node:path';
import { EffectsSchema, Effects } from '../types.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logError, logSuccess } from '../lib/log.js';

const effects: Effects = {
  smoking: { 
    current_vs_never_years: [-10, -5], 
    quit_gain_years_after_5: 2 
  },
  exercise: { 
    mod_150min_week_gain: 2, 
    high_300min_week_gain: 3 
  },
  alcohol: { 
    heavy_vs_moderate_years: -2 
  },
  diet: { 
    mediterranean_adherence_gain: 1 
  },
  citations: [
    "WHO Global Health Observatory: Tobacco and mortality (accessed 2024-09-23)",
    "CDC Physical Activity Guidelines for Americans, 2nd edition (accessed 2024-09-23)",
    "Prospective Studies Collaboration: Age-specific relevance of usual blood pressure to vascular mortality (accessed 2024-09-23)",
    "Estruch R et al. Primary Prevention of Cardiovascular Disease with a Mediterranean Diet. NEJM 2013 (accessed 2024-09-23)"
  ],
  notes: "Effect sizes are conservative estimates based on large population studies. Individual results may vary significantly. These estimates are for educational purposes only and should not be used for medical decision-making."
};

async function run() {
  try {
    console.log('Starting lifestyle effects pipeline...');
    const stamp = new Date().toISOString().slice(0, 10);
    console.log(`Using timestamp: ${stamp}`);
    const procDir = path.join('data/processed', stamp);
    console.log(`Processing directory: ${procDir}`);
    
    log('Starting lifestyle effects data pipeline...');
    
    // Create directories
    console.log('Creating directories...');
    await fs.mkdir(procDir, { recursive: true });
    console.log('Directories created');
    
    // Validate the effects data
    console.log('Validating effects data...');
    try {
      EffectsSchema.parse(effects);
      logSuccess('Lifestyle effects data validation passed');
    } catch (error) {
      logError('Lifestyle effects data validation failed', error);
      throw error;
    }
    
    // Write processed data
    console.log('Writing processed data...');
    await writeFileWithDirs(
      path.join(procDir, 'lifestyle_effects.json'),
      JSON.stringify(effects, null, 2)
    );
    console.log('Processed data written');
    
    // Copy to latest
    console.log('Creating latest directory...');
    await fs.mkdir('data/latest', { recursive: true });
    console.log('Writing to latest...');
    await writeFileWithDirs(
      'data/latest/lifestyle_effects.json',
      JSON.stringify(effects, null, 2)
    );
    console.log('Latest data written');
    
    logSuccess('Lifestyle effects pipeline completed successfully');
    
  } catch (error) {
    logError('Lifestyle effects pipeline failed', error);
    process.exit(1);
  }
}

// Run if called directly
run();