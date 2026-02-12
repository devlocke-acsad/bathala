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
    { id: 'vulnerable', name: 'Vulnerable', type: 'debuff', value: 1, description: 'Takes 50% more damage from all sources.', emoji: '🛡️💔' },
  ],

  // === Visuals ===
  combatSpriteKey: 'balete_combat',
  overworldSpriteKey: 'balete_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 15, description: 'Gains Strength', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Roots entwine your fate!',
    defeat: 'Grave... calls...',
    spare: 'Mercy reveals: Balete trees are anito portals, haunted by engkanto-twisted spirits (Jocano, 1969).',
    slay: 'Strike true—my form feeds impostor!',
  },

  // === Lore ===
  lore: {
    description: "Spectral remnants bound to balete fig trees—ancient spirit portals now warped by the engkanto's lies.",
    origin: 'General, haunted figs (Ramos, 1990)',
    reference: 'Aswang Project – Spirit gateways',
  },
};
