# Submerged Village Obstacles Implementation

## Overview
Added obstacle rendering to the Submerged Village (Act 2) terrain generation, matching the Enchanted Forest (Act 1) behavior where ALL non-path tiles are rendered as obstacles. Only designated path tiles are traversable.

## Changes Made

### 1. Tile Type Addition
**File:** `bathala/src/systems/generation/algorithms/submerged-village/SubmergedVillageAlgorithm.ts`

Added new tile type:
```typescript
export const TILE = {
    PATH: 0,
    FOREST: 1,
    HOUSE: 2,
    FENCE: 3,
    RUBBLE: 4,
    CLIFF: 5,
    HILL: 6,
    GRASS_PATCH: 7,
    SAND_PATCH: 8,
    WATER: 9,
    OBSTACLE: 10,  // NEW
} as const;
```

### 2. Obstacle Conversion Logic
**File:** `bathala/src/systems/generation/algorithms/submerged-village/SubmergedVillageAlgorithm.ts`

Added `scatterObstacles()` method that:
- Runs AFTER all biome terrain features (cliffs, hills, patches, water) are placed
- Converts ALL remaining FOREST tiles to OBSTACLE tiles
- Matches Enchanted Forest behavior: only PATH tiles are traversable
- Creates a maze-like environment where obstacles fill all non-path space

The method is called in the generation pipeline:
```typescript
// 16. Convert non-path terrain into Chapter 2 feature tiles
this.applyBiomeTerrainFeatures(grid, p);
this.repairPathGapsAfterBiome(grid);

// 17. Convert all remaining FOREST tiles to OBSTACLE tiles
this.scatterObstacles(grid);
```

### 3. Asset Loading
**File:** `bathala/src/game/scenes/Preloader.ts`

Added obstacle sprite loading:
```typescript
this.load.image("sv_obstacle_tree", "background/submergedvillageAssets/obstacles/Tree_Obstacle.png");
this.load.image("sv_obstacle_medium_tree", "background/submergedvillageAssets/obstacles/MediumTree_Obstacle.png");
this.load.image("sv_obstacle_small_tree", "background/submergedvillageAssets/obstacles/SmallTree_Obstacle.png");
this.load.image("sv_obstacle_stump", "background/submergedvillageAssets/obstacles/Stump_Obstacle.png");
```

### 4. Rendering Logic
**File:** `bathala/src/systems/generation/MazeGenSystem.ts`

Added obstacle rendering in `getWallTexture()`:
```typescript
// Obstacle tiles (TILE.OBSTACLE = 10) - randomly select from available obstacle sprites
if (tileValue === 10) {
  const obstacles = ['sv_obstacle_tree', 'sv_obstacle_medium_tree', 'sv_obstacle_small_tree', 'sv_obstacle_stump'];
  const idx = this.getDeterministicIndex(chunkX, chunkY, x, y, obstacles.length);
  return obstacles[idx];
}
```

## Behavior

### Tile Conversion
After all terrain generation completes:
1. PATH tiles (0) remain as walkable paths
2. Terrain features (CLIFF, HILL, GRASS_PATCH, SAND_PATCH, WATER) remain as-is
3. ALL remaining FOREST tiles (1) are converted to OBSTACLE tiles (10)

### Visual Variety
The system randomly selects from 4 obstacle types for visual variety:
- Large Tree
- Medium Tree  
- Small Tree
- Tree Stump

Selection is deterministic based on tile position, ensuring consistent appearance across game sessions.

## Path Traversability
Matching Enchanted Forest (Act 1) behavior:
- **PATH tiles (TILE.PATH = 0):** Traversable
- **All other tiles (including OBSTACLE):** Non-traversable

This creates a maze-like environment where:
- Players navigate through designated paths
- Obstacles fill all remaining space
- Terrain features (cliffs, hills, patches, water) provide visual variety
- The environment feels dense and enclosed, like a flooded forest

## Comparison to Act 1

### Act 1 (Enchanted Forest)
- Uses Delaunay Maze Generator
- Generates PATH tiles (0) and REGION tiles (1)
- REGION tiles render as forest obstacles (wall1, wall2, wall3)
- Result: Dense forest with carved paths

### Act 2 (Submerged Village)
- Uses Submerged Village Algorithm
- Generates complex terrain (paths, cliffs, hills, patches, water)
- Remaining FOREST tiles convert to OBSTACLE tiles
- OBSTACLE tiles render as trees/stumps (sv_obstacle_*)
- Result: Dense flooded forest with varied terrain features

Both acts share the same core principle: **only PATH tiles are traversable, everything else blocks movement**.

## Assets Used
All obstacle sprites are located in:
```
bathala/public/assets/background/submergedvillageAssets/obstacles/
├── Tree_Obstacle.png
├── MediumTree_Obstacle.png
├── SmallTree_Obstacle.png
└── Stump_Obstacle.png
```
