/**
 * DefaultNodeResolver — fallback resolver for passive node types.
 *
 * Handles shop, campfire, and treasure nodes that don't need specific
 * entity resolution. Returns empty resolution (no entityId) since these
 * node types are identified purely by their NodeType.
 *
 * @module DefaultNodeResolver
 */

import { NodeType } from '../../../../core/types/MapTypes';
import { RNG } from '../../../../core/types/GenerationTypes';
import { INodeResolver, NodeResolution } from './INodeResolver';

export class DefaultNodeResolver implements INodeResolver {
    readonly supportedTypes: readonly NodeType[];

    /**
     * @param types - The node types this resolver handles (default: shop, campfire, treasure)
     */
    constructor(types?: readonly NodeType[]) {
        this.supportedTypes = types ?? ['shop', 'campfire', 'treasure'];
    }

    resolve(_type: NodeType, _rng: RNG): NodeResolution | undefined {
        // Passive nodes don't need entity resolution
        return { entityId: undefined };
    }
}
