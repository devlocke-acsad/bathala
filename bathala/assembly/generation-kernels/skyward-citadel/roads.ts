// @ts-nocheck
/**
 * Road carving, border access, BFS connectivity, dead-end reduction, double-wide fix.
 * Mirrors submerged-village/roads.ts — separate module for Act 3 (Skyward Citadel).
 */
import { GRID, PATH_BUF, LABELS, QUEUE, CLOSED, MAX_CELLS, idx, inBounds, getCell, setCell } from '../common/grid';
import { findRoadPathAStar } from './find-road-astar';
import { fixDoubleWideInPlace } from '../shared/fix-double-wide';
import {
  TILE_PATH, TILE_FOREST, TILE_HOUSE, TILE_FENCE, TILE_WATER, TILE_CLIFF, TILE_OBSTACLE,
  rng, rngInt, clampI, absI, minI, maxI, param, paramF,
  houseCount, HOUSE_DOOR_X, HOUSE_DOOR_Y, HOUSE_TILE_START, HOUSE_TILE_COUNT,
  HTILES_X, HTILES_Y,
  BITMAP_A, BITMAP_B, clearBitmap, TEMP_X, TEMP_Y,
  P_DOOR_STUB_LEN, P_BORDER_JITTER, P_CONNECTOR_BEND, P_EDGE_CONN_PER_SIDE,
  P_DETOUR_COUNT, P_DETOUR_MIN_DIST, P_DETOUR_MAX_DIST, P_ROAD_NEIGHBOR,
} from './buffers';

// ── A* cost constants (×1000 fixed-point) ────────────────────────────────
const BASE_COST: i32 = 1200;
const EXISTING_PATH_COST: i32 = 800;
const FENCE_COST: i32 = 1500;
const DIR_CHANGE_PENALTY: i32 = 30;

// ── Internal A* call + stamp path ────────────────────────────────────────
function carveRoad(w: i32, h: i32, sx: i32, sy: i32, ex: i32, ey: i32): bool {
  const len: i32 = findRoadPathAStar(w, h, sx, sy, ex, ey, TILE_HOUSE, TILE_PATH, TILE_FENCE, BASE_COST, EXISTING_PATH_COST, FENCE_COST, DIR_CHANGE_PENALTY);
  if (len <= 0) return false;
  for (let i: i32 = 0; i < len; i++) {
    const ci: i32 = unchecked(PATH_BUF[i]);
    const px: i32 = ci % w;
    const py: i32 = ci / w;
    if (getCell(px, py, w) != TILE_HOUSE) setCell(px, py, w, TILE_PATH);
  }
  return true;
}

// ── Door stubs ───────────────────────────────────────────────────────────
function carveDoorStubs(w: i32, h: i32, stubLen: i32): void {
  if (stubLen <= 0) return;
  for (let hi: i32 = 0; hi < houseCount; hi++) {
    const dx: i32 = unchecked(HOUSE_DOOR_X[hi]);
    const dy: i32 = unchecked(HOUSE_DOOR_Y[hi]);
    setCell(dx, dy, w, TILE_PATH);
    // Find direction: from adjacent house tile away
    let ddx: i32 = 0, ddy: i32 = 0;
    const start: i32 = unchecked(HOUSE_TILE_START[hi]);
    const count: i32 = unchecked(HOUSE_TILE_COUNT[hi]);
    for (let t: i32 = 0; t < count; t++) {
      const tx: i32 = unchecked(HTILES_X[start + t]);
      const ty: i32 = unchecked(HTILES_Y[start + t]);
      if ((absI(tx - dx) + absI(ty - dy)) == 1) { ddx = dx - tx; ddy = dy - ty; break; }
    }
    let sx: i32 = dx, sy: i32 = dy;
    for (let s: i32 = 0; s < stubLen; s++) {
      sx += ddx; sy += ddy;
      if (!inBounds(sx, sy, w, h) || getCell(sx, sy, w) == TILE_HOUSE) break;
      setCell(sx, sy, w, TILE_PATH);
    }
  }
}

// ── Road graph (K-nearest-neighbor) ──────────────────────────────────────
// Edge temp storage
const EDGE_A = new StaticArray<i32>(128);
const EDGE_B = new StaticArray<i32>(128);
const EDGE_D = new StaticArray<i32>(128);
let edgeCount: i32 = 0;

function buildGraphAndCarve(w: i32, h: i32): void {
  const k: i32 = minI(param(P_ROAD_NEIGHBOR), houseCount - 1);
  if (k <= 0) return;
  edgeCount = 0;

  for (let i: i32 = 0; i < houseCount; i++) {
    // Sort all other houses by distance
    const ix: i32 = unchecked(HOUSE_DOOR_X[i]);
    const iy: i32 = unchecked(HOUSE_DOOR_Y[i]);
    // Simple: find k nearest, add edges
    for (let n: i32 = 0; n < k; n++) {
      let bestJ: i32 = -1, bestDist: i32 = 99999;
      for (let j: i32 = 0; j < houseCount; j++) {
        if (j == i) continue;
        const dist: i32 = absI(ix - unchecked(HOUSE_DOOR_X[j])) + absI(iy - unchecked(HOUSE_DOOR_Y[j]));
        // Skip if already picked as closer neighbor
        let already: bool = false;
        for (let e: i32 = 0; e < edgeCount; e++) {
          if ((unchecked(EDGE_A[e]) == i && unchecked(EDGE_B[e]) == j) || (unchecked(EDGE_A[e]) == j && unchecked(EDGE_B[e]) == i)) { already = true; break; }
        }
        if (already) continue;
        if (dist < bestDist) { bestDist = dist; bestJ = j; }
      }
      if (bestJ >= 0 && edgeCount < 128) {
        unchecked((EDGE_A[edgeCount] = i));
        unchecked((EDGE_B[edgeCount] = bestJ));
        unchecked((EDGE_D[edgeCount] = bestDist));
        edgeCount++;
      }
    }
  }

  // Sort edges by distance (insertion sort, small N)
  for (let i: i32 = 1; i < edgeCount; i++) {
    const d: i32 = unchecked(EDGE_D[i]);
    const a: i32 = unchecked(EDGE_A[i]);
    const b: i32 = unchecked(EDGE_B[i]);
    let j: i32 = i - 1;
    while (j >= 0 && unchecked(EDGE_D[j]) > d) {
      unchecked((EDGE_D[j + 1] = unchecked(EDGE_D[j])));
      unchecked((EDGE_A[j + 1] = unchecked(EDGE_A[j])));
      unchecked((EDGE_B[j + 1] = unchecked(EDGE_B[j])));
      j--;
    }
    unchecked((EDGE_D[j + 1] = d));
    unchecked((EDGE_A[j + 1] = a));
    unchecked((EDGE_B[j + 1] = b));
  }

  // Carve roads
  for (let e: i32 = 0; e < edgeCount; e++) {
    const ai: i32 = unchecked(EDGE_A[e]);
    const bi: i32 = unchecked(EDGE_B[e]);
    setCell(unchecked(HOUSE_DOOR_X[ai]), unchecked(HOUSE_DOOR_Y[ai]), w, TILE_PATH);
    setCell(unchecked(HOUSE_DOOR_X[bi]), unchecked(HOUSE_DOOR_Y[bi]), w, TILE_PATH);
    carveRoad(w, h, unchecked(HOUSE_DOOR_X[ai]), unchecked(HOUSE_DOOR_Y[ai]), unchecked(HOUSE_DOOR_X[bi]), unchecked(HOUSE_DOOR_Y[bi]));
  }
}

// ── Border access ────────────────────────────────────────────────────────
function findNearestPath(w: i32, h: i32, tx: i32, ty: i32): i32 {
  // Returns packed (x | (y << 16)) or -1
  let bestDist: i32 = 99999, bestX: i32 = -1, bestY: i32 = -1;
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) != TILE_PATH) continue;
      const dist: i32 = absI(x - tx) + absI(y - ty);
      if (dist < bestDist) { bestDist = dist; bestX = x; bestY = y; }
    }
  }
  if (bestX < 0) return -1;
  return bestX | (bestY << 16);
}

function ensureBorderAccess(w: i32, h: i32): void {
  const perSide: i32 = maxI(1, param(P_EDGE_CONN_PER_SIDE));
  const jitter: i32 = param(P_BORDER_JITTER);
  const bend: i32 = param(P_CONNECTOR_BEND);
  const cx: i32 = w >> 1, cy: i32 = h >> 1;

  for (let s: i32 = 0; s < perSide; s++) {
    // 4 edges: N, S, W, E
    for (let edge: i32 = 0; edge < 4; edge++) {
      let tx: i32 = 0, ty: i32 = 0;
      if (edge == 0) { tx = clampI(cx + rngInt(-jitter, jitter), 1, w - 2); ty = 0; }
      else if (edge == 1) { tx = clampI(cx + rngInt(-jitter, jitter), 1, w - 2); ty = h - 1; }
      else if (edge == 2) { tx = 0; ty = clampI(cy + rngInt(-jitter, jitter), 1, h - 2); }
      else { tx = w - 1; ty = clampI(cy + rngInt(-jitter, jitter), 1, h - 2); }

      const packed: i32 = findNearestPath(w, h, tx, ty);
      if (packed < 0) continue;
      const nx: i32 = packed & 0xFFFF, ny: i32 = (packed >> 16) & 0xFFFF;

      // Waypoint with bend
      let wx: i32 = 0, wy: i32 = 0;
      if (edge < 2) { wx = clampI(nx + rngInt(-bend, bend), 1, w - 2); wy = clampI((ny + ty) >> 1, 1, h - 2); }
      else { wx = clampI((nx + tx) >> 1, 1, w - 2); wy = clampI(ny + rngInt(-bend, bend), 1, h - 2); }
      if (getCell(wx, wy, w) == TILE_HOUSE) {
        for (let r: i32 = 1; r <= 3; r++) {
          for (let dy: i32 = -r; dy <= r; dy++) {
            for (let dx: i32 = -r; dx <= r; dx++) {
              if (inBounds(wx + dx, wy + dy, w, h) && getCell(wx + dx, wy + dy, w) != TILE_HOUSE) { wx += dx; wy += dy; r = 4; dy = r; break; }
            }
          }
        }
      }
      carveRoad(w, h, nx, ny, wx, wy);
      carveRoad(w, h, wx, wy, tx, ty);
    }
  }
}

// ── BFS connectivity ─────────────────────────────────────────────────────
// Component storage
const COMP_START = new StaticArray<i32>(256);
const COMP_SIZE = new StaticArray<i32>(256);
const COMP_TILES = new StaticArray<i32>(MAX_CELLS); // packed x|(y<<16)
let compTotalTiles: i32 = 0;
let compCount: i32 = 0;

function collectPathComponents(w: i32, h: i32): void {
  const cells: i32 = w * h;
  clearBitmap(BITMAP_B, cells);
  compCount = 0;
  compTotalTiles = 0;

  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) != TILE_PATH) continue;
      const ci: i32 = y * w + x;
      if (unchecked(BITMAP_B[ci]) != 0) continue;

      const start: i32 = compTotalTiles;
      let qHead: i32 = 0, qTail: i32 = 0;
      unchecked((QUEUE[0] = x)); unchecked((QUEUE[1] = y)); qTail = 1;
      unchecked((BITMAP_B[ci] = 1));

      while (qHead < qTail) {
        const qx: i32 = unchecked(QUEUE[qHead * 2]);
        const qy: i32 = unchecked(QUEUE[qHead * 2 + 1]);
        qHead++;
        unchecked((COMP_TILES[compTotalTiles] = qx | (qy << 16)));
        compTotalTiles++;
        const dx4: StaticArray<i32> = [0, 0, -1, 1];
        const dy4: StaticArray<i32> = [-1, 1, 0, 0];
        for (let d: i32 = 0; d < 4; d++) {
          const nx: i32 = qx + unchecked(dx4[d]);
          const ny: i32 = qy + unchecked(dy4[d]);
          if (!inBounds(nx, ny, w, h)) continue;
          if (getCell(nx, ny, w) != TILE_PATH) continue;
          const ni: i32 = ny * w + nx;
          if (unchecked(BITMAP_B[ni]) != 0) continue;
          unchecked((BITMAP_B[ni] = 1));
          unchecked((QUEUE[qTail * 2] = nx));
          unchecked((QUEUE[qTail * 2 + 1] = ny));
          qTail++;
        }
      }
      if (compCount < 256) {
        unchecked((COMP_START[compCount] = start));
        unchecked((COMP_SIZE[compCount] = compTotalTiles - start));
        compCount++;
      }
    }
  }
}

export function ensureGlobalAccessibility(w: i32, h: i32): void {
  collectPathComponents(w, h);
  if (compCount <= 1) return;

  // Find largest component
  let mainIdx: i32 = 0, mainSize: i32 = 0;
  for (let c: i32 = 0; c < compCount; c++) {
    if (unchecked(COMP_SIZE[c]) > mainSize) { mainSize = unchecked(COMP_SIZE[c]); mainIdx = c; }
  }

  for (let c: i32 = 0; c < compCount; c++) {
    if (c == mainIdx) continue;
    // Find closest pair between main and island
    let bestDist: i32 = 99999, bax: i32 = 0, bay: i32 = 0, bbx: i32 = 0, bby: i32 = 0;
    const ms: i32 = unchecked(COMP_START[mainIdx]);
    const ml: i32 = unchecked(COMP_SIZE[mainIdx]);
    const is_: i32 = unchecked(COMP_START[c]);
    const il: i32 = unchecked(COMP_SIZE[c]);
    for (let a: i32 = 0; a < ml; a++) {
      const ap: i32 = unchecked(COMP_TILES[ms + a]);
      const ax: i32 = ap & 0xFFFF, ay: i32 = (ap >> 16) & 0xFFFF;
      for (let b: i32 = 0; b < il; b++) {
        const bp: i32 = unchecked(COMP_TILES[is_ + b]);
        const bx: i32 = bp & 0xFFFF, by: i32 = (bp >> 16) & 0xFFFF;
        const dist: i32 = absI(ax - bx) + absI(ay - by);
        if (dist < bestDist) { bestDist = dist; bax = ax; bay = ay; bbx = bx; bby = by; }
      }
    }
    carveRoad(w, h, bax, bay, bbx, bby);
    collectPathComponents(w, h);
    // Recalc main
    mainIdx = 0; mainSize = 0;
    for (let cc: i32 = 0; cc < compCount; cc++) {
      if (unchecked(COMP_SIZE[cc]) > mainSize) { mainSize = unchecked(COMP_SIZE[cc]); mainIdx = cc; }
    }
  }
}

// ── Detour routes ────────────────────────────────────────────────────────
export function addDetourRoutes(w: i32, h: i32): void {
  const total: i32 = param(P_DETOUR_COUNT);
  if (total <= 0) return;
  const minDist: i32 = param(P_DETOUR_MIN_DIST);
  const maxDist: i32 = param(P_DETOUR_MAX_DIST);

  // Collect path tiles
  let pathCount: i32 = 0;
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) == TILE_PATH && pathCount < MAX_CELLS) {
        unchecked((TEMP_X[pathCount] = x));
        unchecked((TEMP_Y[pathCount] = y));
        pathCount++;
      }
    }
  }
  if (pathCount < 2) return;

  let carved: i32 = 0;
  for (let attempt: i32 = 0; attempt < total * 8 && carved < total; attempt++) {
    const si: i32 = rngInt(0, pathCount - 1);
    const sx: i32 = unchecked(TEMP_X[si]), sy: i32 = unchecked(TEMP_Y[si]);
    // Find a candidate at right distance
    const ci: i32 = rngInt(0, pathCount - 1);
    const ex: i32 = unchecked(TEMP_X[ci]), ey: i32 = unchecked(TEMP_Y[ci]);
    const dist: i32 = absI(sx - ex) + absI(sy - ey);
    if (dist < minDist || dist > maxDist) continue;
    if (carveRoad(w, h, sx, sy, ex, ey)) carved++;
  }
}

// ── Carve roads pipeline ─────────────────────────────────────────────────
export function carveAllRoads(w: i32, h: i32): void {
  carveDoorStubs(w, h, param(P_DOOR_STUB_LEN));
  if (houseCount > 0) buildGraphAndCarve(w, h);
  ensureBorderAccess(w, h);
}

// ── Double-wide fix ──────────────────────────────────────────────────────
export function fixDoubleWidePaths(w: i32, h: i32): void {
  fixDoubleWideInPlace(w, h, TILE_PATH, TILE_FOREST, 10);
}

// ── Near-miss corners ────────────────────────────────────────────────────
export function resolveNearMissCorners(w: i32, h: i32): void {
  for (let y: i32 = 0; y < h - 1; y++) {
    for (let x: i32 = 0; x < w - 1; x++) {
      const a: bool = getCell(x, y, w) == TILE_PATH;
      const b: bool = getCell(x + 1, y + 1, w) == TILE_PATH;
      const c: bool = getCell(x + 1, y, w) == TILE_PATH;
      const d: bool = getCell(x, y + 1, w) == TILE_PATH;
      if (a && b && !c && !d) {
        const or_: bool = getCell(x + 1, y, w) != TILE_HOUSE;
        const od: bool = getCell(x, y + 1, w) != TILE_HOUSE;
        if (or_ && od) { if (rng() < 0.5) setCell(x + 1, y, w, TILE_PATH); else setCell(x, y + 1, w, TILE_PATH); }
        else if (or_) setCell(x + 1, y, w, TILE_PATH);
        else if (od) setCell(x, y + 1, w, TILE_PATH);
      }
      const e: bool = getCell(x + 1, y, w) == TILE_PATH;
      const f: bool = getCell(x, y + 1, w) == TILE_PATH;
      const g: bool = getCell(x, y, w) == TILE_PATH;
      const hp: bool = getCell(x + 1, y + 1, w) == TILE_PATH;
      if (e && f && !g && !hp) {
        const oul: bool = getCell(x, y, w) != TILE_HOUSE;
        const odr: bool = getCell(x + 1, y + 1, w) != TILE_HOUSE;
        if (oul && odr) { if (rng() < 0.5) setCell(x, y, w, TILE_PATH); else setCell(x + 1, y + 1, w, TILE_PATH); }
        else if (oul) setCell(x, y, w, TILE_PATH);
        else if (odr) setCell(x + 1, y + 1, w, TILE_PATH);
      }
    }
  }
}

// ── Dead-end reduction ───────────────────────────────────────────────────
export function reduceDeadEnds(w: i32, h: i32): void {
  const cells: i32 = w * h;
  // Build protected set (doors + border paths)
  clearBitmap(BITMAP_A, cells);
  for (let hi: i32 = 0; hi < houseCount; hi++) {
    unchecked((BITMAP_A[unchecked(HOUSE_DOOR_Y[hi]) * w + unchecked(HOUSE_DOOR_X[hi])] = 1));
  }
  for (let x: i32 = 0; x < w; x++) {
    if (getCell(x, 0, w) == TILE_PATH) unchecked((BITMAP_A[x] = 1));
    if (getCell(x, h - 1, w) == TILE_PATH) unchecked((BITMAP_A[(h - 1) * w + x] = 1));
  }
  for (let y: i32 = 0; y < h; y++) {
    if (getCell(0, y, w) == TILE_PATH) unchecked((BITMAP_A[y * w] = 1));
    if (getCell(w - 1, y, w) == TILE_PATH) unchecked((BITMAP_A[y * w + w - 1] = 1));
  }

  for (let pass: i32 = 0; pass < 6; pass++) {
    let changed: bool = false;
    for (let y: i32 = 1; y < h - 1; y++) {
      for (let x: i32 = 1; x < w - 1; x++) {
        if (getCell(x, y, w) != TILE_PATH) continue;
        let pn: i32 = 0;
        if (getCell(x - 1, y, w) == TILE_PATH) pn++;
        if (getCell(x + 1, y, w) == TILE_PATH) pn++;
        if (getCell(x, y - 1, w) == TILE_PATH) pn++;
        if (getCell(x, y + 1, w) == TILE_PATH) pn++;
        if (pn != 1) continue;
        if (unchecked(BITMAP_A[y * w + x]) != 0) continue;
        // Prune this dead end
        setCell(x, y, w, TILE_FOREST);
        changed = true;
      }
    }
    if (!changed) break;
  }
}

// ── Path gap repair after biome ──────────────────────────────────────────
export function repairPathGapsAfterBiome(w: i32, h: i32): void {
  let count: i32 = 0;
  for (let y: i32 = 1; y < h - 1; y++) {
    for (let x: i32 = 1; x < w - 1; x++) {
      const tile: i32 = getCell(x, y, w);
      // Never rewrite structural tiles during cosmetic path-gap repair.
      if (tile == TILE_PATH || tile == TILE_WATER || tile == TILE_CLIFF || tile == TILE_HOUSE || tile == TILE_FENCE) continue;
      const n: bool = getCell(x, y - 1, w) == TILE_PATH;
      const s: bool = getCell(x, y + 1, w) == TILE_PATH;
      const e: bool = getCell(x + 1, y, w) == TILE_PATH;
      const ww: bool = getCell(x - 1, y, w) == TILE_PATH;
      const pn: i32 = i32(n) + i32(s) + i32(e) + i32(ww);
      if ((n && s) || (e && ww) || pn >= 3) {
        unchecked((TEMP_X[count] = x)); unchecked((TEMP_Y[count] = y)); count++;
      }
    }
  }
  for (let i: i32 = 0; i < count; i++) setCell(unchecked(TEMP_X[i]), unchecked(TEMP_Y[i]), w, TILE_PATH);
}
