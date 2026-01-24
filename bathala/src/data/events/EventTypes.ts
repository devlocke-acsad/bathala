
import { Player } from "../../core/types/CombatTypes";

export interface EventContext {
  player: Player;
  scene?: any; // Reference to the Phaser scene if needed
}

export interface EventChoice {
  text: string;
  outcome: (context: EventContext) => string | void; // Returns a message or void
}

export interface GameEvent {
  id: string;
  name: string;
  description: string[]; // An array of strings to represent the dialogue
  choices: EventChoice[];
  dayEvent: boolean; // true if it's a day event, false if it's a night event
}

// Educational Event System Interfaces

export enum FilipinoValue {
  KAPAMILYA = 'kapamilya', // Family-centeredness
  PAKIKIPAGKUNWARE = 'pakikipagkunware', // Accommodation/conformity
  UTANG_NA_LOOB = 'utang_na_loob', // Debt of gratitude
  BAYANIHAN = 'bayanihan', // Community spirit
  PAKIKIPAGKAPWA = 'pakikipagkapwa', // Shared identity
  HIYA = 'hiya', // Shame/propriety
  AMOR_PROPIO = 'amor_propio', // Self-esteem
  DELICADEZA = 'delicadeza', // Sense of propriety
  PAKIKIPAGBIGAYAN = 'pakikipagbigayan', // Mutual accommodation
  MALASAKIT = 'malasakit' // Compassionate care
}

export enum RegionalOrigin {
  LUZON_ILOCANO = 'luzon_ilocano',
  LUZON_TAGALOG = 'luzon_tagalog',
  LUZON_BICOLANO = 'luzon_bicolano',
  VISAYAS_CEBUANO = 'visayas_cebuano',
  VISAYAS_HILIGAYNON = 'visayas_hiligaynon',
  MINDANAO_MARANAO = 'mindanao_maranao',
  MINDANAO_TAUSUG = 'mindanao_tausug',
  CORDILLERA = 'cordillera',
  PALAWAN = 'palawan'
}

export interface AcademicReference {
  author: string;
  title: string;
  publicationYear: number;
  publisher?: string;
  pageReference?: string;
  isbn?: string;
  sourceType: 'book' | 'journal' | 'thesis' | 'oral_tradition';
}

export interface CulturalContext {
  mythologicalCreature?: string;
  folkloreType: 'alamat' | 'kwentong-bayan' | 'pabula' | 'legend';
  culturalSignificance: string;
  traditionalMeaning: string;
  contemporaryRelevance: string;
}

export interface ValuesLesson {
  primaryValue: FilipinoValue;
  moralTheme: string;
  ethicalDilemma?: string;
  culturalWisdom: string;
  applicationToModernLife: string;
}

export interface GameReward {
  type: 'health' | 'ginto' | 'diamante' | 'card_draw' | 'status_effect' | 'cultural_knowledge';
  value: number;
  description: string;
  culturalSignificance?: string;
}

export interface GameConsequence {
  type: 'health_loss' | 'ginto_loss' | 'card_discard' | 'status_effect' | 'missed_opportunity';
  value: number;
  description: string;
  culturalLesson?: string;
}

export interface MiniGameMechanic {
  gameType: 'riddle' | 'pattern_matching' | 'memory_game' | 'traditional_game' | 'moral_choice_tree';
  instructions: string;
  culturalConnection: string;
  successReward: GameReward;
  failureConsequence?: GameConsequence;
}

export interface EducationalEvent extends GameEvent {
  culturalContext: CulturalContext;
  academicReferences: AcademicReference[];
  valuesLesson: ValuesLesson;
  miniGameMechanic?: MiniGameMechanic;
  regionalOrigin: RegionalOrigin;
  educationalObjectives: string[];
}
