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

  // PPS Update Rules - Performance-Based (Roguelike)
  ppsModifiers: {
    // Health Retention Performance (Gradient System)
    excellentHealthBonus: number;     // 90-100% HP retained
    goodHealthBonus: number;          // 70-89% HP retained
    moderateHealthPenalty: number;    // 30-49% HP retained
    poorHealthPenalty: number;        // <30% HP retained
    perfectCombatBonus: number;       // 100% HP retained (no damage)
    
    // Combat Efficiency Performance
    efficientCombatBonus: number;     // Combat completed quickly for tier
    inefficientCombatPenalty: number; // Combat took too long for tier
    
    // Skill Expression Performance
    excellentHandBonus: number;       // Four of a Kind or better
    goodHandBonus: number;            // Straight or better
    resourceEfficiencyBonus: number;  // Used minimal discard charges
    
    // Damage Performance
    highDamageEfficiencyBonus: number;  // High damage per turn ratio
    lowDamageEfficiencyPenalty: number; // Low damage per turn ratio
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

  // Comeback Momentum System (Roguelike Recovery)
  comebackBonus: {
    enabled: boolean;
    ppsThreshold: number;              // PPS level that triggers comeback momentum
    bonusPerVictory: number;           // Extra bonus for positive performance while struggling
    consecutiveWinBonus: number;       // Bonus per consecutive good performance
    maxConsecutiveBonus: number;       // Cap on consecutive performance bonuses
  };

  // Difficulty Tier Thresholds
  difficultyTiers: {
    struggling: { min: number, max: number };
    learning: { min: number, max: number };
    thriving: { min: number, max: number };
    mastering: { min: number, max: number };
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
      healthMultiplier: 1.10;   // +10% enemy HP
      damageMultiplier: 1.10;   // +10% enemy damage
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
    // Health Retention Performance
    excellentHealthBonus: 0.35,         // 90-100% HP: Strong performance
    goodHealthBonus: 0.15,              // 70-89% HP: Good performance
    moderateHealthPenalty: -0.2,        // 30-49% HP: Struggling performance
    poorHealthPenalty: -0.4,            // <30% HP: Very poor performance
    perfectCombatBonus: 0.25,           // No damage taken: Mastery bonus
    
    // Combat Efficiency Performance
    efficientCombatBonus: 0.2,          // Quick clear for your tier
    inefficientCombatPenalty: -0.2,     // Too slow for your tier
    
    // Skill Expression Performance
    excellentHandBonus: 0.25,           // Four of a Kind+: Excellent play
    goodHandBonus: 0.1,                 // Straight+: Good play
    resourceEfficiencyBonus: 0.08,      // Smart resource management (stricter trigger in DDA engine)
    
    // Damage Performance
    highDamageEfficiencyBonus: 0.2,     // High damage/turn ratio
    lowDamageEfficiencyPenalty: -0.15,  // Low damage/turn ratio
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
    ppsThreshold: 1.2,             // Trigger only when clearly struggling
    bonusPerVictory: 0.12,         // Controlled recovery bonus
    consecutiveWinBonus: 0.05,     // Smaller momentum per consecutive success
    maxConsecutiveBonus: 0.15,     // Lower cap to avoid slingshoting tiers
  },

  difficultyTiers: {
    struggling: { min: 0.0, max: 1.3 },
    learning: { min: 1.3, max: 2.8 },
    thriving: { min: 2.8, max: 4.2 },
    mastering: { min: 4.2, max: 5.0 },
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
      healthMultiplier: 1.10,
      damageMultiplier: 1.10,
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
    excellentHealthBonus: 0.5,
    goodHealthBonus: 0.2,
    moderateHealthPenalty: -0.3,
    poorHealthPenalty: -0.6,
    perfectCombatBonus: 0.4,
    efficientCombatBonus: 0.3,
    inefficientCombatPenalty: -0.3,
    excellentHandBonus: 0.35,
    goodHandBonus: 0.15,
    resourceEfficiencyBonus: 0.25,
    highDamageEfficiencyBonus: 0.3,
    lowDamageEfficiencyPenalty: -0.25,
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
    excellentHealthBonus: 0.4,
    goodHealthBonus: 0.2,
    moderateHealthPenalty: -0.15,
    poorHealthPenalty: -0.25,
    perfectCombatBonus: 0.3,
    efficientCombatBonus: 0.15,
    inefficientCombatPenalty: -0.1,
    excellentHandBonus: 0.2,
    goodHandBonus: 0.1,
    resourceEfficiencyBonus: 0.1,
    highDamageEfficiencyBonus: 0.15,
    lowDamageEfficiencyPenalty: -0.1,
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
    ppsThreshold: 2.0,           // Trigger earlier for more support
    bonusPerVictory: 0.5,        // Stronger momentum bonus
    consecutiveWinBonus: 0.25,   // Bigger consecutive performance bonus
    maxConsecutiveBonus: 0.75,   // Higher cap for recovery momentum
  },
};
