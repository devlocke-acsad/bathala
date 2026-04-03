/**
 * Compatibility shim.
 *
 * Music management was moved to systems/audio to align with the systems-first
 * architecture. Existing imports from core/managers/MusicManager remain valid.
 */

export {
  MusicSystem as MusicManager,
} from "../../systems/audio/MusicSystem";

export type {
  AudioAsset,
  SceneMusicLayerConfig,
  SceneMusicConfig,
  SoundConfig,
} from "../../systems/audio/MusicSystem";
