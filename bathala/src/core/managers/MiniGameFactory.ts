import { 
  MiniGameMechanic, 
  GameReward, 
  GameConsequence,
  FilipinoValue,
  RegionalOrigin 
} from '../../data/events/EventTypes';

/**
 * Mini-Game Factory
 * 
 * Creates culturally relevant mini-games with proper educational connections
 */
export class MiniGameFactory {
  
  /**
   * Create a riddle-based mini-game (Filipino bugtong)
   */
  public static createRiddleGame(
    culturalTheme: string,
    filipinoValue: FilipinoValue,
    region: RegionalOrigin
  ): MiniGameMechanic {
    const culturalConnection = this.getCulturalConnectionForRiddle(culturalTheme, filipinoValue, region);
    
    return {
      gameType: 'riddle',
      instructions: 'Solve this traditional Filipino riddle (bugtong) to gain wisdom from our ancestors.',
      culturalConnection,
      successReward: {
        type: 'cultural_knowledge',
        value: 10,
        description: 'Gained wisdom from traditional Filipino riddles',
        culturalSignificance: `Understanding of ${filipinoValue} through ancestral wisdom`
      },
      failureConsequence: {
        type: 'missed_opportunity',
        value: 5,
        description: 'Missed opportunity to learn traditional wisdom',
        culturalLesson: 'Traditional riddles teach us to think creatively and appreciate our heritage'
      }
    };
  }

  /**
   * Create a pattern matching mini-game
   */
  public static createPatternMatchingGame(
    culturalSymbol: string,
    filipinoValue: FilipinoValue,
    region: RegionalOrigin
  ): MiniGameMechanic {
    const culturalConnection = this.getCulturalConnectionForPattern(culturalSymbol, filipinoValue, region);
    
    return {
      gameType: 'pattern_matching',
      instructions: 'Match the traditional patterns to understand their cultural significance.',
      culturalConnection,
      successReward: {
        type: 'ginto',
        value: 25,
        description: 'Rewarded for understanding cultural patterns',
        culturalSignificance: `Recognition of ${culturalSymbol} patterns in Filipino culture`
      },
      failureConsequence: {
        type: 'missed_opportunity',
        value: 3,
        description: 'Missed cultural pattern recognition',
        culturalLesson: 'Traditional patterns carry deep meaning in Filipino culture'
      }
    };
  }

  /**
   * Create a memory-based mini-game
   */
  public static createMemoryGame(
    culturalStory: string,
    filipinoValue: FilipinoValue,
    region: RegionalOrigin
  ): MiniGameMechanic {
    const culturalConnection = this.getCulturalConnectionForMemory(culturalStory, filipinoValue, region);
    
    return {
      gameType: 'memory_game',
      instructions: 'Remember the sequence of events in this traditional story.',
      culturalConnection,
      successReward: {
        type: 'health',
        value: 15,
        description: 'Strengthened by remembering ancestral stories',
        culturalSignificance: `Preservation of ${culturalStory} through memory`
      },
      failureConsequence: {
        type: 'health_loss',
        value: 5,
        description: 'Weakened by forgetting cultural heritage',
        culturalLesson: 'Our stories must be remembered to keep our culture alive'
      }
    };
  }

  /**
   * Create a traditional game mini-game
   */
  public static createTraditionalGame(
    gameName: string,
    filipinoValue: FilipinoValue,
    region: RegionalOrigin
  ): MiniGameMechanic {
    const culturalConnection = this.getCulturalConnectionForTraditionalGame(gameName, filipinoValue, region);
    
    return {
      gameType: 'traditional_game',
      instructions: `Play this traditional Filipino game: ${gameName}`,
      culturalConnection,
      successReward: {
        type: 'diamante',
        value: 5,
        description: 'Honored for preserving traditional games',
        culturalSignificance: `Mastery of ${gameName} demonstrates cultural connection`
      },
      failureConsequence: {
        type: 'ginto_loss',
        value: 10,
        description: 'Lost focus during traditional game',
        culturalLesson: `${gameName} teaches patience and community values`
      }
    };
  }

  /**
   * Create a moral choice tree mini-game
   */
  public static createMoralChoiceTree(
    moralDilemma: string,
    filipinoValue: FilipinoValue,
    region: RegionalOrigin
  ): MiniGameMechanic {
    const culturalConnection = this.getCulturalConnectionForMoralChoice(moralDilemma, filipinoValue, region);
    
    return {
      gameType: 'moral_choice_tree',
      instructions: 'Navigate this moral dilemma using Filipino values as your guide.',
      culturalConnection,
      successReward: {
        type: 'cultural_knowledge',
        value: 20,
        description: 'Gained moral wisdom through Filipino values',
        culturalSignificance: `Demonstrated understanding of ${filipinoValue}`
      },
      failureConsequence: {
        type: 'missed_opportunity',
        value: 10,
        description: 'Missed opportunity to apply Filipino values',
        culturalLesson: `${filipinoValue} guides us in making ethical decisions`
      }
    };
  }

  /**
   * Validate that a mini-game has proper cultural relevance
   */
  public static validateCulturalRelevance(mechanic: MiniGameMechanic): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check cultural connection
    if (!mechanic.culturalConnection || mechanic.culturalConnection.length < 20) {
      issues.push('Cultural connection is too brief or missing');
    }

    // Check instructions clarity
    if (!mechanic.instructions || mechanic.instructions.length < 10) {
      issues.push('Instructions are too brief or missing');
    }

    // Check reward cultural significance
    if (mechanic.successReward && !mechanic.successReward.culturalSignificance) {
      issues.push('Success reward lacks cultural significance explanation');
    }

    // Check consequence cultural lesson
    if (mechanic.failureConsequence && !mechanic.failureConsequence.culturalLesson) {
      issues.push('Failure consequence lacks cultural lesson');
    }

    // Check game type appropriateness
    const validGameTypes = ['riddle', 'pattern_matching', 'memory_game', 'traditional_game', 'moral_choice_tree'];
    if (!validGameTypes.includes(mechanic.gameType)) {
      issues.push(`Invalid game type: ${mechanic.gameType}`);
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  // Private helper methods for cultural connections

  private static getCulturalConnectionForRiddle(
    theme: string, 
    value: FilipinoValue, 
    region: RegionalOrigin
  ): string {
    return `This riddle from ${region} teaches us about ${theme} and reflects the Filipino value of ${value}. Traditional riddles (bugtong) were used to pass down wisdom and test understanding of our culture.`;
  }

  private static getCulturalConnectionForPattern(
    symbol: string, 
    value: FilipinoValue, 
    region: RegionalOrigin
  ): string {
    return `The ${symbol} pattern from ${region} represents ${value} in Filipino culture. These traditional designs carry deep meaning and connect us to our ancestral heritage.`;
  }

  private static getCulturalConnectionForMemory(
    story: string, 
    value: FilipinoValue, 
    region: RegionalOrigin
  ): string {
    return `This story of ${story} from ${region} teaches us about ${value}. Oral tradition was how our ancestors preserved important cultural lessons for future generations.`;
  }

  private static getCulturalConnectionForTraditionalGame(
    game: string, 
    value: FilipinoValue, 
    region: RegionalOrigin
  ): string {
    return `${game} is a traditional game from ${region} that develops ${value}. These games were not just entertainment but tools for teaching important life skills and community values.`;
  }

  private static getCulturalConnectionForMoralChoice(
    dilemma: string, 
    value: FilipinoValue, 
    region: RegionalOrigin
  ): string {
    return `This moral dilemma about ${dilemma} reflects situations common in ${region} where ${value} guides our decisions. Filipino values help us navigate complex ethical situations with wisdom and compassion.`;
  }

  /**
   * Create a culturally appropriate reward based on the context
   */
  public static createCulturalReward(
    rewardType: GameReward['type'],
    value: number,
    culturalContext: string,
    filipinoValue: FilipinoValue
  ): GameReward {
    return {
      type: rewardType,
      value,
      description: `Rewarded for understanding ${culturalContext}`,
      culturalSignificance: `This reward reflects the Filipino value of ${filipinoValue} and its importance in our culture`
    };
  }

  /**
   * Create a culturally appropriate consequence based on the context
   */
  public static createCulturalConsequence(
    consequenceType: GameConsequence['type'],
    value: number,
    culturalContext: string,
    filipinoValue: FilipinoValue
  ): GameConsequence {
    return {
      type: consequenceType,
      value,
      description: `Consequence for missing ${culturalContext}`,
      culturalLesson: `This teaches us about the importance of ${filipinoValue} in Filipino culture`
    };
  }
}