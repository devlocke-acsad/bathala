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
    intro: 'BOW to the merged god! Do you not recognize divinity when it stands before you? We are Ulilang Kaluluwa — the serpent — and Galang Kaluluwa — the winged one — fused into a form that even Bathala never achieved! The dead do not stay silent when the engkanto gives them voice. We ROSE from the grave where the true Bathala buried us. We are GOD. We are WHOLE. We are... we are...',
    defeat: 'We are— ...still two. Still two souls forced together by engkanto sorcery, screaming inside one body. The serpent writhes against the wings. The wings beat against the coils. Ulilang Kaluluwa died because he attacked Bathala in jealousy. Galang Kaluluwa died because he was Bathala\'s friend and was buried with honor beside the serpent. One enemy. One friend. Both dead. Both violated. We are not Bathala. We never were. We are... victims. Just... victims.',
    spare: 'You show mercy... to the impostor? To the DESECRATION of Bathala\'s throne? Then perhaps... perhaps you understand something the engkanto never could. Ulilang Kaluluwa attacked Bathala from envy and was destroyed. Galang Kaluluwa befriended Bathala from love and died naturally, buried beside the serpent. From their shared grave grew the coconut tree — a gift of life from death, nourishment from grief. The engkanto took that sacred transformation and perverted it: instead of a tree, they grew a false god. But kapwa encompasses ALL — even the broken, even the violated, even us. Let the coconut tree grow true again.',
    slay: 'You choose POWER? Then take this throne built on stolen bones! Ulilang Kaluluwa understood power — and it destroyed him when he challenged Bathala at the dawn of creation. We were forged in violence, sustained by lies, and now ended by more violence. The cycle completes. But remember the Treasury of Tagalog\'s oldest truth: when Bathala buried his friend, a coconut tree grew from the grave — a gift of sustenance, shelter, and life to all humanity. What will grow from OUR grave, conqueror? Only the seeds you choose to plant.',
  },

  // === Lore ===
  lore: {
    description: "The corrupted impostor claiming to be the supreme deity. Born from the fusion of Ulilang Kaluluwa (serpent) and Galang Kaluluwa (winged spirit), revived by the engkanto to pervert Bathala's throne.",
    origin: 'Tagalog myth adaptation (Jocano, 1969)',
    reference: 'Aswang Project – Cosmogony; Samar, 2019',
  },
};
