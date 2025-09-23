import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 1 Relics for Bathala
 * Based on Filipino mythology - Chapter 1: The Corrupted Ancestral Forests (Lupa/Hangin Focus)
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "tikbalangs_hoof",
    name: "Tikbalang's Hoof",
    description: "Gain 10% chance to dodge attacks. Inspiration: Trickery (Ramos, 1990)",
    emoji: "🐴"
  },
  {
    id: "balete_root",
    name: "Balete Root",
    description: "Gain 2 Block for each Lupa card played. Inspiration: Portals (Samar, 2019)",
    emoji: "🌳"
  },
  {
    id: "sigbin_heart",
    name: "Sigbin Heart",
    description: "Deal 5 additional damage when you Burst. Inspiration: Amulets (Eugenio, 2001)",
    emoji: "❤️"
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "kapres_cigar",
    name: "Kapre's Cigar",
    description: "Summon a 5 HP minion at the start of combat. Inspiration: Smoke (Ramos, 1990)",
    emoji: " Maduro"
  },
  {
    id: "mangangaway_wand",
    name: "Mangangaway Wand",
    description: "Ignore 1 curse card each combat. Inspiration: Hexes (Eugenio, 2001)",
    emoji: "🪄"
  },
  {
    id: "forest_wardens_bark",
    name: "Forest Warden's Bark",
    description: "Gain 1 Strength for each Hangin card played.",
    emoji: "🌿"
  }
];

// Boss relics (tied to boss encounters)
export const bossRelics: Relic[] = [
  {
    id: "lupa_diwa_shard",
    name: "Lupa Diwa Shard",
    description: "Purify 1 additional card when visiting the shrine. Post-Boss Resolution: 'Hexes lift; earth stirs.'",
    emoji: "🔶"
  },
  {
    id: "wind_dancers_tassel",
    name: "Wind Dancer's Tassel",
    description: "Gain 1 additional discard charge each combat.",
    emoji: "🎐"
  }
];

// Treasure/event relics
export const treasureRelics: Relic[] = [
  {
    id: "anito_stone",
    name: "Anito Stone",
    description: "At the start of combat, gain Block equal to 3 times the number of different suits in your hand.",
    emoji: "🗿"
  },
  {
    id: "engkanto_whisper",
    name: "Engkanto Whisper",
    description: "When you play a Flush, draw 1 card. Gain 1 curse card.",
    emoji: "👻"
  }
];

// Shop relics (available for purchase)
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