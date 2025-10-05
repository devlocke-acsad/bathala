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
   * Now includes tier-based scaling and comeback bonuses
   */
  private calculatePPSAdjustment(metrics: CombatMetrics): number {
    let adjustment = 0;
    const config = this.config.ppsModifiers;
    const currentTier = this.playerPPS.tier;

    // Get tier scaling multipliers
    const tierScale = this.config.tierScaling[currentTier];

    // 1. VICTORY/DEFEAT BASE (Solution 1)
    if (metrics.victory) {
      adjustment += config.victoryBonus;
      
      // Track consecutive victories for comeback bonus
      this.playerPPS.consecutiveVictories++;
      this.playerPPS.consecutiveDefeats = 0;
    } else {
      adjustment += config.defeatPenalty;
      
      // Track consecutive defeats
      this.playerPPS.consecutiveDefeats++;
      this.playerPPS.consecutiveVictories = 0;
    }

    // 2. HEALTH-BASED MODIFIERS (Gradient system for better feedback)
    let healthAdjustment = 0;
    
    if (metrics.healthPercentage >= 0.9) {
      // Excellent health (90-100%)
      healthAdjustment += config.highHealthBonus;
    } else if (metrics.healthPercentage >= 0.7) {
      // Good health (70-89%) - small bonus
      healthAdjustment += config.highHealthBonus * 0.5;
    } else if (metrics.healthPercentage >= 0.5) {
      // Moderate health (50-69%) - neutral (no adjustment)
      healthAdjustment += 0;
    } else if (metrics.healthPercentage >= 0.3) {
      // Poor health (30-49%) - small penalty
      healthAdjustment += config.lowHealthPenalty * 0.5;
    } else {
      // Very poor health (<30%) - full penalty
      healthAdjustment += config.lowHealthPenalty;
    }

    // 3. PERFECT COMBAT BONUS
    if (metrics.damageReceived === 0 && metrics.victory) {
      healthAdjustment += config.perfectCombatBonus;
    }

    // Apply tier scaling to health adjustments
    if (healthAdjustment > 0) {
      healthAdjustment *= tierScale.bonusMultiplier;
    } else {
      healthAdjustment *= tierScale.penaltyMultiplier;
    }
    adjustment += healthAdjustment;

    // 4. HAND QUALITY BONUS
    const bestHandQuality = HAND_QUALITY_SCORES[metrics.bestHandAchieved] || 0;
    if (bestHandQuality >= HAND_QUALITY_SCORES.four_of_a_kind) {
      adjustment += config.goodHandBonus * tierScale.bonusMultiplier;
    }

    // 5. COMBAT DURATION PENALTY (Tier-based thresholds calibrated to actual damage output)
    // Calibrated based on: Common enemies ~18HP, Player damage ranges from 2-22 per turn
    let turnPenalty = 0;
    
    if (currentTier === "mastering") {
      // Mastering tier: High damage (10-22), expected 1-3 turns
      // Penalty if taking too long (struggling to finish quickly)
      if (metrics.turnCount > 4) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else if (currentTier === "thriving") {
      // Thriving tier: Good damage (7-10), expected 2-4 turns
      // Penalty if combat drags on
      if (metrics.turnCount > 5) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else if (currentTier === "learning") {
      // Learning tier: Moderate damage (3-7), expected 3-6 turns
      // Penalty if combat is inefficient
      if (metrics.turnCount > 7) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else {
      // Struggling tier: Low damage (0-3), expected 6-9 turns
      // Very lenient threshold
      if (metrics.turnCount > 9) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    }
    
    adjustment += turnPenalty;

    // 6. RESOURCE EFFICIENCY BONUS
    const discardEfficiency = 1 - (metrics.discardsUsed / Math.max(1, metrics.maxDiscardsAvailable));
    if (discardEfficiency > 0.8) {
      adjustment += config.resourceEfficiencyBonus * tierScale.bonusMultiplier;
    }

    // 6.5. CLUTCH VICTORY BONUS (Context-aware difficulty)
    // Reward players who win despite entering combat at a disadvantage
    let clutchBonus = 0;
    const startingHealthRatio = metrics.startHealth / metrics.startMaxHealth;
    if (startingHealthRatio < 0.5 && metrics.victory) {
      // Player entered with <50% HP and still won - that's impressive!
      // Bonus scales with how low their starting HP was (max +0.15 at 0% starting HP)
      clutchBonus = 0.15 * (1 - startingHealthRatio * 2); // 0.15 at 0%, 0.0 at 50%
      adjustment += clutchBonus * tierScale.bonusMultiplier;
    }

    // 7. COMEBACK BONUS SYSTEM (Solution 3)
    let comebackBonus = 0;
    if (this.config.comebackBonus.enabled && 
        metrics.victory && 
        this.playerPPS.currentPPS < this.config.comebackBonus.ppsThreshold) {
      
      // Base comeback bonus
      comebackBonus += this.config.comebackBonus.bonusPerVictory;
      
      // Consecutive win bonus (capped)
      const consecutiveBonus = Math.min(
        (this.playerPPS.consecutiveVictories - 1) * this.config.comebackBonus.consecutiveWinBonus,
        this.config.comebackBonus.maxConsecutiveBonus
      );
      comebackBonus += consecutiveBonus;
      adjustment += comebackBonus;
    }

    // Log PPS calculation breakdown for debugging
    console.log("📊 PPS Calculation Breakdown:", {
      victory: metrics.victory ? `+${config.victoryBonus}` : `${config.defeatPenalty}`,
      startHP: `${(startingHealthRatio * 100).toFixed(0)}%`,
      endHP: `${(metrics.healthPercentage * 100).toFixed(0)}%`,
      health: `${(healthAdjustment / (tierScale.bonusMultiplier || tierScale.penaltyMultiplier)).toFixed(2)}`,
      healthScaled: `${healthAdjustment.toFixed(2)}`,
      turns: turnPenalty !== 0 ? `${turnPenalty.toFixed(2)} (${metrics.turnCount} turns)` : "0",
      clutch: clutchBonus > 0 ? `+${(clutchBonus * tierScale.bonusMultiplier).toFixed(2)} (low HP start)` : "0",
      comeback: comebackBonus > 0 ? `+${comebackBonus.toFixed(2)}` : "0",
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
   * Get narrative context for difficulty changes
   */
  private getNarrativeContext(tier: DifficultyTier): string {
    // During calibration, always show learning context
    if (this.playerPPS.isCalibrating) {
      return `Observing your technique... (${this.playerPPS.totalCombatsCompleted}/${this.config.calibration.combatCount} calibration combats)`;
    }

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
