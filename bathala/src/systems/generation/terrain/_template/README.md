# How to Create a New Terrain Type

## Quick Start

1. **Copy this `_template/` folder** into `terrain/` with your terrain name:
   ```
   terrain/
   ├── _template/           ← you are here
   ├── delaunay-maze/       ← existing: Act 1
   └── your-terrain-name/   ← create this
   ```

2. **Rename the files** following the naming convention:
   ```
   _TemplateAlgorithm.ts  →  YourTerrainAlgorithm.ts
   _TemplateGenerator.ts  →  YourTerrainGenerator.ts
   ```

3. **Rename the classes** inside each file to match.

4. **Implement your terrain logic** in the Algorithm file.

5. **Export** from `terrain/index.ts`:
   ```ts
   export { YourTerrainChunkGenerator } from './your-terrain-name/YourTerrainGenerator';
   ```

6. **Wire into an Act** in your `ActDefinition.createGenerator()`:
   ```ts
   createGenerator(): IChunkGenerator {
     return new YourTerrainChunkGenerator({ chunkSize: 20 });
   }
   ```

---

## Architecture

Each terrain folder contains exactly **two files**:

| File | Purpose | Rules |
|------|---------|-------|
| `[Name]Algorithm.ts` | Pure generation math | No Phaser. No game entities. Deterministic via RNG. |
| `[Name]Generator.ts` | `IChunkGenerator` adapter | Wraps algorithm. Returns `RawChunk`. Calls `findBorderConnections()`. |

```
OverworldGenerator
  └── calls IChunkGenerator.generate()
        └── [Name]Generator.ts (adapter)
              └── [Name]Algorithm.ts (math)
                    └── optionally uses components/ (CellularAutomata, RoadNetwork, etc.)
```

---

## Using Building Blocks

You do NOT need to write everything from scratch. Import reusable
sub-algorithms from `components/`:

```ts
import { CellularAutomataAlgorithm } from '../../components';
import { RoadNetworkAlgorithm } from '../../components';
```

Example: Create open caverns by composing CellularAutomata with custom params:
```ts
const ca = new CellularAutomataAlgorithm({
  fillProbability: 0.35,
  iterations: 6,
  pathWideningChance: 0.4,
});
const grid = ca.generate(width, height, rng);
```

---

## Using Shared Utilities

Data structures and utility functions live in `shared/`:

```ts
import { IntGrid } from '../../shared';
import { findBorderConnections } from '../../shared';
import { createSeededRNG } from '../../shared';
```

---

## Naming Convention

| Item | Convention | Example |
|------|-----------|---------|
| Folder | `kebab-case` | `delaunay-maze/`, `sky-island/` |
| Algorithm file | `PascalCase` + `Algorithm` | `SkyIslandAlgorithm.ts` |
| Generator file | `PascalCase` + `Generator` | `SkyIslandGenerator.ts` |
| Algorithm class | `PascalCase` + `Algorithm` | `class SkyIslandAlgorithm` |
| Generator class | `PascalCase` + `ChunkGenerator` | `class SkyIslandChunkGenerator` |
| Config interface | `PascalCase` + `Config` | `interface SkyIslandConfig` |

---

## Checklist

- [ ] Algorithm uses `rng.next()` for ALL random decisions (never `Math.random()`)
- [ ] Algorithm has zero Phaser/game imports
- [ ] Generator calls `findBorderConnections()` from `shared/`
- [ ] Generator implements `IChunkGenerator` interface
- [ ] Exported from `terrain/index.ts`
- [ ] Wired into an `ActDefinition.createGenerator()`
