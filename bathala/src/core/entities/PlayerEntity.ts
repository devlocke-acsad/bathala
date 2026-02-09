/**
 * PlayerEntity - Runtime player instance with behavior methods
 * 
 * Encapsulates all player combat behavior: card management, damage,
 * healing, status effects, relics, potions
 * 
 * @module core/entities/PlayerEntity
 * 
 * @example
 * ```typescript
 * const player = PlayerEntity.fromGameState(gameState);
 * player.drawCards(8);
 * player.takeDamage(15);
 * player.applyStatus('strength', 2);
 * const hand = player.getHand();
 * ```
 */

import {
  Player,
  PlayingCard,
  Relic,
  StatusEffect,
  CombatEntity,
} from '../types/CombatTypes';
import { StatusEffectManager } from '../managers/StatusEffectManager';
import { DeckManager } from '../../utils/DeckManager';

// =============================================================================
// TYPES
// =============================================================================

export interface PlayerDamageResult {
  blockedDamage: number;
  hpDamage: number;
  remainingBlock: number;
  remainingHealth: number;
  isDead: boolean;
}

export interface Potion {
  id: string;
  name: string;
  description: string;
  emoji: string;
  effect: string;
}

// =============================================================================
// PLAYER ENTITY
// =============================================================================

export class PlayerEntity {
  // === Identity ===
  public readonly id: string;
  public readonly name: string;

  // === Health ===
  public maxHealth: number;
  public currentHealth: number;
  public block: number;

  // === Cards ===
  public hand: PlayingCard[];
  public deck: PlayingCard[];
  public drawPile: PlayingCard[];
  public discardPile: PlayingCard[];
  public playedHand: PlayingCard[];

  // === Combat Resources ===
  public discardCharges: number;
  public maxDiscardCharges: number;

  // === Progression ===
  public landasScore: number;
  public ginto: number;
  public diamante: number;

  // === Equipment ===
  public relics: Relic[];
  public potions: Potion[];

  // === Status Effects ===
  public statusEffects: StatusEffect[];

  // === Educational ===
  public educationalProgress?: Player['educationalProgress'];

  constructor(data: Player) {
    this.id = data.id;
    this.name = data.name;
    this.maxHealth = data.maxHealth;
    this.currentHealth = data.currentHealth;
    this.block = data.block;
    this.hand = [...data.hand];
    this.deck = [...data.deck];
    this.drawPile = [...data.drawPile];
    this.discardPile = [...data.discardPile];
    this.playedHand = [...data.playedHand];
    this.discardCharges = data.discardCharges;
    this.maxDiscardCharges = data.maxDiscardCharges;
    this.landasScore = data.landasScore;
    this.ginto = data.ginto;
    this.diamante = data.diamante;
    this.relics = [...data.relics];
    this.potions = [...(data.potions as Potion[])];
    this.statusEffects = [...data.statusEffects];
    this.educationalProgress = data.educationalProgress;
  }

  // ===========================================================================
  // FACTORY
  // ===========================================================================

  /**
   * Create a PlayerEntity from a Player data object
   */
  static fromPlayer(player: Player): PlayerEntity {
    return new PlayerEntity(player);
  }

  /**
   * Create a fresh PlayerEntity for a new combat
   */
  static createFresh(options: {
    maxHealth: number;
    currentHealth: number;
    deck: PlayingCard[];
    relics?: Relic[];
    potions?: Potion[];
    ginto?: number;
    diamante?: number;
    landasScore?: number;
    discardCharges?: number;
    maxDiscardCharges?: number;
  }): PlayerEntity {
    const player: Player = {
      id: `player_${Date.now()}`,
      name: 'Bathala Seer',
      maxHealth: options.maxHealth,
      currentHealth: options.currentHealth,
      block: 0,
      hand: [],
      deck: [...options.deck],
      drawPile: DeckManager.shuffleDeck([...options.deck]),
      discardPile: [],
      playedHand: [],
      discardCharges: options.discardCharges ?? 1,
      maxDiscardCharges: options.maxDiscardCharges ?? 1,
      landasScore: options.landasScore ?? 0,
      ginto: options.ginto ?? 0,
      diamante: options.diamante ?? 0,
      relics: options.relics ?? [],
      potions: (options.potions ?? []) as any,
      statusEffects: [],
    };
    return new PlayerEntity(player);
  }

  // ===========================================================================
  // CARD MANAGEMENT
  // ===========================================================================

  /**
   * Draw cards from draw pile into hand
   * Shuffles discard pile into draw pile if needed
   * @returns Number of cards actually drawn
   */
  drawCards(count: number): PlayingCard[] {
    const drawn: PlayingCard[] = [];
    
    for (let i = 0; i < count; i++) {
      // If draw pile is empty, shuffle discard pile into draw pile
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break; // No cards anywhere
        this.drawPile = DeckManager.shuffleDeck([...this.discardPile]);
        this.discardPile = [];
      }
      
      const card = this.drawPile.pop();
      if (card) {
        card.selected = false;
        card.playable = true;
        this.hand.push(card);
        drawn.push(card);
      }
    }
    
    return drawn;
  }

  /**
   * Select a card from hand (toggle selection)
   * @returns true if card is now selected, false if deselected
   */
  selectCard(cardId: string, maxSelected: number = 5): boolean | null {
    const card = this.hand.find(c => c.id === cardId);
    if (!card) return null;

    if (card.selected) {
      card.selected = false;
      return false;
    }

    const selectedCount = this.hand.filter(c => c.selected).length;
    if (selectedCount >= maxSelected) return null;

    card.selected = true;
    return true;
  }

  /**
   * Get currently selected cards from hand
   */
  getSelectedCards(): PlayingCard[] {
    return this.hand.filter(c => c.selected);
  }

  /**
   * Confirm hand — move selected cards to playedHand
   * @returns The played cards, or null if not exactly 5 selected
   */
  confirmHand(): PlayingCard[] | null {
    const selected = this.getSelectedCards();
    if (selected.length !== 5) return null;

    // Move selected to played, rest to discard
    this.playedHand = [...selected];
    this.hand = this.hand.filter(c => !c.selected);

    // Deselect all
    this.playedHand.forEach(c => c.selected = false);

    return this.playedHand;
  }

  /**
   * Discard and redraw (uses a discard charge)
   * @returns New cards drawn, or null if no charges
   */
  discardAndRedraw(cardIds: string[]): PlayingCard[] | null {
    if (this.discardCharges <= 0) return null;

    this.discardCharges--;

    // Move specified cards from hand to discard
    const toDiscard = this.hand.filter(c => cardIds.includes(c.id));
    this.hand = this.hand.filter(c => !cardIds.includes(c.id));
    this.discardPile.push(...toDiscard);

    // Draw replacements
    return this.drawCards(toDiscard.length);
  }

  /**
   * End turn: move remaining hand cards to discard, clear played
   */
  endTurnCleanup(): void {
    this.discardPile.push(...this.hand, ...this.playedHand);
    this.hand = [];
    this.playedHand = [];
  }

  /**
   * Reset discard charges for a new turn
   */
  resetDiscardCharges(): void {
    this.discardCharges = this.maxDiscardCharges;
  }

  // ===========================================================================
  // DAMAGE & HEALING
  // ===========================================================================

  /**
   * Apply damage to this player (block absorbs first)
   */
  takeDamage(amount: number): PlayerDamageResult {
    const effectiveAmount = Math.max(0, Math.round(amount));
    let blockedDamage = 0;
    let hpDamage = 0;

    if (this.block > 0) {
      blockedDamage = Math.min(this.block, effectiveAmount);
      this.block -= blockedDamage;
      hpDamage = effectiveAmount - blockedDamage;
    } else {
      hpDamage = effectiveAmount;
    }

    this.currentHealth = Math.max(0, this.currentHealth - hpDamage);

    return {
      blockedDamage,
      hpDamage,
      remainingBlock: this.block,
      remainingHealth: this.currentHealth,
      isDead: this.currentHealth <= 0,
    };
  }

  /**
   * Heal the player (capped at maxHealth)
   */
  heal(amount: number): number {
    const before = this.currentHealth;
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + Math.max(0, amount));
    return this.currentHealth - before;
  }

  /**
   * Add block
   */
  addBlock(amount: number): void {
    this.block += Math.max(0, amount);
  }

  /**
   * Reset block to zero (called at start of player turn)
   */
  resetBlock(): void {
    this.block = 0;
  }

  // ===========================================================================
  // STATUS EFFECTS
  // ===========================================================================

  /**
   * Apply a status effect to this player
   */
  applyStatus(effectId: string, stacks: number): void {
    StatusEffectManager.applyStatusEffect(this.toCombatEntity(), effectId, stacks);
  }

  /**
   * Check if player has a specific status effect
   */
  hasStatus(effectId: string): boolean {
    return this.statusEffects.some(e => e.id === effectId);
  }

  /**
   * Get the stack count of a status effect
   */
  getStatusStacks(effectId: string): number {
    return this.statusEffects.find(e => e.id === effectId)?.value ?? 0;
  }

  /**
   * Remove a specific status effect
   */
  removeStatus(effectId: string): void {
    this.statusEffects = this.statusEffects.filter(e => e.id !== effectId);
  }

  // ===========================================================================
  // RELICS & POTIONS
  // ===========================================================================

  /**
   * Add a relic to the player's inventory
   */
  addRelic(relic: Relic): boolean {
    if (this.relics.length >= 6) return false; // Max 6 relics
    if (this.relics.some(r => r.id === relic.id)) return false; // No duplicates
    this.relics.push(relic);
    return true;
  }

  /**
   * Check if player has a specific relic
   */
  hasRelic(relicId: string): boolean {
    return this.relics.some(r => r.id === relicId);
  }

  /**
   * Add a potion to the player's inventory
   */
  addPotion(potion: Potion): boolean {
    if (this.potions.length >= 3) return false; // Max 3 potions
    this.potions.push(potion);
    return true;
  }

  /**
   * Use a potion (removes from inventory)
   * @returns The potion used, or null if not found
   */
  usePotion(potionId: string): Potion | null {
    const index = this.potions.findIndex(p => p.id === potionId);
    if (index === -1) return null;
    return this.potions.splice(index, 1)[0];
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  get isAlive(): boolean {
    return this.currentHealth > 0;
  }

  get isDead(): boolean {
    return this.currentHealth <= 0;
  }

  get healthPercent(): number {
    return this.maxHealth > 0 ? this.currentHealth / this.maxHealth : 0;
  }

  get isWeak(): boolean {
    return this.hasStatus('weak');
  }

  get isFrail(): boolean {
    return this.hasStatus('frail');
  }

  /**
   * Get the dominant element of the played hand
   */
  getDominantElement(): string {
    if (this.playedHand.length === 0) return 'neutral';
    
    const counts: Record<string, number> = {};
    for (const card of this.playedHand) {
      counts[card.element] = (counts[card.element] || 0) + 1;
    }
    
    let maxElement = 'neutral';
    let maxCount = 0;
    for (const [element, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxElement = element;
      }
    }
    return maxElement;
  }

  // ===========================================================================
  // CONVERSION
  // ===========================================================================

  /**
   * Convert back to legacy Player interface
   */
  toPlayer(): Player {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      hand: [...this.hand],
      deck: [...this.deck],
      drawPile: [...this.drawPile],
      discardPile: [...this.discardPile],
      playedHand: [...this.playedHand],
      discardCharges: this.discardCharges,
      maxDiscardCharges: this.maxDiscardCharges,
      landasScore: this.landasScore,
      ginto: this.ginto,
      diamante: this.diamante,
      relics: [...this.relics],
      potions: [...this.potions] as any,
      statusEffects: [...this.statusEffects],
      educationalProgress: this.educationalProgress,
    };
  }

  /**
   * Convert to CombatEntity for StatusEffectManager
   */
  toCombatEntity(): CombatEntity {
    return {
      id: this.id,
      name: this.name,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: this.statusEffects,
    };
  }

  /**
   * Sync from CombatEntity (after StatusEffectManager modifies in-place)
   */
  syncFromCombatEntity(entity: CombatEntity): void {
    this.currentHealth = entity.currentHealth;
    this.block = entity.block;
    this.statusEffects = entity.statusEffects;
  }
}
