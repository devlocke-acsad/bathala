import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";
import { GameState } from "../../core/managers/GameState";
import { Player } from "../../core/types/CombatTypes";
import { Potion } from "../../data/potions/Act1Potions";

export class Overworld extends Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private nodes: MapNode[] = [];
  private visibleChunks: Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }> = new Map<string, { maze: number[][], graphics: Phaser.GameObjects.Graphics }>();
  private gridSize: number = 32;
  private isMoving: boolean = false;
  private isTransitioningToCombat: boolean = false;
  private gameState: OverworldGameState;
  private dayNightProgressFill!: Phaser.GameObjects.Rectangle;
  private dayNightIndicator!: Phaser.GameObjects.Triangle;
  private nightOverlay!: Phaser.GameObjects.Rectangle | null;
  private bossText!: Phaser.GameObjects.Text;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private scanlines!: Phaser.GameObjects.TileSprite;
  private scanlineTimer: number = 0;
  private shopKey!: Phaser.Input.Keyboard.Key;
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
  private diamanteText!: Phaser.GameObjects.Text;
  private landasText!: Phaser.GameObjects.Text;
  private landasMeterIndicator!: Phaser.GameObjects.Graphics;
  private deckInfoText!: Phaser.GameObjects.Text;
  private discardText!: Phaser.GameObjects.Text;
  private relicInventoryButton!: Phaser.GameObjects.Container;
  private potionInventoryButton!: Phaser.GameObjects.Container;
  private playerData: Player;

  constructor() {
    super({ key: "Overworld" });
    this.gameState = OverworldGameState.getInstance();
    
    // Initialize player data with default values or from GameState
    const gameState = GameState.getInstance();
    const savedPlayerData = gameState.getPlayerData();
    
    if (savedPlayerData) {
      this.playerData = {
        id: savedPlayerData.id || "player",
        name: savedPlayerData.name || "Hero",
        maxHealth: savedPlayerData.maxHealth || 80,
        currentHealth: savedPlayerData.currentHealth !== undefined ? savedPlayerData.currentHealth : 80,
        block: savedPlayerData.block || 0,
        statusEffects: savedPlayerData.statusEffects || [],
        hand: savedPlayerData.hand || [],
        deck: savedPlayerData.deck || [],
        discardPile: savedPlayerData.discardPile || [],
        drawPile: savedPlayerData.drawPile || [],
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
      this.playerData = {
        id: "player",
        name: "Hero",
        maxHealth: 80,
        currentHealth: 80,
        block: 0,
        statusEffects: [],
        hand: [],
        deck: [],
        discardPile: [],
        drawPile: [],
        playedHand: [],
        landasScore: 0,
        ginto: 9999,
        diamante: 20,
        relics: [],
        potions: [
          {
            id: "clarity_potion",
            name: "Potion of Clarity",
            description: "Draw 3 cards.",
            effect: "draw_3_cards",
            emoji: "🧠",
            rarity: "common" as const
          },
          {
            id: "fortitude_potion",
            name: "Elixir of Fortitude", 
            description: "Gain 15 Block.",
            effect: "gain_15_block",
            emoji: "🛡️",
            rarity: "common" as const
          }
        ],
        discardCharges: 1,
        maxDiscardCharges: 1
      };
      
      // Save initial player data to GameState
      gameState.updatePlayerData(this.playerData);
    }
  }

  create(): void {
    // Check if we're returning from another scene
    const gameState = GameState.getInstance();
    const savedPosition = gameState.getPlayerPosition();
    
    if (savedPosition) {
      // Restore player at saved position
      this.player = this.add.sprite(savedPosition.x, savedPosition.y, "overworld_player");
      // Clear the saved position so it's not used again
      gameState.clearPlayerPosition();
    } else {
      // Reset the maze generator cache for a new game
      MazeOverworldGenerator.clearCache();
      
      // Get the initial chunk to ensure player starts in a valid position
      const initialChunk = MazeOverworldGenerator.getChunk(0, 0, this.gridSize);
      
      // Find a valid starting position in the center of the initial chunk
      const chunkCenterX = Math.floor(MazeOverworldGenerator['chunkSize'] / 2);
      const chunkCenterY = Math.floor(MazeOverworldGenerator['chunkSize'] / 2);
      
      // Ensure the center position is a path
      let startX = chunkCenterX * this.gridSize + this.gridSize / 2;
      let startY = chunkCenterY * this.gridSize + this.gridSize / 2;
      
      // If center is a wall, find the nearest path
      if (initialChunk.maze[chunkCenterY][chunkCenterX] === 1) {
        // Search for nearby paths
        let foundPath = false;
        for (let distance = 1; distance < 5 && !foundPath; distance++) {
          for (let dy = -distance; dy <= distance && !foundPath; dy++) {
            for (let dx = -distance; dx <= distance && !foundPath; dx++) {
              const newY = chunkCenterY + dy;
              const newX = chunkCenterX + dx;
              if (newY >= 0 && newY < initialChunk.maze.length && 
                  newX >= 0 && newX < initialChunk.maze[0].length && 
                  initialChunk.maze[newY][newX] === 0) {
                startX = newX * this.gridSize + this.gridSize / 2;
                startY = newY * this.gridSize + this.gridSize / 2;
                foundPath = true;
              }
            }
          }
        }
      }
      
      this.player = this.add.sprite(startX, startY, "overworld_player");
    }
    
    this.player.setScale(2); // Scale up from 16x16 to 32x32
    this.player.setOrigin(0.5); // Center the sprite
    this.player.setDepth(1000); // Ensure player is above everything
    
    console.log("Playing avatar_idle_down animation");
    this.player.play("avatar_idle_down"); // Initial animation

    // Enable keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({
      'W': Phaser.Input.Keyboard.KeyCodes.W,
      'A': Phaser.Input.Keyboard.KeyCodes.A,
      'S': Phaser.Input.Keyboard.KeyCodes.S,
      'D': Phaser.Input.Keyboard.KeyCodes.D
    }) as { [key: string]: Phaser.Input.Keyboard.Key };
    
    // Add shop key (M for Mysterious Merchant)
    this.shopKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    
    // Center the camera on the player
    this.cameras.main.startFollow(this.player);
    
    // Create CRT scanline effect
    this.createCRTEffect();
    
    // Create UI elements with a slight delay to ensure camera is ready
    this.time.delayedCall(10, this.createUI, [], this);
    
    // Render initial chunks around player with a slight delay to ensure camera is ready
    this.time.delayedCall(20, this.updateVisibleChunks, [], this);

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
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
      console.log("Event action triggered");
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
        player: {
          id: "player",
          name: "Hero",
          maxHealth: 80,
          currentHealth: 80,
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
          maxHealth: 80,
          currentHealth: 80,
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
        player: {
          id: "player",
          name: "Hero",
          maxHealth: 80,
          currentHealth: 80,
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
          maxHealth: 80,
          currentHealth: 80,
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
      
      this.add.rectangle(
        segmentX,
        progressBarY,
        segmentWidth,
        4,
        isDay ? 0xFFD368 : 0x7144FF // Day or night color
      ).setAlpha(1).setScrollFactor(0).setDepth(100); // Fixed to camera with depth
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
      this.add.rectangle(
        tickX,
        progressBarY,
        4,
        16,
        color
      ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);
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
        this.add.rectangle(
          tickX,
          progressBarY,
          3,
          10,
          color
        ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102);
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
        sunIcon.setScrollFactor(0).setDepth(103);
      } else {
        // Night icon (moon) - odd positions
        const moonIcon = this.add.image(iconX, iconY, "bathala_moon_icon");
        moonIcon.setScale(1.8);
        moonIcon.setScrollFactor(0).setDepth(103);
      }
    }
    
    // Boss icon at the end, positioned above the axis line
    // Position it at the end of the progress bar
    const bossIconX = progressBarX + progressBarWidth;
    const bossIconY = progressBarY - 50; // Position above the axis line (moved down to match new position)
    const bossIcon = this.add.image(bossIconX, bossIconY, "bathala_boss_icon");
    bossIcon.setScale(2.0);
    bossIcon.setScrollFactor(0).setDepth(103);
    
    // Create player indicator (▲ symbol pointing up from below the axis line)
    this.dayNightIndicator = this.add.text(0, 0, "▲", {
      fontFamily: 'dungeon-mode-inverted',
      fontSize: '36px',
      color: '#E54646',
      align: 'center'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(104); // Fixed to camera with depth, positioned below axis line
    
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
  }
  
  hideTestButtons(): void {
    // Hide only test buttons, not essential UI elements
    this.actionButtons.forEach(button => {
      button.setVisible(false);
    });
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
    
    // Update player indicator position (below the bar)
    this.dayNightIndicator.x = progressBarX + (progressBarWidth * totalProgress);
    this.dayNightIndicator.y = progressBarY + 25; // Position below the bar
    
    // Handle night overlay
    if (!this.gameState.isDay && !this.nightOverlay) {
      // Create night overlay
      this.nightOverlay = this.add.rectangle(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000033
      ).setAlpha(0.4).setScrollFactor(0).setDepth(999);
    } else if (this.gameState.isDay && this.nightOverlay) {
      // Remove night overlay
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
  }

  // No need for resume method since we handle state restoration in create()
  
  /**
   * Called when the scene resumes from another scene
   */
  resume(): void {
    console.log("Overworld.resume() called - Re-enabling input and resetting flags");
    
    // Re-enable input when returning from other scenes
    if (this.input && this.input.keyboard) {
      this.input.keyboard.enabled = true;
      console.log("Keyboard input re-enabled");
    }
    
    this.isMoving = false;
    this.isTransitioningToCombat = false;
    console.log("Movement flags reset - isMoving:", this.isMoving, "isTransitioningToCombat:", this.isTransitioningToCombat);
    
    // Restore player position if saved
    const gameState = GameState.getInstance();
    const savedPosition = gameState.getPlayerPosition();
    if (savedPosition) {
      console.log("Restoring player position to:", savedPosition);
      this.player.setPosition(savedPosition.x, savedPosition.y);
      // Center camera on player
      this.cameras.main.startFollow(this.player);
      // Clear the saved position
      gameState.clearPlayerPosition();
    } else {
      console.log("No saved position found, keeping current position");
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
    
    console.log("Overworld.resume() completed successfully");
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
    
    switch (direction) {
      case "up":
        walkAnimation = "avatar_walk_up";
        idleAnimation = "avatar_idle_up";
        break;
      case "down":
        walkAnimation = "avatar_walk_down";
        idleAnimation = "avatar_idle_down";
        break;
      case "left":
        walkAnimation = "avatar_walk_left";
        idleAnimation = "avatar_idle_left";
        break;
      case "right":
        walkAnimation = "avatar_walk_right";
        idleAnimation = "avatar_idle_right";
        break;
    }
    
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
        duration: 150, // Slightly faster movement
        onComplete: () => {
          this.isMoving = false;
          this.checkNodeInteraction();
          
          // Record the action for day/night cycle after movement completes
          this.gameState.recordAction();
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
      ).setAlpha(0.4).setScrollFactor(0).setDepth(999);
    } else if (this.gameState.isDay && this.nightOverlay) {
      // Remove night overlay
      this.nightOverlay.destroy();
      this.nightOverlay = null;
    }
  }

  updateVisibleChunks(): void {
    // Ensure camera is available before proceeding
    if (!this.cameras || !this.cameras.main) {
      console.warn("Camera not available, skipping chunk update");
      return;
    }
    
    // Determine which chunks are visible based on camera position
    const camera = this.cameras.main;
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    
    const startX = Math.floor((camera.scrollX - chunkSizePixels) / chunkSizePixels);
    const endX = Math.ceil((camera.scrollX + camera.width + chunkSizePixels) / chunkSizePixels);
    const startY = Math.floor((camera.scrollY - chunkSizePixels) / chunkSizePixels);
    const endY = Math.ceil((camera.scrollY + camera.height + chunkSizePixels) / chunkSizePixels);
    
    // Remove chunks that are no longer visible
    for (const [key, chunk] of this.visibleChunks) {
      const [chunkX, chunkY] = key.split(',').map(Number);
      if (chunkX < startX || chunkX > endX || chunkY < startY || chunkY > endY) {
        chunk.graphics.destroy();
        this.visibleChunks.delete(key);
      }
    }
    
    // Add new chunks that are now visible
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const key = `${x},${y}`;
        if (!this.visibleChunks.has(key)) {
          const chunk = MazeOverworldGenerator.getChunk(x, y, this.gridSize);
          const graphics = this.renderChunk(x, y, chunk.maze);
          this.visibleChunks.set(key, { maze: chunk.maze, graphics });
          
          // Add nodes from this chunk
          chunk.nodes.forEach(node => {
            // Check if node already exists to avoid duplicates
            if (!this.nodes.some(n => n.id === node.id)) {
              this.nodes.push(node);
              this.renderNode(node);
            }
          });
        }
      }
    }
  }

  renderChunk(chunkX: number, chunkY: number, maze: number[][]): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    const chunkSizePixels = MazeOverworldGenerator['chunkSize'] * this.gridSize;
    const offsetX = chunkX * chunkSizePixels;
    const offsetY = chunkY * chunkSizePixels;
    
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[0].length; x++) {
        if (maze[y][x] === 1) { // Wall
          // Rich dark brown stone walls
          graphics.fillStyle(0x3d291f);
          graphics.fillRect(
            offsetX + x * this.gridSize,
            offsetY + y * this.gridSize,
            this.gridSize,
            this.gridSize
          );
        } else { // Path
          // Weathered stone path
          graphics.fillStyle(0x5a4a3f);
          graphics.fillRect(
            offsetX + x * this.gridSize,
            offsetY + y * this.gridSize,
            this.gridSize,
            this.gridSize
          );
        }
      }
    }
    
    return graphics;
  }

  renderNode(node: MapNode): void {
    // Create sprite based on node type
    let spriteKey = "";
    let animKey = "";
    
    switch (node.type) {
      case "combat":
        spriteKey = "chort_f0";
        animKey = "chort_idle";
        break;
      case "elite":
        spriteKey = "big_demon_f0";
        animKey = "big_demon_idle";
        break;
      case "boss":
        // For now, use the elite sprite as placeholder for boss
        spriteKey = "big_demon_f0";
        animKey = "big_demon_idle";
        break;
      case "shop":
        spriteKey = "necromancer_f0";
        animKey = "necromancer_idle";
        break;
      case "event":
        spriteKey = "doc_f0";
        animKey = "doc_idle";
        break;
      case "campfire":
        spriteKey = "angel_f0";
        animKey = "angel_idle";
        break;
      case "treasure":
        spriteKey = "chest_f0";
        animKey = "chest_open";
        break;
      default:
        // Fallback to a simple circle if no sprite is available
        const fallbackCircle = this.add.circle(
          node.x + this.gridSize / 2, 
          node.y + this.gridSize / 2, 
          this.gridSize / 4, 
          0xffffff, 
          1
        );
        fallbackCircle.setOrigin(0.5);
        fallbackCircle.setDepth(501);
        return;
    }
    
    // Create the sprite
    const nodeSprite = this.add.sprite(
      node.x + this.gridSize / 2, 
      node.y + this.gridSize / 2, 
      spriteKey
    );
    nodeSprite.setOrigin(0.5);
    nodeSprite.setDepth(501); // Above the maze
    nodeSprite.setScale(1.5); // Scale up a bit for better visibility
    
    // Play the animation if it exists
    if (this.anims.exists(animKey)) {
      nodeSprite.play(animKey);
    }
  }

  isValidPosition(x: number, y: number): boolean {
    // Convert world coordinates to chunk and grid coordinates
    const chunkSize = MazeOverworldGenerator['chunkSize'];
    const chunkSizePixels = chunkSize * this.gridSize;
    
    const chunkX = Math.floor(x / chunkSizePixels);
    const chunkY = Math.floor(y / chunkSizePixels);
    const localX = x - (chunkX * chunkSizePixels);
    const localY = y - (chunkY * chunkSizePixels);
    const gridX = Math.floor(localX / this.gridSize);
    const gridY = Math.floor(localY / this.gridSize);
    
    // Get the chunk
    const chunk = MazeOverworldGenerator.getChunk(chunkX, chunkY, this.gridSize);
    
    // Check bounds
    if (gridX < 0 || gridX >= chunk.maze[0].length || gridY < 0 || gridY >= chunk.maze.length) {
      return false;
    }
    
    // Check if it's a path (0) not a wall (1)
    return chunk.maze[gridY][gridX] === 0;
  }

  checkNodeInteraction(): void {
    // Check if player is close to any node
    const threshold = this.gridSize;

    const nodeIndex = this.nodes.findIndex((n) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        n.x + this.gridSize / 2, 
        n.y + this.gridSize / 2
      );
      return distance < threshold;
    });

    if (nodeIndex !== -1) {
      const node = this.nodes[nodeIndex];
      
      // Handle different node types
      switch (node.type) {
        case "combat":
        case "elite":
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
          this.startCombat(node.type);
          break;
          
        case "boss":
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
          this.startCombat("boss");
          break;
          
        case "shop":
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
          // Save player position before transitioning
          const gameState2 = GameState.getInstance();
          gameState2.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch campfire scene
          this.scene.pause();
          this.scene.launch("Campfire", { 
            player: {
              id: "player",
              name: "Hero",
              maxHealth: 80,
              currentHealth: 80,
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
          break;
          
        case "treasure":
          // Save player position before transitioning
          const gameState3 = GameState.getInstance();
          gameState3.savePlayerPosition(this.player.x, this.player.y);
          
          // Pause this scene and launch treasure scene
          this.scene.pause();
          this.scene.launch("Treasure", { 
            player: {
              id: "player",
              name: "Hero",
              maxHealth: 80,
              currentHealth: 80,
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
          break;
          
        case "event":
          // Test event for random event
          this.showNodeEvent("Mysterious Event", "You encounter a mysterious figure who offers you a choice...", 0x0000ff);
          // Remove the node from the list so it doesn't trigger again
          this.nodes.splice(nodeIndex, 1);
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

  startCombat(nodeType: string): void {
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
      this.startBossCombat();
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
              transitionOverlay: overlay // Pass overlay to combat scene
            });
          }
        });
      });
    }
  }

  startBossCombat(): void {
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
              transitionOverlay: overlay
            });
          }
        });
      });
    });
  }

  /**
   * Create CRT scanline effect for retro aesthetic
   */
  private createCRTEffect(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create scanlines using a tile sprite with reduced opacity for subtlety
    this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.12) // Reduced opacity to minimize flickering distraction
      .setTint(0x77888C)
      .setScrollFactor(0) // Fixed to camera
      .setDepth(9999); // Ensure it's above everything else
      
    // Create a subtle scanline pattern
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 2); // Thicker lines
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 2, 4, 2); // Thicker lines
    
    const texture = graphics.generateTexture('overworld_scanline', 4, 4);
    this.scanlines.setTexture('overworld_scanline');
    
    // Add a subtle screen flicker effect (like Combat.ts)
    this.scheduleFlicker();
  }
  
  /**
   * Schedule the next screen flicker
   */
  private scheduleFlicker(): void {
    this.time.addEvent({
      delay: Phaser.Math.Between(8000, 20000), // Random flicker every 8-20 seconds (less frequent than combat)
      callback: this.flickerScreen,
      callbackScope: this,
      loop: false
    });
  }
  
  /**
   * Create a brief screen flicker effect
   */
  private flickerScreen(): void {
    // Very subtle flicker
    this.tweens.add({
      targets: this.scanlines,
      alpha: 0.18, // Slight increase in opacity
      duration: 30, // Very quick flicker
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        // Schedule next flicker after this one completes
        this.scheduleFlicker();
      }
    });
  }

  /**
   * Handle scene resize
   */
  private handleResize(): void {
    // Update UI elements on resize
    this.updateUI();
    
    // Recreate CRT effect on resize
    if (this.scanlines) {
      this.scanlines.destroy();
    }
    this.createCRTEffect();
  }

  /**
   * Update method for animation effects and player movement
   */
  update(time: number, delta: number): void {
    // Subtle scanline animation - much slower to reduce flickering
    if (this.scanlines) {
      this.scanlineTimer += delta;
      // Very slow movement to minimize distraction
      this.scanlines.tilePositionY = this.scanlineTimer * 0.02; // Much slower than before (0.15 -> 0.02)
    }
    
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
      const gridSize = this.gridSize;
      let moved = false;
      
      // Check for movement input - fix wasdKeys access pattern
      if (this.cursors.left.isDown || this.wasdKeys['A'].isDown) {
        const targetX = this.player.x - gridSize;
        if (this.isValidPosition(targetX, this.player.y)) {
          this.movePlayer(targetX, this.player.y, "left");
          moved = true;
        }
      } else if (this.cursors.right.isDown || this.wasdKeys['D'].isDown) {
        const targetX = this.player.x + gridSize;
        if (this.isValidPosition(targetX, this.player.y)) {
          this.movePlayer(targetX, this.player.y, "right");
          moved = true;
        }
      } else if (this.cursors.up.isDown || this.wasdKeys['W'].isDown) {
        const targetY = this.player.y - gridSize;
        if (this.isValidPosition(this.player.x, targetY)) {
          this.movePlayer(this.player.x, targetY, "up");
          moved = true;
        }
      } else if (this.cursors.down.isDown || this.wasdKeys['S'].isDown) {
        const targetY = this.player.y + gridSize;
        if (this.isValidPosition(this.player.x, targetY)) {
          this.movePlayer(this.player.x, targetY, "down");
          moved = true;
        }
      }
      
      // Check for Enter key to interact with nodes
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
        this.checkNodeInteraction();
      }
      
      // Check for shop key
      if (Phaser.Input.Keyboard.JustDown(this.shopKey)) {
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

      // Check for B key to trigger boss fight (for testing)
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B))) {
        this.startCombat("boss");
      }
      
      // Check for C key to trigger combat (for testing)
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.C))) {
        this.startCombat("combat");
      }
      
      // Check for E key to trigger elite combat (for testing)
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E))) {
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
   * Create modern styled left panel with improved visual design
   */
  private createCompactLeftPanel(screenHeight: number): void {
    const panelWidth = 320;
    const panelHeight = Math.min(screenHeight - 40, 720);
    const panelX = 20;
    const panelY = screenHeight / 2 - panelHeight / 2;
    
    // Modern glass-morphism style background
    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x0a0a0a, 0.85);
    panelBg.lineStyle(1, 0x404040, 0.6);
    panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
    
    // Subtle inner border for depth
    const innerBorder = this.add.graphics();
    innerBorder.lineStyle(1, 0x606060, 0.3);
    innerBorder.strokeRoundedRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, 18);
    
    // Accent line on the left
    const accentLine = this.add.graphics();
    accentLine.lineStyle(3, 0x00bcd4, 0.8);
    accentLine.beginPath();
    accentLine.moveTo(panelX + 8, panelY + 20);
    accentLine.lineTo(panelX + 8, panelY + panelHeight - 20);
    accentLine.strokePath();
    
    this.uiContainer.add([panelBg, innerBorder, accentLine]);
    
    // Modern header without heavy box
    const headerText = this.add.text(panelX + 25, panelY + 25, "STATUS", {
      fontFamily: "dungeon-mode",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    headerText.setShadow(1, 1, '#000000', 2, false, true);
    this.uiContainer.add(headerText);
    
    // Calculate organized spacing for sections with more breathing room
    const contentStartY = panelY + 80; // More space from header
    const sectionSpacing = 25; // Increased space between sections
    
    // Organized section heights for better proportions
    const healthSectionHeight = 155; // Increased to accommodate diamante spacing
    const relicsSectionHeight = 170;
    
    let currentY = contentStartY;
    
    // Health section with organized spacing
    this.createModernHealthSection(panelX + 20, currentY, panelWidth - 40);
    currentY += healthSectionHeight + sectionSpacing;
    
    // Add section separator with more prominent styling
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
    
    // Relics section with organized spacing
    this.createModernRelicsSection(panelX + 20, currentY, panelWidth - 40);
    currentY += relicsSectionHeight + sectionSpacing;
    
    // Add section separator with more prominent styling
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
    
    // Potions section with organized spacing
    this.createModernPotionsSection(panelX + 20, currentY, panelWidth - 40);
    currentY += 120 + sectionSpacing; // Height for potions section
    
    // Final separator for bottom closure
    this.createSectionSeparator(panelX + 25, currentY - (sectionSpacing / 2), panelWidth - 50);
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
   * Create modern health section with sleek design
   */
  private createModernHealthSection(x: number, y: number, width: number): void {
    // Section container with subtle background
    const sectionBg = this.add.graphics();
    sectionBg.fillStyle(0x1a1a1a, 0.4);
    sectionBg.lineStyle(1, 0x333333, 0.5);
    sectionBg.fillRoundedRect(x - 5, y - 5, width + 10, 140, 12);
    sectionBg.strokeRoundedRect(x - 5, y - 5, width + 10, 140, 12);
    this.uiContainer.add(sectionBg);
    
    // Health header with organized spacing
    const healthIcon = this.add.text(x, y + 8, "♥", {
      fontSize: "18px",
      color: "#e74c3c",
      fontStyle: "bold"
    });
    healthIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const healthLabel = this.add.text(x + 25, y + 8, "HEALTH", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    healthLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    // Health value beside the label - show actual player health
    this.healthText = this.add.text(x + 100, y + 8, `${this.playerData.currentHealth}/${this.playerData.maxHealth}`, {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.healthText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Modern health bar container with organized spacing
    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x2c2c2c, 0.8);
    healthBarBg.fillRoundedRect(x, y + 50, width - 10, 12, 6);
    this.uiContainer.add(healthBarBg);
    
    // Health bar fill
    this.healthBar = this.add.graphics();
    this.uiContainer.add(this.healthBar);
    
    // Currency section without background - removed oval/semi-circle background
    const gintoIcon = this.add.text(x + 8, y + 83, "💰", {
      fontSize: "16px"
    });
    gintoIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const gintoLabel = this.add.text(x + 30, y + 79, "GINTO", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    gintoLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    this.currencyText = this.add.text(x + 80, y + 79, `${this.playerData.ginto}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Diamante currency display
    const diamanteIcon = this.add.text(x + 8, y + 110, "💎", {
      fontSize: "16px"
    });
    diamanteIcon.setShadow(2, 2, '#000000', 2, false, true);
    
    const diamanteLabel = this.add.text(x + 30, y + 106, "DIAMANTE", {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    diamanteLabel.setShadow(2, 2, '#000000', 2, false, true);
    
    this.diamanteText = this.add.text(x + 100, y + 106, `${this.playerData.diamante}`, {
      fontFamily: "dungeon-mode",
      fontSize: "10px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
    
    // Landás meter with organized spacing - moved down to prevent overlap
    this.createLandasMeter(x, y + 150, width - 10, 18);
    
    this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel, this.healthText, this.currencyText, this.diamanteText]);
  }

  /**
   * Create modern relics section with grid layout
   */
  private createModernRelicsSection(x: number, y: number, width: number): void {
    // Section header with organized spacing
    const relicsLabel = this.add.text(x, y + 8, "RELICS", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    relicsLabel.setShadow(2, 2, '#000000', 2, false, true);
    this.uiContainer.add(relicsLabel);
    
    // Grid container with organized spacing
    const gridBg = this.add.graphics();
    gridBg.fillStyle(0x1a1a1a, 0.4);
    gridBg.lineStyle(1, 0x333333, 0.5);
    gridBg.fillRoundedRect(x - 5, y + 25, width + 10, 130, 12);
    gridBg.strokeRoundedRect(x - 5, y + 25, width + 10, 130, 12);
    this.uiContainer.add(gridBg);
    
    // Create 4x2 grid of relic slots with organized spacing
    const slotSize = 45;
    const slotSpacing = 12;
    const slotsPerRow = 4;
    const rows = 2;
    const gridStartX = x + 15;
    const gridStartY = y + 40;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotX = gridStartX + col * (slotSize + slotSpacing);
        const slotY = gridStartY + row * (slotSize + slotSpacing);
        
        const slot = this.add.graphics();
        slot.fillStyle(0x2c2c2c, 0.6);
        slot.lineStyle(1, 0x404040, 0.8);
        slot.fillRoundedRect(slotX, slotY, slotSize, slotSize, 8);
        slot.strokeRoundedRect(slotX, slotY, slotSize, slotSize, 8);
        this.uiContainer.add(slot);
      }
    }
    
    // Create relics container for items
    this.relicsContainer = this.add.container(gridStartX, gridStartY);
    this.uiContainer.add(this.relicsContainer);
  }

  /**
   * Create modern potions section
   */
  private createModernPotionsSection(x: number, y: number, width: number): void {
    // Section header with organized spacing
    const potionsLabel = this.add.text(x, y + 8, "POTIONS", {
      fontFamily: "dungeon-mode",
      fontSize: "14px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    potionsLabel.setShadow(2, 2, '#000000', 2, false, true);
    this.uiContainer.add(potionsLabel);
    
    // Potions container with organized spacing
    const potionsBg = this.add.graphics();
    potionsBg.fillStyle(0x1a1a1a, 0.4);
    potionsBg.lineStyle(1, 0x333333, 0.5);
    potionsBg.fillRoundedRect(x - 5, y + 25, width + 10, 65, 12);
    potionsBg.strokeRoundedRect(x - 5, y + 25, width + 10, 65, 12);
    this.uiContainer.add(potionsBg);
    
    // Create 3 potion slots with organized spacing
    const slotSize = 40;
    const slotSpacing = 18;
    const potionStartX = x + 20;
    const potionStartY = y + 38;
    
    for (let i = 0; i < 3; i++) {
      const slotX = potionStartX + i * (slotSize + slotSpacing);
      
      const slot = this.add.graphics();
      slot.fillStyle(0x2c2c2c, 0.6);
      slot.lineStyle(1, 0x404040, 0.8);
      slot.fillRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
      slot.strokeRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
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
    this.healthText = this.add.text(x + 35, y + 26, "80/80", {
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
    
    // Enhanced currency display
    const currencyBg = this.add.graphics();
    currencyBg.fillGradientStyle(0x1a1a00, 0x1a1a00, 0x000000, 0x000000, 0.95);
    currencyBg.lineStyle(2, 0xffd700, 0.9);
    currencyBg.fillRoundedRect(x, y + 98, 130, 45, 8);
    currencyBg.strokeRoundedRect(x, y + 98, 130, 45, 8);
    
    // Add currency inner glow
    const currencyGlow = this.add.graphics();
    currencyGlow.lineStyle(1, 0xffd700, 0.3);
    currencyGlow.strokeRoundedRect(x + 2, y + 100, 126, 41, 6);
    
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
    
    // Diamante currency display
    const diamanteIcon = this.add.text(x + 70, y + 108, "💎", {
      fontSize: "20px"
    });
    diamanteIcon.setShadow(1, 1, '#00ffff', 2, false, true);
    
    const diamanteLabel = this.add.text(x + 98, y + 103, "DIAMANTE", {
      fontFamily: "dungeon-mode-inverted",
      fontSize: "12px",
      color: "#00ffff",
      fontStyle: "bold"
    });
    diamanteLabel.setShadow(1, 1, '#000000', 2, false, true);
    
    this.diamanteText = this.add.text(x + 98, y + 120, "0", {
      fontFamily: "dungeon-mode",
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold"
    });
    this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
    
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
    
    this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel]);
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
   * Use a potion
   */
  private usePotion(index: number): void {
    if (index >= 0 && index < this.playerData.potions.length) {
      const potion = this.playerData.potions[index];
      console.log(`Using potion: ${potion.name}`);
      
      // Apply potion effects here
      switch (potion.effect) {
        case "draw_3_cards":
          console.log("Would draw 3 cards");
          break;
        case "gain_15_block":
          console.log("Would gain 15 block");
          break;
        default:
          console.log(`Unknown potion effect: ${potion.effect}`);
      }
      
      // Remove potion after use
      this.playerData.potions.splice(index, 1);
      this.updateOverworldUI();
    }
  }

  /**
   * Discard a potion
   */
  private discardPotion(index: number): void {
    if (index >= 0 && index < this.playerData.potions.length) {
      const potion = this.playerData.potions[index];
      console.log(`Discarding potion: ${potion.name}`);
      
      // Remove potion
      this.playerData.potions.splice(index, 1);
      this.updateOverworldUI();
    }
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
    
    // Create relics container
    this.relicsContainer = this.add.container(75, relicsY);
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
    this.updateLandasDisplay();
    this.updateRelicsDisplay();
    this.updatePotionsDisplay();
  }

  /**
   * Update health bar display with heart-shaped elements and consistent square design
   */
  private updateHealthBar(): void {
    const healthPercent = this.playerData.currentHealth / this.playerData.maxHealth;
    
    this.healthBar.clear();
    
    // Modern health bar position calculation
    const panelX = 20;
    const panelWidth = 320;
    const screenHeight = this.cameras.main.height;
    const panelHeight = Math.min(screenHeight - 40, 720);
    const panelY = screenHeight / 2 - panelHeight / 2;
    
    const healthSectionY = panelY + 70; // After header with organized spacing
    const barX = panelX + 20; // Health section x position
    const barY = healthSectionY + 50; // Health bar y position within section (updated)
    const barWidth = panelWidth - 50; // Available width for health bar
    const barHeight = 12; // Modern thin health bar
    
    // Modern health color progression
    let healthColor = 0x2ecc71; // Modern green
    
    if (healthPercent < 0.75) {
      healthColor = 0x27ae60; // Darker green
    }
    if (healthPercent < 0.5) {
      healthColor = 0xf39c12; // Orange
    }
    if (healthPercent < 0.25) {
      healthColor = 0xe74c3c; // Modern red
    }
    
    // Draw modern health bar fill with rounded corners
    const fillWidth = barWidth * healthPercent;
    if (fillWidth > 4) {
      this.healthBar.fillStyle(healthColor, 1.0);
      this.healthBar.fillRoundedRect(barX, barY, fillWidth, barHeight, 6);
      
      // Add subtle glow effect for low health
      if (healthPercent < 0.25) {
        this.healthBar.fillStyle(healthColor, 0.3);
        this.healthBar.fillRoundedRect(barX - 2, barY - 1, fillWidth + 4, barHeight + 2, 7);
      }
    }
    
    // Update health text
    this.healthText.setText(`${this.playerData.currentHealth}/${this.playerData.maxHealth}`);
    
    // Modern low health effects
    if (healthPercent < 0.25) {
      this.healthText.setShadow(1, 1, '#e74c3c', 2, false, true);
    } else {
      this.healthText.setShadow(2, 2, '#000000', 2, false, true);
      this.tweens.killTweensOf(this.healthText);
      this.healthText.setScale(1, 1);
    }
  }

  /**
   * Update currency display
   */
  private updateCurrencyDisplay(): void {
    this.currencyText.setText(`${this.playerData.ginto}`);
    this.diamanteText.setText(`${this.playerData.diamante}`);
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
   * Update relics display in grid layout (4x2 grid)
   */
  private updateRelicsDisplay(): void {
    this.relicsContainer.removeAll(true);
    
    const slotSize = 50;
    const slotSpacing = 8; // Match the corrected spacing from createGridInventorySection
    const slotsPerRow = 4;
    const maxRelics = 8; // 4x2 grid
    
    for (let i = 0; i < Math.min(this.playerData.relics.length, maxRelics); i++) {
      const relic = this.playerData.relics[i];
      const row = Math.floor(i / slotsPerRow);
      const col = i % slotsPerRow;
      
      // Use same spacing calculation as the grid creation - match exactly
      const relicX = col * (slotSize + slotSpacing);
      const relicY = row * (slotSize + slotSpacing);
      
      // Create Persona-style relic container
      const relicContainer = this.add.container(relicX, relicY);
      
      // Relic background with Persona styling
      const relicBg = this.add.graphics();
      relicBg.fillStyle(0x000000, 0.7); // Black background
      relicBg.lineStyle(1, 0xffffff, 1); // White border
      relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
      relicBg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);
      
      // Relic icon/emoji
      const relicIcon = this.add.text(slotSize/2, slotSize/2, relic.emoji, {
        fontSize: "24px",
        align: "center"
      }).setOrigin(0.5);
      
      // Add a subtle glow effect for equipped relics
      const glow = this.add.graphics();
      glow.fillStyle(0xff0000, 0.3); // Red glow
      glow.fillRoundedRect(-2, -2, slotSize + 4, slotSize + 4, 6);
      
      relicContainer.add([glow, relicBg, relicIcon]);
      
      // Make interactive for tooltip
      relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      this.createItemTooltip(relicIcon, relic.name, relic.description);
      
      // Add hover effects
      relicContainer.on('pointerover', () => {
        relicBg.clear();
        relicBg.fillStyle(0x333333, 0.9); // Lighter background on hover
        relicBg.lineStyle(2, 0xff0000, 1); // Thicker red border
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
        relicBg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);
        
        // Scale up on hover
        this.tweens.add({
          targets: relicContainer,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      relicContainer.on('pointerout', () => {
        relicBg.clear();
        relicBg.fillStyle(0x000000, 0.7); // Original background
        relicBg.lineStyle(1, 0xffffff, 1); // Original border
        relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 4);
        relicBg.strokeRoundedRect(0, 0, slotSize, slotSize, 4);
        
        // Scale back to normal
        this.tweens.add({
          targets: relicContainer,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      this.relicsContainer.add(relicContainer);
    }
  }

  /**
   * Update potions display in bottom action slots
   */
  private updatePotionsDisplay(): void {
    this.potionsContainer.removeAll(true);
    
    // Match the calculations from createModernPotionsSection
    const slotSize = 40;
    const slotSpacing = 18;
    const maxPotions = 3;
    
    for (let i = 0; i < Math.min(this.playerData.potions.length, maxPotions); i++) {
      const potion = this.playerData.potions[i];
      const potionX = i * (slotSize + slotSpacing);
      const potionY = 0;
      
      // Create potion container
      const potionContainer = this.add.container(potionX, potionY);
      
      // Potion background (slightly smaller than slot to create padding effect)
      const potionBg = this.add.graphics();
      potionBg.fillStyle(0x000000, 0.6);
      potionBg.lineStyle(1, 0x555555, 0.8);
      potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
      
      // Potion icon - centered in the slot
      const potionIcon = this.add.text(slotSize/2, slotSize/2, "🧪", {
        fontSize: "20px",
        align: "center"
      }).setOrigin(0.5);
      
      potionContainer.add([potionBg, potionIcon]);
      
      // Make interactive for tooltip and actions
      potionContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
      this.createItemTooltip(potionIcon, potion.name, potion.description);
      
      // Add hover effects
      potionContainer.on('pointerover', () => {
        potionBg.clear();
        potionBg.fillStyle(0x333333, 0.8);
        potionBg.lineStyle(2, 0x44aa44, 1);
        potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale up on hover
        this.tweens.add({
          targets: potionContainer,
          scale: 1.1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      potionContainer.on('pointerout', () => {
        potionBg.clear();
        potionBg.fillStyle(0x000000, 0.6);
        potionBg.lineStyle(1, 0x555555, 0.8);
        potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
        
        // Scale back to normal
        this.tweens.add({
          targets: potionContainer,
          scale: 1,
          duration: 150,
          ease: 'Power2'
        });
      });
      
      // Add use/discard buttons
      const useButton = this.createSmallPotionButton(
        potionX + slotSize - 8,
        potionY + 8,
        "U",
        0x00aa00,
        () => this.usePotion(i)
      );
      
      const discardButton = this.createSmallPotionButton(
        potionX + slotSize - 8,
        potionY + 24,
        "D",
        0xaa0000,
        () => this.discardPotion(i)
      );
      
      this.potionsContainer.add([potionContainer, useButton, discardButton]);
    }
    
    // Update discard charges display
    if (this.discardText) {
      this.discardText.setText(`${this.playerData.discardCharges || 1}/${this.playerData.maxDiscardCharges || 1}`);
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
      
      // Create relic icon
      const relicIcon = this.add.text(0, 0, relic.emoji, {
        fontSize: "32px"
      }).setOrigin(0.5);
      
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
}
