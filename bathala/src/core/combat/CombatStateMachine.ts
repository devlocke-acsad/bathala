/**
 * CombatStateMachine - Manages combat phase transitions
 * 
 * Replaces inline phase management in Combat.ts with a proper state machine.
 * Emits typed events on transitions so scene and UI can react.
 * 
 * States: INIT → PLAYER_TURN → ACTION_SELECTION → RESOLVING → ENEMY_TURN → CHECK_END → POST_COMBAT → DONE
 * 
 * @module core/combat/CombatStateMachine
 */

// =============================================================================
// TYPES
// =============================================================================

export enum CombatPhase {
  /** Combat is being set up (loading enemy, initial draw) */
  INIT = 'init',
  /** Player's turn — drawing cards, selecting hand */
  PLAYER_TURN = 'player_turn',
  /** Player has confirmed hand, choosing action (attack/defend/special) */
  ACTION_SELECTION = 'action_selection',
  /** Action is being resolved (damage, effects, animations) */
  RESOLVING = 'resolving',
  /** Enemy's turn — executing AI pattern */
  ENEMY_TURN = 'enemy_turn',
  /** Checking win/loss conditions after a round */
  CHECK_END = 'check_end',
  /** Combat over — showing rewards/Landás choice */
  POST_COMBAT = 'post_combat',
  /** Landás choice being made (spare/slay) */
  LANDAS_CHOICE = 'landas_choice',
  /** Rewards screen */
  REWARDS = 'rewards',
  /** Game over (player died) */
  GAME_OVER = 'game_over',
  /** Combat fully complete, transitioning out */
  DONE = 'done',
}

export interface PhaseTransition {
  from: CombatPhase;
  to: CombatPhase;
  turn: number;
  timestamp: number;
}

export type PhaseListener = (transition: PhaseTransition) => void;

/**
 * Valid transitions map — defines which phases can transition to which
 */
const VALID_TRANSITIONS: Record<CombatPhase, CombatPhase[]> = {
  [CombatPhase.INIT]: [CombatPhase.PLAYER_TURN],
  [CombatPhase.PLAYER_TURN]: [CombatPhase.ACTION_SELECTION, CombatPhase.CHECK_END],
  [CombatPhase.ACTION_SELECTION]: [CombatPhase.RESOLVING],
  [CombatPhase.RESOLVING]: [CombatPhase.CHECK_END, CombatPhase.ENEMY_TURN],
  [CombatPhase.ENEMY_TURN]: [CombatPhase.CHECK_END, CombatPhase.PLAYER_TURN],
  [CombatPhase.CHECK_END]: [CombatPhase.PLAYER_TURN, CombatPhase.ENEMY_TURN, CombatPhase.POST_COMBAT, CombatPhase.GAME_OVER],
  [CombatPhase.POST_COMBAT]: [CombatPhase.LANDAS_CHOICE, CombatPhase.REWARDS, CombatPhase.DONE],
  [CombatPhase.LANDAS_CHOICE]: [CombatPhase.REWARDS],
  [CombatPhase.REWARDS]: [CombatPhase.DONE],
  [CombatPhase.GAME_OVER]: [CombatPhase.DONE],
  [CombatPhase.DONE]: [],
};

// =============================================================================
// STATE MACHINE
// =============================================================================

export class CombatStateMachine {
  private _phase: CombatPhase = CombatPhase.INIT;
  private _turn: number = 0;
  private _history: PhaseTransition[] = [];
  private _listeners: Map<string, PhaseListener[]> = new Map();
  private _globalListeners: PhaseListener[] = [];

  constructor() {
    this.reset();
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  get phase(): CombatPhase {
    return this._phase;
  }

  get turn(): number {
    return this._turn;
  }

  get history(): ReadonlyArray<PhaseTransition> {
    return this._history;
  }

  get isPlayerTurn(): boolean {
    return this._phase === CombatPhase.PLAYER_TURN || this._phase === CombatPhase.ACTION_SELECTION;
  }

  get isEnemyTurn(): boolean {
    return this._phase === CombatPhase.ENEMY_TURN;
  }

  get isCombatActive(): boolean {
    return this._phase !== CombatPhase.DONE &&
           this._phase !== CombatPhase.GAME_OVER &&
           this._phase !== CombatPhase.POST_COMBAT &&
           this._phase !== CombatPhase.REWARDS &&
           this._phase !== CombatPhase.LANDAS_CHOICE;
  }

  get isCombatOver(): boolean {
    return this._phase === CombatPhase.POST_COMBAT ||
           this._phase === CombatPhase.GAME_OVER ||
           this._phase === CombatPhase.DONE;
  }

  // ===========================================================================
  // TRANSITIONS
  // ===========================================================================

  /**
   * Transition to a new phase
   * @throws Error if the transition is not valid
   */
  transitionTo(newPhase: CombatPhase): PhaseTransition {
    const validTargets = VALID_TRANSITIONS[this._phase];
    if (!validTargets.includes(newPhase)) {
      console.warn(
        `⚠️ Invalid combat phase transition: ${this._phase} → ${newPhase}. ` +
        `Valid: [${validTargets.join(', ')}]`
      );
      // Allow it in production but warn — don't crash the game
    }

    const transition: PhaseTransition = {
      from: this._phase,
      to: newPhase,
      turn: this._turn,
      timestamp: Date.now(),
    };

    this._phase = newPhase;
    this._history.push(transition);

    // Increment turn when entering player turn (except first time)
    if (newPhase === CombatPhase.PLAYER_TURN && this._turn > 0) {
      this._turn++;
    } else if (newPhase === CombatPhase.PLAYER_TURN && this._turn === 0) {
      this._turn = 1;
    }

    // Emit events
    this._emit(transition);

    return transition;
  }

  /**
   * Force-set phase (for recovery/debugging, skips validation)
   */
  forcePhase(phase: CombatPhase): void {
    this._phase = phase;
  }

  // ===========================================================================
  // CONVENIENCE TRANSITIONS
  // ===========================================================================

  startCombat(): PhaseTransition {
    return this.transitionTo(CombatPhase.PLAYER_TURN);
  }

  startActionSelection(): PhaseTransition {
    return this.transitionTo(CombatPhase.ACTION_SELECTION);
  }

  startResolving(): PhaseTransition {
    return this.transitionTo(CombatPhase.RESOLVING);
  }

  startEnemyTurn(): PhaseTransition {
    return this.transitionTo(CombatPhase.ENEMY_TURN);
  }

  checkEndConditions(): PhaseTransition {
    return this.transitionTo(CombatPhase.CHECK_END);
  }

  startPostCombat(): PhaseTransition {
    return this.transitionTo(CombatPhase.POST_COMBAT);
  }

  startLandasChoice(): PhaseTransition {
    return this.transitionTo(CombatPhase.LANDAS_CHOICE);
  }

  startRewards(): PhaseTransition {
    return this.transitionTo(CombatPhase.REWARDS);
  }

  endCombat(): PhaseTransition {
    return this.transitionTo(CombatPhase.DONE);
  }

  gameOver(): PhaseTransition {
    return this.transitionTo(CombatPhase.GAME_OVER);
  }

  nextPlayerTurn(): PhaseTransition {
    return this.transitionTo(CombatPhase.PLAYER_TURN);
  }

  // ===========================================================================
  // EVENTS
  // ===========================================================================

  /**
   * Listen for any phase transition
   */
  onTransition(listener: PhaseListener): () => void {
    this._globalListeners.push(listener);
    return () => {
      this._globalListeners = this._globalListeners.filter(l => l !== listener);
    };
  }

  /**
   * Listen for transition INTO a specific phase
   */
  onEnter(phase: CombatPhase, listener: PhaseListener): () => void {
    const key = `enter_${phase}`;
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key)!.push(listener);
    return () => {
      const arr = this._listeners.get(key);
      if (arr) this._listeners.set(key, arr.filter(l => l !== listener));
    };
  }

  /**
   * Listen for transition OUT OF a specific phase
   */
  onExit(phase: CombatPhase, listener: PhaseListener): () => void {
    const key = `exit_${phase}`;
    if (!this._listeners.has(key)) this._listeners.set(key, []);
    this._listeners.get(key)!.push(listener);
    return () => {
      const arr = this._listeners.get(key);
      if (arr) this._listeners.set(key, arr.filter(l => l !== listener));
    };
  }

  private _emit(transition: PhaseTransition): void {
    // Global listeners
    for (const l of this._globalListeners) {
      try { l(transition); } catch (e) { console.error('Phase listener error:', e); }
    }
    // Exit listeners
    const exitKey = `exit_${transition.from}`;
    for (const l of this._listeners.get(exitKey) ?? []) {
      try { l(transition); } catch (e) { console.error('Phase exit listener error:', e); }
    }
    // Enter listeners
    const enterKey = `enter_${transition.to}`;
    for (const l of this._listeners.get(enterKey) ?? []) {
      try { l(transition); } catch (e) { console.error('Phase enter listener error:', e); }
    }
  }

  // ===========================================================================
  // RESET
  // ===========================================================================

  reset(): void {
    this._phase = CombatPhase.INIT;
    this._turn = 0;
    this._history = [];
  }

  destroy(): void {
    this._listeners.clear();
    this._globalListeners = [];
    this._history = [];
  }
}
