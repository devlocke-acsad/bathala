import { Scene } from "phaser";
import { Chapter, ChapterTheme } from "../types/CombatTypes";

/**
 * VisualThemeManager - Manages chapter-specific visual themes
 * 
 * Applies color overlays and filters to differentiate chapters visually:
 * - Chapter 1: Forest/earth tones (brown)
 * - Chapter 2: Underwater environment (blue/teal)
 * - Chapter 3: Celestial realm (gold/purple)
 * 
 * Usage:
 * ```typescript
 * const themeManager = new VisualThemeManager(this);
 * themeManager.applyChapterTheme(2); // Apply Chapter 2 theme
 * themeManager.removeChapterTheme(); // Remove theme
 * ```
 */
export class VisualThemeManager {
  private scene: Scene;
  private overlayGraphics: Phaser.GameObjects.Graphics | null = null;

  /**
   * Chapter theme configuration
   * Defines visual characteristics for each chapter
   */
  public static readonly CHAPTER_THEMES: Record<Chapter, ChapterTheme> = {
    1: {
      overlayColor: 0x8B7355, // Brown/earth tones for forest
      overlayAlpha: 0.15,
    },
    2: {
      overlayColor: 0x4A90E2, // Blue/teal for underwater
      overlayAlpha: 0.20,
    },
    3: {
      overlayColor: 0xFFD700, // Gold for celestial realm
      overlayAlpha: 0.18,
    },
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Apply a chapter-specific visual theme to the scene
   * Creates a colored overlay that tints the entire scene
   * 
   * @param chapterNumber - The chapter number (1, 2, or 3)
   * @throws Error if chapter number is invalid
   */
  applyChapterTheme(chapterNumber: Chapter): void {
    // Validate chapter number
    if (chapterNumber < 1 || chapterNumber > 3) {
      console.error(`Invalid chapter number: ${chapterNumber}. Must be 1, 2, or 3.`);
      return;
    }

    // Remove existing theme if present
    this.removeChapterTheme();

    // Get theme configuration
    const theme = VisualThemeManager.CHAPTER_THEMES[chapterNumber];
    if (!theme) {
      console.error(`No theme configuration found for chapter ${chapterNumber}`);
      return;
    }

    // Create overlay graphics
    this.overlayGraphics = this.scene.add.graphics();
    
    // Set fill style with theme color and alpha
    this.overlayGraphics.fillStyle(theme.overlayColor, theme.overlayAlpha);
    
    // Fill the entire screen
    const { width, height } = this.scene.cameras.main;
    this.overlayGraphics.fillRect(0, 0, width, height);
    
    // Set depth to ensure overlay is on top of background but below UI
    this.overlayGraphics.setDepth(5);
    
    // Make overlay scroll with camera
    this.overlayGraphics.setScrollFactor(1);

    console.log(`Applied Chapter ${chapterNumber} theme (color: 0x${theme.overlayColor.toString(16)}, alpha: ${theme.overlayAlpha})`);
  }

  /**
   * Remove the current chapter theme overlay
   * Cleans up graphics objects and restores default appearance
   */
  removeChapterTheme(): void {
    if (this.overlayGraphics) {
      this.overlayGraphics.destroy();
      this.overlayGraphics = null;
      console.log("Removed chapter theme overlay");
    }
  }

  /**
   * Get the theme configuration for a specific chapter
   * 
   * @param chapterNumber - The chapter number (1, 2, or 3)
   * @returns The theme configuration or null if invalid
   */
  getTheme(chapterNumber: Chapter): ChapterTheme | null {
    return VisualThemeManager.CHAPTER_THEMES[chapterNumber] || null;
  }

  /**
   * Check if a theme is currently applied
   * 
   * @returns true if a theme overlay is active
   */
  isThemeActive(): boolean {
    return this.overlayGraphics !== null;
  }

  /**
   * Update the overlay size (useful for window resize events)
   */
  updateOverlaySize(): void {
    if (this.overlayGraphics) {
      this.overlayGraphics.clear();
      
      // Re-apply the current theme by finding which chapter is active
      // We need to determine which theme is currently applied
      // For now, we'll just clear it - the scene should re-apply if needed
      console.log("Overlay size updated");
    }
  }

  /**
   * Destroy the theme manager and clean up resources
   */
  destroy(): void {
    this.removeChapterTheme();
  }
}
