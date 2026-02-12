/**
 * Siyokoy Raider — Common Act 2 Enemy
 * Lore: Aggressive male sea creatures with webbed limbs and scales.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SIYOKOY_RAIDER: EnemyConfig = {
  id: 'siyokoy_raider',
  name: 'Siyokoy Raider',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 320,
  damage: 27,
  attackPattern: ['defend', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'siyokoy_combat',
  overworldSpriteKey: 'siyokoy_overworld',

  // === Intent ===
  intent: { type: 'defend', value: 8, description: 'Defends then double attacks', icon: '⛨' },

  // === Dialogue ===
  dialogue: {
    intro: 'Scales claim drowned!',
    defeat: 'My fins... fail...',
    spare: 'Grace spares: Siyokoy, malevolent mermen dragging victims (Samar, 2019).',
    slay: 'Drown my form—impostor rises!',
  },

  // === Lore ===
  lore: {
    description: 'Aggressive male sea creatures with webbed limbs and scales. Warriors of the deep who drag victims beneath the waves.',
    origin: 'General, scaled drowners (Ramos, 1990)',
    reference: 'Aswang Project – Webbed predators',
  },
};
