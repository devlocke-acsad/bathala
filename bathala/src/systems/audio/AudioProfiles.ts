import audioCatalogRaw from "../../data/audio/audio-catalog.json?raw";
import sceneAudioRaw from "../../data/audio/scene-audio.json?raw";
import actAudioRaw from "../../data/audio/act-audio.json?raw";
import uiAudioRaw from "../../data/audio/ui-audio.json?raw";
import actionAudioRaw from "../../data/audio/action-audio.json?raw";
import eventAudioRaw from "../../data/audio/event-audio.json?raw";

export type AudioChannel = "master" | "music" | "ambient" | "sfx" | "ui" | "voice";

export interface AudioCatalogAsset {
  key: string;
  path: string;
  type: "music" | "sfx";
  channel: AudioChannel;
  baseVolume: number;
  loop: boolean;
  tags: string[];
}

export interface AudioCatalog {
  defaultChannelVolumes: Record<AudioChannel, number>;
  assets: AudioCatalogAsset[];
}

export interface SceneAudioProfile {
  bgmKey: string;
  bgmLayerKeys?: string[];
  bgmVolume: number;
  fadeIn: boolean;
  resumeFromLastPosition?: boolean;
  restartMusicWhenEnteredFromScenes?: string[];
  ambientLoopKeys: string[];
}

export interface ActAudioProfile {
  actId: number;
  overworldBgmKey: string;
  combatBgmKey: string;
  ambientLoopKeys: string[];
  sceneBgmOverrides?: Record<string, string>;
  sceneBgmLayerOverrides?: Record<string, string[]>;
  sceneBgmVolumeOverrides?: Record<string, number>;
  sceneAmbientOverrides?: Record<string, string[]>;
  eventAudioOverrides?: Record<string, string>;
}

export interface UIAudioProfile {
  buttonHover?: string;
  buttonPress?: string;
  panelOpen?: string;
  panelClose?: string;
  confirm?: string;
  cancel?: string;
}

export interface ActionAudioProfile {
  playerStep?: string;
  cardDraw?: string;
  attackBasic?: string;
  attackSpecial?: string;
  itemUse?: string;
}

export type EventAudioProfile = Record<string, string>;

const DEFAULT_CHANNEL_VOLUMES: Record<AudioChannel, number> = {
  master: 1,
  music: 1,
  ambient: 0.8,
  sfx: 1,
  ui: 1,
  voice: 1,
};

function parseJson<T>(raw: string, label: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`AudioProfiles: Failed parsing ${label}. Using fallback.`, error);
    return fallback;
  }
}

function isAudioChannel(value: unknown): value is AudioChannel {
  return (
    value === "master" ||
    value === "music" ||
    value === "ambient" ||
    value === "sfx" ||
    value === "ui" ||
    value === "voice"
  );
}

function normalizeAudioCatalog(raw: unknown): AudioCatalog {
  const input = (raw as Record<string, unknown>) ?? {};
  const rawChannelVolumes = (input.defaultChannelVolumes as Record<string, unknown>) ?? {};

  const defaultChannelVolumes: Record<AudioChannel, number> = {
    ...DEFAULT_CHANNEL_VOLUMES,
  };

  for (const [key, value] of Object.entries(rawChannelVolumes)) {
    if (!isAudioChannel(key)) {
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value)) {
      continue;
    }
    defaultChannelVolumes[key] = Math.max(0, Math.min(1, value));
  }

  const rawAssets = Array.isArray(input.assets) ? input.assets : [];
  const assets: AudioCatalogAsset[] = [];

  for (const item of rawAssets) {
    const asset = (item as Record<string, unknown>) ?? {};
    const key = typeof asset.key === "string" ? asset.key.trim() : "";
    const path = typeof asset.path === "string" ? asset.path.trim() : "";
    const type = asset.type === "music" ? "music" : asset.type === "sfx" ? "sfx" : null;

    if (!key || !path || !type) {
      continue;
    }

    const channel = isAudioChannel(asset.channel)
      ? asset.channel
      : type === "music"
        ? "music"
        : "sfx";

    const baseVolume =
      typeof asset.baseVolume === "number" && Number.isFinite(asset.baseVolume)
        ? Math.max(0, Math.min(1, asset.baseVolume))
        : 1;

    const loop = typeof asset.loop === "boolean" ? asset.loop : type === "music";
    const tags = Array.isArray(asset.tags)
      ? asset.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    assets.push({ key, path, type, channel, baseVolume, loop, tags });
  }

  return {
    defaultChannelVolumes,
    assets,
  };
}

function normalizeSceneProfiles(raw: unknown): Record<string, SceneAudioProfile> {
  const input = (raw as Record<string, unknown>) ?? {};
  const output: Record<string, SceneAudioProfile> = {};

  for (const [sceneKey, value] of Object.entries(input)) {
    const item = (value as Record<string, unknown>) ?? {};
    const bgmKey = typeof item.bgmKey === "string" ? item.bgmKey : "";
    if (!bgmKey) {
      continue;
    }

    const bgmVolume =
      typeof item.bgmVolume === "number" && Number.isFinite(item.bgmVolume)
        ? Math.max(0, Math.min(1, item.bgmVolume))
        : 1;

    const fadeIn = typeof item.fadeIn === "boolean" ? item.fadeIn : true;
    const resumeFromLastPosition = typeof item.resumeFromLastPosition === "boolean"
      ? item.resumeFromLastPosition
      : undefined;
    const restartMusicWhenEnteredFromScenes = Array.isArray(item.restartMusicWhenEnteredFromScenes)
      ? item.restartMusicWhenEnteredFromScenes.filter((entry): entry is string => typeof entry === "string")
      : undefined;
    const bgmLayerKeys = Array.isArray(item.bgmLayerKeys)
      ? item.bgmLayerKeys.filter((entry): entry is string => typeof entry === "string")
      : undefined;
    const ambientLoopKeys = Array.isArray(item.ambientLoopKeys)
      ? item.ambientLoopKeys.filter((entry): entry is string => typeof entry === "string")
      : [];

    output[sceneKey] = {
      bgmKey,
      bgmLayerKeys,
      bgmVolume,
      fadeIn,
      resumeFromLastPosition,
      restartMusicWhenEnteredFromScenes,
      ambientLoopKeys,
    };
  }

  return output;
}

function normalizeActProfiles(raw: unknown): Record<number, ActAudioProfile> {
  const input = (raw as Record<string, unknown>) ?? {};
  const output: Record<number, ActAudioProfile> = {};

  for (const value of Object.values(input)) {
    const item = (value as Record<string, unknown>) ?? {};

    const actId = typeof item.actId === "number" && Number.isInteger(item.actId) ? item.actId : null;
    const overworldBgmKey = typeof item.overworldBgmKey === "string" ? item.overworldBgmKey : "";
    const combatBgmKey = typeof item.combatBgmKey === "string" ? item.combatBgmKey : "";

    if (actId === null || !overworldBgmKey || !combatBgmKey) {
      continue;
    }

    const ambientLoopKeys = Array.isArray(item.ambientLoopKeys)
      ? item.ambientLoopKeys.filter((entry): entry is string => typeof entry === "string")
      : [];

    const sceneBgmOverrides = normalizeStringMap(item.sceneBgmOverrides);
    const sceneBgmLayerOverrides = normalizeStringArrayMap(item.sceneBgmLayerOverrides);
    const eventAudioOverrides = normalizeStringMap(item.eventAudioOverrides);

    const rawVolumeOverrides = (item.sceneBgmVolumeOverrides as Record<string, unknown>) ?? {};
    const sceneBgmVolumeOverrides: Record<string, number> = {};
    for (const [sceneKey, volume] of Object.entries(rawVolumeOverrides)) {
      if (typeof volume !== "number" || !Number.isFinite(volume)) {
        continue;
      }
      sceneBgmVolumeOverrides[sceneKey] = Math.max(0, Math.min(1, volume));
    }

    const rawAmbientOverrides = (item.sceneAmbientOverrides as Record<string, unknown>) ?? {};
    const sceneAmbientOverrides: Record<string, string[]> = {};
    for (const [sceneKey, value] of Object.entries(rawAmbientOverrides)) {
      if (!Array.isArray(value)) {
        continue;
      }
      sceneAmbientOverrides[sceneKey] = value.filter((entry): entry is string => typeof entry === "string");
    }

    output[actId] = {
      actId,
      overworldBgmKey,
      combatBgmKey,
      ambientLoopKeys,
      sceneBgmOverrides,
      sceneBgmLayerOverrides,
      sceneBgmVolumeOverrides,
      sceneAmbientOverrides,
      eventAudioOverrides,
    };
  }

  return output;
}

function normalizeStringMap(raw: unknown): Record<string, string> {
  const input = (raw as Record<string, unknown>) ?? {};
  const output: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string" || !value.trim()) {
      continue;
    }
    output[key] = value;
  }

  return output;
}

function normalizeStringArrayMap(raw: unknown): Record<string, string[]> {
  const input = (raw as Record<string, unknown>) ?? {};
  const output: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const normalized = value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
    if (normalized.length === 0) {
      continue;
    }

    output[key] = normalized;
  }

  return output;
}

const parsedCatalog = normalizeAudioCatalog(parseJson<unknown>(audioCatalogRaw, "audio-catalog.json", {}));
const parsedScenes = normalizeSceneProfiles(parseJson<unknown>(sceneAudioRaw, "scene-audio.json", {}));
const parsedActs = normalizeActProfiles(parseJson<unknown>(actAudioRaw, "act-audio.json", {}));
const parsedUI = normalizeStringMap(parseJson<unknown>(uiAudioRaw, "ui-audio.json", {})) as UIAudioProfile;
const parsedActions = normalizeStringMap(parseJson<unknown>(actionAudioRaw, "action-audio.json", {})) as ActionAudioProfile;
const parsedEvents = normalizeStringMap(parseJson<unknown>(eventAudioRaw, "event-audio.json", {})) as EventAudioProfile;

export const AUDIO_CATALOG: AudioCatalog = parsedCatalog;
export const SCENE_AUDIO_PROFILES: Record<string, SceneAudioProfile> = parsedScenes;
export const ACT_AUDIO_PROFILES: Record<number, ActAudioProfile> = parsedActs;
export const UI_AUDIO_PROFILE: UIAudioProfile = parsedUI;
export const ACTION_AUDIO_PROFILE: ActionAudioProfile = parsedActions;
export const EVENT_AUDIO_PROFILE: EventAudioProfile = parsedEvents;

export function validateAudioProfiles(): string[] {
  const issues: string[] = [];
  const assetKeys = new Set(AUDIO_CATALOG.assets.map((asset) => asset.key));

  for (const [sceneKey, profile] of Object.entries(SCENE_AUDIO_PROFILES)) {
    if (!assetKeys.has(profile.bgmKey)) {
      issues.push(`Scene profile '${sceneKey}' references missing bgm key '${profile.bgmKey}'.`);
    }

    if (profile.bgmLayerKeys) {
      for (const layerKey of profile.bgmLayerKeys) {
        if (!assetKeys.has(layerKey)) {
          issues.push(`Scene profile '${sceneKey}' references missing bgm layer key '${layerKey}'.`);
        }
      }
    }

    for (const ambientKey of profile.ambientLoopKeys) {
      if (!assetKeys.has(ambientKey)) {
        issues.push(`Scene profile '${sceneKey}' references missing ambient key '${ambientKey}'.`);
      }
    }
  }

  for (const [actId, profile] of Object.entries(ACT_AUDIO_PROFILES)) {
    if (!assetKeys.has(profile.overworldBgmKey)) {
      issues.push(`Act profile '${actId}' references missing overworld bgm key '${profile.overworldBgmKey}'.`);
    }
    if (!assetKeys.has(profile.combatBgmKey)) {
      issues.push(`Act profile '${actId}' references missing combat bgm key '${profile.combatBgmKey}'.`);
    }
    for (const ambientKey of profile.ambientLoopKeys) {
      if (!assetKeys.has(ambientKey)) {
        issues.push(`Act profile '${actId}' references missing ambient key '${ambientKey}'.`);
      }
    }

    if (profile.sceneBgmOverrides) {
      for (const [sceneKey, key] of Object.entries(profile.sceneBgmOverrides)) {
        if (!assetKeys.has(key)) {
          issues.push(`Act profile '${actId}' scene bgm override '${sceneKey}' references missing key '${key}'.`);
        }
      }
    }

    if (profile.sceneBgmLayerOverrides) {
      for (const [sceneKey, keys] of Object.entries(profile.sceneBgmLayerOverrides)) {
        for (const key of keys) {
          if (!assetKeys.has(key)) {
            issues.push(`Act profile '${actId}' scene bgm layer override '${sceneKey}' references missing key '${key}'.`);
          }
        }
      }
    }

    if (profile.sceneAmbientOverrides) {
      for (const [sceneKey, keys] of Object.entries(profile.sceneAmbientOverrides)) {
        for (const key of keys) {
          if (!assetKeys.has(key)) {
            issues.push(`Act profile '${actId}' scene ambient override '${sceneKey}' references missing key '${key}'.`);
          }
        }
      }
    }

    if (profile.eventAudioOverrides) {
      for (const [eventName, key] of Object.entries(profile.eventAudioOverrides)) {
        if (!assetKeys.has(key)) {
          issues.push(`Act profile '${actId}' event override '${eventName}' references missing key '${key}'.`);
        }
      }
    }
  }

  for (const [action, key] of Object.entries(UI_AUDIO_PROFILE)) {
    if (!key) {
      continue;
    }
    if (!assetKeys.has(key)) {
      issues.push(`UI profile action '${action}' references missing key '${key}'.`);
    }
  }

  for (const [action, key] of Object.entries(ACTION_AUDIO_PROFILE)) {
    if (!key) {
      continue;
    }
    if (!assetKeys.has(key)) {
      issues.push(`Action profile action '${action}' references missing key '${key}'.`);
    }
  }

  for (const [eventName, key] of Object.entries(EVENT_AUDIO_PROFILE)) {
    if (!assetKeys.has(key)) {
      issues.push(`Event profile '${eventName}' references missing key '${key}'.`);
    }
  }

  return issues;
}
