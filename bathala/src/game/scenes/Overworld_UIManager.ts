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

          this.updateUI();
        }

        public updateUI(): void {
          this.updateDayNightProgressBar();
          this.updateBossText();
          this.updateNightOverlay();
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
      }

