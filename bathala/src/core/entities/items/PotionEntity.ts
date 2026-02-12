/**
 * PotionEntity — Concrete class for single-use consumable items (potions).
 * Encapsulates the effect logic that was previously string-based.
 */
import { ItemEntity } from './ItemEntity';
import { StatusEffect } from '../../types/CombatTypes';

export type PotionRarity = 'common' | 'uncommon' | 'rare';

export interface PotionConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly rarity: PotionRarity;
  readonly effect: string; // effect key e.g. "heal_20_hp"
  readonly lore?: string;
  readonly spriteKey?: string;
}

/** Lightweight interface for the entity receiving a potion effect. */
export interface PotionTarget {
  currentHealth: number;
  maxHealth: number;
  block: number;
  statusEffects: StatusEffect[];
  heal(amount: number): number;
  gainBlock(amount: number): void;
  applyStatusEffect(effect: unknown): void;
  removeStatusEffect(effectId: string): void;
  clearStatusEffects?(): void;
  drawCards?(count: number): unknown[];
}

export class PotionEntity extends ItemEntity {
  public readonly rarity: PotionRarity;
  public readonly effect: string;

  constructor(config: PotionConfig) {
    super(
      config.id,
      config.name,
      config.description,
      config.emoji,
      config.lore ?? '',
      config.spriteKey ?? `potion_${config.id}`,
    );
    this.rarity = config.rarity;
    this.effect = config.effect;
  }

  /**
   * Apply the potion's effect to the target.
   * Encapsulates the switch logic that was previously in scene code.
   */
  use(target: PotionTarget): void {
    switch (this.effect) {
      case 'heal_20_hp':
        target.heal(20);
        break;
      case 'draw_3_cards':
        if (target.drawCards) target.drawCards(3);
        break;
      case 'gain_15_block':
        target.gainBlock(15);
        break;
      case 'gain_1_dexterity':
        target.applyStatusEffect({
          id: 'dexterity', name: 'Dexterity', type: 'buff', value: 1,
          description: '+1 Block per stack on Defend.', emoji: '⛨',
        });
        break;
      case 'gain_2_strength':
        target.applyStatusEffect({
          id: 'strength', name: 'Strength', type: 'buff', value: 2,
          description: '+3 damage per stack on Attack.', emoji: '†',
        });
        break;
      case 'gain_regeneration':
        target.applyStatusEffect({
          id: 'regeneration', name: 'Regeneration', type: 'buff', value: 2,
          description: 'Heal at start of turn.', emoji: '♻️',
        });
        break;
      case 'choose_element':
        // No-op here; UI must prompt the player.
        break;
      case 'remove_debuffs':
        target.statusEffects = target.statusEffects.filter(e => {
          const keep = (e as { type?: string }).type !== 'debuff';
          return keep;
        });
        break;
      case 'gain_temp_max_hp':
        // Temporary max HP is an externally tracked effect.
        break;
      case 'add_random_cards':
        // Handled by combat scene for deck mutation.
        break;
      default:
        console.warn(`PotionEntity: unknown effect "${this.effect}"`);
    }
  }

  toLegacy(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      emoji: this.emoji,
      rarity: this.rarity,
      effect: this.effect,
    };
  }

  toJSON(): Record<string, unknown> {
    return this.toLegacy();
  }
}
