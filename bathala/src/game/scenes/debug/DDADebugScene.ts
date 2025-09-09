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
  
  // Current configuration
  private currentConfig: DDAModifiers = DEFAULT_DDA_CONFIG;
  private isSimulating = false;

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
    
    // Initialize DDA systems
    this.dda = RuleBasedDDA.getInstance(this.currentConfig);
    this.analytics = DDAAnalyticsManager.getInstance();
    
    // Create clean, readable UI
    this.createTitle();
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
      fontFamily: "dungeon-mode-inverted",
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
        fontFamily: "dungeon-mode",
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
      fontFamily: "dungeon-mode-inverted",
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
      fontFamily: "dungeon-mode-inverted",
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
      fontFamily: "dungeon-mode-inverted",
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
    const exportButton = this.createButton(170, 120, "Export\nCSV", 0xffa502, () => this.exportCSVData());
    this.configPanel.add(exportButton);
  }

  /**
   * Create analytics panel for F1 Score and Confusion Matrix
   */
  private createAnalyticsPanel(): void {
    const panelX = 50;
    const panelY = 680;
    const panelWidth = 1300;
    const panelHeight = 200;
    
    this.analyticsPanel = this.add.container(panelX, panelY);
    
    // Background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.analyticsPanel.add(bg);
    
    // Title
    const title = this.add.text(panelWidth / 2, 20, "Advanced Analytics - F1 Score & Confusion Matrix", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.analyticsPanel.add(title);
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
      fontFamily: "dungeon-mode",
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
      fontFamily: "dungeon-mode",
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
    
    this.dda.resetSession();
    this.updateDisplay();
  }

  private setConfig(config: DDAModifiers): void {
    this.currentConfig = config;
    this.dda = RuleBasedDDA.getInstance(config);
    this.updateDisplay();
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
    
    // Panel title
    const title = this.add.text(10, 10, "Current Status", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 20,
      color: "#4ecdc4"
    });
    this.infoPanel.add(title);
    
    // Current stats using correct API
    const playerPPS = this.dda.getPlayerPPS();
    const currentPPS = playerPPS.currentPPS;
    const currentTier = playerPPS.tier;
    
    // Get session metrics from analytics manager
    const sessionMetrics = this.analytics.getAnalytics().sessionMetrics;
    const combatCount = sessionMetrics.totalCombats;
    
    // Get win rate information
    const winRateInfo = this.analytics.checkWinRateTargetBand();
    const winRateText = combatCount > 0 ? 
      `Win Rate: ${winRateInfo.winRate}% (${winRateInfo.withinTarget ? "Within" : "Outside"} target)` :
      "Win Rate: N/A";
    
    const stats = [
      `PPS: ${currentPPS.toFixed(2)}`,
      `Tier: ${currentTier}`,
      `Combats: ${combatCount}`,
      winRateText,
    ];
    
    stats.forEach((stat, index) => {
      const text = this.add.text(20, 60 + index * 30, stat, {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#ffffff",
      });
      this.infoPanel.add(text);
    });
    
    // Show current difficulty modifiers using correct API
    const adjustment = this.dda.getCurrentDifficultyAdjustment();
    const modText = this.add.text(20, 190, "Difficulty Modifiers:", {
      fontFamily: "dungeon-mode",
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
      const text = this.add.text(20, 215 + index * 20, detail, {
        fontFamily: "dungeon-mode",
        fontSize: 14,
        color: "#aaaaaa",
      });
      this.infoPanel.add(text);
    });
  }

  /**
   * Update analytics panel with F1 Score and Confusion Matrix data
   */
  private updateAnalyticsPanel(): void {
    // Clear existing analytics display
    this.analyticsPanel.removeAll(true);
    
    // Recreate background and title
    const panelWidth = 1300;
    const panelHeight = 200;
    
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111);
    bg.setStrokeStyle(2, 0x555555);
    bg.setOrigin(0);
    this.analyticsPanel.add(bg);
    
    const title = this.add.text(panelWidth / 2, 20, "Advanced Analytics - F1 Score & Confusion Matrix", {
      fontFamily: "Centrion",
      fontSize: 24,
      color: "#ffffff",
    }).setOrigin(0.5);
    this.analyticsPanel.add(title);

    // F1 Score Display
    const f1Title = this.add.text(50, 60, "F1 Score Metrics:", {
      fontFamily: "Chivo",
      fontSize: 18,
      color: "#00ff00",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(f1Title);

    let yOffset = 85;
    const tiers: DifficultyTier[] = ['struggling', 'learning', 'thriving', 'mastering'];
    
    tiers.forEach((tier, index) => {
      const f1Score = this.f1Metrics.f1Score[tier];
      const precision = this.f1Metrics.precision[tier];
      const recall = this.f1Metrics.recall[tier];
      
      const tierText = this.add.text(50 + (index * 150), yOffset, 
        `${tier.charAt(0).toUpperCase() + tier.slice(1)}\nF1: ${f1Score.toFixed(3)}\nP: ${precision.toFixed(3)}\nR: ${recall.toFixed(3)}`, {
        fontFamily: "Chivo",
        fontSize: 12,
        color: "#ffffff",
        align: "center"
      });
      this.analyticsPanel.add(tierText);
    });

    // Overall metrics
    const overallText = this.add.text(700, 70, 
      `Overall Accuracy: ${(this.f1Metrics.accuracy * 100).toFixed(1)}%\nOverall F1 Score: ${this.f1Metrics.overallF1Score.toFixed(3)}\nTotal Predictions: ${this.predictionResults.length}`, {
      fontFamily: "Chivo",
      fontSize: 14,
      color: "#ffff00",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(overallText);

    // Confusion Matrix Visualization
    const matrixTitle = this.add.text(950, 60, "Confusion Matrix:", {
      fontFamily: "Chivo",
      fontSize: 16,
      color: "#ff6b35",
      fontStyle: "bold"
    });
    this.analyticsPanel.add(matrixTitle);

    // Create a mini confusion matrix display
    const cellSize = 30;
    const startX = 950;
    const startY = 85;
    
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
            fontFamily: "Chivo",
            fontSize: 10,
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0.5);
          this.analyticsPanel.add(countText);
        }
      });
    });
  }
}
