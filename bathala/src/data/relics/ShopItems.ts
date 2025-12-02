import { Relic } from "../../core/types/CombatTypes";
import { getRelicById } from "./Act1Relics";
import { getAct2RelicById } from "./Act2Relics";
import { getAct3RelicById } from "./Act3Relics";

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

/**
 * Helper function to create shop items from Act 2 relics
 */
function createAct2ShopItemFromRelic(relicId: string, price: number, currency: "ginto" | "diamante"): ShopItem {
  const relic = getAct2RelicById(relicId);
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

/**
 * Helper function to create shop items from Act 3 relics
 */
function createAct3ShopItemFromRelic(relicId: string, price: number, currency: "ginto" | "diamante"): ShopItem {
  const relic = getAct3RelicById(relicId);
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
  createShopItemFromRelic("lucky_charm", 250, "ginto"),
  createShopItemFromRelic("diwatas_crown", 300, "ginto"),
  createShopItemFromRelic("stone_golem_heart", 200, "ginto")
];

// Act 2 shop relics (The Submerged Barangays)
export const act2ShopRelics: ShopItem[] = [
  createAct2ShopItemFromRelic("sirenas_scale", 150, "ginto"),
  createAct2ShopItemFromRelic("siyokoy_fin", 120, "ginto"),
  createAct2ShopItemFromRelic("santelmo_ember", 100, "ginto"),
  createAct2ShopItemFromRelic("berberoka_tide", 130, "ginto"),
  createAct2ShopItemFromRelic("magindara_song", 140, "ginto"),
  createAct2ShopItemFromRelic("kataw_crown", 160, "ginto"),
  createAct2ShopItemFromRelic("berbalang_spirit", 170, "ginto"),
  createAct2ShopItemFromRelic("bangkilan_veil", 180, "ginto")
];

export const act2PremiumShopItems: ShopItem[] = [
  createAct2ShopItemFromRelic("elemental_core", 250, "ginto"),
  createAct2ShopItemFromRelic("bakunawa_fang", 300, "ginto")
];

// Act 3 shop relics (The Skyward Citadel)
export const act3ShopRelics: ShopItem[] = [
  createAct3ShopItemFromRelic("tigmamanukan_feather", 150, "ginto"),
  createAct3ShopItemFromRelic("diwata_veil", 120, "ginto"),
  createAct3ShopItemFromRelic("sarimanok_plumage", 140, "ginto"),
  createAct3ShopItemFromRelic("bulalakaw_spark", 130, "ginto"),
  createAct3ShopItemFromRelic("minokawa_claw", 160, "ginto"),
  createAct3ShopItemFromRelic("alan_wing", 170, "ginto"),
  createAct3ShopItemFromRelic("ekek_fang", 100, "ginto"),
  createAct3ShopItemFromRelic("linti_bolt", 180, "ginto")
];

export const act3PremiumShopItems: ShopItem[] = [
  createAct3ShopItemFromRelic("apolakis_spear", 250, "ginto"),
  createAct3ShopItemFromRelic("coconut_diwa", 300, "ginto")
];

// All shop items combined (Act 1 only - for backward compatibility)
export const allShopItems: ShopItem[] = [
  ...shopRelics,
  ...premiumShopItems
];

/**
 * Get chapter-specific shop items
 */
export function getChapterShopItems(chapter: number): ShopItem[] {
  switch (chapter) {
    case 2:
      return [...act2ShopRelics, ...act2PremiumShopItems];
    case 3:
      return [...act3ShopRelics, ...act3PremiumShopItems];
    case 1:
    default:
      return allShopItems;
  }
}
