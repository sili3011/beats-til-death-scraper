import { z } from 'zod';

export const LifeRow = z.object({
  country_code: z.string().length(3),     // ISO3
  country_name: z.string(),
  year: z.number().int().min(1950).max(2100),
  life_expectancy: z.number().min(0).max(120), // years
  source: z.string(),                      // 'worldbank' | 'who' | ...
  retrieved_at: z.string()                 // ISO date
});
export type LifeRow = z.infer<typeof LifeRow>;

// Resting Heart Rate Effect Schema
export const RhrEffectSchema = z.object({
  neutral_bpm: z.number(),
  hr_per_10bpm: z.object({
    low: z.number(),
    mid: z.number(),
    high: z.number()
  }),
  bands: z.array(z.object({
    min: z.number(),
    max: z.number(),
    rr_allcause: z.number()
  })),
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string()
});
export type RhrEffect = z.infer<typeof RhrEffectSchema>;

// Smoking Effect Schema
export const SmokingEffectSchema = z.object({
  current_vs_never_years: z.tuple([z.number(), z.number()]), // [low, high]
  quit_gain_years_after_5: z.number(),
  quit_gain_years_after_10: z.number(),
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string()
});
export type SmokingEffect = z.infer<typeof SmokingEffectSchema>;

// Exercise Effect Schema
export const ExerciseEffectSchema = z.object({
  none: z.number(),
  mod_150min_week_gain: z.number(),
  high_300min_week_gain: z.number(),
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string()
});
export type ExerciseEffect = z.infer<typeof ExerciseEffectSchema>;

// Legacy Effects Schema (keeping for backward compatibility)
export const EffectsSchema = z.object({
  smoking: z.object({
    current_vs_never_years: z.tuple([z.number(), z.number()]).optional(), // [low, high]
    quit_gain_years_after_5: z.number().optional()
  }),
  exercise: z.object({
    mod_150min_week_gain: z.number().optional(),
    high_300min_week_gain: z.number().optional()
  }),
  alcohol: z.object({
    heavy_vs_moderate_years: z.number().optional()
  }),
  diet: z.object({
    mediterranean_adherence_gain: z.number().optional()
  }),
  notes: z.string().optional(),
  citations: z.array(z.string())
});
export type Effects = z.infer<typeof EffectsSchema>;