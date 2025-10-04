/**
 * DDA Debug Scene - Clean, readable interface for DDA testing
 */

import { Scene } from "phaser";
import { RuleBasedDDA } from "../../../core/dda/RuleBasedDDA";
import { DDAAnalyticsManager } from "../../../utils/analytics/DDAAnalyticsManager";
import { 
  DEFAULT_DDA_CONFIG, 
  AGGRESSIVE_DDA_CONFIG, 
  CONSERVATIVE_DDA_CONFIG,
  DDAModifiers 
} from "../../../core/dda/DDAConfig";
import { CombatMetrics, DifficultyTier } from "../../../core/dda/DDATypes";

/**
 * Interfaces for F1 Score and Confusion Matrix analytics
 */
interface PredictionResult {
  actual: DifficultyTier;
  predicted: DifficultyTier;
  timestamp: number;
  pps: number;
  combatId: string;
}

interface ConfusionMatrix {
  struggling: { struggling: number; learning: number; thriving: number; mastering: number };
  learning: { struggling: number; learning: number; thriving: number; mastering: number };
  thriving: { struggling: number; learning: number; thriving: number; mastering: number };
  mastering: { struggling: number; learning: number; thriving: number; mastering: number };
}

interface F1ScoreMetrics {
  precision: Record<DifficultyTier, number>;
  recall: Record<DifficultyTier, number>;
  f1Score: Record<DifficultyTier, number>;
  overallF1Score: number;
  accuracy: number;
}

export class DDADebugScene extends Scene {
  private dda: RuleBasedDDA;
  private analytics: DDAAnalyticsManager;
  private simulationData: Array<{ pps: number; tier: DifficultyTier; timestamp: number }> = [];
  
  // New analytics data for F1 Score and Confusion Matrix
  private predictionResults: PredictionResult[] = [];
  private confusionMatrix: ConfusionMatrix;
  private f1Metrics: F1ScoreMetrics;
  
  // UI Elements
  private ppsGraph!: Phaser.GameObjects.Graphics;
  private infoPanel!: Phaser.GameObjects.Container;
  private simulationPanel!: Phaser.GameObjects.Container;
  private configPanel!: Phaser.GameObjects.Container;
  private analyticsPanel!: Phaser.GameObjects.Container;
  private testingModeIndicator!: Phaser.GameObjects.Text;
  
  // Current configuration
  private currentConfig: DDAModifiers = DEFAULT_DDA_CONFIG;
  private isSimulating = false;
  
  // State management for isolation
  private gameplayStateBackup: any = null;
  
  // Responsive layout properties
  private layout = {
    screenWidth: 0,
    screenHeight: 0,
    contentWidth: 0,
    marginX: 0,
    marginY: 0,
    gutterX: 20,
    gutterY: 30  // Increased from 20 to 30 for better spacing
  };

  constructor() {
    super({ key: "DDADebugScene" });
    
    // Initialize confusion matrix
    this.confusionMatrix = {
      struggling: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      learning: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      thriving: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      mastering: { struggling: 0, learning: 0, thriving: 0, mastering: 0 }
    };
    
    // Initialize F1 metrics
    this.f1Metrics = {
      precision: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      recall: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      f1Score: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      overallF1Score: 0,
      accuracy: 0
    };
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    
    // Calculate responsive layout
    this.calculateLayout();
    
    // Backup gameplay DDA state before testing
    const gameplayDDA = RuleBasedDDA.getInstance();
    this.gameplayStateBackup = gameplayDDA.getStateSnapshot();
    
    // Start in isolated testing mode
    this.startFreshTest(this.currentConfig);
    
    // Create clean, readable UI
    this.createTitle();
    this.createTestingModeIndicator();
    this.createMainGraph();
    this.createStatusPanel();
    this.createTestingPanel();
    this.createConfigPanel();
    this.createAnalyticsPanel();
    this.createBackButton();
    
    // Initialize with current data
    this.updateDisplay();
  }
  
  /**
   * Calculate responsive layout based on screen size
   */
  private calculateLayout(): void {
    this.layout.screenWidth = this.cameras.main.width;
    this.layout.screenHeight = this.cameras.main.height;
    
    // Max content width: 90% of screen or 1400px, whichever is smaller
    this.layout.contentWidth = Math.min(this.layout.screenWidth * 0.9, 1400);
    
    // Center content horizontally
    this.layout.marginX = (this.layout.screenWidth - this.layout.contentWidth) / 2;
    this.layout.marginY = 120; // Top margin - increased for more breathing room
    
    console.log(`📐 Responsive Layout: Screen ${this.layout.screenWidth}×${this.layout.screenHeight}, Content ${this.layout.contentWidth}px, Margins ${this.layout.marginX}px`);
  }
  
  /**
   * Start fresh isolated test with clean DDA state
   */
  private startFreshTest(config: DDAModifiers): void {
    // Clear singleton and create fresh instance
    RuleBasedDDA.forceClearSingleton();
    this.dda = RuleBasedDDA.getInstance(config);
    this.analytics = DDAAnalyticsManager.getInstance();
    this.analytics.resetSession();
    
    console.log("🧪 DEBUG MODE: Started fresh isolated test with clean DDA state");
  }
  
  /**
   * Restore gameplay DDA state (called when leaving debug scene)
   */
  private restoreGameplayState(): void {
    if (this.gameplayStateBackup) {
      RuleBasedDDA.forceClearSingleton();
      const restoredDDA = RuleBasedDDA.getInstance();
      restoredDDA.restoreStateSnapshot(this.gameplayStateBackup);
      console.log("✅ Restored gameplay DDA state");
    }
  }

  /**
   * Create clean title section
   */
  private createTitle(): void {
    const screenWidth = this.cameras.main.width;
    
    this.add.text(
      screenWidth / 2,
      20,
      "DDA System Debugger",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: "#4ecdc4",
        align: "center"
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth / 2,
      60,
      "Rule-Based Dynamic Difficulty Adjustment",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#a8a8a8",
        align: "center"
      }
    ).setOrigin(0.5);
  }
  
  /**
   * Create testing mode indicator
   */
  private createTestingModeIndicator(): void {
    const screenWidth = this.cameras.main.width;
    
    this.testingModeIndicator = this.add.text(
      screenWidth / 2,
      90,
      "🧪 ISOLATED TESTING MODE - Gameplay DDA Not Affected",
      {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#00ff00",
        backgroundColor: "#1a1a1a",
        padding: { x: 15, y: 5 },
        align: "center"
      }
    ).setOrigin(0.5);
    
    // Pulse animation
    this.tweens.add({
      targets: this.testingModeIndicator,
      alpha: 0.6,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Create main performance graph
   */
  private createMainGraph(): void {
    const graphWidth = Math.floor(this.layout.contentWidth * 0.6);
    const graphHeight = 250;
    const graphX = this.layout.marginX;
    const graphY = this.layout.marginY;
    
    // Graph container
    const container = this.add.container(graphX, graphY);
    
    // Background
    const bg = this.add.rectangle(0, 0, graphWidth, graphHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    container.add(bg);
    
    // Title - moved inside the panel to avoid overlap
    const title = this.add.text(graphWidth / 2, 12, "📈 PPS Over Time", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff",
    }).setOrigin(0.5);
    container.add(title);
    
    // Y-axis labels - adjusted to accommodate title inside panel
    const graphContentY = 30; // Start graph content below title
    const graphContentHeight = graphHeight - graphContentY - 10;
    
    for (let i = 0; i <= 5; i++) {
      const y = graphHeight - 10 - (i / 5) * graphContentHeight;
      
      // Label
      const label = this.add.text(-25, y, `${i.toFixed(1)}`, {
        fontSize: 12,
        color: "#cccccc",
        fontFamily: "dungeon-mode",
      }).setOrigin(1, 0.5);
      container.add(label);
      
      // Grid line
      const line = this.add.rectangle(0, y, graphWidth, 1, 0x333333);
      line.setOrigin(0, 0.5);
      container.add(line);
    }
    
    // Difficulty tier backgrounds
    this.createTierBackgrounds(container, graphWidth, graphHeight);
    
    // Graph for data
    this.ppsGraph = this.add.graphics();
    container.add(this.ppsGraph);
    
    // Add legend
    this.createGraphLegend(container, graphWidth);
  }

  /**
   * Create difficulty tier backgrounds
   */
  private createTierBackgrounds(container: Phaser.GameObjects.Container, width: number, height: number): void {
    const tiers = [
      { name: "Struggling", range: [0, 1], color: 0xff4757, desc: "0-1.0" },
      { name: "Learning", range: [1.1, 2.5], color: 0xffa502, desc: "1.1-2.5" },
      { name: "Thriving", range: [2.6, 4], color: 0x2ed573, desc: "2.6-4.0" },
      { name: "Mastering", range: [4.1, 5], color: 0x5352ed, desc: "4.1-5.0" },
    ];
    
    // Adjust for title space
    const graphContentY = 30;
    const graphContentHeight = height - graphContentY - 10;
    
    tiers.forEach(tier => {
      const yStart = height - 10 - (tier.range[0] / 5) * graphContentHeight;
      const yEnd = height - 10 - (tier.range[1] / 5) * graphContentHeight;
      const tierHeight = yStart - yEnd;
      
      // Background
      const bg = this.add.rectangle(0, yEnd, width, tierHeight, tier.color, 0.08);
      bg.setOrigin(0);
      container.add(bg);
    });
  }
  
  /**
   * Create legend for the graph
   */
  private createGraphLegend(container: Phaser.GameObjects.Container, width: number): void {
    const legendX = width + 10;
    const legendY = 35; // Moved down to avoid title overlap
    
    const tiers = [
      { name: "Struggling", color: 0xff4757, range: "0-1.0" },
      { name: "Learning", color: 0xffa502, range: "1.1-2.5" },
      { name: "Thriving", color: 0x2ed573, range: "2.6-4.0" },
      { name: "Mastering", color: 0x5352ed, range: "4.1-5.0" },
    ];
    
    tiers.forEach((tier, index) => {
      const y = legendY + (index * 30);
      
      // Color box
      const box = this.add.rectangle(legendX, y, 15, 15, tier.color);
      box.setOrigin(0, 0.5);
      container.add(box);
      
      // Label with better spacing
      const label = this.add.text(legendX + 20, y - 5, `${tier.name}`, {
        fontSize: 11,
        color: "#ffffff",
        fontFamily: "dungeon-mode",
      }).setOrigin(0, 0.5);
      container.add(label);
      
      // Range on separate line
      const range = this.add.text(legendX + 20, y + 8, tier.range, {
        fontSize: 9,
        color: "#999999",
        fontFamily: "dungeon-mode",
      }).setOrigin(0, 0.5);
      container.add(range);
    });
  }

  /**
   * Create status information panel
   */
  private createStatusPanel(): void {
    const graphWidth = Math.floor(this.layout.contentWidth * 0.6);
    const panelWidth = Math.floor(this.layout.contentWidth * 0.37);
    const panelHeight = 250;
    const panelX = this.layout.marginX + graphWidth + this.layout.gutterX;
    const panelY = this.layout.marginY;
    
    this.infoPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.infoPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 15, "📊 Current DDA State", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.infoPanel.add(title);
  }

  /**
   * Create testing controls panel
   */
  private createTestingPanel(): void {
    const panelWidth = this.layout.contentWidth;
    const panelHeight = 160;
    const panelX = this.layout.marginX;
    const panelY = this.layout.marginY + 250 + this.layout.gutterY;
    
    this.simulationPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.simulationPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 15, "🎮 Combat Simulation Controls", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.simulationPanel.add(title);
    
    // Create test buttons
    this.createTestButtons();
  }

  /**
   * Create test buttons with clear, readable layout
   */
  private createTestButtons(): void {
    const buttonSpacing = Math.floor((this.layout.contentWidth - 120) / 8);
    const startX = 60;
    
    // Combat simulation buttons (top row)
    const combatButtons = [
      { 
        text: "Perfect Win", 
        desc: "100% HP, 3 turns\nFour of a Kind", 
        color: 0x2ed573, 
        x: startX + buttonSpacing * 0, 
        y: 50,
        action: () => this.testPerfectCombat() 
      },
      { 
        text: "Average Fight", 
        desc: "70% HP, 6 turns\nPair", 
        color: 0xffa502, 
        x: startX + buttonSpacing * 1, 
        y: 50,
        action: () => this.testAverageCombat() 
      },
      { 
        text: "Difficult Win", 
        desc: "30% HP, 10 turns\nHigh Card", 
        color: 0xff6b35, 
        x: startX + buttonSpacing * 2, 
        y: 50,
        action: () => this.testDifficultCombat() 
      },
      { 
        text: "Major Loss", 
        desc: "0% HP, 15 turns\nDefeated", 
        color: 0xff4757, 
        x: startX + buttonSpacing * 3, 
        y: 50,
        action: () => this.testMajorLoss() 
      },
    ];
    
    // Control buttons (bottom row)
    const controlButtons = [
      { 
        text: "Auto Test", 
        desc: "Random combats\nevery 1s", 
        color: 0x5352ed, 
        x: startX + buttonSpacing * 4, 
        y: 50,
        action: () => this.toggleAutoTest() 
      },
      { 
        text: "Fresh Start", 
        desc: "New isolated\ntest (PPS 2.5)", 
        color: 0x1dd1a1, 
        x: startX + buttonSpacing * 5, 
        y: 50,
        action: () => this.startFreshTest(this.currentConfig) 
      },
      { 
        text: "Reset Data", 
        desc: "Clear graphs\nKeep PPS", 
        color: 0x747d8c, 
        x: startX + buttonSpacing * 6, 
        y: 50,
        action: () => this.resetData() 
      },
      { 
        text: "Export CSV", 
        desc: "Download all\ntest data", 
        color: 0xffa502, 
        x: startX + buttonSpacing * 7, 
        y: 50,
        action: () => this.exportCSVData() 
      },
    ];
    
    [...combatButtons, ...controlButtons].forEach(btn => {
      const container = this.createEnhancedButton(btn.x, btn.y, btn.text, btn.desc, btn.color, btn.action);
      this.simulationPanel.add(container);
    });
  }

  /**
   * Create configuration panel
   */
  private createConfigPanel(): void {
    const panelWidth = this.layout.contentWidth;
    const panelHeight = 100;
    const panelX = this.layout.marginX;
    const panelY = this.layout.marginY + 250 + this.layout.gutterY + 160 + this.layout.gutterY;
    
    this.configPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.configPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 15, "⚙️ DDA Configuration Presets", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.configPanel.add(title);
    
    // Config buttons - responsive spacing
    const buttonSpacing = Math.floor(this.layout.contentWidth / 4);
    const configs = [
      { 
        text: "Default", 
        desc: "Standard DDA\nBalanced", 
        color: 0x2ed573, 
        x: buttonSpacing * 0.75, 
        config: DEFAULT_DDA_CONFIG 
      },
      { 
        text: "Aggressive", 
        desc: "Quick changes\nFaster adapt", 
        color: 0xff4757, 
        x: buttonSpacing * 1.75, 
        config: AGGRESSIVE_DDA_CONFIG 
      },
      { 
        text: "Conservative", 
        desc: "Slow changes\nStable diff", 
        color: 0x5352ed, 
        x: buttonSpacing * 2.75, 
        config: CONSERVATIVE_DDA_CONFIG 
      },
    ];
    
    configs.forEach(cfg => {
      const button = this.createEnhancedButton(cfg.x, 55, cfg.text, cfg.desc, cfg.color, () => this.setConfig(cfg.config));
      this.configPanel.add(button);
    });
    
    // Info text - positioned on the right
    const infoText = this.add.text(buttonSpacing * 3.5, 55, "Select a preset to test\ndifferent DDA behaviors", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#999999",
      align: "left"
    });
    this.configPanel.add(infoText);
  }

  /**
   * Create analytics panel for F1 Score and Confusion Matrix
   */
  private createAnalyticsPanel(): void {
    const panelWidth = this.layout.contentWidth;
    const panelHeight = 180;
    const panelX = this.layout.marginX;
    const panelY = this.layout.marginY + 250 + this.layout.gutterY + 160 + this.layout.gutterY + 100 + this.layout.gutterY;
    
    this.analyticsPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.analyticsPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 15, "📈 Advanced Analytics - F1 Score & Confusion Matrix", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.analyticsPanel.add(title);
  }

  /**
   * Create an enhanced button with description tooltip
   */
  private createEnhancedButton(
    x: number,
    y: number,
    text: string,
    description: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    // Button background with dark overlay for better contrast
    const bg = this.add.rectangle(0, 0, 110, 60, color);
    bg.setStrokeStyle(2, 0xffffff, 0.8);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);
    
    // Dark overlay for text readability
    const overlay = this.add.rectangle(0, 0, 110, 60, 0x000000, 0.3);
    container.add(overlay);
    
    // Button text (main label) - with shadow for contrast
    const label = this.add.text(0, -12, text, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#ffffff",
      align: "center",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);
    container.add(label);
    
    // Description text (smaller, below) - with shadow
    const desc = this.add.text(0, 10, description, {
      fontFamily: "dungeon-mode",
      fontSize: 8,
      color: "#ffffff",
      align: "center",
      lineSpacing: 1,
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    container.add(desc);
    
    // Hover effects
    bg.on("pointerover", () => {
      bg.setFillStyle(color, 0.9);
      container.setScale(1.05);
    });
    
    bg.on("pointerout", () => {
      bg.setFillStyle(color, 1);
      container.setScale(1);
    });
    
    bg.on("pointerdown", () => {
      container.setScale(0.95);
      callback();
    });
    
    bg.on("pointerup", () => {
      container.setScale(1.05);
    });
    
    return container;
  }
  
  /**
   * Create a clean, readable button (legacy support)
   */
  private createButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    return this.createEnhancedButton(x, y, text, "", color, callback);
  }

  /**
   * Create back button
   */
  private createBackButton(): void {
    const backBtn = this.add.text(50, this.cameras.main.height - 50, "← Back to Game", {
      fontFamily: "dungeon-mode",
      fontSize: 20,
      color: "#ffffff",
      backgroundColor: "#ff4757",
      padding: { x: 20, y: 10 },
    });
    
    backBtn.setInteractive();
    backBtn.on("pointerdown", () => {
      // CRITICAL: Restore gameplay DDA state before leaving
      this.restoreGameplayState();
      
      // Manually call the Overworld resume method to reset movement flags
      const overworldScene = this.scene.get("Overworld");
      if (overworldScene) {
        (overworldScene as any).resume();
      }
      
      this.scene.stop();
      this.scene.resume("Overworld");
    });
    backBtn.on("pointerover", () => backBtn.setBackgroundColor("#ff6b81"));
    backBtn.on("pointerout", () => backBtn.setBackgroundColor("#ff4757"));
  }

  /**
   * Test scenarios
   */
  private testPerfectCombat(): void {
    const fullMetrics: CombatMetrics = {
      combatId: `test-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 3,
      damageDealt: 45,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 1,
      handsPlayed: ["four_of_a_kind"],
      bestHandAchieved: "four_of_a_kind",
      averageHandQuality: 22,
      victory: true,
      combatDuration: 60000,
      enemyType: "common",
      enemyName: "Test Enemy",
      enemyStartHealth: 45
    };
    this.simulateCombat(fullMetrics);
  }

  private testAverageCombat(): void {
    const fullMetrics: CombatMetrics = {
      combatId: `test-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 50,
      healthPercentage: 0.7,
      turnCount: 6,
      damageDealt: 35,
      damageReceived: 30,
      discardsUsed: 1,
      maxDiscardsAvailable: 1,
      handsPlayed: ["pair", "high_card"],
      bestHandAchieved: "pair",
      averageHandQuality: 5,
      victory: true,
      combatDuration: 120000,
      enemyType: "common",
      enemyName: "Test Enemy",
      enemyStartHealth: 35
    };
    this.simulateCombat(fullMetrics);
  }

  private testDifficultCombat(): void {
    const fullMetrics: CombatMetrics = {
      combatId: `test-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 20,
      healthPercentage: 0.3,
      turnCount: 10,
      damageDealt: 25,
      damageReceived: 60,
      discardsUsed: 2,
      maxDiscardsAvailable: 2,
      handsPlayed: ["high_card", "high_card", "pair"],
      bestHandAchieved: "high_card",
      averageHandQuality: 2,
      victory: true,
      combatDuration: 200000,
      enemyType: "elite",
      enemyName: "Elite Enemy",
      enemyStartHealth: 60
    };
    this.simulateCombat(fullMetrics);
  }

  private testMajorLoss(): void {
    const fullMetrics: CombatMetrics = {
      combatId: `test-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 0,
      healthPercentage: 0,
      turnCount: 15,
      damageDealt: 15,
      damageReceived: 80,
      discardsUsed: 3,
      maxDiscardsAvailable: 3,
      handsPlayed: ["high_card", "high_card", "high_card", "pair"],
      bestHandAchieved: "high_card",
      averageHandQuality: 1,
      victory: false,
      combatDuration: 300000,
      enemyType: "boss",
      enemyName: "Boss Enemy",
      enemyStartHealth: 120
    };
    this.simulateCombat(fullMetrics);
  }

  private simulateCombat(metrics: CombatMetrics): void {
    // Get predicted tier before processing combat
    const preCombatState = this.dda.getPlayerPPS();
    const predictedTier = preCombatState.tier;
    
    // Update DDA with combat results
    const result = this.dda.processCombatResults(metrics);
    
    // Record combat with analytics manager
    this.analytics.recordCombat(metrics);
    
    // Get actual tier after processing
    const actualTier = result.tier;
    
    // Record prediction result for confusion matrix and F1 score
    const predictionResult: PredictionResult = {
      actual: actualTier,
      predicted: predictedTier,
      timestamp: Date.now(),
      pps: result.currentPPS,
      combatId: metrics.combatId
    };
    
    this.predictionResults.push(predictionResult);
    
    // Update confusion matrix
    this.updateConfusionMatrix(actualTier, predictedTier);
    
    // Recalculate F1 metrics
    this.calculateF1Metrics();
    
    // Add to simulation data
    this.simulationData.push({
      pps: result.currentPPS,
      tier: result.tier,
      timestamp: Date.now()
    });
    
    // Update display
    this.updateDisplay();
  }

  private toggleAutoTest(): void {
    this.isSimulating = !this.isSimulating;
    
    if (this.isSimulating) {
      this.runAutoTest();
    }
  }

  private runAutoTest(): void {
    if (!this.isSimulating) return;
    
    // Random combat simulation
    const scenarios = [
      () => this.testPerfectCombat(),
      () => this.testAverageCombat(),
      () => this.testDifficultCombat(),
      () => this.testMajorLoss(),
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    randomScenario();
    
    // Schedule next test
    this.time.delayedCall(1000, () => this.runAutoTest());
  }

  private resetData(): void {
    this.simulationData = [];
    this.predictionResults = [];
    
    // Reset confusion matrix
    this.confusionMatrix = {
      struggling: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      learning: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      thriving: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      mastering: { struggling: 0, learning: 0, thriving: 0, mastering: 0 }
    };
    
    // Reset F1 metrics
    this.f1Metrics = {
      precision: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      recall: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      f1Score: { struggling: 0, learning: 0, thriving: 0, mastering: 0 },
      overallF1Score: 0,
      accuracy: 0
    };
    
    // Reset current test instance
    this.dda.resetSession();
    this.analytics.resetSession();
    this.updateDisplay();
    
    console.log("🔄 Reset test data (DDA state preserved)");
  }

  private setConfig(config: DDAModifiers): void {
    this.currentConfig = config;
    
    // Start fresh test with new config
    this.resetData();
    this.startFreshTest(config);
    this.updateDisplay();
    
    console.log("⚙️ Switched to new config and started fresh test");
  }

  /**
   * Update confusion matrix with new prediction result
   */
  private updateConfusionMatrix(actual: DifficultyTier, predicted: DifficultyTier): void {
    this.confusionMatrix[actual][predicted]++;
  }

  /**
   * Calculate F1 Score metrics from current prediction results
   */
  private calculateF1Metrics(): void {
    const tiers: DifficultyTier[] = ['struggling', 'learning', 'thriving', 'mastering'];
    let totalCorrect = 0;
    let totalPredictions = 0;
    let weightedF1Sum = 0;
    let totalSupport = 0;

    tiers.forEach(tier => {
      // Calculate True Positives, False Positives, False Negatives
      const truePositives = this.confusionMatrix[tier][tier];
      
      const falsePositives = tiers
        .filter(t => t !== tier)
        .reduce((sum, t) => sum + this.confusionMatrix[t][tier], 0);
      
      const falseNegatives = tiers
        .filter(t => t !== tier)
        .reduce((sum, t) => sum + this.confusionMatrix[tier][t], 0);

      // Calculate Precision, Recall, F1 Score
      const precision = (truePositives + falsePositives) > 0 ? 
        truePositives / (truePositives + falsePositives) : 0;
      
      const recall = (truePositives + falseNegatives) > 0 ? 
        truePositives / (truePositives + falseNegatives) : 0;
      
      const f1Score = (precision + recall) > 0 ? 
        2 * (precision * recall) / (precision + recall) : 0;

      this.f1Metrics.precision[tier] = precision;
      this.f1Metrics.recall[tier] = recall;
      this.f1Metrics.f1Score[tier] = f1Score;

      // Calculate support (actual occurrences of this tier)
      const support = tiers.reduce((sum, t) => sum + this.confusionMatrix[tier][t], 0);
      totalSupport += support;
      weightedF1Sum += f1Score * support;

      totalCorrect += truePositives;
      totalPredictions += support;
    });

    // Calculate overall metrics
    this.f1Metrics.accuracy = totalPredictions > 0 ? totalCorrect / totalPredictions : 0;
    this.f1Metrics.overallF1Score = totalSupport > 0 ? weightedF1Sum / totalSupport : 0;
  }

  /**
   * Export comprehensive analytics data to CSV
   */
  private exportCSVData(): void {
    const csvContent = this.generateCSVContent();
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bathala-dda-analytics-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate CSV content with F1 Score and Confusion Matrix data
   */
  private generateCSVContent(): string {
    let csv = '';
    
    // Session metadata
    csv += 'Bathala DDA Analytics Export\n';
    csv += `Export Date,${new Date().toISOString()}\n`;
    csv += `Total Combats,${this.simulationData.length}\n`;
    csv += `Total Predictions,${this.predictionResults.length}\n`;
    csv += '\n';

    // F1 Score Metrics
    csv += 'F1 Score Metrics\n';
    csv += 'Difficulty Tier,Precision,Recall,F1 Score\n';
    const tiers: DifficultyTier[] = ['struggling', 'learning', 'thriving', 'mastering'];
    tiers.forEach(tier => {
      csv += `${tier},${this.f1Metrics.precision[tier].toFixed(4)},${this.f1Metrics.recall[tier].toFixed(4)},${this.f1Metrics.f1Score[tier].toFixed(4)}\n`;
    });
    csv += `Overall Accuracy,${this.f1Metrics.accuracy.toFixed(4)}\n`;
    csv += `Overall F1 Score,${this.f1Metrics.overallF1Score.toFixed(4)}\n`;
    csv += '\n';

    // Confusion Matrix
    csv += 'Confusion Matrix\n';
    csv += 'Actual/Predicted,struggling,learning,thriving,mastering\n';
    tiers.forEach(actualTier => {
      csv += `${actualTier}`;
      tiers.forEach(predictedTier => {
        csv += `,${this.confusionMatrix[actualTier][predictedTier]}`;
      });
      csv += '\n';
    });
    csv += '\n';

    // Raw Prediction Data
    csv += 'Raw Prediction Data\n';
    csv += 'Timestamp,Combat ID,Predicted Tier,Actual Tier,PPS,Correct Prediction\n';
    this.predictionResults.forEach(result => {
      const isCorrect = result.actual === result.predicted ? 'TRUE' : 'FALSE';
      csv += `${new Date(result.timestamp).toISOString()},${result.combatId},${result.predicted},${result.actual},${result.pps.toFixed(4)},${isCorrect}\n`;
    });
    csv += '\n';

    // Simulation Data
    csv += 'Simulation Data\n';
    csv += 'Timestamp,PPS,Difficulty Tier\n';
    this.simulationData.forEach(data => {
      csv += `${new Date(data.timestamp).toISOString()},${data.pps.toFixed(4)},${data.tier}\n`;
    });

    // Analytics Summary
    if (this.analytics) {
      const sessionSummary = this.analytics.getSessionSummary();
      csv += '\n';
      csv += 'Session Analytics Summary\n';
      csv += sessionSummary.replace(/=/g, '').trim();
    }

    return csv;
  }

  /**
   * Update all display elements
   */
  private updateDisplay(): void {
    this.updateGraph();
    this.updateStatusPanel();
    this.updateAnalyticsPanel();
  }

  private updateGraph(): void {
    this.ppsGraph.clear();
    
    if (this.simulationData.length < 2) return;
    
    this.ppsGraph.lineStyle(3, 0x00ff00);
    
    const graphWidth = Math.floor(this.layout.contentWidth * 0.6);
    const graphHeight = 250;
    const graphContentY = 30; // Match title space
    const graphContentHeight = graphHeight - graphContentY - 10;
    
    for (let i = 1; i < this.simulationData.length; i++) {
      const prev = this.simulationData[i - 1];
      const curr = this.simulationData[i];
      
      const x1 = ((i - 1) / (this.simulationData.length - 1)) * graphWidth;
      const y1 = graphHeight - 10 - (prev.pps / 5) * graphContentHeight;
      const x2 = (i / (this.simulationData.length - 1)) * graphWidth;
      const y2 = graphHeight - 10 - (curr.pps / 5) * graphContentHeight;
      
      this.ppsGraph.lineBetween(x1, y1, x2, y2);
    }
  }

  private updateStatusPanel(): void {
    // Clear existing info
    this.infoPanel.removeAll(true);
    
    // Recreate background - responsive width
    const panelWidth = Math.floor(this.layout.contentWidth * 0.37);
    const panelHeight = 250;
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.infoPanel.add(bg);
    
    // Panel title
    const title = this.add.text(panelWidth / 2, 15, "📊 Current DDA State", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.infoPanel.add(title);
    
    // Get current PPS data
    const pps = this.dda.getPlayerPPS();
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    
    // Display info sections
    let yPos = 45;
    
    // === SECTION 1: Player Performance ===
    const section1Title = this.add.text(panelWidth / 2, yPos, "─── Player Status ───", {
      fontSize: 11,
      color: "#888888",
      fontFamily: "dungeon-mode",
    }).setOrigin(0.5);
    this.infoPanel.add(section1Title);
    yPos += 18;
    
    const playerLines = [
      { label: "PPS Score:", value: pps.currentPPS.toFixed(3), color: "#ffffff" },
      { label: "Difficulty:", value: pps.tier.toUpperCase(), color: this.getTierColor(pps.tier) },
      { label: "Combats:", value: pps.totalCombatsCompleted.toString(), color: "#cccccc" },
      { label: "Calibration:", value: pps.isCalibrating ? "ACTIVE" : "Done", color: pps.isCalibrating ? "#ffa502" : "#2ed573" },
    ];
    
    playerLines.forEach(line => {
      const labelText = this.add.text(15, yPos, line.label, {
        fontSize: 11,
        color: "#aaaaaa",
        fontFamily: "dungeon-mode",
      });
      this.infoPanel.add(labelText);
      
      const valueText = this.add.text(panelWidth - 15, yPos, line.value, {
        fontSize: 11,
        color: line.color,
        fontFamily: "dungeon-mode",
        fontStyle: "bold"
      }).setOrigin(1, 0);
      this.infoPanel.add(valueText);
      yPos += 15;
    });
    
    yPos += 5;
    
    // === SECTION 2: Streaks ===
    const section2Title = this.add.text(panelWidth / 2, yPos, "─── Combat Record ───", {
      fontSize: 11,
      color: "#888888",
      fontFamily: "dungeon-mode",
    }).setOrigin(0.5);
    this.infoPanel.add(section2Title);
    yPos += 18;
    
    // Only show wins - losses removed since players restart on defeat
    const labelText = this.add.text(15, yPos, "Win Streak:", {
      fontSize: 11,
      color: "#aaaaaa",
      fontFamily: "dungeon-mode",
    });
    this.infoPanel.add(labelText);
    
    const valueText = this.add.text(panelWidth - 15, yPos, `${pps.consecutiveVictories}`, {
      fontSize: 11,
      color: pps.consecutiveVictories > 0 ? "#2ed573" : "#666666",
      fontFamily: "dungeon-mode",
      fontStyle: "bold"
    }).setOrigin(1, 0);
    this.infoPanel.add(valueText);
    yPos += 15;
    
    yPos += 5;
    
    // === SECTION 3: DDA Modifiers ===
    const section3Title = this.add.text(panelWidth / 2, yPos, "─── Active Modifiers ───", {
      fontSize: 11,
      color: "#888888",
      fontFamily: "dungeon-mode",
    }).setOrigin(0.5);
    this.infoPanel.add(section3Title);
    yPos += 18;
    
    const modifierLines = [
      { label: "HP:", value: `×${adjustment.enemyHealthMultiplier.toFixed(2)}`, color: this.getModifierColor(adjustment.enemyHealthMultiplier) },
      { label: "DMG:", value: `×${adjustment.enemyDamageMultiplier.toFixed(2)}`, color: this.getModifierColor(adjustment.enemyDamageMultiplier) },
      { label: "Shop:", value: `×${adjustment.shopPriceMultiplier.toFixed(2)}`, color: this.getModifierColor(adjustment.shopPriceMultiplier) },
      { label: "Gold:", value: `×${adjustment.goldRewardMultiplier.toFixed(2)}`, color: this.getModifierColor(adjustment.goldRewardMultiplier, true) },
    ];
    
    modifierLines.forEach(line => {
      const labelText = this.add.text(15, yPos, line.label, {
        fontSize: 11,
        color: "#aaaaaa",
        fontFamily: "dungeon-mode",
      });
      this.infoPanel.add(labelText);
      
      const valueText = this.add.text(panelWidth - 15, yPos, line.value, {
        fontSize: 11,
        color: line.color,
        fontFamily: "dungeon-mode",
        fontStyle: "bold"
      }).setOrigin(1, 0);
      this.infoPanel.add(valueText);
      yPos += 15;
    });
  }
  
  /**
   * Get color for modifier based on value (higher = harder for player)
   */
  private getModifierColor(value: number, inverse: boolean = false): string {
    const isHarder = inverse ? value < 1 : value > 1;
    if (Math.abs(value - 1) < 0.05) return "#cccccc"; // Near baseline
    return isHarder ? "#ff6b6b" : "#51cf66";
  }
  
  /**
   * Get color for difficulty tier
   */
  private getTierColor(tier: DifficultyTier): string {
    const tierColors = {
      struggling: "#ff4757",
      learning: "#ffa502",
      thriving: "#2ed573",
      mastering: "#5352ed"
    };
    return tierColors[tier];
  }

  /**
   * Update analytics panel with F1 Score and Confusion Matrix data
   */
  private updateAnalyticsPanel(): void {
    // Clear existing analytics display
    this.analyticsPanel.removeAll(true);
    
    // Recreate background and title - responsive width
    const panelWidth = this.layout.contentWidth;
    const panelHeight = 180;
    
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.analyticsPanel.add(bg);
    
    const title = this.add.text(panelWidth / 2, 15, "📈 Analytics Dashboard", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.analyticsPanel.add(title);

    // F1 Score Display
    const f1Title = this.add.text(20, 45, "F1 Metrics:", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#00ff00",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(f1Title);

    let yOffset = 68;
    const tiers: DifficultyTier[] = ['struggling', 'learning', 'thriving', 'mastering'];
    
    // Calculate responsive spacing
    const tierSpacing = Math.floor(panelWidth * 0.15);
    
    tiers.forEach((tier, index) => {
      const f1Score = this.f1Metrics.f1Score[tier];
      const precision = this.f1Metrics.precision[tier];
      const recall = this.f1Metrics.recall[tier];
      
      const tierText = this.add.text(30 + (index * tierSpacing), yOffset, 
        `${tier.charAt(0).toUpperCase() + tier.slice(1)}\nF1: ${f1Score.toFixed(2)}\nP: ${precision.toFixed(2)}\nR: ${recall.toFixed(2)}`, {
        fontFamily: "dungeon-mode",
        fontSize: 10,
        color: "#ffffff",
        align: "left",
        lineSpacing: 2
      });
      this.analyticsPanel.add(tierText);
    });

    // Overall metrics - responsive positioning
    const overallX = Math.floor(panelWidth * 0.65);
    const overallText = this.add.text(overallX, 55, 
      `Accuracy: ${(this.f1Metrics.accuracy * 100).toFixed(1)}%\nF1: ${this.f1Metrics.overallF1Score.toFixed(3)}\nPredictions: ${this.predictionResults.length}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#ffff00",
      fontStyle: "bold",
      lineSpacing: 3
    });
    this.analyticsPanel.add(overallText);

    // Confusion Matrix Visualization
    const matrixX = Math.floor(panelWidth * 0.8);
    const matrixTitle = this.add.text(matrixX, 45, "Confusion:", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#ff6b35",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(matrixTitle);

    // Create a mini confusion matrix display
    const cellSize = 22;
    const startX = matrixX + 5;
    const startY = 75;
    
    tiers.forEach((actualTier, row) => {
      tiers.forEach((predictedTier, col) => {
        const count = this.confusionMatrix[actualTier][predictedTier];
        const x = startX + (col * cellSize);
        const y = startY + (row * cellSize);
        
        // Color coding: green for correct predictions, red for incorrect
        const isCorrect = actualTier === predictedTier;
        const color = isCorrect ? (count > 0 ? 0x2ed573 : 0x111111) : (count > 0 ? 0xff4757 : 0x111111);
        
        const cell = this.add.rectangle(x, y, cellSize - 2, cellSize - 2, color);
        cell.setStrokeStyle(1, 0x555555);
        this.analyticsPanel.add(cell);
        
        if (count > 0) {
          const countText = this.add.text(x, y, count.toString(), {
            fontFamily: "dungeon-mode",
            fontSize: 9,
            color: "#ffffff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 2
          }).setOrigin(0.5);
          this.analyticsPanel.add(countText);
        }
      });
    });
  }
}
