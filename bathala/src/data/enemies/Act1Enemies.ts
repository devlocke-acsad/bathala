import { Enemy } from "../../core/types/CombatTypes";

/**
 * Act 1 Enemies - The Corrupted Ancestral Forests
 * Based on Filipino mythology creatures from the GDD
 * 
 * BALANCE UPDATE v2: Enemy stats scaled for new Balatro-inspired damage system
 * - Health multiplied by 8× for common enemies (was 5×, now 8×)
 * - Health multiplied by 6× for elites/boss (was 4×, now 6×)
 * - Damage multiplied by 3× to maintain challenge
 * - Elemental bonuses now only apply to Special attacks for better balance
 */

// Common Enemies
export const TIKBALANG_SCOUT: Omit<Enemy, "id"> = {
  name: "Tikbalang Scout",
  maxHealth: 350,        // Increased for rebalanced damage
  currentHealth: 350,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 21,           // Was 7, now 7 × 3 = 21
    description: "Confuses targeting",
    icon: "†",
  },
  damage: 21,
  attackPattern: ["attack", "confuse", "attack"],
  currentPatternIndex: 0,
};

export const BALETE_WRAITH: Omit<Enemy, "id"> = {
  name: "Balete Wraith",
  maxHealth: 280,        // Increased for rebalanced damage
  currentHealth: 280,
  block: 0,
  statusEffects: [
    {
      id: "vulnerable",
      name: "Vulnerable",
      type: "debuff",
      duration: -1, // Permanent
      value: 1,
      description: "Takes 50% more damage from all sources.",
      emoji: "🛡️💔",
    }
  ],
  intent: {
    type: "attack",
    value: 15,           // Was 5, now 5 × 3 = 15
    description: "Gains Strength",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["attack", "strengthen", "attack"],
  currentPatternIndex: 0,
};

export const SIGBIN_CHARGER: Omit<Enemy, "id"> = {
  name: "Sigbin Charger",
  maxHealth: 420,        // Increased for rebalanced damage
  currentHealth: 420,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 30,           // Was 10, now 10 × 3 = 30
    description: "Burst every 3 turns",
    icon: "†",
  },
  damage: 30,
  attackPattern: ["charge", "attack", "wait"],
  currentPatternIndex: 0,
};

export const DUWENDE_TRICKSTER: Omit<Enemy, "id"> = {
  name: "Duwende Trickster",
  maxHealth: 240,        // Increased for rebalanced damage
  currentHealth: 240,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 0,
    description: "Disrupts draw, steals block",
    icon: "†",
  },
  damage: 12,            // Was 4, now 4 × 3 = 12
  attackPattern: ["steal_block", "disrupt_draw", "attack"],
  currentPatternIndex: 0,
};

export const TIYANAK_AMBUSHER: Omit<Enemy, "id"> = {
  name: "Tiyanak Ambusher",
  maxHealth: 320,        // Increased for rebalanced damage
  currentHealth: 320,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 18,           // Was 6, now 6 × 3 = 18
    description: "Criticals, Fear",
    icon: "†",
  },
  damage: 18,
  attackPattern: ["fear", "critical_attack", "attack"],
  currentPatternIndex: 0,
};

export const AMOMONGO: Omit<Enemy, "id"> = {
  name: "Amomongo",
  maxHealth: 310,        // Increased for rebalanced damage
  currentHealth: 310,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 15,           // Was 5, now 5 × 3 = 15
    description: "Claws bleed, fast attacks",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["bleed_attack", "fast_attack", "attack"],
  currentPatternIndex: 0,
};

export const BUNGISNGIS: Omit<Enemy, "id"> = {
  name: "Bungisngis",
  maxHealth: 380,        // Increased for rebalanced damage
  currentHealth: 380,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 0,
    description: "Laugh debuff, high swings",
    icon: "†",
  },
  damage: 36,            // Was 12, now 12 × 3 = 36
  attackPattern: ["laugh_debuff", "high_swing", "attack"],
  currentPatternIndex: 0,
};

// Elite Enemies
export const KAPRE_SHADE: Omit<Enemy, "id"> = {
  name: "Kapre Shade",
  maxHealth: 600,        // Elite enemy - increased for rebalanced damage
  currentHealth: 600,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 36,           // Was 12, now 12 × 3 = 36
    description: "AoE Burn, minions",
    icon: "†",
  },
  damage: 36,
  attackPattern: ["burn_aoe", "summon_minion", "attack"],
  currentPatternIndex: 0,
};

export const TAWONG_LIPOD: Omit<Enemy, "id"> = {
  name: "Tawong Lipod",
  maxHealth: 560,        // Elite enemy - increased for rebalanced damage
  currentHealth: 560,
  block: 0,
  statusEffects: [
    {
      id: "dexterity",
      name: "Dexterity",
      type: "buff",
      duration: -1, // Permanent (invisible wind being trait)
      value: 2,
      description: "Gain +2 block per stack when using Defend actions. Represents the elusive, wind-dancing nature of Tawong Lipod.",
      emoji: "💨",
    }
  ],
  intent: {
    type: "attack",
    value: 30,           // Was 10, now 10 × 3 = 30
    description: "Invisible stuns, Air benefits",
    icon: "†",
  },
  damage: 30,
  attackPattern: ["stun", "air_attack", "attack"],
  currentPatternIndex: 0,
};

// Boss
export const MANGNANGAWAY: Omit<Enemy, "id"> = {
  name: "Mangangaway",
  maxHealth: 1200,       // Boss enemy - increased for rebalanced damage
  currentHealth: 1200,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff", // Changed from "special" to valid type
    value: 0,
    description: "Mimics elements, curses cards, Hex of Reversal",
    icon: "†",
  },
  damage: 45,            // Was 15, now 15 × 3 = 45
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

/**
 * Get a specific enemy by name
 */
export function getEnemyByName(name: string): Omit<Enemy, "id"> | null {
  // Create a map of all enemies for easy lookup
  const allEnemies = [
    ...ACT1_COMMON_ENEMIES,
    ...ACT1_ELITE_ENEMIES,
    ...ACT1_BOSS_ENEMIES,
  ];
  
  // Find enemy by name (case-insensitive)
  const enemy = allEnemies.find(e => e.name.toLowerCase() === name.toLowerCase());
  
  return enemy ? { ...enemy } : null;
}