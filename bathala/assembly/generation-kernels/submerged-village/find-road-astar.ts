// @ts-nocheck
/**
 * findRoadPathAStar — A* pathfinding for road carving in SubmergedVillage.
 *
 * Routes through non-house tiles, preferring existing paths.
 * Fences can be carved through at higher cost.
 *
 * Returns the number of path cells written to PATH_BUF, or -1 if no path.
 * PATH_BUF contains cell indices (y * width + x) in order from start to end.
 */

import {
  GRID,
  PATH_BUF,
  OPEN_F,
  OPEN_IDX,
  G_COST,
  CAME_FROM,
  CLOSED,
  MAX_CELLS,
  idx,
  inBounds,
  getCell,
} from '../common/grid';

@inline
function abs(v: i32): i32 {
  return v < 0 ? -v : v;
}

export function findRoadPathAStar(
  width: i32,
  height: i32,
  startX: i32,
  startY: i32,
  endX: i32,
  endY: i32,
  houseTile: i32,
  pathTile: i32,
  fenceTile: i32,
  baseCost: i32,         // cost × 1000 (integer fixed-point)
  existingPathCost: i32,  // cost × 1000
  fenceCostMultiplier: i32, // cost × 1000
  directionChangePenalty: i32, // cost × 1000
): i32 {
  const cells: i32 = width * height;
  if (cells <= 0 || cells > MAX_CELLS) return -1;

  const startIdx: i32 = idx(startX, startY, width);
  const endIdx: i32 = idx(endX, endY, width);

  // Initialize
  for (let i: i32 = 0; i < cells; i++) {
    unchecked((G_COST[i] = 2147483647)); // i32.MAX_VALUE
    unchecked((CAME_FROM[i] = -1));
    unchecked((CLOSED[i] = 0));
  }

  unchecked((G_COST[startIdx] = 0));

  // Open set as simple array (insertion sort by f-cost)
  let openSize: i32 = 0;

  const startH: i32 = (abs(endX - startX) + abs(endY - startY)) * baseCost;
  unchecked((OPEN_F[0] = startH));
  unchecked((OPEN_IDX[0] = startIdx));
  openSize = 1;

  const DIR_X: StaticArray<i32> = [0, 1, 0, -1];
  const DIR_Y: StaticArray<i32> = [-1, 0, 1, 0];

  while (openSize > 0) {
    // Pop lowest f-cost
    openSize--;
    const currentIdx: i32 = unchecked(OPEN_IDX[openSize]);

    if (currentIdx == endIdx) {
      // Reconstruct path
      let pathLen: i32 = 0;
      let cursor: i32 = endIdx;
      while (cursor != -1 && pathLen < MAX_CELLS) {
        unchecked((PATH_BUF[pathLen] = cursor));
        pathLen++;
        cursor = unchecked(CAME_FROM[cursor]);
      }

      // Reverse in-place
      let lo: i32 = 0;
      let hi: i32 = pathLen - 1;
      while (lo < hi) {
        const tmp: i32 = unchecked(PATH_BUF[lo]);
        unchecked((PATH_BUF[lo] = unchecked(PATH_BUF[hi])));
        unchecked((PATH_BUF[hi] = tmp));
        lo++;
        hi--;
      }

      return pathLen;
    }

    if (unchecked(CLOSED[currentIdx]) != 0) continue;
    unchecked((CLOSED[currentIdx] = 1));

    const cx: i32 = currentIdx % width;
    const cy: i32 = currentIdx / width;
    const currentG: i32 = unchecked(G_COST[currentIdx]);

    // Determine incoming direction for direction-change penalty
    const parentIdx: i32 = unchecked(CAME_FROM[currentIdx]);
    let prevDx: i32 = 0;
    let prevDy: i32 = 0;
    if (parentIdx >= 0) {
      const px: i32 = parentIdx % width;
      const py: i32 = parentIdx / width;
      prevDx = cx - px;
      prevDy = cy - py;
    }

    for (let d: i32 = 0; d < 4; d++) {
      const nx: i32 = cx + unchecked(DIR_X[d]);
      const ny: i32 = cy + unchecked(DIR_Y[d]);

      if (!inBounds(nx, ny, width, height)) continue;
      const nIdx: i32 = idx(nx, ny, width);
      if (unchecked(CLOSED[nIdx]) != 0) continue;

      const tile: i32 = unchecked(GRID[nIdx]);

      // Cannot path through houses
      if (tile == houseTile) continue;

      // Calculate movement cost
      let moveCost: i32 = baseCost;
      if (tile == pathTile) {
        moveCost = existingPathCost;
      } else if (tile == fenceTile) {
        moveCost = fenceCostMultiplier;
      }

      // Direction change penalty
      if (parentIdx >= 0) {
        const stepDx: i32 = unchecked(DIR_X[d]);
        const stepDy: i32 = unchecked(DIR_Y[d]);
        if (stepDx != prevDx || stepDy != prevDy) {
          moveCost += directionChangePenalty;
        }
      }

      const tentativeG: i32 = currentG + moveCost;
      if (tentativeG >= unchecked(G_COST[nIdx])) continue;

      unchecked((G_COST[nIdx] = tentativeG));
      unchecked((CAME_FROM[nIdx] = currentIdx));

      const h: i32 = (abs(endX - nx) + abs(endY - ny)) * baseCost;
      const f: i32 = tentativeG + h;

      // Insert into open set maintaining sorted order (ascending f)
      // Find insertion point
      let insertAt: i32 = openSize;
      while (insertAt > 0 && unchecked(OPEN_F[insertAt - 1]) < f) {
        insertAt--;
      }

      // Shift elements down
      for (let s: i32 = openSize; s > insertAt; s--) {
        unchecked((OPEN_F[s] = unchecked(OPEN_F[s - 1])));
        unchecked((OPEN_IDX[s] = unchecked(OPEN_IDX[s - 1])));
      }

      unchecked((OPEN_F[insertAt] = f));
      unchecked((OPEN_IDX[insertAt] = nIdx));
      openSize++;
    }
  }

  // No path found
  return -1;
}
