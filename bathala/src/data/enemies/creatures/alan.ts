/**
 * Alan — Common Act 3 Enemy
 * Lore: Winged humanoid spirits with reversed toes that adopted lost children.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const ALAN: EnemyConfig = {
  id: 'alan',
  name: 'Alan',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 192,
  damage: 27,
  attackPattern: ['attack', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'alan_combat',
  overworldSpriteKey: 'alan_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 27, description: 'Double attacks then strengthens', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Half-bird fury descends!',
    defeat: 'My wings... clip...',
    spare: 'Grace lifts: Alan, Bikol half-human birds adopting lost children (Samar, 2019).',
    slay: 'Ground me—shadow thrives!',
  },

  // === Lore ===
  lore: {
    description: 'Winged humanoid spirits with reversed toes. Once adopted lost children, now strike from corrupted skies.',
    origin: 'Bikol, bird-people (Ramos, 1990)',
    reference: 'Aswang Project – Cannibalistic hangers',
  },
};
