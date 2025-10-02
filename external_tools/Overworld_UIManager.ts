import type { Overworld } from "./Overworld";
import { GameState } from "../../core/managers/GameState";

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
        private healthBar?: Phaser.GameObjects.Graphics;
        private healthText?: Phaser.GameObjects.Text;
        private currencyText?: Phaser.GameObjects.Text;
        private diamanteText?: Phaser.GameObjects.Text;
        private landasText?: Phaser.GameObjects.Text;
        private landasMeterIndicator?: Phaser.GameObjects.Graphics;
        private relicsContainer?: Phaser.GameObjects.Container;
        private potionsContainer?: Phaser.GameObjects.Container;
        private discardText?: Phaser.GameObjects.Text;
        


        constructor(private readonly scene: Overworld) {}

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
          this.createEnemyTooltip();

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
          
          this.healthBar?.destroy();
          this.healthBar = undefined;
          
          this.healthText?.destroy();
          this.healthText = undefined;
          
          this.currencyText?.destroy();
          this.currencyText = undefined;
          
          this.diamanteText?.destroy();
          this.diamanteText = undefined;
          
          this.landasText?.destroy();
          this.landasText = undefined;
          
          this.landasMeterIndicator?.destroy();
          this.landasMeterIndicator = undefined;
          
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

        private createModernHealthSection(x: number, y: number, width: number): void {
          if (!this.uiContainer) return;
          
          // Section container with subtle background - shortened to fit only currency section
          const sectionBg = this.scene.add.graphics();
          sectionBg.fillStyle(0x1a1a1a, 0.4);
          sectionBg.lineStyle(1, 0x333333, 0.5);
          sectionBg.fillRoundedRect(x - 5, y - 5, width + 10, 115, 12);
          sectionBg.strokeRoundedRect(x - 5, y - 5, width + 10, 115, 12);
          this.uiContainer.add(sectionBg);
          
          // Health header with properly aligned elements
          const healthIcon = this.scene.add.text(x, y + 8, "♥", {
            fontSize: "18px",
            color: "#e74c3c",
            fontStyle: "bold"
          }).setOrigin(0, 0.5);
          healthIcon.setShadow(2, 2, '#000000', 2, false, true);
          
          const healthLabel = this.scene.add.text(x + 25, y + 8, "HEALTH", {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0, 0.5);
          healthLabel.setShadow(2, 2, '#000000', 2, false, true);
          
          // Health value center-aligned
          const playerData = this.playerData;
          this.healthText = this.scene.add.text(x + width/2 + 30, y + 8, `${playerData.currentHealth}/${playerData.maxHealth}`, {
            fontFamily: "dungeon-mode",
            fontSize: "14px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center"
          }).setOrigin(0.5, 0.5);
          this.healthText.setShadow(2, 2, '#000000', 2, false, true);
          
          // Modern health bar container with organized spacing
          const healthBarBg = this.scene.add.graphics();
          healthBarBg.fillStyle(0x2c2c2c, 0.8);
          healthBarBg.fillRoundedRect(x, y + 40, width - 10, 12, 6);
          this.uiContainer.add(healthBarBg);
          
          // Health bar fill
          this.healthBar = this.scene.add.graphics();
          this.uiContainer.add(this.healthBar);
          
          // Currency section with properly aligned elements
          const gintoIcon = this.scene.add.text(x, y + 70, "💰", {
            fontSize: "16px"
          }).setOrigin(0, 0.5);
          gintoIcon.setShadow(2, 2, '#000000', 2, false, true);
          
          const gintoLabel = this.scene.add.text(x + 25, y + 70, "GINTO", {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0, 0.5);
          gintoLabel.setShadow(2, 2, '#000000', 2, false, true);
          
          // Left-aligned GINTO value - moved further right
          this.currencyText = this.scene.add.text(x + 120, y + 70, `${playerData.ginto}`, {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "left"
          }).setOrigin(0, 0.5);
          this.currencyText.setShadow(2, 2, '#000000', 2, false, true);
          
          // Diamante currency display with properly aligned elements
          const diamanteIcon = this.scene.add.text(x, y + 95, "💎", {
            fontSize: "16px"
          }).setOrigin(0, 0.5);
          diamanteIcon.setShadow(2, 2, '#000000', 2, false, true);
          
          const diamanteLabel = this.scene.add.text(x + 25, y + 95, "DIAMANTE", {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0, 0.5);
          diamanteLabel.setShadow(2, 2, '#000000', 2, false, true);
          
          // Left-aligned DIAMANTE value - moved further right
          this.diamanteText = this.scene.add.text(x + 120, y + 95, `${playerData.diamante}`, {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "left"
          }).setOrigin(0, 0.5);
          this.diamanteText.setShadow(2, 2, '#000000', 2, false, true);
          
          // Landás meter with more spacing from currency section
          this.createLandasMeter(x, y + 140, width - 10, 18);
          
          this.uiContainer.add([healthIcon, healthLabel, gintoIcon, gintoLabel, diamanteIcon, diamanteLabel, this.healthText, this.currencyText, this.diamanteText]);
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

        private createLandasMeter(x: number, y: number, width: number, height: number): void {
          if (!this.uiContainer) return;
          
          // Enhanced "LANDAS" label positioned above the meter
          const landasLabel = this.scene.add.text(x + width / 2, y - 5, "LANDAS", {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0.5, 1);
          landasLabel.setShadow(1, 1, '#000000', 2, false, true);
          this.uiContainer.add(landasLabel);
          
          // Enhanced meter background with gradient
          const meterBg = this.scene.add.graphics();
          meterBg.fillGradientStyle(0x0a0a0a, 0x0a0a0a, 0x000000, 0x000000, 0.95);
          meterBg.lineStyle(2, 0x666666, 0.8);
          meterBg.fillRoundedRect(x, y, width, height, 6);
          meterBg.strokeRoundedRect(x, y, width, height, 6);
          
          // Add inner border for depth
          const innerBorder = this.scene.add.graphics();
          innerBorder.lineStyle(1, 0x444444, 0.5);
          innerBorder.strokeRoundedRect(x + 1, y + 1, width - 2, height - 2, 5);
          
          this.uiContainer.add([meterBg, innerBorder]);
          
          // Enhanced gradient meter fill with smoother transition
          const gradientFill = this.scene.add.graphics();
          // Conquest side with enhanced red gradient
          gradientFill.fillGradientStyle(0xff0000, 0xdc143c, 0xb71c1c, 0x8b0000, 0.7);
          gradientFill.fillRoundedRect(x + 2, y + 2, (width - 4) / 2, height - 4, 4);
          
          // Mercy side with enhanced blue gradient
          gradientFill.fillGradientStyle(0x0080ff, 0x1e90ff, 0x4169e1, 0x0047ab, 0.7);
          gradientFill.fillRoundedRect(x + 2 + (width - 4) / 2, y + 2, (width - 4) / 2, height - 4, 4);
          
          this.uiContainer.add(gradientFill);
          
          // Enhanced indicator line with glow effect
          this.landasMeterIndicator = this.scene.add.graphics();
          this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
          this.landasMeterIndicator.beginPath();
          this.landasMeterIndicator.moveTo(x + width / 2, y);
          this.landasMeterIndicator.lineTo(x + width / 2, y + height);
          this.landasMeterIndicator.closePath();
          this.landasMeterIndicator.strokePath();
          
          // Add glow effect to indicator
          const indicatorGlow = this.scene.add.graphics();
          indicatorGlow.lineStyle(1, 0xffffff, 0.4);
          indicatorGlow.beginPath();
          indicatorGlow.moveTo(x + width / 2, y);
          indicatorGlow.lineTo(x + width / 2, y + height);
          indicatorGlow.closePath();
          indicatorGlow.strokePath();
          
          this.uiContainer.add([this.landasMeterIndicator, indicatorGlow]);
          
          // Enhanced labels with better positioning and smaller font
          const conquestLabel = this.scene.add.text(x + 8, y + height / 2, "CONQUEST", {
            fontFamily: "dungeon-mode",
            fontSize: "8px",
            color: "#ff6b6b",
            fontStyle: "bold"
          }).setOrigin(0, 0.5);
          conquestLabel.setShadow(1, 1, '#000000', 1, false, true);
          
          const mercyLabel = this.scene.add.text(x + width - 8, y + height / 2, "MERCY", {
            fontFamily: "dungeon-mode",
            fontSize: "8px",
            color: "#74c0fc",
            fontStyle: "bold"
          }).setOrigin(1, 0.5);
          mercyLabel.setShadow(1, 1, '#000000', 1, false, true);
          
          this.uiContainer.add([conquestLabel, mercyLabel]);
          
          // Enhanced value text - positioned in center
          this.landasText = this.scene.add.text(x + width / 2, y + height / 2, "0", {
            fontFamily: "dungeon-mode",
            fontSize: "10px",
            color: "#ffffff",
            fontStyle: "bold"
          }).setOrigin(0.5, 0.5);
          this.landasText.setShadow(1, 1, '#000000', 2, false, true);
          this.uiContainer.add(this.landasText);
        }

        // ========== Update Methods ==========

        private updateOverworldUI(): void {
          this.updateHealthBar();
          this.updateCurrencyDisplay();
          this.updateLandasDisplay();
          this.updateRelicsDisplay();
          this.updatePotionsDisplay();
        }

        private updateHealthBar(): void {
          if (!this.healthBar || !this.healthText) return;
          
          const playerData = this.playerData;
          const healthPercent = playerData.currentHealth / playerData.maxHealth;
          
          this.healthBar.clear();
          
          // Modern health bar position calculation - updated to match new layout
          const panelX = 20;
          const panelWidth = 320;
          const camera = this.camera;
          if (!camera) return;
          
          const screenHeight = camera.height;
          const panelHeight = Math.min(screenHeight - 40, 720);
          const panelY = screenHeight / 2 - panelHeight / 2;
          
          const healthSectionY = panelY + 70; // After header with organized spacing
          const barX = panelX + 20; // Health section x position
          const barY = healthSectionY + 40; // Health bar y position within section (adjusted from 50 to 40)
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
          
          // Update health text - maintain center alignment
          this.healthText.setText(`${playerData.currentHealth}/${playerData.maxHealth}`);
          
          // Modern low health effects
          if (healthPercent < 0.25) {
            this.healthText.setShadow(1, 1, '#e74c3c', 2, false, true);
          } else {
            this.healthText.setShadow(2, 2, '#000000', 2, false, true);
            this.scene.tweens.killTweensOf(this.healthText);
            this.healthText.setScale(1, 1);
          }
        }

        private updateCurrencyDisplay(): void {
          if (!this.currencyText || !this.diamanteText) return;
          
          const playerData = this.playerData;
          this.currencyText.setText(`${playerData.ginto}`);
          this.diamanteText.setText(`${playerData.diamante}`);
        }

        private updateLandasDisplay(): void {
          if (!this.landasText || !this.landasMeterIndicator) return;
          
          const playerData = this.playerData;
          const score = playerData.landasScore;
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
          const camera = this.camera;
          if (!camera) return;
          
          const screenHeight = camera.height;
          const panelHeight = 700;
          const panelY = screenHeight / 2 - panelHeight / 2;
          const meterX = 45; // panelX + 20 + 5 = 20 + 20 + 5 = 45
          const meterY = panelY + 60 + 148 + 10; // panelY + health section offset + landas meter offset + padding
          const normalizedScore = (score + 10) / 20; // Normalize to 0-1
          const indicatorX = meterX + (normalizedScore * meterWidth);
          
          // Update indicator position
          this.landasMeterIndicator.clear();
          this.landasMeterIndicator.lineStyle(3, 0xffffff, 1);
          this.landasMeterIndicator.beginPath();
          this.landasMeterIndicator.moveTo(indicatorX, meterY);
          this.landasMeterIndicator.lineTo(indicatorX, meterY + 20);
          this.landasMeterIndicator.closePath();
          this.landasMeterIndicator.strokePath();
          
          // Update text display
          this.landasText.setText(`${score >= 0 ? '+' : ''}${score}`);
          this.landasText.setColor(color);
        }

        private updateRelicsDisplay(): void {
          if (!this.relicsContainer) return;
          
          const playerData = this.playerData;
          console.log('🎯 updateRelicsDisplay called with', playerData.relics.length, 'relics');
          console.log('🎯 Player relics:', playerData.relics.map((r: any) => r.name || r.id));
          this.relicsContainer.removeAll(true);
          
          const slotSize = 45; // Match the slot size from createModernRelicsSection
          const slotSpacing = 12; // Slightly reduced spacing to better fit
          const slotsPerRow = 4;
          const maxRelics = 8; // 4x2 grid
          
          // Position relics relative to the container (which is already at gridStartX, gridStartY)
          // No offset needed since container is positioned correctly
          
          for (let i = 0; i < Math.min(playerData.relics.length, maxRelics); i++) {
            const relic = playerData.relics[i];
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            
            // Position relative to container origin - matches slot positioning exactly
            const relicX = col * (slotSize + slotSpacing);
            const relicY = row * (slotSize + slotSpacing);
            
            // Create modern Persona-style relic container
            const relicContainer = this.scene.add.container(relicX, relicY);
            // Don't set depth here - let it inherit from parent uiContainer
            
            // Relic background with modern gradient (no border)
            const relicBg = this.scene.add.graphics();
            relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
            relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
            
            // Inner glow effect (subtle, no blue)
            const innerGlow = this.scene.add.graphics();
            innerGlow.lineStyle(1, 0x333344, 0.4);
            innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
            
            // Relic icon with size adjusted for 45px slots
            const relicIcon = this.scene.add.text(slotSize/2, slotSize/2, relic.emoji, {
              fontSize: "24px", // Reduced to fit better in 45px slots
              align: "center"
            }).setOrigin(0.5);
            relicIcon.setShadow(1, 1, '#000000', 2, false, true);
            
            relicContainer.add([relicBg, innerGlow, relicIcon]);
            
            // Create hover tooltip container (initially hidden)
            const tooltipContainer = this.scene.add.container(slotSize/2, -50);
            
            const tooltipBg = this.scene.add.graphics();
            tooltipBg.fillStyle(0x0a0a0a, 0.95);
            tooltipBg.lineStyle(2, 0x00d4ff, 1);
            
            const tooltipText = this.scene.add.text(0, 0, relic.name, {
              fontFamily: "dungeon-mode",
              fontSize: "12px", // Better readable size
              color: "#00d4ff",
              fontStyle: "bold",
              align: "center"
            }).setOrigin(0.5);
            tooltipText.setShadow(1, 1, '#000000', 2, false, true);
            
            // Dynamically size tooltip based on text
            const textBounds = tooltipText.getBounds();
            const tooltipWidth = Math.max(textBounds.width + 16, 80);
            const tooltipHeight = textBounds.height + 12;
            
            tooltipBg.fillRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
            tooltipBg.strokeRoundedRect(-tooltipWidth/2, -tooltipHeight/2, tooltipWidth, tooltipHeight, 6);
            
            tooltipContainer.add([tooltipBg, tooltipText]);
            tooltipContainer.setVisible(false);
            tooltipContainer.setAlpha(0);
            
            relicContainer.add(tooltipContainer);
            
            // Make the entire container interactive with proper hit area
            relicContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, slotSize, slotSize), Phaser.Geom.Rectangle.Contains);
            
            // Enable input events
            relicContainer.input!.enabled = true;
            
            // Set proper interactivity for the relic container
            relicContainer.setScrollFactor(0); // Ensure container stays screen-fixed
            relicContainer.setDepth(15); // Higher than slots but lower than tooltips
            
            relicContainer.on('pointerover', () => {
              console.log('🔥 Relic hover START:', relic.name, 'at position:', relicX, relicY);
              
              // Enhanced background on hover (no blue border)
              relicBg.clear();
              relicBg.fillGradientStyle(0x2a2a4e, 0x2a2a4e, 0x1f2439, 0x1f2439, 1);
              relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
              
              // Enhanced glow (subtle highlight)
              innerGlow.clear();
              innerGlow.lineStyle(2, 0x555566, 0.8);
              innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
              
              // Scale animation
              this.scene.tweens.add({
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
              this.scene.tweens.add({
                targets: tooltipContainer,
                alpha: 1,
                y: -tooltipHeight - 10,
                duration: 200,
                ease: 'Back.easeOut'
              });
              
              // Change cursor
              this.scene.input.setDefaultCursor('pointer');
            });
            
            relicContainer.on('pointerout', () => {
              console.log('❄️ Relic hover END:', relic.name);
              
              // Restore original background (no blue border)
              relicBg.clear();
              relicBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f1419, 0x0f1419, 0.95);
              relicBg.fillRoundedRect(0, 0, slotSize, slotSize, 8);
              
              // Restore glow (subtle)
              innerGlow.clear();
              innerGlow.lineStyle(1, 0x333344, 0.4);
              innerGlow.strokeRoundedRect(2, 2, slotSize - 4, slotSize - 4, 6);
              
              // Scale back to normal
              this.scene.tweens.add({
                targets: relicContainer,
                scale: 1,
                duration: 200,
                ease: 'Power2'
              });
              
              // Hide tooltip with fade out and slide down animation
              this.scene.tweens.add({
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
              this.scene.input.setDefaultCursor('default');
            });
            
            relicContainer.on('pointerdown', () => {
              console.log('🛡️ Relic CLICKED:', relic.name);
              this.showRelicDetails(relic);
            });
            
            this.relicsContainer.add(relicContainer);
          }
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

        private showRelicDetails(relic: any): void {
          // Call the scene's showRelicDetails method for now
          // This will be fully moved to UIManager in the next step
          (this.scene as any).showRelicDetails(relic);
        }

        private createEnemyTooltip(): void {
          // Placeholder for enemy tooltip system
          // This will be implemented when moving the tooltip system
        }
      }

