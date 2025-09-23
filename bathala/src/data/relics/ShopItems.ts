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
    id: "shop_earthwardens_plate",
    name: "Earthwarden's Plate",
    description: "Forged from the sacred linga stones of the mountain spirits. Start each combat with 5 Block that cannot be broken by non-attack damage.",
    type: "relic",
    item: {
      id: "earthwardens_plate",
      name: "Earthwarden's Plate",
      description: "Forged from the sacred linga stones of the mountain spirits. Start each combat with 5 Block that cannot be broken by non-attack damage.",
      emoji: "🛡️"
    },
    price: 150,
    currency: "ginto",
    emoji: "🛡️"
  },
  {
    id: "shop_swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "A blessed talisman that captures the essence of Tikbalang's speed. Start each combat with 1 additional discard charge.",
    type: "relic",
    item: {
      id: "swift_wind_agimat",
      name: "Agimat of the Swift Wind",
      description: "A blessed talisman that captures the essence of Tikbalang's speed. Start each combat with 1 additional discard charge.",
      emoji: "💨"
    },
    price: 120,
    currency: "ginto",
    emoji: "💨"
  },
  {
    id: "shop_ember_fetish",
    name: "Ember Fetish",
    description: "Carved from the heart of a banana tree at midnight and blessed by Apolaki's flame. At the start of your turn, if you have no Block, gain 3 Strength.",
    type: "relic",
    item: {
      id: "ember_fetish",
      name: "Ember Fetish",
      description: "Carved from the heart of a banana tree at midnight and blessed by Apolaki's flame. At the start of your turn, if you have no Block, gain 3 Strength.",
      emoji: "🔥"
    },
    price: 100,
    currency: "ginto",
    emoji: "🔥"
  },
  {
    id: "shop_umalagad_spirit",
    name: "Umalagad's Spirit",
    description: "The protective essence of a sea serpent that guides travelers. Gain 1 temporary Dexterity at the start of each combat.",
    type: "relic",
    item: {
      id: "umalagad_spirit",
      name: "Umalagad's Spirit",
      description: "The protective essence of a sea serpent that guides travelers. Gain 1 temporary Dexterity at the start of each combat.",
      emoji: "🐍"
    },
    price: 130,
    currency: "ginto",
    emoji: "🐍"
  },
  {
    id: "shop_merchants_scale",
    name: "Merchant's Scale",
    description: "A balance blessed by Lakambini to ensure fair trade. All shop items are 20% cheaper.",
    type: "relic",
    item: {
      id: "merchants_scale",
      name: "Merchant's Scale",
      description: "A balance blessed by Lakambini to ensure fair trade. All shop items are 20% cheaper.",
      emoji: "⚖️"
    },
    price: 200,
    currency: "ginto",
    emoji: "⚖️"
  },
  {
    id: "shop_babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "A sacred amulet blessed by the ancient shamans. Your hand is always considered one tier higher when evaluating poker hands.",
    type: "relic",
    item: {
      id: "babaylans_talisman",
      name: "Babaylan's Talisman",
      description: "A sacred amulet blessed by the ancient shamans. Your hand is always considered one tier higher when evaluating poker hands.",
      emoji: "📿"
    },
    price: 160,
    currency: "ginto",
    emoji: "📿"
  },
  {
    id: "shop_ancestral_blade",
    name: "Ancestral Blade",
    description: "A kampilan blessed by the spirits of your ancestors. Each time you play a Flush, gain 2 temporary Strength.",
    type: "relic",
    item: {
      id: "ancestral_blade",
      name: "Ancestral Blade",
      description: "A kampilan blessed by the spirits of your ancestors. Each time you play a Flush, gain 2 temporary Strength.",
      emoji: "⚔️"
    },
    price: 140,
    currency: "ginto",
    emoji: "⚔️"
  },
  {
    id: "shop_tidal_amulet",
    name: "Tidal Amulet",
    description: "An enchanted piece of coral that pulses with the rhythm of the sea. At the end of your turn, heal 2 HP for each card in your hand.",
    type: "relic",
    item: {
      id: "tidal_amulet",
      name: "Tidal Amulet",
      description: "An enchanted piece of coral that pulses with the rhythm of the sea. At the end of your turn, heal 2 HP for each card in your hand.",
      emoji: "🌊"
    },
    price: 180,
    currency: "ginto",
    emoji: "🌊"
  },
  {
    id: "shop_sarimanok_feather",
    name: "Sarimanok Feather",
    description: "A radiant feather from the mythical bird that brings prosperity. Whenever you play a Straight or better, gain 1 Ginto.",
    type: "relic",
    item: {
      id: "sarimanok_feather",
      name: "Sarimanok Feather",
      description: "A radiant feather from the mythical bird that brings prosperity. Whenever you play a Straight or better, gain 1 Ginto.",
      emoji: "🦚"
    },
    price: 170,
    currency: "ginto",
    emoji: "🦚"
  }
];

// Premium shop items
export const premiumShopItems: ShopItem[] = [
  {
    id: "shop_bargain_talisman",
    name: "Bargain Talisman",
    description: "A gemstone that negotiates with shopkeepers on your behalf. The first shop item you buy each act is free.",
    type: "relic",
    item: {
      id: "bargain_talisman",
      name: "Bargain Talisman",
      description: "A gemstone that negotiates with shopkeepers on your behalf. The first shop item you buy each act is free.",
      emoji: "💎"
    },
    price: 3,
    currency: "diamante",
    emoji: "💎"
  },
  {
    id: "shop_lucky_charm",
    name: "Lucky Charm",
    description: "A mutya jewel that brings fortune to its bearer. Whenever you play a Straight or better, gain 1 Ginto.",
    type: "relic",
    item: {
      id: "lucky_charm",
      name: "Lucky Charm",
      description: "A mutya jewel that brings fortune to its bearer. Whenever you play a Straight or better, gain 1 Ginto.",
      emoji: "🍀"
    },
    price: 4,
    currency: "diamante",
    emoji: "🍀"
  },
  {
    id: "shop_echo_ancestors",
    name: "Echo of the Ancestors",
    description: "The whispered wisdom of your forebears that unlocks hidden potential. Enables Five of a Kind poker hands.",
    type: "relic",
    item: {
      id: "echo_ancestors",
      name: "Echo of the Ancestors",
      description: "The whispered wisdom of your forebears that unlocks hidden potential. Enables Five of a Kind poker hands.",
      emoji: "🌟"
    },
    price: 5,
    currency: "diamante",
    emoji: "🌟"
  },
  {
    id: "shop_diwatas_crown",
    name: "Diwata's Crown",
    description: "A crown blessed by the benevolent nature spirits. Start each combat with 10 Block and gain 1 temporary Dexterity.",
    type: "relic",
    item: {
      id: "diwatas_crown",
      name: "Diwata's Crown",
      description: "A crown blessed by the benevolent nature spirits. Start each combat with 10 Block and gain 1 temporary Dexterity.",
      emoji: "👑"
    },
    price: 6,
    currency: "diamante",
    emoji: "👑"
  },
  {
    id: "shop_stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "The eternal heart of an earth guardian. Gain 10 Max HP. At the start of combat, gain 2 Block.",
    type: "relic",
    item: {
      id: "stone_golem_heart",
      name: "Stone Golem's Heart",
      description: "The eternal heart of an earth guardian. Gain 10 Max HP. At the start of combat, gain 2 Block.",
      emoji: "❤️"
    },
    price: 3,
    currency: "diamante",
    emoji: "❤️"
  },
  {
    id: "shop_bakunawa_scale",
    name: "Bakunawa Scale",
    description: "A scale from the great serpent that devours the moon. Reduces all incoming damage by 1 and gain 5 Max HP.",
    type: "relic",
    item: {
      id: "bakunawa_scale",
      name: "Bakunawa Scale",
      description: "A scale from the great serpent that devours the moon. Reduces all incoming damage by 1 and gain 5 Max HP.",
      emoji: "🌙"
    },
    price: 5,
    currency: "diamante",
    emoji: "🌙"
  },
  {
    id: "shop_tigmamanukan_eye",
    name: "Tigmamanukan's Eye",
    description: "The all-seeing eye of the prophetic bird. Draw 1 additional card at the start of each combat.",
    type: "relic",
    item: {
      id: "tigmamanukan_eye",
      name: "Tigmamanukan's Eye",
      description: "The all-seeing eye of the prophetic bird. Draw 1 additional card at the start of each combat.",
      emoji: "👁️"
    },
    price: 3,
    currency: "diamante",
    emoji: "👁️"
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
