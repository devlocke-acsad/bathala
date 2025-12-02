import { Enemy } from "../../core/types/CombatTypes";

/**
 * Act 2 Enemies - The Submerged Barangays
 * Based on Filipino mythology creatures with water/fire themes
 * 
 * LORE SOURCES:
 * - Sirena: Mermaid-like creatures from Filipino folklore
 * - Siyokoy: Male counterpart to Sirena, aggressive sea creatures
 * - Santelmo: Fire spirits (St. Elmo's fire), often seen near water
 * - Berberoka: Water creature that swallows people whole
 * - Magindara: Beautiful mermaids with enchanting voices
 * - Kataw: Sea creatures, half-human half-fish
 * - Berbalang: Vampire-like creature that can separate its body
 * - Bangkilan: Cursed spirits from sunken villages
 * - Bakunawa: Dragon/serpent that devours the moon, causes eclipses
 * 
 * BALANCE NOTES:
 * - Health scaled according to Act 2 specifications (8× for common, 6× for elite/boss)
 * - Damage multiplied by 3× to maintain challenge
 * - Attack patterns simplified to 2-4 actions for common, 3-5 for elite, 5-6 for boss
 * - Elemental focus: Tubig (Water) and Apoy (Fire)
 */

// ============================================================================
// COMMON ENEMIES (7 total)
// ============================================================================

/**
 * Sirena Illusionist
 * Lore: Enchanting mermaids who use illusions and healing magic
 * Source: Filipino folklore - Sirena (mermaid spirits)
 */
export const SIRENA_ILLUSIONIST: Omit<Enemy, "id"> = {
  name: "Sirena Illusionist",
  maxHealth: 240,        // 30 × 8 = 240
  currentHealth: 240,
  block: 0,
  statusEffects: [],
  intent: {
    type: "buff",
    value: 10,
    description: "Heals and charms",
    icon: "💚",
  },
  damage: 18,            // 6 × 3 = 18
  attackPattern: ["heal", "charm", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Siyokoy Raider
 * Lore: Aggressive male sea creatures, warriors of the deep
 * Source: Filipino folklore - Siyokoy (male sea creatures)
 */
export const SIYOKOY_RAIDER: Omit<Enemy, "id"> = {
  name: "Siyokoy Raider",
  maxHealth: 320,        // 40 × 8 = 320
  currentHealth: 320,
  block: 0,
  statusEffects: [],
  intent: {
    type: "defend",
    value: 8,
    description: "Defends then double attacks",
    icon: "⛨",
  },
  damage: 27,            // 9 × 3 = 27
  attackPattern: ["defend", "attack", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Santelmo Flicker
 * Lore: Fire spirits that appear as floating flames, often near water
 * Source: Filipino folklore - Santelmo (St. Elmo's fire spirits)
 */
export const SANTELMO_FLICKER: Omit<Enemy, "id"> = {
  name: "Santelmo Flicker",
  maxHealth: 160,        // 20 × 8 = 160
  currentHealth: 160,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 21,           // 7 × 3 = 21
    description: "Fast attacks with defense",
    icon: "†",
  },
  damage: 21,
  attackPattern: ["attack", "defend", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire creature: weak to Water
    resistance: "earth",   // Fire creature: resists Earth
  },
};

/**
 * Berberoka Lurker
 * Lore: Water creature that swallows victims whole, lurks in rivers
 * Source: Filipino folklore - Berberoka (swallowing water spirit)
 */
export const BERBEROKA_LURKER: Omit<Enemy, "id"> = {
  name: "Berberoka Lurker",
  maxHealth: 256,        // 32 × 8 = 256
  currentHealth: 256,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens then attacks defensively",
    icon: "⚠️",
  },
  damage: 24,            // 8 × 3 = 24
  attackPattern: ["weaken", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Magindara Swarm
 * Lore: Beautiful mermaids with enchanting voices, travel in groups
 * Source: Filipino folklore - Magindara (enchanting mermaids)
 * Note: Spawns as 3 units with 15 HP each (total 45 HP equivalent)
 */
export const MAGINDARA_SWARM: Omit<Enemy, "id"> = {
  name: "Magindara Swarm",
  maxHealth: 120,        // 15 × 8 = 120 (per unit)
  currentHealth: 120,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 15,           // 5 × 3 = 15
    description: "Attacks then heals",
    icon: "†",
  },
  damage: 15,
  attackPattern: ["attack", "heal"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Kataw
 * Lore: Sea creatures, half-human half-fish, guardians of the ocean
 * Source: Filipino folklore - Kataw (sea guardians)
 */
export const KATAW: Omit<Enemy, "id"> = {
  name: "Kataw",
  maxHealth: 224,        // 28 × 8 = 224
  currentHealth: 224,
  block: 0,
  statusEffects: [],
  intent: {
    type: "buff",
    value: 10,
    description: "Heals, attacks, strengthens",
    icon: "💚",
  },
  damage: 21,            // 7 × 3 = 21
  attackPattern: ["heal", "attack", "strengthen"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Berbalang
 * Lore: Vampire-like creature that can separate its upper body to hunt
 * Source: Filipino folklore - Berbalang (self-segmenting vampire)
 */
export const BERBALANG: Omit<Enemy, "id"> = {
  name: "Berbalang",
  maxHealth: 208,        // 26 × 8 = 208
  currentHealth: 208,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens then double attacks",
    icon: "⚠️",
  },
  damage: 24,            // 8 × 3 = 24
  attackPattern: ["weaken", "attack", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Dark creature: weak to Fire
    resistance: "water",   // Dark creature: resists Water
  },
};

// ============================================================================
// ELITE ENEMIES (2 total)
// ============================================================================

/**
 * Sunken Bangkilan
 * Lore: Cursed spirits from sunken villages, seeking revenge
 * Source: Filipino folklore - Bangkilan (cursed village spirits)
 */
export const SUNKEN_BANGKILAN: Omit<Enemy, "id"> = {
  name: "Sunken Bangkilan",
  maxHealth: 420,        // 70 × 6 = 420
  currentHealth: 420,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Weakens, attacks, heals, strengthens",
    icon: "⚠️",
  },
  damage: 33,            // 11 × 3 = 33
  attackPattern: ["weaken", "attack", "heal", "strengthen"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water creature: weak to Earth
    resistance: "fire",    // Water creature: resists Fire
  },
};

/**
 * Apoy-Tubig Fury
 * Lore: Elemental fusion of fire and water, unstable and dangerous
 * Source: Original creation - represents the duality of Act 2's theme
 */
export const APOY_TUBIG_FURY: Omit<Enemy, "id"> = {
  name: "Apoy-Tubig Fury",
  maxHealth: 408,        // 68 × 6 = 408
  currentHealth: 408,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Burns, attacks, heals, attacks",
    icon: "☠️",
  },
  damage: 30,            // 10 × 3 = 30
  attackPattern: ["poison", "attack", "heal", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: null,        // Dual nature: no weakness
    resistance: null,      // Dual nature: no resistance
  },
};

// ============================================================================
// BOSS ENEMY
// ============================================================================

/**
 * Bakunawa
 * Lore: Great dragon/serpent that devours the moon, causes eclipses
 * Source: Filipino mythology - Bakunawa (moon-eating dragon)
 */
export const BAKUNAWA: Omit<Enemy, "id"> = {
  name: "Bakunawa",
  maxHealth: 900,        // 150 × 6 = 900
  currentHealth: 900,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Weakens, attacks, strengthens, attacks, burns",
    icon: "⚠️",
  },
  damage: 42,            // 14 × 3 = 42
  attackPattern: ["weaken", "attack", "strengthen", "attack", "poison"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Water dragon: weak to Earth
    resistance: "fire",    // Water dragon: resists Fire
  },
};

// ============================================================================
// ENEMY POOLS
// ============================================================================

export const ACT2_COMMON_ENEMIES = [
  SIRENA_ILLUSIONIST,
  SIYOKOY_RAIDER,
  SANTELMO_FLICKER,
  BERBEROKA_LURKER,
  MAGINDARA_SWARM,
  KATAW,
  BERBALANG,
];

export const ACT2_ELITE_ENEMIES = [
  SUNKEN_BANGKILAN,
  APOY_TUBIG_FURY,
];

export const ACT2_BOSS_ENEMIES = [BAKUNAWA];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random common enemy for Act 2
 */
export function getRandomCommonEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT2_COMMON_ENEMIES.length);
  return { ...ACT2_COMMON_ENEMIES[randomIndex] };
}

/**
 * Get a random elite enemy for Act 2
 */
export function getRandomEliteEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT2_ELITE_ENEMIES.length);
  return { ...ACT2_ELITE_ENEMIES[randomIndex] };
}

/**
 * Get the boss enemy for Act 2
 */
export function getBossEnemy(): Omit<Enemy, "id"> {
  return { ...BAKUNAWA };
}

/**
 * Get a specific enemy by name
 */
export function getEnemyByName(name: string): Omit<Enemy, "id"> | null {
  const allEnemies = [
    ...ACT2_COMMON_ENEMIES,
    ...ACT2_ELITE_ENEMIES,
    ...ACT2_BOSS_ENEMIES,
  ];
  
  const enemy = allEnemies.find(e => e.name.toLowerCase() === name.toLowerCase());
  return enemy ? { ...enemy } : null;
}

// ============================================================================
// ENEMY DIALOGUE SYSTEM
// ============================================================================

/**
 * Enemy dialogue for all combat outcomes
 * Includes: introduction, defeat, spare, and slay dialogue
 */
export interface EnemyDialogue {
  introduction: string;
  defeat: string;
  spare: string;
  slay: string;
}

/**
 * Get short combat intro dialogue for Act 2 enemies
 */
export function getEnemyDialogue(enemyName: string): string {
  const name = enemyName.toLowerCase();
  
  // Common Enemies
  if (name.includes("sirena")) return "Enchanting songs lure you deep!";
  if (name.includes("siyokoy")) return "The depths claim all trespassers!";
  if (name.includes("santelmo")) return "Flames dance on water's edge!";
  if (name.includes("berberoka")) return "Swallowed whole by the river!";
  if (name.includes("magindara")) return "Our voices weave your doom!";
  if (name.includes("kataw")) return "Ocean's guardian stands firm!";
  if (name.includes("berbalang")) return "Split form hunts in darkness!";
  
  // Elite Enemies
  if (name.includes("bangkilan")) return "Sunken village seeks revenge!";
  if (name.includes("apoy-tubig") || name.includes("fury")) return "Fire and water clash within!";
  
  // Boss
  if (name.includes("bakunawa")) return "The moon-eater rises from the depths!";
  
  return "A creature of the submerged barangays appears!";
}

/**
 * Get extended battle start dialogue for Act 2 enemies
 */
export function getBattleStartDialogue(enemyName: string): string {
  const name = enemyName.toLowerCase();
  
  // Common Enemies
  if (name.includes("sirena")) {
    return "My illusions have drawn many to the depths. Will you resist my enchantments, or join the drowned?";
  }
  if (name.includes("siyokoy")) {
    return "Surface dweller! The submerged barangays are no place for your kind. Turn back or face the wrath of the deep!";
  }
  if (name.includes("santelmo")) {
    return "I am the flame that dances on water, the light that leads sailors astray. Will you follow my flicker to salvation or doom?";
  }
  if (name.includes("berberoka")) {
    return "The river hungers, and I am its mouth. Many have been swallowed whole—will you be next?";
  }
  if (name.includes("magindara")) {
    return "Our voices once blessed fishermen with bountiful catches. Now we sing only songs of sorrow and drowning!";
  }
  if (name.includes("kataw")) {
    return "I guard these waters as my ancestors did before me. The false god's corruption has not claimed me yet, but I will defend my domain!";
  }
  if (name.includes("berbalang")) {
    return "My body splits to hunt in the night! The upper half seeks blood while the lower waits. Which will you face?";
  }
  
  // Elite Enemies
  if (name.includes("bangkilan")) {
    return "We were a thriving village until the waters rose and claimed us all. Now we are cursed spirits, seeking vengeance on the living!";
  }
  if (name.includes("apoy-tubig") || name.includes("fury")) {
    return "Fire and water—elements that should never meet—rage within me! I am the chaos of opposing forces, and I will tear you apart!";
  }
  
  // Boss
  if (name.includes("bakunawa")) {
    return "I am Bakunawa, the great serpent who devours the moon! The false god promised me eternal darkness if I guard these depths. Face me, and know despair!";
  }
  
  return "A fearsome creature of the submerged barangays blocks your path!";
}

/**
 * Get complete dialogue set for an Act 2 enemy
 */
export function getCompleteDialogue(enemyName: string): EnemyDialogue {
  const name = enemyName.toLowerCase();
  
  // Sirena Illusionist
  if (name.includes("sirena")) {
    return {
      introduction: "My illusions have drawn many to the depths. Will you resist my enchantments, or join the drowned?",
      defeat: "Your will... is stronger than my songs... Perhaps there is hope for the surface world after all...",
      spare: "You spare me? Such mercy is rare in these dark times. I will remember your kindness, traveler. May the tides guide you safely.",
      slay: "The illusions... fade... My voice... silenced forever... The depths... claim me...",
    };
  }
  
  // Siyokoy Raider
  if (name.includes("siyokoy")) {
    return {
      introduction: "Surface dweller! The submerged barangays are no place for your kind. Turn back or face the wrath of the deep!",
      defeat: "You fight... with the strength of the ocean itself... I yield to your power...",
      spare: "You show mercy to a raider? Perhaps you understand that we only defend what was taken from us. Go in peace.",
      slay: "The depths... call me home... My raid... ends here...",
    };
  }
  
  // Santelmo Flicker
  if (name.includes("santelmo")) {
    return {
      introduction: "I am the flame that dances on water, the light that leads sailors astray. Will you follow my flicker to salvation or doom?",
      defeat: "My flames... extinguished... You have found your own path through the darkness...",
      spare: "You let my light continue to burn? Not all who see me are lost, then. May my flame guide you true.",
      slay: "The light... fades... Darkness... consumes all...",
    };
  }
  
  // Berberoka Lurker
  if (name.includes("berberoka")) {
    return {
      introduction: "The river hungers, and I am its mouth. Many have been swallowed whole—will you be next?",
      defeat: "I cannot... swallow you... The hunger... subsides...",
      spare: "You spare the river's hunger? Perhaps the waters need not consume all who enter. I will remember this.",
      slay: "The river... takes me back... My hunger... ends...",
    };
  }
  
  // Magindara Swarm
  if (name.includes("magindara")) {
    return {
      introduction: "Our voices once blessed fishermen with bountiful catches. Now we sing only songs of sorrow and drowning!",
      defeat: "Our song... is silenced... But perhaps... a new melody can be born...",
      spare: "You spare our voices? Then let us sing a different song—one of hope, not sorrow. Thank you, kind traveler.",
      slay: "Our voices... fade into the depths... The song... ends forever...",
    };
  }
  
  // Kataw
  if (name.includes("kataw")) {
    return {
      introduction: "I guard these waters as my ancestors did before me. The false god's corruption has not claimed me yet, but I will defend my domain!",
      defeat: "You have proven yourself worthy... My ancestors would honor your strength...",
      spare: "You respect the guardian's duty? Then pass, traveler. May the ocean's blessing be upon you.",
      slay: "The guardian... falls... Who will protect... these waters now...",
    };
  }
  
  // Berbalang
  if (name.includes("berbalang")) {
    return {
      introduction: "My body splits to hunt in the night! The upper half seeks blood while the lower waits. Which will you face?",
      defeat: "Both halves... defeated... I am whole again... in defeat...",
      spare: "You spare both halves of me? Such mercy reunites what was split. I am grateful, traveler.",
      slay: "Split... forever... Never whole... again...",
    };
  }
  
  // Sunken Bangkilan
  if (name.includes("bangkilan")) {
    return {
      introduction: "We were a thriving village until the waters rose and claimed us all. Now we are cursed spirits, seeking vengeance on the living!",
      defeat: "Our vengeance... is hollow... We remember now... what we once were...",
      spare: "You show mercy to cursed spirits? Perhaps we can find peace instead of vengeance. Thank you for reminding us of our humanity.",
      slay: "The village... sinks deeper... Our curse... eternal...",
    };
  }
  
  // Apoy-Tubig Fury
  if (name.includes("apoy-tubig") || name.includes("fury")) {
    return {
      introduction: "Fire and water—elements that should never meet—rage within me! I am the chaos of opposing forces, and I will tear you apart!",
      defeat: "The elements... find balance... The fury... subsides...",
      spare: "You bring harmony to chaos? Perhaps fire and water can coexist after all. I am... at peace.",
      slay: "Fire... extinguished... Water... evaporated... Nothing... remains...",
    };
  }
  
  // Bakunawa (Boss)
  if (name.includes("bakunawa")) {
    return {
      introduction: "I am Bakunawa, the great serpent who devours the moon! The false god promised me eternal darkness if I guard these depths. Face me, and know despair!",
      defeat: "The moon... slips from my grasp... You have freed me from the false god's promise... I can rest now...",
      spare: "You spare the moon-eater? Such mercy breaks the curse that bound me. I will no longer serve the false god. Go, and restore the true Bathala!",
      slay: "The serpent... falls... The moon... is safe... But darkness... still comes...",
    };
  }
  
  // Default dialogue
  return {
    introduction: "A creature of the submerged barangays blocks your path!",
    defeat: "You have bested me in combat...",
    spare: "Your mercy is noted, traveler.",
    slay: "I fall... defeated...",
  };
}
