import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 1 Relics for Bathala - MAIN SOURCE OF TRUTH
 * Based on Filipino mythology - Chapter 1: The Corrupted Ancestral Forests (Lupa/Hangin Focus)
 * This file contains ALL relic definitions and is the single source of truth
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "earthwardens_plate",
    name: "Earthwarden's Plate",
    description: "Forged from the sacred linga stones of the mountain spirits. Start each combat with 5 Block and gain +1 Block at the start of each turn.",
    emoji: "🛡️"
  },
  {
    id: "swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "A blessed talisman that captures the essence of Tikbalang's speed. Start each combat with 1 additional discard charge (4 total per turn).",
    emoji: "💨"
  },
  {
    id: "ember_fetish",
    name: "Ember Fetish",
    description: "Carved from the heart of a banana tree at midnight and blessed by Apolaki's flame. At the start of your turn, if you have no Block, gain 2 Strength. If you have Block, gain 1 Strength. [Interacts with Strength status effect]",
    emoji: "🔥"
  },
  {
    id: "umalagad_spirit",
    name: "Umalagad's Spirit",
    description: "The protective essence of a sea serpent that guides travelers. All Defend actions gain +4 Block. Gain +2 Block whenever you play a card.",
    emoji: "🐍"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "A sacred amulet blessed by the ancient shamans. Your hand is always considered one tier higher when evaluating poker hands (Pair → Two Pair, Flush → Full House).",
    emoji: "📿"
  },
  {
    id: "ancestral_blade",
    name: "Ancestral Blade",
    description: "A kampilan blessed by the spirits of your ancestors. Each time you play a Flush, gain 2 Strength for rest of combat.",
    emoji: "⚔️"
  },
  {
    id: "tidal_amulet",
    name: "Tidal Amulet",
    description: "An enchanted piece of coral that pulses with the rhythm of the sea. At the end of your turn, heal 1 HP for each card remaining in your hand.",
    emoji: "🌊"
  },
  {
    id: "sarimanok_feather",
    name: "Sarimanok Feather",
    description: "A radiant feather from the mythical bird that brings prosperity. Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🦚"
  }
];

// Boss relics (tied to boss encounters) - ONLY WITH SPRITES
export const bossRelics: Relic[] = [
  {
    id: "diwatas_crown",
    name: "Diwata's Crown",
    description: "A crown blessed by the benevolent nature spirits. Start each combat with 5 Block. All Defend actions gain +3 Block. Enables Five of a Kind hand (5 cards of same value for +30 bonus).",
    emoji: "👑"
  }
  // Removed: echo_ancestors, bakunawa_scale (no sprites)
];

// Treasure/event relics - ONLY WITH SPRITES
export const treasureRelics: Relic[] = [
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "A mutya jewel that brings fortune to its bearer. Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🍀"
  },
  {
    id: "stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "The eternal heart of an earth guardian. Gain 8 Max HP. At the start of combat, gain 2 Block.",
    emoji: "❤️"
  }
  // Removed: tigmamanukan_eye, merchants_scale (no sprites)
];

// Shop relics (available for purchase) - REMOVED (no sprites)
export const shopRelics: Relic[] = [
  // Removed: bargain_talisman (no sprite)
];

// Additional relics based on Filipino mythology from GDD - ONLY WITH SPRITES
export const mythologicalRelics: Relic[] = [
  {
    id: "tikbalangs_hoof",
    name: "Tikbalang's Hoof",
    description: "10% chance to dodge enemy attacks. Based on the Tikbalang's supernatural trickery and ability to confuse travelers.",
    emoji: "🐴"
  },
  {
    id: "balete_root",
    name: "Balete Root",
    description: "Gain +2 Block for each Lupa (Earth) card in your played hand. The Balete tree is a sacred portal to the spirit realm.",
    emoji: "🌳"
  },
  {
    id: "sigbin_heart",
    name: "Sigbin Heart",
    description: "Attack actions deal +3 additional damage. The Sigbin's heart holds immense dark power.",
    emoji: "🐐"
  },
  {
    id: "duwende_charm",
    name: "Duwende Charm",
    description: "Defend actions gain +3 additional Block. Blessed by the fortune-bringing duwende spirits.",
    emoji: "🧚"
  },
  {
    id: "tiyanak_tear",
    name: "Tiyanak Tear",
    description: "At the start of your turn, gain +1 Strength (Attack damage). The crystallized tear of a corrupted infant spirit. [Interacts with Strength status effect]",
    emoji: "💧"
  },
  {
    id: "amomongo_claw",
    name: "Amomongo Claw",
    description: "Attack actions apply 1 Vulnerable to enemies. The razor-sharp claw of the ape-like creature. [Applies Vulnerable status effect]",
    emoji: "🪲"
  },
  {
    id: "bungisngis_grin",
    name: "Bungisngis Grin",
    description: "Attack actions deal +4 damage when enemy has any debuff (Weak, Vulnerable, Burn, etc.). The giant's mocking laughter empowers your strikes. [Synergizes with debuff status effects]",
    emoji: "👹"
  },
  {
    id: "kapres_cigar",
    name: "Kapre's Cigar",
    description: "Once per combat, your first Attack action deals double damage. The tree giant's cigar smoke empowers your strike.",
    emoji: "🚬"
  },
  {
    id: "mangangaway_wand",
    name: "Mangangaway Wand",
    description: "Special actions deal +5 damage. The sorcerer's wand amplifies your elemental power. [Enhances elemental Special actions]",
    emoji: "🪄"
  }
  // Removed: wind_veil (no sprite)
];

// All relics combined for easy access
export const allAct1Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics,
  ...shopRelics,
  ...mythologicalRelics
];

/**
 * RELIC REGISTRY - Single source of truth for all relic data
 * Use this for any relic lookups, effects, or management
 */
export const RELIC_REGISTRY = {
  // Relic categories
  COMMON: commonRelics,
  ELITE: eliteRelics,
  BOSS: bossRelics,
  TREASURE: treasureRelics,
  SHOP: shopRelics,
  MYTHOLOGICAL: mythologicalRelics,
  ALL: allAct1Relics,
  
  // Relic lookup by ID
  getById: (id: string): Relic | undefined => {
    return allAct1Relics.find(relic => relic.id === id);
  },
  
  // Get relics by category
  getByCategory: (category: 'common' | 'elite' | 'boss' | 'treasure' | 'shop' | 'mythological'): Relic[] => {
    switch (category) {
      case 'common': return commonRelics;
      case 'elite': return eliteRelics;
      case 'boss': return bossRelics;
      case 'treasure': return treasureRelics;
      case 'shop': return shopRelics;
      case 'mythological': return mythologicalRelics;
      default: return [];
    }
  },
  
  // Get shop-available relics (common + elite + some treasure)
  getShopRelics: (): Relic[] => {
    return [...commonRelics, ...eliteRelics, ...treasureRelics];
  },
  
  // Get boss-only relics
  getBossRelics: (): Relic[] => {
    return bossRelics;
  },
  
  // Get mythological relics
  getMythologicalRelics: (): Relic[] => {
    return mythologicalRelics;
  }
};

/**
 * RELIC EFFECTS REGISTRY - Maps relic IDs to their effect types
 * This makes it easy to find which relics have which effects
 */
export const RELIC_EFFECTS = {
  // Start of combat effects
  START_OF_COMBAT: [
    'earthwardens_plate',      // +12 Block at start
    'swift_wind_agimat',       // +2 discard charges, +1 card draw
    'umalagad_spirit',         // +8 Block on all Defend actions
    'diwatas_crown',           // +15 Block, +6 Block on all Defend actions
    'stone_golem_heart'        // +15 max HP, +3 Block
    // Removed: bakunawa_scale, tigmamanukan_eye (no sprites)
  ],
  
  // Start of turn effects
  START_OF_TURN: [
    'ember_fetish',            // +4 Attack if no block, +2 Attack if block
    'earthwardens_plate',      // +2 Block per turn
    'tiyanak_tear'             // +2 Strength (Attack damage) per turn
  ],
  
  // End of turn effects
  END_OF_TURN: [
    'tidal_amulet'             // heal 2 HP per card in hand
  ],
  
  // Hand evaluation effects
  HAND_EVALUATION: [
    'babaylans_talisman',     // hand tier +1
    'diwatas_crown'           // enables Five of a Kind
  ],
  
  // After hand played effects
  AFTER_HAND_PLAYED: [
    'ancestral_blade',         // +3 Attack on flush
    'sarimanok_feather',       // +2 ginto on straight+
    'lucky_charm',             // +2 ginto on straight+
    'umalagad_spirit'          // +3 Block per card played
    // Removed: wind_veil (no sprite)
  ],
  
  // Passive combat effects
  PASSIVE_COMBAT: [
    'tikbalangs_hoof',         // +15% dodge
    'balete_root',             // +3 block per lupa card
    'sigbin_heart',            // +5 damage on Attack
    'duwende_charm',           // +5 block on Defend
    'amomongo_claw',           // Apply 2 Vulnerable on Attack
    'bungisngis_grin',         // +8 damage on Attack when enemy has debuff
    'mangangaway_wand',        // +10 damage on Special
    'kapres_cigar'             // First Attack deals double damage (once per combat)
  ],
  
  // Shop effects - REMOVED (no sprites for these relics)
  SHOP_EFFECTS: [
    // Removed: merchants_scale, bargain_talisman (no sprites)
  ],
  
  // Permanent effects (applied when acquired)
  PERMANENT_EFFECTS: [
    'stone_golem_heart'       // +15 max HP
    // Removed: bakunawa_scale, tigmamanukan_eye (no sprites)
  ]
};

/**
 * Helper function to check if a relic has a specific effect type
 */
export function hasRelicEffect(relicId: string, effectType: keyof typeof RELIC_EFFECTS): boolean {
  return RELIC_EFFECTS[effectType].includes(relicId);
}

/**
 * Helper function to get all relics with a specific effect type
 */
export function getRelicsWithEffect(effectType: keyof typeof RELIC_EFFECTS): Relic[] {
  return RELIC_EFFECTS[effectType]
    .map(id => RELIC_REGISTRY.getById(id))
    .filter((relic): relic is Relic => relic !== undefined);
}

/**
 * Helper function to get relic by ID with type safety
 */
export function getRelicById(id: string): Relic {
  const relic = RELIC_REGISTRY.getById(id);
  if (!relic) {
    throw new Error(`Relic with ID "${id}" not found in registry`);
  }
  return relic;
}

/**
 * Helper function to get a random common relic
 * @returns A random relic from the common relic pool
 */
export function getRandomCommonRelic(): Relic {
  const index = Math.floor(Math.random() * commonRelics.length);
  return commonRelics[index];
}

/**
 * Helper function to get a random elite relic
 * @returns A random relic from the elite relic pool
 */
export function getRandomEliteRelic(): Relic {
  const index = Math.floor(Math.random() * eliteRelics.length);
  return eliteRelics[index];
}

/**
 * Helper function to get a random boss relic
 * @returns A random relic from the boss relic pool
 */
export function getRandomBossRelic(): Relic {
  const index = Math.floor(Math.random() * bossRelics.length);
  return bossRelics[index];
}

/**
 * Helper function to get a random treasure relic
 * @returns A random relic from the treasure relic pool
 */
export function getRandomTreasureRelic(): Relic {
  const index = Math.floor(Math.random() * treasureRelics.length);
  return treasureRelics[index];
}

/**
 * Helper function to get a random mythological relic
 * @returns A random relic from the mythological relic pool
 */
export function getRandomMythologicalRelic(): Relic {
  const index = Math.floor(Math.random() * mythologicalRelics.length);
  return mythologicalRelics[index];
}
