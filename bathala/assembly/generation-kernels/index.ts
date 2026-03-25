// @ts-nocheck
const MAX_WIDTH: i32 = 128;
const MAX_HEIGHT: i32 = 128;
const MAX_CELLS: i32 = MAX_WIDTH * MAX_HEIGHT;

const GRID = new StaticArray<i32>(MAX_CELLS);
const DEAD_ENDS = new StaticArray<i32>(MAX_CELLS);

@inline
function idx(x: i32, y: i32, width: i32): i32 {
  return y * width + x;
}

@inline
function inBounds(x: i32, y: i32, width: i32, height: i32): bool {
  return x >= 0 && x < width && y >= 0 && y < height;
}

@inline
function getCell(x: i32, y: i32, width: i32): i32 {
  return unchecked(GRID[idx(x, y, width)]);
}

@inline
function setCell(x: i32, y: i32, width: i32, value: i32): void {
  unchecked((GRID[idx(x, y, width)] = value));
}

@inline
function countPathNeighbors(x: i32, y: i32, width: i32, height: i32, pathTile: i32): i32 {
  let count = 0;

  const yUp = y + 1;
  if (yUp < height && getCell(x, yUp, width) == pathTile) count++;

  const xRight = x + 1;
  if (xRight < width && getCell(xRight, y, width) == pathTile) count++;

  const yDown = y - 1;
  if (yDown >= 0 && getCell(x, yDown, width) == pathTile) count++;

  const xLeft = x - 1;
  if (xLeft >= 0 && getCell(xLeft, y, width) == pathTile) count++;

  return count;
}

export function getGridPtr(): usize {
  return changetype<usize>(GRID);
}

export function getMaxCells(): i32 {
  return MAX_CELLS;
}

// Removes 2x2 blocks of path tiles by reverting one tile per block.
export function fixDoubleWideInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  fillTile: i32,
  maxIterations: i32,
): void {
  let iter = 0;
  let changed = true;

  while (changed && iter < maxIterations) {
    changed = false;
    iter++;

    let y = 0;
    while (y < height - 1) {
      let x = 0;
      while (x < width - 1) {
        if (
          getCell(x, y, width) == pathTile &&
          getCell(x + 1, y, width) == pathTile &&
          getCell(x, y + 1, width) == pathTile &&
          getCell(x + 1, y + 1, width) == pathTile
        ) {
          // Pick candidate with fewest external path neighbors.
          let bestX = x;
          let bestY = y;
          let bestScore = 999;

          for (let k = 0; k < 4; k++) {
            const bx = x + (k & 1);
            const by = y + ((k >> 1) & 1);

            let external = 0;

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

        x++;
      }
      y++;
    }
  }
}

// Extends dead-end paths forward to reduce path stubs.
export function extendDeadEndsInPlace(
  width: i32,
  height: i32,
  pathTile: i32,
  maxExtend: i32,
): void {
  let deadEndCount = 0;

  let y = 0;
  while (y < height) {
    let x = 0;
    while (x < width) {
      if (getCell(x, y, width) == pathTile && countPathNeighbors(x, y, width, height, pathTile) == 1) {
        unchecked((DEAD_ENDS[deadEndCount] = idx(x, y, width)));
        deadEndCount++;
      }
      x++;
    }
    y++;
  }

  let i = 0;
  while (i < deadEndCount) {
    const startIndex = unchecked(DEAD_ENDS[i]);
    const sx = startIndex % width;
    const sy = startIndex / width;

    let nx = sx;
    let ny = sy;

    // Find the single connected path neighbor to infer direction.
    let cx = -1;
    let cy = -1;

    if (sy + 1 < height && getCell(sx, sy + 1, width) == pathTile) { cx = sx; cy = sy + 1; }
    if (cx == -1 && sx + 1 < width && getCell(sx + 1, sy, width) == pathTile) { cx = sx + 1; cy = sy; }
    if (cx == -1 && sy - 1 >= 0 && getCell(sx, sy - 1, width) == pathTile) { cx = sx; cy = sy - 1; }
    if (cx == -1 && sx - 1 >= 0 && getCell(sx - 1, sy, width) == pathTile) { cx = sx - 1; cy = sy; }

    if (cx != -1) {
      const dx = sx - cx;
      const dy = sy - cy;

      nx = sx + dx;
      ny = sy + dy;

      let step = 0;
      while (step < maxExtend) {
        if (!inBounds(nx, ny, width, height)) break;
        if (getCell(nx, ny, width) == pathTile) break;

        setCell(nx, ny, width, pathTile);

        nx += dx;
        ny += dy;
        step++;
      }
    }

    i++;
  }
}
