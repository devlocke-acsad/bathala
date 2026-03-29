// @ts-nocheck
/**
 * enforceCliffShellIntegrityInPlace — ensures cliff formations have
 * proper shell integrity by converting cliff-adjacent non-path/non-water
 * tiles into pathTile or cliffTile as needed.
 *
 * Rules:
 *   1. Any cliff cell that's only connected to other cliff cells on one axis
 *      and has non-cliff neighbors on perpendicular axis gets converted to
 *      maintain contiguous shell shapes.
 *   2. Non-cliff/non-water/non-hill cells adjacent to cliff get converted to
 *      pathTile to maintain a 1-tile moat around cliff formations.
 *
 * Runs for maxPasses or until stable.
 */

import { getCell, setCell, inBounds } from '../common/grid';

export function enforceCliffShellIntegrityInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  waterTile: i32,
  cliffTile: i32,
  hillTile: i32,
  maxPasses: i32,
): void {
  for (let pass: i32 = 0; pass < maxPasses; pass++) {
    let changed: bool = false;

    for (let y: i32 = 0; y < height; y++) {
      for (let x: i32 = 0; x < width; x++) {
        const tile: i32 = getCell(x, y, width);

        if (tile == cliffTile) {
          // Count cliff neighbors in cardinal directions
          let cliffNeighbors: i32 = 0;
          if (y > 0 && getCell(x, y - 1, width) == cliffTile) cliffNeighbors++;
          if (y + 1 < height && getCell(x, y + 1, width) == cliffTile) cliffNeighbors++;
          if (x > 0 && getCell(x - 1, y, width) == cliffTile) cliffNeighbors++;
          if (x + 1 < width && getCell(x + 1, y, width) == cliffTile) cliffNeighbors++;

          // Isolated cliff (0 or 1 neighbor) becomes path
          if (cliffNeighbors <= 1) {
            setCell(x, y, width, pathTile);
            changed = true;
          }
        } else if (tile != pathTile && tile != waterTile && tile != hillTile) {
          // Non-special tile adjacent to cliff? Ensure it's compatible.
          let adjCliff: bool = false;
          if (y > 0 && getCell(x, y - 1, width) == cliffTile) adjCliff = true;
          if (!adjCliff && y + 1 < height && getCell(x, y + 1, width) == cliffTile) adjCliff = true;
          if (!adjCliff && x > 0 && getCell(x - 1, y, width) == cliffTile) adjCliff = true;
          if (!adjCliff && x + 1 < width && getCell(x + 1, y, width) == cliffTile) adjCliff = true;

          // Diagonals too
          if (!adjCliff && x > 0 && y > 0 && getCell(x - 1, y - 1, width) == cliffTile) adjCliff = true;
          if (!adjCliff && x + 1 < width && y > 0 && getCell(x + 1, y - 1, width) == cliffTile) adjCliff = true;
          if (!adjCliff && x > 0 && y + 1 < height && getCell(x - 1, y + 1, width) == cliffTile) adjCliff = true;
          if (!adjCliff && x + 1 < width && y + 1 < height && getCell(x + 1, y + 1, width) == cliffTile) adjCliff = true;

          // Adjacent to cliff and not an allowed neighbor type → convert to path
          // so cliffs have a visible moat.
          // Skip this for the border to avoid visual artifacts.
          if (adjCliff && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
            setCell(x, y, width, pathTile);
            changed = true;
          }
        }
      }
    }

    if (!changed) break;
  }
}
