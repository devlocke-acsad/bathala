import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";
import { OverworldGameState } from "../../core/managers/OverworldGameState";

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

  constructor() {
    super({ key: "Overworld" });
    this.gameState = OverworldGameState.getInstance();
  }

  create(): void {
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
    
    // Create UI elements
    this.createUI();
    
    // Render initial chunks around player
    this.updateVisibleChunks();

    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }

  createUI(): void {
    // Create day/night cycle progress bar (He is Coming style)
    this.createDayNightProgressBar();
    
    // Create boss appearance indicator
    this.bossText = this.add.text(10, 40, 
      `Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`, 
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 }
      }
    ).setScrollFactor(0).setDepth(1000); // Fix to camera and set depth
    
    // Create action buttons on the top right side of the screen (fixed to camera)
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const buttonX = screenWidth - 150; // Position from right edge
    let buttonY = 100;
    
    // Combat test button
    this.createActionButton(buttonX, buttonY, "Combat", "#ff0000", () => {
      this.startCombat("combat");
    });
    buttonY += 60;
    
    // Elite test button
    this.createActionButton(buttonX, buttonY, "Elite", "#ffa500", () => {
      this.startCombat("elite");
    });
    buttonY += 60;
    
    // Boss test button
    this.createActionButton(buttonX, buttonY, "Boss Fight", "#8b5cf6", () => {
      this.startCombat("boss");
    });
    buttonY += 60;
    
    // Shop test button
    this.createActionButton(buttonX, buttonY, "Shop", "#00ff00", () => {
      this.scene.start("Shop", { 
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
          baubles: 0,
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
    });
    buttonY += 60;
    
    // Event test button
    this.createActionButton(buttonX, buttonY, "Event", "#0000ff", () => {
      console.log("Event action triggered");
    });
    buttonY += 60;
    
    // Campfire test button
    this.createActionButton(buttonX, buttonY, "Campfire", "#ff4500", () => {
      this.scene.start("Campfire", { 
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
          baubles: 0,
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
    });
    buttonY += 60;
    
    // Treasure test button
    this.createActionButton(buttonX, buttonY, "Treasure", "#ffff00", () => {
      this.scene.start("Treasure", { 
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
          baubles: 0,
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
    });
    
    // Create additional easily accessible test buttons at the bottom of the screen (fixed to camera)
    const bottomButtonY = screenHeight - 100;
    let bottomButtonX = 100;
    
    // Quick Boss Fight button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Boss", "#8b5cf6", () => {
      this.startCombat("boss");
    });
    
    bottomButtonX += 150;
    
    // Quick Combat button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Combat", "#ff0000", () => {
      this.startCombat("combat");
    });
    
    bottomButtonX += 150;
    
    // Quick Elite button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Elite", "#ffa500", () => {
      this.startCombat("elite");
    });
    
    bottomButtonX += 150;
    
    // Quick Campfire button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Campfire", "#ff4500", () => {
      this.scene.start("Campfire", { 
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
          baubles: 0,
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
    });
    
    bottomButtonX += 150;
    
    // Quick Shop button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Shop", "#00ff00", () => {
      this.scene.start("Shop", { 
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
          baubles: 0,
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
    });
    
    bottomButtonX += 150;
    
    // Quick Treasure button at bottom
    this.createActionButton(bottomButtonX, bottomButtonY, "Quick Treasure", "#ffff00", () => {
      this.scene.start("Treasure", { 
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
          baubles: 0,
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
    });
    
    bottomButtonX += 150;
    
    // DDA Debug button at bottom  
    this.createActionButton(bottomButtonX, bottomButtonY, "DDA Debug", "#9c27b0", () => {
      this.scene.start("DDADebugScene");
    });
  }

  createDayNightProgressBar(): void {
    const screenWidth = this.cameras.main.width;
    const progressBarWidth = screenWidth * 0.6;
    const progressBarHeight = 20;
    const progressBarX = (screenWidth - progressBarWidth) / 2;
    const progressBarY = 30; // Move down to avoid overlapping with other UI elements
    
    // Create background bar
    this.add.rectangle(
      progressBarX + progressBarWidth / 2,
      progressBarY,
      progressBarWidth,
      progressBarHeight,
      0x000000
    ).setAlpha(0.7).setScrollFactor(0).setDepth(100); // Fixed to camera with depth
    
    // Create progress bar fill
    this.dayNightProgressFill = this.add.rectangle(
      progressBarX,
      progressBarY,
      0, // Width will be updated
      progressBarHeight,
      0xffd93d // Day color (yellow)
    ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101); // Fixed to camera with depth
    
    // Create tick marks (10 ticks for 5 cycles)
    for (let i = 0; i <= 10; i++) {
      const tickX = progressBarX + (i * progressBarWidth / 10);
      const tickHeight = i % 2 === 0 ? 10 : 5; // Longer ticks for cycle boundaries
      
      this.add.rectangle(
        tickX,
        progressBarY,
        2,
        tickHeight,
        0xffffff
      ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102); // Fixed to camera with depth
    }
    
    // Create sun and moon icons
    // Sun for day cycles (even numbers)
    for (let i = 0; i <= 10; i += 2) {
      const iconX = progressBarX + (i * progressBarWidth / 10);
      const sun = this.add.circle(iconX, progressBarY - 15, 8, 0xffd93d);
      sun.setStrokeStyle(1, 0x000000);
      sun.setScrollFactor(0).setDepth(102); // Fixed to camera with depth
    }
    
    // Moon for night cycles (odd numbers)
    for (let i = 1; i <= 9; i += 2) {
      const iconX = progressBarX + (i * progressBarWidth / 10);
      const moon = this.add.circle(iconX, progressBarY - 15, 6, 0x4ecdc4);
      moon.setStrokeStyle(1, 0x000000);
      moon.setScrollFactor(0).setDepth(102); // Fixed to camera with depth
    }
    
    // Boss icon at the end of the progress bar
    const bossIconX = progressBarX + progressBarWidth;
    const bossText = this.add.text(bossIconX, progressBarY - 15, "👹", {
      fontSize: '24px',
      align: 'center'
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102);
    
    // Create player indicator
    this.dayNightIndicator = this.add.triangle(
      progressBarX,
      progressBarY,
      0, -8,
      -6, 4,
      6, 4,
      0xff0000
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(103); // Fixed to camera with depth
    
    // Update the progress bar
    this.updateDayNightProgressBar();
  }

  createActionButton(x: number, y: number, text: string, color: string, callback: () => void): void {
    const button = this.add.container(x, y);
    
    const background = this.add.rectangle(0, 0, 120, 40, 0x333333);
    background.setStrokeStyle(2, parseInt(color.replace('#', ''), 16));
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '14px',
      color: color,
      align: 'center'
    }).setOrigin(0.5);
    
    button.add([background, buttonText]);
    button.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);
    
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
    
    this.actionButtons.push(button);
  }

  update(): void {
    // Skip input handling if player is currently moving or transitioning to combat
    if (this.isMoving || this.isTransitioningToCombat) {
      return;
    }

    // Check for input - handle multiple directions with priority
    // Up/Down takes priority over Left/Right
    if (this.cursors.up.isDown || this.wasdKeys['W'].isDown) {
      this.movePlayer(0, -this.gridSize, "avatar_walk_up");
    } else if (this.cursors.down.isDown || this.wasdKeys['S'].isDown) {
      this.movePlayer(0, this.gridSize, "avatar_walk_down");
    } else if (this.cursors.left.isDown || this.wasdKeys['A'].isDown) {
      this.movePlayer(-this.gridSize, 0, "avatar_walk_left");
    } else if (this.cursors.right.isDown || this.wasdKeys['D'].isDown) {
      this.movePlayer(this.gridSize, 0, "avatar_walk_right");
    }
    
    // Check for Enter key to interact with nodes
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
      this.checkNodeInteraction();
    }
    
    // Check for M key to open the mysterious merchant shop
    if (Phaser.Input.Keyboard.JustDown(this.shopKey)) {
      // Find if there's a shop node nearby
      const shopNode = this.nodes.find(node => 
        node.type === "shop" && 
        Phaser.Math.Distance.Between(
          this.player.x, 
          this.player.y, 
          node.x + this.gridSize / 2, 
          node.y + this.gridSize / 2
        ) < this.gridSize
      );
      
      if (shopNode) {
        // Navigate to shop scene
        this.scene.start("Shop", { 
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
            baubles: 0,
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
      }
    }
    
    // Check for B key to trigger boss fight (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B))) {
      this.startCombat("boss");
    }
    
    // Check for C key to trigger combat (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C))) {
      this.startCombat("combat");
    }
    
    // Check for E key to trigger elite combat (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E))) {
      this.startCombat("elite");
    }
    
    // Check for T key to trigger treasure (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T))) {
      this.scene.start("Treasure", { 
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
          baubles: 0,
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
    }
    
    // Check for F key to trigger campfire (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F))) {
      this.scene.start("Campfire", { 
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
          baubles: 0,
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
    }
    
    // Check for R key to trigger treasure (for testing)
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R))) {
      this.scene.start("Treasure", { 
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
          baubles: 0,
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
    }
    
    // Update UI
    this.updateUI();
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
  }

  updateDayNightProgressBar(): void {
    const screenWidth = this.cameras.main.width;
    const progressBarWidth = screenWidth * 0.6;
    const progressBarX = (screenWidth - progressBarWidth) / 2;
    
    // Calculate progress (0 to 1)
    const totalProgress = Math.min(this.gameState.actionsTaken / this.gameState.totalActionsUntilBoss, 1);
    
    // Update progress bar fill
    const fillWidth = progressBarWidth * totalProgress;
    this.dayNightProgressFill.width = fillWidth;
    
    // Update color based on day/night
    this.dayNightProgressFill.fillColor = this.gameState.isDay ? 0xffd93d : 0x4ecdc4;
    
    // Update player indicator position
    this.dayNightIndicator.x = progressBarX + (progressBarWidth * totalProgress);
    
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

  /**
   * Called when the scene resumes from another scene
   */
  resume(): void {
    // Re-enable input when returning from combat
    this.input.keyboard.enabled = true;
    this.isMoving = false;
    this.isTransitioningToCombat = false;
  }

  movePlayer(deltaX: number, deltaY: number, animation: string): void {
    // Set moving flag to prevent input during movement
    this.isMoving = true;

    // Play walking animation with error checking
    console.log("Playing animation:", animation);
    if (this.anims.exists(animation)) {
      try {
        this.player.play(animation, true);
      } catch (error) {
        console.warn("Failed to play animation:", animation, error);
      }
    } else {
      console.warn("Animation not found:", animation);
    }

    // Calculate new position
    let newX = this.player.x + deltaX;
    let newY = this.player.y + deltaY;
    
    console.log(`Moving from (${this.player.x}, ${this.player.y}) to (${newX}, ${newY})`);

    // Check if the new position is valid (not a wall)
    if (this.isValidPosition(newX, newY)) {
      console.log("Position is valid, moving player");
      // Record the action for day/night cycle
      this.gameState.recordAction();
      
      // Check if day/night cycle changed
      if (this.gameState.actionsUntilCycleChange === 49) { // Just changed
        // Handle day/night transition
        this.handleDayNightTransition();
      }
      
      // Move player with tween
      this.tweens.add({
        targets: this.player,
        x: newX,
        y: newY,
        duration: 150, // Slightly faster movement
        onComplete: () => {
          this.isMoving = false;
          this.checkNodeInteraction();
          // Play idle animation after movement based on direction
          let idleAnimation = "avatar_idle_down";
          if (animation.includes("down")) {
            idleAnimation = "avatar_idle_down";
          } else if (animation.includes("up")) {
            idleAnimation = "avatar_idle_up";
          } else if (animation.includes("left")) {
            idleAnimation = "avatar_idle_left";
          } else if (animation.includes("right")) {
            idleAnimation = "avatar_idle_right";
          }
          
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
      let idleAnimation = "avatar_idle_down";
      if (animation.includes("down")) {
        idleAnimation = "avatar_idle_down";
      } else if (animation.includes("up")) {
        idleAnimation = "avatar_idle_up";
      } else if (animation.includes("left")) {
        idleAnimation = "avatar_idle_left";
      } else if (animation.includes("right")) {
        idleAnimation = "avatar_idle_right";
      }
      
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
          // Navigate to shop scene
          this.scene.start("Shop", { 
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
              baubles: 0,
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
          
        case "campfire":
          // Navigate to campfire scene
          this.scene.start("Campfire", { 
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
              baubles: 0,
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
          // Navigate to treasure scene
          this.scene.start("Treasure", { 
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
              baubles: 0,
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
        fontFamily: "Centrion",
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
        fontFamily: "Centrion",
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
        fontFamily: "Centrion",
        fontSize: 18,
        color: "#e8eced",
        align: "center",
        wordWrap: { width: 500 }
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
    
    // Create continue button
    const continueButton = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100
    ).setScrollFactor(0).setDepth(2002);
    
    const buttonBg = this.add.rectangle(0, 0, 150, 40, 0x3d4454)
      .setStrokeStyle(2, color);
    const buttonText = this.add.text(0, 0, "Continue", {
      fontFamily: "Centrion",
      fontSize: 18,
      color: "#e8eced"
    }).setOrigin(0.5);
    
    continueButton.add([buttonBg, buttonText]);
    continueButton.setInteractive(
      new Phaser.Geom.Rectangle(-75, -20, 150, 40),
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
    
    // Disable input during transition
    this.input.keyboard.enabled = false;
    
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
    ).setOrigin(0.5, 0.5).setAlpha(0).setScrollFactor(0); // Start transparent
    
    // Fade in the overlay
    this.tweens.add({
      targets: overlay,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
    
    // Create bars within the overlay after a short delay
    this.time.delayedCall(200, () => {
      const bars = [];
      const barCount = 30; // Even more bars for complete coverage
      const barHeight = cameraHeight / barCount;
      
      // Create bars with alternating colors for menacing effect
      for (let i = 0; i < barCount; i++) {
        const color = i % 2 === 0 ? 0x8B0000 : 0x000000; // Dark red and black
        const bar = this.add
          .rectangle(
            cameraWidth,
            i * barHeight,
            cameraWidth,
            barHeight + 2, // Add extra height to ensure no gaps
            color
          )
          .setOrigin(1, 0)
          .setAlpha(1.0) // Full opacity
          .setScrollFactor(0); // Fixed to camera

        bars.push(bar);
      }

      // Animate bars with more menacing pattern - slower and more dramatic
      this.tweens.add({
        targets: bars,
        x: 0,
        duration: 1200, // Slower animation for maximum drama
        ease: "Power3",
        delay: this.tweens.stagger(150, { // Slower stagger
          from: 'center', // Start from center for more dramatic effect
          grid: '30x1' 
        }),
        onComplete: () => {
          // Add a final dramatic effect before transitioning
          // Zoom and fade the entire camera
          const zoomDuration = 800;
          
          this.tweens.add({
            targets: camera,
            zoom: 1.5, // Zoom in slightly
            duration: zoomDuration / 2,
            ease: 'Power2',
            yoyo: true,
            hold: 100,
            onComplete: () => {
              // Instead of fading out overlay, we'll keep it and pass it to combat scene
              // Start combat scene and pass the overlay for fade-in effect
              this.scene.start("Combat", { 
                nodeType: nodeType,
                transitionOverlay: overlay // Pass overlay to combat scene
              });
            }
          });
        }
      });
    });
  }

  startBossCombat(): void {
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
            // Start boss combat
            this.scene.start("Combat", { 
              nodeType: "boss",
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
}
