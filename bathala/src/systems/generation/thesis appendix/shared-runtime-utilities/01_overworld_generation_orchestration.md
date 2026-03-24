# Shared - Overworld Generation Orchestration

Source: `src/systems/generation/core/OverworldGenerator.ts`

```ts
/**
 * Runtime chunk request flow:
 * - check cache
 * - deterministic RNG by chunk coords
 * - generate terrain
 * - populate nodes
 * - cache and return
 */
getChunk(
    chunkX: number, chunkY: number, gridSize: number,
): { maze: number[][]; nodes: MapNode[] } {
    const key = ChunkCache.key(chunkX, chunkY);
    const cached = this.cache.get(key);
    if (cached) return { maze: cached.grid, nodes: cached.nodes };

    const rng = createSeededRNG(chunkSeed(chunkX, chunkY, this.globalSeed));

    const raw = this.chunkGen.generate(chunkX, chunkY, rng);
    const nodes = this.nodePopulator.populate(
        raw.grid, chunkX, chunkY, raw.width, gridSize, rng,
    );

    const entry: CachedChunk = { grid: raw.grid, nodes };
    this.cache.set(key, entry);

    return { maze: raw.grid, nodes };
}
```

```ts
/**
 * Constructor wiring: picks terrain strategy and resolver stack per act.
 */
constructor(actDef: ActDefinition, config: OverworldGeneratorConfig = {}) {
    this.actDef = actDef;
    this.chunkGen = actDef.createGenerator();
    this.globalSeed = config.seed ?? Math.floor(Math.random() * 100000);
    this.cache = new ChunkCache({ maxSize: config.maxCacheSize });

    if (config.populatorConfig) {
        this.nodePopulator = new NodePopulator(config.populatorConfig);
    } else {
        this.nodePopulator = new NodePopulator({
            resolvers: [
                new EnemyNodeResolver(actDef.commonEnemies, actDef.eliteEnemies),
                new EventNodeResolver(actDef.eventIds),
                new DefaultNodeResolver(),
            ],
            distribution: actDef.nodeDistribution,
        });
    }
}
```

```ts
/**
 * Runtime chunk preloading around the player/camera center.
 */
preloadAround(
    centerX: number, centerY: number, radius: number, gridSize: number,
): void {
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            this.getChunk(centerX + dx, centerY + dy, gridSize);
        }
    }
}
```
