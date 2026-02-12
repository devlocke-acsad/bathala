import { EnemyConfig } from '../../../core/entities/EnemyEntity';

/**
 * Single-act enemy template.
 *
 * Usage:
 * 1) Copy this file to ../creatures/<your_enemy>.ts
 * 2) Rename exported constant to SCREAMING_SNAKE_CASE
 * 3) Fill all placeholder values
 * 4) Export from ../creatures/index.ts
 * 5) Add to Act1Enemies.ts OR Act2Enemies.ts OR Act3Enemies.ts
 */
export const NEW_ENEMY_TEMPLATE: EnemyConfig = {
  id: 'new_enemy_id',
  name: 'New Enemy Name',
  tier: 'common',
  chapter: 1,

  maxHealth: 200,
  damage: 20,
  attackPattern: ['attack', 'defend', 'weaken'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  combatSpriteKey: 'newenemy_combat',
  overworldSpriteKey: 'newenemy_overworld',

  intent: {
    type: 'attack',
    value: 20,
    description: 'Attacks and applies debuffs',
    icon: '†',
  },

  dialogue: {
    intro: 'Template intro line.',
    defeat: 'Template defeat line.',
    spare: 'Template spare line.',
    slay: 'Template slay line.',
  },

  lore: {
    description: 'Template description of myth and role.',
    origin: 'Template origin metadata',
    reference: 'Template source metadata',
  },
};
