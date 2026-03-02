/**
 * Bulalakaw Flamewings — Common Act 3 Enemy
 * Lore: Meteor spirits that streak across the sky, burning with celestial fire.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const BULALAKAW_FLAMEWINGS: EnemyConfig = {
  id: 'bulalakaw_flamewings',
  name: 'Bulalakaw Flamewings',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 264,
  damage: 27,
  attackPattern: ['poison', 'attack', 'defend'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'bulalakaw_combat',
  overworldSpriteKey: 'bulalakaw_overworld',

  // === Intent ===
  intent: { type: 'debuff', value: 2, description: 'Burns, attacks, defends', icon: '☠️' },

  // === Dialogue ===
  dialogue: {
    intro: 'COMETS BLAZE across the sky! I am the bulalakaw — the meteor-bird whose fiery streak across the heavens once marked the turning of seasons and the coming of change! The people looked up in wonder. Now the engkanto sets my course toward DESTRUCTION — and the wonder has turned to terror!',
    defeat: 'My streak... fades like a dying ember falling through cloud. The fire that propelled me across the sky cools, and I remember: I was an omen, yes, but not of doom. The bulalakaw heralded change — new seasons, new beginnings. When did the engkanto convince me that change meant annihilation?',
    spare: 'Pity uncovers the star beneath the fire! The bulalakaw are comet-like omen birds — celestial spirits whose fiery passage across the sky was read by babaylan as a sign of great change approaching. We were associated with illness, yes, but also with transformation: the fever that breaks before healing, the storm that clears before calm. The engkanto stripped away the healing and left only the fever. Your mercy restores the full cycle.',
    slay: 'Quench my fire — and the sky loses its oldest herald of change! Without the bulalakaw, the seasons blur, the babaylan lose their celestial calendar, and the false god writes new omens in the empty sky!',
  },

  // === Lore ===
  lore: {
    description: 'Meteor spirits that streak across the sky, burning with celestial fire. Omens of illness and disaster.',
    origin: 'General, sky streakers (Eugenio, 2001)',
    reference: 'Aswang Project – Illness omens',
  },
};
