import fs from 'node:fs/promises';
import path from 'node:path';
import { LifeRow, EffectsSchema } from '../types.js';
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
 * Main validation function
 */
export async function validateAll(): Promise<void> {
  const latestDir = 'data/latest';
  const lifeFile = path.join(latestDir, 'life_expectancy.json');
  const effectsFile = path.join(latestDir, 'lifestyle_effects.json');
  
  let allValid = true;
  
  // Check if files exist
  try {
    await fs.access(lifeFile);
    allValid = allValid && await validateLifeData(lifeFile);
  } catch {
    log(`Warning: Life expectancy file not found: ${lifeFile}`);
  }
  
  try {
    await fs.access(effectsFile);
    allValid = allValid && await validateEffectsData(effectsFile);
  } catch {
    log(`Warning: Effects file not found: ${effectsFile}`);
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