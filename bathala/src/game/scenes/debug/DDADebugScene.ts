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

export class DDADebugScene extends Scene {
  private dda: RuleBasedDDA;
  private analytics: DDAAnalyticsManager;
  private simulationData: Array<{ pps: number; tier: DifficultyTier; timestamp: number }> = [];
  
  // UI Elements
  private ppsGraph!: Phaser.GameObjects.Graphics;
  private infoPanel!: Phaser.GameObjects.Container;
  private simulationPanel!: Phaser.GameObjects.Container;
  private configPanel!: Phaser.GameObjects.Container;
  
  // Current configuration
  private currentConfig: DDAModifiers = DEFAULT_DDA_CONFIG;
  private isSimulating = false;

  constructor() {
    super({ key: "DDADebugScene" });
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0a0a0a);
    
    // Initialize DDA systems
    this.dda = RuleBasedDDA.getInstance(this.currentConfig);
    this.analytics = DDAAnalyticsManager.getInstance();
    
    // Create clean, readable UI
    this.createTitle();
    this.createMainGraph();
    this.createStatusPanel();
    this.createTestingPanel();
    this.createConfigPanel();
    this.createBackButton();
    
    // Initialize with current data
    this.updateDisplay();
  }

  /**
   * Create clean title section
   */
  private createTitle(): void {
    const centerX = this.cameras.main.width / 2;
    
    this.add.text(centerX, 30, "DDA Analytics Dashboard", {
      fontFamily: "Centrion",
      fontSize: 36,
      color: "#ffffff",
    }).setOrigin(0.5);
    
    this.add.text(centerX, 65, "Dynamic Difficulty Adjustment Testing", {
      fontFamily: "Chivo",
      fontSize: 18,
      color: "#aaaaaa",
    }).setOrigin(0.5);
  }

  /**
   * Create main performance graph
   */
  private createMainGraph(): void {
    const graphX = 50;
    const graphY = 120;
    const graphWidth = 800;
    const graphHeight = 300;
    
    // Graph container
    const container = this.add.container(graphX, graphY);
    
    // Background
    const bg = this.add.rectangle(0, 0, graphWidth, graphHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    container.add(bg);
    
    // Title
    const title = this.add.text(graphWidth / 2, -40, "Player Performance Score", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    container.add(title);
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = graphHeight - (i / 5) * graphHeight;
      
      // Label
      const label = this.add.text(-20, y, i.toString(), {
        fontSize: 16,
        color: "#cccccc",
        fontFamily: "Chivo",
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
  }

  /**
   * Create difficulty tier backgrounds
   */
  private createTierBackgrounds(container: Phaser.GameObjects.Container, width: number, height: number): void {
    const tiers = [
      { name: "Struggling", range: [0, 1], color: 0xff4757 },
      { name: "Learning", range: [1.1, 2.5], color: 0xffa502 },
      { name: "Thriving", range: [2.6, 4], color: 0x2ed573 },
      { name: "Mastering", range: [4.1, 5], color: 0x5352ed },
    ];
    
    tiers.forEach(tier => {
      const yStart = height - (tier.range[0] / 5) * height;
      const yEnd = height - (tier.range[1] / 5) * height;
      const tierHeight = yStart - yEnd;
      
      // Background
      const bg = this.add.rectangle(0, yEnd, width, tierHeight, tier.color, 0.1);
      bg.setOrigin(0);
      container.add(bg);
      
      // Label
      const label = this.add.text(width + 20, yEnd + tierHeight / 2, tier.name, {
        fontSize: 16,
        color: `#${tier.color.toString(16)}`,
        fontFamily: "Chivo",
        fontStyle: "bold"
      }).setOrigin(0, 0.5);
      container.add(label);
    });
  }

  /**
   * Create status information panel
   */
  private createStatusPanel(): void {
    const panelX = 1000;  // Moved further right to avoid tier labels
    const panelY = 120;
    const panelWidth = 350;
    const panelHeight = 300;
    
    this.infoPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.infoPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 20, "Current Status", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.infoPanel.add(title);
  }

  /**
   * Create testing controls panel
   */
  private createTestingPanel(): void {
    const panelX = 50;
    const panelY = 480;
    const panelWidth = 800;
    const panelHeight = 180;
    
    this.simulationPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.simulationPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 20, "Combat Testing", {
      fontFamily: "Centrion",
      fontSize: 24,
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
    const buttons = [
      { text: "Perfect\nWin", color: 0x2ed573, x: 80, action: () => this.testPerfectCombat() },
      { text: "Average\nFight", color: 0xffa502, x: 200, action: () => this.testAverageCombat() },
      { text: "Difficult\nWin", color: 0xff6b35, x: 320, action: () => this.testDifficultCombat() },
      { text: "Major\nLoss", color: 0xff4757, x: 440, action: () => this.testMajorLoss() },
      { text: "Auto\nTest", color: 0x5352ed, x: 560, action: () => this.toggleAutoTest() },
      { text: "Reset\nData", color: 0x747d8c, x: 680, action: () => this.resetData() },
    ];
    
    buttons.forEach(btn => {
      const button = this.createButton(btn.x, 70, btn.text, btn.color, btn.action);
      this.simulationPanel.add(button);
    });
  }

  /**
   * Create configuration panel
   */
  private createConfigPanel(): void {
    const panelX = 1000;  // Aligned with status panel
    const panelY = 480;
    const panelWidth = 350;
    const panelHeight = 180;
    
    this.configPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.configPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 20, "Configuration", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.configPanel.add(title);
    
    // Config buttons
    const configs = [
      { text: "Default", color: 0x2ed573, x: 60, config: DEFAULT_DDA_CONFIG },
      { text: "Aggressive", color: 0xff4757, x: 170, config: AGGRESSIVE_DDA_CONFIG },
      { text: "Conservative", color: 0x5352ed, x: 280, config: CONSERVATIVE_DDA_CONFIG },
    ];
    
    configs.forEach(cfg => {
      const button = this.createButton(cfg.x, 70, cfg.text, cfg.color, () => this.setConfig(cfg.config));
      this.configPanel.add(button);
    });
    
    // Export button
    const exportButton = this.createButton(170, 120, "Export\nData", 0xffa502, () => this.exportData());
    this.configPanel.add(exportButton);
  }

  /**
   * Create a clean, readable button
   */
  private createButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    // Button background
    const bg = this.add.rectangle(0, 0, 80, 50, color, 0.8);
    bg.setStrokeStyle(2, color);
    button.add(bg);
    
    // Button text
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: "Chivo",
      fontSize: 14,
      color: "#ffffff",
      align: "center",
      fontStyle: "bold"
    }).setOrigin(0.5);
    button.add(buttonText);
    
    // Make interactive
    bg.setInteractive();
    bg.on("pointerdown", callback);
    bg.on("pointerover", () => bg.setAlpha(1));
    bg.on("pointerout", () => bg.setAlpha(0.8));
    
    return button;
  }

  /**
   * Create back button
   */
  private createBackButton(): void {
    const backBtn = this.add.text(50, this.cameras.main.height - 50, "← Back to Game", {
      fontFamily: "Centrion",
      fontSize: 20,
      color: "#ffffff",
      backgroundColor: "#ff4757",
      padding: { x: 20, y: 10 },
    });
    
    backBtn.setInteractive();
    backBtn.on("pointerdown", () => this.scene.start("Overworld"));
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
    // Update DDA with combat results
    const result = this.dda.processCombatResults(metrics);
    
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
    this.dda.resetSession();
    this.updateDisplay();
  }

  private setConfig(config: DDAModifiers): void {
    this.currentConfig = config;
    this.dda = RuleBasedDDA.getInstance(config);
    this.updateDisplay();
  }

  private exportData(): void {
    const data = {
      simulationData: this.simulationData,
      analytics: this.analytics.getSessionSummary(),
      timestamp: new Date().toISOString()
    };
    
    console.log("DDA Analytics Data:", data);
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dda-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Update all display elements
   */
  private updateDisplay(): void {
    this.updateGraph();
    this.updateStatusPanel();
  }

  private updateGraph(): void {
    this.ppsGraph.clear();
    
    if (this.simulationData.length < 2) return;
    
    this.ppsGraph.lineStyle(3, 0x00ff00);
    
    const graphWidth = 800;
    const graphHeight = 300;
    
    for (let i = 1; i < this.simulationData.length; i++) {
      const prev = this.simulationData[i - 1];
      const curr = this.simulationData[i];
      
      const x1 = ((i - 1) / (this.simulationData.length - 1)) * graphWidth;
      const y1 = graphHeight - (prev.pps / 5) * graphHeight;
      const x2 = (i / (this.simulationData.length - 1)) * graphWidth;
      const y2 = graphHeight - (curr.pps / 5) * graphHeight;
      
      this.ppsGraph.lineBetween(x1, y1, x2, y2);
    }
  }

  private updateStatusPanel(): void {
    // Clear existing status text
    this.infoPanel.removeAll(true);
    
    // Recreate background and title
    const bg = this.add.rectangle(0, 0, 350, 300, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.infoPanel.add(bg);
    
    const title = this.add.text(175, 20, "Current Status", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.infoPanel.add(title);
    
    // Current stats using correct API
    const playerPPS = this.dda.getPlayerPPS();
    const currentPPS = playerPPS.currentPPS;
    const currentTier = playerPPS.tier;
    const combatCount = this.simulationData.length;
    
    const stats = [
      `PPS: ${currentPPS.toFixed(2)}`,
      `Tier: ${currentTier}`,
      `Combats: ${combatCount}`,
    ];
    
    stats.forEach((stat, index) => {
      const text = this.add.text(20, 60 + index * 30, stat, {
        fontFamily: "Chivo",
        fontSize: 18,
        color: "#ffffff",
      });
      this.infoPanel.add(text);
    });
    
    // Show current difficulty modifiers using correct API
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    const modText = this.add.text(20, 160, "Difficulty Modifiers:", {
      fontFamily: "Chivo",
      fontSize: 16,
      color: "#cccccc",
    });
    this.infoPanel.add(modText);
    
    const modDetails = [
      `Enemy HP: ${Math.round(adjustment.enemyHealthMultiplier * 100)}%`,
      `Enemy DMG: ${Math.round(adjustment.enemyDamageMultiplier * 100)}%`,
      `Shop Prices: ${Math.round(adjustment.shopPriceMultiplier * 100)}%`,
    ];
    
    modDetails.forEach((detail, index) => {
      const text = this.add.text(20, 185 + index * 20, detail, {
        fontFamily: "Chivo",
        fontSize: 14,
        color: "#aaaaaa",
      });
      this.infoPanel.add(text);
    });
  }
}
