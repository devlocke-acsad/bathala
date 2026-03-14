# Procedural Generation System

> **New here?** Read this file first. It tells you WHERE everything is, WHAT it does, and HOW to add your own.

---

## How the PCG Pipeline Works (End-to-End)

When the player enters the Overworld, this is what happens:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. Overworld.ts (game scene)                                           │
│     Creates OverworldGenerator from an ActDefinition (e.g. ACT1)        │
│     Creates MazeGenSystem and passes the OverworldGenerator to it       │
│                                                                         │
│  2. OverworldGenerator  [core/]                                         │
│     Per-chunk coordinator. When a chunk is needed:                       │
│     ┌─────────────────────────────────────────────────────────┐         │
│     │  a) Creates a seeded RNG from chunk coordinates         │         │
│     │  b) Calls IChunkGenerator.generate() → terrain grid     │         │
│     │  c) Calls NodePopulator.populate() → enemy/shop/event   │         │
│     │  d) Caches the result in ChunkCache (LRU)               │         │
│     └─────────────────────────────────────────────────────────┘         │
│                                                                         │
│  3. IChunkGenerator  [algorithms/]                                      │
│     Each Act has its own terrain type. Currently:                        │
│     • delaunay-maze/ → Delaunay triangulation + A* corridors (Act 1)   │
│                                                                         │
│  4. MazeGenSystem (scene-level renderer)                                │
│     Takes terrain grids and renders them with Phaser sprites.           │
│     Also handles enemy AI movement and chunk visibility culling.        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Folder Map

```
systems/generation/
│
├── algorithms/              ← 🎯 START HERE — one folder per level
│   ├── _start-here/         ← Copy this folder to create a new algorithm
│   │   ├── README.md        ← Step-by-step guide with checklist
│   │   ├── _TemplateAlgorithm.ts    ← Boilerplate: Terrain Logic (pure math)
│   │   └── _TemplateChunkAdapter.ts ← Boilerplate: Chunk Adapter (pipeline wrapper)
│   ├── delaunay-maze/       ← Act 1: Forest maze corridors (reference example)
│   │   ├── DelaunayMazeAlgorithm.ts   ← Core math (Delaunay + A*)
│   │   └── DelaunayMazeChunkAdapter.ts ← Pipeline adapter
│   └── index.ts
│
├── toolbox/                 ← 🔧 REUSABLE BUILDING BLOCKS
│   │                          Import these INSIDE your algorithm
│   ├── IntGrid.ts           ← 2D grid data structure (0=path, 1=wall)
│   ├── SeededRNG.ts         ← Deterministic random numbers
│   ├── CaveGenerator.ts     ← Cave-like terrain (cellular automata)
│   ├── RoadCarver.ts        ← Road corridors (Bresenham's line drawing)
│   └── index.ts
│
├── node-spawning/           ← 📍 WHAT INTERACTIVE THINGS APPEAR ON MAPS
│   ├── NodePopulator.ts     ← Orchestrator: where + what to place
│   ├── NodePlacement.ts     ← Spatial algorithms (valid tiles, spacing)
│   └── resolvers/           ← What entity each node type becomes
│       ├── INodeResolver.ts       ← Interface contract
│       ├── EnemyNodeResolver.ts   ← Picks enemy ID from pool
│       ├── EventNodeResolver.ts   ← Picks event ID from pool
│       └── DefaultNodeResolver.ts ← Shops, campfires, treasure
│
├── core/                    ← ⚙️  PIPELINE INFRASTRUCTURE (rarely touched)
│   ├── OverworldGenerator.ts ← Main coordinator (composes everything)
│   ├── ChunkCache.ts         ← LRU cache for generated chunks
│   ├── BorderConnections.ts  ← Detects walkable openings at chunk edges
│   └── ChunkConnectivity.ts  ← Ensures chunks connect to each other
│
├── MazeGenSystem.ts         ← SCENE RENDERER (Phaser sprites, enemy AI, culling)
└── index.ts                 ← Barrel export (import everything from here)
```

---

## Common Tasks

### "I need a new terrain type for Act 2"

Mental model:
- `Algorithm` file = terrain logic (how tiles are shaped).
- `ChunkAdapter` file = chunk adapter (how logic is wired into `IChunkGenerator`).

1. Copy `algorithms/_start-here/` → `algorithms/sunken-barangay/`
2. Rename files: `SunkenBarangayAlgorithm.ts`, `SunkenBarangayChunkAdapter.ts`
3. Rename classes inside to match
4. Implement your generation logic in the Algorithm file
5. Export from `algorithms/index.ts`
6. Return it from `Act2Definition.createGenerator()`

See `algorithms/_start-here/README.md` for the full checklist.

### "I want to reuse part of an existing algorithm"

Import building blocks from `toolbox/`:

```ts
// Inside your Algorithm file:
import { CaveGenerator } from '../../toolbox/CaveGenerator';
import { RoadCarver } from '../../toolbox/RoadCarver';

// Use CaveGenerator for base terrain noise
const cave = new CaveGenerator({ fillProbability: 0.35 });
const grid = cave.generate(width, height, rng);

// Then carve roads on top
const roads = new RoadCarver({ roadWidth: 3 });
roads.generate(grid, width, height, rng);
```

### "I want to add a new building block"

1. Create your file in `toolbox/` (e.g., `FloodFill.ts`)
2. Export from `toolbox/index.ts`
3. Import it in any Algorithm that needs it

### "I need a new node type (e.g., boss, NPC)"

1. Create a new resolver in `node-spawning/resolvers/` (e.g., `BossNodeResolver.ts`)
2. Implement the `INodeResolver` interface
3. Register it in `core/OverworldGenerator.ts` constructor

---

## Naming Conventions

| What | Convention | Example |
|------|-----------|---------|
| Algorithm folder | `kebab-case` | `delaunay-maze/`, `sunken-barangay/` |
| Terrain Logic file | `PascalCase` + `Algorithm` | `SunkenBarangayAlgorithm.ts` |
| Chunk Adapter file | `PascalCase` + `ChunkAdapter` | `SunkenBarangayChunkAdapter.ts` |
| Algorithm class | `PascalCase` + `Algorithm` | `class SunkenBarangayAlgorithm` |
| Chunk Adapter class | `PascalCase` + `ChunkAdapter` | `class SunkenBarangayChunkAdapter` |
| Toolbox file | `PascalCase` (what it does) | `CaveGenerator.ts`, `RoadCarver.ts` |
| Utility file | `PascalCase` (noun) | `IntGrid.ts`, `SeededRNG.ts` |

---

## Key Rules

1. **NEVER use `Math.random()`** — always use the injected `rng.next()` for deterministic generation
2. **Terrain Logic files (`*Algorithm.ts`) = pure math** — no Phaser imports, no game entity references
3. **Chunk Adapter files (`*ChunkAdapter.ts`) = adapters** — they wrap Terrain Logic and return `RawChunk`
4. **Every Chunk Adapter must call `findBorderConnections()`** from `core/` — this is how chunks connect
5. **One algorithm folder = one complete pipeline** — Algorithm + ChunkAdapter, always paired

---

## How Terrain Connects to a Level (Act)

```
src/acts/act1/Act1Definition.ts
  └── createGenerator(): IChunkGenerator {
        return new DelaunayMazeChunkAdapter({ chunkSize: 20 });
      }

src/game/scenes/Overworld.ts
  └── const overworldGen = new OverworldGenerator(ACT1);
      this.mazeGenManager = new MazeGenSystem(this, 32, devMode, overworldGen);
```

When adding Act 2, you'd create `Act2Definition` with `createGenerator()` returning your new chunk adapter.
