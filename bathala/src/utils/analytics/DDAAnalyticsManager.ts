/**
 * DDA Analytics - Performance tracking and analysis for thesis research
 */

import { 
  SessionMetrics, 
  FlowStateMetrics, 
  DDAAnalytics, 
  CombatMetrics, 
  DifficultyTier,
  HAND_QUALITY_SCORES 
} from "../../core/dda/DDATypes";
import { HandType } from "../../core/types/CombatTypes";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";

export class DDAAnalyticsManager {
  private static instance: DDAAnalyticsManager;
  private currentSession: SessionMetrics;
  private dda: RuleBasedDDA;

  private constructor() {
    this.dda = RuleBasedDDA.getInstance();
    this.currentSession = this.initializeSession();
  }

  static getInstance(): DDAAnalyticsManager {
    if (!DDAAnalyticsManager.instance) {
      DDAAnalyticsManager.instance = new DDAAnalyticsManager();
    }
    return DDAAnalyticsManager.instance;
  }

  /**
   * Initialize a new analytics session
   */
  private initializeSession(): SessionMetrics {
    return {
      sessionId: `session_${Date.now()}`,
      startTime: Date.now(),
      totalCombats: 0,
      victories: 0,
      defeats: 0,
      averageCombatTurns: 0,
      averageHealthRetained: 0,
      initialPPS: 2.5,
      currentPPS: 2.5,
      ppsHistory: [{ timestamp: Date.now(), pps: 2.5, tier: "learning" }],
      handsDistribution: this.initializeHandsDistribution(),
      difficultyChanges: [],
      nodesCompleted: 0,
      goldEarned: 0,
      relicsGained: 0,
    };
  }

  /**
   * Initialize hands distribution tracking
   */
  private initializeHandsDistribution(): Record<HandType, number> {
    return {
      high_card: 0,
      pair: 0,
      two_pair: 0,
      three_of_a_kind: 0,
      straight: 0,
      flush: 0,
      full_house: 0,
      four_of_a_kind: 0,
      straight_flush: 0,
      royal_flush: 0,
      five_of_a_kind: 0,
    };
  }

  /**
   * Record combat completion
   */
  public recordCombat(metrics: CombatMetrics): void {
    // Update session metrics
    this.currentSession.totalCombats++;
    
    if (metrics.victory) {
      this.currentSession.victories++;
    } else {
      this.currentSession.defeats++;
    }

    // Update averages
    this.updateAverages(metrics);
    
    // Update hands distribution
    metrics.handsPlayed.forEach((hand: HandType) => {
      this.currentSession.handsDistribution[hand]++;
    });

    // Update PPS tracking
    const playerPPS = this.dda.getPlayerPPS();
    this.currentSession.currentPPS = playerPPS.currentPPS;
    this.currentSession.ppsHistory.push({
      timestamp: Date.now(),
      pps: playerPPS.currentPPS,
      tier: playerPPS.tier,
    });

    // Check for difficulty tier changes
    this.checkDifficultyChanges();
  }

  /**
   * Update running averages
   */
  private updateAverages(metrics: CombatMetrics): void {
    const totalCombats = this.currentSession.totalCombats;
    
    // Update average combat turns
    this.currentSession.averageCombatTurns = 
      ((this.currentSession.averageCombatTurns * (totalCombats - 1)) + metrics.turnCount) / totalCombats;
    
    // Update average health retained
    this.currentSession.averageHealthRetained = 
      ((this.currentSession.averageHealthRetained * (totalCombats - 1)) + metrics.healthPercentage) / totalCombats;
  }

  /**
   * Check for difficulty tier changes
   */
  private checkDifficultyChanges(): void {
    const events = this.dda.getEvents();
    const lastTierChange = events.filter((e: any) => e.type === "tier_change").pop();
    
    if (lastTierChange && !this.currentSession.difficultyChanges.find((dc: any) => dc.timestamp === lastTierChange.timestamp)) {
      this.currentSession.difficultyChanges.push({
        timestamp: lastTierChange.timestamp,
        fromTier: lastTierChange.data.fromTier,
        toTier: lastTierChange.data.toTier,
        trigger: lastTierChange.data.trigger,
      });
    }
  }

  /**
   * Calculate flow state metrics
   */
  public calculateFlowMetrics(): FlowStateMetrics {
    const ppsHistory = this.currentSession.ppsHistory;
    const recentCombats = this.dda.getPlayerPPS().combatHistory.slice(-5); // Last 5 combats
    
    // Calculate engagement score based on PPS stability and performance
    const engagementScore = this.calculateEngagementScore(ppsHistory, recentCombats);
    
    // Calculate challenge-skill ratio
    const challengeSkillRatio = this.calculateChallengeSkillRatio(recentCombats);
    
    // Calculate frustration indicators
    const frustrationIndicators = this.calculateFrustrationIndicators(recentCombats);
    
    // Calculate mastery progression
    const masteryProgression = this.calculateMasteryProgression(recentCombats);

    return {
      engagementScore,
      challengeSkillRatio,
      frustrationIndicators,
      masteryProgression,
    };
  }

  /**
   * Calculate engagement score (0-1, higher = more engaged)
   */
  private calculateEngagementScore(ppsHistory: Array<{ timestamp: number; pps: number; tier: DifficultyTier }>, recentCombats: CombatMetrics[]): number {
    if (ppsHistory.length < 2 || recentCombats.length === 0) return 0.5;
    
    // PPS stability indicates engagement (not too volatile)
    const ppsValues = ppsHistory.slice(-10).map(h => h.pps);
    const ppsVariance = this.calculateVariance(ppsValues);
    const stabilityScore = Math.max(0, 1 - (ppsVariance / 2)); // Lower variance = higher engagement
    
    // Combat efficiency indicates engagement
    const avgHealthRetained = recentCombats.reduce((sum, c) => sum + c.healthPercentage, 0) / recentCombats.length;
    const avgTurns = recentCombats.reduce((sum, c) => sum + c.turnCount, 0) / recentCombats.length;
    const efficiencyScore = Math.min(1, (avgHealthRetained * 0.7) + ((10 - Math.min(10, avgTurns)) * 0.03));
    
    return (stabilityScore * 0.4) + (efficiencyScore * 0.6);
  }

  /**
   * Calculate challenge-skill ratio (optimal around 1.0)
   */
  private calculateChallengeSkillRatio(recentCombats: CombatMetrics[]): number {
    if (recentCombats.length === 0) return 1.0;
    
    // Use victory rate and health retention as skill indicators
    const victoryRate = recentCombats.filter(c => c.victory).length / recentCombats.length;
    const avgHealthRetained = recentCombats.reduce((sum, c) => sum + c.healthPercentage, 0) / recentCombats.length;
    
    // Challenge is represented by current difficulty tier
    const currentTier = this.dda.getPlayerPPS().tier;
    const challengeLevel = this.getTierChallengeLevel(currentTier);
    
    // Skill level based on performance
    const skillLevel = (victoryRate * 0.6) + (avgHealthRetained * 0.4);
    
    return challengeLevel / Math.max(0.1, skillLevel);
  }

  /**
   * Get challenge level for difficulty tier
   */
  private getTierChallengeLevel(tier: DifficultyTier): number {
    const levels: Record<DifficultyTier, number> = {
      struggling: 0.6,
      learning: 1.0,
      thriving: 1.4,
      mastering: 1.8,
    };
    return levels[tier];
  }

  /**
   * Calculate frustration indicators
   */
  private calculateFrustrationIndicators(recentCombats: CombatMetrics[]): FlowStateMetrics["frustrationIndicators"] {
    const consecutiveDefeats = this.getConsecutiveDefeats(recentCombats);
    const longCombats = recentCombats.filter(c => c.turnCount > 10).length;
    const lowHealthFinishes = recentCombats.filter(c => c.healthPercentage < 0.3).length;
    
    return {
      rapidRetries: consecutiveDefeats,
      longPauses: 0, // Would need timestamp analysis
      quitAttempts: 0, // Would need session interruption tracking
      helpSeeking: longCombats + lowHealthFinishes, // Proxy for difficulty spikes
    };
  }

  /**
   * Get consecutive defeats count
   */
  private getConsecutiveDefeats(combats: CombatMetrics[]): number {
    let consecutive = 0;
    for (let i = combats.length - 1; i >= 0; i--) {
      if (!combats[i].victory) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  }

  /**
   * Calculate mastery progression
   */
  private calculateMasteryProgression(recentCombats: CombatMetrics[]): FlowStateMetrics["masteryProgression"] {
    if (recentCombats.length < 3) {
      return {
        handQualityImprovement: 0,
        combatEfficiencyTrend: 0,
        learningVelocity: 0,
      };
    }

    const handQualityImprovement = this.calculateHandQualityTrend(recentCombats);
    const combatEfficiencyTrend = this.calculateEfficiencyTrend(recentCombats);
    const learningVelocity = (handQualityImprovement + combatEfficiencyTrend) / 2;

    return {
      handQualityImprovement,
      combatEfficiencyTrend,
      learningVelocity,
    };
  }

  /**
   * Calculate hand quality improvement trend
   */
  private calculateHandQualityTrend(combats: CombatMetrics[]): number {
    const early = combats.slice(0, Math.floor(combats.length / 2));
    const late = combats.slice(Math.floor(combats.length / 2));
    
    const earlyAvg = early.reduce((sum, c) => sum + HAND_QUALITY_SCORES[c.bestHandAchieved], 0) / early.length;
    const lateAvg = late.reduce((sum, c) => sum + HAND_QUALITY_SCORES[c.bestHandAchieved], 0) / late.length;
    
    return lateAvg - earlyAvg;
  }

  /**
   * Calculate combat efficiency trend
   */
  private calculateEfficiencyTrend(combats: CombatMetrics[]): number {
    const early = combats.slice(0, Math.floor(combats.length / 2));
    const late = combats.slice(Math.floor(combats.length / 2));
    
    const earlyEff = early.reduce((sum, c) => sum + (c.healthPercentage / c.turnCount), 0) / early.length;
    const lateEff = late.reduce((sum, c) => sum + (c.healthPercentage / c.turnCount), 0) / late.length;
    
    return lateEff - earlyEff;
  }

  /**
   * Calculate variance of an array
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Get complete analytics data
   */
  public getAnalytics(): DDAAnalytics {
    return {
      sessionMetrics: { ...this.currentSession },
      flowMetrics: this.calculateFlowMetrics(),
      events: this.dda.getEvents(),
    };
  }

  /**
   * Export analytics data for thesis research
   */
  public exportData(): string {
    const analytics = this.getAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Reset analytics for new session
   */
  public resetSession(): void {
    this.currentSession = this.initializeSession();
    this.dda.resetSession();
  }

  /**
   * Record node completion
   */
  public recordNodeCompletion(): void {
    this.currentSession.nodesCompleted++;
  }

  /**
   * Record gold earned
   */
  public recordGoldEarned(amount: number): void {
    this.currentSession.goldEarned += amount;
  }

  /**
   * Record relic gained
   */
  public recordRelicGained(): void {
    this.currentSession.relicsGained++;
  }

  /**
   * Get session summary for debugging
   */
  public getSessionSummary(): string {
    const session = this.currentSession;
    const flowMetrics = this.calculateFlowMetrics();
    
    return `
=== DDA Session Summary ===
Session ID: ${session.sessionId}
Duration: ${Math.round((Date.now() - session.startTime) / 1000 / 60)} minutes
Total Combats: ${session.totalCombats}
Win Rate: ${session.totalCombats > 0 ? Math.round((session.victories / session.totalCombats) * 100) : 0}%
Current PPS: ${session.currentPPS.toFixed(2)}
Current Tier: ${this.dda.getPlayerPPS().tier}
Avg Health Retained: ${Math.round(session.averageHealthRetained * 100)}%
Avg Combat Turns: ${session.averageCombatTurns.toFixed(1)}
Engagement Score: ${Math.round(flowMetrics.engagementScore * 100)}%
Challenge-Skill Ratio: ${flowMetrics.challengeSkillRatio.toFixed(2)}
Difficulty Changes: ${session.difficultyChanges.length}
    `;
  }
}
