import { LifeRow } from '../types.js';
import { httpGetJson } from '../lib/fetcher.js';
import { log, logError, logWarning } from '../lib/log.js';

// OECD Health Database - Life expectancy at birth
// Using CSV download from OECD Data Explorer as API access is restricted
const OECD_CSV_URL = 'https://data.oecd.org/chart/7P6k';

// Updated interface for OECD SDMX JSON response format
interface OECDResponse {
  data: {
    dataSets: Array<{
      series: Record<string, {
        observations: Record<string, Array<number | null>>;
      }>;
    }>;
    structure: {
      dimensions: {
        series: Array<{
          id: string;
          name: string;
          values: Array<{ id: string; name: string; }>;
        }>;
        observation: Array<{
          id: string;
          name: string;
          values: Array<{ id: string; name: string; }>;
        }>;
      };
    };
  };
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

    // OECD API access is currently restricted (HTTP 403)
    // The official API endpoints require authentication or are behind rate limits
    logWarning('OECD data fetching disabled - API access restricted (HTTP 403)');
    log('Note: OECD data can be obtained manually from https://data.oecd.org/healthstat/life-expectancy-at-birth.htm');
    log('Consider using World Bank data which includes many OECD countries with reliable API access');

    // Future implementation options:
    // 1. Manual CSV download and import
    // 2. Authenticated API access if credentials are provided
    // 3. Alternative data source with OECD country coverage

    log('Successfully fetched 0 OECD records (API access restricted)');
    return [];

  } catch (error) {
    logError('Failed to fetch OECD data', error);
    return [];
  }
}