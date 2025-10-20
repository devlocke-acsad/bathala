import { Scene } from "phaser";
import { GameState } from "../../core/managers/GameState";
import { RelicManager } from "../../core/managers/RelicManager";
import { Player, Relic } from "../../core/types/CombatTypes";
import { 
  act1CommonRelics, 
  act1EliteRelics, 
  act1BossRelics, 
  act1TreasureRelics,
  act1MythologicalRelics
} from "../../data/relics";
import { allShopItems } from "../../data/relics/ShopItems";
import { Potion, commonPotions } from "../../data/potions/Act1Potions";

// Treasure reward can be either a Relic or a Potion
type TreasureReward = 
  | { type: "relic"; item: Relic }
  | { type: "potion"; item: Potion };

/**
 * Helper function to get the sprite key for a relic based on its ID
 * Note: Currently unused in discard dialog (using emoji instead), but kept for potential future use
 */
function getRelicSpriteKey(relicId: string): string {
  const spriteMap: Record<string, string> = {
    'swift_wind_agimat': 'relic_swift_wind_agimat',
    'amomongo_claw': 'relic_amomongo_claw',
    'ancestral_blade': 'relic_ancestral_blade',
    'balete_root': 'relic_balete_root',
    'babaylans_talisman': 'relic_babaylans_talisman',
    'bungisngis_grin': 'relic_bungisngis_grin',
    'diwatas_crown': 'relic_diwatas_crown',
    'duwende_charm': 'relic_duwende_charm',
    'earthwardens_plate': 'relic_earthwardens_plate',
    'ember_fetish': 'relic_ember_fetish',
    'kapres_cigar': 'relic_kapres_cigar',
    'lucky_charm': 'relic_lucky_charm',
    'mangangaway_wand': 'relic_mangangaway_wand',
    'sarimanok_feather': 'relic_sarimanok_feather',
    'sigbin_heart': 'relic_sigbin_heart',
    'stone_golem_heart': 'relic_stone_golem_heart',
    'tidal_amulet': 'relic_tidal_amulet',
    'tikbalangs_hoof': 'relic_tikbalangs_hoof',
    'tiyanak_tear': 'relic_tiyanak_tear',
    'umalagad_spirit': 'relic_umalagad_spirit'
  };
  
  return spriteMap[relicId] || '';
}

export class Treasure extends Scene {
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
    
    // Get all shop relic IDs to exclude from treasure
    const shopRelicIds = new Set(allShopItems.map(item => item.item.id));
    
    // Create weighted pool with drop rates
    // After filtering shop relics, primary pool is Mythological relics (9 relics)
    // EXCLUDES: Shop relics (15 total) and Boss relics (reserved for boss rewards)
    const weightedPool: Array<{ relic: Relic; weight: number }> = [
      // Common relics - 50% total (filter out shop relics)
      ...act1CommonRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 12.5 })),
      // Elite relics - 35% total (filter out shop relics)
      ...act1EliteRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 8.75 })),
      // Treasure relics - 15% total (filter out shop relics)
      ...act1TreasureRelics
        .filter(relic => !shopRelicIds.has(relic.id))
        .map(relic => ({ relic, weight: 7.5 })),
      // Mythological relics - Equal weight distribution (NOT in shop)
      ...act1MythologicalRelics
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
      const healingPotion = commonPotions.find(p => p.id === "healing_potion");
      if (healingPotion) {
        // Insert potion at random position (0, 1, or 2)
        const insertIndex = Math.floor(Math.random() * 3);
        this.rewardOptions.splice(insertIndex, 0, { type: "potion" as const, item: healingPotion });
      }
    }
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

  /**
   * Get the sprite texture key for a relic based on its ID
   */
  private getRelicSpriteKey(relicId: string): string {
    return `relic_${relicId}`;
  }

  private createRelicOptions(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const isNarrow = screenWidth < 520;
    const buttonWidth = isNarrow ? 84 : 100;
    const buttonHeight = isNarrow ? 84 : 100;
    const spacing = isNarrow ? 28 : 50;
    const totalWidth = this.rewardOptions.length * buttonWidth + (this.rewardOptions.length - 1) * spacing;
    const startX = (screenWidth - totalWidth) / 2 + buttonWidth / 2;
    const y = Math.min(this.descriptionText.y + (isNarrow ? 110 : 130), screenHeight - (isNarrow ? 90 : 110));

    this.rewardButtons = [];

    this.rewardOptions.forEach((reward, index) => {
      const x = startX + index * (buttonWidth + spacing);
      
      const button = this.add.container(x, y);
      
      // Background color depends on reward type
      const isPotionSlot = reward.type === "potion";
      const gradientTop = isPotionSlot ? 0x3d2f42 : 0x2f3542;
      const gradientBottom = isPotionSlot ? 0x26192d : 0x1a1d26;
      const borderColor = isPotionSlot ? 0x4ecdc4 : 0x57606f;
      
      // Background styled similar to Shop's slots (gradient and rounded corners via Graphics)
      const slotBg = this.add.graphics();
      slotBg.fillGradientStyle(gradientTop, gradientTop, gradientBottom, gradientBottom, 0.95);
      slotBg.lineStyle(2, borderColor, 0.9);
      slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
      
      // Visual display (sprite/emoji for relics, emoji for potions)
      let visual: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
      
      if (reward.type === "relic") {
        const relic = reward.item;
        const spriteKey = this.getRelicSpriteKey(relic.id);
        
        if (this.textures.exists(spriteKey)) {
          // Use sprite
          visual = this.add.image(0, 0, spriteKey).setOrigin(0.5);
          // Scale sprite to fit nicely in the button
          const spriteSize = isNarrow ? 70 : 80;
          const scale = Math.min(spriteSize / visual.width, spriteSize / visual.height);
          visual.setScale(scale);
        } else {
          // Fallback to emoji
          visual = this.add.text(0, 0, relic.emoji, {
            fontSize: isNarrow ? 40 : 48,
          }).setOrigin(0.5);
        }
      } else {
        // Potion - use emoji
        const potion = reward.item;
        visual = this.add.text(0, 0, potion.emoji || "❤️", {
          fontSize: isNarrow ? 48 : 56,
        }).setOrigin(0.5);
      }
      
      button.add([slotBg, visual]);
      
      // Make interactive
      button.setInteractive(
        new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
      );
      
      button.on("pointerdown", () => this.selectReward(reward, button));
      button.on("pointerover", () => {
        if (button.active) {
          // Hover glow and scale
          this.tweens.add({ targets: button, scale: 1.05, duration: 120, ease: 'Power2' });
          slotBg.clear();
          const hoverGradTop = isPotionSlot ? 0x4d3f52 : 0x3d4454;
          const hoverGradBottom = isPotionSlot ? 0x36293d : 0x232735;
          const hoverBorder = isPotionSlot ? 0x4ecdc4 : 0xa78bfa;
          slotBg.fillGradientStyle(hoverGradTop, hoverGradTop, hoverGradBottom, hoverGradBottom, 1);
          slotBg.lineStyle(3, hoverBorder, 0.9);
          slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          this.showRewardTooltip(reward, x + buttonWidth/2 + 10, y);
        }
      });
      button.on("pointerout", () => {
        if (button.active) {
          this.tweens.add({ targets: button, scale: 1, duration: 150, ease: 'Power2' });
          slotBg.clear();
          slotBg.fillGradientStyle(gradientTop, gradientTop, gradientBottom, gradientBottom, 0.95);
          slotBg.lineStyle(2, borderColor, 0.9);
          slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
          slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
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
    bg.fillRoundedRect(-tooltipWidth/2, -verticalPadding, tooltipWidth, contentHeight, 8);
    bg.strokeRoundedRect(-tooltipWidth/2, -verticalPadding, tooltipWidth, contentHeight, 8);
    
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
    // Get GameState instance first to ensure we're working with the persistent player data
    const gameState = GameState.getInstance();
    
    // Add relic to player
    this.player.relics.push(relic);
    
    // Apply immediate relic acquisition effects (healing, stat boosts, etc.)
    RelicManager.applyRelicAcquisitionEffect(relic.id, this.player);
    
    // 80% chance to also find a healing potion if player has space (max 3 potions)
    let potionMessage = "";
    if (this.player.potions.length < 3 && Math.random() < 0.8) {
      // Give healing potion (only healing, no other effects)
      const healingPotion = commonPotions.find(p => p.id === "healing_potion");
      if (healingPotion) {
        this.player.potions.push(healingPotion);
        potionMessage = " + Healing Potion!";
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
        slotBg.clear();
        const buttonWidth = 100;
        const buttonHeight = 100;
        slotBg.fillGradientStyle(0x1a1d26, 0x1a1d26, 0x0a0d16, 0x0a0d16, 0.8);
        slotBg.lineStyle(2, 0x3a3d3f, 1);
        slotBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
        slotBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 10);
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
    dialogBg.fillRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    dialogBg.strokeRoundedRect(-dialogWidth/2, -dialogHeight/2, dialogWidth, dialogHeight, 10);
    
    // Title
    const title = this.add.text(0, -dialogHeight/2 + 30, "RELIC INVENTORY FULL!", {
      fontFamily: "dungeon-mode",
      fontSize: 24,
      color: "#feca57",
    }).setOrigin(0.5);
    
    // Instructions
    const instructions = this.add.text(0, -dialogHeight/2 + 65, "Choose a relic to discard:", {
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
    const cancelBtn = this.add.container(0, dialogHeight/2 - 40);
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