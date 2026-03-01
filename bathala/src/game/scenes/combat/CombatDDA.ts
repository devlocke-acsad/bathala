import { Combat } from "../Combat";
import { RuleBasedDDA } from "../../../core/dda/RuleBasedDDA";
import { CombatMetrics } from "../../../core/dda/DDATypes";
import { HandType } from "../../../core/types/CombatTypes";

/**
 * Auto-win scenario presets for DDA testing
 */
type AutoWinScenario = "bad" | "good" | "spectacular";

/**
 * CombatDDA - Handles Dynamic Difficulty Adjustment tracking and debug UI for combat
 * Separates DDA logic from core Combat scene
 * 
 * Responsibilities:
 * - Initialize DDA system and apply difficulty adjustments to enemies
 * - Track combat metrics (duration, health, discards, etc.)
 * - Submit combat results to DDA system
 * - Manage DDA debug overlay UI
 * - Provide real-time difficulty information
 */
export class CombatDDA {
  private scene: Combat;
  private dda!: RuleBasedDDA;
  
  // Combat tracking
  private combatStartTime!: number;
  private initialPlayerHealth!: number;
  private totalDiscardsUsed: number = 0;
  
  // Debug UI
  private ddaDebugContainer!: Phaser.GameObjects.Container | null;
  private ddaDebugVisible: boolean = false;
  
  // Auto-win test buttons
  private autoWinButtonsContainer!: Phaser.GameObjects.Container | null;

  constructor(scene: Combat) {
    this.scene = scene;
  }

  // Store base stats before DDA adjustments
  private baseEnemyHealth!: number;
  private baseEnemyDamage!: number;

  /**
   * Initialize DDA system and apply difficulty adjustments to enemy
   */
  public initializeDDA(): void {
    try {
      this.dda = RuleBasedDDA.getInstance();
      this.combatStartTime = Date.now();
      const combatState = this.scene.getCombatState();
      this.initialPlayerHealth = combatState.player.currentHealth;
      this.totalDiscardsUsed = 0;
      
      // Store base stats before DDA adjustments
      this.baseEnemyHealth = combatState.enemy.maxHealth;
      this.baseEnemyDamage = combatState.enemy.damage;
      
      // Apply current DDA difficulty adjustments to enemy
      const adjustment = this.dda.getCurrentDifficultyAdjustment();
      console.log("🎯 DDA Adjustment:", {
        tier: adjustment.tier,
        healthMultiplier: adjustment.enemyHealthMultiplier,
        damageMultiplier: adjustment.enemyDamageMultiplier,
        baseHealth: this.baseEnemyHealth,
        baseDamage: this.baseEnemyDamage,
        elementalAffinity: combatState.enemy.elementalAffinity // Verify affinity is preserved
      });
      
      combatState.enemy.maxHealth = Math.round(combatState.enemy.maxHealth * adjustment.enemyHealthMultiplier);
      combatState.enemy.currentHealth = combatState.enemy.maxHealth;
      combatState.enemy.damage = Math.round(combatState.enemy.damage * adjustment.enemyDamageMultiplier);
      
      console.log("✅ DDA Applied (Elemental Affinity Preserved):", {
        adjustedHealth: combatState.enemy.maxHealth,
        adjustedDamage: combatState.enemy.damage,
        elementalAffinity: combatState.enemy.elementalAffinity // Confirm affinity unchanged
      });
      
      // Update initial intent to reflect DDA-modified damage
      if (combatState.enemy.intent.type === "attack") {
        combatState.enemy.intent.value = combatState.enemy.damage;
        combatState.enemy.intent.description = `Attacks for ${combatState.enemy.damage} damage`;
      }
    } catch (error) {
      console.warn("DDA not available, skipping DDA initialization:", error);
    }
  }

  /**
   * Get base enemy stats (before DDA adjustments)
   */
  public getBaseEnemyStats(): { health: number; damage: number } {
    return {
      health: this.baseEnemyHealth,
      damage: this.baseEnemyDamage
    };
  }

  /**
   * Track a discard action for DDA metrics
   */
  public trackDiscard(): void {
    this.totalDiscardsUsed++;
  }

  /**
   * Get total discards used in current combat
   */
  public getTotalDiscardsUsed(): number {
    return this.totalDiscardsUsed;
  }

  /**
   * Submit combat results to DDA system
   */
  public submitCombatResults(
    victory: boolean,
    turnCount: number,
    maxDiscardsPerTurn: number,
    bestHandAchieved: HandType
  ): void {
    if (!this.dda) {
      console.warn("DDA not initialized, skipping combat results submission");
      return;
    }

    const combatState = this.scene.getCombatState();
    
    const combatMetrics: CombatMetrics = {
      combatId: `combat_${Date.now()}`,
      timestamp: Date.now(),
      
      // Pre-combat state
      startHealth: this.initialPlayerHealth,
      startMaxHealth: combatState.player.maxHealth,
      startGold: combatState.player.ginto,
      
      // Combat performance  
      endHealth: combatState.player.currentHealth,
      healthPercentage: combatState.player.currentHealth / combatState.player.maxHealth,
      turnCount: turnCount,
      damageDealt: Math.max(0, combatState.enemy.maxHealth - combatState.enemy.currentHealth),
      damageReceived: Math.max(0, this.initialPlayerHealth - combatState.player.currentHealth),
      discardsUsed: this.totalDiscardsUsed,
      maxDiscardsAvailable: turnCount * maxDiscardsPerTurn,
      
      // Hand quality metrics
      handsPlayed: [bestHandAchieved],
      bestHandAchieved: bestHandAchieved,
      averageHandQuality: this.getHandQualityScore(bestHandAchieved),
      
      // Outcome
      victory: victory,
      combatDuration: Date.now() - this.combatStartTime,
      
      // Enemy information
      enemyType: "common" as const,
      enemyName: combatState.enemy.name,
      enemyStartHealth: combatState.enemy.maxHealth,
    };
    
    // Update DDA system with combat results
    const updatedPPS = this.dda.processCombatResults(combatMetrics);
    console.log("DDA Updated:", {
      previousPPS: updatedPPS.previousPPS,
      currentPPS: updatedPPS.currentPPS,
      tier: updatedPPS.tier,
      healthPercentage: combatMetrics.healthPercentage,
      turnCount: combatMetrics.turnCount,
      victory: victory
    });
    
    // Update DDA debug overlay if visible
    this.updateDDADebugOverlay();
  }

  /**
   * Get numerical quality score for a hand type
   */
  private getHandQualityScore(handType: HandType): number {
    const scores: Record<HandType, number> = {
      "high_card": 1,
      "pair": 2,
      "two_pair": 3,
      "three_of_a_kind": 4,
      "straight": 5,
      "flush": 6,
      "full_house": 7,
      "four_of_a_kind": 8,
      "straight_flush": 9,
      "royal_flush": 10,
      "five_of_a_kind": 11
    };
    return scores[handType] || 1;
  }

  /**
   * Create DDA debug overlay for testing
   */
  public createDDADebugOverlay(): void {
    if (!this.dda) {
      console.warn("DDA not initialized, skipping debug overlay creation");
      return;
    }

    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Create container for debug UI
    this.ddaDebugContainer = this.scene.add.container(screenWidth - 250, 10);
    this.ddaDebugContainer.setDepth(1000);
    this.ddaDebugContainer.setVisible(false);
    
    // Background panel
    const panelWidth = 240;
    const panelHeight = 200;
    const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.8);
    bg.setOrigin(0, 0);
    this.ddaDebugContainer.add(bg);
    
    // Title
    const title = this.scene.add.text(panelWidth / 2, 10, "DDA Debug", {
      fontFamily: "dungeon-mode",
      fontSize: 16,
      color: "#4ecdc4",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(title);
    
    // Note
    const note = this.scene.add.text(panelWidth / 2, 25, "(Current combat settings)", {
      fontFamily: "dungeon-mode",
      fontSize: 9,
      color: "#888888",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(note);
    
    // Get current DDA state
    const pps = this.dda.getPlayerPPS();
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    
    let yPos = 40;
    const leftMargin = 10;
    
    // PPS Info
    const ppsText = this.scene.add.text(leftMargin, yPos, `PPS: ${pps.currentPPS.toFixed(2)}`, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#ffffff"
    });
    this.ddaDebugContainer.add(ppsText);
    yPos += 18;
    
    // Tier Info
    const tierColor = this.getTierColor(pps.tier);
    const tierText = this.scene.add.text(leftMargin, yPos, `Tier: ${pps.tier}`, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: tierColor
    });
    this.ddaDebugContainer.add(tierText);
    yPos += 18;
    
    // Combat count
    const combatText = this.scene.add.text(leftMargin, yPos, `Combats: ${pps.totalCombatsCompleted}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#aaaaaa"
    });
    this.ddaDebugContainer.add(combatText);
    yPos += 18;
    
    // Calibration status
    const calibrationText = this.scene.add.text(leftMargin, yPos, `Calibrating: ${pps.isCalibrating ? 'Yes' : 'No'}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: pps.isCalibrating ? "#ffa502" : "#666666"
    });
    this.ddaDebugContainer.add(calibrationText);
    yPos += 15;
    
    // Current combat info
    const turnCount = (this.scene as any).turnCount || 0;
    const combatInfoText = this.scene.add.text(leftMargin, yPos, `This Combat: Turn ${turnCount}`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#aaaaaa"
    });
    this.ddaDebugContainer.add(combatInfoText);
    yPos += 20;
    
    // Modifiers section
    const modifiersTitle = this.scene.add.text(panelWidth / 2, yPos, "─ Active Modifiers ─", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#888888",
      align: "center"
    }).setOrigin(0.5, 0);
    this.ddaDebugContainer.add(modifiersTitle);
    yPos += 16;
    
    // Get current enemy stats
    const combatState = this.scene.getCombatState();
    const currentHealth = combatState.enemy.maxHealth;
    const currentDamage = combatState.enemy.damage;
    
    // Enemy HP - show base → adjusted
    const enemyText = this.scene.add.text(leftMargin, yPos, 
      `HP: ${this.baseEnemyHealth} → ${currentHealth} (${(adjustment.enemyHealthMultiplier * 100).toFixed(0)}%)`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ff6b6b"
    });
    this.ddaDebugContainer.add(enemyText);
    yPos += 14;
    
    // Enemy Damage - show base → adjusted
    const damageText = this.scene.add.text(leftMargin, yPos, 
      `DMG: ${this.baseEnemyDamage} → ${currentDamage} (${(adjustment.enemyDamageMultiplier * 100).toFixed(0)}%)`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ff6b6b"
    });
    this.ddaDebugContainer.add(damageText);
    yPos += 14;
    
    // Economic modifiers
    const goldText = this.scene.add.text(leftMargin, yPos, `Gold: ${(adjustment.goldRewardMultiplier * 100).toFixed(0)}%`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ffd93d"
    });
    this.ddaDebugContainer.add(goldText);
    
    // Toggle button - positioned to not overlap with deck pile
    const toggleButton = this.scene.add.text(10, screenHeight - 30, "[D] DDA Info", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#4ecdc4",
      backgroundColor: "#000000",
      padding: { x: 6, y: 3 }
    }).setOrigin(0, 1).setAlpha(0.7); // Semi-transparent to be less intrusive
    toggleButton.setInteractive({ useHandCursor: true });
    toggleButton.on('pointerdown', () => this.toggleDDADebug());
    toggleButton.on('pointerover', () => toggleButton.setAlpha(1));
    toggleButton.on('pointerout', () => toggleButton.setAlpha(0.7));
    
    // Keyboard shortcut
    this.scene.input.keyboard?.on('keydown-D', () => {
      this.toggleDDADebug();
    });
  }
  
  /**
   * Toggle DDA debug overlay visibility
   */
  public toggleDDADebug(): void {
    this.ddaDebugVisible = !this.ddaDebugVisible;
    if (this.ddaDebugContainer) {
      this.ddaDebugContainer.setVisible(this.ddaDebugVisible);
      
      // Update values when showing
      if (this.ddaDebugVisible) {
        this.updateDDADebugOverlay();
      }
    }
    if (this.autoWinButtonsContainer) {
      this.autoWinButtonsContainer.setVisible(this.ddaDebugVisible);
    }
  }
  
  /**
   * Update DDA debug overlay with current values
   */
  public updateDDADebugOverlay(): void {
    if (!this.dda || !this.ddaDebugContainer || !this.ddaDebugVisible) return;
    
    // Get current DDA state
    const pps = this.dda.getPlayerPPS();
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    
    // Update all text elements
    const children = this.ddaDebugContainer.list;
    
    // PPS (index 3 - after bg, title, note)
    (children[3] as Phaser.GameObjects.Text).setText(`PPS: ${pps.currentPPS.toFixed(2)}`);
    
    // Tier (index 4)
    const tierColor = this.getTierColor(pps.tier);
    (children[4] as Phaser.GameObjects.Text).setText(`Tier: ${pps.tier}`);
    (children[4] as Phaser.GameObjects.Text).setColor(tierColor);
    
    // Combat count (index 5)
    (children[5] as Phaser.GameObjects.Text).setText(`Combats: ${pps.totalCombatsCompleted}`);
    
    // Calibration (index 6)
    (children[6] as Phaser.GameObjects.Text).setText(`Calibrating: ${pps.isCalibrating ? 'Yes' : 'No'}`);
    (children[6] as Phaser.GameObjects.Text).setColor(pps.isCalibrating ? "#ffa502" : "#666666");
    
    // Current combat info (index 7)
    const turnCount = (this.scene as any).turnCount || 0;
    (children[7] as Phaser.GameObjects.Text).setText(`This Combat: Turn ${turnCount}`);
    
    // Get current enemy stats
    const combatState = this.scene.getCombatState();
    const currentHealth = combatState.enemy.maxHealth;
    const currentDamage = combatState.enemy.damage;
    
    // Enemy HP (index 9 - after modifiers title) - show base → adjusted
    (children[9] as Phaser.GameObjects.Text).setText(
      `HP: ${this.baseEnemyHealth} → ${currentHealth} (${(adjustment.enemyHealthMultiplier * 100).toFixed(0)}%)`
    );
    
    // Enemy DMG (index 10) - show base → adjusted
    (children[10] as Phaser.GameObjects.Text).setText(
      `DMG: ${this.baseEnemyDamage} → ${currentDamage} (${(adjustment.enemyDamageMultiplier * 100).toFixed(0)}%)`
    );
    
    // Gold (index 11)
    (children[11] as Phaser.GameObjects.Text).setText(`Gold: ${(adjustment.goldRewardMultiplier * 100).toFixed(0)}%`);
  }
  
  /**
   * Get color for difficulty tier
   */
  private getTierColor(tier: string): string {
    switch (tier) {
      case "struggling": return "#ff4757";
      case "learning": return "#ffa502";
      case "thriving": return "#2ed573";
      case "mastering": return "#4ecdc4";
      default: return "#ffffff";
    }
  }

  /**
   * Create auto-win test buttons for DDA scenario testing
   * These buttons allow quick testing of different performance outcomes
   */
  public createAutoWinButtons(): void {
    if (!this.dda) {
      console.warn("DDA not initialized, skipping auto-win buttons creation");
      return;
    }

    const padding = 12;
    const panelWidth = 230;
    const buttonHeight = 32;
    const buttonSpacing = 6;
    const buttonWidth = panelWidth - padding * 2;

    this.autoWinButtonsContainer = this.scene.add.container(10, 10);
    this.autoWinButtonsContainer.setDepth(1001);
    this.autoWinButtonsContainer.setVisible(false);

    let yPos = padding;

    const title = this.scene.add.text(panelWidth / 2, yPos, "DDA Test Wins", {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#4ecdc4",
      align: "center"
    }).setOrigin(0.5, 0);
    this.autoWinButtonsContainer.add(title);
    yPos += title.height + 2;

    const subtitle = this.scene.add.text(panelWidth / 2, yPos, "Auto-win with preset outcomes", {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#888888",
      align: "center",
      wordWrap: { width: panelWidth - padding * 2 }
    }).setOrigin(0.5, 0);
    this.autoWinButtonsContainer.add(subtitle);
    yPos += subtitle.height + 10;

    const buttonConfigs: Array<{
      scenario: AutoWinScenario;
      label: string;
      shortcut: string;
      color: string;
      hoverColor: string;
    }> = [
      {
        scenario: "bad",
        label: "Bad Win",
        shortcut: "1",
        color: "#ff4757",
        hoverColor: "#ff6b81"
      },
      {
        scenario: "good",
        label: "Good Win",
        shortcut: "2",
        color: "#ffa502",
        hoverColor: "#ffbe3d"
      },
      {
        scenario: "spectacular",
        label: "Spectacular",
        shortcut: "3",
        color: "#2ed573",
        hoverColor: "#7bed9f"
      }
    ];

    buttonConfigs.forEach((config) => {
      const btnBg = this.scene.add.rectangle(
        panelWidth / 2,
        yPos + buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        Phaser.Display.Color.HexStringToColor(config.color).color,
        0.3
      );
      btnBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(config.color).color);
      btnBg.setInteractive({ useHandCursor: true });

      const btnLabel = this.scene.add.text(
        panelWidth / 2,
        yPos + buttonHeight / 2,
        `[${config.shortcut}] ${config.label}`,
        {
          fontFamily: "dungeon-mode",
          fontSize: 13,
          color: config.color
        }
      ).setOrigin(0.5, 0.5);

      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.hoverColor).color, 0.5);
        btnLabel.setColor(config.hoverColor);
      });

      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.color).color, 0.3);
        btnLabel.setColor(config.color);
      });

      btnBg.on('pointerdown', () => {
        this.executeAutoWin(config.scenario);
      });

      this.autoWinButtonsContainer!.add([btnBg, btnLabel]);
      yPos += buttonHeight + buttonSpacing;
    });

    yPos += 2;

    const shortcutHint = this.scene.add.text(panelWidth / 2, yPos, "Press 1/2/3 to quick-trigger", {
      fontFamily: "dungeon-mode",
      fontSize: 9,
      color: "#555555",
      align: "center",
      wordWrap: { width: panelWidth - padding * 2 }
    }).setOrigin(0.5, 0);
    this.autoWinButtonsContainer.add(shortcutHint);
    yPos += shortcutHint.height + padding;

    const bg = this.scene.add.rectangle(0, 0, panelWidth, yPos, 0x000000, 0.85);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, 0x4ecdc4);
    this.autoWinButtonsContainer.addAt(bg, 0);

    this.scene.input.keyboard?.on('keydown-ONE', () => this.executeAutoWin("bad"));
    this.scene.input.keyboard?.on('keydown-TWO', () => this.executeAutoWin("good"));
    this.scene.input.keyboard?.on('keydown-THREE', () => this.executeAutoWin("spectacular"));
  }

  /**
   * Execute an auto-win scenario with preset combat metrics
   */
  private executeAutoWin(scenario: AutoWinScenario): void {
    if (!this.dda) {
      console.warn("DDA not initialized, cannot execute auto-win");
      return;
    }

    const combatState = this.scene.getCombatState();
    
    // Get scenario configuration
    const config = this.getScenarioConfig(scenario);
    
    console.log(`🎮 Auto-Win Triggered: ${scenario.toUpperCase()}`);
    console.log("📊 Scenario Config:", config);
    
    // Apply scenario to combat state
    // Set player health based on scenario
    const targetHealth = Math.floor(combatState.player.maxHealth * config.healthPercentage);
    combatState.player.currentHealth = targetHealth;
    
    // Set turn count (access private field via any)
    (this.scene as any).turnCount = config.turnCount;
    
    // Set best hand achieved
    (this.scene as any).bestHandAchieved = config.bestHand;
    
    // Track discards used
    this.totalDiscardsUsed = config.discardsUsed;
    
    // Kill the enemy
    combatState.enemy.currentHealth = 0;
    
    // Update UI to show the final state
    this.scene.ui.updatePlayerUI();
    this.scene.ui.updateEnemyUI();
    
    // Show visual feedback
    this.showAutoWinFeedback(scenario, config);
    
    // Trigger combat end with victory after a short delay
    this.scene.time.delayedCall(500, () => {
      // Call the private endCombat method
      (this.scene as any).endCombat(true);
    });
  }

  /**
   * Get configuration for each auto-win scenario
   */
  private getScenarioConfig(scenario: AutoWinScenario): {
    healthPercentage: number;
    turnCount: number;
    bestHand: HandType;
    discardsUsed: number;
    description: string;
  } {
    switch (scenario) {
      case "bad":
        // Barely won - struggled through combat
        // DDA should decrease PPS (player is struggling)
        return {
          healthPercentage: 0.2,  // Only 20% HP left (<30% = poor health penalty)
          turnCount: 12,          // Many turns (inefficient)
          bestHand: "pair",       // Weak hand (no skill bonus)
          discardsUsed: 9,        // Used all discards (3 per turn for 3 turns worth)
          description: "Struggled through combat with low health"
        };
      
      case "good":
        // Won comfortably - solid performance
        // DDA should moderately increase PPS
        return {
          healthPercentage: 0.75, // 75% HP left (70-89% = good health bonus)
          turnCount: 5,           // Moderate turn count
          bestHand: "straight",   // Good hand (straight+ bonus)
          discardsUsed: 3,        // Moderate discard usage
          description: "Solid victory with good performance"
        };
      
      case "spectacular":
        // Dominated - exceptional performance
        // DDA should significantly increase PPS
        return {
          healthPercentage: 1.0,    // Full health (perfect combat bonus!)
          turnCount: 2,             // Very fast (efficient bonus)
          bestHand: "four_of_a_kind", // Excellent hand (excellent hand bonus)
          discardsUsed: 0,          // No discards needed (resource efficiency)
          description: "Flawless victory - dominated the enemy"
        };
    }
  }

  /**
   * Show visual feedback for auto-win
   */
  private showAutoWinFeedback(scenario: AutoWinScenario, config: {
    healthPercentage: number;
    turnCount: number;
    bestHand: HandType;
    discardsUsed: number;
    description: string;
  }): void {
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;
    
    // Color based on scenario
    const colors: Record<AutoWinScenario, string> = {
      bad: "#ff4757",
      good: "#ffa502",
      spectacular: "#2ed573"
    };
    
    const labels: Record<AutoWinScenario, string> = {
      bad: "😰 BAD WIN",
      good: "😊 GOOD WIN",
      spectacular: "🌟 SPECTACULAR WIN"
    };
    
    const boxPadding = 16;
    const boxWidth = 240;
    const contentWidth = boxWidth - boxPadding * 2;

    const feedbackContainer = this.scene.add.container(screenWidth / 2, screenHeight / 2 - 50);
    feedbackContainer.setDepth(2000);

    const titleText = this.scene.add.text(0, 0, labels[scenario], {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: colors[scenario],
      align: "center",
      wordWrap: { width: contentWidth }
    }).setOrigin(0.5, 0);

    const statsText = this.scene.add.text(0, 0, [
      `HP: ${Math.round(config.healthPercentage * 100)}%`,
      `Turns: ${config.turnCount}`,
      `Hand: ${config.bestHand.replace(/_/g, " ")}`,
      `Discards: ${config.discardsUsed}`
    ].join("\n"), {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#aaaaaa",
      align: "center",
      lineSpacing: 2
    }).setOrigin(0.5, 0);

    const descText = this.scene.add.text(0, 0, config.description, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#888888",
      align: "center",
      wordWrap: { width: contentWidth }
    }).setOrigin(0.5, 0);

    const totalHeight = boxPadding + titleText.height + 8 + statsText.height + 8 + descText.height + boxPadding;

    let cy = -totalHeight / 2 + boxPadding;
    titleText.setY(cy);
    cy += titleText.height + 8;
    statsText.setY(cy);
    cy += statsText.height + 8;
    descText.setY(cy);

    const bg = this.scene.add.rectangle(0, 0, boxWidth, totalHeight, 0x000000, 0.9);
    bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(colors[scenario]).color);

    feedbackContainer.add([bg, titleText, statsText, descText]);
    
    // Animate in and out
    feedbackContainer.setAlpha(0);
    feedbackContainer.setScale(0.8);
    
    this.scene.tweens.add({
      targets: feedbackContainer,
      alpha: 1,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(400, () => {
          this.scene.tweens.add({
            targets: feedbackContainer,
            alpha: 0,
            y: feedbackContainer.y - 30,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
              feedbackContainer.destroy();
            }
          });
        });
      }
    });
  }

  /**
   * Destroy auto-win buttons (cleanup)
   */
  public destroyAutoWinButtons(): void {
    if (this.autoWinButtonsContainer) {
      this.autoWinButtonsContainer.destroy();
      this.autoWinButtonsContainer = null;
    }
  }
}
