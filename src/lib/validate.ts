import fs from 'node:fs/promises';
import path from 'node:path';
import { LifeRow, EffectsSchema, RhrEffectSchema, SmokingEffectSchema, ExerciseEffectSchema, AlcoholRow, BMIRow, AlcoholEffectSchema, WeightEffectSchema } from '../types.js';
import { log } from './log.js';

/**
 * Validate life expectancy data
 */
export async function validateLifeData(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }
    
    let validCount = 0;
    const errors: string[] = [];
    
    for (const [index, row] of data.entries()) {
      try {
        LifeRow.parse(row);
        validCount++;
      } catch (error) {
        errors.push(`Row ${index}: ${error}`);
        if (errors.length > 10) break; // Limit error output
      }
    }
    
    log(`Validated ${validCount}/${data.length} life expectancy rows`);
    
    if (errors.length > 0) {
      log(`Validation errors (showing first 10):`);
      errors.forEach(err => log(`  ${err}`));
      return false;
    }
    
    return true;
  } catch (error) {
    log(`Validation failed: ${error}`);
    return false;
  }
}

/**
 * Validate lifestyle effects data
 */
export async function validateEffectsData(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    EffectsSchema.parse(data);
    log('Lifestyle effects data validation passed');
    return true;
  } catch (error) {
    log(`Effects validation failed: ${error}`);
    return false;
  }
}

/**
 * Validate alcohol consumption data
 */
export async function validateAlcoholData(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    let validCount = 0;
    const errors: string[] = [];

    for (const [index, row] of data.entries()) {
      try {
        AlcoholRow.parse(row);
        validCount++;
      } catch (error) {
        errors.push(`Row ${index}: ${error}`);
        if (errors.length > 10) break; // Limit error output
      }
    }

    log(`Validated ${validCount}/${data.length} alcohol consumption rows`);

    if (errors.length > 0) {
      log(`Validation errors (showing first 10):`);
      errors.forEach(err => log(`  ${err}`));
      return false;
    }

    return true;
  } catch (error) {
    log(`Alcohol validation failed: ${error}`);
    return false;
  }
}

/**
 * Validate BMI/obesity data
 */
export async function validateBMIData(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      throw new Error('Data must be an array');
    }

    let validCount = 0;
    const errors: string[] = [];

    for (const [index, row] of data.entries()) {
      try {
        BMIRow.parse(row);
        validCount++;
      } catch (error) {
        errors.push(`Row ${index}: ${error}`);
        if (errors.length > 10) break; // Limit error output
      }
    }

    log(`Validated ${validCount}/${data.length} BMI/obesity rows`);

    if (errors.length > 0) {
      log(`Validation errors (showing first 10):`);
      errors.forEach(err => log(`  ${err}`));
      return false;
    }

    return true;
  } catch (error) {
    log(`BMI validation failed: ${error}`);
    return false;
  }
}

/**
 * Validate individual effect data files
 */
export async function validateEffectFile(filePath: string, schema: any, name: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content);
    
    schema.parse(data);
    log(`${name} data validation passed`);
    return true;
  } catch (error) {
    log(`${name} validation failed: ${error}`);
    return false;
  }
}

/**
 * Main validation function
 */
export async function validateAll(): Promise<void> {
  const latestDir = 'data/latest';
  const files = [
    { path: path.join(latestDir, 'life_expectancy.json'), validator: validateLifeData, name: 'Life expectancy' },
    { path: path.join(latestDir, 'lifestyle_effects.json'), validator: validateEffectsData, name: 'Lifestyle effects' },
    { path: path.join(latestDir, 'rhr_effect.json'), validator: (p: string) => validateEffectFile(p, RhrEffectSchema, 'RHR effect'), name: 'RHR effect' },
    { path: path.join(latestDir, 'smoking_effect.json'), validator: (p: string) => validateEffectFile(p, SmokingEffectSchema, 'Smoking effect'), name: 'Smoking effect' },
    { path: path.join(latestDir, 'exercise_effect.json'), validator: (p: string) => validateEffectFile(p, ExerciseEffectSchema, 'Exercise effect'), name: 'Exercise effect' },
    { path: path.join(latestDir, 'alcohol_effect.json'), validator: (p: string) => validateEffectFile(p, AlcoholEffectSchema, 'Alcohol effect'), name: 'Alcohol effect' },
    { path: path.join(latestDir, 'weight_effect.json'), validator: (p: string) => validateEffectFile(p, WeightEffectSchema, 'Weight effect'), name: 'Weight effect' },
    { path: path.join(latestDir, 'alcohol_consumption.json'), validator: validateAlcoholData, name: 'Alcohol consumption' },
    { path: path.join(latestDir, 'bmi_obesity.json'), validator: validateBMIData, name: 'BMI/obesity' }
  ];
  
  let allValid = true;
  
  for (const file of files) {
    try {
      await fs.access(file.path);
      allValid = allValid && await file.validator(file.path);
    } catch {
      log(`Warning: ${file.name} file not found: ${file.path}`);
    }
  }
  
  if (!allValid) {
    throw new Error('Validation failed');
  }
  
  log('All validations passed');
}

// CLI runner
validateAll().catch(error => {
  console.error(error);
  process.exit(1);
});