/**
 * ItemEntity — Abstract base for all acquirable items (Relics, Potions).
 * Owns display metadata (name, description, emoji, lore, spriteKey).
 *
 * @abstract
 */
import { GameEntity } from '../base/GameEntity';

export abstract class ItemEntity extends GameEntity {
  public readonly description: string;
  public readonly emoji: string;
  public readonly lore: string;
  public readonly spriteKey: string;

  protected constructor(
    id: string,
    name: string,
    description: string,
    emoji: string,
    lore: string = '',
    spriteKey: string = '',
  ) {
    super(id, name);
    this.description = description;
    this.emoji = emoji;
    this.lore = lore;
    this.spriteKey = spriteKey;
  }

  /** Shared display data used by UI panels. */
  get displayInfo(): { name: string; description: string; emoji: string; lore: string; spriteKey: string } {
    return {
      name: this.name,
      description: this.description,
      emoji: this.emoji,
      lore: this.lore,
      spriteKey: this.spriteKey,
    };
  }

  /** Convert to a plain legacy object matching the old Relic/Potion interfaces. */
  abstract toLegacy(): Record<string, unknown>;
}
