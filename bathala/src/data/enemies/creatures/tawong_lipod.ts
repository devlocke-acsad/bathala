/**
 * Tawong Lipod — Elite Act 1 Enemy
 * Lore: Invisible Bikol wind beings who torment travelers.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TAWONG_LIPOD: EnemyConfig = {
  id: 'tawong_lipod',
  name: 'Tawong Lipod',
  tier: 'elite',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 300,
  damage: 30,
  attackPattern: ['stun', 'attack', 'defend'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },
  initialStatusEffects: [
    { id: 'dexterity', name: 'Dexterity', type: 'buff', value: 2, description: 'Gain +2 block per stack when using Defend actions. Represents the elusive, wind-dancing nature of Tawong Lipod.', emoji: '💨' },
  ],

  // === Visuals ===
  combatSpriteKey: 'tawonglipod_combat',
  overworldSpriteKey: 'tawonglipod_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Stuns, attacks, evades', icon: '💫' },

  // === Dialogue ===
  dialogue: {
    intro: 'Winds conceal—feel fury!',
    defeat: 'Our veil... tears...',
    spare: 'Mercy whispers: Tawong Lipod, invisible Bikol wind beings, once harmonious (Samar, 2019).',
    slay: 'Scatter us—impostor grows!',
  },

  // === Lore ===
  lore: {
    description: 'Invisible Bikol wind beings who were once harmonious with nature. Now they torment travelers with unseen assaults.',
    origin: 'Bikol, wind fairies (Ramos, 1990)',
    reference: 'Aswang Project – Invisible tormentors',
  },
};
