/**
 * EnemyNodeResolver — resolves combat and elite nodes to specific enemies.
 *
 * Accepts enemy pool arrays and picks randomly from them using the
 * provided RNG. This is the primary implementation used by all acts.
 *
 * @module EnemyNodeResolver
 */

import { NodeType } from '../../../../core/types/MapTypes';
import { RNG, EnemyPoolEntry } from '../../../../core/types/GenerationTypes';
import { INodeResolver, NodeResolution } from './INodeResolver';

export class EnemyNodeResolver implements INodeResolver {
    readonly supportedTypes: readonly NodeType[] = ['combat', 'elite'];

    constructor(
        private readonly commonEnemies: readonly EnemyPoolEntry[],
        private readonly eliteEnemies: readonly EnemyPoolEntry[],
    ) { }

    resolve(type: NodeType, rng: RNG): NodeResolution | undefined {
        if (type === 'combat' && this.commonEnemies.length > 0) {
            const idx = Math.floor(rng.next() * this.commonEnemies.length);
            return { entityId: this.commonEnemies[idx].name };
        }
        if (type === 'elite' && this.eliteEnemies.length > 0) {
            const idx = Math.floor(rng.next() * this.eliteEnemies.length);
            return { entityId: this.eliteEnemies[idx].name };
        }
        return undefined;
    }
}
