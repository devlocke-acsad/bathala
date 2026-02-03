/**
 * Enemy Creatures Index
 * 
 * @module creatures
 * @description Barrel export for all enemy creature definitions
 * 
 * This is the central pool of ALL enemies in the game.
 * Each enemy is independent and can be used in any act.
 * 
 * Usage:
 * ```typescript
 * import { TIKBALANG_SCOUT, KAPRE_SHADE, MANGANGAWAY } from '../data/enemies/creatures';
 * ```
 */

// === Common Enemies ===
export { TIKBALANG_SCOUT } from './tikbalang_scout';
export { BALETE_WRAITH } from './balete_wraith';
export { SIGBIN_CHARGER } from './sigbin_charger';
export { DUWENDE_TRICKSTER } from './duwende_trickster';
export { TIYANAK_AMBUSHER } from './tiyanak_ambusher';
export { AMOMONGO } from './amomongo';
export { BUNGISNGIS } from './bungisngis';

// === Elite Enemies ===
export { KAPRE_SHADE } from './kapre';
export { TAWONG_LIPOD } from './tawong_lipod';

// === Bosses ===
export { MANGANGAWAY } from './mangangaway';

// Future creatures can be added here:
// export { SIRENA } from './sirena';
// export { SIYOKOY } from './siyokoy';
// export { BAKUNAWA } from './bakunawa';
// export { FALSE_BATHALA } from './false_bathala';
