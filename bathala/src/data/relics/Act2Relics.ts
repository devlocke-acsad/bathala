import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 2 Relics for Bathala
 * Chapter 2: The Submerged Barangays (Tubig/Apoy Focus)
 * Based on Filipino mythology - water and fire themed creatures
 * 
 * Lore Sources:
 * - Sirena: Mermaid-like creatures from Filipino folklore
 * - Siyokoy: Male counterpart to Sirena, sea creatures
 * - Santelmo: St. Elmo's fire, ghostly flames
 * - Berberoka: Water creature that swallows people
 * - Magindara: Siren-like creatures with enchanting voices
 * - Kataw: Sea people, guardians of the ocean
 * - Berbalang: Vampire-like creature that can separate its body
 * - Bangkilan: Cursed spirits from underwater realms
 * - Bakunawa: Dragon that causes eclipses by eating the moon
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "sirenas_scale",
    name: "Sirena's Scale",
    description: "A shimmering scale from the enchanting Sirena. Heal 2 HP whenever you play a Tubig (Water) card. The healing waters of the deep restore your vitality.",
    emoji: "🐚"
  },
  {
    id: "siyokoy_fin",
    name: "Siyokoy Fin",
    description: "The webbed fin of a fierce Siyokoy warrior. Gain 3 Block whenever you deal splash damage to multiple enemies. The ocean's fury protects you.",
    emoji: "🦈"
  },
  {
    id: "santelmo_ember",
    name: "Santelmo Ember",
    description: "A ghostly flame that never extinguishes. Burn damage deals +2 additional damage per stack. St. Elmo's fire intensifies your flames.",
    emoji: "👻"
  },
  {
    id: "berberoka_tide",
    name: "Berberoka Tide",
    description: "Blessed by the water-swallowing Berberoka. Gain 10 Block whenever you play a hand containing only Tubig (Water) cards. The tide shields you from harm.",
    emoji: "🌊"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "magindara_song",
    name: "Magindara Song",
    description: "The enchanting melody of the Magindara sirens. Draw 1 additional card whenever you heal HP during combat. Their song guides fortune to you.",
    emoji: "🎵"
  },
  {
    id: "kataw_crown",
    name: "Kataw Crown",
    description: "The coral crown of the Kataw sea guardians. Deal +5 damage when facing enemies with minions or summons. The ocean's rulers empower your strikes against groups.",
    emoji: "👑"
  },
  {
    id: "berbalang_spirit",
    name: "Berbalang Spirit",
    description: "The separated essence of a Berbalang vampire. Ignore the first Weak debuff applied to you each combat. Your spirit cannot be easily diminished.",
    emoji: "🦇"
  },
  {
    id: "bangkilan_veil",
    name: "Bangkilan Veil",
    description: "A cursed veil from the sunken spirits. Gain 10% dodge chance when you have any curse or debuff active. Misfortune becomes your shield.",
    emoji: "🌫️"
  }
];

// Boss relic (tied to Bakunawa boss)
export const bossRelics: Relic[] = [
  {
    id: "bakunawa_fang",
    name: "Bakunawa Fang",
    description: "The legendary fang of the moon-eating dragon. Deal +5 damage whenever you activate a relic effect during combat. The dragon's power amplifies your artifacts.",
    emoji: "🐉"
  }
];

// Treasure/event relic
export const treasureRelics: Relic[] = [
  {
    id: "elemental_core",
    name: "Elemental Core",
    description: "A crystallized fusion of opposing elements. Deal +3 damage when playing Apoy (Fire) or Tubig (Water) cards. The balance of fire and water empowers you.",
    emoji: "💎"
  }
];

// All Act 2 relics combined
export const allAct2Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics
];

/**
 * ACT 2 RELIC REGISTRY - Single source of truth for Act 2 relic data
 */
export const ACT2_RELIC_REGISTRY = {
  // Relic categories
  COMMON: commonRelics,
  ELITE: eliteRelics,
  BOSS: bossRelics,
  TREASURE: treasureRelics,
  ALL: allAct2Relics,
  
  // Relic lookup by ID
  getById: (id: string): Relic | undefined => {
    return allAct2Relics.find(relic => relic.id === id);
  },
  
  // Get relics by category
  getByCategory: (category: 'common' | 'elite' | 'boss' | 'treasure'): Relic[] => {
    switch (category) {
      case 'common': return commonRelics;
      case 'elite': return eliteRelics;
      case 'boss': return bossRelics;
      case 'treasure': return treasureRelics;
      default: return [];
    }
  }
};

/**
 * ACT 2 RELIC EFFECTS REGISTRY - Maps relic IDs to their effect types
 */
export const ACT2_RELIC_EFFECTS = {
  // When playing specific card types
  ON_CARD_PLAYED: [
    'sirenas_scale',           // Heal 2 HP on Tubig card
    'berberoka_tide',          // +10 Block on all-Tubig hand
    'elemental_core'           // +3 damage on Apoy/Tubig cards
  ],
  
  // Combat damage effects
  DAMAGE_MODIFICATION: [
    'santelmo_ember',          // +2 Burn damage per stack
    'kataw_crown',             // +5 damage vs minions
    'bakunawa_fang',           // +5 damage on relic activation
    'elemental_core'           // +3 damage on Apoy/Tubig cards
  ],
  
  // Defensive effects
  DEFENSIVE: [
    'siyokoy_fin',             // +3 Block on splash damage
    'berberoka_tide',          // +10 Block on all-Tubig hand
    'bangkilan_veil'           // +10% dodge when cursed/debuffed
  ],
  
  // Healing effects
  HEALING: [
    'sirenas_scale',           // Heal 2 HP on Tubig card
    'magindara_song'           // Draw 1 card when healing
  ],
  
  // Debuff resistance
  DEBUFF_RESISTANCE: [
    'berbalang_spirit'         // Ignore first Weak debuff
  ],
  
  // Passive combat effects
  PASSIVE_COMBAT: [
    'bangkilan_veil',          // +10% dodge when debuffed
    'bakunawa_fang'            // +5 damage on relic activation
  ]
};

/**
 * Helper function to check if a relic has a specific effect type
 */
export function hasAct2RelicEffect(relicId: string, effectType: keyof typeof ACT2_RELIC_EFFECTS): boolean {
  return ACT2_RELIC_EFFECTS[effectType].includes(relicId);
}

/**
 * Helper function to get all Act 2 relics with a specific effect type
 */
export function getAct2RelicsWithEffect(effectType: keyof typeof ACT2_RELIC_EFFECTS): Relic[] {
  return ACT2_RELIC_EFFECTS[effectType]
    .map(id => ACT2_RELIC_REGISTRY.getById(id))
    .filter((relic): relic is Relic => relic !== undefined);
}

/**
 * Helper function to get Act 2 relic by ID with type safety
 */
export function getAct2RelicById(id: string): Relic {
  const relic = ACT2_RELIC_REGISTRY.getById(id);
  if (!relic) {
    throw new Error(`Act 2 Relic with ID "${id}" not found in registry`);
  }
  return relic;
}

/**
 * Helper function to get a random common relic from Act 2
 * @returns A random relic from the Act 2 common relic pool
 */
export function getRandomCommonRelic(): Relic {
  const index = Math.floor(Math.random() * commonRelics.length);
  return commonRelics[index];
}

/**
 * Helper function to get a random elite relic from Act 2
 * @returns A random relic from the Act 2 elite relic pool
 */
export function getRandomEliteRelic(): Relic {
  const index = Math.floor(Math.random() * eliteRelics.length);
  return eliteRelics[index];
}

/**
 * Helper function to get a random boss relic from Act 2
 * @returns A random relic from the Act 2 boss relic pool
 */
export function getRandomBossRelic(): Relic {
  const index = Math.floor(Math.random() * bossRelics.length);
  return bossRelics[index];
}

/**
 * Helper function to get a random treasure relic from Act 2
 * @returns A random relic from the Act 2 treasure relic pool
 */
export function getRandomTreasureRelic(): Relic {
  const index = Math.floor(Math.random() * treasureRelics.length);
  return treasureRelics[index];
}
