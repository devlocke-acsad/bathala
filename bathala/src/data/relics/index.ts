// Export all relic data for the game

export { 
  commonRelics as act1CommonRelics,
  eliteRelics as act1EliteRelics,
  bossRelics as act1BossRelics,
  treasureRelics as act1TreasureRelics,
  shopRelics as act1ShopRelics,
  mythologicalRelics as act1MythologicalRelics,
  allAct1Relics
} from './Act1Relics';

export { 
  commonRelics as act2CommonRelics,
  eliteRelics as act2EliteRelics,
  bossRelics as act2BossRelics,
  treasureRelics as act2TreasureRelics,
  allAct2Relics
} from './Act2Relics';

export { 
  commonRelics as act3CommonRelics,
  eliteRelics as act3EliteRelics,
  bossRelics as act3BossRelics,
  treasureRelics as act3TreasureRelics,
  allAct3Relics
} from './Act3Relics';

export { 
  shopRelics,
  premiumShopItems,
  allShopItems,
  act2ShopRelics,
  act2PremiumShopItems,
  act3ShopRelics,
  act3PremiumShopItems,
  getChapterShopItems
} from './ShopItems';

import { Relic } from '../../core/types/CombatTypes';
import { getRelicById as getAct1RelicById } from './Act1Relics';
import { getAct2RelicById } from './Act2Relics';
import { getAct3RelicById } from './Act3Relics';

/**
 * Get relic by ID from any chapter
 * Searches Act 1, Act 2, and Act 3 in order
 */
export function getRelicById(id: string): Relic {
  // Try Act 1 first
  try {
    return getAct1RelicById(id);
  } catch (e) {
    // Not in Act 1, try Act 2
  }
  
  // Try Act 2
  try {
    return getAct2RelicById(id);
  } catch (e) {
    // Not in Act 2, try Act 3
  }
  
  // Try Act 3
  try {
    return getAct3RelicById(id);
  } catch (e) {
    // Not found in any chapter
    throw new Error(`Relic with id "${id}" not found in any chapter`);
  }
}