/**
 * Sunken Bangkilan — Elite Act 2 Enemy
 * Lore: Cursed spirits from sunken villages, shape-shifting sorceresses.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SUNKEN_BANGKILAN: EnemyConfig = {
  id: 'sunken_bangkilan',
  name: 'Sunken Bangkilan',
  tier: 'elite',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 420,
  damage: 33,
  attackPattern: ['weaken', 'attack', 'heal', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'sunkenbangkilan_combat',
  overworldSpriteKey: 'sunkenbangkilan_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Weakens, attacks, heals, strengthens', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Curses bubble from abyss!',
    defeat: 'My shapes... dissolve...',
    spare: 'Mercy shifts: Bangkilan, shape-shifting sorceresses (Samar, 2019).',
    slay: 'Shatter my illusions—shadow rises!',
  },

  // === Lore ===
  lore: {
    description: 'Cursed spirits from sunken villages. Shape-shifting sorceresses seeking revenge on the living.',
    origin: 'Adaptation, Mangkukulam-related (Ramos, 1990)',
    reference: 'Aswang Project – Sea witches',
  },
};
