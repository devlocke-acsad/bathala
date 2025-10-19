/**
 * DDASimulator - Interactive visualization tool for DDA algorithm
 * This demonstrates the actual DDA implementation for thesis presentation
 * Uses real RuleBasedDDA methods to show authentic algorithm behavior
 */

import { RuleBasedDDA } from "../core/dda/RuleBasedDDA";
import { CombatMetrics, DifficultyTier, PlayerPerformanceScore } from "../core/dda/DDATypes";
import { HandType } from "../core/types/CombatTypes";

export interface SimulationResult {
  previousPPS: number;
  newPPS: number;
  tier: DifficultyTier;
  adjustment: number;
  calculationSteps: CalculationStep[];
  difficultyModifier: number;
  metrics: CombatMetrics;
}

export interface CalculationStep {
  title: string;
  description: string;
  value: string;
  isPositive?: boolean;
  isTotal?: boolean;
  isCalibrating?: boolean;
}

export class DDASimulator {
  private dda: RuleBasedDDA;
  private combatCounter: number = 0;
  private simulationHistory: SimulationResult[] = [];

  constructor() {
    // Use the actual RuleBasedDDA singleton instance
    this.dda = RuleBasedDDA.getInstance();
  }

  /**
   * Simulate a single combat using actual DDA methods
   */
  public simulateCombat(
    healthPercentage: number,
    turnCount: number,
    bestHand: HandType,
    damageDealt: number,
    discardsUsed: number
  ): SimulationResult {
    this.combatCounter++;

    // Create CombatMetrics matching the DDA's expected structure
    const metrics: CombatMetrics = {
      combatId: `sim_combat_${this.combatCounter}`,
      timestamp: Date.now(),
      
      // Pre-combat state
      startHealth: 100,
      startMaxHealth: 100,
      startGold: 50,
      
      // Combat performance (user inputs)
      endHealth: healthPercentage,
      healthPercentage: healthPercentage,
      turnCount: turnCount,
      damageDealt: damageDealt,
      damageReceived: 100 - healthPercentage,
      discardsUsed: discardsUsed,
      maxDiscardsAvailable: 3,
      
      // Hand quality metrics
      handsPlayed: [bestHand], // Simplified for simulation
      bestHandAchieved: bestHand,
      averageHandQuality: this.getHandQualityScore(bestHand),
      
      // Outcome
      victory: true, // Simulation assumes victory (roguelike - defeats end run)
      combatDuration: turnCount * 30000, // ~30s per turn estimate
      
      // Enemy information
      enemyType: "common",
      enemyName: "Simulated Enemy",
      enemyStartHealth: 100,
    };

    // Get state before update
    const previousState = this.dda.getStateSnapshot();
    const previousPPS = previousState.currentPPS;

    // Process combat using ACTUAL DDA algorithm
    const newState: PlayerPerformanceScore = this.dda.processCombatResults(metrics);

    // Calculate the adjustment that was applied
    const adjustment = newState.currentPPS - previousPPS;

    // Get difficulty modifier based on tier
    const difficultyAdjustment = this.dda.getCurrentDifficultyAdjustment();

    // Create calculation breakdown for UI visualization
    const calculationSteps = this.generateCalculationSteps(
      metrics,
      previousState,
      newState,
      adjustment
    );

    const result: SimulationResult = {
      previousPPS,
      newPPS: newState.currentPPS,
      tier: newState.tier,
      adjustment,
      calculationSteps,
      difficultyModifier: difficultyAdjustment.enemyHealthMultiplier,
      metrics,
    };

    this.simulationHistory.push(result);
    return result;
  }

  /**
   * Generate human-readable calculation steps for visualization
   * This helps show the algorithm's transparency
   */
  private generateCalculationSteps(
    metrics: CombatMetrics,
    previousState: PlayerPerformanceScore,
    newState: PlayerPerformanceScore,
    adjustment: number
  ): CalculationStep[] {
    const steps: CalculationStep[] = [];

    // Show calibration status
    if (previousState.isCalibrating) {
      steps.push({
        title: '⏳ CALIBRATION PHASE',
        description: `Combat ${previousState.totalCombatsCompleted}/3 - PPS tracked but tier locked to LEARNING`,
        value: '',
        isCalibrating: true,
      });
    }

    // Show tier and multipliers
    steps.push({
      title: `🎯 Current Tier: ${previousState.tier.toUpperCase()}`,
      description: this.getTierMultiplierDescription(previousState.tier),
      value: '',
    });

    // Health Retention Factor
    const healthBonus = this.calculateHealthBonus(metrics.healthPercentage);
    if (healthBonus !== 0) {
      steps.push({
        title: '💚 Health Retention Factor',
        description: `${metrics.healthPercentage.toFixed(0)}% HP remaining`,
        value: (healthBonus >= 0 ? '+' : '') + healthBonus.toFixed(3),
        isPositive: healthBonus >= 0,
      });
    }

    // Perfect Combat Bonus
    if (metrics.healthPercentage === 100) {
      steps.push({
        title: '⭐ Perfect Combat Bonus',
        description: 'No damage taken throughout combat!',
        value: '+0.250',
        isPositive: true,
      });
    }

    // Hand Quality
    const handScore = this.getHandQualityScore(metrics.bestHandAchieved);
    if (handScore > 0) {
      steps.push({
        title: '🎴 Hand Quality Factor',
        description: `Best Hand: ${this.formatHandName(metrics.bestHandAchieved)}`,
        value: '+' + handScore.toFixed(3),
        isPositive: true,
      });
    }

    // Combat Efficiency
    const efficiencyBonus = this.calculateEfficiencyBonus(
      metrics.turnCount,
      previousState.tier
    );
    if (efficiencyBonus !== 0) {
      steps.push({
        title: '⚡ Combat Efficiency Factor',
        description: `${metrics.turnCount} turns (expected: ${this.getExpectedTurns(previousState.tier)})`,
        value: (efficiencyBonus >= 0 ? '+' : '') + efficiencyBonus.toFixed(3),
        isPositive: efficiencyBonus >= 0,
      });
    }

    // Damage Efficiency
    const damageBonus = this.calculateDamageEfficiency(
      metrics.damageDealt,
      metrics.turnCount,
      previousState.tier
    );
    if (damageBonus !== 0) {
      const dpt = (metrics.damageDealt / metrics.turnCount).toFixed(1);
      steps.push({
        title: '💥 Damage Efficiency Factor',
        description: `${dpt} damage per turn`,
        value: (damageBonus >= 0 ? '+' : '') + damageBonus.toFixed(3),
        isPositive: damageBonus >= 0,
      });
    }

    // Resource Management
    const resourceBonus = this.calculateResourceBonus(
      metrics.discardsUsed,
      metrics.maxDiscardsAvailable
    );
    if (resourceBonus !== 0) {
      steps.push({
        title: '💎 Resource Management Factor',
        description: `Used ${metrics.discardsUsed}/${metrics.maxDiscardsAvailable} discard charges`,
        value: '+' + resourceBonus.toFixed(3),
        isPositive: true,
      });
    }

    // Calibration complete notification
    if (previousState.isCalibrating && !newState.isCalibrating) {
      steps.push({
        title: '✅ CALIBRATION COMPLETE',
        description: 'DDA is now fully active! Tier adjustments enabled.',
        value: '',
        isCalibrating: true,
      });
    }

    // Total Adjustment
    steps.push({
      title: '📊 Total PPS Adjustment',
      description: `${previousState.currentPPS.toFixed(2)} → ${newState.currentPPS.toFixed(2)}`,
      value: (adjustment >= 0 ? '+' : '') + adjustment.toFixed(3),
      isPositive: adjustment >= 0,
      isTotal: true,
    });

    return steps;
  }

  /**
   * Helper methods for calculation breakdown
   * These mirror the logic in RuleBasedDDA but are used for display
   */
  private calculateHealthBonus(healthPercentage: number): number {
    if (healthPercentage >= 90) return 0.35;
    if (healthPercentage >= 70) return 0.15;
    if (healthPercentage >= 50) return 0;
    if (healthPercentage >= 30) return -0.2;
    return -0.4;
  }

  private getHandQualityScore(hand: HandType): number {
    const scores: Record<HandType, number> = {
      'high_card': 0,
      'pair': 0.1,
      'two_pair': 0.1,
      'three_of_a_kind': 0.1,
      'straight': 0.25,
      'flush': 0.25,
      'full_house': 0.25,
      'four_of_a_kind': 0.25,
      'straight_flush': 0.25,
      'royal_flush': 0.25,
      'five_of_a_kind': 0.25,
    };
    return scores[hand] || 0;
  }

  private calculateEfficiencyBonus(turnCount: number, tier: DifficultyTier): number {
    const expectedTurns = this.getExpectedTurns(tier);
    if (turnCount <= expectedTurns * 0.8) return 0.2;
    if (turnCount >= expectedTurns * 1.2) return -0.2;
    return 0;
  }

  private calculateDamageEfficiency(
    damageDealt: number,
    turnCount: number,
    tier: DifficultyTier
  ): number {
    const expectedDamage = this.getExpectedDamage(tier);
    const expectedTurns = this.getExpectedTurns(tier);
    const damagePerTurn = damageDealt / turnCount;
    const expectedDPT = expectedDamage / expectedTurns;

    if (damagePerTurn >= expectedDPT * 1.3) return 0.2;
    if (damagePerTurn <= expectedDPT * 0.7) return -0.15;
    return 0;
  }

  private calculateResourceBonus(discardsUsed: number, maxDiscards: number): number {
    const usagePercent = (discardsUsed / maxDiscards) * 100;
    return usagePercent <= 30 ? 0.15 : 0;
  }

  private getExpectedTurns(tier: DifficultyTier): number {
    const expected: Record<DifficultyTier, number> = {
      struggling: 12,
      learning: 10,
      thriving: 8,
      mastering: 6,
    };
    return expected[tier];
  }

  private getExpectedDamage(tier: DifficultyTier): number {
    const expected: Record<DifficultyTier, number> = {
      struggling: 60,
      learning: 80,
      thriving: 100,
      mastering: 120,
    };
    return expected[tier];
  }

  private getTierMultiplierDescription(tier: DifficultyTier): string {
    const multipliers: Record<DifficultyTier, string> = {
      struggling: 'Bonuses ×1.5, Penalties ×0.5 (Support mode)',
      learning: 'Bonuses ×1.0, Penalties ×1.0 (Baseline)',
      thriving: 'Bonuses ×0.8, Penalties ×1.2 (Challenge mode)',
      mastering: 'Bonuses ×0.5, Penalties ×1.5 (Expert mode)',
    };
    return multipliers[tier];
  }

  private formatHandName(hand: HandType): string {
    return hand
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get current DDA state directly from the actual implementation
   */
  public getCurrentState(): PlayerPerformanceScore {
    return this.dda.getStateSnapshot();
  }

  /**
   * Reset simulation using actual DDA reset
   */
  public reset(): void {
    RuleBasedDDA.forceClearSingleton();
    this.dda = RuleBasedDDA.getInstance();
    this.combatCounter = 0;
    this.simulationHistory = [];
  }

  /**
   * Get simulation history
   */
  public getHistory(): SimulationResult[] {
    return [...this.simulationHistory];
  }

  /**
   * Get PPS history for charting
   */
  public getPPSHistory(): number[] {
    return [2.5, ...this.simulationHistory.map(r => r.newPPS)];
  }
}
