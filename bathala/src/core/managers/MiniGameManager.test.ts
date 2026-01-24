import { MiniGameManager, GameReward, GameConsequence } from './MiniGameManager';
import { MiniGameFactory } from './MiniGameFactory';
import { 
  MiniGameMechanic, 
  FilipinoValue, 
  RegionalOrigin,
  EventContext 
} from '../../data/events/EventTypes';
import { Player } from '../types/CombatTypes';

describe('MiniGameManager', () => {
  let miniGameManager: MiniGameManager;
  let mockPlayer: Player;
  let mockContext: EventContext;

  beforeEach(() => {
    miniGameManager = MiniGameManager.getInstance();
    miniGameManager.resetProgress();
    
    mockPlayer = {
      id: 'test-player',
      name: 'Test Player',
      maxHealth: 100,
      currentHealth: 80,
      block: 0,
      statusEffects: [],
      hand: [],
      deck: [],
      discardPile: [],
      drawPile: [],
      playedHand: [],
      landasScore: 0,
      ginto: 50,
      diamante: 10,
      relics: [],
      potions: [],
      discardCharges: 3,
      maxDiscardCharges: 3
    };

    mockContext = {
      player: mockPlayer
    };
  });

  describe('Mini-Game Execution', () => {
    test('should execute riddle game successfully', () => {
      const riddleMechanic = MiniGameFactory.createRiddleGame(
        'nature wisdom',
        FilipinoValue.MALASAKIT,
        RegionalOrigin.LUZON_TAGALOG
      );

      const result = miniGameManager.executeMiniGame(riddleMechanic, mockContext, 'correct answer');

      expect(result.culturalLessonLearned).toBe(true);
      expect(result.educationalObjectivesMet).toContain('cultural_wisdom');
      expect(result.feedback).toContain('nature wisdom');
    });

    test('should execute pattern matching game successfully', () => {
      const patternMechanic = MiniGameFactory.createPatternMatchingGame(
        'traditional weaving',
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.VISAYAS_CEBUANO
      );

      const result = miniGameManager.executeMiniGame(patternMechanic, mockContext, ['pattern1', 'pattern2']);

      expect(result.culturalLessonLearned).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.educationalObjectivesMet).toContain('cultural_symbolism');
    });

    test('should execute memory game successfully', () => {
      const memoryMechanic = MiniGameFactory.createMemoryGame(
        'creation myth',
        FilipinoValue.KAPAMILYA,
        RegionalOrigin.MINDANAO_MARANAO
      );

      const result = miniGameManager.executeMiniGame(memoryMechanic, mockContext, ['event1', 'event2', 'event3']);

      expect(result.culturalLessonLearned).toBe(true);
      expect(result.score).toBeGreaterThan(0);
      expect(result.educationalObjectivesMet).toContain('cultural_retention');
    });

    test('should execute traditional game successfully', () => {
      const traditionalMechanic = MiniGameFactory.createTraditionalGame(
        'Sungka',
        FilipinoValue.PAKIKIPAGKAPWA,
        RegionalOrigin.LUZON_ILOCANO
      );

      const result = miniGameManager.executeMiniGame(traditionalMechanic, mockContext, ['move1', 'move2']);

      expect(result.culturalLessonLearned).toBe(true);
      expect(result.educationalObjectivesMet).toContain('traditional_games');
      expect(result.educationalObjectivesMet).toContain('community_values');
    });

    test('should execute moral choice tree successfully', () => {
      const moralMechanic = MiniGameFactory.createMoralChoiceTree(
        'helping neighbor',
        FilipinoValue.BAYANIHAN,
        RegionalOrigin.CORDILLERA
      );

      const result = miniGameManager.executeMiniGame(moralMechanic, mockContext, ['choice1', 'choice2']);

      expect(result.culturalLessonLearned).toBe(true);
      expect(result.educationalObjectivesMet).toContain('moral_reasoning');
      expect(result.educationalObjectivesMet).toContain('filipino_values');
    });
  });

  describe('Reward and Consequence Application', () => {
    test('should apply health reward correctly', () => {
      const healthReward: GameReward = {
        type: 'health',
        value: 20,
        description: 'Healed by cultural wisdom',
        culturalSignificance: 'Understanding brings strength'
      };

      const initialHealth = mockPlayer.currentHealth;
      miniGameManager.applyReward(healthReward, mockPlayer);

      expect(mockPlayer.currentHealth).toBe(initialHealth + 20);
    });

    test('should apply ginto reward correctly', () => {
      const gintoReward: GameReward = {
        type: 'ginto',
        value: 30,
        description: 'Rewarded with gold',
        culturalSignificance: 'Cultural knowledge has value'
      };

      const initialGinto = mockPlayer.ginto;
      miniGameManager.applyReward(gintoReward, mockPlayer);

      expect(mockPlayer.ginto).toBe(initialGinto + 30);
    });

    test('should apply health consequence correctly', () => {
      const healthConsequence: GameConsequence = {
        type: 'health_loss',
        value: 10,
        description: 'Weakened by cultural ignorance',
        culturalLesson: 'Knowledge protects us'
      };

      const initialHealth = mockPlayer.currentHealth;
      miniGameManager.applyConsequence(healthConsequence, mockPlayer);

      expect(mockPlayer.currentHealth).toBe(initialHealth - 10);
      expect(mockPlayer.currentHealth).toBeGreaterThan(0); // Should not go below 1
    });

    test('should not reduce health below 1', () => {
      mockPlayer.currentHealth = 5;
      const severeConsequence: GameConsequence = {
        type: 'health_loss',
        value: 10,
        description: 'Severe consequence',
        culturalLesson: 'Learn from mistakes'
      };

      miniGameManager.applyConsequence(severeConsequence, mockPlayer);

      expect(mockPlayer.currentHealth).toBe(1);
    });
  });

  describe('Cultural Connection Validation', () => {
    test('should validate proper cultural connection', () => {
      const validMechanic = MiniGameFactory.createRiddleGame(
        'forest spirits',
        FilipinoValue.MALASAKIT,
        RegionalOrigin.LUZON_TAGALOG
      );

      const isValid = miniGameManager.validateCulturalConnection(validMechanic);

      expect(isValid).toBe(true);
    });

    test('should reject mechanic with insufficient cultural connection', () => {
      const invalidMechanic: MiniGameMechanic = {
        gameType: 'riddle',
        instructions: 'Solve',
        culturalConnection: 'Short',
        successReward: {
          type: 'ginto',
          value: 10,
          description: 'Reward'
        }
      };

      const isValid = miniGameManager.validateCulturalConnection(invalidMechanic);

      expect(isValid).toBe(false);
    });
  });

  describe('Traditional Game Mechanics', () => {
    test('should provide traditional game mechanics database', () => {
      const traditionalGames = miniGameManager.getTraditionalGameMechanics();

      expect(traditionalGames.length).toBeGreaterThan(0);
      expect(traditionalGames[0]).toHaveProperty('gameName');
      expect(traditionalGames[0]).toHaveProperty('culturalOrigin');
      expect(traditionalGames[0]).toHaveProperty('rules');
      expect(traditionalGames[0]).toHaveProperty('educationalValue');
      expect(traditionalGames[0]).toHaveProperty('modernRelevance');
    });

    test('should include Sungka in traditional games', () => {
      const traditionalGames = miniGameManager.getTraditionalGameMechanics();
      const sungka = traditionalGames.find(game => game.gameName === 'Sungka');

      expect(sungka).toBeDefined();
      expect(sungka?.culturalOrigin).toContain('Philippines');
      expect(sungka?.rules.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Progress Tracking', () => {
    test('should track mini-game completion', () => {
      miniGameManager.markMiniGameCompleted('riddle-1', FilipinoValue.MALASAKIT);
      miniGameManager.markMiniGameCompleted('pattern-1', FilipinoValue.BAYANIHAN);

      const stats = miniGameManager.getMiniGameStatistics();

      expect(stats.totalCompleted).toBe(2);
      expect(stats.culturalKnowledgeByValue.get(FilipinoValue.MALASAKIT)).toBe(1);
      expect(stats.culturalKnowledgeByValue.get(FilipinoValue.BAYANIHAN)).toBe(1);
    });

    test('should reset progress correctly', () => {
      miniGameManager.markMiniGameCompleted('test-game', FilipinoValue.KAPAMILYA);
      
      let stats = miniGameManager.getMiniGameStatistics();
      expect(stats.totalCompleted).toBe(1);

      miniGameManager.resetProgress();
      
      stats = miniGameManager.getMiniGameStatistics();
      expect(stats.totalCompleted).toBe(0);
    });
  });
});

describe('MiniGameFactory', () => {
  describe('Cultural Relevance Validation', () => {
    test('should validate culturally relevant riddle game', () => {
      const riddleGame = MiniGameFactory.createRiddleGame(
        'ancestral wisdom',
        FilipinoValue.UTANG_NA_LOOB,
        RegionalOrigin.VISAYAS_HILIGAYNON
      );

      const validation = MiniGameFactory.validateCulturalRelevance(riddleGame);

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test('should identify issues with insufficient cultural connection', () => {
      const invalidMechanic: MiniGameMechanic = {
        gameType: 'riddle',
        instructions: 'Short',
        culturalConnection: 'Brief',
        successReward: {
          type: 'ginto',
          value: 10,
          description: 'Reward'
        }
      };

      const validation = MiniGameFactory.validateCulturalRelevance(invalidMechanic);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Cultural connection is too brief or missing');
      expect(validation.issues).toContain('Instructions are too brief or missing');
    });

    test('should require cultural significance in rewards', () => {
      const mechanicWithoutSignificance: MiniGameMechanic = {
        gameType: 'pattern_matching',
        instructions: 'Match the patterns to understand their meaning',
        culturalConnection: 'These patterns represent traditional Filipino designs that have been passed down through generations',
        successReward: {
          type: 'ginto',
          value: 25,
          description: 'Rewarded for pattern recognition'
          // Missing culturalSignificance
        }
      };

      const validation = MiniGameFactory.validateCulturalRelevance(mechanicWithoutSignificance);

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Success reward lacks cultural significance explanation');
    });
  });

  describe('Game Type Creation', () => {
    test('should create different types of mini-games', () => {
      const riddle = MiniGameFactory.createRiddleGame('nature', FilipinoValue.MALASAKIT, RegionalOrigin.LUZON_TAGALOG);
      const pattern = MiniGameFactory.createPatternMatchingGame('weaving', FilipinoValue.BAYANIHAN, RegionalOrigin.VISAYAS_CEBUANO);
      const memory = MiniGameFactory.createMemoryGame('legend', FilipinoValue.KAPAMILYA, RegionalOrigin.MINDANAO_MARANAO);
      const traditional = MiniGameFactory.createTraditionalGame('Patintero', FilipinoValue.PAKIKIPAGKAPWA, RegionalOrigin.CORDILLERA);
      const moral = MiniGameFactory.createMoralChoiceTree('community help', FilipinoValue.BAYANIHAN, RegionalOrigin.PALAWAN);

      expect(riddle.gameType).toBe('riddle');
      expect(pattern.gameType).toBe('pattern_matching');
      expect(memory.gameType).toBe('memory_game');
      expect(traditional.gameType).toBe('traditional_game');
      expect(moral.gameType).toBe('moral_choice_tree');

      // All should have proper cultural connections
      expect(riddle.culturalConnection.length).toBeGreaterThan(20);
      expect(pattern.culturalConnection.length).toBeGreaterThan(20);
      expect(memory.culturalConnection.length).toBeGreaterThan(20);
      expect(traditional.culturalConnection.length).toBeGreaterThan(20);
      expect(moral.culturalConnection.length).toBeGreaterThan(20);
    });
  });

  describe('Reward and Consequence Creation', () => {
    test('should create culturally appropriate rewards', () => {
      const reward = MiniGameFactory.createCulturalReward(
        'cultural_knowledge',
        15,
        'traditional storytelling',
        FilipinoValue.KAPAMILYA
      );

      expect(reward.type).toBe('cultural_knowledge');
      expect(reward.value).toBe(15);
      expect(reward.description).toContain('traditional storytelling');
      expect(reward.culturalSignificance).toContain(FilipinoValue.KAPAMILYA);
    });

    test('should create culturally appropriate consequences', () => {
      const consequence = MiniGameFactory.createCulturalConsequence(
        'missed_opportunity',
        8,
        'ancestral wisdom',
        FilipinoValue.UTANG_NA_LOOB
      );

      expect(consequence.type).toBe('missed_opportunity');
      expect(consequence.value).toBe(8);
      expect(consequence.description).toContain('ancestral wisdom');
      expect(consequence.culturalLesson).toContain(FilipinoValue.UTANG_NA_LOOB);
    });
  });
});