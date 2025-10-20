/**
 * Act 1 Potions for Bathala
 * Based on Filipino mythology and the game's design document
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
    id: "healing_potion",
    name: "Healing Potion",
    description: "Heal 20 HP.",
    effect: "heal_20_hp",
    emoji: "❤️",
    rarity: "common"
  },
  {
    id: "clarity_potion",
    name: "Potion of Clarity",
    description: "Draw 3 cards.",
    effect: "draw_3_cards",
    emoji: "🧠",
    rarity: "common"
  },
  {
    id: "fortitude_potion",
    name: "Elixir of Fortitude",
    description: "Gain 15 Block.",
    effect: "gain_15_block",
    emoji: "🛡️",
    rarity: "common"
  },
  {
    id: "swiftness_potion",
    name: "Draught of Swiftness",
    description: "Gain 1 temporary Dexterity.",
    effect: "gain_1_dexterity",
    emoji: "💨",
    rarity: "common"
  }
];

export const uncommonPotions: Potion[] = [
  {
    id: "elements_potion",
    name: "Phial of Elements",
    description: "Choose which element becomes dominant in your next hand.",
    effect: "choose_element",
    emoji: "🌈",
    rarity: "uncommon"
  },
  {
    id: "regeneration_potion",
    name: "Tonic of Regeneration",
    description: "Gain 2 Regeneration for 3 turns.",
    effect: "gain_regeneration",
    emoji: "♻️",
    rarity: "uncommon"
  },
  {
    id: "strength_potion",
    name: "Brew of Strength",
    description: "Gain 2 temporary Strength.",
    effect: "gain_2_strength",
    emoji: "💪",
    rarity: "uncommon"
  }
];

export const rarePotions: Potion[] = [
  {
    id: "resilience_potion",
    name: "Balm of Resilience",
    description: "Remove all debuffs.",
    effect: "remove_debuffs",
    emoji: "✨",
    rarity: "rare"
  },
  {
    id: "divine_potion",
    name: "Divine Elixir",
    description: "Gain 10 temporary Max HP until end of combat.",
    effect: "gain_temp_max_hp",
    emoji: "🌟",
    rarity: "rare"
  },
  {
    id: "chaos_potion",
    name: "Mixture of Chaos",
    description: "Shuffle 3 random cards into your draw pile.",
    effect: "add_random_cards",
    emoji: "🌀",
    rarity: "rare"
  }
];

// All potions combined for easy access
export const allAct1Potions: Potion[] = [
  ...commonPotions,
  ...uncommonPotions,
  ...rarePotions
];