/**
 * PlayerEntity — Concrete class encapsulating all player state & behavior.
 * Single instance per game session. Extends CombatEntity.
 *
 * Replaces the plain Player interface from CombatTypes for runtime use.
 */
import { CombatEntity } from './base/CombatEntity';
import {
  PlayingCard,
} from '../types/CombatTypes';
import { RelicEntity } from './items/RelicEntity';
import { PotionEntity } from './items/PotionEntity';

export class PlayerEntity extends CombatEntity {
  // ── Card state ──────────────────────────────────────
  public deck: PlayingCard[];
  public hand: PlayingCard[];
  public drawPile: PlayingCard[];
  public discardPile: PlayingCard[];
  public playedHand: PlayingCard[];

  // ── Resources ───────────────────────────────────────
  public ginto: number;
  public diamante: number;

  // ── Morality ────────────────────────────────────────
  public landasScore: number;

  // ── Relics & Potions ────────────────────────────────
  public relics: RelicEntity[];
  public potions: PotionEntity[];

  /** Max number of potions the player can carry. */
  public readonly maxPotions: number;

  // ── Discard charges ─────────────────────────────────
  public discardCharges: number;
  public maxDiscardCharges: number;

  // ── Educational progress ────────────────────────────
  public educationalProgress: {
    valuesLearned: Record<string, number>;
    regionsEncountered: Record<string, number>;
    culturalKnowledgeScore: number;
    achievements: string[];
  };

  constructor(
    id: string = 'player',
    name: string = 'Bayani',
    maxHealth: number = 80,
  ) {
    super(id, name, maxHealth);

    this.deck = [];
    this.hand = [];
    this.drawPile = [];
    this.discardPile = [];
    this.playedHand = [];

    this.ginto = 0;
    this.diamante = 0;

    this.landasScore = 0;

    this.relics = [];
    this.potions = [];
    this.maxPotions = 3;

    this.discardCharges = 1;
    this.maxDiscardCharges = 1;

    this.educationalProgress = {
      valuesLearned: {},
      regionsEncountered: {},
      culturalKnowledgeScore: 0,
      achievements: [],
    };
  }

  // ── Landás helpers ──────────────────────────────────

  get landas(): 'Mercy' | 'Balance' | 'Conquest' {
    if (this.landasScore >= 5) return 'Mercy';
    if (this.landasScore <= -5) return 'Conquest';
    return 'Balance';
  }

  spareMorality(): void {
    this.landasScore += 1;
  }

  slayMorality(): void {
    this.landasScore -= 1;
  }

  // ── Card management ─────────────────────────────────

  /** Draw N cards from drawPile into hand. */
  drawCards(count: number): PlayingCard[] {
    const drawn: PlayingCard[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        this.reshuffleDiscardIntoDraw();
        if (this.drawPile.length === 0) break;
      }
      const card = this.drawPile.pop()!;
      card.selected = false;
      this.hand.push(card);
      drawn.push(card);
    }
    return drawn;
  }

  /** Move all discard pile cards into draw pile and shuffle. */
  reshuffleDiscardIntoDraw(): void {
    this.drawPile.push(...this.discardPile);
    this.discardPile = [];
    this.shufflePile(this.drawPile);
  }

  /** Fisher-Yates shuffle in-place. */
  private shufflePile(pile: PlayingCard[]): void {
    for (let i = pile.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pile[i], pile[j]] = [pile[j], pile[i]];
    }
  }

  /** Discard selected cards from hand (up to 5) using a discard charge. */
  discardSelected(): PlayingCard[] {
    if (this.discardCharges <= 0) return [];
    this.discardCharges--;
    const selected = this.hand.filter(c => c.selected);
    this.hand = this.hand.filter(c => !c.selected);
    this.discardPile.push(...selected);
    return selected;
  }

  // ── Relic management ────────────────────────────────

  /** Max relics the player can hold. */
  public readonly maxRelics: number = 6;

  /** Add a relic if there is room. Returns true on success. */
  gainRelic(relic: RelicEntity): boolean {
    if (this.relics.length >= this.maxRelics) return false;
    if (this.relics.some(r => r.id === relic.id)) return false; // no dupes
    this.relics.push(relic);
    relic.onAcquire(this);
    return true;
  }

  /** Check if the player owns a relic by id. */
  hasRelic(relicId: string): boolean {
    return this.relics.some(r => r.id === relicId);
  }

  // ── Potion management ───────────────────────────────

  /** Gain a potion if there is room. */
  gainPotion(potion: PotionEntity): boolean {
    if (this.potions.length >= this.maxPotions) return false;
    this.potions.push(potion);
    return true;
  }

  /** Use a potion, removing it from inventory. */
  usePotion(potionId: string): boolean {
    const idx = this.potions.findIndex(p => p.id === potionId);
    if (idx === -1) return false;
    const potion = this.potions[idx];
    potion.use(this);
    this.potions.splice(idx, 1);
    return true;
  }

  // ── Combat hooks ────────────────────────────────────

  onCombatStart(): void {
    this.block = 0;
    this.discardCharges = this.maxDiscardCharges;
    // Relic start-of-combat hooks
    for (const relic of this.relics) {
      relic.onCombatStart(this);
    }
  }

  onTurnStart(): void {
    this.block = 0;
    this.discardCharges = this.maxDiscardCharges;
    for (const relic of this.relics) {
      relic.onTurnStart(this);
    }
  }

  onTurnEnd(): void {
    for (const relic of this.relics) {
      relic.onTurnEnd(this);
    }
  }

  // ── Legacy adapter ──────────────────────────────────

  /**
   * Convert to the plain Player interface shape for backward compat.
   */
  toLegacyPlayer(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      x: this.x,
      y: this.y,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      block: this.block,
      statusEffects: this.statusEffects.map(e => ({ ...e })),
      hand: this.hand,
      deck: this.deck,
      discardPile: this.discardPile,
      drawPile: this.drawPile,
      playedHand: this.playedHand,
      landasScore: this.landasScore,
      ginto: this.ginto,
      diamante: this.diamante,
      relics: this.relics.map(r => r.toLegacy()),
      potions: this.potions.map(p => p.toLegacy()),
      discardCharges: this.discardCharges,
      maxDiscardCharges: this.maxDiscardCharges,
      educationalProgress: this.educationalProgress,
    };
  }

  override toJSON(): Record<string, unknown> {
    return this.toLegacyPlayer();
  }
}
