# NPM Publishing Setup

This document explains how to set up automated NPM publishing for the lifedata package.

## Prerequisites

1. **NPM Account**: You need an NPM account at [npmjs.com](https://npmjs.com)
2. **Scoped Package Access**: The package uses the `@sili3011/` scope

## Setup Instructions

### 1. Create NPM Access Token

1. Log in to [npmjs.com](https://npmjs.com)
2. Go to your account settings → Access Tokens
3. Click "Generate New Token"
4. Choose "Automation" token type (for CI/CD)
5. Copy the generated token

### 2. Add GitHub Secret

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and Variables → Actions
3. Click "New repository secret"
4. Name: `NPM_CI_TOKEN`
5. Value: Paste your NPM access token
6. Click "Add secret"

### 3. Verify Package Name

The package is configured to publish as `@sili3011/lifedata`. Make sure:

- You own the `sili3011` scope on NPM, or
- Update the package name in `package.json` to use your own scope

## Publishing Process

The GitHub Action will automatically:

1. **Trigger on Data Changes**: When new data is scraped and files change
2. **Generate Version**: Creates version based on timestamp (e.g., `2025.9.23-1430`)
3. **Build Package**: Generates export files and validates data
4. **Publish to NPM**: Publishes the package with new data

## Manual Publishing

To publish manually:

```bash
# Generate the package exports
npm run generate:exports

# Update version (optional)
npm version patch

# Publish to NPM
npm publish
```

## Version Strategy

The automated publishing uses date-based versioning:
- Format: `YYYY.M.D-HHMM` (e.g., `2025.9.23-1430`)
- New version created every time data changes
- Ensures each data update gets a unique version

## Package Contents

The published NPM package includes:
- `data/latest/index.js` - Main export file
- `data/latest/index.d.ts` - TypeScript definitions
- `data/latest/life_expectancy.json` - Raw life expectancy data
- `data/latest/lifestyle_effects.json` - Raw lifestyle effects data
- `README.md` - Project documentation
- `LICENSE` - MIT license
- `LICENSES/` - Data source attributions

## Usage in Other Projects

After publishing, you can use the package in any Node.js project:

```bash
npm install @sili3011/lifedata
```

```javascript
import { lifeExpectancy, lifestyleEffects } from '@sili3011/lifedata';

// Your app code here
```

## Troubleshooting

### Publishing Fails
- Check that `NPM_CI_TOKEN` secret is set correctly
- Verify you have publish permissions for the package scope
- Check NPM registry status

### Package Not Found
- Ensure the package name doesn't conflict with existing packages
- Verify the scope ownership
- Check package visibility (should be public)

### Data Missing
- Ensure data pipeline runs successfully before publishing
- Check that `data/latest/` files exist
- Verify export generation completed

## Security Notes

- Never commit NPM tokens to the repository
- Use GitHub Secrets for sensitive credentials
- The package is set to public access (`publishConfig.access: "public"`)
- Review dependencies regularly for security updates