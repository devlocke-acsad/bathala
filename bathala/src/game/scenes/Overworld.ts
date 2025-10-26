import { Scene } from "phaser";

import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import { Player } from "../../core/types/CombatTypes";
import { DeckManager } from "../../utils/DeckManager";
import { Overworld_KeyInputManager } from "./Overworld_KeyInputManager";
import { Overworld_MazeGenManager } from "./Overworld_MazeGenManager";
import { Overworld_TooltipManager } from "./Overworld_TooltipManager";
import { MusicManager } from "../../core/managers/MusicManager";

/**
 * Helper function to get the sprite key for a relic based on its ID
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
import { Overworld_FogOfWarManager } from "./Overworld_FogOfWarManager";

/**
 * === DEPTH LAYER CONFIGURATION ===
 * Centralized depth values for easy editing
 * 
 * Layer Order (bottom to top):
 * 0-99: Map and world elements
 * 100-998: UI elements (progress bars, indicators, etc.)
 * 999: Night overlay
 * 1000-1999: Player and interactive UI
 * 2000-2999: Tooltips and overlays
 * 3000+: Transitions and boss effects
 */
const DEPTH = {
  // World Layer (0-99)
  MAP_TILES: 0,
  FOG_OF_WAR: 50,        // Covers map tiles only
  MAP_NPCS: 51,          // NPCs above fog
  
  // UI Layer (100-998)
  DAY_NIGHT_PROGRESS: 100,
  DAY_NIGHT_FILL: 100,
  DAY_NIGHT_TICKS: 101,
  DAY_NIGHT_MAJOR_TICKS: 102,
  DAY_NIGHT_MINOR_TICKS: 103,
  DAY_NIGHT_ICONS: 104,
  DAY_NIGHT_INDICATOR: 105,
  BOSS_TEXT: 110,
  
  // Night Overlay
  NIGHT_OVERLAY: 999,
  
  // Player and Interactive UI (1000-1999)
  PLAYER: 1000,
  UI_BASE: 1000,
  ACTION_BUTTONS: 1000,
  
  // Tooltips and Overlays (2000-2999)
  TOGGLE_BUTTON: 2000,
  TRANSITION_OVERLAY: 2000,
  TRANSITION_EFFECTS: 2001,
  DIALOG_OVERLAY: 2000,
  DIALOG_BOX: 2001,
  DIALOG_CONTENT: 2002,
  TOOLTIP: 2500,         // Tooltips above everything except boss effects
  
  // Boss Effects (3000+)
  BOSS_OVERLAY: 3000,
  BOSS_EFFECTS: 3001
};

export class Overworld extends Scene {
  private player!: Phaser.GameObjects.Sprite;
  private keyInputManager!: Overworld_KeyInputManager;
  private mazeGenManager!: Overworld_MazeGenManager;
  private isMoving: boolean = false;
  private isTransitioningToCombat: boolean = false;
  private gameState: OverworldGameState;
  private dayNightProgressFill!: Phaser.GameObjects.Rectangle;
  private dayNightIndicator!: Phaser.GameObjects.Text;
  private dayNightProgressContainer!: Phaser.GameObjects.Container;
  private nightOverlay!: Phaser.GameObjects.Rectangle | null;
  private bossText!: Phaser.GameObjects.Text;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private testButtonsVisible: boolean = false;
  private testButtonsContainer!: Phaser.GameObjects.Container;
  private toggleButton!: Phaser.GameObjects.Container;
  
  // Overworld UI elements
  private uiContainer!: Phaser.GameObjects.Container;
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private relicsContainer!: Phaser.GameObjects.Container;
  private potionsContainer!: Phaser.GameObjects.Container;
  private currencyText!: Phaser.GameObjects.Text;
  private landasText!: Phaser.GameObjects.Text;
  private landasMeterIndicator!: Phaser.GameObjects.Graphics;
  private deckInfoText!: Phaser.GameObjects.Text;
  private discardText!: Phaser.GameObjects.Text;
  private relicInventoryButton!: Phaser.GameObjects.Container;
  private potionInventoryButton!: Phaser.GameObjects.Container;
  private playerData: Player;
  
  // Tooltip Manager
  private tooltipManager!: Overworld_TooltipManager;
  
  // Fog of War Manager
  private fogOfWarManager!: Overworld_FogOfWarManager;

  constructor() {
    super({ key: "Overworld" });
    this.gameState = OverworldGameState.getInstance();
    
    // Initialize player data with default values or from GameState
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();
    
    if (savedPlayerData) {
      const deck = savedPlayerData.deck && savedPlayerData.deck.length > 0 ? savedPlayerData.deck : DeckManager.createFullDeck();
      this.playerData = {
        id: savedPlayerData.id || "player",
        name: savedPlayerData.name || "Hero",
        maxHealth: savedPlayerData.maxHealth || 120,
        currentHealth: savedPlayerData.currentHealth !== undefined ? savedPlayerData.currentHealth : 120,
        block: savedPlayerData.block || 0,
        statusEffects: savedPlayerData.statusEffects || [],
        hand: savedPlayerData.hand || [],
        deck: deck,
        discardPile: savedPlayerData.discardPile || [],
        drawPile: savedPlayerData.drawPile && savedPlayerData.drawPile.length > 0 ? savedPlayerData.drawPile : [...deck],
        playedHand: savedPlayerData.playedHand || [],
        landasScore: savedPlayerData.landasScore || 0,
        ginto: savedPlayerData.ginto !== undefined ? savedPlayerData.ginto : 100,
        diamante: savedPlayerData.diamante !== undefined ? savedPlayerData.diamante : 0,
        relics: savedPlayerData.relics || [],
        potions: savedPlayerData.potions || [],
        discardCharges: savedPlayerData.discardCharges !== undefined ? savedPlayerData.discardCharges : 1,
        maxDiscardCharges: savedPlayerData.maxDiscardCharges || 1
      };
    } else {
      // Initialize player data with default values
      const newDeck = DeckManager.createFullDeck();
      this.playerData = {
        id: "player",
        name: "Hero",
        maxHealth: 120,
        currentHealth: 120,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: newDeck,
        discardPile: [],
        drawPile: [...newDeck],
        playedHand: [],
        landasScore: 0,
        ginto: 9999,
        diamante: 20,
        relics: [], // No test relics - will be empty until player finds them
        potions: [], // Start with no potions - gain from treasure chests
        discardCharges: 1,
        maxDiscardCharges: 1
      };
      
      // Save initial player data to GameState
      gameState.updatePlayerData(this.playerData);
    }
  }

  create(): void {
    // Reset movement and transition flags
    this.isMoving = false;
    this.isTransitioningToCombat = false;
    
    // Set camera background color to match forest theme
    this.cameras.main.setBackgroundColor(0x323C39);
    
    // Initialize MusicManager and play scene music automatically
    MusicManager.getInstance().setScene(this);
    MusicManager.getInstance().playSceneMusic();
    
    // Explicitly set default cursor to prevent pointer cursor from persisting
    this.input.setDefaultCursor('default');
    console.log('🖱️ Overworld: Setting default cursor to "default"');
    
    // Debug: Log cursor state after setup
    this.time.delayedCall(1000, () => {
      console.log('🖱️ Current cursor state:', this.game.canvas.style.cursor);
      console.log('🖱️ Input enabled:', this.input.enabled);
    });
    
    // Check if we need to reset player data (fresh game start)
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();
    
    // If GameState has no player data (null or empty), this is a fresh start - reinitialize
    const isFreshStart = !savedPlayerData || (typeof savedPlayerData === 'object' && Object.keys(savedPlayerData).length === 0);
    
    if (isFreshStart) {
      console.log('🔄 Fresh game detected - initializing new player data');
      const newDeck = DeckManager.createFullDeck();
      this.playerData = {
        id: "player",
        name: "Hero",
        maxHealth: 120,
        currentHealth: 120,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: newDeck,
        discardPile: [],
        drawPile: [...newDeck],
        playedHand: [],
        landasScore: 0,
        ginto: 9999,
        diamante: 20,
        relics: [], // Start with no relics
        potions: [], // Start with no potions - gain from treasure chests
        discardCharges: 1,
        maxDiscardCharges: 1
      };
      
      // Save fresh player data to GameState
      gameState.updatePlayerData(this.playerData);
    }
    
    // Initialize maze generation manager with dev mode flag
    this.mazeGenManager = new Overworld_MazeGenManager(this, 32, this.testButtonsVisible);
    
    // Check if we're returning from another scene
    const savedPosition = gameState.getPlayerPosition();
    
    if (savedPosition) {
      // Restore player at saved position - use down sprite as default
      this.player = this.add.sprite(savedPosition.x, savedPosition.y, "player_down");
      // Clear the saved position so it's not used again
      gameState.clearPlayerPosition();
    } else {
      // Initialize new game in maze manager
      this.mazeGenManager.initializeNewGame();
      
      // Calculate player start position using manager
      const startPos = this.mazeGenManager.calculatePlayerStartPosition();
      this.player = this.add.sprite(startPos.x, startPos.y, "player_down");
    }
    
    this.player.setScale(2); // Scale up from 16x16 to 32x32
    this.player.setOrigin(0.5); // Center the sprite
    this.player.setDepth(1000); // Ensure player is above everything
    
    console.log("Playing avatar_idle_down animation");
    this.player.play("avatar_idle_down"); // Initial animation

    // Initialize keyboard input manager
    this.keyInputManager = new Overworld_KeyInputManager(this);
    this.keyInputManager.initialize();
    
    // Initialize pointer/mouse tracking with debug logging enabled
    this.keyInputManager.initializePointerTracking(true);
    
    // Explicitly enable input
    this.keyInputManager.enableInput();
    console.log('🎮 Overworld: Input explicitly enabled after initialization');
    console.log('🎮 Overworld: isMoving =', this.isMoving, ', isTransitioningToCombat =', this.isTransitioningToCombat);
    
    // Center the camera on the player
    this.cameras.main.startFollow(this.player);
    
    // Set initial camera zoom (will be managed by fog of war system)
    // Start with day zoom since game starts during day
    this.cameras.main.setZoom(1.0);
    
    // Create enemy info tooltip
    this.createEnemyTooltip();
    
    // Create fog of war system
    this.createFogOfWar();
    
    // Create UI elements with a slight delay to ensure camera is ready
    this.time.delayedCall(10, () => {
      this.createUI();
      // Set initial UI scale to compensate for camera zoom
      this.setInitialUIScale();
    }, [], this);
    
    // Render initial chunks around player with a slight delay to ensure camera is ready
    this.time.delayedCall(20, this.updateVisibleChunks, [], this);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
    
    // Debug: Log final state after scene is fully created
    this.time.delayedCall(100, () => {
      console.log('🔍 Overworld Debug State:');
      console.log('   - isMoving:', this.isMoving);
      console.log('   - isTransitioningToCombat:', this.isTransitioningToCombat);
      console.log('   - input.keyboard.enabled:', this.input.keyboard?.enabled);
      console.log('   - player position:', { x: this.player.x, y: this.player.y });
      console.log('   - keyInputManager exists:', !!this.keyInputManager);
    });
  }

  createUI(): void {
    // Ensure camera is available before proceeding
    if (!this.cameras || !this.cameras.main) {
      console.warn("Camera not available, scheduling UI creation for next frame");
      // Try again on the next frame
      this.time.delayedCall(10, this.createUI, [], this);
      return;
    }
    
    // Create day/night cycle progress bar (He is Coming style)
    this.createDayNightProgressBar();
    
    // Create boss appearance indicator
    this.bossText = this.add.text(10, 40, 
      `Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`, 
      {
        fontFamily: 'dungeon-mode',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: { x: 10, y: 5 }
      }
    ).setScrollFactor(0).setDepth(1000); // Fix to camera and set depth
    this.bossText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Create action buttons on the top right side of the screen (fixed to camera)
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const buttonX = screenWidth - 150; // Position from right edge
    let buttonY = 100;
    
    // Combat test button
    this.createActionButton(buttonX, buttonY, "Combat", "#ff0000", () => {
      this.startCombat("combat");
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Elite test button
    this.createActionButton(buttonX, buttonY, "Elite", "#ffa500", () => {
      this.startCombat("elite");
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Boss test button
    this.createActionButton(buttonX, buttonY, "Boss Fight", "#8b5cf6", () => {
      this.startCombat("boss");
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Shop test button
    this.createActionButton(buttonX, buttonY, "Shop", "#00ff00", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch shop scene with actual player data
      this.scene.pause();
      this.scene.launch("Shop", { 
        player: this.playerData
      });
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Event test button
    this.createActionButton(buttonX, buttonY, "Event", "#0000ff", () => {
      // Check if player data exists, if not create a default one
      const safePlayerData = this.playerData || {
        id: "player",
        name: "Hero",
        maxHealth: 120,
        currentHealth: 120,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 100,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 1,
        maxDiscardCharges: 1
      };
      
      // Save player position before transitioning
      const gameState4 = GameState.getInstance();
      gameState4.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch event scene with player data
      this.scene.pause();
      this.scene.launch("EventScene", { 
        player: safePlayerData
      });
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Campfire test button
    this.createActionButton(buttonX, buttonY, "Campfire", "#ff4500", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch campfire scene
      this.scene.pause();
      this.scene.launch("Campfire", { 
        player: this.playerData
      });
    }, this.testButtonsContainer);
    buttonY += 60;
    
    // Treasure test button
    this.createActionButton(buttonX, buttonY, "Treasure", "#ffff00", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch treasure scene
      this.scene.pause();
      this.scene.launch("Treasure", { 
        player: {
          id: "player",
          name: "Hero",
          maxHealth: 120,
          currentHealth: 120,
          block: 0,
          statusEffects: [],
          hand: [],
          deck: [],
          discardPile: [],
          drawPile: [],
          playedHand: [],
          landasScore: 0,
          ginto: 100,
          diamante: 0,
          relics: [
            {
              id: "placeholder_relic",
              name: "Placeholder Relic",
              description: "This is a placeholder relic.",
              emoji: "⚙️",
            },
          ],
        }
      });
    }, this.testButtonsContainer);
    
    // Create additional easily accessible test buttons at the bottom of the screen (fixed to camera)
    const bottomButtonY = screenHeight - 100;
    
    // Calculate total width needed for all buttons to center them
    const buttonCount = 8; // Number of bottom buttons
    const buttonSpacing = 200; // Increased spacing between buttons
    const totalWidth = (buttonCount - 1) * buttonSpacing; // Total width of spacing between buttons
    const bottomButtonX = (screenWidth - totalWidth) / 2; // Center the group of buttons
    
    let currentButtonX = bottomButtonX;
    
    // Quick Boss Fight button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Boss", "#8b5cf6", () => {
      this.startCombat("boss");
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Combat button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Combat", "#ff0000", () => {
      this.startCombat("combat");
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Elite button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Elite", "#ffa500", () => {
      this.startCombat("elite");
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Campfire button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Campfire", "#ff4500", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch campfire scene
      this.scene.pause();
      this.scene.launch("Campfire", { 
        player: this.playerData
      });
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Shop button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Shop", "#00ff00", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch shop scene with actual player data
      this.scene.pause();
      this.scene.launch("Shop", { 
        player: this.playerData
      });
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Treasure button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Treasure", "#ffff00", () => {
      // Save player position before transitioning
      const gameState = GameState.getInstance();
      gameState.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch treasure scene
      this.scene.pause();
      this.scene.launch("Treasure", { 
        player: {
          id: "player",
          name: "Hero",
          maxHealth: 120,
          currentHealth: 120,
          block: 0,
          statusEffects: [],
          hand: [],
          deck: [],
          discardPile: [],
          drawPile: [],
          playedHand: [],
          landasScore: 0,
          ginto: 100,
          diamante: 0,
          relics: [
            {
              id: "placeholder_relic",
              name: "Placeholder Relic",
              description: "This is a placeholder relic.",
              emoji: "⚙️",
            },
          ],
        }
      });
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // Quick Event button at bottom
    this.createActionButton(currentButtonX, bottomButtonY, "Quick Event", "#0000ff", () => {
      // Check if player data exists, if not create a default one
      const safePlayerData = this.playerData || {
        id: "player",
        name: "Hero",
        maxHealth: 120,
        currentHealth: 120,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 100,
        diamante: 0,
        relics: [],
        potions: [],
        discardCharges: 1,
        maxDiscardCharges: 1
      };
      
      // Save player position before transitioning
      const gameState4 = GameState.getInstance();
      gameState4.savePlayerPosition(this.player.x, this.player.y);
      
      // Pause this scene and launch event scene with player data
      this.scene.pause();
      this.scene.launch("EventScene", { 
        player: safePlayerData
      });
    }, this.testButtonsContainer);
    
    currentButtonX += 200;
    
    // DDA Debug button at bottom  
    this.createActionButton(currentButtonX, bottomButtonY, "DDA Debug", "#9c27b0", () => {
      this.scene.launch("DDADebugScene");
      this.scene.pause();
    }, this.testButtonsContainer);
    
    // Create container for all test buttons
    this.testButtonsContainer = this.add.container(0, 0);
    // Add all existing test buttons to the container
    // (We'll need to modify the button creation to add them to this container)
    
    // Create toggle button
    this.createToggleButton();
    
    // Create overworld UI panel
    this.createOverworldUI();
  }

  createDayNightProgressBar(): void {
    // Ensure camera is available before proceeding
    if (!this.cameras || !this.cameras.main) {
      console.warn("Camera not available, skipping day/night progress bar creation");
      return;
    }
    
    // Create container for all progress bar elements
    this.dayNightProgressContainer = this.add.container(0, 0);
    this.dayNightProgressContainer.setScrollFactor(0).setDepth(100);
    
    const screenWidth = this.cameras.main.width;
    const progressBarWidth = screenWidth * 0.6;
    const progressBarX = (screenWidth - progressBarWidth) / 2;
    const progressBarY = 80; // Move down with more margin above it to prevent overflow
    
    // Create horizontal axis line segments with colors matching the vertical ticks
    // Last segment should use night color, only the final tick should be red for boss
    const segmentWidth = progressBarWidth / 10;
    for (let i = 0; i < 10; i++) {
      const segmentX = progressBarX + (i * segmentWidth) + (segmentWidth / 2);
      const isDay = i % 2 === 0;
      
      const segment = this.add.rectangle(
        segmentX,
        progressBarY,
        segmentWidth,
        4,
        isDay ? 0xFFD368 : 0x7144FF // Day or night color
      ).setAlpha(1);
      this.dayNightProgressContainer.add(segment);
    }
    
    // Create major ticks (taller bars) at icon positions with thicker lines and matching colors
    for (let i = 0; i <= 10; i++) {
      const tickX = progressBarX + (i * progressBarWidth / 10);
      let color;
      
      if (i === 10) {
        // Boss tick (red color)
        color = 0xE54646;
      } else {
        // Day/night ticks
        const isDay = i % 2 === 0;
        color = isDay ? 0xFFD368 : 0x7144FF;
      }
      
      // Major tick (taller bar) with thicker line
      const majorTick = this.add.rectangle(
        tickX,
        progressBarY,
        4,
        16,
        color
      ).setOrigin(0.5, 0.5);
      this.dayNightProgressContainer.add(majorTick);
    }
    
    // Create minor ticks (shorter bars) between icons with thicker lines and matching colors
    const stepsPerSegment = 5;
    for (let i = 0; i < 10; i++) {
      const segmentStartX = progressBarX + (i * progressBarWidth / 10);
      const segmentEndX = progressBarX + ((i + 1) * progressBarWidth / 10);
      const stepWidth = (segmentEndX - segmentStartX) / stepsPerSegment;
      let color;
      
      if (i === 9) {
        // Last segment for boss (red color for final tick only)
        // For minor ticks in the last segment, use night color
        color = 0x7144FF; // Night color
      } else {
        // Day/night segments
        const isDay = i % 2 === 0;
        color = isDay ? 0xFFD368 : 0x7144FF;
      }
      
      for (let step = 1; step < stepsPerSegment; step++) {
        const tickX = segmentStartX + (step * stepWidth);
        
        // Minor tick (shorter bar) with thicker line
        const minorTick = this.add.rectangle(
          tickX,
          progressBarY,
          3,
          10,
          color
        ).setOrigin(0.5, 0.5);
        this.dayNightProgressContainer.add(minorTick);
      }
    }
    
    // Create icons above the axis line (5 day/night cycles = 10 icons + 1 boss)
    // Position icons in the middle of each cycle segment
    const iconOffset = progressBarWidth / 20; // Half of segment width to center icons
    for (let i = 0; i < 10; i++) {
      const iconX = progressBarX + (i * progressBarWidth / 10) + iconOffset;
      const iconY = progressBarY - 50; // Position above the axis line (moved down to match new position)
      
      if (i % 2 === 0) {
        // Day icon (sun) - even positions
        const sunIcon = this.add.image(iconX, iconY, "bathala_sun_icon");
        sunIcon.setScale(1.8);
        this.dayNightProgressContainer.add(sunIcon);
      } else {
        // Night icon (moon) - odd positions
        const moonIcon = this.add.image(iconX, iconY, "bathala_moon_icon");
        moonIcon.setScale(1.8);
        this.dayNightProgressContainer.add(moonIcon);
      }
    }
    
    // Boss icon at the end, positioned above the axis line
    // Position it at the end of the progress bar
    const bossIconX = progressBarX + progressBarWidth;
    const bossIconY = progressBarY - 50; // Position above the axis line (moved down to match new position)
    const bossIcon = this.add.image(bossIconX, bossIconY, "bathala_boss_icon");
    bossIcon.setScale(2.0);
    this.dayNightProgressContainer.add(bossIcon);
    
    // Create progress fill (initially empty)
    this.dayNightProgressFill = this.add.rectangle(
      progressBarX,
      progressBarY,
      0, // Width will be updated in updateDayNightProgressBar
      8, // Height of the progress fill
      0xFFFFFF // White color, can be changed
    ).setOrigin(0, 0.5);
    this.dayNightProgressContainer.add(this.dayNightProgressFill);
    
    // Create player indicator (▲ symbol pointing up from below the axis line)
    this.dayNightIndicator = this.add.text(0, 0, "▲", {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '36px',
      color: '#E54646',
      align: 'center'
    }).setOrigin(0.5, 0);
    this.dayNightProgressContainer.add(this.dayNightIndicator);
    
    // Update the progress bar
    this.updateDayNightProgressBar();
  }

  createActionButton(x: number, y: number, text: string, color: string, callback: () => void, container?: Phaser.GameObjects.Container): void {
    const button = this.add.container(x, y);
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '14px',
      color: '#ffffff'
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 20;
    const buttonWidth = Math.max(120, textWidth + padding); // Minimum width of 120px
    const buttonHeight = Math.max(40, textHeight + 10); // Minimum height of 40px
    
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    background.setStrokeStyle(2, parseInt(color.replace('#', ''), 16));
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '14px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    buttonText.setShadow(2, 2, '#000000', 2, false, true);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    // Set depth to ensure buttons are visible above other UI elements
    button.setDepth(1000);
    // Fix buttons to camera so they're always visible
    button.setScrollFactor(0);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      background.setFillStyle(0x555555);
    });
    button.on('pointerout', () => {
      background.setFillStyle(0x333333);
    });
    
    // Add to the specified container if provided, otherwise add to scene
    if (container) {
      container.add(button);
    }
    
    this.actionButtons.push(button);
  }

  createToggleButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Position toggle button at top-right corner
    const toggleX = screenWidth - 60;
    const toggleY = 50;
    
    this.toggleButton = this.add.container(toggleX, toggleY);
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, "Dev Mode", {
      fontFamily: 'dungeon-mode',
      fontSize: '12px',
      color: '#ffffff'
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 20;
    const buttonWidth = Math.max(100, textWidth + padding); // Minimum width of 100px
    const buttonHeight = Math.max(30, textHeight + 10); // Minimum height of 30px
    
    const background = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    background.setStrokeStyle(2, 0xffffff);
    
    const buttonText = this.add.text(0, 0, "Dev Mode", {
      fontFamily: 'dungeon-mode',
      fontSize: '12px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    this.toggleButton.add([background, buttonText]);
    this.toggleButton.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    this.toggleButton.setScrollFactor(0);
    this.toggleButton.setDepth(2000); // Ensure it's above other UI elements
    
    this.toggleButton.on('pointerdown', () => {
      this.toggleTestButtons();
    });
    
    this.toggleButton.on('pointerover', () => {
      background.setFillStyle(0x555555);
    });
    
    this.toggleButton.on('pointerout', () => {
      background.setFillStyle(0x333333);
    });
    
    // Initially hide all test buttons since dev mode is off by default
    this.hideTestButtons();
  }

  toggleTestButtons(): void {
    this.testButtonsVisible = !this.testButtonsVisible;
    
    // Update toggle button text
    const buttonText = this.toggleButton.getAt(1) as Phaser.GameObjects.Text;
    buttonText.setText("Dev Mode");
    
    // Show or hide all test buttons only
    this.actionButtons.forEach(button => {
      button.setVisible(this.testButtonsVisible);
    });
    
    // Update dev mode in MazeGenManager
    if (this.mazeGenManager) {
      this.mazeGenManager.setDevMode(this.testButtonsVisible);
    }
  }
  
  hideTestButtons(): void {
    // Hide only test buttons, not essential UI elements
    this.actionButtons.forEach(button => {
      button.setVisible(false);
    });
    
    // Update dev mode in MazeGenManager
    if (this.mazeGenManager) {
      this.mazeGenManager.setDevMode(false);
    }
  }

  updateUI(): void {
    // Update day/night progress bar
    this.updateDayNightProgressBar();
    
    // Update boss progress
    this.bossText.setText(`Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`);
    
    // Show boss alert if close to appearing
    if (this.gameState.getBossProgress() > 0.8 && !this.gameState.bossAppeared) {
      this.bossText.setColor('#ff0000');
    } else {
      this.bossText.setColor('#ffffff');
    }
    
    // Update overworld UI panel
    if (this.uiContainer) {
      this.updateOverworldUI();
    }
  }

  updateDayNightProgressBar(): void {
    const screenWidth = this.cameras.main.width;
    const progressBarWidth = screenWidth * 0.6;
    const progressBarX = (screenWidth - progressBarWidth) / 2;
    const progressBarY = 80; // Match the Y position from createDayNightProgressBar (updated position)
    
    // Calculate progress (0 to 1)
    const totalProgress = Math.min(this.gameState.actionsTaken / this.gameState.totalActionsUntilBoss, 1);
    
    // Update progress fill width
    if (this.dayNightProgressFill) {
      this.dayNightProgressFill.width = progressBarWidth * totalProgress;
    }
    
    // Update player indicator position (below the bar)
    this.dayNightIndicator.x = progressBarX + (progressBarWidth * totalProgress);
    this.dayNightIndicator.y = progressBarY + 25; // Position below the bar
    
    // Additional check for boss encounter when updating UI
    if (totalProgress >= 1.0 && !this.isTransitioningToCombat) {
      this.checkBossEncounter();
    }
    
    // Handle night overlay
    if (!this.gameState.isDay && !this.nightOverlay) {
      // Create night overlay
      this.nightOverlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000033
      ).setAlpha(0.4).setScrollFactor(0).setDepth(DEPTH.NIGHT_OVERLAY);
    } else if (this.gameState.isDay && this.nightOverlay) {
      // Remove night overlay
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
    
    // Update fog of war visibility based on day/night
    if (this.fogOfWarManager) {
      this.fogOfWarManager.updateDayNight(this.gameState.isDay);
    }
  }

  // No need for resume method since we handle state restoration in create()
  
  /**
   * Called when the scene resumes from another scene
   */
  resume(): void {
    // Set camera background color to match forest theme
    this.cameras.main.setBackgroundColor(0x323C39);
    
    // Re-enable input when returning from other scenes using KeyInputManager
    if (this.keyInputManager) {
      this.keyInputManager.enableInput();
    }
    
    // Reset movement flags
    this.isMoving = false;
    this.isTransitioningToCombat = false;
    
    // Restore player position if saved
    const gameState = GameState.getInstance();
    const savedPosition = gameState.getPlayerPosition();
    if (savedPosition) {
      this.player.setPosition(savedPosition.x, savedPosition.y);
      // Center camera on player
      this.cameras.main.startFollow(this.player);
      // Clear the saved position
      gameState.clearPlayerPosition();
    }
    
    // Update player data from GameState
    const savedPlayerData = gameState.getPlayerData();
    if (savedPlayerData) {
      this.playerData = {
        id: savedPlayerData.id || this.playerData.id,
        name: savedPlayerData.name || this.playerData.name,
        maxHealth: savedPlayerData.maxHealth !== undefined ? savedPlayerData.maxHealth : this.playerData.maxHealth,
        currentHealth: savedPlayerData.currentHealth !== undefined ? savedPlayerData.currentHealth : this.playerData.currentHealth,
        block: savedPlayerData.block !== undefined ? savedPlayerData.block : this.playerData.block,
        statusEffects: savedPlayerData.statusEffects || this.playerData.statusEffects,
        hand: savedPlayerData.hand || this.playerData.hand,
        deck: savedPlayerData.deck || this.playerData.deck,
        discardPile: savedPlayerData.discardPile || this.playerData.discardPile,
        drawPile: savedPlayerData.drawPile || this.playerData.drawPile,
        playedHand: savedPlayerData.playedHand || this.playerData.playedHand,
        landasScore: savedPlayerData.landasScore !== undefined ? savedPlayerData.landasScore : this.playerData.landasScore,
        ginto: savedPlayerData.ginto !== undefined ? savedPlayerData.ginto : this.playerData.ginto,
        diamante: savedPlayerData.diamante !== undefined ? savedPlayerData.diamante : this.playerData.diamante,
        relics: savedPlayerData.relics || this.playerData.relics,
        potions: savedPlayerData.potions || this.playerData.potions,
        discardCharges: savedPlayerData.discardCharges !== undefined ? savedPlayerData.discardCharges : this.playerData.discardCharges,
        maxDiscardCharges: savedPlayerData.maxDiscardCharges !== undefined ? savedPlayerData.maxDiscardCharges : this.playerData.maxDiscardCharges
      };
      
      // Update UI to reflect new player data
      this.updateOverworldUI();
    }
    
    // Update visible chunks around player
    this.updateVisibleChunks();
  }

  /**
   * Move player to a new position with animation
   */
  movePlayer(targetX: number, targetY: number, direction: string): void {
    // Set moving flag to prevent input during movement
    this.isMoving = true;
    
    // Play walking animation with error checking
    let walkAnimation = "avatar_walk_down";
    let idleAnimation = "avatar_idle_down";
    let textureKey = "player_down";
    
    switch (direction) {
      case "up":
        walkAnimation = "avatar_walk_up";
        idleAnimation = "avatar_idle_up";
        textureKey = "player_up";
        break;
      case "down":
        walkAnimation = "avatar_walk_down";
        idleAnimation = "avatar_idle_down";
        textureKey = "player_down";
        break;
      case "left":
        walkAnimation = "avatar_walk_left";
        idleAnimation = "avatar_idle_left";
        textureKey = "player_left";
        break;
      case "right":
        walkAnimation = "avatar_walk_right";
        idleAnimation = "avatar_idle_right";
        textureKey = "player_right";
        break;
    }
    
    // Switch texture to match the direction
    this.player.setTexture(textureKey);
    
    console.log("Playing walk animation:", walkAnimation);
    if (this.anims.exists(walkAnimation)) {
      try {
        this.player.play(walkAnimation, true);
      } catch (error) {
        console.warn("Failed to play walk animation:", walkAnimation, error);
      }
    } else {
      console.warn("Walk animation not found:", walkAnimation);
    }

    // Check if the new position is valid (not a wall)
    if (this.isValidPosition(targetX, targetY)) {
      console.log("Position is valid, moving player");
      
      // Move player with tween
      this.tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: 80, // Slightly faster movement
        onComplete: () => {
          this.isMoving = false;
          this.checkNodeInteraction();
          
          // Record the action for day/night cycle after movement completes
          this.gameState.recordAction();
          
          // Check if boss should appear after recording action
          this.checkBossEncounter();
          
          // Update UI to reflect day/night cycle changes
          this.updateUI();
          
          // Play idle animation after movement
          console.log("Playing idle animation:", idleAnimation);
          if (this.anims.exists(idleAnimation)) {
            try {
              this.player.play(idleAnimation);
            } catch (error) {
              console.warn("Failed to play idle animation:", idleAnimation, error);
            }
          } else {
            console.warn("Idle animation not found:", idleAnimation);
          }
          
          // Update visible chunks as player moves
          this.updateVisibleChunks();
          
          // Update fog of war
          if (this.fogOfWarManager) {
            this.fogOfWarManager.update(this.player.x, this.player.y);
          }
          
          // Move nearby enemy nodes toward player during nighttime
          this.moveEnemiesNighttime();
        }
      });
    } else {
      console.log("Position is invalid (wall or out of bounds)");
      // Invalid move, just reset the moving flag
      this.isMoving = false;
      console.log("Invalid move, playing idle animation");
      // Play appropriate idle animation based on last movement direction
      console.log("Playing idle animation:", idleAnimation);
      if (this.anims.exists(idleAnimation)) {
        try {
          this.player.play(idleAnimation);
        } catch (error) {
          console.warn("Failed to play idle animation:", idleAnimation, error);
        }
      } else {
        console.warn("Idle animation not found:", idleAnimation);
      }
    }
  }

  handleDayNightTransition(): void {
    // Update night overlay
    if (!this.gameState.isDay && !this.nightOverlay) {
      // Create night overlay
      this.nightOverlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000033
      ).setAlpha(0.4).setScrollFactor(0).setDepth(DEPTH.NIGHT_OVERLAY);
    } else if (this.gameState.isDay && this.nightOverlay) {
      // Remove night overlay
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
    
    // Update fog of war visibility based on day/night
    if (this.fogOfWarManager) {
      this.fogOfWarManager.updateDayNight(this.gameState.isDay);
    }
  }

  /**
   * Check if boss encounter should be triggered
   */
  checkBossEncounter(): void {
    if (this.gameState.shouldBossAppear()) {
      this.triggerBossEncounter();
    }
  }

  /**
   * Trigger the boss encounter
   */
  triggerBossEncounter(): void {
    // Prevent multiple triggers
    if (this.isTransitioningToCombat) {
      return;
    }

    this.isTransitioningToCombat = true;
    
    // Mark boss as triggered to prevent future triggers
    this.gameState.markBossTriggered();
    
    // Hide any visible tooltips
    this.tooltipManager.hideTooltip();
    
    // Create dramatic effect for boss appearance
    this.createBossAppearanceEffect();
    
    // Delay the actual combat transition for dramatic effect
    this.time.delayedCall(3000, () => {
      this.startBossEncounter();
    });
  }

  /**
   * Create dramatic visual effects for boss appearance
   */
  createBossAppearanceEffect(): void {
    // Screen shake effect
    this.cameras.main.shake(2000, 0.02);
    
    // Screen flash effect
    const flashOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0xff0000
    ).setAlpha(0).setScrollFactor(0).setDepth(3000);
    
    // Flash sequence
    this.tweens.add({
      targets: flashOverlay,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        flashOverlay.destroy();
      }
    });
    
    // Dramatic text announcement
    const bossText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "THE FINAL BOSS AWAKENS!",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setAlpha(0);
    
    // Animate text appearance
    this.tweens.add({
      targets: bossText,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Fade out after showing
        this.tweens.add({
          targets: bossText,
          alpha: 0,
          scale: 1.5,
          duration: 1500,
          delay: 500,
          onComplete: () => {
            bossText.destroy();
          }
        });
      }
    });
    
    // Darken the entire screen progressively
    const darkOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(2999);
    
    this.tweens.add({
      targets: darkOverlay,
      alpha: 0.8,
      duration: 2500,
      ease: 'Power2'
    });
  }

  /**
   * Start the actual boss encounter
   */
  startBossEncounter(): void {
    // Save player position
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(this.player.x, this.player.y);
    
    // Start the epic boss transition animation (from debug boss button)
    this.startEpicBossTransition();
  }

  /**
   * Epic boss transition animation (same as debug boss button)
   */
  startEpicBossTransition(): void {
    // Get camera dimensions
    const camera = this.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create epic boss transition effect
    const overlay = this.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Epic fade in
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create epic radial effect
    this.time.delayedCall(500, () => {
      // Create expanding circles
      const circles = [];
      for (let i = 0; i < 5; i++) {
        const circle = this.add.circle(
          cameraWidth / 2,
          cameraHeight / 2,
          10,
          0xff0000,
          0.7
        ).setScrollFactor(0).setDepth(2001);
        
        circles.push(circle);
        
        // Animate circle expansion
        this.tweens.add({
          targets: circle,
          radius: cameraWidth,
          alpha: 0,
          duration: 2000,
          delay: i * 200,
          ease: 'Power2'
        });
      }
      
      // Final transition
      this.time.delayedCall(2500, () => {
        // Final zoom and transition
        this.tweens.add({
          targets: camera,
          zoom: 2,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and launch boss combat
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: "boss",
              transitionOverlay: overlay
            });
          }
        });
      });
    });
  }

  /**
   * Move enemy nodes toward the player during nighttime
   */
  moveEnemiesNighttime(): void {
    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;
    
    // Delegate to MazeGenManager
    this.mazeGenManager.moveEnemiesNighttime(this.gameState, playerX, playerY, this.mazeGenManager.getGridSize(), this);
  }

  updateVisibleChunks(): void {
    // Ensure camera is available before proceeding
    if (!this.cameras || !this.cameras.main) {
      console.warn("Camera not available, skipping chunk update");
      return;
    }
    
    // Update visible chunks using manager
    this.mazeGenManager.updateVisibleChunks(this.cameras.main);
    
    // Render any new nodes that were added
    const allNodes = this.mazeGenManager.getNodes();
    allNodes.forEach(node => {
      // Only render if not already rendered
      if (!this.mazeGenManager.getNodeSprite(node.id)) {
        this.mazeGenManager.renderNodeSprite(
          node,
          this.handleNodeHoverStart.bind(this),
          this.handleNodeHoverMove.bind(this),
          this.handleNodeHoverEnd.bind(this)
        );
      }
    });
  }


  renderNode(node: MapNode): void {
    // DEPRECATED: This method now delegates to MazeGenManager.renderNodeSprite
    // All node rendering logic has been moved to the manager for better separation of concerns
    
    // Use the manager's enhanced hover callbacks that match the original functionality
    this.mazeGenManager.renderNodeSprite(
      node,
      (hoveredNode, pointer) => {
        console.log(`🖱️ Hovering over ${hoveredNode.type} node at ${hoveredNode.id}`);
        
        // Set current hovered node
        this.tooltipManager.setLastHoveredNodeId(hoveredNode.id);
        
        // Show appropriate tooltip based on node type
        if (hoveredNode.type === "combat" || hoveredNode.type === "elite" || hoveredNode.type === "boss") {
          this.tooltipManager.showEnemyTooltip(hoveredNode, pointer.x, pointer.y);
        } else {
          this.tooltipManager.showNodeTooltip(hoveredNode, pointer.x, pointer.y);
        }
      },
      (hoveredNode, pointer) => {
        // Update tooltip position on mouse move while hovering
        if (this.tooltipManager.isVisible() && this.tooltipManager.getLastHoveredNodeId() === hoveredNode.id) {
          this.tooltipManager.updateTooltipPosition(pointer.x, pointer.y);
        }
      },
      (hoveredNode) => {
        console.log(`🖱️ Stopped hovering over ${hoveredNode.type} node at ${hoveredNode.id}`);
        
        // Hide tooltip immediately
        this.tooltipManager.hideTooltip();
      }
    );
  }

  private handleNodeHoverStart(node: MapNode, pointer: Phaser.Input.Pointer): void {
    console.log(`🖱️ [HOVER START] Node type: ${node.type}, ID: ${node.id}, EnemyID: ${node.enemyId || 'N/A'}`);
    
    // Set current hovered node
    this.tooltipManager.setLastHoveredNodeId(node.id);
    
    // Show appropriate tooltip based on node type
    if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
      console.log(`🖱️ Showing enemy tooltip for: ${node.enemyId}`);
      this.tooltipManager.showEnemyTooltip(node, pointer.x, pointer.y);
    } else {
      console.log(`🖱️ Showing node tooltip for: ${node.type}`);
      this.tooltipManager.showNodeTooltip(node, pointer.x, pointer.y);
    }
  }

  private handleNodeHoverMove(node: MapNode, pointer: Phaser.Input.Pointer): void {
    // Update tooltip position on mouse move while hovering
    if (this.tooltipManager.isVisible() && this.tooltipManager.getLastHoveredNodeId() === node.id) {
      this.tooltipManager.updateTooltipPosition(pointer.x, pointer.y);
    }
  }

  private handleNodeHoverEnd(node: MapNode): void {
    console.log(`🖱️ Stopped hovering over ${node.type} node at ${node.id}`);
    
    // Hide tooltip immediately
    this.tooltipManager.hideTooltip();
  }

  isValidPosition(x: number, y: number): boolean {
    return this.mazeGenManager.isValidPosition(x, y);
  }

  checkNodeInteraction(): void {
    // Check if player is currently moving or transitioning to prevent multiple triggers
    if (this.isMoving || this.isTransitioningToCombat) {
      return;
    }
    
    // Check if player is close to any node
    const threshold = this.mazeGenManager.getGridSize();
    const nodes = this.mazeGenManager.getNodes();

    const nodeIndex = nodes.findIndex((n: MapNode) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        n.x + this.mazeGenManager.getGridSize() / 2, 
        n.y + this.mazeGenManager.getGridSize() / 2
      );
      return distance < threshold;
    });

    if (nodeIndex !== -1) {
      const nodes = this.mazeGenManager.getNodes();
      const node = nodes[nodeIndex];
      
      // Check if this node has already been visited and prevent re-interaction
      // (for non-consumable nodes like shop, campfire, treasure)
      if (node.visited && (node.type === "shop" || node.type === "campfire" || node.type === "treasure")) {
        console.log(`Node ${node.type} at ${node.x}, ${node.y} has already been visited`);
        return;
      }
      
      // Handle different node types
      switch (node.type) {
        case "combat":
        case "elite":
          // Remove the node from the manager's list
          nodes.splice(nodeIndex, 1);
          
          // Clean up the corresponding sprite from manager
          const sprite = this.mazeGenManager.getNodeSprite(node.id);
          if (sprite) {
            sprite.destroy();
          }
          
          // Hide tooltip if it's visible
          this.tooltipManager.hideTooltip();
          
          this.startCombat(node.type, node.enemyId);
          break;
          
        case "boss":
          // Remove the node from the manager's list
          nodes.splice(nodeIndex, 1);
          
          // Clean up the corresponding sprite from manager
          const bossSprite = this.mazeGenManager.getNodeSprite(node.id);
          if (bossSprite) {
            bossSprite.destroy();
          }
          
          // Hide tooltip if it's visible
          this.tooltipManager.hideTooltip();
          
          this.startCombat("boss", node.enemyId);
          break;
          
        case "shop":
          // Set moving flag to prevent additional interactions during transition
          this.isMoving = true;
          
          // Mark node as visited instead of removing it
          node.visited = true;
          
          // Update sprite appearance to show it's been visited
          const shopSprite = this.mazeGenManager.getNodeSprite(node.id);
          if (shopSprite) {
            shopSprite.setAlpha(0.6); // Make it semi-transparent
            shopSprite.setTint(0x888888); // Give it a gray tint
          }
          
          // Save player position before transitioning
          const gameState = GameState.getInstance();
          gameState.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch shop scene with actual player data
          this.scene.pause();
          this.scene.launch("Shop", { 
            player: this.playerData
          });
          break;
          
        case "campfire":
          // Set moving flag to prevent additional interactions during transition
          this.isMoving = true;
          
          // Mark node as visited instead of removing it
          node.visited = true;
          
          // Update sprite appearance to show it's been visited
          const campfireSprite = this.mazeGenManager.getNodeSprite(node.id);
          if (campfireSprite) {
            campfireSprite.setAlpha(0.6); // Make it semi-transparent
            campfireSprite.setTint(0x888888); // Give it a gray tint
          }
          
          // Save player position before transitioning
          const gameState2 = GameState.getInstance();
          gameState2.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch campfire scene
          this.scene.pause();
          this.scene.launch("Campfire", { 
            player: this.playerData
          });
          break;
          
        case "treasure":
          // Set moving flag to prevent additional interactions during transition
          this.isMoving = true;
          
          // Mark node as visited instead of removing it
          node.visited = true;
          
          // Update sprite appearance to show it's been visited
          const treasureSprite = this.mazeGenManager.getNodeSprite(node.id);
          if (treasureSprite) {
            treasureSprite.setAlpha(0.6); // Make it semi-transparent
            treasureSprite.setTint(0x888888); // Give it a gray tint
          }
          
          // Save player position before transitioning
          const gameState3 = GameState.getInstance();
          gameState3.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch treasure scene with current player data
          this.scene.pause();
          this.scene.launch("Treasure", { 
            player: this.playerData
          });
          break;
          
        case "event":
          // Set moving flag to prevent additional interactions during transition
          this.isMoving = true;
          
          // Remove the node from the manager's list
          nodes.splice(nodeIndex, 1);
          
          // Clean up the corresponding sprite from manager
          const eventSprite = this.mazeGenManager.getNodeSprite(node.id);
          if (eventSprite) {
            eventSprite.destroy();
          }
          
          // Hide tooltip if it's visible
          this.tooltipManager.hideTooltip();
          
          // Check if player data exists, if not create a default one
          const safePlayerData = this.playerData || {
            id: "player",
            name: "Hero",
            maxHealth: 120,
            currentHealth: 120,
            block: 0,
            statusEffects: [],
            hand: [],
            deck: [],
            discardPile: [],
            drawPile: [],
            playedHand: [],
            landasScore: 0,
            ginto: 100,
            diamante: 0,
            relics: [],
            potions: [],
            discardCharges: 1,
            maxDiscardCharges: 1
          };
          
          // Save player position before transitioning
          const gameState4 = GameState.getInstance();
          gameState4.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch event scene with player data
          this.scene.pause();
          this.scene.launch("EventScene", { 
            player: safePlayerData
          });
          break;
      }
    }
    
    // Check if boss should appear automatically
    if (this.gameState.shouldBossAppear()) {
      this.showBossAppearance();
    }
  }

  showBossAppearance(): void {
    // Disable player movement during boss appearance
    this.isMoving = true;
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0).setScrollFactor(0).setDepth(3000);
    
    // Fade in overlay
    this.tweens.add({
      targets: overlay,
      alpha: 0.8,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create boss appearance text
    const bossText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "THE BOSS APPROACHES...",
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 48,
        color: "#ff0000",
        align: "center"
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setScale(0.1);
    
    // Animate text scaling
    this.tweens.add({
      targets: bossText,
      scale: 1,
      duration: 1500,
      ease: 'Elastic.easeOut'
    });
    
    // Shake camera for dramatic effect
    this.cameras.main.shake(2000, 0.02);
    
    // After delay, start boss combat
    this.time.delayedCall(3000, () => {
      // Clean up
      overlay.destroy();
      bossText.destroy();
      
      // Start boss combat
      this.startCombat("boss");
    });
  }

  /**
   * Show a simple event dialog for node interactions
   */
  private showNodeEvent(title: string, message: string, color: number): void {
    // Disable player movement during event
    this.isMoving = true;
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(2000);
    
    // Create dialog box
    const dialogBox = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      600,
      300,
      0x2f3542
    ).setStrokeStyle(3, color).setScrollFactor(0).setDepth(2001);
    
    // Create title
    const titleText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      title,
      {
        fontFamily: "dungeon-mode-inverted",
        fontSize: 32,
        color: `#${color.toString(16).padStart(6, '0')}`,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
    
    // Create message
    const messageText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      message,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: 500 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
    
    // Create continue button
    const buttonTextContent = "Continue";
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, buttonTextContent, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 20;
    const buttonWidth = Math.max(150, textWidth + padding); // Minimum width of 150px
    const buttonHeight = Math.max(40, textHeight + 10); // Minimum height of 40px
    
    const continueButton = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100
    ).setScrollFactor(0).setDepth(2002);
    
    const buttonBg = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x3d4454)
      .setStrokeStyle(2, color);
    const buttonText = this.add.text(0, 0, buttonTextContent, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    continueButton.add([buttonBg, buttonText]);
    continueButton.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains
    );
    
    continueButton.on('pointerdown', () => {
      // Clean up dialog elements
      overlay.destroy();
      dialogBox.destroy();
      titleText.destroy();
      messageText.destroy();
      continueButton.destroy();
      
      // Re-enable player movement
      this.isMoving = false;
    });
    
    continueButton.on('pointerover', () => {
      buttonBg.setFillStyle(0x4a5464);
    });
    
    continueButton.on('pointerout', () => {
      buttonBg.setFillStyle(0x3d4454);
    });
  }

  startCombat(nodeType: string, enemyId?: string): void {
    // Prevent player from moving during combat transition
    this.isMoving = true;
    this.isTransitioningToCombat = true;
    
    // Save player position before transitioning
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(this.player.x, this.player.y);
    
    // Disable input during transition
    if (this.input && this.input.keyboard) {
      this.input.keyboard.enabled = false;
    }
    
    // Check if this is a boss fight for special animation
    if (nodeType === "boss") {
      this.startBossCombat(enemyId);
      return;
    }
    
    // Get camera dimensions
    const camera = this.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create a full-screen overlay that follows the camera
    const overlay = this.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Different transition effects based on enemy type (Pokemon-like wild encounters with consistent red/black theme)
    if (nodeType === "elite") {
      // Elite enemy transition - Pokemon-like wild encounter with red/black theme
      // Flash screen with red tint
      const flashOverlay = this.add.rectangle(
        cameraWidth / 2,
        cameraHeight / 2,
        cameraWidth,
        cameraHeight,
        0xff0000
      ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
      
      // Animate flash
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0.7,
        duration: 200,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Shake player sprite
      const originalPlayerX = this.player.x;
      const originalPlayerY = this.player.y;
      
      // More intense shaking for elite enemies
      this.tweens.add({
        targets: this.player,
        x: originalPlayerX + Phaser.Math.Between(-5, 5),
        y: originalPlayerY + Phaser.Math.Between(-5, 5),
        duration: 100,
        repeat: 5,
        yoyo: true,
        onComplete: () => {
          this.player.setX(originalPlayerX);
          this.player.setY(originalPlayerY);
        }
      });
      
      // Create elite enemy encounter effect
      this.time.delayedCall(500, () => {
        // Create expanding circles with red color
        for (let i = 0; i < 3; i++) {
          const circle = this.add.circle(
            cameraWidth / 2,
            cameraHeight / 2,
            10,
            0xff0000, // Red color for elite enemies
            0.3
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate circle expansion
          this.tweens.add({
            targets: circle,
            radius: cameraWidth / 3,
            alpha: 0,
            duration: 1000,
            delay: i * 100,
            ease: 'Power2',
            onComplete: () => {
              circle.destroy();
            }
          });
        }
        
        // Create red sparkle effects
        for (let i = 0; i < 20; i++) {
          const sparkle = this.add.rectangle(
            Phaser.Math.Between(cameraWidth/2 - 100, cameraWidth/2 + 100),
            Phaser.Math.Between(cameraHeight/2 - 100, cameraHeight/2 + 100),
            Phaser.Math.Between(2, 5),
            Phaser.Math.Between(2, 5),
            0xff0000,
            1
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate sparkles
          this.tweens.add({
            targets: sparkle,
            alpha: 0,
            duration: 800,
            delay: Phaser.Math.Between(0, 500),
            onComplete: () => {
              sparkle.destroy();
            }
          });
        }
      });
      
      // Fade to black and transition
      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and start combat scene
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: nodeType,
              enemyId: enemyId,
              transitionOverlay: overlay // Pass overlay to combat scene
            });
          }
        });
      });
    } else {
      // Common enemy transition - Pokemon-like wild encounter with red/black theme
      // Flash screen red
      const flashOverlay = this.add.rectangle(
        cameraWidth / 2,
        cameraHeight / 2,
        cameraWidth,
        cameraHeight,
        0xff0000
      ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2001);
      
      // Animate flash
      this.tweens.add({
        targets: flashOverlay,
        alpha: 0.8,
        duration: 150,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          flashOverlay.destroy();
        }
      });
      
      // Shake player sprite slightly
      const originalPlayerX = this.player.x;
      const originalPlayerY = this.player.y;
      
      this.tweens.add({
        targets: this.player,
        x: originalPlayerX + Phaser.Math.Between(-3, 3),
        y: originalPlayerY + Phaser.Math.Between(-3, 3),
        duration: 100,
        repeat: 3,
        yoyo: true,
        onComplete: () => {
          this.player.setX(originalPlayerX);
          this.player.setY(originalPlayerY);
        }
      });
      
      // Create common enemy encounter effect
      this.time.delayedCall(400, () => {
        // Create simple expanding circle in red
        const circle = this.add.circle(
          cameraWidth / 2,
          cameraHeight / 2,
          10,
          0xff0000, // Red color for common enemies
          0.2
        ).setScrollFactor(0).setDepth(2001);
        
        // Animate circle expansion
        this.tweens.add({
          targets: circle,
          radius: cameraWidth / 4,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => {
            circle.destroy();
          }
        });
        
        // Create small red sparkle effects
        for (let i = 0; i < 10; i++) {
          const sparkle = this.add.rectangle(
            Phaser.Math.Between(cameraWidth/2 - 50, cameraWidth/2 + 50),
            Phaser.Math.Between(cameraHeight/2 - 50, cameraHeight/2 + 50),
            2,
            2,
            0xff0000,
            1
          ).setScrollFactor(0).setDepth(2001);
          
          // Animate sparkles
          this.tweens.add({
            targets: sparkle,
            alpha: 0,
            duration: 600,
            delay: Phaser.Math.Between(0, 300),
            onComplete: () => {
              sparkle.destroy();
            }
          });
        }
      });
      
      // Fade to black and transition
      this.time.delayedCall(1200, () => {
        this.tweens.add({
          targets: overlay,
          alpha: 1,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and start combat scene
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: nodeType,
              enemyId: enemyId,
              transitionOverlay: overlay // Pass overlay to combat scene
            });
          }
        });
      });
    }
  }

  startBossCombat(enemyId?: string): void {
    // Save player position before transitioning
    const gameState = GameState.getInstance();
    gameState.savePlayerPosition(this.player.x, this.player.y);
    
    // Get camera dimensions
    const camera = this.cameras.main;
    const cameraWidth = camera.width;
    const cameraHeight = camera.height;
    
    // Create epic boss transition effect
    const overlay = this.add.rectangle(
      cameraWidth / 2,
      cameraHeight / 2,
      cameraWidth,
      cameraHeight,
      0x000000
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0).setDepth(2000);
    
    // Epic fade in
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });
    
    // Create epic radial effect
    this.time.delayedCall(500, () => {
      // Create expanding circles
      const circles = [];
      for (let i = 0; i < 5; i++) {
        const circle = this.add.circle(
          cameraWidth / 2,
          cameraHeight / 2,
          10,
          0xff0000,
          0.7
        ).setScrollFactor(0).setDepth(2001);
        
        circles.push(circle);
        
        // Animate circle expansion
        this.tweens.add({
          targets: circle,
          radius: cameraWidth,
          alpha: 0,
          duration: 2000,
          delay: i * 200,
          ease: 'Power2'
        });
      }
      
      // Final transition
      this.time.delayedCall(2500, () => {
        // Final zoom and transition
        this.tweens.add({
          targets: camera,
          zoom: 2,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
            // Pause this scene and launch boss combat
            this.scene.pause();
            this.scene.launch("Combat", { 
              nodeType: "boss",
              enemyId: enemyId,
              transitionOverlay: overlay
            });
          }
        });
      });
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Update UI elements on resize
    this.updateUI();
  }

  /**
   * Shutdown method to clean up scene state
   */
  shutdown(): void {
    console.log('🧹 Overworld: Cleaning up scene resources');
    
    // Reset cursor when leaving the scene
    this.input.setDefaultCursor('default');
    
    // Clean up KeyInputManager
    if (this.keyInputManager) {
      this.keyInputManager.destroy();
    }
    
    // Clean up event listeners
    this.scale.off('resize', this.handleResize, this);
    
    console.log('✅ Overworld: Shutdown complete');
  }

  /**
   * Update method for animation effects and player movement
   */
  update(time: number, delta: number): void {
    // Skip input handling if player is currently moving or transitioning to combat
    if (this.isMoving || this.isTransitioningToCombat) {
      return;
    }
    
    // Ensure camera is available before processing input
    if (!this.cameras || !this.cameras.main) {
      return;
    }

    // Handle player movement if not moving or in transition
    if (!this.isMoving && !this.isTransitioningToCombat) {
      const gridSize = this.mazeGenManager.getGridSize();
      let moved = false;
      
      // Check for movement input using KeyInputManager
      if (this.keyInputManager.isLeftPressed()) {
        const targetX = this.player.x - gridSize;
        if (this.isValidPosition(targetX, this.player.y)) {
          this.movePlayer(targetX, this.player.y, "left");
          moved = true;
        }
      } else if (this.keyInputManager.isRightPressed()) {
        const targetX = this.player.x + gridSize;
        if (this.isValidPosition(targetX, this.player.y)) {
          this.movePlayer(targetX, this.player.y, "right");
          moved = true;
        }
      } else if (this.keyInputManager.isUpPressed()) {
        const targetY = this.player.y - gridSize;
        if (this.isValidPosition(this.player.x, targetY)) {
          this.movePlayer(this.player.x, targetY, "up");
          moved = true;
        }
      } else if (this.keyInputManager.isDownPressed()) {
        const targetY = this.player.y + gridSize;
        if (this.isValidPosition(this.player.x, targetY)) {
          this.movePlayer(this.player.x, targetY, "down");
          moved = true;
        }
      }
      
      // Check for Enter key to interact with nodes
      if (this.keyInputManager.isEnterJustPressed()) {
        this.checkNodeInteraction();
      }
      
      // Check for shop key
      if (this.keyInputManager.isShopKeyJustPressed()) {
        console.log("Shop key pressed");
        // Save player position before transitioning
        const gameState = GameState.getInstance();
        gameState.savePlayerPosition(this.player.x, this.player.y);
        
        // Pause this scene and launch shop scene with actual player data
        this.scene.pause();
        this.scene.launch("Shop", { 
          player: this.playerData
        });
      }
      
      // Debug: Add actions with P key for testing (adds 100 actions to test boss trigger faster)
      if (this.keyInputManager.isDebugActionKeyJustPressed()) {
        for (let i = 0; i < 100; i++) {
          this.gameState.recordAction();
        }
        this.updateUI();
        this.checkBossEncounter();
      }

      
      // Check for C key to trigger combat (for testing)
      if (this.keyInputManager.isDebugCombatKeyJustPressed()) {
        this.startCombat("combat");
      }
      
      // Check for E key to trigger elite combat (for testing)
      if (this.keyInputManager.isDebugEliteKeyJustPressed()) {
        this.startCombat("elite");
      }
      
      // Update chunk rendering and day/night cycle if player moved
      if (moved) {
        this.updateVisibleChunks();
        this.checkNodeInteraction();
        // Update UI to reflect day/night cycle changes
        this.updateUI();
      }
    }
  }

  /**
   * Create the overworld UI panel with health, relics, and potions
   */
  private createOverworldUI(): void {
    const screenHeight = this.cameras.main.height;
    
    // Create main UI container positioned at top-left
    this.uiContainer = this.add.container(0, 0);
    this.uiContainer.setScrollFactor(0).setDepth(1500);
    
    // Create compact left panel for all UI elements
    this.createCompactLeftPanel(screenHeight);
    
    // Update all UI elements
    this.updateOverworldUI();
  }

  /**
   * Create retro-styled left panel matching reference image exactly
   */
  private createCompactLeftPanel(screenHeight: number): void {
    const panelWidth = 300;
    const panelHeight = 450;
    const panelX = 20;
    const panelY = (screenHeight / 2) - (panelHeight / 2); // Center vertically
    
    // Dark retro-style background with double border like reference
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0a0a, 1.0);
    panelBg.lineStyle(2, 0x888888, 1.0);
    panelBg.fillRect(panelX, panelY, panelWidth, panelHeight);
    panelBg.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Inner border exactly like reference
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(1, 0x666666, 1.0);
    innerBorder.strokeRect(panelX + 6, panelY + 6, panelWidth - 12, panelHeight - 12);
    
    this.uiContainer.add([panelBg, innerBorder]);
    
    let currentY = panelY + 30;
    
    // Health section
    this.createRetroHealthSection(panelX + 30, currentY, panelWidth - 60);
    currentY += 110;
    
    // Relics section
    this.createRetroRelicsSection(panelX + 30, currentY, panelWidth - 60);
    currentY += 180;
    
    // Potions section
    this.createRetroPotionsSection(panelX + 30, currentY, panelWidth - 60);
  }

  /**
   * Creates an enhanced section separator with visual flair
   */
  private createSectionSeparator(x: number, y: number, width: number): void {
    // Create a container for the separator elements
    const separatorContainer = this.add.container(0, 0);
    
    // Background glow effect
    const glow = this.add.graphics();
    glow.fillStyle(0x4A90E2, 0.15);
    glow.fillRect(x + width * 0.2, y - 1, width * 0.6, 3);
    separatorContainer.add(glow);
    
    // Main separator line
    const separator = this.add.graphics();
    separator.lineStyle(1, 0x4A90E2, 0.6);
    separator.beginPath();
    separator.moveTo(x + width * 0.1, y);
    separator.lineTo(x + width * 0.9, y);
    separator.strokePath();
    separatorContainer.add(separator);
    
    // Accent dots for visual interest
    const leftDot = this.add.graphics();
    leftDot.fillStyle(0x4A90E2, 0.8);
    leftDot.fillCircle(x + width * 0.1, y, 2);
    separatorContainer.add(leftDot);
    
    const rightDot = this.add.graphics();
    rightDot.fillStyle(0x4A90E2, 0.8);
    rightDot.fillCircle(x + width * 0.9, y, 2);
    separatorContainer.add(rightDot);
    
    this.uiContainer.add(separatorContainer);
  }

  /**
   * Create retro health section matching reference image exactly
   */
  private createRetroHealthSection(x: number, y: number, width: number): void {
    // Health label and value on same line
    const healthLabel = this.add.text(x, y, "Health", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#888888"
    });
    
    const healthIcon = this.add.text(x, y + 20, "♥", {
      fontSize: "16px",
      color: "#ff0000"
    });
    
    this.healthText = this.add.text(x + 25, y + 20, `${this.playerData.currentHealth}/${this.playerData.maxHealth}`, {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    
    // Gold label and value
    const goldLabel = this.add.text(x, y + 45, "Gold", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#888888"
    });
    
    const goldIcon = this.add.text(x, y + 65, "♦", {
      fontSize: "16px",
      color: "#ffff00"
    });
    
    this.currencyText = this.add.text(x + 25, y + 65, `${this.playerData.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    
    // Create health bar graphics (required for updateHealthBar method)
    this.healthBar = this.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    this.uiContainer.add([healthLabel, healthIcon, this.healthText, goldLabel, goldIcon, this.currencyText]);
  }

  /**
   * Create retro relics section with 2x3 grid exactly like reference
   */
  private createRetroRelicsSection(x: number, y: number, width: number): void {
    // Relics label
    const relicsLabel = this.add.text(x, y, "Relics", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#888888"
    });
    this.uiContainer.add(relicsLabel);
    
    // Create 3x2 grid of relic slots (3 columns, 2 rows)
    const slotSize = 60;
    const slotSpacing = 10;
    const slotsPerRow = 3;
    const rows = 2;
    const gridStartX = x;
    const gridStartY = y + 25;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = gridStartX + col * (slotSize + slotSpacing);
        const slotY = gridStartY + row * (slotSize + slotSpacing);
        
        const slot = this.add.graphics();
        slot.fillStyle(0x000000, 1.0);
        slot.lineStyle(1, 0x666666, 1.0);
        slot.fillRect(slotX, slotY, slotSize, slotSize);
        slot.strokeRect(slotX, slotY, slotSize, slotSize);
        this.uiContainer.add(slot);
      }
    }
    
    // Create relics container for items
    this.relicsContainer = this.add.container(gridStartX, gridStartY);
    this.uiContainer.add(this.relicsContainer);
  }

  /**
   * Create retro potions section with 1x3 horizontal layout exactly like reference
   */
  private createRetroPotionsSection(x: number, y: number, width: number): void {
    // Potions label
    const potionsLabel = this.add.text(x, y, "Potions", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#888888"
    });
    this.uiContainer.add(potionsLabel);
    
    // Create 3 horizontal potion slots
    const slotSize = 60;
    const slotSpacing = 10;
    const potionStartX = x;
    const potionStartY = y + 25;
    
    for (let i = 0; i < 3; i++) {
      const slotX = potionStartX + i * (slotSize + slotSpacing);
      
      const slot = this.add.graphics();
      slot.fillStyle(0x000000, 1.0);
      slot.lineStyle(1, 0x666666, 1.0);
      slot.fillRect(slotX, potionStartY, slotSize, slotSize);
      slot.strokeRect(slotX, potionStartY, slotSize, slotSize);
      this.uiContainer.add(slot);
    }
    
    // Create potions container for items
    this.potionsContainer = this.add.container(potionStartX, potionStartY);
    this.uiContainer.add(this.potionsContainer);
  }

  /**
   * Create top stats section with health bar and key stats
   */
  private createTopStatsSection(x: number, y: number): void {
    // Enhanced health section with gradient background
    const healthSectionBg = this.add.graphics();
    healthSectionBg.fillGradientStyle(0x1a0000, 0x1a0000, 0x000000, 0x000000, 0.95);
    healthSectionBg.lineStyle(3, 0xff0000, 0.8);
    healthSectionBg.fillRoundedRect(x - 10, y - 10, 270, 240, 12);
    healthSectionBg.strokeRoundedRect(x - 10, y - 10, 270, 240, 12);
    
    // Add subtle inner glow
    const healthGlow = this.add.graphics();
    healthGlow.lineStyle(1, 0xff0000, 0.3);
    healthGlow.strokeRoundedRect(x - 7, y - 7, 264, 234, 9);
    
    this.uiContainer.add([healthSectionBg, healthGlow]);
    
    // Enhanced health header with glow effect
    const healthIcon = this.add.text(x, y, "❤️", {
      fontSize: "24px",
      fontStyle: "bold"
    });
    healthIcon.setShadow(1, 1, '#ff0000', 3, false, true);
    
    const healthLabel = this.add.text(x + 35, y + 2, "HEALTH", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    healthLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Enhanced health value with larger font
    this.healthText = this.add.text(x + 35, y + 26, "120/120", {
      fontFamily: "dungeon-mode",
      fontSize: "18px",
      color: "#ff3333",
      fontStyle: "bold"
    });
    this.healthText.setShadow(2, 2, '#000000', 3, false, true);
    
    // Enhanced health bar with better styling
    const healthBarContainer = this.add.graphics();
    healthBarContainer.fillStyle(0x1a1a1a, 0.9);
    healthBarContainer.lineStyle(2, 0x666666, 1);
    healthBarContainer.fillRoundedRect(x, y + 55, 250, 24, 12);
    healthBarContainer.strokeRoundedRect(x, y + 55, 250, 24, 12);
    this.uiContainer.add(healthBarContainer);
    
    this.healthBar = this.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    // Enhanced separator with gradient effect
    const healthSeparator = this.add.graphics();
    healthSeparator.lineStyle(2, 0x666666, 0.6);
    healthSeparator.beginPath();
    healthSeparator.moveTo(x - 5, y + 88);
    healthSeparator.lineTo(x + 255, y + 88);
    healthSeparator.closePath();
    healthSeparator.strokePath();
    this.uiContainer.add(healthSeparator);
    
    // Enhanced currency display with wider container to prevent overlap
    const currencyBg = this.add.graphics();
    currencyBg.fillGradientStyle(0x1a1a00, 0x1a1a00, 0x000000, 0x000000, 0.95);
    currencyBg.lineStyle(2, 0xffd700, 0.9);
    currencyBg.fillRoundedRect(x, y + 98, 250, 45, 8);
    currencyBg.strokeRoundedRect(x, y + 98, 250, 45, 8);
    
    // Add currency inner glow
    const currencyGlow = this.add.graphics();
    currencyGlow.lineStyle(1, 0xffd700, 0.3);
    currencyGlow.strokeRoundedRect(x + 2, y + 100, 246, 41, 6);
    
    this.uiContainer.add([currencyBg, currencyGlow]);
    
    const gintoIcon = this.add.text(x + 10, y + 108, "💰", {
      fontSize: "20px"
    });
    gintoIcon.setShadow(1, 1, '#ffd700', 2, false, true);
    
    const gintoLabel = this.add.text(x + 38, y + 103, "GINTO", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "12px",
      color: "#ffd700",
      fontStyle: "bold"
    });
    gintoLabel.setShadow(1, 1, '#000000', 2, false, true);
    
    this.currencyText = this.add.text(x + 38, y + 120, "100", {
      fontFamily: "dungeon-mode",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Enhanced separator
    const currencySeparator = this.add.graphics();
    currencySeparator.lineStyle(2, 0x666666, 0.6);
    currencySeparator.beginPath();
    currencySeparator.moveTo(x - 5, y + 152);
    currencySeparator.lineTo(x + 255, y + 152);
    currencySeparator.closePath();
    currencySeparator.strokePath();
    this.uiContainer.add(currencySeparator);
    
    // Enhanced Landás meter
    this.createLandasMeter(x, y + 162, 250, 28);
    
    this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel]);
  }

  /**
   * Create grid-based inventory section (4x2 grid like reference image)
   */
  private createGridInventorySection(x: number, y: number): void {
    const slotSize = 50;
    const slotSpacing = 8; // Reduced back to reasonable spacing
    const slotsPerRow = 4;
    const rows = 2;
    
    // Create inventory grid background with proper size calculation
    const gridPadding = 10;
    const gridWidth = slotsPerRow * slotSize + (slotsPerRow - 1) * slotSpacing + (gridPadding * 2);
    const gridHeight = rows * slotSize + (rows - 1) * slotSpacing + (gridPadding * 2);
    
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x000000, 0.9);
    gridBg.lineStyle(2, 0x444444, 1);
    gridBg.fillRoundedRect(x - gridPadding, y - gridPadding, gridWidth, gridHeight, 10);
    gridBg.strokeRoundedRect(x - gridPadding, y - gridPadding, gridWidth, gridHeight, 10);
    this.uiContainer.add(gridBg);
    
    // Create section header positioned properly above the grid
    const relicsHeaderBg = this.add.graphics();
    relicsHeaderBg.fillStyle(0x000000, 0.9);
    relicsHeaderBg.fillRoundedRect(x - 5, y - 35, 100, 25, 6);
    this.uiContainer.add(relicsHeaderBg);
    
    const relicsTitle = this.add.text(x, y - 22, "RELICS", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    this.uiContainer.add(relicsTitle);
    this.uiContainer.add(gridBg);
    
    // Create inventory slots with proper spacing
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = x + col * (slotSize + slotSpacing);
        const slotY = y + row * (slotSize + slotSpacing);
        
        // Create slot background
        const slotBg = this.add.graphics();
        slotBg.fillStyle(0x222222, 0.9);
        slotBg.lineStyle(1, 0x555555, 1);
        slotBg.fillRoundedRect(slotX, slotY, slotSize, slotSize, 6);
        slotBg.strokeRoundedRect(slotX, slotY, slotSize, slotSize, 6);
        this.uiContainer.add(slotBg);
      }
    }
    
    // Create relics container for the grid
    this.relicsContainer = this.add.container(x, y);
    this.uiContainer.add(this.relicsContainer);
  }

  /**
   * Create bottom actions section for potions and controls
   */
  private createBottomActionsSection(x: number, y: number): void {
    // Create potions section title with much more spacing above
    const potionsTitle = this.add.text(x - 5, y - 50, "POTIONS", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.uiContainer.add(potionsTitle);
    
    // Create Persona-style potions section background - adjusted size
    const potionsBg = this.add.graphics();
    potionsBg.fillStyle(0x000000, 0.85); // Black background
    potionsBg.lineStyle(2, 0xff0000, 1); // Red border
    potionsBg.fillRoundedRect(x - 10, y - 10, 140, 60, 8); // Width calculated for 3 slots properly
    potionsBg.strokeRoundedRect(x - 10, y - 10, 140, 60, 8);
    this.uiContainer.add(potionsBg);
    
    // Potions section with 3 slots - calculate spacing to fit properly
    const potionSlotSize = 38; // Slightly smaller slots
    const totalSlotsWidth = 3 * potionSlotSize; // 114px
    const availableWidth = 120; // Background width (140) minus padding (20)
    const totalSpacingWidth = availableWidth - totalSlotsWidth; // 6px total
    const potionSpacing = totalSpacingWidth / 2; // 3px between slots
    
    // Create Persona-style potion slots with proper spacing
    for (let i = 0; i < 3; i++) {
      const slotX = x + i * (potionSlotSize + potionSpacing);
      const slotY = y;
      
      // Create Persona-style slot background
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x1a1a1a, 0.9); // Dark gray background
      slotBg.lineStyle(1, 0xff0000, 1); // Red border
      slotBg.fillRoundedRect(slotX, slotY, potionSlotSize, potionSlotSize, 6);
      slotBg.strokeRoundedRect(slotX, slotY, potionSlotSize, potionSlotSize, 6);
      this.uiContainer.add(slotBg);
    }
    
    // Create potions container
    this.potionsContainer = this.add.container(x, y);
    this.uiContainer.add(this.potionsContainer);
  }

  /**
   * Create a Persona-style Landás meter display
   */
  private createLandasMeter(x: number, y: number, width: number, height: number): void {
    // Enhanced "LANDAS" label positioned above the meter
    const landasLabel = this.add.text(x + width / 2, y - 5, "LANDAS", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 1);
    landasLabel.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(landasLabel);
    
    // Enhanced meter background with gradient
    const meterBg = this.add.graphics();
    meterBg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x000000, 0x000000, 0.95);
    meterBg.lineStyle(2, 0x666666, 0.8);
    meterBg.fillRoundedRect(x, y, width, height, 6);
    meterBg.strokeRoundedRect(x, y, width, height, 6);
    
    // Add inner border for depth
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(1, 0x444444, 0.5);
    innerBorder.strokeRoundedRect(x + 1, y + 1, width - 2, height - 2, 5);
    
    this.uiContainer.add([meterBg, innerBorder]);
    
    // Enhanced gradient meter fill with smoother transition
    const gradientFill = this.add.graphics();
    // Conquest side with enhanced red gradient
    gradientFill.fillGradientStyle(0xff0000, 0xdc143c, 0xb71c1c, 0x8b0000, 0.7);
    gradientFill.fillRoundedRect(x + 2, y + 2, (width - 4) / 2, height - 4, 4);
    
    // Mercy side with enhanced blue gradient
    gradientFill.fillGradientStyle(0x0080ff, 0x1e90ff, 0x4169e1, 0x0047ab, 0.7);
    gradientFill.fillRoundedRect(x + 2 + (width - 4) / 2, y + 2, (width - 4) / 2, height - 4, 4);
    
    this.uiContainer.add(gradientFill);
    
    // Enhanced indicator line with glow effect
    this.landasMeterIndicator = this.add.graphics();
    this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
    this.landasMeterIndicator.beginPath();
    this.landasMeterIndicator.moveTo(x + width / 2, y);
    this.landasMeterIndicator.lineTo(x + width / 2, y + height);
    this.landasMeterIndicator.closePath();
    this.landasMeterIndicator.strokePath();
    
    // Add glow effect to indicator
    const indicatorGlow = this.add.graphics();
    indicatorGlow.lineStyle(1, 0xffffff, 0.4);
    indicatorGlow.beginPath();
    indicatorGlow.moveTo(x + width / 2, y);
    indicatorGlow.lineTo(x + width / 2, y + height);
    indicatorGlow.closePath();
    indicatorGlow.strokePath();
    
    this.uiContainer.add([this.landasMeterIndicator, indicatorGlow]);
    
    // Enhanced labels with better positioning and smaller font
    const conquestLabel = this.add.text(x + 8, y + height / 2, "CONQUEST", {
      fontFamily: "dungeon-mode",
      fontSize: "8px",
      color: "#ff6b6b",
      fontStyle: "bold"
    }).setOrigin(0, 0.5);
    conquestLabel.setShadow(1, 1, '#000000', 1, false, true);
    
    const mercyLabel = this.add.text(x + width - 8, y + height / 2, "MERCY", {
      fontFamily: "dungeon-mode",
      fontSize: "8px",
      color: "#74c0fc",
      fontStyle: "bold"
    }).setOrigin(1, 0.5);
    mercyLabel.setShadow(1, 1, '#000000', 1, false, true);
    
    this.uiContainer.add([conquestLabel, mercyLabel]);
    
    // Enhanced value text - positioned in center
    this.landasText = this.add.text(x + width / 2, y + height / 2, "0", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    this.landasText.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(this.landasText);
  }

  /**
   * Create a small button (He Is Coming style) for UI actions
   */
  private createSmallButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const padding = 8;
    const buttonWidth = 70;
    const buttonHeight = 20;
    
    const background = this.add.graphics();
    background.fillStyle(0x333333, 0.9);
    background.lineStyle(1, 0x555555, 1);
    background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
    background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      background.clear();
      background.fillStyle(0x555555, 0.9);
      background.lineStyle(1, 0x777777, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      buttonText.setColor('#ffff00');
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(0x333333, 0.9);
      background.lineStyle(1, 0x555555, 1);
      background.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      background.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 3);
      buttonText.setColor('#ffffff');
    });
    
    return button;
  }

  /**
   * Create a small button for potion actions with consistent square design
   */
  private createSmallPotionButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    const buttonSize = 12;
    const background = this.add.graphics();
    background.fillStyle(color, 0.8);
    background.lineStyle(1, 0xffffff, 0.6);
    background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
    background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '7px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      background.clear();
      background.fillStyle(color, 0.95);
      background.lineStyle(1, 0xffffff, 0.8);
      background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      buttonText.setColor('#ffff00');
    });
    button.on('pointerout', () => {
      background.clear();
      background.fillStyle(color, 0.8);
      background.lineStyle(1, 0xffffff, 0.6);
      background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
      buttonText.setColor('#ffffff');
    });
    
    return button;
  }

  /**
   * Create tooltip for items (relics, potions) in refined game-like style
   */
  private createItemTooltip(targetObject: Phaser.GameObjects.Text, title: string, description: string): void {
    const tooltip = this.add.container(0, 0).setVisible(false).setDepth(2000);
    const tooltipBg = this.add.graphics();
    tooltipBg.fillStyle(0x000000, 0.85);
    tooltipBg.lineStyle(0.5, 0x555555);
    
    const tooltipText = this.add.text(0, 0, `${title}\n${description}`, {
      fontFamily: "dungeon-mode",
      fontSize: "9px",
      color: "#ffffff",
      wordWrap: { width: 160 },
      align: "center"
    }).setOrigin(0.5);
    
    const bounds = tooltipText.getBounds();
    tooltipBg.fillRoundedRect(-bounds.width/2 - 6, -bounds.height/2 - 3, bounds.width + 12, bounds.height + 6, 3);
    tooltipBg.strokeRoundedRect(-bounds.width/2 - 6, -bounds.height/2 - 3, bounds.width + 12, bounds.height + 6, 3);
    
    tooltip.add([tooltipBg, tooltipText]);
    this.uiContainer.add(tooltip);
    
    targetObject.on('pointerover', () => {
      const globalPos = targetObject.getWorldTransformMatrix();
      tooltip.setPosition(globalPos.tx + 20, globalPos.ty - 20);
      tooltip.setVisible(true);
    });
    
    targetObject.on('pointerout', () => {
      tooltip.setVisible(false);
    });
  }

  /**
   * Create discard charges display
   */
  private createDiscardChargesUI(): void {
    // Removed discard charges display as requested
  }

  /**
   * Create relics display
   */
  private createRelicsUI(): void {
    const relicsY = 70;
    
    // Relics label
    const relicsLabel = this.add.text(15, relicsY, "Relics:", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    this.uiContainer.add(relicsLabel);
    
    // Create relics container with proper positioning to avoid overlap
    this.relicsContainer = this.add.container(75, relicsY + 40);
    this.uiContainer.add(this.relicsContainer);
    
    // Create relic inventory button
    this.relicInventoryButton = this.createInventoryButton(250, relicsY, "Relics", () => {
      this.showRelicInventory();
    });
    this.uiContainer.add(this.relicInventoryButton);
  }

  /**
   * Create a button to open inventory with consistent square design
   */
  private createInventoryButton(x: number, y: number, text: string, callback: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);
    
    // Create a temporary text object to measure the actual text width
    const tempText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff'
    });
    
    // Get the actual width of the text
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy(); // Remove the temporary text
    
    // Set button dimensions with proper padding
    const padding = 10;
    const buttonWidth = Math.max(60, textWidth + padding); // Minimum width of 60px
    const buttonHeight = Math.max(20, textHeight + 5); // Minimum height of 20px
    
    // Create button background with consistent square design
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x333333, 0.9);
    buttonBg.lineStyle(1, 0xffffff, 1);
    buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    
    const buttonText = this.add.text(0, 0, text, {
      fontFamily: 'dungeon-mode',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([buttonBg, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
    
    button.on('pointerdown', callback);
    button.on('pointerover', () => {
      // Highlight button on hover
      buttonBg.clear();
      buttonBg.fillStyle(0x555555, 0.9);
      buttonBg.lineStyle(1, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    });
    button.on('pointerout', () => {
      // Reset button style
      buttonBg.clear();
      buttonBg.fillStyle(0x333333, 0.9);
      buttonBg.lineStyle(1, 0xffffff, 1);
      buttonBg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
      buttonBg.strokeRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, 4);
    });
    
    return button;
  }

  /**
   * Update all overworld UI elements
   */
  private updateOverworldUI(): void {
    this.updateHealthBar();
    this.updateCurrencyDisplay();
    this.updateRelicsDisplay();
    this.updatePotionsDisplay();
  }

  /**
   * Update health bar display for retro style
   */
  private updateHealthBar(): void {
    if (!this.healthBar || !this.healthText) return;
    
    const healthPercent = this.playerData.currentHealth / this.playerData.maxHealth;
    
    this.healthBar.clear();
    
    // Update health text
    this.healthText.setText(`${this.playerData.currentHealth}/${this.playerData.maxHealth}`);
    
    // Change text color based on health level
    if (healthPercent < 0.25) {
      this.healthText.setColor('#ff0000');
    } else if (healthPercent < 0.5) {
      this.healthText.setColor('#ffff00');
    } else {
      this.healthText.setColor('#ffffff');
    }
  }

  /**
   * Update currency display for retro style with gold only
   */
  private updateCurrencyDisplay(): void {
    this.currencyText.setText(`${this.playerData.ginto}`);
  }

  /**
   * Update Landás score display
   */
  private updateLandasDisplay(): void {
    const score = this.playerData.landasScore;
    let color = "#9370db";
    
    if (score >= 5) {
      color = "#87ceeb";
    } else if (score <= -5) {
      color = "#ff6347";
    }
    
    // Update the meter indicator position based on score
    // Score ranges from -10 to +10, map to 0-250 (meter width)
    const meterWidth = 250;
    // Calculate dynamic coordinates matching the layout
    const screenHeight = this.cameras.main.height;
    const panelHeight = 700;
    const panelY = screenHeight / 2 - panelHeight / 2;
    const meterX = 45; // panelX + 20 + 5 = 20 + 20 + 5 = 45
    const meterY = panelY + 60 + 148 + 10; // panelY + health section offset + landas meter offset + padding
    const normalizedScore = (score + 10) / 20; // Normalize to 0-1
    const indicatorX = meterX + (normalizedScore * meterWidth);
    
    // Update indicator position
    if (this.landasMeterIndicator) {
      this.landasMeterIndicator.clear();
      this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
      this.landasMeterIndicator.beginPath();
      this.landasMeterIndicator.moveTo(indicatorX, meterY);
      this.landasMeterIndicator.lineTo(indicatorX, meterY + 20);
      this.landasMeterIndicator.closePath();
      this.landasMeterIndicator.strokePath();
    }
    
    // Update text display
    this.landasText.setText(`${score >= 0 ? '+' : ''}${score}`);
    this.landasText.setColor(color);
  }

  /**
   * Update relics display with modern Persona-style design
   */
  private updateRelicsDisplay(): void {
    console.log('🎯 updateRelicsDisplay called with', this.playerData.relics.length, 'relics');
    console.log('🎯 Player relics:', this.playerData.relics.map(r => r.name || r.id));
    this.relicsContainer.removeAll(true);
    
    const slotSize = 60; // Match the new retro slot size  
    const slotSpacing = 10; // Match the new retro spacing
    const slotsPerRow = 3; // 3x2 grid (3 columns, 2 rows)
    const maxRelics = 6; // 3x2 grid total
    
    // Calculate total grid dimensions for reference
    const totalGridWidth = (slotsPerRow * slotSize) + ((slotsPerRow - 1) * slotSpacing); // 213px total for 45px slots
    const totalGridHeight = (2 * slotSize) + (1 * slotSpacing); // 102px total for 45px slots
    
    // Position relics relative to the container (which is already at gridStartX, gridStartY)
    // No offset needed since container is positioned correctly
    
    for (let i = 0; i < Math.min(this.playerData.relics.length, maxRelics); i++) {
      const relic = this.playerData.relics[i];
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;
      
      // Position relative to container origin - matches slot positioning exactly
      const relicX = col * (slotSize + slotSpacing);
      const relicY = row * (slotSize + slotSpacing);
      
      // Create modern Persona-style relic container
      const relicContainer = this.add.container(relicX, relicY);
      // Don't set depth here - let it inherit from parent uiContainer
      
      // Relic background with modern gradient (no border)
      const relicBg = this.add.graphics();
      relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
      relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
      
      // Inner glow effect (subtle, no blue)
      const innerGlow = this.add.graphics();
      innerGlow.lineStyle(1, 0x333344, 0.4);
      innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      
      // Get sprite key for this relic
      const spriteKey = getRelicSpriteKey(relic.id);
      
      // Relic icon with size adjusted for 45px slots
      let relicIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
      
      if (spriteKey && this.textures.exists(spriteKey)) {
        // Use sprite if available
        relicIcon = this.add.image(slotSize/2, slotSize/2, spriteKey)
          .setOrigin(0.5)
          .setDisplaySize(48, 48); // Fit within 60px slot with some padding
      } else {
        // Fallback to emoji if sprite not found
        relicIcon = this.add.text(slotSize/2, slotSize/2, relic.emoji, {
          fontSize: "24px",
          align: "center"
        }).setOrigin(0.5);
        (relicIcon as Phaser.GameObjects.Text).setShadow(1, 1, '#000000', 2, false, true);
      }
      
      relicContainer.add([relicBg, innerGlow, relicIcon]);
      
      // Create hover tooltip container (initially hidden)
      const tooltipContainer = this.add.container(slotSize/2, -50);
      
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x0a0a0a, 0.95);
      tooltipBg.lineStyle(2, 0x00d4ff, 1);
      
      const tooltipText = this.add.text(0, 0, relic.name, {
        fontFamily: "dungeon-mode",
        fontSize: "12px",
        color: "#00d4ff",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: 180 }
      }).setOrigin(0.5);
      tooltipText.setShadow(1, 1, '#000000', 2, false, true);
      
      // Dynamically size tooltip based on text with max width constraint
      const textBounds = tooltipText.getBounds();
      const tooltipWidth = Math.min(Math.max(textBounds.width + 16, 80), 200);
      const tooltipHeight = textBounds.height + 12;
      
      tooltipBg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
      tooltipBg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
      
      tooltipContainer.add([tooltipBg, tooltipText]);
      tooltipContainer.setVisible(false);
      tooltipContainer.setAlpha(0);
      
      relicContainer.add(tooltipContainer);
      
      // Make the entire container interactive with proper hit area
      relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      
      // Debug: Log interactive setup
      console.log('🎯 Setting up interactive for:', relic.name, {
        position: { x: relicX, y: relicY },
        hitArea: { width: slotSize, height: slotSize },
        inputEnabled: relicContainer.input?.enabled,
        depth: relicContainer.depth
      });
      
      // Enable input events
      relicContainer.input!.enabled = true;
      
      // Set proper interactivity for the relic container
      relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      relicContainer.setScrollFactor(0); // Ensure container stays screen-fixed
      relicContainer.setDepth(15); // Higher than slots but lower than tooltips
      
      console.log(`🎯 Making relic container interactive at (${relicX}, ${relicY}) with size ${slotSize}x${slotSize}`);
      relicContainer.on('pointerover', () => {
        console.log('🔥 Relic hover START:', relic.name);
        
        // Enhanced background on hover
        relicBg.clear();
        relicBg.fillGradientStyle(0x2a2a4e, 0x2a2a4e, 0x1f2439, 0x1f2439, 1);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Scale animation
        this.tweens.add({
          targets: relicContainer,
          scale: 1.1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Show tooltip
        const tooltipY = -60;
        tooltipContainer.setPosition(slotSize/2, tooltipY);
        tooltipContainer.setVisible(true);
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        this.input.setDefaultCursor('pointer');
      });
      
      relicContainer.on('pointerout', () => {
        console.log('❄️ Relic hover END:', relic.name);
        
        // Restore original background
        relicBg.clear();
        relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Scale back to normal
        this.tweens.add({
          targets: relicContainer,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        // Hide tooltip
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
        
        this.input.setDefaultCursor('default');
      });
      
      relicContainer.on('pointerdown', () => {
        console.log('�️ Relic CLICKED:', relic.name);
        this.showRelicDetails(relic);
      });
      
      // Modern hover effects
      relicContainer.on('pointerover', () => {
        console.log('🔥 Relic hover START:', relic.name, 'at position:', relicX, relicY); // Enhanced debug log
        
        // Enhanced background on hover (no blue border)
        relicBg.clear();
        relicBg.fillGradientStyle(0x2a2a4e, 0x2a2a4e, 0x1f2439, 0x1f2439, 1);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Enhanced glow (subtle highlight)
        innerGlow.clear();
        innerGlow.lineStyle(2, 0x555566, 0.8);
        innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale animation
        this.tweens.add({
          targets: relicContainer,
          scale: 1.1,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Position tooltip above the relic
        tooltipContainer.y = -tooltipHeight - 10;
        
        // Show tooltip with fade in and slide up animation
        tooltipContainer.setVisible(true);
        tooltipContainer.y += 10; // Start slightly below the final position
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 1,
          y: -tooltipHeight - 10,
          duration: 200,
          ease: 'Back.easeOut'
        });
        
        // Change cursor
        this.input.setDefaultCursor('pointer');
      });
      
      relicContainer.on('pointerout', () => {
        console.log('❄️ Relic hover END:', relic.name); // Enhanced debug log
        
        // Restore original background (no blue border)
        relicBg.clear();
        relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
        
        // Restore glow (subtle)
        innerGlow.clear();
        innerGlow.lineStyle(1, 0x333344, 0.4);
        innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale back to normal
        this.tweens.add({
          targets: relicContainer,
          scale: 1,
          duration: 200,
          ease: 'Power2'
        });
        
        // Hide tooltip with fade out and slide down animation
        this.tweens.add({
          targets: tooltipContainer,
          alpha: 0,
          y: -tooltipHeight,
          duration: 200,
          ease: 'Power2',
          onComplete: () => {
            tooltipContainer.setVisible(false);
          }
        });
        
        // Reset cursor
        this.input.setDefaultCursor('default');
      });
      
      
      // Removed duplicate click handler - keeping the main one at the end
      
      // Debug: Add visual indicator that container is interactive
      relicContainer.on('pointerup', () => {
        console.log('✋ Relic pointer UP:', relic.name);
      });
      
      // Add simple test event to verify input works at all
      relicContainer.on('pointermove', () => {
        console.log('🚀 BASIC MOVE EVENT for:', relic.name);
      });
      
      // Add subtle debug border to show interactive area (can be removed later)
      const debugBorder = this.add.graphics();
      debugBorder.lineStyle(1, 0x00ff00, 0.3);
      debugBorder.strokeRoundedRect(0, 0, slotSize, slotSize, 8);
      relicContainer.add(debugBorder);
      
      // Calculate world position for debugging
      const worldPos = relicContainer.parentContainer ? 
        relicContainer.parentContainer.getWorldTransformMatrix().transformPoint(relicX, relicY) :
        { x: relicX, y: relicY };
      
      console.log('✅ Created interactive relic:', relic.name, {
        localPos: { x: relicX, y: relicY },
        worldPos: worldPos,
        containerDepth: relicContainer.depth,
        parentDepth: this.relicsContainer.depth,
        uiContainerDepth: this.uiContainer.depth,
        inputEnabled: relicContainer.input?.enabled
      });
      
      this.relicsContainer.add(relicContainer);
    }
  }

  /**
   * Update potions display in bottom action slots
   */
  /**
   * Update potions display in retro horizontal layout
   */
  private updatePotionsDisplay(): void {
    if (!this.potionsContainer) return;
    
    this.potionsContainer.removeAll(true);
    
    const slotSize = 60; // Match retro potion slot size
    const slotSpacing = 10; // Match retro spacing
    const maxPotions = 3;
    
    for (let i = 0; i < Math.min(this.playerData.potions.length, maxPotions); i++) {
      const potion = this.playerData.potions[i];
      const potionX = i * (slotSize + slotSpacing);
      const potionY = 0;
      
      // Create potion background
      const potionBg = this.add.graphics();
      potionBg.fillStyle(0x333333, 1.0);
      potionBg.lineStyle(1, 0xaaaaaa, 1.0);
      potionBg.fillRect(potionX, potionY, slotSize, slotSize);
      potionBg.strokeRect(potionX, potionY, slotSize, slotSize);
      
      // Potion icon (use heal_potion image instead of emoji)
  const potionIcon = this.add.image(potionX + slotSize/2, potionY + slotSize/2, "heal_potion").setOrigin(0.5);
  potionIcon.setDisplaySize(48, 48); // Fit within 60px slot
      
      this.potionsContainer.add([potionBg, potionIcon]);
      
      // Make interactive
      const hitArea = new Phaser.Geom.Rectangle(potionX, potionY, slotSize, slotSize);
      potionIcon.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
      
      potionIcon.on('pointerover', () => {
        this.createItemTooltip(potionIcon, potion.name, potion.description);
      });
      
      potionIcon.on('pointerout', () => {
        // Remove tooltip
        this.children.getChildren().forEach(child => {
          if (child.getData && child.getData('tooltip')) {
            child.destroy();
          }
        });
      });
    }
  }

  /**
   * Update deck info display
   */
  private updateDeckInfoDisplay(): void {
    const totalCards = this.playerData.deck.length;
    const handSize = this.playerData.hand.length;
    const discardSize = this.playerData.discardPile.length;
    
    const deckInfo = `Total Cards: ${totalCards}\nHand: ${handSize}\nDiscard: ${discardSize}\nDiscard Charges: ${this.playerData.discardCharges}/${this.playerData.maxDiscardCharges}`;
    
    this.deckInfoText.setText(deckInfo);
  }

  /**
   * Create potions display with use/discard functionality
   */
  private createPotionsUI(): void {
    const potionsY = 100;
    
    // Potions label
    const potionsLabel = this.add.text(15, potionsY, "Potions:", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff"
    });
    this.uiContainer.add(potionsLabel);
    
    // Create potions container
    this.potionsContainer = this.add.container(85, potionsY);
    this.uiContainer.add(this.potionsContainer);
    
    // Create potion inventory button
    this.potionInventoryButton = this.createInventoryButton(250, potionsY, "Potions", () => {
      this.showPotionInventory();
    });
    this.uiContainer.add(this.potionInventoryButton);
  }

  /**
   * Use a potion from inventory
   */
  private usePotion(index: number): void {
    if (index < 0 || index >= this.playerData.potions.length) {
      return;
    }
    
    const potion = this.playerData.potions[index];
    
    // Apply potion effects
    switch (potion.effect) {
      case "draw_3_cards":
        // For overworld, we could show a visual effect
        this.showPotionEffect("💙 Clarity potion will draw 3 cards in next combat!");
        break;
        
      case "gain_15_block":
        this.showPotionEffect("🛡️ Fortitude potion will grant 15 block in next combat!");
        break;
        
      case "gain_1_dexterity":
        this.showPotionEffect("💨 Swift potion will grant +1 Dexterity in next combat!");
        break;
        
      case "choose_element":
        this.showPotionEffect("🌈 Elements potion will let you choose dominant element!");
        break;
        
      default:
        this.showPotionEffect(`Used ${potion.name}!`);
    }
    
    // Remove potion from inventory
    this.playerData.potions.splice(index, 1);
    this.updatePotionsDisplay();
  }

  /**
   * Discard a potion from inventory
   */
  private discardPotion(index: number): void {
    if (index < 0 || index >= this.playerData.potions.length) {
      return;
    }
    
    const potion = this.playerData.potions[index];
    this.showPotionEffect(`Discarded ${potion.name}`);
    
    // Remove potion from inventory
    this.playerData.potions.splice(index, 1);
    this.updatePotionsDisplay();
  }

  /**
   * Show visual feedback for potion actions
   */
  private showPotionEffect(message: string): void {
    const effectText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      message,
      {
        fontFamily: "dungeon-mode",
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Animate the text
    effectText.setScale(0.1);
    this.tweens.add({
      targets: effectText,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Fade out after delay
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: effectText,
        alpha: 0,
        scale: 1.2,
        duration: 500,
        onComplete: () => {
          effectText.destroy();
        }
      });
    });
  }

  /**
   * Show relic inventory in a modal window
   */
  private showRelicInventory(): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(3000);
    
    // Create inventory window
    const windowWidth = 600;
    const windowHeight = 400;
    const inventoryWindow = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(3001);
    
    // Create window background
    const windowBg = this.add.graphics();
    windowBg.fillStyle(0x1a1a1a, 0.95);
    windowBg.lineStyle(3, 0x4a4a4a);
    windowBg.fillRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    windowBg.strokeRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    
    // Create title
    const title = this.add.text(0, -windowHeight/2 + 30, "Relic Inventory", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Create relic grid
    const relicGrid = this.add.container(0, 0);
    const relicSize = 60;
    const relicsPerRow = 6;
    const padding = 20;
    
    this.playerData.relics.forEach((relic, index) => {
      const row = Math.floor(index / relicsPerRow);
      const col = index % relicsPerRow;
      
      const x = col * (relicSize + padding) - (relicsPerRow - 1) * (relicSize + padding) / 2;
      const y = row * (relicSize + padding) - 20;
      
      // Create relic square with improved styling
      const relicSquare = this.add.container(x, y);
      const squareBg = this.add.graphics();
      squareBg.fillStyle(0x333333);
      squareBg.lineStyle(2, 0x555555);
      squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
      squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
      
      // Get sprite key for this relic
      const spriteKey = getRelicSpriteKey(relic.id);
      
      // Create relic icon
      let relicIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
      
      if (spriteKey && this.textures.exists(spriteKey)) {
        // Use sprite if available
        relicIcon = this.add.image(0, 0, spriteKey)
          .setOrigin(0.5)
          .setDisplaySize(48, 48); // Fit within 60px slot
      } else {
        // Fallback to emoji if sprite not found
        relicIcon = this.add.text(0, 0, relic.emoji, {
          fontSize: "32px"
        }).setOrigin(0.5);
      }
      
      // Create tooltip
      const tooltip = this.add.container(0, -70).setVisible(false);
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x000000, 0.9);
      tooltipBg.lineStyle(2, 0x4a4a4a);
      
      const tooltipText = this.add.text(0, 0, `${relic.name}
${relic.description}`, {
        fontFamily: "dungeon-mode",
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: 200 },
        align: "center"
      }).setOrigin(0.5);
      
      const bounds = tooltipText.getBounds();
      tooltipBg.fillRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      tooltipBg.strokeRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      
      tooltip.add([tooltipBg, tooltipText]);
      
      relicSquare.add([squareBg, relicIcon, tooltip]);
      
      // Add hover events
      relicSquare.setInteractive(new Phaser.Geom.Rectangle(-relicSize/2, -relicSize/2, relicSize, relicSize), Phaser.Geom.Rectangle.Contains);
      relicSquare.on('pointerover', () => {
        squareBg.clear();
        squareBg.fillStyle(0x555555);
        squareBg.lineStyle(2, 0x777777);
        squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        tooltip.setVisible(true);
      });
      
      relicSquare.on('pointerout', () => {
        squareBg.clear();
        squareBg.fillStyle(0x333333);
        squareBg.lineStyle(2, 0x555555);
        squareBg.fillRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        squareBg.strokeRoundedRect(-relicSize/2, -relicSize/2, relicSize, relicSize, 5);
        tooltip.setVisible(false);
      });
      
      relicGrid.add(relicSquare);
    });
    
    // Create close button
    const closeBtn = this.add.container(windowWidth/2 - 30, -windowHeight/2 + 30);
    const closeBtnBg = this.add.graphics();
    closeBtnBg.fillStyle(0xaa0000, 0.8);
    closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    const closeBtnText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff"
    }).setOrigin(0.5);
    closeBtn.add([closeBtnBg, closeBtnText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      inventoryWindow.destroy();
    });
    closeBtn.on('pointerover', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xff0000, 0.9);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    closeBtn.on('pointerout', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xaa0000, 0.8);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    
    inventoryWindow.add([windowBg, title, relicGrid, closeBtn]);
  }

  /**
   * Show potion inventory in a modal window
   */
  private showPotionInventory(): void {
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(3000);
    
    // Create inventory window
    const windowWidth = 600;
    const windowHeight = 400;
    const inventoryWindow = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    ).setScrollFactor(0).setDepth(3001);
    
    // Create window background
    const windowBg = this.add.graphics();
    windowBg.fillStyle(0x1a1a1a, 0.95);
    windowBg.lineStyle(3, 0x4a4a4a);
    windowBg.fillRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    windowBg.strokeRoundedRect(-windowWidth/2, -windowHeight/2, windowWidth, windowHeight, 10);
    
    // Create title
    const title = this.add.text(0, -windowHeight/2 + 30, "Potion Inventory", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);
    
    // Create potion grid
    const potionGrid = this.add.container(0, 0);
    const potionSize = 80;
    const potionsPerRow = 4;
    const padding = 30;
    
    this.playerData.potions.forEach((potion, index) => {
      const row = Math.floor(index / potionsPerRow);
      const col = index % potionsPerRow;
      
      const x = col * (potionSize + padding) - (potionsPerRow - 1) * (potionSize + padding) / 2;
      const y = row * (potionSize + padding) - 20;
      
      // Create potion square with improved styling
      const potionSquare = this.add.container(x, y);
      const squareBg = this.add.graphics();
      squareBg.fillStyle(0x333333);
      squareBg.lineStyle(2, 0x555555);
      squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
      squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
      
      // Create potion icon
      const potionIcon = this.add.text(0, -10, potion.emoji, {
        fontSize: "36px"
      }).setOrigin(0.5);
      
      // Create potion name
      const potionName = this.add.text(0, 25, potion.name, {
        fontFamily: "dungeon-mode",
        fontSize: "12px",
        color: "#ffffff"
      }).setOrigin(0.5);
      
      // Create tooltip
      const tooltip = this.add.container(0, -90).setVisible(false);
      const tooltipBg = this.add.graphics();
      tooltipBg.fillStyle(0x000000, 0.9);
      tooltipBg.lineStyle(2, 0x4a4a4a);
      
      const tooltipText = this.add.text(0, 0, `${potion.name}
${potion.description}`, {
        fontFamily: "dungeon-mode",
        fontSize: "14px",
        color: "#ffffff",
        wordWrap: { width: 200 },
        align: "center"
      }).setOrigin(0.5);
      
      const bounds = tooltipText.getBounds();
      tooltipBg.fillRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      tooltipBg.strokeRoundedRect(-bounds.width/2 - 10, -bounds.height/2 - 5, bounds.width + 20, bounds.height + 10, 5);
      
      tooltip.add([tooltipBg, tooltipText]);
      
      potionSquare.add([squareBg, potionIcon, potionName, tooltip]);
      
      // Add hover events
      potionSquare.setInteractive(new Phaser.Geom.Rectangle(-potionSize/2, -potionSize/2, potionSize, potionSize), Phaser.Geom.Rectangle.Contains);
      potionSquare.on('pointerover', () => {
        squareBg.clear();
        squareBg.fillStyle(0x555555);
        squareBg.lineStyle(2, 0x777777);
        squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        tooltip.setVisible(true);
      });
      
      potionSquare.on('pointerout', () => {
        squareBg.clear();
        squareBg.fillStyle(0x333333);
        squareBg.lineStyle(2, 0x555555);
        squareBg.fillRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        squareBg.strokeRoundedRect(-potionSize/2, -potionSize/2, potionSize, potionSize, 5);
        tooltip.setVisible(false);
      });
      
      potionGrid.add(potionSquare);
    });
    
    // Create close button
    const closeBtn = this.add.container(windowWidth/2 - 30, -windowHeight/2 + 30);
    const closeBtnBg = this.add.graphics();
    closeBtnBg.fillStyle(0xaa0000, 0.8);
    closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    const closeBtnText = this.add.text(0, 0, "X", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff"
    }).setOrigin(0.5);
    closeBtn.add([closeBtnBg, closeBtnText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
    closeBtn.on('pointerdown', () => {
      overlay.destroy();
      inventoryWindow.destroy();
    });
    closeBtn.on('pointerover', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xff0000, 0.9);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    closeBtn.on('pointerout', () => {
      closeBtnBg.clear();
      closeBtnBg.fillStyle(0xaa0000, 0.8);
      closeBtnBg.fillRoundedRect(-20, -20, 40, 40, 5);
    });
    
    inventoryWindow.add([windowBg, title, potionGrid, closeBtn]);
  }

  /**
   * Show detailed relic information in a popup similar to shop style
   */
  private showRelicDetails(relic: any): void {
    // Prevent multiple detail windows from opening
    if ((this as any).relicDetailsOpen) {
      console.log('🚫 Relic details already open, ignoring click');
      return;
    }
    
    (this as any).relicDetailsOpen = true;
    console.log('📖 Opening relic details for:', relic.name);
    
    // Create overlay
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000
    ).setAlpha(0.8).setScrollFactor(0).setDepth(2000);
    
    // Create relic details panel
    const panelWidth = 480;
    const panelHeight = 450;
    const panelX = this.cameras.main.width / 2;
    const panelY = this.cameras.main.height / 2;
    
    const panel = this.add.container(panelX, panelY).setScrollFactor(0).setDepth(2001);
    
    // Panel shadow for depth
    const panelShadow = this.add.graphics();
    panelShadow.fillStyle(0x000000, 0.4);
    panelShadow.fillRoundedRect(-panelWidth/2 + 8, -panelHeight/2 + 8, panelWidth, panelHeight, 20);
    
    // Main panel background with dark blue theme (matching overworld)
    const panelBg = this.add.graphics();
    panelBg.fillGradientStyle(0x1a1a2e, 0x0f1419, 0x1a1a2e, 0x0a0a0f, 0.98);
    panelBg.lineStyle(3, 0x00d4ff, 0.9);
    panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 20);
    
    // Inner highlight for modern look
    const innerHighlight = this.add.graphics();
    innerHighlight.lineStyle(2, 0x00ffff, 0.3);
    innerHighlight.strokeRoundedRect(-panelWidth/2 + 3, -panelHeight/2 + 3, panelWidth - 6, panelHeight - 6, 17);
    
    // Header section with emoji and name
    const headerBg = this.add.graphics();
    headerBg.fillGradientStyle(0x2a2a4e, 0x1a1a2e, 0x1f2439, 0x2a2a4e, 0.9);
    headerBg.fillRoundedRect(-panelWidth/2 + 10, -panelHeight/2 + 10, panelWidth - 20, 80, 15);
    
    const emojiContainer = this.add.graphics();
    emojiContainer.fillStyle(0x00d4ff, 0.2);
    emojiContainer.lineStyle(2, 0x00ffff, 0.6);
    emojiContainer.fillRoundedRect(-panelWidth/2 + 25, -panelHeight/2 + 25, 60, 60, 12);
    emojiContainer.strokeRoundedRect(-panelWidth/2 + 25, -panelHeight/2 + 25, 60, 60, 12);
    
    // Get sprite key for this relic
    const spriteKey = getRelicSpriteKey(relic.id);
    
    // Create relic icon
    let relicIcon: Phaser.GameObjects.Image | Phaser.GameObjects.Text;
    
    if (spriteKey && this.textures.exists(spriteKey)) {
      // Use sprite if available
      relicIcon = this.add.image(-panelWidth/2 + 55, -panelHeight/2 + 55, spriteKey)
        .setOrigin(0.5)
        .setDisplaySize(48, 48); // Fit within 60px container
    } else {
      // Fallback to emoji if sprite not found
      relicIcon = this.add.text(-panelWidth/2 + 55, -panelHeight/2 + 55, relic.emoji, {
        fontSize: 36,
      }).setOrigin(0.5, 0.5);
      (relicIcon as Phaser.GameObjects.Text).setShadow(2, 2, '#0a0a0f', 4, false, true);
    }
    
    // Relic name
    const name = this.add.text(-panelWidth/2 + 110, -panelHeight/2 + 45, relic.name.toUpperCase(), {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 24,
      color: "#00d4ff",
    }).setOrigin(0, 0);
    name.setShadow(2, 2, '#0a0a0f', 4, false, true);
    
    // "EQUIPPED" badge
    const equippedBadge = this.add.graphics();
    equippedBadge.fillStyle(0x00ff00, 0.9);
    equippedBadge.fillRoundedRect(panelWidth/2 - 120, -panelHeight/2 + 30, 90, 25, 12);
    
    const equippedText = this.add.text(panelWidth/2 - 75, -panelHeight/2 + 42, "EQUIPPED", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 12,
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5);
    
    // Content sections
    const contentStartY = -panelHeight/2 + 140;
    
    // Description section
    const descSection = this.add.graphics();
    descSection.fillStyle(0x1a1a2e, 0.3);
    descSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY, panelWidth - 60, 100, 8);
    
    const descTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 15, "DESCRIPTION", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#00d4ff",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const description = this.add.text(0, contentStartY + 45, relic.description, {
      fontFamily: "dungeon-mode",
      fontSize: 14,
      color: "#ffffff",
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Lore section
    const loreSection = this.add.graphics();
    loreSection.fillStyle(0x1a1a2e, 0.2);
    loreSection.fillRoundedRect(-panelWidth/2 + 30, contentStartY + 120, panelWidth - 60, 110, 8);
    
    const loreTitle = this.add.text(-panelWidth/2 + 45, contentStartY + 135, "LORE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 14,
      color: "#34d399",
      fontStyle: "bold"
    }).setOrigin(0, 0);
    
    const lore = this.getRelicLore(relic);
    const loreText = this.add.text(0, contentStartY + 165, lore, {
      fontFamily: "dungeon-mode",
      fontSize: 12,
      color: "#cccccc",
      align: "center",
      wordWrap: { width: panelWidth - 100 }
    }).setOrigin(0.5, 0);
    
    // Close button
    const closeBtn = this.add.container(panelWidth/2 - 40, -panelHeight/2 + 40);
    const closeBg = this.add.graphics();
    closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
    closeBg.lineStyle(2, 0xfca5a5, 0.8);
    closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
    closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    
    const closeText = this.add.text(0, 0, "✕", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: 16,
      color: "#ffffff",
    }).setOrigin(0.5, 0.5);
    closeText.setShadow(1, 1, '#000000', 2, false, true);
    
    closeBtn.add([closeBg, closeText]);
    closeBtn.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);
    closeBtn.on("pointerdown", () => {
      // Smooth exit animation
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          (this as any).relicDetailsOpen = false;
          overlay.destroy();
          panel.destroy();
        }
      });
    });
    
    // Close button hover effects
    closeBtn.on("pointerover", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1.1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xf87171, 0xef4444, 0xdc2626, 0xb91c1c, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 1);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    closeBtn.on("pointerout", () => {
      this.tweens.add({
        targets: closeBtn,
        scale: 1,
        duration: 100,
        ease: 'Power2'
      });
      closeBg.clear();
      closeBg.fillGradientStyle(0xef4444, 0xdc2626, 0xb91c1c, 0x991b1b, 0.95);
      closeBg.lineStyle(2, 0xfca5a5, 0.8);
      closeBg.fillRoundedRect(-15, -15, 30, 30, 8);
      closeBg.strokeRoundedRect(-15, -15, 30, 30, 8);
    });
    
    // Assemble the panel
    panel.add([panelShadow, panelBg, innerHighlight, headerBg, emojiContainer, relicIcon, name, 
              equippedBadge, equippedText, descSection, descTitle, description, 
              loreSection, loreTitle, loreText, closeBtn]);
              
    // Entrance animation
    panel.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: panel,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // Make overlay interactive to close when clicked
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.tweens.add({
        targets: panel,
        scale: 0.8,
        alpha: 0,
        duration: 200,
        ease: 'Back.easeIn',
        onComplete: () => {
          (this as any).relicDetailsOpen = false;
          overlay.destroy();
          panel.destroy();
        }
      });
    });
  }

  /**
   * Get lore text for a relic
   */
  private getRelicLore(relic: any): string {
    // Return lore based on relic ID or name
    switch(relic.id) {
      case "earthwardens_plate":
        return "Forged by the ancient Earthwardens who protected the first settlements from natural disasters. This mystical armor channels the strength of the mountains themselves, providing unwavering protection to those who wear it.";
      case "swift_wind_agimat":
        return "An enchanted talisman blessed by the spirits of the wind. It enhances the agility of its bearer, allowing them to move with the swiftness of the breeze and react faster than the eye can see.";
      case "ember_fetish":
        return "A relic imbued with the essence of volcanic fire. When the bearer's defenses are low, the fetish awakens and grants the fury of the forge, empowering them with the strength of molten rock.";
      case "babaylans_talisman":
        return "Once worn by the most revered Babaylan of the ancient tribes. This sacred talisman enhances the spiritual connection of its bearer, allowing them to channel greater power through their rituals and incantations.";
      case "echo_of_ancestors":
        return "A mystical artifact that resonates with the wisdom of those who came before. It breaks the natural limitations of the physical world, allowing for impossible feats that should not exist.";
      case "seafarers_compass":
        return "A navigational tool blessed by Lakapati, goddess of fertility and navigation. It guides the bearer through the most treacherous waters and helps them find their way even in the darkest storms.";
      default:
        return "An ancient artifact of great power, its origins lost to time but its effects undeniable. Those who wield it are forever changed by its mystical properties.";
    }
  }
  
  /**
   * Create enemy info tooltip system
   */
  private createEnemyTooltip(): void {
    console.log("Creating enemy tooltip system...");
    this.tooltipManager = new Overworld_TooltipManager(this);
    this.tooltipManager.initialize();
  }

  /**
   * Create fog of war system
   */
  private createFogOfWar(): void {
    console.log("Creating fog of war system...");
    this.fogOfWarManager = new Overworld_FogOfWarManager(this);
    this.fogOfWarManager.initialize(this.player.x, this.player.y);
    
    // Configure fog depth (all other parameters are set in FogOfWarManager)
    this.fogOfWarManager.setFogParameters({
      fogDepth: DEPTH.FOG_OF_WAR      // Above map tiles, below NPCs and UI
    });
    
    // Set initial fog state based on current day/night
    this.fogOfWarManager.updateDayNight(this.gameState.isDay);
    
    console.log("✅ Fog of war system initialized");
  }

  /**
   * Set initial UI scale to compensate for camera zoom
   * Keeps UI elements at their original size and position
   */
  private setInitialUIScale(): void {
    const cameraZoom = this.cameras.main.zoom;
    const uiScale = 1 / cameraZoom;
    
    // Get camera dimensions
    const cameraWidth = this.cameras.main.width;
    const cameraHeight = this.cameras.main.height;
    
    // Calculate position offset to keep UI in place
    const offsetX = (cameraWidth * (cameraZoom - 1)) / (2 * cameraZoom);
    const offsetY = (cameraHeight * (cameraZoom - 1)) / (2 * cameraZoom);
    
    // Scale and reposition UI container (left panel)
    if (this.uiContainer) {
      this.uiContainer.setScale(uiScale);
      this.uiContainer.setPosition(offsetX, offsetY);
    }
    
    // Day/night progress bar container - scale, center horizontally, and shift down
    if (this.dayNightProgressContainer) {
      this.dayNightProgressContainer.setScale(uiScale);
      // Horizontal: center the scaled container
      const progressBarCenterOffset = (cameraWidth * (1 - uiScale)) / 2;
      // Vertical: shift down to stay at top
      this.dayNightProgressContainer.setPosition(progressBarCenterOffset, offsetY);
      
      // Update indicator position within the container
      if (this.dayNightIndicator) {
        const progressBarWidth = cameraWidth * 0.6;
        const progressBarX = (cameraWidth - progressBarWidth) / 2;
        const progressBarY = 80;
        const totalProgress = Math.min(this.gameState.actionsTaken / this.gameState.totalActionsUntilBoss, 1);
        this.dayNightIndicator.x = progressBarX + (progressBarWidth * totalProgress);
        this.dayNightIndicator.y = progressBarY + 25;
      }
    }
    
    // Boss text (top left)
    if (this.bossText) {
      this.bossText.setScale(uiScale);
      this.bossText.setPosition(10 + offsetX, 40 + offsetY);
    }
    
    // Toggle button (top right)
    if (this.toggleButton) {
      this.toggleButton.setScale(uiScale);
      const toggleX = cameraWidth - 60 - offsetX;
      const toggleY = 50 + offsetY;
      this.toggleButton.setPosition(toggleX, toggleY);
    }
    
    // Test buttons container
    if (this.testButtonsContainer) {
      this.testButtonsContainer.setScale(uiScale);
    }
    
    // Scale action buttons
    if (this.actionButtons) {
      this.actionButtons.forEach(button => {
        button.setScale(uiScale);
      });
    }
    
    console.log(`🎮 Initial UI scale set to ${uiScale} (camera zoom: ${cameraZoom})`);
  }
}
