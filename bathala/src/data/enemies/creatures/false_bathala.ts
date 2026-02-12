/**
 * False Bathala — Boss Act 3 Enemy
 * Lore: The corrupted impostor claiming to be the supreme deity.
 * Source: Jocano, 1969; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const FALSE_BATHALA: EnemyConfig = {
  id: 'false_bathala',
  name: 'False Bathala',
  tier: 'boss',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 1200,
  damage: 48,
  attackPattern: ['stun', 'weaken', 'strengthen', 'attack', 'poison', 'attack'],
  elementalAffinity: { weakness: null, resistance: null },

  // === Visuals ===
  combatSpriteKey: 'falsebathala_combat',
  overworldSpriteKey: 'falsebathala_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Stuns, weakens, strengthens, attacks, burns, attacks', icon: '💫' },

  // === Dialogue ===
  dialogue: {
    intro: 'Bow to merged god—serpent and wings as one!',
    defeat: 'My fusion... fractures...',
    spare: "Grace unmasks: False Bathala, engkanto-revived Ulilang Kaluluwa and Galang Kaluluwa, twisted from grave into impostor, perverting coconut tree's life gift (Treasury of Tagalog).",
    slay: "Shatter my form—coconut tree's dark roots feed shadow!",
  },

  // === Lore ===
  lore: {
    description: "The corrupted impostor claiming to be the supreme deity. Born from the fusion of Ulilang Kaluluwa (serpent) and Galang Kaluluwa (winged spirit), revived by the engkanto to pervert Bathala's throne.",
    origin: 'Tagalog myth adaptation (Jocano, 1969)',
    reference: 'Aswang Project – Cosmogony; Samar, 2019',
  },
};
