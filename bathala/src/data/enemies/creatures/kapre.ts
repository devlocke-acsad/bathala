/**
 * Kapre Shade — Boss Act 1 Enemy
 * Lore: Massive tree-dwelling giants who smoke enormous cigars.
 * Once Bathala's appointed guardians of sacred groves, now the
 * engkanto's corruption has unleashed their ancient rage.
 * Source: Ramos, 1990; Eugenio, 2001; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const KAPRE_SHADE: EnemyConfig = {
  id: 'kapre_shade',
  name: 'Kapre Shade',
  tier: 'boss',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 600,
  damage: 42,
  attackPattern: ['strengthen', 'poison', 'attack', 'attack'],
  elementalAffinity: { weakness: 'water', resistance: 'earth' },

  // === Visuals ===
  combatSpriteKey: 'kapre_combat',
  overworldSpriteKey: 'kapre_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 42, description: 'Strengthens, poisons with smoke, then strikes', icon: '🔥' },

  // === Dialogue ===
  dialogue: {
    intro: 'You smell that smoke? That is the stench of a forest that forgot its purpose. I AM its purpose. Come — burn with me.',
    defeat: 'My tree... my ancient tree... the cigar dims... I remember now... I was their guardian...',
    spare: 'My smoke clears. I was their guardian. The engkanto made me forget. The grove is yours — protect it.',
    slay: 'You burned my tree. The forest screams. The roots will remember your violence.',
  },

  // === Lore ===
  lore: {
    description: 'Massive tree-dwelling giants who smoke enormous cigars. Once Bathala\'s appointed guardians of sacred groves, the engkanto\'s corruption has unleashed centuries of pent-up rage, turning their protective smoke into choking infernos.',
    origin: 'General, smokers (Eugenio, 2001)',
    reference: 'Aswang Project – Tree-lurkers',
  },
};
