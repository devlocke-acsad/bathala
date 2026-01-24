import { 
  EducationalEvent, 
  EventContext, 
  FilipinoValue, 
  RegionalOrigin,
  AcademicReference,
  CulturalContext,
  ValuesLesson,
  MiniGameMechanic,
  GameReward,
  GameConsequence
} from "./EventTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { act1CommonPotions as commonPotions, act1UncommonPotions as uncommonPotions } from "../potions";
import { commonRelics, treasureRelics } from "../relics/Act1Relics";

/**
 * Act 1 Educational Events - Luzon Focus
 * 
 * These events focus on Luzon-based Filipino mythology and folklore,
 * emphasizing environmental stewardship, ancestral respect, and spiritual connection.
 * Each event includes proper academic references and values education.
 */

export const Act1EducationalEvents: EducationalEvent[] = [
  {
    id: "kapre_wisdom_educational",
    name: "Kapre's Wisdom",
    description: [
      "Deep in the forest, you encounter an ancient balete tree with smoke curling from its hollow.",
      "A gruff voice calls out: 'Mortal, you walk carelessly through my domain.'",
      "A kapre emerges - a tree spirit with dark, weathered skin and glowing eyes.",
      "He gestures to the damaged forest around you, speaking of balance and respect."
    ],
    choices: [
      {
        text: "Listen respectfully to the kapre's wisdom about forest stewardship.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 25);
          return "The kapre nods approvingly and blesses you with forest vitality. 'Remember, child - we are all connected to the earth.' You gain 25 HP and wisdom about environmental care.";
        },
      },
      {
        text: "Offer to help protect the forest and ask what you can do.",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
            const availablePotions = [...commonPotions, ...uncommonPotions];
            const randomPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
            player.potions.push(randomPotion);
            return `The kapre smiles warmly and offers you a ${randomPotion.name} made from forest herbs. 'Your heart shows malasakit for nature. Use this gift wisely.'`;
          }
          return "The kapre appreciates your offer but sees your pouch is full. 'Your willingness to help is gift enough, child.'";
        },
      },
      {
        text: "Dismiss the kapre's concerns and continue on your path.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.max(1, player.currentHealth - 10);
          return "The kapre frowns deeply. 'Arrogance brings its own punishment.' You feel weakened by your disrespect for nature's guardian. You lose 10 HP and miss an opportunity to learn.";
        },
      },
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Kapre",
      folkloreType: "alamat",
      culturalSignificance: "Kapres are tree spirits that serve as guardians of the forest, teaching humans about environmental responsibility and the interconnectedness of all living things.",
      traditionalMeaning: "In Filipino folklore, kapres represent the wisdom of nature and the importance of respecting the environment. They punish those who harm forests but reward those who show reverence.",
      contemporaryRelevance: "In modern times, kapre stories remind us of our responsibility to protect the environment and practice sustainable living, especially relevant to current climate change concerns."
    },
    academicReferences: [
      {
        author: "Maximo D. Ramos",
        title: "The Creatures of Philippine Lower Mythology",
        publicationYear: 1971,
        publisher: "Phoenix Publishing",
        pageReference: "pp. 45-52",
        sourceType: "book"
      },
      {
        author: "F. Landa Jocano",
        title: "Philippine Mythology",
        publicationYear: 1969,
        publisher: "PUNLAD Research House",
        pageReference: "pp. 78-85",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.MALASAKIT,
      moralTheme: "Environmental Stewardship and Compassionate Care for Nature",
      ethicalDilemma: "How do we balance human progress with environmental protection?",
      culturalWisdom: "The kapre teaches that malasakit extends beyond humans to all of creation - we must care for the earth as it cares for us.",
      applicationToModernLife: "This wisdom applies to modern environmental challenges, encouraging sustainable practices, forest conservation, and recognizing our interconnectedness with nature."
    },
    miniGameMechanic: {
      gameType: "riddle",
      instructions: "The kapre poses a traditional Filipino riddle (bugtong) about nature. Choose the correct answer to show your understanding.",
      culturalConnection: "Bugtong (riddles) are traditional Filipino word games that teach wisdom through metaphor, often used by elders to pass down knowledge about nature and life.",
      successReward: {
        type: "cultural_knowledge",
        value: 1,
        description: "Gain deeper understanding of environmental wisdom",
        culturalSignificance: "Learning from nature spirits builds respect for traditional ecological knowledge"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Miss the chance to learn traditional wisdom",
        culturalLesson: "Humility and patience are needed to receive wisdom from elders and nature spirits"
      }
    },
    regionalOrigin: RegionalOrigin.LUZON_TAGALOG,
    educationalObjectives: [
      "Understand the role of kapres as environmental guardians in Filipino mythology",
      "Learn about malasakit as compassionate care extending to nature",
      "Recognize the connection between traditional folklore and modern environmental responsibility",
      "Appreciate the wisdom embedded in Filipino riddle traditions (bugtong)"
    ]
  },

  {
    id: "tikbalang_test_educational", 
    name: "Tikbalang's Test",
    description: [
      "At a misty crossroads, the paths seem to shift and blur before your eyes.",
      "A tall figure emerges from the fog - half-man, half-horse, with a mischievous grin.",
      "The tikbalang speaks: 'Lost, are we? Pride makes many wander in circles.'",
      "He gestures to the confusing paths ahead, each seeming to lead nowhere."
    ],
    choices: [
      {
        text: "Humbly ask the tikbalang for guidance and admit you are lost.",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(20);
          return "The tikbalang nods approvingly. 'Humility opens the path to wisdom.' He guides you safely through the maze. Your humility grants you 20 block for your next combat.";
        },
      },
      {
        text: "Try to outsmart the tikbalang with clever words and reasoning.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 30;
          return "The tikbalang laughs heartily. 'Clever, but still learning!' He appreciates your wit and rewards you with 30 Ginto, though you sense there was a deeper lesson missed.";
        },
      },
      {
        text: "Insist you can find your own way and refuse help.",
        outcome: (context: EventContext) => {
          const { player } = context;
          // Simulate getting lost - lose some time/resources
          player.ginto = Math.max(0, player.ginto - 20);
          return "The tikbalang shakes his head sadly. 'Pride leads to longer journeys.' You wander in circles for hours, losing 20 Ginto worth of supplies before finding your way.";
        },
      },
    ],
    dayEvent: false,
    culturalContext: {
      mythologicalCreature: "Tikbalang",
      folkloreType: "alamat", 
      culturalSignificance: "Tikbalangs are shape-shifting spirits that lead travelers astray, teaching lessons about humility, asking for help, and the dangers of excessive pride.",
      traditionalMeaning: "In Filipino folklore, tikbalangs represent the importance of humility and community guidance. They punish the proud but help those who show respect and ask for assistance.",
      contemporaryRelevance: "The tikbalang's lesson applies to modern life where asking for help, admitting mistakes, and showing humility are essential for personal growth and community harmony."
    },
    academicReferences: [
      {
        author: "Maximo D. Ramos",
        title: "The Aswang Syncretic in Philippine Folklore", 
        publicationYear: 1969,
        publisher: "Phoenix Publishing",
        pageReference: "pp. 123-130",
        sourceType: "book"
      },
      {
        author: "Damiana L. Eugenio",
        title: "Philippine Folk Literature: The Myths",
        publicationYear: 1993,
        publisher: "University of the Philippines Press", 
        pageReference: "pp. 156-163",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.HIYA,
      moralTheme: "Humility and the Wisdom of Seeking Guidance",
      ethicalDilemma: "When is it appropriate to ask for help versus trying to solve problems independently?",
      culturalWisdom: "The tikbalang teaches that hiya (proper shame/humility) prevents us from being too proud to ask for help when we truly need it.",
      applicationToModernLife: "In modern contexts, this wisdom encourages seeking mentorship, asking questions when confused, and recognizing that community support is strength, not weakness."
    },
    miniGameMechanic: {
      gameType: "pattern_matching",
      instructions: "The tikbalang shows you shifting path patterns. Match the correct sequence to find the true path forward.",
      culturalConnection: "Pattern recognition reflects the Filipino value of paying attention to subtle social and environmental cues, essential for community navigation.",
      successReward: {
        type: "status_effect",
        value: 1,
        description: "Gain 'Guided Path' - improved navigation abilities",
        culturalSignificance: "Receiving guidance from spirits represents the importance of respecting traditional knowledge"
      },
      failureConsequence: {
        type: "ginto_loss",
        value: 10,
        description: "Get temporarily lost, losing time and resources",
        culturalLesson: "Pride and impatience can lead to unnecessary struggles and delays"
      }
    },
    regionalOrigin: RegionalOrigin.LUZON_TAGALOG,
    educationalObjectives: [
      "Understand the tikbalang's role as a teacher of humility in Filipino folklore",
      "Learn about hiya as proper humility rather than shame",
      "Recognize the value of seeking guidance and community support",
      "Appreciate how folklore teaches practical life lessons through supernatural encounters"
    ]
  },

  {
    id: "diwata_gift_educational",
    name: "Diwata's Gift", 
    description: [
      "A crystal-clear spring bubbles up from the forest floor, surrounded by vibrant flowers.",
      "A beautiful diwata materializes from the mist, her presence bringing peace to the grove.",
      "She speaks gently: 'This spring has been poisoned by careless hands. Will you help restore it?'",
      "The water runs murky, and the surrounding plants wilt from contamination."
    ],
    choices: [
      {
        text: "Offer to purify the spring using your own energy and time.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.max(1, player.currentHealth - 15);
          if (player.relics.length < 6) {
            const availableRelics = [...commonRelics, ...treasureRelics];
            const randomRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
            player.relics.push(randomRelic);
            return `You spend your energy purifying the spring. The diwata smiles gratefully and grants you ${randomRelic.name}. 'Your malasakit for nature deserves reward.' You lose 15 HP but gain a powerful relic.`;
          }
          return "You purify the spring with great effort. The diwata blesses you with renewed spiritual strength, though you are physically drained. You lose 15 HP but feel spiritually enriched.";
        },
      },
      {
        text: "Ask the diwata to teach you about protecting nature's gifts.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.maxDiscardCharges += 3;
          return "The diwata teaches you ancient wisdom about balance and harmony. 'True strength comes from understanding, not force.' You gain 3 additional discard charges and deep ecological knowledge.";
        },
      },
      {
        text: "Express sympathy but explain you cannot spare the energy to help.",
        outcome: (context: EventContext) => {
          const { player } = context;
          return "The diwata nods sadly but understandingly. 'Not all can give when they themselves are in need. May you find what you seek.' She fades away, leaving you with a sense of missed opportunity.";
        },
      },
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Diwata",
      folkloreType: "alamat",
      culturalSignificance: "Diwatas are benevolent nature spirits who protect natural resources and reward those who show malasakit (compassionate care) for the environment.",
      traditionalMeaning: "In Filipino mythology, diwatas represent the nurturing aspect of nature and the reciprocal relationship between humans and the natural world.",
      contemporaryRelevance: "Diwata stories emphasize environmental stewardship and the importance of protecting natural resources like clean water, especially relevant to modern conservation efforts."
    },
    academicReferences: [
      {
        author: "F. Landa Jocano", 
        title: "Philippine Mythology",
        publicationYear: 1969,
        publisher: "PUNLAD Research House",
        pageReference: "pp. 92-98",
        sourceType: "book"
      },
      {
        author: "Francisco R. Demetrio",
        title: "Encyclopedia of Philippine Folk Beliefs and Customs",
        publicationYear: 1991,
        publisher: "Xavier University Press",
        pageReference: "pp. 234-241",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.MALASAKIT,
      moralTheme: "Compassionate Care for Nature and Sacrificial Service",
      ethicalDilemma: "How much personal sacrifice should we make for environmental protection?",
      culturalWisdom: "The diwata teaches that malasakit means caring for others (including nature) even when it requires personal sacrifice, and that such care is always rewarded.",
      applicationToModernLife: "This wisdom applies to environmental activism, community service, and the understanding that protecting our natural resources requires personal commitment and sometimes sacrifice."
    },
    miniGameMechanic: {
      gameType: "memory_game",
      instructions: "The diwata shows you the natural harmony of the grove before pollution. Remember the correct arrangement of elements to restore balance.",
      culturalConnection: "Memory games reflect the Filipino tradition of preserving environmental knowledge through careful observation and remembrance of natural patterns.",
      successReward: {
        type: "health",
        value: 10,
        description: "Restore natural harmony and gain vitality",
        culturalSignificance: "Successfully caring for nature brings spiritual and physical renewal"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Unable to fully restore the spring's purity",
        culturalLesson: "Environmental restoration requires patience, attention, and deep understanding of natural systems"
      }
    },
    regionalOrigin: RegionalOrigin.LUZON_TAGALOG,
    educationalObjectives: [
      "Understand diwatas as protectors of natural resources in Filipino mythology",
      "Learn about malasakit as compassionate care extending to environmental stewardship", 
      "Recognize the reciprocal relationship between humans and nature in Filipino culture",
      "Appreciate the connection between traditional nature spirits and modern conservation values"
    ]
  },

  {
    id: "anito_shrine_educational",
    name: "Anito Shrine",
    description: [
      "You discover an ancient stone shrine covered in moss and flowering vines.",
      "Carved figures of ancestors watch over offerings of rice, flowers, and incense.",
      "The air hums with ancestral presence, and you feel the weight of generations past.",
      "A gentle voice whispers: 'Honor those who came before, for they guide your path.'"
    ],
    choices: [
      {
        text: "Offer prayers and respect to your ancestors at the shrine.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 30);
          return "You feel the blessing of your ancestors flow through you. Their wisdom strengthens your spirit and body. 'Remember, child - you carry our hopes forward.' You gain 30 HP and ancestral guidance.";
        },
      },
      {
        text: "Leave your own offering and ask for ancestral wisdom.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto = Math.max(0, player.ginto - 10);
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(25);
          return "You place 10 Ginto as an offering. The ancestors whisper ancient battle wisdom in your ear. 'Courage comes from knowing you do not fight alone.' You gain 25 block for your next combat.";
        },
      },
      {
        text: "Study the shrine respectfully but do not participate in the ritual.",
        outcome: () => {
          return "You observe the shrine with respectful curiosity. While you don't participate in the ritual, you gain appreciation for the deep connection between past and present in Filipino culture.";
        },
      },
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Anito",
      folkloreType: "alamat",
      culturalSignificance: "Anito are ancestral spirits who continue to guide and protect their descendants, representing the Filipino value of respecting elders and maintaining connection with family heritage.",
      traditionalMeaning: "In pre-colonial Filipino spirituality, anito worship emphasized the continuity between the living and the dead, with ancestors providing wisdom and protection to their families.",
      contemporaryRelevance: "Anito reverence connects to modern Filipino values of family loyalty, respect for elders, and the importance of remembering one's roots and cultural heritage."
    },
    academicReferences: [
      {
        author: "Zeus A. Salazar",
        title: "Ang Babaylan sa Kasaysayan ng Pilipinas", 
        publicationYear: 1999,
        publisher: "PUNLAD Research House",
        pageReference: "pp. 67-74",
        sourceType: "book"
      },
      {
        author: "Leonardo N. Mercado",
        title: "Elements of Filipino Philosophy",
        publicationYear: 1974,
        publisher: "Divine Word University Publications",
        pageReference: "pp. 45-52",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.UTANG_NA_LOOB,
      moralTheme: "Ancestral Respect and Gratitude for Heritage",
      ethicalDilemma: "How do we honor traditional beliefs while embracing modern perspectives?",
      culturalWisdom: "The anito teach that utang na loob extends beyond the living to our ancestors - we owe gratitude to those who sacrificed for our present opportunities.",
      applicationToModernLife: "This wisdom encourages respect for family elders, preservation of cultural traditions, and recognition that our achievements build upon the foundations laid by previous generations."
    },
    miniGameMechanic: {
      gameType: "traditional_game",
      instructions: "Arrange offerings in the traditional pattern shown by ancestral memory. Each element has its proper place in the ritual.",
      culturalConnection: "Traditional offering arrangements reflect Filipino concepts of order, respect, and proper relationships between the living and ancestral spirits.",
      successReward: {
        type: "cultural_knowledge",
        value: 1,
        description: "Gain ancestral blessing and cultural understanding",
        culturalSignificance: "Proper ritual observance strengthens the connection between generations and preserves cultural knowledge"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Respectful attempt but incomplete understanding",
        culturalLesson: "Cultural traditions require careful learning and practice to fully appreciate their meaning"
      }
    },
    regionalOrigin: RegionalOrigin.LUZON_TAGALOG,
    educationalObjectives: [
      "Understand the role of anito in pre-colonial Filipino spirituality",
      "Learn about utang na loob as gratitude extending to ancestors",
      "Recognize the importance of ancestral respect in Filipino culture",
      "Appreciate how traditional spiritual practices connect past and present"
    ]
  },

  {
    id: "balete_mystery_educational",
    name: "Balete Tree Mystery",
    description: [
      "Before you stands an enormous balete tree, its aerial roots creating a natural cathedral.",
      "Local whispers speak of this tree as a gateway between worlds, where spirits dwell.",
      "As you approach, you feel a profound spiritual presence - ancient, wise, and watchful.",
      "The tree seems to pulse with life, and you sense it holds secrets of the spiritual realm."
    ],
    choices: [
      {
        text: "Meditate beneath the tree and open yourself to spiritual connection.",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
            const availablePotions = [...commonPotions, ...uncommonPotions];
            const randomPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
            player.potions.push(randomPotion);
            return `In deep meditation, you receive visions of healing wisdom. The tree spirits gift you a ${randomPotion.name}. 'Spiritual connection brings practical blessings,' whispers the wind.`;
          }
          return "Your meditation brings profound peace and spiritual insight, though your potion pouch cannot hold more gifts. The tree spirits acknowledge your openness to the spiritual realm.";
        },
      },
      {
        text: "Respectfully ask the tree spirits for guidance on your journey.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.maxDiscardCharges += 2;
          return "The ancient spirits whisper strategic wisdom in your mind. 'True strength comes from knowing when to act and when to wait.' You gain 2 additional discard charges and spiritual insight.";
        },
      },
      {
        text: "Maintain respectful distance and observe the tree's spiritual significance.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
          return "Your respectful observation is noted by the tree spirits. They bless you with gentle healing energy. 'Wisdom begins with knowing one's place.' You gain 15 HP and spiritual awareness.";
        },
      },
    ],
    dayEvent: false,
    culturalContext: {
      mythologicalCreature: "Tree Spirits",
      folkloreType: "alamat",
      culturalSignificance: "Balete trees are considered sacred in Filipino culture, serving as dwelling places for spirits and gateways between the physical and spiritual worlds.",
      traditionalMeaning: "In Filipino folklore, balete trees represent the thin boundary between worlds and the importance of respecting spiritual forces that exist alongside our physical reality.",
      contemporaryRelevance: "The balete tree's significance reminds modern Filipinos to maintain spiritual awareness and respect for forces beyond material understanding, promoting mindfulness and reverence."
    },
    academicReferences: [
      {
        author: "Maximo D. Ramos",
        title: "The Creatures of Midnight",
        publicationYear: 1990,
        publisher: "Phoenix Publishing", 
        pageReference: "pp. 78-85",
        sourceType: "book"
      },
      {
        author: "Rogelia Pe-Pua",
        title: "Sikolohiyang Pilipino: Teorya, Metodo at Gamit",
        publicationYear: 1982,
        publisher: "University of the Philippines Press",
        pageReference: "pp. 123-130",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.PAKIKIPAGKAPWA,
      moralTheme: "Spiritual Connection and Shared Identity with All Creation",
      ethicalDilemma: "How do we balance scientific understanding with spiritual awareness?",
      culturalWisdom: "The balete tree teaches pakikipagkapwa - our shared identity extends beyond humans to include the spiritual realm and all of creation.",
      applicationToModernLife: "This wisdom encourages spiritual mindfulness, respect for indigenous beliefs, and recognition that human identity is interconnected with the broader spiritual and natural world."
    },
    miniGameMechanic: {
      gameType: "moral_choice_tree",
      instructions: "Navigate a series of spiritual choices that test your understanding of proper relationship with the spirit world.",
      culturalConnection: "Moral choice trees reflect the Filipino understanding that spiritual encounters require careful consideration of proper behavior and respect.",
      successReward: {
        type: "status_effect",
        value: 1,
        description: "Gain 'Spiritual Awareness' - enhanced perception of hidden truths",
        culturalSignificance: "Successful spiritual connection grants deeper understanding of the interconnected nature of reality"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Spiritual connection remains incomplete",
        culturalLesson: "Spiritual growth requires patience, humility, and genuine respect for forces beyond our immediate understanding"
      }
    },
    regionalOrigin: RegionalOrigin.LUZON_TAGALOG,
    educationalObjectives: [
      "Understand the spiritual significance of balete trees in Filipino culture",
      "Learn about pakikipagkapwa as shared identity extending to the spiritual realm",
      "Recognize the importance of spiritual awareness in Filipino worldview",
      "Appreciate how traditional beliefs promote mindfulness and reverence for the unseen"
    ]
  }
];