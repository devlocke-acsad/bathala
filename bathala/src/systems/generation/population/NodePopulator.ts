/**
 * NodePopulator — places MapNodes onto a raw terrain grid.
 *
 * **Modular design:**
 * - Placement logic is delegated to NodePlacementStrategy functions
 * - Content resolution is delegated to INodeResolver strategies
 * - Node type selection uses configurable weighted rolls
 *
 * Act-agnostic: all content pools and placement parameters are injected.
 *
 * Algorithm:
 *   1. Scan grid for valid positions (open paths with enough neighbors).
 *   2. Greedily place nodes far apart from each other.
 *   3. Roll a node type → delegate to the appropriate INodeResolver.
 *   4. Return MapNode[].
 *
 * @module NodePopulator
 */

import { MapNode, NodeType } from '../../../core/types/MapTypes';
import {
    RNG,
    NodeDistributionConfig,
    DEFAULT_NODE_DISTRIBUTION,
} from '../../../core/types/GenerationTypes';
import { INodeResolver } from './strategies/INodeResolver';
import {
    findValidPositions,
    selectSpacedPosition,
    GridPosition,
} from './NodePlacementStrategy';

/**
 * Configuration object for constructing a NodePopulator.
 * All fields are optional — sensible defaults are provided.
 */
export interface NodePopulatorConfig {
    /** Resolvers for different node types (combat, event, etc.) */
    readonly resolvers?: readonly INodeResolver[];
    /** Node distribution / placement configuration */
    readonly distribution?: NodeDistributionConfig;
}

export class NodePopulator {
    private readonly config: NodeDistributionConfig;
    private readonly resolverMap: Map<NodeType, INodeResolver>;

    constructor(options: NodePopulatorConfig = {}) {
        this.config = options.distribution ?? DEFAULT_NODE_DISTRIBUTION;

        // Build lookup map: NodeType → INodeResolver
        this.resolverMap = new Map();
        if (options.resolvers) {
            for (const resolver of options.resolvers) {
                for (const type of resolver.supportedTypes) {
                    this.resolverMap.set(type, resolver);
                }
            }
        }
    }

    // =========================================================================
    // Public API
    // =========================================================================

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
        const validPositions = findValidPositions(
            grid, chunkSize, chunkSize,
            { edgeMargin, minOpenNeighbors, minDistanceFactor },
        );
        if (validPositions.length === 0) return nodes;

        // 2. Decide how many nodes to place
        const effectiveBase = Math.min(baseNodeCount, Math.floor(validPositions.length / 8));
        const nodeCount = Math.floor(rng.next() * 2) + effectiveBase;

        // 3. Place nodes with spatial distribution
        const minNodeDistance = chunkSize / minDistanceFactor;
        const placed: GridPosition[] = [];
        const mutablePositions = [...validPositions];

        for (let i = 0; i < nodeCount && mutablePositions.length > 0; i++) {
            const pos = selectSpacedPosition(mutablePositions, placed, minNodeDistance, rng);
            if (!pos) continue;

            const type = this.rollNodeType(rng);
            const entityId = this.resolveEntity(type, rng);

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
                enemyId: entityId,
            });

            placed.push(pos);
            // Remove used position
            const idx = mutablePositions.findIndex(p => p.x === pos.x && p.y === pos.y);
            if (idx >= 0) mutablePositions.splice(idx, 1);
        }

        return nodes;
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

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
     * Delegate entity resolution to the appropriate strategy.
     * Returns undefined if no resolver is registered for this type.
     */
    private resolveEntity(type: NodeType, rng: RNG): string | undefined {
        const resolver = this.resolverMap.get(type);
        if (!resolver) return undefined;

        const result = resolver.resolve(type, rng);
        return result?.entityId;
    }
}
