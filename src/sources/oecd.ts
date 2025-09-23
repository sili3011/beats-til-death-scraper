import { LifeRow } from '../types.js';
import { log, logWarning } from '../lib/log.js';

/**
 * OECD Health Statistics API
 * TODO: Implement OECD data fetching
 */
export async function fetchOECD(): Promise<LifeRow[]> {
  logWarning('OECD data fetching not yet implemented - returning empty array');
  
  // Placeholder for future implementation
  // OECD.Stat API: https://stats.oecd.org/restsdmx/sdmx.ashx/
  // Life expectancy dataset: HEALTH_STAT
  
  return [];
}

/**
 * Future implementation notes:
 * 
 * OECD Health Statistics API:
 * - Base URL: https://stats.oecd.org/restsdmx/sdmx.ashx/
 * - Dataset: HEALTH_STAT
 * - Life expectancy indicator: Usually LIFEEXP or similar
 * 
 * The OECD API uses SDMX format which requires specific parsing
 * and might need additional dependencies for XML parsing
 */