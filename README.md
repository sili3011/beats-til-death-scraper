# @sili3011/lifedata

[![npm version](https://img.shields.io/npm/v/%40sili3011%2Flifedata.svg)](https://www.npmjs.com/package/@sili3011/lifedata)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Comprehensive, ready‑to‑use life expectancy and evidence‑based health effects datasets with direct links to sources and papers. ESM‑only package with bundled TypeScript types.

Comprehensive life expectancy data (20,699+ records) and evidence-based health effects data from authoritative sources including World Bank, WHO, and medical meta-analyses.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
   - [ES Modules (Recommended)](#es-modules-recommended)
   - [CommonJS](#commonjs)
   - [Default Import](#default-import)
3. [Data Structures](#data-structures)
   - [Life Expectancy Data](#life-expectancy-data)
   - [Resting Heart Rate Effects](#resting-heart-rate-effects)
   - [Smoking Effects](#smoking-effects)
   - [Exercise Effects](#exercise-effects)
   - [Alcohol Effects](#alcohol-effects)
   - [Weight/BMI Effects](#weightbmi-effects)
   - [Legacy Lifestyle Effects (Deprecated)](#legacy-lifestyle-effects-deprecated)
   - [Metadata Structure](#metadata-structure)
4. [Practical Examples](#practical-examples)
   - [Health Risk Calculator](#health-risk-calculator)
   - [Country Comparison Tool](#country-comparison-tool)
5. [Data Sources & Citations](#data-sources--citations)
6. [Error Handling](#error-handling)
7. [TypeScript Support](#typescript-support)
8. [Update Frequency](#update-frequency)
9. [Best Practices](#best-practices)
10. [License & Attribution](#license--attribution)
11. [Support & Contributing](#support--contributing)

## Installation

```bash
npm install @sili3011/lifedata
```

## Quick Start

### ES Modules (Recommended)

```javascript
import {
  lifeExpectancy,
  rhrEffect,
  smokingEffect,
  exerciseEffect,
  alcoholEffect,
  weightEffect,
  drugUseMortality,
  smokingPrevalence,
  lifestyleEffects,
  metadata,
  sourceInfo,
  getAllData,
} from "@sili3011/lifedata";

// Life expectancy data - 20,699+ records
const usaData2020 = lifeExpectancy.find(
  (row) => row.country_code === "USA" && row.year === 2020
);

// New health effects data
console.log("Neutral heart rate:", rhrEffect.neutral_bpm); // 70 BPM
console.log(
  "Smoking cessation benefit:",
  smokingEffect.quit_gain_years_after_5
); // 2 years
console.log("Exercise benefit:", exerciseEffect.mod_150min_week_gain); // 2 years
console.log(
  "Alcohol effect (heavy vs moderate):",
  alcoholEffect.heavy_vs_moderate_years
); // -5.5 years
console.log("Weight effect (obese years lost):", weightEffect.obese_years_lost); // -3.1 years

// Get all data at once
const allData = getAllData();
// Sorted order in allData:
// lifeExpectancy, rhrEffect, smokingEffect, exerciseEffect, alcoholEffect, weightEffect, lifestyleEffects, metadata, sourceInfo, getAllData
console.log(
  `Package contains ${allData.metadata.lifeExpectancyRecords} records`
);

// Link to original sources/papers
console.log(
  "Drug/substance mortality WHO reference:",
  sourceInfo.datasets.who_drug_use_mortality.url
);
console.log(
  "World Bank dataset:",
  sourceInfo.datasets.worldbank_life_expectancy.url
);
console.log("RHR references:", sourceInfo.effects.rhr?.references);
```

### CommonJS (ESM-only)

This package is ESM‑only. In CommonJS environments, use dynamic import:

```javascript
(async () => {
  const lifedata = await import("@sili3011/lifedata");
  const {
    lifeExpectancy,
    rhrEffect,
    smokingEffect,
    exerciseEffect,
    getAllData,
  } = lifedata;
})();
```

### Default Import

```javascript
import lifedata from "@sili3011/lifedata";

const { lifeExpectancy, rhrEffect, metadata, sourceInfo } = lifedata;
```

## Data Structures

### Life Expectancy Data

20,699+ records from World Bank, WHO, and OECD sources:

```typescript
interface LifeRow {
  country_code: string; // ISO3 country code (e.g., "USA")
  country_name: string; // Full country name
  year: number; // Year (1960-2023)
  life_expectancy: number; // Life expectancy in years
  source: string; // Data source ("worldbank", "who", "oecd")
  retrieved_at: string; // ISO timestamp of data retrieval
}

// Usage example
const getLatestForCountry = (countryCode: string) => {
  return lifeExpectancy
    .filter((row) => row.country_code === countryCode)
    .sort((a, b) => b.year - a.year)[0];
};
```

### Resting Heart Rate Effects

Evidence-based mortality risk from meta-analyses:

```typescript
interface RhrEffect {
  neutral_bpm: number; // Neutral reference (70 BPM)
  hr_per_10bpm: {
    // Risk per 10 BPM increase
    low: number; // Lower bound (1.08)
    mid: number; // Mid estimate (1.10)
    high: number; // Upper bound (1.12)
  };
  bands: Array<{
    // Risk bands
    min: number; // Min BPM for band
    max: number; // Max BPM for band
    rr_allcause: number; // Relative risk for all-cause mortality
  }>;
  citations: string[]; // Academic citations
  retrieved_at: string; // Generation timestamp
  notes: string; // Usage notes
}

// Usage example
const getRiskForHeartRate = (bpm: number) => {
  return rhrEffect.bands.find((band) => bpm >= band.min && bpm < band.max);
};
```

### Smoking Effects

Years lost/gained from smoking and cessation:

```typescript
interface SmokingEffect {
  current_vs_never_years: [number, number]; // Years lost [min, max]
  quit_gain_years_after_5: number; // Years gained after 5 years
  quit_gain_years_after_10: number; // Years gained after 10 years
  citations: string[]; // Academic citations
  retrieved_at: string; // Generation timestamp
  notes: string; // Usage notes
}

// Usage example
const calculateQuitBenefit = (yearsQuit: number) => {
  if (yearsQuit >= 10) return smokingEffect.quit_gain_years_after_10;
  if (yearsQuit >= 5) return smokingEffect.quit_gain_years_after_5;
  return 0;
};
```

### Exercise Effects

Physical activity health benefits:

```typescript
interface ExerciseEffect {
  none: number; // Baseline (0)
  mod_150min_week_gain: number; // 150min/week moderate benefit
  high_300min_week_gain: number; // 300min/week high benefit
  citations: string[]; // Academic citations
  retrieved_at: string; // Generation timestamp
  notes: string; // Usage notes
}

// Usage example
const getExerciseBenefit = (minutesPerWeek: number) => {
  if (minutesPerWeek >= 300) return exerciseEffect.high_300min_week_gain;
  if (minutesPerWeek >= 150) return exerciseEffect.mod_150min_week_gain;
  return exerciseEffect.none;
};
```

### Alcohol Effects

Curated alcohol consumption effect data:

```typescript
interface AlcoholEffect {
  none: number; // Baseline - no consumption
  light_years_gain: number; // Light consumption benefit
  light_consumption_range: [number, number]; // 0.1-1.0 liters/year
  moderate_years_gain: number; // Moderate consumption
  moderate_consumption_range: [number, number]; // 1.0-2.0 liters/year
  heavy_vs_moderate_years: number; // Heavy drinking vs moderate
  heavy_consumption_threshold: number; // >3.0 liters/year
  citations: string[];
  retrieved_at: string;
  notes: string;
}

// Usage example
console.log(
  "Heavy drinking years lost:",
  alcoholEffect.heavy_vs_moderate_years
);
```

### Weight/BMI Effects

Curated BMI/weight effect data:

```typescript
interface WeightEffect {
  normal_bmi: [number, number]; // Normal BMI range
  overweight_years_lost: number; // Years lost from overweight
  obese_years_lost: number; // Years lost from obesity
  severely_obese_years_lost: number; // Years lost from severe obesity
  citations: string[];
  retrieved_at: string;
  notes: string;
}

// Usage example
console.log("Obese years lost:", weightEffect.obese_years_lost);
```

### Legacy Lifestyle Effects (Deprecated)

Consolidated format - use specific effect files for detailed data:

```typescript
interface Effects {
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
  citations: string[];
  notes?: string;
}
```

### Metadata Structure

````typescript
interface Metadata {
  lastUpdated: string; // ISO timestamp of last update
  lifeExpectancyRecords: number; // Total life expectancy records
  sources: string[]; // Data sources used
  version: string; // Package version
  effectTypes: string[]; // Available effect types
}

### Source Links & Citations

The package bundles a `sourceInfo` object containing dataset links and paper references for easy attribution:

```typescript
interface SourceRef { title: string; url: string }
interface SourceInfo {
  datasets: Record<string, { name: string; url: string; api?: string; docs?: string; license?: string; note?: string }>;
  effects: Record<string, { name: string; references: SourceRef[] } | null>;
}

// Usage example
import { sourceInfo } from '@sili3011/lifedata';
console.log(sourceInfo.datasets.worldbank_life_expectancy.url);
console.log(sourceInfo.effects.rhr?.references);
````

````

## Practical Examples

### Health Risk Calculator

```javascript
import { rhrEffect, smokingEffect, exerciseEffect } from "@sili3011/lifedata";

const assessHealthRisks = (profile) => {
  const { heartRate, smokingStatus, exerciseMinutes } = profile;

  const risks = {
    heartRate:
      rhrEffect.bands.find((b) => heartRate >= b.min && heartRate < b.max)
        ?.rr_allcause || 1.0,

    smoking:
      smokingStatus === "current" ? smokingEffect.current_vs_never_years[1] : 0,

    exercise: exerciseMinutes >= 150 ? exerciseEffect.mod_150min_week_gain : 0,
  };

  return risks;
};
````

### Country Comparison Tool

```javascript
import { lifeExpectancy } from "@sili3011/lifedata";

const compareCountries = (countries, year = 2020) => {
  return countries
    .map((code) => {
      const data = lifeExpectancy.find(
        (row) => row.country_code === code && row.year === year
      );
      return {
        country: data?.country_name || code,
        lifeExpectancy: data?.life_expectancy || null,
        source: data?.source,
      };
    })
    .sort((a, b) => (b.lifeExpectancy || 0) - (a.lifeExpectancy || 0));
};

console.log(compareCountries(["USA", "JPN", "DEU", "FRA"]));
```

## Data Sources & Citations

- **World Bank Open Data**: 16,670+ life expectancy records via REST API
- **WHO Global Health Observatory**: 4,026+ health statistics records
- **OECD Health Statistics**: Member country data (temporarily disabled)
- **Copenhagen City Heart Study**: Heart rate mortality risk meta-analysis
- **Framingham Heart Study**: Cardiovascular risk factors research
- **WHO Guidelines**: Smoking cessation and physical activity recommendations
- **CDC Health Data**: Exercise benefits and smoking effects research
- **Manual Curation**: Conservative estimates from peer-reviewed research

## Error Handling

```javascript
// Safe data access patterns
const safeGetCountryData = (countryCode, year) => {
  try {
    const data = lifeExpectancy.find(
      (row) => row.country_code === countryCode && row.year === year
    );
    if (!data) throw new Error(`No data for ${countryCode} in ${year}`);
    return data;
  } catch (error) {
    console.warn("Data access error:", error.message);
    return null;
  }
};

// Check effect data availability
const validateEffects = () => {
  return {
    rhrEffect: rhrEffect !== null,
    smokingEffect: smokingEffect !== null,
    exerciseEffect: exerciseEffect !== null,
  };
};
```

## TypeScript Support

Full type definitions included for all data structures:

```typescript
import type {
  LifeRow,
  RhrEffect,
  SmokingEffect,
  ExerciseEffect,
  Effects,
  Metadata,
} from "@sili3011/lifedata";
```

## Update Frequency

- **Weekly Automation**: Publishes new versions to npm weekly at 2 AM UTC. The repository is not updated with generated data; latest datasets ship via npm.
- **Fresh Data**: Always includes latest available data from configured sources
- **Versioning**: Date-based versioning (YYYY.M.D-HHMM format)
- **Manual Releases**: You can still publish manually by running the build and `npm publish` locally

## Best Practices

1. **Cache Large Datasets**: Life expectancy data contains 20,699+ records
2. **Validate Inputs**: Always check if data exists for requested country/year
3. **Handle Nulls**: Effect data may be null if generation failed
4. **Respect Disclaimers**: Data is for educational use, not medical decisions
5. **Check Citations**: All effect data includes academic source citations
6. **Update Regularly**: Consider your application's update frequency needs

## License & Attribution

MIT License - see LICENSE file for details.

**Data Attribution**: All datasets include proper citations. When using this data:

- Cite original sources (World Bank, WHO, academic studies)
- Include disclaimer about educational use only
- Reference this package for data aggregation
- See LICENSES/SOURCES.md for complete attribution requirements

## Support & Contributing

- **Issues**: Report bugs on GitHub repository
- **Feature Requests**: Open GitHub issues for new data sources
- **Documentation**: Improvements welcome via pull requests
- **Data Quality**: Report data inconsistencies or validation errors

### Drug/Substance Use Mortality Data

WHO drug/substance-related mortality rates (per 100k population):

```typescript
interface DrugUseMortalityRow {
  country_code: string; // ISO3
  country_name: string;
  year: number;
  drug_use_mortality_rate: number; // deaths per 100k population
  source: string; // 'who'
  retrieved_at: string; // ISO timestamp
}

// Usage example
const getDrugUseMortality = (code: string, year: number) =>
  drugUseMortality?.find((r) => r.country_code === code && r.year === year);
```

### Smoking Prevalence

OWID smoking prevalence (percent of adults):

```typescript
interface SmokingRow {
  country_code: string; // ISO3
  country_name: string;
  year: number;
  smoking_prevalence: number; // percent of adults
  source: string;
  retrieved_at: string;
}
```

### Alcohol Consumption (OWID)

Alternative source via OWID grapher datasets. Use script `npm run scrape:alcohol:owid`.
