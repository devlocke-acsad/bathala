import { IntGrid } from './DataStructures';
import { AnalyzerContext, Pos } from './types';

/**
 * Dead-end Analyzer
 * -------------------------------------------------
 * This module implements a three-tier remediation pipeline to reduce dead ends
 * in the generated path network while strictly preserving the "no two-wide paths"
 * constraint (no 2x2 blocks of PATH tiles).
 *
 * Tiers:
 * - Tier 1: Corridor extension with occasional perpendicular branching to find
 *           a connection without making 2x2 blocks.
 * - Tier 2: Selective pruning of very short dead-end stubs (length 1–5).
 * - Tier 3: Last resort forced connection using the project's existing A* segment
 *           function; placement still respects the 2x2 rule.
 */

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

    // Random branching attempt
    if (Math.random() < BRANCH_PROBABILITY) {
      const branchSteps = BRANCH_STEPS_BASE + Math.floor(Math.random() * BRANCH_STEPS_VARIATION);
      if (tryBranchFrom(current, dir, intGrid, ctx, branchSteps)) {
        connected = true;
        break;
      }
    }

    current = [current[0] + dir[0], current[1] + dir[1]];
  }

  // Place the straight extension (regardless of connection success)
  for (const pos of pathToPlace) {
    intGrid.setTile(pos[0], pos[1], ctx.PATH_TILE);
  }

  return connected;
}

/**
 * Tier 2: Prune short spurs (1-5 tiles) that didn't get connected.
 * Returns true if any spurs were removed.
 */
function pruneShortstubs(intGrid: IntGrid, ctx: AnalyzerContext): boolean {
  let removed = false;
  const toRemove: Pos[] = [];

  // Find all current dead ends
  const deadEnds = detectDeadEnds(intGrid, ctx);

  for (const tip of deadEnds) {
    const spurLength = measureSpurLength(tip, intGrid, ctx);
    if (spurLength >= PRUNE_MIN_LEN && spurLength <= PRUNE_MAX_LEN) {
      // Trace the spur and mark for removal
      const spurCells = traceSpur(tip, intGrid, ctx);
      toRemove.push(...spurCells);
    }
  }

  // Remove marked cells
  for (const pos of toRemove) {
    intGrid.setTile(pos[0], pos[1], ctx.REGION_TILE);
    removed = true;
  }

  return removed;
}

/**
 * Measure the length of a spur starting from a dead-end tip.
 */
function measureSpurLength(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext): number {
  let current = tip;
  let length = 0;
  const visited = new Set<string>();

  while (true) {
    const key = `${current[0]},${current[1]}`;
    if (visited.has(key)) break;
    visited.add(key);

    length++;
    if (length > SPUR_TRACE_LIMIT) break; // Safety guard

    const pathNeighbors = getPathNeighbors(current, intGrid, ctx);
    
    // If more than 1 neighbor, we've reached a junction
    if (pathNeighbors.length > 1) break;
    
    // If no neighbors, we're done
    if (pathNeighbors.length === 0) break;

    // Move to the next cell
    const next = pathNeighbors[0];
    const nextKey = `${next[0]},${next[1]}`;
    
    // If next is already visited, we're in a loop somehow
    if (visited.has(nextKey)) break;
    
    current = next;
  }

  return length;
}

/**
 * Trace a spur from tip to junction, returning all cells in the spur.
 */
function traceSpur(tip: Pos, intGrid: IntGrid, ctx: AnalyzerContext): Pos[] {
  const spur: Pos[] = [];
  let current = tip;
  const visited = new Set<string>();

  while (true) {
    const key = `${current[0]},${current[1]}`;
    if (visited.has(key)) break;
    visited.add(key);

    spur.push(current);
    if (spur.length > SPUR_TRACE_LIMIT) break; // Safety guard

    const pathNeighbors = getPathNeighbors(current, intGrid, ctx);
    
    // If more than 1 neighbor, we've reached a junction - don't include it
    if (pathNeighbors.length > 1) {
      spur.pop(); // Remove the junction from the spur
      break;
    }
    
    // If no neighbors, we're done
    if (pathNeighbors.length === 0) break;

    // Move to the next cell
    const next = pathNeighbors[0];
    const nextKey = `${next[0]},${next[1]}`;
    
    // If next is already visited, we're in a loop somehow
    if (visited.has(nextKey)) break;
    
    current = next;
  }

  return spur;
}

/**
 * Tier 3: Force connect remaining dead ends to the nearest PATH tile using A*.
 */
function forceConnectDeadEnds(
  intGrid: IntGrid, 
  ctx: AnalyzerContext, 
  findPathSegment: (start: Pos, end: Pos, grid: IntGrid) => Pos[] | null
): boolean {
  let connected = false;
  const deadEnds = detectDeadEnds(intGrid, ctx);

  for (const tip of deadEnds) {
    const target = findNearestPathTile(tip, intGrid, ctx);
    if (!target) continue;

    const path = findPathSegment(tip, target, intGrid);
    if (path && path.length > 1) {
      // Place the connecting path (skip first and last as they should already be PATH)
      for (let i = 1; i < path.length - 1; i++) {
        const pos = path[i];
        if (!ctx.wouldCreateDoubleWideAt(pos, intGrid)) {
          intGrid.setTile(pos[0], pos[1], ctx.PATH_TILE);
          connected = true;
        }
      }
    }
  }

  return connected;
}

/**
 * Find the nearest PATH tile to the given position within search radius.
 */
function findNearestPathTile(start: Pos, intGrid: IntGrid, ctx: AnalyzerContext): Pos | null {
  const visited = new Set<string>();
  const queue: Array<{pos: Pos, distance: number}> = [{pos: start, distance: 0}];

  while (queue.length > 0) {
    queue.sort((a, b) => a.distance - b.distance);
    const {pos, distance} = queue.shift()!;

    if (distance > TIER3_SEARCH_RADIUS) break;

    const key = `${pos[0]},${pos[1]}`;
    if (visited.has(key)) continue;
    visited.add(key);

    // Skip the starting position
    if (pos[0] !== start[0] || pos[1] !== start[1]) {
      if (intGrid.getTile(pos[0], pos[1]) === ctx.PATH_TILE) {
        return pos;
      }
    }

    // Add neighbors to queue
    for (const neighbor of ctx.getNeighbors(pos)) {
      if (ctx.inBounds(neighbor)) {
        const neighborKey = `${neighbor[0]},${neighbor[1]}`;
        if (!visited.has(neighborKey)) {
          const newDistance = distance + 1;
          queue.push({pos: neighbor, distance: newDistance});
        }
      }
    }
  }

  return null;
}

/**
 * Main entry point for dead-end analysis and remediation.
 * Runs multiple passes of the three-tier system until convergence or max iterations.
 */
export function analyzeAndFixDeadEnds(
  intGrid: IntGrid,
  ctx: AnalyzerContext,
  findPathSegment: (start: Pos, end: Pos, grid: IntGrid) => Pos[] | null,
  fixDoubleWide: (grid: IntGrid) => void
): void {
  let pass = 0;
  let changesMade = true;

  while (changesMade && pass < MAX_ANALYZER_PASSES) {
    changesMade = false;
    pass++;

    // Tier 1: Extend corridors
    const initialDeadEnds = detectDeadEnds(intGrid, ctx);
    for (const tip of initialDeadEnds) {
      if (tryExtendCorridor(tip, intGrid, ctx)) {
        changesMade = true;
      }
    }

    // Clean up any double-wide paths that might have been created
    fixDoubleWide(intGrid);

    // Tier 2: Prune short stubs
    if (pruneShortstubs(intGrid, ctx)) {
      changesMade = true;
    }

    // Tier 3: Force connect remaining dead ends (only on final passes)
    if (pass >= MAX_ANALYZER_PASSES - 3) {
      if (forceConnectDeadEnds(intGrid, ctx, findPathSegment)) {
        changesMade = true;
        // Clean up after forced connections
        fixDoubleWide(intGrid);
      }
    }
  }
}