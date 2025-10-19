/**
 * DDA Simulator - Standalone Entry Point
 * Demonstrates the actual RuleBasedDDA algorithm for thesis presentations
 * This version uses pure TypeScript + DOM manipulation (no Phaser)
 */

import { DDASimulator, SimulationResult } from './utils/DDASimulator';
import { HandType } from './core/types/CombatTypes';

// Global simulator instance
let simulator: DDASimulator;
let previousPPS = 2.5;
let ppsHistory: number[] = [2.5];
let chartCanvas: HTMLCanvasElement | null = null;
let chartContext: CanvasRenderingContext2D | null = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 DOM loaded, initializing simulator...');
  initializeSimulator();
});

function initializeSimulator() {
  console.log('📦 Initializing DDA Simulator...');
  
  // Hide loading, show app
  const loading = document.getElementById('loading');
  const app = document.getElementById('app');
  
  if (!loading || !app) {
    console.error('❌ Required DOM elements not found');
    console.error('Loading element:', loading);
    console.error('App element:', app);
    return;
  }

  try {
    // Initialize DDA simulator with actual RuleBasedDDA
    simulator = new DDASimulator();
    console.log('✅ DDASimulator instance created');
    
    loading.style.display = 'none';
    app.style.display = 'block';
    console.log('✅ UI elements toggled');

    // Setup input listeners
    setupInputListeners();
    console.log('✅ Input listeners attached');

    // Initialize chart
    initializeChart();
    console.log('✅ Chart initialized');

    console.log('🎉 DDA Simulator fully initialized with actual RuleBasedDDA implementation');
  } catch (error) {
    console.error('❌ Error initializing simulator:', error);
    if (loading) {
      loading.innerHTML = `
        <h2 style="color: #dc3545;">Error Loading Simulator</h2>
        <p>${error}</p>
        <p>Check browser console for details</p>
      `;
    }
  }
}

function initializeChart() {
  chartCanvas = document.getElementById('ppsChart') as HTMLCanvasElement;
  if (!chartCanvas) {
    console.warn('⚠️ Chart canvas not found');
    return;
  }

  chartContext = chartCanvas.getContext('2d');
  if (!chartContext) {
    console.warn('⚠️ Could not get 2D context');
    return;
  }

  // Draw initial chart
  drawChart();
}

function drawChart() {
  if (!chartContext || !chartCanvas) return;

  const ctx = chartContext;
  const width = chartCanvas.width;
  const height = chartCanvas.height;
  const padding = 40;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, width, height);

  // Draw axes
  ctx.strokeStyle = '#495057';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  // Draw Y-axis labels (PPS 0-5)
  ctx.fillStyle = '#495057';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * (height - 2 * padding);
    ctx.fillText(i.toString(), padding - 10, y + 4);
    
    // Grid line
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  // Draw PPS line if we have data
  if (ppsHistory.length > 1) {
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    ppsHistory.forEach((pps, index) => {
      const x = padding + (index / (ppsHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - (pps / 5) * (height - 2 * padding);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ppsHistory.forEach((pps, index) => {
      const x = padding + (index / (ppsHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - (pps / 5) * (height - 2 * padding);
      
      ctx.fillStyle = '#667eea';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw title
  ctx.fillStyle = '#495057';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('PPS Evolution Over Combats', width / 2, 20);
}

function setupInputListeners() {
  const healthSlider = document.getElementById('healthRetention') as HTMLInputElement;
  const turnSlider = document.getElementById('turnCount') as HTMLInputElement;
  const damageSlider = document.getElementById('damageDealt') as HTMLInputElement;
  const discardsSlider = document.getElementById('discardsUsed') as HTMLInputElement;

  if (healthSlider) {
    healthSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const display = document.getElementById('healthValue');
      if (display) display.textContent = target.value + '%';
    });
  }

  if (turnSlider) {
    turnSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const display = document.getElementById('turnValue');
      if (display) display.textContent = target.value + ' turns';
    });
  }

  if (damageSlider) {
    damageSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const display = document.getElementById('damageValue');
      if (display) display.textContent = target.value;
    });
  }

  if (discardsSlider) {
    discardsSlider.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      const display = document.getElementById('discardsValue');
      if (display) display.textContent = target.value + ' / 3';
    });
  }
}

// Expose functions to window for onclick handlers
declare global {
  interface Window {
    simulateCombat: () => void;
    resetSimulation: () => void;
    autoSimulate: () => void;
  }
}

window.simulateCombat = function() {
  const healthSlider = document.getElementById('healthRetention') as HTMLInputElement;
  const turnSlider = document.getElementById('turnCount') as HTMLInputElement;
  const handSelect = document.getElementById('handQuality') as HTMLSelectElement;
  const damageSlider = document.getElementById('damageDealt') as HTMLInputElement;
  const discardsSlider = document.getElementById('discardsUsed') as HTMLInputElement;

  if (!healthSlider || !turnSlider || !handSelect || !damageSlider || !discardsSlider) {
    console.error('Input elements not found');
    return;
  }

  const health = parseInt(healthSlider.value);
  const turns = parseInt(turnSlider.value);
  const hand = handSelect.value as HandType;
  const damage = parseInt(damageSlider.value);
  const discards = parseInt(discardsSlider.value);

  console.log('🎮 Simulating combat with actual RuleBasedDDA.processCombatResults()');
  console.log('Inputs:', { health, turns, hand, damage, discards });

  // Call actual DDA algorithm via wrapper
  const result: SimulationResult = simulator.simulateCombat(
    health,
    turns,
    hand,
    damage,
    discards
  );

  console.log('✅ DDA calculation complete:', result);

  // Update UI
  updateDisplay(result);
  previousPPS = result.previousPPS;
  
  // Add to history and update chart
  ppsHistory.push(result.newPPS);
  drawChart();
};

window.resetSimulation = function() {
  if (!confirm('Reset all simulation data?')) return;

  simulator.reset();
  previousPPS = 2.5;
  ppsHistory = [2.5];

  // Reset UI
  const ppsValue = document.getElementById('ppsValue');
  const tierBadge = document.getElementById('tierBadge');
  const calibrationStatus = document.getElementById('calibrationStatus');
  const combatCount = document.getElementById('combatCount');
  const enemyDifficulty = document.getElementById('enemyDifficulty');
  const ppsTrend = document.getElementById('ppsTrend');
  const lastAdjustment = document.getElementById('lastAdjustment');
  const calculationSteps = document.getElementById('calculationSteps');

  if (ppsValue) ppsValue.textContent = '2.50';
  if (tierBadge) {
    tierBadge.textContent = 'LEARNING';
    tierBadge.className = 'tier-badge tier-learning';
  }
  if (calibrationStatus) calibrationStatus.textContent = '⏳ Calibration Phase: 0/3 combats';
  if (combatCount) combatCount.textContent = '0';
  if (enemyDifficulty) enemyDifficulty.textContent = '100%';
  if (ppsTrend) ppsTrend.textContent = '—';
  if (lastAdjustment) lastAdjustment.textContent = '—';
  if (calculationSteps) {
    calculationSteps.innerHTML = '<p style="text-align: center; color: #6c757d;">Click "Simulate Combat" to see calculations...</p>';
  }
  
  // Reset chart
  drawChart();

  console.log('🔄 Simulation reset');
};

window.autoSimulate = function() {
  let count = 0;
  const interval = setInterval(() => {
    if (count >= 10) {
      clearInterval(interval);
      console.log('✅ Auto-simulation complete');
      return;
    }

    // Randomize inputs
    const healthSlider = document.getElementById('healthRetention') as HTMLInputElement;
    const turnSlider = document.getElementById('turnCount') as HTMLInputElement;
    const handSelect = document.getElementById('handQuality') as HTMLSelectElement;
    const damageSlider = document.getElementById('damageDealt') as HTMLInputElement;
    const discardsSlider = document.getElementById('discardsUsed') as HTMLInputElement;

    if (healthSlider) {
      healthSlider.value = Math.floor(Math.random() * 100).toString();
      healthSlider.dispatchEvent(new Event('input'));
    }
    if (turnSlider) {
      turnSlider.value = (Math.floor(Math.random() * 15) + 3).toString();
      turnSlider.dispatchEvent(new Event('input'));
    }
    if (damageSlider) {
      damageSlider.value = (Math.floor(Math.random() * 150) + 50).toString();
      damageSlider.dispatchEvent(new Event('input'));
    }
    if (discardsSlider) {
      discardsSlider.value = Math.floor(Math.random() * 4).toString();
      discardsSlider.dispatchEvent(new Event('input'));
    }
    if (handSelect) {
      const hands: HandType[] = ['high_card', 'pair', 'two_pair', 'three_of_a_kind', 'straight', 'flush', 'full_house', 'four_of_a_kind'];
      handSelect.value = hands[Math.floor(Math.random() * hands.length)];
    }

    window.simulateCombat();
    count++;
  }, 800);
};

function updateDisplay(result: SimulationResult) {
  const state = simulator.getCurrentState();

  // Update PPS display
  const ppsValue = document.getElementById('ppsValue');
  if (ppsValue) ppsValue.textContent = state.currentPPS.toFixed(2);

  // Update tier
  const tierBadge = document.getElementById('tierBadge');
  if (tierBadge) {
    tierBadge.textContent = state.tier.toUpperCase();
    tierBadge.className = `tier-badge tier-${state.tier}`;
  }

  // Update calibration
  const calibrationStatus = document.getElementById('calibrationStatus');
  if (calibrationStatus) {
    if (state.isCalibrating) {
      calibrationStatus.textContent = `⏳ Calibration Phase: ${state.totalCombatsCompleted}/3 combats`;
    } else {
      calibrationStatus.textContent = '✅ DDA Active';
    }
  }

  // Update stats
  const combatCount = document.getElementById('combatCount');
  if (combatCount) combatCount.textContent = state.totalCombatsCompleted.toString();

  const diffMod = getDifficultyModifier(state.tier);
  const enemyDifficulty = document.getElementById('enemyDifficulty');
  if (enemyDifficulty) enemyDifficulty.textContent = diffMod + '%';

  const trend = state.currentPPS > previousPPS ? '📈' : state.currentPPS < previousPPS ? '📉' : '➡️';
  const ppsTrend = document.getElementById('ppsTrend');
  if (ppsTrend) ppsTrend.textContent = trend;

  const lastAdj = state.currentPPS - previousPPS;
  const lastAdjustment = document.getElementById('lastAdjustment');
  if (lastAdjustment) {
    lastAdjustment.textContent = (lastAdj >= 0 ? '+' : '') + lastAdj.toFixed(2);
    lastAdjustment.style.color = lastAdj >= 0 ? '#28a745' : '#dc3545';
  }

  // Update calculation steps
  displayCalculationSteps(result.calculationSteps);
}

function displayCalculationSteps(steps: any[]) {
  const container = document.getElementById('calculationSteps');
  if (!container) return;

  container.innerHTML = '';

  steps.forEach((step) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'step';

    if (step.isCalibrating) {
      stepDiv.style.background = '#fff3cd';
      stepDiv.style.border = '2px solid #ffc107';
    } else if (step.isTotal) {
      stepDiv.style.background = '#667eea';
      stepDiv.style.color = 'white';
    }

    const valueClass = step.isPositive ? 'step-positive' : 'step-negative';
    
    stepDiv.innerHTML = `
      <div class="step-title">${step.title}</div>
      <div>${step.description}</div>
      ${step.value ? `<div class="step-value ${valueClass}">${step.value}</div>` : ''}
    `;

    container.appendChild(stepDiv);
  });
}

function getDifficultyModifier(tier: string): number {
  const mods: Record<string, number> = {
    struggling: 80,
    learning: 100,
    thriving: 115,
    mastering: 130
  };
  return mods[tier] || 100;
}

