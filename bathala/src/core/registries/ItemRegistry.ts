/**
 * ItemRegistry — Centralised lookup for all RelicEntity and PotionEntity instances.
 */
import { RelicEntity, RelicConfig } from '../entities/items/RelicEntity';
import { PotionEntity, PotionConfig } from '../entities/items/PotionEntity';

export class ItemRegistry {
  private static readonly relics = new Map<string, RelicEntity>();
  private static readonly potions = new Map<string, PotionEntity>();

  // ── Relic registration ──────────────────────────────

  static registerRelic(config: RelicConfig): RelicEntity {
    const entity = new RelicEntity(config);
    this.relics.set(entity.id, entity);
    return entity;
  }

  static registerRelics(configs: RelicConfig[]): RelicEntity[] {
    return configs.map(c => this.registerRelic(c));
  }

  static getRelic(id: string): RelicEntity | undefined {
    return this.relics.get(id);
  }

  static getRelicOrThrow(id: string): RelicEntity {
    const r = this.relics.get(id);
    if (!r) throw new Error(`ItemRegistry: unknown relic "${id}"`);
    return r;
  }

  /** Create a fresh clone (new instance, same config data). */
  static cloneRelic(id: string): RelicEntity {
    const source = this.getRelicOrThrow(id);
    return new RelicEntity({
      id: source.id,
      name: source.name,
      description: source.description,
      emoji: source.emoji,
      lore: source.lore,
      spriteKey: source.spriteKey,
      effectTypes: [...source.effectTypes],
      triggerCondition: source.triggerCondition,
    });
  }

  static allRelics(): RelicEntity[] {
    return [...this.relics.values()];
  }

  // ── Potion registration ─────────────────────────────

  static registerPotion(config: PotionConfig): PotionEntity {
    const entity = new PotionEntity(config);
    this.potions.set(entity.id, entity);
    return entity;
  }

  static registerPotions(configs: PotionConfig[]): PotionEntity[] {
    return configs.map(c => this.registerPotion(c));
  }

  static getPotion(id: string): PotionEntity | undefined {
    return this.potions.get(id);
  }

  static getPotionOrThrow(id: string): PotionEntity {
    const p = this.potions.get(id);
    if (!p) throw new Error(`ItemRegistry: unknown potion "${id}"`);
    return p;
  }

  static clonePotion(id: string): PotionEntity {
    const src = this.getPotionOrThrow(id);
    return new PotionEntity({
      id: src.id,
      name: src.name,
      description: src.description,
      emoji: src.emoji,
      rarity: src.rarity,
      effect: src.effect,
      lore: src.lore,
      spriteKey: src.spriteKey,
    });
  }

  static allPotions(): PotionEntity[] {
    return [...this.potions.values()];
  }

  // ── Utility ─────────────────────────────────────────

  static clear(): void {
    this.relics.clear();
    this.potions.clear();
  }
}
