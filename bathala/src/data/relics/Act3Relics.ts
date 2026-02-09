import { Relic } from "../../core/types/CombatTypes";

/**
 * Act 3 Relics for Bathala
 * Chapter 3: The Skyward Citadel (Multi-element Focus)
 * Based on Filipino mythology - celestial and divine themed creatures
 * 
 * Lore Sources:
 * - Tigmamanukan: Celestial bird that lives in the sky, omen of fortune
 * - Diwata: Benevolent nature spirits and guardians
 * - Sarimanok: Legendary bird symbolizing good fortune
 * - Bulalakaw: Meteor/shooting star spirits with fiery wings
 * - Minokawa: Giant bird that causes eclipses
 * - Alan: Winged humanoid spirits that live in forests
 * - Ekek: Vampire-like bird creature
 * - Ribung Linti: Lightning spirits
 * - Apolaki: God of the sun and war
 * - Bathala: Supreme deity (False Bathala is the impostor)
 */

// Common relics (tied to regular enemies)
export const commonRelics: Relic[] = [
  {
    id: "tigmamanukan_feather",
    name: "Tigmamanukan Feather",
    description: "A radiant feather from the celestial omen bird. Draw 1 additional card whenever you play a high-tier hand (Straight or better). Fortune favors the skilled.",
    emoji: "🪶",
    lore: "The Tigmamanukan are prophetic birds of Bathala, their flight patterns foretelling fortune and calamity. A single feather carries the weight of foresight, revealing paths hidden to mortal eyes.",
    spriteKey: "relic_tigmamanukan_feather",
  },
  {
    id: "diwata_veil",
    name: "Diwata Veil",
    description: "A shimmering veil blessed by the benevolent nature spirits. Gain 10% dodge chance against all attacks. The Diwata's protection shields you from harm.",
    emoji: "✨",
    lore: "Woven from moonbeams by the divine Diwata guardians who own the deer and the fish, this veil bends light around its wearer. Not even the keenest predator can strike what it cannot perceive.",
    spriteKey: "relic_diwata_veil",
  },
  {
    id: "sarimanok_plumage",
    name: "Sarimanok Plumage",
    description: "Brilliant plumage from the legendary fortune bird. Gain 1 additional Special action charge at the start of combat. Good fortune empowers your elemental abilities.",
    emoji: "🦚",
    lore: "The Sarimanok is the ornate bird of the Maranao people, a symbol of prosperity perched between the mortal world and the heavens. Its plumage shimmers with elemental energy drawn from all four winds.",
    spriteKey: "relic_sarimanok_plumage",
  },
  {
    id: "bulalakaw_spark",
    name: "Bulalakaw Spark",
    description: "A captured meteor fragment with fiery essence. Apply 3 Burn whenever you play a hand with multiple elements. The shooting star's flame ignites your combos.",
    emoji: "☄️",
    lore: "Bulalakaw are comet-like omen birds that streak across the sky, heralding illness or great change. This captured spark of their trail burns with celestial fire that intensifies when multiple elements collide.",
    spriteKey: "relic_bulalakaw_spark",
  }
];

// Elite relics (tied to elite enemies)
export const eliteRelics: Relic[] = [
  {
    id: "minokawa_claw",
    name: "Minokawa Claw",
    description: "The talon of the eclipse-causing giant bird. Ignore the first card steal or discard effect from enemies each combat. The Minokawa guards what is yours.",
    emoji: "🦅",
    lore: "The Minokawa is the Bagobo cosmic devourer that swallows the sun and moon, causing eclipses. Its talon grips with absolute finality — what it claims, none can take back.",
    spriteKey: "relic_minokawa_claw",
  },
  {
    id: "alan_wing",
    name: "Alan Wing",
    description: "The ethereal wing of a forest spirit. Deal +5 damage when you have summoned minions or allies in combat. The Alan empowers your companions.",
    emoji: "🕊️",
    lore: "The Alan are half-human, half-bird spirits of Bikol who adopt lost children and raise them as their own. Their wings carry the protective fury of a parent — devastating when defending those in their care.",
    spriteKey: "relic_alan_wing",
  },
  {
    id: "ekek_fang",
    name: "Ekek Fang",
    description: "The vampiric fang of the night creature. Deal +3 damage during the second half of combat (after turn 5). The Ekek's power grows with darkness.",
    emoji: "🦇",
    lore: "Ekek are nocturnal bird vampires that suck the tongues of sleeping victims. Their fangs grow sharper as night deepens — and in prolonged battles, this fang draws ever more blood.",
    spriteKey: "relic_ekek_fang",
  },
  {
    id: "linti_bolt",
    name: "Linti Bolt",
    description: "A crystallized lightning bolt from the Ribung Linti spirits. Deal +5 damage whenever you play a hand with 3 or more different elements. The storm rewards diversity.",
    emoji: "⚡",
    lore: "The Ribung Linti are Ilocano lightning spirits that strike in tandem, their thunder shaking the heavens. This crystallized bolt resonates with elemental diversity — the more elements aligned, the fiercer it strikes.",
    spriteKey: "relic_linti_bolt",
  }
];

// Boss relic (tied to False Bathala boss)
export const bossRelics: Relic[] = [
  {
    id: "apolaki_spear",
    name: "Apolaki's Spear",
    description: "The divine spear of the sun god himself. Deal +5 damage on all multi-element hands. Gain 2 Strength at the start of combat. The sun god's power flows through you.",
    emoji: "🔱",
    lore: "Apolaki, god of war and the sun, once feuded with his sister Mayari over dominion of the sky. His spear carries the blinding wrath of solar fire — multi-element hands mirror the balance his father Bathala sought.",
    spriteKey: "relic_apolaki_spear",
  }
];

// Treasure/event relic
export const treasureRelics: Relic[] = [
  {
    id: "coconut_diwa",
    name: "Coconut Diwa",
    description: "The sacred spirit essence contained in a blessed coconut. Ignore the first nullify or buff removal effect each combat. Your blessings cannot be easily stripped.",
    emoji: "🥥",
    lore: "In Tagalog myth, the coconut tree grew from the grave of a slain god — Bathala's gift of life from death. This diwa carries that sacred resilience: what is blessed by the supreme creator cannot be easily unmade.",
    spriteKey: "relic_coconut_diwa",
  }
];

// All Act 3 relics combined
export const allAct3Relics: Relic[] = [
  ...commonRelics,
  ...eliteRelics,
  ...bossRelics,
  ...treasureRelics
];

/**
 * ACT 3 RELIC REGISTRY - Single source of truth for Act 3 relic data
 */
export const ACT3_RELIC_REGISTRY = {
  // Relic categories
  COMMON: commonRelics,
  ELITE: eliteRelics,
  BOSS: bossRelics,
  TREASURE: treasureRelics,
  ALL: allAct3Relics,
  
  // Relic lookup by ID
  getById: (id: string): Relic | undefined => {
    return allAct3Relics.find(relic => relic.id === id);
  },
  
  // Get relics by category
  getByCategory: (category: 'common' | 'elite' | 'boss' | 'treasure'): Relic[] => {
    switch (category) {
      case 'common': return commonRelics;
      case 'elite': return eliteRelics;
      case 'boss': return bossRelics;
      case 'treasure': return treasureRelics;
      default: return [];
    }
  }
};

/**
 * ACT 3 RELIC EFFECTS REGISTRY - Maps relic IDs to their effect types
 */
export const ACT3_RELIC_EFFECTS = {
  // Start of combat effects
  START_OF_COMBAT: [
    'sarimanok_plumage',       // +1 Special action charge
    'apolaki_spear'            // +2 Strength
  ],
  
  // After hand played effects
  AFTER_HAND_PLAYED: [
    'tigmamanukan_feather',    // Draw 1 card on Straight+
    'bulalakaw_spark',         // Apply 3 Burn on multi-element hands
    'linti_bolt',              // +5 damage on 3+ element hands
    'apolaki_spear'            // +5 damage on multi-element hands
  ],
  
  // Damage modification
  DAMAGE_MODIFICATION: [
    'alan_wing',               // +5 damage with minions
    'ekek_fang',               // +3 damage after turn 5
    'linti_bolt',              // +5 damage on 3+ element hands
    'apolaki_spear'            // +5 damage on multi-element hands
  ],
  
  // Defensive effects
  DEFENSIVE: [
    'diwata_veil'              // +10% dodge chance
  ],
  
  // Effect resistance
  EFFECT_RESISTANCE: [
    'minokawa_claw',           // Ignore first steal/discard
    'coconut_diwa'             // Ignore first nullify/buff removal
  ],
  
  // Multi-element synergy
  MULTI_ELEMENT_SYNERGY: [
    'bulalakaw_spark',         // Apply 3 Burn on multi-element
    'linti_bolt',              // +5 damage on 3+ elements
    'apolaki_spear'            // +5 damage on multi-element
  ],
  
  // Passive combat effects
  PASSIVE_COMBAT: [
    'diwata_veil',             // +10% dodge
    'ekek_fang',               // +3 damage after turn 5
    'alan_wing'                // +5 damage with minions
  ]
};

/**
 * Helper function to check if a relic has a specific effect type
 */
export function hasAct3RelicEffect(relicId: string, effectType: keyof typeof ACT3_RELIC_EFFECTS): boolean {
  return ACT3_RELIC_EFFECTS[effectType].includes(relicId);
}

/**
 * Helper function to get all Act 3 relics with a specific effect type
 */
export function getAct3RelicsWithEffect(effectType: keyof typeof ACT3_RELIC_EFFECTS): Relic[] {
  return ACT3_RELIC_EFFECTS[effectType]
    .map(id => ACT3_RELIC_REGISTRY.getById(id))
    .filter((relic): relic is Relic => relic !== undefined);
}

/**
 * Helper function to get Act 3 relic by ID with type safety
 */
export function getAct3RelicById(id: string): Relic {
  const relic = ACT3_RELIC_REGISTRY.getById(id);
  if (!relic) {
    throw new Error(`Act 3 Relic with ID "${id}" not found in registry`);
  }
  return relic;
}

/**
 * Helper function to get a random common relic from Act 3
 * @returns A random relic from the Act 3 common relic pool
 */
export function getRandomCommonRelic(): Relic {
  const index = Math.floor(Math.random() * commonRelics.length);
  return commonRelics[index];
}

/**
 * Helper function to get a random elite relic from Act 3
 * @returns A random relic from the Act 3 elite relic pool
 */
export function getRandomEliteRelic(): Relic {
  const index = Math.floor(Math.random() * eliteRelics.length);
  return eliteRelics[index];
}

/**
 * Helper function to get a random boss relic from Act 3
 * @returns A random relic from the Act 3 boss relic pool
 */
export function getRandomBossRelic(): Relic {
  const index = Math.floor(Math.random() * bossRelics.length);
  return bossRelics[index];
}

/**
 * Helper function to get a random treasure relic from Act 3
 * @returns A random relic from the Act 3 treasure relic pool
 */
export function getRandomTreasureRelic(): Relic {
  const index = Math.floor(Math.random() * treasureRelics.length);
  return treasureRelics[index];
}
