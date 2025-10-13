/*
  RandomUtil
  ----------
  Utility class for generating deterministic random numbers.
  
  Features:
    - Seeded random number generation for reproducible results
    - Chunk-specific seed generation using bit manipulation
    - 5-digit random number generation for general use
  
  Key algorithms:
    - Linear congruential generator for seeded randomness
    - Hash-based seed generation for chunk distribution
*/
export class RandomUtil {
  // Private static helper method — not accessible outside this class
  private static generateSeed(): number {
    const now = Date.now();
    const perf = performance.now();
    return now + perf;
  }

  // Public static method to get a 5-digit random number
  static get5DigitRandom(): number {
    const seed = this.generateSeed();
    const raw = Math.sin(seed) * 1000000 + Math.cos(seed / 2) * 100000;
    const fiveDigit = Math.floor(Math.abs(raw)) % 90000 + 10000;
    return fiveDigit;
  }

  /**
   * Create a seeded random number generator for deterministic generation
   */
  static createSeededRandom(seed: number): { seed: number; next(): number } {
    return {
      seed: seed,
      next(): number {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
      }
    };
  }

  /**
   * Get deterministic seed for a chunk using bit manipulation for better distribution
   */
  static getChunkSeed(chunkX: number, chunkY: number, globalSeed: number): number {
    return ((chunkX * 73856093) ^ (chunkY * 19349663) ^ globalSeed) & 0x7fffffff;
  }
}
