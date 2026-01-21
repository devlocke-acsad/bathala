/**
 * Act 2 Potions for Bathala
 * Chapter 2: The Submerged Barangays (Tubig/Apoy Focus)
 * Based on Filipino mythology - water and fire themed creatures
 * 
 * Lore Sources:
 * - Sirena: Mermaid-like creatures with healing songs
 * - Siyokoy: Male sea creatures with protective scales
 * - Santelmo: St. Elmo's fire, ghostly flames that burn
 * - Berberoka: Water creature that creates floods
 * - Magindara: Siren-like creatures with venomous beauty
 * - Kataw: Sea people who control waves
 * - Berbalang: Vampire-like creature with essence manipulation
 * - Bangkilan: Cursed spirits that can lift curses
 * - Bakunawa: Dragon that causes eclipses
 */

export interface Potion {
  id: string;
  name: string;
  description: string;
  effect: string;
  emoji: string;
  rarity: "common" | "uncommon" | "rare";
}

export const commonPotions: Potion[] = [
  {
    id: "sirena_melody",
    name: "Sirena Melody",
    description: "A vial containing the essence of a Sirena's healing song. Heal 15 HP.",
    effect: "heal_15_hp",
    emoji: "🧜‍♀️",
    rarity: "common"
  },
  {
    id: "siyokoy_scale",
    name: "Siyokoy Scale Potion",
    description: "Ground scales from a Siyokoy warrior. Gain 15 Block.",
    effect: "gain_15_block",
    emoji: "🐟",
    rarity: "common"
  },
  {
    id: "santelmo_spark",
    name: "Santelmo Spark",
    description: "Bottled ghostly fire from St. Elmo's flame. Apply 10 Burn to all enemies.",
    effect: "apply_10_burn_all",
    emoji: "🔥",
    rarity: "common"
  },
  {
    id: "berberoka_flood",
    name: "Berberoka Flood",
    description: "The swallowing waters of the Berberoka. Deal 20 damage to one enemy.",
    effect: "deal_20_damage",
    emoji: "🌊",
    rarity: "common"
  }
];

export const uncommonPotions: Potion[] = [
  {
    id: "magindara_venom",
    name: "Magindara Venom",
    description: "The purifying essence of a Magindara's song. Remove 1 debuff from yourself.",
    effect: "remove_1_debuff",
    emoji: "💜",
    rarity: "uncommon"
  },
  {
    id: "kataw_wave",
    name: "Kataw Wave",
    description: "A captured wave blessed by the Kataw sea guardians. Draw 2 additional cards.",
    effect: "draw_2_cards",
    emoji: "🌀",
    rarity: "uncommon"
  },
  {
    id: "berbalang_essence",
    name: "Berbalang Essence",
    description: "The separated spirit of a Berbalang. Gain 10 Block when Weakened.",
    effect: "gain_10_block_when_weak",
    emoji: "👤",
    rarity: "uncommon"
  },
  {
    id: "bangkilan_curse",
    name: "Bangkilan Curse Breaker",
    description: "A potion that breaks the curse of the sunken spirits. Heal 20 HP and remove all curses.",
    effect: "heal_20_remove_curse",
    emoji: "✨",
    rarity: "uncommon"
  }
];

export const rarePotions: Potion[] = [
  {
    id: "elemental_surge",
    name: "Elemental Surge",
    description: "A fusion of fire and water elements. Deal 15 damage with bonus damage if using Apoy or Tubig cards.",
    effect: "deal_15_elemental_damage",
    emoji: "⚡",
    rarity: "rare"
  },
  {
    id: "bakunawa_eclipse",
    name: "Bakunawa Eclipse",
    description: "The moon-eating power of the dragon Bakunawa. Deal 25 damage to one enemy.",
    effect: "deal_25_damage",
    emoji: "🌑",
    rarity: "rare"
  }
];

// All Act 2 potions combined for easy access
export const allAct2Potions: Potion[] = [
  ...commonPotions,
  ...uncommonPotions,
  ...rarePotions
];

/**
 * ACT 2 POTION REGISTRY - Single source of truth for Act 2 potion data
 */
export const ACT2_POTION_REGISTRY = {
  // Potion categories
  COMMON: commonPotions,
  UNCOMMON: uncommonPotions,
  RARE: rarePotions,
  ALL: allAct2Potions,
  
  // Potion lookup by ID
  getById: (id: string): Potion | undefined => {
    return allAct2Potions.find(potion => potion.id === id);
  },
  
  // Get potions by rarity
  getByRarity: (rarity: 'common' | 'uncommon' | 'rare'): Potion[] => {
    switch (rarity) {
      case 'common': return commonPotions;
      case 'uncommon': return uncommonPotions;
      case 'rare': return rarePotions;
      default: return [];
    }
  }
};

/**
 * Helper function to get Act 2 potion by ID with type safety
 */
export function getAct2PotionById(id: string): Potion {
  const potion = ACT2_POTION_REGISTRY.getById(id);
  if (!potion) {
    throw new Error(`Act 2 Potion with ID "${id}" not found in registry`);
  }
  return potion;
}

/**
 * Helper function to get a random common potion from Act 2
 * @returns A random potion from the Act 2 common potion pool
 */
export function getRandomCommonPotion(): Potion {
  const index = Math.floor(Math.random() * commonPotions.length);
  return commonPotions[index];
}

/**
 * Helper function to get a random uncommon potion from Act 2
 * @returns A random potion from the Act 2 uncommon potion pool
 */
export function getRandomUncommonPotion(): Potion {
  const index = Math.floor(Math.random() * uncommonPotions.length);
  return uncommonPotions[index];
}

/**
 * Helper function to get a random rare potion from Act 2
 * @returns A random potion from the Act 2 rare potion pool
 */
export function getRandomRarePotion(): Potion {
  const index = Math.floor(Math.random() * rarePotions.length);
  return rarePotions[index];
}

/**
 * Helper function to get a random potion from Act 2 (any rarity)
 * @returns A random potion from all Act 2 potions
 */
export function getRandomAct2Potion(): Potion {
  const index = Math.floor(Math.random() * allAct2Potions.length);
  return allAct2Potions[index];
}
