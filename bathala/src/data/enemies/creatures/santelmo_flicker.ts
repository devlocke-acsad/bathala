/**
 * Santelmo Flicker — Common Act 2 Enemy
 * Lore: Fire spirits appearing as floating flames near water.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const SANTELMO_FLICKER: EnemyConfig = {
  id: 'santelmo_flicker',
  name: 'Santelmo Flicker',
  tier: 'common',
  chapter: 2,

  // === Combat Stats ===
  maxHealth: 160,
  damage: 21,
  attackPattern: ['attack', 'defend', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'santelmo_combat',
  overworldSpriteKey: 'santelmo_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 21, description: 'Fast attacks with defense', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Look upon my flame, mortal — do you see the Visayan sailors\' fear reflected in it? I am santelmo, the fire that dances on the waves. The Spanish called me "Santo Elmo" and crossed themselves. But I was here long before their ships. Once my light guided Bathala\'s upper-world messengers through the night sky. Now the engkanto has set my fire against those I once illuminated!',
    defeat: 'My light... dims to an ember. The warmth that remains is not the engkanto\'s fury — it is older, gentler. The original flame that Bathala lit to guide souls between worlds. Was I ever truly a destroyer, or was I always just... a lantern, searching for something to light the way home?',
    spare: 'You spare the flicker? Compassion illuminates what fear hides. The santelmo — St. Elmo\'s fire as the colonizers named us — were originally soul-fires of the upper world, assistants to the gods. The Visayan fishing communities saw our lights dancing on the water and knew: where santelmo glow, the divine watches. The engkanto turned our guiding light into consuming flame. Your mercy rekindles the original spark.',
    slay: 'Extinguish me — and the navigating flame of the old gods goes dark forever! The shadow grows where light once guided, and the fishermen who trusted my glow will sail into darkness without end!',
  },

  // === Lore ===
  lore: {
    description: "Fire spirits appearing as floating flames near water, based on St. Elmo's fire phenomenon.",
    origin: "Visayan, St. Elmo's fire (Eugenio, 2001)",
    reference: 'Aswang Project – Upper world assistants',
  },
};
