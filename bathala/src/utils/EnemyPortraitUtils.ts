import type { Scene } from "phaser";

export const ENEMY_DISCOVER_PORTRAIT_MAP: Record<string, string> = {
  // Chapter 1
  tikbalang_scout: "tikbalang_almanac",
  balete_wraith: "balete_almanac",
  sigbin_charger: "sigbin_almanac",
  duwende_trickster: "duwende_almanac",
  tiyanak_ambusher: "tiyanak_almanac",
  amomongo: "amomongo_almanac",
  bungisngis: "bungisngis_almanac",
  kapre_shade: "kapre_almanac",
  tawong_lipod: "tawonglipod_almanac",
  mangangaway: "mangangaway_almanac",
  // Chapter 2
  sirena_illusionist: "sirena_almanac",
  siyokoy_raider: "siyokoy_almanac",
  santelmo_flicker: "santelmo_almanac",
  berberoka_lurker: "berberoka_almanac",
  magindara_swarm: "magindara_almanac",
  kataw: "kataw_almanac",
  berbalang: "berbalang_almanac",
  sunken_bangkilan: "bangkilan_almanac",
  apoy_tubig_fury: "apoy_tubig_fury_almanac",
  bakunawa: "bakunawa_almanac",
  // Chapter 3
  tigmamanukan_watcher: "tigmamanukan_almanac",
  diwata_sentinel: "diwata_almanac",
  sarimanok_keeper: "sarimanok_almanac",
  bulalakaw_flamewings: "bulalakaw_almanac",
  minokawa_harbinger: "minokawa_almanac",
  alan: "alan_almanac",
  ekek: "ekek_almanac",
  ribung_linti_duo: "ribung_linti_almanac",
  apolaki_godling: "apolaki_almanac",
  false_bathala: "false_bathala_almanac",
};

export const ENEMY_DISCOVER_PORTRAIT_ASSET_PATHS: Record<string, string> = {
  sirena_almanac: "assets/sprites/discover/chapter2/new/sirena_splash.png",
  siyokoy_almanac: "assets/sprites/discover/chapter2/new/siyokoy_splash.png",
  santelmo_almanac: "assets/sprites/discover/chapter2/new/santelmo_splash.png",
  berberoka_almanac: "assets/sprites/discover/chapter2/new/berberoka_splash.png",
  magindara_almanac: "assets/sprites/discover/chapter2/new/maginda_swarm_splash.png",
  kataw_almanac: "assets/sprites/discover/chapter2/new/kataw_splash.png",
  berbalang_almanac: "assets/sprites/discover/chapter2/new/berbalang_splash.png",
  bangkilan_almanac: "assets/sprites/discover/chapter2/new/sunken_bangkilan_splash.png",
  apoy_tubig_fury_almanac: "assets/sprites/discover/chapter2/new/apoy_tubig_splash.png",
  bakunawa_almanac: "assets/sprites/discover/chapter2/new/bakunawa_splash.png",
  tigmamanukan_almanac: "assets/sprites/discover/chapter3/new/tigamamanukan_watcher_splash.png",
  diwata_almanac: "assets/sprites/discover/chapter3/new/diwata_sentinel_splash.png",
  sarimanok_almanac: "assets/sprites/discover/chapter3/new/sarimanok_watcher_splash.png",
  bulalakaw_almanac: "assets/sprites/discover/chapter3/new/bulalakaw_flamekeeper_splash.png",
  minokawa_almanac: "assets/sprites/discover/chapter3/new/minokawa_harbinger_splash.png",
  alan_almanac: "assets/sprites/discover/chapter3/new/alan_splash.png",
  ekek_almanac: "assets/sprites/discover/chapter3/new/ekek_splash.png",
  ribung_linti_almanac: "assets/sprites/discover/chapter3/new/ribung_linti_splash.png",
  apolaki_almanac: "assets/sprites/discover/chapter3/new/apolaki_splash.png",
  false_bathala_almanac: "assets/sprites/discover/chapter3/new/false_bathala_splash.png",
};

const pendingPortraitLoads = new Set<string>();
const attemptedPortraitLoads = new Set<string>();

export type EnemyPortraitSource = { id?: string; name?: string } | string;

export interface EnemyPortraitLoadResult {
  portraitKey: string | null;
  status: "loaded" | "queued" | "unavailable" | "failed";
}

export function normalizeEnemyPortraitLookupId(enemy: EnemyPortraitSource): string {
  const raw = typeof enemy === "string"
    ? enemy
    : (typeof enemy.id === "string" && enemy.id.trim().length > 0 ? enemy.id : enemy.name ?? "");

  return raw
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
}

export function getEnemyDiscoverPortraitKey(enemy: EnemyPortraitSource): string | null {
  const lookupId = normalizeEnemyPortraitLookupId(enemy);
  return ENEMY_DISCOVER_PORTRAIT_MAP[lookupId] ?? null;
}

export function ensureEnemyDiscoverPortraitLoaded(
  scene: Scene,
  enemy: EnemyPortraitSource,
  onReady?: (portraitKey: string) => void,
): EnemyPortraitLoadResult {
  const portraitKey = getEnemyDiscoverPortraitKey(enemy);
  if (!portraitKey) {
    return { portraitKey: null, status: "unavailable" };
  }

  if (scene.textures.exists(portraitKey)) {
    return { portraitKey, status: "loaded" };
  }

  const assetPath = ENEMY_DISCOVER_PORTRAIT_ASSET_PATHS[portraitKey];
  if (!assetPath) {
    return { portraitKey, status: "unavailable" };
  }

  if (attemptedPortraitLoads.has(portraitKey) && !pendingPortraitLoads.has(portraitKey)) {
    return { portraitKey, status: "failed" };
  }

  if (onReady) {
    scene.load.once("complete", () => {
      if (scene.textures.exists(portraitKey)) {
        onReady(portraitKey);
      }
    });
  }

  if (!pendingPortraitLoads.has(portraitKey)) {
    pendingPortraitLoads.add(portraitKey);
    scene.load.once("complete", () => {
      pendingPortraitLoads.delete(portraitKey);
      attemptedPortraitLoads.add(portraitKey);
    });
    scene.load.image(portraitKey, assetPath);
  }

  if (!scene.load.isLoading()) {
    scene.load.start();
  }

  return { portraitKey, status: "queued" };
}
