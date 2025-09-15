/**
 * RuleBasedDDA - Core Dynamic Difficulty Adjustment Engine
 * Implements the thesis research algorithm for maintaining player flow
 */

import { 
  CombatMetrics, 
  PlayerPerformanceScore, 
  DifficultyAdjustment, 
  DifficultyTier, 
  DDAEvent,
  HAND_QUALITY_SCORES 
} from "./DDATypes";
import { DEFAULT_DDA_CONFIG, DDAModifiers } from "./DDAConfig";
import { HandType } from "../types/CombatTypes";

export class RuleBasedDDA {
  private static instance: RuleBasedDDA;
  private config: DDAModifiers;
  private playerPPS: PlayerPerformanceScore;
  private events: DDAEvent[] = [];
  private enabled: boolean = true;

  private constructor(config: DDAModifiers = DEFAULT_DDA_CONFIG) {
    this.config = config;
    this.playerPPS = this.initializePlayerPPS();
  }

  static getInstance(config?: DDAModifiers): RuleBasedDDA {
    if (!RuleBasedDDA.instance) {
      RuleBasedDDA.instance = new RuleBasedDDA(config);
    }
    return RuleBasedDDA.instance;
  }

  /**
   * Initialize player performance score
   */
  private initializePlayerPPS(): PlayerPerformanceScore {
    return {
      currentPPS: 2.5, // Starting baseline
      previousPPS: 2.5,
      tier: "learning",
      lastUpdated: Date.now(),
      combatHistory: [],
      sessionStartTime: Date.now(),
    };
  }

  /**
   * Update configuration for A/B testing
   */
  public updateConfig(newConfig: DDAModifiers): void {
    this.config = newConfig;
    this.logEvent("config_update", { config: newConfig });
  }

  /**
   * Process combat results and update PPS
   */
  public processCombatResults(metrics: CombatMetrics): PlayerPerformanceScore {
    if (!this.enabled) return this.playerPPS;

    // Store combat in history
    this.playerPPS.combatHistory.push(metrics);
    
    // Keep only last 10 combats for performance
    if (this.playerPPS.combatHistory.length > 10) {
      this.playerPPS.combatHistory.shift();
    }

    // Calculate PPS adjustments
    const ppsAdjustment = this.calculatePPSAdjustment(metrics);
    
    // Update PPS
    this.playerPPS.previousPPS = this.playerPPS.currentPPS;
    this.playerPPS.currentPPS = Math.max(0, Math.min(5, this.playerPPS.currentPPS + ppsAdjustment));
    this.playerPPS.lastUpdated = Date.now();

    // Update difficulty tier
    const newTier = this.calculateDifficultyTier(this.playerPPS.currentPPS);
    const tierChanged = newTier !== this.playerPPS.tier;
    
    if (tierChanged) {
      this.logEvent("tier_change", {
        fromTier: this.playerPPS.tier,
        toTier: newTier,
        ppsChange: ppsAdjustment,
        trigger: this.getPPSChangeReason(metrics),
      });
    }
    
    this.playerPPS.tier = newTier;

    // Log PPS update
    this.logEvent("pps_update", {
      adjustment: ppsAdjustment,
      newPPS: this.playerPPS.currentPPS,
      metrics: {
        healthPercentage: metrics.healthPercentage,
        turnCount: metrics.turnCount,
        bestHand: metrics.bestHandAchieved,
        victory: metrics.victory,
      },
    });

    return this.playerPPS;
  }

  /**
   * Calculate PPS adjustment based on combat performance
   */
  private calculatePPSAdjustment(metrics: CombatMetrics): number {
    let adjustment = 0;
    const config = this.config.ppsModifiers;

    // Health retention bonus/penalty
    if (metrics.healthPercentage > 0.9) {
      adjustment += config.highHealthBonus;
    } else if (metrics.healthPercentage < 0.2) {
      adjustment += config.lowHealthPenalty;
    }

    // Perfect combat bonus (no damage taken)
    if (metrics.damageReceived === 0 && metrics.victory) {
      adjustment += config.perfectCombatBonus;
    }

    // Hand quality bonus
    const bestHandQuality = HAND_QUALITY_SCORES[metrics.bestHandAchieved] || 0;
    if (bestHandQuality >= HAND_QUALITY_SCORES.four_of_a_kind) {
      adjustment += config.goodHandBonus;
    }

    // Combat duration penalty (GDD specifies >8 turns)
    if (metrics.turnCount > 8) {
      adjustment += config.longCombatPenalty;
    }

    // Resource efficiency bonus
    const discardEfficiency = 1 - (metrics.discardsUsed / Math.max(1, metrics.maxDiscardsAvailable));
    if (discardEfficiency > 0.8) {
      adjustment += config.resourceEfficiencyBonus;
    }

    // Victory/defeat modifier
    if (!metrics.victory) {
      adjustment -= 0.3; // Additional penalty for losing
    }

    return adjustment;
  }

  /**
   * Calculate difficulty tier from PPS
   */
  private calculateDifficultyTier(pps: number): DifficultyTier {
    const tiers = this.config.difficultyTiers;
    
    if (pps >= tiers.mastering.min && pps <= tiers.mastering.max) {
      return "mastering";
    } else if (pps >= tiers.thriving.min && pps <= tiers.thriving.max) {
      return "thriving";
    } else if (pps >= tiers.learning.min && pps <= tiers.learning.max) {
      return "learning";
    } else {
      return "struggling";
    }
  }

  /**
   * Get current difficulty adjustments
   */
  public getCurrentDifficultyAdjustment(): DifficultyAdjustment {
    const tier = this.playerPPS.tier;
    const enemyScaling = this.config.enemyScaling[tier];
    const economicScaling = this.config.economicScaling[tier];
    const mapBias = this.config.mapGenerationBias[tier];

    return {
      tier,
      enemyHealthMultiplier: enemyScaling.healthMultiplier,
      enemyDamageMultiplier: enemyScaling.damageMultiplier,
      shopPriceMultiplier: economicScaling.shopPriceMultiplier,
      goldRewardMultiplier: economicScaling.goldRewardMultiplier,
      restNodeBias: mapBias.restNodeChance,
      narrativeContext: this.getNarrativeContext(tier),
    };
  }

  /**
   * Get narrative context for difficulty changes
   */
  private getNarrativeContext(tier: DifficultyTier): string {
    const contexts = {
      struggling: "The spirits sense your struggle and offer gentle guidance...",
      learning: "You walk the balanced path, learning the ways of combat...",
      thriving: "Your growing power attracts stronger challenges...",
      mastering: "The ancient forces recognize your mastery and send their greatest trials...",
    };
    return contexts[tier];
  }

  /**
   * Get reason for PPS change for logging
   */
  private getPPSChangeReason(metrics: CombatMetrics): string {
    const reasons = [];
    
    if (metrics.healthPercentage > 0.9) reasons.push("high_health");
    if (metrics.healthPercentage < 0.2) reasons.push("low_health");
    if (metrics.damageReceived === 0) reasons.push("perfect_combat");
    if (HAND_QUALITY_SCORES[metrics.bestHandAchieved] >= HAND_QUALITY_SCORES.four_of_a_kind) {
      reasons.push("good_hand");
    }
    if (metrics.turnCount > 8) {
      reasons.push("long_combat");
    }
    if (!metrics.victory) reasons.push("defeat");
    
    return reasons.join(", ") || "standard_performance";
  }

  /**
   * Log DDA event
   */
  private logEvent(type: DDAEvent["type"], data: any): void {
    const event: DDAEvent = {
      timestamp: Date.now(),
      type,
      data,
      pps: this.playerPPS.currentPPS,
      tier: this.playerPPS.tier,
    };
    
    this.events.push(event);
    
    // Keep only last 100 events for performance
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  /**
   * Get current player performance score
   */
  public getPlayerPPS(): PlayerPerformanceScore {
    return { ...this.playerPPS };
  }

  /**
   * Get all DDA events for analysis
   */
  public getEvents(): DDAEvent[] {
    return [...this.events];
  }

  /**
   * Reset DDA system for new session
   */
  public resetSession(): void {
    this.playerPPS = this.initializePlayerPPS();
    this.events = [];
    this.logEvent("session_reset", { timestamp: Date.now() });
  }

  /**
   * Enable/disable DDA system
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.logEvent("dda_toggle", { enabled });
  }

  /**
   * Get DDA system status
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Simulate combat results for testing
   */
  public simulateCombat(scenario: Partial<CombatMetrics>): PlayerPerformanceScore {
    const mockMetrics: CombatMetrics = {
      combatId: `sim_${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: scenario.endHealth || 60,
      healthPercentage: (scenario.endHealth || 60) / 80,
      turnCount: scenario.turnCount || 5,
      damageDealt: scenario.damageDealt || 25,
      damageReceived: scenario.damageReceived || 20,
      discardsUsed: scenario.discardsUsed || 1,
      maxDiscardsAvailable: 2,
      handsPlayed: scenario.handsPlayed || ["pair", "high_card", "three_of_a_kind"],
      bestHandAchieved: scenario.bestHandAchieved || "three_of_a_kind",
      averageHandQuality: 2.0,
      victory: scenario.victory !== undefined ? scenario.victory : true,
      combatDuration: 30000,
      enemyType: scenario.enemyType || "common",
      enemyName: "Test Enemy",
      enemyStartHealth: 25,
      ...scenario,
    };

    return this.processCombatResults(mockMetrics);
  }
}
