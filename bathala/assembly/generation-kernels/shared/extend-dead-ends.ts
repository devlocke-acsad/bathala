// @ts-nocheck
/**
 * extendDeadEndsInPlace — extends dead-end path stubs forward.
 *
 * Finds all dead-end path cells (exactly 1 path neighbor) and extends
 * them in the direction they're pointing for up to maxExtend steps.
 */

import { GRID, MAX_CELLS, idx, inBounds, getCell, setCell, countPathNeighbors4 } from '../common/grid';

const DEAD_ENDS = new StaticArray<i32>(MAX_CELLS);

export function extendDeadEndsInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  maxExtend: i32,
): void {
  let deadEndCount: i32 = 0;

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      if (
        getCell(x, y, width) == pathTile &&
        countPathNeighbors4(x, y, width, height, pathTile) == 1
      ) {
        unchecked((DEAD_ENDS[deadEndCount] = idx(x, y, width)));
        deadEndCount++;
      }
    }
  }

  for (let i: i32 = 0; i < deadEndCount; i++) {
    const startIndex: i32 = unchecked(DEAD_ENDS[i]);
    const sx: i32 = startIndex % width;
    const sy: i32 = startIndex / width;

    let cx: i32 = -1;
    let cy: i32 = -1;

    if (sy + 1 < height && getCell(sx, sy + 1, width) == pathTile) { cx = sx; cy = sy + 1; }
    if (cx == -1 && sx + 1 < width && getCell(sx + 1, sy, width) == pathTile) { cx = sx + 1; cy = sy; }
    if (cx == -1 && sy - 1 >= 0 && getCell(sx, sy - 1, width) == pathTile) { cx = sx; cy = sy - 1; }
    if (cx == -1 && sx - 1 >= 0 && getCell(sx - 1, sy, width) == pathTile) { cx = sx - 1; cy = sy; }

    if (cx != -1) {
      const dx: i32 = sx - cx;
      const dy: i32 = sy - cy;

      let nx: i32 = sx + dx;
      let ny: i32 = sy + dy;

      for (let step: i32 = 0; step < maxExtend; step++) {
        if (!inBounds(nx, ny, width, height)) break;
        if (getCell(nx, ny, width) == pathTile) break;

        setCell(nx, ny, width, pathTile);
        nx += dx;
        ny += dy;
      }
    }
  }
}
