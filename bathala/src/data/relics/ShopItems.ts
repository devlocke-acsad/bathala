import { Relic } from "../../core/types/CombatTypes";

/**
 * Shop Items for Bathala
 * Based on Filipino mythology - Chapter 1: The Corrupted Ancestral Forests
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

// Common shop relics (updated to match Act 1 relics)
export const shopRelics: ShopItem[] = [
  {
    id: "shop_tikbalangs_hoof",
    name: "Tikbalang's Hoof",
    description: "Gain 10% chance to dodge attacks. Inspiration: Trickery (Ramos, 1990)",
    type: "relic",
    item: {
      id: "tikbalangs_hoof",
      name: "Tikbalang's Hoof",
      description: "Gain 10% chance to dodge attacks. Inspiration: Trickery (Ramos, 1990)",
      emoji: "🐴"
    },
    price: 150,
    currency: "ginto",
    emoji: "🐴"
  },
  {
    id: "shop_balete_root",
    name: "Balete Root",
    description: "Gain 2 Block for each Lupa card played. Inspiration: Portals (Samar, 2019)",
    type: "relic",
    item: {
      id: "balete_root",
      name: "Balete Root",
      description: "Gain 2 Block for each Lupa card played. Inspiration: Portals (Samar, 2019)",
      emoji: "🌳"
    },
    price: 120,
    currency: "ginto",
    emoji: "🌳"
  },
  {
    id: "shop_sigbin_heart",
    name: "Sigbin Heart",
    description: "Deal 5 additional damage when you Burst. Inspiration: Amulets (Eugenio, 2001)",
    type: "relic",
    item: {
      id: "sigbin_heart",
      name: "Sigbin Heart",
      description: "Deal 5 additional damage when you Burst. Inspiration: Amulets (Eugenio, 2001)",
      emoji: "❤️"
    },
    price: 100,
    currency: "ginto",
    emoji: "❤️"
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
    id: "shop_forest_wardens_bark",
    name: "Forest Warden's Bark",
    description: "Gain 1 Strength for each Hangin card played.",
    type: "relic",
    item: {
      id: "forest_wardens_bark",
      name: "Forest Warden's Bark",
      description: "Gain 1 Strength for each Hangin card played.",
      emoji: "🌿"
    },
    price: 160,
    currency: "ginto",
    emoji: "🌿"
  },
  {
    id: "shop_wind_dancers_tassel",
    name: "Wind Dancer's Tassel",
    description: "Gain 1 additional discard charge each combat.",
    type: "relic",
    item: {
      id: "wind_dancers_tassel",
      name: "Wind Dancer's Tassel",
      description: "Gain 1 additional discard charge each combat.",
      emoji: "🎐"
    },
    price: 140,
    currency: "ginto",
    emoji: "🎐"
  },
  {
    id: "shop_anito_stone",
    name: "Anito Stone",
    description: "At the start of combat, gain Block equal to 3 times the number of different suits in your hand.",
    type: "relic",
    item: {
      id: "anito_stone",
      name: "Anito Stone",
      description: "At the start of combat, gain Block equal to 3 times the number of different suits in your hand.",
      emoji: "🗿"
    },
    price: 180,
    currency: "ginto",
    emoji: "🗿"
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
    currency: "diamante",
    emoji: "💎"
  },
  {
    id: "shop_kapres_cigar",
    name: "Kapre's Cigar",
    description: "Summon a 5 HP minion at the start of combat. Inspiration: Smoke (Ramos, 1990)",
    type: "relic",
    item: {
      id: "kapres_cigar",
      name: "Kapre's Cigar",
      description: "Summon a 5 HP minion at the start of combat. Inspiration: Smoke (Ramos, 1990)",
      emoji: " Maduro"
    },
    price: 4,
    currency: "diamante",
    emoji: " Maduro"
  },
  {
    id: "shop_mangangaway_wand",
    name: "Mangangaway Wand",
    description: "Ignore 1 curse card each combat. Inspiration: Hexes (Eugenio, 2001)",
    type: "relic",
    item: {
      id: "mangangaway_wand",
      name: "Mangangaway Wand",
      description: "Ignore 1 curse card each combat. Inspiration: Hexes (Eugenio, 2001)",
      emoji: "🪄"
    },
    price: 5,
    currency: "diamante",
    emoji: "🪄"
  },
  {
    id: "shop_lupa_diwa_shard",
    name: "Lupa Diwa Shard",
    description: "Purify 1 additional card when visiting the shrine. Post-Boss Resolution: 'Hexes lift; earth stirs.'",
    type: "relic",
    item: {
      id: "lupa_diwa_shard",
      name: "Lupa Diwa Shard",
      description: "Purify 1 additional card when visiting the shrine. Post-Boss Resolution: 'Hexes lift; earth stirs.'",
      emoji: "🔶"
    },
    price: 6,
    currency: "diamante",
    emoji: "🔶"
  },
  {
    id: "shop_engkanto_whisper",
    name: "Engkanto Whisper",
    description: "When you play a Flush, draw 1 card. Gain 1 curse card.",
    type: "relic",
    item: {
      id: "engkanto_whisper",
      name: "Engkanto Whisper",
      description: "When you play a Flush, draw 1 card. Gain 1 curse card.",
      emoji: "👻"
    },
    price: 3,
    currency: "diamante",
    emoji: "👻"
  },
  // Diamante shop items
  {
    id: "shop_crystal_ward",
    name: "Crystal Ward",
    description: "Gain 15 Block at the start of each combat.",
    type: "relic",
    item: {
      id: "crystal_ward",
      name: "Crystal Ward",
      description: "Gain 15 Block at the start of each combat.",
      emoji: "🛡️"
    },
    price: 50,
    currency: "diamante",
    emoji: "🛡️"
  },
  {
    id: "shop_forest_guardians_helm",
    name: "Forest Guardian's Helm",
    description: "Gain 10 Block at the start of each combat. Gain 1 Strength for each different suit in your hand.",
    type: "relic",
    item: {
      id: "forest_guardians_helm",
      name: "Forest Guardian's Helm",
      description: "Gain 10 Block at the start of each combat. Gain 1 Strength for each different suit in your hand.",
      emoji: "⛑️"
    },
    price: 75,
    currency: "diamante",
    emoji: "⛑️"
  }
];

// All shop items combined
export const allShopItems: ShopItem[] = [
  ...shopRelics,
  ...premiumShopItems
];