/**
 * INodeResolver — Strategy interface for resolving node content.
 *
 * Each node type (combat, elite, event, shop, etc.) can have its own
 * resolver that determines WHAT spawns at a given node position.
 * This decouples the "where" (NodePopulator/placement) from the "what"
 * (content selection).
 *
 * Implementations can pull from act-specific enemy pools, event tables,
 * or any other data source.
 *
 * @module INodeResolver
 */

import { NodeType } from '../../../../core/types/MapTypes';
import { RNG } from '../../../../core/types/GenerationTypes';

/**
 * Result of resolving a node's content details.
 * Different fields are relevant to different node types.
 */
export interface NodeResolution {
    /** The concrete entity identifier (e.g., enemy config ID, event ID) */
    readonly entityId?: string;
    /** Optional display name override */
    readonly displayName?: string;
    /** Arbitrary metadata bag for extensibility */
    readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Strategy that decides what content appears at a node of a given type.
 *
 * Register resolvers per node type with NodePopulator. If no resolver
 * is registered for a type, the node spawns with no entityId.
 */
export interface INodeResolver {
    /** Node types this resolver handles */
    readonly supportedTypes: readonly NodeType[];

    /**
     * Resolve what entity should appear at a node.
     *
     * @param type - The node type being resolved
     * @param rng  - Seeded RNG for deterministic selection
     * @returns Resolution result, or undefined to skip
     */
    resolve(type: NodeType, rng: RNG): NodeResolution | undefined;
}
