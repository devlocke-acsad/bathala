/**
 * Kapre - Tree Giant
 * 
 * @module Kapre
 * @description Tall, dark giant who lives in large trees and smokes cigars
 * 
 * Mythological Source:
 * - Origin: General, smokers (Eugenio, 2001)
 * - Reference: Aswang Project – Tree-lurkers
 * 
 * Lore: Kapre are towering, hairy giants who dwell in large trees, particularly
 * balete, acacia, and mango. They are known for their love of tobacco, and the
 * smell of cigar smoke in the forest often signals their presence. Though
 * intimidating, they were once protectors of the forest.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const KAPRE_SHADE: EnemyConfig = {
  // === Identity ===
  id: 'kapre_shade',
  name: 'Kapre Shade',
  tier: 'elite',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 65,
  baseDamage: 12,
  
  // === Combat Behavior ===
  attackPatternType: 'support',
  attackPattern: ['smoke_attack', 'summon_minion', 'attack', 'smoke_attack', 'attack'],
  abilities: ['aoe_burn', 'summon_smoke_minion'],
  
  // === Elemental ===
  elementalWeakness: 'water',
  elementalResistance: 'fire',
  
  // === Overworld Behavior ===
  pathingType: 'stationary',
  detectionRange: 6,
  activeAtNight: true,
  activeAtDay: false,
  
  // === Visuals ===
  spriteKey: 'chap1/kapre_shade',
  scale: 1.8,
  
  // === Dialogue ===
  dialogueIntro: "Smoke veils my wrath!",
  dialogueDefeat: "My tree... falls...",
  dialogueSpare: "Compassion unlocks: Kapre, tree giants smoking cigars, loyal to Bathala.",
  dialogueSlay: "Burn me down—shadow rises!",
  dialogueHalfHealth: "You dare challenge the guardian of ancient trees?",
  
  // === Lore ===
  loreOrigin: "General, smokers",
  loreReference: "Aswang Project – Tree-lurkers",
  loreDescription: "Kapre stand 7-9 feet tall, with dark skin and a fondness for tricking travelers. They can make people lose their way or feel an inexplicable fear. Some Kapre befriend humans, particularly women, whom they may fall in love with and protect."
};
