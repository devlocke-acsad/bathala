/**
 * Tiyanak Ambusher - Demon Baby
 * 
 * @module TiyanakAmbusher
 * @description Spirit of an unbaptized or aborted child
 * 
 * Mythological Source:
 * - Origin: General, demon babies (Eugenio, 2001)
 * - Reference: Aswang Project – Forest lurers
 * 
 * Lore: Tiyanak take the form of crying infants to lure travelers deep into
 * the forest. When picked up, they reveal their true demonic form and attack.
 * They are souls of children who died before baptism, twisted by grief.
 */

import { EnemyConfig } from '../../../core/types/EnemyTypes';

export const TIYANAK_AMBUSHER: EnemyConfig = {
  // === Identity ===
  id: 'tiyanak_ambusher',
  name: 'Tiyanak Ambusher',
  tier: 'common',
  chapter: 1,
  
  // === Combat Stats ===
  baseHealth: 25,
  baseDamage: 9,
  
  // === Combat Behavior ===
  attackPatternType: 'aggressive',
  attackPattern: ['attack', 'critical_attack', 'apply_fear', 'attack'],
  abilities: ['critical_strike', 'apply_fear'],
  
  // === Elemental ===
  elementalWeakness: 'air',
  elementalResistance: null,
  
  // === Overworld Behavior ===
  pathingType: 'ambush',
  detectionRange: 4,
  activeAtNight: true,
  activeAtDay: false,
  
  // === Visuals ===
  spriteKey: 'chap1/tiyanak_ambusher',
  scale: 0.6,
  
  // === Dialogue ===
  dialogueIntro: "Wails lure to doom!",
  dialogueDefeat: "My cry... silenced...",
  dialogueSpare: "Mercy shows: Tiyanak, lost infant spirits mimicking babies to attack.",
  dialogueSlay: "Slay innocent form—fuel for shadow!",
  
  // === Lore ===
  loreOrigin: "General, demon babies",
  loreReference: "Aswang Project – Forest lurers",
  loreDescription: "The Tiyanak's wail mimics a helpless infant, preying on the compassion of travelers. To escape, one must turn their clothes inside out. Some believe they are the vengeful spirits of children denied proper burial rites."
};
