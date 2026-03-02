/**
 * Sunken Bangkilan — Elite Act 2 Enemy
 * Lore: Cursed spirits from sunken villages, shape-shifting sorceresses.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SUNKEN_BANGKILAN: EnemyConfig = {
  id: 'sunken_bangkilan',
  name: 'Sunken Bangkilan',
  tier: 'elite',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 420,
  damage: 33,
  attackPattern: ['weaken', 'attack', 'heal', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'sunkenbangkilan_combat',
  overworldSpriteKey: 'sunkenbangkilan_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Weakens, attacks, heals, strengthens', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'Curses bubble from the abyss! I am bangkilan — sorceress of drowned villages, shape-shifter of stolen faces. The engkanto gave me the faces of the dead. Shall I wear YOURS?',
    defeat: 'My shapes... dissolve like salt in the current. A hundred stolen faces release, each one sighing with relief. Beneath them all, my own face emerges — not a monster\'s, but a babaylan\'s. A healer\'s. How many faces did I steal before I forgot my own?',
    spare: 'Mercy shifts the tide! The bangkilan are shape-shifting sea sorceresses — cousins to the land-dwelling mangkukulam. In the old ways, our shapeshifting was not deception but empathy — we became the patient to understand the illness, wore the mourner\'s face to share the grief. The engkanto weaponized our gift, turning understanding into manipulation. Your mercy returns us to our original shape — the one that heals.',
    slay: 'Shatter my illusions — and the shadow rises from the bones of the sunken barangay! Every bangkilan destroyed is a hundred faces lost to the deep, a hundred stories drowned with them. The impostor collects our masks!',
  },

  // === Lore ===
  lore: {
    description: 'Cursed spirits from sunken villages. Shape-shifting sorceresses seeking revenge on the living.',
    origin: 'Adaptation, Mangkukulam-related (Ramos, 1990)',
    reference: 'Aswang Project – Sea witches',
  },
};
