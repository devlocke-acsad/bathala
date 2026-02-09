/**
 * Act 1 Enemies - The Corrupted Ancestral Forests
 * 
 * SINGLE SOURCE OF TRUTH for enemy names:
 *   Enemy names are referenced from creature config files in
 *   src/data/enemies/creatures/. To change an enemy's display name:
 *     → Edit the creature file (e.g., creatures/amomongo.ts)
 *     → The name automatically propagates everywhere in the game.
 * 
 * Runtime combat stats (HP, damage, patterns, elements, intents) are
 * manually tuned here and are independent of creature base stats.
 * 
 * @module Act1Enemies
 */

import { Enemy } from "../../core/types/CombatTypes";
import {
  TIKBALANG_SCOUT as TIKBALANG_CONFIG,
  BALETE_WRAITH as BALETE_CONFIG,
  SIGBIN_CHARGER as SIGBIN_CONFIG,
  DUWENDE_TRICKSTER as DUWENDE_CONFIG,
  TIYANAK_AMBUSHER as TIYANAK_CONFIG,
  AMOMONGO as AMOMONGO_CONFIG,
  BUNGISNGIS as BUNGISNGIS_CONFIG,
  KAPRE_SHADE as KAPRE_CONFIG,
  TAWONG_LIPOD as TAWONG_CONFIG,
  MANGANGAWAY as MANGANGAWAY_CONFIG,
} from "./creatures";

// Common Enemies
export const TIKBALANG_SCOUT: Omit<Enemy, "id"> = {
  name: TIKBALANG_CONFIG.name,
  maxHealth: 180,
  currentHealth: 180,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 21,
    description: "Attacks and weakens",
    icon: "†",
  },
  damage: 21,
  attackPattern: ["attack", "weaken", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",
    resistance: "air",
  },
};

export const BALETE_WRAITH: Omit<Enemy, "id"> = {
  name: BALETE_CONFIG.name,
  maxHealth: 150,
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
    value: 15,
    description: "Gains Strength",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["attack", "strengthen", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",
    resistance: "water",
  },
};

export const SIGBIN_CHARGER: Omit<Enemy, "id"> = {
  name: SIGBIN_CONFIG.name,
  maxHealth: 220,
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
  attackPattern: ["defend", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",
    resistance: "earth",
  },
};

export const DUWENDE_TRICKSTER: Omit<Enemy, "id"> = {
  name: DUWENDE_CONFIG.name,
  maxHealth: 130,
  currentHealth: 130,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens repeatedly",
    icon: "⚠️",
  },
  damage: 12,
  attackPattern: ["weaken", "attack", "weaken"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",
    resistance: "water",
  },
};

export const TIYANAK_AMBUSHER: Omit<Enemy, "id"> = {
  name: TIYANAK_CONFIG.name,
  maxHealth: 170,
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
  attackPattern: ["weaken", "attack", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",
    resistance: "fire",
  },
};

export const AMOMONGO: Omit<Enemy, "id"> = {
  name: AMOMONGO_CONFIG.name,
  maxHealth: 160,
  currentHealth: 160,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 15,
    description: "Fast attacks then defends",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["attack", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",
    resistance: "water",
  },
};

export const BUNGISNGIS: Omit<Enemy, "id"> = {
  name: BUNGISNGIS_CONFIG.name,
  maxHealth: 200,
  currentHealth: 200,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens, attacks, strengthens",
    icon: "⚠️",
  },
  damage: 36,
  attackPattern: ["weaken", "attack", "strengthen"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "air",
    resistance: "water",
  },
};

// Elite Enemies
export const KAPRE_SHADE: Omit<Enemy, "id"> = {
  name: KAPRE_CONFIG.name,
  maxHealth: 320,
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
  attackPattern: ["poison", "strengthen", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",
    resistance: "earth",
  },
};

export const TAWONG_LIPOD: Omit<Enemy, "id"> = {
  name: TAWONG_CONFIG.name,
  maxHealth: 300,
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
  attackPattern: ["stun", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",
    resistance: "air",
  },
};

// Boss
export const MANGNANGAWAY: Omit<Enemy, "id"> = {
  name: MANGANGAWAY_CONFIG.name,
  maxHealth: 600,
  currentHealth: 600,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens, poisons, strengthens",
    icon: "⚠️",
  },
  damage: 45,
  attackPattern: ["weaken", "poison", "strengthen", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",
    resistance: "fire",
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
  const allEnemies = [
    ...ACT1_COMMON_ENEMIES,
    ...ACT1_ELITE_ENEMIES,
    ...ACT1_BOSS_ENEMIES,
  ];
  
  const enemy = allEnemies.find(e => e.name.toLowerCase() === name.toLowerCase());
  
  return enemy ? { ...enemy } : null;
}

// ========================================================================
// Sprite Key Mapping — auto-built from creature configs
// ========================================================================
// Each creature config defines its own combatSpriteKey and overworldSpriteKey.
// This map is derived automatically so sprite keys are never duplicated.
// To change an enemy's sprite: edit its creature file in creatures/*.ts.
// ========================================================================

const ALL_CONFIGS = [
  TIKBALANG_CONFIG, BALETE_CONFIG, SIGBIN_CONFIG, DUWENDE_CONFIG,
  TIYANAK_CONFIG, AMOMONGO_CONFIG, BUNGISNGIS_CONFIG,
  KAPRE_CONFIG, TAWONG_CONFIG, MANGANGAWAY_CONFIG,
];

const ENEMY_SPRITE_MAP: Record<string, { overworld: string; combat: string }> =
  Object.fromEntries(
    ALL_CONFIGS.map(cfg => [
      cfg.name,
      { overworld: cfg.overworldSpriteKey, combat: cfg.combatSpriteKey },
    ])
  );

/**
 * Get combat sprite key for an enemy by display name.
 * Decoupled from name parsing — works regardless of display name changes.
 */
export function getEnemyCombatSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.combat ?? "tikbalang_combat";
}

/**
 * Get overworld sprite key for an enemy by display name.
 * Decoupled from name parsing — works regardless of display name changes.
 */
export function getEnemyOverworldSprite(name: string): string {
  return ENEMY_SPRITE_MAP[name]?.overworld ?? "tikbalang_overworld";
}