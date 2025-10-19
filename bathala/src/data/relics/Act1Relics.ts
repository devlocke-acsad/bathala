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
    description: "Forged from the sacred linga stones of the mountain spirits. Start each combat with 5 Block that cannot be broken by non-attack damage.",
    emoji: "🛡️"
  },
  {
    id: "swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "A blessed talisman that captures the essence of Tikbalang's speed. Start each combat with 1 additional discard charge.",
    emoji: "💨"
  },
  {
    id: "ember_fetish",
    name: "Ember Fetish",
    description: "Carved from the heart of a banana tree at midnight and blessed by Apolaki's flame. At the start of your turn, if you have no Block, gain 3 Strength.",
    emoji: "🔥"
  },
  {
    id: "umalagad_spirit",
    name: "Umalagad's Spirit",
    description: "The protective essence of a sea serpent that guides travelers. Gain 1 temporary Dexterity at the start of each combat.",
    emoji: "🐍"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "A sacred amulet blessed by the ancient shamans. Your hand is always considered one tier higher when evaluating poker hands.",
    emoji: "📿"
  },
  {
    id: "ancestral_blade",
    name: "Ancestral Blade",
    description: "A kampilan blessed by the spirits of your ancestors. Each time you play a Flush, gain 2 temporary Strength.",
    emoji: "⚔️"
  },
  {
    id: "tidal_amulet",
    name: "Tidal Amulet",
    description: "An enchanted piece of coral that pulses with the rhythm of the sea. At the end of your turn, heal 2 HP for each card in your hand.",
    emoji: "🌊"
  },
  {
    id: "sarimanok_feather",
    name: "Sarimanok Feather",
    description: "A radiant feather from the mythical bird that brings prosperity. Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🦚"
  }
];

// Boss relics (tied to boss encounters)
export const bossRelics: Relic[] = [
  {
    id: "echo_ancestors",
    name: "Echo of the Ancestors",
    description: "The whispered wisdom of your forebears that unlocks hidden potential. Enables Five of a Kind poker hands.",
    emoji: "🌟"
  },
  {
    id: "diwatas_crown",
    name: "Diwata's Crown",
    description: "A crown blessed by the benevolent nature spirits. Start each combat with 10 Block and gain 1 temporary Dexterity.",
    emoji: "👑"
  },
  {
    id: "bakunawa_scale",
    name: "Bakunawa Scale",
    description: "A scale from the great serpent that devours the moon. Reduces all incoming damage by 1 and gain 5 Max HP.",
    emoji: "🌙"
  }
];

// Treasure/event relics
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
    description: "The eternal heart of an earth guardian. Gain 10 Max HP. At the start of combat, gain 2 Block.",
    emoji: "❤️"
  },
  {
    id: "tigmamanukan_eye",
    name: "Tigmamanukan's Eye",
    description: "The all-seeing eye of the prophetic bird. Draw 1 additional card at the start of each combat.",
    emoji: "👁️"
  }
];

// Shop relics (available for purchase)
export const shopRelics: Relic[] = [
  {
    id: "merchants_scale",
    name: "Merchant's Scale",
    description: "A balance blessed by Lakambini to ensure fair trade. All shop items are 20% cheaper.",
    emoji: "⚖️"
  },
  {
    id: "bargain_talisman",
    name: "Bargain Talisman",
    description: "A gemstone that negotiates with shopkeepers on your behalf. The first shop item you buy each act is free.",
    emoji: "💎"
  }
];

// Additional relics based on Filipino mythology from GDD
export const mythologicalRelics: Relic[] = [
  {
    id: "tikbalangs_hoof",
    name: "Tikbalang's Hoof",
    description: "+10% dodge. Inspiration: Trickery (Ramos, 1990)",
    emoji: "🐴"
  },
  {
    id: "balete_root",
    name: "Balete Root",
    description: "+2 block per Lupa card. Inspiration: Portals (Samar, 2019)",
    emoji: "🌳"
  },
  {
    id: "sigbin_heart",
    name: "Sigbin Heart",
    description: "+5 damage on burst. Inspiration: Amulets (Eugenio, 2001)",
    emoji: "🐐"
  },
  {
    id: "duwende_charm",
    name: "Duwende Charm",
    description: "+10% avoid Weak. Inspiration: Fortune (Aswang Project)",
    emoji: "🧚"
  },
  {
    id: "tiyanak_tear",
    name: "Tiyanak Tear",
    description: "Ignore 1 Fear. Inspiration: Wails (Ramos, 1990)",
    emoji: "💧"
  },
  {
    id: "amomongo_claw",
    name: "Amomongo Claw",
    description: "+3 bleed damage. Inspiration: Nails (Samar, 2019)",
    emoji: "🪲"
  },
  {
    id: "bungisngis_grin",
    name: "Bungisngis Grin",
    description: "+5 damage on debuff. Inspiration: Laughter (Jocano, 1969)",
    emoji: "👹"
  },
  {
    id: "kapres_cigar",
    name: "Kapre's Cigar",
    description: "Summons minion once per combat. Inspiration: Smoke (Ramos, 1990)",
    emoji: "🚬"
  },
  {
    id: "wind_veil",
    name: "Wind Veil",
    description: "+1 draw on Air cards. Inspiration: Invisibility (Samar, 2019)",
    emoji: "💨"
  },
  {
    id: "mangangaway_wand",
    name: "Mangangaway Wand",
    description: "Ignore 1 curse. Inspiration: Hexes (Eugenio, 2001)",
    emoji: "🪄"
  }
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
    'earthwardens_plate',      // +5 block
    'swift_wind_agimat',       // +1 discard charge
    'umalagad_spirit',         // +1 dexterity
    'diwatas_crown',           // +10 block, +1 dexterity
    'stone_golem_heart',        // +10 max HP, +2 block
    'bakunawa_scale',          // +5 max HP, damage reduction
    'tigmamanukan_eye'         // +1 card draw
  ],
  
  // Start of turn effects
  START_OF_TURN: [
    'ember_fetish'             // +3 strength if no block
  ],
  
  // End of turn effects
  END_OF_TURN: [
    'tidal_amulet'             // heal 2 HP per card in hand
  ],
  
  // Hand evaluation effects
  HAND_EVALUATION: [
    'babaylans_talisman',      // hand tier +1
    'echo_ancestors'           // enables five of a kind
  ],
  
  // After hand played effects
  AFTER_HAND_PLAYED: [
    'ancestral_blade',         // +2 strength on flush
    'sarimanok_feather',       // +1 ginto on straight+
    'lucky_charm',             // +1 ginto on straight+
    'wind_veil'                // +1 draw per hangin card
  ],
  
  // Passive combat effects
  PASSIVE_COMBAT: [
    'tikbalangs_hoof',         // +10% dodge
    'balete_root',             // +2 block per lupa card
    'sigbin_heart',            // +5 damage when low health
    'duwende_charm',           // +10% avoid weak
    'tiyanak_tear',            // ignore 1 fear
    'amomongo_claw',           // +3 bleed damage
    'bungisngis_grin',         // +5 damage on debuff
    'mangangaway_wand',        // ignore 1 curse
    'kapres_cigar'             // summon minion once per combat
  ],
  
  // Shop effects
  SHOP_EFFECTS: [
    'merchants_scale',         // 20% cheaper items
    'bargain_talisman'         // first item free per act
  ],
  
  // Permanent effects (applied when acquired)
  PERMANENT_EFFECTS: [
    'stone_golem_heart',       // +10 max HP
    'bakunawa_scale',          // +5 max HP
    'tigmamanukan_eye'         // passive card draw
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
