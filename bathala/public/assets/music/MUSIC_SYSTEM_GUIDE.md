# Bathala Audio Asset Guide (Current System)

## Source of truth

Audio behavior is data-driven. Always edit these files instead of hardcoding scene audio:

- `src/data/audio/audio-catalog.json`
- `src/data/audio/scene-audio.json`
- `src/data/audio/act-audio.json`
- `src/data/audio/event-audio.json`
- `src/data/audio/ui-audio.json`
- `src/data/audio/action-audio.json`

Runtime systems:

- `src/systems/audio/AudioProfiles.ts`
- `src/systems/audio/AudioSystem.ts`
- `src/systems/audio/MusicLifecycleSystem.ts`

## Asset folders

Use this layout under `public/assets`:

```text
music/
  bgm/
    shared/
    menu/
    combat/
    social/

sfx/
  ambient/
  combat/
  items/
  player/
  ui/
```

Notes:

- Keep BGM in `music/bgm/*` only.
- Keep ambience loops in `sfx/ambient`.
- Do not use ad-hoc folders like `Scraps`.

## Catalog rules

In `audio-catalog.json` every entry must have:

- `key`: stable ID used by profiles
- `path`: relative to `public/assets/` root (for example `music/bgm/menu/main_menu.mp3`)
- `type`: `music` or `sfx`
- `channel`: `music`, `ambient`, `sfx`, `ui`, `voice`, or `master`
- `baseVolume`: 0..1
- `loop`: true for BGM and ambient loops
- `tags`: searchable labels

## Scene and act mapping

- `scene-audio.json` defines baseline music and ambient per scene.
- `act-audio.json` applies chapter overrides:
  - `sceneBgmOverrides`
  - `sceneBgmVolumeOverrides`
  - `sceneAmbientOverrides`
  - `eventAudioOverrides`

This allows chapter-specific cutscene, overworld, combat, and event sound behavior.

## Continuity behavior

`MusicLifecycleSystem` keeps music/ambient persistent across scene transitions.

- If next scene resolves to the same BGM key, playback continues.
- Ambient loops are diffed by key; unchanged loops continue.
- Transition and cutscene scenes can be pinned to target act/chapter.

## Adding a new track

1. Place file in the correct folder under `public/assets/music/bgm/...`.
2. Add or update key in `audio-catalog.json`.
3. Reference key in scene/act/event profile JSON.
4. Run validation by launching the game (Boot logs profile issues) or run a key integrity check script.

## Current normalized BGM files

- `music/bgm/shared/placeholder.mp3`
- `music/bgm/menu/main_menu.mp3`
- `music/bgm/combat/battle_theme_1.mp3`
- `music/bgm/social/npc_interaction.mp3`
