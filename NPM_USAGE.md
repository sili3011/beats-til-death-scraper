# NPM Package Usage

This package provides curated life expectancy and lifestyle effects data that can be easily imported into your applications.

## Installation

```bash
npm install @sili3011/lifedata
```

## Usage

### ES Modules

```javascript
import lifedata from '@sili3011/lifedata';
// or
import { lifeExpectancy, lifestyleEffects, metadata } from '@sili3011/lifedata';

// Get all data
const data = lifedata.getAllData();
console.log(`Contains ${data.metadata.lifeExpectancyRecords} life expectancy records`);

// Use specific datasets
console.log('Life expectancy for USA in 2020:', 
  lifeExpectancy.find(row => row.country_code === 'USA' && row.year === 2020)
);

console.log('Smoking effects:', lifestyleEffects.smoking);
```

### CommonJS

```javascript
const lifedata = require('@sili3011/lifedata');

// Access data
const { lifeExpectancy, lifestyleEffects, metadata } = lifedata;
```

### Direct JSON Import

```javascript
// Import raw JSON files directly
import lifeExpectancyData from '@sili3011/lifedata/life-expectancy';
import lifestyleEffectsData from '@sili3011/lifedata/lifestyle-effects';
```

## Data Structure

### Life Expectancy Data

```typescript
interface LifeRow {
  country_code: string;    // ISO3 country code (e.g., "USA")
  country_name: string;    // Full country name
  year: number;           // Year (1960-2023)
  life_expectancy: number; // Life expectancy in years
  source: string;         // Data source ("worldbank", "who", "oecd", "manual")
  retrieved_at: string;   // ISO timestamp of data retrieval
}
```

### Lifestyle Effects Data

```typescript
interface Effects {
  smoking: {
    current_vs_never_years?: [number, number]; // Range of years lost
    quit_gain_years_after_5?: number;          // Years gained after quitting
  };
  exercise: {
    mod_150min_week_gain?: number;      // Moderate exercise benefit
    high_300min_week_gain?: number;     // High exercise benefit  
  };
  alcohol: {
    heavy_vs_moderate_years?: number;   // Years lost from heavy drinking
  };
  diet: {
    mediterranean_adherence_gain?: number; // Mediterranean diet benefit
  };
  citations: string[];                     // Research citations
  notes?: string;                         // Additional notes
}
```

## API Reference

- `lifeExpectancy`: Array of life expectancy records
- `lifestyleEffects`: Lifestyle effects data object
- `metadata`: Package metadata including update timestamp
- `getAllData()`: Function returning all data as single object

## Data Sources

- **World Bank Open Data**: Primary source for life expectancy data
- **WHO Global Health Observatory**: Health statistics (when available)
- **OECD Health Statistics**: OECD member country data (when available)  
- **Manual Curation**: Conservative estimates from academic research

## Update Frequency

This package is automatically updated daily with the latest available data from all sources.

## License

MIT License - see LICENSE file for details.

Data sources have their own licenses - see LICENSES/SOURCES.md for attribution.