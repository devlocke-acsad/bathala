import { Scene, GameObjects } from "phaser";
import { MusicManager } from "../../core/managers/MusicManager";
import { MusicLifecycleSystem } from "../../systems/shared/MusicLifecycleSystem";
import { SettingsManager } from "../../core/managers/SettingsManager";
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
  private currentView: "root" | "audio" | "video" | "gameplay" | "controls" = "root";

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
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 4, 2); // Thicker lines
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 2, 4, 2); // Thicker lines
    
    const texture = graphics.generateTexture('settings_scanline', 4, 4);
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
      { label: "Gameplay", action: () => this.showGameplaySettings() },
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
  update(time: number, delta: number): void {
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
    
    // Get current music volume from MusicManager
    const musicManager = MusicManager.getInstance();
    const current = this.settings.get();
    const currentMusicVolume = current.musicVolume;
    const currentSfxVolume = current.sfxVolume;
    const currentMasterVolume = current.masterVolume;
    
    // Master Volume Slider
    this.createVolumeSlider(
      screenWidth/2,
      screenHeight/2 - 80,
      "Master Volume",
      currentMasterVolume,
      (volume: number) => {
        this.settings.set({ masterVolume: volume });
        this.settings.applyToAudio();
      }
    );
    
    // Music Volume Slider
    this.createVolumeSlider(
      screenWidth/2,
      screenHeight/2,
      "Music Volume",
      currentMusicVolume,
      (volume: number) => {
        this.settings.set({ musicVolume: volume });
        this.settings.applyToAudio();
        // Restart lifecycle music to reflect volume immediately.
        this.musicLifecycle.start();
      }
    );

    // SFX Volume Slider (functional for future SFX calls)
    this.createVolumeSlider(
      screenWidth/2,
      screenHeight/2 + 80,
      "SFX Volume",
      currentSfxVolume,
      (volume: number) => {
        this.settings.set({ sfxVolume: volume });
        this.settings.applyToAudio();
      }
    );
    
    // Add mute/unmute button for music
    const muteButton = this.add.text(
      screenWidth/2,
      screenHeight/2 + 170,
      musicManager.isMusicMutedState() ? "Unmute Music" : "Mute Music",
      {
        fontFamily: "dungeon-mode",
        fontSize: 20,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .on("pointerdown", () => {
      musicManager.toggleMusicMute();
      this.settings.set({ muteMusic: musicManager.isMusicMutedState() });
      muteButton.setText(musicManager.isMusicMutedState() ? "Unmute Music" : "Mute Music");
    })
    .on("pointerover", () => {
      muteButton.setColor("#e8eced");
    })
    .on("pointerout", () => {
      muteButton.setColor("#77888C");
    });
    
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
    onChange: (volume: number) => void
  ): void {
    // Label
    this.add.text(x, y - 30, label, {
      fontFamily: "dungeon-mode",
      fontSize: 18,
      color: "#e8eced",
      align: "center",
    }).setOrigin(0.5);
    
    // Slider background
    const sliderWidth = 400;
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

    const current = this.settings.get();
    const fullscreenLabel = () => `Fullscreen: ${this.scale.isFullscreen ? "ON" : "OFF"}`;
    const scanlineLabel = (on: boolean) => `Scanlines: ${on ? "ON" : "OFF"}`;
    const reducedMotionLabel = (on: boolean) => `Reduced Motion: ${on ? "ON" : "OFF"}`;

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

    createButton(
      this,
      screenWidth / 2,
      startY + 80,
      scanlineLabel(current.showScanlines),
      () => {
        const next = !this.settings.get().showScanlines;
        this.settings.set({ showScanlines: next });
        this.showVideoSettings();
      },
      fixedWidth
    );

    createButton(
      this,
      screenWidth / 2,
      startY + 160,
      reducedMotionLabel(current.reducedMotion),
      () => {
        const next = !this.settings.get().reducedMotion;
        this.settings.set({ reducedMotion: next });
        this.showVideoSettings();
      },
      fixedWidth
    );
    
    // Add back button
    this.createBackButton();
  }

  private showGameplaySettings(): void {
    // Clear existing UI
    this.clearSettingsUI();
    
    // Recreate background effects
    this.createBackgroundEffects();
    
    // Get screen dimensions
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    // Add title
    this.createStraightTitle(screenWidth/2, 100, "gameplay settings");

    // Minimal but functional: reset settings to defaults
    createButton(
      this,
      screenWidth / 2,
      screenHeight / 2 - 10,
      "Reset Settings to Defaults",
      () => {
        this.settings.resetToDefaults();
        this.settings.applyToAudio();
        this.showGameplaySettings();
      },
      420
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
    
    this.add.text(
      screenWidth / 2,
      screenHeight / 2 - 120,
      "Controls",
      {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      }
    ).setOrigin(0.5);
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 - 50,
      "Movement:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 - 50,
      "WASD / Arrow Keys",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 - 10,
      "Confirm:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 - 10,
      "Enter / Space",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 - 150,
      screenHeight/2 + 30,
      "Cancel:",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    this.add.text(
      screenWidth/2 + 50,
      screenHeight/2 + 30,
      "Escape",
      {
        fontFamily: "dungeon-mode",
        fontSize: 18,
        color: "#e8eced",
        align: "left",
      }
    );
    
    // Add back button
    this.createBackButton();
  }

  private createBackButton(): void {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    
    const backText = this.add
      .text(100, screenHeight - 100, "Back", {
        fontFamily: "dungeon-mode",
        fontSize: 24,
        color: "#77888C",
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.showRoot();
      })
      .on("pointerover", () => {
        backText.setColor("#e8eced");
      })
      .on("pointerout", () => {
        backText.setColor("#77888C");
      });
  }

  private showRoot(): void {
    this.currentView = "root";
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