import { 
  EducationalEvent, 
  EventContext, 
  FilipinoValue, 
  RegionalOrigin,
/*  AcademicReference,
  CulturalContext,
  ValuesLesson,
  MiniGameMechanic,
  GameReward,
  GameConsequence*/
} from "./EventTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { act2CommonPotions as commonPotions, act2UncommonPotions as uncommonPotions } from "../potions";
import { commonRelics, treasureRelics } from "../relics/Act2Relics";

/**
 * Act 2 Educational Events - Visayas Focus
 * 
 * These events focus on Visayas-based Filipino mythology and folklore,
 * emphasizing marine conservation, cosmic balance, and character discernment.
 * Each event includes proper academic references and values education.
 */

export const Act2EducationalEvents: EducationalEvent[] = [
  {
    id: "bakunawa_hunger_educational",
    name: "Bakunawa's Hunger",
    description: [
      "The moon hangs low and heavy, casting an eerie glow over the dark waters.",
      "A massive shadow ripples beneath the surface, ancient and hungry.",
      "The Bakunawa - the moon-eating serpent - stirs from the abyss.",
      "A voice echoes from the depths: 'The light... it taunts my eternal hunger.'"
    ],
    choices: [
      {
        text: "Make noise and bang drums to scare the Bakunawa away.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.maxDiscardCharges += 2;
          return "Your cacophony mimics the ancient tradition of saving the moon! The Bakunawa retreats, startled. You gain 2 additional discard charges and the gratitude of the night sky.";
        },
      },
      {
        text: "Offer a portion of your resources to appease its hunger.",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length > 0) {
             player.potions.pop(); // Lose a potion
             player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 30);
             return "You sacrifice a potion to the abyss. The waters calm as the Bakunawa accepts your offering. 'Balance is restored,' it hisses. You lose a potion but gain 30 HP.";
          }
           player.currentHealth = Math.max(1, player.currentHealth - 15);
           return "You possess nothing to offer. The Bakunawa takes a bite of your spirit instead. You lose 15 HP.";
        },
      },
      {
        text: "Meditate on the cycle of light and darkness.",
        outcome: (context: EventContext) => { 
           const { player } = context;
           if (player.relics.length < 6) {
            const availableRelics = [...commonRelics, ...treasureRelics];
            const randomRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
            player.relics.push(randomRelic);
            return `You find stillness amidst the chaos. The cosmic balance shifts, revealing a ${randomRelic.name} washed ashore. Peace brings its own rewards.`;
           }
           return "You find stillness. The moment passes, and the moon remains safe. You feel a deep sense of cosmic order.";
        },
      },
    ],
    dayEvent: false, // Night event
    culturalContext: {
      mythologicalCreature: "Bakunawa",
      folkloreType: "alamat",
      culturalSignificance: "The Bakunawa is a serpent-dragon that swallows the moon, causing eclipses. It teaches the importance of balance and the community striving together to restore light.",
      traditionalMeaning: "Ancient Visayans believed eclipses were caused by the Bakunawa. They would make noise to startle it and force it to spit out the moon.",
      contemporaryRelevance: "Bakunawa stories remind us of the delicate balance of our ecosystem and the power of collective action in facing large threats."
    },
    academicReferences: [
      {
        author: "Damiana L. Eugenio",
        title: "Philippine Folk Literature: The Myths",
        publicationYear: 1993,
        publisher: "University of the Philippines Press",
        pageReference: "pp. 78-85",
        sourceType: "book"
      },
      {
        author: "Maximo D. Ramos",
        title: "The Creatures of Philippine Lower Mythology",
        publicationYear: 1971,
        publisher: "Phoenix Publishing",
        pageReference: "pp. 55-60",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.BAYANIHAN,
      moralTheme: "Community Action and Cosmic Balance",
      ethicalDilemma: "Do we fight nature's cycles or work within them?",
      culturalWisdom: "The tradition of making noise to save the moon shows bayanihan - the whole community working together for a common good.",
      applicationToModernLife: "This reflects the need for collective action in solving modern global problems like climate change."
    },
    miniGameMechanic: {
      gameType: "pattern_matching",
      instructions: "Match the phases of the moon to restore its light and drive away the shadow.",
      culturalConnection: "Observing lunar phases was crucial for agriculture and fishing in pre-colonial Visayas.",
      successReward: {
        type: "cultural_knowledge",
        value: 1,
        description: "Restore the Moon's light",
        culturalSignificance: "Understanding cosmic cycles leads to harmony with nature"
      },
      failureConsequence: {
         type: "status_effect",
         value: 1,
         description: "Darkness lingers",
         culturalLesson: "Without vigilance, shadows can consume the light."
      }
    },
    regionalOrigin: RegionalOrigin.VISAYAS_CEBUANO,
    educationalObjectives: [
      "Learn the Visayan myth of the Bakunawa and lunar eclipses",
      "Understand the value of Bayanihan (community spirit) in folklore",
      "Connect ancient cosmic beliefs with modern understanding of balance"
    ]
  },
  {
    id: "aswang_deception_educational",
    name: "Aswang's Deception",
    description: [
      "A friendly-looking traveler approaches you on the lonely road.",
      "They offer you food and a safe place to rest for the night.",
      "But you notice their shadow seems detached, and a faint smell of decay lingers.",
      "The traveler smiles, but their eyes remain predatory and cold."
    ],
    choices: [
      {
        text: "Politely decline and keep your distance, trusting your instincts.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 10);
           const overworldState = OverworldGameState.getInstance();
           overworldState.addNextCombatBlock(15);
          return "The traveler's guise flickers, revealing a monstrous form before fleeing. Your discernment saved you. You gain 10 HP and 15 Block/Dodge chance (represented as Block).";
        },
      },
      {
        text: "Confront the creature and demand it reveal its true form.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 25;
          return "The Aswang shrieks, dropping a pouch of stolen goods as it retreats into the dark. Your courage is rewarded. You gain 25 Ginto.";
        },
      },
      {
        text: "Accept the offer, ignoring your suspicions.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.max(1, player.currentHealth - 20);
          return "As you step closer, the illusion breaks! Claws rake your arm before you can defend yourself. You lose 20 HP learning a painful lesson about discernment.";
        },
      },
    ],
    dayEvent: false,
    culturalContext: {
      mythologicalCreature: "Aswang",
      folkloreType: "alamat",
      culturalSignificance: "The Aswang is the most feared creature in Philippine folklore, often shapeshifting to deceive victims. It represents the fear of danger lurking in the familiar.",
      traditionalMeaning: "Aswang stories served as warnings to be cautious of strangers and to stay within the safety of the community, especially at night.",
      contemporaryRelevance: "The lesson of 'pagkilatis' (discernment) teaches us to look beyond appearances and be critical of things that seem too good to be true."
    },
    academicReferences: [
      {
         author: "Maximo D. Ramos",
         title: "The Creatures of Midnight",
         publicationYear: 1990,
         publisher: "Phoenix Publishing",
         pageReference: "pp. 34-41",
         sourceType: "book"
      },
       {
        author: "Maximo D. Ramos",
        title: "The Aswang Syncretic in Philippine Folklore",
        publicationYear: 1969,
        publisher: "Phoenix Publishing",
        pageReference: "pp. 12-20",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.PAKIKIPAGKUNWARE, // Or Pagkilatis if available, but staying within enum
      moralTheme: "Discernment and the Nature of Deception",
      ethicalDilemma: "How do we balance trust with necessary caution?",
      culturalWisdom: "True character is not always visible on the surface. One must observe actions and hints to know the truth.",
      applicationToModernLife: "Critical thinking and discernment are vital in an age of misinformation and scams."
    },
    miniGameMechanic: {
      gameType: "moral_choice_tree",
      instructions: "Observe the traveler's behaviors and choose the correct responses to expose the deception.",
      culturalConnection: "Observing subtle cues (pakiramdam) is a high-context Filipino communication value.",
      successReward: {
        type: "status_effect",
        value: 1,
        description: "Gain 'True Sight'",
        culturalSignificance: "Discernment protects the self and the community"
      },
      failureConsequence: {
        type: "health_loss",
        value: 10,
        description: "Deceived and damaged",
        culturalLesson: "Blind trust can lead to danger."
      }
    },
    regionalOrigin: RegionalOrigin.VISAYAS_HILIGAYNON,
    educationalObjectives: [
      "Understand the shapeshifting nature of the Aswang in Visayan folklore",
      "Practice discernment (pagkilatis) as a traditional value",
      "Recognize the social function of aswang belief in community safety"
    ]
  },
  {
    id: "sirena_conservation_educational",
    name: "Sirena's Call",
    description: [
      "You hear a hauntingly beautiful melody drifting from the rocky cove.",
      "A Sirena sits upon a rock, combing her hair, weeping tears of pearls.",
      "She sings not of luring sailors, but of the dying coral and blackened waters.",
      "Her song is a plea for the ocean's life."
    ],
    choices: [
      {
        text: "Sit and listen to her song of woe, sharing her grief.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 20);
          return "The Sirena sees your empathy. 'The ocean feels your heart,' she whispers. Her song heals your wounds. You gain 20 HP.";
        },
      },
      {
        text: "Promise to clean the shores and protect the waters.",
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
             const availablePotions = [...commonPotions, ...uncommonPotions];
             const randomPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
             player.potions.push(randomPotion);
             return `The Sirena hands you a ${randomPotion.name} from the deep. 'For the guardian of the blue,' she blesses you.`;
          }
          return "She smiles through her tears. 'Your vow is heard by the tides.' You feel blessed.";
        },
      },
      {
        text: "Ask her for a pearl of power.",
        outcome: (context: EventContext) => {
          const { player } = context;
           player.ginto = Math.max(0, player.ginto - 10);
          return "The Sirena dives into the water, offended by your greed. A wave crashes against you, washing away 10 Ginto. 'The ocean is not a treasure chest for the taking!'";
        },
      }
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Sirena",
      folkloreType: "alamat",
      culturalSignificance: "Sirenas are guardians of the sea. While sometimes seen as dangerous, they also represent the beauty and mystery of the ocean that sustains island life.",
      traditionalMeaning: "Tales of Sirenas warned fishermen to respect the sea and not to overfish or desecrate the waters.",
      contemporaryRelevance: "The weeping Sirena symbolizes the degradation of our marine ecosystems and the urgent need for marine conservation."
    },
    academicReferences: [
      {
        author: "Maximo D. Ramos",
        title: "The Creatures of Philippine Lower Mythology",
        publicationYear: 1971,
        publisher: "Phoenix Publishing",
        pageReference: "pp. 60-65",
        sourceType: "book"
      },
       {
        author: "F. Landa Jocano",
        title: "Philippine Mythology",
        publicationYear: 1969,
        publisher: "PUNLAD Research House",
        pageReference: "pp. 88-92",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.MALASAKIT,
      moralTheme: "Marine Conservation and Respect for Nature",
      ethicalDilemma: "Do we see nature as a resource to exploit or a kin to protect?",
      culturalWisdom: "Malasakit for the ocean ensures it continues to provide for the community.",
      applicationToModernLife: "Supporting sustainable fishing and reducing ocean pollution are modern acts of respecting the Sirena's domain."
    },
    miniGameMechanic: {
      gameType: "memory_game",
      instructions: "Listen to the ocean's melody (sequence) and repeat it to harmonize with the Sirena.",
      culturalConnection: "Oral traditions and songs were the primary way of passing knowledge in pre-colonial times.",
      successReward: {
        type: "cultural_knowledge",
        value: 1,
        description: "Harmony with the Sea",
        culturalSignificance: "Listening to nature is the first step to protecting it"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "The song fades unheard",
        culturalLesson: "If we do not listen to nature's warnings, we lose its wisdom."
      }
    },
    regionalOrigin: RegionalOrigin.VISAYAS_HILIGAYNON, // and Bicolano
    educationalObjectives: [
      "Reframe Sirena myths in the context of environmental protection",
      "Understand the dependence of Filipino communities on the sea",
      "Promote marine conservation values through folklore"
    ]
  },
   {
    id: "bantay_tubig_educational",
    name: "Guardian of the Waters",
    description: [
      "You find a pristine freshwater spring flowing into the sea.",
      "A Bantay Tubig (Water Guardian) manifests as a shifting form of clear water.",
      "It blocks your path to the spring, testing your intentions.",
      "'Water is life,' it murmurs. 'Do you know how to cherish it?'"
    ],
    choices: [
      {
        text: "Take only what you need and offer thanks.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 15);
           player.maxDiscardCharges += 1;
          return "The guardian steps aside. 'Respect flows both ways.' The water refreshes you more than usual. You gain 15 HP and 1 discard charge.";
        },
      },
      {
        text: "Demonstrate your knowledge of water conservation.",
        outcome: (context: EventContext) => {
          const { player } = context;
            // Add a small temporary buff or item
           if (player.potions.length < 3) {
             const availablePotions = commonPotions;
             const potion = availablePotions[0]; // Just a simple one
             player.potions.push(potion);
              return `The guardian nods. 'Knowledge preserves life.' It gifts you a ${potion.name}.`;
           }
          return "The guardian nods. 'Wisdom is the vessel of life.' You feel enlightened.";
        },
      },
      {
        text: "Barge through to fill your waterskins.",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.max(1, player.currentHealth - 10);
          return "The water turns boiling hot at your touch! 'Greed burns the throat.' You lose 10 HP.";
        },
      }
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Bantay Tubig",
      folkloreType: "alamat",
      culturalSignificance: "Spirits that guard bodies of water, ensuring they are not abused or polluted. They punish those who disrespect the water source.",
      traditionalMeaning: "Water was sacred and communal; disrespecting it was a crime against the community and the spirits.",
      contemporaryRelevance: "Water security is a pressing modern issue. The Bantay Tubig reminds us that water is a finite and sacred resource."
    },
    academicReferences: [
      {
        author: "Francisco R. Demetrio",
        title: "Encyclopedia of Philippine Folk Beliefs and Customs",
        publicationYear: 1991,
        publisher: "Xavier University Press",
        pageReference: "pp. 245-250",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.MALASAKIT,
      moralTheme: "Resource Stewardship",
      ethicalDilemma: "Individual need vs Community sustainability",
      culturalWisdom: "Take only what is needed, leave the rest for others and for the future.",
      applicationToModernLife: "Sustainable consumption and water conservation practices."
    },
    miniGameMechanic: {
      gameType: "riddle",
      instructions: "Answer the Guardian's riddle about the nature of water.",
      culturalConnection: "Riddles test wisdom and connection to natural elements.",
      successReward: {
        type: "status_effect",
        value: 1,
        description: "Water's Blessing",
        culturalSignificance: "Understanding nature yields its benefits"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Access denied",
        culturalLesson: "Ignorance of nature leads to scarcity."
      }
    },
    regionalOrigin: RegionalOrigin.VISAYAS_CEBUANO,
    educationalObjectives: [
      "Learn about Bantay Tubig and water spirits",
      "Understand the sacredness of water in Filipino culture",
      "Practice sustainable resource use"
    ]
  },
  {
    id: "diwata_dagat_educational",
    name: "Diwata ng Dagat",
    description: [
      "A sudden calm befalls the turbulent waves.",
      "Walking upon the surface is the Diwata ng Dagat, regal and commanding.",
      "Fish leap around her in joy, and the wind whispers her name.",
      "She regards you with eyes as deep as the trench."
    ],
    choices: [
      {
        text: "Bow deeply and offer a pearl or shell found on the beach.",
        outcome: (context: EventContext) => { 
           const { player } = context;
           if (player.relics.length < 6) {
              const availableRelics = treasureRelics; // Use treasure relics for this special encounter
              const relic = availableRelics[0]; 
              player.relics.push(relic);
              return `She smiles at your simple, natural gift. 'The ocean returns what is given.' You receive a ${relic.name}.`;
           }
           player.ginto += 50;
           return "She smiles. 'The ocean is generous to the respectful.' You find 50 Ginto washed up at your feet.";
        },
      },
      {
        text: "Ask for safe passage to the next island.",
      {
        text: "Ask for safe passage to the next island.",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(30);
          return "She nods. 'The waves shall carry you gently.' You gain 30 Block for your next combat (Safe Passage).";
        },
      },
      },
      {
        text: "Demand she calm the storms for your journey.",
        outcome: () => {
           // Negative outcome
           // player.addCurse("Storm's Wrath"); // If curses existed
           return "Her eyes darken. 'The sea obeys no master but itself.' A sudden squall drenches you, leaving you cold and shaken. (No effect, just warning).";
        }
      }
    ],
    dayEvent: true,
    culturalContext: {
      mythologicalCreature: "Diwata ng Dagat",
      folkloreType: "alamat",
      culturalSignificance: "The supreme ruler of the seas in some Visayan myths. She commands the fish and the waves.",
      traditionalMeaning: "Fishermen would offer the first catch to the Diwata to ensure a bountiful season.",
      contemporaryRelevance: "Respecting the 'rules' of the ocean (seasons, protected areas) is akin to respecting the Diwata's laws."
    },
    academicReferences: [
      {
        author: "F. Landa Jocano",
        title: "Philippine Mythology",
        publicationYear: 1969,
        publisher: "PUNLAD Research House",
        pageReference: "pp. 80-85",
        sourceType: "book"
      }
    ],
    valuesLesson: {
      primaryValue: FilipinoValue.UTANG_NA_LOOB,
      moralTheme: "Gratitude and Reciprocity",
      ethicalDilemma: "Do we owe nature for what we take?",
      culturalWisdom: "Utang na loob ensures we give back for the bounty we receive, maintaining the cycle of abundance.",
      applicationToModernLife: "Supporting ocean cleanup and conservation is paying our 'utang na loob' to the planet that sustains us."
    },
    miniGameMechanic: {
      gameType: "traditional_game",
      instructions: "Perform the ritual offering correctly (sequence game).",
      culturalConnection: "Rituals maintain the bond between humans and spirits.",
      successReward: {
        type: "cultural_knowledge",
        value: 1,
        description: "Ritual Mastery",
        culturalSignificance: "Correct action maintains cosmic order"
      },
      failureConsequence: {
        type: "missed_opportunity",
        value: 0,
        description: "Ritual failed",
        culturalLesson: "Carelessness disrupts the harmony."
      }
    },
    regionalOrigin: RegionalOrigin.VISAYAS_CEBUANO,
    educationalObjectives: [
      "Understand the hierarchy of spirits in Visayan mythology",
      "Learn about reciprocity (utang na loob) in environmental relations",
      "Appreciate the spiritual dimension of fishing and sea travel"
    ]
  }
];
