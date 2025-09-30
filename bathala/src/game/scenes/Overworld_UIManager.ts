/**
 * OVERWORLD UI MANAGER
 * ===================
 * 
 * Manages all user interface elements and visual feedback systems for the Overworld scene.
 * This manager handles the complex UI requirements of the overworld exploration experience,
 * providing players with essential information and interactive elements.
 * 
 * CORE RESPONSIBILITIES:
 * • Player status display (health, currency, relics, potions)
 * • Day/night cycle visual indicators and progress tracking
 * • Boss encounter countdown and visual effects
 * • Interactive tooltip system for world objects and enemies
 * • Test/debug button management for development
 * • Scene transition visual effects and overlays
 * • Responsive UI that adapts to screen resizing
 * 
 * UI COMPONENTS:
 * • Compact left panel with player stats and inventory
 * • Dynamic health bar with visual feedback
 * • Currency display (Ginto/Diamante) with real-time updates
 * • Landás morality meter with visual alignment indicators
 * • Relic showcase with detailed information tooltips
 * • Potions quick-access bar with usage tracking
 * • Day/night progress bar with atmospheric overlay effects
 * • Boss encounter warning system with dramatic effects
 * 
 * TOOLTIP SYSTEM:
 * • Context-aware tooltips for enemies, nodes, and items
 * • Dynamic positioning to stay within screen bounds
 * • Rich content display with stats, descriptions, and lore
 * • Smooth show/hide animations with proper state management
 * • Mouse tracking for optimal tooltip placement
 * 
 * VISUAL EFFECTS:
 * • Night overlay with atmospheric darkening
 * • Boss appearance dramatic effects with screen shakes
 * • Smooth UI animations and transitions
 * • Responsive feedback for player interactions
 * 
 * This manager ensures the UI provides all necessary information while maintaining
 * clean visual design and smooth user experience throughout world exploration.
 */

import type { Overworld } from "./Overworld";
import { GameState } from "../../core/managers/GameState";
import { OverworldUIManagerTooltips } from "./Overworld_UIManager_Tooltips";
import { OverworldUIManagerHealthBar } from "./Overworld_UIManager_HealthBar";

export class OverworldUIManager {
        private readonly actionButtons: Phaser.GameObjects.Container[] = [];
        private bossText?: Phaser.GameObjects.Text;
        private dayNightIndicator?: Phaser.GameObjects.Text;
        private nightOverlay?: Phaser.GameObjects.Rectangle;
        private testButtonsContainer?: Phaser.GameObjects.Container;
        private toggleButton?: Phaser.GameObjects.Container;
        private testButtonsVisible = false;
        
        // Player info UI elements
        private uiContainer?: Phaser.GameObjects.Container;
        private relicsContainer?: Phaser.GameObjects.Container;
        private potionsContainer?: Phaser.GameObjects.Container;
        private discardText?: Phaser.GameObjects.Text;
        
        // Specialized UI managers
        private tooltipManager!: OverworldUIManagerTooltips;
        private healthBarManager!: OverworldUIManagerHealthBar;
        


        constructor(private readonly scene: Overworld) {
          this.tooltipManager = new OverworldUIManagerTooltips(this.scene);
          this.healthBarManager = new OverworldUIManagerHealthBar(this.scene);
        }

        public createUI(): void {
          const camera = this.camera;

          if (!camera) {
            console.warn("Camera not available, scheduling UI creation for next frame");
            this.scene.time.delayedCall(10, () => this.createUI());
            return;
          }

          this.destroyUI();
          this.ensureTestButtonsContainer();

          this.createDayNightProgressBar();
          this.createBossProgressText();
          this.createPrimaryButtons(camera.width);
          this.createQuickAccessButtons(camera.width, camera.height);
          this.createToggleButton();
          
          // Create player info UI
          this.createOverworldUI();
          
          // Initialize specialized managers
          this.tooltipManager.initialize();

          this.updateUI();
        }

        public updateUI(): void {
          this.updateDayNightProgressBar();
          this.updateBossText();
          this.updateNightOverlay();
          this.updateOverworldUI();
        }

        public updateNightOverlay(): void {
          const camera = this.camera;

          if (!camera) {
            return;
          }

          if (!this.gameState.isDay && !this.nightOverlay) {
            this.nightOverlay = this.scene.add
              .rectangle(camera.width / 2, camera.height / 2, camera.width, camera.height, 0x000033)
              .setAlpha(0.4)
              .setScrollFactor(0)
              .setDepth(999);
          } else if (this.gameState.isDay && this.nightOverlay) {
            this.nightOverlay.destroy();
            this.nightOverlay = undefined;
          }
        }

        public handleResize(): void {
          this.createUI();
        }

        private get camera(): Phaser.Cameras.Scene2D.Camera | null {
          return this.scene.cameras?.main ?? null;
        }

        private get gameState() {
          return this.scene.getGameState();
        }

        private get playerSprite() {
          return this.scene.getPlayerSprite();
        }

        private get playerData() {
          return this.scene.getPlayerData();
        }

        private ensureTestButtonsContainer(): Phaser.GameObjects.Container {
          if (!this.testButtonsContainer) {
            this.testButtonsContainer = this.scene.add.container(0, 0).setScrollFactor(0).setDepth(900);
          }

          return this.testButtonsContainer;
        }

        private destroyUI(): void {
          this.actionButtons.forEach((button) => button.destroy());
          this.actionButtons.length = 0;

          this.bossText?.destroy();
          this.bossText = undefined;

          this.dayNightIndicator?.destroy();
          this.dayNightIndicator = undefined;

          this.toggleButton?.destroy();
          this.toggleButton = undefined;

          this.testButtonsContainer?.destroy();
          this.testButtonsContainer = undefined;

          this.nightOverlay?.destroy();
          this.nightOverlay = undefined;
          
          // Destroy player info UI elements
          this.uiContainer?.destroy();
          this.uiContainer = undefined;
          
          // Clean up specialized managers
          this.tooltipManager?.destroy();
          this.healthBarManager?.destroy();
          
          this.relicsContainer?.destroy();
          this.relicsContainer = undefined;
          
          this.potionsContainer?.destroy();
          this.potionsContainer = undefined;
          
          this.discardText?.destroy();
          this.discardText = undefined;
        }

        private createDayNightProgressBar(): void {
          const camera = this.camera;

          if (!camera) {
            return;
          }

          const progressBarWidth = camera.width * 0.6;
          const progressBarX = (camera.width - progressBarWidth) / 2;
          const progressBarY = 80;
          const segmentWidth = progressBarWidth / 10;

          for (let i = 0; i < 10; i++) {
            const segmentX = progressBarX + i * segmentWidth + segmentWidth / 2;
            const isDay = i % 2 === 0;

            this.scene.add
              .rectangle(segmentX, progressBarY, segmentWidth, 4, isDay ? 0xfdD368 : 0x7144ff)
              .setAlpha(1)
              .setScrollFactor(0)
              .setDepth(100);
          }

          for (let i = 0; i <= 10; i++) {
            const tickX = progressBarX + (i * progressBarWidth) / 10;
            const isDay = i % 2 === 0;
            const color = i === 10 ? 0xff4444 : isDay ? 0xfdD368 : 0x7144ff;

            this.scene.add
              .rectangle(tickX, progressBarY, 4, 24, color)
              .setAlpha(1)
              .setScrollFactor(0)
              .setDepth(101);
          }

          const stepsPerSegment = 5;
          for (let i = 0; i < 10; i++) {
            const segmentStartX = progressBarX + i * segmentWidth;
            const isDay = i % 2 === 0;
            const segmentColor = isDay ? 0xfdD368 : 0x7144ff;

            for (let j = 1; j < stepsPerSegment; j++) {
              const tickX = segmentStartX + (j * segmentWidth) / stepsPerSegment;

              this.scene.add
                .rectangle(tickX, progressBarY, 2, 16, segmentColor)
                .setAlpha(1)
                .setScrollFactor(0)
                .setDepth(100);
            }
          }

          const iconOffset = progressBarWidth / 20;
          for (let i = 0; i < 10; i++) {
            const iconX = progressBarX + i * segmentWidth + iconOffset;
            const isDay = i % 2 === 0;
            const iconKey = isDay ? "bathala_sun_icon" : "bathala_moon_icon";

            this.scene.add.image(iconX, progressBarY - 50, iconKey).setScale(1.8).setScrollFactor(0).setDepth(103);
          }

          const bossIconX = progressBarX + progressBarWidth;
          this.scene.add.image(bossIconX, progressBarY - 50, "bathala_boss_icon").setScale(2).setScrollFactor(0).setDepth(103);

          this.dayNightIndicator = this.scene.add
            .text(progressBarX, progressBarY + 10, "▲", {
              fontFamily: "dungeon-mode-inverted",
              fontSize: "36px",
              color: "#E54646",
              align: "center",
            })
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(104);
        }

        private createBossProgressText(): void {
          this.bossText = this.scene.add
            .text(10, 40, this.getBossProgressLabel(), {
              fontFamily: "dungeon-mode",
              fontSize: "16px",
              color: "#ffffff",
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: { x: 10, y: 5 },
            })
            .setScrollFactor(0)
            .setDepth(1000);

          this.bossText.setShadow(2, 2, "#000000", 2, false, true);
        }

        private createPrimaryButtons(screenWidth: number): void {
          const buttonX = screenWidth - 150;
          let buttonY = 100;

          const entries: Array<{ label: string; color: string; handler: () => void }> = [
            { label: "Combat", color: "#ff0000", handler: () => this.scene.startCombat("combat") },
            { label: "Elite", color: "#ffa500", handler: () => this.scene.startCombat("elite") },
            { label: "Boss Fight", color: "#8b5cf6", handler: () => this.scene.startCombat("boss") },
            {
              label: "Shop",
              color: "#00ff00",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Shop", { player: this.playerData });
              },
            },
            { label: "Event", color: "#0000ff", handler: () => console.log("Event action triggered") },
            {
              label: "Campfire",
              color: "#ff4500",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Campfire", { player: this.getPlaceholderPlayerPayload() });
              },
            },
            {
              label: "Treasure",
              color: "#ffff00",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Treasure", { player: this.getPlaceholderPlayerPayload() });
              },
            },
          ];

          entries.forEach(({ label, color, handler }) => {
            this.createActionButton(buttonX, buttonY, label, color, handler);
            buttonY += 60;
          });
        }

        private createQuickAccessButtons(screenWidth: number, screenHeight: number): void {
          const bottomButtonY = screenHeight - 100;
          const buttonSpacing = 200;
          const buttonCount = 8;
          let currentButtonX = (screenWidth - (buttonCount - 1) * buttonSpacing) / 2;

          const entries: Array<{ label: string; color: string; handler: () => void }> = [
            { label: "Quick Boss", color: "#8b5cf6", handler: () => this.scene.startCombat("boss") },
            { label: "Quick Combat", color: "#ff0000", handler: () => this.scene.startCombat("combat") },
            { label: "Quick Elite", color: "#ffa500", handler: () => this.scene.startCombat("elite") },
            {
              label: "Quick Campfire",
              color: "#ff4500",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Campfire", { player: this.getPlaceholderPlayerPayload() });
              },
            },
            {
              label: "Quick Shop",
              color: "#00ff00",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Shop", { player: this.playerData });
              },
            },
            {
              label: "Quick Treasure",
              color: "#ffff00",
              handler: () => {
                const gameState = GameState.getInstance();
                const player = this.playerSprite;
                gameState.savePlayerPosition(player.x, player.y);

                this.scene.scene.pause();
                this.scene.scene.launch("Treasure", { player: this.getPlaceholderPlayerPayload() });
              },
            },
            {
              label: "DDA Debug",
              color: "#9c27b0",
              handler: () => {
                this.scene.scene.launch("DDADebugScene");
                this.scene.scene.pause();
              },
            },
          ];

          entries.forEach(({ label, color, handler }) => {
            this.createActionButton(currentButtonX, bottomButtonY, label, color, handler);
            currentButtonX += buttonSpacing;
          });
        }

        private createActionButton(x: number, y: number, text: string, color: string, callback: () => void): void {
          const scene = this.scene;
          const button = scene.add.container(x, y);
          const tempText = scene.add.text(0, 0, text, {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#ffffff",
          });

          const textWidth = tempText.width;
          const textHeight = tempText.height;
          tempText.destroy();

          const padding = 20;
          const buttonWidth = Math.max(120, textWidth + padding);
          const buttonHeight = Math.max(40, textHeight + 10);

          const background = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
          background.setStrokeStyle(2, parseInt(color.replace("#", ""), 16));

          const buttonText = scene.add
            .text(0, 0, text, {
              fontFamily: "dungeon-mode",
              fontSize: "14px",
              color: "#ffffff",
              align: "center",
            })
            .setOrigin(0.5);
          buttonText.setShadow(2, 2, "#000000", 2, false, true);

          button.add([background, buttonText]);
          button.setInteractive(
            new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
          );

          button.setDepth(1000);
          button.setScrollFactor(0);
          button.setVisible(this.testButtonsVisible);

          button.on("pointerdown", callback);
          button.on("pointerover", () => background.setFillStyle(0x555555));
          button.on("pointerout", () => background.setFillStyle(0x333333));

          this.ensureTestButtonsContainer().add(button);
          this.actionButtons.push(button);
        }

        private createToggleButton(): void {
          const camera = this.camera;

          if (!camera) {
            return;
          }

          this.toggleButton?.destroy();

          const toggleX = camera.width - 60;
          const toggleY = 50;
          const container = this.scene.add.container(toggleX, toggleY).setScrollFactor(0).setDepth(2000);

          const tempText = this.scene.add.text(0, 0, "Dev Mode", {
            fontFamily: "dungeon-mode",
            fontSize: "12px",
            color: "#ffffff",
          });

          const textWidth = tempText.width;
          const textHeight = tempText.height;
          tempText.destroy();

          const padding = 20;
          const buttonWidth = Math.max(100, textWidth + padding);
          const buttonHeight = Math.max(30, textHeight + 10);

          const background = this.scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
          background.setStrokeStyle(2, 0xffffff);

          const buttonText = this.scene.add
            .text(0, 0, "Dev Mode", {
              fontFamily: "dungeon-mode",
              fontSize: "12px",
              color: "#ffffff",
              align: "center",
            })
            .setOrigin(0.5);

          container.add([background, buttonText]);
          container.setInteractive(
            new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight),
            Phaser.Geom.Rectangle.Contains
          );

          container.on("pointerdown", () => this.toggleTestButtons());
          container.on("pointerover", () => background.setFillStyle(0x555555));
          container.on("pointerout", () => background.setFillStyle(0x333333));

          this.toggleButton = container;
          this.hideTestButtons();
        }

        private toggleTestButtons(): void {
          this.testButtonsVisible = !this.testButtonsVisible;

          this.actionButtons.forEach((button) => {
            button.setVisible(this.testButtonsVisible);
          });
        }

        private hideTestButtons(): void {
          this.testButtonsVisible = false;

          this.actionButtons.forEach((button) => button.setVisible(false));
        }

        private updateBossText(): void {
          if (!this.bossText) {
            return;
          }

          this.bossText.setText(this.getBossProgressLabel());

          if (this.gameState.getBossProgress() > 0.8 && !this.gameState.bossAppeared) {
            this.bossText.setColor("#ff0000");
          } else {
            this.bossText.setColor("#ffffff");
          }
        }

        private updateDayNightProgressBar(): void {
          const camera = this.camera;

          if (!camera || !this.dayNightIndicator) {
            return;
          }

          const progressBarWidth = camera.width * 0.6;
          const progressBarX = (camera.width - progressBarWidth) / 2;
          const progressBarY = 80;
          const totalProgress = Math.min(this.gameState.actionsTaken / this.gameState.totalActionsUntilBoss, 1);

          this.dayNightIndicator.setPosition(progressBarX + progressBarWidth * totalProgress, progressBarY + 25);

          if (totalProgress >= 1) {
            this.scene.checkBossEncounter();
          }
        }

        private getBossProgressLabel(): string {
          return `Boss Progress: ${Math.round(this.gameState.getBossProgress() * 100)}%`;
        }

        private getPlaceholderPlayerPayload() {
          return {
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
          };
        }

        // ========== Player Info UI Methods ==========

        private createOverworldUI(): void {
          const camera = this.camera;
          if (!camera) return;
          
          const screenHeight = camera.height;
          
          // Create main UI container positioned at top-left
          this.uiContainer = this.scene.add.container(0, 0);
          this.uiContainer.setScrollFactor(0).setDepth(1500);
          
          // Create compact left panel for all UI elements
          this.createCompactLeftPanel(screenHeight);
          
          // Update UI elements immediately
          this.updateOverworldUI();
        }

        private createCompactLeftPanel(screenHeight: number): void {
          if (!this.uiContainer) return;
          
          const panelWidth = 320;
          const panelHeight = Math.min(screenHeight - 40, 720);
          const panelX = 20;
          const panelY = screenHeight / 2 - panelHeight / 2;
          
          // Modern glass-morphism style background
          const panelBg = this.scene.add.graphics();
          panelBg.fillStyle(0x0a0a0a, 0.85);
          panelBg.lineStyle(1, 0x404040, 0.6);
          panelBg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
          panelBg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 20);
          
          // Subtle inner border for depth
          const innerBorder = this.scene.add.graphics();
          innerBorder.lineStyle(1, 0x606060, 0.3);
          innerBorder.strokeRoundedRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, 18);
          
          // Accent line on the left
          const accentLine = this.scene.add.graphics();
          accentLine.lineStyle(3, 0x00bcd4, 0.8);
          accentLine.beginPath();
          accentLine.moveTo(panelX + 8, panelY + 20);
          accentLine.lineTo(panelX + 8, panelY + panelHeight - 20);
          accentLine.strokePath();
          
          this.uiContainer.add([panelBg, innerBorder, accentLine]);
          
          // Modern header without heavy box
          const headerText = this.scene.add.text(panelX + 25, panelY + 25, "STATUS", {
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
          this.healthBarManager.createModernHealthSection(panelX + 20, currentY, panelWidth - 40, this.uiContainer!);
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

        private createSectionSeparator(x: number, y: number, width: number): void {
          if (!this.uiContainer) return;
          
          // Create a container for the separator elements
          const separatorContainer = this.scene.add.container(0, 0);
          
          // Background glow effect
          const glow = this.scene.add.graphics();
          glow.fillStyle(0x4A90E2, 0.15);
          glow.fillRect(x + width * 0.2, y - 1, width * 0.6, 3);
          separatorContainer.add(glow);
          
          // Main separator line
          const separator = this.scene.add.graphics();
          separator.lineStyle(1, 0x4A90E2, 0.6);
          separator.beginPath();
          separator.moveTo(x + width * 0.1, y);
          separator.lineTo(x + width * 0.9, y);
          separator.strokePath();
          separatorContainer.add(separator);
          
          // Accent dots for visual interest
          const leftDot = this.scene.add.graphics();
          leftDot.fillStyle(0x4A90E2, 0.8);
          leftDot.fillCircle(x + width * 0.1, y, 2);
          separatorContainer.add(leftDot);
          
          const rightDot = this.scene.add.graphics();
          rightDot.fillStyle(0x4A90E2, 0.8);
          rightDot.fillCircle(x + width * 0.9, y, 2);
          separatorContainer.add(rightDot);
          
          this.uiContainer.add(separatorContainer);
        }

        private createModernRelicsSection(x: number, y: number, width: number): void {
          if (!this.uiContainer) return;
          
          // Section header with organized spacing
          const relicsLabel = this.scene.add.text(x, y + 8, "RELICS", {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
          });
          relicsLabel.setShadow(2, 2, '#000000', 2, false, true);
          this.uiContainer.add(relicsLabel);
          
          // Grid container with organized spacing
          const gridBg = this.scene.add.graphics();
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
              
              const slot = this.scene.add.graphics();
              slot.fillStyle(0x2c2c2c, 0.6);
              slot.lineStyle(1, 0x404040, 0.8);
              slot.fillRoundedRect(slotX, slotY, slotSize, slotSize, 8);
              slot.strokeRoundedRect(slotX, slotY, slotSize, slotSize, 8);
              slot.setDepth(-10); // Set slots behind relics
              this.uiContainer.add(slot);
            }
          }
          
          // Create relics container for items
          this.relicsContainer = this.scene.add.container(gridStartX, gridStartY);
          this.relicsContainer.setDepth(10); // Ensure relics appear above slots
          this.uiContainer.add(this.relicsContainer);
          
          console.log('🎯 Created relicsContainer at:', { x: gridStartX, y: gridStartY, depth: this.relicsContainer.depth });
        }

        private createModernPotionsSection(x: number, y: number, width: number): void {
          if (!this.uiContainer) return;
          
          // Section header with organized spacing
          const potionsLabel = this.scene.add.text(x, y + 8, "POTIONS", {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
          });
          potionsLabel.setShadow(2, 2, '#000000', 2, false, true);
          this.uiContainer.add(potionsLabel);
          
          // Potions container with organized spacing
          const potionsBg = this.scene.add.graphics();
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
            
            const slot = this.scene.add.graphics();
            slot.fillStyle(0x2c2c2c, 0.6);
            slot.lineStyle(1, 0x404040, 0.8);
            slot.fillRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
            slot.strokeRoundedRect(slotX, potionStartY, slotSize, slotSize, 8);
            this.uiContainer.add(slot);
          }
          
          // Create potions container for items
          this.potionsContainer = this.scene.add.container(potionStartX, potionStartY);
          this.uiContainer.add(this.potionsContainer);
        }

        // ========== Update Methods (Delegation) ==========

        private updateOverworldUI(): void {
          this.healthBarManager.updateHealthBar();
          this.updateCurrencyDisplay();
          this.updateLandasDisplay();
          this.updateRelicsDisplay();
          this.updatePotionsDisplay();
        }

        private updateCurrencyDisplay(): void {
          this.healthBarManager.updateCurrencyDisplay();
        }

        private updateLandasDisplay(): void {
          this.healthBarManager.updateLandasDisplay();
        }

        private updateRelicsDisplay(): void {
          this.healthBarManager.updateRelicsDisplay();
        }

        private updatePotionsDisplay(): void {
          if (!this.potionsContainer) return;
          
          this.potionsContainer.removeAll(true);
          
          // Match the calculations from createModernPotionsSection
          const slotSize = 40;
          const slotSpacing = 18;
          const maxPotions = 3;
          
          const playerData = this.playerData;
          for (let i = 0; i < Math.min(playerData.potions.length, maxPotions); i++) {
            const potion = playerData.potions[i];
            const potionX = i * (slotSize + slotSpacing);
            const potionY = 0;
            
            // Create potion container
            const potionContainer = this.scene.add.container(potionX, potionY);
            
            // Potion background (slightly smaller than slot to create padding effect)
            const potionBg = this.scene.add.graphics();
            potionBg.fillStyle(0x000000, 0.6);
            potionBg.lineStyle(1, 0x555555, 0.8);
            potionBg.fillRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
            potionBg.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
            
            // Potion icon - centered in the slot
            const potionIcon = this.scene.add.text(slotSize/2, slotSize/2, "🧪", {
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
              this.scene.tweens.add({
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
              this.scene.tweens.add({
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
              () => (this.scene as any).usePotion(i)
            );
            
            const discardButton = this.createSmallPotionButton(
              potionX + slotSize - 8,
              potionY + 24,
              "D",
              0xaa0000,
              () => (this.scene as any).discardPotion(i)
            );
            
            this.potionsContainer.add([potionContainer, useButton, discardButton]);
          }
          
          // Update discard charges display
          if (this.discardText) {
            const playerData = this.playerData;
            this.discardText.setText(`${playerData.discardCharges || 1}/${playerData.maxDiscardCharges || 1}`);
          }
        }

        // ========== Utility Methods ==========

        private createSmallPotionButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
          const button = this.scene.add.container(x, y);
          
          const buttonSize = 12;
          const background = this.scene.add.graphics();
          background.fillStyle(color, 0.8);
          background.lineStyle(1, 0xffffff, 0.6);
          background.fillRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
          background.strokeRoundedRect(-buttonSize/2, -buttonSize/2, buttonSize, buttonSize, 2);
          
          const buttonText = this.scene.add.text(0, 0, text, {
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

        private createItemTooltip(_targetObject: Phaser.GameObjects.Text, title: string, description: string): void {
          const tooltip = this.scene.add.container(0, 0).setVisible(false).setDepth(2000);
          
          const tooltipBg = this.scene.add.graphics();
          tooltipBg.fillStyle(0x0a0a0a, 0.95);
          tooltipBg.lineStyle(2, 0x4a4a4a, 1);
          
          const tooltipTitle = this.scene.add.text(0, -15, title, {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#00d4ff",
            fontStyle: "bold",
            align: "center"
          }).setOrigin(0.5);
          
          const tooltipDesc = this.scene.add.text(0, 5, description, {
            fontFamily: "dungeon-mode",
            fontSize: "12px",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: 200 }
          }).setOrigin(0.5);
          
          const bounds = { width: 220, height: 60 };
          tooltipBg.fillRoundedRect(-bounds.width/2, -bounds.height/2, bounds.width, bounds.height, 8);
          tooltipBg.strokeRoundedRect(-bounds.width/2, -bounds.height/2, bounds.width, bounds.height, 8);
          
          tooltip.add([tooltipBg, tooltipTitle, tooltipDesc]);
          
          // Simple tooltip behavior - this is a minimal implementation
          // The full tooltip system will be implemented in the next step
        }

        // ========== Public Tooltip Methods (Delegation) ==========

        public showEnemyTooltip(nodeType: string, nodeId: string, mouseX?: number, mouseY?: number): void {
          this.tooltipManager.showEnemyTooltip(nodeType, nodeId, mouseX, mouseY);
        }

        public showNodeTooltip(nodeType: string, nodeId: string, mouseX: number, mouseY: number): void {
          this.tooltipManager.showNodeTooltip(nodeType, nodeId, mouseX, mouseY);
        }

        public hideTooltip(): void {
          this.tooltipManager.hideTooltip();
        }

        public getTooltipVisibility(): boolean {
          return this.tooltipManager.getTooltipVisibility();
        }

        public getLastHoveredNodeId(): string | undefined {
          return this.tooltipManager.getLastHoveredNodeId();
        }

        public setLastHoveredNodeId(nodeId: string | undefined): void {
          this.tooltipManager.setLastHoveredNodeId(nodeId);
        }

        public setTooltipTimer(timer: Phaser.Time.TimerEvent | undefined): void {
          this.tooltipManager.setTooltipTimer(timer);
        }

        public getTooltipTimer(): Phaser.Time.TimerEvent | undefined {
          return this.tooltipManager.getTooltipTimer();
        }

        public updateTooltipSizeAndPosition(mouseX?: number, mouseY?: number): void {
          this.tooltipManager.updateTooltipSizeAndPosition(mouseX, mouseY);
        }

        // ========== Node Events & Effects ==========

        public showNodeEvent(title: string, message: string, color: number): void {
          // Disable player movement during event
          this.scene.setIsMoving(true);
          
          // Create overlay
          const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000
          ).setAlpha(0.7).setScrollFactor(0).setDepth(2000);
          
          // Create dialog box
          const dialogBox = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            600,
            300,
            0x2f3542
          ).setStrokeStyle(3, color).setScrollFactor(0).setDepth(2001);
          
          // Create title
          const titleText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 - 100,
            title,
            {
              fontFamily: "dungeon-mode-inverted",
              fontSize: 32,
              color: `#${color.toString(16).padStart(6, '0')}`,
            }
          ).setOrigin(0.5).setScrollFactor(0).setDepth(2002);
          
          // Create message
          const messageText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
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
          
          const continueButton = this.scene.add.container(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2 + 100
          ).setScrollFactor(0).setDepth(2002);
          
          const buttonBg = this.scene.add.rectangle(0, 0, 150, 40, 0x3d4454)
            .setStrokeStyle(2, color);
          const buttonText = this.scene.add.text(0, 0, buttonTextContent, {
            fontFamily: "dungeon-mode",
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
            this.scene.setIsMoving(false);
          });
          
          continueButton.on('pointerover', () => {
            buttonBg.setFillStyle(0x4a5464);
          });
          
          continueButton.on('pointerout', () => {
            buttonBg.setFillStyle(0x3d4454);
          });
        }

        public createBossAppearanceEffect(): void {
          // Screen shake effect
          this.scene.cameras.main.shake(2000, 0.02);
          
          // Screen flash effect
          const flashOverlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0xff0000
          ).setAlpha(0).setScrollFactor(0).setDepth(3000);
          
          // Flash sequence
          this.scene.tweens.add({
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
          const bossText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
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
          this.scene.tweens.add({
            targets: bossText,
            alpha: 1,
            scale: { from: 0.5, to: 1.2 },
            duration: 1000,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Fade out after showing
              this.scene.tweens.add({
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
          const darkOverlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000
          ).setAlpha(0).setScrollFactor(0).setDepth(2999);
          
          this.scene.tweens.add({
            targets: darkOverlay,
            alpha: 0.8,
            duration: 2500,
            ease: 'Power2'
          });
        }

        public showBossAppearance(): void {
          // Disable player movement during boss appearance
          this.scene.setIsMoving(true);
          
          // Create overlay
          const overlay = this.scene.add.rectangle(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            0x000000
          ).setAlpha(0).setScrollFactor(0).setDepth(3000);
          
          // Fade in overlay
          this.scene.tweens.add({
            targets: overlay,
            alpha: 0.8,
            duration: 1000,
            ease: 'Power2'
          });
          
          // Create boss appearance text
          const bossText = this.scene.add.text(
            this.scene.cameras.main.width / 2,
            this.scene.cameras.main.height / 2,
            "THE BOSS APPROACHES...",
            {
              fontFamily: "dungeon-mode-inverted",
              fontSize: 48,
              color: "#ff0000",
              align: "center"
            }
          ).setOrigin(0.5).setScrollFactor(0).setDepth(3001).setScale(0.1);
          
          // Animate text scaling
          this.scene.tweens.add({
            targets: bossText,
            scale: 1,
            duration: 1500,
            ease: 'Elastic.easeOut'
          });
          
          // Shake camera for dramatic effect
          this.scene.cameras.main.shake(2000, 0.02);
          
          // After delay, start boss combat
          this.scene.time.delayedCall(3000, () => {
            // Clean up
            overlay.destroy();
            bossText.destroy();
            
            // Start boss combat
            this.scene.startCombat("boss");
          });
        }
      }

