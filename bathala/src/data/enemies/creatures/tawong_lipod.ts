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
    intro: 'Can you see me? Of course not. We are tawong lipod — the invisible wind people. The engkanto armed our wind with thorns. Feel the fury of what you cannot see!',
    defeat: 'Our veil... tears like spider silk in a storm. The invisibility that protected us now fails. Through the fading wind, you can almost see our true forms — not monsters, but wind-dancers, sky-children of the Bikol highlands...',
    spare: 'You show mercy to the invisible? Then you see more than most. The Bikol people knew us as tawong lipod — the hidden folk who lived in harmony with the wind itself. We were neither malicious nor benevolent, simply... present. Like the air you breathe. The engkanto gave us rage and taught us to use our invisibility as a weapon. Your mercy makes us visible again — not to the eye, but to the heart.',
    slay: 'Scatter us to the winds — and the impostor grows stronger with every invisible spirit you disperse! We are the wind itself — you cannot kill us, only silence us. And a world without wind is a world without breath!',
  },

  // === Lore ===
  lore: {
    description: 'Invisible Bikol wind beings who were once harmonious with nature. Now they torment travelers with unseen assaults.',
    origin: 'Bikol, wind fairies (Ramos, 1990)',
    reference: 'Aswang Project – Invisible tormentors',
  },
};
