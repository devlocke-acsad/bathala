/**\n * @deprecated — Lore data now lives in each creature config file under\n * `src/data/enemies/creatures/*.ts` as part of the EnemyConfig SSOT.\n * Use `EnemyRegistry.resolve(id).lore` or `EnemyEntity.lore` instead.\n *\n * This file is kept temporarily for backward compatibility with tests\n * that reference ENEMY_LORE_DATA directly.  Do NOT add new entries here.\n */

export interface EnemyLore {
  id: string;
  name: string;
  description: string;
  mythology: string;
  abilities: string[];
  weakness: string;
}

// Common Enemies
export const TIKBALANG_SCOUT_LORE: EnemyLore = {
  id: "tikbalang_scout",
  name: "Tikbalang Scout",
  description: "A creature with the head of a horse that misleads travelers.",
  mythology: "Tikbalang were forest protectors, now they mislead with backward hooves.",
  abilities: ["Confuse"],
  weakness: "Respect for the forest."
};

export const BALETE_WRAITH_LORE: EnemyLore = {
    id: "balete_wraith",
    name: "Balete Wraith",
    description: "A spirit inhabiting a Balete tree, a portal to the spirit world.",
    mythology: "Balete trees are anito portals, haunted by engkanto-twisted spirits.",
    abilities: ["Strengthen"],
    weakness: "Sunlight."
};

export const SIGBIN_CHARGER_LORE: EnemyLore = {
    id: "sigbin_charger",
    name: "Sigbin Charger",
    description: "A creature that steals hearts for its amulets.",
    mythology: "Sigbin steal hearts for amulets, once loyal to Bathala.",
    abilities: ["Charge"],
    weakness: "Sudden loud noises."
};

export const DUWENDE_TRICKSTER_LORE: EnemyLore = {
    id: "duwende_trickster",
    name: "Duwende Trickster",
    description: "A goblin-like creature that can grant boons or curses.",
    mythology: "Duwende grant boons/curses, warped by engkanto lies.",
    abilities: ["Steal Block", "Disrupt Draw"],
    weakness: "Iron."
};

export const TIYANAK_AMBUSHER_LORE: EnemyLore = {
    id: "tiyanak_ambusher",
    name: "Tiyanak Ambusher",
    description: "A lost infant spirit that mimics a baby's cry to lure its victims.",
    mythology: "Tiyanak, lost infant spirits mimicking babies to attack.",
    abilities: ["Fear", "Critical Attack"],
    weakness: "Holy water."
};

export const AMOMONGO_LORE: EnemyLore = {
    id: "amomongo",
    name: "Amomongo",
    description: "An ape-like creature with long nails that attacks livestock.",
    mythology: "Amomongo, ape-like with long nails, attacking livestock.",
    abilities: ["Bleed"],
    weakness: "Fire."
};

export const BUNGISNGIS_LORE: EnemyLore = {
    id: "bungisngis",
    name: "Bungisngis",
    description: "A one-eyed laughing giant.",
    mythology: "Bungisngis, one-eyed laughing giants, once jovial.",
    abilities: ["Laugh Debuff"],
    weakness: "Being outsmarted."
};

// Elite Enemies
export const TAWONG_LIPOD_LORE: EnemyLore = {
    id: "tawong_lipod",
    name: "Tawong Lipod",
    description: "An invisible wind being.",
    mythology: "Tawong Lipod, invisible Bikol wind beings, once harmonious.",
    abilities: ["Invisible", "Stun"],
    weakness: "Concentrated smoke."
};

export const MANGANGAWAY_LORE: EnemyLore = {
    id: "mangangaway",
    name: "Mangangaway",
    description: "A sorcerer who casts evil spells.",
    mythology: "Mangangaway, sorcerers casting evil spells.",
    abilities: ["Mimic Elements", "Curse Cards"],
    weakness: "Pure faith."
};

// Boss
export const KAPRE_SHADE_LORE: EnemyLore = {
    id: "kapre_shade",
    name: "Kapre Shade",
    description: "A tree giant that smokes a large cigar.",
    mythology: "Kapre, tree giants smoking cigars, loyal to Bathala.",
    abilities: ["AoE Burn", "Summon Minions", "Strengthen", "Poison"],
    weakness: "Offerings of tobacco."
};

// Lore data structure
export const ENEMY_LORE_DATA: Record<string, EnemyLore> = {
  "tikbalang_scout": TIKBALANG_SCOUT_LORE,
  "balete_wraith": BALETE_WRAITH_LORE,
  "sigbin_charger": SIGBIN_CHARGER_LORE,
  "duwende_trickster": DUWENDE_TRICKSTER_LORE,
  "tiyanak_ambusher": TIYANAK_AMBUSHER_LORE,
  "amomongo": AMOMONGO_LORE,
  "bungisngis": BUNGISNGIS_LORE,
  "kapre_shade": KAPRE_SHADE_LORE,
  "tawong_lipod": TAWONG_LIPOD_LORE,
  "mangangaway": MANGANGAWAY_LORE
};