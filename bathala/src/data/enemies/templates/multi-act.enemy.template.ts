import { EnemyConfig } from '../../../core/entities/EnemyEntity';

/**
 * Multi-act enemy template (same mythic enemy reused across acts).
 *
 * IMPORTANT:
 * - IDs must be unique globally.
 * - Prefer act-scoped IDs and names to avoid collisions in name-based lookups.
 *
 * Usage:
 * 1) Copy to ../creatures/<enemy>_act_variants.ts (or separate files per act)
 * 2) Export each variant from ../creatures/index.ts
 * 3) Add each variant to the corresponding ActXEnemies.ts tier array
 */
export const NEW_ENEMY_ACT1_TEMPLATE: EnemyConfig = {
  id: 'new_enemy_act1',
  name: 'New Enemy (Act 1)',
  tier: 'common',
  chapter: 1,
  maxHealth: 180,
  damage: 18,
  attackPattern: ['attack', 'weaken', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },
  combatSpriteKey: 'newenemy_act1_combat',
  overworldSpriteKey: 'newenemy_act1_overworld',
  intent: { type: 'attack', value: 18, description: 'Act 1 pattern', icon: '†' },
  dialogue: {
    intro: 'Act 1 intro',
    defeat: 'Act 1 defeat',
    spare: 'Act 1 spare',
    slay: 'Act 1 slay',
  },
  lore: {
    description: 'Act 1 description variant.',
    origin: 'Act 1 origin',
    reference: 'Act 1 reference',
  },
};

export const NEW_ENEMY_ACT2_TEMPLATE: EnemyConfig = {
  id: 'new_enemy_act2',
  name: 'New Enemy (Act 2)',
  tier: 'elite',
  chapter: 2,
  maxHealth: 320,
  damage: 28,
  attackPattern: ['defend', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },
  combatSpriteKey: 'newenemy_act2_combat',
  overworldSpriteKey: 'newenemy_act2_overworld',
  intent: { type: 'defend', value: 10, description: 'Act 2 pattern', icon: '⛨' },
  dialogue: {
    intro: 'Act 2 intro',
    defeat: 'Act 2 defeat',
    spare: 'Act 2 spare',
    slay: 'Act 2 slay',
  },
  lore: {
    description: 'Act 2 description variant.',
    origin: 'Act 2 origin',
    reference: 'Act 2 reference',
  },
};
