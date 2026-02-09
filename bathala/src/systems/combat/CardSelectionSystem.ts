/**
 * CardSelectionSystem - Manages card selection logic independent of Phaser
 * 
 * Handles:
 * - Card selection/deselection with max limit
 * - Selection state tracking
 * - Hand completeness validation
 * 
 * @module systems/combat/CardSelectionSystem
 */

import { PlayingCard } from '../../core/types/CombatTypes';

/** State of the card selection */
export interface CardSelectionState {
  /** Cards in hand available for selection */
  hand: PlayingCard[];
  /** Currently selected cards */
  selected: PlayingCard[];
  /** Maximum cards that can be selected */
  maxSelection: number;
}

/**
 * Manages card selection during the player's turn.
 * Pure logic - no Phaser dependency.
 */
export class CardSelectionSystem {
  private state: CardSelectionState;

  constructor(maxSelection: number = 5) {
    this.state = {
      hand: [],
      selected: [],
      maxSelection,
    };
  }

  // ===========================================================================
  // HAND MANAGEMENT
  // ===========================================================================

  /**
   * Set the current hand of cards
   */
  setHand(cards: PlayingCard[]): void {
    this.state.hand = [...cards];
    this.state.selected = [];
  }

  /**
   * Get the current hand
   */
  getHand(): PlayingCard[] {
    return [...this.state.hand];
  }

  /**
   * Get the maximum selection limit
   */
  getMaxSelection(): number {
    return this.state.maxSelection;
  }

  /**
   * Update the maximum selection limit
   */
  setMaxSelection(max: number): void {
    this.state.maxSelection = max;
  }

  // ===========================================================================
  // SELECTION OPERATIONS
  // ===========================================================================

  /**
   * Select a card from hand
   * @returns true if selection was successful
   */
  selectCard(card: PlayingCard): boolean {
    if (this.state.selected.length >= this.state.maxSelection) {
      return false;
    }
    // Check if already selected (compare by suit and value)
    if (this.isSelected(card)) {
      return false;
    }
    // Check card is in hand
    if (!this.isInHand(card)) {
      return false;
    }
    this.state.selected.push(card);
    return true;
  }

  /**
   * Deselect a card
   * @returns true if deselection was successful
   */
  deselectCard(card: PlayingCard): boolean {
    const index = this.state.selected.findIndex(
      c => c.suit === card.suit && c.rank === card.rank
    );
    if (index === -1) return false;
    this.state.selected.splice(index, 1);
    return true;
  }

  /**
   * Toggle a card's selection state
   * @returns true if the card is now selected, false if deselected
   */
  toggleCard(card: PlayingCard): boolean {
    if (this.isSelected(card)) {
      this.deselectCard(card);
      return false;
    }
    return this.selectCard(card);
  }

  /**
   * Check if a card is currently selected
   */
  isSelected(card: PlayingCard): boolean {
    return this.state.selected.some(
      c => c.suit === card.suit && c.rank === card.rank
    );
  }

  /**
   * Check if a card is in the current hand
   */
  isInHand(card: PlayingCard): boolean {
    return this.state.hand.some(
      c => c.suit === card.suit && c.rank === card.rank
    );
  }

  // ===========================================================================
  // STATE QUERIES
  // ===========================================================================

  /**
   * Get all currently selected cards
   */
  getSelected(): PlayingCard[] {
    return [...this.state.selected];
  }

  /**
   * Get number of selected cards
   */
  getSelectionCount(): number {
    return this.state.selected.length;
  }

  /**
   * Check if the maximum number of cards has been selected
   */
  isSelectionComplete(): boolean {
    return this.state.selected.length === this.state.maxSelection;
  }

  /**
   * Check if any cards are selected
   */
  hasSelection(): boolean {
    return this.state.selected.length > 0;
  }

  /**
   * Get remaining selection slots
   */
  getRemainingSlots(): number {
    return this.state.maxSelection - this.state.selected.length;
  }

  // ===========================================================================
  // RESET
  // ===========================================================================

  /**
   * Clear all selected cards (keep hand)
   */
  clearSelection(): void {
    this.state.selected = [];
  }

  /**
   * Full reset (clear hand and selection)
   */
  reset(): void {
    this.state = {
      hand: [],
      selected: [],
      maxSelection: this.state.maxSelection,
    };
  }
}
