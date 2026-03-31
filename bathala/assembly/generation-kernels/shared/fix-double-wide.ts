// @ts-nocheck
/**
 * fixDoubleWideInPlace — eliminates 2×2 blocks of path tiles.
 *
 * For each 2×2 block of pathTile, pick the cell with fewest external
 * path neighbors and fill it, breaking the block into single-width.
 */

import { getCell, setCell } from '../common/grid';

export function fixDoubleWideInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  fillTile: i32,
  maxIterations: i32,
): void {
  let iter: i32 = 0;
  let changed: bool = true;

  while (changed && iter < maxIterations) {
    changed = false;
    iter++;

    for (let y: i32 = 0; y < height - 1; y++) {
      for (let x: i32 = 0; x < width - 1; x++) {
        if (
          getCell(x, y, width) == pathTile &&
          getCell(x + 1, y, width) == pathTile &&
          getCell(x, y + 1, width) == pathTile &&
          getCell(x + 1, y + 1, width) == pathTile
        ) {
          let bestX: i32 = x;
          let bestY: i32 = y;
          let bestScore: i32 = 999;

          for (let k: i32 = 0; k < 4; k++) {
            const bx: i32 = x + (k & 1);
            const by: i32 = y + ((k >> 1) & 1);

            let external: i32 = 0;

            // Up
            if (!(bx >= x && bx <= x + 1 && by + 1 >= y && by + 1 <= y + 1)) {
              if (by + 1 < height && getCell(bx, by + 1, width) == pathTile) external++;
            }
            // Right
            if (!(bx + 1 >= x && bx + 1 <= x + 1 && by >= y && by <= y + 1)) {
              if (bx + 1 < width && getCell(bx + 1, by, width) == pathTile) external++;
            }
            // Down
            if (!(bx >= x && bx <= x + 1 && by - 1 >= y && by - 1 <= y + 1)) {
              if (by - 1 >= 0 && getCell(bx, by - 1, width) == pathTile) external++;
            }
            // Left
            if (!(bx - 1 >= x && bx - 1 <= x + 1 && by >= y && by <= y + 1)) {
              if (bx - 1 >= 0 && getCell(bx - 1, by, width) == pathTile) external++;
            }

            if (external < bestScore) {
              bestScore = external;
              bestX = bx;
              bestY = by;
            }
          }

          setCell(bestX, bestY, width, fillTile);
          changed = true;
        }
      }
    }
  }
}
