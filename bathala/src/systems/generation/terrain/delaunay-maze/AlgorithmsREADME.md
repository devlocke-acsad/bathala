# Bathala Maze Generation System

## Roadmap & To-Do Snapshot

- **Performance culling** – Add chunk/feature culling strategies to reduce runtime cost.
- **Chunk connection polish** – Fix probability of double roads forming where chunks meet.
- **Dynamic NPC content** – Increase and adapt node/NPC/interaction spawning density.
- **Chunk triggers** – Add lifecycle hooks when chunks are generated or activated.
- **Expose tunables** – Surface more editable variables for designers to tweak generation.
- **DDA integration** – Implement live chunk spawning driven by the adaptive difficulty system.
- **New generation variants** – Add additional generation styles for upcoming chapters/biomes.
- **Generator switching** – Implement easy toggling between available generation pipelines.
- **World-aware AI** – Tune AI navigation and interactions to better leverage generated layouts.

## Overview

The current Bathala maze pipeline is anchored by a Delaunay-triangulation corridor generator orchestrated through `MazeOverworldGenerator`. It produces seeded, chunk-based layouts enriched with roads, connectivity, and node placement. A legacy cellular automata pipeline remains dormant but documented for future biome or mode swaps.

## Architecture Summary

- **Chunk-based world** – The overworld is partitioned into cached, seeded 50×50 chunks for deterministic streaming.
- **`MazeOverworldGenerator`** – High-level coordinator that seeds random generators, invokes maze layout builders, and wires auxiliary systems.
- **Primary generator** – `DelaunayMazeGenerator.ts` produces corridor layouts with pathfinding-aware carving.
- **Supporting systems** – Road creation, chunk-to-chunk connectivity, and node placement enrich each chunk.
- **Legacy generators** – `CellularAutomataMazeGenerator.ts` remains available as an alternate style for future toggles.

## Generation Workflow

### 1. Chunk lifecycle

1. Compute deterministic chunk seed via `RandomUtil.getChunkSeed()`.
2. Retrieve cached data from `ChunkManager` or build a fresh chunk.
3. Populate maze layout, then augment with roads, connections, and nodes.
4. Persist in cache for rapid reuse and region batching.

### 2. Delaunay corridor generation (primary path)

`DelaunayMazeGenerator.generateLayout()` executes the core pipeline:

1. **Seed region points** with minimum spacing constraints.
2. **Triangulate connectivity** using a simplified Delaunay routine.
3. **Prioritize short edges** for localized corridors.
4. **Carve multi-waypoint paths** via A* with directional bias and waypoint styles (L, step, zigzag).
5. **Enforce corridor thinness** by pruning 2×2 path blocks.
6. **Reduce dead ends** through targeted extensions.

Key tunables live at the top of `DelaunayMazeGenerator.ts`, enabling quick iteration on density, spacing, and path heuristics.

### 3. Supporting systems

- **Road network generation (`RoadNetworkGenerator.ts`)**
  - Adds primary and secondary roads using Bresenham lines.
  - Width and frequency are configurable; isolated road cleanup maintains cohesion.

- **Chunk connectivity (`ChunkConnectivityManager.ts`)**
  - Opens chunk-edge gateways and inward corridors with adjustable probability.
  - Deterministic variation by chunk coordinates prevents repetitive patterns.

- **Node placement (`NodeGenerator.ts`)**
  - Finds spacious walkable tiles, distributes points of interest, and assigns encounters (`MapNode`).
  - Node IDs and coordinates are deterministic per chunk.

### 4. Legacy generators (non-Delaunay, dormant)

- **`CellularAutomataMazeGenerator.ts`** produces cave-like noise via a standalone cellular automata pass (no triangulation step).
- Current builds ship with only the Delaunay corridor generator active; cellular automata remains archived for biome swaps or alternate game modes.

## Technologies & Algorithms (current)

- **Seeded RNG (`RandomUtil.ts`)** – Linear congruential generator guarantees reproducible chunks and sharable seeds.
- **A* pathfinding** – Manhattan-heuristic solver with turn penalties ensures reusable corridors.
- **Delaunay triangulation** – Drives high-level corridor topology prior to path carving.
- **Bresenham’s line algorithm** – Efficient road stamping for both major arteries and side streets.

## Legacy Algorithms & Pipelines (inactive)

- **Cellular automata generator** – Independent, non-Delaunay pipeline preserved for organic variants and future biome-specific passes.

## Current Operations (active pipeline)

### Configuration Highlights

- **Chunking** – `chunkSize = 50`; `ChunkManager.maxCachedChunks = 100` keep corridor chunks uniform and cache memory bounded.
- **Delaunay generator** – `levelSize`, `regionCount`, `minRegionDistance`, A* cost weights, and waypoint jitter live at the top of `DelaunayMazeGenerator.ts` for rapid balancing.
- **Connectivity** – `CONNECTION_PROBABILITY`, entrance width, and inward depth tuned in `ChunkConnectivityManager.ts` govern inter-chunk links.
- **Roads** – Density, secondary-road chance, and width constants in `RoadNetworkGenerator.ts` control arterial placement.
- **Nodes** – Edge padding, minimum open neighbors, and spacing controls inside `NodeGenerator.ts` distribute encounters and POIs.

### Caching & Streaming

- LRU-style eviction in `ChunkManager` retains only the most relevant chunks.
- Region batching (`ChunkManager.getChunkRegion()`) accelerates map reveals and preloads.
- Background warm-up utilities preload neighboring chunks without stalling gameplay.

### Active Roadmap Focus

- **Connectivity** – Neighbor-aware linking, biome-specific gateways, and bridge/tunnel generation.
- **Delaunay evolution** – Weighted edges, multi-layer triangulation, and pairing with height maps or Perlin noise.
- **Hybrid pipelines (runtime)** – Dynamic selection between Delaunay variants per biome or story beat.
- **Node systems** – Thematic clustering, difficulty gradients, and narrative-driven node chains.
- **Road networks** – Hierarchical tiers, terrain-aware routing, and wear/aging visuals.
- **Performance** – Web Worker generation, predictive chunk loading, and smarter cache heuristics.
- **Presentation** – Procedural set dressing, ambient FX, and interactive hazards layered atop corridors.

## Legacy Pipeline Notes (inactive)

### Legacy Systems

- **Cellular automata generator** – A standalone noise-based maze builder (`CellularAutomataMazeGenerator.ts`) producing cave-like layouts independent of Delaunay.
- **Status** – Not currently invoked; retained for future biome swaps, roguelite modes, or hybrid experimentation.

### Legacy Configuration Touchpoints

- **Initial fill probability** – Controls wall density before smoothing passes.
- **Iteration count** – Governs how aggressively cellular rules sculpt the maze.
- **Post-processing knobs** – Wall removal thresholds and path-widening rates refine traversability.
- These parameters remain documented in `CellularAutomataMazeGenerator.ts` but are dormant until the pipeline is re-enabled.

### Legacy Roadmap Ideas

- **Algorithm revival** – Parameter sweeps to tune distinct cave biomes or subterranean levels.
- **Hybrid generation** – Blend cellular regions with Delaunay corridors for macro/micro contrast.
- **Themed templates** – Use cellular passes for boss arenas, labyrinth events, or seasonal content.

## Current Limitations

- Chunk connectivity still assumes neighbor presence; fine-grained checks are pending.
- Visual seams may appear when mixing generator styles without transition rules.
- Generation spikes can occur on very large chunks or first-time loads.

## Contributing Guidelines

- **New generators** – Implement a `generateChunk()` / `postProcess()` pair and register once the selection infrastructure returns.
- **New node types** – Extend `NodeType`, update `NodeGenerator`, and wire into scene logic.
- **Parameter tuning** – Modify constants in their respective modules, regenerate reference chunks, and document deltas here.

## Testing

- `testMazeGen.ts` provides a quick CLI harness to validate Delaunay changes:
  - Generates a sample grid, logs tile ratios, and prints ASCII output.
  - Use Node.js execution (`ts-node` or compiled JS) when iterating on generator parameters.

Keep this README updated alongside system changes to maintain a reliable onboarding reference.
