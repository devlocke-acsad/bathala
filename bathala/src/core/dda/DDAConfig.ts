/**
 * DDA Configuration - Adjustable parameters for the Dynamic Difficulty Adjustment system
 * This file contains all tunable parameters for easy thesis experimentation
 */

export interface DDAModifiers {
  // Calibration Settings
  calibration: {
    enabled: boolean;              // Enable calibration period
    combatCount: number;           // Number of combats before DDA activates
    trackPPSDuringCalibration: boolean; // Track PPS but don't apply adjustments
  };

  // PPS Update Rules
  ppsModifiers: {
    // Victory/Defeat (Solution 1)
    victoryBonus: number;         // +PPS for winning (always positive)
    defeatPenalty: number;        // -PPS for losing
    
    // Health-based
    highHealthBonus: number;      // +PPS when ending combat with >90% HP
    lowHealthPenalty: number;     // -PPS when ending combat with <20% HP
    
    // Performance-based
    goodHandBonus: number;        // +PPS for Four of a Kind or better
    longCombatPenalty: number;    // -PPS when combat takes >8 turns
    perfectCombatBonus: number;   // +PPS for taking no damage
    resourceEfficiencyBonus: number; // +PPS for using few discard charges
  };

  // Tier-Based Modifier Scaling (Solution 2)
  tierScaling: {
    struggling: {
      penaltyMultiplier: number;  // Scale penalties when struggling
      bonusMultiplier: number;    // Scale bonuses when struggling
    };
    learning: {
      penaltyMultiplier: number;
      bonusMultiplier: number;
    };
    thriving: {
      penaltyMultiplier: number;
      bonusMultiplier: number;
    };
    mastering: {
      penaltyMultiplier: number;
      bonusMultiplier: number;
    };
  };

  // Comeback Bonus System (Solution 3)
  comebackBonus: {
    enabled: boolean;
    ppsThreshold: number;         // PPS level that triggers comeback bonus
    bonusPerVictory: number;      // Extra bonus for wins while struggling
    consecutiveWinBonus: number;  // Bonus per consecutive win
    maxConsecutiveBonus: number;  // Cap on consecutive win bonuses
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
  calibration: {
    enabled: true,
    combatCount: 3,                 // First 3 combats are calibration
    trackPPSDuringCalibration: true // Track PPS but lock difficulty tier
  },

  ppsModifiers: {
    // Victory/Defeat - ensures winning is always rewarding
    victoryBonus: 0.3,
    defeatPenalty: -0.5,
    
    // Health-based - reduced penalties to prevent death spiral
    highHealthBonus: 0.3,
    lowHealthPenalty: -0.3,        // Reduced from -0.4
    
    // Performance-based
    goodHandBonus: 0.2,
    longCombatPenalty: -0.15,      // Reduced from -0.25
    perfectCombatBonus: 0.5,
    resourceEfficiencyBonus: 0.1,
  },

  tierScaling: {
    struggling: {
      penaltyMultiplier: 0.5,      // Half penalties when struggling
      bonusMultiplier: 1.5,        // 50% more bonuses for improvement
    },
    learning: {
      penaltyMultiplier: 1.0,      // Standard
      bonusMultiplier: 1.0,
    },
    thriving: {
      penaltyMultiplier: 1.2,      // Slightly harsher penalties
      bonusMultiplier: 0.8,        // Smaller bonuses (already doing well)
    },
    mastering: {
      penaltyMultiplier: 1.5,      // Full penalties at high skill
      bonusMultiplier: 0.5,        // Minimal bonuses
    },
  },

  comebackBonus: {
    enabled: true,
    ppsThreshold: 1.5,             // Trigger when deep in struggling tier
    bonusPerVictory: 0.4,          // Strong bonus to help recovery
    consecutiveWinBonus: 0.2,      // Additional per consecutive win
    maxConsecutiveBonus: 0.6,      // Cap at 3 consecutive wins
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
  calibration: {
    enabled: false,              // No calibration - immediate response
    combatCount: 0,
    trackPPSDuringCalibration: false
  },
  ppsModifiers: {
    victoryBonus: 0.4,
    defeatPenalty: -0.7,
    highHealthBonus: 0.5,     // More aggressive bonuses
    lowHealthPenalty: -0.5,   // Harsher penalties
    goodHandBonus: 0.3,
    longCombatPenalty: -0.3,
    perfectCombatBonus: 0.7,
    resourceEfficiencyBonus: 0.2,
  },
  tierScaling: {
    ...DEFAULT_DDA_CONFIG.tierScaling,
    struggling: {
      penaltyMultiplier: 0.7,  // Less help - more aggressive
      bonusMultiplier: 1.3,
    },
  },
  comebackBonus: {
    ...DEFAULT_DDA_CONFIG.comebackBonus,
    enabled: false,            // No comeback help in aggressive mode
  },
};

export const CONSERVATIVE_DDA_CONFIG: DDAModifiers = {
  ...DEFAULT_DDA_CONFIG,
  calibration: {
    enabled: true,
    combatCount: 5,              // Longer calibration period
    trackPPSDuringCalibration: true
  },
  ppsModifiers: {
    victoryBonus: 0.4,           // Higher victory reward
    defeatPenalty: -0.3,         // Lower defeat penalty
    highHealthBonus: 0.2,     // Gentler adjustments
    lowHealthPenalty: -0.2,   // Even gentler penalties
    goodHandBonus: 0.15,
    longCombatPenalty: -0.1,  // Minimal penalty
    perfectCombatBonus: 0.4,
    resourceEfficiencyBonus: 0.05,
  },
  tierScaling: {
    struggling: {
      penaltyMultiplier: 0.3,    // Very light penalties
      bonusMultiplier: 2.0,      // Double bonuses for struggling players
    },
    learning: {
      penaltyMultiplier: 0.8,
      bonusMultiplier: 1.2,
    },
    thriving: {
      penaltyMultiplier: 1.0,
      bonusMultiplier: 1.0,
    },
    mastering: {
      penaltyMultiplier: 1.2,
      bonusMultiplier: 0.8,
    },
  },
  comebackBonus: {
    enabled: true,
    ppsThreshold: 2.0,           // Trigger earlier
    bonusPerVictory: 0.5,        // Stronger comeback bonus
    consecutiveWinBonus: 0.3,    // Bigger consecutive bonus
    maxConsecutiveBonus: 0.9,    // Higher cap
  },
};
