// @ts-nocheck
/**
 * House placement — templates, neighborhood clustering, door picking.
 */
import { getCell, setCell, inBounds, idx } from '../common/grid';
import {
  TILE_PATH, TILE_FOREST, TILE_HOUSE, TILE_FENCE, TILE_RUBBLE, TILE_OBSTACLE, TILE_WATER, TILE_CLIFF,
  rng, rngInt, clampI, absI, minI, maxI, param, paramF,
  MAX_HOUSES, MAX_HOUSE_TILES,
  HOUSE_OX, HOUSE_OY, HOUSE_DOOR_X, HOUSE_DOOR_Y, HOUSE_SHAPE,
  HOUSE_TILE_START, HOUSE_TILE_COUNT,
  HTILES_X, HTILES_Y,
  houseCount, totalHouseTiles, resetHouses,
  P_HOUSE_COUNT, P_HOUSE_MIN_SPACING, P_NEIGHBORHOOD_COUNT,
  P_SPREAD_FACTOR, P_CENTER_BIAS_X, P_CENTER_BIAS_Y,
  P_HOUSE_SIZE_PREF, P_EDGE_MARGIN,
  BITMAP_A, clearBitmap, TEMP_X, TEMP_Y,
} from './buffers';

// ── Template tile generation ─────────────────────────────────────────────
// Temp buffers for loading one template at a time
const TMPL_X = new StaticArray<i32>(30);
const TMPL_Y = new StaticArray<i32>(30);
let tmplTileCount: i32 = 0;
let tmplW: i32 = 0;
let tmplH: i32 = 0;

// Template IDs: 0=3x3, 1=2x3, 2=3x4, 3=4x4, 4=4x6, 5=6x4, 6=L-shape, 7=L-shape-rev
const NUM_TEMPLATES: i32 = 8;

// Door candidate temp buffers
const DOOR_DX = new StaticArray<i32>(8);
const DOOR_DY = new StaticArray<i32>(8);
let doorCount: i32 = 0;

function loadRect(w: i32, h: i32): void {
  tmplTileCount = 0;
  tmplW = w;
  tmplH = h;
  for (let dy: i32 = 0; dy < h; dy++) {
    for (let dx: i32 = 0; dx < w; dx++) {
      unchecked((TMPL_X[tmplTileCount] = dx));
      unchecked((TMPL_Y[tmplTileCount] = dy));
      tmplTileCount++;
    }
  }
}

function loadRectDoors(w: i32, h: i32): void {
  const midX: i32 = w >> 1;
  const midY: i32 = h >> 1;
  doorCount = 4;
  unchecked((DOOR_DX[0] = midX)); unchecked((DOOR_DY[0] = -1));
  unchecked((DOOR_DX[1] = midX)); unchecked((DOOR_DY[1] = h));
  unchecked((DOOR_DX[2] = -1));   unchecked((DOOR_DY[2] = midY));
  unchecked((DOOR_DX[3] = w));    unchecked((DOOR_DY[3] = midY));
}

function loadTemplate(tid: i32): void {
  if (tid <= 5) {
    // Rectangular templates
    if (tid == 0) { loadRect(3, 3); loadRectDoors(3, 3); }
    else if (tid == 1) { loadRect(2, 3); loadRectDoors(2, 3); }
    else if (tid == 2) { loadRect(3, 4); loadRectDoors(3, 4); }
    else if (tid == 3) { loadRect(4, 4); loadRectDoors(4, 4); }
    else if (tid == 4) { loadRect(4, 6); loadRectDoors(4, 6); }
    else { loadRect(6, 4); loadRectDoors(6, 4); }
  } else if (tid == 6) {
    // L-shape: 4×4 base + 2×3 extension at (4,0)
    loadRect(4, 4);
    tmplW = 6; tmplH = 4;
    for (let dy: i32 = 0; dy < 3; dy++) {
      unchecked((TMPL_X[tmplTileCount] = 4)); unchecked((TMPL_Y[tmplTileCount] = dy)); tmplTileCount++;
      unchecked((TMPL_X[tmplTileCount] = 5)); unchecked((TMPL_Y[tmplTileCount] = dy)); tmplTileCount++;
    }
    doorCount = 4;
    unchecked((DOOR_DX[0] = 2)); unchecked((DOOR_DY[0] = -1));
    unchecked((DOOR_DX[1] = 2)); unchecked((DOOR_DY[1] = 4));
    unchecked((DOOR_DX[2] = -1)); unchecked((DOOR_DY[2] = 2));
    unchecked((DOOR_DX[3] = 6)); unchecked((DOOR_DY[3] = 1));
  } else {
    // L-shape-rev: 4×4 base + 2×3 extension at (-2,0)
    loadRect(4, 4);
    tmplW = 6; tmplH = 4;
    for (let dy: i32 = 0; dy < 3; dy++) {
      unchecked((TMPL_X[tmplTileCount] = -2)); unchecked((TMPL_Y[tmplTileCount] = dy)); tmplTileCount++;
      unchecked((TMPL_X[tmplTileCount] = -1)); unchecked((TMPL_Y[tmplTileCount] = dy)); tmplTileCount++;
    }
    doorCount = 4;
    unchecked((DOOR_DX[0] = 2)); unchecked((DOOR_DY[0] = -1));
    unchecked((DOOR_DX[1] = 2)); unchecked((DOOR_DY[1] = 4));
    unchecked((DOOR_DX[2] = -3)); unchecked((DOOR_DY[2] = 1));
    unchecked((DOOR_DX[3] = 4)); unchecked((DOOR_DY[3] = 2));
  }
}

// Template pool based on size preference
const POOL = new StaticArray<i32>(NUM_TEMPLATES);
let poolSize: i32 = 0;

function buildTemplatePool(pref: i32): void {
  poolSize = 0;
  // Art constraints: Act 2 building sprites currently support only 3x3 and 2x3 families.
  // Keep template pools restricted so generation never emits oversized merged-looking structures.
  unchecked((POOL[0] = 0)); // 3x3
  unchecked((POOL[1] = 1)); // 2x3
  poolSize = 2;
}

// ── Door picking ─────────────────────────────────────────────────────────
function pickDoor(ox: i32, oy: i32, w: i32, h: i32): bool {
  // Shuffle door candidates
  for (let i: i32 = doorCount - 1; i > 0; i--) {
    const j: i32 = rngInt(0, i);
    let tmp: i32;
    tmp = unchecked(DOOR_DX[i]); unchecked((DOOR_DX[i] = unchecked(DOOR_DX[j]))); unchecked((DOOR_DX[j] = tmp));
    tmp = unchecked(DOOR_DY[i]); unchecked((DOOR_DY[i] = unchecked(DOOR_DY[j]))); unchecked((DOOR_DY[j] = tmp));
  }
  for (let i: i32 = 0; i < doorCount; i++) {
    const dx: i32 = ox + unchecked(DOOR_DX[i]);
    const dy: i32 = oy + unchecked(DOOR_DY[i]);
    if (dx < 1 || dx >= w - 1 || dy < 1 || dy >= h - 1) continue;
    if (getCell(dx, dy, w) == TILE_HOUSE) continue;
    // Store chosen door in slot 0
    unchecked((DOOR_DX[0] = dx));
    unchecked((DOOR_DY[0] = dy));
    return true;
  }
  return false;
}

// ── House placement ──────────────────────────────────────────────────────
function tryPlaceHouseNear(w: i32, h: i32, centerX: i32, centerY: i32): bool {
  const margin: i32 = param(P_EDGE_MARGIN);
  const spacing: i32 = param(P_HOUSE_MIN_SPACING);
  const spreadRadius: f64 = f64(minI(w, h)) * paramF(P_SPREAD_FACTOR);

  for (let attempt: i32 = 0; attempt < 80; attempt++) {
    const tid: i32 = unchecked(POOL[rngInt(0, poolSize - 1)]);
    loadTemplate(tid);
    const ox: i32 = centerX + i32(Math.floor((rng() - 0.5) * spreadRadius));
    const oy: i32 = centerY + i32(Math.floor((rng() - 0.5) * spreadRadius));

    // Check bounds
    let oob: bool = false;
    for (let t: i32 = 0; t < tmplTileCount; t++) {
      const ax: i32 = ox + unchecked(TMPL_X[t]);
      const ay: i32 = oy + unchecked(TMPL_Y[t]);
      if (ax < margin || ax >= w - margin || ay < margin || ay >= h - margin) { oob = true; break; }
    }
    if (oob) continue;

    // Check overlap with spacing buffer
    let overlaps: bool = false;
    for (let t: i32 = 0; t < tmplTileCount && !overlaps; t++) {
      const ax: i32 = ox + unchecked(TMPL_X[t]);
      const ay: i32 = oy + unchecked(TMPL_Y[t]);
      for (let dx: i32 = -spacing; dx <= spacing && !overlaps; dx++) {
        for (let dy: i32 = -spacing; dy <= spacing && !overlaps; dy++) {
          const nx: i32 = ax + dx;
          const ny: i32 = ay + dy;
          if (inBounds(nx, ny, w, h) && getCell(nx, ny, w) == TILE_HOUSE) overlaps = true;
        }
      }
    }
    if (overlaps) continue;

    // Pick door
    if (!pickDoor(ox, oy, w, h)) continue;

    // Stamp house
    const hi: i32 = houseCount;
    const tileStart: i32 = totalHouseTiles;
    for (let t: i32 = 0; t < tmplTileCount; t++) {
      const ax: i32 = ox + unchecked(TMPL_X[t]);
      const ay: i32 = oy + unchecked(TMPL_Y[t]);
      setCell(ax, ay, w, TILE_HOUSE);
      unchecked((HTILES_X[tileStart + t] = ax));
      unchecked((HTILES_Y[tileStart + t] = ay));
    }
    unchecked((HOUSE_OX[hi] = ox));
    unchecked((HOUSE_OY[hi] = oy));
    unchecked((HOUSE_DOOR_X[hi] = unchecked(DOOR_DX[0])));
    unchecked((HOUSE_DOOR_Y[hi] = unchecked(DOOR_DY[0])));
    unchecked((HOUSE_SHAPE[hi] = tid));
    unchecked((HOUSE_TILE_START[hi] = tileStart));
    unchecked((HOUSE_TILE_COUNT[hi] = tmplTileCount));
    houseCount++;
    totalHouseTiles += tmplTileCount;
    return true;
  }
  return false;
}

// Neighborhood center temp buffer
const CTR_X = new StaticArray<i32>(8);
const CTR_Y = new StaticArray<i32>(8);

export function placeAllHouses(w: i32, h: i32): void {
  resetHouses();
  buildTemplatePool(param(P_HOUSE_SIZE_PREF));
  const margin: i32 = param(P_EDGE_MARGIN);
  const maxHouses: i32 = param(P_HOUSE_COUNT);
  const nhoods: i32 = param(P_NEIGHBORHOOD_COUNT);

  // Compute base center
  const hasBias: bool = param(P_CENTER_BIAS_X) != 2147483647;
  let baseCxF: f64 = f64(w) / 2.0;
  let baseCyF: f64 = f64(h) / 2.0;
  if (hasBias) {
    baseCxF += (f64(param(P_CENTER_BIAS_X)) / 1000.0) * f64(w) * 0.25;
    baseCyF += (f64(param(P_CENTER_BIAS_Y)) / 1000.0) * f64(h) * 0.25;
  }

  // Generate neighborhood centers via rejection sampling
  let centerCount: i32 = 0;
  const minCenterDist: i32 = i32(f64(minI(w, h)) * 0.35);
  const spread: f64 = f64(minI(w, h)) * 0.2;
  for (let attempt: i32 = 0; attempt < 200 && centerCount < nhoods; attempt++) {
    let cx: i32 = i32(Math.floor(baseCxF + (rng() - 0.5) * spread));
    let cy: i32 = i32(Math.floor(baseCyF + (rng() - 0.5) * spread));
    cx = clampI(cx, margin + 2, w - margin - 2);
    cy = clampI(cy, margin + 2, h - margin - 2);
    let tooClose: bool = false;
    for (let c: i32 = 0; c < centerCount; c++) {
      if (absI(unchecked(CTR_X[c]) - cx) + absI(unchecked(CTR_Y[c]) - cy) < minCenterDist) { tooClose = true; break; }
    }
    if (!tooClose) {
      unchecked((CTR_X[centerCount] = cx));
      unchecked((CTR_Y[centerCount] = cy));
      centerCount++;
    }
  }
  if (centerCount == 0) {
    unchecked((CTR_X[0] = clampI(i32(Math.floor(baseCxF)), margin + 2, w - margin - 2)));
    unchecked((CTR_Y[0] = clampI(i32(Math.floor(baseCyF)), margin + 2, h - margin - 2)));
    centerCount = 1;
  }

  // Distribute houses across neighborhoods
  const perCenter: i32 = maxI(1, ((maxHouses + centerCount - 1) / centerCount));
  for (let c: i32 = 0; c < centerCount; c++) {
    for (let i: i32 = 0; i < perCenter && houseCount < maxHouses; i++) {
      tryPlaceHouseNear(w, h, unchecked(CTR_X[c]), unchecked(CTR_Y[c]));
    }
  }
}

// ── Village ground clearing ──────────────────────────────────────────────
export function clearAroundHouses(w: i32, h: i32, radius: i32): void {
  if (radius <= 0 || houseCount == 0) return;
  // Build bitmap of house tiles
  const cells: i32 = w * h;
  clearBitmap(BITMAP_A, cells);
  for (let i: i32 = 0; i < totalHouseTiles; i++) {
    const ci: i32 = unchecked(HTILES_Y[i]) * w + unchecked(HTILES_X[i]);
    unchecked((BITMAP_A[ci] = 1));
  }
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) != TILE_FOREST) continue;
      let near: bool = false;
      for (let dy: i32 = -radius; dy <= radius && !near; dy++) {
        for (let dx: i32 = -radius; dx <= radius && !near; dx++) {
          const nx: i32 = x + dx;
          const ny: i32 = y + dy;
          if (inBounds(nx, ny, w, h) && unchecked(BITMAP_A[ny * w + nx]) == 1) near = true;
        }
      }
      if (near) setCell(x, y, w, TILE_PATH);
    }
  }
}

export function growVillageGround(w: i32, h: i32, growth: i32): void {
  if (growth <= 0 || houseCount == 0) return;
  for (let hi: i32 = 0; hi < houseCount; hi++) {
    // Compute house center
    const start: i32 = unchecked(HOUSE_TILE_START[hi]);
    const count: i32 = unchecked(HOUSE_TILE_COUNT[hi]);
    let sumX: i32 = 0, sumY: i32 = 0;
    for (let t: i32 = 0; t < count; t++) { sumX += unchecked(HTILES_X[start + t]); sumY += unchecked(HTILES_Y[start + t]); }
    const hcx: i32 = (sumX + (count >> 1)) / count;
    const hcy: i32 = (sumY + (count >> 1)) / count;

    const pocketCount: i32 = 1 + i32(Math.floor(rng() * 3.0));
    for (let pocket: i32 = 0; pocket < pocketCount; pocket++) {
      const px: i32 = clampI(hcx + rngInt(-growth, growth), 1, w - 2);
      const py: i32 = clampI(hcy + rngInt(-growth, growth), 1, h - 2);
      const rx: i32 = maxI(1, 1 + i32(Math.floor(rng() * f64(growth))));
      const ry: i32 = maxI(1, 1 + i32(Math.floor(rng() * f64(growth))));
      for (let y: i32 = py - ry - 1; y <= py + ry + 1; y++) {
        for (let x: i32 = px - rx - 1; x <= px + rx + 1; x++) {
          if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
          if (getCell(x, y, w) == TILE_HOUSE) continue;
          const ndx: f64 = f64(absI(x - px)) / f64(maxI(1, rx));
          const ndy: f64 = f64(absI(y - py)) / f64(maxI(1, ry));
          if (ndx + ndy <= 1.05 + rng() * 0.45) setCell(x, y, w, TILE_PATH);
        }
      }
    }
  }
}

// ── Fence placement ──────────────────────────────────────────────────────
export function placeFences(w: i32, h: i32, fenceChance: f64): void {
  if (fenceChance <= 0.0 || houseCount == 0) return;
  for (let hi: i32 = 0; hi < houseCount; hi++) {
    const fc: i32 = rng() < fenceChance ? (rng() < 0.4 ? 2 : 1) : 0;
    const start: i32 = unchecked(HOUSE_TILE_START[hi]);
    const count: i32 = unchecked(HOUSE_TILE_COUNT[hi]);

    for (let f: i32 = 0; f < fc; f++) {
      // Find edge tiles
      let edgeCount: i32 = 0;
      for (let t: i32 = 0; t < count; t++) {
        const tx: i32 = unchecked(HTILES_X[start + t]);
        const ty: i32 = unchecked(HTILES_Y[start + t]);
        if (getCell(tx - 1, ty, w) != TILE_HOUSE || getCell(tx + 1, ty, w) != TILE_HOUSE ||
            getCell(tx, ty - 1, w) != TILE_HOUSE || getCell(tx, ty + 1, w) != TILE_HOUSE) {
          unchecked((TEMP_X[edgeCount] = tx));
          unchecked((TEMP_Y[edgeCount] = ty));
          edgeCount++;
        }
      }
      if (edgeCount == 0) continue;
      const ei: i32 = rngInt(0, edgeCount - 1);
      const ex: i32 = unchecked(TEMP_X[ei]);
      const ey: i32 = unchecked(TEMP_Y[ei]);

      // Direction away from house center
      let sumX: i32 = 0, sumY: i32 = 0;
      for (let t: i32 = 0; t < count; t++) { sumX += unchecked(HTILES_X[start + t]); sumY += unchecked(HTILES_Y[start + t]); }
      const dirX: f64 = f64(ex) - f64(sumX) / f64(count);
      const dirY: f64 = f64(ey) - f64(sumY) / f64(count);
      let fdx: i32 = 0, fdy: i32 = 0;
      if (Math.abs(dirX) >= Math.abs(dirY)) { fdx = dirX > 0.0 ? 1 : -1; }
      else { fdy = dirY > 0.0 ? 1 : -1; }

      const fLen: i32 = 2 + rngInt(0, 2);
      for (let i: i32 = 1; i <= fLen; i++) {
        const fx: i32 = ex + fdx * i;
        const fy: i32 = ey + fdy * i;
        if (fx < 1 || fx >= w - 1 || fy < 1 || fy >= h - 1) break;
        const existing: i32 = getCell(fx, fy, w);
        if (existing == TILE_HOUSE || existing == TILE_PATH) break;
        setCell(fx, fy, w, TILE_FENCE);
      }
    }
  }
}

// ── Scattering ───────────────────────────────────────────────────────────
export function scatterDecorativeTrees(w: i32, h: i32, chance: f64): void {
  if (chance <= 0.0) return;
  for (let y: i32 = 1; y < h - 1; y++) {
    for (let x: i32 = 1; x < w - 1; x++) {
      if (getCell(x, y, w) != TILE_PATH) continue;
      let pn: i32 = 0;
      if (getCell(x - 1, y, w) == TILE_PATH) pn++;
      if (getCell(x + 1, y, w) == TILE_PATH) pn++;
      if (getCell(x, y - 1, w) == TILE_PATH) pn++;
      if (getCell(x, y + 1, w) == TILE_PATH) pn++;
      if (pn < 3) continue;
      if (rng() < chance) setCell(x, y, w, TILE_FOREST);
    }
  }
}

export function scatterRubble(w: i32, h: i32, rubbleChance: f64): void {
  if (rubbleChance <= 0.0) return;
  for (let y: i32 = 1; y < h - 1; y++) {
    for (let x: i32 = 1; x < w - 1; x++) {
      if (getCell(x, y, w) != TILE_FOREST) continue;
      let adjPath: bool = false;
      if (getCell(x - 1, y, w) == TILE_PATH) adjPath = true;
      if (!adjPath && getCell(x + 1, y, w) == TILE_PATH) adjPath = true;
      if (!adjPath && getCell(x, y - 1, w) == TILE_PATH) adjPath = true;
      if (!adjPath && getCell(x, y + 1, w) == TILE_PATH) adjPath = true;
      if (!adjPath) continue;
      let nearH: bool = false;
      for (let dy: i32 = -1; dy <= 1 && !nearH; dy++) {
        for (let dx: i32 = -1; dx <= 1 && !nearH; dx++) {
          if (inBounds(x + dx, y + dy, w, h) && getCell(x + dx, y + dy, w) == TILE_HOUSE) nearH = true;
        }
      }
      const ch: f64 = nearH ? rubbleChance * 2.0 : rubbleChance;
      if (rng() < ch) setCell(x, y, w, TILE_RUBBLE);
    }
  }
}

export function scatterObstacles(w: i32, h: i32): void {
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) == TILE_FOREST) setCell(x, y, w, TILE_OBSTACLE);
    }
  }
}
