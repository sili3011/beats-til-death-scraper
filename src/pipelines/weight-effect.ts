import fs from 'node:fs/promises';
import path from 'node:path';
import { WeightEffectSchema } from '../types.js';
import { writeFileWithDirs } from '../lib/files.js';
import { log, logSuccess } from '../lib/log.js';

async function run() {
  try {
    const timestamp = new Date().toISOString().slice(0, 10);
    const procDir = path.join('data', 'processed', timestamp);

    log('Starting weight/BMI effects data pipeline...');

    // Create directories
    await fs.mkdir(procDir, { recursive: true });

    // Curated BMI/weight effect data based on research
    const weightEffectData = {
      normal_bmi: [18.5, 24.9] as [number, number], // Normal BMI range
      overweight_years_lost: -1.3, // Years lost from being overweight (BMI 25-29.9)
      obese_years_lost: -3.1, // Years lost from obesity (BMI 30-34.9)
      severely_obese_years_lost: -8.0, // Years lost from severe obesity (BMI ≥35)
      citations: [
        'Global BMI Mortality Collaboration. Body-mass index and all-cause mortality: individual-participant-data meta-analysis of 239 prospective studies in four continents. Lancet. 2016;388(10046):776-86.',
        'Aune D, et al. BMI and all cause mortality: systematic review and non-linear dose-response meta-analysis of 230 cohort studies with 3.74 million deaths among 30.3 million participants. BMJ. 2016;353:i2156.',
        'Di Angelantonio E, et al. Body-mass index and all-cause mortality: individual-participant-data meta-analysis of 239 prospective studies in four continents. Lancet. 2016;388(10046):776-86.',
        'Whitlock G, et al. Body-mass index and cause-specific mortality in 900 000 adults: collaborative analyses of 57 prospective studies. Lancet. 2009;373(9669):1083-96.',
        'Fontaine KR, et al. Years of life lost due to obesity. JAMA. 2003;289(2):187-93.'
      ],
      retrieved_at: new Date().toISOString(),
      notes: 'Conservative estimates based on large-scale meta-analyses and prospective cohort studies. Effects represent average population-level associations and may vary significantly based on individual factors including age, sex, genetics, body composition, fitness level, and comorbidities. The relationship between BMI and mortality follows a J-shaped curve, with both underweight and obesity associated with increased mortality. For educational purposes only.'
    };

    // Validate the data
    const validatedData = WeightEffectSchema.parse(weightEffectData);
    log('✓ Weight effects data validation passed');

    // Write processed data
    const processedPath = path.join(procDir, 'weight_effect.json');
    await writeFileWithDirs(processedPath, JSON.stringify(validatedData, null, 2));

    // Copy to latest
    await fs.mkdir('data/latest', { recursive: true });
    const latestPath = path.join('data/latest/weight_effect.json');
    await writeFileWithDirs(latestPath, JSON.stringify(validatedData, null, 2));

    logSuccess('✓ Weight effects pipeline completed successfully');

  } catch (error) {
    console.error('Weight effects pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
run();

export { run as runWeightEffectPipeline };