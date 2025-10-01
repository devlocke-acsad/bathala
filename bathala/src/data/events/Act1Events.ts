
import { GameEvent } from "./EventTypes";

export const Act1Events: GameEvent[] = [
  {
    id: "anito_shrine",
    name: "Anito Shrine",
    description: [
      "You find a small shrine dedicated to the anito.",
      "The air hums with a forgotten power.",
      "A sense of peace washes over you.",
    ],
    choices: [
      {
        text: "Pray at the shrine. (Heal 20 HP)",
        outcome: () => {
          console.log("Player chose to pray at the Anito Shrine. Healing 20 HP.");
          // Actual implementation would be handled by the scene
          // This would update player's health by 20 points
        },
      },
      {
        text: "Meditate in silence. (Gain 15 block)",
        outcome: () => {
          console.log("Player chose to meditate at the Anito Shrine. Gaining 15 block.");
          // Actual implementation would be handled by the scene
          // This would grant 15 block to the player
        },
      },
      {
        text: "Leave.",
        outcome: () => {
          console.log("Player chose to leave the Anito Shrine.");
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "balete_vision",
    name: "Balete Vision",
    description: [
      "A massive balete tree stands before you, its roots twisting like gnarled fingers.",
      "You feel a strange pull towards it, a whisper of ancient secrets.",
    ],
    choices: [
      {
        text: "Touch the tree. (Upgrade a random card)",
        outcome: () => {
          console.log("Player chose to touch the Balete Tree. Upgrading a random card.");
          // Actual implementation would be handled by the scene
          // This would upgrade a random card in the player's deck
        },
      },
      {
        text: "Step away. (Gain 20 Ginto)",
        outcome: () => {
          console.log("Player chose to step away from the Balete Tree. Gaining 20 Ginto.");
          // Actual implementation would be handled by the scene
          // This would grant 20 Ginto to the player
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "diwata_whisper",
    name: "Diwata Whisper",
    description: [
      "A gentle breeze carries a sweet melody.",
      "You catch a glimpse of a diwata, a forest spirit, flitting between the trees.",
      "She whispers of a hidden spring.",
    ],
    choices: [
      {
        text: "Follow the whisper. (Gain a random potion)",
        outcome: () => {
          console.log("Player chose to follow the Diwata's whisper. Gaining a random potion.");
          // Actual implementation would be handled by the scene
          // This would grant a random potion to the player
        },
      },
      {
        text: "Ignore the whisper. (Gain 2 discard charges)",
        outcome: () => {
          console.log("Player chose to ignore the Diwata's whisper. Gaining 2 discard charges.");
          // Actual implementation would be handled by the scene
          // This would grant 2 discard charges to the player
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "forgotten_altar",
    name: "Forgotten Altar",
    description: [
      "You stumble upon a forgotten altar, covered in moss and vines.",
      "An offering of a single, perfect flower lies in the center.",
    ],
    choices: [
      {
        text: "Take the flower. (Gain a random relic)",
        outcome: () => {
          console.log("Player chose to take the flower from the Forgotten Altar. Gaining a random relic.");
          // Actual implementation would be handled by the scene
          // This would grant a random relic to the player
        },
      },
      {
        text: "Leave it be.",
        outcome: () => {
          console.log("Player chose to leave the flower at the Forgotten Altar.");
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "tikbalang_crossroads",
    name: "Tikbalang Crossroads",
    description: [
      "You arrive at a crossroads, but something is wrong.",
      "The path seems to shift and twist before your eyes.",
      "A tall, horse-headed figure watches you from the shadows.",
    ],
    choices: [
      {
        text: "Ask the tikbalang for directions. (Gain 15% more rewards from next 3 combats)",
        outcome: () => {
          console.log("Player chose to ask the Tikbalang for directions. Gain 15% more rewards from next 3 combats.");
          // Actual implementation would be handled by the scene
          // This would apply a buff for next 3 combats
        },
      },
      {
        text: "Choose a path yourself. (Skip next combat)",
        outcome: () => {
          console.log("Player chose to choose a path themselves. Skipping next combat.");
          // Actual implementation would be handled by the scene
          // This would allow player to skip next combat
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "ancestral_echo",
    name: "Ancestral Echo",
    description: [
      "A chorus of voices echoes through the trees, speaking in a language you don't understand.",
      "Yet, you feel a sense of connection to them, a feeling of coming home.",
    ],
    choices: [
      {
        text: "Listen to the voices. (Gain 50 Spirit Fragments)",
        outcome: () => {
          console.log("Player chose to listen to the Ancestral Echo. Gaining 50 Spirit Fragments.");
          // Actual implementation would be handled by the scene
          // This would grant 50 Spirit Fragments to the player
        },
      },
      {
        text: "Block out the noise. (Gain 1 Dexterity)",
        outcome: () => {
          console.log("Player chose to block out the Ancestral Echo. Gaining 1 Dexterity.");
          // Actual implementation would be handled by the scene
          // This would grant 1 permanent Dexterity to the player
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "kapres_smoke",
    name: "Kapre's Smoke",
    description: [
      "The air grows thick with the smell of tobacco.",
      "You see a large, hairy creature perched on a branch, smoking a massive cigar.",
      "It's a kapre, a giant of the forest.",
    ],
    choices: [
      {
        text: "Approach the kapre. (Gain 1 Strength)",
        outcome: () => {
          console.log("Player chose to approach the Kapre. Gaining 1 Strength.");
          // Actual implementation would be handled by the scene
          // This would grant 1 permanent Strength to the player
        },
      },
      {
        text: "Avoid the kapre.",
        outcome: () => {
          console.log("Player chose to avoid the Kapre.");
        },
      },
    ],
    dayEvent: false,
  },
  {
    id: "wind_omen",
    name: "Wind Omen",
    description: [
      "A sudden gust of wind rustles the leaves around you.",
      "It seems to whisper a warning, a premonition of what's to come.",
    ],
    choices: [
      {
        text: "Heed the warning. (Start next combat with 20 block)",
        outcome: () => {
          console.log("Player chose to heed the Wind Omen. Start next combat with 20 block.");
          // Actual implementation would be handled by the scene
          // This would grant 20 block for the next combat
        },
      },
      {
        text: "Ignore the omen.",
        outcome: () => {
          console.log("Player chose to ignore the Wind Omen.");
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "sacred_grove",
    name: "Sacred Grove",
    description: [
      "You enter a grove of ancient trees, their branches reaching towards the sky like praying hands.",
      "The air is still and silent, filled with a sense of reverence.",
    ],
    choices: [
      {
        text: "Rest in the grove. (Fully heal HP)",
        outcome: () => {
          console.log("Player chose to rest in the Sacred Grove. Fully healing HP.");
          // Actual implementation would be handled by the scene
          // This would fully heal the player's HP
        },
      },
      {
        text: "Move on.",
        outcome: () => {
          console.log("Player chose to move on from the Sacred Grove.");
        },
      },
    ],
    dayEvent: true,
  },
  {
    id: "tiyanak_wail",
    name: "Tiyanak Wail",
    description: [
      "You hear the cry of a baby, lost and alone in the forest.",
      "But as you get closer, the cry begins to sound distorted, unnatural.",
    ],
    choices: [
      {
        text: "Investigate the cry.",
        outcome: () => {
          console.log("Player chose to investigate the Tiyanak's wail. Getting attacked!");
          // Actual implementation would be handled by the scene
          // This would trigger a combat encounter
        },
      },
      {
        text: "Ignore the cry.",
        outcome: () => {
          console.log("Player chose to ignore the Tiyanak's wail.");
        },
      },
    ],
    dayEvent: false,
  },
];
