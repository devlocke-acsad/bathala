import { GameEvent, EventContext } from "./EventTypes";
import { commonPotions, uncommonPotions } from "../potions/Act1Potions";
import { commonRelics, treasureRelics } from "../relics/Act1Relics";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

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
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = Math.min(player.maxHealth, player.currentHealth + 20);
          return "You feel the anito blessing restore your vitality.";
        },
      },
      {
        text: "Meditate in silence. (Gain 15 block)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(15);
          return "Your meditation hardens your resolve. You will start your next combat with 15 block.";
        },
      },
      {
        text: "Leave.",
        outcome: () => {
          return "You respectfully leave the shrine undisturbed.";
        },
      },
    ],
    dayEvent: true,
  },
  {//gold works
    id: "balete_vision",
    name: "Balete Vision",
    description: [
      "A massive balete tree stands before you, its roots twisting like gnarled fingers.",
      "You feel a strange pull towards it, a whisper of ancient secrets.",
    ],
    choices: [
      {
        text: "Touch the tree. (Upgrade a random card)",
        outcome: (context: EventContext) => {
          const { player } = context;
          const upgradeableCards = player.deck.filter(card => {
            const rank = card.rank;
            const numRank = parseInt(rank as string);
            return !isNaN(numRank) && numRank < 10;
          });
          
          if (upgradeableCards.length > 0) {
            const randomCard = upgradeableCards[Math.floor(Math.random() * upgradeableCards.length)];
            const currentValue = parseInt(randomCard.rank as string);
            randomCard.rank = (currentValue + 1).toString() as any;
            return `The tree upgrades your ${randomCard.suit} ${currentValue} to ${currentValue + 1}!`;
          }
          return "The tree finds no cards to upgrade.";
        },
      },
      {
        text: "Step away. (Gain 20 Ginto)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.ginto += 20;
          return "You find 20 Ginto on the ground.";
        },
      },
    ],
    dayEvent: false,
  },
  {//works
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
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.potions.length < 3) {
            const availablePotions = [...commonPotions, ...uncommonPotions];
            const randomPotion = availablePotions[Math.floor(Math.random() * availablePotions.length)];
            player.potions.push(randomPotion);
            return `The diwata guides you to a ${randomPotion.name}.`;
          }
          return "Your potion pouch is already full.";
        },
      },
      {
        text: "Ignore the whisper. (Gain 2 discard charges)",
        outcome: (context: EventContext) => {
          const { player } = context;
          player.maxDiscardCharges += 2;
          return "You gain more tactical flexibility in combat.";
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
        outcome: (context: EventContext) => {
          const { player } = context;
          if (player.relics.length < 6) {
            const availableRelics = [...commonRelics, ...treasureRelics];
            const randomRelic = availableRelics[Math.floor(Math.random() * availableRelics.length)];
            player.relics.push(randomRelic);
            return `The altar grants you ${randomRelic.name}.`;
          }
          return "You are carrying too many relics already.";
        },
      },
      {
        text: "Leave it be.",
        outcome: () => {
          return "You leave the offering undisturbed.";
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
        text: "Ask the tikbalang for directions.",
        outcome: () => {
          return "The tikbalang grins mischievously and points you in the right direction.";
        },
      },
      {
        text: "Choose a path yourself.",
        outcome: () => {
          return "You trust your instincts and find a hidden path.";
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
      "It seems to whisper a warning, a premonition of what is to come.",
    ],
    choices: [
      {
        text: "Heed the warning. (Start next combat with 20 block)",
        outcome: () => {
          const overworldState = OverworldGameState.getInstance();
          overworldState.addNextCombatBlock(20);
          return "The wind fortifies you. You will start your next combat with 20 block.";
        },
      },
      {
        text: "Ignore the omen.",
        outcome: () => {
          return "You shake off the superstition and press onward.";
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
        outcome: (context: EventContext) => {
          const { player } = context;
          player.currentHealth = player.maxHealth;
          return "The grove restores you completely.";
        },
      },
      {
        text: "Move on.",
        outcome: () => {
          return "You pay your respects and continue your journey.";
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
          // TODO: Implement forced combat trigger system
          // This should trigger an immediate combat with a Tiyanak enemy
          return "You approach cautiously... it is a trap!";
        },
      },
      {
        text: "Ignore the cry.",
        outcome: () => {
          return "You recognize the deception and wisely avoid the trap.";
        },
      },
    ],
    dayEvent: false,
  },
];
