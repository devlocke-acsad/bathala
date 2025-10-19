import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 2 Relics for Bathala
 * Based on Filipino mythology - Chapter 2: The Submerged Barangays (Tubig/Apoy Focus)
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "sirenas_scale",
    name: "Sirena's Scale",
    description: "Heal 2 HP for each Tubig card played. Inspiration: Healing (Ramos, 1990)",
    emoji: "🧜‍♀️"
  },
  {
    id: "siyokoys_shell",
    name: "Siyokoy's Shell",
    description: "Gain 3 Block when you play an Apoy card. Inspiration: Armor (Ramos, 1990)",
    emoji: "🐚"
  },
  {
    id: "tidal_spirit_essence",
    name: "Tidal Spirit Essence",
    description: "At the end of your turn, if you have more than 50% HP, heal 3 HP.",
    emoji: "💧"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "elemental_core",
    name: "Elemental Core",
    description: "Deal 3 additional damage when you play both Apoy and Tubig cards in the same hand. Inspiration: Balance (Jocano, 1969)",
    emoji: "🔥🌊"
  },
  {
    id: "merfolk_trident",
    name: "Merfolk Trident",
    description: "When you play a Three of a Kind or better, deal 4 damage to all enemies.",
    emoji: "🔱"
  },
  {
    id: "coral_ward",
    name: "Coral Ward",
    description: "Gain 1 temporary Dexterity for each different suit in your hand.",
    emoji: "层出不"
  }
];

// Boss relics (tied to boss encounters)
export const bossRelics: Relic[] = [
  {
    id: "bakunawa_fang",
    name: "Bakunawa Fang",
    description: "Deal 5 additional damage when using any relic. Inspiration: Ferocity (Eugenio, 2001)",
    emoji: "🦷"
  },
  {
    id: "tubig_diwa_shard",
    name: "Tubig Diwa Shard",
    description: "Infuse 1 additional card when visiting the shrine. Post-Boss Resolution: 'Hunger fades; skies thunder.'",
    emoji: "🔷"
  }
];

// Treasure/event relics
export const treasureRelics: Relic[] = [
  {
    id: "moonlight_pearl",
    name: "Moonlight Pearl",
    description: "At the start of your turn, if you have no curses, draw 1 card.",
    emoji: "⚪"
  },
  {
    id: "depth_dwellers_lantern",
    name: "Depth Dweller's Lantern",
    description: "Reveal 2 additional cards during hand selection.",
    emoji: "🏮"
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
export const allAct2Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics,
  ...shopRelics
];