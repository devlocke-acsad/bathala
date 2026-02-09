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
    emoji: "🐚",
    lore: "The Sirena were once benevolent guardians of coral reefs, their songs guiding lost sailors home. Corrupted by false tides, their melodies now lure the unwary — but their scales still carry the old healing.",
    spriteKey: "relic_sirenas_scale",
  },
  {
    id: "siyokoy_fin",
    name: "Siyokoy Fin",
    description: "The webbed fin of a fierce Siyokoy warrior. Gain 3 Block whenever you deal splash damage to multiple enemies. The ocean's fury protects you.",
    emoji: "🦈",
    lore: "Siyokoy are malevolent mermen with webbed digits and scaled bodies, dragging victims beneath the waves. This fin, severed in battle, retains the armored fury of the deep sea.",
    spriteKey: "relic_siyokoy_fin",
  },
  {
    id: "santelmo_ember",
    name: "Santelmo Ember",
    description: "A ghostly flame that never extinguishes. Burn damage deals +2 additional damage per stack. St. Elmo's fire intensifies your flames.",
    emoji: "👻",
    lore: "Santelmo are the soul fires that dance above the sea at night — assistants of the upper world who once aided the gods. Their flames never die, and this ember burns hotter with each soul it touches.",
    spriteKey: "relic_santelmo_ember",
  },
  {
    id: "berberoka_tide",
    name: "Berberoka Tide",
    description: "Blessed by the water-swallowing Berberoka. Gain 10 Block whenever you play a hand containing only Tubig (Water) cards. The tide shields you from harm.",
    emoji: "🌊",
    lore: "The Berberoka are giants who drain entire rivers to lure fish and fishermen alike. When they release the water, the flood drowns all in its path. This relic channels that devastating deluge as a shield.",
    spriteKey: "relic_berberoka_tide",
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "magindara_song",
    name: "Magindara Song",
    description: "The enchanting melody of the Magindara sirens. Draw 1 additional card whenever you heal HP during combat. Their song guides fortune to you.",
    emoji: "🎵",
    lore: "The Magindara are vicious mermaids of Bicolano legend whose beauty masks their hunger for flesh. Their songs once protected the coast; now the melody only brings fortune to those strong enough to claim it.",
    spriteKey: "relic_magindara_song",
  },
  {
    id: "kataw_crown",
    name: "Kataw Crown",
    description: "The coral crown of the Kataw sea guardians. Deal +5 damage when facing enemies with minions or summons. The ocean's rulers empower your strikes against groups.",
    emoji: "👑",
    lore: "The Kataw are merman kings commanding the waves, ruling vast underwater barangays. Their coral crowns are symbols of absolute dominion over the sea and all creatures within it.",
    spriteKey: "relic_kataw_crown",
  },
  {
    id: "berbalang_spirit",
    name: "Berbalang Spirit",
    description: "The separated essence of a Berbalang vampire. Ignore the first Weak debuff applied to you each combat. Your spirit cannot be easily diminished.",
    emoji: "🦇",
    lore: "The Berbalang of Sulu can detach their spirits from their bodies to hunt the living. This captured essence resists all attempts to weaken it, for it has already been separated from mortal frailty.",
    spriteKey: "relic_berbalang_spirit",
  },
  {
    id: "bangkilan_veil",
    name: "Bangkilan Veil",
    description: "A cursed veil from the sunken spirits. Gain 10% dodge chance when you have any curse or debuff active. Misfortune becomes your shield.",
    emoji: "🌫️",
    lore: "Bangkilan were shape-shifting sorceresses of the drowned barangays, adapting to every danger. Their veils shimmer between forms, and those who wear them find that curses become armor.",
    spriteKey: "relic_bangkilan_veil",
  }
];

// Boss relic (tied to Bakunawa boss)
export const bossRelics: Relic[] = [
  {
    id: "bakunawa_fang",
    name: "Bakunawa Fang",
    description: "The legendary fang of the moon-eating dragon. Deal +5 damage whenever you activate a relic effect during combat. The dragon's power amplifies your artifacts.",
    emoji: "🐉",
    lore: "The Bakunawa is the colossal sea serpent who devours the moon, causing eclipses. Its fang carries the hunger of the abyss — an insatiable force that amplifies every artifact it touches.",
    spriteKey: "relic_bakunawa_fang",
  }
];

// Treasure/event relic
export const treasureRelics: Relic[] = [
  {
    id: "elemental_core",
    name: "Elemental Core",
    description: "A crystallized fusion of opposing elements. Deal +3 damage when playing Apoy (Fire) or Tubig (Water) cards. The balance of fire and water empowers you.",
    emoji: "💎",
    lore: "Born from the eternal feud between fire and water spirits in Visayan cosmology, this core crystallized at the boundary where both elements meet. It channels the tension of their balance into raw power.",
    spriteKey: "relic_elemental_core",
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
