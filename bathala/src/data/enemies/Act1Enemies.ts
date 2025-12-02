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
  maxHealth: 180,        // Further reduced for better balance
  currentHealth: 180,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 21,           // Was 7, now 7 × 3 = 21
    description: "Attacks and weakens",
    icon: "†",
  },
  damage: 21,
  attackPattern: ["attack", "weaken", "attack"], // Simplified: confusing = weakening
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Air creature: weak to Fire
    resistance: "air",     // Air creature: resists Air
  },
};

export const BALETE_WRAITH: Omit<Enemy, "id"> = {
  name: "Balete Wraith",
  maxHealth: 150,        // Further reduced for better balance
  currentHealth: 150,
  block: 0,
  statusEffects: [
    {
      id: "vulnerable",
      name: "Vulnerable",
      type: "debuff",
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
  elementalAffinity: {
    weakness: "air",       // Earth creature (tree spirit): weak to Air
    resistance: "water",   // Earth creature: resists Water
  },
};

export const SIGBIN_CHARGER: Omit<Enemy, "id"> = {
  name: "Sigbin Charger",
  maxHealth: 220,        // Further reduced for better balance
  currentHealth: 220,
  block: 0,
  statusEffects: [],
  intent: {
    type: "defend",
    value: 5,
    description: "Defends then attacks",
    icon: "⛨",
  },
  damage: 30,
  attackPattern: ["defend", "attack", "defend"], // Simplified: defensive then aggressive
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire creature (aggressive): weak to Water
    resistance: "earth",   // Fire creature: resists Earth
  },
};

export const DUWENDE_TRICKSTER: Omit<Enemy, "id"> = {
  name: "Duwende Trickster",
  maxHealth: 130,        // Further reduced for better balance
  currentHealth: 130,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens repeatedly",
    icon: "⚠️",
  },
  damage: 12,            // Was 4, now 4 × 3 = 12
  attackPattern: ["weaken", "attack", "weaken"], // Simplified: tricky = weakens repeatedly
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",       // Earth creature (dwarf): weak to Air
    resistance: "water",   // Earth creature: resists Water
  },
};

export const TIYANAK_AMBUSHER: Omit<Enemy, "id"> = {
  name: "Tiyanak Ambusher",
  maxHealth: 170,        // Further reduced for better balance
  currentHealth: 170,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens then double attacks",
    icon: "⚠️",
  },
  damage: 18,
  attackPattern: ["weaken", "attack", "attack"], // Simplified: fear = weaken, then double attack
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature (swamp spirit): weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

export const AMOMONGO: Omit<Enemy, "id"> = {
  name: "Amomongo",
  maxHealth: 160,        // Further reduced for better balance
  currentHealth: 160,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 15,           // Was 5, now 5 × 3 = 15
    description: "Fast attacks then defends",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["attack", "attack", "defend"], // Simplified: fast = attacks twice, then defends
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",       // Earth creature (ape): weak to Air
    resistance: "water",   // Earth creature: resists Water
  },
};

export const BUNGISNGIS: Omit<Enemy, "id"> = {
  name: "Bungisngis",
  maxHealth: 200,        // Further reduced for better balance
  currentHealth: 200,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens, attacks, strengthens",
    icon: "⚠️",
  },
  damage: 36,            // Was 12, now 12 × 3 = 36
  attackPattern: ["weaken", "attack", "strengthen"], // Simplified: weakens you, attacks, gets stronger
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",       // Earth creature (giant): weak to Air
    resistance: "water",   // Earth creature: resists Water
  },
};

// Elite Enemies
export const KAPRE_SHADE: Omit<Enemy, "id"> = {
  name: "Kapre Shade",
  maxHealth: 320,        // Elite enemy - further reduced for better balance
  currentHealth: 320,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Poisons, strengthens, attacks",
    icon: "☠️",
  },
  damage: 36,
  attackPattern: ["poison", "strengthen", "attack"], // Simplified: burns (poison), gets stronger, attacks
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire creature (smoke/fire spirit): weak to Water
    resistance: "earth",   // Fire creature: resists Earth
  },
};

export const TAWONG_LIPOD: Omit<Enemy, "id"> = {
  name: "Tawong Lipod",
  maxHealth: 300,        // Elite enemy - further reduced for better balance
  currentHealth: 300,
  block: 0,
  statusEffects: [
    {
      id: "dexterity",
      name: "Dexterity",
      type: "buff",
      value: 2,
      description: "Gain +2 block per stack when using Defend actions. Represents the elusive, wind-dancing nature of Tawong Lipod.",
      emoji: "💨",
    }
  ],
  intent: {
    type: "debuff",
    value: 2,
    description: "Stuns, attacks, evades",
    icon: "💫",
  },
  damage: 30,
  attackPattern: ["stun", "attack", "defend"], // Simplified: stuns (frail), attacks, evades (defend)
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Air creature (wind spirit): weak to Fire
    resistance: "air",     // Air creature: resists Air
  },
};

// Boss
export const MANGNANGAWAY: Omit<Enemy, "id"> = {
  name: "Mangangaway",
  maxHealth: 600,        // Boss enemy - further reduced for better balance
  currentHealth: 600,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens, poisons, strengthens",
    icon: "⚠️",
  },
  damage: 45,            // Was 15, now 15 × 3 = 45
  attackPattern: ["weaken", "poison", "strengthen", "attack"], // Simplified: uses all debuffs/buffs, then attacks
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature (witch/sorcerer): weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
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