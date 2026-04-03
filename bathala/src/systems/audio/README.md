# Audio Systems Scaffold

This folder contains the dedicated audio stack for runtime music/SFX handling.

## Files

- `AudioSystem.ts`
  - Central runtime audio service (loading, volume, mute, helper playback methods).
  - New code should use `AudioSystem`.

- `MusicSystem.ts`
  - Compatibility alias: `MusicSystem` -> `AudioSystem`.
  - Keeps existing call sites stable while migration is in progress.

- `MusicLifecycleSystem.ts`
  - Scene music lifecycle helper (start/pause/resume/shutdown).

- `AudioBindingRegistry.ts`
  - Compatibility export surface for profile data.

- `AudioProfiles.ts`
  - JSON loader + normalization + validation logic.
  - Source files are under `src/data/audio/*.json`.

## Non-dev editable bindings

Edit these JSON files (no TypeScript edits required):

- `src/data/audio/audio-catalog.json` (what audio assets exist)
- `src/data/audio/scene-audio.json` (scene routing)
- `src/data/audio/act-audio.json` (chapter overrides)
- `src/data/audio/ui-audio.json` (UI interaction sounds)
- `src/data/audio/action-audio.json` (gameplay/action sounds)
- `src/data/audio/event-audio.json` (semantic event -> sound key)

## Semantic Event API

Use semantic events instead of raw keys in scene logic:

- `ui.button.press`
- `ui.button.hover`
- `player.step`
- `combat.attack.light`
- `combat.attack.special`
- `item.consume`

Runtime entry point: `AudioSystem.triggerEvent(scene, eventName, config?)`.

## Validation

Boot scene runs `AudioSystem.validateProfiles(true)` so missing references are
warned early.

## Migration note

`systems/shared/MusicSystem.ts`, `systems/shared/MusicLifecycleSystem.ts`, and
`core/managers/MusicManager.ts` are compatibility shims that re-export from this folder.
