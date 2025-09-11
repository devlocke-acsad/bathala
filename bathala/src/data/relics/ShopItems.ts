import { Relic } from "../../core/types/CombatTypes";

/**
 * Shop Items for Bathala
 * Based on Filipino mythology and the game's design document
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "relic" | "potion" | "card";
  item: Relic | any; // For now, we'll focus on relics
  price: number;
  currency: "ginto" | "baubles";
  emoji: string;
}

// Common shop relics
export const shopRelics: ShopItem[] = [
  {
    id: "shop_earthwardens_plate",
    name: "Earthwarden's Plate",
    description: "Start each combat with 5 Block. Cannot be broken by non-attack damage.",
    type: "relic",
    item: {
      id: "earthwardens_plate",
      name: "Earthwarden's Plate",
      description: "Start each combat with 5 Block. Cannot be broken by non-attack damage.",
      emoji: "🛡️"
    },
    price: 150,
    currency: "ginto",
    emoji: "🛡️"
  },
  {
    id: "shop_swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "Start each combat with 1 additional discard charge.",
    type: "relic",
    item: {
      id: "swift_wind_agimat",
      name: "Agimat of the Swift Wind",
      description: "Start each combat with 1 additional discard charge.",
      emoji: "💨"
    },
    price: 120,
    currency: "ginto",
    emoji: "💨"
  },
  {
    id: "shop_ember_fetish",
    name: "Ember Fetish",
    description: "At the start of your turn, if you have no Block, gain 3 Strength.",
    type: "relic",
    item: {
      id: "ember_fetish",
      name: "Ember Fetish",
      description: "At the start of your turn, if you have no Block, gain 3 Strength.",
      emoji: "🔥"
    },
    price: 100,
    currency: "ginto",
    emoji: "🔥"
  },
  {
    id: "shop_merchants_scale",
    name: "Merchant's Scale",
    description: "All shop items are 20% cheaper.",
    type: "relic",
    item: {
      id: "merchants_scale",
      name: "Merchant's Scale",
      description: "All shop items are 20% cheaper.",
      emoji: "⚖️"
    },
    price: 200,
    currency: "ginto",
    emoji: "⚖️"
  },
  {
    id: "shop_babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "Your hand is always considered one tier higher when evaluating poker hands.",
    type: "relic",
    item: {
      id: "babaylans_talisman",
      name: "Babaylan's Talisman",
      description: "Your hand is always considered one tier higher when evaluating poker hands.",
      emoji: "📿"
    },
    price: 180,
    currency: "ginto",
    emoji: "📿"
  },
  {
    id: "shop_ancestral_blade",
    name: "Ancestral Blade",
    description: "Each time you play a Flush, gain 2 temporary Strength.",
    type: "relic",
    item: {
      id: "ancestral_blade",
      name: "Ancestral Blade",
      description: "Each time you play a Flush, gain 2 temporary Strength.",
      emoji: "⚔️"
    },
    price: 160,
    currency: "ginto",
    emoji: "⚔️"
  },
  {
    id: "shop_tidal_amulet",
    name: "Tidal Amulet",
    description: "At the end of your turn, heal 2 HP for each card in your hand.",
    type: "relic",
    item: {
      id: "tidal_amulet",
      name: "Tidal Amulet",
      description: "At the end of your turn, heal 2 HP for each card in your hand.",
      emoji: "🌊"
    },
    price: 140,
    currency: "ginto",
    emoji: "🌊"
  }
];

// Premium shop items
export const premiumShopItems: ShopItem[] = [
  {
    id: "shop_bargain_talisman",
    name: "Bargain Talisman",
    description: "The first shop item you buy each act is free.",
    type: "relic",
    item: {
      id: "bargain_talisman",
      name: "Bargain Talisman",
      description: "The first shop item you buy each act is free.",
      emoji: "💎"
    },
    price: 3,
    currency: "baubles",
    emoji: "💎"
  },
  {
    id: "shop_lucky_charm",
    name: "Lucky Charm",
    description: "Whenever you play a Straight or better, gain 1 Ginto.",
    type: "relic",
    item: {
      id: "lucky_charm",
      name: "Lucky Charm",
      description: "Whenever you play a Straight or better, gain 1 Ginto.",
      emoji: "🍀"
    },
    price: 2,
    currency: "baubles",
    emoji: "🍀"
  },
  {
    id: "shop_echo_ancestors",
    name: "Echo of the Ancestors",
    description: "Enables Five of a Kind poker hands.",
    type: "relic",
    item: {
      id: "echo_ancestors",
      name: "Echo of the Ancestors",
      description: "Enables Five of a Kind poker hands.",
      emoji: "🌟"
    },
    price: 5,
    currency: "baubles",
    emoji: "🌟"
  },
  {
    id: "shop_diwatas_crown",
    name: "Diwata's Crown",
    description: "Start each combat with 10 Block and gain 1 temporary Dexterity.",
    type: "relic",
    item: {
      id: "diwatas_crown",
      name: "Diwata's Crown",
      description: "Start each combat with 10 Block and gain 1 temporary Dexterity.",
      emoji: "👑"
    },
    price: 4,
    currency: "baubles",
    emoji: "👑"
  },
  {
    id: "shop_stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "Gain 10 Max HP. At the start of combat, gain 2 Block.",
    type: "relic",
    item: {
      id: "stone_golem_heart",
      name: "Stone Golem's Heart",
      description: "Gain 10 Max HP. At the start of combat, gain 2 Block.",
      emoji: "❤️"
    },
    price: 4,
    currency: "baubles",
    emoji: "❤️"
  }
];

// All shop items combined
export const allShopItems: ShopItem[] = [
  ...shopRelics,
  ...premiumShopItems
];