/**
 * Unit Tests for RuleBasedDDA
 * 
 * These tests validate that the DDA algorithm behaves correctly according to the GDD specification.
 * Each test uses fixed inputs and verifies against manually calculated expected outputs.
 */

import { RuleBasedDDA } from './RuleBasedDDA';
import { DEFAULT_DDA_CONFIG } from './DDAConfig';
import { CombatMetrics, PlayerPerformanceScore } from './DDATypes';

describe('RuleBasedDDA - Performance-Based System', () => {
  let dda: RuleBasedDDA;

  beforeEach(() => {
    // Clear singleton and get fresh instance
    RuleBasedDDA.forceClearSingleton();
    dda = RuleBasedDDA.getInstance(DEFAULT_DDA_CONFIG);
  });

  afterEach(() => {
    // Clean up singleton after each test
    RuleBasedDDA.forceClearSingleton();
  });

  /**
   * Helper function to set PPS to a specific value for testing
   */
  function setPPS(targetPPS: number): void {
    const snapshot = dda.getStateSnapshot();
    snapshot.currentPPS = targetPPS;
    snapshot.previousPPS = targetPPS;
    snapshot.isCalibrating = false; // Disable calibration for most tests
    snapshot.totalCombatsCompleted = 5; // Past calibration period
    dda.restoreStateSnapshot(snapshot);
  }

  describe('Health Retention Performance', () => {
    it('should grant Excellent Health Bonus (≥90% HP retained)', () => {
      // ARRANGE: Set initial PPS to 2.5 (Learning tier)
      setPPS(2.5);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.95,  // 95% HP retained
        turnCount: 5,
        bestHandAchieved: 'pair',
        damageDealt: 100,
        damageReceived: 5,
        discardsUsed: 1,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT: Process combat
      dda.processCombatResults(metrics);
      
      // ASSERT: 
      // Expected: +0.25 (excellentHealthBonus) × 1.0 (learning tier bonus multiplier)
      // Starting: 2.5, Change: +0.25 = 2.75
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(2.75, 2);
    });

    it('should grant Perfect Combat Bonus (no damage)', () => {
      // ARRANGE
      setPPS(2.5);
      
      const metrics: CombatMetrics = {
        healthPercentage: 1.0,   // 100% HP
        turnCount: 4,
        bestHandAchieved: 'pair',
        damageDealt: 100,
        damageReceived: 0,        // NO DAMAGE
        discardsUsed: 1,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Expected: +0.25 (excellent health) + 0.3 (perfect combat)
      // = +0.55 × 1.0 (learning multiplier) = +0.55
      // Starting: 2.5 + 0.55 = 3.05
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(3.05, 2);
    });

    it('should apply Poor Health Penalty (<30% HP retained)', () => {
      // ARRANGE
      setPPS(3.0); // Thriving tier
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.25,  // 25% HP - very poor
        turnCount: 8,
        bestHandAchieved: 'high_card',
        damageDealt: 100,
        damageReceived: 75,
        discardsUsed: 2,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Expected: -0.4 (poorHealthPenalty) × 1.2 (thriving tier penalty multiplier)
      // = -0.48
      // Starting: 3.0 - 0.48 = 2.52
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(2.52, 2);
    });
  });

  describe('Skill Expression - Hand Quality', () => {
    it('should reward Excellent Hand (Four of a Kind)', () => {
      // ARRANGE
      setPPS(2.5);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.80,
        turnCount: 4,
        bestHandAchieved: 'four_of_a_kind', // Quality score = 7
        damageDealt: 150,
        damageReceived: 20,
        discardsUsed: 1,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Health: 80% = +0.15 (goodHealthBonus)
      // Hand: Four of a Kind = +0.4 (excellentHandBonus)
      // Both scaled by 1.0 (learning tier) = +0.55
      // Starting: 2.5 + 0.55 = 3.05
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(3.05, 2);
    });

    it('should reward Good Hand (Straight)', () => {
      // ARRANGE
      setPPS(2.5);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.70,
        turnCount: 5,
        bestHandAchieved: 'straight', // Quality score = 4
        damageDealt: 120,
        damageReceived: 30,
        discardsUsed: 1,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Health: 70% = +0.15 (goodHealthBonus)
      // Hand: Straight = +0.2 (goodHandBonus)
      // Both scaled by 1.0 = +0.35
      // Starting: 2.5 + 0.35 = 2.85
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(2.85, 2);
    });
  });

  describe('Combat Efficiency', () => {
    it('should reward fast combat (Learning tier, ≤4 turns)', () => {
      // ARRANGE
      setPPS(2.0); // Learning tier
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.80,
        turnCount: 3, // Very fast for Learning tier
        bestHandAchieved: 'pair',
        damageDealt: 120,
        damageReceived: 20,
        discardsUsed: 1,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Health: 80% = +0.15
      // Efficiency: ≤4 turns (learning) = +0.2
      // Total: +0.35 × 1.0 = +0.35
      // Starting: 2.0 + 0.35 = 2.35
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(2.35, 2);
    });

    it('should penalize slow combat (Learning tier, >8 turns)', () => {
      // ARRANGE
      setPPS(2.0);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.60,
        turnCount: 10, // Slow for Learning tier
        bestHandAchieved: 'high_card',
        damageDealt: 100,
        damageReceived: 40,
        discardsUsed: 2,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT:
      // Health: 60% = -0.1 (moderate penalty)
      // Efficiency: >8 turns = -0.15 × 1.0 = -0.15
      // Total: -0.1 - 0.15 = -0.25
      // Starting: 2.0 - 0.25 = 1.75
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeCloseTo(1.75, 2);
    });
  });

  describe('Tier Transitions', () => {
    it('should transition from Learning to Thriving at PPS 2.6', () => {
      // ARRANGE
      setPPS(2.5);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.90,
        turnCount: 3,
        bestHandAchieved: 'straight',
        damageDealt: 120,
        damageReceived: 10,
        discardsUsed: 0,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT
      const playerState = dda.getPlayerPPS();
      expect(playerState.currentPPS).toBeGreaterThanOrEqual(2.6);
      expect(playerState.tier).toBe('thriving');
    });

    it('should stay in Struggling tier if PPS remains below 1.1', () => {
      // ARRANGE
      setPPS(0.8);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.35,
        turnCount: 11,
        bestHandAchieved: 'high_card',
        damageDealt: 80,
        damageReceived: 65,
        discardsUsed: 3,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT
      const playerState = dda.getPlayerPPS();
      expect(playerState.currentPPS).toBeLessThan(1.1);
      expect(playerState.tier).toBe('struggling');
    });
  });

  describe('Calibration Period', () => {
    it('should keep player in Learning tier during calibration', () => {
      // ARRANGE: Fresh instance starts in calibration
      RuleBasedDDA.forceClearSingleton();
      const calibrationConfig = { 
        ...DEFAULT_DDA_CONFIG, 
        calibration: { 
          enabled: true,
          combatCount: 3, 
          startingTier: 'learning' as const,
          trackPPSDuringCalibration: true
        } 
      };
      dda = RuleBasedDDA.getInstance(calibrationConfig);
      
      // ACT: Process 2 combats (still in calibration)
      for (let i = 0; i < 2; i++) {
        dda.processCombatResults({
          healthPercentage: 0.95,
          turnCount: 3,
          bestHandAchieved: 'four_of_a_kind',
          damageDealt: 150,
          damageReceived: 5,
          discardsUsed: 0,
          victory: true,
          enemyStartHealth: 100,
          startHealth: 100,
          startMaxHealth: 100,
          maxDiscardsAvailable: 3
        });
      }
      
      // ASSERT
      const playerState = dda.getPlayerPPS();
      expect(playerState.isCalibrating).toBe(true);
      expect(playerState.tier).toBe('learning');
    });
  });

  describe('PPS Bounds', () => {
    it('should clamp PPS to maximum of 5.0', () => {
      // ARRANGE
      setPPS(4.9);
      
      const metrics: CombatMetrics = {
        healthPercentage: 1.0,
        turnCount: 1,
        bestHandAchieved: 'royal_flush',
        damageDealt: 500,
        damageReceived: 0,
        discardsUsed: 0,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeLessThanOrEqual(5.0);
    });

    it('should clamp PPS to minimum of 0.0', () => {
      // ARRANGE
      setPPS(0.2);
      
      const metrics: CombatMetrics = {
        healthPercentage: 0.05,
        turnCount: 15,
        bestHandAchieved: 'high_card',
        damageDealt: 50,
        damageReceived: 95,
        discardsUsed: 3,
        victory: true,
        enemyStartHealth: 100,
        startHealth: 100,
        startMaxHealth: 100,
        maxDiscardsAvailable: 3
      };
      
      // ACT
      dda.processCombatResults(metrics);
      
      // ASSERT
      const newPPS = dda.getPlayerPPS().currentPPS;
      expect(newPPS).toBeGreaterThanOrEqual(0.0);
    });
  });
});