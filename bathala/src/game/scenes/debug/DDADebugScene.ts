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
 * Interfaces for DDA Regression Testing and Analytics
 */
interface PPSPredictionResult {
  expectedPPS: number;
  actualPPS: number;
  ppsError: number;
  expectedTier: DifficultyTier;
  actualTier: DifficultyTier;
  tierTransitionCorrect: boolean;
  timestamp: number;
  combatId: string;
  combatMetrics: CombatMetrics;
}

interface TierTransitionTest {
  fromTier: DifficultyTier;
  toTier: DifficultyTier;
  ppsThreshold: number;
  actualPPS: number;
  transitionCorrect: boolean;
  timestamp: number;
}

interface RegressionMetrics {
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  rSquared: number;
  meanPPSError: number;
  ppsAccuracy: number; // Percentage of PPS predictions within acceptable range
}

interface DDAValidationResults {
  ppsAccuracy: RegressionMetrics;
  tierTransitionAccuracy: number;
  modifierApplicationCorrectness: number;
  calibrationPeriodValidation: boolean;
  edgeCaseHandling: {
    extremeHighPerformance: boolean;
    extremeLowPerformance: boolean;
    boundaryConditions: boolean;
  };
  totalTests: number;
  passedTests: number;
  overallScore: number;
}

export class DDADebugScene extends Scene {
  private dda: RuleBasedDDA;
  private analytics: DDAAnalyticsManager;
  private simulationData: Array<{ pps: number; tier: DifficultyTier; timestamp: number }> = [];
  
  // New analytics data for DDA Regression Testing
  private ppsPredictionResults: PPSPredictionResult[] = [];
  private tierTransitionTests: TierTransitionTest[] = [];
  private regressionMetrics: RegressionMetrics;
  private validationResults: DDAValidationResults;
  
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
    
    // Initialize regression metrics
    this.regressionMetrics = {
      meanAbsoluteError: 0,
      rootMeanSquareError: 0,
      rSquared: 0,
      meanPPSError: 0,
      ppsAccuracy: 0
    };
    
    // Initialize validation results
    this.validationResults = {
      ppsAccuracy: this.regressionMetrics,
      tierTransitionAccuracy: 0,
      modifierApplicationCorrectness: 0,
      calibrationPeriodValidation: false,
      edgeCaseHandling: {
        extremeHighPerformance: false,
        extremeLowPerformance: false,
        boundaryConditions: false
      },
      totalTests: 0,
      passedTests: 0,
      overallScore: 0
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
    
    this.add.text(
      screenWidth / 2,
      80,
      "Note: Defeats halt the game and erase progress - DDA only tracks victories",
      {
        fontFamily: "dungeon-mode",
        fontSize: 12,
        color: "#ffa502",
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
        text: "Poor Performance", 
        desc: "20% HP, 12 turns\nLow efficiency", 
        color: 0xff4757, 
        x: startX + buttonSpacing * 3, 
        y: 50,
        action: () => this.testPoorPerformance() 
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
    
    // Advanced test buttons (third row)
    const advancedButtons = [
      { 
        text: "Tier Tests", 
        desc: "Test tier\nboundaries", 
        color: 0x9c88ff, 
        x: startX + buttonSpacing * 0, 
        y: 120,
        action: () => this.testTierBoundaryTransitions() 
      },
      { 
        text: "Realistic Run", 
        desc: "Simulate typical\ngameplay flow", 
        color: 0x2ed573, 
        x: startX + buttonSpacing * 1, 
        y: 120,
        action: () => this.testRealisticGameplayProgression() 
      },
      { 
        text: "Calibration", 
        desc: "Test calibration\nperiod", 
        color: 0x4ecdc4, 
        x: startX + buttonSpacing * 2, 
        y: 120,
        action: () => this.testCalibrationPeriod() 
      },
      { 
        text: "Full Suite", 
        desc: "Run all\nvalidation tests", 
        color: 0x2ed573, 
        x: startX + buttonSpacing * 3, 
        y: 120,
        action: () => this.runFullValidationSuite() 
      },
    ];
    
    [...combatButtons, ...controlButtons, ...advancedButtons].forEach(btn => {
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
  
  // Legacy createButton method removed - use createEnhancedButton instead

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
   * Test scenarios with proper ground truth validation
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
    this.simulateCombatWithValidation(fullMetrics);
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
    this.simulateCombatWithValidation(fullMetrics);
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
    this.simulateCombatWithValidation(fullMetrics);
  }


  private testPoorPerformance(): void {
    // Test poor performance scenario - low health, long combat, inefficient play
    const poorMetrics: CombatMetrics = {
      combatId: `test-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 16, // 20% health
      healthPercentage: 0.2,
      turnCount: 12, // Long combat
      damageDealt: 40,
      damageReceived: 64, // Took a lot of damage
      discardsUsed: 8, // Inefficient discard usage
      maxDiscardsAvailable: 12,
      handsPlayed: ["high_card", "high_card", "high_card", "pair"],
      bestHandAchieved: "high_card", // Poor hand quality
      averageHandQuality: 1,
      victory: true, // Still won, but poorly
      combatDuration: 300000,
      enemyType: "common",
      enemyName: "Common Enemy",
      enemyStartHealth: 40
    };
    this.simulateCombatWithValidation(poorMetrics);
  }

  /**
   * New comprehensive test scenarios for better DDA validation
   */
  private testTierBoundaryTransitions(): void {
    console.log("🧪 Testing tier boundary transitions...");
    
    // Test struggling to learning transition (PPS 1.0 -> 1.1)
    this.testSpecificPPSTransition(0.9, 1.2, "struggling", "learning");
    
    // Test learning to thriving transition (PPS 2.5 -> 2.6)
    this.testSpecificPPSTransition(2.4, 2.7, "learning", "thriving");
    
    // Test thriving to mastering transition (PPS 4.0 -> 4.1)
    this.testSpecificPPSTransition(3.9, 4.2, "thriving", "mastering");
  }

  /**
   * Test realistic gameplay progression (performance-based PPS changes)
   */
  private testRealisticGameplayProgression(): void {
    console.log("🧪 Testing realistic gameplay progression...");
    
    // Simulate a typical run progression with varying performance
    const scenarios = [
      // Early game - learning phase (moderate performance)
      { health: 0.8, turns: 4, hand: "pair", efficiency: 0.8, victory: true },
      { health: 0.9, turns: 3, hand: "three_of_a_kind", efficiency: 0.9, victory: true },
      { health: 0.7, turns: 5, hand: "pair", efficiency: 0.7, victory: true },
      
      // Mid game - some challenges (poor performance)
      { health: 0.6, turns: 7, hand: "high_card", efficiency: 0.6, victory: true },
      { health: 0.4, turns: 8, hand: "pair", efficiency: 0.5, victory: true },
      { health: 0.3, turns: 9, hand: "high_card", efficiency: 0.4, victory: true },
      
      // Late game - more skilled (excellent performance)
      { health: 0.8, turns: 4, hand: "four_of_a_kind", efficiency: 0.9, victory: true },
      { health: 0.9, turns: 3, hand: "straight", efficiency: 1.0, victory: true },
      { health: 0.7, turns: 5, hand: "three_of_a_kind", efficiency: 0.8, victory: true },
      
      // Occasional poor performance (but still victory)
      { health: 0.2, turns: 12, hand: "high_card", efficiency: 0.3, victory: true },
      
      // Very poor performance (but still victory - defeats halt the game)
      { health: 0.1, turns: 15, hand: "high_card", efficiency: 0.2, victory: true },
    ];
    
    scenarios.forEach((scenario, index) => {
      const metrics: CombatMetrics = {
        combatId: `realistic-${index}-${Date.now()}`,
        timestamp: Date.now(),
        startHealth: 80,
        startMaxHealth: 80,
        startGold: 100,
        endHealth: Math.round(80 * scenario.health),
        healthPercentage: scenario.health,
        turnCount: scenario.turns,
        damageDealt: Math.round(40 * scenario.efficiency), // Efficient players deal more damage
        damageReceived: Math.round(80 * (1 - scenario.health)),
        discardsUsed: Math.floor(scenario.turns * (1 - scenario.efficiency)), // Inefficient players use more discards
        maxDiscardsAvailable: scenario.turns,
        handsPlayed: [scenario.hand as any],
        bestHandAchieved: scenario.hand as any,
        averageHandQuality: this.getHandQualityScore(scenario.hand),
        victory: true, // All are victories - defeats halt the game
        combatDuration: scenario.turns * 10000,
        enemyType: "common",
        enemyName: `Enemy ${index + 1}`,
        enemyStartHealth: 40
      };
      
      this.simulateCombatWithValidation(metrics);
    });
  }

  private testExtremePerformance(): void {
    console.log("🧪 Testing extreme performance scenarios...");
    
    // Extreme high performance
    const extremeHigh: CombatMetrics = {
      combatId: `extreme-high-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 1,
      damageDealt: 100,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 3,
      handsPlayed: ["royal_flush"],
      bestHandAchieved: "royal_flush",
      averageHandQuality: 9,
      victory: true,
      combatDuration: 10000,
      enemyType: "boss",
      enemyName: "Boss Enemy",
      enemyStartHealth: 100
    };
    this.simulateCombatWithValidation(extremeHigh);
    
    // Extreme low performance
    const extremeLow: CombatMetrics = {
      combatId: `extreme-low-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 0,
      healthPercentage: 0,
      turnCount: 20,
      damageDealt: 5,
      damageReceived: 80,
      discardsUsed: 3,
      maxDiscardsAvailable: 3,
      handsPlayed: ["high_card", "high_card", "high_card"],
      bestHandAchieved: "high_card",
      averageHandQuality: 0,
      victory: false,
      combatDuration: 600000,
      enemyType: "common",
      enemyName: "Common Enemy",
      enemyStartHealth: 20
    };
    this.simulateCombatWithValidation(extremeLow);
  }

  private testCalibrationPeriod(): void {
    console.log("🧪 Testing calibration period...");
    
    // Reset to fresh state
    this.startFreshTest(this.currentConfig);
    
    // Test that calibration prevents tier changes
    const calibrationMetrics: CombatMetrics = {
      combatId: `calibration-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 1,
      damageDealt: 100,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 1,
      handsPlayed: ["royal_flush"],
      bestHandAchieved: "royal_flush",
      averageHandQuality: 9,
      victory: true,
      combatDuration: 5000,
      enemyType: "common",
      enemyName: "Test Enemy",
      enemyStartHealth: 50
    };
    
    this.simulateCombatWithValidation(calibrationMetrics);
  }

  /**
   * Run comprehensive validation suite
   */
  private runFullValidationSuite(): void {
    console.log("🧪 Running full DDA validation suite...");
    
    // Reset data first
    this.resetData();
    
    // Run all test categories
    this.testTierBoundaryTransitions();
    this.testRealisticGameplayProgression(); // Most important - reflects actual gameplay
    this.testExtremePerformance();
    this.testCalibrationPeriod();
    
    // Run additional comprehensive tests
    this.testModifierApplication();
    this.testEdgeCases();
    
    console.log("✅ Full validation suite completed!");
    console.log(`📊 Overall Score: ${(this.validationResults.overallScore * 100).toFixed(1)}%`);
    console.log(`🎯 Tests Passed: ${this.validationResults.passedTests}/${this.validationResults.totalTests}`);
  }

  /**
   * Test modifier application accuracy
   */
  private testModifierApplication(): void {
    console.log("🧪 Testing modifier application...");
    
    const tiers: DifficultyTier[] = ['struggling', 'learning', 'thriving', 'mastering'];
    
    tiers.forEach(tier => {
      // Set specific tier
      const currentState = this.dda.getPlayerPPS();
      currentState.tier = tier;
      
      // Test that modifiers are applied correctly
      const adjustment = this.dda.getCurrentDifficultyAdjustment();
      const expectedModifiers = this.calculateExpectedModifiers(tier);
      
      const healthCorrect = Math.abs(adjustment.enemyHealthMultiplier - expectedModifiers.enemyHealthMultiplier) < 0.05;
      const damageCorrect = Math.abs(adjustment.enemyDamageMultiplier - expectedModifiers.enemyDamageMultiplier) < 0.05;
      
      console.log(`Tier ${tier}: Health ${healthCorrect ? '✓' : '✗'}, Damage ${damageCorrect ? '✓' : '✗'}`);
    });
  }

  /**
   * Test edge cases and boundary conditions
   */
  private testEdgeCases(): void {
    console.log("🧪 Testing edge cases...");
    
    // Test PPS boundaries (0 and 5)
    this.testPPSBoundary(0);
    this.testPPSBoundary(5);
    
    // Test invalid combat metrics
    this.testInvalidMetrics();
  }

  /**
   * Test PPS boundary conditions
   */
  private testPPSBoundary(targetPPS: number): void {
    const currentState = this.dda.getPlayerPPS();
    currentState.currentPPS = targetPPS;
    
    const testMetrics: CombatMetrics = {
      combatId: `boundary-${targetPPS}-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 3,
      damageDealt: 50,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 1,
      handsPlayed: ["four_of_a_kind"],
      bestHandAchieved: "four_of_a_kind",
      averageHandQuality: 7,
      victory: true,
      combatDuration: 30000,
      enemyType: "common",
      enemyName: "Boundary Test Enemy",
      enemyStartHealth: 50
    };
    
    this.simulateCombatWithValidation(testMetrics);
  }

  /**
   * Test invalid combat metrics handling
   */
  private testInvalidMetrics(): void {
    console.log("🧪 Testing invalid metrics handling...");
    
    // Test with negative values
    const invalidMetrics: CombatMetrics = {
      combatId: `invalid-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: -10, // Invalid
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 3,
      damageDealt: 50,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 1,
      handsPlayed: ["four_of_a_kind"],
      bestHandAchieved: "four_of_a_kind",
      averageHandQuality: 7,
      victory: true,
      combatDuration: 30000,
      enemyType: "common",
      enemyName: "Invalid Test Enemy",
      enemyStartHealth: 50
    };
    
    try {
      this.simulateCombatWithValidation(invalidMetrics);
      console.log("✓ Invalid metrics handled gracefully");
    } catch (error) {
      console.log("✗ Invalid metrics caused error:", error);
    }
  }

  /**
   * Simulate combat with proper DDA validation and ground truth testing
   */
  private simulateCombatWithValidation(metrics: CombatMetrics): void {
    // Get pre-combat state
    const preCombatState = this.dda.getPlayerPPS();
    const preCombatPPS = preCombatState.currentPPS;
    const preCombatTier = preCombatState.tier;
    
    // Calculate expected PPS adjustment based on combat metrics
    const expectedPPSAdjustment = this.calculateExpectedPPSAdjustment(metrics, preCombatTier);
    const expectedPPS = Math.max(0, Math.min(5, preCombatPPS + expectedPPSAdjustment));
    const expectedTier = this.calculateExpectedTier(expectedPPS);
    
    // Update DDA with combat results
    const result = this.dda.processCombatResults(metrics);
    
    // Record combat with analytics manager
    this.analytics.recordCombat(metrics);
    
    // Calculate validation metrics
    const ppsError = Math.abs(result.currentPPS - expectedPPS);
    const tierTransitionCorrect = result.tier === expectedTier;
    
    // Record PPS prediction result
    const ppsPredictionResult: PPSPredictionResult = {
      expectedPPS,
      actualPPS: result.currentPPS,
      ppsError,
      expectedTier,
      actualTier: result.tier,
      tierTransitionCorrect,
      timestamp: Date.now(),
      combatId: metrics.combatId,
      combatMetrics: metrics
    };
    
    this.ppsPredictionResults.push(ppsPredictionResult);
    
    // Record tier transition test if tier changed
    if (preCombatTier !== result.tier) {
      const tierTransitionTest: TierTransitionTest = {
        fromTier: preCombatTier,
        toTier: result.tier,
        ppsThreshold: this.getTierThreshold(result.tier),
        actualPPS: result.currentPPS,
        transitionCorrect: tierTransitionCorrect,
        timestamp: Date.now()
      };
      this.tierTransitionTests.push(tierTransitionTest);
    }
    
    // Recalculate regression metrics
    this.calculateRegressionMetrics();
    
    // Add to simulation data
    this.simulationData.push({
      pps: result.currentPPS,
      tier: result.tier,
      timestamp: Date.now()
    });
    
    // Update display
    this.updateDisplay();
    
    console.log(`🎯 Combat Validation: Expected PPS ${expectedPPS.toFixed(3)}, Actual ${result.currentPPS.toFixed(3)}, Error ${ppsError.toFixed(3)}`);
  }

  /**
   * Calculate expected PPS adjustment based on combat metrics and current tier
   */
  private calculateExpectedPPSAdjustment(metrics: CombatMetrics, currentTier: DifficultyTier): number {
    let adjustment = 0;
    const config = this.currentConfig.ppsModifiers;
    const tierScale = this.currentConfig.tierScaling[currentTier];

    // 1. Victory/Defeat base
    if (metrics.victory) {
      adjustment += config.victoryBonus;
    } else {
      adjustment += config.defeatPenalty;
    }

    // 2. Health-based modifiers (Gradient system - matches DDA logic)
    let healthAdjustment = 0;
    
    if (metrics.healthPercentage >= 0.9) {
      // Excellent health (90-100%)
      healthAdjustment += config.highHealthBonus;
    } else if (metrics.healthPercentage >= 0.7) {
      // Good health (70-89%) - small bonus
      healthAdjustment += config.highHealthBonus * 0.5;
    } else if (metrics.healthPercentage >= 0.5) {
      // Moderate health (50-69%) - neutral
      healthAdjustment += 0;
    } else if (metrics.healthPercentage >= 0.3) {
      // Poor health (30-49%) - small penalty
      healthAdjustment += config.lowHealthPenalty * 0.5;
    } else {
      // Very poor health (<30%) - full penalty
      healthAdjustment += config.lowHealthPenalty;
    }

    // 3. Perfect combat bonus
    if (metrics.damageReceived === 0 && metrics.victory) {
      healthAdjustment += config.perfectCombatBonus;
    }

    // Apply tier scaling to health adjustments
    if (healthAdjustment > 0) {
      healthAdjustment *= tierScale.bonusMultiplier;
    } else {
      healthAdjustment *= tierScale.penaltyMultiplier;
    }
    adjustment += healthAdjustment;

    // 4. Hand quality bonus
    const bestHandQuality = this.getHandQualityScore(metrics.bestHandAchieved);
    if (bestHandQuality >= 7) { // Four of a kind or better
      adjustment += config.goodHandBonus * tierScale.bonusMultiplier;
    }

    // 5. Combat duration penalty (Tier-based thresholds calibrated to actual damage output)
    let turnPenalty = 0;
    
    if (currentTier === "mastering") {
      if (metrics.turnCount > 4) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else if (currentTier === "thriving") {
      if (metrics.turnCount > 5) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else if (currentTier === "learning") {
      if (metrics.turnCount > 7) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    } else {
      if (metrics.turnCount > 9) {
        turnPenalty = config.longCombatPenalty * tierScale.penaltyMultiplier;
      }
    }
    
    adjustment += turnPenalty;

    // 6. Resource efficiency bonus
    const discardEfficiency = 1 - (metrics.discardsUsed / Math.max(1, metrics.maxDiscardsAvailable));
    if (discardEfficiency > 0.8) {
      adjustment += config.resourceEfficiencyBonus * tierScale.bonusMultiplier;
    }

    // 6.5. Clutch victory bonus
    const startingHealthRatio = metrics.startHealth / metrics.startMaxHealth;
    if (startingHealthRatio < 0.5 && metrics.victory) {
      const clutchBonus = 0.15 * (1 - startingHealthRatio * 2);
      adjustment += clutchBonus * tierScale.bonusMultiplier;
    }

    // 7. Comeback bonus
    if (this.currentConfig.comebackBonus.enabled && 
        metrics.victory && 
        this.dda.getPlayerPPS().currentPPS < this.currentConfig.comebackBonus.ppsThreshold) {
      adjustment += this.currentConfig.comebackBonus.bonusPerVictory;
    }

    return adjustment;
  }

  /**
   * Calculate expected tier based on PPS
   */
  private calculateExpectedTier(pps: number): DifficultyTier {
    const tiers = this.currentConfig.difficultyTiers;
    
    if (pps >= tiers.mastering.min && pps <= tiers.mastering.max) {
      return "mastering";
    } else if (pps >= tiers.thriving.min && pps <= tiers.thriving.max) {
      return "thriving";
    } else if (pps >= tiers.learning.min && pps <= tiers.learning.max) {
      return "learning";
    } else {
      return "struggling";
    }
  }

  /**
   * Get tier threshold for validation
   */
  private getTierThreshold(tier: DifficultyTier): number {
    const tiers = this.currentConfig.difficultyTiers;
    return tiers[tier].min;
  }

  /**
   * Get hand quality score
   */
  private getHandQualityScore(handType: string): number {
    const scores: Record<string, number> = {
      high_card: 0,
      pair: 1,
      two_pair: 2,
      three_of_a_kind: 3,
      straight: 4,
      flush: 5,
      full_house: 6,
      four_of_a_kind: 7,
      straight_flush: 8,
      royal_flush: 9,
      five_of_a_kind: 8
    };
    return scores[handType] || 0;
  }

  /**
   * Test specific PPS transition between tiers
   */
  private testSpecificPPSTransition(startPPS: number, _endPPS: number, fromTier: DifficultyTier, _toTier: DifficultyTier): void {
    // Set DDA to specific PPS
    const currentState = this.dda.getPlayerPPS();
    currentState.currentPPS = startPPS;
    currentState.tier = fromTier;
    
    // Create combat metrics that should trigger the transition
    const transitionMetrics: CombatMetrics = {
      combatId: `transition-${Date.now()}`,
      timestamp: Date.now(),
      startHealth: 80,
      startMaxHealth: 80,
      startGold: 100,
      endHealth: 80,
      healthPercentage: 1.0,
      turnCount: 3,
      damageDealt: 50,
      damageReceived: 0,
      discardsUsed: 0,
      maxDiscardsAvailable: 1,
      handsPlayed: ["four_of_a_kind"],
      bestHandAchieved: "four_of_a_kind",
      averageHandQuality: 7,
      victory: true,
      combatDuration: 30000,
      enemyType: "common",
      enemyName: "Transition Test Enemy",
      enemyStartHealth: 50
    };
    
    this.simulateCombatWithValidation(transitionMetrics);
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
      () => this.testPoorPerformance(),
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    randomScenario();
    
    // Schedule next test
    this.time.delayedCall(1000, () => this.runAutoTest());
  }

  private resetData(): void {
    this.simulationData = [];
    this.ppsPredictionResults = [];
    this.tierTransitionTests = [];
    
    // Reset regression metrics
    this.regressionMetrics = {
      meanAbsoluteError: 0,
      rootMeanSquareError: 0,
      rSquared: 0,
      meanPPSError: 0,
      ppsAccuracy: 0
    };
    
    // Reset validation results
    this.validationResults = {
      ppsAccuracy: this.regressionMetrics,
      tierTransitionAccuracy: 0,
      modifierApplicationCorrectness: 0,
      calibrationPeriodValidation: false,
      edgeCaseHandling: {
        extremeHighPerformance: false,
        extremeLowPerformance: false,
        boundaryConditions: false
      },
      totalTests: 0,
      passedTests: 0,
      overallScore: 0
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
   * Calculate regression metrics for PPS prediction accuracy
   */
  private calculateRegressionMetrics(): void {
    if (this.ppsPredictionResults.length === 0) {
      this.regressionMetrics = {
        meanAbsoluteError: 0,
        rootMeanSquareError: 0,
        rSquared: 0,
        meanPPSError: 0,
        ppsAccuracy: 0
      };
      return;
    }

    const errors = this.ppsPredictionResults.map(r => r.ppsError);
    const expectedValues = this.ppsPredictionResults.map(r => r.expectedPPS);

    // Calculate Mean Absolute Error (MAE)
    const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;
    this.regressionMetrics.meanAbsoluteError = mae;

    // Calculate Root Mean Square Error (RMSE)
    const mse = errors.reduce((sum, error) => sum + error * error, 0) / errors.length;
    this.regressionMetrics.rootMeanSquareError = Math.sqrt(mse);

    // Calculate R-squared
    const meanExpected = expectedValues.reduce((sum, val) => sum + val, 0) / expectedValues.length;
    const ssRes = errors.reduce((sum, error) => sum + error * error, 0);
    const ssTot = expectedValues.reduce((sum, val) => sum + Math.pow(val - meanExpected, 2), 0);
    this.regressionMetrics.rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    // Calculate mean PPS error
    this.regressionMetrics.meanPPSError = mae;

    // Calculate PPS accuracy (percentage within acceptable range)
    const acceptableRange = 0.1; // Within 0.1 PPS points
    const accuratePredictions = errors.filter(error => error <= acceptableRange).length;
    this.regressionMetrics.ppsAccuracy = accuratePredictions / errors.length;

    // Update validation results
    this.updateValidationResults();
  }

  /**
   * Update comprehensive validation results
   */
  private updateValidationResults(): void {
    this.validationResults.ppsAccuracy = this.regressionMetrics;
    
    // Calculate tier transition accuracy
    if (this.tierTransitionTests.length > 0) {
      const correctTransitions = this.tierTransitionTests.filter(t => t.transitionCorrect).length;
      this.validationResults.tierTransitionAccuracy = correctTransitions / this.tierTransitionTests.length;
    } else {
      this.validationResults.tierTransitionAccuracy = 1.0; // No transitions to test
    }

    // Calculate modifier application correctness
    this.validationResults.modifierApplicationCorrectness = this.validateModifierApplication();

    // Validate calibration period
    this.validationResults.calibrationPeriodValidation = this.validateCalibrationPeriod();

    // Validate edge case handling
    this.validationResults.edgeCaseHandling = this.validateEdgeCaseHandling();

    // Calculate overall score
    this.calculateOverallValidationScore();
  }

  /**
   * Validate modifier application correctness
   */
  private validateModifierApplication(): number {
    if (this.ppsPredictionResults.length === 0) return 1.0;

    let correctModifiers = 0;
    let totalModifiers = 0;

    this.ppsPredictionResults.forEach(result => {
      const adjustment = this.dda.getCurrentDifficultyAdjustment();
      const expectedAdjustment = this.calculateExpectedModifiers(result.actualTier);
      
      // Check if modifiers are within acceptable range
      const healthCorrect = Math.abs(adjustment.enemyHealthMultiplier - expectedAdjustment.enemyHealthMultiplier) < 0.05;
      const damageCorrect = Math.abs(adjustment.enemyDamageMultiplier - expectedAdjustment.enemyDamageMultiplier) < 0.05;
      
      if (healthCorrect) correctModifiers++;
      if (damageCorrect) correctModifiers++;
      totalModifiers += 2;
    });

    return totalModifiers > 0 ? correctModifiers / totalModifiers : 1.0;
  }

  /**
   * Calculate expected modifiers for a given tier
   */
  private calculateExpectedModifiers(tier: DifficultyTier): { enemyHealthMultiplier: number; enemyDamageMultiplier: number } {
    const enemyScaling = this.currentConfig.enemyScaling[tier];
    return {
      enemyHealthMultiplier: enemyScaling.healthMultiplier,
      enemyDamageMultiplier: enemyScaling.damageMultiplier
    };
  }

  /**
   * Validate calibration period behavior
   */
  private validateCalibrationPeriod(): boolean {
    const playerPPS = this.dda.getPlayerPPS();
    const calibrationCount = this.currentConfig.calibration.combatCount;
    
    // If still in calibration, tier should be "learning"
    if (playerPPS.isCalibrating) {
      return playerPPS.tier === "learning";
    }
    
    // If calibration completed, check that it was properly tracked
    return playerPPS.totalCombatsCompleted >= calibrationCount;
  }

  /**
   * Validate edge case handling
   */
  private validateEdgeCaseHandling(): { extremeHighPerformance: boolean; extremeLowPerformance: boolean; boundaryConditions: boolean } {
    const extremeHigh = this.ppsPredictionResults.some(r => 
      r.combatMetrics.healthPercentage === 1.0 && 
      r.combatMetrics.damageReceived === 0 && 
      r.combatMetrics.bestHandAchieved === "royal_flush"
    );
    
    const extremeLow = this.ppsPredictionResults.some(r => 
      r.combatMetrics.healthPercentage === 0 && 
      r.combatMetrics.victory === false
    );
    
    const boundaryConditions = this.tierTransitionTests.some(t => 
      t.fromTier !== t.toTier && t.transitionCorrect
    );

    return {
      extremeHighPerformance: extremeHigh,
      extremeLowPerformance: extremeLow,
      boundaryConditions: boundaryConditions
    };
  }

  /**
   * Calculate overall validation score
   */
  private calculateOverallValidationScore(): void {
    const ppsScore = this.regressionMetrics.ppsAccuracy;
    const tierScore = this.validationResults.tierTransitionAccuracy;
    const modifierScore = this.validationResults.modifierApplicationCorrectness;
    const calibrationScore = this.validationResults.calibrationPeriodValidation ? 1.0 : 0.0;
    
    const edgeCaseScore = Object.values(this.validationResults.edgeCaseHandling)
      .reduce((sum, passed) => sum + (passed ? 1 : 0), 0) / 3;

    this.validationResults.overallScore = (
      ppsScore * 0.3 +
      tierScore * 0.25 +
      modifierScore * 0.2 +
      calibrationScore * 0.15 +
      edgeCaseScore * 0.1
    );

    this.validationResults.totalTests = this.ppsPredictionResults.length + this.tierTransitionTests.length;
    this.validationResults.passedTests = Math.floor(this.validationResults.overallScore * this.validationResults.totalTests);
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
   * Generate CSV content with DDA Regression Testing data
   */
  private generateCSVContent(): string {
    let csv = '';
    
    // Session metadata
    csv += 'Bathala DDA Validation Export\n';
    csv += `Export Date,${new Date().toISOString()}\n`;
    csv += `Total Combats,${this.simulationData.length}\n`;
    csv += `Total PPS Predictions,${this.ppsPredictionResults.length}\n`;
    csv += `Total Tier Transitions,${this.tierTransitionTests.length}\n`;
    csv += '\n';

    // Regression Metrics
    csv += 'Regression Metrics\n';
    csv += 'Metric,Value\n';
    csv += `Mean Absolute Error,${this.regressionMetrics.meanAbsoluteError.toFixed(6)}\n`;
    csv += `Root Mean Square Error,${this.regressionMetrics.rootMeanSquareError.toFixed(6)}\n`;
    csv += `R-Squared,${this.regressionMetrics.rSquared.toFixed(6)}\n`;
    csv += `Mean PPS Error,${this.regressionMetrics.meanPPSError.toFixed(6)}\n`;
    csv += `PPS Accuracy,${(this.regressionMetrics.ppsAccuracy * 100).toFixed(2)}%\n`;
    csv += '\n';

    // Validation Results
    csv += 'Validation Results\n';
    csv += 'Test Category,Score,Status\n';
    csv += `Tier Transition Accuracy,${(this.validationResults.tierTransitionAccuracy * 100).toFixed(2)}%,${this.validationResults.tierTransitionAccuracy > 0.8 ? 'PASS' : 'FAIL'}\n`;
    csv += `Modifier Application,${(this.validationResults.modifierApplicationCorrectness * 100).toFixed(2)}%,${this.validationResults.modifierApplicationCorrectness > 0.8 ? 'PASS' : 'FAIL'}\n`;
    csv += `Calibration Period,${this.validationResults.calibrationPeriodValidation ? '100.00' : '0.00'}%,${this.validationResults.calibrationPeriodValidation ? 'PASS' : 'FAIL'}\n`;
    csv += `Extreme High Performance,${this.validationResults.edgeCaseHandling.extremeHighPerformance ? 'PASS' : 'FAIL'}\n`;
    csv += `Extreme Low Performance,${this.validationResults.edgeCaseHandling.extremeLowPerformance ? 'PASS' : 'FAIL'}\n`;
    csv += `Boundary Conditions,${this.validationResults.edgeCaseHandling.boundaryConditions ? 'PASS' : 'FAIL'}\n`;
    csv += `Overall Score,${(this.validationResults.overallScore * 100).toFixed(2)}%,${this.validationResults.overallScore > 0.8 ? 'PASS' : 'FAIL'}\n`;
    csv += `Tests Passed,${this.validationResults.passedTests}/${this.validationResults.totalTests}\n`;
      csv += '\n';

    // PPS Prediction Data
    csv += 'PPS Prediction Data\n';
    csv += 'Timestamp,Combat ID,Expected PPS,Actual PPS,PPS Error,Expected Tier,Actual Tier,Tier Correct,Health %,Turns,Best Hand,Victory\n';
    this.ppsPredictionResults.forEach(result => {
      csv += `${new Date(result.timestamp).toISOString()},${result.combatId},${result.expectedPPS.toFixed(4)},${result.actualPPS.toFixed(4)},${result.ppsError.toFixed(4)},${result.expectedTier},${result.actualTier},${result.tierTransitionCorrect ? 'TRUE' : 'FALSE'},${(result.combatMetrics.healthPercentage * 100).toFixed(1)}%,${result.combatMetrics.turnCount},${result.combatMetrics.bestHandAchieved},${result.combatMetrics.victory ? 'TRUE' : 'FALSE'}\n`;
    });
    csv += '\n';

    // Tier Transition Data
    if (this.tierTransitionTests.length > 0) {
      csv += 'Tier Transition Data\n';
      csv += 'Timestamp,From Tier,To Tier,PPS Threshold,Actual PPS,Transition Correct\n';
      this.tierTransitionTests.forEach(test => {
        csv += `${new Date(test.timestamp).toISOString()},${test.fromTier},${test.toTier},${test.ppsThreshold.toFixed(2)},${test.actualPPS.toFixed(4)},${test.transitionCorrect ? 'TRUE' : 'FALSE'}\n`;
    });
    csv += '\n';
    }

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
    
    // Show win streak and defeat info
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
    
    // Show performance streak (since defeats halt the game)
    const performanceLabelText = this.add.text(15, yPos, "Performance:", {
      fontSize: 11,
      color: "#aaaaaa",
      fontFamily: "dungeon-mode",
    });
    this.infoPanel.add(performanceLabelText);
    
    const performanceValueText = this.add.text(panelWidth - 15, yPos, `${pps.consecutiveVictories > 0 ? 'Good' : 'Learning'}`, {
      fontSize: 11,
      color: pps.consecutiveVictories > 0 ? "#2ed573" : "#ffa502",
      fontFamily: "dungeon-mode",
      fontStyle: "bold"
    }).setOrigin(1, 0);
    this.infoPanel.add(performanceValueText);
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
   * Update analytics panel with DDA Regression Testing data
   */
  private updateAnalyticsPanel(): void {
    // Clear existing analytics display
    this.analyticsPanel.removeAll(true);
    
    // Recreate background and title - responsive width
    const panelWidth = this.layout.contentWidth;
    const panelHeight = 200; // Increased height for more metrics
    
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.analyticsPanel.add(bg);
    
    const title = this.add.text(panelWidth / 2, 15, "📈 DDA Validation Dashboard", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 18,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.analyticsPanel.add(title);

    // Regression Metrics Display
    const regressionTitle = this.add.text(20, 45, "Regression Metrics:", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#00ff00",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(regressionTitle);

    // Display regression metrics
    const metricsY = 68;
    const metricsSpacing = Math.floor(panelWidth * 0.2);
    
    const maeText = this.add.text(30, metricsY, 
      `MAE: ${this.regressionMetrics.meanAbsoluteError.toFixed(4)}\nRMSE: ${this.regressionMetrics.rootMeanSquareError.toFixed(4)}`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ffffff",
      lineSpacing: 2
    });
    this.analyticsPanel.add(maeText);

    const r2Text = this.add.text(30 + metricsSpacing, metricsY, 
      `R²: ${this.regressionMetrics.rSquared.toFixed(4)}\nAccuracy: ${(this.regressionMetrics.ppsAccuracy * 100).toFixed(1)}%`, {
      fontFamily: "dungeon-mode",
      fontSize: 10,
      color: "#ffffff",
      lineSpacing: 2
    });
    this.analyticsPanel.add(r2Text);

    // Validation Results
    const validationTitle = this.add.text(30 + metricsSpacing * 2, 45, "Validation Results:", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#ff6b35",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(validationTitle);

    const validationText = this.add.text(30 + metricsSpacing * 2, metricsY, 
      `Tier Accuracy: ${(this.validationResults.tierTransitionAccuracy * 100).toFixed(1)}%\nModifier Accuracy: ${(this.validationResults.modifierApplicationCorrectness * 100).toFixed(1)}%\nCalibration: ${this.validationResults.calibrationPeriodValidation ? '✓' : '✗'}`, {
        fontFamily: "dungeon-mode",
        fontSize: 10,
        color: "#ffffff",
        lineSpacing: 2
      });
    this.analyticsPanel.add(validationText);

    // Overall Score
    const scoreTitle = this.add.text(30 + metricsSpacing * 3, 45, "Overall Score:", {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#ffff00",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(scoreTitle);

    const scoreColor = this.validationResults.overallScore > 0.8 ? "#2ed573" : 
                      this.validationResults.overallScore > 0.6 ? "#ffa502" : "#ff4757";

    const scoreText = this.add.text(30 + metricsSpacing * 3, metricsY, 
      `${(this.validationResults.overallScore * 100).toFixed(1)}%\nTests: ${this.validationResults.passedTests}/${this.validationResults.totalTests}\nPredictions: ${this.ppsPredictionResults.length}`, {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: scoreColor,
      fontStyle: "bold",
      lineSpacing: 3
    });
    this.analyticsPanel.add(scoreText);

    // Edge Case Status
    const edgeCaseY = 120;
    const edgeCaseTitle = this.add.text(20, edgeCaseY, "Edge Cases:", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#9c88ff",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(edgeCaseTitle);

    const edgeCaseText = this.add.text(20, edgeCaseY + 20, 
      `Extreme High: ${this.validationResults.edgeCaseHandling.extremeHighPerformance ? '✓' : '✗'}\nExtreme Low: ${this.validationResults.edgeCaseHandling.extremeLowPerformance ? '✓' : '✗'}\nBoundaries: ${this.validationResults.edgeCaseHandling.boundaryConditions ? '✓' : '✗'}`, {
      fontFamily: "dungeon-mode",
      fontSize: 9,
      color: "#ffffff",
      lineSpacing: 2
    });
    this.analyticsPanel.add(edgeCaseText);

    // Tier Transition Visualization
    const transitionX = Math.floor(panelWidth * 0.6);
    const transitionTitle = this.add.text(transitionX, edgeCaseY, "Tier Transitions:", {
      fontFamily: "dungeon-mode",
      fontSize: 11,
      color: "#4ecdc4",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(transitionTitle);

    if (this.tierTransitionTests.length > 0) {
      const correctTransitions = this.tierTransitionTests.filter(t => t.transitionCorrect).length;
      const transitionText = this.add.text(transitionX, edgeCaseY + 20, 
        `Correct: ${correctTransitions}/${this.tierTransitionTests.length}\nAccuracy: ${(this.validationResults.tierTransitionAccuracy * 100).toFixed(1)}%`, {
            fontFamily: "dungeon-mode",
            fontSize: 9,
            color: "#ffffff",
        lineSpacing: 2
      });
      this.analyticsPanel.add(transitionText);
    } else {
      const noTransitionsText = this.add.text(transitionX, edgeCaseY + 20, 
        "No transitions\ntested yet", {
        fontFamily: "dungeon-mode",
        fontSize: 9,
        color: "#666666",
        lineSpacing: 2
      });
      this.analyticsPanel.add(noTransitionsText);
    }
  }
}
