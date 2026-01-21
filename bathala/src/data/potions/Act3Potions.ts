/**
 * Act 3 Potions for Bathala
 * Chapter 3: The Skyward Citadel (Multi-element Focus)
 * Based on Filipino mythology - celestial and divine themed creatures
 * 
 * Lore Sources:
 * - Tigmamanukan: Celestial bird that brings omens and fortune
 * - Diwata: Benevolent nature spirits with healing grace
 * - Sarimanok: Legendary bird that shines with brilliance
 * - Bulalakaw: Meteor spirits with fiery essence
 * - Minokawa: Giant bird that casts shadows during eclipses
 * - Alan: Winged spirits with gentle breezes
 * - Ekek: Vampire-like creature with blood essence
 * - Ribung Linti: Lightning spirits with electric surge
 * - Apolaki: Sun god with radiant healing power
 * - Coconut: Sacred vessel containing divine essence (Diwa)
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
    id: "tigmamanukan_omen",
    name: "Tigmamanukan Omen",
    description: "A vial containing the celestial bird's blessing. Draw 3 additional cards.",
    effect: "draw_3_cards",
    emoji: "🪶",
    rarity: "common"
  },
  {
    id: "diwata_grace",
    name: "Diwata Grace",
    description: "The healing essence of benevolent nature spirits. Heal 20 HP.",
    effect: "heal_20_hp",
    emoji: "🌸",
    rarity: "common"
  },
  {
    id: "sarimanok_shine",
    name: "Sarimanok Shine",
    description: "The protective brilliance of the legendary fortune bird. Gain 10 Block.",
    effect: "gain_10_block",
    emoji: "✨",
    rarity: "common"
  },
  {
    id: "bulalakaw_flame",
    name: "Bulalakaw Flame",
    description: "Captured meteor fire from a shooting star spirit. Apply 10 Burn to all enemies.",
    effect: "apply_10_burn_all",
    emoji: "☄️",
    rarity: "common"
  }
];

export const uncommonPotions: Potion[] = [
  {
    id: "minokawa_shadow",
    name: "Minokawa Shadow",
    description: "The eclipse-casting essence of the giant bird. Remove 1 debuff from yourself.",
    effect: "remove_1_debuff",
    emoji: "🌑",
    rarity: "uncommon"
  },
  {
    id: "alan_breeze",
    name: "Alan Breeze",
    description: "A gentle wind captured from the winged forest spirits. Draw 2 additional cards.",
    effect: "draw_2_cards",
    emoji: "🌬️",
    rarity: "uncommon"
  },
  {
    id: "ekek_blood",
    name: "Ekek Blood",
    description: "The vampiric essence of the night creature. Deal 15 damage to one enemy.",
    effect: "deal_15_damage",
    emoji: "🩸",
    rarity: "uncommon"
  },
  {
    id: "linti_surge",
    name: "Linti Surge",
    description: "Bottled lightning from the Ribung Linti spirits. Deal 20 damage with bonus damage on multi-element combos.",
    effect: "deal_20_elemental_damage",
    emoji: "⚡",
    rarity: "uncommon"
  }
];

export const rarePotions: Potion[] = [
  {
    id: "apolaki_sun",
    name: "Apolaki Sun",
    description: "The radiant healing power of the sun god. Heal 25 HP.",
    effect: "heal_25_hp",
    emoji: "☀️",
    rarity: "rare"
  },
  {
    id: "coconut_sap",
    name: "Coconut Sap",
    description: "Sacred essence from a blessed coconut containing divine spirit. Heal 20 HP and remove all debuffs.",
    effect: "heal_20_remove_debuffs",
    emoji: "🥥",
    rarity: "rare"
  }
];

// All Act 3 potions combined for easy access
export const allAct3Potions: Potion[] = [
  ...commonPotions,
  ...uncommonPotions,
  ...rarePotions
];

/**
 * ACT 3 POTION REGISTRY - Single source of truth for Act 3 potion data
 */
export const ACT3_POTION_REGISTRY = {
  // Potion categories
  COMMON: commonPotions,
  UNCOMMON: uncommonPotions,
  RARE: rarePotions,
  ALL: allAct3Potions,
  
  // Potion lookup by ID
  getById: (id: string): Potion | undefined => {
    return allAct3Potions.find(potion => potion.id === id);
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
 * Helper function to get Act 3 potion by ID with type safety
 */
export function getAct3PotionById(id: string): Potion {
  const potion = ACT3_POTION_REGISTRY.getById(id);
  if (!potion) {
    throw new Error(`Act 3 Potion with ID "${id}" not found in registry`);
  }
  return potion;
}

/**
 * Helper function to get a random common potion from Act 3
 * @returns A random potion from the Act 3 common potion pool
 */
export function getRandomCommonPotion(): Potion {
  const index = Math.floor(Math.random() * commonPotions.length);
  return commonPotions[index];
}

/**
 * Helper function to get a random uncommon potion from Act 3
 * @returns A random potion from the Act 3 uncommon potion pool
 */
export function getRandomUncommonPotion(): Potion {
  const index = Math.floor(Math.random() * uncommonPotions.length);
  return uncommonPotions[index];
}

/**
 * Helper function to get a random rare potion from Act 3
 * @returns A random potion from the Act 3 rare potion pool
 */
export function getRandomRarePotion(): Potion {
  const index = Math.floor(Math.random() * rarePotions.length);
  return rarePotions[index];
}

/**
 * Helper function to get a random potion from Act 3 (any rarity)
 * @returns A random potion from all Act 3 potions
 */
export function getRandomAct3Potion(): Potion {
  const index = Math.floor(Math.random() * allAct3Potions.length);
  return allAct3Potions[index];
}
