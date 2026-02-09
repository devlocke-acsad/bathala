/**
 * Acts Module Index
 * 
 * @module acts
 * @description Barrel export for act definitions and registries
 * 
 * New class-based system:
 *   import { ACT1, ActRegistry } from '../acts';
 * 
 * Legacy (still works):
 *   import { ACT1_CONFIG } from '../acts';
 */

// === Framework ===
export { ActDefinition } from '../core/acts/ActDefinition';
export type { ActTheme, ActAssets, ActProgression } from '../core/acts/ActDefinition';
export { ActRegistry } from '../core/acts/ActRegistry';

// === Act definitions (class-based) ===
export { Act1Definition, ACT1 } from './act1/Act1Definition';

// === Legacy plain-object configs (kept for backward-compat) ===
export { ACT1_CONFIG } from './act1/Act1Config';

// Future: Act 2 - The Submerged Barangays
// export { Act2Definition, ACT2 } from './act2/Act2Definition';

// Future: Act 3 - The Skyward Citadel
// export { Act3Definition, ACT3 } from './act3/Act3Definition';
