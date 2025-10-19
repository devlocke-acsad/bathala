export class OverworldGameState {
  private static instance: OverworldGameState;

  // Day/Night cycle tracking
  public actionsTaken: number = 0;
  public currentCycle: number = 1;
  public isDay: boolean = true;
  public actionsUntilCycleChange: number = 50; // Default from GDD
  public totalActionsUntilBoss: number = 500; // 5 cycles * 100 actions per cycle
  public bossAppeared: boolean = false;

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