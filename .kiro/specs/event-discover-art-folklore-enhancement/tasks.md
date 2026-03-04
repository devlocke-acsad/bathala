# Implementation Plan: Event Visual Enhancement - Integrating Discover Art

## Overview

This implementation plan breaks down the event visual enhancement into discrete coding tasks. The feature integrates creature "Discover" almanac art into creature-based events to replace placeholder graphics with high-quality artwork. The implementation follows 6 phases: core infrastructure, interface extension, EventScene modifications, asset preloading, existing event updates, and testing/validation.

## Tasks

- [ ] 1. Create CreatureArtMapper utility infrastructure
  - [ ] 1.1 Create CreatureArtMapper utility class
    - Create `src/utils/CreatureArtMapper.ts` file
    - Implement `CreatureArtMapping` interface with creatureId, artKey, chapter, and assetPath fields
    - Implement `CreatureArtMapper` class with static methods
    - Implement `initialize()` method to auto-generate mappings from creature database
    - Implement mapping cache using `Map<string, CreatureArtMapping>`
    - _Requirements: 1.2, 6.1, 6.2_
  
  - [ ] 1.2 Implement creature ID resolution methods
    - Implement `resolveArtKey(creatureId: string): string | null` method
    - Implement `getBaseCreatureId(creatureId: string): string` to strip variant suffixes
    - Implement variant resolution logic (e.g., "tikbalang_scout" → "tikbalang_almanac")
    - Handle null/undefined inputs gracefully
    - _Requirements: 1.1, 1.3, 2.2_
  
  - [ ] 1.3 Implement validation and query methods
    - Implement `validateCreatureId(creatureId: string): boolean` method
    - Implement `getMappingsByChapter(chapter: 1 | 2 | 3): CreatureArtMapping[]` method
    - Implement `createCreatureEvent()` helper function for event creation
    - Add error logging for invalid creature IDs
    - _Requirements: 2.3, 2.4, 6.4, 7.1_
  
  - [ ]* 1.4 Write unit tests for CreatureArtMapper
    - Test `initialize()` populates mappings correctly for all 30 creatures
    - Test `resolveArtKey()` returns correct keys for known creatures
    - Test `resolveArtKey()` returns null for unknown creatures
    - Test `getBaseCreatureId()` strips variant suffixes correctly
    - Test `validateCreatureId()` identifies valid/invalid IDs
    - Test `getMappingsByChapter()` returns correct chapter-specific mappings
    - _Requirements: 7.1, 7.2_

- [ ] 2. Extend GameEvent interface and types
  - [ ] 2.1 Add creatureId field to GameEvent interface
    - Modify `src/data/events/EventTypes.ts` (or equivalent)
    - Add optional `creatureId?: string | string[]` field to GameEvent interface
    - Add JSDoc comments explaining usage and examples
    - Ensure TypeScript compilation succeeds
    - _Requirements: 2.1, 2.5_
  
  - [ ]* 2.2 Write property test for interface extension
    - **Property 8: Backward Compatibility**
    - **Validates: Requirements 4.3, 7.5**
    - Test that existing events without creatureId still function correctly
    - Generate events with and without creatureId field
    - Verify no runtime errors for events missing creatureId

- [ ] 3. Modify EventScene for artwork resolution
  - [ ] 3.1 Implement artwork resolution logic
    - Modify `src/game/scenes/Event.ts` (or equivalent EventScene file)
    - Implement `resolveEventArtwork(): string | null` method
    - Implement priority order: creatureId → imageKey → fallback
    - Handle array of creatureIds by using first valid ID
    - Add console warnings for invalid creatureId references
    - _Requirements: 1.1, 2.2, 2.4_
  
  - [ ] 3.2 Modify createIllustration method
    - Update `createIllustration()` to support both image and graphics display
    - Add texture existence check: `this.textures.exists(artKey)`
    - Create Phaser Image object for almanac art with proper sizing (300x200)
    - Add border and styling to match game aesthetic
    - Maintain fallback to placeholder graphics for missing assets
    - _Requirements: 1.1, 1.5, 5.1, 5.2_
  
  - [ ] 3.3 Implement UI improvements for artwork display
    - Ensure text remains readable and well-positioned with artwork
    - Maintain consistent visual layout between events with/without artwork
    - Ensure artwork doesn't obscure UI elements (choices, text, buttons)
    - Add visual polish (borders, frames, shadows)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 3.4 Implement error handling for asset loading
    - Add try-catch blocks around image creation
    - Implement `createFallbackIllustration()` method
    - Log warnings for missing textures with event ID context
    - Ensure game continues without crashes on asset errors
    - _Requirements: 1.5, 2.4, 7.4_
  
  - [ ]* 3.5 Write property test for artwork resolution
    - **Property 4: Artwork Resolution Hierarchy**
    - **Validates: Requirements 2.2, 2.4**
    - Test that artwork resolution follows correct priority order
    - Generate events with various combinations of creatureId/imageKey
    - Verify correct artwork selected for each combination
  
  - [ ]* 3.6 Write property test for creature ID resolution
    - **Property 1: Creature ID Resolution**
    - **Validates: Requirements 1.1, 2.2, 4.2**
    - Test that valid creature IDs resolve to correct almanac art
    - Generate events with all valid creature IDs from database
    - Verify corresponding Discover_Art is displayed
  
  - [ ]* 3.7 Write property test for error handling
    - **Property 2: Graceful Error Handling**
    - **Validates: Requirements 1.5, 2.4, 7.4**
    - Test that invalid creatureIds don't crash the system
    - Generate events with invalid/missing creature IDs
    - Verify fallback artwork displayed and warnings logged
  
  - [ ]* 3.8 Write unit tests for EventScene modifications
    - Test `resolveEventArtwork()` with various event configurations
    - Test `createIllustration()` with valid and missing textures
    - Test error logging behavior for invalid references
    - Test backward compatibility with existing events
    - Test UI layout with and without artwork

- [ ] 4. Checkpoint - Verify core infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Modify Preloader for asset management
  - [ ] 5.1 Implement Discover art preloading
    - Modify `src/game/scenes/Preloader.ts` (or equivalent)
    - Implement `preloadDiscoverArt()` method
    - Use `CreatureArtMapper.getMappingsByChapter()` to get asset lists
    - Load chapter-specific almanac art based on current act
    - _Requirements: 3.1, 3.2, 3.3, 6.4_
  
  - [ ] 5.2 Implement chapter-based asset management
    - Implement `unloadPreviousChapterAssets(chapter: number)` method
    - Implement `loadNewChapterAssets(chapter: number)` method
    - Use Phaser's texture manager for memory cleanup
    - Add loading progress indicators for Discover art
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [ ]* 5.3 Write unit tests for Preloader modifications
    - Test that all almanac assets preloaded for current chapter
    - Test asset keys match CreatureArtMapper expectations
    - Test loading progress events emitted

- [ ] 6. Update existing Act 1 events with creature associations
  - [ ] 6.1 Identify events that reference creatures
    - Review all Act 1 events in `src/data/events/Act1Events.ts`
    - Identify events that explicitly mention creature names in narratives
    - Document which creatures are referenced in each event
    - _Requirements: 4.1, 4.4_
  
  - [ ] 6.2 Update tikbalang-related event
    - Add `creatureId: "tikbalang_scout"` field to tikbalang event
    - Verify event narrative mentions tikbalang
    - Test event displays tikbalang almanac art
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.3 Update kapre-related event
    - Add `creatureId: "kapre_shade"` field to kapre event
    - Verify event narrative mentions kapre
    - Test event displays kapre almanac art
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.4 Update tiyanak-related event
    - Add `creatureId: "tiyanak_ambusher"` field to tiyanak event
    - Verify event narrative mentions tiyanak
    - Test event displays tiyanak almanac art
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.5 Update balete-related event
    - Add `creatureId: "balete_wraith"` field to balete event
    - Verify event narrative mentions balete
    - Test event displays balete almanac art
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.6 Update diwata-related event (if exists)
    - Add `creatureId: "diwata_sentinel"` field to diwata event
    - Verify event narrative mentions diwata
    - Test event displays diwata almanac art
    - _Requirements: 4.2, 4.5_
  
  - [ ] 6.7 Update any other creature-related events
    - Review remaining events for creature references
    - Add appropriate creatureId fields
    - Test all updated events display correct artwork
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [ ]* 6.8 Write property test for variant resolution
    - **Property 5: Variant Resolution**
    - **Validates: Requirements 1.3**
    - Test that creature variants resolve to base creature art
    - Generate events with variant creature IDs
    - Verify base creature almanac art is displayed
  
  - [ ]* 6.9 Write integration tests for updated events
    - Test each updated event loads and displays correctly
    - Test event choices produce expected outcomes
    - Test backward compatibility maintained

- [ ] 7. Checkpoint - Verify existing event updates
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Write comprehensive property-based tests
  - [ ]* 8.1 Write property test for complete creature mapping
    - **Property 3: Complete Creature Mapping**
    - **Validates: Requirements 1.2, 6.1, 6.3, 6.4**
    - Test that all creatures in database resolve to valid almanac art keys
    - Verify naming convention: `{base_creature_name}_almanac`
    - Test across all three chapters
  
  - [ ]* 8.2 Write property test for creature ID validation
    - **Property 6: Creature ID Validation**
    - **Validates: Requirements 2.3, 7.1, 7.3**
    - Test that Event_System validates creature IDs against database
    - Generate valid and invalid creature IDs
    - Verify appropriate warnings for invalid IDs
  
  - [ ]* 8.3 Write property test for multiple creature support
    - **Property 7: Multiple Creature Support**
    - **Validates: Requirements 2.5**
    - Test events with array of creatureIds
    - Verify first valid ID used for artwork
    - Verify all IDs validated

- [ ] 9. Write integration tests for end-to-end flows
  - [ ]* 9.1 Write integration test for event flow with creature art
    - Test complete flow: start game → trigger event with creatureId → verify almanac art → make choice → verify outcome
    - Test with multiple different creature-based events
    - _Requirements: 1.1, 2.2_
  
  - [ ]* 9.2 Write integration test for asset loading flow
    - Test: initialize game → verify chapter 1 assets loaded → transition to Act 2 → verify chapter 1 unloaded and chapter 2 loaded
    - _Requirements: 3.1, 3.3, 3.4_
  
  - [ ]* 9.3 Write integration test for error recovery
    - Test: create event with invalid creatureId → verify warning logged → verify fallback artwork → verify game continues
    - _Requirements: 1.5, 2.4, 7.4_

- [ ] 10. Validate event data and structure
  - [ ]* 10.1 Write unit tests for event data validation
    - Test all events have valid structure (id, name, description, choices, dayEvent)
    - Test all creatureId references are valid
    - Test all imageKey references exist or fallback works
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ] 10.2 Verify backward compatibility
    - Test all existing events without creatureId still work
    - Verify no breaking changes to event system
    - Test events with imageKey still use custom artwork
    - _Requirements: 4.3, 7.5_

- [ ] 11. Initialize CreatureArtMapper in game startup
  - [ ] 11.1 Add mapper initialization to game bootstrap
    - Locate game initialization code (likely in main.ts or Game.ts)
    - Call `CreatureArtMapper.initialize()` during startup
    - Add error handling for initialization failures
    - Verify mappings populated before first event
    - _Requirements: 1.2, 6.1, 6.2_

- [ ] 12. Final integration and polish
  - [ ] 12.1 Test all events in-game
    - Manually trigger each event through gameplay or test mode
    - Verify correct artwork displays for each event
    - Verify all choices work correctly
    - Verify visual consistency across all events
    - _Requirements: 4.3, 5.4_
  
  - [ ] 12.2 Verify UI polish and layout
    - Test artwork positioning and sizing looks good
    - Test text remains readable with artwork present
    - Verify visual styling (borders, frames, shadows) looks polished
    - Test on different screen resolutions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 12.3 Performance and memory testing
    - Test asset loading time is under 2 seconds
    - Test memory usage increase is under 50MB
    - Test smooth transitions without loading delays
    - Test on lower-end devices if possible
    - _Requirements: 3.1, 3.2_

- [ ] 13. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check library with minimum 100 iterations
- All property tests tagged with format: `Feature: event-discover-art-folklore-enhancement, Property {N}: {title}`
- Checkpoints ensure incremental validation at key milestones
- The design uses TypeScript, so all implementation should use TypeScript syntax
- CreatureArtMapper should be initialized early to avoid circular dependencies
- Focus is on visual enhancement only - no new event content creation
- All existing events must remain functional and backward compatible
