import { Scene } from "phaser";
import { MazeOverworldGenerator } from "../../utils/MazeOverworldGenerator";
import { MapNode } from "../../core/types/MapTypes";

export class Overworld extends Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private nodes!: MapNode[];
  private maze!: number[][];
  private gridSize: number = 32;
  private isMoving: boolean = false;

  constructor() {
    super({ key: "Overworld" });
  }

  create(): void {
    // Generate maze-based overworld
    const gridWidth = this.cameras.main.width;
    const gridHeight = this.cameras.main.height;
    const result = MazeOverworldGenerator.generateMazeOverworld(gridWidth, gridHeight, this.gridSize);
    
    this.nodes = result.nodes;
    this.maze = result.maze;
    
    // Render the maze
    this.renderMaze();

    // Display nodes
    this.nodes.forEach((node) => {
      let displayChar = "";
      let displayColor = 0x000000;
      switch (node.type) {
        case "combat":
          displayChar = "⚔️";
          displayColor = 0xff0000;
          break;
        case "elite":
          displayChar = "👹";
          displayColor = 0xffa500;
          break;
        case "boss":
          displayChar = "👑";
          displayColor = 0x800080;
          break;
        case "shop":
          displayChar = "💰";
          displayColor = 0x00ff00;
          break;
        case "event":
          displayChar = "❓";
          displayColor = 0x0000ff;
          break;
        case "campfire":
          displayChar = "🔥";
          displayColor = 0xff4500;
          break;
        case "treasure":
          displayChar = "💎";
          displayColor = 0xffff00;
          break;
      }
      this.add.text(node.x + this.gridSize / 2, node.y + this.gridSize / 2, displayChar, {
        fontSize: `${this.gridSize / 2}px`,
        color: `#${displayColor.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5);
    });

    // Create the player at the center of the screen
    const startX = Math.floor(gridWidth / 2 / this.gridSize) * this.gridSize + this.gridSize / 2;
    const startY = Math.floor(gridHeight / 2 / this.gridSize) * this.gridSize + this.gridSize / 2;
    
    this.player = this.add.sprite(startX, startY, "avatar");
    this.player.setScale(2); // Scale up from 16x16 to 32x32
    this.player.setOrigin(0.5); // Center the sprite
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
  }

  renderMaze(): void {
    const cols = this.maze[0].length;
    const rows = this.maze.length;
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (this.maze[y][x] === 1) { // Wall
          this.add.rectangle(
            x * this.gridSize, 
            y * this.gridSize, 
            this.gridSize, 
            this.gridSize, 
            0x555555
          ).setOrigin(0, 0);
        } else { // Path
          this.add.rectangle(
            x * this.gridSize, 
            y * this.gridSize, 
            this.gridSize, 
            this.gridSize, 
            0x333333
          ).setOrigin(0, 0).setStrokeStyle(1, 0x444444);
        }
      }
    }
  }

  update(): void {
    // Skip input handling if player is currently moving
    if (this.isMoving) {
      return;
    }

    // Check for input
    if (this.cursors.left.isDown || this.wasdKeys['A'].isDown) {
      this.movePlayer(-this.gridSize, 0, "avatar_walk_left");
    } else if (this.cursors.right.isDown || this.wasdKeys['D'].isDown) {
      this.movePlayer(this.gridSize, 0, "avatar_walk_right");
    } else if (this.cursors.up.isDown || this.wasdKeys['W'].isDown) {
      this.movePlayer(0, -this.gridSize, "avatar_walk_down");
    } else if (this.cursors.down.isDown || this.wasdKeys['S'].isDown) {
      this.movePlayer(0, this.gridSize, "avatar_walk_down");
    }
  }

  movePlayer(deltaX: number, deltaY: number, animation: string): void {
    // Set moving flag to prevent input during movement
    this.isMoving = true;

    // Play walking animation
    this.player.play(animation, true);

    // Calculate new position
    let newX = this.player.x + deltaX;
    let newY = this.player.y + deltaY;

    // Check if the new position is valid (not a wall)
    if (this.isValidPosition(newX, newY)) {
      // Move player with tween
      this.tweens.add({
        targets: this.player,
        x: newX,
        y: newY,
        duration: 200,
        onComplete: () => {
          this.isMoving = false;
          this.checkNodeInteraction();
          // Play idle animation after movement
          this.player.play("avatar_idle_down");
        }
      });
    } else {
      // Invalid move, just reset the moving flag
      this.isMoving = false;
      this.player.play("avatar_idle_down");
    }
  }

  isValidPosition(x: number, y: number): boolean {
    // Convert world coordinates to grid coordinates
    const gridX = Math.floor((x - this.gridSize/2) / this.gridSize);
    const gridY = Math.floor((y - this.gridSize/2) / this.gridSize);
    
    // Check bounds
    if (gridX < 0 || gridX >= this.maze[0].length || gridY < 0 || gridY >= this.maze.length) {
      return false;
    }
    
    // Check if it's a path (0) not a wall (1)
    return this.maze[gridY][gridX] === 0;
  }

  checkNodeInteraction(): void {
    // Check if player is close to any node
    const threshold = this.gridSize / 2;

    const node = this.nodes.find((n) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, 
        this.player.y, 
        n.x + this.gridSize / 2, 
        n.y + this.gridSize / 2
      );
      return distance < threshold;
    });

    if (node) {
      if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
        this.startCombat(node.type);
      }
    }
  }

  startCombat(nodeType: string): void {
    const bars = [];
    const barHeight = this.cameras.main.height / 10;

    for (let i = 0; i < 10; i++) {
      const bar = this.add
        .rectangle(
          this.cameras.main.width,
          i * barHeight,
          this.cameras.main.width,
          barHeight,
          0x000000
        )
        .setOrigin(1, 0);

      bars.push(bar);
    }

    this.tweens.add({
      targets: bars,
      x: 0,
      duration: 500,
      ease: "Power2",
      delay: this.tweens.stagger(100),
      onComplete: () => {
        this.scene.start("Combat", { nodeType: nodeType });
      },
    });
  }
}
