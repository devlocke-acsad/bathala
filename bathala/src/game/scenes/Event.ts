
import { Scene } from 'phaser';
import { GameState } from '../../core/managers/GameState';
import { Player, Potion } from '../../core/types/CombatTypes';
import { GameEvent } from '../../data/events/EventTypes';
import { Act1Events } from '../../data/events/Act1Events';
import { OverworldGameState } from '../../core/managers/OverworldGameState';
import { Relic } from '../../core/types/CombatTypes';

export class EventScene extends Scene {
  private player!: Player;
  private currentEvent!: GameEvent;
  private descriptionTexts: Phaser.GameObjects.Text[] = [];
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private eventBackground!: Phaser.GameObjects.Graphics;
  private descriptionContainer!: Phaser.GameObjects.Container;
  private resultText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'EventScene' });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    // Randomly select from available events
    const availableEvents = Act1Events;
    this.currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  }

  create() {
    this.createBackground();
    this.createEventDisplay();
    this.createChoices();
  }

  private createBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create semi-transparent background
    this.eventBackground = this.add.graphics();
    this.eventBackground.fillStyle(0x000000, 0.8);
    this.eventBackground.fillRect(0, 0, width, height);
  }

  private createEventDisplay(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create event panel
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.lineStyle(3, 0x00d4ff, 0.9);
    const panelWidth = 700;
    const panelHeight = 500;
    const panelX = width / 2;
    const panelY = height / 2 - 50;
    panel.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panel.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);

    // Inner highlight
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0x00ffff, 0.3);
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 3, -panelHeight/2 + 3, panelWidth - 6, panelHeight - 6, 17);

    // Event title
    const title = this.add.text(panelX, panelY - 200, this.currentEvent.name, {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '32px',
      color: '#00d4ff'
    }).setOrigin(0.5);

    // Create description container
    this.descriptionContainer = this.add.container(panelX, panelY - 100);

    // Add description text lines
    this.descriptionTexts = [];
    const lineHeight = 30;
    this.currentEvent.description.forEach((line, index) => {
      const text = this.add.text(0, index * lineHeight, line, {
        fontFamily: 'dungeon-mode',
        fontSize: '18px',
        color: '#ffffff',
        wordWrap: { width: 600 },
        align: 'center'
      }).setOrigin(0.5);
      this.descriptionTexts.push(text);
      this.descriptionContainer.add(text);
    });

    // Add all elements to the scene
    this.add.existing(panel);
    this.add.existing(innerHighlight);
    this.add.existing(title);
  }

  private createChoices(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const buttonY = height / 2 + 120;
    
    // Create choice buttons
    this.currentEvent.choices.forEach((choice, index) => {
      const button = this.createChoiceButton(
        width / 2 + (index - (this.currentEvent.choices.length - 1) / 2) * 250, 
        buttonY, 
        choice.text,
        () => this.handleChoice(choice)
      );
      this.choiceButtons.push(button);
    });
  }

  private createChoiceButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    // Calculate button dimensions based on text
    const tempText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: '#ffffff'
    });
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();

    const padding = 20;
    const buttonWidth = Math.max(200, textWidth + padding);
    const buttonHeight = Math.max(40, textHeight + 10);

    // Button background
    const background = this.add.graphics();
    background.fillStyle(0x333333, 0.9);
    background.lineStyle(2, 0x555555, 1);
    background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);

    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      background.clear();
      background.fillStyle(0x555555, 0.95);
      background.lineStyle(2, 0x00d4ff, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });

    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(0x333333, 0.9);
      background.lineStyle(2, 0x555555, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
    });

    button.on('pointerdown', callback);

    return button;
  }

  private handleChoice(choice: any): void {
    // Execute the outcome with actual game effects
    this.executeChoiceOutcome(choice.text);

    // Record the action for day/night cycle
    const overworldState = OverworldGameState.getInstance();
    overworldState.recordAction();

    // Show result and transition back to overworld after delay
    this.showResult(choice.text);

    // Update player data in GameState
    const gameState = GameState.getInstance();
    gameState.updatePlayerData(this.player);
  }

  private executeChoiceOutcome(choiceText: string): void {
    // Process the choice based on its text content
    if (choiceText.includes("Heal 20 HP")) {
      // Heal 20 HP (without exceeding max HP)
      this.player.currentHealth = Math.min(
        this.player.maxHealth, 
        this.player.currentHealth + 20
      );
      console.log(`Player healed 20 HP. Current HP: ${this.player.currentHealth}/${this.player.maxHealth}`);
    } else if (choiceText.includes("Gain 15 block")) {
      // Gain 15 block
      this.player.block += 15;
      console.log(`Player gained 15 block. Current block: ${this.player.block}`);
    } else if (choiceText.includes("Upgrade a random card")) {
      // For now, just a log - card upgrading system would be implemented elsewhere
      console.log("Player upgraded a random card.");
    } else if (choiceText.includes("Gain 20 Ginto")) {
      // Gain 20 Ginto
      this.player.ginto += 20;
      console.log(`Player gained 20 Ginto. Current Ginto: ${this.player.ginto}`);
    } else if (choiceText.includes("Gain a random potion")) {
      // Add a random potion to player's inventory (up to 3)
      const potions: Potion[] = [
        {
          id: "clarity_potion",
          name: "Potion of Clarity",
          description: "Draw 3 cards.",
          effect: "draw_3_cards",
          emoji: "🧠",
          rarity: "common" as const
        },
        {
          id: "fortitude_potion",
          name: "Elixir of Fortitude", 
          description: "Gain 15 Block.",
          effect: "gain_15_block",
          emoji: "🛡️",
          rarity: "common" as const
        },
        {
          id: "strength_potion",
          name: "Strength Tonic",
          description: "Gain 2 Strength for next combat.",
          effect: "gain_2_strength",
          emoji: "💪",
          rarity: "common" as const
        }
      ];
      
      if (this.player.potions.length < 3) {
        const randomPotion = potions[Math.floor(Math.random() * potions.length)];
        this.player.potions.push(randomPotion);
        console.log(`Player gained a ${randomPotion.name} potion. Current potions: ${this.player.potions.length}`);
      } else {
        console.log("Player already has 3 potions, can't carry more.");
      }
    } else if (choiceText.includes("Gain 2 discard charges")) {
      // Gain 2 discard charges (with max limit)
      this.player.discardCharges = Math.min(5, this.player.discardCharges + 2);
      console.log(`Player gained 2 discard charges. Current discard charges: ${this.player.discardCharges}`);
    } else if (choiceText.includes("Gain a random relic")) {
      // Add a random relic to player's inventory (up to 6)
      const relics: Relic[] = [
        {
          id: "balete_root",
          name: "Balete Root",
          description: "+2 block per Lupa card",
          emoji: "🌱"
        },
        {
          id: "wind_ward",
          name: "Wind Ward",
          description: "+1 draw on Air cards",
          emoji: "💨"
        },
        {
          id: "sigbin_heart",
          name: "Sigbin Heart",
          description: "+5 damage on burst",
          emoji: "❤️"
        }
      ];
      
      if (this.player.relics.length < 6) {
        const randomRelic = relics[Math.floor(Math.random() * relics.length)];
        this.player.relics.push(randomRelic);
        console.log(`Player gained a ${randomRelic.name} relic. Current relics: ${this.player.relics.length}`);
      } else {
        console.log("Player already has 6 relics, can't carry more.");
      }
    } else if (choiceText.includes("Gain 50 Spirit Fragments")) {
      // For now, treat Spirit Fragments as diamante (since player has diamante property)
      this.player.diamante += 50;
      console.log(`Player gained 50 Spirit Fragments (as diamante). Current diamante: ${this.player.diamante}`);
    } else if (choiceText.includes("Gain 1 Dexterity")) {
      // For now, just log this - Dexterity is permanent stat that would be implemented elsewhere
      console.log("Player gained 1 Dexterity (permanent stat increase).");
    } else if (choiceText.includes("Gain 1 Strength")) {
      // For now, just log this - Strength is permanent stat that would be implemented elsewhere
      console.log("Player gained 1 Strength (permanent stat increase).");
    } else if (choiceText.includes("Fully heal HP")) {
      // Fully heal HP
      this.player.currentHealth = this.player.maxHealth;
      console.log(`Player fully healed. Current HP: ${this.player.currentHealth}/${this.player.maxHealth}`);
    } else if (choiceText.includes("Getting attacked")) {
      // For now, just log this - would trigger a combat scene
      console.log("Player chose to investigate the Tiyanak's wail - getting attacked!");
    } else {
      // Default case for choices that don't have specified effects
      console.log(`Player made a choice: ${choiceText}`);
    }
  }

  private showResult(outcome: string): void {
    // Create result text
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Clear previous result if any
    if (this.resultText) {
      this.resultText.destroy();
    }

    // Create result text
    this.resultText = this.add.text(width / 2, height / 2 + 180, `Chose: ${outcome}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5).setAlpha(0);

    // Animate the result text
    this.tweens.add({
      targets: this.resultText,
      alpha: 1,
      scale: 1.1,
      duration: 500,
      ease: 'Power2',
      yoyo: true,
      repeat: 0
    });

    // Schedule return to overworld after delay
    this.time.delayedCall(2000, () => {
      this.scene.stop('EventScene');
      this.scene.resume('Overworld');
    });
  }
}
