/**
 * TurnSystem - Manages combat turn flow independent of Phaser
 * 
 * Decoupled from the Combat scene to enable:
 * - Unit testing without Phaser
 * - Clear turn state management
 * - Event-driven phase transitions
 * 
 * @module systems/combat/TurnSystem
 */

/** Phases within a combat turn cycle */
export enum TurnPhase {
  COMBAT_START = 'combat_start',
  PLAYER_START = 'player_start',
  PLAYER_ACTION = 'player_action',
  PLAYER_END = 'player_end',
  ENEMY_START = 'enemy_start',
  ENEMY_ACTION = 'enemy_action',
  ENEMY_END = 'enemy_end',
  COMBAT_END = 'combat_end',
}

/** Callback type for turn events */
type TurnEventCallback = (...args: unknown[]) => void;

/**
 * Manages the combat turn lifecycle.
 * 
 * Turn Flow:
 * 1. COMBAT_START → PLAYER_START
 * 2. PLAYER_START → PLAYER_ACTION (wait for player input)
 * 3. PLAYER_ACTION → PLAYER_END
 * 4. PLAYER_END → ENEMY_START
 * 5. ENEMY_START → ENEMY_ACTION → ENEMY_END
 * 6. ENEMY_END → PLAYER_START (loop)
 * 7. COMBAT_END when victory/defeat
 */
export class TurnSystem {
  private currentPhase: TurnPhase = TurnPhase.COMBAT_START;
  private turnCount: number = 0;
  private combatActive: boolean = false;
  private listeners: Map<string, TurnEventCallback[]> = new Map();

  /** Get the current turn phase */
  getCurrentPhase(): TurnPhase {
    return this.currentPhase;
  }

  /** Get the current turn number */
  getTurnCount(): number {
    return this.turnCount;
  }

  /** Check if combat is currently active */
  isCombatActive(): boolean {
    return this.combatActive;
  }

  /** Check if it's currently the player's turn */
  isPlayerTurn(): boolean {
    return (
      this.currentPhase === TurnPhase.PLAYER_START ||
      this.currentPhase === TurnPhase.PLAYER_ACTION
    );
  }

  /** Check if it's currently the enemy's turn */
  isEnemyTurn(): boolean {
    return (
      this.currentPhase === TurnPhase.ENEMY_START ||
      this.currentPhase === TurnPhase.ENEMY_ACTION
    );
  }

  /**
   * Begin a new combat encounter
   */
  startCombat(): void {
    this.turnCount = 0;
    this.combatActive = true;
    this.setPhase(TurnPhase.COMBAT_START);
    this.emit('combat:start');
  }

  /**
   * Begin the player's turn (increments turn counter)
   */
  startPlayerTurn(): void {
    if (!this.combatActive) return;
    this.turnCount++;
    this.setPhase(TurnPhase.PLAYER_START);
    this.emit('turn:player:start', this.turnCount);
  }

  /**
   * Signal that the player is selecting actions
   */
  enterPlayerAction(): void {
    if (!this.combatActive) return;
    this.setPhase(TurnPhase.PLAYER_ACTION);
    this.emit('turn:player:action', this.turnCount);
  }

  /**
   * End the player's turn and begin enemy turn
   */
  endPlayerTurn(): void {
    if (!this.combatActive) return;
    this.setPhase(TurnPhase.PLAYER_END);
    this.emit('turn:player:end', this.turnCount);
  }

  /**
   * Begin the enemy's turn
   */
  startEnemyTurn(): void {
    if (!this.combatActive) return;
    this.setPhase(TurnPhase.ENEMY_START);
    this.emit('turn:enemy:start', this.turnCount);
  }

  /**
   * Signal that the enemy is executing actions
   */
  enterEnemyAction(): void {
    if (!this.combatActive) return;
    this.setPhase(TurnPhase.ENEMY_ACTION);
    this.emit('turn:enemy:action', this.turnCount);
  }

  /**
   * End the enemy's turn
   */
  endEnemyTurn(): void {
    if (!this.combatActive) return;
    this.setPhase(TurnPhase.ENEMY_END);
    this.emit('turn:enemy:end', this.turnCount);
  }

  /**
   * End combat (victory or defeat)
   */
  endCombat(victory: boolean): void {
    this.combatActive = false;
    this.setPhase(TurnPhase.COMBAT_END);
    this.emit('combat:end', victory, this.turnCount);
  }

  // ===========================================================================
  // EVENT SYSTEM
  // ===========================================================================

  /**
   * Register a listener for a turn event
   */
  on(event: string, callback: TurnEventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove a listener for a turn event
   */
  off(event: string, callback: TurnEventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit a turn event to all registered listeners
   */
  private emit(event: string, ...args: unknown[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(...args);
      }
    }
  }

  /**
   * Set the current phase and emit a phase change event
   */
  private setPhase(phase: TurnPhase): void {
    const previousPhase = this.currentPhase;
    this.currentPhase = phase;
    this.emit('phase:change', phase, previousPhase);
  }

  /**
   * Reset the turn system for a new combat
   */
  reset(): void {
    this.turnCount = 0;
    this.combatActive = false;
    this.currentPhase = TurnPhase.COMBAT_START;
  }

  /**
   * Remove all listeners (call on scene shutdown)
   */
  dispose(): void {
    this.listeners.clear();
    this.reset();
  }
}
