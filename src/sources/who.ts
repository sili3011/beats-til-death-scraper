import { LifeRow, AlcoholRow, BMIRow } from '../types.js';
import { httpGetJson } from '../lib/fetcher.js';
import { log, logError, logWarning } from '../lib/log.js';

// WHO Global Health Observatory API URLs
// Life expectancy at birth (both sexes) - indicator WHOSIS_000001
const WHO_LIFE_EXPECTANCY_URL = 'https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=Dim1%20eq%20%27SEX_BTSX%27';
// Total alcohol per capita consumption (15+) - recorded alcohol consumption
const WHO_ALCOHOL_URL = 'https://ghoapi.azureedge.net/api/SA_0000001400';
// Prevalence of obesity among adults, BMI >= 30 (age-standardized estimate)
const WHO_OBESITY_URL = 'https://ghoapi.azureedge.net/api/NCD_BMI_30A';
// Optional: Overweight prevalence BMI >= 25
const WHO_OVERWEIGHT_URL = 'https://ghoapi.azureedge.net/api/NCD_BMI_25A';
// Drug/substance-related mortality indicator (configurable via env)
function drugUseMortalityUrl(): string {
  const fallback = 'MORT_DRUGUSE';
  const code = (process.env.WHO_DRUGUSE_INDICATOR || process.env.WHO_CANNABIS_INDICATOR || fallback).trim();
  return `https://ghoapi.azureedge.net/api/${code}`;
}

interface WHOResponse {
  value: Array<{
    Id: number;
    IndicatorCode: string;
    SpatialDimType: string;
    SpatialDim: string;
    TimeDimType: string;
    TimeDim: number;
    Dim1Type: string;
    Dim1: string;
    Dim2Type: string | null;
    Dim2: string | null;
    Dim3Type: string | null;
    Dim3: string | null;
    DataSourceDimType: string;
    DataSourceDim: string;
    Value: string | null;
    NumericValue: number | null;
    Low: number | null;
    High: number | null;
    Comments: string | null;
    Date: string;
    TimeDimensionValue: string;
    TimeDimensionBegin: string;
    TimeDimensionEnd: string;
    DisplayValue: string;
    DisplayValueNumeric: number | null;
    ParentLocationCode: string;
    ParentLocation: string;
    Language: string;
  }>;
}

// WHO country codes to ISO3 mapping (subset of most common ones)
const WHO_TO_ISO3: Record<string, string> = {
  'AFG': 'AFG', 'ALB': 'ALB', 'DZA': 'DZA', 'AND': 'AND', 'AGO': 'AGO',
  'ATG': 'ATG', 'ARG': 'ARG', 'ARM': 'ARM', 'AUS': 'AUS', 'AUT': 'AUT',
  'AZE': 'AZE', 'BHS': 'BHS', 'BHR': 'BHR', 'BGD': 'BGD', 'BRB': 'BRB',
  'BLR': 'BLR', 'BEL': 'BEL', 'BLZ': 'BLZ', 'BEN': 'BEN', 'BTN': 'BTN',
  'BOL': 'BOL', 'BIH': 'BIH', 'BWA': 'BWA', 'BRA': 'BRA', 'BRN': 'BRN',
  'BGR': 'BGR', 'BFA': 'BFA', 'BDI': 'BDI', 'CPV': 'CPV', 'KHM': 'KHM',
  'CMR': 'CMR', 'CAN': 'CAN', 'CAF': 'CAF', 'TCD': 'TCD', 'CHL': 'CHL',
  'CHN': 'CHN', 'COL': 'COL', 'COM': 'COM', 'COG': 'COG', 'COD': 'COD',
  'CRI': 'CRI', 'CIV': 'CIV', 'HRV': 'HRV', 'CUB': 'CUB', 'CYP': 'CYP',
  'CZE': 'CZE', 'DNK': 'DNK', 'DJI': 'DJI', 'DMA': 'DMA', 'DOM': 'DOM',
  'ECU': 'ECU', 'EGY': 'EGY', 'SLV': 'SLV', 'GNQ': 'GNQ', 'ERI': 'ERI',
  'EST': 'EST', 'SWZ': 'SWZ', 'ETH': 'ETH', 'FJI': 'FJI', 'FIN': 'FIN',
  'FRA': 'FRA', 'GAB': 'GAB', 'GMB': 'GMB', 'GEO': 'GEO', 'DEU': 'DEU',
  'GHA': 'GHA', 'GRC': 'GRC', 'GRD': 'GRD', 'GTM': 'GTM', 'GIN': 'GIN',
  'GNB': 'GNB', 'GUY': 'GUY', 'HTI': 'HTI', 'HND': 'HND', 'HUN': 'HUN',
  'ISL': 'ISL', 'IND': 'IND', 'IDN': 'IDN', 'IRN': 'IRN', 'IRQ': 'IRQ',
  'IRL': 'IRL', 'ISR': 'ISR', 'ITA': 'ITA', 'JAM': 'JAM', 'JPN': 'JPN',
  'JOR': 'JOR', 'KAZ': 'KAZ', 'KEN': 'KEN', 'KIR': 'KIR', 'PRK': 'PRK',
  'KOR': 'KOR', 'KWT': 'KWT', 'KGZ': 'KGZ', 'LAO': 'LAO', 'LVA': 'LVA',
  'LBN': 'LBN', 'LSO': 'LSO', 'LBR': 'LBR', 'LBY': 'LBY', 'LTU': 'LTU',
  'LUX': 'LUX', 'MDG': 'MDG', 'MWI': 'MWI', 'MYS': 'MYS', 'MDV': 'MDV',
  'MLI': 'MLI', 'MLT': 'MLT', 'MHL': 'MHL', 'MRT': 'MRT', 'MUS': 'MUS',
  'MEX': 'MEX', 'FSM': 'FSM', 'MDA': 'MDA', 'MCO': 'MCO', 'MNG': 'MNG',
  'MNE': 'MNE', 'MAR': 'MAR', 'MOZ': 'MOZ', 'MMR': 'MMR', 'NAM': 'NAM',
  'NRU': 'NRU', 'NPL': 'NPL', 'NLD': 'NLD', 'NZL': 'NZL', 'NIC': 'NIC',
  'NER': 'NER', 'NGA': 'NGA', 'MKD': 'MKD', 'NOR': 'NOR', 'OMN': 'OMN',
  'PAK': 'PAK', 'PLW': 'PLW', 'PAN': 'PAN', 'PNG': 'PNG', 'PRY': 'PRY',
  'PER': 'PER', 'PHL': 'PHL', 'POL': 'POL', 'PRT': 'PRT', 'QAT': 'QAT',
  'ROU': 'ROU', 'RUS': 'RUS', 'RWA': 'RWA', 'KNA': 'KNA', 'LCA': 'LCA',
  'VCT': 'VCT', 'WSM': 'WSM', 'SMR': 'SMR', 'STP': 'STP', 'SAU': 'SAU',
  'SEN': 'SEN', 'SRB': 'SRB', 'SYC': 'SYC', 'SLE': 'SLE', 'SGP': 'SGP',
  'SVK': 'SVK', 'SVN': 'SVN', 'SLB': 'SLB', 'SOM': 'SOM', 'ZAF': 'ZAF',
  'SSD': 'SSD', 'ESP': 'ESP', 'LKA': 'LKA', 'SDN': 'SDN', 'SUR': 'SUR',
  'SWE': 'SWE', 'CHE': 'CHE', 'SYR': 'SYR', 'TWN': 'TWN', 'TJK': 'TJK',
  'TZA': 'TZA', 'THA': 'THA', 'TLS': 'TLS', 'TGO': 'TGO', 'TON': 'TON',
  'TTO': 'TTO', 'TUN': 'TUN', 'TUR': 'TUR', 'TKM': 'TKM', 'TUV': 'TUV',
  'UGA': 'UGA', 'UKR': 'UKR', 'ARE': 'ARE', 'GBR': 'GBR', 'USA': 'USA',
  'URY': 'URY', 'UZB': 'UZB', 'VUT': 'VUT', 'VEN': 'VEN', 'VNM': 'VNM',
  'YEM': 'YEM', 'ZMB': 'ZMB', 'ZWE': 'ZWE'
};

export async function fetchWHOLifeExpectancy(): Promise<LifeRow[]> {
  const out: LifeRow[] = [];

  try {
    log('Starting WHO Global Health Observatory life expectancy data fetch...');

    const response = await httpGetJson(WHO_LIFE_EXPECTANCY_URL);
    if (response.status === 304) {
      log('WHO life expectancy data not modified');
      return [];
    }
    
    const data = response.json as WHOResponse;
    
    if (!data.value || !Array.isArray(data.value)) {
      logWarning('No WHO data values found');
      return [];
    }
    
    for (const record of data.value) {
      try {
        // Skip records without numeric values
        if (!record.NumericValue || record.NumericValue <= 0) continue;
        
        // Validate spatial dimension (country code)
        const countryCode = record.SpatialDim;
        if (!countryCode || countryCode.length !== 3) continue;
        
        const iso3Code = WHO_TO_ISO3[countryCode];
        if (!iso3Code) {
          // Skip unknown country codes silently to avoid spam
          continue;
        }
        
        // Validate year
        const year = record.TimeDim;
        if (!year || year < 1950 || year > 2100) continue;
        
        // Validate life expectancy value
        const lifeExpectancy = record.NumericValue;
        if (lifeExpectancy < 0 || lifeExpectancy > 120) continue;
        
        // Use ParentLocation as country name if available, fallback to SpatialDim
        const countryName = record.ParentLocation && record.ParentLocation !== 'null' 
          ? record.ParentLocation 
          : countryCode;
        
        out.push({
          country_code: iso3Code,
          country_name: countryName,
          year,
          life_expectancy: lifeExpectancy,
          source: 'who',
          retrieved_at: new Date().toISOString()
        });
        
      } catch (error) {
        logError(`Failed to process WHO record: ${JSON.stringify(record)}`, error);
      }
    }
    
    log(`Successfully fetched ${out.length} WHO life expectancy records`);
    return out;

  } catch (error) {
    logError('Failed to fetch WHO life expectancy data', error);
    throw error;
  }
}

export async function fetchWHOAlcoholConsumption(): Promise<AlcoholRow[]> {
  const out: AlcoholRow[] = [];

  try {
    log('Starting WHO alcohol consumption data fetch...');

    const response = await httpGetJson(WHO_ALCOHOL_URL);
    if (response.status === 304) {
      log('WHO alcohol data not modified');
      return [];
    }

    const data = response.json as WHOResponse;

    if (!data.value || !Array.isArray(data.value)) {
      logWarning('No WHO alcohol consumption data values found');
      return [];
    }

    for (const record of data.value) {
      try {
        // Skip records without numeric values
        if (!record.NumericValue || record.NumericValue < 0) continue;

        // Validate spatial dimension (country code)
        const countryCode = record.SpatialDim;
        if (!countryCode || countryCode.length !== 3) continue;

        const iso3Code = WHO_TO_ISO3[countryCode];
        if (!iso3Code) {
          // Skip unknown country codes silently
          continue;
        }

        // Validate year
        const year = record.TimeDim;
        if (!year || year < 1950 || year > 2100) continue;

        // Validate alcohol consumption value (liters of pure alcohol per capita)
        const alcoholConsumption = record.NumericValue;
        if (alcoholConsumption < 0 || alcoholConsumption > 50) continue; // reasonable bounds

        // Use ParentLocation as country name if available
        const countryName = record.ParentLocation && record.ParentLocation !== 'null'
          ? record.ParentLocation
          : countryCode;

        out.push({
          country_code: iso3Code,
          country_name: countryName,
          year,
          alcohol_consumption: alcoholConsumption,
          source: 'who',
          retrieved_at: new Date().toISOString()
        });

      } catch (error) {
        logError(`Failed to process WHO alcohol record: ${JSON.stringify(record)}`, error);
      }
    }

    log(`Successfully fetched ${out.length} WHO alcohol consumption records`);
    return out;

  } catch (error) {
    logError('Failed to fetch WHO alcohol consumption data', error);
    return [];
  }
}

async function fetchWHOBMIData(url: string, dataType: 'obesity' | 'overweight'): Promise<Map<string, number>> {
  const dataMap = new Map<string, number>();

  try {
    log(`Fetching WHO ${dataType} data...`);

    const response = await httpGetJson(url);
    if (response.status === 304) {
      log(`WHO ${dataType} data not modified`);
      return dataMap;
    }

    const data = response.json as WHOResponse;

    if (!data.value || !Array.isArray(data.value)) {
      logWarning(`No WHO ${dataType} data values found`);
      return dataMap;
    }

    for (const record of data.value) {
      try {
        // Skip records without numeric values
        if (!record.NumericValue || record.NumericValue < 0) continue;

        // Validate spatial dimension (country code)
        const countryCode = record.SpatialDim;
        if (!countryCode || countryCode.length !== 3) continue;

        const iso3Code = WHO_TO_ISO3[countryCode];
        if (!iso3Code) continue;

        // Validate year
        const year = record.TimeDim;
        if (!year || year < 1950 || year > 2100) continue;

        // Validate prevalence percentage (0-100%)
        const prevalence = record.NumericValue;
        if (prevalence < 0 || prevalence > 100) continue;

        // Create unique key for country-year combination
        const key = `${iso3Code}-${year}`;
        dataMap.set(key, prevalence);

      } catch (error) {
        // Skip invalid records silently
      }
    }

    log(`Successfully processed ${dataMap.size} WHO ${dataType} records`);
    return dataMap;

  } catch (error) {
    logError(`Failed to fetch WHO ${dataType} data`, error);
    return dataMap;
  }
}

function getCountryName(countryCode: string): string {
  // Simple country code to name mapping for common countries
  const countryNames: Record<string, string> = {
    'USA': 'United States',
    'GBR': 'United Kingdom',
    'CAN': 'Canada',
    'AUS': 'Australia',
    'FRA': 'France',
    'DEU': 'Germany',
    'JPN': 'Japan',
    'CHN': 'China',
    'IND': 'India',
    'BRA': 'Brazil',
    'RUS': 'Russia',
    'ITA': 'Italy',
    'ESP': 'Spain',
    'MEX': 'Mexico'
  };

  return countryNames[countryCode] || countryCode;
}

export async function fetchWHOBMI(): Promise<BMIRow[]> {
  const out: BMIRow[] = [];

  try {
    log('Starting WHO BMI/obesity data fetch...');

    // Fetch both obesity and overweight data
    const [obesityData, overweightData] = await Promise.all([
      fetchWHOBMIData(WHO_OBESITY_URL, 'obesity'),
      fetchWHOBMIData(WHO_OVERWEIGHT_URL, 'overweight')
    ]);

    // Combine the data - use obesity data as the primary source
    const processedKeys = new Set<string>();

    for (const [key, obesityPrevalence] of obesityData) {
      const [countryCode, yearStr] = key.split('-');
      const year = parseInt(yearStr);

      // Get corresponding overweight data if available
      const overweightPrevalence = overweightData.get(key);

      // Get country name
      const countryName = getCountryName(countryCode);

      out.push({
        country_code: countryCode,
        country_name: countryName,
        year,
        obesity_prevalence: obesityPrevalence,
        overweight_prevalence: overweightPrevalence,
        source: 'who',
        retrieved_at: new Date().toISOString()
      });

      processedKeys.add(key);
    }

    // Add overweight-only data (where we don't have obesity data)
    for (const [key, overweightPrevalence] of overweightData) {
      if (processedKeys.has(key)) continue;

      const [countryCode, yearStr] = key.split('-');
      const year = parseInt(yearStr);
      const countryName = getCountryName(countryCode);

      out.push({
        country_code: countryCode,
        country_name: countryName,
        year,
        obesity_prevalence: 0, // Will be filtered out or handled appropriately
        overweight_prevalence: overweightPrevalence,
        source: 'who',
        retrieved_at: new Date().toISOString()
      });
    }

    log(`Successfully fetched ${out.length} WHO BMI/obesity records`);
    return out;

  } catch (error) {
    logError('Failed to fetch WHO BMI/obesity data', error);
    return [];
  }
}

// Keep the original function name for backwards compatibility
export async function fetchWHO(): Promise<LifeRow[]> {
  return fetchWHOLifeExpectancy();
}

export async function fetchWHODrugUseMortality(): Promise<import('../types.js').DrugUseMortalityRow[]> {
  const out: import('../types.js').DrugUseMortalityRow[] = [];

  try {
    log('Starting WHO drug/substance-related mortality data fetch...');

    const response = await httpGetJson(drugUseMortalityUrl());
    if (response.status === 304) {
      log('WHO drug/substance mortality data not modified');
      return [];
    }
    if ((response as any).status === 404) {
      logWarning('WHO drug/substance mortality indicator not found (404)');
      return [];
    }

    const data = response.json as WHOResponse;
    if (!data.value || !Array.isArray(data.value)) {
      logWarning('No WHO drug/substance mortality data values found');
      return [];
    }

    for (const record of data.value) {
      try {
        if (record.NumericValue == null || record.NumericValue < 0) continue;
        const countryCode = record.SpatialDim;
        if (!countryCode || countryCode.length !== 3) continue;
        const iso3Code = WHO_TO_ISO3[countryCode];
        if (!iso3Code) continue;
        const year = record.TimeDim;
        if (!year || year < 1950 || year > 2100) continue;
        const rate = record.NumericValue; // deaths per 100k
        if (rate < 0 || rate > 1000) continue;

        const countryName = record.ParentLocation && record.ParentLocation !== 'null'
          ? record.ParentLocation
          : countryCode;

        out.push({
          country_code: iso3Code,
          country_name: countryName,
          year,
          drug_use_mortality_rate: rate,
          source: 'who',
          retrieved_at: new Date().toISOString()
        });
      } catch {}
    }

    log(`Successfully fetched ${out.length} WHO drug/substance mortality records`);
    return out;

  } catch (error) {
    logError('Failed to fetch WHO drug/substance mortality data', error);
    return [];
  }
}
