/**
 * Amomongo — Common Act 1 Enemy
 * Lore: Ape-like creature from Negros with razor-sharp nails.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const AMOMONGO: EnemyConfig = {
  id: 'amomongo',
  name: 'Amomongo',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 160,
  damage: 15,
  attackPattern: ['attack', 'attack', 'defend'],
  elementalAffinity: { weakness: 'air', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'amomongo_combat',
  overworldSpriteKey: 'amomongo_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 15, description: 'Fast attacks then defends', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Nails rend unworthy!',
    defeat: 'My fury... breaks...',
    spare: 'Grace spares: Amomongo, ape-like with long nails, attacking livestock (Samar, 2019).',
    slay: 'Crush me—shadow lives on!',
  },

  // === Lore ===
  lore: {
    description: 'An ape-like creature from Negros with razor-sharp nails that attacks livestock and travelers from cave lairs.',
    origin: 'Visayan, cave-dweller (Ramos, 1990)',
    reference: 'Aswang Project – Negros terror',
  },
};
