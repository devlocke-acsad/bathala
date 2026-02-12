/**
 * Sarimanok Keeper — Common Act 3 Enemy
 * Lore: The legendary bird of good fortune, now twisted to serve the false god.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SARIMANOK_KEEPER: EnemyConfig = {
  id: 'sarimanok_keeper',
  name: 'Sarimanok Keeper',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 240,
  damage: 24,
  attackPattern: ['weaken', 'strengthen', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'sarimanok_combat',
  overworldSpriteKey: 'sarimanok_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens, strengthens, attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Plumage shields false one!',
    defeat: 'My fortune... lost...',
    spare: 'Compassion reveals: Sarimanok, ornate fortune birds (Samar, 2019).',
    slay: 'Pluck my feathers—shadow rises!',
  },

  // === Lore ===
  lore: {
    description: 'The legendary bird of good fortune, now twisted to serve the false god. Symbol of Maranao prosperity.',
    origin: 'Maranao, prosperity omens (Ramos, 1990)',
    reference: 'Aswang Project – Mindanao pantheon',
  },
};
