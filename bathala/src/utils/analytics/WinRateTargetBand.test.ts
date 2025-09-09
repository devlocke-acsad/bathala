/**
 * Test file for Win Rate Target Band Monitoring
 */

import { DDAAnalyticsManager } from "./DDAAnalyticsManager";
import { CombatMetrics } from "../../core/dda/DDATypes";

// Mock combat metrics for testing
const mockVictory: CombatMetrics = {
  combatId: "test-1",
  timestamp: Date.now(),
  startHealth: 80,
  startMaxHealth: 80,
  startGold: 100,
  endHealth: 60,
  healthPercentage: 0.75,
  turnCount: 5,
  damageDealt: 30,
  damageReceived: 20,
  discardsUsed: 1,
  maxDiscardsAvailable: 2,
  handsPlayed: ["pair"],
  bestHandAchieved: "pair",
  averageHandQuality: 1,
  victory: true,
  combatDuration: 30000,
  enemyType: "common",
  enemyName: "Test Enemy",
  enemyStartHealth: 30
};

const mockDefeat: CombatMetrics = {
  combatId: "test-2",
  timestamp: Date.now() + 1000,
  startHealth: 80,
  startMaxHealth: 80,
  startGold: 100,
  endHealth: 0,
  healthPercentage: 0,
  turnCount: 8,
  damageDealt: 20,
  damageReceived: 80,
  discardsUsed: 2,
  maxDiscardsAvailable: 2,
  handsPlayed: ["high_card"],
  bestHandAchieved: "high_card",
  averageHandQuality: 0,
  victory: false,
  combatDuration: 45000,
  enemyType: "common",
  enemyName: "Test Enemy",
  enemyStartHealth: 30
};

console.log("=== Win Rate Target Band Monitoring Test ===");

// Get analytics manager instance
const analytics = DDAAnalyticsManager.getInstance();
analytics.resetSession();

// Test initial state
console.log("\n1. Initial State Test:");
const initialWinRate = analytics.checkWinRateTargetBand();
console.log(`Win Rate: ${initialWinRate.winRate}%`);
console.log(`Target Band: ${initialWinRate.targetBand.min}-${initialWinRate.targetBand.max}%`);
console.log(`Within Target: ${initialWinRate.withinTarget}`);
console.log(`Status: ${initialWinRate.status}`);

// Test setting custom target band
console.log("\n2. Custom Target Band Test:");
analytics.setWinRateTargetBand(30, 70);
const customBand = analytics.getWinRateTargetBand();
console.log(`Custom Target Band: ${customBand.min}-${customBand.max}%`);

// Test with 3 wins and 2 losses (60% win rate)
console.log("\n3. Recording Combats Test:");
for (let i = 0; i < 3; i++) {
  analytics.recordCombat(mockVictory);
}
for (let i = 0; i < 2; i++) {
  analytics.recordCombat(mockDefeat);
}

const afterCombats = analytics.checkWinRateTargetBand();
console.log(`Total Combats: 5`);
console.log(`Wins: 3, Losses: 2`);
console.log(`Win Rate: ${afterCombats.winRate}%`);
console.log(`Target Band: ${afterCombats.targetBand.min}-${afterCombats.targetBand.max}%`);
console.log(`Within Target: ${afterCombats.withinTarget}`);
console.log(`Status: ${afterCombats.status}`);

// Test with extreme win rate
console.log("\n4. Extreme Win Rate Test:");
analytics.resetSession();
analytics.setWinRateTargetBand(40, 60);

// Record 9 wins and 1 loss (90% win rate)
for (let i = 0; i < 9; i++) {
  analytics.recordCombat(mockVictory);
}
analytics.recordCombat(mockDefeat);

const highWinRate = analytics.checkWinRateTargetBand();
console.log(`Total Combats: 10`);
console.log(`Wins: 9, Losses: 1`);
console.log(`Win Rate: ${highWinRate.winRate}%`);
console.log(`Target Band: ${highWinRate.targetBand.min}-${highWinRate.targetBand.max}%`);
console.log(`Within Target: ${highWinRate.withinTarget}`);
console.log(`Status: ${highWinRate.status}`);

// Test with very low win rate
console.log("\n5. Low Win Rate Test:");
analytics.resetSession();

// Record 1 win and 9 losses (10% win rate)
analytics.recordCombat(mockVictory);
for (let i = 0; i < 9; i++) {
  analytics.recordCombat(mockDefeat);
}

const lowWinRate = analytics.checkWinRateTargetBand();
console.log(`Total Combats: 10`);
console.log(`Wins: 1, Losses: 9`);
console.log(`Win Rate: ${lowWinRate.winRate}%`);
console.log(`Target Band: ${lowWinRate.targetBand.min}-${lowWinRate.targetBand.max}%`);
console.log(`Within Target: ${lowWinRate.withinTarget}`);
console.log(`Status: ${lowWinRate.status}`);

console.log("\n=== Test Complete ===");