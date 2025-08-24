import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { Player, Relic } from "../../core/types/CombatTypes";
import { treasureRelics } from "../../data/relics/Act1Relics";

export class Treasure extends Scene {
  private player!: Player;
  private treasureChest!: Phaser.GameObjects.Sprite;
  private relicOptions: Relic[] = [];
  private relicButtons: Phaser.GameObjects.Container[] = [];
  private descriptionText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Treasure" });
  }

  init(data: { player: Player }) {
    this.player = data.player;
    // Select 3 random treasure relics that player doesn't already have
    const availableRelics = treasureRelics.filter(
      relic => !this.player.relics.some(r => r.id === relic.id)
    );
    
    // Shuffle and take first 3
    this.relicOptions = this.shuffleArray([...availableRelics]).slice(0, 3);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Create title
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.add.text(
      screenWidth / 2,
      30,
      "Treasure Chest",
      {
        fontFamily: "Centrion",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create treasure chest
    this.treasureChest = this.add.sprite(screenWidth / 2, screenHeight / 2 - 100, "chest");
    this.treasureChest.setScale(2);
    
    // Try to play animation, fallback if it fails
    try {
      this.treasureChest.play("chest_open");
    } catch (error) {
      console.warn("Chest animation not found, using static sprite");
    }

    // Create description text
    this.descriptionText = this.add.text(
      screenWidth / 2,
      screenHeight / 2,
      "Choose one relic to take with you",
      {
        fontFamily: "Centrion",
        fontSize: 20,
        color: "#ffd93d",
        align: "center",
      }
    ).setOrigin(0.5);

    // Create relic options
    this.createRelicOptions();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private createRelicOptions(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const buttonWidth = 100;
    const buttonHeight = 100;
    const spacing = 50;
    const totalWidth = this.relicOptions.length * buttonWidth + (this.relicOptions.length - 1) * spacing;
    const startX = (screenWidth - totalWidth) / 2 + buttonWidth / 2;
    const y = screenHeight / 2 + 100;

    this.relicButtons = [];

    this.relicOptions.forEach((relic, index) => {
      const x = startX + index * (buttonWidth + spacing);
      
      const button = this.add.container(x, y);
      
      // Background
      const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x2f3542);
      background.setStrokeStyle(2, 0x57606f);
      
      // Relic emoji
      const emoji = this.add.text(0, 0, relic.emoji, {
        fontSize: 48,
      }).setOrigin(0.5);
      
      button.add([background, emoji]);
      
      // Make interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => this.selectRelic(relic, button));
      button.on("pointerover", () => {
        if (button.active) {
          background.setFillStyle(0x3d4454);
          this.showTooltip(relic, x + buttonWidth/2 + 10, y);
        }
      });
      button.on("pointerout", () => {
        if (button.active) {
          background.setFillStyle(0x2f3542);
          this.hideTooltip();
        }
      });
      
      this.relicButtons.push(button);
    });
  }

  private createTooltipBox(): void {
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
  }

  private showTooltip(relic: Relic, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);
    
    // Create tooltip background
    const tooltipBg = this.add.rectangle(0, 0, 250, 120, 0x000000);
    tooltipBg.setAlpha(0.9);
    tooltipBg.setStrokeStyle(2, 0x57606f);
    
    // Relic name
    const name = this.add.text(-115, -50, relic.name, {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#e8eced",
      align: "left",
    }).setOrigin(0, 0);
    
    // Relic description
    const description = this.add.text(-115, -20, relic.description, {
      fontFamily: "Centrion",
      fontSize: 16,
      color: "#a8a8a8",
      align: "left",
      wordWrap: { width: 230 }
    }).setOrigin(0, 0);
    
    // Instruction
    const instruction = this.add.text(-115, 30, "Click to acquire", {
      fontFamily: "Centrion",
      fontSize: 14,
      color: "#2ed573",
      align: "left",
    }).setOrigin(0, 0);
    
    this.tooltipBox.add([tooltipBg, name, description, instruction]);
    this.tooltipBox.setPosition(x, y);
    this.tooltipBox.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipBox.setVisible(false);
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - 120);
    
    const background = this.add.rectangle(0, 0, 180, 50, 0xff4757);
    background.setStrokeStyle(2, 0xffffff);
    
    const text = this.add.text(0, 0, "Leave Treasure", {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    backButton.add([background, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-90, -25, 180, 50),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Complete the treasure node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      this.scene.start("Overworld");
    });
    
    backButton.on("pointerover", () => background.setFillStyle(0xff6b81));
    backButton.on("pointerout", () => background.setFillStyle(0xff4757));
  }

  private selectRelic(relic: Relic, selectedButton: Phaser.GameObjects.Container): void {
    // Add relic to player
    this.player.relics.push(relic);
    
    // Update UI
    this.descriptionText.setText(`You take the ${relic.name}!`);
    this.descriptionText.setColor("#2ed573");
    
    // Disable all relic buttons to prevent multiple selections
    this.relicButtons.forEach(button => {
      button.disableInteractive();
      button.setActive(false);
      const background = button.getAt(0) as Phaser.GameObjects.Rectangle;
      if (background) {
        background.setFillStyle(0x1a1d26);
      }
    });
    
    // Highlight the selected relic
    const background = selectedButton.getAt(0) as Phaser.GameObjects.Rectangle;
    if (background) {
      background.setFillStyle(0x2ed573);
    }
    
    // Show message
    this.showMessage(`Acquired: ${relic.name}`, "#2ed573");
    
    // Hide tooltip
    this.hideTooltip();
    
    // Create a continue button
    this.createContinueButton();
  }

  private createContinueButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const continueButton = this.add.container(screenWidth / 2, screenHeight - 50);
    
    const background = this.add.rectangle(0, 0, 180, 50, 0x2ed573);
    background.setStrokeStyle(2, 0xffffff);
    
    const text = this.add.text(0, 0, "Continue Journey", {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#000000",
    }).setOrigin(0.5);
    
    continueButton.add([background, text]);
    
    continueButton.setInteractive(
      new Phaser.Geom.Rectangle(-90, -25, 180, 50),
      Phaser.Geom.Rectangle.Contains
    );
    
    continueButton.on("pointerdown", () => {
      // Complete the treasure node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      this.scene.start("Overworld");
    });
    
    continueButton.on("pointerover", () => background.setFillStyle(0x4efc9d));
    continueButton.on("pointerout", () => background.setFillStyle(0x2ed573));
  }

  private showMessage(message: string, color: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Remove any existing message
    this.children.getArray().forEach(child => {
      if (child instanceof Phaser.GameObjects.Text && child.y === screenHeight - 100) {
        child.destroy();
      }
    });
    
    const messageText = this.add.text(
      screenWidth / 2,
      screenHeight - 100,
      message,
      {
        fontFamily: "Centrion",
        fontSize: 20,
        color: color,
        align: "center",
      }
    ).setOrigin(0.5);
    
    // Auto-remove after 2 seconds
    this.time.delayedCall(2000, () => {
      messageText.destroy();
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Clear and recreate UI
    this.children.removeAll();
    
    // Recreate all elements
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    this.add.text(
      screenWidth / 2,
      30,
      "Treasure Chest",
      {
        fontFamily: "Centrion",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.treasureChest.setPosition(screenWidth / 2, screenHeight / 2 - 100);
    this.descriptionText.setPosition(screenWidth / 2, screenHeight / 2);
    
    this.createRelicOptions();
    this.createTooltipBox();
    this.createBackButton();
  }
}