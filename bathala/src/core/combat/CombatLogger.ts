/**
 * CombatLogger - Analytics and debug logging for combat + DDA
 *
 * Centralises combat event recording so that:
 *  - DDA can read a clean stream of combat metrics
 *  - Debugging/replay is possible
 *  - Thesis validation data is captured
 *
 * Each combat gets its own CombatLog. Completed logs can be submitted to
 * DDAAnalyticsManager for session-level aggregation.
 *
 * @module core/combat/CombatLogger
 */

import type { HandType, CombatActionType } from '../../core/types/CombatTypes';

// =============================================================================
// EVENT TYPES
// =============================================================================

export type CombatEventKind =
  | 'combat_start'
  | 'turn_start'
  | 'hand_played'
  | 'action_executed'
  | 'enemy_action'
  | 'damage_dealt'
  | 'damage_taken'
  | 'status_applied'
  | 'status_expired'
  | 'relic_triggered'
  | 'potion_used'
  | 'discard'
  | 'phase_change'
  | 'combat_end'
  | 'custom';

export interface CombatEvent {
  /** Sequential index within this combat */
  index: number;
  /** Timestamp (ms since combat start) */
  timestamp: number;
  /** Event category */
  kind: CombatEventKind;
  /** Freeform payload */
  data: Record<string, unknown>;
}

// =============================================================================
// COMBAT METRICS SNAPSHOT
// =============================================================================

/** Metrics that the DDA system reads after combat */
export interface CombatMetrics {
  /** Turn count */
  turns: number;
  /** Total damage dealt to enemy */
  totalDamageDealt: number;
  /** Total damage taken from enemy */
  totalDamageTaken: number;
  /** Player HP at end of combat */
  playerHpEnd: number;
  /** Player max HP */
  playerHpMax: number;
  /** Health retention % (0–100) */
  healthRetention: number;
  /** Best poker hand achieved */
  bestHand: HandType;
  /** Number of discard charges used */
  discardsUsed: number;
  /** Number of discard charges available */
  discardsAvailable: number;
  /** Whether player won */
  playerWon: boolean;
  /** Enemy tier (common / elite / boss) */
  enemyTier: string;
  /** Combat duration ms */
  durationMs: number;
  /** Damage dealt per turn (avg) */
  damagePerTurn: number;
  /** Actions breakdown */
  actionCounts: Record<CombatActionType, number>;
}

// =============================================================================
// LOGGER CLASS
// =============================================================================

export class CombatLogger {
  private events: CombatEvent[] = [];
  private startTime: number = Date.now();
  private _turns = 0;
  private _totalDamageDealt = 0;
  private _totalDamageTaken = 0;
  private _discardsUsed = 0;
  private _discardsAvailable = 3;
  private _bestHand: HandType = 'high_card';
  private _playerHpEnd = 0;
  private _playerHpMax = 120;
  private _playerWon = false;
  private _enemyTier = 'common';
  private _actionCounts: Record<CombatActionType, number> = {
    attack: 0,
    defend: 0,
    special: 0,
  };

  // ---- Event recording -------------------------------------------------------

  /** Log a structured combat event */
  log(kind: CombatEventKind, data: Record<string, unknown> = {}): void {
    this.events.push({
      index: this.events.length,
      timestamp: Date.now() - this.startTime,
      kind,
      data,
    });
  }

  /** Log start of combat */
  logCombatStart(enemyName: string, enemyTier: string, playerHp: number, playerMaxHp: number): void {
    this._enemyTier = enemyTier;
    this._playerHpMax = playerMaxHp;
    this.log('combat_start', { enemyName, enemyTier, playerHp, playerMaxHp });
  }

  /** Log a new player turn starting */
  logTurnStart(turn: number): void {
    this._turns = turn;
    this.log('turn_start', { turn });
  }

  /** Log an action being executed */
  logAction(actionType: CombatActionType, handType: HandType, damage: number, block: number): void {
    this._actionCounts[actionType]++;

    if (actionType === 'attack') this._totalDamageDealt += damage;
    if (handType && this.isHandBetter(handType, this._bestHand)) {
      this._bestHand = handType;
    }

    this.log('action_executed', { actionType, handType, damage, block });
  }

  /** Log damage taken by the player */
  logDamageTaken(amount: number, source: string): void {
    this._totalDamageTaken += amount;
    this.log('damage_taken', { amount, source });
  }

  /** Log a discard usage */
  logDiscard(cardCount: number): void {
    this._discardsUsed++;
    this.log('discard', { cardCount });
  }

  /** Log phase transition */
  logPhaseChange(from: string, to: string): void {
    this.log('phase_change', { from, to });
  }

  /** Log combat end */
  logCombatEnd(playerWon: boolean, playerHp: number): void {
    this._playerWon = playerWon;
    this._playerHpEnd = playerHp;
    this.log('combat_end', { playerWon, playerHp });
  }

  // ---- Metrics snapshot -------------------------------------------------------

  /** Build the metrics snapshot for DDA/analytics consumption */
  getMetrics(): CombatMetrics {
    const durationMs = Date.now() - this.startTime;
    const healthRetention = this._playerHpMax > 0
      ? Math.round((this._playerHpEnd / this._playerHpMax) * 100)
      : 0;
    const damagePerTurn = this._turns > 0
      ? Math.round(this._totalDamageDealt / this._turns)
      : 0;

    return {
      turns: this._turns,
      totalDamageDealt: this._totalDamageDealt,
      totalDamageTaken: this._totalDamageTaken,
      playerHpEnd: this._playerHpEnd,
      playerHpMax: this._playerHpMax,
      healthRetention,
      bestHand: this._bestHand,
      discardsUsed: this._discardsUsed,
      discardsAvailable: this._discardsAvailable,
      playerWon: this._playerWon,
      enemyTier: this._enemyTier,
      durationMs,
      damagePerTurn,
      actionCounts: { ...this._actionCounts },
    };
  }

  /** Get the full event log (for replays/debug) */
  getEvents(): readonly CombatEvent[] {
    return this.events;
  }

  /** Set available discard charges (from relic / player state) */
  setDiscardsAvailable(n: number): void {
    this._discardsAvailable = n;
  }

  // ---- Private helpers --------------------------------------------------------

  private isHandBetter(a: HandType, b: HandType): boolean {
    const ORDER: HandType[] = [
      'high_card', 'pair', 'two_pair', 'three_of_a_kind',
      'straight', 'flush', 'full_house', 'four_of_a_kind',
      'five_of_a_kind', 'straight_flush', 'royal_flush',
    ];
    return ORDER.indexOf(a) > ORDER.indexOf(b);
  }
}
