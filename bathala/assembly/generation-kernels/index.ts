// @ts-nocheck
/**
 * generation-kernels — AssemblyScript entry point.
 *
 * Re-exports all kernel functions from modular files.
 * Each module operates on the shared GRID buffer defined in common/grid.ts.
 *
 * Build command:
 *   asc assembly/generation-kernels/index.ts \
 *       --target release --runtime stub \
 *       --outFile public/wasm/generation-kernels.wasm \
 *       --textFile public/wasm/generation-kernels.wat
 *
 * @module generation-kernels
 */

// ── Shared memory accessors ─────────────────────────────────────────────
export {
  ensureCapacity,
  getGridPtr,
  getPathPtr,
  getMaxCells,
} from './common/grid';

// ── Shared kernels (used by multiple algorithms) ────────────────────────
export { fixDoubleWideInPlace } from './shared/fix-double-wide';
export { extendDeadEndsInPlace } from './shared/extend-dead-ends';
export { enforceMinThickness2x2InPlace } from './shared/enforce-min-thickness';
export { enforceExact2x2BundlesInPlace } from './shared/enforce-exact-bundles';
export { removeSmallComponentsInPlace } from './shared/remove-small-components';
export { filterComponentsBySizeAndFootprintInPlace } from './shared/filter-components';
export { repairCliffGapsInPlace } from './shared/repair-cliff-gaps';
export { enforceCliffShellIntegrityInPlace } from './shared/cliff-shell-integrity';

// ── SubmergedVillage-specific kernels ───────────────────────────────────
export { findRoadPathAStar } from './submerged-village/find-road-astar';
