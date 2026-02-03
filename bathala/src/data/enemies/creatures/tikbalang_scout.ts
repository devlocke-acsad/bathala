/**
 * Tikbalang Scout - Forest Trickster
 * 
 * @module TikbalangScout
 * @description Horse-headed creature that confuses travelers
 * 
 * Mythological Source:
 * - Origin: Tagalog, mountain tricksters (Ramos, 1990)
 * - Reference: Aswang Project – Horse-headed deceivers
 * 
 * Lore: Tikbalang were once forest protectors who guided lost travelers.
 * Now corrupted by the engkanto's lies, they use their backward hooves
 * to mislead those who wander into their domains.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const TIKBALANG_SCOUT: EnemyConfig = {
  // === Identity ===
  id: 'tikbalang_scout',
  name: 'Tikbalang Scout',
  tier: 'common',
  chapter: 1,  // First appearance, but can be used anywhere
  
  // === Combat Stats ===
  baseHealth: 28,
  baseDamage: 8,
  
  // === Combat Behavior ===
  attackPatternType: 'tactical',
  attackPattern: ['attack', 'confuse', 'attack', 'defend'],
  abilities: ['confuse_targeting'],
  
  // === Elemental ===
  elementalWeakness: 'fire',
  elementalResistance: 'air',
  
  // === Overworld Behavior ===
  pathingType: 'wander',
  detectionRange: 4,
  activeAtNight: true,
  activeAtDay: false,
  
  // === Visuals ===
  spriteKey: 'chap1/tikbalang_scout',
  
  // === Dialogue ===
  dialogueIntro: "Lost in my paths, seer? False one's whispers guide!",
  dialogueDefeat: "My tricks... unravel...",
  dialogueSpare: "Spare me: Tikbalang were forest protectors, now misleading with backward hooves.",
  dialogueSlay: "End me—my essence feeds shadow!",
  
  // === Lore ===
  loreOrigin: "Tagalog, mountain tricksters",
  loreReference: "Aswang Project – Horse-headed deceivers",
  loreDescription: "Tikbalang are tall, bony creatures with the head and hooves of a horse. They are said to lead travelers astray, causing them to lose their way in the forests and mountains. Wearing one's shirt inside out is believed to protect against their tricks."
};
