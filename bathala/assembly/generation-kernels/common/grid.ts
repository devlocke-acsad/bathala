// @ts-nocheck
/**
 * Shared grid memory management for all generation kernels.
 *
 * Layout (flat i32 arrays):
 *   GRID   – main tile buffer (width × height cells)
 *   PATH   – A* output buffer (max path length = MAX_CELLS)
 *   LABELS – temp BFS/flood-fill label buffer (same size as GRID)
 *   QUEUE  – BFS queue buffer
 *
 * The host calls `ensureCapacity(requiredCells)` before every kernel
 * invocation so that all buffers are large enough.
 */

// ── Absolute maximum supported grid ──────────────────────────────────────
export const MAX_WIDTH: i32 = 128;
export const MAX_HEIGHT: i32 = 128;
export const MAX_CELLS: i32 = MAX_WIDTH * MAX_HEIGHT; // 16 384

// ── Static buffers (allocated once, reused across calls) ─────────────────
export const GRID = new StaticArray<i32>(MAX_CELLS);
export const PATH_BUF = new StaticArray<i32>(MAX_CELLS);
export const LABELS = new StaticArray<i32>(MAX_CELLS);
export const QUEUE = new StaticArray<i32>(MAX_CELLS * 2); // x,y pairs

// ── A* open-set buffers ──────────────────────────────────────────────────
export const OPEN_F = new StaticArray<i32>(MAX_CELLS);     // f-cost × 1000
export const OPEN_IDX = new StaticArray<i32>(MAX_CELLS);   // cell index
export const G_COST = new StaticArray<i32>(MAX_CELLS);     // g-cost × 1000
export const CAME_FROM = new StaticArray<i32>(MAX_CELLS);  // parent cell index
export const CLOSED = new StaticArray<u8>(MAX_CELLS);      // 0/1

// ── Current capacity tracking ────────────────────────────────────────────
let currentMaxCells: i32 = MAX_CELLS;

// ── Inline helpers ───────────────────────────────────────────────────────
@inline
export function idx(x: i32, y: i32, width: i32): i32 {
  return y * width + x;
}

@inline
export function inBounds(x: i32, y: i32, width: i32, height: i32): bool {
  return x >= 0 && x < width && y >= 0 && y < height;
}

@inline
export function getCell(x: i32, y: i32, width: i32): i32 {
  return unchecked(GRID[idx(x, y, width)]);
}

@inline
export function setCell(x: i32, y: i32, width: i32, value: i32): void {
  unchecked((GRID[idx(x, y, width)] = value));
}

@inline
export function countPathNeighbors4(
  x: i32,
  y: i32,
  width: i32,
  height: i32,
  pathTile: i32,
): i32 {
  let count: i32 = 0;
  if (y + 1 < height && getCell(x, y + 1, width) == pathTile) count++;
  if (x + 1 < width && getCell(x + 1, y, width) == pathTile) count++;
  if (y - 1 >= 0 && getCell(x, y - 1, width) == pathTile) count++;
  if (x - 1 >= 0 && getCell(x - 1, y, width) == pathTile) count++;
  return count;
}

// ── Exported accessors ───────────────────────────────────────────────────

export function ensureCapacity(requiredCells: i32): i32 {
  if (requiredCells <= 0 || requiredCells > MAX_CELLS) return 0;
  currentMaxCells = requiredCells;
  return 1;
}

export function getGridPtr(): usize {
  return changetype<usize>(GRID);
}

export function getPathPtr(): usize {
  return changetype<usize>(PATH_BUF);
}

export function getMaxCells(): i32 {
  return currentMaxCells;
}
