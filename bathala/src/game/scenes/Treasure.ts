import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { Player, Relic } from "../../core/types/CombatTypes";
import { act1TreasureRelics } from "../../data/relics";

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
    
    // For now, use Act 1 treasure relics
    // TODO: Implement act-based relic selection when act tracking is added to GameState
    const treasureRelics = act1TreasureRelics;
    
    // Filter out relics player already has
    const availableRelics = treasureRelics.filter(
      relic => !this.player.relics.some(r => r.id === relic.id)
    );
    
    // Separate merchants_scale from other relics for weighted random selection
    const merchantsScale = availableRelics.find(r => r.id === 'merchants_scale');
    const otherRelics = availableRelics.filter(r => r.id !== 'merchants_scale');
    
    // Create weighted pool: merchants_scale has 30% chance to appear (if available)
    let weightedPool: Relic[] = [];
    
    // Add all other relics normally (70% of the pool)
    weightedPool = weightedPool.concat(otherRelics, otherRelics);
    
    // Add merchants_scale with lower weight (30% chance) if available and not owned
    if (merchantsScale && Math.random() < 0.3) {
      weightedPool.push(merchantsScale);
    }
    
    // Shuffle weighted pool and take first 3 unique relics
    const shuffled = this.shuffleArray(weightedPool);
    const uniqueRelics: Relic[] = [];
    const seenIds = new Set<string>();
    
    for (const relic of shuffled) {
      if (!seenIds.has(relic.id) && uniqueRelics.length < 3) {
        uniqueRelics.push(relic);
        seenIds.add(relic.id);
      }
    }
    
    this.relicOptions = uniqueRelics;
  }

  create(): void {
    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }
    
    this.cameras.main.setBackgroundColor(0x0e1112);

    // Create title
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const titleY = Math.max(24, screenHeight * 0.06);
    const title = this.add.text(
      screenWidth / 2,
      titleY,
      "Treasure Chest",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5);
    // Add a soft shadow like in Shop for better readability
    title.setShadow(2, 2, '#000000', 3, false, true);

    // Create treasure chest
    const chestY = Math.min(screenHeight * 0.42, screenHeight / 2 - 80);
    this.treasureChest = this.add.sprite(screenWidth / 2, chestY, "chest");
    this.treasureChest.setScale(2);
    
    // Try to play animation, fallback if it fails
    try {
      this.treasureChest.play("chest_open");
    } catch (error) {
      console.warn("Chest animation not found, using static sprite");
    }

    // Entrance animation to match Shop feel
    this.treasureChest.setScale(1.8).setAlpha(0.85);
    this.tweens.add({
      targets: this.treasureChest,
      scale: 2,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Create description text
    const descY = Math.min(chestY + 110, screenHeight * 0.6);
    this.descriptionText = this.add.text(
      screenWidth / 2,
      descY,
      "Choose a relic to add to your collection",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#ffd93d",
        align: "center",
        wordWrap: { width: Math.max(240, Math.floor(screenWidth * 0.8)) }
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
    const isNarrow = screenWidth < 520;
    const buttonWidth = isNarrow ? 84 : 100;
    const buttonHeight = isNarrow ? 84 : 100;
    const spacing = isNarrow ? 28 : 50;
    const totalWidth = this.relicOptions.length * buttonWidth + (this.relicOptions.length - 1) * spacing;
    const startX = (screenWidth - totalWidth) / 2 + buttonWidth / 2;
    const y = Math.min(this.descriptionText.y + (isNarrow ? 110 : 130), screenHeight - (isNarrow ? 90 : 110));

    this.relicButtons = [];

    this.relicOptions.forEach((relic, index) => {
      const x = startX + index * (buttonWidth + spacing);
      
      const button = this.add.container(x, y);
      
      // Background styled similar to Shop's slots (gradient and rounded corners via Graphics)
      const slotBg = this.add.graphics();
      slotBg.fillGradientStyle(0x2f3542, 0x2f3542, 0x1a1d26, 0x1a1d26, 0.95);
      slotBg.lineStyle(2, 0x57606f, 0.9);
      slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      
      // Relic emoji
      const emoji = this.add.text(0, 0, relic.emoji, {
        fontSize: isNarrow ? 40 : 48,
      }).setOrigin(0.5);
      
      button.add([slotBg, emoji]);
      
      // Make interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => this.selectRelic(relic, button));
      button.on("pointerover", () => {
        if (button.active) {
          // Hover glow and scale like Shop
          this.tweens.add({ targets: button, scale: 1.05, duration: 120, ease: 'Power2' });
          slotBg.clear();
          slotBg.fillGradientStyle(0x3d4454, 0x3d4454, 0x232735, 0x232735, 1);
          slotBg.lineStyle(3, 0xa78bfa, 0.9);
          slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          this.showTooltip(relic, x + buttonWidth/2 + 10, y);
        }
      });
      button.on("pointerout", () => {
        if (button.active) {
          this.tweens.add({ targets: button, scale: 1, duration: 150, ease: 'Power2' });
          slotBg.clear();
          slotBg.fillGradientStyle(0x2f3542, 0x2f3542, 0x1a1d26, 0x1a1d26, 0.95);
          slotBg.lineStyle(2, 0x57606f, 0.9);
          slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          this.hideTooltip();
        }
      });
      
      this.relicButtons.push(button);

      // Entrance animation (staggered) for each option
      button.setScale(0.85).setAlpha(0);
      this.tweens.add({
        targets: button,
        scale: 1,
        alpha: 1,
        duration: 250,
        ease: 'Back.easeOut',
        delay: 100 + index * 80
      });
    });
  }

  private createTooltipBox(): void {
    this.tooltipBox = this.add.container(0, 0);
    this.tooltipBox.setVisible(false);
  }

  private showTooltip(relic: Relic, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);
    
    // Determine dynamic width based on screen size
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const minWidth = 240;
    const maxWidth = Math.max(300, Math.floor(camW * 0.55));
    const tooltipWidth = Phaser.Math.Clamp(280, minWidth, maxWidth);
    const horizontalPadding = 16;
    const verticalPadding = 14;
    const spacingSmall = 8;
    const spacingLarge = 12;

    // Relic name (allow wrap if long)
    const nameText = this.add.text(0, 0, relic.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffd93d",
      align: "center",
      wordWrap: { width: tooltipWidth - horizontalPadding * 2 }
    }).setOrigin(0.5, 0);
    nameText.setShadow(1, 1, '#000000', 2, false, true);

    // Relic description with wrap to the computed width
    const descText = this.add.text(0, 0, relic.description, {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced",
      align: "center",
      wordWrap: { width: tooltipWidth - horizontalPadding * 2 }
    }).setOrigin(0.5, 0);

    // Instruction line
    const instruction = this.add.text(0, 0, "Click to acquire", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#2ed573",
      align: "center",
    }).setOrigin(0.5, 0);

    // Measure content heights after wrapping
    const nameHeight = nameText.getBounds().height;
    const descHeight = descText.getBounds().height;
    const instrHeight = instruction.getBounds().height;

    // Compute dynamic height
    const contentHeight = nameHeight + spacingSmall + descHeight + spacingLarge + instrHeight;
    const tooltipHeight = Math.ceil(contentHeight + verticalPadding * 2);

    // Position texts vertically within the tooltip
    let currentY = -tooltipHeight / 2 + verticalPadding;
    nameText.setY(currentY);
    currentY += nameHeight + spacingSmall;
    descText.setY(currentY);
    currentY += descHeight + spacingLarge;
    instruction.setY(currentY);

    // Background styled like Shop (rounded graphics + slight gradient)
    const tooltipBg = this.add.graphics();
    tooltipBg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.95);
    tooltipBg.lineStyle(2, 0x57606f, 1);
    tooltipBg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);
    tooltipBg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 10);

    // Add in correct drawing order
    this.tooltipBox.add([tooltipBg, nameText, descText, instruction]);

    // Clamp tooltip position to screen bounds with margin
    const margin = 14;
    const clampedX = Math.min(Math.max(margin + tooltipWidth/2, x), camW - margin - tooltipWidth/2);
    const clampedY = Math.min(Math.max(margin + tooltipHeight/2, y), camH - margin - tooltipHeight/2);
    this.tooltipBox.setPosition(clampedX, clampedY);
    this.tooltipBox.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipBox.setVisible(false);
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const buttonText = "Leave Treasure";
    const baseWidth = 180;
    const buttonHeight = 50;
    const fontSize = screenWidth < 480 ? 18 : 20;
    const horizontalPadding = 28;
    
    const backButton = this.add.container(screenWidth / 2, screenHeight - 120);
    
    // Create text first to measure its width
    const text = this.add.text(0, 0, buttonText, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: fontSize,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    const measuredTextWidth = Math.ceil(text.width);
    const buttonWidth = Math.max(baseWidth, measuredTextWidth + horizontalPadding);
    
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0xff4757);
    background.setStrokeStyle(2, 0xffffff);
    
    // Add to container with background behind text
    backButton.add([background, text]);
    
    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    backButton.on("pointerdown", () => {
      // Complete the treasure node and return to overworld
      const gameState = GameState.getInstance();
      gameState.completeCurrentNode(true);
      
      // Manually call the Overworld resume method to reset movement flags
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop();
      this.scene.resume("Overworld");
    });
    
    backButton.on("pointerover", () => background.setFillStyle(0xff6b81));
    backButton.on("pointerout", () => background.setFillStyle(0xff4757));
  }

  private selectRelic(relic: Relic, selectedButton: Phaser.GameObjects.Container): void {
    // Add relic to player
    this.player.relics.push(relic);
    
    // Apply immediate relic acquisition effects (healing, stat boosts, etc.)
    RelicManager.applyRelicAcquisitionEffect(relic.id, this.player);
    
    // Persist updated player data so relic is kept after leaving the scene
    const gameState = GameState.getInstance();
    gameState.updatePlayerData(this.player);
    
    // Update UI
    this.descriptionText.setText(`You take the ${relic.name}!`);
    this.descriptionText.setColor("#2ed573");
    
    // Disable all relic buttons to prevent multiple selections
    this.relicButtons.forEach(button => {
      button.disableInteractive();
      button.setActive(false);
      // Redraw slot background (Graphics) to a dimmed state
      const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics | undefined;
      if (slotBg && slotBg.clear) {
        slotBg.clear();
        const buttonWidth = 100;
        const buttonHeight = 100;
        slotBg.fillGradientStyle(0x1a1d26, 0x1a1d26, 0x0a0d16, 0x0a0d16, 0.8);
        slotBg.lineStyle(2, 0x3a3d3f, 1);
        slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      }
    });
    
    // Show message
    this.showMessage(`Acquired: ${relic.name}`, "#2ed573");
    
    // Hide tooltip
    this.hideTooltip();
    
    // Immediately return to Overworld
    gameState.updatePlayerData(this.player);
    gameState.completeCurrentNode(true);
    const overworldScene = this.scene.get("Overworld");
    if (overworldScene) {
      (overworldScene as any).resume();
    }
    this.scene.stop();
    this.scene.resume("Overworld");
  }

  // (continue button removed: we auto-return after selection)

  private showMessage(message: string, color: string): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Remove any existing message
    this.children.getChildren().forEach((child: Phaser.GameObjects.GameObject) => {
      if (child instanceof Phaser.GameObjects.Text && (child as Phaser.GameObjects.Text).y === screenHeight - 100) {
        child.destroy();
      }
    });
    
    const messageText = this.add.text(
      screenWidth / 2,
      screenHeight - 100,
      message,
      {
        fontFamily: "dungeon-mode",
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
    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }
    
    // Rebuild UI with the same logic used in create()
    this.children.removeAll();
    this.create();
  }
}