# Shared - Core Utilities (Grid, RNG, Connectivity, Cache)

Sources:
- `src/systems/generation/toolbox/IntGrid.ts`
- `src/systems/generation/toolbox/SeededRNG.ts`
- `src/systems/generation/core/BorderConnections.ts`
- `src/systems/generation/core/ChunkCache.ts`

```ts
/** Lightweight tile grid used by all terrain algorithms. */
export class IntGrid {
    public static readonly PATH_TILE = 0;
    public static readonly REGION_TILE = 1;

    private grid: number[][];

    constructor(public width: number, public height: number) {
        this.grid = Array(width).fill(null).map(() => Array(height).fill(IntGrid.REGION_TILE));
    }

    setTile(x: number, y: number, tileType: number): void {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[x][y] = tileType;
        }
    }

    getTile(x: number, y: number): number {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[x][y];
        }
        return IntGrid.REGION_TILE;
    }
}
```

```ts
/** Deterministic RNG + per-chunk seed hashing. */
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

export function chunkSeed(chunkX: number, chunkY: number, globalSeed: number): number {
  return ((chunkX * 73856093) ^ (chunkY * 19349663) ^ globalSeed) >>> 0;
}
```

```ts
/** Detects walkable openings at chunk borders for chunk stitching. */
export function findBorderConnections(
    grid: number[][],
    gridSize: number,
    config: BorderConnectionConfig = {},
): BorderConnection[] {
    const { pathTile, firstOnly } = { ...DEFAULTS, ...config };
    const connections: BorderConnection[] = [];

    const scanBorder = (
        iterate: () => Iterable<{ x: number; y: number }>,
        direction: BorderConnection['direction'],
    ) => {
        for (const { x, y } of iterate()) {
            if (grid[y]?.[x] === pathTile) {
                connections.push({ x, y, direction });
                if (firstOnly) return;
            }
        }
    };

    scanBorder(function* () { for (let x = 1; x < gridSize - 1; x++) yield { x, y: gridSize - 1 }; }, 'north');
    scanBorder(function* () { for (let x = 1; x < gridSize - 1; x++) yield { x, y: 0 }; }, 'south');
    scanBorder(function* () { for (let y = 1; y < gridSize - 1; y++) yield { x: gridSize - 1, y }; }, 'east');
    scanBorder(function* () { for (let y = 1; y < gridSize - 1; y++) yield { x: 0, y }; }, 'west');

    return connections;
}
```

```ts
/** LRU-style chunk cache to avoid regenerating nearby chunks every frame. */
export class ChunkCache {
    private readonly cache = new Map<string, CachedChunk>();
    private readonly maxSize: number;

    constructor(config: ChunkCacheConfig = {}) {
        this.maxSize = config.maxSize ?? 50;
    }

    static key(chunkX: number, chunkY: number): string {
        return `${chunkX},${chunkY}`;
    }

    get(key: string): CachedChunk | undefined {
        return this.cache.get(key);
    }

    set(key: string, data: CachedChunk): void {
        if (this.cache.size >= this.maxSize) {
            const oldest = this.cache.keys().next().value;
            if (oldest !== undefined) this.cache.delete(oldest);
        }
        this.cache.set(key, data);
    }
}
```
