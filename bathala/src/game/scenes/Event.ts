
import { Scene } from 'phaser';
import { GameState } from '../../core/managers/GameState';
import { Player, Relic } from '../../core/types/CombatTypes';
import { Potion } from '../../data/potions/Act1Potions';
import { GameEvent } from '../../data/events/EventTypes';
import { Act1Events } from '../../data/events/Act1Events';
import { OverworldGameState } from '../../core/managers/OverworldGameState';

export class EventScene extends Scene {
  private player!: Player;
  private currentEvent!: GameEvent;
  private descriptionText!: Phaser.GameObjects.Text;
  private choiceButtons: Phaser.GameObjects.Container[] = [];
  private eventBackground!: Phaser.GameObjects.Graphics;
  private descriptionContainer!: Phaser.GameObjects.Container;
  private resultText?: Phaser.GameObjects.Text;
  private continueButton?: Phaser.GameObjects.Container;
  private currentDescriptionIndex: number = 0;
  private typingTimer?: Phaser.Time.TimerEvent;
  private illustration!: Phaser.GameObjects.Graphics;
  private continueIndicator!: Phaser.GameObjects.Text;


  constructor() {
    super({ key: 'EventScene' });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    const availableEvents = Act1Events;
    this.currentEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  }

  create() {
    this.createBackground();
    this.createEventDisplay();
    this.createIllustration();
    this.createDescription();
    this.createContinueIndicator();
    this.startEvent();
  }

  private createBackground(): void {
    const { width, height } = this.cameras.main;
    this.eventBackground = this.add.graphics();
    this.eventBackground.fillStyle(0x000000, 0.8);
    this.eventBackground.fillRect(0, 0, width, height);
  }

  private createEventDisplay(): void {
    const { width, height } = this.cameras.main;

    const panelWidth = width * 0.8;
    const panelHeight = height * 0.8;
    const panelX = width / 2;
    const panelY = height / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0a0a0a, 0.9);
    panel.lineStyle(2, 0xffffff, 0.8);
    panel.fillRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 15);
    panel.strokeRoundedRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight, 15);

    const title = this.add.text(panelX, panelY - panelHeight / 2 + 40, this.currentEvent.name, {
      fontFamily: 'dungeon-mode',
      fontSize: '36px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  private createIllustration(): void {
    const { width, height } = this.cameras.main;
    const panelHeight = height * 0.8;
    const illustrationWidth = 300;
    const illustrationHeight = 200;
    const panelX = width / 2;
    const panelY = height / 2;

    this.illustration = this.add.graphics();
    this.illustration.fillStyle(0x1a1a1a, 1);
    this.illustration.fillRect(panelX - illustrationWidth / 2, panelY - panelHeight / 2 + 100, illustrationWidth, illustrationHeight);
  }


  private createDescription(): void {
    const { width, height } = this.cameras.main;
    const panelWidth = width * 0.8;

    this.descriptionContainer = this.add.container(width / 2, height / 2 + 150);

    this.descriptionText = this.add.text(0, 0, '', {
      fontFamily: 'dungeon-mode',
      fontSize: '28px',
      color: '#ffffff',
      wordWrap: { width: panelWidth - 80 },
      align: 'center',
      lineSpacing: 12
    }).setOrigin(0.5);

    this.descriptionContainer.add(this.descriptionText);
  }

  private createContinueIndicator(): void {
    const { width, height } = this.cameras.main;
    this.continueIndicator = this.add.text(width / 2, height - 100, '▼', {
        fontFamily: 'dungeon-mode',
        fontSize: '24px',
        color: '#ffffff'
    }).setOrigin(0.5).setVisible(false);

    this.tweens.add({
        targets: this.continueIndicator,
        alpha: 0,
        duration: 500,
        ease: 'Power1',
        yoyo: true,
        repeat: -1
    });
  }

  private startEvent(): void {
    this.showNextDescription();
  }

  private showNextDescription(): void {
    this.continueIndicator.setVisible(false);
    if (this.currentDescriptionIndex < this.currentEvent.description.length) {
      this.typeDescription(this.currentEvent.description[this.currentDescriptionIndex]);
    } else {
      this.showChoices();
    }
  }

  private typeDescription(text: string): void {
    this.descriptionText.setText('');
    let index = 0;

    this.typingTimer = this.time.addEvent({
      delay: 50, // Slower typing speed
      callback: () => {
        this.descriptionText.setText(this.descriptionText.text + text[index]);
        index++;
        if (index === text.length) {
          this.typingTimer?.remove();
          this.continueIndicator.setVisible(true);
          this.input.once('pointerdown', () => {
            this.currentDescriptionIndex++;
            this.showNextDescription();
          });
        }
      },
      repeat: text.length - 1
    });

    this.input.once('pointerdown', () => {
        if (this.typingTimer) {
            this.typingTimer.remove();
            this.descriptionText.setText(text);
            this.continueIndicator.setVisible(true);
            this.input.once('pointerdown', () => {
                this.currentDescriptionIndex++;
                this.showNextDescription();
            });
        }
    });
  }

  private showChoices(): void {
    if (this.continueButton) {
      this.continueButton.destroy();
      this.continueButton = undefined;
    }

    const { width, height } = this.cameras.main;
    const startY = height / 2 + this.descriptionText.height + 180;

    this.currentEvent.choices.forEach((choice, index) => {
      const buttonY = startY + (index * 70);
      const button = this.createChoiceButton(
        width / 2,
        buttonY,
        choice.text,
        () => this.handleChoice(choice)
      );
      this.choiceButtons.push(button);
    });
  }

  private createChoiceButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const buttonText = this.add.text(0, 0, `> ${text}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.add(buttonText);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonText.width / 2, -buttonText.height / 2, buttonText.width, buttonText.height), Phaser.Geom.Rectangle.Contains);

    button.on('pointerover', () => {
      buttonText.setColor('#ffff00');
    });

    button.on('pointerout', () => {
      buttonText.setColor('#ffffff');
    });

    button.on('pointerdown', callback);

    return button;
  }

  private handleChoice(choice: any): void {
    this.executeChoiceOutcome(choice.text);

    const overworldState = OverworldGameState.getInstance();
    overworldState.recordAction();

    this.showResult(choice.text);

    const gameState = GameState.getInstance();
    gameState.updatePlayerData(this.player);
  }

  private executeChoiceOutcome(choiceText: string): void {
    // This logic remains the same as the original file
    if (choiceText.includes("Heal 20 HP")) {
        this.player.currentHealth = Math.min(this.player.maxHealth, this.player.currentHealth + 20);
    } else if (choiceText.includes("Gain 15 block")) {
        this.player.block += 15;
    } else if (choiceText.includes("Gain 20 Ginto")) {
        this.player.ginto += 20;
    } else if (choiceText.includes("Gain a random potion")) {
        const potions: Potion[] = [
            { id: "clarity_potion", name: "Potion of Clarity", description: "Draw 3 cards.", effect: "draw_3_cards", emoji: "🧠", rarity: "common" as const },
            { id: "fortitude_potion", name: "Elixir of Fortitude", description: "Gain 15 Block.", effect: "gain_15_block", emoji: "🛡️", rarity: "common" as const },
            { id: "strength_potion", name: "Strength Tonic", description: "Gain 2 Strength for next combat.", effect: "gain_2_strength", emoji: "💪", rarity: "common" as const }
        ];
        if (this.player.potions.length < 3) {
            const randomPotion = potions[Math.floor(Math.random() * potions.length)];
            this.player.potions.push(randomPotion);
        }
    } else if (choiceText.includes("Gain a random relic")) {
        const relics: Relic[] = [
            { id: "balete_root", name: "Balete Root", description: "+2 block per Lupa card", emoji: "🌱" },
            { id: "wind_ward", name: "Wind Ward", description: "+1 draw on Air cards", emoji: "💨" },
            { id: "sigbin_heart", name: "Sigbin Heart", description: "+5 damage on burst", emoji: "❤️" }
        ];
        if (this.player.relics.length < 6) {
            const randomRelic = relics[Math.floor(Math.random() * relics.length)];
            this.player.relics.push(randomRelic);
        }
    }
    // ... other outcomes
  }

  private showResult(outcome: string): void {
    const { width, height } = this.cameras.main;

    if (this.resultText) {
      this.resultText.destroy();
    }

    this.resultText = this.add.text(width / 2, height - 60, `Outcome: ${outcome}`, {
      fontFamily: 'dungeon-mode',
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: this.resultText,
      alpha: 1,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          // Complete the event node and return to overworld
          const gameState = GameState.getInstance();
          gameState.completeCurrentNode(true);
          
          // Manually call the Overworld resume method to reset movement flags
          const overworldScene = this.scene.get("Overworld");
          if (overworldScene) {
            (overworldScene as any).resume();
          }
          
          this.scene.stop('EventScene');
          this.scene.resume('Overworld');
        });
      }
    });
  }
}
