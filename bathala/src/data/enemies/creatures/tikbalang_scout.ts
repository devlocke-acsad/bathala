/**
 * Tikbalang Scout — Common Act 1 Enemy
 * Lore: Tagalog mountain tricksters with backward hooves, once forest protectors.
 * Source: Ramos, 1990; Samar, 2019; Aswang Project
 */
import { EnemyConfig } from '../../../core/entities/EnemyEntity';

export const TIKBALANG_SCOUT: EnemyConfig = {
  id: 'tikbalang_scout',
  name: 'Tikbalang Scout',
  tier: 'common',
  chapter: 1,

  // === Combat Stats ===
  maxHealth: 180,
  damage: 21,
  attackPattern: ['attack', 'weaken', 'attack'],
  elementalAffinity: { weakness: 'fire', resistance: 'air' },

  // === Visuals ===
  combatSpriteKey: 'tikbalang_combat',
  overworldSpriteKey: 'tikbalang_overworld',

  // === Intent ===
  intent: { type: 'attack', value: 21, description: 'Attacks and weakens', icon: '†' },

  // === Dialogue ===
  dialogue: {
    intro: "Lost in my paths, seer? False one's whispers guide!",
    defeat: 'My tricks... unravel...',
    spare: 'Spare me: Tikbalang were forest protectors, now misleading with backward hooves (Ramos, 1990).',
    slay: 'End me—my essence feeds shadow!',
  },

  // === Lore ===
  lore: {
    description: "Tikbalang are tall, bony humanoids with the head and hooves of a horse. Once protectors of mountain trails, they now confuse travelers with backward hooves under the engkanto's corruption.",
    origin: 'Tagalog, mountain tricksters (Samar, 2019)',
    reference: 'Aswang Project – Horse-headed deceivers',
  },
};
