import * as fc from 'fast-check';
import { MiniGameFactory } from './MiniGameFactory';
import { 
  MiniGameMechanic, 
  FilipinoValue, 
  RegionalOrigin 
} from '../../data/events/EventTypes';

/**
 * **Feature: educational-events-system, Property 5: Mini-game cultural relevance**
 * 
 * Property-based test for mini-game cultural relevance
 * Validates: Requirements 3.1, 3.4
 * 
 * For any event with mini-game mechanics, the game must have clear connections 
 * to the cultural lesson and include cultural explanations
 */
describe('Property-Based Test: Mini-game Cultural Relevance', () => {
  
  // Generators for property-based testing
  const filipinoValueArb = fc.constantFrom(...Object.values(FilipinoValue));
  const regionalOriginArb = fc.constantFrom(...Object.values(RegionalOrigin));
  const gameTypeArb = fc.constantFrom('riddle', 'pattern_matching', 'memory_game', 'traditional_game', 'moral_choice_tree');
  const culturalThemeArb = fc.string({ minLength: 5, maxLength: 50 });
  const culturalSymbolArb = fc.string({ minLength: 3, maxLength: 30 });
  const culturalStoryArb = fc.string({ minLength: 5, maxLength: 40 });
  const gameNameArb = fc.string({ minLength: 3, maxLength: 25 });
  const moralDilemmaArb = fc.string({ minLength: 10, maxLength: 60 });

  test('Property 5: All mini-games must have clear cultural connections', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        culturalThemeArb,
        (filipinoValue, regionalOrigin, culturalTheme) => {
          // Create a riddle game with the generated parameters
          const riddleGame = MiniGameFactory.createRiddleGame(
            culturalTheme,
            filipinoValue,
            regionalOrigin
          );

          // Validate cultural relevance
          const validation = MiniGameFactory.validateCulturalRelevance(riddleGame);

          // Property: All generated mini-games must have valid cultural connections
          expect(validation.isValid).toBe(true);
          expect(validation.issues).toHaveLength(0);

          // Cultural connection must be substantial
          expect(riddleGame.culturalConnection.length).toBeGreaterThan(20);
          
          // Cultural connection must reference the Filipino value
          expect(riddleGame.culturalConnection.toLowerCase()).toContain(filipinoValue.toLowerCase());
          
          // Cultural connection must reference the regional origin
          expect(riddleGame.culturalConnection.toLowerCase()).toContain(regionalOrigin.toLowerCase());
          
          // Instructions must be clear and educational
          expect(riddleGame.instructions.length).toBeGreaterThan(10);
          
          // Success reward must have cultural significance
          expect(riddleGame.successReward.culturalSignificance).toBeDefined();
          expect(riddleGame.successReward.culturalSignificance!.length).toBeGreaterThan(10);
          
          // If there's a failure consequence, it must have a cultural lesson
          if (riddleGame.failureConsequence) {
            expect(riddleGame.failureConsequence.culturalLesson).toBeDefined();
            expect(riddleGame.failureConsequence.culturalLesson!.length).toBeGreaterThan(10);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Pattern matching games must connect patterns to cultural meaning', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        culturalSymbolArb,
        (filipinoValue, regionalOrigin, culturalSymbol) => {
          const patternGame = MiniGameFactory.createPatternMatchingGame(
            culturalSymbol,
            filipinoValue,
            regionalOrigin
          );

          // Pattern games must explain the cultural meaning of patterns
          expect(patternGame.culturalConnection).toContain('pattern');
          expect(patternGame.culturalConnection).toContain(culturalSymbol);
          expect(patternGame.culturalConnection).toContain('culture');
          
          // Must reference Filipino heritage or tradition
          const connection = patternGame.culturalConnection.toLowerCase();
          expect(
            connection.includes('filipino') || 
            connection.includes('traditional') || 
            connection.includes('heritage') ||
            connection.includes('ancestral')
          ).toBe(true);

          // Validation must pass
          const validation = MiniGameFactory.validateCulturalRelevance(patternGame);
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Memory games must preserve cultural stories', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        culturalStoryArb,
        (filipinoValue, regionalOrigin, culturalStory) => {
          const memoryGame = MiniGameFactory.createMemoryGame(
            culturalStory,
            filipinoValue,
            regionalOrigin
          );

          // Memory games must emphasize story preservation
          const connection = memoryGame.culturalConnection.toLowerCase();
          expect(
            connection.includes('story') || 
            connection.includes('tradition') || 
            connection.includes('memory') ||
            connection.includes('preserve')
          ).toBe(true);

          // Must reference the specific story
          expect(memoryGame.culturalConnection).toContain(culturalStory);
          
          // Must connect to oral tradition or cultural preservation
          expect(
            connection.includes('oral') || 
            connection.includes('generation') || 
            connection.includes('ancestor')
          ).toBe(true);

          // Validation must pass
          const validation = MiniGameFactory.validateCulturalRelevance(memoryGame);
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Traditional games must explain community values', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        gameNameArb,
        (filipinoValue, regionalOrigin, gameName) => {
          const traditionalGame = MiniGameFactory.createTraditionalGame(
            gameName,
            filipinoValue,
            regionalOrigin
          );

          // Traditional games must emphasize community and values
          const connection = traditionalGame.culturalConnection.toLowerCase();
          expect(
            connection.includes('community') || 
            connection.includes('value') || 
            connection.includes('skill') ||
            connection.includes('teach')
          ).toBe(true);

          // Must reference the game name
          expect(traditionalGame.culturalConnection).toContain(gameName);
          
          // Must explain educational purpose
          expect(
            connection.includes('develop') || 
            connection.includes('learn') || 
            connection.includes('tool')
          ).toBe(true);

          // Validation must pass
          const validation = MiniGameFactory.validateCulturalRelevance(traditionalGame);
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Moral choice trees must guide with Filipino values', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        moralDilemmaArb,
        (filipinoValue, regionalOrigin, moralDilemma) => {
          const moralGame = MiniGameFactory.createMoralChoiceTree(
            moralDilemma,
            filipinoValue,
            regionalOrigin
          );

          // Moral games must emphasize values and ethics
          const connection = moralGame.culturalConnection.toLowerCase();
          expect(
            connection.includes('moral') || 
            connection.includes('value') || 
            connection.includes('ethical') ||
            connection.includes('decision')
          ).toBe(true);

          // Must reference the specific Filipino value
          expect(moralGame.culturalConnection).toContain(filipinoValue);
          
          // Must reference the moral dilemma
          expect(moralGame.culturalConnection).toContain(moralDilemma);
          
          // Must emphasize guidance or wisdom
          expect(
            connection.includes('guide') || 
            connection.includes('wisdom') || 
            connection.includes('compassion')
          ).toBe(true);

          // Validation must pass
          const validation = MiniGameFactory.validateCulturalRelevance(moralGame);
          expect(validation.isValid).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: All mini-game types must include cultural explanations', () => {
    fc.assert(
      fc.property(
        gameTypeArb,
        filipinoValueArb,
        regionalOriginArb,
        fc.string({ minLength: 5, maxLength: 50 }),
        (gameType, filipinoValue, regionalOrigin, culturalContext) => {
          let miniGame: MiniGameMechanic;

          // Create appropriate mini-game based on type
          switch (gameType) {
            case 'riddle':
              miniGame = MiniGameFactory.createRiddleGame(culturalContext, filipinoValue, regionalOrigin);
              break;
            case 'pattern_matching':
              miniGame = MiniGameFactory.createPatternMatchingGame(culturalContext, filipinoValue, regionalOrigin);
              break;
            case 'memory_game':
              miniGame = MiniGameFactory.createMemoryGame(culturalContext, filipinoValue, regionalOrigin);
              break;
            case 'traditional_game':
              miniGame = MiniGameFactory.createTraditionalGame(culturalContext, filipinoValue, regionalOrigin);
              break;
            case 'moral_choice_tree':
              miniGame = MiniGameFactory.createMoralChoiceTree(culturalContext, filipinoValue, regionalOrigin);
              break;
            default:
              throw new Error(`Unknown game type: ${gameType}`);
          }

          // Universal properties that must hold for all mini-game types
          
          // 1. Must have substantial cultural connection
          expect(miniGame.culturalConnection.length).toBeGreaterThan(20);
          
          // 2. Must reference Filipino culture or values
          const connection = miniGame.culturalConnection.toLowerCase();
          expect(
            connection.includes('filipino') || 
            connection.includes(filipinoValue.toLowerCase()) ||
            connection.includes('culture') ||
            connection.includes('traditional')
          ).toBe(true);
          
          // 3. Must have clear instructions
          expect(miniGame.instructions.length).toBeGreaterThan(10);
          
          // 4. Must have culturally significant rewards
          expect(miniGame.successReward.culturalSignificance).toBeDefined();
          expect(miniGame.successReward.culturalSignificance!.length).toBeGreaterThan(5);
          
          // 5. Must pass cultural relevance validation
          const validation = MiniGameFactory.validateCulturalRelevance(miniGame);
          expect(validation.isValid).toBe(true);
          expect(validation.issues).toHaveLength(0);
          
          // 6. Game type must be valid
          expect(['riddle', 'pattern_matching', 'memory_game', 'traditional_game', 'moral_choice_tree'])
            .toContain(miniGame.gameType);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Cultural connections must be educational and respectful', () => {
    fc.assert(
      fc.property(
        filipinoValueArb,
        regionalOriginArb,
        fc.string({ minLength: 5, maxLength: 40 }),
        (filipinoValue, regionalOrigin, culturalElement) => {
          // Test with riddle game as representative example
          const miniGame = MiniGameFactory.createRiddleGame(
            culturalElement,
            filipinoValue,
            regionalOrigin
          );

          const connection = miniGame.culturalConnection;
          
          // Must be educational (contains learning-related words)
          const educationalWords = ['teach', 'learn', 'wisdom', 'understand', 'knowledge', 'lesson'];
          const hasEducationalContent = educationalWords.some(word => 
            connection.toLowerCase().includes(word)
          );
          expect(hasEducationalContent).toBe(true);
          
          // Must be respectful (no negative or dismissive language)
          const disrespectfulWords = ['primitive', 'backward', 'superstition', 'silly', 'stupid'];
          const hasDisrespectfulContent = disrespectfulWords.some(word => 
            connection.toLowerCase().includes(word)
          );
          expect(hasDisrespectfulContent).toBe(false);
          
          // Must acknowledge cultural value (positive framing)
          const respectfulWords = ['heritage', 'tradition', 'wisdom', 'ancestor', 'culture', 'value'];
          const hasRespectfulContent = respectfulWords.some(word => 
            connection.toLowerCase().includes(word)
          );
          expect(hasRespectfulContent).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});