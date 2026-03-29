// @ts-nocheck
/**
 * repairCliffGapsInPlace — fixes single-tile gaps in cliff walls.
 *
 * A non-cliff, non-water tile that has cliff neighbors on opposite sides
 * (N+S or E+W) is converted to cliffTile to close the gap.
 * Runs for maxPasses or until stable.
 */

import { getCell, setCell, inBounds } from '../common/grid';

export function repairCliffGapsInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  waterTile: i32,
  cliffTile: i32,
  maxPasses: i32,
): void {
  for (let pass: i32 = 0; pass < maxPasses; pass++) {
    let changed: bool = false;

    for (let y: i32 = 1; y < height - 1; y++) {
      for (let x: i32 = 1; x < width - 1; x++) {
        const tile: i32 = getCell(x, y, width);
        if (tile == cliffTile || tile == waterTile || tile == pathTile) continue;

        const north: bool = getCell(x, y - 1, width) == cliffTile;
        const south: bool = getCell(x, y + 1, width) == cliffTile;
        const east: bool = getCell(x + 1, y, width) == cliffTile;
        const west: bool = getCell(x - 1, y, width) == cliffTile;

        // Close gap if cliff on opposing sides
        if ((north && south) || (east && west)) {
          setCell(x, y, width, cliffTile);
          changed = true;
        }
      }
    }

    if (!changed) break;
  }
}
