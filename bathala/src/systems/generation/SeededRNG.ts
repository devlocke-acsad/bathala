/**
 * SeededRNG — deterministic pseudo-random number generation utilities.
 *
 * Provides a Mulberry32 PRNG and chunk-coordinate hashing so every
 * chunk in the overworld produces reproducible output for any given seed.
 *
 * @module SeededRNG
 */

import { SeededRandom } from '../../core/types/GenerationTypes';

/**
 * Create a Mulberry32 PRNG seeded with the given value.
 *
 * Mulberry32 is a fast 32-bit PRNG with good statistical distribution.
 * Each call to `next()` returns a float in [0, 1).
 */
export function createSeededRNG(seed: number): SeededRandom {
  let s = seed;
  return {
    get seed() { return seed; },
    next(): number {
      s |= 0;
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
  };
}

/**
 * Hash chunk coordinates + global seed into a deterministic per-chunk seed.
 *
 * Uses large co-primes to minimize collisions between adjacent chunks.
 */
export function chunkSeed(chunkX: number, chunkY: number, globalSeed: number): number {
  return ((chunkX * 73856093) ^ (chunkY * 19349663) ^ globalSeed) >>> 0;
}
