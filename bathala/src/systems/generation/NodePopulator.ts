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
  private static readonly FRIENDLY_TYPES: readonly NodeType[] = [
    'shop',
    'event',
    'campfire',
    'treasure',
  ];
  private static readonly ENEMY_TYPES: readonly NodeType[] = ['combat', 'elite'];

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
    const counts: Partial<Record<NodeType, number>> = {};

    // Guardrails to prevent "enemy flood" chunks.
    // - Enemy nodes: combat/elite
    // - Friendly nodes: shop/event/campfire/treasure
    // Keep this conservative: overworld difficulty still comes from movement + proximity,
    // but chunks should feel like they have non-combat points of interest.
    const enemyCap = Math.max(1, Math.ceil(nodeCount * 0.6));
    const requireFriendly = nodeCount >= 3; // if a chunk has 3+ nodes, ensure at least one friendly

    for (let i = 0; i < nodeCount && validPositions.length > 0; i++) {
      const pos = this.selectPosition(validPositions, placed, minNodeDistance, rng);
      if (!pos) continue;

      const remainingSlots = nodeCount - i;
      const type = this.rollNodeTypeBalanced(rng, counts, remainingSlots, enemyCap, requireFriendly);
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

      counts[type] = (counts[type] ?? 0) + 1;
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
   * Balanced roll for node type within a single chunk.
   *
   * Goals:
   * - Avoid chunks where almost every node is an enemy.
   * - Ensure chunks with multiple nodes have at least one friendly POI.
   * - Still respect act-provided weights (this is a soft clamp, not a rewrite).
   */
  private rollNodeTypeBalanced(
    rng: RNG,
    placedCounts: Partial<Record<NodeType, number>>,
    remainingSlots: number,
    enemyCap: number,
    requireFriendly: boolean,
  ): NodeType {
    const friendlyPlaced = NodePopulator.FRIENDLY_TYPES.reduce((sum, t) => sum + (placedCounts[t] ?? 0), 0);
    const enemyPlaced = NodePopulator.ENEMY_TYPES.reduce((sum, t) => sum + (placedCounts[t] ?? 0), 0);

    // Hard guarantees near the end of placement.
    if (requireFriendly && friendlyPlaced === 0 && remainingSlots <= 1) {
      return this.rollFromTypes(rng, NodePopulator.FRIENDLY_TYPES);
    }
    if (enemyPlaced >= enemyCap) {
      return this.rollFromTypes(rng, NodePopulator.FRIENDLY_TYPES);
    }

    // Soft biasing: if friendly nodes are underrepresented so far, gently boost them.
    const targetFriendlyShare = 0.4; // friendly nodes should be noticeable without dominating
    const placedTotal = friendlyPlaced + enemyPlaced;
    const friendlyShare = placedTotal > 0 ? friendlyPlaced / placedTotal : 0;
    const boostFriendly = friendlyShare < targetFriendlyShare;

    if (!boostFriendly) return this.rollNodeType(rng);

    // Rebuild a biased weight table (friendly weights * 1.5, enemy weights * 0.9).
    const base = this.config.typeWeights;
    const entries = Object.entries(base) as [NodeType, number][];
    const biasedEntries: Array<[NodeType, number]> = [];
    for (const [type, w] of entries) {
      if (!w || w <= 0) continue;
      if (NodePopulator.FRIENDLY_TYPES.includes(type)) biasedEntries.push([type, w * 1.5]);
      else if (NodePopulator.ENEMY_TYPES.includes(type)) biasedEntries.push([type, w * 0.9]);
      else biasedEntries.push([type, w]);
    }
    return this.rollFromWeightedEntries(rng, biasedEntries) ?? 'combat';
  }

  private rollFromTypes(rng: RNG, types: readonly NodeType[]): NodeType {
    const base = this.config.typeWeights;
    const entries: Array<[NodeType, number]> = [];
    for (const t of types) {
      const w = base[t];
      if (typeof w === 'number' && w > 0) entries.push([t, w]);
    }
    // If act config zeroes out all weights (unlikely), just pick uniformly.
    if (entries.length === 0) return types[Math.floor(rng.next() * types.length)] ?? 'combat';
    return this.rollFromWeightedEntries(rng, entries) ?? (types[0] ?? 'combat');
  }

  private rollFromWeightedEntries(rng: RNG, entries: Array<[NodeType, number]>): NodeType | null {
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    if (total <= 0) return null;
    let roll = rng.next() * total;
    for (const [type, w] of entries) {
      roll -= w;
      if (roll <= 0) return type;
    }
    return entries[entries.length - 1]?.[0] ?? null;
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
