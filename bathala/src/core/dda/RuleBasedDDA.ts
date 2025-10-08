/**
 * RuleBasedDDA - Core Dynamic Difficulty Adjustment Engine for Roguelikes
 * 
 * Implements performance-based DDA inspired by modern roguelikes:
 * - Hades: Adaptive encounter difficulty based on run performance
 * - Dead Cells: Progressive difficulty scaling with skill demonstration
 * - Risk of Rain 2: Dynamic challenge adjustment during runs
 * 
 * Focus: Performance quality over win/loss, since defeats end the run
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
   * Force clear singleton instance (FOR TESTING ONLY)
   * WARNING: This will destroy the current DDA state!
   * Only use this in debug/testing scenarios.
   */
  static forceClearSingleton(): void {
    RuleBasedDDA.instance = undefined as any;
  }

  /**
   * Get a snapshot of current DDA state for backup/restore
   */
  public getStateSnapshot(): PlayerPerformanceScore {
    return JSON.parse(JSON.stringify(this.playerPPS));
  }

  /**
   * Restore DDA state from a snapshot
   */
  public restoreStateSnapshot(snapshot: PlayerPerformanceScore): void {
    this.playerPPS = JSON.parse(JSON.stringify(snapshot));
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
      totalCombatsCompleted: 0,
      isCalibrating: this.config.calibration.enabled,
      consecutiveVictories: 0,
      consecutiveDefeats: 0,
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

    // Increment total combats completed
    this.playerPPS.totalCombatsCompleted++;

    // Store combat in history
    this.playerPPS.combatHistory.push(metrics);
    
    // Keep only last 10 combats for performance
    if (this.playerPPS.combatHistory.length > 10) {
      this.playerPPS.combatHistory.shift();
    }

    // Check if calibration period has ended
    const wasCalibrating = this.playerPPS.isCalibrating;
    if (this.config.calibration.enabled && 
        this.playerPPS.totalCombatsCompleted >= this.config.calibration.combatCount) {
      this.playerPPS.isCalibrating = false;
    }

    // Calculate PPS adjustments
    const ppsAdjustment = this.calculatePPSAdjustment(metrics);
    
    // Update PPS (always track, even during calibration if configured)
    this.playerPPS.previousPPS = this.playerPPS.currentPPS;
    if (this.config.calibration.trackPPSDuringCalibration || !this.playerPPS.isCalibrating) {
      this.playerPPS.currentPPS = Math.max(0, Math.min(5, this.playerPPS.currentPPS + ppsAdjustment));
    }
    this.playerPPS.lastUpdated = Date.now();

    // Log calibration end
    if (wasCalibrating && !this.playerPPS.isCalibrating) {
      this.logEvent("tier_change", {
        fromTier: "learning",
        toTier: this.calculateDifficultyTier(this.playerPPS.currentPPS),
        ppsChange: 0,
        trigger: `calibration_complete_after_${this.config.calibration.combatCount}_combats`,
      });
    }

    // Update difficulty tier (but only after calibration)
    const newTier = this.playerPPS.isCalibrating 
      ? "learning"  // Keep at learning tier during calibration
      : this.calculateDifficultyTier(this.playerPPS.currentPPS);
    
    const tierChanged = newTier !== this.playerPPS.tier && !this.playerPPS.isCalibrating;
    
    // Debug logging for tier calculation
    console.log("🎯 Tier Calculation:", {
      currentPPS: this.playerPPS.currentPPS.toFixed(3),
      isCalibrating: this.playerPPS.isCalibrating,
      calculatedTier: this.calculateDifficultyTier(this.playerPPS.currentPPS),
      assignedTier: newTier,
      previousTier: this.playerPPS.tier,
      tierChanged: tierChanged
    });
    
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
      isCalibrating: this.playerPPS.isCalibrating,
      combatsCompleted: this.playerPPS.totalCombatsCompleted,
      combatsUntilDDA: Math.max(0, this.config.calibration.combatCount - this.playerPPS.totalCombatsCompleted),
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
   * Roguelike-focused: Performance quality over win/loss
   * Inspired by: Hades, Dead Cells, Risk of Rain 2
   */
  private calculatePPSAdjustment(metrics: CombatMetrics): number {
    let adjustment = 0;
    const config = this.config.ppsModifiers;
    const currentTier = this.playerPPS.tier;

    // Get tier scaling multipliers
    const tierScale = this.config.tierScaling[currentTier];

    // Track consecutive victories/defeats for analytics (roguelike run tracking)
    if (metrics.victory) {
      this.playerPPS.consecutiveVictories++;
      this.playerPPS.consecutiveDefeats = 0;
    } else {
      this.playerPPS.consecutiveDefeats++;
      this.playerPPS.consecutiveVictories = 0;
    }

    // 1. HEALTH RETENTION PERFORMANCE (Primary metric for roguelikes)
    // Good HP management is crucial in roguelikes since health carries between fights
    let healthAdjustment = 0;
    
    if (metrics.healthPercentage >= 0.9) {
      // Excellent health retention (90-100%) - Mastery performance
      healthAdjustment += config.excellentHealthBonus;
    } else if (metrics.healthPercentage >= 0.7) {
      // Good health retention (70-89%) - Strong performance
      healthAdjustment += config.goodHealthBonus;
    } else if (metrics.healthPercentage >= 0.5) {
      // Moderate health retention (50-69%) - Acceptable, neutral
      healthAdjustment += 0;
    } else if (metrics.healthPercentage >= 0.3) {
      // Poor health retention (30-49%) - Struggling performance
      healthAdjustment += config.moderateHealthPenalty;
    } else {
      // Very poor health retention (<30%) - Critical performance issue
      healthAdjustment += config.poorHealthPenalty;
    }

    // 2. PERFECT COMBAT BONUS (No damage taken - mastery indicator)
    if (metrics.damageReceived === 0) {
      healthAdjustment += config.perfectCombatBonus;
    }

    // Apply tier scaling to health adjustments
    if (healthAdjustment > 0) {
      healthAdjustment *= tierScale.bonusMultiplier;
    } else {
      healthAdjustment *= tierScale.penaltyMultiplier;
    }
    adjustment += healthAdjustment;

    // 3. SKILL EXPRESSION - HAND QUALITY (Reward good poker play)
    const bestHandQuality = HAND_QUALITY_SCORES[metrics.bestHandAchieved] || 0;
    if (bestHandQuality >= HAND_QUALITY_SCORES.four_of_a_kind) {
      // Excellent hands (4oK, Straight Flush, Royal Flush)
      adjustment += config.excellentHandBonus * tierScale.bonusMultiplier;
    } else if (bestHandQuality >= HAND_QUALITY_SCORES.straight) {
      // Good hands (Straight, Flush, Full House)
      adjustment += config.goodHandBonus * tierScale.bonusMultiplier;
    }

    // 4. COMBAT EFFICIENCY (Tier-based turn count expectations)
    // Roguelikes reward efficient play - finishing fights quickly preserves resources
    let efficiencyAdjustment = 0;
    let expectedTurns = 0;
    let efficientTurns = 0;
    let inefficientTurns = 0;
    
    if (currentTier === "mastering") {
      // Mastering tier: High damage output, expected 1-3 turns
      expectedTurns = 3;
      efficientTurns = 2;
      inefficientTurns = 5;
    } else if (currentTier === "thriving") {
      // Thriving tier: Good damage output, expected 2-4 turns
      expectedTurns = 4;
      efficientTurns = 3;
      inefficientTurns = 6;
    } else if (currentTier === "learning") {
      // Learning tier: Moderate damage output, expected 3-6 turns
      expectedTurns = 6;
      efficientTurns = 4;
      inefficientTurns = 8;
    } else {
      // Struggling tier: Lower damage output, expected 6-9 turns
      expectedTurns = 9;
      efficientTurns = 6;
      inefficientTurns = 11;
    }
    
    if (metrics.turnCount <= efficientTurns) {
      // Performed better than expected for tier
      efficiencyAdjustment = config.efficientCombatBonus * tierScale.bonusMultiplier;
    } else if (metrics.turnCount > inefficientTurns) {
      // Took too long for tier
      efficiencyAdjustment = config.inefficientCombatPenalty * tierScale.penaltyMultiplier;
    }
    
    adjustment += efficiencyAdjustment;

    // 5. DAMAGE EFFICIENCY (Damage per turn ratio)
    // Roguelikes value efficient damage output - higher is better
    const damagePerTurn = metrics.damageDealt / Math.max(1, metrics.turnCount);
    const enemyHPPerTurn = metrics.enemyStartHealth / Math.max(1, expectedTurns);
    const damageEfficiencyRatio = damagePerTurn / enemyHPPerTurn;
    
    let damageEfficiencyAdjustment = 0;
    if (damageEfficiencyRatio >= 1.3) {
      // Excellent damage efficiency (30%+ above expected)
      damageEfficiencyAdjustment = config.highDamageEfficiencyBonus * tierScale.bonusMultiplier;
    } else if (damageEfficiencyRatio <= 0.7) {
      // Poor damage efficiency (30%+ below expected)
      damageEfficiencyAdjustment = config.lowDamageEfficiencyPenalty * tierScale.penaltyMultiplier;
    }
    
    adjustment += damageEfficiencyAdjustment;

    // 6. RESOURCE MANAGEMENT (Discard usage efficiency)
    // Roguelikes reward conservative resource usage
    const discardEfficiency = 1 - (metrics.discardsUsed / Math.max(1, metrics.maxDiscardsAvailable));
    if (discardEfficiency >= 0.7) {
      // Used ≤30% of discards - excellent resource management
      adjustment += config.resourceEfficiencyBonus * tierScale.bonusMultiplier;
    }

    // 7. CLUTCH PERFORMANCE BONUS (Context-aware difficulty in roguelikes)
    // Reward players who perform well despite entering combat at a disadvantage
    // This is key in roguelikes where you often fight while low on resources
    let clutchBonus = 0;
    const startingHealthRatio = metrics.startHealth / metrics.startMaxHealth;
    
    if (startingHealthRatio < 0.5) {
      // Player entered with <50% HP
      const disadvantage = 1 - (startingHealthRatio * 2); // 0.0 at 50%, 1.0 at 0%
      
      // Reward based on how well they performed despite disadvantage
      if (metrics.healthPercentage >= startingHealthRatio) {
        // Survived without losing more HP% - impressive defensive play
        clutchBonus = 0.2 * disadvantage * tierScale.bonusMultiplier;
      } else if (metrics.victory) {
        // Won despite starting low - still good
        clutchBonus = 0.15 * disadvantage * tierScale.bonusMultiplier;
      }
      
      adjustment += clutchBonus;
    }

    // 8. COMEBACK MOMENTUM SYSTEM (Roguelike recovery from poor runs)
    // Help players build momentum when recovering from difficult situations
    let comebackBonus = 0;
    if (this.config.comebackBonus.enabled && 
        this.playerPPS.currentPPS < this.config.comebackBonus.ppsThreshold) {
      
      // Only reward positive performance trends
      if (adjustment > 0) {
        // Base comeback momentum bonus
        comebackBonus += this.config.comebackBonus.bonusPerVictory;
        
        // Consecutive positive performance bonus (capped)
        if (this.playerPPS.consecutiveVictories > 0) {
          const consecutiveBonus = Math.min(
            this.playerPPS.consecutiveVictories * this.config.comebackBonus.consecutiveWinBonus,
            this.config.comebackBonus.maxConsecutiveBonus
          );
          comebackBonus += consecutiveBonus;
        }
        
        adjustment += comebackBonus;
      }
    }

    // Log PPS calculation breakdown for debugging
    console.log("📊 PPS Calculation Breakdown (Roguelike Performance):", {
      startHP: `${(startingHealthRatio * 100).toFixed(0)}%`,
      endHP: `${(metrics.healthPercentage * 100).toFixed(0)}%`,
      healthRetention: healthAdjustment.toFixed(3),
      handQuality: `${metrics.bestHandAchieved} (${bestHandQuality})`,
      efficiency: `${efficiencyAdjustment.toFixed(3)} (${metrics.turnCount}/${expectedTurns} turns)`,
      damageEff: `${damageEfficiencyAdjustment.toFixed(3)} (${damagePerTurn.toFixed(1)} DPT)`,
      resourceMgmt: discardEfficiency >= 0.7 ? `+${config.resourceEfficiencyBonus.toFixed(2)}` : "0",
      clutch: clutchBonus > 0 ? `+${clutchBonus.toFixed(3)} (low HP start)` : "0",
      comeback: comebackBonus > 0 ? `+${comebackBonus.toFixed(3)}` : "0",
      tier: currentTier,
      totalAdjustment: adjustment.toFixed(3),
      currentPPS: this.playerPPS.currentPPS.toFixed(3),
      newPPS: Math.max(0, Math.min(5, this.playerPPS.currentPPS + adjustment)).toFixed(3)
    });

    return adjustment;
  }

  /**
   * Calculate difficulty tier from PPS
   */
  private calculateDifficultyTier(pps: number): DifficultyTier {
    const tiers = this.config.difficultyTiers;
    
    let calculatedTier: DifficultyTier;
    
    if (pps >= tiers.mastering.min && pps <= tiers.mastering.max) {
      calculatedTier = "mastering";
    } else if (pps >= tiers.thriving.min && pps <= tiers.thriving.max) {
      calculatedTier = "thriving";
    } else if (pps >= tiers.learning.min && pps <= tiers.learning.max) {
      calculatedTier = "learning";
    } else {
      calculatedTier = "struggling";
    }
    
    // Debug logging to catch tier calculation issues
    console.log(`🎯 calculateDifficultyTier: PPS=${pps.toFixed(3)} → Tier=${calculatedTier}`, {
      thresholds: {
        struggling: `${tiers.struggling.min}-${tiers.struggling.max}`,
        learning: `${tiers.learning.min}-${tiers.learning.max}`,
        thriving: `${tiers.thriving.min}-${tiers.thriving.max}`,
        mastering: `${tiers.mastering.min}-${tiers.mastering.max}`
      }
    });
    
    return calculatedTier;
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
   * Get narrative context for difficulty changes (Roguelike flavor)
   */
  private getNarrativeContext(tier: DifficultyTier): string {
    // During calibration, always show learning context
    if (this.playerPPS.isCalibrating) {
      return `The spirits assess your capabilities... (${this.playerPPS.totalCombatsCompleted}/${this.config.calibration.combatCount} initial encounters)`;
    }

    const contexts = {
      struggling: "The spirits temper their challenge, granting you respite...",
      learning: "You prove capable - the path ahead remains balanced...",
      thriving: "Your skill draws fiercer opponents to test your mettle...",
      mastering: "Legends speak of your prowess - only the mightiest dare face you...",
    };
    return contexts[tier];
  }

  /**
   * Get reason for PPS change for logging (Performance-based)
   */
  private getPPSChangeReason(metrics: CombatMetrics): string {
    const reasons = [];
    
    // Health retention performance
    if (metrics.healthPercentage >= 0.9) reasons.push("excellent_health_retention");
    else if (metrics.healthPercentage < 0.3) reasons.push("poor_health_retention");
    
    if (metrics.damageReceived === 0) reasons.push("perfect_defense");
    
    // Skill expression
    const handQuality = HAND_QUALITY_SCORES[metrics.bestHandAchieved];
    if (handQuality >= HAND_QUALITY_SCORES.four_of_a_kind) {
      reasons.push("excellent_hands");
    } else if (handQuality >= HAND_QUALITY_SCORES.straight) {
      reasons.push("good_hands");
    }
    
    // Combat efficiency
    const damagePerTurn = metrics.damageDealt / Math.max(1, metrics.turnCount);
    if (damagePerTurn > 10) reasons.push("high_damage_efficiency");
    else if (damagePerTurn < 3) reasons.push("low_damage_efficiency");
    
    // Resource management
    const discardEfficiency = 1 - (metrics.discardsUsed / Math.max(1, metrics.maxDiscardsAvailable));
    if (discardEfficiency >= 0.7) reasons.push("efficient_resources");
    
    // Context
    const startHealthRatio = metrics.startHealth / metrics.startMaxHealth;
    if (startHealthRatio < 0.5) reasons.push("clutch_scenario");
    
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
   * Reset DDA system with a specific configuration
   * Useful for testing different configs
   */
  public resetWithConfig(newConfig: DDAModifiers): void {
    this.config = newConfig;
    this.playerPPS = this.initializePlayerPPS();
    this.events = [];
    this.logEvent("config_reset", { config: newConfig, timestamp: Date.now() });
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
