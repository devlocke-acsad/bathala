/**
 * Bungisngis — Common Act 1 Enemy
 * Lore: One-eyed laughing giants once jovial, now driven to rage.
 * Source: Ramos, 1990; Jocano, 1969; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BUNGISNGIS: EnemyConfig = {
  id: 'bungisngis',
  name: 'Bungisngis',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 200,
  damage: 36,
  attackPattern: ['weaken', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'air', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'bungisngis_combat',
  overworldSpriteKey: 'bungisngis_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, attacks, strengthens', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Laughter masks rage!',
    defeat: 'My grin... cracks...',
    spare: 'Pity reveals: Bungisngis, one-eyed laughing giants, once jovial (Jocano, 1969).',
    slay: 'Silence my mirth—fuel for deceit!',
  },

  // === Lore ===
  lore: {
    description: "One-eyed laughing giants once jovial and friendly, now driven to rage by the engkanto's corruption.",
    origin: 'Tagalog/Cebuano, grinning giants (Ramos, 1990)',
    reference: 'Aswang Project – Strong laughers',
  },
};
