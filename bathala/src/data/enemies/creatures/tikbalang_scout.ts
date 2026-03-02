/**
 * Tikbalang Scout — Common Act 1 Enemy
 * Lore: Tagalog mountain tricksters with backward hooves, once forest protectors.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIKBALANG_SCOUT: EnemyConfig = {
  id: 'tikbalang_scout',
  name: 'Tikbalang Scout',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 180,
  damage: 21,
  attackPattern: ['attack', 'weaken', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'tikbalang_combat',
  overworldSpriteKey: 'tikbalang_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 21, description: 'Attacks and weakens', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: "Ha! My hooves face backward, mortal — the engkanto taught me to lead you in and never let you out! The false one's whispers guide my trails now!",
    defeat: 'My tricks... unravel like roots torn from soil. The paths I twisted are straightening... I can feel the mountain calling me home...',
    spare: 'You would spare a tikbalang? We were once the sacred guardians of the mountain trails, our backward hooves a sign of our otherness — not cruelty, but vigilance. The Tagalog elders told children to wear their shirts inside-out to see through our misdirection. Now the engkanto has turned our guidance into torment. Your mercy... it reminds me of what I once protected.',
    slay: 'Strike true — my essence feeds the shadow that your false god commands! But know this: every tikbalang you destroy is a mountain trail left unguarded, a traveler left without a guide in the dark!',
  },

  // === Lore ===
  lore: {
    description: "Tikbalang are tall, bony humanoids with the head and hooves of a horse. Once protectors of mountain trails, they now confuse travelers with backward hooves under the engkanto's corruption.",
    origin: 'Tagalog, mountain tricksters (Samar, 2019)',
    reference: 'Aswang Project – Horse-headed deceivers',
  },
};
