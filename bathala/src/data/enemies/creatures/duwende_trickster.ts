/**
 * Duwende Trickster — Common Act 1 Enemy
 * Lore: Tiny mound-dwelling goblins who grant boons or curses.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const DUWENDE_TRICKSTER: EnemyConfig = {
  id: 'duwende_trickster',
  name: 'Duwende Trickster',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 130,
  damage: 12,
  attackPattern: ['weaken', 'attack', 'weaken'],
  elementalAffinity: { weakness: 'air', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'duwende_combat',
  overworldSpriteKey: 'duwende_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens repeatedly', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Tabi-tabi po! Ha! You forgot to ask permission! The engkanto taught us new tricks — and my mischief has teeth!',
    defeat: 'My fortune fades like gold dust in rain... The mound grows quiet. I remember when my tricks brought luck to those who respected the old ways, and only cursed those who trampled sacred ground without care...',
    spare: 'You spare a duwende? Wise, mortal — wiser than you know. We are creatures of the between — not good, not evil, but responsive to how we are treated. Say "tabi-tabi po" and we grant fortune. Disrespect us and we curse. The engkanto exploited our dual nature, feeding us only anger. Your mercy restores the balance our mounds once held.',
    slay: 'End my mischief — and the impostor laughs! Every duwende mound destroyed is a piece of the old bargain broken. No more tabi-tabi po. No more fortune for the respectful. Just silence where wonder once lived!',
  },

  // === Lore ===
  lore: {
    description: "Tiny mound-dwelling goblins who grant boons or curses. Once mischievous, now malicious under the engkanto's influence.",
    origin: 'General, goblins (Ramos, 1990)',
    reference: 'Aswang Project – Magical omens',
  },
};
