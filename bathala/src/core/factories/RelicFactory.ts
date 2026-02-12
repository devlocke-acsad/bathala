/**
 * RelicFactory — Creates RelicEntity instances and registers them in ItemRegistry.
 */
import { RelicEntity, RelicConfig } from '../entities/items/RelicEntity';
import { ItemRegistry } from '../registries/ItemRegistry';

export class RelicFactory {
  /** Create and register a relic from config. */
  static create(config: RelicConfig): RelicEntity {
    return ItemRegistry.registerRelic(config);
  }

  /** Create and register many relics. */
  static createAll(configs: RelicConfig[]): RelicEntity[] {
    return ItemRegistry.registerRelics(configs);
  }

  /** Clone a previously registered relic for runtime use. */
  static clone(id: string): RelicEntity {
    return ItemRegistry.cloneRelic(id);
  }
}
