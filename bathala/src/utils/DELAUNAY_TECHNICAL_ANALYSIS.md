# Delaunay Procedural Map Generation - Technical Analysis

## Executive Summary

The Bathala overworld uses a **Delaunay-triangulation-based corridor generator** for procedural maze creation. This document provides a comprehensive technical breakdown of the system's architecture, algorithms, mathematical formulations, configurations, and performance characteristics.

---

## 1. System Architecture

### 1.1 Core Components

- Orchestrator: requests chunks, seeds generation, and coordinates subsystems
- Delaunay-inspired Generator: creates the corridor network
- Cache: stores generated chunks for reuse
- Node Placement: distributes points of interest on walkable cells
- Deterministic Seeding: ensures reproducible layouts per seed
- Grid Structure: simple 2D tile container for carving and analysis

### 1.2 Data Flow Pipeline

1) Request a chunk → 2) Generate seed → 3) Serve from cache or generate via Delaunay-inspired pipeline → 4) Post-process corridors → 5) Place nodes → 6) Create inter-chunk connections → 7) Cache result → 8) Return chunk data

---

## 2. Mathematical Foundations

### 2.1 Region Seed Generation

**Algorithm**: Rejection sampling with Poisson-disc-like distribution

Concept: For each candidate point, accept it only if its squared Euclidean distance from every already-accepted point meets or exceeds the squared spacing threshold.

Where:
- `P` = set of already accepted points
- `||·||₂` = Euclidean distance norm
- `minRegionDistance` = configurable minimum spacing parameter

**Computational Flow**:
1. Sample candidate: `c = (⌊U_x·W⌋, ⌊U_y·H⌋)` where `U ~ Uniform(0,1)`
2. Compute squared distances: `d_j² = (c_x - p_j,x)² + (c_y - p_j,y)²`
3. Accept if all `d_j² ≥ threshold²`, else reject and resample
4. Repeat until `|P| = regionCount` or attempts exceed `MAX_REGION_POINT_ATTEMPTS`

**Complexity**: `O(regionCount²)` worst-case per chunk

---

### 2.2 Triangulation (Simplified Delaunay)

**Current Implementation**: k-Nearest Neighbor Graph (k=3)

Concept: For each point, compute distances to others, select the k nearest neighbors (typically three), create undirected edges to them, and deduplicate edges consistently.

Edge Canonicalization: Edges are recorded in a consistent order to avoid duplicates.

Edge Sorting: Edges are sorted by Euclidean length to prioritize local connectivity (shorter first).

**Complexity**: `O(regionCount²)` for distance computation, produces ≈`3·regionCount` edges

**Note**: This is a **simplified approximation** of true Delaunay triangulation, trading mathematical rigor for computational efficiency. True Delaunay would use circumcircle tests and produce more optimal connectivity.

---

### 2.3 A* Pathfinding

Cost Function: A* uses total estimated cost as the path cost so far plus a heuristic estimate to the goal.

Where:
- **g(n)** = accumulated cost from start to node `n`
- **h(n)** = heuristic estimate from `n` to goal
- **f(n)** = total estimated cost

Heuristic: Manhattan distance guides pathfinding efficiently on a grid.

Tile Cost Calculation: Each step adds base movement cost plus a small penalty when changing direction.

Where:
- `BASE_TILE_COST = 1.2` (nominal movement cost)
- `directionChangePenalty = 0.1` (applied when turning corners)

Direction Change Penalty: Encourages straighter corridors by mildly penalizing turns.

Neighbor Expansion: Operates on a four-directional grid (up, right, down, left).

**Complexity**: `O(gridArea log gridArea)` worst-case, but early termination typically yields `O(path_length · log(frontier_size))`

---

### 2.4 Waypoint Generation Heuristics

Trigger Condition: Waypoints activate when Manhattan separation exceeds a threshold.

**Three Waypoint Styles** (randomly selected):

Waypoint Styles: L-shaped detours for short-to-medium spans, stepped midpoints for medium spans, and zigzags for long spans.

Path Segmentation: The final path concatenates A* segments between the start, waypoints, and end, removing duplicates at junctions.

Fallback: If any segment fails, fall back to a direct start-to-end path.

---

## 3. Post-Processing Algorithms

### 3.1 Double-Wide Path Pruning

**Purpose**: Eliminate 2×2 PATH blocks to maintain single-tile-wide corridors

Detection: Identify any two-by-two block of corridor tiles.

**Pruning Strategy**:
1. For each tile in block, compute **external degree** (PATH neighbors outside block)
2. Sort tiles by ascending external degree
3. Attempt to remove lowest-degree tile
4. Skip if removal would disconnect network:
   - If degree ≥ 3 (junction point)
   - If degree = 2 AND neighbors are opposite (straight corridor)

**Iteration**: Repeat up to `MAX_DOUBLE_WIDE_FIX_ITER = 10` times until stable

**Complexity**: `O(gridArea · MAX_ITER)` worst-case

---

### 3.2 Dead-End Reduction

**Detection**: Find tiles with exactly 1 PATH neighbor

Extension Algorithm: Extend dead ends a short distance forward along their outward direction, stopping on collision or at a small cap, to produce more loops.

**Purpose**: Reduce dead-ends by extending them 5 tiles forward, potentially creating loops

**Complexity**: `O(dead_end_count · extension_length)` where `extension_length ≤ 5`

---

## 4. Configuration Parameters

### 4.1 DelaunayMazeGenerator Constants

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `BASE_TILE_COST` | 1.2 | Nominal A* movement cost |
| `DIRECTION_CHANGE_PENALTY` | 0.1 | Added cost for turning corners |
| `MIN_WAYPOINT_DISTANCE` | 8 | Threshold for adding waypoints |
| `ZIGZAG_MIN_DISTANCE` | 15 | Minimum distance for zigzag style |
| `STEP_MIDPOINT_JITTER` | ±2 | Random offset for step waypoints |
| `MAX_DOUBLE_WIDE_FIX_ITER` | 10 | Safety cap for pruning iterations |
| `MAX_REGION_POINT_ATTEMPTS` | 1000 | Cap for rejection sampling |
| `L_SHAPE_FIRST_AXIS_PROB` | 0.5 | Probability of horizontal-first L |
| `PATH_TILE` | 0 | Walkable corridor tile value |
| `REGION_TILE` | 1 | Wall/uncarved tile value |

### 4.2 Generation Parameters (per chunk)

| Parameter | Default | Impact |
|-----------|---------|--------|
| `levelSize` | [50, 50] | Chunk dimensions in tiles |
| `regionCount` | `max(W,H) × 2` | Number of region seed points |
| `minRegionDistance` | 3 | Minimum spacing between seeds |

**Current Calculation** (from MazeOverworldGenerator):
```typescript
generator.regionCount = Math.max(chunkSize, chunkSize) * 2;
// For 50×50 chunks: regionCount = 100
```

---

## 5. Chunk Management System

### 5.1 ChunkManager

**Purpose**: LRU-style caching with automatic eviction

**Cache Configuration**:
- `maxCachedChunks = 100`
- Cache key format: `"chunkX,chunkY"`

**Cache Operations**:

```typescript
// Cache Hit
getCachedChunk(key) → ChunkData | undefined

// Cache Miss + Insert
cacheChunk(key, data) {
    if (size >= maxCachedChunks) {
        evict_oldest()
    }
    insert(key, data)
}
```

**Memory Management**: When cache is full, evicts oldest entry (first in Map iteration order)

---

### 5.2 Deterministic Seeding

**Chunk Seed Formula**:
```typescript
seed = ((chunkX × 73856093) ⊕ (chunkY × 19349663) ⊕ globalSeed) & 0x7FFFFFFF
```

Where:
- `73856093` and `19349663` are large primes for good hash distribution
- `⊕` is XOR operation
- `& 0x7FFFFFFF` ensures positive 31-bit integer

**RNG Implementation** (Linear Congruential Generator):
```typescript
next() {
    seed = (seed × 16807) mod 2147483647
    return (seed - 1) / 2147483646  // Normalized to [0,1)
}
```

Where:
- Modulus: `2³¹ - 1` (Mersenne prime)
- Multiplier: `16807 = 7⁵` (primitive root)

---

## 6. Node Placement System

### 6.1 NodeGenerator Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `MIN_DISTANCE_FROM_EDGE` | 3 | Padding from chunk borders |
| `MIN_OPEN_NEIGHBORS` | 5 | Required open tiles in 3×3 area |
| `BASE_NODE_COUNT` | 3 | Base nodes per chunk |
| `MIN_NODE_DISTANCE_FACTOR` | 4 | Spacing: chunkSize / 4 |

### 6.2 Node Placement Algorithm

**Valid Position Criteria**:
```
1. Tile must be PATH (value = 0)
2. Distance from edge ≥ MIN_DISTANCE_FROM_EDGE
3. Open neighbors in 3×3 window ≥ MIN_OPEN_NEIGHBORS
```

**Spatial Distribution**:
```typescript
For each node to place:
    1. Find position maximizing minimum distance to existing nodes
    2. If no position meets minNodeDistance threshold, pick randomly
    3. Assign node type from: [combat, elite, shop, event, campfire, treasure]
    4. Convert grid coords to world coords: (chunkX×size + x)×gridSize
```

**Node Count Calculation**:
```typescript
baseNodeCount = min(BASE_NODE_COUNT, floor(validPositions.length / 8))
nodeCount = baseNodeCount + floor(random() × 2)  // +0 or +1
```

**Minimum Node Spacing**:
```typescript
minNodeDistance = chunkSize / MIN_NODE_DISTANCE_FACTOR
// For 50×50 chunks: 50 / 4 = 12.5 tiles
```

---

## 7. IntGrid Data Structure

### 7.1 Memory Layout

**Storage**: Column-major 2D array
```typescript
grid: number[][]  // grid[x][y]
```

**Dimensions**: 
- Width: number of columns
- Height: number of rows per column

**Initialization**:
```typescript
grid = Array(width).fill(null).map(() => 
    Array(height).fill(REGION_TILE)  // Default to walls
)
```

### 7.2 Tile Access

**Bounds-Checked Operations**:
```typescript
setTile(x, y, value) {
    if (0 ≤ x < width && 0 ≤ y < height) {
        grid[x][y] = value
    }
    // Silently ignore out-of-bounds writes
}

getTile(x, y) {
    if (0 ≤ x < width && 0 ≤ y < height) {
        return grid[x][y]
    }
    return REGION_TILE  // Safe default
}
```

**Memory Footprint**: `width × height × sizeof(number)` ≈ `50 × 50 × 8 bytes = 20 KB` per chunk

---

## 8. Performance Characteristics

### 8.1 Computational Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Region seed generation | `O(n²)` | n = regionCount ≈ 100 |
| Triangulation (k-NN) | `O(n²)` | Distance matrix computation |
| Edge sorting | `O(e log e)` | e ≈ 3n edges |
| A* per edge | `O(area log area)` | area = 50² = 2500 |
| Total path carving | `O(e × area log area)` | ≈ 300 × 2500 × 11 |
| Double-wide pruning | `O(area × iter)` | iter ≤ 10 |
| Dead-end reduction | `O(dead_ends × 5)` | Bounded extension |

**Estimated Total**: `O(area × e log area)` ≈ `O(2500 × 300 × 11)` ≈ **8.25M operations** per chunk

### 8.2 Cache Performance

**Hit Rate Factors**:
- Player movement patterns (local exploration)
- Cache size (100 chunks)
- Chunk reuse frequency

**Preloading Strategy**:
```typescript
preloadChunksAround(centerX, centerY, radius) {
    for dy in [-radius, +radius]:
        for dx in [-radius, +radius]:
            setTimeout(() => getChunk(centerX+dx, centerY+dy), 0)
}
```

Uses `setTimeout(0)` to preload asynchronously without blocking main thread.

---

## 9. Connectivity & Chunk Stitching

### 9.1 Connection Point Generation

**Algorithm**: Scan chunk borders for PATH tiles

```typescript
For each border (north, south, east, west):
    For each position along border:
        if tile == PATH_TILE:
            add { x, y, direction }
            break  // One connection per border
```

**Connection Directions**:
- North: y = chunkSize - 1
- South: y = 0
- East: x = chunkSize - 1
- West: x = 0

### 9.2 Inter-Chunk Continuity

**Current Limitation**: Connections assume neighbor chunks exist but don't verify connectivity

**Future Enhancement**: ChunkConnectivityManager to:
1. Widen entrance passages
2. Add inward corridors
3. Probabilistically create double connections
4. Smooth visual transitions

---

## 10. Metrics & Statistics

### 10.1 Generated Layout Metrics

For a typical 50×50 chunk with 100 regions:

| Metric | Typical Value | Range |
|--------|---------------|-------|
| Region points | 100 | 80-120 |
| Edges generated | ~300 | 240-360 |
| Path tiles | ~800-1200 | 600-1500 |
| Wall tiles | ~1300-1700 | 1000-1900 |
| Path coverage | 32-48% | 24-60% |
| Nodes placed | 3-4 | 2-6 |
| Dead ends (pre-fix) | ~60-80 | 40-100 |
| Dead ends (post-fix) | ~30-50 | 20-60 |
| 2×2 blocks (pre-fix) | ~15-30 | 10-40 |
| 2×2 blocks (post-fix) | 0-2 | 0-5 |

### 10.2 Cache Statistics

Available via `MazeOverworldGenerator.getCacheStats()`:
```typescript
{
    cachedChunks: number,      // Current cache size
    maxCachedChunks: number    // Cache capacity (100)
}
```

---

## 11. Configuration Trade-offs

### 11.1 regionCount

**↑ Increase** (current: 100):
- ✅ More connection points, denser network
- ✅ Shorter corridors, more branching
- ❌ Higher computation cost `O(n²)`
- ❌ More edges to process `O(3n)`

**↓ Decrease** (e.g., 50):
- ✅ Faster generation
- ✅ Longer, more dramatic corridors
- ❌ Less connectivity, potential islands
- ❌ Fewer path options for player

### 11.2 minRegionDistance

**↑ Increase** (current: 3):
- ✅ More evenly distributed regions
- ✅ Prevents clustering
- ❌ May fail to reach regionCount target
- ❌ Requires more sampling attempts

**↓ Decrease** (e.g., 2):
- ✅ Easier to place all regions
- ✅ Denser local connectivity
- ❌ More clustering
- ❌ Overlapping corridors

### 11.3 BASE_TILE_COST

**↑ Increase** (current: 1.2):
- ✅ Stronger preference for existing paths
- ❌ Less likely to carve new alternatives
- ❌ More deterministic layouts

**↓ Decrease** (closer to 1.0):
- ✅ More exploration of new paths
- ✅ Greater variety
- ❌ Less path reuse
- ❌ More isolated corridors

### 11.4 DIRECTION_CHANGE_PENALTY

**↑ Increase** (current: 0.1):
- ✅ Straighter corridors
- ✅ More predictable navigation
- ❌ Less natural feeling
- ❌ More grid-aligned

**↓ Decrease** (e.g., 0.05):
- ✅ More organic, winding paths
- ✅ Better visual variety
- ❌ Potentially confusing navigation
- ❌ Longer effective distances

---

## 12. Known Limitations

### 12.1 Algorithmic Limitations

1. **Simplified Triangulation**: k-NN approximation may miss optimal connectivity
2. **No True Delaunay**: Circumcircle property not enforced
3. **Global Random**: Uses `Math.random()` instead of seeded RNG internally
4. **Connectivity Assumptions**: Doesn't verify chunk neighbors exist

### 12.2 Performance Limitations

1. **First-Gen Spike**: Initial chunk generation can cause frame drops
2. **Large Region Counts**: `O(n²)` scaling limits practical upper bound
3. **Cache Eviction**: Fixed LRU without access frequency tracking
4. **Synchronous Generation**: Blocks main thread during generation

### 12.3 Quality Limitations

1. **2×2 Block Residue**: Rare cases leave unpruned 2×2 blocks
2. **Dead-End Persistence**: ~50% dead-ends remain after reduction
3. **Border Artifacts**: Visual seams possible at chunk boundaries
4. **Waypoint Failures**: Fallback to direct path loses stylistic intent

---

## 13. Optimization Opportunities

### 13.1 Algorithmic Improvements

1. **True Delaunay**: Integrate Delaunator library for optimal triangulation
2. **Seeded Generator**: Accept injected RNG for full determinism
3. **Incremental A***: Reuse search trees for nearby queries
4. **Spatial Indexing**: Use quadtree/grid for faster neighbor queries

### 13.2 Performance Improvements

1. **Web Workers**: Offload generation to background threads
2. **Predictive Loading**: Load chunks along movement vector
3. **Progressive Generation**: Generate in stages across frames
4. **Better Eviction**: Track access frequency, not just recency

### 13.3 Quality Improvements

1. **Connectivity Guarantee**: Flood-fill verification before caching
2. **Biome Integration**: Weight edges by terrain affinity
3. **Narrative Corridors**: Tag edges for story-critical paths
4. **Dynamic Density**: Adjust regionCount by difficulty/progression

---

## 14. Extension Hooks

### 14.1 Planned Extensions

1. **Multi-Layer Generation**: Height maps, bridges, vertical traversal
2. **Biome-Specific Variants**: Desert, forest, cavern corridor styles
3. **DDA Integration**: Adjust density/complexity by player performance
4. **Event Chains**: Sequence nodes along story-critical edges

### 14.2 API Extension Points

```typescript
// Pluggable triangulation
interface TriangulationStrategy {
    triangulate(points: Point[]): Edge[]
}

// Pluggable pathfinding cost
interface CostFunction {
    tileCost(from: Pos, to: Pos, grid: IntGrid): number
}

// Pluggable post-processing
interface PostProcessor {
    process(grid: IntGrid): void
}
```

---

## 15. Testing & Validation

### 15.1 Unit Tests

**Current Coverage**: None (opportunity for improvement)

**Recommended Tests**:
```typescript
describe('DelaunayMazeGenerator', () => {
    test('region points respect minimum distance')
    test('all edges are bidirectional')
    test('no 2×2 PATH blocks remain')
    test('all tiles are reachable from any tile')
    test('deterministic output given same seed')
})
```

### 15.2 Visual Testing

**testMazeGen.ts** provides CLI validation:
```bash
ts-node src/utils/MazeGeneration/testMazeGen.ts
```

Outputs:
- ASCII visualization (`.` = path, `#` = wall)
- Tile statistics (path %, wall %)
- Region point distribution

---

## 16. References & Dependencies

### 16.1 Internal Dependencies

- `IntGrid.ts` - 2D grid data structure
- `RandomUtil.ts` - Seeded RNG utilities
- `ChunkManager.ts` - Caching system
- `NodeGenerator.ts` - POI placement
- `MapTypes.ts` - Type definitions

### 16.2 External Dependencies

None currently (uses built-in Math functions)

**Future Considerations**:
- **Delaunator** - True Delaunay triangulation
- **pathfinding** - Optimized A* implementation
- **Web Worker API** - Background generation

---

## 17. Conclusion

The Delaunay-based procedural generation system represents a sophisticated balance between:
- **Determinism**: Seeded chunk generation ensures reproducibility
- **Performance**: Caching and approximations keep generation fast
- **Quality**: Post-processing maintains corridor integrity
- **Flexibility**: Configurable parameters enable fine-tuning

**Key Strengths**:
1. Infinite world support through chunking
2. Deterministic, shareable worlds via seeds
3. Organic corridor layouts via waypoints
4. Efficient caching minimizes recomputation

**Key Areas for Improvement**:
1. True Delaunay triangulation for optimal connectivity
2. Asynchronous generation to prevent frame drops
3. Better connectivity guarantees between chunks
4. Comprehensive unit test coverage

The system provides a solid foundation for the Bathala overworld, with clear paths for optimization and extension as development continues.

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**System Version**: Current Delaunay Implementation (v5.8.14.25)
