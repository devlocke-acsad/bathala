/**
 * Tests for VisualThemeManager
 * Verifies chapter theme application and configuration
 */

import { VisualThemeManager } from './VisualThemeManager';
import { Chapter } from '../types/CombatTypes';

// Mock Phaser Scene
class MockScene {
  public cameras = {
    main: {
      width: 1024,
      height: 768
    }
  };

  public mockGraphicsInstance = {
    fillStyle: jest.fn(),
    fillRect: jest.fn(),
    setDepth: jest.fn(),
    setScrollFactor: jest.fn(),
    clear: jest.fn(),
    destroy: jest.fn()
  };

  public add = {
    graphics: jest.fn(() => this.mockGraphicsInstance)
  };
}

describe('VisualThemeManager', () => {
  let mockScene: any;
  let themeManager: VisualThemeManager;

  beforeEach(() => {
    mockScene = new MockScene();
    themeManager = new VisualThemeManager(mockScene);
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('CHAPTER_THEMES Configuration', () => {
    it('should have theme configuration for Chapter 1', () => {
      const theme = VisualThemeManager.CHAPTER_THEMES[1];
      expect(theme).toBeDefined();
      expect(theme.overlayColor).toBe(0x8B7355);
      expect(theme.overlayAlpha).toBe(0.15);
    });

    it('should have theme configuration for Chapter 2', () => {
      const theme = VisualThemeManager.CHAPTER_THEMES[2];
      expect(theme).toBeDefined();
      expect(theme.overlayColor).toBe(0x4A90E2);
      expect(theme.overlayAlpha).toBe(0.20);
    });

    it('should have theme configuration for Chapter 3', () => {
      const theme = VisualThemeManager.CHAPTER_THEMES[3];
      expect(theme).toBeDefined();
      expect(theme.overlayColor).toBe(0xFFD700);
      expect(theme.overlayAlpha).toBe(0.18);
    });

    it('should have distinct overlay colors for each chapter', () => {
      const theme1 = VisualThemeManager.CHAPTER_THEMES[1];
      const theme2 = VisualThemeManager.CHAPTER_THEMES[2];
      const theme3 = VisualThemeManager.CHAPTER_THEMES[3];

      expect(theme1.overlayColor).not.toBe(theme2.overlayColor);
      expect(theme2.overlayColor).not.toBe(theme3.overlayColor);
      expect(theme1.overlayColor).not.toBe(theme3.overlayColor);
    });
  });

  describe('applyChapterTheme', () => {
    it('should create graphics overlay when applying theme', () => {
      themeManager.applyChapterTheme(1);
      expect(mockScene.add.graphics).toHaveBeenCalled();
      expect(themeManager.isThemeActive()).toBe(true);
    });

    it('should apply correct color and alpha for Chapter 1', () => {
      themeManager.applyChapterTheme(1);
      
      expect(mockScene.mockGraphicsInstance.fillStyle).toHaveBeenCalledWith(0x8B7355, 0.15);
    });

    it('should apply correct color and alpha for Chapter 2', () => {
      themeManager.applyChapterTheme(2);
      
      expect(mockScene.mockGraphicsInstance.fillStyle).toHaveBeenCalledWith(0x4A90E2, 0.20);
    });

    it('should apply correct color and alpha for Chapter 3', () => {
      themeManager.applyChapterTheme(3);
      
      expect(mockScene.mockGraphicsInstance.fillStyle).toHaveBeenCalledWith(0xFFD700, 0.18);
    });

    it('should set correct depth for overlay', () => {
      themeManager.applyChapterTheme(1);
      
      expect(mockScene.mockGraphicsInstance.setDepth).toHaveBeenCalledWith(5);
    });

    it('should fill entire screen with overlay', () => {
      themeManager.applyChapterTheme(1);
      
      expect(mockScene.mockGraphicsInstance.fillRect).toHaveBeenCalledWith(0, 0, 1024, 768);
    });

    it('should handle invalid chapter number gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      themeManager.applyChapterTheme(4 as Chapter);
      
      expect(consoleSpy).toHaveBeenCalled();
      expect(themeManager.isThemeActive()).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should remove existing theme before applying new one', () => {
      themeManager.applyChapterTheme(1);
      jest.clearAllMocks(); // Clear the first call
      
      themeManager.applyChapterTheme(2);
      
      // Should have called destroy when removing the old theme
      expect(mockScene.mockGraphicsInstance.destroy).toHaveBeenCalled();
    });
  });

  describe('removeChapterTheme', () => {
    it('should destroy graphics overlay when removing theme', () => {
      themeManager.applyChapterTheme(1);
      
      themeManager.removeChapterTheme();
      
      expect(mockScene.mockGraphicsInstance.destroy).toHaveBeenCalled();
      expect(themeManager.isThemeActive()).toBe(false);
    });

    it('should handle removing theme when none is active', () => {
      expect(() => themeManager.removeChapterTheme()).not.toThrow();
      expect(themeManager.isThemeActive()).toBe(false);
    });
  });

  describe('getTheme', () => {
    it('should return theme configuration for valid chapter', () => {
      const theme = themeManager.getTheme(2);
      expect(theme).toBeDefined();
      expect(theme?.overlayColor).toBe(0x4A90E2);
    });

    it('should return null for invalid chapter', () => {
      const theme = themeManager.getTheme(5 as Chapter);
      expect(theme).toBeNull();
    });
  });

  describe('isThemeActive', () => {
    it('should return false when no theme is applied', () => {
      expect(themeManager.isThemeActive()).toBe(false);
    });

    it('should return true when theme is applied', () => {
      themeManager.applyChapterTheme(1);
      expect(themeManager.isThemeActive()).toBe(true);
    });

    it('should return false after theme is removed', () => {
      themeManager.applyChapterTheme(1);
      themeManager.removeChapterTheme();
      expect(themeManager.isThemeActive()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should remove theme and clean up resources', () => {
      themeManager.applyChapterTheme(1);
      
      themeManager.destroy();
      
      expect(mockScene.mockGraphicsInstance.destroy).toHaveBeenCalled();
      expect(themeManager.isThemeActive()).toBe(false);
    });
  });
});
