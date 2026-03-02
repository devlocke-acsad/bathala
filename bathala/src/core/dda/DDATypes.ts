/**
 * DDA Types - Type definitions for the Dynamic Difficulty Adjustment system
 */

import { HandType } from "../types/CombatTypes";

export type DifficultyTier = "struggling" | "learning" | "thriving" | "mastering";

export interface CombatMetrics {
  combatId: string;
  timestamp: number;
  
  // Pre-combat state
  startHealth: number;
  startMaxHealth: number;
  startGold: number;
  
  // Combat performance
  endHealth: number;
  healthPercentage: number;
  turnCount: number;
  damageDealt: number;
  damageReceived: number;
  discardsUsed: number;
  maxDiscardsAvailable: number;
  
  // Hand quality metrics
  handsPlayed: HandType[];
  bestHandAchieved: HandType;
  averageHandQuality: number;
  
  // Outcome
  victory: boolean;
  combatDuration: number; // in milliseconds
  
  // Enemy information
  enemyType: "common" | "elite" | "boss";
  enemyName: string;
  enemyStartHealth: number;
}

export interface PlayerPerformanceScore {
  currentPPS: number;
  previousPPS: number;
  tier: DifficultyTier;
  lastUpdated: number;
  combatHistory: CombatMetrics[];
  sessionStartTime: number;
  totalCombatsCompleted: number;    // Track total combats for calibration
  isCalibrating: boolean;           // Currently in calibration period
  consecutiveVictories: number;     // Track consecutive wins for comeback bonus
  consecutiveDefeats: number;       // Track consecutive losses for analysis
}

export interface DifficultyAdjustment {
  tier: DifficultyTier;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  aiComplexity: number;
  shopPriceMultiplier: number;
  goldRewardMultiplier: number;
  restNodeBias: number;
  narrativeContext?: string;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  
  // Aggregate performance
  totalCombats: number;
  victories: number;
  defeats: number;
  averageCombatTurns: number;
  averageHealthRetained: number;
  
  // PPS tracking
  initialPPS: number;
  currentPPS: number;
  ppsHistory: Array<{ timestamp: number; pps: number; tier: DifficultyTier }>;
  
  // Hand distribution
  handsDistribution: Record<HandType, number>;
  
  // Difficulty adjustments
  difficultyChanges: Array<{
    timestamp: number;
    fromTier: DifficultyTier;
    toTier: DifficultyTier;
    trigger: string;
  }>;
  
  // Player progression
  nodesCompleted: number;
  goldEarned: number;
  relicsGained: number;
}

export interface FlowStateMetrics {
  engagementScore: number;        // 0-1, higher = more engaged
  challengeSkillRatio: number;    // Optimal around 1.0
  frustrationIndicators: {
    rapidRetries: number;
    longPauses: number;
    quitAttempts: number;
    helpSeeking: number;
  };
  masteryProgression: {
    handQualityImprovement: number;
    combatEfficiencyTrend: number;
    learningVelocity: number;
  };
}

export interface DDAEvent {
  timestamp: number;
  type: "pps_update" | "tier_change" | "difficulty_adjustment" | "combat_complete" | "config_update" | "session_reset" | "config_reset" | "dda_toggle";
  data: any;
  pps: number;
  tier: DifficultyTier;
}

export interface DDAAnalytics {
  sessionMetrics: SessionMetrics;
  flowMetrics: FlowStateMetrics;
  events: DDAEvent[];
}

/**
 * Hand quality scoring for PPS calculation
 */
export const HAND_QUALITY_SCORES: Record<HandType, number> = {
  high_card: 0,
  pair: 1,
  two_pair: 2,
  three_of_a_kind: 3,
  straight: 4,
  flush: 5,
  full_house: 6,
  four_of_a_kind: 7,
  straight_flush: 8,
  royal_flush: 9,
  five_of_a_kind: 8, // Slightly lower than royal flush for balance
};
