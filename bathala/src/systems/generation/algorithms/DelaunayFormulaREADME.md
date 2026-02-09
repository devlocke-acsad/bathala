# Delaunay Corridor Generator: Mathematical & Technical Notes

## Scope

This document expands on the implementations in `DelaunayMazeGenerator.ts`, `MazeOverworldGenerator.ts`, and the surrounding utilities under `utils/MazeGeneration/`. It captures the formulas, heuristics, and computational flow that drive the current Delaunay-based corridor generator used for overworld chunks.

---

## 1. Region Seed Sampling

### 1.1 Rejection Sampling Loop

For a requested `regionCount`, the generator repeatedly samples integer coordinates until the minimum spacing constraint is satisfied:

```text
attempts < MAX_REGION_POINT_ATTEMPTS
```

Each candidate point `(x_i, y_i)` is accepted only if:

```math
\forall p_j \in P: \; ||(x_i, y_i) - p_j||_2^2 \ge \text{minRegionDistance}^2
```

Where `P` is the already accepted point set. This enforces a Poisson-disc-like distribution on the integer lattice without resorting to full dart throwing.

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

For every seed `p_i`, compute Euclidean distances to all other seeds and select the `k=3` nearest:

```math
 d_{ij} = \sqrt{(x_i - x_j)^2 + (y_i - y_j)^2}
```

Edges are added between `p_i` and the three smallest `d_{ij}` values. The undirected edge set is stored canonically as `(min(p_i, p_j), max(p_i, p_j))` to eliminate duplicates.

### 2.2 Edge Sorting

Before carving paths, edges are sorted by Euclidean length to prioritize local corridors:

```math
\text{edgeLength}(p,q) = \sqrt{(x_q - x_p)^2 + (y_q - y_p)^2}
```

Short edges produce dense local structure; longer edges are processed later, giving breadth to the layout once nearby regions are connected.

### 2.3 Step-by-Step Flow

1. **Enumerate distances** `d_{ij}` for every point pair `(p_i, p_j)`.
2. **Select nearest neighbors**: for each `p_i`, sort `{d_{ij}}` ascending and choose indices of the first three elements.
3. **Create canonical edge** `e_{ij} = (min(p_i, p_j), max(p_i, p_j))` to avoid duplicates by coordinate ordering.
4. **Insert edge** into the global set if not already present.
5. **Sort final edge list** `E` by `edgeLength`, producing an ordered processing queue that favors shorter corridors first.

---

## 3. Multi-Waypoint A* Path Carving

For each edge `(p, q)`, integer coordinates are rounded: `p' = (⌊x_p⌋, ⌊y_p⌋)`, `q' = (⌊x_q⌋, ⌊y_q⌋)`. The generator then creates stylistic waypoints before running A*.

### 3.1 Waypoint Heuristics

Depending on Manhattan separation `D = |dx| + |dy|`, different waypoint styles activate:

- **No waypoint** if `D < MIN_WAYPOINT_DISTANCE`.
- **L-shape**: introduces one orthogonal detour with probability `L_SHAPE_FIRST_AXIS_PROB` of horizontal-first.
- **Step pattern**: adds midpoint perturbations within `±STEP_MIDPOINT_JITTER` tiles.
- **Zigzag**: for `D > ZIGZAG_MIN_DISTANCE`, adds thirds-based control points to emulate weaving corridors.

The waypoint array `W = {w_1, …, w_m}` augments the path search as segmented goals: `p' → w_1 → … → w_m → q'`.

### 3.2 A* Cost Model

For each segment, standard A* operates on a 4-connected grid:

```math
f(n) = g(n) + h(n)
```

- **Heuristic** `h(n)` is Manhattan distance:
  ```math
  h(n) = |x_n - x_{goal}| + |y_n - y_{goal}|
  ```
- **Tile cost** `g(n)` increments by `BASE_TILE_COST (≈1.2)` per move.
- **Direction penalty** `Δdir` adds `DIRECTION_CHANGE_PENALTY (≈0.1)` when the move vector changes:
  ```math
  Δdir = \begin{cases}
  0 & \text{if direction unchanged}\\
  0.1 & \text{otherwise}
  \end{cases}
  ```

Future iterations may reduce `BASE_TILE_COST` to `1.0` when traversing existing `PATH_TILE`s to encourage reuse (not yet active in current code).

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

To eliminate `2×2` path blocks (large rooms) the generator scans for sets of four adjacent coordinates:

```math
B = \{(x, y), (x+1, y), (x, y+1), (x+1, y+1)\}
```

Any block where all members are `PATH_TILE` triggers pruning:

1. Count **external degree** (path neighbors outside `B`) for each member.
2. Sort ascending; attempt to remove the lowest-degree tile.
3. Skip removal if it disconnects a straight corridor (two opposite neighbors or degree ≥ 3).
4. Fall back to removing the smallest-degree tile if no safe option exists.

The iteration repeats up to `MAX_DOUBLE_WIDE_FIX_ITER` times to stabilize.

### 4.2 Dead-End Extension

Dead ends are tiles with exactly one adjacent path. For each, the algorithm attempts to extend forward up to five tiles along the outward vector:

```math
\vec{d} = (x_{dead} - x_{conn}, \; y_{dead} - y_{conn})
```

It carves tiles along `(x_{dead} + k·d_x, y_{dead} + k·d_y)` until it either:

- Hits another corridor, creating a loop, or
- Reaches world bounds or the five-step cap.

This improves traversal loops without complex graph analysis.

### 4.3 Step-by-Step Flow

1. **Scan grid** to enumerate all 2×2 path blocks `B`. For each block, compute external degrees `deg_ext(b_k)`.
2. **Attempt removal** by sorting `deg_ext` ascending and temporarily toggling the lowest-degree tile to `REGION_TILE`.
3. **Check connectivity heuristic** via `wouldDisconnectNetwork`; if safe, commit removal; otherwise test the next candidate.
4. **After pruning**, collect all path tiles and identify dead ends where exactly one neighbor is a path.
5. **Extend each dead end** by calculating direction vector `d` toward empty space and iteratively carving `deadEnd + t·d` for `t ∈ [1,5]` until blocked or merged.
6. **Repeat** pruning loop until no changes occur or iteration cap is reached, ensuring corridors remain single-tile wide while reducing dead ends.

---

## 5. Interactions With the Overworld Pipeline

1. **Chunk Generation** (`MazeOverworldGenerator.generateCorridorChunk`):
   - Sets `levelSize`, dense `regionCount`, and `minRegionDistance` per chunk.
   - Invokes `generateLayout()` to obtain an `IntGrid` of `PATH_TILE`/`REGION_TILE` values.

2. **Chunk Connectivity** (`generateConnectionPoints`, `ChunkConnectivityManager`):
   - After carving paths, border scans locate `PATH_TILE`s to create deterministic inter-chunk gateways.
   - Additional adjustments may widen or offset entrances; planned future work adds probability control using chunk coordinates.

3. **Node Placement** (`NodeGenerator.generateOptimizedNodes`):
   - Uses the carved grid to find candidate cells with neighborhood openness ≥ threshold. Map nodes (NPCs, shops, events) inherit the deterministic chunk seed.

4. **Caching** (`ChunkManager`):
   - Generated `maze` arrays are cached by chunk key. Seeds from `RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)` ensure reproducibility.

5. **Runtime Visualization** (`Overworld_MazeGenManager.ts`):
   - Dev mode overlays (outer tile markers) rely on chunk boundaries and region lookups to visualize the Delaunay output.

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

Although the Delaunay generator currently uses `Math.random()`, chunk orchestration seeds deterministic PRNGs through `RandomUtil`. Extending the generator to accept an injected RNG would allow per-chunk repeatability:

```text
seed = RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)
```

Applying the same seed ensures identical region points, triangulation, and A* path choices, enabling reproducible worlds across runs.

### 6.1 Step-by-Step Flow

1. **Derive chunk seed** using `RandomUtil.getChunkSeed`, typically a hash over `(chunkX, chunkY, globalSeed)`.
2. **Instantiate PRNG** via `RandomUtil.createSeededRandom(seed)`; downstream systems (nodes, loot) pull random values from this generator.
3. **Future integration**: once `DelaunayMazeGenerator` accepts an injected RNG, region point sampling and waypoint decisions will use the same seeded stream, guaranteeing identical corridor layouts per chunk.

---

## 7. Complexity Considerations

- **Region sampling**: `O(regionCount^2)` worst-case due to pairwise distance checks; acceptable for current counts (≤ ~200).
- **Triangulation approximation**: `O(regionCount^2)` to compute pairwise distances; storing only 3 edges per node limits edge count to ≈ `3·regionCount`.
- **A* per edge**: `O(gridArea log gridArea)` worst-case, but most paths terminate early due to heuristics and bounded chunk size (`50×50`).
- **Post-processing**: Linear scans over grid (`O(gridArea)`) repeated a constant number of times.

---

## 8. Extension Hooks

- **True Delaunay**: Swap `createSimpleTriangulation` for a library (e.g., Delaunator). Replace distance-based neighbor selection with actual triangle faces.
- **Weighted Edge Selection**: Introduce weights `w_{pq}` to bias corridor carving order, e.g., based on biome tags or chunk metadata.
- **A* Penalties**: Integrate additional cost terms such as congestion, node density, or alignment with existing roads.
- **PRNG Injection**: Accept a seeded RNG from `MazeOverworldGenerator` to avoid global `Math.random` usage and align all stochastic decisions.

---

## 9. Formula Summary Table

| Stage | Formula / Heuristic | Purpose |
|-------|---------------------|---------|
| Region spacing | `||p_i - p_j||_2^2 ≥ minRegionDistance^2` | Enforce minimum seed distance |
| Edge length | `√((x_q - x_p)^2 + (y_q - y_p)^2)` | Sort edges by locality |
| Manhattan heuristic | `|x - x_goal| + |y - y_goal|` | A* admissible heuristic |
| Cost accumulation | `g_{new} = g_{curr} + BASE_TILE_COST + Δdir` | Control corridor straightness |
| Waypoint trigger | `D ≥ MIN_WAYPOINT_DISTANCE` | Decide if segmented path is needed |
| Double-wide detection | All tiles in `B` are PATH | Identify 2×2 corridors |
| Dead-end vector | `d = deadEnd - connection` | Extend corridor forward |

---

This reference should provide enough mathematical and implementation context to extend, analyze, or refactor the Delaunay corridor generator while maintaining compatibility with the surrounding overworld systems.
