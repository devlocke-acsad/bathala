/**
 * DDASimulatorScene - Phaser scene for interactive DDA demonstration
 * This scene demonstrates the actual DDA algorithm for thesis presentations
 */

import Phaser from 'phaser';
import { DDASimulator, SimulationResult } from '../../utils/DDASimulator';
import { HandType } from '../../core/types/CombatTypes';

export class DDASimulatorScene extends Phaser.Scene {
  private simulator!: DDASimulator;
  
  // UI Elements
  private ppsText!: Phaser.GameObjects.Text;
  private tierText!: Phaser.GameObjects.Text;
  private combatCountText!: Phaser.GameObjects.Text;
  private difficultyText!: Phaser.GameObjects.Text;
  private calibrationText!: Phaser.GameObjects.Text;
  private stepsContainer!: Phaser.GameObjects.Container;
  private historyContainer!: Phaser.GameObjects.Container;
  private chartGraphics!: Phaser.GameObjects.Graphics;
  
  // Input controls
  private healthSlider!: HTMLInputElement;
  private turnSlider!: HTMLInputElement;
  private handSelect!: HTMLSelectElement;
  private damageSlider!: HTMLInputElement;
  private discardsSlider!: HTMLInputElement;
  
  // Chart data
  private ppsHistory: number[] = [2.5];

  constructor() {
    super({ key: 'DDASimulatorScene' });
  }

  create() {
    // Initialize simulator with actual DDA
    this.simulator = new DDASimulator();

    // Setup UI
    this.createHeader();
    this.createInputControls();
    this.createStateDisplay();
    this.createCalculationSteps();
    this.createChart();
    this.createHistoryPanel();
    this.createButtons();

    // Initial state update
    this.updateDisplay();
  }

  private createHeader() {
    const title = this.add.text(
      this.cameras.main.width / 2,
      30,
      'Bathala DDA Algorithm Simulator',
      {
        fontSize: '42px',
        color: '#333',
        fontStyle: 'bold',
        align: 'center'
      }
    ).setOrigin(0.5);

    const subtitle = this.add.text(
      this.cameras.main.width / 2,
      75,
      'Live Demonstration Using Actual RuleBasedDDA Implementation',
      {
        fontSize: '20px',
        color: '#666',
        align: 'center'
      }
    ).setOrigin(0.5);
  }

  private createInputControls() {
    const startY = 120;
    const panelX = 50;

    // Create panel background
    const panel = this.add.rectangle(panelX, startY, 450, 500, 0xf8f9fa)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(panelX + 20, startY + 20, '📊 Combat Metrics Input', {
      fontSize: '24px',
      color: '#495057',
      fontStyle: 'bold'
    });

    // Create HTML input controls (more interactive than Phaser UI)
    this.createHTMLControls();
  }

  private createHTMLControls() {
    // Create container div for inputs
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '70px';
    container.style.top = '220px';
    container.style.width = '400px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.innerHTML = `
      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; color: #495057; font-weight: 600;">
          Health Retention: <span id="healthValue">70%</span>
        </label>
        <input type="range" id="healthSlider" min="0" max="100" value="70" 
               style="width: 100%; height: 8px; cursor: pointer;">
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; color: #495057; font-weight: 600;">
          Turn Count: <span id="turnValue">8</span>
        </label>
        <input type="range" id="turnSlider" min="1" max="20" value="8" 
               style="width: 100%; height: 8px; cursor: pointer;">
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; color: #495057; font-weight: 600;">
          Best Hand Achieved
        </label>
        <select id="handSelect" style="width: 100%; padding: 10px; font-size: 16px;">
          <option value="high_card">High Card</option>
          <option value="pair">Pair</option>
          <option value="two_pair">Two Pair</option>
          <option value="three_of_a_kind" selected>Three of a Kind</option>
          <option value="straight">Straight</option>
          <option value="flush">Flush</option>
          <option value="full_house">Full House</option>
          <option value="four_of_a_kind">Four of a Kind</option>
          <option value="straight_flush">Straight Flush</option>
          <option value="five_of_a_kind">Five of a Kind</option>
        </select>
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; color: #495057; font-weight: 600;">
          Damage Dealt: <span id="damageValue">80</span>
        </label>
        <input type="range" id="damageSlider" min="10" max="200" value="80" step="5"
               style="width: 100%; height: 8px; cursor: pointer;">
      </div>

      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; color: #495057; font-weight: 600;">
          Discards Used: <span id="discardsValue">1 / 3</span>
        </label>
        <input type="range" id="discardsSlider" min="0" max="3" value="1"
               style="width: 100%; height: 8px; cursor: pointer;">
      </div>
    `;

    document.body.appendChild(container);

    // Store references
    this.healthSlider = document.getElementById('healthSlider') as HTMLInputElement;
    this.turnSlider = document.getElementById('turnSlider') as HTMLInputElement;
    this.handSelect = document.getElementById('handSelect') as HTMLSelectElement;
    this.damageSlider = document.getElementById('damageSlider') as HTMLInputElement;
    this.discardsSlider = document.getElementById('discardsSlider') as HTMLInputElement;

    // Add event listeners
    this.healthSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('healthValue')!.textContent = value + '%';
    });

    this.turnSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('turnValue')!.textContent = value;
    });

    this.damageSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('damageValue')!.textContent = value;
    });

    this.discardsSlider.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('discardsValue')!.textContent = value + ' / 3';
    });
  }

  private createStateDisplay() {
    const startX = 550;
    const startY = 120;

    // Panel background
    const panel = this.add.rectangle(startX, startY, 450, 350, 0xf8f9fa)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(startX + 20, startY + 20, '🎯 Current DDA State', {
      fontSize: '24px',
      color: '#495057',
      fontStyle: 'bold'
    });

    // PPS Display
    const ppsBox = this.add.rectangle(startX + 225, startY + 100, 400, 120, 0x667eea)
      .setOrigin(0.5);

    this.add.text(startX + 225, startY + 70, 'Player Performance Score', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    this.ppsText = this.add.text(startX + 225, startY + 110, '2.50', {
      fontSize: '56px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.tierText = this.add.text(startX + 225, startY + 150, 'LEARNING', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#ffc107',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.calibrationText = this.add.text(startX + 225, startY + 190, '⏳ Calibration: 0/3', {
      fontSize: '16px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Stats grid
    const statsY = startY + 240;
    this.combatCountText = this.createStatBox(startX + 112, statsY, 'Combats', '0');
    this.difficultyText = this.createStatBox(startX + 337, statsY, 'Difficulty', '100%');
  }

  private createStatBox(x: number, y: number, label: string, value: string): Phaser.GameObjects.Text {
    this.add.rectangle(x, y, 200, 80, 0xffffff)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(x, y - 15, label, {
      fontSize: '14px',
      color: '#6c757d',
      align: 'center'
    }).setOrigin(0.5);

    return this.add.text(x, y + 15, value, {
      fontSize: '28px',
      color: '#667eea',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  private createCalculationSteps() {
    const startX = 50;
    const startY = 640;

    const panel = this.add.rectangle(startX, startY, 950, 400, 0xf8f9fa)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(startX + 20, startY + 20, '🔍 Algorithm Calculation Breakdown', {
      fontSize: '24px',
      color: '#495057',
      fontStyle: 'bold'
    });

    this.stepsContainer = this.add.container(startX + 20, startY + 70);

    const placeholder = this.add.text(435, 100, 'Click "Simulate Combat" to see calculations...', {
      fontSize: '16px',
      color: '#6c757d',
      align: 'center'
    }).setOrigin(0.5);

    this.stepsContainer.add(placeholder);
  }

  private createChart() {
    const startX = 1050;
    const startY = 120;

    const panel = this.add.rectangle(startX, startY, 450, 350, 0xffffff)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(startX + 20, startY + 20, '📈 PPS Over Time', {
      fontSize: '20px',
      color: '#495057',
      fontStyle: 'bold'
    });

    this.chartGraphics = this.add.graphics();
    this.drawChart();
  }

  private createHistoryPanel() {
    const startX = 1050;
    const startY = 490;

    const panel = this.add.rectangle(startX, startY, 450, 550, 0xf8f9fa)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xe9ecef);

    this.add.text(startX + 20, startY + 20, '📜 Combat History', {
      fontSize: '20px',
      color: '#495057',
      fontStyle: 'bold'
    });

    this.historyContainer = this.add.container(startX + 20, startY + 60);
  }

  private createButtons() {
    const buttonY = 1080;
    const centerX = 500;

    // Simulate Button
    const simulateBtn = this.createButton(
      centerX - 220,
      buttonY,
      200,
      50,
      '▶️ Simulate',
      0x667eea,
      () => this.simulateCombat()
    );

    // Reset Button
    const resetBtn = this.createButton(
      centerX,
      buttonY,
      200,
      50,
      '🔄 Reset',
      0x6c757d,
      () => this.resetSimulation()
    );

    // Auto-Simulate Button
    const autoBtn = this.createButton(
      centerX + 220,
      buttonY,
      200,
      50,
      '🤖 Auto (×10)',
      0x28a745,
      () => this.autoSimulate()
    );
  }

  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    color: number,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.rectangle(x, y, width, height, color)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', () => button.setAlpha(0.8))
      .on('pointerout', () => button.setAlpha(1));

    const label = this.add.text(x, y, text, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    return this.add.container(0, 0, [button, label]);
  }

  /**
   * Simulate combat using actual DDA implementation
   */
  private simulateCombat() {
    const health = parseInt(this.healthSlider.value);
    const turns = parseInt(this.turnSlider.value);
    const hand = this.handSelect.value as HandType;
    const damage = parseInt(this.damageSlider.value);
    const discards = parseInt(this.discardsSlider.value);

    // Call actual DDA algorithm
    const result: SimulationResult = this.simulator.simulateCombat(
      health,
      turns,
      hand,
      damage,
      discards
    );

    // Update UI with results
    this.updateDisplay(result);
    this.ppsHistory = this.simulator.getPPSHistory();
    this.drawChart();
  }

  private updateDisplay(result?: SimulationResult) {
    const state = this.simulator.getCurrentState();

    // Update PPS display
    this.ppsText.setText(state.currentPPS.toFixed(2));

    // Update tier
    this.tierText.setText(state.tier.toUpperCase());
    const tierColors: Record<string, string> = {
      struggling: '#dc3545',
      learning: '#ffc107',
      thriving: '#28a745',
      mastering: '#6f42c1'
    };
    this.tierText.setBackgroundColor(tierColors[state.tier]);

    // Update calibration
    if (state.isCalibrating) {
      this.calibrationText.setText(`⏳ Calibration: ${state.totalCombatsCompleted}/3`);
    } else {
      this.calibrationText.setText('✅ DDA Active');
    }

    // Update stats
    this.combatCountText.setText(state.totalCombatsCompleted.toString());
    
    const diffMod = this.getDifficultyModifier(state.tier);
    this.difficultyText.setText(diffMod + '%');

    // Update calculation steps
    if (result) {
      this.displayCalculationSteps(result.calculationSteps);
      this.updateHistory();
    }
  }

  private displayCalculationSteps(steps: any[]) {
    this.stepsContainer.removeAll(true);

    let yOffset = 0;
    steps.forEach((step, index) => {
      const stepBg = this.add.rectangle(0, yOffset, 900, 60, 0xffffff)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0xe9ecef);

      const title = this.add.text(10, yOffset + 10, step.title, {
        fontSize: '14px',
        color: '#495057',
        fontStyle: 'bold'
      });

      const desc = this.add.text(10, yOffset + 32, step.description, {
        fontSize: '12px',
        color: '#6c757d'
      });

      const valueColor = step.isPositive ? '#28a745' : '#dc3545';
      const value = this.add.text(880, yOffset + 25, step.value, {
        fontSize: '18px',
        color: step.isTotal ? '#667eea' : valueColor,
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      this.stepsContainer.add([stepBg, title, desc, value]);

      yOffset += 65;
    });
  }

  private updateHistory() {
    this.historyContainer.removeAll(true);

    const history = this.simulator.getHistory().slice(-8);
    let yOffset = 0;

    history.reverse().forEach((entry: SimulationResult) => {
      const entryBg = this.add.rectangle(0, yOffset, 410, 60, 0xffffff)
        .setOrigin(0, 0)
        .setStrokeStyle(2, entry.adjustment >= 0 ? 0x28a745 : 0xdc3545);

      const combat = this.add.text(10, yOffset + 10, `Combat #${this.simulator.getHistory().indexOf(entry) + 1}`, {
        fontSize: '14px',
        color: '#333',
        fontStyle: 'bold'
      });

      const metrics = this.add.text(10, yOffset + 32, 
        `${entry.metrics.healthPercentage}% HP | ${entry.metrics.turnCount} turns`, {
        fontSize: '12px',
        color: '#6c757d'
      });

      const pps = this.add.text(400, yOffset + 20, `PPS: ${entry.newPPS.toFixed(2)}`, {
        fontSize: '16px',
        color: '#667eea',
        fontStyle: 'bold'
      }).setOrigin(1, 0.5);

      this.historyContainer.add([entryBg, combat, metrics, pps]);
      yOffset += 65;
    });
  }

  private drawChart() {
    this.chartGraphics.clear();

    const chartX = 1070;
    const chartY = 170;
    const chartWidth = 410;
    const chartHeight = 280;

    // Draw axes
    this.chartGraphics.lineStyle(2, 0x495057);
    this.chartGraphics.strokeRect(chartX, chartY, chartWidth, chartHeight);

    // Draw PPS line
    if (this.ppsHistory.length > 1) {
      this.chartGraphics.lineStyle(3, 0x667eea);
      this.chartGraphics.beginPath();

      this.ppsHistory.forEach((pps, index) => {
        const x = chartX + (index / (this.ppsHistory.length - 1)) * chartWidth;
        const y = chartY + chartHeight - (pps / 5) * chartHeight;

        if (index === 0) {
          this.chartGraphics.moveTo(x, y);
        } else {
          this.chartGraphics.lineTo(x, y);
        }
      });

      this.chartGraphics.strokePath();

      // Draw points
      this.ppsHistory.forEach((pps, index) => {
        const x = chartX + (index / (this.ppsHistory.length - 1)) * chartWidth;
        const y = chartY + chartHeight - (pps / 5) * chartHeight;
        this.chartGraphics.fillStyle(0x667eea);
        this.chartGraphics.fillCircle(x, y, 4);
      });
    }
  }

  private getDifficultyModifier(tier: string): number {
    const mods: Record<string, number> = {
      struggling: 80,
      learning: 100,
      thriving: 115,
      mastering: 130
    };
    return mods[tier] || 100;
  }

  private resetSimulation() {
    this.simulator.reset();
    this.ppsHistory = [2.5];
    this.updateDisplay();
    this.drawChart();
    this.stepsContainer.removeAll(true);
    this.historyContainer.removeAll(true);
  }

  private autoSimulate() {
    let count = 0;
    const timer = this.time.addEvent({
      delay: 800,
      callback: () => {
        if (count >= 10) {
          timer.remove();
          return;
        }

        // Randomize inputs
        this.healthSlider.value = Math.floor(Math.random() * 100).toString();
        this.turnSlider.value = (Math.floor(Math.random() * 15) + 3).toString();
        this.damageSlider.value = (Math.floor(Math.random() * 150) + 50).toString();
        this.discardsSlider.value = Math.floor(Math.random() * 4).toString();

        const hands: HandType[] = ['high_card', 'pair', 'two_pair', 'three_of_a_kind', 'straight', 'flush', 'full_house', 'four_of_a_kind'];
        this.handSelect.value = hands[Math.floor(Math.random() * hands.length)];

        this.simulateCombat();
        count++;
      },
      loop: true
    });
  }
}
