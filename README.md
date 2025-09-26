# Lifedata Scraper

A TypeScript-based data scraper for life expectancy and lifestyle effects data from various authoritative sources including World Bank, WHO, and OECD.

## 📦 NPM Package

This data is also available as an NPM package for easy use in your applications:

```bash
npm install @sili3011/lifedata
```

```javascript
import { lifeExpectancy, lifestyleEffects } from '@sili3011/lifedata';

// Find life expectancy for a specific country and year
const usaData = lifeExpectancy.find(row => 
  row.country_code === 'USA' && row.year === 2020
);

// Access lifestyle effects
console.log('Exercise benefits:', lifestyleEffects.exercise);
```

See [NPM_USAGE.md](NPM_USAGE.md) for complete usage documentation.

## Features

- 🌍 **Multiple Data Sources**: World Bank, WHO, OECD, and manual data
- 📊 **Structured Output**: JSON format with comprehensive validation
- 🔄 **Automated Pipeline**: Daily scraping with GitHub Actions
- 📈 **Lifestyle Effects**: Curated effect sizes for smoking, exercise, alcohol, and diet
- 🏷️ **Data Versioning**: Timestamped raw and processed data
- ✅ **Data Validation**: Zod schema validation for all outputs
- 🚦 **Rate Limiting**: Respectful API usage with retry mechanisms

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

# Scrape WHO data (when implemented)
npm run scrape:who

# Scrape OECD data (when implemented)
npm run scrape:oecd
```

### Full Pipeline

```bash
# Run complete data pipeline
npm run build

# Build lifestyle effects data
npm run build:effects

# Validate all data
npm run validate
```

### Development

```bash
# Run the main script
npm run dev
```

## Data Outputs

### Life Expectancy Data (`data/latest/life_expectancy.json`)

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

### Lifestyle Effects Data (`data/latest/lifestyle_effects.json`)

```json
{
  "smoking": {
    "current_vs_never_years": [-10, -5],
    "quit_gain_years_after_5": 2
  },
  "exercise": {
    "mod_150min_week_gain": 2,
    "high_300min_week_gain": 3
  },
  "alcohol": {
    "heavy_vs_moderate_years": -2
  },
  "diet": {
    "mediterranean_adherence_gain": 1
  },
  "citations": [
    "WHO GHO: Tobacco and mortality (accessed YYYY-MM-DD)",
    "CDC Physical Activity Guidelines summary (accessed YYYY-MM-DD)"
  ],
  "notes": "Effect sizes are coarse, for educational use only."
}
```

## Data Sources

- **World Bank**: Life expectancy data via Open Data API
- **WHO**: Global Health Observatory (implementation pending)
- **OECD**: Health Statistics (implementation pending)
- **Manual**: Curated data from academic sources

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

## Disclaimer

This data is provided for educational and research purposes only. Effect sizes are conservative estimates and should not be used for medical decision-making. Always consult healthcare professionals for medical advice.