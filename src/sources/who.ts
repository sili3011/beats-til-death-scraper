import { LifeRow } from '../types.js';
import { log, logWarning } from '../lib/log.js';

/**
 * WHO Global Health Observatory API
 * TODO: Implement once WHO API endpoint is confirmed
 * WHO has various endpoints but they change frequently
 */
export async function fetchWHO(): Promise<LifeRow[]> {
  logWarning('WHO data fetching not yet implemented - returning empty array');
  
  // Placeholder for future implementation
  // WHO GHO API example: https://ghoapi.azureedge.net/api/WHOSIS_000001
  // But the structure and availability varies
  
  return [];
}

/**
 * Future implementation notes:
 * 
 * WHO Global Health Observatory (GHO) API endpoints:
 * - Life expectancy at birth: WHOSIS_000001
 * - Life expectancy at 60: WHOSIS_000002
 * 
 * Example URL structure:
 * https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=Dim1%20eq%20%27BTSX%27
 * 
 * Response format varies and needs investigation for reliable parsing
 */