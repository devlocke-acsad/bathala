/**
 * ElementalAffinitySystem - Manages elemental weakness and resistance mechanics
 * Calculates damage multipliers based on enemy affinities
 */

import { Element, PlayingCard, Suit } from "../types/CombatTypes";

export interface ElementalAffinity {
  weakness: Element | null;   // Takes 1.5× damage from this element
  resistance: Element | null;  // Takes 0.75× damage from this element
}

/**
 * Callback type for relic modifications to elemental damage
 * @param element - The element being used
 * @param multiplier - The base elemental multiplier
 * @param affinity - The target's elemental affinity
 * @returns Modified multiplier
 */
export type ElementalDamageModifierCallback = (
  element: Element | null,
  multiplier: number,
  affinity: ElementalAffinity
) => number;

export class ElementalAffinitySystem {
  private static modifierCallbacks: ElementalDamageModifierCallback[] = [];
  
  // Cache for dominant element calculations
  private static dominantElementCache: Map<string, { element: Element | null; timestamp: number }> = new Map();
  private static readonly CACHE_TTL = 1000; // Cache for 1 second
  
  /**
   * Register a callback for modifying elemental damage multipliers
   * Relics can use this to modify elemental damage calculations
   * @param callback - Function that modifies elemental multipliers
   */
  static registerModifier(callback: ElementalDamageModifierCallback): void {
    this.modifierCallbacks.push(callback);
  }

  /**
   * Clear all registered modifiers (useful for testing and combat reset)
   */
  static clearModifiers(): void {
    this.modifierCallbacks = [];
  }

  /**
   * Calculate damage multiplier based on element and enemy affinity
   * @param element - The element being used in the attack
   * @param affinity - The enemy's elemental affinity profile
   * @returns Damage multiplier (0.75, 1.0, or 1.5)
   */
  static calculateElementalMultiplier(
    element: Element | null,
    affinity: ElementalAffinity
  ): number {
    // Validate affinity - use default if missing
    if (!affinity) {
      console.warn('ElementalAffinitySystem.calculateElementalMultiplier: Missing affinity, using default (1.0× multiplier)');
      return 1.0;
    }

    // Validate element - treat invalid elements as neutral
    const validElements: Element[] = ['fire', 'water', 'earth', 'air', 'neutral'];
    if (element && !validElements.includes(element)) {
      console.warn(`ElementalAffinitySystem.calculateElementalMultiplier: Invalid element: ${element}, treating as neutral`);
      element = null;
    }

    // No element or neutral element = no multiplier
    if (!element || element === 'neutral') {
      return 1.0;
    }

    // Calculate base multiplier
    let multiplier = 1.0;

    // Check for weakness
    if (affinity.weakness === element) {
      multiplier = 1.5;
    }
    // Check for resistance
    else if (affinity.resistance === element) {
      multiplier = 0.75;
    }

    // Apply relic modifiers
    try {
      for (const modifier of this.modifierCallbacks) {
        const result = modifier(element, multiplier, affinity);
        
        // Validate modifier result
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
          console.warn(`ElementalAffinitySystem.calculateElementalMultiplier: Modifier returned invalid value: ${result}, using original multiplier`);
          continue;
        }
        
        // Ensure multiplier stays within reasonable bounds (0.1 to 10.0)
        if (result < 0.1 || result > 10.0) {
          console.warn(`ElementalAffinitySystem.calculateElementalMultiplier: Modifier returned out-of-bounds value: ${result}, clamping`);
          multiplier = Math.max(0.1, Math.min(10.0, result));
        } else {
          multiplier = result;
        }
      }
    } catch (error) {
      console.error('ElementalAffinitySystem.calculateElementalMultiplier: Error in modifier callback:', error);
      // Continue with base multiplier
    }

    // Final validation
    if (isNaN(multiplier) || !isFinite(multiplier)) {
      console.error(`ElementalAffinitySystem.calculateElementalMultiplier: Final multiplier is invalid: ${multiplier}, defaulting to 1.0`);
      return 1.0;
    }

    return multiplier;
  }

  /**
   * Get dominant element from a hand of cards
   * Returns the element with the most cards, or null if tied/none
   * Uses caching to avoid recalculating for the same hand
   * @param cards - Array of cards to analyze
   * @returns The dominant element or null
   */
  static getDominantElement(cards: PlayingCard[]): Element | null {
    // Validate input
    if (!cards || !Array.isArray(cards)) {
      console.warn('ElementalAffinitySystem.getDominantElement: Invalid cards array, returning null');
      return null;
    }

    if (cards.length === 0) {
      return null;
    }

    // Create cache key from card IDs (sorted for consistency)
    const cacheKey = cards
      .map(card => card.id)
      .sort()
      .join(',');
    
    // Check cache
    const now = Date.now();
    const cached = this.dominantElementCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.element;
    }

    // Map suits to elements
    const suitToElement: Record<Suit, Element> = {
      'Apoy': 'fire',
      'Tubig': 'water',
      'Lupa': 'earth',
      'Hangin': 'air'
    };

    // Count cards per element
    const elementCounts: Record<Element, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      neutral: 0
    };

    cards.forEach(card => {
      // Validate card object
      if (!card || !card.suit) {
        console.warn('ElementalAffinitySystem.getDominantElement: Invalid card object, skipping');
        return;
      }

      const element = suitToElement[card.suit];
      if (element) {
        elementCounts[element]++;
      } else {
        console.warn(`ElementalAffinitySystem.getDominantElement: Unknown suit: ${card.suit}, skipping`);
      }
    });

    // Find the element with the most cards
    let maxCount = 0;
    let dominantElement: Element | null = null;
    let tieCount = 0;

    for (const [element, count] of Object.entries(elementCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantElement = element as Element;
        tieCount = 1;
      } else if (count === maxCount && count > 0) {
        tieCount++;
      }
    }

    // If there's a tie or no dominant element, return null
    if (tieCount > 1 || maxCount === 0) {
      dominantElement = null;
    }

    // Cache the result
    this.dominantElementCache.set(cacheKey, {
      element: dominantElement,
      timestamp: now
    });
    
    // Clean up old cache entries (keep cache size manageable)
    if (this.dominantElementCache.size > 100) {
      const entriesToDelete: string[] = [];
      for (const [key, value] of this.dominantElementCache.entries()) {
        if (now - value.timestamp > this.CACHE_TTL) {
          entriesToDelete.push(key);
        }
      }
      entriesToDelete.forEach(key => this.dominantElementCache.delete(key));
    }

    return dominantElement;
  }
  
  /**
   * Clear the dominant element cache
   * Should be called when starting a new combat or turn
   */
  static clearDominantElementCache(): void {
    this.dominantElementCache.clear();
  }

  /**
   * Get UI display data for an enemy's affinities
   * Returns emoji icons for weakness and resistance
   * @param affinity - The enemy's elemental affinity profile
   * @returns Object with weakness and resistance icons
   */
  static getAffinityDisplayData(affinity: ElementalAffinity): {
    weaknessIcon: string;
    weaknessText: string;
    resistanceIcon: string;
    resistanceText: string;
  } {
    const elementIcons: Record<Element, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌿',
      air: '💨',
      neutral: '⚪'
    };

    const elementNames: Record<Element, string> = {
      fire: 'Fire (Apoy)',
      water: 'Water (Tubig)',
      earth: 'Earth (Lupa)',
      air: 'Air (Hangin)',
      neutral: 'Neutral'
    };

    return {
      weaknessIcon: affinity.weakness ? elementIcons[affinity.weakness] : '',
      weaknessText: affinity.weakness ? `Weak to ${elementNames[affinity.weakness]}` : 'No weakness',
      resistanceIcon: affinity.resistance ? elementIcons[affinity.resistance] : '',
      resistanceText: affinity.resistance ? `Resists ${elementNames[affinity.resistance]}` : 'No resistance'
    };
  }

  /**
   * Validate that an elemental affinity is properly configured
   * Prevents circular affinities (weakness and resistance being the same)
   * @param affinity - The affinity to validate
   * @returns True if valid, false otherwise
   */
  static validateAffinity(affinity: ElementalAffinity): boolean {
    // Check for circular affinity (weakness and resistance can't be the same)
    if (affinity.weakness && affinity.resistance && 
        affinity.weakness === affinity.resistance) {
      console.error('Invalid affinity: weakness and resistance cannot be the same element');
      return false;
    }

    return true;
  }

  /**
   * Create a default affinity (no weakness or resistance)
   * Used as fallback when enemy lacks affinity data
   * @returns Default neutral affinity
   */
  static createDefaultAffinity(): ElementalAffinity {
    return {
      weakness: null,
      resistance: null
    };
  }

  /**
   * Get element name for display
   * @param element - The element to get name for
   * @returns Human-readable element name
   */
  static getElementName(element: Element): string {
    const names: Record<Element, string> = {
      fire: 'Fire (Apoy)',
      water: 'Water (Tubig)',
      earth: 'Earth (Lupa)',
      air: 'Air (Hangin)',
      neutral: 'Neutral'
    };

    return names[element] || 'Unknown';
  }

  /**
   * Get element icon
   * @param element - The element to get icon for
   * @returns Emoji icon for the element
   */
  static getElementIcon(element: Element): string {
    const icons: Record<Element, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌿',
      air: '💨',
      neutral: '⚪'
    };

    return icons[element] || '❓';
  }
}
