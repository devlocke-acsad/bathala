export { AudioSystem } from "./AudioSystem";
export type {
  AudioAsset,
  SceneMusicLayerConfig,
  SceneMusicConfig,
  SoundConfig,
} from "./AudioSystem";

export { MusicSystem } from "./MusicSystem";
export { MusicLifecycleSystem } from "./MusicLifecycleSystem";

export {
  AUDIO_CATALOG,
  ACTION_AUDIO_PROFILE,
  ACT_AUDIO_PROFILES,
  EVENT_AUDIO_PROFILE,
  SCENE_AUDIO_PROFILES,
  UI_AUDIO_PROFILE,
  validateAudioProfiles,
} from "./AudioBindingRegistry";

export type {
  AudioCatalog,
  AudioCatalogAsset,
  AudioChannel,
  SceneAudioProfile,
  ActAudioProfile,
  UIAudioProfile,
  ActionAudioProfile,
  EventAudioProfile,
} from "./AudioBindingRegistry";
