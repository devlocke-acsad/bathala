import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 3 Relics for Bathala
 * Based on Filipino mythology - Chapter 3: The Skyward Citadel (Multi-Element Focus)
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "tigmamanukan_feather",
    name: "Tigmamanukan Feather",
    description: "Draw 1 additional card when you play a Flush or better. Inspiration: Omens (Jocano, 1969)",
    emoji: "🪶"
  },
  {
    id: "heavenly_breeze",
    name: "Heavenly Breeze",
    description: "Gain 1 Dexterity when you play cards of 3 or more different suits.",
    emoji: "层出不"
  },
  {
    id: "cloud_spinner_silk",
    name: "Cloud Spinner's Silk",
    description: "When you play a Straight Flush, gain 5 temporary Block.",
    emoji: "☁️"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "apolakis_spear",
    name: "Apolaki's Spear",
    description: "Deal 5 additional damage when you play cards of 4 different suits. Inspiration: Power (Jocano, 1969)",
    emoji: "🗡️"
  },
  {
    id: "mayaris_bow",
    name: "Mayari's Bow",
    description: "When you play a Four of a Kind, deal 8 damage to a random enemy.",
    emoji: "🏹"
  },
  {
    id: "celestial_forge",
    name: "Celestial Forge",
    description: "When you play a Five of a Kind, upgrade a random card in your hand.",
    emoji: "🔥"
  }
];

// Boss relics (tied to boss encounters)
export const bossRelics: Relic[] = [
  {
    id: "coconut_diwa",
    name: "Coconut Diwa",
    description: "Ignore 1 nullify effect each combat. Inspiration: Life myth (Samar, 2019)",
    emoji: "🥥"
  },
  {
    id: "skyward_diwa_shard",
    name: "Skyward Diwa Shard",
    description: "Infuse 2 additional cards when visiting the shrine. Post-Boss Resolution: 'Shadows fade; order returns.'",
    emoji: "🔶🔷"
  }
];

// Treasure/event relics
export const treasureRelics: Relic[] = [
  {
    id: "divine_spark",
    name: "Divine Spark",
    description: "At the start of combat, gain 1 temporary Strength for each different poker hand tier available.",
    emoji: "✨"
  },
  {
    id: "false_gods_mask",
    name: "False God's Mask",
    description: "When you play a Five of a Kind, gain 10 Block and draw 2 cards.",
    emoji: "🎭"
  },
  {
    id: "merchants_scale",
    name: "Merchant's Scale",
    description: "A balance blessed by Lakambini to ensure fair trade. All shop items are 20% cheaper.",
    emoji: "⚖️"
  }
];

// Shop relics (available for purchase)
// Note: merchants_scale has been moved to treasureRelics for random encounters
export const shopRelics: Relic[] = [
  {
    id: "bargain_talisman",
    name: "Bargain Talisman",
    description: "The first shop item you buy each act is free.",
    emoji: "💎"
  }
];

// All relics combined for easy access
export const allAct3Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics,
  ...shopRelics
];