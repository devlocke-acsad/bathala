import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 1 Relics for Bathala
 * Based on Filipino mythology and the game's design document
 */

export const commonRelics: Relic[] = [
  {
    id: "earthwardens_plate",
    name: "Earthwarden's Plate",
    description: "Start each combat with 5 Block. Cannot be broken by non-attack damage.",
    emoji: "🛡️"
  },
  {
    id: "swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "Start each combat with 1 additional discard charge.",
    emoji: "💨"
  },
  {
    id: "ember_fetish",
    name: "Ember Fetish",
    description: "At the start of your turn, if you have no Block, gain 3 Strength.",
    emoji: "🔥"
  }
];

export const eliteRelics: Relic[] = [
  {
    id: "babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "Your hand is always considered one tier higher when evaluating poker hands.",
    emoji: "📿"
  },
  {
    id: "ancestral_blade",
    name: "Ancestral Blade",
    description: "Each time you play a Flush, gain 2 temporary Strength.",
    emoji: "⚔️"
  },
  {
    id: "tidal_amulet",
    name: "Tidal Amulet",
    description: "At the end of your turn, heal 2 HP for each card in your hand.",
    emoji: "🌊"
  }
];

export const bossRelics: Relic[] = [
  {
    id: "echo_ancestors",
    name: "Echo of the Ancestors",
    description: "Enables Five of a Kind poker hands.",
    emoji: "🌟"
  },
  {
    id: "diwatas_crown",
    name: "Diwata's Crown",
    description: "Start each combat with 10 Block and gain 1 temporary Dexterity.",
    emoji: "👑"
  }
];

export const treasureRelics: Relic[] = [
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🍀"
  },
  {
    id: "stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "Gain 10 Max HP. At the start of combat, gain 2 Block.",
    emoji: "❤️"
  }
];

export const shopRelics: Relic[] = [
  {
    id: "merchants_scale",
    name: "Merchant's Scale",
    description: "All shop items are 20% cheaper.",
    emoji: "⚖️"
  },
  {
    id: "bargain_talisman",
    name: "Bargain Talisman",
    description: "The first shop item you buy each act is free.",
    emoji: "💎"
  }
];

// All relics combined for easy access
export const allAct1Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics,
  ...shopRelics
];