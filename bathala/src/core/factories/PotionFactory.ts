/**
 * PotionFactory — Creates PotionEntity instances and registers them in ItemRegistry.
 */
import { PotionEntity, PotionConfig } from '../entities/items/PotionEntity';
import { ItemRegistry } from '../registries/ItemRegistry';

export class PotionFactory {
  /** Create and register a potion from config. */
  static create(config: PotionConfig): PotionEntity {
    return ItemRegistry.registerPotion(config);
  }

  /** Create and register many potions. */
  static createAll(configs: PotionConfig[]): PotionEntity[] {
    return ItemRegistry.registerPotions(configs);
  }

  /** Clone a previously registered potion for runtime use. */
  static clone(id: string): PotionEntity {
    return ItemRegistry.clonePotion(id);
  }
}
