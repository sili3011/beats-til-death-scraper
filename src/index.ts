import { log } from './lib/log.js';

async function main() {
  log('Lifedata scraper initialized');
  log('Available commands:');
  log('  npm run scrape:wb    - Scrape World Bank data');
  log('  npm run scrape:who   - Scrape WHO data');
  log('  npm run scrape:oecd  - Scrape OECD data');
  log('  npm run build:effects - Build lifestyle effects data');
  log('  npm run validate     - Validate all data');
  log('  npm run build        - Run full pipeline');
  
  log('Project structure:');
  log('  src/sources/         - Data source implementations');
  log('  src/pipelines/       - Data processing pipelines');
  log('  src/lib/             - Utility libraries');
  log('  data/raw/            - Raw scraped data by date');
  log('  data/processed/      - Processed data by date');
  log('  data/latest/         - Latest processed data');
}

main().catch(console.error);