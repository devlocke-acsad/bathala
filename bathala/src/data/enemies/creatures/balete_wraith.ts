/**
 * Balete Wraith - Haunted Tree Spirit
 * 
 * @module BaleteWraith
 * @description Spirit bound to the sacred balete tree
 * 
 * Mythological Source:
 * - Origin: General, haunted figs (Ramos, 1990)
 * - Reference: Aswang Project – Spirit gateways
 * 
 * Lore: Balete trees are believed to be portals to the spirit world,
 * home to various anito (ancestral spirits). The engkanto's corruption
 * has twisted these guardians into vengeful wraiths.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const BALETE_WRAITH: EnemyConfig = {
  // === Identity ===
  id: 'balete_wraith',
  name: 'Balete Wraith',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 22,
  baseDamage: 6,
  
  // === Combat Behavior ===
  attackPatternType: 'berserker',
  attackPattern: ['attack', 'buff_strength', 'attack', 'attack'],
  abilities: ['gain_strength_on_vulnerable'],
  
  // === Elemental ===
  elementalWeakness: 'fire',
  elementalResistance: 'earth',
  
  // === Overworld Behavior ===
  pathingType: 'ambush',
  detectionRange: 3,
  activeAtNight: true,
  activeAtDay: true,
  
  // === Visuals ===
  spriteKey: 'chap1/balete_wraith',
  
  // === Dialogue ===
  dialogueIntro: "Roots entwine your fate!",
  dialogueDefeat: "Grave... calls...",
  dialogueSpare: "Mercy reveals: Balete trees are anito portals, haunted by engkanto-twisted spirits.",
  dialogueSlay: "Strike true—my form feeds impostor!",
  
  // === Lore ===
  loreOrigin: "General, haunted figs",
  loreReference: "Aswang Project – Spirit gateways",
  loreDescription: "The balete tree (strangler fig) is sacred in Filipino folklore. Its tangled aerial roots are said to house supernatural beings. Cutting down a balete without proper rituals invites misfortune, as the displaced spirits may seek vengeance."
};
