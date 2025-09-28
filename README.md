# NPM Package Usage Guide

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
  lifestyleEffects,
  metadata,
  getAllData,
} from "@sili3011/lifedata";

// Life expectancy data - 20,699+ records
const usaData2020 = lifeExpectancy.find(
  (row) => row.country_code === "USA" && row.year === 2020
);

// New health effects data
console.log("Neutral heart rate:", rhrEffect.neutral_bpm); // 70 BPM
console.log("Smoking cessation benefit:", smokingEffect.quit_gain_years_after_5); // 2 years
console.log("Exercise benefit:", exerciseEffect.mod_150min_week_gain); // 2 years
console.log("Alcohol effect (heavy vs moderate):", alcoholEffect.heavy_vs_moderate_years); // -5.5 years
console.log("Weight effect (obese years lost):", weightEffect.obese_years_lost); // -3.1 years

// Get all data at once
const allData = getAllData();
// Sorted order in allData:
// lifeExpectancy, rhrEffect, smokingEffect, exerciseEffect, alcoholEffect, weightEffect, lifestyleEffects, metadata, getAllData
console.log(`Package contains ${allData.metadata.lifeExpectancyRecords} records`);
```

### CommonJS

```javascript
const {
  lifeExpectancy,
  rhrEffect,
  smokingEffect,
  exerciseEffect,
  getAllData,
} = require("@sili3011/lifedata");
```

### Default Import

```javascript
import lifedata from "@sili3011/lifedata";

const { lifeExpectancy, rhrEffect, metadata } = lifedata;
```

## Data Structures

### Life Expectancy Data

20,699+ records from World Bank, WHO, OECD, and manual sources:

```typescript
interface LifeRow {
  country_code: string; // ISO3 country code (e.g., "USA")
  country_name: string; // Full country name
  year: number; // Year (1960-2023)
  life_expectancy: number; // Life expectancy in years
  source: string; // Data source ("worldbank", "who", "oecd", "manual")
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
console.log("Heavy drinking years lost:", alcoholEffect.heavy_vs_moderate_years);
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

```typescript
interface Metadata {
  lastUpdated: string; // ISO timestamp of last update
  lifeExpectancyRecords: number; // Total life expectancy records
  sources: string[]; // Data sources used
  version: string; // Package version
  effectTypes: string[]; // Available effect types
}
```

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
```

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

- **Daily Automation**: Package updates automatically at 2 AM UTC daily
- **Fresh Data**: Always includes latest available data from all sources
- **Version Control**: Date-based versioning (YYYY.M.D-HHMM format)
- **Manual Releases**: Tag-triggered releases for immediate updates

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
