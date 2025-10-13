import { IntGrid } from './data-structures';

/*
  Dead-end Analyzer (moved from level-generator.ts)
  -------------------------------------------------
  This module implements a three-tier remediation pipeline to reduce dead ends
  in the generated path network while strictly preserving the "no two-wide paths"
  constraint (no 2x2 blocks of PATH tiles).

  Tiers:
  - Tier 1: Corridor extension with occasional perpendicular branching to find
            a connection without making 2x2 blocks.
  - Tier 2: Selective pruning of very short dead-end stubs (length 1–5).
  - Tier 3: Last resort forced connection using the project's existing A* segment
            function; placement still respects the 2x2 rule.

  Integration contract:
  - Call analyzeAndFixDeadEnds(IntGrid, AnalyzerContext, findPathSegment, fixDoubleWide)
    after initial path carving. Provide:
      • AnalyzerContext: tile IDs, bounds/utilities, and a double-wide guard.
      • findPathSegment: your A* function that returns a list of [x,y] or null.
      • fixDoubleWide: your clean-up pass that removes any 2x2 blocks if they slip in.
*/

/** Grid coordinate tuple [x, y]. */
export type Pos = [number, number];

/**
 * Context supplied by the generator so this module can operate without
 * duplicating game-specific logic.
 *
 * PATH_TILE / REGION_TILE: tile ID values used in the IntGrid
 * levelSize: [width, height]
 * inBounds: returns true if position lies inside the grid bounds
 * getNeighbors: returns 4-connected neighbors in any order
 * wouldCreateDoubleWideAt: returns true if placing PATH at pos would form a 2x2 block
 */
export interface AnalyzerContext {
  PATH_TILE: number;
  REGION_TILE: number;
  levelSize: [number, number];
  inBounds(pos: Pos): boolean;
  getNeighbors(pos: Pos): Pos[];
  wouldCreateDoubleWideAt(pos: Pos, intGrid: IntGrid): boolean;
}

// ------------------------------------------------------------------
// TUNING KNOBS (grouped near top)
// ------------------------------------------------------------------
// Analyzer iterations
// Upper bound on full multi-tier passes. Higher = more chances to reduce dead ends
// but with diminishing returns and extra CPU. Typical grids converge well before this.
const MAX_ANALYZER_PASSES = 15;

// Tier 1: Minimum straight extension probe length (tiles) before giving up.
// Larger values aggressively search for distant corridor connections, at the cost
// of carving more speculative straight segments that may later persist if not pruned.
const TIER1_MIN_EXTENSION = 50;

// Tier 1 branching behavior
// BRANCH_PROBABILITY: per straight-step chance to attempt one perpendicular branch.
// BRANCH_STEPS_BASE / VARIATION: length budget for the candidate branch (uniform variation).
// BRANCH_SOFT_MIN_KEEP: retain a partial branch of at least this length even if it failed to
//   connect (because it was blocked by double-wide guard) to smooth out tiny 1-length nubs.
const BRANCH_PROBABILITY = 0.12;
const BRANCH_STEPS_BASE = 20;
const BRANCH_STEPS_VARIATION = 15;
const BRANCH_SOFT_MIN_KEEP = 2;

// Tier 2 pruning bounds (spur lengths inclusive)
// Remove spurs whose corridor-only length (excluding junction) falls inside this range.
// NOTE: Setting PRUNE_MAX_LEN lower than BRANCH_SOFT_MIN_KEEP may reintroduce short nubs.
const PRUNE_MIN_LEN = 1;
const PRUNE_MAX_LEN = 5;

// Tier 3: Max Manhattan search radius when raycasting for nearby corridors.
// Larger radius increases probability of a direct straight-line capture before
// falling back to a full-grid nearest scan.
const TIER3_SEARCH_RADIUS = 140;
// Safety guard when tracing a spur to avoid pathological loops (should never hit
// in a correctly formed acyclic spur, but defensive for future algorithm changes).
const SPUR_TRACE_LIMIT = 1000;

/** Return 4-neighbors of pos that are PATH tiles. */
function getPathNeighbors(pos: Pos, intGrid: IntGrid, ctx: AnalyzerContext): Pos[] {
  const res: Pos[] = [];
  for (const n of ctx.getNeighbors(pos)) {
    if (
      n[0] >= 0 && n[0] < ctx.levelSize[0] &&
      n[1] >= 0 && n[1] < ctx.levelSize[1] &&
      intGrid.getTile(n[0], n[1]) === ctx.PATH_TILE
    ) {
      res.push(n);
    }
  }
  return res;
}

/**
 * Count PATH neighbors for pos, optionally excluding some coordinates.
 * Useful for degree calculations and to avoid counting tiles inside a block.
 */
function countPathConnections(pos: Pos, intGrid: IntGrid, ctx: AnalyzerContext, exclude: Set<string> = new Set()): number {
  let count = 0;
  for (const n of ctx.getNeighbors(pos)) {
    const key = `${n[0]},${n[1]}`;
    if (exclude.has(key)) continue;
    if (
      n[0] >= 0 && n[0] < ctx.levelSize[0] &&
      n[1] >= 0 && n[1] < ctx.levelSize[1] &&
      intGrid.getTile(n[0], n[1]) === ctx.PATH_TILE
    ) {
      count++;
    }
  }
  return count;
}

/** Collect PATH cells with exactly one PATH neighbor (degree == 1). */
function detectDeadEnds(intGrid: IntGrid, ctx: AnalyzerContext): Pos[] {
  const tips: Pos[] = [];
  for (let x = 0; x < ctx.levelSize[0]; x++) {
    for (let y = 0; y < ctx.levelSize[1]; y++) {
      if (intGrid.getTile(x, y) !== ctx.PATH_TILE) continue;
      if (countPathConnections([x, y], intGrid, ctx) === 1) {
        tips.push([x, y]);
      }
    }
  }
  return tips;
}

/**
 * For a dead-end tip, return the outward direction vector away from its only
 * path neighbor, or null if not a true dead end.
 */
function getDeadEndDirection(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext): Pos | null {
  const neighbors = getPathNeighbors(tip, intGrid, ctx);
  if (neighbors.length !== 1) return null;
  const n = neighbors[0];
  return [tip[0] - n[0], tip[1] - n[1]] as Pos;
}

// (moved: tuning constants are now grouped near the top of the file)

/**
 * Attempt a perpendicular branch starting from origin while extending forwardDir.
 * Commits the branch if it reaches an existing PATH without creating 2x2 blocks.
 */
function tryBranchFrom(origin: Pos, forwardDir: Pos, intGrid: IntGrid, ctx: AnalyzerContext, maxSteps: number): boolean {
  const perps: Pos[] = (forwardDir[0] !== 0) ? [[0,1],[0,-1]] : [[1,0],[-1,0]];
  if (Math.random() < 0.5) perps.reverse();

  for (const dir of perps) {
    let curr: Pos = [origin[0] + dir[0], origin[1] + dir[1]];
    const branch: Pos[] = [];
    for (let i = 0; i < maxSteps; i++) {
      if (!ctx.inBounds(curr)) break;
      const t = intGrid.getTile(curr[0], curr[1]);
      if (t === ctx.PATH_TILE) {
        for (const p of branch) intGrid.setTile(p[0], p[1], ctx.PATH_TILE);
        return true;
      }
      if (ctx.wouldCreateDoubleWideAt(curr, intGrid)) {
        // If we've already carved a short branch and only stopped because of the 2x2 guard,
        // keep it as a soft attempt to reduce isolated nubs.
        if (branch.length >= BRANCH_SOFT_MIN_KEEP) {
          for (const p of branch) intGrid.setTile(p[0], p[1], ctx.PATH_TILE);
          return true;
        }
        break;
      }
      branch.push([curr[0], curr[1]]);
      curr = [curr[0] + dir[0], curr[1] + dir[1]];
    }
  }
  return false;
}

/**
 * Tier 1: Extend a dead-end forward up to TIER1_MIN_EXTENSION tiles, occasionally
 * trying a perpendicular branch. Avoids 2x2. Commits the straight tiles even if
 * not connected; returns true if a connection to existing PATH was found.
 */
function tryExtendCorridor(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext): boolean {
  const dir = getDeadEndDirection(tip, intGrid, ctx);
  if (!dir) return false;

  const pathToPlace: Pos[] = [];
  let connected = false;
  let current: Pos = [tip[0] + dir[0], tip[1] + dir[1]];

  for (let step = 1; step <= TIER1_MIN_EXTENSION; step++) {
    if (!ctx.inBounds(current)) break;

    const tile = intGrid.getTile(current[0], current[1]);
    if (tile === ctx.PATH_TILE) {
      connected = true;
      break;
    }

    if (ctx.wouldCreateDoubleWideAt(current, intGrid)) break;

    pathToPlace.push([current[0], current[1]]);

    if (!connected && Math.random() < BRANCH_PROBABILITY) {
      const branched = tryBranchFrom(
        current,
        dir,
        intGrid,
        ctx,
        BRANCH_STEPS_BASE + Math.floor(Math.random() * BRANCH_STEPS_VARIATION)
      );
      if (branched) {
        connected = true;
      }
    }

    current = [current[0] + dir[0], current[1] + dir[1]];
  }

  // Commit any straight tiles we staged; the wouldCreateDoubleWideAt guard
  // above guarantees we won't create 2x2 blocks while placing these.
  for (const p of pathToPlace) {
    if (ctx.inBounds(p)) intGrid.setTile(p[0], p[1], ctx.PATH_TILE);
  }
  return connected;
}

/**
 * Tier 2: Walk the corridor from tip until a junction/end and remove it if its
 * length is between [minLen, maxLen]. Returns true if pruning occurred.
 */
function pruneShortDeadEnd(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext, minLen: number, maxLen: number): boolean {
  const inward = getPathNeighbors(tip, intGrid, ctx);
  if (inward.length !== 1) return false; // not a dead end

  // Collect only the spur tiles, excluding the base junction tile.
  const spur: Pos[] = [tip];
  let prev: Pos = tip;
  let curr: Pos = inward[0];

  while (true) {
    const nbs = getPathNeighbors(curr, intGrid, ctx);
    if (nbs.length !== 2) {
      // We've reached the base (junction or another terminal). Do NOT include curr.
      break;
    }
    // Still in a 2-degree corridor segment, include curr and advance.
    spur.push(curr);
    const next = (nbs[0][0] === prev[0] && nbs[0][1] === prev[1]) ? nbs[1] : nbs[0];
    prev = curr;
    curr = next;
  if (!ctx.inBounds(curr) || spur.length > SPUR_TRACE_LIMIT) break;
  }

  if (spur.length >= minLen && spur.length <= maxLen) {
    for (const p of spur) intGrid.setTile(p[0], p[1], ctx.REGION_TILE);
    return true;
  }
  return false;
}

/**
 * Tier 3: Last resort. Raycast in directions (except back towards corridor) to
 * find the nearest PATH target; fallback to scanning whole grid for closest PATH.
 * Then use A* (findPathSegment) to connect while respecting 2x2 guard during placement.
 */
function forceConnectDeadEnd(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext, findPathSegment: (start: Pos, end: Pos, grid: IntGrid) => Pos[] | null): boolean {
  const neighbors: Pos[] = [];
  for (const n of ctx.getNeighbors(tip)) {
    if (!ctx.inBounds(n)) continue;
    if (intGrid.getTile(n[0], n[1]) === ctx.PATH_TILE) neighbors.push(n);
  }
  if (neighbors.length !== 1) return false;
  const backDir: Pos = [neighbors[0][0] - tip[0], neighbors[0][1] - tip[1]];

  const dirs = ([[1,0],[-1,0],[0,1],[0,-1]] as Pos[]).filter(d => !(d[0] === backDir[0] && d[1] === backDir[1]));

  let bestTarget: Pos | null = null;
  let bestDist = Number.MAX_SAFE_INTEGER;

  for (const d of dirs) {
    let curr: Pos = [tip[0] + d[0], tip[1] + d[1]];
    for (let step = 1; step <= TIER3_SEARCH_RADIUS; step++) {
      if (!ctx.inBounds(curr)) break;
      if (intGrid.getTile(curr[0], curr[1]) === ctx.PATH_TILE) {
        const dist = Math.abs(curr[0] - tip[0]) + Math.abs(curr[1] - tip[1]);
        if (dist < bestDist) { bestDist = dist; bestTarget = [curr[0], curr[1]]; }
        break;
      }
      curr = [curr[0] + d[0], curr[1] + d[1]];
    }
  }

  if (!bestTarget) {
    // Fallback: full-grid nearest PATH search (excluding the immediate neighbor)
    // to avoid simply looping back onto the same segment.
    const neighbor = neighbors[0];
    for (let x = 0; x < ctx.levelSize[0]; x++) {
      for (let y = 0; y < ctx.levelSize[1]; y++) {
        if (intGrid.getTile(x, y) !== ctx.PATH_TILE) continue;
        if (neighbor && x === neighbor[0] && y === neighbor[1]) continue;
        const dist = Math.abs(x - tip[0]) + Math.abs(y - tip[1]);
        if (dist < bestDist) { bestDist = dist; bestTarget = [x, y]; }
      }
    }
  }

  if (!bestTarget) return false;

  const path = findPathSegment(tip, bestTarget, intGrid);
  if (!path || path.length === 0) return false;

  for (let i = 1; i < path.length; i++) {
    const p = path[i];
    if (ctx.wouldCreateDoubleWideAt(p, intGrid)) break;
    intGrid.setTile(p[0], p[1], ctx.PATH_TILE);
  }
  return true;
}

/**
 * Corner-bridge: fill single REGION cell that touches exactly two PATH
 * neighbors orthogonally (one vertical, one horizontal), provided doing so
 * does not create a 2x2. This neatly connects near-miss corridors.
 */
function fillCornerBridges(intGrid: IntGrid, ctx: AnalyzerContext): boolean {
  let changed = false;
  for (let x = 0; x < ctx.levelSize[0]; x++) {
    for (let y = 0; y < ctx.levelSize[1]; y++) {
      if (intGrid.getTile(x, y) !== ctx.REGION_TILE) continue;

      const neighbors = ctx.getNeighbors([x, y]);
      const pathNeighbors: Pos[] = [];
      let hasHoriz = false;
      let hasVert = false;

      for (const n of neighbors) {
        if (!ctx.inBounds(n)) continue;
        if (intGrid.getTile(n[0], n[1]) === ctx.PATH_TILE) {
          pathNeighbors.push(n);
          if (n[1] === y) hasHoriz = true; // same row -> left/right
          if (n[0] === x) hasVert = true;  // same column -> up/down
        }
      }

      if (pathNeighbors.length === 2 && hasHoriz && hasVert) {
        const pos: Pos = [x, y];
        if (!ctx.wouldCreateDoubleWideAt(pos, intGrid)) {
          intGrid.setTile(x, y, ctx.PATH_TILE);
          changed = true;
        }
      }
    }
  }
  return changed;
}

/**
 * Final cleanup: remove isolated PATH cells (degree == 0). These can appear
 * after various passes and are visually odd "empty road" tiles with no connections.
 */
function removeIsolatedPaths(intGrid: IntGrid, ctx: AnalyzerContext): boolean {
  let changed = false;
  for (let x = 0; x < ctx.levelSize[0]; x++) {
    for (let y = 0; y < ctx.levelSize[1]; y++) {
      if (intGrid.getTile(x, y) !== ctx.PATH_TILE) continue;
      if (countPathConnections([x, y], intGrid, ctx) === 0) {
        intGrid.setTile(x, y, ctx.REGION_TILE);
        changed = true;
      }
    }
  }
  return changed;
}

/**
 * Run the tiered pass a limited number of times until no changes occur.
 * fixDoubleWide() is invoked between tiers to strictly preserve "no two-wide".
 */
export function analyzeAndFixDeadEnds(intGrid: IntGrid, ctx: AnalyzerContext, findPathSegment: (start: Pos, end: Pos, grid: IntGrid) => Pos[] | null, fixDoubleWide: (grid: IntGrid) => void) {
  const maxPasses = MAX_ANALYZER_PASSES;
  // Pass order and rationale:
  // 1) Extend and branch (create new connections opportunistically)
  // 2) fixDoubleWide (reassert invariant)
  // 3) Corner-bridge (connect L-shaped near misses safely)
  // 4) fixDoubleWide (defensive)
  // 5) Tier 2 pruning (remove tiny spurs; junction preserved)
  // 6) fixDoubleWide (defensive)
  // 7) Tier 3 forced connections via A* (last resort)
  // 8) fixDoubleWide and terminate pass if nothing changed
  for (let pass = 0; pass < maxPasses; pass++) {
    let changed = false;

    const deadEnds = detectDeadEnds(intGrid, ctx);
    if (deadEnds.length === 0) break;

    for (const tip of deadEnds) {
      if (tryExtendCorridor(tip, intGrid, ctx)) {
        changed = true;
      }
    }

    fixDoubleWide(intGrid);

    // Corner-bridge pass to connect near-miss corridors without 2x2s
    if (fillCornerBridges(intGrid, ctx)) {
      changed = true;
    }

    fixDoubleWide(intGrid);

    const deadEndsAfterT1 = detectDeadEnds(intGrid, ctx);
    for (const tip of deadEndsAfterT1) {
      if (pruneShortDeadEnd(tip, intGrid, ctx, PRUNE_MIN_LEN, PRUNE_MAX_LEN)) {
        changed = true;
      }
    }

    fixDoubleWide(intGrid);

    const deadEndsAfterT2 = detectDeadEnds(intGrid, ctx);
    for (const tip of deadEndsAfterT2) {
      if (forceConnectDeadEnd(tip, intGrid, ctx, findPathSegment)) {
        changed = true;
      }
    }

    fixDoubleWide(intGrid);

    if (!changed) break;
  }

  // Final isolated tile scrub (non-iterative): remove any completely lone PATHs
  removeIsolatedPaths(intGrid, ctx);
}
