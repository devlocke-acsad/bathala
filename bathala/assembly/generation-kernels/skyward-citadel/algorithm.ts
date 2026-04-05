// @ts-nocheck
/**
 * Main pipeline — generateSkywardCitadel().
 *
 * Single exported function that runs the entire citadel generation in WASM.
 * The host writes params to PARAMS buffer, then calls this function.
 * Result is in the GRID buffer.
 *
 * Mirrors submerged-village/algorithm.ts — separate module for Act 3.
 */
import { GRID, setCell, MAX_CELLS } from '../common/grid';
import {
  TILE_PATH, TILE_FOREST, rngInit, param,
  P_HOUSE_CLEAR_RADIUS, P_SCATTER_TREE, P_VILLAGE_GROWTH,
  P_FENCE_CHANCE, P_RUBBLE_CHANCE, P_FIX_DOUBLE_WIDE,
  houseCount, getParamsPtr as _getParamsPtr,
} from './buffers';
import { placeAllHouses, clearAroundHouses, growVillageGround, placeFences, scatterDecorativeTrees, scatterRubble, scatterObstacles } from './houses';
import { carveAllRoads, ensureGlobalAccessibility, addDetourRoutes, fixDoubleWidePaths, resolveNearMissCorners, reduceDeadEnds, repairPathGapsAfterBiome } from './roads';
import { applyBiomeTerrainFeatures } from './terrain';

export { getParamsPtr } from './buffers';

export function generateSkywardCitadel(width: i32, height: i32, seed: i32): void {
  const cells: i32 = width * height;
  if (cells <= 0 || cells > MAX_CELLS) return;

  // Initialize RNG
  rngInit(seed);

  // Phase 1: Fill with forest
  for (let i: i32 = 0; i < cells; i++) {
    unchecked((GRID[i] = TILE_FOREST));
  }

  // Phase 2: Place houses
  placeAllHouses(width, height);

  // Phase 3: Clear around houses
  clearAroundHouses(width, height, param(P_HOUSE_CLEAR_RADIUS));

  // Phase 4: Grow village ground
  growVillageGround(width, height, param(P_VILLAGE_GROWTH));

  // Phase 5: Place fences
  placeFences(width, height, f64(param(P_FENCE_CHANCE)) / 1000.0);

  // Phase 6: Carve roads (door stubs + K-nearest graph + border access)
  carveAllRoads(width, height);

  // Phase 7: Ensure global accessibility (BFS component bridging)
  ensureGlobalAccessibility(width, height);

  // Phase 8: Add detour routes
  addDetourRoutes(width, height);

  // Phase 9: Scatter rubble
  scatterRubble(width, height, f64(param(P_RUBBLE_CHANCE)) / 1000.0);

  // Phase 10: Scatter decorative trees
  scatterDecorativeTrees(width, height, f64(param(P_SCATTER_TREE)) / 1000.0);

  // Phase 11: Fix double-wide paths
  if (param(P_FIX_DOUBLE_WIDE) != 0) fixDoubleWidePaths(width, height);

  // Phase 12: Resolve near-miss corners
  resolveNearMissCorners(width, height);

  // Phase 13: Reduce dead ends
  reduceDeadEnds(width, height);

  // Phase 14: Apply biome terrain features
  applyBiomeTerrainFeatures(width, height);

  // Phase 15: Repair path gaps after biome
  repairPathGapsAfterBiome(width, height);

  // Phase 16: Scatter obstacles (remaining forest → obstacle)
  scatterObstacles(width, height);

  // Phase 17: Final accessibility pass
  ensureGlobalAccessibility(width, height);
}
