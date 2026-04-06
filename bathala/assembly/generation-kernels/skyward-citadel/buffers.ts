// @ts-nocheck
/**
 * Citadel-specific buffers, RNG, and params for the full AS algorithm.
 * Mirrors submerged-village/buffers.ts exactly — separate module for Act 3.
 */
import { MAX_CELLS, GRID, PATH_BUF, LABELS, QUEUE, CLOSED, idx, inBounds, getCell, setCell } from '../common/grid';

// ── Tile constants ───────────────────────────────────────────────────────
export const TILE_PATH: i32 = 0;
export const TILE_FOREST: i32 = 1;
export const TILE_HOUSE: i32 = 2;
export const TILE_FENCE: i32 = 3;
export const TILE_RUBBLE: i32 = 4;
export const TILE_CLIFF: i32 = 5;
export const TILE_HILL: i32 = 6;
export const TILE_GRASS: i32 = 7;
export const TILE_SAND: i32 = 8;
export const TILE_WATER: i32 = 9;
export const TILE_OBSTACLE: i32 = 10;

// ── Params buffer (host writes before calling generate) ──────────────────
export const PARAMS = new StaticArray<i32>(32);

export function getParamsPtr(): usize {
  return changetype<usize>(PARAMS);
}

// Param indices
export const P_HOUSE_COUNT: i32        = 0;
export const P_HOUSE_MIN_SPACING: i32  = 1;
export const P_NEIGHBORHOOD_COUNT: i32 = 2;
export const P_SPREAD_FACTOR: i32      = 3;  // ×1000
export const P_HOUSE_CLEAR_RADIUS: i32 = 4;
export const P_SCATTER_TREE: i32       = 5;  // ×1000
export const P_VILLAGE_GROWTH: i32     = 6;
export const P_FENCE_CHANCE: i32       = 7;  // ×1000
export const P_RUBBLE_CHANCE: i32      = 8;  // ×1000
export const P_CENTER_BIAS_X: i32      = 9;  // ×1000, 2147483647=null
export const P_CENTER_BIAS_Y: i32      = 10; // ×1000
export const P_HOUSE_SIZE_PREF: i32    = 11; // 0=small,1=all,2=large
export const P_ROAD_NEIGHBOR: i32      = 12;
export const P_DOOR_STUB_LEN: i32      = 13;
export const P_BORDER_JITTER: i32      = 14;
export const P_CONNECTOR_BEND: i32     = 15;
export const P_EDGE_CONN_PER_SIDE: i32 = 16;
export const P_DETOUR_COUNT: i32       = 17;
export const P_DETOUR_MIN_DIST: i32    = 18;
export const P_DETOUR_MAX_DIST: i32    = 19;
export const P_FIX_DOUBLE_WIDE: i32    = 20;
export const P_EDGE_MARGIN: i32        = 21;
export const P_CLIFF_BAND: i32         = 22;
export const P_HILL_CLUSTER: i32       = 23;
export const P_GRASS_PATCH: i32        = 24;
export const P_SAND_PATCH: i32         = 25;
export const P_WATER_POOL: i32         = 26;

@inline
export function param(i: i32): i32 {
  return unchecked(PARAMS[i]);
}

@inline
export function paramF(i: i32): f64 {
  return f64(unchecked(PARAMS[i])) / 1000.0;
}

// ── RNG (Mulberry32 — matches TS SeededRNG) ──────────────────────────────
let rngState: i32 = 1;

export function rngInit(seed: i32): void {
  rngState = seed;
}

export function rng(): f64 {
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t: i32 = i32(i64(rngState ^ (rngState >>> 15)) * i64(1 | rngState));
  t = (t + i32(i64(t ^ (t >>> 7)) * i64(61 | t))) ^ t;
  return f64(u32(t ^ (t >>> 14))) / 4294967296.0;
}

export function rngInt(min: i32, max: i32): i32 {
  return min + i32(Math.floor(rng() * f64(max - min + 1)));
}

// ── Village buffers ──────────────────────────────────────────────────────
export const MAX_HOUSES: i32 = 48;
export const MAX_HOUSE_TILES: i32 = 1440; // 48 houses × 30 tiles max

export const HOUSE_OX = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_OY = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_DOOR_X = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_DOOR_Y = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_SHAPE = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_TILE_START = new StaticArray<i32>(MAX_HOUSES);
export const HOUSE_TILE_COUNT = new StaticArray<i32>(MAX_HOUSES);

export const HTILES_X = new StaticArray<i32>(MAX_HOUSE_TILES);
export const HTILES_Y = new StaticArray<i32>(MAX_HOUSE_TILES);

export let houseCount: i32 = 0;
export let totalHouseTiles: i32 = 0;

export function resetHouses(): void {
  houseCount = 0;
  totalHouseTiles = 0;
}

// Bitmaps (reusable u8 arrays for fast coordinate lookups)
export const BITMAP_A = new StaticArray<u8>(MAX_CELLS);
export const BITMAP_B = new StaticArray<u8>(MAX_CELLS);

export function clearBitmap(bmp: StaticArray<u8>, len: i32): void {
  for (let i: i32 = 0; i < len; i++) {
    unchecked((bmp[i] = 0));
  }
}

// Temp coordinate buffers for collecting tiles
export const TEMP_X = new StaticArray<i32>(MAX_CELLS);
export const TEMP_Y = new StaticArray<i32>(MAX_CELLS);

// ── Utility ──────────────────────────────────────────────────────────────
@inline
export function clampI(v: i32, lo: i32, hi: i32): i32 {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

@inline
export function absI(v: i32): i32 {
  return v < 0 ? -v : v;
}

@inline
export function minI(a: i32, b: i32): i32 {
  return a < b ? a : b;
}

@inline
export function maxI(a: i32, b: i32): i32 {
  return a > b ? a : b;
}
