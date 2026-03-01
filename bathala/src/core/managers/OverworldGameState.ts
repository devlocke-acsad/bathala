export class OverworldGameState {
  private static instance: OverworldGameState;

  // Day/Night cycle tracking
  public actionsTaken: number = 0;
  public currentCycle: number = 1;
  public isDay: boolean = true;
  public actionsUntilCycleChange: number = 50; // Default from GDD
  public totalActionsUntilBoss: number = 500; // 5 cycles * 100 actions per cycle
  public bossAppeared: boolean = false;

  // Engagement tracking for anti-rush balancing
  public combatsStarted: number = 0;
  public eliteCombatsStarted: number = 0;
  public bossCombatsStarted: number = 0;

  // Next combat buffs (applied at the start of next combat)
  public nextCombatBlock: number = 0;
  public nextCombatHealth: number = 0;

  private constructor() {}

  static getInstance(): OverworldGameState {
    if (!OverworldGameState.instance) {
      OverworldGameState.instance = new OverworldGameState();
    }
    return OverworldGameState.instance;
  }

  /**
   * Record an action taken by the player
   */
  recordAction(): void {
    this.actionsTaken++;
    this.actionsUntilCycleChange--;

    // Check if we need to change cycle
    if (this.actionsUntilCycleChange <= 0) {
      this.toggleDayNight();
    }

    // Note: bossAppeared flag is now managed by the Overworld scene when boss actually triggers
  }

  /**
   * Toggle between day and night
   */
  private toggleDayNight(): void {
    this.isDay = !this.isDay;
    this.currentCycle += this.isDay ? 1 : 0; // Increment cycle when day starts
    this.actionsUntilCycleChange = 50; // Reset to default
    
    console.log(`Cycle ${this.currentCycle}: ${this.isDay ? 'Day' : 'Night'} begins`);
  }

  /**
   * Check if boss should appear
   */
  shouldBossAppear(): boolean {
    return this.actionsTaken >= this.totalActionsUntilBoss && !this.bossAppeared;
  }

  /**
   * Mark that the boss encounter has been triggered
   */
  markBossTriggered(): void {
    this.bossAppeared = true;
  }

  /**
   * Record when combat is entered from the overworld.
   */
  recordCombatStart(type: "combat" | "elite" | "boss"): void {
    if (type === "boss") {
      this.bossCombatsStarted++;
      return;
    }

    this.combatsStarted++;
    if (type === "elite") {
      this.eliteCombatsStarted++;
    }
  }

  /**
   * Build boss encounter tuning based on run preparation quality.
   * This is intentionally independent from DDA.
   */
  getBossPreparationContext(
    relicCount: number,
    potionCount: number
  ): {
    readiness: number;
    healthMultiplier: number;
    damageMultiplier: number;
    label: string;
    notes: string[];
  } {
    const expectedCombats = Math.max(4, Math.floor(this.actionsTaken / 70));
    const combatParticipation = Math.min(1, this.combatsStarted / expectedCombats);
    const resourceReadiness = Math.min(1, relicCount * 0.25 + potionCount * 0.35);
    const readiness = Math.max(
      0,
      Math.min(1, combatParticipation * 0.55 + resourceReadiness * 0.45)
    );

    if (readiness >= 0.8) {
      return {
        readiness,
        healthMultiplier: 0.95,
        damageMultiplier: 0.95,
        label: "well_prepared",
        notes: ["Strong node engagement and resource planning."],
      };
    }

    if (readiness >= 0.6) {
      return {
        readiness,
        healthMultiplier: 1.0,
        damageMultiplier: 1.0,
        label: "prepared",
        notes: ["Adequate node engagement and resource collection."],
      };
    }

    if (readiness >= 0.4) {
      return {
        readiness,
        healthMultiplier: 1.08,
        damageMultiplier: 1.08,
        label: "underprepared",
        notes: ["Limited combat or resource preparation before boss."],
      };
    }

    if (readiness >= 0.2) {
      return {
        readiness,
        healthMultiplier: 1.15,
        damageMultiplier: 1.15,
        label: "poorly_prepared",
        notes: ["Low engagement with progression nodes and resources."],
      };
    }

    return {
      readiness,
      healthMultiplier: 1.22,
      damageMultiplier: 1.2,
      label: "rush_path",
      notes: ["Boss rush detected: minimal preparation taken."],
    };
  }

  /**
   * Reset the game state for a new run
   */
  reset(): void {
    this.actionsTaken = 0;
    this.currentCycle = 1;
    this.isDay = true;
    this.actionsUntilCycleChange = 50;
    this.bossAppeared = false;
    this.nextCombatBlock = 0;
    this.nextCombatHealth = 0;
    this.combatsStarted = 0;
    this.eliteCombatsStarted = 0;
    this.bossCombatsStarted = 0;
  }

  /**
   * Get the current time of day as a string
   */
  getTimeOfDay(): string {
    return this.isDay ? 'Day' : 'Night';
  }

  /**
   * Get progress toward the next cycle change
   */
  getCycleProgress(): number {
    return (50 - this.actionsUntilCycleChange) / 50;
  }

  /**
   * Get progress toward boss appearance
   */
  getBossProgress(): number {
    return Math.min(this.actionsTaken / this.totalActionsUntilBoss, 1);
  }

  /**
   * Add block to be applied at the start of the next combat
   */
  addNextCombatBlock(amount: number): void {
    this.nextCombatBlock += amount;
  }

  /**
   * Add health to be applied at the start of the next combat
   */
  addNextCombatHealth(amount: number): void {
    this.nextCombatHealth += amount;
  }

  /**
   * Consume and return next combat buffs (called when combat starts)
   * Returns {block, health} and resets the values
   */
  consumeNextCombatBuffs(): { block: number; health: number } {
    const buffs = {
      block: this.nextCombatBlock,
      health: this.nextCombatHealth
    };
    this.nextCombatBlock = 0;
    this.nextCombatHealth = 0;
    return buffs;
  }
}