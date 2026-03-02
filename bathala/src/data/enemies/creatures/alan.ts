/**
 * Alan — Common Act 3 Enemy
 * Lore: Winged humanoid spirits with reversed toes that adopted lost children.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const ALAN: EnemyConfig = {
  id: 'alan',
  name: 'Alan',
  tier: 'common',
  chapter: 3,

  // === Combat Stats ===
  maxHealth: 192,
  damage: 27,
  attackPattern: ['attack', 'attack', 'strengthen'],
  elementalAffinity: { weakness: 'earth', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'alan_combat',
  overworldSpriteKey: 'alan_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 27, description: 'Double attacks then strengthens', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: 'Half-bird fury descends from the corrupted skies! I am alan — the winged spirit of Bikol with toes that face backward, like the tikbalang\'s hooves. But where they misdirect on land, I strike from ABOVE. The engkanto said: \'Why adopt the lost when you can DEVOUR them?\'',
    defeat: 'My wings... clip against reality. As I fall, my reversed toes finally point the right direction — down, toward the children\'s homes below. I remember now. The alan found abandoned children in the forest and raised them as our own. We were mothers of the lost. Fierce, yes. Strange, yes. But mothers...',
    spare: 'Grace lifts the alan back to the light! In Bikol tradition, the alan are half-human, half-bird spirits with fingers and toes that point backward. We were known for finding children lost or abandoned in the forest and adopting them — raising them with fierce, protective love. Our appearance terrified, but our nature nurtured. The engkanto twisted our maternal instinct into predatory hunger. Your mercy reminds us: we are caretakers, not hunters.',
    slay: 'Ground me — and the sky loses its most compassionate hunter! Every alan destroyed is a lost child who will never be found, never be adopted, never be loved by the strange fierce spirits who once made the sky a nursery. The impostor thrives on orphaned futures!',
  },

  // === Lore ===
  lore: {
    description: 'Winged humanoid spirits with reversed toes. Once adopted lost children, now strike from corrupted skies.',
    origin: 'Bikol, bird-people (Ramos, 1990)',
    reference: 'Aswang Project – Cannibalistic hangers',
  },
};
