/**
 * Centralized relic sprite key mapping
 * Single source of truth - previously duplicated in multiple files
 */
const RELIC_SPRITE_MAP: Readonly<Record<string, string>> = {
  "swift_wind_agimat": "relic_swift_wind_agimat",
  "amomongo_claw": "relic_amomongo_claw",
  "ancestral_blade": "relic_ancestral_blade",
  "balete_root": "relic_balete_root",
  "babaylans_talisman": "relic_babaylans_talisman",
  "bungisngis_grin": "relic_bungisngis_grin",
  "diwatas_crown": "relic_diwatas_crown",
  "duwende_charm": "relic_duwende_charm",
  "earthwardens_plate": "relic_earthwardens_plate",
  "ember_fetish": "relic_ember_fetish",
  "kapres_cigar": "relic_kapres_cigar",
  "lucky_charm": "relic_lucky_charm",
  "mangangaway_wand": "relic_mangangaway_wand",
  "sarimanok_feather": "relic_sarimanok_feather",
  "sigbin_heart": "relic_sigbin_heart",
  "stone_golem_heart": "relic_stone_golem_heart",
  "tidal_amulet": "relic_tidal_amulet",
  "tikbalangs_hoof": "relic_tikbalangs_hoof",
  "tiyanak_tear": "relic_tiyanak_tear",
  "umalagad_spirit": "relic_umalagad_spirit"
} as const;

export function getRelicSpriteKey(relicId: string): string {
  return RELIC_SPRITE_MAP[relicId] ?? "";
}

export function hasRelicSprite(relicId: string): boolean {
  return relicId in RELIC_SPRITE_MAP;
}

export function getAllRelicIds(): string[] {
  return Object.keys(RELIC_SPRITE_MAP);
}
