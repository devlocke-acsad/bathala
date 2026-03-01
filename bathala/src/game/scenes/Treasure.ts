import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { Player, Relic } from "../../core/types/CombatTypes";
import {
  act1CommonRelics,
  act1EliteRelics,
  act1BossRelics,
  act1TreasureRelics,
  act1MythologicalRelics,
  act2CommonRelics,
  act2EliteRelics,
  act2BossRelics,
  act2TreasureRelics,
  act3CommonRelics,
  act3EliteRelics,
  act3BossRelics,
  act3TreasureRelics
} from "../../data/relics";
import { allShopItems } from "../../data/relics/ShopItems";
import { Potion, getChapterCommonPotions } from "../../data/potions";
import { getRelicSpriteKey } from "../../utils/RelicSpriteUtils";

// Treasure reward can be either a Relic or a Potion
type TreasureReward =
  | { type: "relic"; item: Relic }
  | { type: "potion"; item: Potion };


export class Treasure extends Scene {
  private readonly DUPLICATE_RELIC_GINTO = 60;
  private readonly DUPLICATE_RELIC_HEAL = 40;
  private player!: Player;
  private treasureChest!: Phaser.GameObjects.Sprite;
  private rewardOptions: TreasureReward[] = [];
  private rewardButtons: Phaser.GameObjects.Container[] = [];
  private descriptionText!: Phaser.GameObjects.Text;
  private tooltipBox!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: "Treasure" });
  }

  init(data: { player: Player }) {
    // Get the most up-to-date player data from GameState
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();

    // If we have saved player data with relics, merge it with the passed player data
    if (savedPlayerData && savedPlayerData.relics) {
      this.player = { ...data.player, ...savedPlayerData };
    } else {
      this.player = data.player;
    }

    // Initialize potions array if it doesn't exist
    if (!this.player.potions) {
      this.player.potions = [];
    }

    // Get current chapter to determine which relic pool to use
    const currentChapter = gameState.getCurrentChapter();

    // Get all shop relic IDs to exclude from treasure
    const shopRelicIds = new Set(allShopItems.map(item => item.item.id));

    // Select chapter-specific relic pools
    let commonRelics: Relic[];
    let eliteRelics: Relic[];
    let treasureRelics: Relic[];
    let mythologicalRelics: Relic[] = []; // Only Act 1 has mythological relics

    switch (currentChapter) {
      case 2:
        commonRelics = act2CommonRelics;
        eliteRelics = act2EliteRelics;
        treasureRelics = act2TreasureRelics;
        break;
      case 3:
        commonRelics = act3CommonRelics;
        eliteRelics = act3EliteRelics;
        treasureRelics = act3TreasureRelics;
        break;
      case 1:
      default:
        commonRelics = act1CommonRelics;
        eliteRelics = act1EliteRelics;
        treasureRelics = act1TreasureRelics;
        mythologicalRelics = act1MythologicalRelics;
        break;
    }

    // Create weighted pool with drop rates
    // After filtering shop relics, primary pool is chapter-specific relics
    // EXCLUDES: Shop relics and Boss relics (reserved for boss rewards)
    const weightedPool: Array<{ relic: Relic; weight: number }> = [
      // Common relics - 50% total (filter out shop relics)
      ...commonRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 12.5 })),
      // Elite relics - 35% total (filter out shop relics)
      ...eliteRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 8.75 })),
      // Treasure relics - 15% total (filter out shop relics)
      ...treasureRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 7.5 })),
      // Mythological relics - Equal weight distribution (only Act 1)
      ...mythologicalRelics
        .map(relic => ({ relic, weight: 11.11 })),
    ];

    // Filter out relics player already has
    const availablePool = weightedPool.filter(
      item => !this.player.relics.some(r => r.id === item.relic.id)
    );

    // Select relics using weighted randomization
    const selectedRelics: Relic[] = [];
    const seenIds = new Set<string>();
    const poolCopy = [...availablePool];

    // 80% chance to have a potion as one of the options (only if player has < 3 potions)
    const shouldIncludePotion = this.player.potions.length < 3 && Math.random() < 0.8;
    const numRelicsToSelect = shouldIncludePotion ? 2 : 3; // If potion, only select 2 relics

    while (selectedRelics.length < numRelicsToSelect && poolCopy.length > 0) {
      const selectedRelic = this.weightedRandomSelect(poolCopy);
      if (!seenIds.has(selectedRelic.id)) {
        selectedRelics.push(selectedRelic);
        seenIds.add(selectedRelic.id);
        // Remove selected relic from pool to ensure uniqueness
        const index = poolCopy.findIndex(item => item.relic.id === selectedRelic.id);
        if (index !== -1) poolCopy.splice(index, 1);
      }
    }

    // Build reward options array
    this.rewardOptions = selectedRelics.map(relic => ({ type: "relic" as const, item: relic }));

    // Add potion if applicable
    if (shouldIncludePotion) {
      // Get chapter-specific common potions
      const chapterCommonPotions = getChapterCommonPotions(currentChapter);

      // Select a random common potion from the chapter
      const randomPotion = chapterCommonPotions[Math.floor(Math.random() * chapterCommonPotions.length)];

      if (randomPotion) {
        // Insert potion at random position (0, 1, or 2)
        const insertIndex = Math.floor(Math.random() * 3);
        this.rewardOptions.splice(insertIndex, 0, { type: "potion" as const, item: randomPotion });
      }
    }
  }

  create(): void {
    // Safety check for camera
    if (!this.cameras.main) {
      return;
    }

    this.cameras.main.setBackgroundColor(0x150E10);

    // Add forest background image
    const forestBg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "forest_bg"
    );
    // Scale to cover the entire screen
    const scaleX = this.cameras.main.width / forestBg.width;
    const scaleY = this.cameras.main.height / forestBg.height;
    const scale = Math.max(scaleX, scaleY);
    forestBg.setScale(scale);
    forestBg.setDepth(0); // Behind everything

    // Dim only the background image (not the whole screen)
    forestBg.setAlpha(0.45); // 45% visible = balanced dimming for treasure
    this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x150E10,
      0.46
    ).setDepth(1);

    // Create title
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    const titleY = Math.max(24, screenHeight * 0.06);
    // Header panel matching updated scene style
    const titlePanel = this.add.rectangle(screenWidth / 2, titleY, 560, 56, 0x150E10, 0.95).setDepth(20);
    const titleOuter = this.add.rectangle(screenWidth / 2, titleY, 566, 62, undefined, 0).setDepth(20);
    titleOuter.setStrokeStyle(3, 0x77888C, 0.9);
    const titleInner = this.add.rectangle(screenWidth / 2, titleY, 562, 58, undefined, 0).setDepth(20);
    titleInner.setStrokeStyle(2, 0x556065, 0.75);

    const title = this.add.text(
      screenWidth / 2,
      titleY,
      "Treasure Chest",
      {
        fontFamily: "dungeon-mode",
        fontSize: 32,
        color: "#e8eced",
        align: "center",
      }
    ).setOrigin(0.5).setDepth(21);
    // Add a soft shadow like in Shop for better readability
    title.setShadow(2, 2, '#000000', 3, false, true);

    // Create treasure chest composition
    const chestY = Math.min(screenHeight * 0.3, screenHeight / 2 - 150);
    const chestX = screenWidth * 0.5;
    this.treasureChest = this.add.sprite(chestX, chestY, "chest");
    this.treasureChest.setScale(4);
    this.treasureChest.setDepth(40);

    // Add warm chest glow to make treasure the scene focal point.
    const chestGlowOuter = this.add.circle(chestX, chestY + 14, 92, 0xf6c358, 0.17).setDepth(36);
    chestGlowOuter.setBlendMode(Phaser.BlendModes.ADD);
    const chestGlowInner = this.add.circle(chestX, chestY + 14, 56, 0xf6c358, 0.22).setDepth(37);
    chestGlowInner.setBlendMode(Phaser.BlendModes.ADD);

    // Try to play animation, fallback if it fails
    try {
      this.treasureChest.play("chest_open");
    } catch (error) {
      console.warn("Chest animation not found, using static sprite");
    }

    // Entrance animation to match Shop feel
    this.treasureChest.setScale(3.7).setAlpha(0.85);
    this.tweens.add({
      targets: this.treasureChest,
      scale: 4,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    // Mid-screen callout between chest and reward choices.
    this.add.text(
      screenWidth / 2,
      Math.min(chestY + 120, screenHeight * 0.52),
      "Claim your reward — choose only one.",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C",
        align: "center"
      }
    ).setOrigin(0.5).setDepth(31);

    // Create description text in the lower-center gap (between choices and leave button)
    const descY = screenHeight - 190;
    this.descriptionText = this.add.text(
      screenWidth / 2,
      descY,
      "Hover a reward to preview its description",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#d0dce4",
        align: "center",
        wordWrap: { width: Math.max(300, Math.floor(screenWidth * 0.7)) },
        lineSpacing: 4
      }
    ).setOrigin(0.5).setDepth(30);

    // Create relic options
    this.createRelicOptions();

    // Create tooltip box (hidden by default)
    this.createTooltipBox();

    // Create back button
    this.createBackButton();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * Weighted random selection from a pool of relics
   * @param pool Array of relics with their weights
   * @returns Selected relic based on weighted probability
   */
  private weightedRandomSelect(pool: Array<{ relic: Relic; weight: number }>): Relic {
    // Calculate total weight
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

    // Generate random number between 0 and total weight
    let random = Math.random() * totalWeight;

    // Select relic based on weight
    for (const item of pool) {
      random -= item.weight;
      if (random <= 0) {
        return item.relic;
      }
    }

    // Fallback to last item (shouldn't happen)
    return pool[pool.length - 1].relic;
  }

  private createRelicOptions(): void {
    // Debug: check if heal_potion texture is loaded
    if (!this.textures.exists("heal_potion")) {
      console.warn("heal_potion texture not loaded! Check Preloader and asset path.");
    }
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const isNarrow = screenWidth < 700;
    const buttonWidth = isNarrow ? 116 : 132;
    const buttonHeight = isNarrow ? 132 : 150;
    const spacing = isNarrow ? 22 : 34;
    const totalWidth = this.rewardOptions.length * buttonWidth + (this.rewardOptions.length - 1) * spacing;
    const startX = (screenWidth - totalWidth) / 2 + buttonWidth / 2;
    const y = Math.min(screenHeight * 0.6, screenHeight - 300);
    const defaultDescription = "Hover a reward to preview its description";
    this.descriptionText.setY(
      Math.min(y + buttonHeight / 2 + 64, screenHeight - 188)
    );
    this.descriptionText.setText(defaultDescription);
    this.descriptionText.setColor("#d0dce4");

    this.rewardButtons = [];

    this.rewardOptions.forEach((reward, index) => {
      const x = startX + index * (buttonWidth + spacing);

      const button = this.add.container(x, y);

      // Background color depends on reward type
      const isPotionSlot = reward.type === "potion";
      const accentColor = isPotionSlot ? 0x4ecdc4 : 0x77888C;
      const typeLabel = isPotionSlot ? "POTION" : "RELIC";

      // Background styled with same UI language as updated scenes
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x24333d, 0.98);
      slotBg.lineStyle(3, 0x8da3b2, 0.95);
      slotBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
      slotBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
      slotBg.lineStyle(2, 0x6f8694, 0.85);
      slotBg.strokeRoundedRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, 10);

      const accentBar = this.add.rectangle(-buttonWidth / 2 + 6, 0, 8, buttonHeight - 14, accentColor, 0.9).setOrigin(0.5);

      // Visual display (sprite for relics, image for potions)
      let visual: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
      let itemName = "";
      if (reward.type === "relic") {
        const relic = reward.item;
        itemName = relic.name;
        const spriteKey = getRelicSpriteKey(relic.id);
        if (this.textures.exists(spriteKey)) {
          visual = this.add.image(0, -16, spriteKey).setOrigin(0.5);
          const spriteSize = isNarrow ? 72 : 84;
          const scale = Math.min(spriteSize / visual.width, spriteSize / visual.height);
          visual.setScale(scale);
        } else {
          visual = this.add.text(0, -16, relic.emoji, {
            fontSize: isNarrow ? 42 : 50,
          }).setOrigin(0.5);
        }
      } else {
        // Potion - use heal_potion image asset
        itemName = reward.item.name;
        visual = this.add.image(0, -16, "heal_potion").setOrigin(0.5);
        const spriteSize = isNarrow ? 72 : 84;
        const scale = Math.min(spriteSize / visual.width, spriteSize / visual.height);
        visual.setScale(scale);
      }

      const itemNameText = this.add.text(0, buttonHeight / 2 - 30, itemName, {
        fontFamily: "dungeon-mode",
        fontSize: isNarrow ? 10 : 11,
        color: "#d0dce4",
        align: "center",
        wordWrap: { width: buttonWidth - 18 }
      }).setOrigin(0.5);

      const itemTypeText = this.add.text(0, buttonHeight / 2 - 12, typeLabel, {
        fontFamily: "dungeon-mode",
        fontSize: 9,
        color: isPotionSlot ? "#4ecdc4" : "#77888C",
        align: "center"
      }).setOrigin(0.5);

      button.add([slotBg, accentBar, visual, itemNameText, itemTypeText]);
      (button as any).slotWidth = buttonWidth;
      (button as any).slotHeight = buttonHeight;

      // Make interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );

      button.on("pointerdown", () => this.selectReward(reward, button));
      button.on("pointerover", () => {
        if (button.active) {
          // Hover glow and scale
          this.tweens.add({ targets: button, scale: 1.05, duration: 120, ease: 'Power2' });
          slotBg.clear();
          slotBg.fillStyle(0x2d3f4b, 1);
          slotBg.lineStyle(3, 0xaac1d0, 1);
          slotBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
          slotBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
          slotBg.lineStyle(2, 0x7f97a6, 0.95);
          slotBg.strokeRoundedRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
          accentBar.setAlpha(1);

          const itemName = reward.item.name;
          const itemDesc = reward.item.description;
          const typePrefix = reward.type === "potion" ? "Potion" : "Relic";
          this.descriptionText.setText(`${typePrefix}: ${itemName}\n${itemDesc}`);
          this.descriptionText.setColor(reward.type === "potion" ? "#4ecdc4" : "#d0dce4");
        }
      });
      button.on("pointerout", () => {
        if (button.active) {
          this.tweens.add({ targets: button, scale: 1, duration: 150, ease: 'Power2' });
          slotBg.clear();
          slotBg.fillStyle(0x24333d, 0.98);
          slotBg.lineStyle(3, 0x8da3b2, 0.95);
          slotBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
          slotBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
          slotBg.lineStyle(2, 0x6f8694, 0.85);
          slotBg.strokeRoundedRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
          accentBar.setAlpha(0.9);
          this.descriptionText.setText(defaultDescription);
          this.descriptionText.setColor("#d0dce4");
          this.hideTooltip();
        }
      });

      this.rewardButtons.push(button);

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

  private showRewardTooltip(reward: TreasureReward, x: number, y: number): void {
    if (reward.type === "relic") {
      this.showTooltip(reward.item, x, y);
    } else {
      // Show potion tooltip
      this.showPotionTooltip(reward.item, x, y);
    }
  }

  private showPotionTooltip(potion: Potion, x: number, y: number): void {
    // Clear previous tooltip
    this.tooltipBox.removeAll(true);

    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;
    const tooltipWidth = 280;
    const horizontalPadding = 16;
    const verticalPadding = 14;

    // Potion name
    const nameText = this.add.text(0, 0, potion.name, {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#4ecdc4", // Cyan for potions
      align: "center",
      wordWrap: { width: tooltipWidth - horizontalPadding * 2 }
    }).setOrigin(0.5, 0);
    nameText.setShadow(1, 1, '#000000', 2, false, true);

    // Potion description
    const descText = this.add.text(0, nameText.height + 10, potion.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#e8eced",
      align: "center",
      wordWrap: { width: tooltipWidth - horizontalPadding * 2 }
    }).setOrigin(0.5, 0);

    const contentHeight = nameText.height + 10 + descText.height + verticalPadding * 2;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0a0b, 0.95);
    bg.lineStyle(2, 0x4ecdc4, 0.8); // Cyan border
    bg.fillRoundedRect(-tooltipWidth / 2, -verticalPadding, tooltipWidth, contentHeight, 8);
    bg.strokeRoundedRect(-tooltipWidth / 2, -verticalPadding, tooltipWidth, contentHeight, 8);

    this.tooltipBox.add([bg, nameText, descText]);

    // Position tooltip
    let tooltipX = x;
    let tooltipY = y;
    if (tooltipX + tooltipWidth / 2 > camW - 20) tooltipX = camW - tooltipWidth / 2 - 20;
    if (tooltipX - tooltipWidth / 2 < 20) tooltipX = tooltipWidth / 2 + 20;
    if (tooltipY + contentHeight > camH - 20) tooltipY = camH - contentHeight - 20;
    if (tooltipY < 20) tooltipY = 20 + contentHeight / 2;

    this.tooltipBox.setPosition(tooltipX, tooltipY);
    this.tooltipBox.setVisible(true);
    this.tooltipBox.setDepth(5000);
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
    tooltipBg.fillRoundedRect(-tooltipWidth / 2, -tooltipHeight / 2, tooltipWidth, tooltipHeight, 10);
    tooltipBg.strokeRoundedRect(-tooltipWidth / 2, -tooltipHeight / 2, tooltipWidth, tooltipHeight, 10);

    // Add in correct drawing order
    this.tooltipBox.add([tooltipBg, nameText, descText, instruction]);

    // Clamp tooltip position to screen bounds with margin
    const margin = 14;
    const clampedX = Math.min(Math.max(margin + tooltipWidth / 2, x), camW - margin - tooltipWidth / 2);
    const clampedY = Math.min(Math.max(margin + tooltipHeight / 2, y), camH - margin - tooltipHeight / 2);
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
      fontFamily: "dungeon-mode",
      fontSize: fontSize,
      color: "#77888C",
    }).setOrigin(0.5);

    const measuredTextWidth = Math.ceil(text.width);
    const buttonWidth = Math.max(baseWidth, measuredTextWidth + horizontalPadding);

    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x150E10, 0.95);
    background.setStrokeStyle(3, 0x77888C, 0.9);
    const innerBorder = this.add.rectangle(0, 0, buttonWidth - 6, buttonHeight - 6, 0x1b2327, 0.65);
    innerBorder.setStrokeStyle(1, 0x556065, 0.7);

    // Add to container with background behind text
    backButton.add([background, innerBorder, text]);

    backButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
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

    backButton.on("pointerover", () => {
      background.setFillStyle(0x1f1410, 1);
      text.setColor("#e8eced");
    });
    backButton.on("pointerout", () => {
      background.setFillStyle(0x150E10, 0.95);
      text.setColor("#77888C");
    });
  }

  private selectRelic(relic: Relic, selectedButton: Phaser.GameObjects.Container): void {
    // Get GameState instance first to ensure we're working with the persistent player data
    const gameState = GameState.getInstance();

    // Add relic to player
    this.player.relics.push(relic);

    // Apply immediate relic acquisition effects (healing, stat boosts, etc.)
    RelicManager.applyRelicAcquisitionEffect(relic.id, this.player);

    // 80% chance to also find a healing potion if player has space (max 3 potions)
    let potionMessage = "";
    if (this.player.potions.length < 3 && Math.random() < 0.8) {
      // Get chapter-specific common potions
      const gameState = GameState.getInstance();
      const currentChapter = gameState.getCurrentChapter();
      const chapterCommonPotions = getChapterCommonPotions(currentChapter);

      // Give a random common potion from the chapter
      const randomPotion = chapterCommonPotions[Math.floor(Math.random() * chapterCommonPotions.length)];
      if (randomPotion) {
        this.player.potions.push(randomPotion);
        potionMessage = ` + ${randomPotion.name}!`;
      }
    }

    // Persist updated player data immediately - pass the entire player object to preserve all data
    gameState.updatePlayerData({
      ...this.player,
      relics: [...this.player.relics],
      potions: [...this.player.potions]
    });

    // Update UI
    this.descriptionText.setText(`You take the ${relic.name}!${potionMessage}`);
    this.descriptionText.setColor("#2ed573");

    // Disable all relic buttons to prevent multiple selections
    this.rewardButtons.forEach(button => {
      button.disableInteractive();
      button.setActive(false);
      // Redraw slot background (Graphics) to a dimmed state
      const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics | undefined;
      if (slotBg && slotBg.clear) {
        const buttonWidth = (button as any).slotWidth || 100;
        const buttonHeight = (button as any).slotHeight || 100;
        slotBg.clear();
        slotBg.fillStyle(0x1a1d26, 0.86);
        slotBg.lineStyle(3, 0x3a3d3f, 0.9);
        slotBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
        slotBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
        slotBg.lineStyle(2, 0x2b2f35, 0.75);
        slotBg.strokeRoundedRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
      }
    });

    // Show message
    this.showMessage(`Acquired: ${relic.name}${potionMessage}`, "#2ed573");

    // Hide tooltip
    this.hideTooltip();

    // Immediately return to Overworld (player data already updated above)
    gameState.completeCurrentNode(true);
    const overworldScene = this.scene.get("Overworld");
    if (overworldScene) {
      (overworldScene as any).resume();
    }
    this.scene.stop();
    this.scene.resume("Overworld");
  }

  private selectReward(reward: TreasureReward, selectedButton: Phaser.GameObjects.Container): void {
    // Get GameState instance first to ensure we're working with the persistent player data
    const gameState = GameState.getInstance();

    if (reward.type === "relic") {
      // If player already owns this relic, offer conversion instead of duplicate
      if (this.player.relics.some(relic => relic.id === reward.item.id)) {
        this.showDuplicateRelicConversionDialog(reward.item);
        return;
      }

      // Check if player has 6 relics - need to discard one first
      if (this.player.relics.length >= 6) {
        this.showRelicDiscardDialog(reward, selectedButton);
        return;
      }

      // Add relic to player
      this.player.relics.push(reward.item);

      // Apply immediate relic acquisition effects (healing, stat boosts, etc.)
      RelicManager.applyRelicAcquisitionEffect(reward.item.id, this.player);

      // Persist updated player data
      gameState.updatePlayerData({
        ...this.player,
        relics: [...this.player.relics],
        potions: [...this.player.potions]
      });

      // Update UI
      this.descriptionText.setText(`You take the ${reward.item.name}!`);
      this.descriptionText.setColor("#2ed573");
      this.showMessage(`Acquired: ${reward.item.name}`, "#2ed573");
    } else {
      // Add potion to player
      this.player.potions.push(reward.item);

      // Persist updated player data
      gameState.updatePlayerData({
        ...this.player,
        relics: [...this.player.relics],
        potions: [...this.player.potions]
      });

      // Update UI
      this.descriptionText.setText(`You take the ${reward.item.name}!`);
      this.descriptionText.setColor("#4ecdc4"); // Cyan for potions
      this.showMessage(`Acquired: ${reward.item.name}`, "#4ecdc4");
    }

    // Disable all reward buttons to prevent multiple selections
    this.rewardButtons.forEach(button => {
      button.disableInteractive();
      button.setActive(false);
      // Redraw slot background (Graphics) to a dimmed state
      const slotBg = button.getAt(0) as Phaser.GameObjects.Graphics | undefined;
      if (slotBg && slotBg.clear) {
        const buttonWidth = (button as any).slotWidth || 100;
        const buttonHeight = (button as any).slotHeight || 100;
        slotBg.clear();
        slotBg.fillStyle(0x1a1d26, 0.86);
        slotBg.lineStyle(3, 0x3a3d3f, 0.9);
        slotBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
        slotBg.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
        slotBg.lineStyle(2, 0x2b2f35, 0.75);
        slotBg.strokeRoundedRect(-buttonWidth / 2 + 2, -buttonHeight / 2 + 2, buttonWidth - 4, buttonHeight - 4, 10);
      }
    });

    // Hide tooltip
    this.hideTooltip();

    // Immediately return to Overworld (player data already updated above)
    gameState.completeCurrentNode(true);
    const overworldScene = this.scene.get("Overworld");
    if (overworldScene) {
      (overworldScene as any).resume();
    }
    this.scene.stop();
    this.scene.resume("Overworld");
  }

  /**
   * Show duplicate relic conversion dialog (+60 ginto or +40 HP)
   */
  private showDuplicateRelicConversionDialog(relic: Relic): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.78).setScrollFactor(0).setDepth(10000);

    const dialogWidth = 620;
    const dialogHeight = 320;
    const dialog = this.add.container(
      screenWidth / 2,
      screenHeight / 2
    ).setScrollFactor(0).setDepth(10001);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.98);
    bg.lineStyle(3, 0xfeca57, 1);
    bg.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 10);
    bg.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 10);

    const title = this.add.text(0, -110, "RELIC ALREADY OWNED", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#feca57",
      align: "center"
    }).setOrigin(0.5);

    const body = this.add.text(0, -55, `You already have ${relic.name}.`, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center"
    }).setOrigin(0.5);

    const prompt = this.add.text(0, -20, "Choose conversion reward:", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#aab5ba",
      align: "center"
    }).setOrigin(0.5);

    const makeOptionButton = (
      x: number,
      y: number,
      label: string,
      fillColor: number,
      onClick: () => void
    ): Phaser.GameObjects.Container => {
      const button = this.add.container(x, y);
      const btnBg = this.add.graphics();
      btnBg.fillStyle(fillColor, 0.92);
      btnBg.lineStyle(2, 0xffffff, 0.9);
      btnBg.fillRoundedRect(-120, -25, 240, 50, 8);
      btnBg.strokeRoundedRect(-120, -25, 240, 50, 8);

      const btnText = this.add.text(0, 0, label, {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#ffffff",
        align: "center"
      }).setOrigin(0.5);

      button.add([btnBg, btnText]);
      button.setSize(240, 50);
      button.setInteractive({ useHandCursor: true });

      button.on("pointerover", () => {
        this.tweens.add({ targets: button, scale: 1.04, duration: 120, ease: "Power2" });
      });
      button.on("pointerout", () => {
        this.tweens.add({ targets: button, scale: 1, duration: 120, ease: "Power2" });
      });
      button.on("pointerdown", onClick);

      return button;
    };

    const applyAndExit = (message: string, color: string): void => {
      const gameState = GameState.getInstance();
      gameState.updatePlayerData({
        ...this.player,
        relics: [...this.player.relics],
        potions: [...this.player.potions]
      });

      this.descriptionText.setText(message);
      this.descriptionText.setColor(color);
      this.showMessage(message, color);

      this.rewardButtons.forEach(button => {
        button.disableInteractive();
        button.setActive(false);
      });

      this.hideTooltip();

      overlay.destroy();
      dialog.destroy();

      gameState.completeCurrentNode(true);
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      this.scene.stop();
      this.scene.resume("Overworld");
    };

    const gintoBtn = makeOptionButton(
      -145,
      55,
      `+${this.DUPLICATE_RELIC_GINTO} Ginto`,
      0xf39c12,
      () => {
        this.player.ginto += this.DUPLICATE_RELIC_GINTO;
        applyAndExit(`Duplicate converted: +${this.DUPLICATE_RELIC_GINTO} Ginto`, "#feca57");
      }
    );

    const healBtn = makeOptionButton(
      145,
      55,
      `+${this.DUPLICATE_RELIC_HEAL} Health`,
      0xff6b6b,
      () => {
        const before = this.player.currentHealth;
        this.player.currentHealth = Math.min(
          this.player.maxHealth,
          this.player.currentHealth + this.DUPLICATE_RELIC_HEAL
        );
        const healedAmount = this.player.currentHealth - before;
        applyAndExit(`Duplicate converted: +${healedAmount} Health`, "#ff6b6b");
      }
    );

    dialog.add([bg, title, body, prompt, gintoBtn, healBtn]);
  }

  // (continue button removed: we auto-return after selection)

  /**
   * Show relic discard dialog when player has 6 relics
   */
  private showRelicDiscardDialog(reward: TreasureReward, selectedButton: Phaser.GameObjects.Container): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Create overlay
    const overlay = this.add.rectangle(
      screenWidth / 2,
      screenHeight / 2,
      screenWidth,
      screenHeight,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(10000);

    // Create dialog container
    const dialogWidth = 700;
    const dialogHeight = 500;
    const dialog = this.add.container(
      screenWidth / 2,
      screenHeight / 2
    ).setScrollFactor(0).setDepth(10001);

    // Dialog background
    const dialogBg = this.add.graphics();
    dialogBg.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x0a0a0a, 0x0a0a0a, 0.98);
    dialogBg.lineStyle(3, 0xfeca57, 1);
    dialogBg.fillRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 10);
    dialogBg.strokeRoundedRect(-dialogWidth / 2, -dialogHeight / 2, dialogWidth, dialogHeight, 10);

    // Title
    const title = this.add.text(0, -dialogHeight / 2 + 30, "RELIC INVENTORY FULL!", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#feca57",
    }).setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(0, -dialogHeight / 2 + 65, "Choose a relic to discard:", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#e8eced",
    }).setOrigin(0.5);

    dialog.add([dialogBg, title, instructions]);

    // Create relic selection grid (2 rows of 3) - with properly scaled sprites
    const relicCardWidth = 200;
    const relicCardHeight = 100;
    const spacing = 15;
    const startX = -((relicCardWidth + spacing) * 3 - spacing) / 2 + relicCardWidth / 2;
    const startY = -100;

    this.player.relics.forEach((relic, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (relicCardWidth + spacing);
      const y = startY + row * (relicCardHeight + spacing);

      // Create relic card container
      const relicCard = this.add.container(x, y);

      // Card background with gradient
      const cardBg = this.add.rectangle(0, 0, relicCardWidth, relicCardHeight, 0x2a1f2a)
        .setStrokeStyle(2, 0x77888C);

      relicCard.add([cardBg]);

      // Relic sprite - scaled to fit card properly
      const spriteKey = getRelicSpriteKey(relic.id);
      if (spriteKey && this.textures.exists(spriteKey)) {
        const sprite = this.add.sprite(0, -10, spriteKey);

        // Calculate scale to fit within card bounds (leave room for text)
        const maxSpriteWidth = relicCardWidth - 40;
        const maxSpriteHeight = relicCardHeight - 45; // Leave space for name
        const spriteScale = Math.min(
          maxSpriteWidth / sprite.width,
          maxSpriteHeight / sprite.height,
          0.25 // Maximum scale cap to prevent too large sprites
        );

        sprite.setScale(spriteScale);
        relicCard.add(sprite);
      } else {
        // Fallback to emoji if sprite doesn't exist
        const emoji = this.add.text(0, -10, relic.emoji || "✦", {
          fontSize: 28,
          color: "#feca57",
          align: "center"
        }).setOrigin(0.5);
        relicCard.add(emoji);
      }

      // Relic name (wrapped text, positioned at bottom)
      const nameText = this.add.text(0, 35, relic.name, {
        fontFamily: "dungeon-mode",
        fontSize: 11,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: relicCardWidth - 20 }
      }).setOrigin(0.5);

      relicCard.add(nameText);

      // Make interactive
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on("pointerover", () => {
        cardBg.setStrokeStyle(3, 0xfeca57);
        this.tweens.add({
          targets: relicCard,
          scale: 1.05,
          duration: 150
        });
      });
      cardBg.on("pointerout", () => {
        cardBg.setStrokeStyle(2, 0x77888C);
        this.tweens.add({
          targets: relicCard,
          scale: 1,
          duration: 150
        });
      });
      cardBg.on("pointerdown", () => {
        // Discard this relic and proceed with reward
        this.player.relics.splice(index, 1);

        // Clean up dialog
        overlay.destroy();
        dialog.destroy();

        // Now proceed with adding the new relic
        if (reward.type === "relic") {
          const gameState = GameState.getInstance();

          // Add new relic to player
          this.player.relics.push(reward.item);

          // Apply immediate relic acquisition effects
          RelicManager.applyRelicAcquisitionEffect(reward.item.id, this.player);

          // Persist updated player data
          gameState.updatePlayerData({
            ...this.player,
            relics: [...this.player.relics],
            potions: [...this.player.potions]
          });

          // Update UI
          this.descriptionText.setText(`Discarded ${relic.name}. Acquired ${reward.item.name}!`);
          this.descriptionText.setColor("#2ed573");
          this.showMessage(`Discarded ${relic.name}`, "#ff9f43");

          // Disable all reward buttons
          this.rewardButtons.forEach(button => {
            button.disableInteractive();
            button.setActive(false);
          });

          // Return to overworld after short delay
          this.time.delayedCall(1500, () => {
            gameState.completeCurrentNode(true);
            const overworldScene = this.scene.get("Overworld");
            if (overworldScene) {
              (overworldScene as any).resume();
            }
            this.scene.stop();
            this.scene.resume("Overworld");
          });
        }
      });

      dialog.add(relicCard);
    });

    // Cancel button
    const cancelBtn = this.add.container(0, dialogHeight / 2 - 40);
    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0xff4757, 0.9);
    cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    const cancelText = this.add.text(0, 0, "CANCEL", {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);

    cancelBtn.add([cancelBg, cancelText]);
    cancelBtn.setSize(120, 40);
    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.on("pointerdown", () => {
      overlay.destroy();
      dialog.destroy();
    });
    cancelBtn.on("pointerover", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff6b81, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });
    cancelBtn.on("pointerout", () => {
      cancelBg.clear();
      cancelBg.fillStyle(0xff4757, 0.9);
      cancelBg.fillRoundedRect(-60, -20, 120, 40, 5);
    });

    dialog.add(cancelBtn);
  }

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

}
