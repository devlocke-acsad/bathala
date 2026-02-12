/**
 * Minokawa Harbinger — Common Act 3 Enemy
 * Lore: Giant bird that causes eclipses by swallowing the sun and moon.
 * Source: Jocano, 1969; Ramos, 1990; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const MINOKAWA_HARBINGER: EnemyConfig = {
  id: 'minokawa_harbinger',
  name: 'Minokawa Harbinger',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 224,
  damage: 24,
  attackPattern: ['weaken', 'attack', 'defend'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'minokawa_combat',
  overworldSpriteKey: 'minokawa_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, attacks, defends', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Eclipses devour light!',
    defeat: 'My maw... closes...',
    spare: 'Mercy spares: Minokawa, eclipse birds devouring sun/moon (Jocano, 1969).',
    slay: 'Swallow my essence—false god grows!',
  },

  // === Lore ===
  lore: {
    description: 'Giant bird that causes eclipses by swallowing the sun and moon. Herald of the false god.',
    origin: 'Bagobo, cosmic devourers (Ramos, 1990)',
    reference: 'Aswang Project – Eclipse causers',
  },
};
