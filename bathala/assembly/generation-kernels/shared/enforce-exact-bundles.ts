// @ts-nocheck
/**
 * enforceExact2x2BundlesInPlace — enforces that tileType cells exist
 * ONLY as complete 2×2 blocks.
 *
 * Any tileType cell not part of a full 2×2 block is replaced with fillTile.
 * When `enableNearRule` is non-zero, cells of `nearTile` that are adjacent
 * to orphaned tileType cells are also replaced with `nearFillTile`.
 */

import { getCell, setCell, inBounds } from '../common/grid';

export function enforceExact2x2BundlesInPlace(
  width: i32,
  height: i32,
  tileType: i32,
  fillTile: i32,
  enableNearRule: i32,
  nearTile: i32,
  nearFillTile: i32,
): void {
  // Pass 1: Find and mark orphan cells (not part of any 2×2 block).
  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      if (getCell(x, y, width) != tileType) continue;

      let partOf2x2: bool = false;

      // top-left anchor at (x, y)
      if (
        x + 1 < width && y + 1 < height &&
        getCell(x + 1, y, width) == tileType &&
        getCell(x, y + 1, width) == tileType &&
        getCell(x + 1, y + 1, width) == tileType
      ) {
        partOf2x2 = true;
      }
      // top-left anchor at (x-1, y)
      if (
        !partOf2x2 &&
        x - 1 >= 0 && y + 1 < height &&
        getCell(x - 1, y, width) == tileType &&
        getCell(x - 1, y + 1, width) == tileType &&
        getCell(x, y + 1, width) == tileType
      ) {
        partOf2x2 = true;
      }
      // top-left anchor at (x, y-1)
      if (
        !partOf2x2 &&
        x + 1 < width && y - 1 >= 0 &&
        getCell(x + 1, y, width) == tileType &&
        getCell(x, y - 1, width) == tileType &&
        getCell(x + 1, y - 1, width) == tileType
      ) {
        partOf2x2 = true;
      }
      // top-left anchor at (x-1, y-1)
      if (
        !partOf2x2 &&
        x - 1 >= 0 && y - 1 >= 0 &&
        getCell(x - 1, y, width) == tileType &&
        getCell(x, y - 1, width) == tileType &&
        getCell(x - 1, y - 1, width) == tileType
      ) {
        partOf2x2 = true;
      }

      if (!partOf2x2) {
        // Near-rule: If enabled, replace adjacent nearTile cells too.
        if (enableNearRule != 0) {
          const dx4: StaticArray<i32> = [0, 0, -1, 1];
          const dy4: StaticArray<i32> = [-1, 1, 0, 0];
          for (let d: i32 = 0; d < 4; d++) {
            const nx: i32 = x + unchecked(dx4[d]);
            const ny: i32 = y + unchecked(dy4[d]);
            if (inBounds(nx, ny, width, height) && getCell(nx, ny, width) == nearTile) {
              setCell(nx, ny, width, nearFillTile);
            }
          }
        }
        setCell(x, y, width, fillTile);
      }
    }
  }
}
