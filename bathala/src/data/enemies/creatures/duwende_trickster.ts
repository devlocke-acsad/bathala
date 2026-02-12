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
    intro: 'Tricks abound in mounds!',
    defeat: 'My fortune... fades...',
    spare: 'Spare, learn: Duwende grant boons/curses, warped by engkanto lies (Samar, 2019).',
    slay: 'End my mischief—fuel for impostor!',
  },

  // === Lore ===
  lore: {
    description: "Tiny mound-dwelling goblins who grant boons or curses. Once mischievous, now malicious under the engkanto's influence.",
    origin: 'General, goblins (Ramos, 1990)',
    reference: 'Aswang Project – Magical omens',
  },
};
