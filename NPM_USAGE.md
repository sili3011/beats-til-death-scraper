# @sili3011/lifedata — Usage

## Install

```bash
npm install @sili3011/lifedata
```

## ESM (recommended)

```js
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
} from '@sili3011/lifedata';

console.log(lifeExpectancy.length, metadata.version);
```

## CommonJS

This package is ESM-only. In CJS, use dynamic import:

```js
(async () => {
  const lifedata = await import('@sili3011/lifedata');
  const { lifeExpectancy, rhrEffect } = lifedata;
  console.log(lifeExpectancy[0], rhrEffect?.neutral_bpm);
})();
```

## Exports

- `lifeExpectancy: LifeRow[]`
- `rhrEffect: RhrEffect | null`
- `smokingEffect: SmokingEffect | null`
- `exerciseEffect: ExerciseEffect | null`
- `alcoholEffect: AlcoholEffect | null`
- `weightEffect: WeightEffect | null`
- `lifestyleEffects: Effects` (legacy)
- `metadata: Metadata`
- `getAllData(): { ... }`

## Types

TypeScript consumers get bundled declarations from `data/latest/index.d.ts`.

