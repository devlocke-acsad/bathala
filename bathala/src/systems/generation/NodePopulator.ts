/**
 * NodePopulator — places MapNodes onto a raw terrain grid.
 *
 * Act-agnostic: enemy pools, node-type weights, and placement
 * parameters are injected from the active ActDefinition.
 *
 * Algorithm:
 *   1. Scan grid for valid positions (open paths with enough neighbors).
 *   2. Greedily place nodes far apart from each other.
 *   3. Roll a node type → assign enemy ID for combat / elite types.
 *   4. Return MapNode[].
 *
 * @module NodePopulator
 */

import { MapNode, NodeType } from '../../core/types/MapTypes';
import {
  RNG,
  EnemyPoolEntry,
  NodeDistributionConfig,
  DEFAULT_NODE_DISTRIBUTION,
} from '../../core/types/GenerationTypes';

export class NodePopulator {
  private readonly config: NodeDistributionConfig;
  private readonly commonEnemies: readonly EnemyPoolEntry[];
  private readonly eliteEnemies: readonly EnemyPoolEntry[];

  private static readonly PATH = 0;

  constructor(
    commonEnemies: readonly EnemyPoolEntry[],
    eliteEnemies: readonly EnemyPoolEntry[],
    config: NodeDistributionConfig = DEFAULT_NODE_DISTRIBUTION,
  ) {
    this.commonEnemies = commonEnemies;
    this.eliteEnemies = eliteEnemies;
    this.config = config;
  }

  /**
   * Place nodes on a grid at the given chunk coordinates.
   * 
   * @param grid        0/1 terrain grid (0 = path)
   * @param chunkX      chunk X coordinate
   * @param chunkY      chunk Y coordinate
   * @param chunkSize   grid dimension
   * @param gridSize    pixel size of each tile
   * @param rng         seeded PRNG
   */
  populate(
    grid: number[][],
    chunkX: number,
    chunkY: number,
    chunkSize: number,
    gridSize: number,
    rng: RNG,
  ): MapNode[] {
    const { edgeMargin, minOpenNeighbors, baseNodeCount, minDistanceFactor } = this.config;
    const nodes: MapNode[] = [];

    // 1. Collect valid positions
    const validPositions = this.findValidPositions(grid, chunkSize, edgeMargin, minOpenNeighbors);
    if (validPositions.length === 0) return nodes;

    // 2. Decide how many nodes to place
    const effectiveBase = Math.min(baseNodeCount, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + effectiveBase;

    // 3. Place nodes with spatial distribution
    const minNodeDistance = chunkSize / minDistanceFactor;
    const placed: { x: number; y: number }[] = [];

    for (let i = 0; i < nodeCount && validPositions.length > 0; i++) {
      const pos = this.selectPosition(validPositions, placed, minNodeDistance, rng);
      if (!pos) continue;

      const type = this.rollNodeType(rng);
      const enemyId = this.resolveEnemyId(type, rng);

      nodes.push({
        id: `${type}-${chunkX}-${chunkY}-${i}`,
        type,
        x: (chunkX * chunkSize + pos.x) * gridSize,
        y: (chunkY * chunkSize + pos.y) * gridSize,
        row: chunkY * chunkSize + pos.y,
        connections: [],
        visited: false,
        available: true,
        completed: false,
        enemyId,
      });

      placed.push(pos);
      // Remove used position
      const idx = validPositions.findIndex(p => p.x === pos.x && p.y === pos.y);
      if (idx >= 0) validPositions.splice(idx, 1);
    }

    return nodes;
  }

  // =========================================================================
  // Internal helpers
  // =========================================================================

  private findValidPositions(
    grid: number[][],
    chunkSize: number,
    edgeMargin: number,
    minOpen: number,
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    for (let y = edgeMargin; y < chunkSize - edgeMargin; y++) {
      for (let x = edgeMargin; x < chunkSize - edgeMargin; x++) {
        if (grid[y][x] !== NodePopulator.PATH) continue;
        let openNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (grid[y + dy]?.[x + dx] === NodePopulator.PATH) openNeighbors++;
          }
        }
        if (openNeighbors >= minOpen) {
          positions.push({ x, y });
        }
      }
    }
    return positions;
  }

  /**
   * Select the position that maximises minimum distance to already-placed nodes.
   * Falls back to random pick when none satisfies the distance constraint.
   */
  private selectPosition(
    candidates: { x: number; y: number }[],
    placed: { x: number; y: number }[],
    minDist: number,
    rng: RNG,
  ): { x: number; y: number } | null {
    if (candidates.length === 0) return null;

    let best: { x: number; y: number } | null = null;
    let bestMinDist = 0;

    for (const pos of candidates) {
      let nearest = Infinity;
      for (const p of placed) {
        const d = Math.sqrt((pos.x - p.x) ** 2 + (pos.y - p.y) ** 2);
        nearest = Math.min(nearest, d);
      }
      if (nearest > bestMinDist && nearest >= minDist) {
        bestMinDist = nearest;
        best = pos;
      }
    }

    // Fallback: random
    if (!best) {
      best = candidates[Math.floor(rng.next() * candidates.length)];
    }

    return best;
  }

  /**
   * Weighted roll for node type based on the distribution config.
   */
  private rollNodeType(rng: RNG): NodeType {
    const weights = this.config.typeWeights;
    const entries = Object.entries(weights) as [NodeType, number][];
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = rng.next() * total;

    for (const [type, w] of entries) {
      roll -= w;
      if (roll <= 0) return type;
    }

    // Fallback
    return 'combat';
  }

  /**
   * Resolve an enemy ID for combat / elite node types.
   * Returns undefined for non-combat types.
   */
  private resolveEnemyId(type: NodeType, rng: RNG): string | undefined {
    if (type === 'combat' && this.commonEnemies.length > 0) {
      const idx = Math.floor(rng.next() * this.commonEnemies.length);
      return this.commonEnemies[idx].name;
    }
    if (type === 'elite' && this.eliteEnemies.length > 0) {
      const idx = Math.floor(rng.next() * this.eliteEnemies.length);
      return this.eliteEnemies[idx].name;
    }
    return undefined;
  }
}
