import { Enemy } from "../../core/types/CombatTypes";

/**
 * Act 3 Enemies - The Skyward Citadel
 * Based on Filipino mythology creatures with celestial/divine themes
 * 
 * LORE SOURCES:
 * - Tigmamanukan: Celestial bird that lives at the world's edge
 * - Diwata: Nature spirits and deities, guardians of sacred places
 * - Sarimanok: Legendary bird, symbol of good fortune
 * - Bulalakaw: Meteor/shooting star spirits
 * - Minokawa: Giant bird that causes eclipses by swallowing the moon
 * - Alan: Winged humanoid spirits that live in forests
 * - Ekek: Bird-like creature that hunts at night
 * - Ribung Linti: Lightning/thunder spirits
 * - Apolaki: God of the sun and war
 * - Bathala: Supreme deity (False Bathala is the corrupted impostor)
 * 
 * BALANCE NOTES:
 * - Health scaled according to Act 3 specifications (8× for common, 6× for elite/boss)
 * - Damage multiplied by 3× to maintain challenge
 * - Attack patterns simplified to 2-4 actions for common, 3-5 for elite, 5-6 for boss
 * - Elemental focus: Multi-element combinations (all four elements)
 */

// ============================================================================
// COMMON ENEMIES (7 total)
// ============================================================================

/**
 * Tigmamanukan Watcher
 * Lore: Celestial bird that lives at the edge of the world, watches over creation
 * Source: Filipino mythology - Tigmamanukan (bird at world's edge)
 */
export const TIGMAMANUKAN_WATCHER: Omit<Enemy, "id"> = {
  name: "Tigmamanukan Watcher",
  maxHealth: 208,        // 26 × 8 = 208
  currentHealth: 208,
  block: 0,
  statusEffects: [],
  intent: {
    type: "buff",
    value: 2,
    description: "Strengthens then double attacks",
    icon: "💪",
  },
  damage: 24,            // 8 × 3 = 24
  attackPattern: ["strengthen", "attack", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Air creature: weak to Earth
    resistance: "air",     // Air creature: resists Air
  },
};

/**
 * Diwata Sentinel
 * Lore: Divine nature spirits corrupted to guard the false god's citadel
 * Source: Filipino mythology - Diwata (nature deities/spirits)
 */
export const DIWATA_SENTINEL: Omit<Enemy, "id"> = {
  name: "Diwata Sentinel",
  maxHealth: 304,        // 38 × 8 = 304
  currentHealth: 304,
  block: 0,
  statusEffects: [],
  intent: {
    type: "defend",
    value: 10,
    description: "Defends, attacks, defends",
    icon: "⛨",
  },
  damage: 27,            // 9 × 3 = 27
  attackPattern: ["defend", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Nature spirit: weak to Fire
    resistance: "water",   // Nature spirit: resists Water
  },
};

/**
 * Sarimanok Keeper
 * Lore: Legendary bird of good fortune, now twisted to serve the false god
 * Source: Filipino mythology - Sarimanok (legendary bird)
 */
export const SARIMANOK_KEEPER: Omit<Enemy, "id"> = {
  name: "Sarimanok Keeper",
  maxHealth: 240,        // 30 × 8 = 240
  currentHealth: 240,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Nullifies, strengthens, attacks",
    icon: "🚫",
  },
  damage: 24,            // 8 × 3 = 24
  attackPattern: ["nullify", "strengthen", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire creature: weak to Water
    resistance: "earth",   // Fire creature: resists Earth
  },
};

/**
 * Bulalakaw Flamewings
 * Lore: Meteor spirits that streak across the sky, burning with celestial fire
 * Source: Filipino mythology - Bulalakaw (meteor/shooting star spirits)
 */
export const BULALAKAW_FLAMEWINGS: Omit<Enemy, "id"> = {
  name: "Bulalakaw Flamewings",
  maxHealth: 264,        // 33 × 8 = 264
  currentHealth: 264,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Burns, attacks, defends",
    icon: "☠️",
  },
  damage: 27,            // 9 × 3 = 27
  attackPattern: ["poison", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire creature: weak to Water
    resistance: "earth",   // Fire creature: resists Earth
  },
};

/**
 * Minokawa Harbinger
 * Lore: Giant bird that swallows the moon, herald of the false god
 * Source: Filipino mythology - Minokawa (moon-swallowing bird)
 */
export const MINOKAWA_HARBINGER: Omit<Enemy, "id"> = {
  name: "Minokawa Harbinger",
  maxHealth: 224,        // 28 × 8 = 224
  currentHealth: 224,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Weakens, attacks, defends",
    icon: "⚠️",
  },
  damage: 24,            // 8 × 3 = 24
  attackPattern: ["weaken", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Dark creature: weak to Fire
    resistance: "air",     // Dark creature: resists Air
  },
};

/**
 * Alan
 * Lore: Winged humanoid spirits, servants of the celestial realm
 * Source: Filipino mythology - Alan (winged forest spirits)
 */
export const ALAN: Omit<Enemy, "id"> = {
  name: "Alan",
  maxHealth: 192,        // 24 × 8 = 192
  currentHealth: 192,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 27,           // 9 × 3 = 27
    description: "Double attacks then strengthens",
    icon: "†",
  },
  damage: 27,
  attackPattern: ["attack", "attack", "strengthen"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Air creature: weak to Earth
    resistance: "air",     // Air creature: resists Air
  },
};

/**
 * Ekek
 * Lore: Bird-like creature that hunts at night, servant of darkness
 * Source: Filipino mythology - Ekek (night-hunting bird creature)
 */
export const EKEK: Omit<Enemy, "id"> = {
  name: "Ekek",
  maxHealth: 176,        // 22 × 8 = 176
  currentHealth: 176,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 1,
    description: "Attacks, weakens, attacks",
    icon: "†",
  },
  damage: 21,            // 7 × 3 = 21
  attackPattern: ["attack", "weaken", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "fire",      // Dark creature: weak to Fire
    resistance: "air",     // Dark creature: resists Air
  },
};

// ============================================================================
// ELITE ENEMIES (2 total)
// ============================================================================

/**
 * Ribung Linti Duo
 * Lore: Twin lightning spirits that strike in perfect synchronization
 * Source: Filipino mythology - Ribung Linti (lightning/thunder spirits)
 * Note: Spawns as 2 units with 45 HP each (total 90 HP equivalent)
 */
export const RIBUNG_LINTI_DUO: Omit<Enemy, "id"> = {
  name: "Ribung Linti Duo",
  maxHealth: 270,        // 45 × 6 = 270 (per unit)
  currentHealth: 270,
  block: 0,
  statusEffects: [],
  intent: {
    type: "attack",
    value: 30,           // 10 × 3 = 30
    description: "Attacks, strengthens, attacks, defends",
    icon: "†",
  },
  damage: 30,
  attackPattern: ["attack", "strengthen", "attack", "defend"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "earth",     // Air/lightning creature: weak to Earth
    resistance: "air",     // Air/lightning creature: resists Air
  },
};

/**
 * Apolaki Godling
 * Lore: Lesser manifestation of the sun god, corrupted by the false Bathala
 * Source: Filipino mythology - Apolaki (god of sun and war)
 */
export const APOLAKI_GODLING: Omit<Enemy, "id"> = {
  name: "Apolaki Godling",
  maxHealth: 510,        // 85 × 6 = 510
  currentHealth: 510,
  block: 0,
  statusEffects: [],
  intent: {
    type: "buff",
    value: 2,
    description: "Strengthens, attacks, nullifies, attacks, burns",
    icon: "💪",
  },
  damage: 36,            // 12 × 3 = 36
  attackPattern: ["strengthen", "attack", "nullify", "attack", "poison"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: "water",     // Fire/sun creature: weak to Water
    resistance: "earth",   // Fire/sun creature: resists Earth
  },
};

// ============================================================================
// BOSS ENEMY
// ============================================================================

/**
 * False Bathala
 * Lore: The corrupted impostor claiming to be the supreme deity
 * Source: Filipino mythology - Bathala (supreme deity) - this is the false version
 */
export const FALSE_BATHALA: Omit<Enemy, "id"> = {
  name: "False Bathala",
  maxHealth: 1200,       // 200 × 6 = 1200
  currentHealth: 1200,
  block: 0,
  statusEffects: [],
  intent: {
    type: "debuff",
    value: 2,
    description: "Nullifies, weakens, strengthens, attacks, burns, attacks",
    icon: "🚫",
  },
  damage: 48,            // 16 × 3 = 48
  attackPattern: ["nullify", "weaken", "strengthen", "attack", "poison", "attack"],
  currentPatternIndex: 0,
  elementalAffinity: {
    weakness: null,        // Divine being: no weakness
    resistance: null,      // Divine being: no resistance (balanced)
  },
};

// ============================================================================
// ENEMY POOLS
// ============================================================================

export const ACT3_COMMON_ENEMIES = [
  TIGMAMANUKAN_WATCHER,
  DIWATA_SENTINEL,
  SARIMANOK_KEEPER,
  BULALAKAW_FLAMEWINGS,
  MINOKAWA_HARBINGER,
  ALAN,
  EKEK,
];

export const ACT3_ELITE_ENEMIES = [
  RIBUNG_LINTI_DUO,
  APOLAKI_GODLING,
];

export const ACT3_BOSS_ENEMIES = [FALSE_BATHALA];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random common enemy for Act 3
 */
export function getRandomCommonEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT3_COMMON_ENEMIES.length);
  return { ...ACT3_COMMON_ENEMIES[randomIndex] };
}

/**
 * Get a random elite enemy for Act 3
 */
export function getRandomEliteEnemy(): Omit<Enemy, "id"> {
  const randomIndex = Math.floor(Math.random() * ACT3_ELITE_ENEMIES.length);
  return { ...ACT3_ELITE_ENEMIES[randomIndex] };
}

/**
 * Get the boss enemy for Act 3
 */
export function getBossEnemy(): Omit<Enemy, "id"> {
  return { ...FALSE_BATHALA };
}

/**
 * Get a specific enemy by name
 */
export function getEnemyByName(name: string): Omit<Enemy, "id"> | null {
  const allEnemies = [
    ...ACT3_COMMON_ENEMIES,
    ...ACT3_ELITE_ENEMIES,
    ...ACT3_BOSS_ENEMIES,
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
 * Get short combat intro dialogue for Act 3 enemies
 */
export function getEnemyDialogue(enemyName: string): string {
  const name = enemyName.toLowerCase();
  
  // Common Enemies
  if (name.includes("tigmamanukan")) return "The watcher at world's edge descends!";
  if (name.includes("diwata")) return "Divine sentinel bars your path!";
  if (name.includes("sarimanok")) return "Fortune's keeper turns against you!";
  if (name.includes("bulalakaw")) return "Meteor wings burn the sky!";
  if (name.includes("minokawa")) return "Moon-swallower heralds darkness!";
  if (name.includes("alan")) return "Winged spirit strikes from above!";
  if (name.includes("ekek")) return "Night hunter swoops down!";
  
  // Elite Enemies
  if (name.includes("ribung linti") || name.includes("linti")) return "Twin lightning strikes as one!";
  if (name.includes("apolaki")) return "The sun god's wrath manifests!";
  
  // Boss
  if (name.includes("false bathala") || name.includes("bathala")) return "The false supreme deity reveals itself!";
  
  return "A celestial guardian of the skyward citadel appears!";
}

/**
 * Get extended battle start dialogue for Act 3 enemies
 */
export function getBattleStartDialogue(enemyName: string): string {
  const name = enemyName.toLowerCase();
  
  // Common Enemies
  if (name.includes("tigmamanukan")) {
    return "I watch from the edge of creation, where sky meets void. You dare ascend to the celestial realm? I will cast you back to the earth!";
  }
  if (name.includes("diwata")) {
    return "Once I was a guardian of sacred groves and pure waters. Now I serve the false god's citadel. Face me, and know that even divine spirits can fall!";
  }
  if (name.includes("sarimanok")) {
    return "I am the legendary bird of fortune, but my blessings have been twisted into curses. The false god has corrupted my purpose!";
  }
  if (name.includes("bulalakaw")) {
    return "I streak across the heavens like a falling star, burning with celestial fire! My flames will reduce you to ash!";
  }
  if (name.includes("minokawa")) {
    return "I am the harbinger of eclipses, the bird that swallows the moon! The false god commands me to devour all who oppose him!";
  }
  if (name.includes("alan")) {
    return "My wings once carried me through peaceful forests. Now I soar through the corrupted skies of the citadel, striking down intruders!";
  }
  if (name.includes("ekek")) {
    return "The night is my domain, and I hunt those who dare challenge the false god's reign. Your blood will feed the darkness!";
  }
  
  // Elite Enemies
  if (name.includes("ribung linti") || name.includes("linti")) {
    return "We are twin spirits of lightning and thunder! Our strikes are perfectly synchronized—you cannot dodge both! The storm's fury will consume you!";
  }
  if (name.includes("apolaki")) {
    return "I am a fragment of Apolaki, god of sun and war! The false Bathala has corrupted my essence, but my power remains absolute. Burn in the sun's wrath!";
  }
  
  // Boss
  if (name.includes("false bathala") || name.includes("bathala")) {
    return "So, you have finally reached me. I am Bathala—or so the world believes. The true supreme deity is long gone, and I have taken his throne! You cannot defeat a god!";
  }
  
  return "A powerful celestial guardian stands before you, ready to defend the skyward citadel!";
}

/**
 * Get complete dialogue set for an Act 3 enemy
 */
export function getCompleteDialogue(enemyName: string): EnemyDialogue {
  const name = enemyName.toLowerCase();
  
  // Tigmamanukan Watcher
  if (name.includes("tigmamanukan")) {
    return {
      introduction: "I watch from the edge of creation, where sky meets void. You dare ascend to the celestial realm? I will cast you back to the earth!",
      defeat: "You have... proven yourself worthy... Perhaps you can restore what was lost... at the world's edge...",
      spare: "You spare the watcher? Such mercy is rare in these heights. I will remember you when the world is remade.",
      slay: "The watcher... falls... Who will guard... the edge now...",
    };
  }
  
  // Diwata Sentinel
  if (name.includes("diwata")) {
    return {
      introduction: "Once I was a guardian of sacred groves and pure waters. Now I serve the false god's citadel. Face me, and know that even divine spirits can fall!",
      defeat: "The corruption... lifts... I remember now... my true purpose... Thank you for freeing me...",
      spare: "You show mercy to a corrupted spirit? Your kindness breaks the false god's hold on me. I am free!",
      slay: "The sacred groves... call me home... I return... to the earth...",
    };
  }
  
  // Sarimanok Keeper
  if (name.includes("sarimanok")) {
    return {
      introduction: "I am the legendary bird of fortune, but my blessings have been twisted into curses. The false god has corrupted my purpose!",
      defeat: "My fortune... returns... The curse is broken... I can bless again...",
      spare: "You spare the bird of fortune? Then let my blessing be upon you—may luck guide your path to victory!",
      slay: "Fortune... fades... No more blessings... for anyone...",
    };
  }
  
  // Bulalakaw Flamewings
  if (name.includes("bulalakaw")) {
    return {
      introduction: "I streak across the heavens like a falling star, burning with celestial fire! My flames will reduce you to ash!",
      defeat: "My flames... extinguished... The meteor... falls to earth...",
      spare: "You spare the falling star? Then may my light guide you through the darkness ahead!",
      slay: "The star... burns out... Darkness... remains...",
    };
  }
  
  // Minokawa Harbinger
  if (name.includes("minokawa")) {
    return {
      introduction: "I am the harbinger of eclipses, the bird that swallows the moon! The false god commands me to devour all who oppose him!",
      defeat: "The moon... slips free... I can no longer... swallow the light...",
      spare: "You spare the moon-swallower? Then I will no longer bring darkness. The moon is safe from me.",
      slay: "The harbinger... falls... But the eclipse... still comes...",
    };
  }
  
  // Alan
  if (name.includes("alan")) {
    return {
      introduction: "My wings once carried me through peaceful forests. Now I soar through the corrupted skies of the citadel, striking down intruders!",
      defeat: "My wings... are tired... I long for... the peaceful forests again...",
      spare: "You spare me? Then perhaps I can return to the forests below. Thank you for this mercy.",
      slay: "My wings... are clipped... I fall... from the sky...",
    };
  }
  
  // Ekek
  if (name.includes("ekek")) {
    return {
      introduction: "The night is my domain, and I hunt those who dare challenge the false god's reign. Your blood will feed the darkness!",
      defeat: "The night... rejects me... I am no longer... the hunter...",
      spare: "You spare the night hunter? Then I will hunt no more. The darkness need not consume all.",
      slay: "The hunter... becomes the hunted... Night... claims me...",
    };
  }
  
  // Ribung Linti Duo
  if (name.includes("ribung linti") || name.includes("linti")) {
    return {
      introduction: "We are twin spirits of lightning and thunder! Our strikes are perfectly synchronized—you cannot dodge both! The storm's fury will consume you!",
      defeat: "The storm... subsides... Our lightning... is grounded... We are... defeated...",
      spare: "You spare both of us? Such mercy calms the storm. We will strike no more in the false god's name.",
      slay: "The lightning... fades... Thunder... silenced... The storm... dies...",
    };
  }
  
  // Apolaki Godling
  if (name.includes("apolaki")) {
    return {
      introduction: "I am a fragment of Apolaki, god of sun and war! The false Bathala has corrupted my essence, but my power remains absolute. Burn in the sun's wrath!",
      defeat: "The sun... sets... My corruption... burns away... I am... purified...",
      spare: "You spare a corrupted god? Your mercy restores my true essence. I will aid you against the false Bathala!",
      slay: "The sun... is eclipsed... Apolaki's light... extinguished... Forever...",
    };
  }
  
  // False Bathala (Boss)
  if (name.includes("false bathala") || name.includes("bathala")) {
    return {
      introduction: "So, you have finally reached me. I am Bathala—or so the world believes. The true supreme deity is long gone, and I have taken his throne! You cannot defeat a god!",
      defeat: "Impossible... I am... a god... How can a mortal... defeat me... The throne... crumbles... The true Bathala... may yet return...",
      spare: "You... spare me? Even after all I have done? Such mercy... is beyond divine... Perhaps you are worthy... of the true Bathala's blessing... I will leave this realm... and never return...",
      slay: "The false god... falls... But beware... The void I leave... may birth something worse... The true Bathala... must return... to fill it...",
    };
  }
  
  // Default dialogue
  return {
    introduction: "A celestial guardian of the skyward citadel blocks your path!",
    defeat: "You have bested me in combat...",
    spare: "Your mercy is noted, traveler.",
    slay: "I fall... defeated...",
  };
}
