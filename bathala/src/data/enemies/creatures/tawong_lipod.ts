/**
 * Tawong Lipod - Invisible Wind Beings
 * 
 * @module TawongLipod
 * @description Invisible spirits that ride the wind
 * 
 * Mythological Source:
 * - Origin: Bikol, wind fairies (Ramos, 1990)
 * - Reference: Aswang Project – Invisible tormentors
 * 
 * Lore: Tawong Lipod (literally "wind people") are invisible beings from
 * Bikolano mythology. They travel on the wind and can cause illness or
 * misfortune to those who offend them. Once harmonious with nature, the
 * engkanto's corruption has made them hostile.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const TAWONG_LIPOD: EnemyConfig = {
  // === Identity ===
  id: 'tawong_lipod',
  name: 'Among Lipod',
  tier: 'elite',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 60,
  baseDamage: 10,
  
  // === Combat Behavior ===
  attackPatternType: 'tactical',
  attackPattern: ['invisible_attack', 'stun', 'attack', 'invisible_attack', 'defend'],
  abilities: ['invisibility', 'stun_attack', 'air_element_boost'],
  
  // === Elemental ===
  elementalWeakness: 'earth',
  elementalResistance: 'air',
  
  // === Overworld Behavior ===
  pathingType: 'ambush',
  detectionRange: 7,
  activeAtNight: true,
  activeAtDay: true,
  speedMultiplier: 1.4,
  
  // === Visuals ===
  combatSpriteKey: 'tawonglipod_combat',
  overworldSpriteKey: 'tawonglipod_overworld',
  
  // === Dialogue ===
  dialogueIntro: "Winds conceal—feel fury!",
  dialogueDefeat: "Our veil... tears...",
  dialogueSpare: "Mercy whispers: Tawong Lipod, invisible Bikol wind beings, once harmonious.",
  dialogueSlay: "Scatter us—impostor grows!",
  dialogueHalfHealth: "The winds grow restless...",
  
  // === Lore ===
  loreOrigin: "Bikol, wind fairies",
  loreReference: "Aswang Project – Invisible tormentors",
  loreDescription: "In the Bikol region, sudden gusts of wind are attributed to Tawong Lipod passing by. Illnesses without apparent cause, especially when caught outdoors, are blamed on accidentally offending these invisible beings."
};
