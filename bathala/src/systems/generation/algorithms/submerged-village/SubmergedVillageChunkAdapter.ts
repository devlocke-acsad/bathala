/**
 * SubmergedVillageChunkAdapter — IChunkGenerator for Act 2: The Submerged Barangays.
 *
 * Uses a **zone-based system** to create terrain with varying density:
 *   DENSE      — Tightly packed terrain features
 *   TRANSITION — Terrain tapering into forest
 *   FOREST     — Forest with paths
 *
 * Zone layout is deterministic based on chunk coordinates:
 *   Centers repeat every `villageSpacing` chunks.
 *   Dense zone extends `denseRadius` chunks from center (Chebyshev).
 *   Transition zone extends `transitionRadius` chunks further.
 *   Everything beyond is forest.
 *
 * Tile values in the output grid:
 *   0 — PATH  (walkable)
 *   1 — FOREST (tree walls)
 *   5 — CLIFF
 *   6 — HILL
 *   7 — GRASS_PATCH
 *   8 — SAND_PATCH
 *   9 — WATER
 *
 * @module SubmergedVillageChunkAdapter
 */

import {
    IChunkGenerator,
    RawChunk,
    SeededRandom,
} from '../../../../core/types/GenerationTypes';
import { SubmergedVillageAlgorithm, DEFAULT_VILLAGE_PARAMS, VillageLayoutParams } from './SubmergedVillageAlgorithm';
import { findBorderConnections } from '../../core/BorderConnections';

// =========================================================================
// Diagnostic Logging
// =========================================================================

/**
 * DIAGNOSTICS OUTPUT EXAMPLE:
 * 
 * When exploring Act 2, you'll see console logs like:
 * 
 * 🗺️ Generating chunk (0, 0) - Type: dense
 * ✅ Chunk (0, 0) generated in 12.45ms
 * 🎨 Rendered chunk (0, 0) in 3.21ms | Avg: 3.21ms | Total: 1 chunks
 * 
 * Every 10 chunks generated:
 * ╔════════════════════════════════════════════════════════════════╗
 * ║           ACT 2 CHUNK GENERATION DIAGNOSTICS                   ║
 * ╠════════════════════════════════════════════════════════════════╣
 * ║ Total Chunks Generated: 10                                     ║
 * ║ - Dense:      2                                                ║
 * ║ - Transition: 4                                                ║
 * ║ - Forest:     4                                                ║
 * ╠════════════════════════════════════════════════════════════════╣
 * ║ Performance:                                                   ║
 * ║ - Total Time:   125.34ms                                       ║
 * ║ - Average Time: 12.53ms per chunk                              ║
 * ║ - Slowest:      (2, 1) (transition) - 18.92ms                  ║
 * ╚════════════════════════════════════════════════════════════════╝
 * 
 * Every 20 chunks rendered:
 * ╔════════════════════════════════════════════════════════════════╗
 * ║           ACT 2 CHUNK RENDERING DIAGNOSTICS                    ║
 * ╠════════════════════════════════════════════════════════════════╣
 * ║ Total Chunks Rendered: 20                                      ║
 * ║ Total Render Time:     64.23ms                                 ║
 * ║ Average Render Time:   3.21ms per chunk                        ║
 * ║ Slowest Chunk:         (3, 2) - 5.67ms                         ║
 * ║ Texture Cache Size:    450 entries                             ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

const ENABLE_DIAGNOSTICS = true; // Set to false to disable chunk generation logging

interface ChunkGenerationStats {
    totalChunks: number;
    denseChunks: number;
    transitionChunks: number;
    forestChunks: number;
    totalGenerationTime: number;
    averageGenerationTime: number;
    slowestChunk: { coords: string; time: number; type: string } | null;
}

class ChunkDiagnostics {
    private stats: ChunkGenerationStats = {
        totalChunks: 0,
        denseChunks: 0,
        transitionChunks: 0,
        forestChunks: 0,
        totalGenerationTime: 0,
        averageGenerationTime: 0,
        slowestChunk: null,
    };

    recordChunkGeneration(chunkX: number, chunkY: number, type: VillageChunkType, generationTime: number): void {
        this.stats.totalChunks++;
        this.stats.totalGenerationTime += generationTime;
        this.stats.averageGenerationTime = this.stats.totalGenerationTime / this.stats.totalChunks;

        switch (type) {
            case VillageChunkType.DENSE:
                this.stats.denseChunks++;
                break;
            case VillageChunkType.TRANSITION:
                this.stats.transitionChunks++;
                break;
            case VillageChunkType.FOREST:
                this.stats.forestChunks++;
                break;
        }

        if (!this.stats.slowestChunk || generationTime > this.stats.slowestChunk.time) {
            this.stats.slowestChunk = {
                coords: `(${chunkX}, ${chunkY})`,
                time: generationTime,
                type,
            };
        }

        // Log every 10 chunks
        if (this.stats.totalChunks % 10 === 0) {
            this.logStats();
        }
    }

    logStats(): void {
        if (!ENABLE_DIAGNOSTICS) return;

        console.log(`
╔════════════════════════════════════════════════════════════════╗
║           ACT 2 CHUNK GENERATION DIAGNOSTICS                   ║
╠════════════════════════════════════════════════════════════════╣
║ Total Chunks Generated: ${this.stats.totalChunks.toString().padEnd(38)}║
║ - Dense:      ${this.stats.denseChunks.toString().padEnd(48)}║
║ - Transition: ${this.stats.transitionChunks.toString().padEnd(48)}║
║ - Forest:     ${this.stats.forestChunks.toString().padEnd(48)}║
╠════════════════════════════════════════════════════════════════╣
║ Performance:                                                   ║
║ - Total Time:   ${this.stats.totalGenerationTime.toFixed(2)}ms${' '.repeat(40 - this.stats.totalGenerationTime.toFixed(2).length)}║
║ - Average Time: ${this.stats.averageGenerationTime.toFixed(2)}ms per chunk${' '.repeat(31 - this.stats.averageGenerationTime.toFixed(2).length)}║
║ - Slowest:      ${this.stats.slowestChunk?.coords || 'N/A'} (${this.stats.slowestChunk?.type || 'N/A'}) - ${this.stats.slowestChunk?.time.toFixed(2) || '0'}ms${' '.repeat(20 - (this.stats.slowestChunk?.coords?.length || 0))}║
╚════════════════════════════════════════════════════════════════╝
        `);
    }

    reset(): void {
        this.stats = {
            totalChunks: 0,
            denseChunks: 0,
            transitionChunks: 0,
            forestChunks: 0,
            totalGenerationTime: 0,
            averageGenerationTime: 0,
            slowestChunk: null,
        };
    }

    getStats(): ChunkGenerationStats {
        return { ...this.stats };
    }
}

const diagnostics = new ChunkDiagnostics();

// =========================================================================
// Chunk Type
// =========================================================================

export enum VillageChunkType {
    /** Dense terrain features */
    DENSE = 'dense',
    /** Transition — terrain tapering into forest */
    TRANSITION = 'transition',
    /** Forest — trees with paths */
    FOREST = 'forest',
}

// =========================================================================
//  CONFIGURATION — Edit these to reshape the level
// =========================================================================

export interface SubmergedVillageConfig {
    /** Grid dimension of each chunk (square). Default 20 */
    readonly chunkSize?: number;

    // ── Zone Layout (how terrain clusters tile across the world) ──────
    /** Chunks between centers. 3 = frequent, 6 = sparse. Default 4 */
    readonly villageSpacing?: number;
    /** Dense zone Chebyshev radius in chunks. 0 = center chunk only, 1 = 3×3 core. Default 0 */
    readonly denseRadius?: number;
    /** Transition zone radius (on top of dense). Default 1 */
    readonly transitionRadius?: number;

    // ── Dense Village Chunks ─────────────────────────────────────────
    // House generation removed

    // ── Transition Chunks ────────────────────────────────────────────
    // House generation removed

    // ── Forest Chunks ────────────────────────────────────────────────
    // House generation removed
}

// ── Sensible defaults ────────────────────────────────────────────────────

const ZONE_DEFAULTS = {
    chunkSize: 10,
    villageSpacing: 4,
    denseRadius: 0,
    transitionRadius: 1,
};

// ── Per-chunk-type layout presets ────────────────────────────────────────

function densePreset(_cfg: typeof ZONE_DEFAULTS): VillageLayoutParams {
    return {
        ...DEFAULT_VILLAGE_PARAMS,
        houseCount: 0,
        houseMinSpacing: 0,
        neighborhoodCount: 0,
        spreadFactor: 0,
        houseClearRadius: 0,
        scatterTreeChance: 0.08,
        villageGroundGrowth: 0,
        fenceChance: 0,
        rubbleChance: 0,
        centerBias: null,
        houseSizePreference: 'small',
        roadNeighborCount: 0,
        doorStubLength: 0,
        borderJitter: 6,
        connectorBend: 5,
        edgeConnectionsPerSide: 2,
        detourCount: 4,
        detourMinDistance: 5,
        detourMaxDistance: 14,
        fixDoubleWide: true,
        edgeMargin: 1,
        cliffBandCount: 3,
        hillClusterCount: 2,
        grassPatchCount: 8,
        sandPatchCount: 6,
        waterPoolCount: 1,
    };
}

function transitionPreset(
    _cfg: typeof ZONE_DEFAULTS,
    bias: { x: number; y: number },
): VillageLayoutParams {
    return {
        ...DEFAULT_VILLAGE_PARAMS,
        houseCount: 0,
        houseMinSpacing: 0,
        neighborhoodCount: 0,
        spreadFactor: 0,
        houseClearRadius: 0,
        scatterTreeChance: 0.05,
        villageGroundGrowth: 0,
        fenceChance: 0,
        rubbleChance: 0,
        centerBias: bias,
        houseSizePreference: 'all',
        roadNeighborCount: 0,
        doorStubLength: 0,
        borderJitter: 5,
        connectorBend: 4,
        edgeConnectionsPerSide: 2,
        detourCount: 3,
        detourMinDistance: 4,
        detourMaxDistance: 12,
        fixDoubleWide: true,
        edgeMargin: 2,
        cliffBandCount: 3,
        hillClusterCount: 3,
        grassPatchCount: 7,
        sandPatchCount: 6,
        waterPoolCount: 2,
    };
}

function forestPreset(_cfg: typeof ZONE_DEFAULTS): VillageLayoutParams {
    return {
        ...DEFAULT_VILLAGE_PARAMS,
        houseCount: 0,
        houseMinSpacing: 0,
        neighborhoodCount: 0,
        spreadFactor: 0,
        houseClearRadius: 0,
        scatterTreeChance: 0,
        villageGroundGrowth: 0,
        fenceChance: 0,
        rubbleChance: 0,
        centerBias: null,
        houseSizePreference: 'large',
        roadNeighborCount: 0,
        doorStubLength: 0,
        borderJitter: 3,
        connectorBend: 4,
        edgeConnectionsPerSide: 2,
        detourCount: 2,
        detourMinDistance: 6,
        detourMaxDistance: 16,
        fixDoubleWide: true,
        edgeMargin: 2,
        cliffBandCount: 2,
        hillClusterCount: 4,
        grassPatchCount: 5,
        sandPatchCount: 5,
        waterPoolCount: 3,
    };
}

// =========================================================================
// Adapter
// =========================================================================

export class SubmergedVillageChunkAdapter implements IChunkGenerator {
    readonly name = 'submerged-village';
    readonly chunkSize: number;

    private cfg: typeof ZONE_DEFAULTS;

    constructor(config: SubmergedVillageConfig = {}) {
        this.chunkSize = config.chunkSize ?? ZONE_DEFAULTS.chunkSize;
        this.cfg = {
            chunkSize: this.chunkSize,
            villageSpacing: config.villageSpacing ?? ZONE_DEFAULTS.villageSpacing,
            denseRadius: config.denseRadius ?? ZONE_DEFAULTS.denseRadius,
            transitionRadius: config.transitionRadius ?? ZONE_DEFAULTS.transitionRadius,
        };
    }

    /**
     * Get current generation statistics
     */
    getGenerationStats(): ChunkGenerationStats {
        return diagnostics.getStats();
    }

    /**
     * Reset generation statistics (useful when starting a new game)
     */
    resetGenerationStats(): void {
        diagnostics.reset();
        if (ENABLE_DIAGNOSTICS) {
            console.log('🔄 Act 2 chunk generation statistics reset');
        }
    }

    /**
     * Log current statistics on demand
     */
    logGenerationStats(): void {
        diagnostics.logStats();
    }

    /**
     * Determine what kind of terrain chunk this position produces.
     * Uses Chebyshev distance to the nearest center.
     */
    getChunkType(chunkX: number, chunkY: number): {
        type: VillageChunkType;
        bias: { x: number; y: number } | null;
    } {
        const spacing = this.cfg.villageSpacing;
        const nearestX = Math.round(chunkX / spacing) * spacing;
        const nearestY = Math.round(chunkY / spacing) * spacing;
        const dx = chunkX - nearestX;
        const dy = chunkY - nearestY;
        const dist = Math.max(Math.abs(dx), Math.abs(dy));

        if (dist <= this.cfg.denseRadius) {
            return { type: VillageChunkType.DENSE, bias: null };
        }
        if (dist <= this.cfg.denseRadius + this.cfg.transitionRadius) {
            return {
                type: VillageChunkType.TRANSITION,
                bias: { x: -Math.sign(dx) || 0, y: -Math.sign(dy) || 0 },
            };
        }
        return { type: VillageChunkType.FOREST, bias: null };
    }

    /** Generate terrain using zone-appropriate parameters. */
    generate(chunkX: number, chunkY: number, rng: SeededRandom): RawChunk {
        const startTime = performance.now();

        const { type, bias } = this.getChunkType(chunkX, chunkY);

        if (ENABLE_DIAGNOSTICS) {
            console.log(`🗺️ Generating chunk (${chunkX}, ${chunkY}) - Type: ${type}`);
        }

        let params: VillageLayoutParams;
        switch (type) {
            case VillageChunkType.DENSE:
                params = densePreset(this.cfg);
                break;
            case VillageChunkType.TRANSITION:
                params = transitionPreset(this.cfg, bias ?? { x: 0, y: 0 });
                break;
            case VillageChunkType.FOREST:
            default:
                params = forestPreset(this.cfg);
                break;
        }

        const gen = new SubmergedVillageAlgorithm();
        gen.levelSize = [this.chunkSize, this.chunkSize];

        const intGrid = gen.generateLayout(() => rng.next(), params);

        // Convert IntGrid (column-major) to row-major grid[y][x]
        const grid: number[][] = [];
        for (let y = 0; y < this.chunkSize; y++) {
            const row: number[] = [];
            for (let x = 0; x < this.chunkSize; x++) {
                row.push(intGrid.getTile(x, y));
            }
            grid.push(row);
        }

        // Force deterministic seam portals so adjacent chunks always share connections.
        // Then connect each portal into the chunk's internal network.
        this.forceSeamConnectivity(grid, chunkX, chunkY);

        // Final internal connectivity safeguard (single connected PATH component per chunk).
        this.forceInternalConnectivity(grid);

        const borderConnections = findBorderConnections(grid, this.chunkSize);

        const endTime = performance.now();
        const generationTime = endTime - startTime;

        // Record diagnostics
        diagnostics.recordChunkGeneration(chunkX, chunkY, type, generationTime);

        if (ENABLE_DIAGNOSTICS) {
            console.log(`✅ Chunk (${chunkX}, ${chunkY}) generated in ${generationTime.toFixed(2)}ms`);
        }

        return { grid, width: this.chunkSize, height: this.chunkSize, borderConnections };
    }

    private forceSeamConnectivity(grid: number[][], chunkX: number, chunkY: number): void {
        const size = this.chunkSize;

        const topXs = this.seamPortals(`V:${chunkX}:${chunkY - 1}`);
        const bottomXs = this.seamPortals(`V:${chunkX}:${chunkY}`);
        const leftYs = this.seamPortals(`H:${chunkX - 1}:${chunkY}`);
        const rightYs = this.seamPortals(`H:${chunkX}:${chunkY}`);

        for (const x of topXs) this.carvePortalAndConnect(grid, [x, 0], [x, 1]);
        for (const x of bottomXs) this.carvePortalAndConnect(grid, [x, size - 1], [x, size - 2]);
        for (const y of leftYs) this.carvePortalAndConnect(grid, [0, y], [1, y]);
        for (const y of rightYs) this.carvePortalAndConnect(grid, [size - 1, y], [size - 2, y]);
    }

    private seamPortals(seamKey: string): number[] {
        const size = this.chunkSize;
        const min = 2;
        const max = size - 3;
        const span = Math.max(1, max - min + 1);

        const h1 = this.hash32(`${seamKey}:a`);
        const h2 = this.hash32(`${seamKey}:b`);

        let p1 = min + (h1 % span);
        let p2 = min + (h2 % span);

        if (Math.abs(p1 - p2) < 4) {
            p2 = min + ((p2 + Math.floor(span / 2)) % span);
        }

        return [p1, p2];
    }

    private carvePortalAndConnect(
        grid: number[][],
        borderPos: [number, number],
        innerPos: [number, number],
    ): void {
        const [bx, by] = borderPos;
        const [ix, iy] = innerPos;

        grid[by][bx] = 0;
        grid[iy][ix] = 0;

        const target = this.findNearestNetworkPath(grid, innerPos);
        if (!target) return;

        const route = this.shortestCarvePath(grid, innerPos, target);
        for (const [x, y] of route) {
            if (grid[y][x] !== 2) {
                grid[y][x] = 0;
            }
        }
    }

    private findNearestNetworkPath(grid: number[][], from: [number, number]): [number, number] | null {
        const size = this.chunkSize;
        let best: [number, number] | null = null;
        let bestDist = Number.POSITIVE_INFINITY;

        for (let y = 1; y < size - 1; y++) {
            for (let x = 1; x < size - 1; x++) {
                if (grid[y][x] !== 0) continue;
                if (x === from[0] && y === from[1]) continue;
                const dist = Math.abs(x - from[0]) + Math.abs(y - from[1]);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = [x, y];
                }
            }
        }

        return best;
    }

    private shortestCarvePath(
        grid: number[][],
        start: [number, number],
        goal: [number, number],
    ): [number, number][] {
        const size = this.chunkSize;
        const queue: Array<[number, number]> = [start];
        const visited = new Set<string>([`${start[0]},${start[1]}`]);
        const parent = new Map<string, string>();

        const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        while (queue.length > 0) {
            const [x, y] = queue.shift()!;
            if (x === goal[0] && y === goal[1]) {
                return this.reconstruct(parent, start, goal);
            }

            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
                if (grid[ny][nx] === 2) continue; // Never carve through houses

                const key = `${nx},${ny}`;
                if (visited.has(key)) continue;
                visited.add(key);
                parent.set(key, `${x},${y}`);
                queue.push([nx, ny]);
            }
        }

        // fallback: no route, keep start only
        return [start];
    }

    private reconstruct(
        parent: Map<string, string>,
        start: [number, number],
        goal: [number, number],
    ): [number, number][] {
        const path: [number, number][] = [];
        let cursor = `${goal[0]},${goal[1]}`;
        const startKey = `${start[0]},${start[1]}`;

        while (true) {
            const [x, y] = cursor.split(',').map(Number);
            path.push([x, y]);
            if (cursor === startKey) break;
            const prev = parent.get(cursor);
            if (!prev) break;
            cursor = prev;
        }

        path.reverse();
        return path;
    }

    private forceInternalConnectivity(grid: number[][]): void {
        const components = this.collectComponents(grid);
        if (components.length <= 1) return;

        // Largest component is main network.
        components.sort((a, b) => b.length - a.length);
        let main = components[0];

        for (let index = 1; index < components.length; index++) {
            const other = components[index];
            const [a, b] = this.closestPair(main, other);
            const route = this.shortestCarvePath(grid, a, b);
            for (const [x, y] of route) {
                if (grid[y][x] !== 2) {
                    grid[y][x] = 0;
                }
            }
            main = [...main, ...other];
        }
    }

    private collectComponents(grid: number[][]): Array<Array<[number, number]>> {
        const size = this.chunkSize;
        const visited = new Set<string>();
        const components: Array<Array<[number, number]>> = [];
        const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x] !== 0) continue;
                const root = `${x},${y}`;
                if (visited.has(root)) continue;

                const comp: Array<[number, number]> = [];
                const queue: Array<[number, number]> = [[x, y]];
                visited.add(root);

                while (queue.length > 0) {
                    const [cx, cy] = queue.shift()!;
                    comp.push([cx, cy]);
                    for (const [dx, dy] of dirs) {
                        const nx = cx + dx;
                        const ny = cy + dy;
                        if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
                        if (grid[ny][nx] !== 0) continue;
                        const key = `${nx},${ny}`;
                        if (visited.has(key)) continue;
                        visited.add(key);
                        queue.push([nx, ny]);
                    }
                }

                components.push(comp);
            }
        }

        return components;
    }

    private closestPair(a: Array<[number, number]>, b: Array<[number, number]>): [[number, number], [number, number]] {
        let bestA = a[0];
        let bestB = b[0];
        let bestDist = Number.POSITIVE_INFINITY;

        for (const pa of a) {
            for (const pb of b) {
                const dist = Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]);
                if (dist < bestDist) {
                    bestDist = dist;
                    bestA = pa;
                    bestB = pb;
                }
            }
        }

        return [bestA, bestB];
    }

    private hash32(text: string): number {
        let hash = 2166136261;
        for (let i = 0; i < text.length; i++) {
            hash ^= text.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }
}
