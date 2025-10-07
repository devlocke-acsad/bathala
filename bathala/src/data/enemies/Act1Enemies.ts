import { Enemy } from "../../core/types/CombatTypes";

/**
 * Act 1 Enemies - The Corrupted Ancestral Forests
 * Based on Filipino mythology creatures from the GDD
 */

// Common Enemies
export const TIKBALANG_SCOUT: Omit<Enemy, "id"> = {
  name: "Tikbalang Scout",
  maxHealth: 28,
  currentHealth: 28,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 7,
    description: "Confuses targeting",
    icon: "†",
  },
  damage: 7,
  attackPattern: ["attack", "confuse", "attack"],
  currentPatternIndex: 0,
};

export const BALETE_WRAITH: Omit<Enemy, "id"> = {
  name: "Balete Wraith",
  maxHealth: 22,
  currentHealth: 22,
  block: 0,
  statusEffects: [{ type: "vulnerable", duration: -1 }],
  intent: {
    type: "attack",
    value: 5,
    description: "Gains Strength",
    icon: "†",
  },
  damage: 5,
  attackPattern: ["attack", "strengthen", "attack"],
  currentPatternIndex: 0,
};

export const SIGBIN_CHARGER: Omit<Enemy, "id"> = {
  name: "Sigbin Charger",
  maxHealth: 35,
  currentHealth: 35,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 10,
    description: "Burst every 3 turns",
    icon: "†",
  },
  damage: 10,
  attackPattern: ["charge", "attack", "wait"],
  currentPatternIndex: 0,
};

export const DUWENDE_TRICKSTER: Omit<Enemy, "id"> = {
  name: "Duwende Trickster",
  maxHealth: 18,
  currentHealth: 18,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 0,
    description: "Disrupts draw, steals block",
    icon: "†",
  },
  damage: 4,
  attackPattern: ["steal_block", "disrupt_draw", "attack"],
  currentPatternIndex: 0,
};

export const TIYANAK_AMBUSHER: Omit<Enemy, "id"> = {
  name: "Tiyanak Ambusher",
  maxHealth: 25,
  currentHealth: 25,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 6,
    description: "Criticals, Fear",
    icon: "†",
  },
  damage: 6,
  attackPattern: ["fear", "critical_attack", "attack"],
  currentPatternIndex: 0,
};

export const AMOMONGO: Omit<Enemy, "id"> = {
  name: "Amomongo",
  maxHealth: 24,
  currentHealth: 24,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 5,
    description: "Claws bleed, fast attacks",
    icon: "†",
  },
  damage: 5,
  attackPattern: ["bleed_attack", "fast_attack", "attack"],
  currentPatternIndex: 0,
};

export const BUNGISNGIS: Omit<Enemy, "id"> = {
  name: "Bungisngis",
  maxHealth: 30,
  currentHealth: 30,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 0,
    description: "Laugh debuff, high swings",
    icon: "†",
  },
  damage: 12,
  attackPattern: ["laugh_debuff", "high_swing", "attack"],
  currentPatternIndex: 0,
};

// Elite Enemies
export const KAPRE_SHADE: Omit<Enemy, "id"> = {
  name: "Kapre Shade",
  maxHealth: 65,
  currentHealth: 65,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 12,
    description: "AoE Burn, minions",
    icon: "†",
  },
  damage: 12,
  attackPattern: ["burn_aoe", "summon_minion", "attack"],
  currentPatternIndex: 0,
};

export const TAWONG_LIPOD: Omit<Enemy, "id"> = {
  name: "Tawong Lipod",
  maxHealth: 60,
  currentHealth: 60,
  block: 0,
  statusEffects: [{ type: "invisible", duration: 1 }],
  intent: {
    type: "attack",
    value: 10,
    description: "Invisible stuns, Air benefits",
    icon: "†",
  },
  damage: 10,
  attackPattern: ["stun", "air_attack", "attack"],
  currentPatternIndex: 0,
};

// Boss
export const MANGNANGAWAY: Omit<Enemy, "id"> = {
  name: "Mangangaway",
  maxHealth: 120,
  currentHealth: 120,
  block: 0,
  statusEffects: [],
  intent: {
    type: "special",
    value: 0,
    description: "Mimics elements, curses cards, Hex of Reversal",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["mimic_element", "curse_cards", "hex_of_reversal", "attack"],
  currentPatternIndex: 0,
};

// Enemy pools for encounters
export const ACT1_COMMON_ENEMIES = [
  TIKBALANG_SCOUT,
  BALETE_WRAITH,
  SIGBIN_CHARGER,
  DUWENDE_TRICKSTER,
  TIYANAK_AMBUSHER,
  AMOMONGO,
  BUNGISNGIS,
];

export const ACT1_ELITE_ENEMIES = [KAPRE_SHADE, TAWONG_LIPOD];

export const ACT1_BOSS_ENEMIES = [MANGNANGAWAY];

/**
 * Get a random common enemy for Act 1
 */
export function getRandomCommonEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT1_COMMON_ENEMIES.length);
  return { ...ACT1_COMMON_ENEMIES[randomIndex] };
}

/**
 * Get a random elite enemy for Act 1
 */
export function getRandomEliteEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT1_ELITE_ENEMIES.length);
  return { ...ACT1_ELITE_ENEMIES[randomIndex] };
}

/**
 * Get the boss enemy for Act 1
 */
export function getBossEnemy(): Omit<Enemy, "id"> {
  return { ...MANGNANGAWAY };
}