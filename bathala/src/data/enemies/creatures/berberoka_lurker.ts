/**
 * Berberoka Lurker — Common Act 2 Enemy
 * Lore: Water creature that swallows victims whole, lurking in rivers.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BERBEROKA_LURKER: EnemyConfig = {
  id: 'berberoka_lurker',
  name: 'Berberoka Lurker',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 256,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'defend'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'berberoka_combat',
  overworldSpriteKey: 'berberoka_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then attacks defensively', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Swamps swell to consume!',
    defeat: 'My waters... recede...',
    spare: 'Pity uncovers: Berberoka, giants drowning prey (Ramos, 1990).',
    slay: 'Drain my essence—fuel for deceit!',
  },

  // === Lore ===
  lore: {
    description: 'Water creature that swallows victims whole, lurking in rivers and changing size to trap prey.',
    origin: 'Apayao, water suckers (Samar, 2019)',
    reference: 'Aswang Project – Size-changers',
  },
};
