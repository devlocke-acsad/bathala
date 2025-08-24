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
  }
];

// All shop items combined
export const allShopItems: ShopItem[] = [
  ...shopRelics,
  ...premiumShopItems
];