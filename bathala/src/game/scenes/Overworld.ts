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
  private cycleText!: Phaser.GameObjects.Text;
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
    
    // Center the camera on the player
    this.cameras.main.startFollow(this.player);
    
    // Create UI elements
    this.createUI();
    
    // Render initial chunks around player
    this.updateVisibleChunks();
  }

  createUI(): void {
    // Create day/night cycle indicator
    this.cycleText = this.add.text(10, 10, 
      `Cycle ${this.gameState.currentCycle}: ${this.gameState.getTimeOfDay()}`, 
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 }
      }
    );
    
    // Create boss appearance indicator
    this.bossText = this.add.text(10, 40, 
      `Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`, 
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: { x: 10, y: 5 }
      }
    );
    
    // Create action buttons on the top right side of the screen
    const buttonX = this.cameras.main.width - 150;
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
    
    // Shop test button
    this.createActionButton(buttonX, buttonY, "Shop", "#00ff00", () => {
      console.log("Shop action triggered");
    });
    buttonY += 60;
    
    // Event test button
    this.createActionButton(buttonX, buttonY, "Event", "#0000ff", () => {
      console.log("Event action triggered");
    });
    buttonY += 60;
    
    // Campfire test button
    this.createActionButton(buttonX, buttonY, "Campfire", "#ff4500", () => {
      console.log("Campfire action triggered");
    });
    buttonY += 60;
    
    // Treasure test button
    this.createActionButton(buttonX, buttonY, "Treasure", "#ffff00", () => {
      console.log("Treasure action triggered");
    });
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

    // Check for input
    if (this.cursors.left.isDown || this.wasdKeys['A'].isDown) {
      this.movePlayer(-this.gridSize, 0, "avatar_walk_left");
    } else if (this.cursors.right.isDown || this.wasdKeys['D'].isDown) {
      this.movePlayer(this.gridSize, 0, "avatar_walk_right");
    } else if (this.cursors.up.isDown || this.wasdKeys['W'].isDown) {
      this.movePlayer(0, -this.gridSize, "avatar_walk_up");
    } else if (this.cursors.down.isDown || this.wasdKeys['S'].isDown) {
      this.movePlayer(0, this.gridSize, "avatar_walk_down");
    }
    
    // Check for Enter key to interact with nodes
    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER))) {
      this.checkNodeInteraction();
    }
    
    // Update UI
    this.updateUI();
  }

  updateUI(): void {
    // Update cycle text
    this.cycleText.setText(`Cycle ${this.gameState.currentCycle}: ${this.gameState.getTimeOfDay()}`);
    
    // Update boss progress
    this.bossText.setText(`Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`);
    
    // Show boss alert if close to appearing
    if (this.gameState.getBossProgress() > 0.8 && !this.gameState.bossAppeared) {
      this.bossText.setColor('#ff0000');
    } else {
      this.bossText.setColor('#ffffff');
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

    // Play walking animation
    console.log("Playing animation:", animation);
    this.player.play(animation, true);

    // Calculate new position
    let newX = this.player.x + deltaX;
    let newY = this.player.y + deltaY;
    
    console.log(`Moving from (${this.player.x}, ${this.player.y}) to (${newX}, ${newY})`);

    // Check if the new position is valid (not a wall)
    if (this.isValidPosition(newX, newY)) {
      console.log("Position is valid, moving player");
      // Record the action for day/night cycle
      this.gameState.recordAction();
      
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
          if (animation.includes("down")) {
            this.player.play("avatar_idle_down");
          } else if (animation.includes("up")) {
            this.player.play("avatar_idle_up");
          } else if (animation.includes("left")) {
            this.player.play("avatar_idle_left");
          } else if (animation.includes("right")) {
            this.player.play("avatar_idle_right");
          } else {
            this.player.play("avatar_idle_down");
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
      if (animation.includes("down")) {
        this.player.play("avatar_idle_down");
      } else if (animation.includes("up")) {
        this.player.play("avatar_idle_up");
      } else if (animation.includes("left")) {
        this.player.play("avatar_idle_left");
      } else if (animation.includes("right")) {
        this.player.play("avatar_idle_right");
      } else {
        this.player.play("avatar_idle_down");
      }
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
      if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
        // Remove the node from the list so it doesn't trigger again
        this.nodes.splice(nodeIndex, 1);
        this.startCombat(node.type);
      }
    }
  }

  startCombat(nodeType: string): void {
    // Prevent player from moving during combat transition
    this.isMoving = true;
    this.isTransitioningToCombat = true;
    
    // Disable input during transition
    this.input.keyboard.enabled = false;
    
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
      
      // Add some random visual effects for menace
      const particles = [];
      for (let i = 0; i < 40; i++) {
        const particle = this.add.circle(
          Phaser.Math.Between(0, cameraWidth),
          Phaser.Math.Between(0, cameraHeight),
          Phaser.Math.Between(4, 15),
          0xff0000,
          1.0 // Full opacity
        ).setScrollFactor(0); // Fixed to camera
        particles.push(particle);
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
          // Flash screen red for intensity
          const flash = this.add.rectangle(
            cameraWidth / 2,
            cameraHeight / 2,
            cameraWidth,
            cameraHeight,
            0xff0000
          ).setAlpha(0).setScrollFactor(0); // Start transparent
          
          // Fade in the flash
          this.tweens.add({
            targets: flash,
            alpha: 0.9,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
              // Fade out the flash
              this.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                  flash.destroy();
                  
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
            }
          });
        }
      });
      
      // Animate particles for extra menace - slower and more dramatic
      this.tweens.add({
        targets: particles,
        x: {
          getEnd: function (target: Phaser.GameObjects.Arc) {
            return target.x + Phaser.Math.Between(-200, 200);
          }
        },
        y: {
          getEnd: function (target: Phaser.GameObjects.Arc) {
            return target.y + Phaser.Math.Between(-200, 200);
          }
        },
        alpha: 0,
        scale: 0, // Shrink particles as they fade
        duration: 1200, // Match bar animation duration
        ease: "Power2",
        onComplete: () => {
          particles.forEach(particle => particle.destroy());
        }
      });
    });
  }
}
