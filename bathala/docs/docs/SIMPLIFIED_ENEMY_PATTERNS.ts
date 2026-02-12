// Simplified Enemy Attack Patterns
// Copy these into Act1Enemies.ts to replace complex patterns

// Common Enemies
export const TIKBALANG_SCOUT_PATTERN = ["attack", "weaken", "attack"];
export const BALETE_WRAITH_PATTERN = ["attack", "strengthen", "attack"]; // Keep as is
export const SIGBIN_CHARGER_PATTERN = ["defend", "attack", "defend"];
export const DUWENDE_TRICKSTER_PATTERN = ["weaken", "attack", "weaken"];
export const TIYANAK_AMBUSHER_PATTERN = ["weaken", "attack", "attack"];
export const AMOMONGO_PATTERN = ["attack", "attack", "defend"];
export const BUNGISNGIS_PATTERN = ["weaken", "attack", "strengthen"];

// Elite Enemies
export const KAPRE_SHADE_PATTERN = ["poison", "strengthen", "attack"];
export const TAWONG_LIPOD_PATTERN = ["stun", "attack", "defend"];

// Boss
export const MANGANGAWAY_PATTERN = ["weaken", "poison", "strengthen", "attack"];

/*
USAGE:
Replace the attackPattern in each enemy definition:

attackPattern: TIKBALANG_SCOUT_PATTERN,

Or directly:

attackPattern: ["attack", "weaken", "attack"],
*/
