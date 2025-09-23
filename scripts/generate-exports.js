#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Generate the main index.js and index.d.ts files for NPM package exports
 */
async function generateExports() {
  console.log('Generating NPM package exports...');
  
  const latestDir = 'data/latest';
  
  // Check if data files exist
  const lifeExpectancyFile = path.join(latestDir, 'life_expectancy.json');
  const lifestyleEffectsFile = path.join(latestDir, 'lifestyle_effects.json');
  
  const lifeExpectancyExists = await fs.access(lifeExpectancyFile).then(() => true).catch(() => false);
  const lifestyleEffectsExists = await fs.access(lifestyleEffectsFile).then(() => true).catch(() => false);
  
  if (!lifeExpectancyExists || !lifestyleEffectsExists) {
    throw new Error('Data files not found. Run data pipeline first.');
  }
  
  // Read data to get metadata
  const lifeExpectancyData = JSON.parse(await fs.readFile(lifeExpectancyFile, 'utf8'));
  const lifestyleEffectsData = JSON.parse(await fs.readFile(lifestyleEffectsFile, 'utf8'));
  
  // Read the actual data to embed it directly
  const lifeExpectancyDataStr = await fs.readFile(lifeExpectancyFile, 'utf8');
  const lifestyleEffectsDataStr = await fs.readFile(lifestyleEffectsFile, 'utf8');
  
  // Generate index.js
  const indexJs = `// Auto-generated NPM package exports for lifedata
// Generated on: ${new Date().toISOString()}

/**
 * Life expectancy data from multiple sources
 * @type {Array<import('./types.js').LifeRow>}
 */
export const lifeExpectancy = ${lifeExpectancyDataStr};

/**
 * Lifestyle effects data with conservative estimates
 * @type {import('./types.js').Effects}
 */
export const lifestyleEffects = ${lifestyleEffectsDataStr};

/**
 * Package metadata
 */
export const metadata = {
  lastUpdated: "${new Date().toISOString()}",
  lifeExpectancyRecords: ${lifeExpectancyData.length},
  sources: ["worldbank", "who", "oecd", "manual"],
  version: "${process.env.npm_package_version || '1.0.0'}"
};

/**
 * Get all data as a single object
 */
export function getAllData() {
  return {
    lifeExpectancy,
    lifestyleEffects,
    metadata
  };
}

// Default export
export default {
  lifeExpectancy,
  lifestyleEffects,
  metadata,
  getAllData
};
`;

  // Generate index.d.ts
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

export interface Effects {
  smoking: {
    current_vs_never_years?: [number, number];
    quit_gain_years_after_5?: number;
  };
  exercise: {
    mod_150min_week_gain?: number;
    high_300min_week_gain?: number;
  };
  alcohol: {
    heavy_vs_moderate_years?: number;
  };
  diet: {
    mediterranean_adherence_gain?: number;
  };
  notes?: string;
  citations: string[];
}

export interface Metadata {
  lastUpdated: string;
  lifeExpectancyRecords: number;
  sources: string[];
  version: string;
}

export declare const lifeExpectancy: LifeRow[];
export declare const lifestyleEffects: Effects;
export declare const metadata: Metadata;

export declare function getAllData(): {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  metadata: Metadata;
};

declare const _default: {
  lifeExpectancy: LifeRow[];
  lifestyleEffects: Effects;
  metadata: Metadata;
  getAllData: typeof getAllData;
};

export default _default;
`;

  // Write the files
  await fs.writeFile(path.join(latestDir, 'index.js'), indexJs);
  await fs.writeFile(path.join(latestDir, 'index.d.ts'), indexDts);
  
  console.log('✅ Generated package exports:');
  console.log(`   - ${path.join(latestDir, 'index.js')}`);
  console.log(`   - ${path.join(latestDir, 'index.d.ts')}`);
  console.log(`   - Life expectancy records: ${lifeExpectancyData.length}`);
  console.log(`   - Lifestyle effects included: ${Object.keys(lifestyleEffectsData).filter(k => k !== 'citations' && k !== 'notes').length} categories`);
}

generateExports().catch(error => {
  console.error('Failed to generate exports:', error);
  process.exit(1);
});