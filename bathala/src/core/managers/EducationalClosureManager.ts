import { 
  MiniGameMechanic, 
  FilipinoValue,
  RegionalOrigin 
} from '../../data/events/EventTypes';
import { MiniGameResult } from './MiniGameManager';

/**
 * Educational objective tracking
 */
export interface EducationalObjective {
  id: string;
  description: string;
  category: 'cultural_knowledge' | 'moral_reasoning' | 'traditional_skills' | 'values_application';
  filipinoValue?: FilipinoValue;
  regionalOrigin?: RegionalOrigin;
  completed: boolean;
  completionTimestamp?: Date;
}

/**
 * Cultural explanation for traditional games
 */
export interface CulturalExplanation {
  gameName: string;
  historicalContext: string;
  culturalSignificance: string;
  modernRelevance: string;
  relatedValues: FilipinoValue[];
  regionalVariations: string[];
  educationalBenefits: string[];
}

/**
 * Educational closure result
 */
export interface EducationalClosure {
  culturalSignificanceExplanation: string;
  moralLessonConnection: string;
  contemporaryRelevance: string;
  objectivesCompleted: string[];
  knowledgeGained: string[];
  valuesReinforced: FilipinoValue[];
  nextLearningOpportunities: string[];
}

/**
 * Gameplay consequence integration
 */
export interface GameplayConsequence {
  type: 'immediate' | 'long_term' | 'narrative';
  description: string;
  gameStateChanges: {
    health?: number;
    ginto?: number;
    diamante?: number;
    statusEffects?: string[];
    relationshipChanges?: Map<string, number>;
  };
  educationalImpact: string;
}

/**
 * Educational Closure Manager
 * 
 * Handles the completion of mini-games with proper educational closure,
 * ensuring players understand the cultural lessons and their contemporary relevance
 */
export class EducationalClosureManager {
  private static instance: EducationalClosureManager;
  private completedObjectives: Map<string, EducationalObjective> = new Map();
  private culturalExplanations: Map<string, CulturalExplanation> = new Map();
  private playerKnowledgeBase: Set<string> = new Set();

  private constructor() {
    this.initializeCulturalExplanations();
  }

  public static getInstance(): EducationalClosureManager {
    if (!EducationalClosureManager.instance) {
      EducationalClosureManager.instance = new EducationalClosureManager();
    }
    return EducationalClosureManager.instance;
  }

  /**
   * Initialize cultural explanations database for traditional games
   */
  private initializeCulturalExplanations(): void {
    this.culturalExplanations.set('sungka', {
      gameName: 'Sungka',
      historicalContext: 'Ancient counting game played across Southeast Asia, with Filipino variations dating back centuries',
      culturalSignificance: 'Represents mathematical thinking, strategic planning, and patience valued in Filipino culture',
      modernRelevance: 'Teaches resource management, forward thinking, and mathematical concepts still relevant today',
      relatedValues: [FilipinoValue.PAKIKIPAGKAPWA, FilipinoValue.UTANG_NA_LOOB],
      regionalVariations: ['Luzon: Sungka', 'Visayas: Sungka', 'Mindanao: Chongka'],
      educationalBenefits: ['Mathematical reasoning', 'Strategic thinking', 'Patience development', 'Cultural connection']
    });

    this.culturalExplanations.set('patintero', {
      gameName: 'Patintero',
      historicalContext: 'Traditional street game that developed community bonds and physical fitness among Filipino children',
      culturalSignificance: 'Embodies bayanihan spirit through teamwork and collective strategy',
      modernRelevance: 'Teaches collaboration, quick decision-making, and leadership skills needed in modern workplaces',
      relatedValues: [FilipinoValue.BAYANIHAN, FilipinoValue.PAKIKIPAGKAPWA],
      regionalVariations: ['Nationwide with local rule variations'],
      educationalBenefits: ['Teamwork', 'Physical fitness', 'Strategic thinking', 'Leadership development']
    });

    this.culturalExplanations.set('tumbang_preso', {
      gameName: 'Tumbang Preso',
      historicalContext: 'Traditional game that developed accuracy and quick reflexes, often played in rural communities',
      culturalSignificance: 'Teaches precision, risk assessment, and the balance between boldness and caution',
      modernRelevance: 'Develops hand-eye coordination and decision-making under pressure',
      relatedValues: [FilipinoValue.PAKIKIPAGBIGAYAN, FilipinoValue.HIYA],
      regionalVariations: ['Various regional names and slight rule differences'],
      educationalBenefits: ['Hand-eye coordination', 'Risk assessment', 'Quick reflexes', 'Courage development']
    });
  }

  /**
   * Create educational closure for a completed mini-game
   */
  public createEducationalClosure(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue,
    regionalOrigin: RegionalOrigin
  ): EducationalClosure {
    const culturalSignificanceExplanation = this.generateCulturalSignificanceExplanation(
      mechanic, result, filipinoValue, regionalOrigin
    );

    const moralLessonConnection = this.generateMoralLessonConnection(
      mechanic, result, filipinoValue
    );

    const contemporaryRelevance = this.generateContemporaryRelevance(
      mechanic, result, filipinoValue
    );

    const objectivesCompleted = this.trackEducationalObjectives(
      mechanic, result, filipinoValue, regionalOrigin
    );

    const knowledgeGained = this.identifyKnowledgeGained(
      mechanic, result, filipinoValue, regionalOrigin
    );

    const valuesReinforced = this.identifyValuesReinforced(
      mechanic, result, filipinoValue
    );

    const nextLearningOpportunities = this.suggestNextLearningOpportunities(
      mechanic, result, filipinoValue, regionalOrigin
    );

    return {
      culturalSignificanceExplanation,
      moralLessonConnection,
      contemporaryRelevance,
      objectivesCompleted,
      knowledgeGained,
      valuesReinforced,
      nextLearningOpportunities
    };
  }

  /**
   * Generate cultural significance explanation
   */
  private generateCulturalSignificanceExplanation(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue,
    regionalOrigin: RegionalOrigin
  ): string {
    const baseExplanation = `This ${mechanic.gameType.replace('_', ' ')} from ${regionalOrigin} demonstrates the Filipino value of ${filipinoValue}.`;
    
    let specificExplanation = '';
    switch (mechanic.gameType) {
      case 'riddle':
        specificExplanation = 'Traditional riddles (bugtong) were used by our ancestors to pass down wisdom and test understanding. They teach us to think creatively and appreciate the depth of Filipino culture.';
        break;
      case 'pattern_matching':
        specificExplanation = 'Traditional patterns carry deep meaning in Filipino culture, representing our connection to nature, community, and spiritual beliefs.';
        break;
      case 'memory_game':
        specificExplanation = 'Oral tradition was how our ancestors preserved important cultural lessons. By remembering these stories, we keep our heritage alive for future generations.';
        break;
      case 'traditional_game':
        specificExplanation = 'Traditional games were not just entertainment but tools for teaching important life skills and community values that remain relevant today.';
        break;
      case 'moral_choice_tree':
        specificExplanation = 'Filipino values guide us in making ethical decisions. Understanding these values helps us navigate complex moral situations with wisdom and compassion.';
        break;
    }

    const performanceNote = result.success 
      ? 'Your successful completion shows understanding of these cultural lessons.'
      : 'Even though the challenge was difficult, you gained valuable cultural insight.';

    return `${baseExplanation} ${specificExplanation} ${performanceNote}`;
  }

  /**
   * Generate moral lesson connection
   */
  private generateMoralLessonConnection(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue
  ): string {
    const valueExplanations = {
      [FilipinoValue.KAPAMILYA]: 'emphasizes the importance of family and close relationships in Filipino society',
      [FilipinoValue.BAYANIHAN]: 'teaches us about community spirit and helping one another',
      [FilipinoValue.MALASAKIT]: 'shows the importance of compassionate care for others',
      [FilipinoValue.UTANG_NA_LOOB]: 'reminds us to be grateful and reciprocate kindness',
      [FilipinoValue.PAKIKIPAGKAPWA]: 'emphasizes our shared identity and interconnectedness',
      [FilipinoValue.HIYA]: 'teaches appropriate behavior and respect for others',
      [FilipinoValue.PAKIKIPAGKUNWARE]: 'shows the value of accommodation and harmony',
      [FilipinoValue.AMOR_PROPIO]: 'reminds us to maintain dignity and self-respect',
      [FilipinoValue.DELICADEZA]: 'teaches us about propriety and appropriate conduct',
      [FilipinoValue.PAKIKIPAGBIGAYAN]: 'emphasizes mutual accommodation and compromise'
    };

    const valueExplanation = valueExplanations[filipinoValue] || 'represents important Filipino cultural values';
    
    return `The value of ${filipinoValue} ${valueExplanation}. Through this mini-game, you experienced how this value applies in practical situations and guides moral decision-making in Filipino culture.`;
  }

  /**
   * Generate contemporary relevance explanation
   */
  private generateContemporaryRelevance(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue
  ): string {
    const modernApplications = {
      [FilipinoValue.KAPAMILYA]: 'strong family bonds provide support in modern challenges like career decisions and personal growth',
      [FilipinoValue.BAYANIHAN]: 'community cooperation is essential in addressing modern issues like climate change and social problems',
      [FilipinoValue.MALASAKIT]: 'compassionate care is crucial in healthcare, education, and social services',
      [FilipinoValue.UTANG_NA_LOOB]: 'gratitude and reciprocity build strong professional and personal networks',
      [FilipinoValue.PAKIKIPAGKAPWA]: 'recognizing our shared humanity helps in building inclusive communities',
      [FilipinoValue.HIYA]: 'appropriate behavior and respect create positive social and work environments',
      [FilipinoValue.PAKIKIPAGKUNWARE]: 'accommodation and flexibility are valuable in diverse, multicultural settings',
      [FilipinoValue.AMOR_PROPIO]: 'maintaining dignity while being open to feedback supports personal and professional growth',
      [FilipinoValue.DELICADEZA]: 'propriety and ethical conduct are essential in leadership and public service',
      [FilipinoValue.PAKIKIPAGBIGAYAN]: 'mutual accommodation is key to successful teamwork and conflict resolution'
    };

    const modernApplication = modernApplications[filipinoValue] || 'remains relevant in contemporary Filipino society';

    return `In today's world, ${modernApplication}. The lessons from this traditional ${mechanic.gameType.replace('_', ' ')} help us apply these timeless values to modern situations.`;
  }

  /**
   * Track educational objectives completion
   */
  private trackEducationalObjectives(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue,
    regionalOrigin: RegionalOrigin
  ): string[] {
    const objectives: EducationalObjective[] = [];

    // Create objectives based on mini-game type and result
    if (result.success) {
      objectives.push({
        id: `${mechanic.gameType}_mastery_${Date.now()}`,
        description: `Mastered ${mechanic.gameType.replace('_', ' ')} mechanics`,
        category: 'traditional_skills',
        filipinoValue,
        regionalOrigin,
        completed: true,
        completionTimestamp: new Date()
      });
    }

    if (result.culturalLessonLearned) {
      objectives.push({
        id: `cultural_lesson_${filipinoValue}_${Date.now()}`,
        description: `Learned cultural lesson about ${filipinoValue}`,
        category: 'cultural_knowledge',
        filipinoValue,
        regionalOrigin,
        completed: true,
        completionTimestamp: new Date()
      });
    }

    // Add objectives to tracking
    objectives.forEach(objective => {
      this.completedObjectives.set(objective.id, objective);
    });

    return objectives.map(obj => obj.description);
  }

  /**
   * Identify knowledge gained from mini-game
   */
  private identifyKnowledgeGained(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue,
    regionalOrigin: RegionalOrigin
  ): string[] {
    const knowledge: string[] = [];

    // Add cultural knowledge
    knowledge.push(`Understanding of ${filipinoValue} in Filipino culture`);
    knowledge.push(`Cultural context from ${regionalOrigin} region`);

    // Add game-specific knowledge
    switch (mechanic.gameType) {
      case 'riddle':
        knowledge.push('Traditional Filipino riddle-solving techniques');
        knowledge.push('Ancestral wisdom and creative thinking methods');
        break;
      case 'pattern_matching':
        knowledge.push('Traditional Filipino pattern meanings and symbolism');
        knowledge.push('Cultural significance of traditional designs');
        break;
      case 'memory_game':
        knowledge.push('Oral tradition preservation techniques');
        knowledge.push('Cultural story elements and their meanings');
        break;
      case 'traditional_game':
        knowledge.push('Traditional Filipino game rules and strategies');
        knowledge.push('Community values embedded in traditional games');
        break;
      case 'moral_choice_tree':
        knowledge.push('Filipino values-based decision making');
        knowledge.push('Ethical reasoning using cultural wisdom');
        break;
    }

    // Add to player knowledge base
    knowledge.forEach(item => this.playerKnowledgeBase.add(item));

    return knowledge;
  }

  /**
   * Identify values reinforced through mini-game
   */
  private identifyValuesReinforced(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    primaryValue: FilipinoValue
  ): FilipinoValue[] {
    const values: FilipinoValue[] = [primaryValue];

    // Add secondary values based on game type
    switch (mechanic.gameType) {
      case 'riddle':
        values.push(FilipinoValue.UTANG_NA_LOOB); // Respect for ancestral wisdom
        break;
      case 'pattern_matching':
        values.push(FilipinoValue.KAPAMILYA); // Connection to heritage
        break;
      case 'memory_game':
        values.push(FilipinoValue.PAKIKIPAGKAPWA); // Shared cultural memory
        break;
      case 'traditional_game':
        values.push(FilipinoValue.BAYANIHAN); // Community participation
        break;
      case 'moral_choice_tree':
        values.push(FilipinoValue.DELICADEZA); // Proper conduct
        break;
    }

    return [...new Set(values)]; // Remove duplicates
  }

  /**
   * Suggest next learning opportunities
   */
  private suggestNextLearningOpportunities(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    filipinoValue: FilipinoValue,
    regionalOrigin: RegionalOrigin
  ): string[] {
    const opportunities: string[] = [];

    // Suggest related cultural exploration
    opportunities.push(`Explore more stories and legends from ${regionalOrigin}`);
    opportunities.push(`Learn about other Filipino values related to ${filipinoValue}`);

    // Suggest game-specific opportunities
    switch (mechanic.gameType) {
      case 'riddle':
        opportunities.push('Try more traditional Filipino riddles (bugtong)');
        opportunities.push('Learn about riddle traditions from other regions');
        break;
      case 'pattern_matching':
        opportunities.push('Explore traditional Filipino textile patterns');
        opportunities.push('Learn about indigenous art and symbolism');
        break;
      case 'memory_game':
        opportunities.push('Discover more oral traditions and folklore');
        opportunities.push('Practice storytelling techniques');
        break;
      case 'traditional_game':
        opportunities.push('Learn other traditional Filipino games');
        opportunities.push('Understand the history of Filipino recreational activities');
        break;
      case 'moral_choice_tree':
        opportunities.push('Explore ethical dilemmas in Filipino literature');
        opportunities.push('Study Filipino philosophy and moral reasoning');
        break;
    }

    return opportunities;
  }

  /**
   * Integrate gameplay consequences with educational outcomes
   */
  public integrateGameplayConsequences(
    mechanic: MiniGameMechanic,
    result: MiniGameResult,
    closure: EducationalClosure
  ): GameplayConsequence[] {
    const consequences: GameplayConsequence[] = [];

    // Immediate consequences based on success/failure
    if (result.success) {
      consequences.push({
        type: 'immediate',
        description: 'Gained cultural wisdom and practical benefits',
        gameStateChanges: {
          health: 10,
          ginto: 15,
          diamante: 2
        },
        educationalImpact: 'Reinforced understanding of Filipino values through positive outcomes'
      });
    } else {
      consequences.push({
        type: 'immediate',
        description: 'Learned from the experience despite challenges',
        gameStateChanges: {
          health: 5,
          ginto: 5
        },
        educationalImpact: 'Gained cultural awareness even through incomplete success'
      });
    }

    // Long-term consequences based on values learned
    consequences.push({
      type: 'long_term',
      description: `Enhanced understanding of ${closure.valuesReinforced.join(', ')} will influence future interactions`,
      gameStateChanges: {
        relationshipChanges: new Map([['cultural_community', 10]])
      },
      educationalImpact: 'Improved cultural competency affects future event outcomes'
    });

    // Narrative consequences
    consequences.push({
      type: 'narrative',
      description: 'Cultural knowledge gained will be referenced in future events',
      gameStateChanges: {},
      educationalImpact: 'Creates continuity in cultural learning throughout the game'
    });

    return consequences;
  }

  /**
   * Get cultural explanation for a traditional game
   */
  public getCulturalExplanation(gameName: string): CulturalExplanation | null {
    return this.culturalExplanations.get(gameName.toLowerCase()) || null;
  }

  /**
   * Get completed educational objectives
   */
  public getCompletedObjectives(): EducationalObjective[] {
    return Array.from(this.completedObjectives.values());
  }

  /**
   * Get player's knowledge base
   */
  public getPlayerKnowledgeBase(): string[] {
    return Array.from(this.playerKnowledgeBase);
  }

  /**
   * Validate educational closure completeness
   */
  public validateEducationalClosure(closure: EducationalClosure): {
    isComplete: boolean;
    missingElements: string[];
  } {
    const missingElements: string[] = [];

    if (!closure.culturalSignificanceExplanation || closure.culturalSignificanceExplanation.length < 20) {
      missingElements.push('Cultural significance explanation is too brief or missing');
    }

    if (!closure.moralLessonConnection || closure.moralLessonConnection.length < 20) {
      missingElements.push('Moral lesson connection is too brief or missing');
    }

    if (!closure.contemporaryRelevance || closure.contemporaryRelevance.length < 20) {
      missingElements.push('Contemporary relevance explanation is too brief or missing');
    }

    if (!closure.objectivesCompleted || closure.objectivesCompleted.length === 0) {
      missingElements.push('No educational objectives completed');
    }

    if (!closure.knowledgeGained || closure.knowledgeGained.length === 0) {
      missingElements.push('No knowledge gained identified');
    }

    if (!closure.valuesReinforced || closure.valuesReinforced.length === 0) {
      missingElements.push('No values reinforced identified');
    }

    return {
      isComplete: missingElements.length === 0,
      missingElements
    };
  }

  /**
   * Reset educational progress (for testing or new game)
   */
  public resetProgress(): void {
    this.completedObjectives.clear();
    this.playerKnowledgeBase.clear();
  }
}