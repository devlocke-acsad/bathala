import { MapNode, NodeType } from "../../core/types/MapTypes";
import { SeededRandom } from "./types";
import { ACT1_COMMON_ENEMIES, ACT1_ELITE_ENEMIES } from "../../data/enemies/Act1Enemies";
import { ACT2_COMMON_ENEMIES, ACT2_ELITE_ENEMIES } from "../../data/enemies/Act2Enemies";
import { ACT3_COMMON_ENEMIES, ACT3_ELITE_ENEMIES } from "../../data/enemies/Act3Enemies";
import { GameState } from "../../core/managers/GameState";
import { Chapter } from "../../core/types/CombatTypes";

/*
  NodeGenerator
  -------------
  Generates and places nodes (enemies, shops, etc.) in the maze.
  
  Process:
    1. Identify valid positions on paths with sufficient open space
    2. Distribute nodes spatially to avoid clustering
    3. Assign node types and enemy IDs randomly
    4. Convert grid coordinates to world coordinates
  
  Key parameters:
    - minDistanceFromEdge: Minimum distance from chunk edges
    - minOpenNeighbors: Minimum open neighbors for valid positions
    - baseNodeCount: Base number of nodes per chunk
    - minNodeDistance: Minimum distance between nodes
*/
export class NodeGenerator {
  // =============================
  // Node Generation Constants
  // =============================
  
  private static readonly PATH = 0;
  
  // =============================
  // Node Generation Parameters
  // =============================
  
  private static readonly MIN_DISTANCE_FROM_EDGE = 3;     // Minimum distance from chunk edges
  private static readonly MIN_OPEN_NEIGHBORS = 5;          // Minimum open neighbors for valid positions
  private static readonly BASE_NODE_COUNT = 3;             // Base number of nodes per chunk
  private static readonly MIN_NODE_DISTANCE_FACTOR = 4;    // Divisor for minimum distance between nodes
  private static readonly FRIENDLY_TYPES: readonly NodeType[] = [
    "shop",
    "event",
    "campfire",
    "treasure",
  ];
  private static readonly ENEMY_TYPES: readonly NodeType[] = ["combat", "elite"];

  // Runtime node-type weights used by the active overworld generation path.
  // Ensures common encounters are significantly more frequent than elites.
  private static readonly NODE_TYPE_WEIGHTS_BY_CHAPTER: Record<Chapter, Record<NodeType, number>> = {
    1: {
      combat: 6,
      elite: 0.4,
      shop: 1,
      event: 2,
      campfire: 1,
      treasure: 1,
      boss: 0,
    },
    2: {
      combat: 6,
      elite: 0.45,
      shop: 1,
      event: 2,
      campfire: 1,
      treasure: 1,
      boss: 0,
    },
    3: {
      combat: 5.5,
      elite: 0.55,
      shop: 1,
      event: 1.8,
      campfire: 1,
      treasure: 1,
      boss: 0,
    },
  };

  /**
   * Get enemy arrays for the current chapter
   */
  private static getEnemyArraysForChapter(chapter: Chapter): {
    common: typeof ACT1_COMMON_ENEMIES;
    elite: typeof ACT1_ELITE_ENEMIES;
  } {
    switch (chapter) {
      case 2:
        return { common: ACT2_COMMON_ENEMIES, elite: ACT2_ELITE_ENEMIES };
      case 3:
        return { common: ACT3_COMMON_ENEMIES, elite: ACT3_ELITE_ENEMIES };
      case 1:
      default:
        return { common: ACT1_COMMON_ENEMIES, elite: ACT1_ELITE_ENEMIES };
    }
  }

  /**
   * Weighted node-type roll so elite spawn chance stays below combat chance.
   */
  private static rollNodeTypeForChapter(chapter: Chapter, rng: SeededRandom): NodeType {
    const weights = this.NODE_TYPE_WEIGHTS_BY_CHAPTER[chapter] ?? this.NODE_TYPE_WEIGHTS_BY_CHAPTER[1];
    const entries = Object.entries(weights) as [NodeType, number][];
    const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
    if (total <= 0) return "combat";

    let roll = rng.next() * total;
    for (const [nodeType, weight] of entries) {
      const safeWeight = Math.max(0, weight);
      roll -= safeWeight;
      if (roll <= 0) return nodeType;
    }

    return "combat";
  }

  /**
   * Chunk-aware balanced node-type roll.
   *
   * Keeps the chapter weights as the baseline, but prevents chunks from
   * spawning "too many enemies and not enough friendly nodes".
   */
  private static rollNodeTypeBalancedForChapter(
    chapter: Chapter,
    rng: SeededRandom,
    placedCounts: Partial<Record<NodeType, number>>,
    remainingSlots: number,
    enemyCap: number,
    requireFriendly: boolean,
  ): NodeType {
    const friendlyPlaced = this.FRIENDLY_TYPES.reduce((sum, t) => sum + (placedCounts[t] ?? 0), 0);
    const enemyPlaced = this.ENEMY_TYPES.reduce((sum, t) => sum + (placedCounts[t] ?? 0), 0);

    // Hard guarantees near the end of placement.
    if (requireFriendly && friendlyPlaced === 0 && remainingSlots <= 1) {
      return this.rollFromTypesForChapter(chapter, rng, this.FRIENDLY_TYPES);
    }
    if (enemyPlaced >= enemyCap) {
      return this.rollFromTypesForChapter(chapter, rng, this.FRIENDLY_TYPES);
    }

    // Soft bias: if friendly share is low, gently boost friendly weights.
    const placedTotal = friendlyPlaced + enemyPlaced;
    const friendlyShare = placedTotal > 0 ? friendlyPlaced / placedTotal : 0;
    const targetFriendlyShare = 0.4;
    if (friendlyShare >= targetFriendlyShare) {
      return this.rollNodeTypeForChapter(chapter, rng);
    }

    const base = this.NODE_TYPE_WEIGHTS_BY_CHAPTER[chapter] ?? this.NODE_TYPE_WEIGHTS_BY_CHAPTER[1];
    const entries = Object.entries(base) as [NodeType, number][];
    const biased: Array<[NodeType, number]> = [];

    for (const [type, w] of entries) {
      if (!w || w <= 0) continue;
      if (this.FRIENDLY_TYPES.includes(type)) biased.push([type, w * 1.5]);
      else if (this.ENEMY_TYPES.includes(type)) biased.push([type, w * 0.9]);
      else biased.push([type, w]);
    }

    return this.rollFromWeightedEntries(rng, biased) ?? "combat";
  }

  private static rollFromTypesForChapter(
    chapter: Chapter,
    rng: SeededRandom,
    types: readonly NodeType[],
  ): NodeType {
    const base = this.NODE_TYPE_WEIGHTS_BY_CHAPTER[chapter] ?? this.NODE_TYPE_WEIGHTS_BY_CHAPTER[1];
    const entries: Array<[NodeType, number]> = [];
    for (const t of types) {
      const w = base[t];
      if (typeof w === "number" && w > 0) entries.push([t, w]);
    }
    if (entries.length === 0) {
      return types[Math.floor(rng.next() * types.length)] ?? "combat";
    }
    return this.rollFromWeightedEntries(rng, entries) ?? (types[0] ?? "combat");
  }

  private static rollFromWeightedEntries(rng: SeededRandom, entries: Array<[NodeType, number]>): NodeType | null {
    const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0);
    if (total <= 0) return null;

    let roll = rng.next() * total;
    for (const [type, w] of entries) {
      roll -= Math.max(0, w);
      if (roll <= 0) return type;
    }
    return entries[entries.length - 1]?.[0] ?? null;
  }

  /**
   * Generate nodes efficiently using spatial hashing
   */
  static generateOptimizedNodes(
    maze: number[][],
    chunkX: number,
    chunkY: number,
    chunkSize: number,
    gridSize: number,
    rng: SeededRandom
  ): MapNode[] {
    const nodes: MapNode[] = [];
    const currentChapter = GameState.getInstance().getCurrentChapter();
    const counts: Partial<Record<NodeType, number>> = {};
    
    // Pre-calculate valid positions (paths only)
    const validPositions: { x: number; y: number }[] = [];
    
    for (let y = this.MIN_DISTANCE_FROM_EDGE; y < chunkSize - this.MIN_DISTANCE_FROM_EDGE; y++) {
      for (let x = this.MIN_DISTANCE_FROM_EDGE; x < chunkSize - this.MIN_DISTANCE_FROM_EDGE; x++) {
        if (maze[y][x] === this.PATH) {
          // Check if position has enough open space around it
          let openNeighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (maze[y + dy][x + dx] === this.PATH) {
                openNeighbors++;
              }
            }
          }
          
          // Only add positions with sufficient open space
          if (openNeighbors >= this.MIN_OPEN_NEIGHBORS) {
            validPositions.push({ x, y });
          }
        }
      }
    }
    
    if (validPositions.length === 0) return nodes;
    
    // Determine number of nodes based on chunk size and valid positions
    const baseNodeCount = Math.min(this.BASE_NODE_COUNT, Math.floor(validPositions.length / 8));
    const nodeCount = Math.floor(rng.next() * 2) + baseNodeCount; // baseNodeCount to baseNodeCount+1
    const enemyCap = Math.max(1, Math.ceil(nodeCount * 0.6));
    const requireFriendly = nodeCount >= 3;
    
    // Use spatial distribution to avoid clustering
    const minNodeDistance = chunkSize / this.MIN_NODE_DISTANCE_FACTOR;
    const placedPositions: { x: number; y: number }[] = [];
    
    for (let i = 0; i < nodeCount && validPositions.length > 0; i++) {
      // Find position far enough from existing nodes
      let bestPosition = null;
      let maxMinDistance = 0;
      
      for (const pos of validPositions) {
        let minDistanceToExisting = Infinity;
        
        for (const placed of placedPositions) {
          const distance = Math.sqrt((pos.x - placed.x) ** 2 + (pos.y - placed.y) ** 2);
          minDistanceToExisting = Math.min(minDistanceToExisting, distance);
        }
        
        if (minDistanceToExisting > maxMinDistance && minDistanceToExisting >= minNodeDistance) {
          maxMinDistance = minDistanceToExisting;
          bestPosition = pos;
        }
      }
      
      // If no position meets minimum distance, just pick randomly
      if (!bestPosition && validPositions.length > 0) {
        const randomIndex = Math.floor(rng.next() * validPositions.length);
        bestPosition = validPositions[randomIndex];
      }
      
      if (bestPosition) {
        const remainingSlots = nodeCount - i;
        const type = this.rollNodeTypeBalancedForChapter(
          currentChapter,
          rng,
          counts,
          remainingSlots,
          enemyCap,
          requireFriendly,
        );

        // Get chapter-aware enemy pools for node enemy assignment.
        const enemyArrays = this.getEnemyArraysForChapter(currentChapter);
        
        let enemyId: string | undefined = undefined;
        if (type === "combat") {
          const enemyIndex = Math.floor(rng.next() * enemyArrays.common.length);
          enemyId = enemyArrays.common[enemyIndex].name;
          console.log(`Generated combat node: ${type}-${chunkX}-${chunkY}-${i}, enemyId: ${enemyId}, chapter: ${currentChapter}`);
        } else if (type === "elite") {
          const enemyIndex = Math.floor(rng.next() * enemyArrays.elite.length);
          enemyId = enemyArrays.elite[enemyIndex].name;
          console.log(`Generated elite node: ${type}-${chunkX}-${chunkY}-${i}, enemyId: ${enemyId}, chapter: ${currentChapter}`);
        }

        nodes.push({
          id: `${type}-${chunkX}-${chunkY}-${i}`,
          type,
          x: (chunkX * chunkSize + bestPosition.x) * gridSize,
          y: (chunkY * chunkSize + bestPosition.y) * gridSize,
          row: chunkY * chunkSize + bestPosition.y,
          connections: [],
          visited: false,
          available: true,
          completed: false,
          enemyId: enemyId
        });

        counts[type] = (counts[type] ?? 0) + 1;
        
        placedPositions.push(bestPosition);
        // Remove used position and nearby positions to avoid clustering
        validPositions.splice(validPositions.findIndex(p => p.x === bestPosition!.x && p.y === bestPosition!.y), 1);
      }
    }
    
    return nodes;
  }
}
