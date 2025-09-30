import fs from 'node:fs/promises';
import path from 'node:path';
import { AlcoholEffectSchema } from '../types.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logSuccess } from '../lib/log.js';

async function run() {
  try {
    const timestamp = new Date().toISOString().slice(0, 10);
    const procDir = path.join('data', 'processed', timestamp);

    log('Starting alcohol effects data pipeline...');

    // Create directories
    await fs.mkdir(procDir, { recursive: true });

    // Curated alcohol consumption effect data based on research
    const alcoholEffectData = {
      none: 0, // Baseline - no consumption
      light_years_gain: 0.5, // Light consumption may have slight cardiovascular benefits
      light_consumption_range: [0.1, 1.0] as [number, number], // 0.1-1.0 liters per year
      moderate_years_gain: 0, // Moderate consumption - neutral to slightly negative
      moderate_consumption_range: [1.0, 2.0] as [number, number], // 1.0-2.0 liters per year
      heavy_vs_moderate_years: -5.5, // Heavy drinking reduces life expectancy significantly
      heavy_consumption_threshold: 3.0, // > 3.0 liters per year considered heavy
      citations: [
        'Di Castelnuovo A, et al. Alcohol dosing and total mortality in men and women: an updated meta-analysis of 34 prospective studies. Arch Intern Med. 2006;166(22):2437-45.',
        'Wood AM, et al. Risk thresholds for alcohol consumption: combined analysis of individual-participant data for 599 912 current drinkers in 83 prospective studies. Lancet. 2018;391(10129):1513-1523.',
        'Griswold MG, et al. Alcohol use and burden for 195 countries and territories, 1990–2016: a systematic analysis for the Global Burden of Disease Study 2016. Lancet. 2018;392(10152):1015-1035.',
        'GBD 2016 Alcohol and Drug Use Collaborators. The global burden of disease attributable to alcohol and drug use in 195 countries and territories, 1990–2016. Lancet Psychiatry. 2018;5(12):987-1012.'
      ],
      retrieved_at: new Date().toISOString(),
      notes: 'Conservative estimates based on meta-analyses of prospective studies. Light consumption benefits are controversial and may not apply to all populations. Heavy drinking (>3L pure alcohol/year) significantly reduces life expectancy. Effects vary by individual factors including genetics, age, sex, and overall health status. For educational purposes only.'
    };

    // Validate the data
    const validatedData = AlcoholEffectSchema.parse(alcoholEffectData);
    logSuccess('Alcohol effects data validation passed');

    // Write processed data
    const processedPath = path.join(procDir, 'alcohol_effect.json');
    await writeFileWithDirs(processedPath, JSON.stringify(validatedData, null, 2));

    // Copy to latest
    await fs.mkdir('data/latest', { recursive: true });
    const latestPath = path.join('data/latest/alcohol_effect.json');
    await writeFileWithDirs(latestPath, JSON.stringify(validatedData, null, 2));

    logSuccess('Alcohol effects pipeline completed successfully');

  } catch (error) {
    console.error('Alcohol effects pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
run();

export { run as runAlcoholEffectPipeline };
