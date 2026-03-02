/**
 * Tiyanak Ambusher — Common Act 1 Enemy
 * Lore: Demonic infants who mimic baby cries to lure travelers.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIYANAK_AMBUSHER: EnemyConfig = {
  id: 'tiyanak_ambusher',
  name: 'Tiyanak Ambusher',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 170,
  damage: 18,
  attackPattern: ['weaken', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'tiyanak_combat',
  overworldSpriteKey: 'tiyanak_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 1, description: 'Weakens then double attacks', icon: '⚠️' },

  // === Dialogue ===
  dialogue: {
    intro: '*Waaaah!* ...Did you hear that? A baby, crying alone in the dark forest? Your heart says rush to help — but your instincts scream to run. The tiyanak knows your compassion, mortal. It is the sweetest bait.',
    defeat: 'My cry... silenced at last. The disguise slips away — not a baby, but a lost spirit that never got to grow. The engkanto weaponized our grief. We never chose to become monsters...',
    spare: 'You show mercy to a tiyanak? Then see us — truly see us. We are the spirits of infants lost between life and death — unbaptized, unnamed, forgotten. The old stories say we mimic baby cries to lure the compassionate into our grasp. But that cry was always real — it was our grief, twisted by the engkanto into a weapon. Your mercy hears what no one else would: a child, crying to be remembered.',
    slay: 'You strike at what looks innocent — and the shadow grows fat on the irony! The tiyanak were always victims first. Every one you destroy is a lost child silenced twice — once by death, once by your hand!',
  },

  // === Lore ===
  lore: {
    description: 'Demonic infants who mimic the cries of abandoned babies to lure travelers into forest ambushes.',
    origin: 'General, demon babies (Eugenio, 2001)',
    reference: 'Aswang Project – Forest lurers',
  },
};
