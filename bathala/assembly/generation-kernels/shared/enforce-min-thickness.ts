// @ts-nocheck
/**
 * enforceMinThickness2x2InPlace — ensures patchTile regions are ≥ 2 tiles thick.
 *
 * Iteratively removes patchTile cells that aren't part of at least one
 * 2×2 block of patchTile, replacing them with fillTile. Repeats for
 * maxPasses or until stable.
 */

import { getCell, setCell } from '../common/grid';

export function enforceMinThickness2x2InPlace(
  width: i32,
  height: i32,
  patchTile: i32,
  fillTile: i32,
  maxPasses: i32,
): void {
  for (let pass: i32 = 0; pass < maxPasses; pass++) {
    let changed: bool = false;

    for (let y: i32 = 0; y < height; y++) {
      for (let x: i32 = 0; x < width; x++) {
        if (getCell(x, y, width) != patchTile) continue;

        // Check if (x,y) belongs to ANY 2×2 block of patchTile.
        let partOf2x2: bool = false;

        // Check all four possible 2×2 anchors this cell could belong to:
        // (x,y) as top-left
        if (
          x + 1 < width && y + 1 < height &&
          getCell(x + 1, y, width) == patchTile &&
          getCell(x, y + 1, width) == patchTile &&
          getCell(x + 1, y + 1, width) == patchTile
        ) {
          partOf2x2 = true;
        }
        // (x-1, y) as top-left
        if (
          !partOf2x2 &&
          x - 1 >= 0 && y + 1 < height &&
          getCell(x - 1, y, width) == patchTile &&
          getCell(x - 1, y + 1, width) == patchTile &&
          getCell(x, y + 1, width) == patchTile
        ) {
          partOf2x2 = true;
        }
        // (x, y-1) as top-left
        if (
          !partOf2x2 &&
          x + 1 < width && y - 1 >= 0 &&
          getCell(x + 1, y, width) == patchTile &&
          getCell(x, y - 1, width) == patchTile &&
          getCell(x + 1, y - 1, width) == patchTile
        ) {
          partOf2x2 = true;
        }
        // (x-1, y-1) as top-left
        if (
          !partOf2x2 &&
          x - 1 >= 0 && y - 1 >= 0 &&
          getCell(x - 1, y, width) == patchTile &&
          getCell(x, y - 1, width) == patchTile &&
          getCell(x - 1, y - 1, width) == patchTile
        ) {
          partOf2x2 = true;
        }

        if (!partOf2x2) {
          setCell(x, y, width, fillTile);
          changed = true;
        }
      }
    }

    if (!changed) break;
  }
}
