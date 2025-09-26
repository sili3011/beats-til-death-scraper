# SCRAPER_NOTES.md

These notes describe how to extend the lifedata scraper with curated effect-size data for **resting heart rate**, **smoking**, and **exercise**. The goal is to produce structured JSON datasets that can be consumed by the frontend estimator.

---

## General Principles

- **Only store effect sizes and citations**, never raw paper text or PDFs.
- **Prefer meta-analyses and large cohort studies** over single studies.
- All data must include:
  - Effect size (hazard ratio, relative risk, or years lost).
  - Population studied (if available).
  - Accessed date.
  - Citation (DOI, PubMed ID, or official report URL).
- Values should be **conservative averages** when ranges exist.
- Output JSON into `data/latest/` and versioned into `data/processed/YYYY-MM-DD/`.

---

## Resting Heart Rate (RHR)

**Target data:**

- Hazard ratio (HR) for all-cause mortality **per +10 bpm** increase in resting HR.
- Relative risks for bands:
  - `<60 bpm`
  - `60–69 bpm`
  - `70–79 bpm`
  - `80–89 bpm`
  - `≥90 bpm`

**Sources:**

- Large cohorts (e.g. Framingham, Copenhagen City Heart Study).
- Meta-analyses: pooled HRs for all-cause and cardiovascular mortality.

**Data shape:**

```ts
// data/latest/rhr_effect.json
{
  "neutral_bpm": 70,
  "hr_per_10bpm": { "low": 1.08, "mid": 1.10, "high": 1.12 },
  "bands": [
    { "min": 0, "max": 59, "rr_allcause": 0.90 },
    { "min": 60, "max": 69, "rr_allcause": 1.00 },
    { "min": 70, "max": 79, "rr_allcause": 1.10 },
    { "min": 80, "max": 89, "rr_allcause": 1.21 },
    { "min": 90, "max": 300, "rr_allcause": 1.33 }
  ],
  "citations": [
    "Meta-analysis: HR per 10 bpm for all-cause mortality (DOI ...)",
    "Cohort: Copenhagen City Heart Study (DOI ...)"
  ],
  "retrieved_at": "YYYY-MM-DD",
  "notes": "Adjusted for age, sex, smoking where available. Educational use only."
}
```

---

## Smoking

**Target data:**

- Years of life lost for **current smokers** vs **never smokers**.
- Gains in years when quitting after:
  - 5 years
  - 10 years
- Pack-years or intensity can be added later, but start with simple categories.

**Sources:**

- WHO GHO (tobacco and mortality).
- CDC summaries.
- Large meta-analyses on mortality and smoking cessation.

**Data shape:**

```ts
// data/latest/smoking_effect.json
{
  "current_vs_never_years": [-10, -6],
  "quit_gain_years_after_5": 2,
  "quit_gain_years_after_10": 4,
  "citations": [
    "WHO GHO: Tobacco and mortality (accessed YYYY-MM-DD)",
    "US Surgeon General Report on Smoking (year, DOI/URL)"
  ],
  "retrieved_at": "YYYY-MM-DD",
  "notes": "Effect sizes are conservative averages; based on large cohort studies."
}
```

---

## Exercise

**Target data:**

- Years of life gained for physical activity levels (based on weekly minutes).
- Categories (WHO guidelines):
  - None
  - Moderate (≥150 min/week)
  - High (≥300 min/week)

**Sources:**

- WHO Physical Activity Guidelines.
- CDC summaries.
- Meta-analyses on exercise and longevity.

**Data shape:**

```ts
// data/latest/exercise_effect.json
{
  "none": 0,
  "mod_150min_week_gain": 2,
  "high_300min_week_gain": 3,
  "citations": [
    "WHO: Global recommendations on physical activity for health",
    "Meta-analysis: leisure-time physical activity and mortality (DOI ...)"
  ],
  "retrieved_at": "YYYY-MM-DD",
  "notes": "Years gained are approximate and conservative."
}
```

---

## Implementation Notes

- Create new pipeline files in `src/pipelines/`:
  - `rhr-effect.ts`
  - `smoking-effect.ts`
  - `exercise-effect.ts`
- Each pipeline:
  1. Fetch or load curated data (CSV/JSON/manual).
  2. Validate with Zod schema.
  3. Write JSON to `data/processed/DATE/` and copy to `data/latest/`.
- Add Zod schemas in `src/types.ts` for each dataset.

**Validation Example (TypeScript):**

```ts
import { z } from "zod";

export const RhrEffectSchema = z.object({
  neutral_bpm: z.number(),
  hr_per_10bpm: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number(),
  }),
  bands: z.array(
    z.object({
      min: z.number(),
      max: z.number(),
      rr_allcause: z.number(),
    })
  ),
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string(),
});
```

---

## Guardrails

- Do **not** attempt to scrape or store full-text articles behind paywalls.
- Use **manual curation** with DOIs/URLs if APIs are unavailable.
- Always cite at least one authoritative source per effect.
- Clamp estimates to modest, realistic ranges to avoid sensational claims.

---

## Status

✅ **IMPLEMENTED** - All three effect types are now fully implemented:

### Resting Heart Rate (RHR)

- **Pipeline**: `src/pipelines/rhr-effect.ts`
- **Schema**: `RhrEffectSchema` in `src/types.ts`
- **Data**: Curated from meta-analyses and large cohort studies
- **Export**: Available as `rhrEffect` in NPM package

### Smoking Effects

- **Pipeline**: `src/pipelines/smoking-effect.ts`
- **Schema**: `SmokingEffectSchema` in `src/types.ts`
- **Data**: Based on WHO, CDC, and longitudinal studies
- **Export**: Available as `smokingEffect` in NPM package

### Exercise Effects

- **Pipeline**: `src/pipelines/exercise-effect.ts`
- **Schema**: `ExerciseEffectSchema` in `src/types.ts`
- **Data**: Based on WHO guidelines and meta-analyses
- **Export**: Available as `exerciseEffect` in NPM package

### NPM Package Usage

```typescript
import { rhrEffect, smokingEffect, exerciseEffect } from "@sili3011/lifedata";

// Or import individual files
import rhrData from "@sili3011/lifedata/rhr-effect";
import smokingData from "@sili3011/lifedata/smoking-effect";
import exerciseData from "@sili3011/lifedata/exercise-effect";
```

### Scripts Available

```bash
npm run build:rhr      # Generate RHR effect data
npm run build:smoking  # Generate smoking effect data
npm run build:exercise # Generate exercise effect data
npm run build          # Generate all data including new effects
```

All data is automatically validated with Zod schemas and included in the daily NPM publishing pipeline.
