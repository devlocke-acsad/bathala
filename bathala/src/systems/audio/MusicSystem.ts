/**
 * Compatibility alias.
 *
 * Use AudioSystem for new code.
 */

export {
  AudioSystem as MusicSystem,
} from "./AudioSystem";

export type {
  AudioAsset,
  SceneMusicLayerConfig,
  SceneMusicConfig,
  SoundConfig,
} from "./AudioSystem";
