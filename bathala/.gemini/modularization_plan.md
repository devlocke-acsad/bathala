# Generation System — Module Architecture

## Final Directory Structure ✅

```
systems/generation/
│
├── terrain/                              — COMPLETE TERRAIN PIPELINES
│   │                                       Each subfolder = one terrain type.
│   │                                       Contains: Algorithm + Generator pair.
│   │
│   ├── _template/                        — Copy this folder to create new terrain
│   │   ├── README.md                     — Step-by-step guide + naming convention
│   │   ├── _TemplateAlgorithm.ts         — Boilerplate: pure generation math
│   │   └── _TemplateGenerator.ts         — Boilerplate: IChunkGenerator adapter
│   │
│   ├── delaunay-maze/                    — Act 1: Delaunay triangulation corridors
│   │   ├── DelaunayMazeAlgorithm.ts      — Core math (Delaunay + A* pathfinding)
│   │   ├── DelaunayMazeGenerator.ts      — IChunkGenerator adapter
│   │   ├── DelaunayFormulaREADME.md      — Technical documentation
│   │   └── AlgorithmsREADME.md           — Algorithm overview
│   │
│   └── index.ts                          — Barrel exports for all terrain types
│
├── components/                           — REUSABLE BUILDING BLOCKS
│   │                                       Mix-and-match into terrain pipelines.
│   │
│   ├── CellularAutomata.ts               — Cave-like noise via cellular automata
│   ├── RoadNetwork.ts                    — Road carving via Bresenham's lines
│   └── index.ts
│
├── shared/                               — DATA STRUCTURES & UTILITIES
│   ├── IntGrid.ts                        — 2D integer grid (0=path, 1=wall)
│   ├── BorderConnections.ts              — Chunk-edge opening detection
│   ├── SeededRNG.ts                      — Mulberry32 PRNG + chunk hashing
│   └── index.ts
│
├── population/                           — NODE PLACEMENT
│   ├── NodePopulator.ts                  — Strategy-driven node placement
│   ├── NodePlacementStrategy.ts          — Spatial algorithms
│   └── strategies/                       — Content resolution strategies
│       ├── INodeResolver.ts              — Interface
│       ├── EnemyNodeResolver.ts          — Combat/elite selection
│       ├── EventNodeResolver.ts          — Event selection
│       └── DefaultNodeResolver.ts        — Fallback (shop, campfire, etc.)
│
├── connectivity/                         — CHUNK STITCHING
│   └── ChunkConnectivityManager.ts       — Border alignment + validation
│
├── orchestration/                        — HIGH-LEVEL COORDINATORS
│   ├── OverworldGenerator.ts             — Composes cache + populator + generator
│   └── ChunkCache.ts                     — LRU chunk cache
│
├── MazeGenSystem.ts                      — Scene rendering + enemy AI (Phase 2)
└── index.ts                              — Master barrel export
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Terrain folder | `kebab-case` | `delaunay-maze/`, `sky-island/` |
| Algorithm file | PascalCase + `Algorithm` | `SkyIslandAlgorithm.ts` |
| Generator file | PascalCase + `Generator` | `SkyIslandGenerator.ts` |
| Algorithm class | PascalCase + `Algorithm` | `class SkyIslandAlgorithm` |
| Generator class | PascalCase + `ChunkGenerator` | `class SkyIslandChunkGenerator` |
| Component file | PascalCase (technique name) | `CellularAutomata.ts` |
| Shared utility | PascalCase (noun) | `IntGrid.ts`, `BorderConnections.ts` |

## How It Connects to a Level

```
ActDefinition.createGenerator()
  → returns an IChunkGenerator from terrain/[name]/
    → OverworldGenerator calls .generate() per chunk
      → Algorithm produces grid → Generator wraps it → NodePopulator adds content
```

## Developer Workflow: "I need new terrain for Act 2"

1. Copy `terrain/_template/` → `terrain/archipelago/`
2. Rename files: `ArchipelagoAlgorithm.ts`, `ArchipelagoGenerator.ts`
3. Optionally import building blocks from `components/`
4. Export from `terrain/index.ts`
5. Wire in `Act2Definition.createGenerator()`

## Phase 2 — Remaining Work

1. Decompose `MazeGenSystem.ts` (~1400 lines) into focused renderers
2. Create terrain types for Act 2 & 3
3. Add unit tests for strategy pattern components
