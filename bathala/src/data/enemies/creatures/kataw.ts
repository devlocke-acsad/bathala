/**
 * Kataw — Common Act 2 Enemy
 * Lore: Half-human half-fish sea rulers who command the waves.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KATAW: EnemyConfig = {
  id: 'kataw',
  name: 'Kataw',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 224,
  damage: 21,
  attackPattern: ['heal', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'kataw_combat',
  overworldSpriteKey: 'kataw_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 10, description: 'Heals, attacks, strengthens', icon: '💚' },

  // === Dialogue ===
  dialogue: {
    intro: 'Seas bow to my rule!',
    defeat: 'My crown... sinks...',
    spare: 'Grace crowns: Kataw, merman kings commanding waves (Samar, 2019).',
    slay: 'Usurp my throne—false god rises!',
  },

  // === Lore ===
  lore: {
    description: 'Half-human half-fish sea rulers who command the waves. Guardians of the ocean depths.',
    origin: 'Bisaya, sea rulers (Ramos, 1990)',
    reference: 'Aswang Project – Water controllers',
  },
};
