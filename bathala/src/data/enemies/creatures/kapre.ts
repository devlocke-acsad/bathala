/**
 * Kapre Shade — Boss Act 1 Enemy
 * Lore: Massive tree-dwelling giants who smoke enormous cigars.
 * Once Bathala's appointed guardians of sacred groves, now the
 * engkanto's corruption has unleashed their ancient rage.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KAPRE_SHADE: EnemyConfig = {
  id: 'kapre_shade',
  name: 'Kapre Shade',
  tier: 'boss',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 600,
  damage: 42,
  attackPattern: ['strengthen', 'poison', 'attack', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'kapre_combat',
  overworldSpriteKey: 'kapre_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 42, description: 'Strengthens, poisons with smoke, then strikes', icon: '🔥' },

  // === Dialogue ===
  dialogue: {
    intro: 'My smoke veils the grove—none leave unclaimed!',
    defeat: 'My tree... crumbles... the cigar... fades...',
    spare: 'Compassion unlocks: Kapre, tree giants smoking cigars, once loyal to Bathala. Their smoke once guided the lost; now it chokes the defiant (Ramos, 1990).',
    slay: 'Burn me down—the ashes feed the shadow!',
  },

  // === Lore ===
  lore: {
    description: 'Massive tree-dwelling giants who smoke enormous cigars. Once Bathala\'s appointed guardians of sacred groves, the engkanto\'s corruption has unleashed centuries of pent-up rage, turning their protective smoke into choking infernos.',
    origin: 'General, smokers (Eugenio, 2001)',
    reference: 'Aswang Project – Tree-lurkers',
  },
};
