# NPM Publishing Setup Guide

This project automatically publishes to NPM after successful data scrapes using GitHub Actions.

## Setup (One-time)

### 1. Create NPM Automation Token
1. Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
2. Click "Generate New Token" → **"Automation"** (not "Publish")
3. Copy the generated token

### 2. Add Token to GitHub Repository
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `NPM_CI_TOKEN`
5. Value: paste your automation token
6. Click **"Add secret"**

## How Publishing Works

**Automatic Publishing**: New versions are published automatically when fresh data is scraped during daily runs.

- **Versioning**: Uses date-based versions like `2025.9.24-0200` (Year.Month.Day-HourMinute)
- **Triggering**: Happens only when new data is detected (git status shows changes)
- **No manual intervention**: Just set up the NPM token and it handles everything

### Manual Publishing (Optional)

You can also trigger manual publishes by creating git tags:

```bash
# Create and push a version tag
npm version patch  # or minor/major
git push --follow-tags
```

## What Happens

1. **Daily Scraping & Auto-Publishing**: Runs at 2 AM UTC, when new data is found:
   - Scrapes fresh data (`npm run build`)
   - Commits data changes to git
   - Auto-bumps version with date format (e.g., `2025.9.24-0200`)
   - Generates exports (`npm run generate:exports`)
   - Creates git tag and publishes to NPM with provenance
   - Makes new version available as `@sili3011/lifedata`

2. **Manual Tag Publishing**: You can also manually publish by pushing `v*` tags

## Usage in Other Projects

Once published, you can use the package:

```bash
npm install @sili3011/lifedata
```

```javascript
// Import all data
import { lifeExpectancy, lifestyleEffects } from '@sili3011/lifedata';

// Import specific datasets
import lifeExpectancy from '@sili3011/lifedata/life-expectancy';
import lifestyleEffects from '@sili3011/lifedata/lifestyle-effects';
```

## Important Notes

- **No `.npmrc` committed**: The workflow handles authentication temporarily
- **2FA stays enabled**: Automation tokens bypass OTP requirements
- **Provenance included**: Supply-chain security with Node 20 + npm 9.5+
- **Public access**: Scoped packages published with `--access public`
- **Automatic publishing**: Publishes immediately after successful data scrapes
- **Date-based versioning**: Each successful scrape gets a timestamped version

## Current Package Info

- **Name**: `@sili3011/lifedata`
- **Current Version**: `0.1.0`
- **Registry**: npmjs.org
- **Access**: Public
- **Files included**: `data/latest/**/*`, `README.md`, `LICENSE`