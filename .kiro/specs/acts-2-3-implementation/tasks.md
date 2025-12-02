# Implementation Plan: Acts 2 & 3

- [x] 1. Set up data structure and type definitions





  - Create chapter-related type definitions in CombatTypes.ts
  - Add chapter tracking to GameState interface
  - Define ChapterTheme interface for visual system
  - _Requirements: 5.3, 6.2, 7.1_

- [x] 2. Implement Act 2 enemy data (The Submerged Barangays)




  - [x] 2.1 Create Act2Enemies.ts file with all enemy definitions


    - Define 7 common enemies with simplified attack patterns (2-4 actions)
    - Define 2 elite enemies with moderate patterns (3-5 actions)
    - Define boss enemy (Bakunawa) with complex pattern (5-6 actions)
    - Include all dialogue (introduction, defeat, spare, slay) for each enemy
    - Add elemental affinities (Tubig/Apoy focus)
    - Include lore source citations as comments
    - _Requirements: 1.3, 3.1, 6.2, 6.5, 8.1, 8.2_

  - [ ]* 2.2 Write property test for Act 2 enemy data integrity
    - **Property 2: Enemy data integrity**
    - **Validates: Requirements 6.2, 6.4**

  - [ ]* 2.3 Write property test for Act 2 attack pattern simplicity
    - **Property 3: Attack pattern simplicity**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 2.4 Write property test for Act 2 HP scaling
    - **Property 6: HP scaling consistency**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ]* 2.5 Write property test for Act 2 dialogue completeness
    - **Property 8: Dialogue completeness**
    - **Validates: Requirements 1.3**

  - [ ]* 2.6 Write property test for Act 2 elemental affinity validity
    - **Property 9: Elemental affinity validity**
    - **Validates: Requirements 6.2**

- [x] 3. Implement Act 3 enemy data (The Skyward Citadel)




  - [x] 3.1 Create Act3Enemies.ts file with all enemy definitions


    - Define 7 common enemies with simplified attack patterns (2-4 actions)
    - Define 2 elite enemies with moderate patterns (3-5 actions)
    - Define boss enemy (False Bathala) with complex pattern (5-6 actions)
    - Include all dialogue for each enemy
    - Add elemental affinities (multi-element focus)
    - Include lore source citations as comments
    - _Requirements: 2.3, 3.1, 6.2, 6.5, 8.4, 8.5, 8.6_

  - [ ]* 3.2 Write property test for Act 3 enemy data integrity
    - **Property 2: Enemy data integrity**
    - **Validates: Requirements 6.2, 6.4**

  - [ ]* 3.3 Write property test for Act 3 attack pattern simplicity
    - **Property 3: Attack pattern simplicity**
    - **Validates: Requirements 3.1, 3.2**

  - [ ]* 3.4 Write property test for Act 3 HP scaling
    - **Property 6: HP scaling consistency**
    - **Validates: Requirements 8.4, 8.5, 8.6**

  - [ ]* 3.5 Write property test for Act 3 dialogue completeness
    - **Property 8: Dialogue completeness**
    - **Validates: Requirements 2.3**

  - [ ]* 3.6 Write property test for Act 3 elemental affinity validity
    - **Property 9: Elemental affinity validity**
    - **Validates: Requirements 2.5**

- [x] 4. Implement Act 2 relics and potions





  - [x] 4.1 Create Act2Relics.ts with 10 chapter-specific relics


    - Define relic data structures following Act1Relics.ts pattern
    - Include lore inspiration citations
    - Categorize relics (common, elite, boss, treasure)
    - Add helper functions (getRandomCommonRelic, etc.)
    - _Requirements: 4.1, 4.4, 6.3_

  - [x] 4.2 Create Act2Potions.ts with 10 chapter-specific potions


    - Define potion data structures following Act1Potions.ts pattern
    - Include lore inspiration citations
    - Add effect definitions for Tubig/Apoy synergies
    - _Requirements: 4.3, 4.4, 6.3_

  - [ ]* 4.3 Write property test for Act 2 relic chapter association
    - **Property 5: Relic and potion chapter association**
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 4.4 Write unit tests for Act 2 relic effects
    - Test each relic's trigger conditions
    - Test effect application in combat scenarios
    - _Requirements: 4.5_

- [x] 5. Implement Act 3 relics and potions





  - [x] 5.1 Create Act3Relics.ts with 10 chapter-specific relics


    - Define relic data structures with multi-element synergies
    - Include lore inspiration citations
    - Categorize relics appropriately
    - Add helper functions
    - _Requirements: 4.2, 4.4, 6.3_

  - [x] 5.2 Create Act3Potions.ts with 10 chapter-specific potions


    - Define potion data structures with multi-element effects
    - Include lore inspiration citations
    - Add effect definitions
    - _Requirements: 4.3, 4.4, 6.3_

  - [ ]* 5.3 Write property test for Act 3 relic chapter association
    - **Property 5: Relic and potion chapter association**
    - **Validates: Requirements 4.2, 4.4**

  - [ ]* 5.4 Write unit tests for Act 3 relic effects
    - Test each relic's trigger conditions
    - Test effect application in combat scenarios
    - _Requirements: 4.5_

- [x] 6. Implement visual theme system




  - [x] 6.1 Create VisualThemeManager.ts


    - Define CHAPTER_THEMES configuration object
    - Implement applyChapterTheme(chapterNumber) method
    - Implement removeChapterTheme() method
    - Add overlay rendering logic using Phaser tint/filters
    - _Requirements: 1.2, 2.2, 7.2, 7.3, 7.4_

  - [ ]* 6.2 Write property test for visual theme application
    - **Property 4: Visual theme application**
    - **Validates: Requirements 1.2, 2.2, 7.2, 7.3**

  - [ ]* 6.3 Write unit tests for theme manager
    - Test theme configuration retrieval
    - Test overlay color and alpha values
    - Test theme transitions
    - _Requirements: 7.4, 7.5_

- [x] 7. Implement chapter progression system





  - [x] 7.1 Modify GameState.ts to track chapter progression


    - Add currentChapter property
    - Add unlockedChapters Set
    - Add chapterCompletions Map
    - Implement unlockChapter(chapterNumber) method
    - Implement setCurrentChapter(chapterNumber) method
    - Add chapter unlock validation logic
    - _Requirements: 1.1, 2.1, 5.3_

  - [ ]* 7.2 Write property test for chapter progression monotonicity
    - **Property 1: Chapter progression is monotonic**
    - **Validates: Requirements 1.1, 2.1**

  - [ ]* 7.3 Write unit tests for chapter progression
    - Test chapter unlocking logic
    - Test chapter transition validation
    - Test completion tracking
    - _Requirements: 1.1, 1.4, 2.1, 2.4_

- [x] 8. Implement dev mode chapter navigation





  - [x] 8.1 Modify CombatDebugScene.ts to add chapter navigation buttons


    - Add "Jump to Chapter 1" button
    - Add "Jump to Chapter 2" button
    - Add "Jump to Chapter 3" button
    - Implement chapter transition handlers
    - Position buttons in debug UI layout
    - _Requirements: 5.1, 5.2, 5.4_

  - [ ]* 8.2 Write property test for dev mode chapter navigation
    - **Property 7: Dev mode chapter navigation**
    - **Validates: Requirements 5.2, 5.3**

  - [ ]* 8.3 Write unit tests for dev mode navigation
    - Test button click handlers
    - Test state initialization for each chapter
    - Test UI visibility toggling
    - _Requirements: 5.4, 5.5_

- [x] 9. Integrate chapter system with combat




  - [x] 9.1 Modify Combat.ts to load chapter-specific enemies


    - Add chapter detection logic
    - Import Act2Enemies and Act3Enemies
    - Update enemy selection to use chapter-appropriate pools
    - Apply visual theme on combat scene creation
    - _Requirements: 1.2, 1.3, 2.2, 2.3, 3.4_

  - [x] 9.2 Update RelicManager to handle chapter-specific relics


    - Import Act2Relics and Act3Relics
    - Update relic acquisition logic to use chapter-appropriate pools
    - Ensure relic effects work across all chapters
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 9.3 Update potion system to handle chapter-specific potions


    - Import Act2Potions and Act3Potions
    - Update potion drop logic to use chapter-appropriate pools
    - Ensure potion effects work correctly
    - _Requirements: 4.3_

  - [ ]* 9.4 Write integration tests for chapter-specific combat
    - Test Act 2 combat flow with water-themed enemies
    - Test Act 3 combat flow with celestial enemies
    - Test relic effects in chapter contexts
    - Test potion effects in chapter contexts
    - _Requirements: 1.3, 2.3, 4.5_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Add chapter transition logic to game flow
  - [ ] 11.1 Update Map.ts or Overworld.ts for chapter progression
    - Add chapter completion detection
    - Trigger chapter unlock on boss defeat
    - Apply visual theme when entering new chapter
    - _Requirements: 1.1, 1.4, 2.1, 2.4, 7.4_

  - [ ] 11.2 Add epilogue trigger for Act 3 completion
    - Detect False Bathala defeat
    - Trigger epilogue sequence
    - _Requirements: 2.4_

  - [ ]* 11.3 Write integration tests for chapter transitions
    - Test Act 1 → Act 2 transition
    - Test Act 2 → Act 3 transition
    - Test visual theme updates during transitions
    - _Requirements: 1.1, 1.4, 2.1, 2.4_

- [ ] 12. Polish and documentation
  - [ ] 12.1 Add code comments and documentation
    - Document enemy lore sources
    - Document relic and potion mechanics
    - Add JSDoc comments to new functions
    - _Requirements: 6.5_

  - [ ] 12.2 Update game documentation
    - Add Act 2 and Act 3 content to player manual
    - Document dev mode chapter navigation
    - Update technical documentation
    - _Requirements: 5.1_

- [ ] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
