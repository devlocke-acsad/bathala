/**
 * EventNodeResolver — resolves event nodes to specific event IDs.
 *
 * Accepts an array of available event IDs and selects randomly.
 * Can be extended with weighting, prerequisites, or cooldowns.
 *
 * @module EventNodeResolver
 */

import { NodeType } from '../../../../core/types/MapTypes';
import { RNG } from '../../../../core/types/GenerationTypes';
import { INodeResolver, NodeResolution } from './INodeResolver';

export class EventNodeResolver implements INodeResolver {
    readonly supportedTypes: readonly NodeType[] = ['event'];

    constructor(
        private readonly eventIds: readonly string[],
    ) { }

    resolve(type: NodeType, rng: RNG): NodeResolution | undefined {
        if (type !== 'event' || this.eventIds.length === 0) return undefined;

        const idx = Math.floor(rng.next() * this.eventIds.length);
        return { entityId: this.eventIds[idx] };
    }
}
