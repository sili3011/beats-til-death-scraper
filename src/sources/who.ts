import { LifeRow } from '../types.js';
import { httpGetJson } from '../lib/fetcher.js';
import { log, logError, logWarning } from '../lib/log.js';

// WHO Global Health Observatory API
// Life expectancy at birth (both sexes) - indicator WHOSIS_000001
const WHO_URL = 'https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=Dim1%20eq%20%27SEX_BTSX%27';

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

export async function fetchWHO(): Promise<LifeRow[]> {
  const out: LifeRow[] = [];
  
  try {
    log('Starting WHO Global Health Observatory data fetch...');
    
    const response = await httpGetJson(WHO_URL);
    if (response.status === 304) {
      log('WHO data not modified');
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
    
    log(`Successfully fetched ${out.length} WHO records`);
    return out;
    
  } catch (error) {
    logError('Failed to fetch WHO data', error);
    throw error;
  }
}