import { allAct1Relics } from '../data/relics/Act1Relics';
import { allAct2Relics } from '../data/relics/Act2Relics';
import { allAct3Relics } from '../data/relics/Act3Relics';
import { Relic } from '../core/types/CombatTypes';

/**
 * Centralized relic sprite key mapping — derived from relic data.
 * Each relic's `spriteKey` field is the single source of truth.
 * Edit the relic definition to change its sprite; this map updates automatically.
 */
const ALL_RELICS: Relic[] = [
  ...allAct1Relics,
  ...allAct2Relics,
  ...allAct3Relics,
];

const RELIC_SPRITE_MAP: Readonly<Record<string, string>> = Object.freeze(
  ALL_RELICS.reduce<Record<string, string>>((map, relic) => {
    if (relic.spriteKey) {
      map[relic.id] = relic.spriteKey;
    }
    return map;
  }, {})
);

export function getRelicSpriteKey(relicId: string): string {
  return RELIC_SPRITE_MAP[relicId] ?? "";
}

export function hasRelicSprite(relicId: string): boolean {
  return relicId in RELIC_SPRITE_MAP;
}

export function getAllRelicIds(): string[] {
  return Object.keys(RELIC_SPRITE_MAP);
}
