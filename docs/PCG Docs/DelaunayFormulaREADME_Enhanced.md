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

## 2. Simplified Delaunay Triangulation

### What It Is
A simplified nearest-neighbor triangulation that approximates Delaunay triangulation properties by connecting each seed point to its three closest neighbors. This creates a network of edges that will become corridor paths.

### What It Does For The System
- Establishes connectivity relationships between region seed points
- Creates a graph structure defining which regions should have direct corridor connections
- Provides natural-looking path networks without the computational complexity of true Delaunay triangulation
- Generates edges that can be sorted by length to prioritize local connections

### Euclidean Distance Formula

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

---

## 3. Edge Length Calculation

### What It Is
A computation that determines the straight-line distance between two connected region points, used to prioritize which corridors to carve first.

### What It Does For The System
- Sorts edges so shorter corridors are carved before longer ones
- Creates more natural-looking layouts with localized clusters
- Ensures nearby regions connect before distant ones
- Provides organic growth pattern from dense local areas to sparse distant connections

### Formula

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

---

## 4. A* Pathfinding Cost System

### What It Is
A cost-based pathfinding algorithm that finds optimal paths between region points while favoring straight corridors and penalizing excessive turns.

### What It Does For The System
- Generates actual corridor paths between triangulation edge endpoints
- Creates natural-looking paths that avoid unnecessary zigzagging
- Balances shortest-path efficiency with aesthetic straight corridors
- Enables waypoint-based path variation for visual interest

### A* Evaluation Formula

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

### Manhattan Distance Heuristic

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

### Tile Traversal Cost

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
- **`tileCost`** (number): Total cost to move from current tile to neighboring tile
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

#### Expected Output
- `tileCost = 1.2` for straight-line movement (no direction change)
- `tileCost = 1.3` for turns (direction changed)
- Accumulated in g(n) as path progresses from start to goal

---

## 5. Waypoint Generation System

### What It Is
A heuristic system that inserts intermediate waypoints between path endpoints to create varied, aesthetically interesting corridor shapes (L-shapes, steps, zigzags).

### What It Does For The System
- Prevents all corridors from being straight lines
- Adds visual variety and organic feel to path networks
- Creates recognizable path patterns (L-turns, stepped paths, weaving corridors)
- Makes maze navigation more interesting and memorable for players

### Manhattan Separation

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

---

## 6. Double-Wide Path Pruning

### What It Is
A post-processing system that detects and eliminates 2×2 blocks of path tiles to maintain single-tile-wide corridors throughout the maze.

### What It Does For The System
- Prevents large open rooms from forming where corridors intersect
- Maintains consistent corridor width (1 tile) for predictable traversal
- Preserves the maze's corridor aesthetic rather than room-based layout
- Ensures visual consistency throughout the generated level

### 2×2 Block Detection

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
- Avoids removing tiles that would disconnect straight corridors
- Iterates until no more 2×2 blocks exist or iteration cap reached
- Preserves overall connectivity while enforcing width constraint

#### Expected Output
- Modified grid with at most 3 out of 4 tiles in any 2×2 area being paths
- Corridors remain single-tile-wide at intersections
- Overall path connectivity preserved
- Process stops after 10 iterations or when no 2×2 blocks remain

---

## 7. Dead-End Extension System

### What It Is
A post-processing enhancement that extends dead-end corridors forward to create loops and improve connectivity.

### What It Does For The System
- Reduces frustrating dead ends that force backtracking
- Creates additional loops for more interesting navigation
- Improves overall maze connectivity without full pathfinding
- Adds depth to areas that would otherwise be terminal paths

### Dead-End Detection

**Condition:** A path tile with exactly one path neighbor

#### Variables
- **`deadEnd`** (position [x, y]): A path tile that has exactly one adjacent path tile
- **`pathNeighbors`** (array): List of orthogonally adjacent tiles that are PATH_TILE type
- **`neighbors`** (array): All four orthogonally adjacent positions (up, right, down, left)

### Extension Direction Vector

```math
d = (x_deadEnd - x_connection, y_deadEnd - y_connection)
```

#### Variables
- **`d`** (vector [dx, dy]): Unit direction vector pointing away from the connected corridor
- **`x_deadEnd`** (number): X-coordinate of the dead-end tile
- **`y_deadEnd`** (number): Y-coordinate of the dead-end tile
- **`x_connection`** (number): X-coordinate of the single connected path tile
- **`y_connection`** (number): Y-coordinate of the single connected path tile

#### Extension Loop
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

---

## 8. Deterministic Chunk Seeding

### What It Is
A hash-based seed generation system that produces consistent random numbers for each chunk coordinate, enabling reproducible world generation.

### What It Does For The System
- Ensures identical chunks generate the same layout every time
- Allows infinite worlds to be generated on-demand without storing data
- Enables multiplayer synchronization (same seed = same world)
- Supports deterministic testing and debugging

### Chunk Seed Formula

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

## 9. Linear Congruential Generator (LCG)

### What It Is
A deterministic pseudo-random number generator using modular arithmetic to produce sequences of random-appearing numbers from a seed.

### What It Does For The System
- Converts chunk seeds into sequences of random values
- Provides reproducible randomness for node placement, loot, encounters
- Fast computation suitable for real-time generation
- Standard algorithm ensuring predictable behavior across platforms

### LCG Next Value Formula

```math
seed_new = (seed × 16807) mod 2147483647
```

### Random Value Extraction

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

---

## 10. Formula Reference Table

| System | Formula | Purpose |
|--------|---------|---------|
| **Region Sampling** | `distanceSq = (x_new - x_existing)² + (y_new - y_existing)²` | Enforce minimum seed spacing |
| **Triangulation** | `distance = √[(x_i - x_j)² + (y_i - y_j)²]` | Find k-nearest neighbors |
| **Edge Sorting** | `edgeLength = √[(x_q - x_p)² + (y_q - y_p)²]` | Prioritize local connections |
| **A* Heuristic** | `h(n) = \|x_n - x_goal\| + \|y_n - y_goal\|` | Guide pathfinding to target |
| **A* Total Cost** | `f(n) = g(n) + h(n)` | Evaluate path optimality |
| **Tile Cost** | `tileCost = BASE_TILE_COST + Δdir` | Balance straight vs turning paths |
| **Waypoint Trigger** | `D = \|dx\| + \|dy\|` | Determine path style complexity |
| **2×2 Detection** | `Block = {(x,y), (x+1,y), (x,y+1), (x+1,y+1)}` | Identify wide corridors |
| **Dead-End Vector** | `d = (x_deadEnd - x_connection, y_deadEnd - y_connection)` | Compute extension direction |
| **Chunk Seed** | `seed = ((chunkX × 73856093) ⊕ (chunkY × 19349663) ⊕ globalSeed) & 0x7FFFFFFF` | Generate deterministic chunk seeds |
| **LCG Iteration** | `seed_new = (seed × 16807) mod 2147483647` | Advance random sequence |
| **LCG Normalization** | `randomValue = (seed_new - 1) / 2147483646` | Convert seed to [0,1) range |

---

## 11. Integration With Game Systems

### Chunk Generation Pipeline
1. **Request**: Game calls `getChunk(chunkX, chunkY, gridSize)`
2. **Seeding**: `getChunkSeed()` produces deterministic seed from coordinates
3. **Layout**: `DelaunayMazeGenerator.generateLayout()` creates corridor grid
4. **Connectivity**: Border scans create inter-chunk gateways
5. **Nodes**: `NodeGenerator` places NPCs/events using seeded randomness
6. **Caching**: `ChunkManager` stores result for reuse

### Performance Characteristics
- **Region Sampling**: O(regionCount²) - acceptable for ≤200 points
- **Triangulation**: O(regionCount²) - one-time cost per chunk
- **A* Pathfinding**: O(gridArea log gridArea) - optimized by heuristic
- **Post-Processing**: O(gridArea) - linear scans with bounded iterations

### Extension Points
- **True Delaunay**: Replace k-NN with Delaunator library
- **Weighted Edges**: Add biome-based or metadata-driven weights
- **Enhanced A***: Integrate congestion, density, or alignment costs
- **PRNG Injection**: Replace Math.random() with seeded generator

---

## 12. Constants Reference

| Constant | Value | Purpose |
|----------|-------|---------|
| `BASE_TILE_COST` | 1.2 | Nominal movement cost per tile |
| `DIRECTION_CHANGE_PENALTY` | 0.1 | Cost penalty for turning |
| `MIN_WAYPOINT_DISTANCE` | 8 | Minimum distance to trigger waypoints |
| `ZIGZAG_MIN_DISTANCE` | 15 | Minimum distance for zigzag pattern |
| `L_SHAPE_FIRST_AXIS_PROB` | 0.5 | Probability of horizontal-first L-shape |
| `STEP_MIDPOINT_JITTER` | 2 | Random offset range for step waypoints |
| `MAX_DOUBLE_WIDE_FIX_ITER` | 10 | Maximum 2×2 pruning iterations |
| `MAX_REGION_POINT_ATTEMPTS` | 1000 | Rejection sampling iteration cap |
| `minRegionDistance` | 4 | Default minimum seed spacing |
| `PATH_TILE` | 0 | Walkable corridor tile type |
| `REGION_TILE` | 1 | Unwalkable wall tile type |
| `LCG_MULTIPLIER` | 16807 | Linear congruential generator multiplier |
| `LCG_MODULUS` | 2147483647 | Linear congruential generator modulus |

---

This documentation provides complete mathematical context for understanding, maintaining, and extending the Delaunay corridor generation system.
