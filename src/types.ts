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
  , references: z.array(z.object({ title: z.string(), url: z.string().url() })).optional()
});
export type SmokingEffect = z.infer<typeof SmokingEffectSchema>;

// Exercise Effect Schema
export const ExerciseEffectSchema = z.object({
  none: z.number(),
  mod_150min_week_gain: z.number(),
  high_300min_week_gain: z.number(),
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string(),
  references: z.array(z.object({ title: z.string(), url: z.string().url() })).optional()
});
export type ExerciseEffect = z.infer<typeof ExerciseEffectSchema>;

// Alcohol Consumption Data Schema
export const AlcoholRow = z.object({
  country_code: z.string().length(3),     // ISO3
  country_name: z.string(),
  year: z.number().int().min(1950).max(2100),
  alcohol_consumption: z.number().min(0).max(50), // liters of pure alcohol per capita
  source: z.string(),                      // 'who' | 'worldbank' | ...
  retrieved_at: z.string()                 // ISO date
});
export type AlcoholRow = z.infer<typeof AlcoholRow>;

// Alcohol Effect Schema
export const AlcoholEffectSchema = z.object({
  none: z.number(),                        // 0 consumption baseline
  light_years_gain: z.number(),           // light consumption benefit
  light_consumption_range: z.tuple([z.number(), z.number()]), // [min, max] liters
  moderate_years_gain: z.number(),        // moderate consumption effect
  moderate_consumption_range: z.tuple([z.number(), z.number()]), // [min, max] liters
  heavy_vs_moderate_years: z.number(),    // years lost from heavy vs moderate
  heavy_consumption_threshold: z.number(), // liters threshold for heavy drinking
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string(),
  references: z.array(z.object({ title: z.string(), url: z.string().url() })).optional()
});
export type AlcoholEffect = z.infer<typeof AlcoholEffectSchema>;

// BMI/Weight Data Schema
export const BMIRow = z.object({
  country_code: z.string().length(3),     // ISO3
  country_name: z.string(),
  year: z.number().int().min(1950).max(2100),
  obesity_prevalence: z.number().min(0).max(100), // percentage of population BMI >= 30
  overweight_prevalence: z.number().min(0).max(100).optional(), // percentage BMI >= 25
  source: z.string(),                      // 'who' | 'worldbank' | 'oecd' | ...
  retrieved_at: z.string()                 // ISO date
});
export type BMIRow = z.infer<typeof BMIRow>;

// BMI/Weight Effect Schema
export const WeightEffectSchema = z.object({
  normal_bmi: z.tuple([z.number(), z.number()]), // [min, max] BMI range
  overweight_years_lost: z.number(),      // years lost from being overweight (BMI 25-30)
  obese_years_lost: z.number(),           // years lost from obesity (BMI >= 30)
  severely_obese_years_lost: z.number(),  // years lost from severe obesity (BMI >= 35)
  citations: z.array(z.string()),
  retrieved_at: z.string(),
  notes: z.string(),
  references: z.array(z.object({ title: z.string(), url: z.string().url() })).optional()
});
export type WeightEffect = z.infer<typeof WeightEffectSchema>;

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
