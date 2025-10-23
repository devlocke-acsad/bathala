# Delaunay Corridor Generator: Mathematical & Technical Documentation

## Scope

This document provides detailed mathematical formulas, computations, and calculations used in `DelaunayMazeGenerator.ts` and related utilities under `utils/MazeGeneration/`. Each formula includes comprehensive variable definitions and explanations of its role in the procedural generation system.

---

## 1. Region Point Sampling System

### What It Is
The region point sampling system generates seed points that serve as anchor locations for the maze corridor network. These points are distributed across the grid with enforced minimum spacing to prevent clustering.

### What It Does For The System
- Creates anchor points that define where corridor networks will connect
- Ensures even distribution of pathways across the play area
- Prevents overcrowding that would create visually unappealing dense mazes
- Provides the foundation for the triangulation and path-finding stages

### Distance Check Formula

```math
distanceSq = (x_new - x_existing)² + (y_new - y_existing)²
```

**Condition:** `distanceSq >= minRegionDistance²`

#### Variables
- **`distanceSq`** (number): The squared Euclidean distance between two points; using squared distance avoids expensive square root calculations while preserving comparison ordering
- **`x_new`** (number): The x-coordinate of the newly sampled candidate point being evaluated
- **`y_new`** (number): The y-coordinate of the newly sampled candidate point being evaluated  
- **`x_existing`** (number): The x-coordinate of an already-accepted seed point in the set
- **`y_existing`** (number): The y-coordinate of an already-accepted seed point in the set
- **`minRegionDistance`** (number): The minimum allowed spacing between any two seed points; default value is 4 tiles

#### Rationale
Using squared distance comparison (`distanceSq >= minRegionDistance²`) is mathematically equivalent to comparing actual distances but computationally cheaper. The square root operation is expensive and unnecessary since:
- If `a² >= b²` then `√(a²) >= √(b²)` 
- Squaring both sides preserves the inequality relationship

#### Expected Output
- Returns `true` when candidate point is far enough from all existing points
- Returns `false` when candidate is too close, triggering rejection and resampling
- Process continues until `regionCount` points are accepted or `MAX_REGION_POINT_ATTEMPTS` (1000) is exceeded

---

## 2. Triangulation Approximation

### What It Is
A simplified nearest-neighbor triangulation that approximates Delaunay triangulation properties by connecting each seed point to its three closest neighbors, then sorting the resulting edges by length. This creates a network of edges that will become corridor paths, processed in order from shortest to longest.

### What It Does For The System
- Establishes connectivity relationships between region seed points
- Creates a graph structure defining which regions should have direct corridor connections
- Provides natural-looking path networks without the computational complexity of true Delaunay triangulation
- Generates edges that can be sorted by length to prioritize local connections

### 2.1 Neighbor Selection - Euclidean Distance Formula

```math
distance = √[(x_i - x_j)² + (y_i - y_j)²]
```

#### Variables
- **`distance`** (number): The straight-line Euclidean distance between two points in 2D space
- **`x_i`** (number): The x-coordinate of the first point (seed point being processed)
- **`y_i`** (number): The y-coordinate of the first point (seed point being processed)
- **`x_j`** (number): The x-coordinate of the second point (potential neighbor being evaluated)
- **`y_j`** (number): The y-coordinate of the second point (potential neighbor being evaluated)

#### Rationale
Full square root calculation is required here (unlike region sampling) because:
- Values are sorted to find the 3 nearest neighbors
- Relative ordering matters, not just threshold comparison
- The computation happens once per point pair during triangulation setup

#### Expected Output
- Array of distance values for all point pairs
- Used to sort and select the k=3 nearest neighbors for each point
- Creates edges between each point and its three closest neighbors

#### Step-by-Step Flow
1. **Enumerate distances** `d_ij` for every point pair `(p_i, p_j)`
2. **Select nearest neighbors**: for each `p_i`, sort distances ascending and choose indices of the first three
3. **Create canonical edge** `e_ij = (min(p_i, p_j), max(p_i, p_j))` to avoid duplicates
4. **Insert edge** into the global set if not already present

---

### 2.2 Edge Sorting - Edge Length Calculation

### 2.2 Edge Sorting - Edge Length Calculation

```math
edgeLength = √[(x_q - x_p)² + (y_q - y_p)²]
```

#### Variables
- **`edgeLength`** (number): The Euclidean distance between two endpoints of an edge, used for sorting the edge processing queue
- **`x_p`** (number): The x-coordinate of the first endpoint (point p) of the edge
- **`y_p`** (number): The y-coordinate of the first endpoint (point p) of the edge
- **`x_q`** (number): The x-coordinate of the second endpoint (point q) of the edge
- **`y_q`** (number): The y-coordinate of the second endpoint (point q) of the edge
- **`p`** (Point object): The first endpoint of the edge, containing properties `{x, y}`
- **`q`** (Point object): The second endpoint of the edge, containing properties `{x, y}`

#### Rationale
Sorting edges by length produces superior maze topology because:
- Short edges connect nearby regions first, creating dense local clusters
- Long edges connect distant regions later, adding global connectivity
- This mimics organic growth patterns (local detail → global structure)
- Players experience coherent local areas before discovering distant connections

#### Expected Output
- Positive floating-point number representing distance in tile units
- Used as sort key: edges with smaller values are processed first
- Typical range: 5-50 tiles depending on chunk size and region distribution

#### Step-by-Step Flow
1. **Sort final edge list** `E` by `edgeLength`
2. **Produces ordered processing queue** that favors shorter corridors first
3. **Short edges** create dense local structure processed early
4. **Long edges** add breadth to layout, processed after nearby regions connect

---

## 3. Multi-Waypoint A* Path Carving

### What It Is
A system that creates stylistic waypoints between region points before running A* pathfinding, enabling varied corridor shapes (L-turns, steps, zigzags) rather than always choosing direct paths.

### What It Does For The System
- Prevents all corridors from being straight lines
- Adds visual variety and organic feel to path networks
- Creates recognizable path patterns for memorable navigation
- Balances efficiency with aesthetic interest

### 3.1 Waypoint Heuristics - Manhattan Separation

```math
D = |dx| + |dy|
```

```math
dx = x_end - x_start
dy = y_end - y_start
```

#### Variables
- **`D`** (number): Total Manhattan distance between start and end points; determines if waypoints are needed
- **`dx`** (number): Horizontal offset from start to end (can be negative if moving left)
- **`dy`** (number): Vertical offset from start to end (can be negative if moving up)
- **`x_start`** (number): X-coordinate of the path's starting point
- **`y_start`** (number): Y-coordinate of the path's starting point
- **`x_end`** (number): X-coordinate of the path's ending point
- **`y_end`** (number): Y-coordinate of the path's ending point

#### Waypoint Style Selection
- **`MIN_WAYPOINT_DISTANCE`** (constant = 8): Minimum D value required to trigger waypoint insertion
- **`ZIGZAG_MIN_DISTANCE`** (constant = 15): Minimum D value required for zigzag pattern
- **`L_SHAPE_FIRST_AXIS_PROB`** (constant = 0.5): Probability of choosing horizontal-first vs vertical-first L-shape
- **`STEP_MIDPOINT_JITTER`** (constant = 2): Random offset range for step pattern waypoints

#### Waypoint Styles
Depending on Manhattan separation `D`, different waypoint styles activate:
- **No waypoint** if `D < MIN_WAYPOINT_DISTANCE` - direct A* path
- **L-shape**: introduces one orthogonal detour with probability `L_SHAPE_FIRST_AXIS_PROB` of horizontal-first
- **Step pattern**: adds midpoint perturbations within `±STEP_MIDPOINT_JITTER` tiles
- **Zigzag**: for `D ≥ ZIGZAG_MIN_DISTANCE`, adds thirds-based control points to emulate weaving corridors

The waypoint array `W = {w_1, …, w_m}` augments the path search as segmented goals: `p' → w_1 → … → w_m → q'`

#### Rationale
Waypoint insertion logic creates path variety:
- Short paths (D < 8) remain direct for efficiency
- Medium paths get L-shapes or step patterns for visual interest
- Long paths (D ≥ 15) can use zigzags for weaving corridors
- Random style selection ensures unpredictability

#### Expected Output
- Empty waypoint array for D < 8 (direct path)
- 1 waypoint for L-shape (corner point)
- 3 waypoints for step pattern (creates staircase effect)
- 4 waypoints for zigzag (creates weaving pattern)

#### Step-by-Step Computation
1. **Solve for vector offsets**: Compute `dx = x_q - x_p` and `dy = y_q - y_p`, establishing Manhattan separation `D = |dx| + |dy|`
2. **Choose waypoint style**: If `D < MIN_WAYPOINT_DISTANCE`, short-circuit to direct A*; otherwise select style (`L`, `step`, or `zigzag`)
3. **Instantiate waypoint coordinates**:
   - **L-shape**: waypoint is `(x_q, y_p)` or `(x_p, y_q)` based on `L_SHAPE_FIRST_AXIS_PROB`
   - **Step**: midpoints `(x_p + ⌊dx/2⌋ ± jitter, y_p)` and `(x_mid, y_mid)`
   - **Zigzag**: affine combinations `x_p + ⌊k·dx/3⌋` and `y_p + ⌊k·dy/3⌋` for `k ∈ {1, 2}`

---

### 3.2 A* Cost Model

For each segment between waypoints, standard A* operates on a 4-connected grid with cost-based pathfinding that favors straight corridors.

#### A* Evaluation Formula

#### A* Evaluation Formula

```math
f(n) = g(n) + h(n)
```

#### Variables
- **`f(n)`** (number): Total estimated cost from start to goal through node n; used to prioritize which nodes to explore next
- **`g(n)`** (number): Actual accumulated cost from start node to current node n; increases as path progresses
- **`h(n)`** (number): Heuristic estimated cost from node n to goal; guides search toward target
- **`n`** (PathNode): A grid cell being evaluated, contains position `[x, y]`, parent reference, and cost values

#### Rationale
The f(n) = g(n) + h(n) formula is the core of A* algorithm:
- `g(n)` ensures paths aren't unnecessarily long (actual cost)
- `h(n)` guides search toward goal efficiently (estimated cost)
- Combining both guarantees finding optimal paths when h(n) never overestimates
- Lower f(n) values indicate more promising paths to explore

---

#### Manhattan Distance Heuristic

```math
h(n) = |x_n - x_goal| + |y_n - y_goal|
```

#### Variables
- **`h(n)`** (number): The heuristic estimated cost from current position to goal position
- **`x_n`** (number): The x-coordinate of the current node being evaluated
- **`y_n`** (number): The y-coordinate of the current node being evaluated
- **`x_goal`** (number): The x-coordinate of the target destination
- **`y_goal`** (number): The y-coordinate of the target destination
- **`|...|`** (operator): Absolute value function, ensures positive distance regardless of direction

#### Rationale
Manhattan distance is the optimal heuristic for 4-connected grid movement because:
- It represents the minimum number of moves needed (no diagonal movement)
- It's admissible (never overestimates actual cost), guaranteeing optimal paths
- It's faster to compute than Euclidean distance (no square root)
- It naturally aligns with grid-based pathfinding constraints

#### Expected Output
- Non-negative integer representing minimum tile moves to goal
- Value of 0 when current position equals goal position
- Guides A* to prioritize nodes closer to destination

---

#### Tile Traversal Cost

#### Tile Traversal Cost

```math
tileCost = BASE_TILE_COST + Δdir
```

```math
Δdir = {
  0.0,  if direction unchanged
  0.1,  if direction changed
}
```

#### Variables
- **`tileCost`** (number): Total cost to move from current tile to neighboring tile, accumulated in `g(n)`
- **`BASE_TILE_COST`** (constant = 1.2): Nominal cost for moving one tile in any direction
- **`Δdir`** (number): Additional penalty applied when path changes direction
- **`DIRECTION_CHANGE_PENALTY`** (constant = 0.1): The specific penalty value for turning

#### Direction Change Detection Variables
- **`prevDir`** (array [dx, dy]): Movement vector from previous tile to current tile
- **`nextDir`** (array [dx, dy]): Movement vector from current tile to next tile
- **`prevPos`** (position [x, y]): Coordinates of the previous tile in the path
- **`currPos`** (position [x, y]): Coordinates of the current tile being evaluated
- **`nextPos`** (position [x, y]): Coordinates of the potential next tile

#### Rationale
The dual-cost system shapes corridor aesthetics:
- `BASE_TILE_COST = 1.2` slightly exceeds 1.0, allowing finer cost granularity
- Direction change penalty encourages straight corridors
- Small penalty (0.1) allows turns when necessary but discourages meandering
- Results in more visually pleasing, intentional-looking paths
- Future iterations may reduce cost to 1.0 for existing `PATH_TILE`s to encourage reuse (not yet active)

#### Expected Output
- `tileCost = 1.2` for straight-line movement (no direction change)
- `tileCost = 1.3` for turns (direction changed)
- Accumulated in g(n) as path progresses from start to goal

---

### 3.3 Path Reconstruction

Once the goal is reached, parents are traced back to the start to recover discrete coordinates. Consecutive segment overlaps remove duplicates so that waypoint transitions remain continuous.

#### Step-by-Step A* Segment Processing
1. **Run A* segment-wise**: Starting from `start = p'`, dequeue each waypoint `w_i` and invoke `findPathSegment(start, w_i)`
2. **Initialize costs**: Each invocation sets `g(start) = 0`, `h(start) = |x_start - x_goal| + |y_start - y_goal|`, and pushes `PathNode(start)` onto the open set
3. **Successive expansions**: Add costs `BASE_TILE_COST + Δdir` until the goal tile is reached
4. **Accumulate path coordinates**: After each segment succeeds, append resulting coordinate list to global `fullPath`
5. **Prevent duplication**: Pop first tile of new segment when it matches last tile of previous segment
6. **Fallback guarantee**: If any segment fails (returns `null`), re-run once with direct target `p' → q'` to ensure edge is carved

---

## 4. Structural Post-Processing

### What It Is
Post-processing algorithms that refine the carved corridor network by eliminating undesirable patterns (2×2 blocks forming rooms) and improving connectivity (extending dead ends).

### What It Does For The System
- Maintains consistent single-tile-wide corridors throughout the maze
- Prevents large open rooms from forming at intersections
- Reduces frustrating dead ends that force backtracking
- Creates additional loops for more interesting navigation

### 4.1 Double-Wide Block Pruning

### 4.1 Double-Wide Block Pruning

#### 2×2 Block Detection

```math
Block = {(x, y), (x+1, y), (x, y+1), (x+1, y+1)}
```

**Condition:** All four positions must be `PATH_TILE`

#### Variables
- **`Block`** (set of coordinates): A set of four adjacent grid positions forming a square
- **`x`** (number): The top-left x-coordinate of the 2×2 block being checked
- **`y`** (number): The top-left y-coordinate of the 2×2 block being checked
- **`PATH_TILE`** (constant = 0): Tile type value representing walkable corridor space
- **`REGION_TILE`** (constant = 1): Tile type value representing unwalkable wall space

#### Pruning Selection Variables
- **`externalDegree`** (number): Count of path neighbors outside the 2×2 block for a given tile
- **`blockPositions`** (array): Array of four coordinate pairs `[[x,y], [x+1,y], [x,y+1], [x+1,y+1]]`
- **`MAX_DOUBLE_WIDE_FIX_ITER`** (constant = 10): Maximum iterations of the pruning loop to prevent infinite processing

#### Rationale
The 2×2 pruning algorithm maintains maze aesthetics:
- Removes the tile with lowest external connections to minimize disruption
- Avoids removing tiles that would disconnect straight corridors (two opposite neighbors or degree ≥ 3)
- Iterates until no more 2×2 blocks exist or iteration cap reached
- Preserves overall connectivity while enforcing width constraint

#### Expected Output
- Modified grid with at most 3 out of 4 tiles in any 2×2 area being paths
- Corridors remain single-tile-wide at intersections
- Overall path connectivity preserved
- Process stops after 10 iterations or when no 2×2 blocks remain

#### Step-by-Step Pruning Flow
1. **Scan grid** to enumerate all 2×2 path blocks `B`
2. **Compute external degrees** `deg_ext(b_k)` for each block member
3. **Attempt removal** by sorting `deg_ext` ascending and temporarily toggling lowest-degree tile to `REGION_TILE`
4. **Check connectivity heuristic** via `wouldDisconnectNetwork`; if safe, commit removal; otherwise test next candidate
5. **Fall back** to removing smallest-degree tile if no safe option exists
6. **Repeat** pruning loop until no changes occur or iteration cap reached

---

### 4.2 Dead-End Extension

### 4.2 Dead-End Extension

#### Dead-End Detection Formula

```math
pathNeighborCount = |{n ∈ N(x,y) : n ∈ bounds ∧ grid[n] = PATH_TILE}|
```

```math
isDeadEnd(x,y) ⟺ pathNeighborCount = 1
```

Where:
- `N(x,y) = {(x, y-1), (x+1, y), (x, y+1), (x-1, y)}` (4-connected neighbors)
- `bounds = {(x,y) : 0 ≤ x < levelWidth ∧ 0 ≤ y < levelHeight}`

#### Variables
- **`pathNeighborCount`**: Count of valid path neighbors
- **`n`**: A neighbor position being evaluated
- **`grid[n]`**: Tile type value at position n
- **`PATH_TILE`**: Constant (0) for walkable corridors
 - **`x`**: X-coordinate of the tile being evaluated for dead-end status (integer, 0 ≤ x < levelWidth)
 - **`y`**: Y-coordinate of the tile being evaluated for dead-end status (integer, 0 ≤ y < levelHeight)

#### Rationale
The implementation uses a two-stage filter process:
1. **Generate all 4 neighbors**: Creates candidate positions for north, east, south, west
2. **Filter for valid path neighbors**: Checks bounds (`0 ≤ x < width` and `0 ≤ y < height`) AND checks if tile is PATH_TILE
3. **Count filtered neighbors**: If exactly 1 valid path neighbor exists, tile is a dead-end
4. Bounds checking prevents array out-of-bounds errors at grid edges
5. Ensures only genuine dead-ends are identified (not edge artifacts)

#### Expected Output
- Returns `true` when exactly 1 of 4 neighbors is PATH_TILE **and** within valid bounds
- Returns `false` for corridors (2 neighbors), intersections (3+ neighbors), or isolated tiles (0 neighbors)
- Enables identification of all dead-ends in single grid scan
- Edge tiles correctly evaluated (won't count out-of-bounds positions)

#### Extension Direction Vector

```math
d = (x_deadEnd - x_connection, y_deadEnd - y_connection)
```

#### Variables
- **`d`** (vector [dx, dy]): Unit direction vector pointing away from the connected corridor
- **`x_deadEnd`** (number): X-coordinate of the dead-end tile
- **`y_deadEnd`** (number): Y-coordinate of the dead-end tile
- **`x_connection`** (number): X-coordinate of the single connected path tile
- **`y_connection`** (number): Y-coordinate of the single connected path tile

#### Extension Loop Variables
- **`t`** (number): Extension step counter, ranges from 1 to 5
- **`currentPos`** (position [x, y]): The position being evaluated for extension: `deadEnd + t·d`
- **Extension limit** (constant = 5): Maximum tiles to extend from dead-end

#### Rationale
Extending dead ends improves gameplay:
- 5-tile maximum provides meaningful extensions without excessive computation
- Extension stops when hitting another corridor (creates loop) or boundary
- Direction vector ensures extension continues outward logically
- Simple heuristic avoids complex graph algorithms

#### Expected Output
- Dead-end tiles extended by 1-5 tiles in the outward direction
- Extension stops when encountering another path (loop formed) or reaching boundary
- Some dead ends remain if extension is blocked immediately
- Overall reduction in dead-end count improves maze flow

#### Step-by-Step Extension Flow
1. **Collect all path tiles** and identify dead ends where exactly one neighbor is a path
2. **Calculate direction vector** `d` toward empty space for each dead end
3. **Iteratively carve** `deadEnd + t·d` for `t ∈ [1,5]` until blocked or merged
4. **Stop extension** when hitting another corridor, creating a loop, or reaching world bounds
5. **Repeat** after pruning to ensure corridors remain single-tile wide while reducing dead ends

---

## 5. Interactions With the Overworld Pipeline

### What It Is
The integration layer that connects the Delaunay corridor generator with chunk management, node placement, connectivity systems, and visualization tools.

### What It Does For The System
- Orchestrates chunk generation with deterministic seeding
- Manages inter-chunk connectivity and gateway placement
- Populates chunks with gameplay nodes (NPCs, shops, events)
- Provides caching and runtime visualization capabilities

### 5.1 Pipeline Components

#### 1. Chunk Generation
**Component**: `MazeOverworldGenerator.generateCorridorChunk`
- Sets `levelSize`, dense `regionCount`, and `minRegionDistance` per chunk
- Invokes `generateLayout()` to obtain an `IntGrid` of `PATH_TILE`/`REGION_TILE` values

#### 2. Chunk Connectivity
**Component**: `generateConnectionPoints`, `ChunkConnectivityManager`
- After carving paths, border scans locate `PATH_TILE`s to create deterministic inter-chunk gateways
- Additional adjustments may widen or offset entrances
- Planned future work adds probability control using chunk coordinates

#### 3. Node Placement
**Component**: `NodeGenerator.generateOptimizedNodes`
- Uses the carved grid to find candidate cells with neighborhood openness ≥ threshold
- Map nodes (NPCs, shops, events) inherit the deterministic chunk seed

#### 4. Caching
**Component**: `ChunkManager`
- Generated `maze` arrays are cached by chunk key
- Seeds from `RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)` ensure reproducibility

#### 5. Runtime Visualization
**Component**: `Overworld_MazeGenManager.ts`
- Dev mode overlays (outer tile markers) rely on chunk boundaries and region lookups
- Visualizes the Delaunay output in real-time

### 5.2 Step-by-Step Integration Flow

1. **Chunk request**: Gameplay code calls `MazeOverworldGenerator.getChunk(chunkX, chunkY, gridSize)`
2. **Seed resolution**: `RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)` produces `seed`, aligning RNG usage across nodes
3. **Layout generation**: `generateCorridorChunk` configures `DelaunayMazeGenerator` and calls `generateLayout()` to obtain `IntGrid` corridors
4. **Connectivity stitching**: `generateConnectionPoints` scans borders for `PATH_TILE`s, converting them into inter-chunk gateways before `ChunkConnectivityManager` applies adjustments
5. **Node population**: `NodeGenerator.generateOptimizedNodes` evaluates neighborhood openness, spacing, and seeded randomness to distribute interactions
6. **Caching**: `ChunkManager.cacheChunk` stores `{maze, nodes}` keyed by `chunkX,chunkY`, enabling quick retrieval
7. **Visualization**: `Overworld_MazeGenManager` queries `visibleChunks` and overlays dev markers referencing chunk boundaries

---

## 6. Randomness & Seeding

### What It Is
Although the Delaunay generator currently uses `Math.random()`, chunk orchestration seeds deterministic PRNGs through `RandomUtil`, enabling per-chunk repeatability and reproducible worlds.

### What It Does For The System
- Ensures identical chunks generate the same layout every time
- Allows infinite worlds to be generated on-demand without storing data
- Enables multiplayer synchronization (same seed = same world)
- Supports deterministic testing and debugging

### 6.1 Deterministic Chunk Seeding

#### Chunk Seed Formula

#### Chunk Seed Formula

```math
seed = ((chunkX × 73856093) ⊕ (chunkY × 19349663) ⊕ globalSeed) & 0x7FFFFFFF
```

#### Variables
- **`seed`** (number): The deterministic seed value for a specific chunk, range [0, 2,147,483,647]
- **`chunkX`** (number): The x-coordinate of the chunk in chunk-space (not tile-space)
- **`chunkY`** (number): The y-coordinate of the chunk in chunk-space (not tile-space)
- **`globalSeed`** (number): The world's master seed value, consistent across all chunks
- **`73856093`** (constant): Large prime number for x-axis hash distribution
- **`19349663`** (constant): Large prime number for y-axis hash distribution
- **`⊕`** (operator): Bitwise XOR operation, combines values while preserving distribution
- **`&`** (operator): Bitwise AND operation
- **`0x7FFFFFFF`** (constant): Bit mask (2,147,483,647), ensures positive 32-bit integer result

#### Rationale
The hash function provides excellent properties:
- Large primes create good distribution across chunk coordinates
- XOR operations mix bits thoroughly
- Bit mask ensures positive values compatible with JavaScript's number precision
- Same inputs always produce same output (deterministic)
- Different inputs produce vastly different outputs (avalanche effect)

#### Expected Output
- Unique seed value for each (chunkX, chunkY) pair
- Consistent seed for same coordinates across game sessions
- Seeds used to initialize Linear Congruential Generator for within-chunk randomness

---

### 6.2 Linear Congruential Generator (LCG)

#### LCG Next Value Formula

```math
seed_new = (seed × 16807) mod 2147483647
```

#### Random Value Extraction

```math
randomValue = (seed_new - 1) / 2147483646
```

#### Variables
- **`seed_new`** (number): The updated seed value after one LCG iteration
- **`seed`** (number): The current seed value before iteration
- **`16807`** (constant): The LCG multiplier (7⁵), chosen for optimal period and distribution
- **`2147483647`** (constant): The LCG modulus (2³¹-1), a Mersenne prime ensuring full period
- **`randomValue`** (number): Normalized random value in range [0, 1)
- **`2147483646`** (constant): Denominator for normalization (modulus - 1)

#### Rationale
This LCG implementation (MINSTD) has proven mathematical properties:
- Period of 2,147,483,646 (nearly 2 billion values before repeating)
- Uniform distribution across range
- Fast computation (single multiply and modulo)
- Widely studied and validated algorithm (Park & Miller, 1988)
- Subtracting 1 and dividing by (modulus-1) produces [0,1) range

#### Expected Output
- Floating-point value between 0 (inclusive) and 1 (exclusive)
- Each call advances the seed and returns next value in sequence
- Multiplying by ranges (e.g., `randomValue × 100`) produces values in desired ranges
- Same starting seed produces identical sequence every time

### 6.3 Future Integration

Extending the generator to accept an injected RNG would allow per-chunk repeatability:

```text
seed = RandomUtil.getChunkSeed(chunkX, chunkY, globalSeed)
```

Applying the same seed ensures identical region points, triangulation, and A* path choices, enabling reproducible worlds across runs. Once `DelaunayMazeGenerator` accepts an injected RNG, region point sampling and waypoint decisions will use the same seeded stream, guaranteeing identical corridor layouts per chunk.

---

## 7. Complexity Considerations

### Computational Complexity Analysis

- **Region sampling**: `O(regionCount²)` worst-case due to pairwise distance checks; acceptable for current counts (≤ ~200)
- **Triangulation approximation**: `O(regionCount²)` to compute pairwise distances; storing only 3 edges per node limits edge count to ≈ `3·regionCount`
- **A* per edge**: `O(gridArea log gridArea)` worst-case, but most paths terminate early due to heuristics and bounded chunk size (`50×50`)
- **Post-processing**: Linear scans over grid (`O(gridArea)`) repeated a constant number of times

---

## 8. Extension Hooks

### Potential Future Enhancements

- **True Delaunay**: Swap `createSimpleTriangulation` for a library (e.g., Delaunator). Replace distance-based neighbor selection with actual triangle faces
- **Weighted Edge Selection**: Introduce weights `w_pq` to bias corridor carving order, e.g., based on biome tags or chunk metadata
- **A* Penalties**: Integrate additional cost terms such as congestion, node density, or alignment with existing roads
- **PRNG Injection**: Accept a seeded RNG from `MazeOverworldGenerator` to avoid global `Math.random` usage and align all stochastic decisions

---

## 9. Formula Summary Table

## 9. Formula Summary Table

| Stage | Formula / Heuristic | Purpose |
|-------|---------------------|---------|
| **Region spacing** | `\|\|p_i - p_j\|\|_2^2 ≥ minRegionDistance^2` | Enforce minimum seed distance |
| **Edge length** | `√((x_q - x_p)^2 + (y_q - y_p)^2)` | Sort edges by locality |
| **Manhattan heuristic** | `\|x - x_goal\| + \|y - y_goal\|` | A* admissible heuristic |
| **Cost accumulation** | `g_new = g_curr + BASE_TILE_COST + Δdir` | Control corridor straightness |
| **Waypoint trigger** | `D ≥ MIN_WAYPOINT_DISTANCE` | Decide if segmented path is needed |
| **Double-wide detection** | All tiles in `B` are PATH | Identify 2×2 corridors |
| **Dead-end vector** | `d = deadEnd - connection` | Extend corridor forward |
| **Chunk seed** | `((chunkX × 73856093) ⊕ (chunkY × 19349663) ⊕ globalSeed) & 0x7FFFFFFF` | Generate deterministic chunk seeds |
| **LCG iteration** | `seed_new = (seed × 16807) mod 2147483647` | Advance random sequence |
| **LCG normalization** | `randomValue = (seed_new - 1) / 2147483646` | Convert seed to [0,1) range |

---

This reference provides complete mathematical and implementation context to extend, analyze, or refactor the Delaunay corridor generator while maintaining compatibility with the surrounding overworld systems.
