import { Scene, GameObjects } from "phaser";
import { MusicLifecycleSystem } from "../../systems/audio/MusicLifecycleSystem";
import { AudioSystem } from "../../systems/audio/AudioSystem";
import { SettingsManager, type GameSettings } from "../../core/managers/SettingsManager";
import { createButton } from "../ui/Button";

export class Settings extends Scene {
  background: GameObjects.Image;
  title: GameObjects.Text;
  menuTexts: GameObjects.Text[] = [];
  versionText: GameObjects.Text;
  footerText: GameObjects.Text;
  scanlines: GameObjects.TileSprite;
  scanlineTimer: number = 0;
  backButton: GameObjects.Text;
  private musicLifecycle!: MusicLifecycleSystem;
  private settings = SettingsManager.getInstance();

  constructor() {
    super("Settings");
  }

  create() {
    // Set camera background color to custom background color ONLY
    this.cameras.main.setBackgroundColor(0x150E10); // Updated background color (#150E10)

    // Start settings music via MusicLifecycleSystem
    this.musicLifecycle = new MusicLifecycleSystem(this);
    this.musicLifecycle.start();

    // Create background effects
    this.createBackgroundEffects();

    // Create UI elements
    // Ensure persisted audio settings are applied (music volume/mute).
    this.settings.applyToAudio();
    this.showRoot();
  }

  /**
   * Fully clear current Settings UI and input.
   * Some UI elements were getting removed visually but still responding to clicks;
   * this ensures all interactive objects + handlers are torn down before rebuilding.
   */
  private clearSettingsUI(): void {
    // Remove any scene-level input listeners (wheel/pointer handlers, etc.)
    this.input.removeAllListeners();
    this.input.keyboard?.removeAllListeners();

    // Phaser can keep "interactive objects" queued for removal; explicitly clear them now
    // for all current children (and container descendants) before destroying.
    const existing = [...this.children.list];
    for (const obj of existing) {
      try {
        this.input.clear(obj, true);
      } catch {
        // ignore
      }

      const anyObj = obj as any;
      const childList: unknown = anyObj?.list;
      if (Array.isArray(childList)) {
        for (const child of childList) {
          try {
            this.input.clear(child, true);
          } catch {
            // ignore
          }
        }
      }
    }

    // Destroy all display objects (including their input hit areas)
    this.children.removeAll(true);

    // Stop any tweens that might still be acting on destroyed targets
    this.tweens.killAll();

    // Ensure DOM-like "top only" behavior (should be default, but enforce it).
    this.input.topOnly = true;
  }

  /**
   * Create prominent CRT scanline effect
   */
  private createBackgroundEffects(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Create more prominent scanlines using a tile sprite
    this.scanlines = this.add.tileSprite(0, 0, width, height, '__WHITE')
      .setOrigin(0)
      .setAlpha(0.15) // Increased opacity for more prominence
      .setTint(0x77888C);
      
    // Create a more pronounced scanline pattern
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 2); // Thicker lines
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 2, 4, 2); // Thicker lines
    
    graphics.generateTexture('settings_scanline', 4, 4);
    this.scanlines.setTexture('settings_scanline');
    
    // Move background to the back
    this.scanlines.setDepth(-10);
  }

  /**
   * Create UI elements
   */
  private createUI(): void {
    // Clear existing menu texts
    this.menuTexts = [];

    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add version text in top right with more margin using dungeon-mode font
    this.versionText = this.add
      .text(screenWidth - 40, 40, "0.5.0", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C", // --primary
        align: "right",
      })
      .setOrigin(1, 0);

    // Add footer text with more margin using dungeon-mode font
    this.footerText = this.add
      .text(screenWidth/2, screenHeight - 40, "Bathala. Developed by Devlocke. Copyright 2025.", {
        fontFamily: "dungeon-mode",
        fontSize: 16,
        color: "#77888C", // --primary
        align: "center",
      })
      .setOrigin(0.5, 1);

    // Center the content vertically on the screen
    const centerY = screenHeight / 2;
    
    // Create "settings" text with Pixeled English Font
    this.createStraightTitle(screenWidth / 2, centerY - 150, "settings");

    // Root menu buttons (MainMenu style)
    const options = [
      { label: "Audio", action: () => this.showAudioSettings() },
      { label: "Video", action: () => this.showVideoSettings() },
      { label: "Controls", action: () => this.showControls() },
      { label: "Back", action: () => this.scene.start("MainMenu") },
    ];

    const startY = centerY - 30;
    const spacing = 70;
    const fixedWidth = 260;

    options.forEach((o, i) => {
      const btn = createButton(this, screenWidth / 2, startY + i * spacing, o.label, o.action, fixedWidth);
      this.menuTexts.push(btn.list.find(x => x instanceof GameObjects.Text) as GameObjects.Text);
    });
  }

  /**
   * Create a straight title with Pixeled English Font and updated color
   */
  private createStraightTitle(x: number, y: number, text: string): void {
    // Create the text with styling
    const titleText = this.add
      .text(x, y, text, {
        fontFamily: "Pixeled English Font", // Updated font
        fontSize: 100, // Smaller than main title
        color: "#77888C", // Updated color
      })
      .setOrigin(0.5);
    
    // Add subtle shadow
    titleText.setShadow(2, 2, '#000000', 0, true, false);
  }

  /**
   * Update method for animation effects
   */
  update(_time: number, delta: number): void {
    // Animate the scanlines
    if (this.scanlines) {
      this.scanlineTimer += delta;
      // Move scanlines vertically to simulate CRT effect at a faster pace
      this.scanlines.tilePositionY = this.scanlineTimer * 0.1; // Increased speed
    }
  }

  /**
   * Audio settings with functional volume controls
   */
  private showAudioSettings(): void {
    // Clear existing UI
    this.clearSettingsUI();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "audio settings");
    
    const current = this.settings.get();
    const sliderWidth = Math.min(520, screenWidth * 0.45);
    const sliderStartY = 180;
    const sliderSpacing = 72;

    const sliders: Array<{
      label: string;
      key: keyof Pick<GameSettings, "masterVolume" | "musicVolume" | "ambientVolume" | "sfxVolume" | "uiVolume" | "voiceVolume">;
    }> = [
      { label: "Master Volume", key: "masterVolume" },
      { label: "Music Volume", key: "musicVolume" },
      { label: "Ambient Volume", key: "ambientVolume" },
      { label: "SFX Volume", key: "sfxVolume" },
      { label: "UI Volume", key: "uiVolume" },
      { label: "Voice Volume", key: "voiceVolume" },
    ];

    sliders.forEach((slider, index) => {
      this.createVolumeSlider(
        screenWidth / 2,
        sliderStartY + index * sliderSpacing,
        slider.label,
        current[slider.key],
        (volume: number) => {
          this.settings.set({ [slider.key]: volume } as Partial<GameSettings>);
          this.settings.applyToAudio();
        },
        sliderWidth,
      );
    });

    const muteButtons: Array<{
      key: keyof Pick<GameSettings, "muteMaster" | "muteMusic" | "muteAmbient" | "muteSfx" | "muteUi" | "muteVoice">;
      label: string;
      x: number;
      y: number;
    }> = [
      { key: "muteMaster", label: "Master", x: screenWidth / 2 - 270, y: screenHeight - 305 },
      { key: "muteMusic", label: "Music", x: screenWidth / 2, y: screenHeight - 305 },
      { key: "muteAmbient", label: "Ambient", x: screenWidth / 2 + 270, y: screenHeight - 305 },
      { key: "muteSfx", label: "SFX", x: screenWidth / 2 - 270, y: screenHeight - 235 },
      { key: "muteUi", label: "UI", x: screenWidth / 2, y: screenHeight - 235 },
      { key: "muteVoice", label: "Voice", x: screenWidth / 2 + 270, y: screenHeight - 235 },
    ];

    muteButtons.forEach((button) => {
      const isMuted = this.settings.get()[button.key];
      createButton(
        this,
        button.x,
        button.y,
        `${button.label}: ${isMuted ? "OFF" : "ON"}`,
        () => {
          const updatedValue = !this.settings.get()[button.key];
          this.settings.set({ [button.key]: updatedValue } as Partial<GameSettings>);
          this.settings.applyToAudio();
          this.showAudioSettings();
        },
        250,
      );
    });

    createButton(
      this,
      screenWidth / 2 - 170,
      screenHeight - 165,
      "Play Test SFX",
      () => {
        const audioSystem = AudioSystem.getInstance();
        audioSystem.triggerUIAction(this, "confirm", { volume: 0.9 });
      },
      280,
    );

    createButton(
      this,
      screenWidth / 2 + 170,
      screenHeight - 165,
      "Reset Audio",
      () => {
        this.settings.set({
          masterVolume: 1,
          musicVolume: 0.5,
          ambientVolume: 0.8,
          sfxVolume: 0.7,
          uiVolume: 1,
          voiceVolume: 1,
          muteMaster: false,
          muteMusic: false,
          muteAmbient: false,
          muteSfx: false,
          muteUi: false,
          muteVoice: false,
        });
        this.settings.applyToAudio();
        this.showAudioSettings();
      },
      280,
    );
    
    // Add back button
    this.createBackButton();
  }
  
  /**
   * Create an interactive volume slider
   */
  private createVolumeSlider(
    x: number,
    y: number,
    label: string,
    initialVolume: number,
    onChange: (volume: number) => void,
    sliderWidth: number = 400,
  ): void {
    // Label
    this.add.text(x, y - 30, label, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Slider background
    const sliderHeight = 20;
    this.add.rectangle(x, y, sliderWidth, sliderHeight, 0x1f1410)
      .setStrokeStyle(2, 0x77888C);
    
    // Slider fill - positioned from left edge
    const sliderFill = this.add.rectangle(
      x - sliderWidth/2,
      y,
      sliderWidth * initialVolume,
      sliderHeight - 4,
      0x77888C
    ).setOrigin(0, 0.5);
    
    // Slider handle
    const handleSize = 30;
    const sliderHandle = this.add.rectangle(
      x - sliderWidth/2 + sliderWidth * initialVolume,
      y,
      handleSize,
      handleSize,
      0xe8eced
    ).setStrokeStyle(2, 0x77888C);
    
    // Volume percentage text
    const volumeText = this.add.text(
      x + sliderWidth/2 + 60,
      y,
      `${Math.round(initialVolume * 100)}%`,
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    ).setOrigin(0, 0.5);
    
    // Make slider interactive
    const sliderZone = this.add.rectangle(x, y, sliderWidth + 40, sliderHeight + 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true, draggable: true });
    
    const updateSlider = (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (x - sliderWidth/2);
      const volume = Phaser.Math.Clamp(localX / sliderWidth, 0, 1);
      
      // Update visuals - fill grows from left
      sliderFill.width = sliderWidth * volume;
      sliderHandle.x = x - sliderWidth/2 + sliderWidth * volume;
      volumeText.setText(`${Math.round(volume * 100)}%`);
      
      // Call onChange callback
      onChange(volume);
    };
    
    sliderZone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer);
    });
    
    sliderZone.on("drag", (pointer: Phaser.Input.Pointer) => {
      updateSlider(pointer);
    });
    
    // Hover effect on handle
    sliderZone.on("pointerover", () => {
      sliderHandle.setFillStyle(0xffffff);
    });
    
    sliderZone.on("pointerout", () => {
      sliderHandle.setFillStyle(0xe8eced);
    });
  }

  /**
   * Placeholder methods for settings categories
   */
  private showVideoSettings(): void {
    // Clear existing UI
    this.clearSettingsUI();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "video settings");

    const fullscreenLabel = () => `Fullscreen: ${this.scale.isFullscreen ? "ON" : "OFF"}`;

    const fixedWidth = 360;
    const startY = screenHeight / 2 - 40;
    createButton(
      this,
      screenWidth / 2,
      startY,
      fullscreenLabel(),
      () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
          this.settings.set({ fullscreen: false });
        } else {
          this.scale.startFullscreen();
          this.settings.set({ fullscreen: true });
        }
        // Re-render view so label updates
        this.showVideoSettings();
      },
      fixedWidth
    );
    
    // Add back button
    this.createBackButton();
  }

  private showControls(): void {
    // Clear existing UI
    this.clearSettingsUI();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "controls");

    // Styled, non-interactive rows that match the main-menu button design
    const createControlRow = (x: number, y: number, label: string, binding: string, width = 560) => {
      const baseButtonHeight = 58;
      const height = baseButtonHeight;

      const row = this.add.container(x, y);

      const outerBorder = this.add
        .rectangle(0, 0, width + 8, height + 8, undefined as any, 0)
        .setStrokeStyle(2, 0x77888C, 0.8);
      const innerBorder = this.add
        .rectangle(0, 0, width, height, undefined as any, 0)
        .setStrokeStyle(1, 0x77888C, 0.6);
      const bg = this.add.rectangle(0, 0, width, height, 0x150E10);

      const labelText = this.add
        .text(-width / 2 + 22, 0, label, {
          fontFamily: "dungeon-mode",
          fontSize: 18,
          color: "#77888C",
          align: "left",
        })
        .setOrigin(0, 0.5);

      const bindingText = this.add
        .text(width / 2 - 22, 0, binding, {
          fontFamily: "dungeon-mode",
          fontSize: 18,
          color: "#e8eced",
          align: "right",
          wordWrap: { width: width * 0.55, useAdvancedWrap: true },
        })
        .setOrigin(1, 0.5);

      row.add([outerBorder, innerBorder, bg, labelText, bindingText]);
      return row;
    };

    const rows = [
      { label: "Movement", binding: "W / A / S / D  or  Arrow Keys" },
      { label: "Confirm / Select", binding: "Enter  or  Space" },
      { label: "Cancel / Back", binding: "Escape" },
    ];

    const startY = screenHeight / 2 - 70;
    const spacing = 78;
    rows.forEach((r, i) => createControlRow(screenWidth / 2, startY + i * spacing, r.label, r.binding));
    
    // Add back button
    this.createBackButton();
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // MainMenu-style Back button
    createButton(
      this,
      screenWidth / 2,
      screenHeight - 110,
      "Back",
      () => this.showRoot(),
      220
    );
  }

  private showRoot(): void {
    this.clearSettingsUI();
    this.createBackgroundEffects();
    this.createUI();
  }

  /**
   * Shutdown cleanup
   * Music cleanup is handled automatically by MusicLifecycleSystem
   */
  shutdown(): void {
    // No resize listener cleanup needed — Scale.FIT handles zoom uniformly
  }
}