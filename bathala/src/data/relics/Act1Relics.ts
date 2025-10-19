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
    description: "Sacred linga stone armor forged by mountain anito. Channels Lupa's enduring strength. Start combat with 12 Block, gain +2 each turn.",
    emoji: "🛡️"
  },
  {
    id: "swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "Blessed talisman woven with Tikbalang mane hairs. Captures Hangin's swiftness. +2 discard charges, draw 1 extra card at start.",
    emoji: "💨"
  },
  {
    id: "ember_fetish",
    name: "Ember Fetish",
    description: "Banana tree heart carved at midnight, blessed by Apolaki's flame. Adapts to danger: +4 Attack when vulnerable, +2 when protected.",
    emoji: "🔥"
  },
  {
    id: "umalagad_spirit",
    name: "Umalagad's Spirit",
    description: "Ancient sea serpent's essence that guided lost sailors. Embodies Tubig's resilience. Defend actions +8 Block, +3 per card played.",
    emoji: "🐍"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "Sacred amulet of ancient shamans who bridged spirit realms. Channels ancestral wisdom. Hand always one tier higher (Pair → Two Pair).",
    emoji: "📿"
  },
  {
    id: "ancestral_blade",
    name: "Ancestral Blade",
    description: "Legendary kampilan blessed by warrior ancestors. Perfect elemental strikes awaken fury. Each Flush grants +3 Attack permanently.",
    emoji: "⚔️"
  },
  {
    id: "tidal_amulet",
    name: "Tidal Amulet",
    description: "Enchanted coral from sacred underwater grottos where Bathala wove seas. Channels Tubig's rhythm. Heal 3 HP per unplayed card.",
    emoji: "🌊"
  },
  {
    id: "sarimanok_feather",
    name: "Sarimanok Feather",
    description: "Radiant plumage from mythical Maranao bird of paradise. Rewards mastery with fortune. Straight or better grants 2 Ginto.",
    emoji: "🦚"
  }
];

// Boss relics (tied to boss encounters) - ONLY WITH SPRITES
export const bossRelics: Relic[] = [
  {
    id: "diwatas_crown",
    name: "Diwata's Crown",
    description: "A crown blessed by the benevolent nature spirits. Start each combat with 15 Block. All Defend actions gain +6 Block this turn.",
    emoji: "👑"
  }
  // Removed: echo_ancestors, bakunawa_scale (no sprites)
];

// Treasure/event relics - ONLY WITH SPRITES
export const treasureRelics: Relic[] = [
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "A mutya jewel that brings fortune to its bearer. Whenever you play a Straight or better, gain 2 Ginto.",
    emoji: "🍀"
  },
  {
    id: "stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "The eternal heart of an earth guardian. Gain 15 Max HP. At the start of combat, gain 3 Block.",
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
    description: "+15% chance to dodge enemy attacks. Based on the Tikbalang's supernatural trickery and ability to confuse travelers.",
    emoji: "🐴"
  },
  {
    id: "balete_root",
    name: "Balete Root",
    description: "Gain +3 Block for each Lupa (Earth) card in your played hand. The Balete tree is a sacred portal to the spirit realm.",
    emoji: "🌳"
  },
  {
    id: "sigbin_heart",
    name: "Sigbin Heart",
    description: "When you deal 40+ damage in a single attack, deal +8 additional damage. The Sigbin's heart holds immense dark power.",
    emoji: "🐐"
  },
  {
    id: "duwende_charm",
    name: "Duwende Charm",
    description: "+20% chance to resist Weak status (which reduces Attack damage by 50%). Blessed by the fortune-bringing duwende spirits.",
    emoji: "🧚"
  },
  {
    id: "tiyanak_tear",
    name: "Tiyanak Tear",
    description: "Immune to the first Fear status effect each combat. The crystallized tear of a corrupted infant spirit.",
    emoji: "💧"
  },
  {
    id: "amomongo_claw",
    name: "Amomongo Claw",
    description: "All Bleed effects deal +4 additional damage per turn. The razor-sharp claw of the ape-like creature.",
    emoji: "🪲"
  },
  {
    id: "bungisngis_grin",
    name: "Bungisngis Grin",
    description: "Deal +8 damage when attacking enemies with any debuff (Weak, Vulnerable, Burn, etc.). The giant's mocking laughter empowers your strikes.",
    emoji: "👹"
  },
  {
    id: "kapres_cigar",
    name: "Kapre's Cigar",
    description: "Once per combat, summon a smoke minion that deals 12 damage. The tree giant's cigar smoke takes physical form.",
    emoji: "🚬"
  },
  {
    id: "mangangaway_wand",
    name: "Mangangaway Wand",
    description: "Immune to the first Curse effect each combat. The sorcerer's wand shields you from dark hexes.",
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
    'earthwardens_plate'       // +2 Block per turn
  ],
  
  // End of turn effects
  END_OF_TURN: [
    'tidal_amulet'             // heal 2 HP per card in hand
  ],
  
  // Hand evaluation effects
  HAND_EVALUATION: [
    'babaylans_talisman'      // hand tier +1
    // Removed: echo_ancestors (no sprite)
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
    'sigbin_heart',            // +8 damage when 40+ damage
    'duwende_charm',           // +20% avoid weak
    'tiyanak_tear',            // ignore 1 fear
    'amomongo_claw',           // +4 bleed damage
    'bungisngis_grin',         // +8 damage on debuff
    'mangangaway_wand',        // ignore 1 curse
    'kapres_cigar'             // summon minion once per combat
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
