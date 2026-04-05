// @ts-nocheck
/**
 * Biome terrain painting — cliffs, hills, water, grass, sand.
 */
import { getCell, setCell, inBounds } from '../common/grid';
import { removeSmallComponentsInPlace } from '../shared/remove-small-components';
import { enforceExact2x2BundlesInPlace } from '../shared/enforce-exact-bundles';
import { repairCliffGapsInPlace } from '../shared/repair-cliff-gaps';
import { enforceCliffShellIntegrityInPlace } from '../shared/cliff-shell-integrity';
import { enforceMinThickness2x2InPlace } from '../shared/enforce-min-thickness';
import {
  TILE_PATH, TILE_FOREST, TILE_HOUSE, TILE_FENCE, TILE_CLIFF, TILE_HILL,
  TILE_GRASS, TILE_SAND, TILE_WATER, TILE_OBSTACLE, TILE_RUBBLE,
  rng, rngInt, clampI, absI, minI, maxI, param,
  BITMAP_A, clearBitmap, TEMP_X, TEMP_Y,
  P_CLIFF_BAND, P_HILL_CLUSTER, P_GRASS_PATCH, P_SAND_PATCH, P_WATER_POOL, P_EDGE_MARGIN,
} from './buffers';

// ── Reset non-path tiles to FOREST ───────────────────────────────────────
export function resetNonPathToForest(w: i32, h: i32): void {
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      const tile: i32 = getCell(x, y, w);
      if (tile != TILE_PATH && tile != TILE_HOUSE && tile != TILE_FENCE && tile != TILE_RUBBLE) {
        setCell(x, y, w, TILE_FOREST);
      }
    }
  }
}

// ── Water bodies (lakes + rivers) ───────────────────────────────────────
function paintWaterPonds(w: i32, h: i32, count: i32): void {
  const margin: i32 = param(P_EDGE_MARGIN) + 1;
  const cells: i32 = w * h;

  for (let i: i32 = 0; i < count; i++) {
    const makeRiver: bool = rng() < 0.45;

    if (!makeRiver) {
      // Lake: cliff-style blob growth for natural lake silhouettes.
      let placedLake: bool = false;

      for (let attempt: i32 = 0; attempt < 24 && !placedLake; attempt++) {
        const sx: i32 = rngInt(margin + 2, w - margin - 3);
        const sy: i32 = rngInt(margin + 2, h - margin - 3);
        if (getCell(sx, sy, w) != TILE_FOREST) continue;

        const targetSize: i32 = 12 + rngInt(0, 16);
        clearBitmap(BITMAP_A, cells);
        let qLen: i32 = 0;
        unchecked((TEMP_X[0] = sx));
        unchecked((TEMP_Y[0] = sy));
        qLen = 1;
        let maskSize: i32 = 0;

        while (qLen > 0 && maskSize < targetSize) {
          const qi: i32 = rngInt(0, qLen - 1);
          const qx: i32 = unchecked(TEMP_X[qi]);
          const qy: i32 = unchecked(TEMP_Y[qi]);
          qLen--;
          unchecked((TEMP_X[qi] = unchecked(TEMP_X[qLen])));
          unchecked((TEMP_Y[qi] = unchecked(TEMP_Y[qLen])));

          if (qx <= 1 || qy <= 1 || qx >= w - 2 || qy >= h - 2) continue;
          const ci: i32 = qy * w + qx;
          if (unchecked(BITMAP_A[ci]) != 0) continue;
          if (getCell(qx, qy, w) != TILE_FOREST) continue;

          unchecked((BITMAP_A[ci] = 1));
          maskSize++;

          const dx4b: StaticArray<i32> = [0, 0, -1, 1];
          const dy4b: StaticArray<i32> = [-1, 1, 0, 0];
          for (let d: i32 = 0; d < 4; d++) {
            const nx: i32 = qx + unchecked(dx4b[d]);
            const ny: i32 = qy + unchecked(dy4b[d]);
            if (inBounds(nx, ny, w, h) && unchecked(BITMAP_A[ny * w + nx]) == 0) {
              if (rng() < 0.82 && qLen < 500) {
                unchecked((TEMP_X[qLen] = nx));
                unchecked((TEMP_Y[qLen] = ny));
                qLen++;
              }
            }
          }
        }

        if (maskSize < 10) continue;

        let touchesNonForest: bool = false;
        const dx8: StaticArray<i32> = [-1, 0, 1, -1, 1, -1, 0, 1];
        const dy8: StaticArray<i32> = [-1, -1, -1, 0, 0, 1, 1, 1];
        for (let y0: i32 = 0; y0 < h && !touchesNonForest; y0++) {
          for (let x0: i32 = 0; x0 < w && !touchesNonForest; x0++) {
            const mi: i32 = y0 * w + x0;
            if (unchecked(BITMAP_A[mi]) == 0) continue;
            for (let d: i32 = 0; d < 8; d++) {
              const nx: i32 = x0 + unchecked(dx8[d]);
              const ny: i32 = y0 + unchecked(dy8[d]);
              if (!inBounds(nx, ny, w, h)) {
                touchesNonForest = true;
                break;
              }
              const ni: i32 = ny * w + nx;
              if (unchecked(BITMAP_A[ni]) != 0) continue;
              if (getCell(nx, ny, w) != TILE_FOREST) {
                touchesNonForest = true;
                break;
              }
            }
          }
        }
        if (touchesNonForest) continue;

        for (let y0: i32 = 0; y0 < h; y0++) {
          for (let x0: i32 = 0; x0 < w; x0++) {
            if (unchecked(BITMAP_A[y0 * w + x0]) != 0) {
              setCell(x0, y0, w, TILE_WATER);
            }
          }
        }

        placedLake = true;
      }

      continue;
    }

    // River: meandering channel with brush width 1-2.
    let carvedRiver: bool = false;
    const dx4: StaticArray<i32> = [1, -1, 0, 0];
    const dy4: StaticArray<i32> = [0, 0, 1, -1];

    for (let attempt: i32 = 0; attempt < 36 && !carvedRiver; attempt++) {
      let x: i32 = rngInt(margin + 2, w - margin - 3);
      let y: i32 = rngInt(margin + 2, h - margin - 3);
      if (getCell(x, y, w) != TILE_FOREST) continue;

      const brush: i32 = rng() < 0.22 ? 2 : 1;
      const len: i32 = 7 + rngInt(0, 7); // 7..14
      let dir: i32 = rngInt(0, 3);
      let valid: bool = true;
      let stampCount: i32 = 0;

      clearBitmap(BITMAP_A, cells);

      for (let step: i32 = 0; step < len && valid; step++) {
        for (let by: i32 = -brush; by <= brush && valid; by++) {
          for (let bx: i32 = -brush; bx <= brush; bx++) {
            if (absI(bx) + absI(by) > brush + (brush == 2 ? 1 : 0)) continue;

            const nx: i32 = x + bx;
            const ny: i32 = y + by;
            if (!inBounds(nx, ny, w, h) || nx <= 0 || ny <= 0 || nx >= w - 1 || ny >= h - 1) {
              valid = false;
              break;
            }

            const tile: i32 = getCell(nx, ny, w);
            if (tile != TILE_FOREST) {
              valid = false;
              break;
            }

            const ci: i32 = ny * w + nx;
            if (unchecked(BITMAP_A[ci]) == 0) {
              unchecked((BITMAP_A[ci] = 1));
              unchecked((TEMP_X[stampCount] = nx));
              unchecked((TEMP_Y[stampCount] = ny));
              stampCount++;
            }
          }
        }

        if (!valid) break;

        const turn: f64 = rng();
        if (turn < 0.30) {
          if (turn < 0.15) {
            // Left turn
            if (dir == 0) dir = 2;
            else if (dir == 1) dir = 3;
            else if (dir == 2) dir = 1;
            else dir = 0;
          } else {
            // Right turn
            if (dir == 0) dir = 3;
            else if (dir == 1) dir = 2;
            else if (dir == 2) dir = 0;
            else dir = 1;
          }
        }

        x += unchecked(dx4[dir]);
        y += unchecked(dy4[dir]);
        if (!inBounds(x, y, w, h) || x <= 1 || y <= 1 || x >= w - 2 || y >= h - 2) valid = false;
      }

      if (!valid || stampCount < 14) continue;

      for (let si: i32 = 0; si < stampCount; si++) {
        const sx: i32 = unchecked(TEMP_X[si]);
        const sy: i32 = unchecked(TEMP_Y[si]);
        setCell(sx, sy, w, TILE_WATER);
      }

      carvedRiver = true;
    }
  }
}

// ── Cliff/Hill formations ────────────────────────────────────────────────
function paintCliffFormations(w: i32, h: i32, count: i32): void {
  if (count <= 0) return;
  const margin: i32 = param(P_EDGE_MARGIN) + 1;
  for (let i: i32 = 0; i < count; i++) {
    const isIrregular: bool = rng() < 0.4;
    const cx: i32 = rngInt(margin + 2, w - margin - 3);
    const cy: i32 = rngInt(margin + 2, h - margin - 3);

    if (isIrregular) {
      // Blob-grown cliff mass
      const targetSize: i32 = 8 + rngInt(0, 15);
      const cells: i32 = w * h;
      clearBitmap(BITMAP_A, cells);
      let qLen: i32 = 0;
      unchecked((TEMP_X[0] = cx)); unchecked((TEMP_Y[0] = cy)); qLen = 1;
      let maskSize: i32 = 0;

      while (qLen > 0 && maskSize < targetSize) {
        const qi: i32 = rngInt(0, qLen - 1);
        const qx: i32 = unchecked(TEMP_X[qi]);
        const qy: i32 = unchecked(TEMP_Y[qi]);
        qLen--;
        unchecked((TEMP_X[qi] = unchecked(TEMP_X[qLen])));
        unchecked((TEMP_Y[qi] = unchecked(TEMP_Y[qLen])));
        const ci: i32 = qy * w + qx;
        if (qx < margin || qx >= w - margin || qy < margin || qy >= h - margin) continue;
        if (unchecked(BITMAP_A[ci]) != 0) continue;
        const tile: i32 = getCell(qx, qy, w);
        if (tile == TILE_PATH || tile == TILE_HOUSE || tile == TILE_FENCE || tile == TILE_WATER) continue;
        unchecked((BITMAP_A[ci] = 1));
        maskSize++;

        const dx4: StaticArray<i32> = [0, 0, -1, 1];
        const dy4: StaticArray<i32> = [-1, 1, 0, 0];
        for (let d: i32 = 0; d < 4; d++) {
          const nx: i32 = qx + unchecked(dx4[d]);
          const ny: i32 = qy + unchecked(dy4[d]);
          if (inBounds(nx, ny, w, h) && unchecked(BITMAP_A[ny * w + nx]) == 0) {
            if (qLen < 500) {
              unchecked((TEMP_X[qLen] = nx));
              unchecked((TEMP_Y[qLen] = ny));
              qLen++;
            }
          }
        }
      }

      // Stamp cliff + hill borders
      for (let y: i32 = 0; y < h; y++) {
        for (let x: i32 = 0; x < w; x++) {
          if (unchecked(BITMAP_A[y * w + x]) != 0) {
            let hasNonMask: bool = false;
            const dx4b: StaticArray<i32> = [0, 0, -1, 1];
            const dy4b: StaticArray<i32> = [-1, 1, 0, 0];
            for (let d: i32 = 0; d < 4; d++) {
              const nx: i32 = x + unchecked(dx4b[d]);
              const ny: i32 = y + unchecked(dy4b[d]);
              if (!inBounds(nx, ny, w, h) || unchecked(BITMAP_A[ny * w + nx]) == 0) { hasNonMask = true; break; }
            }
            if (hasNonMask) setCell(x, y, w, TILE_CLIFF);
            else setCell(x, y, w, TILE_HILL);
          }
        }
      }
    } else {
      // Rectangular cliff ring
      const rw: i32 = 2 + rngInt(0, 3);
      const rh: i32 = 2 + rngInt(0, 3);
      for (let dy: i32 = -rh; dy <= rh; dy++) {
        for (let dx: i32 = -rw; dx <= rw; dx++) {
          const nx: i32 = cx + dx, ny: i32 = cy + dy;
          if (!inBounds(nx, ny, w, h)) continue;
          const tile: i32 = getCell(nx, ny, w);
          if (tile == TILE_PATH || tile == TILE_HOUSE || tile == TILE_FENCE || tile == TILE_WATER) continue;
          const isBorder: bool = (absI(dx) == rw || absI(dy) == rh);
          if (isBorder) setCell(nx, ny, w, TILE_CLIFF);
          else setCell(nx, ny, w, TILE_HILL);
        }
      }
    }
  }
}

// ── Hill clusters ────────────────────────────────────────────────────────
function paintHillClusters(w: i32, h: i32, count: i32): void {
  const margin: i32 = param(P_EDGE_MARGIN);
  for (let i: i32 = 0; i < count; i++) {
    const cx: i32 = rngInt(margin + 2, w - margin - 3);
    const cy: i32 = rngInt(margin + 2, h - margin - 3);
    for (let dy: i32 = 0; dy <= 1; dy++) {
      for (let dx: i32 = 0; dx <= 1; dx++) {
        const nx: i32 = cx + dx, ny: i32 = cy + dy;
        if (!inBounds(nx, ny, w, h)) continue;
        const tile: i32 = getCell(nx, ny, w);
        if (tile == TILE_PATH || tile == TILE_HOUSE || tile == TILE_FENCE || tile == TILE_WATER || tile == TILE_CLIFF) continue;
        setCell(nx, ny, w, TILE_HILL);
      }
    }
  }
}

// ── Grass patches ────────────────────────────────────────────────────────
function paintGrassPatches(w: i32, h: i32, count: i32): void {
  const margin: i32 = param(P_EDGE_MARGIN);
  for (let i: i32 = 0; i < count; i++) {
    const cx: i32 = rngInt(margin + 1, w - margin - 2);
    const cy: i32 = rngInt(margin + 1, h - margin - 2);
    const pw: i32 = 2 + rngInt(0, 3);
    const ph: i32 = 2 + rngInt(0, 3);

    for (let dy: i32 = 0; dy < ph; dy++) {
      for (let dx: i32 = 0; dx < pw; dx++) {
        const nx: i32 = cx + dx, ny: i32 = cy + dy;
        if (!inBounds(nx, ny, w, h)) continue;
        const tile: i32 = getCell(nx, ny, w);
        if (tile != TILE_FOREST && tile != TILE_GRASS) continue;
        setCell(nx, ny, w, TILE_GRASS);
      }
    }
  }
}

// ── Sand patches ─────────────────────────────────────────────────────────
function paintSandPatches(w: i32, h: i32, count: i32): void {
  const margin: i32 = param(P_EDGE_MARGIN);
  for (let i: i32 = 0; i < count; i++) {
    const cx: i32 = rngInt(margin + 1, w - margin - 2);
    const cy: i32 = rngInt(margin + 1, h - margin - 2);
    for (let dy: i32 = 0; dy <= 1; dy++) {
      for (let dx: i32 = 0; dx <= 1; dx++) {
        const nx: i32 = cx + dx, ny: i32 = cy + dy;
        if (!inBounds(nx, ny, w, h)) continue;
        const tile: i32 = getCell(nx, ny, w);
        if (tile != TILE_FOREST && tile != TILE_GRASS) continue;
        setCell(nx, ny, w, TILE_SAND);
      }
    }
  }
}

// ── Cliff obstacle clearance (moat) ──────────────────────────────────────
function enforceCliffClearance(w: i32, h: i32): void {
  for (let y: i32 = 0; y < h; y++) {
    for (let x: i32 = 0; x < w; x++) {
      if (getCell(x, y, w) != TILE_CLIFF) continue;
      const dx4: StaticArray<i32> = [0, 0, -1, 1];
      const dy4: StaticArray<i32> = [-1, 1, 0, 0];
      for (let d: i32 = 0; d < 4; d++) {
        const nx: i32 = x + unchecked(dx4[d]);
        const ny: i32 = y + unchecked(dy4[d]);
        if (!inBounds(nx, ny, w, h)) continue;
        const tile: i32 = getCell(nx, ny, w);
        if (tile == TILE_OBSTACLE || tile == TILE_RUBBLE) setCell(nx, ny, w, TILE_PATH);
      }
    }
  }
}

// ── Full biome pipeline ──────────────────────────────────────────────────
export function applyBiomeTerrainFeatures(w: i32, h: i32): void {
  resetNonPathToForest(w, h);

  paintWaterPonds(w, h, param(P_WATER_POOL));
  removeSmallComponentsInPlace(w, h, TILE_WATER, TILE_FOREST, 10);
  enforceMinThickness2x2InPlace(w, h, TILE_WATER, TILE_FOREST, 6);
  paintCliffFormations(w, h, param(P_CLIFF_BAND));
  paintHillClusters(w, h, param(P_HILL_CLUSTER));

  // Apply shared cleanup kernels
  repairCliffGapsInPlace(w, h, TILE_PATH, TILE_WATER, TILE_CLIFF, 5);
  enforceCliffShellIntegrityInPlace(w, h, TILE_PATH, TILE_WATER, TILE_CLIFF, TILE_HILL, 5);
  removeSmallComponentsInPlace(w, h, TILE_CLIFF, TILE_FOREST, 3);
  enforceExact2x2BundlesInPlace(w, h, TILE_HILL, TILE_FOREST, 1, TILE_CLIFF, TILE_FOREST);
  removeSmallComponentsInPlace(w, h, TILE_HILL, TILE_FOREST, 4);

  paintGrassPatches(w, h, param(P_GRASS_PATCH));
  paintSandPatches(w, h, param(P_SAND_PATCH));

  enforceMinThickness2x2InPlace(w, h, TILE_GRASS, TILE_FOREST, 3);
  enforceMinThickness2x2InPlace(w, h, TILE_SAND, TILE_FOREST, 3);

  enforceCliffClearance(w, h);
}
