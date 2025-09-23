import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 1 Relics for Bathala
 * Based on Filipino mythology - Chapter 1: The Corrupted Ancestral Forests (Lupa/Hangin Focus)
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "earthwardens_plate",
    name: "Earthwarden's Plate",
    description: "Forged from the sacred linga stones of the mountain spirits. Start each combat with 5 Block that cannot be broken by non-attack damage.",
    emoji: "🛡️"
  },
  {
    id: "swift_wind_agimat",
    name: "Agimat of the Swift Wind",
    description: "A blessed talisman that captures the essence of Tikbalang's speed. Start each combat with 1 additional discard charge.",
    emoji: "💨"
  },
  {
    id: "ember_fetish",
    name: "Ember Fetish",
    description: "Carved from the heart of a banana tree at midnight and blessed by Apolaki's flame. At the start of your turn, if you have no Block, gain 3 Strength.",
    emoji: "🔥"
  },
  {
    id: "umalagad_spirit",
    name: "Umalagad's Spirit",
    description: "The protective essence of a sea serpent that guides travelers. Gain 1 temporary Dexterity at the start of each combat.",
    emoji: "🐍"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "babaylans_talisman",
    name: "Babaylan's Talisman",
    description: "A sacred amulet blessed by the ancient shamans. Your hand is always considered one tier higher when evaluating poker hands.",
    emoji: "📿"
  },
  {
    id: "ancestral_blade",
    name: "Ancestral Blade",
    description: "A kampilan blessed by the spirits of your ancestors. Each time you play a Flush, gain 2 temporary Strength.",
    emoji: "⚔️"
  },
  {
    id: "tidal_amulet",
    name: "Tidal Amulet",
    description: "An enchanted piece of coral that pulses with the rhythm of the sea. At the end of your turn, heal 2 HP for each card in your hand.",
    emoji: "🌊"
  },
  {
    id: "sarimanok_feather",
    name: "Sarimanok Feather",
    description: "A radiant feather from the mythical bird that brings prosperity. Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🦚"
  }
];

// Boss relics (tied to boss encounters)
export const bossRelics: Relic[] = [
  {
    id: "echo_ancestors",
    name: "Echo of the Ancestors",
    description: "The whispered wisdom of your forebears that unlocks hidden potential. Enables Five of a Kind poker hands.",
    emoji: "🌟"
  },
  {
    id: "diwatas_crown",
    name: "Diwata's Crown",
    description: "A crown blessed by the benevolent nature spirits. Start each combat with 10 Block and gain 1 temporary Dexterity.",
    emoji: "👑"
  },
  {
    id: "bakunawa_scale",
    name: "Bakunawa Scale",
    description: "A scale from the great serpent that devours the moon. Reduces all incoming damage by 1 and gain 5 Max HP.",
    emoji: "🌙"
  }
];

// Treasure/event relics
export const treasureRelics: Relic[] = [
  {
    id: "lucky_charm",
    name: "Lucky Charm",
    description: "A mutya jewel that brings fortune to its bearer. Whenever you play a Straight or better, gain 1 Ginto.",
    emoji: "🍀"
  },
  {
    id: "stone_golem_heart",
    name: "Stone Golem's Heart",
    description: "The eternal heart of an earth guardian. Gain 10 Max HP. At the start of combat, gain 2 Block.",
    emoji: "❤️"
  },
  {
    id: "tigmamanukan_eye",
    name: "Tigmamanukan's Eye",
    description: "The all-seeing eye of the prophetic bird. Draw 1 additional card at the start of each combat.",
    emoji: "👁️"
  }
];

// Shop relics (available for purchase)
export const shopRelics: Relic[] = [
  {
    id: "merchants_scale",
    name: "Merchant's Scale",
    description: "A balance blessed by Lakambini to ensure fair trade. All shop items are 20% cheaper.",
    emoji: "⚖️"
  },
  {
    id: "bargain_talisman",
    name: "Bargain Talisman",
    description: "A gemstone that negotiates with shopkeepers on your behalf. The first shop item you buy each act is free.",
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
