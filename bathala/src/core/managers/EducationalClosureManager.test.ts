import { EducationalClosureManager, EducationalClosure, GameplayConsequence } from './EducationalClosureManager';
import { MiniGameFactory } from './MiniGameFactory';
import { MiniGameResult } from './MiniGameManager';
import { 
  FilipinoValue, 
  RegionalOrigin 
} from '../../data/events/EventTypes';

describe('EducationalClosureManager', () => {
  let closureManager: EducationalClosureManager;

  beforeEach(() => {
    closureManager = EducationalClosureManager.getInstance();
    closureManager.resetProgress();
  });

  describe('Educational Closure Creation', () => {
    test('should create complete educational closure for successful riddle game', () => {
      const riddleMechanic = MiniGameFactory.createRiddleGame(
        'forest wisdom',
        FilipinoValue.MALASAKIT,
        RegionalOrigin.LUZON_TAGALOG
      );

      const successResult: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['riddle_solving', 'cultural_wisdom'],
        feedback: 'Excellent understanding of traditional wisdom!'
      };

      const closure = closureManager.createEducationalClosure(
        riddleMechanic,
        successResult,
        FilipinoValue.MALASAKIT,
        RegionalOrigin.LUZON_TAGALOG
      );

      expect(closure.culturalSignificanceExplanation).toContain('malasakit');
      expect(closure.culturalSignificanceExplanation).toContain('luzon_tagalog');
      expect(closure.culturalSignificanceExplanation).toContain('riddle');
      expect(closure.moralLessonConnection).toContain('malasakit');
      expect(closure.contemporaryRelevance).toContain('today');
      expect(closure.objectivesCompleted.length).toBeGreaterThan(0);
      expect(closure.knowledgeGained.length).toBeGreaterThan(0);
      expect(closure.valuesReinforced).toContain(FilipinoValue.MALASAKIT);
      expect(closure.nextLearningOpportunities.length).toBeGreaterThan(0);
    });

    test('should create educational closure for failed mini-game with learning value', () => {
      const patternMechanic = MiniGameFactory.createPatternMatchingGame(
        'traditional weaving',
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.VISAYAS_CEBUANO
      );

      const failureResult: MiniGameResult = {
        success: false,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['cultural_exposure'],
        feedback: 'You learned about traditional patterns despite the challenge.'
      };

      const closure = closureManager.createEducationalClosure(
        patternMechanic,
        failureResult,
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.VISAYAS_CEBUANO
      );

      expect(closure.culturalSignificanceExplanation).toContain('difficult');
      expect(closure.culturalSignificanceExplanation).toContain('cultural insight');
      expect(closure.moralLessonConnection).toContain('bayanihan');
      expect(closure.contemporaryRelevance).toContain('modern');
      expect(closure.knowledgeGained.length).toBeGreaterThan(0);
      expect(closure.valuesReinforced).toContain(FilipinoValue.BAYANIHAN);
    });

    test('should provide different explanations for different game types', () => {
      const gameTypes = [
        { type: 'riddle', theme: 'nature wisdom' },
        { type: 'pattern_matching', theme: 'traditional designs' },
        { type: 'memory_game', theme: 'creation story' },
        { type: 'traditional_game', theme: 'Sungka' },
        { type: 'moral_choice_tree', theme: 'helping neighbor' }
      ];

      const closures = gameTypes.map(({ type, theme }) => {
        let mechanic;
        switch (type) {
          case 'riddle':
            mechanic = MiniGameFactory.createRiddleGame(theme, FilipinoValue.MALASAKIT, RegionalOrigin.LUZON_TAGALOG);
            break;
          case 'pattern_matching':
            mechanic = MiniGameFactory.createPatternMatchingGame(theme, FilipinoValue.BAYANIHAN, RegionalOrigin.VISAYAS_CEBUANO);
            break;
          case 'memory_game':
            mechanic = MiniGameFactory.createMemoryGame(theme, FilipinoValue.KAPAMILYA, RegionalOrigin.MINDANAO_MARANAO);
            break;
          case 'traditional_game':
            mechanic = MiniGameFactory.createTraditionalGame(theme, FilipinoValue.PAKIKIPAGKAPWA, RegionalOrigin.CORDILLERA);
            break;
          case 'moral_choice_tree':
            mechanic = MiniGameFactory.createMoralChoiceTree(theme, FilipinoValue.BAYANIHAN, RegionalOrigin.PALAWAN);
            break;
          default:
            throw new Error(`Unknown type: ${type}`);
        }

        const result: MiniGameResult = {
          success: true,
          culturalLessonLearned: true,
          educationalObjectivesMet: ['test_objective'],
          feedback: 'Test feedback'
        };

        return closureManager.createEducationalClosure(
          mechanic,
          result,
          mechanic.gameType === 'riddle' ? FilipinoValue.MALASAKIT : 
          mechanic.gameType === 'pattern_matching' ? FilipinoValue.BAYANIHAN :
          mechanic.gameType === 'memory_game' ? FilipinoValue.KAPAMILYA :
          mechanic.gameType === 'traditional_game' ? FilipinoValue.PAKIKIPAGKAPWA :
          FilipinoValue.BAYANIHAN,
          RegionalOrigin.LUZON_TAGALOG
        );
      });

      // Each closure should have unique content based on game type
      const explanations = closures.map(c => c.culturalSignificanceExplanation);
      const uniqueExplanations = new Set(explanations);
      expect(uniqueExplanations.size).toBe(explanations.length);

      // All should contain game-type specific content
      expect(explanations[0]).toContain('riddle'); // riddle game
      expect(explanations[1]).toContain('pattern'); // pattern matching
      expect(explanations[2]).toContain('stories'); // memory game (uses plural)
      expect(explanations[3]).toContain('game'); // traditional game
      expect(explanations[4]).toContain('decision'); // moral choice
    });
  });

  describe('Educational Objective Tracking', () => {
    test('should track completed objectives', () => {
      const mechanic = MiniGameFactory.createRiddleGame(
        'ancestral wisdom',
        FilipinoValue.UTANG_NA_LOOB,
        RegionalOrigin.LUZON_ILOCANO
      );

      const result: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['riddle_solving', 'cultural_wisdom'],
        feedback: 'Great job!'
      };

      const initialObjectives = closureManager.getCompletedObjectives();
      expect(initialObjectives.length).toBe(0);

      closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.UTANG_NA_LOOB,
        RegionalOrigin.LUZON_ILOCANO
      );

      const completedObjectives = closureManager.getCompletedObjectives();
      expect(completedObjectives.length).toBeGreaterThan(0);
      expect(completedObjectives.some(obj => obj.completed)).toBe(true);
      expect(completedObjectives.some(obj => obj.filipinoValue === FilipinoValue.UTANG_NA_LOOB)).toBe(true);
    });

    test('should track knowledge gained', () => {
      const mechanic = MiniGameFactory.createMemoryGame(
        'creation myth',
        FilipinoValue.KAPAMILYA,
        RegionalOrigin.MINDANAO_MARANAO
      );

      const result: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['memory_skills'],
        feedback: 'Excellent memory!'
      };

      const initialKnowledge = closureManager.getPlayerKnowledgeBase();
      expect(initialKnowledge.length).toBe(0);

      closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.KAPAMILYA,
        RegionalOrigin.MINDANAO_MARANAO
      );

      const knowledgeBase = closureManager.getPlayerKnowledgeBase();
      expect(knowledgeBase.length).toBeGreaterThan(0);
      expect(knowledgeBase.some(item => item.includes('kapamilya'))).toBe(true);
      expect(knowledgeBase.some(item => item.includes('mindanao_maranao'))).toBe(true);
    });
  });

  describe('Cultural Explanations', () => {
    test('should provide cultural explanation for Sungka', () => {
      const explanation = closureManager.getCulturalExplanation('sungka');

      expect(explanation).toBeDefined();
      expect(explanation!.gameName).toBe('Sungka');
      expect(explanation!.historicalContext).toContain('counting game');
      expect(explanation!.culturalSignificance).toContain('mathematical');
      expect(explanation!.modernRelevance).toContain('resource management');
      expect(explanation!.relatedValues.length).toBeGreaterThan(0);
      expect(explanation!.regionalVariations.length).toBeGreaterThan(0);
      expect(explanation!.educationalBenefits.length).toBeGreaterThan(0);
    });

    test('should provide cultural explanation for Patintero', () => {
      const explanation = closureManager.getCulturalExplanation('patintero');

      expect(explanation).toBeDefined();
      expect(explanation!.gameName).toBe('Patintero');
      expect(explanation!.culturalSignificance).toContain('bayanihan');
      expect(explanation!.modernRelevance).toContain('collaboration');
      expect(explanation!.relatedValues).toContain(FilipinoValue.BAYANIHAN);
    });

    test('should return null for unknown games', () => {
      const explanation = closureManager.getCulturalExplanation('unknown_game');
      expect(explanation).toBeNull();
    });
  });

  describe('Gameplay Consequence Integration', () => {
    test('should create appropriate consequences for successful mini-game', () => {
      const mechanic = MiniGameFactory.createTraditionalGame(
        'Patintero',
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.LUZON_TAGALOG
      );

      const result: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['teamwork', 'traditional_games'],
        feedback: 'Excellent teamwork!'
      };

      const closure = closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.LUZON_TAGALOG
      );

      const consequences = closureManager.integrateGameplayConsequences(mechanic, result, closure);

      expect(consequences.length).toBeGreaterThan(0);
      
      const immediateConsequence = consequences.find(c => c.type === 'immediate');
      expect(immediateConsequence).toBeDefined();
      expect(immediateConsequence!.gameStateChanges.health).toBeGreaterThan(0);
      expect(immediateConsequence!.gameStateChanges.ginto).toBeGreaterThan(0);
      expect(immediateConsequence!.educationalImpact).toContain('values');

      const longTermConsequence = consequences.find(c => c.type === 'long_term');
      expect(longTermConsequence).toBeDefined();
      expect(longTermConsequence!.educationalImpact).toContain('cultural competency');

      const narrativeConsequence = consequences.find(c => c.type === 'narrative');
      expect(narrativeConsequence).toBeDefined();
      expect(narrativeConsequence!.educationalImpact).toContain('continuity');
    });

    test('should create different consequences for failed mini-game', () => {
      const mechanic = MiniGameFactory.createRiddleGame(
        'nature wisdom',
        FilipinoValue.MALASAKIT,
        RegionalOrigin.VISAYAS_HILIGAYNON
      );

      const result: MiniGameResult = {
        success: false,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['cultural_exposure'],
        feedback: 'You learned despite the challenge.'
      };

      const closure = closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.MALASAKIT,
        RegionalOrigin.VISAYAS_HILIGAYNON
      );

      const consequences = closureManager.integrateGameplayConsequences(mechanic, result, closure);

      const immediateConsequence = consequences.find(c => c.type === 'immediate');
      expect(immediateConsequence).toBeDefined();
      expect(immediateConsequence!.gameStateChanges.health).toBeLessThan(15); // Less reward than success
      expect(immediateConsequence!.gameStateChanges.ginto).toBeLessThan(20); // Less reward than success
      expect(immediateConsequence!.educationalImpact).toContain('awareness');
    });
  });

  describe('Educational Closure Validation', () => {
    test('should validate complete educational closure', () => {
      const mechanic = MiniGameFactory.createMoralChoiceTree(
        'helping community',
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.CORDILLERA
      );

      const result: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['moral_reasoning'],
        feedback: 'Wise choices!'
      };

      const closure = closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.CORDILLERA
      );

      const validation = closureManager.validateEducationalClosure(closure);

      expect(validation.isComplete).toBe(true);
      expect(validation.missingElements).toHaveLength(0);
    });

    test('should identify missing elements in incomplete closure', () => {
      const incompleteClosure: EducationalClosure = {
        culturalSignificanceExplanation: 'Short', // Too brief
        moralLessonConnection: '', // Missing
        contemporaryRelevance: 'This is a proper explanation of contemporary relevance',
        objectivesCompleted: [], // Empty
        knowledgeGained: ['Some knowledge'],
        valuesReinforced: [FilipinoValue.MALASAKIT],
        nextLearningOpportunities: ['Learn more']
      };

      const validation = closureManager.validateEducationalClosure(incompleteClosure);

      expect(validation.isComplete).toBe(false);
      expect(validation.missingElements).toContain('Cultural significance explanation is too brief or missing');
      expect(validation.missingElements).toContain('Moral lesson connection is too brief or missing');
      expect(validation.missingElements).toContain('No educational objectives completed');
    });
  });

  describe('Progress Management', () => {
    test('should reset progress correctly', () => {
      // Add some progress
      const mechanic = MiniGameFactory.createRiddleGame(
        'test theme',
        FilipinoValue.KAPAMILYA,
        RegionalOrigin.LUZON_TAGALOG
      );

      const result: MiniGameResult = {
        success: true,
        culturalLessonLearned: true,
        educationalObjectivesMet: ['test'],
        feedback: 'Test'
      };

      closureManager.createEducationalClosure(
        mechanic,
        result,
        FilipinoValue.KAPAMILYA,
        RegionalOrigin.LUZON_TAGALOG
      );

      expect(closureManager.getCompletedObjectives().length).toBeGreaterThan(0);
      expect(closureManager.getPlayerKnowledgeBase().length).toBeGreaterThan(0);

      // Reset progress
      closureManager.resetProgress();

      expect(closureManager.getCompletedObjectives().length).toBe(0);
      expect(closureManager.getPlayerKnowledgeBase().length).toBe(0);
    });
  });
});