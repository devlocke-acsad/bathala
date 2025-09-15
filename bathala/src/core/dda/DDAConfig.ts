/**
 * DDA Configuration - Adjustable parameters for the Dynamic Difficulty Adjustment system
 * This file contains all tunable parameters for easy thesis experimentation
 */

export interface DDAModifiers {
  // PPS Update Rules
  ppsModifiers: {
    highHealthBonus: number;      // +PPS when ending combat with >90% HP
    lowHealthPenalty: number;     // -PPS when ending combat with <20% HP
    goodHandBonus: number;        // +PPS for Four of a Kind or better
    longCombatPenalty: number;    // -PPS when combat takes >8 turns
    perfectCombatBonus: number;   // +PPS for taking no damage
    resourceEfficiencyBonus: number; // +PPS for using few discard charges
  };

  // Difficulty Tier Thresholds
  difficultyTiers: {
    struggling: { min: 0, max: 1.0 };     // Tier 0
    learning: { min: 1.1, max: 2.5 };     // Tier 1-2
    thriving: { min: 2.6, max: 4.0 };     // Tier 3-4
    mastering: { min: 4.1, max: 5.0 };    // Tier 5
  };

  // Enemy Scaling by Tier
  enemyScaling: {
    struggling: {
      healthMultiplier: 0.8;    // -20% enemy HP
      damageMultiplier: 0.8;    // -20% enemy damage
      aiComplexity: 0.5;        // Simpler patterns
    };
    learning: {
      healthMultiplier: 1.0;    // Standard stats
      damageMultiplier: 1.0;
      aiComplexity: 1.0;
    };
    thriving: {
      healthMultiplier: 1.15;   // +15% enemy HP
      damageMultiplier: 1.15;   // +15% enemy damage
      aiComplexity: 1.3;        // More complex patterns
    };
    mastering: {
      healthMultiplier: 1.15;   // +15% enemy HP (consistent with thriving tier)
      damageMultiplier: 1.15;   // +15% enemy damage (consistent with thriving tier)
      aiComplexity: 1.5;        // Maximum complexity
    };
  };

  // Economic Adjustments
  economicScaling: {
    struggling: {
      shopPriceMultiplier: 0.8;  // -20% shop prices
      goldRewardMultiplier: 1.2; // +20% gold rewards
    };
    learning: {
      shopPriceMultiplier: 1.0;
      goldRewardMultiplier: 1.0;
    };
    thriving: {
      shopPriceMultiplier: 1.1;  // +10% shop prices
      goldRewardMultiplier: 0.9; // -10% gold rewards
    };
    mastering: {
      shopPriceMultiplier: 1.2;  // +20% shop prices
      goldRewardMultiplier: 0.8; // -20% gold rewards
    };
  };

  // Map Generation Bias
  mapGenerationBias: {
    struggling: {
      restNodeChance: 0.3;      // 30% chance for rest nodes
      combatNodeChance: 0.4;    // 40% chance for combat
      eliteNodeChance: 0.1;     // 10% chance for elite
    };
    learning: {
      restNodeChance: 0.2;      // 20% chance for rest nodes
      combatNodeChance: 0.5;    // 50% chance for combat
      eliteNodeChance: 0.15;    // 15% chance for elite
    };
    thriving: {
      restNodeChance: 0.15;     // 15% chance for rest nodes
      combatNodeChance: 0.5;    // 50% chance for combat
      eliteNodeChance: 0.2;     // 20% chance for elite
    };
    mastering: {
      restNodeChance: 0.1;      // 10% chance for rest nodes
      combatNodeChance: 0.4;    // 40% chance for combat
      eliteNodeChance: 0.25;    // 25% chance for elite
    };
  };
}

/**
 * Default DDA Configuration - Based on thesis research parameters
 * These values can be modified for A/B testing and experimentation
 */
export const DEFAULT_DDA_CONFIG: DDAModifiers = {
  ppsModifiers: {
    highHealthBonus: 0.3,
    lowHealthPenalty: -0.4,
    goodHandBonus: 0.2,
    longCombatPenalty: -0.25,
    perfectCombatBonus: 0.5,
    resourceEfficiencyBonus: 0.1,
  },

  difficultyTiers: {
    struggling: { min: 0, max: 1.0 },
    learning: { min: 1.1, max: 2.5 },
    thriving: { min: 2.6, max: 4.0 },
    mastering: { min: 4.1, max: 5.0 },
  },

  enemyScaling: {
    struggling: {
      healthMultiplier: 0.8,
      damageMultiplier: 0.8,
      aiComplexity: 0.5,
    },
    learning: {
      healthMultiplier: 1.0,
      damageMultiplier: 1.0,
      aiComplexity: 1.0,
    },
    thriving: {
      healthMultiplier: 1.15,
      damageMultiplier: 1.15,
      aiComplexity: 1.3,
    },
    mastering: {
      healthMultiplier: 1.15,
      damageMultiplier: 1.15,
      aiComplexity: 1.5,
    },
  },

  economicScaling: {
    struggling: {
      shopPriceMultiplier: 0.8,
      goldRewardMultiplier: 1.2,
    },
    learning: {
      shopPriceMultiplier: 1.0,
      goldRewardMultiplier: 1.0,
    },
    thriving: {
      shopPriceMultiplier: 1.1,
      goldRewardMultiplier: 0.9,
    },
    mastering: {
      shopPriceMultiplier: 1.2,
      goldRewardMultiplier: 0.8,
    },
  },

  mapGenerationBias: {
    struggling: {
      restNodeChance: 0.3,
      combatNodeChance: 0.4,
      eliteNodeChance: 0.1,
    },
    learning: {
      restNodeChance: 0.2,
      combatNodeChance: 0.5,
      eliteNodeChance: 0.15,
    },
    thriving: {
      restNodeChance: 0.15,
      combatNodeChance: 0.5,
      eliteNodeChance: 0.2,
    },
    mastering: {
      restNodeChance: 0.1,
      combatNodeChance: 0.4,
      eliteNodeChance: 0.25,
    },
  },
};

/**
 * Alternative configurations for A/B testing
 */
export const AGGRESSIVE_DDA_CONFIG: DDAModifiers = {
  ...DEFAULT_DDA_CONFIG,
  ppsModifiers: {
    ...DEFAULT_DDA_CONFIG.ppsModifiers,
    highHealthBonus: 0.5,     // More aggressive bonuses
    lowHealthPenalty: -0.6,   // Harsher penalties
    goodHandBonus: 0.3,
    longCombatPenalty: -0.4,
    perfectCombatBonus: 0.7,
    resourceEfficiencyBonus: 0.2,
  },
};

export const CONSERVATIVE_DDA_CONFIG: DDAModifiers = {
  ...DEFAULT_DDA_CONFIG,
  ppsModifiers: {
    ...DEFAULT_DDA_CONFIG.ppsModifiers,
    highHealthBonus: 0.2,     // Gentler adjustments
    lowHealthPenalty: -0.3,
    goodHandBonus: 0.15,
    longCombatPenalty: -0.2,
    perfectCombatBonus: 0.4,
    resourceEfficiencyBonus: 0.05,
  },
};
