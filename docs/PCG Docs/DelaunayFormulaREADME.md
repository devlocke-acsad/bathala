# Delaunay Corridor Generator: Logic & Method

## Scope

This document explains the logic, heuristics, and computational flow that drive the current Delaunay-based corridor generator used for overworld chunks. It focuses on purpose, operation, and rationale rather than code.

---

## 1. Region Seed Sampling

### 1.1 Rejection Sampling Loop

For a requested number of region anchors, the generator repeatedly samples integer coordinates until the minimum spacing constraint is satisfied. Each candidate is accepted only if its squared Euclidean distance from every already-accepted point meets or exceeds the squared spacing threshold. This produces a Poisson-disc-like distribution on the integer lattice without requiring full dart throwing.

### 1.2 Parameter Effects

- `regionCount` scales the density of corridor anchors.
- `minRegionDistance` governs minimum spacing; reducing it increases clustering and shorter corridors.
- `MAX_REGION_POINT_ATTEMPTS` prevents pathological infinite loops in dense configurations.

### 1.3 Step-by-Step Flow

1. **Sample candidate** `c = (\lfloor U_x·W \rfloor, \lfloor U_y·H \rfloor)` where `U_x, U_y ~ Uniform(0,1)` and `(W, H) = levelSize`.
2. **Compute squared distances** to each accepted seed `p_j`, yielding `d_j^2 = (c_x - p_{j,x})^2 + (c_y - p_{j,y})^2`.
3. **Compare thresholds**: if all `d_j^2 ≥ minRegionDistance^2`, accept `c`; otherwise reject and resample.
4. **Repeat until** `|P| = regionCount` or attempts exceed `MAX_REGION_POINT_ATTEMPTS`, at which point sampling terminates.

---

## 2. Triangulation Approximation

The current implementation substitutes a true Delaunay triangulation with a nearest-neighbor graph that mimics many properties of the Delaunay complex while remaining inexpensive.

### 2.1 Neighbor Selection

For every region anchor, compute Euclidean distances to all others and select the k nearest (typically three). Undirected edges are created to these neighbors, deduplicated consistently. This approximates Delaunay connectivity while staying computationally simple.

### 2.2 Edge Sorting

Before carving paths, edges are sorted by Euclidean length to prioritize local corridors. Short edges produce dense local structure; longer ones are processed later to add breadth once nearby regions are connected.

### 2.3 Step-by-Step Flow

1. **Enumerate distances** `d_{ij}` for every point pair `(p_i, p_j)`.
2. **Select nearest neighbors**: for each `p_i`, sort `{d_{ij}}` ascending and choose indices of the first three elements.
3. **Create canonical edge** `e_{ij} = (min(p_i, p_j), max(p_i, p_j))` to avoid duplicates by coordinate ordering.
4. **Insert edge** into the global set if not already present.
5. **Sort final edge list** `E` by `edgeLength`, producing an ordered processing queue that favors shorter corridors first.

---

## 3. Multi-Waypoint A* Path Carving

For each edge between two anchors, their positions are discretized to grid coordinates. The generator then creates stylistic waypoints before running A*.

### 3.1 Waypoint Heuristics

Depending on Manhattan separation between endpoints, different waypoint styles activate: none for very short spans, an L-shaped detour for short-to-medium spans, a stepped pattern with jitter for medium spans, and a zigzag pattern for long spans. Waypoints segment the path search into smaller goals to create controlled variety: start to waypoint(s) to goal.

### 3.2 A* Cost Model

For each segment, A* operates on a four-directional grid. The total estimated cost equals the path cost so far plus a Manhattan-distance heuristic to the goal. Each move adds a base cost, with a small extra cost when changing direction to encourage straighter corridors. Optionally, traversing existing corridor tiles can reduce cost to promote reuse and interconnection.

### 3.3 Path Reconstruction

Once the goal is reached, parents are traced back to the start to recover discrete coordinates. Consecutive segment overlaps remove duplicates so that waypoint transitions remain continuous.

### 3.4 Step-by-Step Computation Narrative

1. **Solve for vector offsets.** Compute `dx = x_q - x_p` and `dy = y_q - y_p`. These establish the Manhattan separation `D = |dx| + |dy|`, which drives waypoint eligibility.
2. **Choose waypoint style.** If `D < MIN_WAYPOINT_DISTANCE`, the algorithm short-circuits to direct A*. Otherwise, it selects a style (`L`, `step`, or `zigzag`) by drawing a uniform sample over three categories.
3. **Instantiate waypoint coordinates.** For an `L` style, the first waypoint is `(x_q, y_p)` or `(x_p, y_q)` depending on the Bernoulli trial with probability `L_SHAPE_FIRST_AXIS_PROB`. For `step`, the midpoints `(x_p + ⌊dx/2⌋ ± jitter, y_p)` and `(x_mid, y_mid)` are created. For `zigzag`, the algorithm evaluates affine combinations `x_p + ⌊k·dx/3⌋` and `y_p + ⌊k·dy/3⌋` for `k ∈ {1, 2}` to generate a weaving pattern.
4. **Run A* segment-wise.** Starting from `start = p'`, the algorithm dequeues each waypoint `w_i` and invokes `findPathSegment(start, w_i)`. Each invocation sets `g(start) = 0`, `h(start) = |x_start - x_goal| + |y_start - y_goal|`, and pushes `PathNode(start)` onto the open set. Successive expansions add costs `BASE_TILE_COST + Δdir` until the goal tile is reached.
5. **Accumulate path coordinates.** After each segment succeeds, the resulting coordinate list is appended to the global `fullPath`. To prevent duplication, the algorithm pops the first tile of the new segment when it matches the last tile of the previous segment.
6. **Fallback guarantee.** If any segment fails (returns `null`), the procedure re-runs once with the direct target `p' → q'`. This ensures that the generator never leaves an edge uncarved due to infeasible waypoint geometry.

---

## 4. Structural Post-Processing

### 4.1 Double-Wide Block Pruning

To eliminate two-by-two path blocks (room-like spaces), the generator scans for sets of four adjacent corridor tiles. For each detected block, it estimates which tile removal least harms connectivity (favoring the lowest external degree and avoiding straight-corridor cuts), removes that tile, and repeats until no blocks remain or an iteration cap is reached.

### 4.2 Dead-End Extension

Dead ends are corridor tiles with exactly one adjacent corridor. For each, the algorithm extends forward a short distance along the outward direction until it either merges into another corridor (creating a loop) or reaches a cap or boundary. This increases traversal loops without expensive graph analysis.

### 4.3 Step-by-Step Flow

1. **Scan grid** to enumerate all 2×2 path blocks `B`. For each block, compute external degrees `deg_ext(b_k)`.
2. **Attempt removal** by sorting `deg_ext` ascending and temporarily toggling the lowest-degree tile to `REGION_TILE`.
3. **Check connectivity heuristic** via `wouldDisconnectNetwork`; if safe, commit removal; otherwise test the next candidate.
4. **After pruning**, collect all path tiles and identify dead ends where exactly one neighbor is a path.
5. **Extend each dead end** by calculating direction vector `d` toward empty space and iteratively carving `deadEnd + t·d` for `t ∈ [1,5]` until blocked or merged.
6. **Repeat** pruning loop until no changes occur or iteration cap is reached, ensuring corridors remain single-tile wide while reducing dead ends.

---

## 5. Interactions With the Overworld Pipeline

1) Chunk generation configures chunk dimensions, region density, and spacing, then produces the corridor grid.
2) Chunk connectivity scans borders for corridor tiles and creates inter-chunk gateways, optionally widening entrances and adding inward paths.
3) Node placement finds candidate cells with sufficient neighborhood openness and spacing to host encounters and events.
4) Caching stores generated results keyed by chunk coordinates for reuse.
5) Optional debug overlays can visualize chunk boundaries, region anchors, and carved corridors in real time.

### 5.1 Step-by-Step Interaction Narrative

1. **Chunk request**: gameplay code calls `MazeOverworldGenerator.getChunk(chunkX, chunkY, gridSize)`.
2. **Seed resolution**: `RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)` produces `seed`, aligning RNG usage across nodes and future PRNG injection in `DelaunayMazeGenerator`.
3. **Layout generation**: `generateCorridorChunk` configures `DelaunayMazeGenerator` (`levelSize`, `regionCount`, `minRegionDistance`) and calls `generateLayout()` to obtain `IntGrid` corridors.
4. **Connectivity stitching**: `generateConnectionPoints` scans borders for `PATH_TILE`s, converting them into inter-chunk gateways before `ChunkConnectivityManager` applies wider entrances/inward paths.
5. **Node population**: `NodeGenerator.generateOptimizedNodes` evaluates neighborhood openness, spacing, and seeded randomness to distribute NPCs/interactions on walkable cells.
6. **Caching**: `ChunkManager.cacheChunk` stores `{maze, nodes}` keyed by `chunkX,chunkY`, enabling quick retrieval and reuse.
7. **Visualization hooks**: `Overworld_MazeGenManager` queries `visibleChunks` and overlays dev markers referencing the same chunk boundaries, letting designers inspect Delaunay output in real time.

---

## 6. Randomness & Seeding

The system uses deterministic per-chunk seeding so that the same inputs yield the same corridors. Applying the same seed ensures identical region points, neighbor selection, waypoint choices, and path outcomes, enabling reproducible worlds across runs.

### 6.1 Step-by-Step Flow

1) Derive a chunk seed deterministically from chunk coordinates and a global seed.
2) Use a seeded random source consistently so downstream systems (nodes, loot) share the same randomness.
3) Ensure region sampling and waypoint choices use this seeded stream to guarantee identical corridor layouts per chunk.

---

## 7. Complexity Considerations

- **Region sampling**: `O(regionCount^2)` worst-case due to pairwise distance checks; acceptable for current counts (≤ ~200).
- **Triangulation approximation**: `O(regionCount^2)` to compute pairwise distances; storing only 3 edges per node limits edge count to ≈ `3·regionCount`.
- **A* per edge**: `O(gridArea log gridArea)` worst-case, but most paths terminate early due to heuristics and bounded chunk size (`50×50`).
- **Post-processing**: Linear scans over grid (`O(gridArea)`) repeated a constant number of times.

---

## 8. Extension Hooks

- True Delaunay: Replace nearest-neighbor selection with triangle-face connectivity to gain planarity and stronger optimality.
- Weighted edge selection: Bias carving order based on biome tags or chunk metadata for stronger theming.
- Additional A* penalties: Incorporate congestion, node density, or alignment with existing roads.
- PRNG injection: Accept a seeded RNG from the orchestrator to align all stochastic decisions across systems.

---

## 9. Formula Summary Table

Key stages and their purposes:
- Region spacing: Enforce a minimum distance between seeds to avoid clustering.
- Edge length ordering: Sort edges by locality to build local structure first.
- Manhattan heuristic: Guide A* toward goals efficiently on a grid.
- Directional cost accumulation: Control corridor straightness with mild turn penalties.
- Waypoint triggering: Decide when to segment paths for visual variety.
- Double-wide detection: Remove 2×2 corridor blocks to preserve single-width identity.
- Dead-end extension: Promote loops and reduce cul-de-sacs.

---

This reference should provide enough conceptual context to extend, analyze, or refactor the Delaunay corridor generator while maintaining compatibility with the surrounding overworld systems.
