# Start Here: Add A New Level Algorithm

This folder is a starter kit for creating one new algorithm pipeline.

Language Guide:
- `Algorithm` = Terrain Logic file (the math that shapes tiles).
- `ChunkAdapter` = Chunk Adapter file (the wrapper that plugs logic into the pipeline).
- Think: "recipe" (`Algorithm`) + "plug" (`ChunkAdapter`).

Naming note:
- The system interface is still named `IChunkGenerator` for compatibility.
- Your concrete file/class should use `ChunkAdapter` naming.

Notice:
- Keep `_start-here` as a template only.
- Do not import `_Template*` files directly in production code.
- Copy this folder and rename everything for your level.

## Quick Start

1. Copy `_start-here/` to `algorithms/your-level-name/`.
2. Rename files:
   ```
   _TemplateAlgorithm.ts -> YourLevelAlgorithm.ts
  _TemplateChunkAdapter.ts -> YourLevelChunkAdapter.ts
   ```
3. Rename classes and config interfaces to match file names.
4. Implement generation logic in `YourLevelAlgorithm.ts`.
5. Export your chunk adapter in `algorithms/index.ts`.
6. Return it from `ActDefinition.createGenerator()`.

Quick mental model:
- Edit `YourLevelAlgorithm.ts` when you want different terrain behavior.
- Edit `YourLevelChunkAdapter.ts` when you need to change chunk packaging, config wiring, or border connection handling.

Example export:
```ts
export { YourLevelChunkAdapter } from './your-level-name/YourLevelChunkAdapter';
```

Example Act wiring:
```ts
createGenerator(): IChunkGenerator {
  return new YourLevelChunkAdapter({ chunkSize: 20 });
}
```

---

## Folder Intent Map

Use this when deciding where new code should live:

| Folder | Why It Exists | What Goes Here | What Does NOT Go Here |
|------|------|------|------|
| `algorithms/` | One pipeline per level/biome | `[Name]Algorithm.ts` (Terrain Logic) + `[Name]ChunkAdapter.ts` (Chunk Adapter) | Shared helpers used by many algorithms |
| `toolbox/` | Reusable map-generation building blocks | `CaveGenerator`, `RoadCarver`, `IntGrid`, RNG helpers | Level-specific logic for one act only |
| `node-spawning/` | Decides what map nodes appear | placement logic, resolver strategies | Terrain grid math |
| `core/` | Generation orchestration and contracts | `OverworldGenerator`, cache, border connectivity | Act-specific algorithm implementation |

---

## Why Two Files Per Algorithm

Each algorithm folder should contain exactly two primary files:

| File | Purpose | Rules |
|------|---------|-------|
| `[Name]Algorithm.ts` | Terrain Logic (pure grid math) | No Phaser. No entities. Deterministic via RNG. |
| `[Name]ChunkAdapter.ts` | Chunk Adapter (`IChunkGenerator`) | Calls logic, builds `RawChunk`, finds border connections. |

Pipeline shape:
```
OverworldGenerator
  -> IChunkGenerator.generate()
      -> [Name]ChunkAdapter.ts
          -> [Name]Algorithm.ts
              -> optional toolbox helpers
```

---

## Imports You Will Commonly Use

Building blocks:
```ts
import { CaveGenerator } from '../../toolbox/CaveGenerator';
import { RoadCarver } from '../../toolbox/RoadCarver';
```

Utilities:
```ts
import { IntGrid } from '../../toolbox/IntGrid';
import { createSeededRNG } from '../../toolbox/SeededRNG';
import { findBorderConnections } from '../../core/BorderConnections';
```

---

## Naming Convention

| Item | Convention | Example |
|------|-----------|---------|
| Algorithm folder | `kebab-case` | `delaunay-maze/`, `sky-island/` |
| Terrain Logic file | `PascalCase` + `Algorithm` | `SkyIslandAlgorithm.ts` |
| Chunk Adapter file | `PascalCase` + `ChunkAdapter` | `SkyIslandChunkAdapter.ts` |
| Algorithm class | `PascalCase` + `Algorithm` | `class SkyIslandAlgorithm` |
| Chunk Adapter class | `PascalCase` + `ChunkAdapter` | `class SkyIslandChunkAdapter` |
| Config interface | `PascalCase` + `Config` | `interface SkyIslandConfig` |

---

## Completion Checklist

- [ ] Algorithm uses `rng.next()` for all randomness (never `Math.random()`).
- [ ] Terrain Logic file has no Phaser or gameplay entity imports.
- [ ] Chunk Adapter file implements `IChunkGenerator`.
- [ ] Chunk Adapter file calls `findBorderConnections()` from `core/BorderConnections`.
- [ ] Chunk Adapter is exported from `algorithms/index.ts`.
- [ ] Act `createGenerator()` returns your new chunk adapter.
