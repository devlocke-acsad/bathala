import { Enemy } from "../../core/types/CombatTypes";

/**
 * Act 1 Enemies - Forest of Whispers
 * Based on Filipino mythology creatures
 */

// Common Enemies
export const TIKBALANG: Omit<Enemy, "id"> = {
  name: "Tikbalang",
  maxHealth: 25,
  currentHealth: 25,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 6,
    description: "Attacks for 6 damage",
    icon: "†",
  },
  damage: 6,
  attackPattern: ["attack", "confuse", "attack"],
  currentPatternIndex: 0,
};

export const DWENDE: Omit<Enemy, "id"> = {
  name: "Dwende",
  maxHealth: 15,
  currentHealth: 15,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 4,
    description: "Attacks for 4 damage",
    icon: "†",
  },
  damage: 4,
  attackPattern: ["attack", "mischief", "attack"],
  currentPatternIndex: 0,
};

export const KAPRE: Omit<Enemy, "id"> = {
  name: "Kapre",
  maxHealth: 20,
  currentHealth: 20,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 5,
    description: "Attacks for 5 damage",
    icon: "†",
  },
  damage: 5,
  attackPattern: ["attack", "smoke", "attack"],
  currentPatternIndex: 0,
};

export const SIGBIN: Omit<Enemy, "id"> = {
  name: "Sigbin",
  maxHealth: 18,
  currentHealth: 18,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 7,
    description: "Attacks for 7 damage",
    icon: "†",
  },
  damage: 7,
  attackPattern: ["attack", "invisibility", "attack"],
  currentPatternIndex: 0,
};

export const TIYANAK: Omit<Enemy, "id"> = {
  name: "Tiyanak",
  maxHealth: 12,
  currentHealth: 12,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 3,
    description: "Attacks for 3 damage",
    icon: "†",
  },
  damage: 3,
  attackPattern: ["attack", "deceive", "attack"],
  currentPatternIndex: 0,
};

// Elite Enemies
export const MANANANGGAL: Omit<Enemy, "id"> = {
  name: "Manananggal",
  maxHealth: 45,
  currentHealth: 45,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 10,
    description: "Attacks for 8-12 damage",
    icon: "†",
  },
  damage: 10,
  attackPattern: ["attack", "flight", "attack", "split"],
  currentPatternIndex: 0,
};

export const ASWANG: Omit<Enemy, "id"> = {
  name: "Aswang",
  maxHealth: 50,
  currentHealth: 50,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 10,
    description: "Attacks for 10 damage",
    icon: "†",
  },
  damage: 10,
  attackPattern: ["attack", "shapeshift", "attack"],
  currentPatternIndex: 0,
};

export const DUWENDE_CHIEF: Omit<Enemy, "id"> = {
  name: "Duwende Chief",
  maxHealth: 40,
  currentHealth: 40,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 6,
    description: "Attacks for 6 damage",
    icon: "†",
  },
  damage: 6,
  attackPattern: ["attack", "command", "attack"],
  currentPatternIndex: 0,
};

// Boss
export const BAKUNAWA: Omit<Enemy, "id"> = {
  name: "Bakunawa",
  maxHealth: 100,
  currentHealth: 100,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 18,
    description: "Attacks for 15-20 damage",
    icon: "†",
  },
  damage: 18,
  attackPattern: ["attack", "eclipse", "attack", "devour"],
  currentPatternIndex: 0,
};

// Enemy pools for encounters
export const ACT1_COMMON_ENEMIES = [TIKBALANG, DWENDE, KAPRE, SIGBIN, TIYANAK];

export const ACT1_ELITE_ENEMIES = [MANANANGGAL, ASWANG, DUWENDE_CHIEF];

export const ACT1_BOSS_ENEMIES = [BAKUNAWA];

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
  return { ...BAKUNAWA };
}
