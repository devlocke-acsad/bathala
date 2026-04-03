/**
 * Compatibility shim.
 *
 * Profile data now comes from JSON files in src/data/audio through AudioProfiles.
 */

export {
  AUDIO_CATALOG,
  SCENE_AUDIO_PROFILES,
  ACT_AUDIO_PROFILES,
  UI_AUDIO_PROFILE,
  ACTION_AUDIO_PROFILE,
  EVENT_AUDIO_PROFILE,
  validateAudioProfiles,
} from "./AudioProfiles";

export type {
  AudioCatalog,
  AudioCatalogAsset,
  AudioChannel,
  SceneAudioProfile,
  ActAudioProfile,
  UIAudioProfile,
  ActionAudioProfile,
  EventAudioProfile,
} from "./AudioProfiles";
