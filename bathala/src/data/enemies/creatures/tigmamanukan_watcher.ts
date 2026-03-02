/**
 * Tigmamanukan Watcher — Common Act 3 Enemy
 * Lore: Celestial prophetic bird that lives at the edge of creation.
 * Source: Jocano, 1969; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIGMAMANUKAN_WATCHER: EnemyConfig = {
  id: 'tigmamanukan_watcher',
  name: 'Tigmamanukan Watcher',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 208,
  damage: 24,
  attackPattern: ['strengthen', 'attack', 'attack'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'tigmamanukan_combat',
  overworldSpriteKey: 'tigmamanukan_overworld',

  // === Intent ===
  intent: { type: 'buff', value: 2, description: 'Strengthens then double attacks', icon: '💪' },

  // === Dialogue ===
  dialogue: {
    intro: 'My wings cut omens into the sky! I am tigmamanukan — Bathala\'s prophetic bird. The engkanto rewrote my auguries. Every omen I bring now is a LIE!',
    defeat: 'My flight... ends. I spiral downward, and as I fall, the sky behind me fills with the prophecies I should have delivered — true ones. Harvests that would have been bountiful. Wars that could have been avoided. Journeys that should have ended safely. The engkanto stole a future for every omen they corrupted...',
    spare: 'Mercy foretells a brighter future! The tigmamanukan — Bathala\'s divine messenger bird — held a sacred role in Tagalog society. Babaylan would observe our flight before any great undertaking: if we flew right, the day was blessed; if left, the people waited. Our prophecies shaped the rhythm of daily life. The engkanto reversed our auguries, turning blessings into curses. Your mercy sets the compass right again.',
    slay: 'Clip my wings — and the sky loses its oldest oracle! Without the tigmamanukan, no babaylan can read the heavens, no farmer can know the season, no traveler can trust the road. The false god feeds on a world blind to its own future!',
  },

  // === Lore ===
  lore: {
    description: 'Celestial prophetic bird that lives at the edge of creation. Once a divine messenger of Bathala.',
    origin: 'Tagalog, divination birds (Eugenio, 2001)',
    reference: 'Aswang Project – Celestial signs',
  },
};
