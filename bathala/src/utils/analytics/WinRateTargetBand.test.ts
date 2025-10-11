import { DDAAnalyticsManager } from "./DDAAnalyticsManager";
import { CombatMetrics } from "../../core/dda/DDATypes";
import { RuleBasedDDA } from "../../core/dda/RuleBasedDDA";

describe("DDAAnalyticsManager win rate target band", () => {
  const baseVictory: CombatMetrics = {
    combatId: "victory",
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
    combatDuration: 30_000,
    enemyType: "common",
    enemyName: "Test Enemy",
    enemyStartHealth: 30,
  };

  const baseDefeat: CombatMetrics = {
    ...baseVictory,
    combatId: "defeat",
    timestamp: Date.now() + 1,
    endHealth: 0,
    healthPercentage: 0,
    damageDealt: 15,
    damageReceived: 40,
    discardsUsed: 2,
    bestHandAchieved: "high_card",
    handsPlayed: ["high_card"],
    averageHandQuality: 0,
    victory: false,
  };

  let analytics: DDAAnalyticsManager;

  beforeEach(() => {
    RuleBasedDDA.forceClearSingleton();
    (DDAAnalyticsManager as unknown as { instance?: DDAAnalyticsManager }).instance = undefined;
    analytics = DDAAnalyticsManager.getInstance();
    analytics.resetSession();
  });

  it("returns below target status when no combats have been recorded", () => {
    const status = analytics.checkWinRateTargetBand();

    expect(status.winRate).toBe(0);
    expect(status.withinTarget).toBe(false);
    expect(status.status).toBe("below_target");
  });

  it("throws when provided an invalid win rate band", () => {
    expect(() => analytics.setWinRateTargetBand(70, 30)).toThrow(
      /Invalid win rate target band/i
    );
    expect(() => analytics.setWinRateTargetBand(-10, 50)).toThrow();
    expect(() => analytics.setWinRateTargetBand(10, 110)).toThrow();
  });

  it("allows configuring a custom win rate band", () => {
    analytics.setWinRateTargetBand(30, 70);

    expect(analytics.getWinRateTargetBand()).toEqual({ min: 30, max: 70 });
  });

  it("reports win rate within target band", () => {
    analytics.setWinRateTargetBand(40, 60);

    recordCombats(analytics, 3, 2);

    const status = analytics.checkWinRateTargetBand();

    expect(status.winRate).toBe(60);
    expect(status.withinTarget).toBe(true);
    expect(status.status).toBe("within_target");
  });

  it("reports win rate above target band", () => {
    analytics.setWinRateTargetBand(40, 60);

    recordCombats(analytics, 9, 1);

    const status = analytics.checkWinRateTargetBand();

    expect(status.winRate).toBe(90);
    expect(status.withinTarget).toBe(false);
    expect(status.status).toBe("above_target");
  });

  it("reports win rate below target band", () => {
    analytics.setWinRateTargetBand(40, 60);

    recordCombats(analytics, 1, 9);

    const status = analytics.checkWinRateTargetBand();

    expect(status.winRate).toBe(10);
    expect(status.withinTarget).toBe(false);
    expect(status.status).toBe("below_target");
  });

  function recordCombats(
    manager: DDAAnalyticsManager,
    victories: number,
    defeats: number
  ): void {
    for (let i = 0; i < victories; i++) {
      manager.recordCombat({
        ...baseVictory,
        combatId: `victory-${i}`,
        timestamp: Date.now() + i,
      });
    }

    for (let i = 0; i < defeats; i++) {
      manager.recordCombat({
        ...baseDefeat,
        combatId: `defeat-${i}`,
        timestamp: Date.now() + victories + i,
      });
    }
  }
});