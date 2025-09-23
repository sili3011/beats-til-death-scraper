import { LifeRow } from '../types.js';
import { httpGetJson } from '../lib/fetcher.js';
import { log, logError, logWarning } from '../lib/log.js';

// OECD Health Database - Life expectancy at birth
// Using CSV format from OECD data portal
const OECD_URL = 'https://stats.oecd.org/restsdmx/sdmx.ashx/GetData/HEALTH_STAT/..LIFEEXP../OECD?format=compact_v2';

interface OECDResponse {
  structure: {
    dimensions: {
      observation: Array<{
        id: string;
        name: string;
        values: Array<{ id: string; name: string; }>;
      }>;
    };
  };
  dataSets: Array<{
    observations: Record<string, Array<number | null>>;
  }>;
}

// Country code mapping from OECD to ISO3
const OECD_TO_ISO3: Record<string, string> = {
  'AUS': 'AUS', 'AUT': 'AUT', 'BEL': 'BEL', 'CAN': 'CAN', 'CHL': 'CHL',
  'COL': 'COL', 'CRC': 'CRI', 'CZE': 'CZE', 'DNK': 'DNK', 'EST': 'EST',
  'FIN': 'FIN', 'FRA': 'FRA', 'DEU': 'DEU', 'GRC': 'GRC', 'HUN': 'HUN',
  'ISL': 'ISL', 'IRL': 'IRL', 'ISR': 'ISR', 'ITA': 'ITA', 'JPN': 'JPN',
  'KOR': 'KOR', 'LVA': 'LVA', 'LTU': 'LTU', 'LUX': 'LUX', 'MEX': 'MEX',
  'NLD': 'NLD', 'NZL': 'NZL', 'NOR': 'NOR', 'POL': 'POL', 'PRT': 'PRT',
  'SVK': 'SVK', 'SVN': 'SVN', 'ESP': 'ESP', 'SWE': 'SWE', 'CHE': 'CHE',
  'TUR': 'TUR', 'GBR': 'GBR', 'USA': 'USA'
};

const OECD_COUNTRY_NAMES: Record<string, string> = {
  'AUS': 'Australia', 'AUT': 'Austria', 'BEL': 'Belgium', 'CAN': 'Canada', 'CHL': 'Chile',
  'COL': 'Colombia', 'CRC': 'Costa Rica', 'CZE': 'Czech Republic', 'DNK': 'Denmark', 'EST': 'Estonia',
  'FIN': 'Finland', 'FRA': 'France', 'DEU': 'Germany', 'GRC': 'Greece', 'HUN': 'Hungary',
  'ISL': 'Iceland', 'IRL': 'Ireland', 'ISR': 'Israel', 'ITA': 'Italy', 'JPN': 'Japan',
  'KOR': 'Korea', 'LVA': 'Latvia', 'LTU': 'Lithuania', 'LUX': 'Luxembourg', 'MEX': 'Mexico',
  'NLD': 'Netherlands', 'NZL': 'New Zealand', 'NOR': 'Norway', 'POL': 'Poland', 'PRT': 'Portugal',
  'SVK': 'Slovak Republic', 'SVN': 'Slovenia', 'ESP': 'Spain', 'SWE': 'Sweden', 'CHE': 'Switzerland',
  'TUR': 'Turkey', 'GBR': 'United Kingdom', 'USA': 'United States'
};

export async function fetchOECD(): Promise<LifeRow[]> {
  try {
    log('Starting OECD Health Statistics data fetch...');
    
    // For now, return empty array as OECD API endpoints keep changing
    // The SDMX API structure is complex and endpoint URLs are unstable
    logWarning('OECD data fetching temporarily disabled - API endpoint needs verification');
    
    // TODO: Implement stable OECD data source
    // Potential alternatives:
    // 1. Use OECD.Stat website CSV downloads
    // 2. Use World Bank data which includes many OECD countries
    // 3. Wait for OECD to stabilize their SDMX endpoints
    
    log('Successfully fetched 0 OECD records (temporarily disabled)');
    return [];
    
  } catch (error) {
    logError('Failed to fetch OECD data', error);
    // Don't throw error, just return empty array to not break pipeline
    return [];
  }
}