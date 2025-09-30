# Lifedata Scraper

A comprehensive TypeScript-based data scraper for life expectancy and health effects data from authoritative sources including World Bank, WHO, and OECD. Features evidence-based health effect estimates for resting heart rate, smoking, exercise, and lifestyle factors.

## NPM Package

This data is available as an NPM package for easy integration in your applications:

```bash
npm install @sili3011/lifedata
```

### Basic Usage

```javascript
import {
  lifeExpectancy,
  rhrEffect,
  smokingEffect,
  exerciseEffect,
  lifestyleEffects,
  getAllData,
} from "@sili3011/lifedata";

// Find life expectancy for a specific country and year
const usaData = lifeExpectancy.find(
  (row) => row.country_code === "USA" && row.year === 2020
);

// Access new effect data
console.log("Neutral heart rate:", rhrEffect.neutral_bpm); // 70 BPM
console.log(
  "Smoking cessation benefit:",
  smokingEffect.quit_gain_years_after_5
); // 2 years
console.log("Exercise benefit:", exerciseEffect.mod_150min_week_gain); // 2 years

// Get all data as a single object
const allData = getAllData();

// Link to sources and papers
console.log('World Bank dataset:', allData.sourceInfo.datasets.worldbank_life_expectancy.url);
console.log('Exercise references:', allData.sourceInfo.effects.exercise?.references);
```

### Available Exports

- `lifeExpectancy` - 20,699+ life expectancy records from multiple sources
- `rhrEffect` - Resting heart rate mortality effects with risk bands
- `smokingEffect` - Smoking cessation years gained/lost data
- `exerciseEffect` - Physical activity health benefits
- `lifestyleEffects` - Legacy format lifestyle effects (deprecated)
- `metadata` - Package version and statistics
- `sourceInfo` - Dataset links and effect references
- `getAllData()` - Function returning all data objects

See [NPM_USAGE.md](NPM_USAGE.md) for complete usage documentation.

## Features

- Multiple Data Sources: World Bank (16,670+ records), WHO (4,026+ records), OECD, and manual data
- Structured Output: JSON format with comprehensive Zod validation
- Automated Pipeline: Daily scraping with automatic NPM publishing
- Health Effects: Evidence-based data for heart rate, smoking, exercise, and lifestyle factors
- Risk Analysis: Mortality risk bands and hazard ratios from meta-analyses
- Data Versioning: Timestamped raw and processed data with git integration
- TypeScript Support: Full type definitions and schema validation
- Rate Limiting: Respectful API usage with exponential backoff retry
- NPM Publishing: Automatic publishing after successful data scrapes

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd lifedata
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

## Usage

### Individual Data Sources

```bash
# Scrape World Bank data
npm run scrape:wb

# Scrape WHO data
npm run scrape:who

# Scrape OECD data (temporarily disabled)
npm run scrape:oecd
```

### Full Pipeline

```bash
# Run complete data pipeline
npm run build

# Build effect data
npm run build:effects      # Legacy lifestyle effects
npm run build:rhr         # Resting heart rate effects
npm run build:smoking     # Smoking cessation effects
npm run build:exercise    # Physical activity effects

# Generate NPM package exports
npm run generate:exports

# Validate all data
npm run validate
```

### Development

```bash
# Run the main script
npm run dev
```

Note: This package is ESM-only. In CommonJS environments, use dynamic import:

```js
(async () => {
  const lifedata = await import('@sili3011/lifedata');
  console.log(lifedata.sourceInfo.datasets.worldbank_life_expectancy.url);
})();
```

## Data Outputs

### Life Expectancy Data (`data/latest/life_expectancy.json`)

20,699+ records from World Bank, WHO, OECD, and manual sources:

```json
[
  {
    "country_code": "USA",
    "country_name": "United States",
    "year": 2021,
    "life_expectancy": 76.1,
    "source": "worldbank",
    "retrieved_at": "2024-09-23T10:30:00.000Z"
  }
]
```

### Resting Heart Rate Effects (`data/latest/rhr_effect.json`)

Evidence-based mortality risk data from meta-analyses:

```json
{
  "neutral_bpm": 70,
  "hr_per_10bpm": { "low": 1.08, "mid": 1.1, "high": 1.12 },
  "bands": [
    { "min": 0, "max": 60, "rr_allcause": 0.9 },
    { "min": 60, "max": 70, "rr_allcause": 0.95 },
    { "min": 70, "max": 80, "rr_allcause": 1.0 },
    { "min": 80, "max": 90, "rr_allcause": 1.15 },
    { "min": 90, "max": 200, "rr_allcause": 1.33 }
  ],
  "citations": ["Copenhagen City Heart Study", "Framingham Heart Study"],
  "notes": "Conservative estimates for educational use only"
}
```

### Smoking Effects (`data/latest/smoking_effect.json`)

Years lost/gained from smoking cessation:

```json
{
  "current_vs_never_years": [-12, -8],
  "quit_gain_years_after_5": 2,
  "quit_gain_years_after_10": 4,
  "citations": ["WHO Global Health Observatory", "CDC Smoking and Health"],
  "notes": "Conservative estimates based on population studies"
}
```

### Exercise Effects (`data/latest/exercise_effect.json`)

Physical activity health benefits:

```json
{
  "none": 0,
  "mod_150min_week_gain": 2,
  "high_300min_week_gain": 3,
  "citations": ["WHO Physical Activity Guidelines", "CDC Physical Activity"],
  "notes": "Benefits from moderate (150min/week) and high (300min/week) activity"
}
```

### Legacy Lifestyle Effects (`data/latest/lifestyle_effects.json`)

Consolidated effects data (deprecated - use specific effect files):

```json
{
  "smoking": {
    "current_vs_never_years": [-10, -5],
    "quit_gain_years_after_5": 2
  },
  "exercise": { "mod_150min_week_gain": 2, "high_300min_week_gain": 3 },
  "alcohol": { "heavy_vs_moderate_years": -2 },
  "diet": { "mediterranean_adherence_gain": 1 },
  "citations": ["WHO", "CDC", "Various meta-analyses"],
  "notes": "Legacy format - use specific effect files for detailed data"
}
```

## Data Sources

- **World Bank**: 16,670+ life expectancy records via Open Data API
- **WHO**: 4,026+ Global Health Observatory records (life expectancy and health indicators)
- **OECD**: Health Statistics (temporarily disabled - API endpoint verification needed)
- **Manual**: Curated data from academic sources and meta-analyses
- **Meta-analyses**: Heart rate effects from Copenhagen City Heart Study, Framingham Heart Study
- **Health Organizations**: Smoking and exercise effects from WHO, CDC guidelines

See [LICENSES/SOURCES.md](LICENSES/SOURCES.md) for detailed attribution and licensing information.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-data-source`
3. Make changes and add tests
4. Commit changes: `git commit -m 'Add new data source'`
5. Push to branch: `git push origin feature/new-data-source`
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Data sources have their own licenses - see [LICENSES/SOURCES.md](LICENSES/SOURCES.md) for details.

## GitHub Actions & Automation

The repository includes automated workflows for:

- **Daily Data Scraping**: Runs at 2 AM UTC daily to fetch fresh data
- **Automatic NPM Publishing**: Publishes new package versions after successful data updates
- **Tag-based Releases**: Manual releases via git tags trigger immediate publishing
- **Data Validation**: All data passes comprehensive schema validation before publishing

## Disclaimer

This data is provided for educational and research purposes only. All effect sizes are conservative estimates derived from population studies and meta-analyses. Individual results may vary significantly based on genetics, existing health conditions, and other factors.

**Important**: This data should not be used for medical decision-making, diagnosis, or treatment planning. Always consult qualified healthcare professionals for medical advice and personalized health recommendations.


