/**
 * Kataw — Common Act 2 Enemy
 * Lore: Half-human half-fish sea rulers who command the waves.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KATAW: EnemyConfig = {
  id: 'kataw',
  name: 'Kataw',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 224,
  damage: 21,
  attackPattern: ['heal', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'fire' },

  // === Visuals ===
  combatSpriteKey: 'kataw_combat',
  overworldSpriteKey: 'kataw_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 10, description: 'Heals, attacks, strengthens', icon: '💚' },

  // === Dialogue ===
  dialogue: {
    intro: 'The seas bow to my rule! I am kataw — king of the Bisaya waters! The engkanto promised dominion over ALL waters. What king refuses a larger kingdom?',
    defeat: 'My crown... sinks into the depths where it was forged. The waves no longer answer my command. Through the settling silt I see the truth: a king who rules through fear commands nothing but emptiness. The old Bisaya fishermen bowed not from terror, but from respect...',
    spare: 'Grace crowns the merciful! The kataw are the merman rulers of Bisaya waters — half-human, half-fish, commanding the waves and the creatures within them. We were not tyrants but stewards, ensuring that the fishermen took only what they needed and returned what they did not. The engkanto promised us absolute power and corrupted stewardship into tyranny. Your mercy restores the old covenant between sea and shore.',
    slay: 'Usurp my throne — and the false god rises from the depths where only kataw dared to keep watch! The Bisaya waters lose their sovereign, and without a king, the sea becomes a lawless, drowning void!',
  },

  // === Lore ===
  lore: {
    description: 'Half-human half-fish sea rulers who command the waves. Guardians of the ocean depths.',
    origin: 'Bisaya, sea rulers (Ramos, 1990)',
    reference: 'Aswang Project – Water controllers',
  },
};
