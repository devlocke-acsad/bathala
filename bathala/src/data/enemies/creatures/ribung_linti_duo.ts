/**
 * Ribung Linti Duo — Elite Act 3 Enemy
 * Lore: Twin lightning spirits that strike in perfect synchronization.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const RIBUNG_LINTI_DUO: EnemyConfig = {
  id: 'ribung_linti_duo',
  name: 'Ribung Linti Duo',
  tier: 'elite',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 270,
  damage: 30,
  attackPattern: ['attack', 'strengthen', 'attack', 'defend'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'ribunglinti_combat',
  overworldSpriteKey: 'ribunglinti_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 30, description: 'Attacks, strengthens, attacks, defends', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'STORMS STRIKE IN TANDEM! We are the Ribung Linti — twin lightning spirits of the Ilocano highlands! When we dance together, the sky cracks open and the mountains tremble! The engkanto said: \'Why warn the people of storms when you can BE the storm?\' Now our thunder speaks only of DESTRUCTION!',
    defeat: 'Our thunder... silences at last. The twin bolts separate, and in the quiet between lightning and its echo, we hear the old Ilocano prayers: not prayers of fear, but of respect. The farming communities knew our storms brought rain for the rice terraces. We were the heralds of harvest, not harbingers of ruin...',
    spare: 'Mercy echoes through the mountains! The Ribung Linti are Ilocano lightning spirits — twin forces of storm and thunder that the highland communities respected and feared in equal measure. Our lightning struck the mountains to release minerals into the soil. Our rain filled the rice terraces. Our thunder warned of approaching weather. The engkanto weaponized our power, aimed our bolts at people instead of mountains. Your mercy grounds us in purpose again.',
    slay: 'Shatter our bolts — and the false god grows stronger on stolen thunder! The Ilocano highlands will know storms without warning, rain without rhythm, and lightning without meaning. We were the weather\'s voice — and you have silenced it!',
  },

  // === Lore ===
  lore: {
    description: 'Twin lightning spirits that strike in perfect synchronization. Ilocano storm beings of devastating power.',
    origin: 'Ilocano, storm beings (Ramos, 1990)',
    reference: 'Aswang Project – Thunder tormentors',
  },
};
