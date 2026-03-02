/**
 * Diwata Sentinel — Common Act 3 Enemy
 * Lore: Divine nature spirits corrupted to guard the false god's citadel.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const DIWATA_SENTINEL: EnemyConfig = {
  id: 'diwata_sentinel',
  name: 'Diwata Sentinel',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 304,
  damage: 27,
  attackPattern: ['defend', 'attack', 'defend'],
  elementalAffinity: { weakness: 'fire', resistance: 'water' },

  // === Visuals ===
  combatSpriteKey: 'diwata_combat',
  overworldSpriteKey: 'diwata_overworld',

  // === Intent ===
  intent: { type: 'defend', value: 10, description: 'Defends, attacks, defends', icon: '⛨' },

  // === Dialogue ===
  dialogue: {
    intro: 'I am diwata — once guardian of sacred groves, keeper of springs where life begins. The engkanto stationed me as SENTRY for a throne that should not exist!',
    defeat: 'My guard... falters. The weapons the impostor gave me dissolve like morning dew. Beneath the armor I see my true form — not a warrior, but a guardian. A protector of growing things. The deer I once sheltered... the fish I once tended... do they still remember me?',
    spare: 'Grace protects the protector! The diwata are divine nature spirits — guardians of specific places, owners of the animals within their domain. The Visayan people left offerings at springs, groves, and rivers to honor us, and we ensured the harmony of every ecosystem in our care. The engkanto corrupted our protectiveness into militant opposition. Your mercy disarms us in the truest sense — it returns us to our groves.',
    slay: 'Banish my form — and the impostor thrives on a guardian unmade! Every diwata destroyed is a grove unprotected, a spring polluted, a deer orphaned. Nature itself grows wilder and more dangerous without its divine keepers!',
  },

  // === Lore ===
  lore: {
    description: "Divine nature spirits corrupted to guard the false god's citadel. Once guardians of sacred groves.",
    origin: 'Visayan, protectors (Eugenio, 2001)',
    reference: 'Aswang Project – Nature deities',
  },
};
