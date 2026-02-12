// Barrel exports — core/entities
export { GameEntity } from './base/GameEntity';
export { CombatEntity } from './base/CombatEntity';
export { EnemyEntity } from './EnemyEntity';
export type { EnemyConfig, EnemyTier, EnemyDialogue, EnemyLore } from './EnemyEntity';
export { PlayerEntity } from './PlayerEntity';
export { ItemEntity } from './items/ItemEntity';
export { RelicEntity } from './items/RelicEntity';
export type { RelicConfig, RelicOwner, RelicEffectType, RelicTriggerCondition } from './items/RelicEntity';
export { PotionEntity } from './items/PotionEntity';
export type { PotionConfig, PotionTarget, PotionRarity } from './items/PotionEntity';
