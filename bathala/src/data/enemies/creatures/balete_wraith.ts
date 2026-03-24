/**
 * Balete Wraith — Common Act 1 Enemy
 * Lore: Spectral remnants bound to balete fig trees — ancient spirit portals.
 * Source: Ramos, 1990; Jocano, 1969; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BALETE_WRAITH: EnemyConfig = {
  id: 'balete_wraith',
  name: 'Balete Wraith',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 150,
  damage: 15,
  attackPattern: ['attack', 'strengthen', 'attack'],
  elementalAffinity: { weakness: 'air', resistance: 'water' },
  initialStatusEffects: [
    { id: 'vulnerable', name: 'Vulnerable', type: 'debuff', value: 1, description: 'Takes 50% more damage from all sources.', icon: 'icon_vulnerable' },
  ],

  // === Visuals ===
  combatSpriteKey: 'balete_combat',
  overworldSpriteKey: 'balete_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 15, description: 'Gains Strength', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'These roots once held a doorway for anito spirits. Now the door swings only one way — and what comes through is me.',
    defeat: 'The grave... calls me back through the roots. I was never meant to linger here — the balete portal is closing, and through the bark I can hear the anito whispering forgiveness...',
    spare: 'You spare a wraith? Then hear the truth the engkanto buried: the balete tree is sacred — a portal between the mortal world and the spirit realm. The old ones would leave offerings at its roots, and the anito would answer with blessings. The engkanto poisoned the roots, and our blessings became hauntings. But the tree remembers. The tree always remembers.',
    slay: 'Strike true — my form dissolves back into bark and shadow, feeding the impostor who corrupted these sacred groves! Every balete wraith you destroy is an anito portal sealed forever!',
  },

  // === Lore ===
  lore: {
    description: "Spectral remnants bound to balete fig trees—ancient spirit portals now warped by the engkanto's lies.",
    origin: 'General, haunted figs (Ramos, 1990)',
    reference: 'Aswang Project – Spirit gateways',
  },
};
