import { Relic } from "../../core/types/CombatTypes";
import { getRelicById } from "./Act1Relics";

/**
 * Shop Items for Bathala
 * Based on Filipino mythology - Chapter 1: The Corrupted Ancestral Forests
 * Now references Act1Relics.ts as the single source of truth
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: "relic" | "potion" | "card";
  item: Relic | any; // For now, we'll focus on relics
  price: number;
  currency: "ginto" | "diamante";
  emoji: string;
}

/**
 * Helper function to create shop items from relics
 */
function createShopItemFromRelic(relicId: string, price: number, currency: "ginto" | "diamante"): ShopItem {
  const relic = getRelicById(relicId);
  return {
    id: `shop_${relicId}`,
    name: relic.name,
    description: relic.description,
    type: "relic",
    item: relic,
    price: price,
    currency: currency,
    emoji: relic.emoji
  };
}

// Common shop relics (now using centralized relic data)
export const shopRelics: ShopItem[] = [
  createShopItemFromRelic("earthwardens_plate", 150, "ginto"),
  createShopItemFromRelic("swift_wind_agimat", 120, "ginto"),
  createShopItemFromRelic("ember_fetish", 100, "ginto"),
  createShopItemFromRelic("umalagad_spirit", 130, "ginto"),
  createShopItemFromRelic("babaylans_talisman", 160, "ginto"),
  createShopItemFromRelic("ancestral_blade", 140, "ginto"),
  createShopItemFromRelic("tidal_amulet", 180, "ginto"),
  createShopItemFromRelic("sarimanok_feather", 170, "ginto")
];

// Premium shop items (now using centralized relic data)
// Removed: bargain_talisman, echo_ancestors, bakunawa_scale, tigmamanukan_eye (no sprites)
export const premiumShopItems: ShopItem[] = [
  createShopItemFromRelic("lucky_charm", 4, "diamante"),
  createShopItemFromRelic("diwatas_crown", 6, "diamante"),
  createShopItemFromRelic("stone_golem_heart", 3, "diamante")
];

// All shop items combined
export const allShopItems: ShopItem[] = [
  ...shopRelics,
  ...premiumShopItems
];
