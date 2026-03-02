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
    intro: 'You intrude upon the caves of Negros! Nails long as daggers — the engkanto sharpened my claws and pointed them at you!',
    defeat: 'My fury... breaks like stone under rain. The claws retract. I remember the caves of La Castellana, where I lived in peace — a guardian of the wild places, feared only by those who threatened the mountain livestock...',
    spare: 'Grace? For the amomongo? The Visayan people of Negros tell of an ape-like creature dwelling in mountain caves — large, powerful, with nails that could tear through anything. We were territorial, yes, but not malicious. We attacked livestock when hungry, not from cruelty. The engkanto starved us and aimed our hunger at mortals. Your mercy feeds something deeper than my belly.',
    slay: 'Crush me — the shadow that corrupted my kind lives on! The caves of Negros will echo with emptiness, and the mountain will lose its wildest guardian. The engkanto will find another beast to sharpen!',
  },

  // === Lore ===
  lore: {
    description: 'An ape-like creature from Negros with razor-sharp nails that attacks livestock and travelers from cave lairs.',
    origin: 'Visayan, cave-dweller (Ramos, 1990)',
    reference: 'Aswang Project – Negros terror',
  },
};
