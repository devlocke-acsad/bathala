/**
 * SkywardCitadelAlgorithm — terrain generator for Act 3: The Skyward Citadel.
 *
 * Generates a flooded village layout: houses (multi-tile structures), broken fences,
 * rubble/decor, forest trees, and single-width walkable roads weaving between them.
 *
 * The village should feel organic — not grid-aligned — like a rural barangay that
 * naturally grew in a forest and was then hit by a flood.
 *
 * Tile values:
 *   0 — PATH  (walkable road / flooded ground)
 *   1 — FOREST (trees, default fill)
 *   2 — HOUSE  (building walls — multi-tile structures)
 *   3 — FENCE  (broken fences, connected to houses)
 *   4 — RUBBLE (scattered debris / village decor)
 *
 * Pipeline:
 *   1. Fill grid with FOREST
 *   2. Place house footprints organically (clustered neighborhoods)
 *   3. Attach fences to some house walls
 *   4. Carve roads connecting house doorways via A*
 *   5. Scatter rubble near paths
 *   6. Fix double-wide paths (no 2×2 walkable squares)
 *   7. Reduce excessive dead ends (but keep door-dead-ends)
 *
 * @module SkywardCitadelAlgorithm
 */

import { IntGrid } from '../../toolbox/IntGrid';
import { generationWasmBridge } from '../../wasm/GenerationWasmBridge';

// =========================================================================
// Tile Constants
// =========================================================================
export const TILE = {
    PATH: 0,
    FOREST: 1,
    HOUSE: 2,
    FENCE: 3,
    RUBBLE: 4,
    CLIFF: 5,
    HILL: 6,
    GRASS_PATCH: 7,
    SAND_PATCH: 8,
    WATER: 9,
    OBSTACLE: 10,
    PUDDLE_PROP: 11,
    STONE_PROP: 12,
} as const;

// =========================================================================
// Layout Parameters (per-chunk tuning knobs)
// =========================================================================

/** Parameters that control village generation for a single chunk. */
export interface CitadelLayoutParams {
    /** Number of houses to attempt placing */
    houseCount: number;
    /** Minimum tile gap between houses (0 = touching, 1 = narrow alleys, 2 = standard) */
    houseMinSpacing: number;
    /** Number of neighborhood clusters */
    neighborhoodCount: number;
    /** Spread radius as fraction of chunk size (0.15 = tight, 0.5 = dispersed) */
    spreadFactor: number;
    /** Clear forest within N tiles of each house to create walkable village ground (0 = disabled) */
    houseClearRadius: number;
    /** Chance per cleared tile to scatter a decorative tree back */
    scatterTreeChance: number;
    /** Extra organic village ground grown around houses beyond the basic clear radius */
    villageGroundGrowth: number;
    /** Per-house fence attachment probability */
    fenceChance: number;
    /** Per-tile rubble scatter probability near paths */
    rubbleChance: number;
    /** Bias neighborhood center toward village direction (for transition chunks). null = centered */
    centerBias: { x: number; y: number } | null;
    /** Template size preference: 'small' for dense areas, 'large' for sparse, 'all' for mixed */
    houseSizePreference: 'small' | 'all' | 'large';
    /** Number of nearest-neighbor door links to carve between houses */
    roadNeighborCount: number;
    /** How many tiles to carve outward from each house door */
    doorStubLength: number;
    /** Maximum offset of edge targets from the exact border center */
    borderJitter: number;
    /** How much border connectors bend instead of forming straight lines */
    connectorBend: number;
    /** How many connector exits to carve per edge (1-2 typical) */
    edgeConnectionsPerSide: number;
    /** Number of detour connectors to add for alternate routes */
    detourCount: number;
    /** Minimum distance between detour endpoints */
    detourMinDistance: number;
    /** Maximum distance between detour endpoints */
    detourMaxDistance: number;
    /** Whether to fix double-wide paths (false for open village areas) */
    fixDoubleWide: boolean;
    /** Edge margin for house placement (tiles from chunk border) */
    edgeMargin: number;
    /** Number of long cliff ranges stamped across non-path terrain */
    cliffBandCount: number;
    /** Number of hill clusters to place */
    hillClusterCount: number;
    /** Number of non-traversable grass patch clusters */
    grassPatchCount: number;
    /** Number of non-traversable sand patch clusters */
    sandPatchCount: number;
    /** Number of water pools used to form island silhouettes */
    waterPoolCount: number;
}

/** Default params — matches the pre-rework sparse-village behavior. */
export const DEFAULT_CITADEL_PARAMS: CitadelLayoutParams = {
    houseCount: 4,
    houseMinSpacing: 2,
    neighborhoodCount: 2,
    spreadFactor: 0.30,
    houseClearRadius: 0,
    scatterTreeChance: 0,
    villageGroundGrowth: 0,
    fenceChance: 0.6,
    rubbleChance: 0.08,
    centerBias: null,
    houseSizePreference: 'all',
    roadNeighborCount: 2,
    doorStubLength: 1,
    borderJitter: 2,
    connectorBend: 2,
    edgeConnectionsPerSide: 1,
    detourCount: 2,
    detourMinDistance: 5,
    detourMaxDistance: 13,
    fixDoubleWide: true,
    edgeMargin: 2,
    cliffBandCount: 2,
    hillClusterCount: 3,
    grassPatchCount: 3,
    sandPatchCount: 2,
    waterPoolCount: 2,
};

// =========================================================================
// Data types
// =========================================================================

/** A placed house with its footprint, door position, and metadata. */
export interface PlacedHouse {
    /** Top-left corner of the bounding box */
    x: number;
    y: number;
    /** Footprint tiles (relative to grid origin, not bounding box) */
    tiles: Array<{ x: number; y: number }>;
    /** Door tile — path endpoint for road connections */
    door: { x: number; y: number };
    /** Shape name for debugging */
    shape: string;
}

/** House shape template — relative tile offsets + door offset. */
interface HouseTemplate {
    name: string;
    /** Tile offsets from (0,0) origin */
    tiles: Array<{ dx: number; dy: number }>;
    /** Width/height of bounding box (for overlap checking) */
    w: number;
    h: number;
    /** Possible door offsets (relative to origin) — algorithm picks one that faces outward */
    doorCandidates: Array<{ dx: number; dy: number; facing: 'n' | 's' | 'e' | 'w' }>;
}

// =========================================================================
// House Templates
// =========================================================================

function makeRect(w: number, h: number): Array<{ dx: number; dy: number }> {
    const tiles: Array<{ dx: number; dy: number }> = [];
    for (let dx = 0; dx < w; dx++) {
        for (let dy = 0; dy < h; dy++) {
            tiles.push({ dx, dy });
        }
    }
    return tiles;
}

function rectDoors(w: number, h: number): HouseTemplate['doorCandidates'] {
    const midX = Math.floor(w / 2);
    const midY = Math.floor(h / 2);
    return [
        { dx: midX, dy: -1, facing: 's' },     // south door
        { dx: midX, dy: h, facing: 'n' },       // north door
        { dx: -1, dy: midY, facing: 'w' },      // west door
        { dx: w, dy: midY, facing: 'e' },        // east door
    ];
}

// ── Smaller templates for dense village packing ──────────────────────────

const SMALL_HOUSE_TEMPLATES: HouseTemplate[] = [
    // 3×3 nipa hut
    {
        name: '3x3',
        tiles: makeRect(3, 3),
        w: 3, h: 3,
        doorCandidates: rectDoors(3, 3),
    },
    // 2×3 shed / storage
    {
        name: '2x3',
        tiles: makeRect(2, 3),
        w: 2, h: 3,
        doorCandidates: rectDoors(2, 3),
    },
];

/** Template lookup by size preference. */
function getTemplates(pref: CitadelLayoutParams['houseSizePreference']): HouseTemplate[] {
    // Act 2 building art currently supports only 3x3 and 2x3 families.
    // Keep all preferences constrained to supported footprints.
    switch (pref) {
        case 'small': return SMALL_HOUSE_TEMPLATES;
        case 'large': return SMALL_HOUSE_TEMPLATES;
        case 'all':   return SMALL_HOUSE_TEMPLATES;
    }
}

// =========================================================================
// Algorithm
// =========================================================================

export class SkywardCitadelAlgorithm {
    // --- Internal constants (not exposed as layout params) ---
    private readonly BASE_TILE_COST = 1.2;
    private readonly EXISTING_PATH_COST = 0.8;
    private readonly DIRECTION_CHANGE_PENALTY = 0.03;
    private readonly MAX_DOUBLE_WIDE_FIX_ITER = 10;
    private readonly FENCE_MIN_LEN = 2;
    private readonly FENCE_MAX_LEN = 4;
    private readonly DEAD_END_PASSES = 6;
    private readonly DEAD_END_CHAIN_MAX = 32;
    private readonly DEAD_END_LOOP_MIN_DIST = 3;
    private readonly DEAD_END_LOOP_MAX_DIST = 10;
    private readonly CLIFF_FORMATION_GAP = 1;
    private readonly OBSTACLE_FORMATION_GAP = 1;
    private readonly PATCH_FORMATION_GAP = 0;

    // --- Public config ---
    public levelSize: [number, number] = [20, 20];

    private rng: () => number = Math.random;

    /**
     * Main entry point. Returns an IntGrid populated with village terrain.
     * Delegates to the full WASM pipeline for maximum performance.
     * @param rng     PRNG function returning [0,1). If omitted, Math.random is used.
     * @param params  Layout parameters (dense / transition / forest presets).
     */
    generateLayout(rng?: () => number, params?: Partial<CitadelLayoutParams>): IntGrid {
        if (rng) this.rng = rng;
        const p: CitadelLayoutParams = { ...DEFAULT_CITADEL_PARAMS, ...params };
        const [w, h] = this.levelSize;

        // ─── WASM fast path: run entire pipeline in AssemblyScript ────
        const seed = this.rng ? Math.floor(this.rng() * 0x7FFFFFFF) : (Date.now() & 0x7FFFFFFF);
        const wasmParams: Record<string, number> = {
            houseCount: p.houseCount,
            houseMinSpacing: p.houseMinSpacing,
            neighborhoodCount: p.neighborhoodCount,
            spreadFactor: p.spreadFactor,
            houseClearRadius: p.houseClearRadius,
            scatterTreeChance: p.scatterTreeChance,
            villageGroundGrowth: p.villageGroundGrowth,
            fenceChance: p.fenceChance,
            rubbleChance: p.rubbleChance,
            centerBiasX: p.centerBias?.x as any,
            centerBiasY: p.centerBias?.y as any,
            houseSizePreference: p.houseSizePreference === 'small' ? 0 : p.houseSizePreference === 'large' ? 2 : 1,
            roadNeighborCount: p.roadNeighborCount,
            doorStubLength: p.doorStubLength,
            borderJitter: p.borderJitter,
            connectorBend: p.connectorBend,
            edgeConnectionsPerSide: p.edgeConnectionsPerSide,
            detourCount: p.detourCount,
            detourMinDistance: p.detourMinDistance,
            detourMaxDistance: p.detourMaxDistance,
            fixDoubleWide: p.fixDoubleWide ? 1 : 0,
            edgeMargin: p.edgeMargin,
            cliffBandCount: p.cliffBandCount,
            hillClusterCount: p.hillClusterCount,
            grassPatchCount: p.grassPatchCount,
            sandPatchCount: p.sandPatchCount,
            waterPoolCount: p.waterPoolCount,
        };

        const wasmResult = generationWasmBridge.tryGenerateSkywardCitadel(w, h, seed, wasmParams);
        if (wasmResult) {
            // Decor pass: break up oversized open routes with puddles/stones.
            this.decorateOpenAreasWithProps(wasmResult);
            // Safety pass: split any accidental oversized house blobs into supported chunks.
            this.normalizeHouseComponentsToSupportedSizes(wasmResult);
            // Keep every house fully walkable around all sides.
            this.enforceHousePerimeterPaths(wasmResult, 1);
            this.ensureGlobalAccessibility(wasmResult);
            return wasmResult;
        }

        // ─── TypeScript fallback (only if WASM unavailable) ──────────
        console.warn('[SkywardCitadel] WASM pipeline unavailable, falling back to TypeScript');
        const grid = new IntGrid(w, h);

        // 1. Fill with forest
        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                grid.setTile(x, y, TILE.FOREST);
            }
        }

        // 2. Place houses organically
        const houses = this.placeHouses(grid, p);

        // 3. Clear forest around houses (creates walkable village ground)
        if (p.houseClearRadius > 0) {
            this.clearAroundHouses(grid, houses, p.houseClearRadius);
        }

        // 4. Grow irregular village pockets so chunks feel like settlements, not room corridors.
        if (p.villageGroundGrowth > 0) {
            this.growVillageGround(grid, houses, p.villageGroundGrowth);
        }

        // 5. Seed a path if no houses exist (forest chunk connectivity)
        if (houses.length === 0) {
            grid.setTile(Math.floor(w / 2), Math.floor(h / 2), TILE.PATH);
        }

        // 6. Fences remain available but are disabled by preset (chance = 0).
        if (p.fenceChance > 0) {
            this.placeFences(grid, houses, p.fenceChance);
        }

        // 7. Carve roads between house doors and to chunk edges
        this.carveRoads(grid, houses, p);

        // 8. Guarantee every walkable pocket is connected to the main network.
        this.ensureGlobalAccessibility(grid);

        // 9. Add alternate forest/village detours so exploration has multiple route choices.
        this.addDetourRoutes(grid, p);

        // 10. Re-run connectivity after adding detours.
        this.ensureGlobalAccessibility(grid);

        // 11. Rubble remains available but is disabled by preset (chance = 0).
        if (p.rubbleChance > 0) {
            this.scatterRubble(grid, p.rubbleChance);
        }

        // 12. Scatter decorative trees in cleared areas
        if (p.scatterTreeChance > 0) {
            this.scatterDecorativeTrees(grid, p.scatterTreeChance);
        }

        // 13. Enforce single-tile routes across all chunk types.
        this.fixDoubleWidePaths(grid);

        // 13b. Fix diagonal near-miss pockets with L-corner/staircase style links.
        this.resolveNearMissCorners(grid);

        // 14. Reduce dead ends (preserve critical doors and edge exits)
        this.reduceDeadEnds(grid, houses);

        // 15. Final safety cleanup: keep graph connected and strictly one-tile wide.
        this.ensureGlobalAccessibility(grid);
        this.fixDoubleWidePaths(grid);
        this.reduceDeadEnds(grid, houses);
        this.ensureGlobalAccessibility(grid);

        // 16. Convert non-path terrain into Chapter 2 feature tiles (cliffs, hills, patches, water islands).
        this.applyBiomeTerrainFeatures(grid, p);
        this.repairPathGapsAfterBiome(grid);

        // 17. Scatter obstacles on FOREST tiles (after all terrain features are placed)
        this.scatterObstacles(grid);

        // 17b. Decor pass: break up oversized open routes with puddles/stones.
        this.decorateOpenAreasWithProps(grid);

        // Safety pass: split any accidental oversized house blobs into supported chunks.
        this.normalizeHouseComponentsToSupportedSizes(grid);

        // 18. Final house accessibility guard: every house must be surrounded by path.
        this.enforceHousePerimeterPaths(grid, 1);
        this.ensureGlobalAccessibility(grid);

        return grid;
    }

    /**
     * Force a one-tile path ring around every house footprint so players can always route around buildings.
     */
    private enforceHousePerimeterPaths(grid: IntGrid, radius: number): void {
        const [w, h] = this.levelSize;
        const toPath = new Set<string>();

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid.getTile(x, y) !== TILE.HOUSE) continue;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (!this.isInBounds(nx, ny)) continue;
                        if (grid.getTile(nx, ny) === TILE.HOUSE) continue;
                        toPath.add(`${nx},${ny}`);
                    }
                }
            }
        }

        for (const key of toPath) {
            const [x, y] = key.split(',').map(Number);
            grid.setTile(x, y, TILE.PATH);
        }
    }

    /**
     * Keep house blobs constrained to art-supported sizes.
     * Supported visual families are 2x3, 3x2, and 3x3; all other blobs are split or removed.
     */
    private normalizeHouseComponentsToSupportedSizes(grid: IntGrid): void {
        const [w, h] = this.levelSize;
        const maxPasses = 3;

        for (let pass = 0; pass < maxPasses; pass++) {
            let changed = false;
            const visited = new Set<string>();

            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (grid.getTile(x, y) !== TILE.HOUSE) continue;
                    const root = `${x},${y}`;
                    if (visited.has(root)) continue;

                    const component: Array<[number, number]> = [];
                    const queue: Array<[number, number]> = [[x, y]];
                    visited.add(root);

                    let minX = x;
                    let maxX = x;
                    let minY = y;
                    let maxY = y;

                    while (queue.length > 0) {
                        const [cx, cy] = queue.shift()!;
                        component.push([cx, cy]);
                        minX = Math.min(minX, cx);
                        maxX = Math.max(maxX, cx);
                        minY = Math.min(minY, cy);
                        maxY = Math.max(maxY, cy);

                        for (const [nx, ny] of this.neighbors4([cx, cy])) {
                            if (!this.isInBounds(nx, ny)) continue;
                            if (grid.getTile(nx, ny) !== TILE.HOUSE) continue;
                            const key = `${nx},${ny}`;
                            if (visited.has(key)) continue;
                            visited.add(key);
                            queue.push([nx, ny]);
                        }
                    }

                    const width = (maxX - minX) + 1;
                    const height = (maxY - minY) + 1;
                    const area = width * height;
                    const tileCount = component.length;
                    const isSolidRect = tileCount === area;
                    const isSupportedRect =
                        (width === 3 && height === 3) ||
                        (width === 2 && height === 3) ||
                        (width === 3 && height === 2);

                    if (isSolidRect && isSupportedRect) {
                        continue;
                    }

                    if (width > 3 || height > 3) {
                        // Segment merged footprints: 3 tiles of house then 1 tile of path.
                        for (const [hx, hy] of component) {
                            const localX = hx - minX;
                            const localY = hy - minY;
                            const keepAsHouse = (localX % 4) < 3 && (localY % 4) < 3;
                            if (!keepAsHouse) {
                                grid.setTile(hx, hy, TILE.PATH);
                                changed = true;
                            }
                        }
                        continue;
                    }

                    // Remove unsupported small/irregular blobs (e.g., 2x2, 1xN, L-shapes after trims).
                    for (const [hx, hy] of component) {
                        grid.setTile(hx, hy, TILE.PATH);
                    }
                    changed = true;
                }
            }

            if (!changed) break;
        }
    }

    /**
     * Restore obvious single-tile path connectors that became visually blocked by biome overlays.
     */
    private repairPathGapsAfterBiome(grid: IntGrid): void {
        const [w, h] = this.levelSize;
        const toPath: Array<[number, number]> = [];

        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                const tile = grid.getTile(x, y);
                // Never rewrite structural tiles during cosmetic path-gap repair.
                if (tile === TILE.PATH || tile === TILE.WATER || tile === TILE.CLIFF || tile === TILE.HOUSE || tile === TILE.FENCE) continue;

                const north = grid.getTile(x, y - 1) === TILE.PATH;
                const south = grid.getTile(x, y + 1) === TILE.PATH;
                const east = grid.getTile(x + 1, y) === TILE.PATH;
                const west = grid.getTile(x - 1, y) === TILE.PATH;
                const pathNeighbors = Number(north) + Number(south) + Number(east) + Number(west);

                // Bridge narrow blockers in straight corridors or path intersections.
                if ((north && south) || (east && west) || pathNeighbors >= 3) {
                    toPath.push([x, y]);
                }
            }
        }

        for (const [x, y] of toPath) {
            grid.setTile(x, y, TILE.PATH);
        }
    }

    // =====================================================================
    // House Placement
    // =====================================================================

    /**
     * Place houses in organic clusters (neighborhoods).
     * Uses neighborhood centers with scattered houses around each center.
     */
    private placeHouses(grid: IntGrid, p: CitadelLayoutParams): PlacedHouse[] {
        const [w, h] = this.levelSize;
        const margin = p.edgeMargin;
        const houses: PlacedHouse[] = [];
        const templates = getTemplates(p.houseSizePreference);

        // Base center point (may be biased for transition chunks)
        const baseCx = w / 2 + (p.centerBias?.x ?? 0) * w * 0.25;
        const baseCy = h / 2 + (p.centerBias?.y ?? 0) * h * 0.25;

        // Generate neighborhood centers via rejection sampling
        const centers: Array<{ x: number; y: number }> = [];
        const minCenterDist = Math.min(w, h) * 0.35;
        for (let attempt = 0; attempt < 200 && centers.length < p.neighborhoodCount; attempt++) {
            const spread = Math.min(w, h) * 0.2;
            const cx = Math.floor(baseCx + (this.rng() - 0.5) * spread);
            const cy = Math.floor(baseCy + (this.rng() - 0.5) * spread);
            const clampedCx = Math.max(margin + 2, Math.min(w - margin - 2, cx));
            const clampedCy = Math.max(margin + 2, Math.min(h - margin - 2, cy));
            const tooClose = centers.some(c =>
                Math.abs(c.x - clampedCx) + Math.abs(c.y - clampedCy) < minCenterDist
            );
            if (!tooClose) centers.push({ x: clampedCx, y: clampedCy });
        }

        // Fallback: single center
        if (centers.length === 0) {
            centers.push({
                x: Math.max(margin + 2, Math.min(w - margin - 2, Math.floor(baseCx))),
                y: Math.max(margin + 2, Math.min(h - margin - 2, Math.floor(baseCy))),
            });
        }

        // Distribute houses across neighborhoods
        const housesPerCenter = Math.max(1, Math.ceil(p.houseCount / centers.length));
        for (const center of centers) {
            for (let i = 0; i < housesPerCenter && houses.length < p.houseCount; i++) {
                const placed = this.tryPlaceHouseNear(grid, center, houses, p, templates);
                if (placed) houses.push(placed);
            }
        }

        return houses;
    }

    /**
     * Try to place a randomly-chosen house template near a neighborhood center.
     * Spreads houses organically with random offset and rotation.
     */
    private tryPlaceHouseNear(
        grid: IntGrid,
        center: { x: number; y: number },
        _existing: PlacedHouse[],
        p: CitadelLayoutParams,
        templates: HouseTemplate[],
    ): PlacedHouse | null {
        const [w, h] = this.levelSize;
        const margin = p.edgeMargin;

        for (let attempt = 0; attempt < 80; attempt++) {
            // Pick random template from the provided set
            const templateIdx = Math.floor(this.rng() * templates.length);
            const template = templates[templateIdx];

            // Random offset from center (organic spread)
            const spreadRadius = Math.min(w, h) * p.spreadFactor;
            const ox = center.x + Math.floor((this.rng() - 0.5) * spreadRadius);
            const oy = center.y + Math.floor((this.rng() - 0.5) * spreadRadius);

            // Compute absolute tile positions
            const absTiles = template.tiles.map(t => ({ x: ox + t.dx, y: oy + t.dy }));

            // Check bounds (all tiles within margin)
            if (absTiles.some(t => t.x < margin || t.x >= w - margin || t.y < margin || t.y >= h - margin)) {
                continue;
            }

            // Check no overlap with existing houses (including spacing buffer)
            const overlaps = absTiles.some(t => {
                for (let dx = -p.houseMinSpacing; dx <= p.houseMinSpacing; dx++) {
                    for (let dy = -p.houseMinSpacing; dy <= p.houseMinSpacing; dy++) {
                        const nx = t.x + dx;
                        const ny = t.y + dy;
                        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                            if (grid.getTile(nx, ny) === TILE.HOUSE) return true;
                        }
                    }
                }
                return false;
            });
            if (overlaps) continue;

            // Pick a door position (prefer one that faces open forest, not another house)
            const door = this.pickDoor(grid, ox, oy, template);
            if (!door) continue;

            // Stamp house onto grid
            for (const t of absTiles) {
                grid.setTile(t.x, t.y, TILE.HOUSE);
            }

            return {
                x: ox,
                y: oy,
                tiles: absTiles,
                door,
                shape: template.name,
            };
        }

        return null;
    }

    /**
     * Pick a door for a house. The door is one tile outside the house wall.
     * Prefer doors that face into open forest (not out of bounds or into another house).
     */
    private pickDoor(
        grid: IntGrid,
        ox: number, oy: number,
        template: HouseTemplate,
    ): { x: number; y: number } | null {
        const [w, h] = this.levelSize;
        // Shuffle door candidates
        const candidates = [...template.doorCandidates];
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(this.rng() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        for (const cand of candidates) {
            const dx = ox + cand.dx;
            const dy = oy + cand.dy;
            // Must be in-bounds and not a house tile
            if (dx < 1 || dx >= w - 1 || dy < 1 || dy >= h - 1) continue;
            if (grid.getTile(dx, dy) === TILE.HOUSE) continue;
            return { x: dx, y: dy };
        }
        return null;
    }

    // =====================================================================
    // Village Ground Clearing
    // =====================================================================

    /**
     * Clear forest around placed houses to create walkable village ground.
     * This produces the natural open-air alleys and courtyards of a Filipino barangay.
     * @param radius Chebyshev distance from any house tile to clear (1 = narrow alleys)
     */
    private clearAroundHouses(grid: IntGrid, houses: PlacedHouse[], radius: number): void {
        const [w, h] = this.levelSize;
        // Collect all house tile positions for fast lookup
        const houseTiles = new Set<string>();
        for (const house of houses) {
            for (const t of house.tiles) {
                houseTiles.add(`${t.x},${t.y}`);
            }
        }

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                if (grid.getTile(x, y) !== TILE.FOREST) continue;
                // Check if within `radius` Chebyshev distance of any house tile
                let nearHouse = false;
                for (let dx = -radius; dx <= radius && !nearHouse; dx++) {
                    for (let dy = -radius; dy <= radius && !nearHouse; dy++) {
                        if (houseTiles.has(`${x + dx},${y + dy}`)) {
                            nearHouse = true;
                        }
                    }
                }
                if (nearHouse) {
                    grid.setTile(x, y, TILE.PATH);
                }
            }
        }
    }

    /**
     * Grow irregular village clearings around houses.
     * This creates shared yards and crooked open spaces so the village reads as a woven settlement,
     * closer to the ancestral forest layout plus housing, instead of clumps connected by straight roads.
     */
    private growVillageGround(grid: IntGrid, houses: PlacedHouse[], growth: number): void {
        const [w, h] = this.levelSize;

        for (const house of houses) {
            const center = this.getHouseCenter(house);
            const pocketCount = 1 + Math.floor(this.rng() * 3);

            for (let pocket = 0; pocket < pocketCount; pocket++) {
                const px = this.clamp(center.x + this.randomInt(-growth, growth), 1, w - 2);
                const py = this.clamp(center.y + this.randomInt(-growth, growth), 1, h - 2);
                const radiusX = Math.max(1, 1 + Math.floor(this.rng() * growth));
                const radiusY = Math.max(1, 1 + Math.floor(this.rng() * growth));

                for (let x = px - radiusX - 1; x <= px + radiusX + 1; x++) {
                    for (let y = py - radiusY - 1; y <= py + radiusY + 1; y++) {
                        if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
                        if (grid.getTile(x, y) === TILE.HOUSE) continue;

                        const dx = Math.abs(x - px) / Math.max(1, radiusX);
                        const dy = Math.abs(y - py) / Math.max(1, radiusY);
                        const threshold = 1.05 + this.rng() * 0.45;
                        if (dx + dy <= threshold) {
                            grid.setTile(x, y, TILE.PATH);
                        }
                    }
                }
            }
        }
    }

    /**
     * Scatter decorative forest tiles (trees) in cleared village areas.
     * Represents yard trees, fruit trees growing between houses.
     */
    private scatterDecorativeTrees(grid: IntGrid, chance: number): void {
        const [w, h] = this.levelSize;
        for (let x = 1; x < w - 1; x++) {
            for (let y = 1; y < h - 1; y++) {
                if (grid.getTile(x, y) !== TILE.PATH) continue;
                // Only scatter in open areas (not narrow alleys)
                const pathNeighbors = this.neighbors4([x, y]).filter(
                    ([nx, ny]) => nx >= 0 && nx < w && ny >= 0 && ny < h && grid.getTile(nx, ny) === TILE.PATH
                ).length;
                if (pathNeighbors < 3) continue;
                if (this.rng() < chance) {
                    grid.setTile(x, y, TILE.FOREST);
                }
            }
        }
    }

    // =====================================================================
    // Fence Placement
    // =====================================================================

    /**
     * Attach broken fences to some house walls.
     * Fences extend outward from house edges, 2–4 tiles long.
     */
    private placeFences(grid: IntGrid, houses: PlacedHouse[], fenceChance: number): void {
        const [w, h] = this.levelSize;

        for (const house of houses) {
            // Each house may get 1-2 fence segments
            const fenceCount = this.rng() < fenceChance ? (this.rng() < 0.4 ? 2 : 1) : 0;

            for (let f = 0; f < fenceCount; f++) {
                // Find edge tiles of the house (tiles with at least one non-house neighbor)
                const edgeTiles = house.tiles.filter(t => {
                    const neighbors = [
                        { x: t.x - 1, y: t.y }, { x: t.x + 1, y: t.y },
                        { x: t.x, y: t.y - 1 }, { x: t.x, y: t.y + 1 },
                    ];
                    return neighbors.some(n => grid.getTile(n.x, n.y) !== TILE.HOUSE);
                });

                if (edgeTiles.length === 0) continue;

                // Pick a random edge tile
                const edgeTile = edgeTiles[Math.floor(this.rng() * edgeTiles.length)];

                // Determine direction to extend fence (away from house center)
                const houseCenterX = house.tiles.reduce((s, t) => s + t.x, 0) / house.tiles.length;
                const houseCenterY = house.tiles.reduce((s, t) => s + t.y, 0) / house.tiles.length;

                // Direction away from house center
                const dirX = edgeTile.x - houseCenterX;
                const dirY = edgeTile.y - houseCenterY;

                // Normalize to cardinal direction
                let fdx: number, fdy: number;
                if (Math.abs(dirX) >= Math.abs(dirY)) {
                    fdx = dirX > 0 ? 1 : -1;
                    fdy = 0;
                } else {
                    fdx = 0;
                    fdy = dirY > 0 ? 1 : -1;
                }

                // Extend fence
                const fenceLen = this.FENCE_MIN_LEN + Math.floor(this.rng() * (this.FENCE_MAX_LEN - this.FENCE_MIN_LEN + 1));
                for (let i = 1; i <= fenceLen; i++) {
                    const fx = edgeTile.x + fdx * i;
                    const fy = edgeTile.y + fdy * i;
                    if (fx < 1 || fx >= w - 1 || fy < 1 || fy >= h - 1) break;
                    const existing = grid.getTile(fx, fy);
                    if (existing === TILE.HOUSE || existing === TILE.PATH) break;
                    grid.setTile(fx, fy, TILE.FENCE);
                }
            }
        }
    }

    // =====================================================================
    // Road Carving (A* between house doors)
    // =====================================================================

    /**
     * Connect all house doors into a road network.
     * Uses K-nearest-neighbor graph + A* pathfinding to carve single-width roads.
     */
    private carveRoads(grid: IntGrid, houses: PlacedHouse[], params: CitadelLayoutParams): void {
        this.carveDoorStubs(grid, houses, params.doorStubLength);

        if (houses.length > 0) {
            // Build only a light local graph. Dense village chunks rely more on shared clearings.
            const edges = this.buildRoadGraph(houses, params.roadNeighborCount);

            // Sort edges by distance (shorter first — local roads before long ones)
            edges.sort((a, b) => a.dist - b.dist);

            // Carve each road
            for (const edge of edges) {
                const start: [number, number] = [edge.doorA.x, edge.doorA.y];
                const end: [number, number] = [edge.doorB.x, edge.doorB.y];

                // First carve the door tiles themselves (they might still be forest)
                grid.setTile(start[0], start[1], TILE.PATH);
                grid.setTile(end[0], end[1], TILE.PATH);

                const path = this.findRoad(start, end, grid);
                if (path) {
                    for (const [px, py] of path) {
                        if (grid.getTile(px, py) !== TILE.HOUSE) {
                            grid.setTile(px, py, TILE.PATH);
                        }
                    }
                }
            }
        }

        // Always ensure border connections for inter-chunk connectivity, but attach them locally.
        this.ensureBorderAccess(grid, params);
    }

    /** Build K-nearest-neighbor edge list between house doors. */
    private buildRoadGraph(houses: PlacedHouse[], neighborCount: number): Array<{
        doorA: { x: number; y: number };
        doorB: { x: number; y: number };
        dist: number;
    }> {
        const edges: Array<{
            doorA: { x: number; y: number };
            doorB: { x: number; y: number };
            dist: number;
        }> = [];

        const k = Math.max(0, Math.min(neighborCount, houses.length - 1));
        if (k === 0) {
            return edges;
        }

        for (let i = 0; i < houses.length; i++) {
            const distances: Array<{ j: number; dist: number }> = [];
            for (let j = 0; j < houses.length; j++) {
                if (i === j) continue;
                const dx = houses[i].door.x - houses[j].door.x;
                const dy = houses[i].door.y - houses[j].door.y;
                distances.push({ j, dist: Math.abs(dx) + Math.abs(dy) });
            }
            distances.sort((a, b) => a.dist - b.dist);

            for (let n = 0; n < Math.min(k, distances.length); n++) {
                const j = distances[n].j;
                // Avoid duplicate edges
                const exists = edges.some(e =>
                    (e.doorA.x === houses[i].door.x && e.doorA.y === houses[i].door.y &&
                        e.doorB.x === houses[j].door.x && e.doorB.y === houses[j].door.y) ||
                    (e.doorA.x === houses[j].door.x && e.doorA.y === houses[j].door.y &&
                        e.doorB.x === houses[i].door.x && e.doorB.y === houses[i].door.y)
                );
                if (!exists) {
                    edges.push({
                        doorA: houses[i].door,
                        doorB: houses[j].door,
                        dist: distances[n].dist,
                    });
                }
            }
        }

        return edges;
    }

    /**
     * A* pathfinding for road carving.
     * Routes through FOREST tiles, avoids HOUSE tiles, favors existing PATHs.
     * Fences can be carved through (they're breakable).
     */
    private findRoad(start: [number, number], end: [number, number], grid: IntGrid): [number, number][] | null {
        const wasmPath = generationWasmBridge.tryFindRoadPath(
            grid,
            this.levelSize[0],
            this.levelSize[1],
            start[0],
            start[1],
            end[0],
            end[1],
            TILE.HOUSE,
            TILE.PATH,
            TILE.FENCE,
            this.BASE_TILE_COST,
            this.EXISTING_PATH_COST,
            1.5,
            this.DIRECTION_CHANGE_PENALTY,
        );
        if (wasmPath === undefined) {
            throw new Error(`SkywardCitadel requires generation-kernels.wasm for road pathfinding (reason: ${generationWasmBridge.getUnavailableReason()})`);
        }
        return wasmPath;
    }

    /**
     * Ensure the road network reaches chunk borders for inter-chunk connectivity.
     * Finds the nearest path tile to each border center and carves a connector.
     */
    private ensureBorderAccess(grid: IntGrid, params: CitadelLayoutParams): void {
        const [w, h] = this.levelSize;
        const centerX = Math.floor(w / 2);
        const centerY = Math.floor(h / 2);

        const borderTargets: Array<{
            edge: 'north' | 'south' | 'west' | 'east';
            target: [number, number];
        }> = [];

        const perSide = Math.max(1, params.edgeConnectionsPerSide);
        for (let i = 0; i < perSide; i++) {
            borderTargets.push({
                edge: 'north',
                target: [this.clamp(centerX + this.randomInt(-params.borderJitter, params.borderJitter), 1, w - 2), 0],
            });
            borderTargets.push({
                edge: 'south',
                target: [this.clamp(centerX + this.randomInt(-params.borderJitter, params.borderJitter), 1, w - 2), h - 1],
            });
            borderTargets.push({
                edge: 'west',
                target: [0, this.clamp(centerY + this.randomInt(-params.borderJitter, params.borderJitter), 1, h - 2)],
            });
            borderTargets.push({
                edge: 'east',
                target: [w - 1, this.clamp(centerY + this.randomInt(-params.borderJitter, params.borderJitter), 1, h - 2)],
            });
        }

        for (const { edge, target } of borderTargets) {
            const nearestPath = this.findNearestPathForEdge(grid, target, edge);
            if (!nearestPath) continue;

            const waypoint = this.resolveWaypoint(
                grid,
                this.createConnectorWaypoint(nearestPath, target, edge, params.connectorBend),
            );

            for (const segment of [
                this.findRoad(nearestPath, waypoint, grid),
                this.findRoad(waypoint, target, grid),
            ]) {
                if (!segment) continue;
                for (const [px, py] of segment) {
                    if (grid.getTile(px, py) !== TILE.HOUSE) {
                        grid.setTile(px, py, TILE.PATH);
                    }
                }
            }
        }
    }

    private carveDoorStubs(grid: IntGrid, houses: PlacedHouse[], stubLength: number): void {
        if (stubLength <= 0) return;

        for (const house of houses) {
            grid.setTile(house.door.x, house.door.y, TILE.PATH);
            const direction = this.getDoorDirection(house);
            if (!direction) continue;

            let x = house.door.x;
            let y = house.door.y;
            for (let step = 0; step < stubLength; step++) {
                x += direction[0];
                y += direction[1];
                if (!this.isInBounds(x, y)) break;
                if (grid.getTile(x, y) === TILE.HOUSE) break;
                grid.setTile(x, y, TILE.PATH);
            }
        }
    }

    private getDoorDirection(house: PlacedHouse): [number, number] | null {
        for (const [nx, ny] of this.neighbors4([house.door.x, house.door.y])) {
            if (house.tiles.some(tile => tile.x === nx && tile.y === ny)) {
                return [house.door.x - nx, house.door.y - ny];
            }
        }
        return null;
    }

    private findNearestPathForEdge(
        grid: IntGrid,
        target: [number, number],
        edge: 'north' | 'south' | 'west' | 'east',
    ): [number, number] | null {
        const [w, h] = this.levelSize;
        let nearestPath: [number, number] | null = null;
        let nearestDist = Infinity;

        const isPreferred = (x: number, y: number): boolean => {
            switch (edge) {
                case 'north': return y <= Math.floor(h * 0.65);
                case 'south': return y >= Math.floor(h * 0.35);
                case 'west': return x <= Math.floor(w * 0.65);
                case 'east': return x >= Math.floor(w * 0.35);
            }
        };

        for (let pass = 0; pass < 2 && !nearestPath; pass++) {
            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    if (grid.getTile(x, y) !== TILE.PATH) continue;
                    if (pass === 0 && !isPreferred(x, y)) continue;
                    const distance = Math.abs(x - target[0]) + Math.abs(y - target[1]);
                    if (distance < nearestDist) {
                        nearestDist = distance;
                        nearestPath = [x, y];
                    }
                }
            }
        }

        return nearestPath;
    }

    private createConnectorWaypoint(
        start: [number, number],
        target: [number, number],
        edge: 'north' | 'south' | 'west' | 'east',
        bend: number,
    ): [number, number] {
        const [w, h] = this.levelSize;

        if (edge === 'north' || edge === 'south') {
            return [
                this.clamp(start[0] + this.randomInt(-bend, bend), 1, w - 2),
                this.clamp(Math.floor((start[1] + target[1]) / 2), 1, h - 2),
            ];
        }

        return [
            this.clamp(Math.floor((start[0] + target[0]) / 2), 1, w - 2),
            this.clamp(start[1] + this.randomInt(-bend, bend), 1, h - 2),
        ];
    }

    private resolveWaypoint(grid: IntGrid, preferred: [number, number]): [number, number] {
        const [x, y] = preferred;
        if (grid.getTile(x, y) !== TILE.HOUSE) {
            return preferred;
        }

        for (let radius = 1; radius <= 3; radius++) {
            for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (!this.isInBounds(nx, ny)) continue;
                    if (grid.getTile(nx, ny) !== TILE.HOUSE) {
                        return [nx, ny];
                    }
                }
            }
        }

        return preferred;
    }

    /**
     * Ensure all PATH tiles belong to one connected component.
     * If disconnected islands exist, bridge each island to the main component via A*.
     */
    private ensureGlobalAccessibility(grid: IntGrid): void {
        let components = this.collectPathComponents(grid);
        if (components.length <= 1) return;

        // Largest component is treated as the main accessible network.
        components.sort((a, b) => b.length - a.length);
        let main = components[0];

        for (let index = 1; index < components.length; index++) {
            const island = components[index];
            const pair = this.findClosestPathPair(main, island);
            if (!pair) continue;

            const connector = this.findRoad(pair.a, pair.b, grid);
            if (!connector) continue;

            for (const [x, y] of connector) {
                if (grid.getTile(x, y) !== TILE.HOUSE) {
                    grid.setTile(x, y, TILE.PATH);
                }
            }

            // Recompute components after each bridge to keep pairing accurate.
            components = this.collectPathComponents(grid).sort((a, b) => b.length - a.length);
            main = components[0] ?? main;
        }
    }

    private collectPathComponents(grid: IntGrid): [number, number][][] {
        const [w, h] = this.levelSize;
        const visited = new Set<string>();
        const components: [number, number][][] = [];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid.getTile(x, y) !== TILE.PATH) continue;
                const key = `${x},${y}`;
                if (visited.has(key)) continue;

                const component: [number, number][] = [];
                const queue: [number, number][] = [[x, y]];
                visited.add(key);

                while (queue.length > 0) {
                    const [cx, cy] = queue.shift()!;
                    component.push([cx, cy]);

                    for (const [nx, ny] of this.neighbors4([cx, cy])) {
                        if (!this.isInBounds(nx, ny)) continue;
                        if (grid.getTile(nx, ny) !== TILE.PATH) continue;
                        const nKey = `${nx},${ny}`;
                        if (visited.has(nKey)) continue;
                        visited.add(nKey);
                        queue.push([nx, ny]);
                    }
                }

                components.push(component);
            }
        }

        return components;
    }

    private findClosestPathPair(
        aComponent: [number, number][],
        bComponent: [number, number][],
    ): { a: [number, number]; b: [number, number] } | null {
        let best: { a: [number, number]; b: [number, number] } | null = null;
        let bestDist = Infinity;

        for (const a of aComponent) {
            for (const b of bComponent) {
                const dist = this.manhattan(a, b);
                if (dist < bestDist) {
                    bestDist = dist;
                    best = { a, b };
                }
            }
        }

        return best;
    }

    private addDetourRoutes(grid: IntGrid, params: CitadelLayoutParams): void {
        if (params.detourCount <= 0) return;

        const pathTiles = this.getPathTiles(grid);
        if (pathTiles.length < 2) return;

        const attempts = params.detourCount * 8;
        let carved = 0;

        for (let attempt = 0; attempt < attempts && carved < params.detourCount; attempt++) {
            const start = pathTiles[Math.floor(this.rng() * pathTiles.length)];
            const candidates = pathTiles.filter(tile => {
                const dist = this.manhattan(start, tile);
                return dist >= params.detourMinDistance && dist <= params.detourMaxDistance;
            });
            if (candidates.length === 0) continue;

            const end = candidates[Math.floor(this.rng() * candidates.length)];
            const route = this.findRoad(start, end, grid);
            if (!route || route.length < 3) continue;

            for (const [x, y] of route) {
                if (grid.getTile(x, y) !== TILE.HOUSE) {
                    grid.setTile(x, y, TILE.PATH);
                }
            }
            carved++;
        }
    }

    private getPathTiles(grid: IntGrid): [number, number][] {
        const [w, h] = this.levelSize;
        const points: [number, number][] = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid.getTile(x, y) === TILE.PATH) {
                    points.push([x, y]);
                }
            }
        }
        return points;
    }

    // =====================================================================
    // Rubble Scattering
    // =====================================================================

    /** Scatter rubble tiles near existing paths for decoration. */
    private scatterRubble(grid: IntGrid, rubbleChance: number): void {
        const [w, h] = this.levelSize;

        for (let x = 1; x < w - 1; x++) {
            for (let y = 1; y < h - 1; y++) {
                if (grid.getTile(x, y) !== TILE.FOREST) continue;

                // Only place rubble adjacent to paths
                const adjacentToPath = this.neighbors4([x, y]).some(
                    ([nx, ny]) => grid.getTile(nx, ny) === TILE.PATH
                );
                if (!adjacentToPath) continue;

                // Also prefer near houses
                const nearHouse = this.neighbors8([x, y]).some(
                    ([nx, ny]) => grid.getTile(nx, ny) === TILE.HOUSE
                );
                const chance = nearHouse ? rubbleChance * 2 : rubbleChance;

                if (this.rng() < chance) {
                    grid.setTile(x, y, TILE.RUBBLE);
                }
            }
        }
    }

    // =====================================================================
    // Obstacle Scattering
    // =====================================================================

    /**
     * Convert all remaining FOREST tiles to OBSTACLE tiles.
     * Like Enchanted Forest (Act 1), only PATH tiles are traversable.
     * All non-path terrain becomes obstacles that block movement.
     */
    private scatterObstacles(grid: IntGrid): void {
        const [w, h] = this.levelSize;

        for (let x = 0; x < w; x++) {
            for (let y = 0; y < h; y++) {
                // Convert all FOREST tiles to OBSTACLE tiles
                if (grid.getTile(x, y) === TILE.FOREST) {
                    grid.setTile(x, y, TILE.OBSTACLE);
                }
            }
        }
    }

    /**
     * Place Act 2 decorative blockers to reduce giant empty lanes:
     * - puddleBig1 as strict 3x3
     * - puddleSmall1 as strict 1x2 horizontal
     * - standalone puddles and stones
     *
     * Decorations are also allowed to replace some tree-obstacle tiles.
     */
    private decorateOpenAreasWithProps(grid: IntGrid): void {
        const [w, h] = this.levelSize;
        let pathCount = 0;
        let obstacleCount = 0;

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const tile = grid.getTile(x, y);
                if (tile === TILE.PATH) pathCount++;
                if (tile === TILE.OBSTACLE) obstacleCount++;
            }
        }

        if (pathCount > 0) {
            const bigPathTarget = Math.min(2, Math.max(0, Math.floor(pathCount / 180)));
            const smallPathTarget = Math.min(4, Math.max(1, Math.floor(pathCount / 120)));
            const puddleSoloPathTarget = Math.min(10, Math.max(2, Math.floor(pathCount / 70)));
            const stonePathTarget = Math.min(12, Math.max(3, Math.floor(pathCount / 55)));

            this.placeRectPropsOnSource(grid, TILE.PATH, TILE.PUDDLE_PROP, 3, 3, bigPathTarget, 80, 5, true);
            this.placeRectPropsOnSource(grid, TILE.PATH, TILE.PUDDLE_PROP, 2, 1, smallPathTarget, 100, 4, true);
            this.placeSinglesOnSource(grid, TILE.PATH, TILE.PUDDLE_PROP, puddleSoloPathTarget, 120, 5, true, true);
            this.placeSinglesOnSource(grid, TILE.PATH, TILE.STONE_PROP, stonePathTarget, 120, 4, true, false);
        }

        if (obstacleCount > 0) {
            const bigObstacleTarget = obstacleCount >= 160 ? 1 : 0;
            const smallObstacleTarget = obstacleCount >= 100 ? 1 : 0;
            const puddleSoloObstacleTarget = Math.min(3, Math.max(0, Math.floor(obstacleCount / 220)));
            this.placeRectPropsOnSource(grid, TILE.OBSTACLE, TILE.PUDDLE_PROP, 3, 3, bigObstacleTarget, 90, 0, true);
            this.placeRectPropsOnSource(grid, TILE.OBSTACLE, TILE.PUDDLE_PROP, 2, 1, smallObstacleTarget, 110, 0, true);
            this.placeSinglesOnSource(grid, TILE.OBSTACLE, TILE.PUDDLE_PROP, puddleSoloObstacleTarget, 120, 0, true, true);

            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    if (grid.getTile(x, y) !== TILE.OBSTACLE) continue;
                    const roll = this.rng();
                    if (roll < 0.05) {
                        grid.setTile(x, y, TILE.STONE_PROP);
                    }
                }
            }
        }
    }

    private placeRectPropsOnSource(
        grid: IntGrid,
        sourceTile: number,
        targetTile: number,
        width: number,
        height: number,
        targetCount: number,
        attemptsPerTarget: number,
        minPathNeighbors: number,
        avoidHouseRadiusOne: boolean,
    ): void {
        if (targetCount <= 0) return;
        const [w, h] = this.levelSize;
        let placed = 0;
        const maxAttempts = Math.max(1, targetCount * attemptsPerTarget);

        for (let attempt = 0; attempt < maxAttempts && placed < targetCount; attempt++) {
            const startX = this.randomInt(1, w - width - 1);
            const startY = this.randomInt(1, h - height - 1);
            if (!this.canStampRectOnSource(grid, startX, startY, width, height, sourceTile, minPathNeighbors, avoidHouseRadiusOne)) {
                continue;
            }

            for (let ry = 0; ry < height; ry++) {
                for (let rx = 0; rx < width; rx++) {
                    grid.setTile(startX + rx, startY + ry, targetTile);
                }
            }
            placed++;
        }
    }

    private placeSinglesOnSource(
        grid: IntGrid,
        sourceTile: number,
        targetTile: number,
        targetCount: number,
        attemptsPerTarget: number,
        minPathNeighbors: number,
        avoidHouseRadiusOne: boolean,
        forceStandalonePuddle: boolean,
    ): void {
        if (targetCount <= 0) return;
        const [w, h] = this.levelSize;
        let placed = 0;
        const maxAttempts = Math.max(1, targetCount * attemptsPerTarget);

        for (let attempt = 0; attempt < maxAttempts && placed < targetCount; attempt++) {
            const x = this.randomInt(1, w - 2);
            const y = this.randomInt(1, h - 2);
            if (grid.getTile(x, y) !== sourceTile) continue;

            if (minPathNeighbors > 0 && this.countTileNeighbors(grid, x, y, TILE.PATH, true) < minPathNeighbors) {
                continue;
            }

            if (avoidHouseRadiusOne && this.isNearTileType(grid, x, y, TILE.HOUSE, 1)) {
                continue;
            }

            if (forceStandalonePuddle && this.countTileNeighbors(grid, x, y, TILE.PUDDLE_PROP, false) > 0) {
                continue;
            }

            grid.setTile(x, y, targetTile);
            placed++;
        }
    }

    private canStampRectOnSource(
        grid: IntGrid,
        startX: number,
        startY: number,
        width: number,
        height: number,
        sourceTile: number,
        minPathNeighbors: number,
        avoidHouseRadiusOne: boolean,
    ): boolean {
        for (let ry = 0; ry < height; ry++) {
            for (let rx = 0; rx < width; rx++) {
                const x = startX + rx;
                const y = startY + ry;
                if (!this.isInBounds(x, y)) return false;
                if (grid.getTile(x, y) !== sourceTile) return false;

                if (minPathNeighbors > 0 && this.countTileNeighbors(grid, x, y, TILE.PATH, true) < minPathNeighbors) {
                    return false;
                }

                if (avoidHouseRadiusOne && this.isNearTileType(grid, x, y, TILE.HOUSE, 1)) {
                    return false;
                }
            }
        }

        return true;
    }

    private countTileNeighbors(grid: IntGrid, x: number, y: number, tileType: number, includeDiagonals: boolean): number {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                if (!includeDiagonals && dx !== 0 && dy !== 0) continue;

                const nx = x + dx;
                const ny = y + dy;
                if (!this.isInBounds(nx, ny)) continue;
                if (grid.getTile(nx, ny) === tileType) count++;
            }
        }
        return count;
    }

    private isNearTileType(grid: IntGrid, x: number, y: number, tileType: number, radius: number): boolean {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (!this.isInBounds(nx, ny)) continue;
                if (grid.getTile(nx, ny) === tileType) return true;
            }
        }
        return false;
    }

    private applyBiomeTerrainFeatures(grid: IntGrid, params: CitadelLayoutParams): void {
        const [w, h] = this.levelSize;

        // Reset all non-path tiles to a neutral land base before painting feature families.
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid.getTile(x, y) !== TILE.PATH) {
                    grid.setTile(x, y, TILE.FOREST);
                }
            }
        }

        this.paintSimpleWaterPonds(grid, params.waterPoolCount);
        const totalCliffGroups = Math.max(1, params.cliffBandCount);
        const irregularCliffCount = Math.max(2, Math.ceil(totalCliffGroups * 0.7));
        const simpleCliffCount = Math.max(1, totalCliffGroups - irregularCliffCount);
        // Paint irregular first so natural shapes claim space before simple fallback rings.
        this.paintIrregularCliffHillFormations(grid, irregularCliffCount);
        this.paintSimpleCliffHillFormations(grid, simpleCliffCount);

        const totalHillGroups = Math.max(1, params.hillClusterCount);
        // Reverted by request: hills are simple 2x2 scatter only.
        this.paintSimpleHillFormations(grid, totalHillGroups);

        // Finalize cliff masses first so later obstacle families honor stable cliff silhouettes.
        const earlyBatchApplied = generationWasmBridge.runKernelBatch(grid, w, h, [
            (e) => e.removeSmallComponentsInPlace(w, h, TILE.WATER, TILE.FOREST, 10),
            (e) => e.enforceMinThickness2x2InPlace(w, h, TILE.WATER, TILE.FOREST, 6),
            (e) => e.repairCliffGapsInPlace(w, h, TILE.PATH, TILE.WATER, TILE.CLIFF, 3),
            (e) => e.enforceCliffShellIntegrityInPlace(w, h, TILE.PATH, TILE.WATER, TILE.CLIFF, TILE.HILL, 3),
            (e) => e.removeSmallComponentsInPlace(w, h, TILE.CLIFF, TILE.FOREST, 8),
            (e) => e.enforceExact2x2BundlesInPlace(w, h, TILE.HILL, TILE.FOREST, 1, TILE.CLIFF, TILE.PATH),
        ]);
        if (!earlyBatchApplied) {
            throw new Error('SkywardCitadel requires generation-kernels.wasm for terrain post-processing (early batch)');
        }

        const grassTotal = Math.max(1, params.grassPatchCount);
        this.paintGrassPatchesSequentially(grid, grassTotal);

        const sandTotal = Math.max(1, params.sandPatchCount);
        // SandGrass Bush family is strict 2x2 only.
        this.paintSimpleSandPatch2x2Formations(grid, sandTotal);

        // Finalize: cliffs must be surrounded by a 1-tile PATH moat.
        // Run last so no later pass can place obstacles back beside cliffs.
        this.enforceCliffObstacleClearance(grid, 1);

        const finalBatchApplied = generationWasmBridge.runKernelBatch(grid, w, h, [
            (e) => e.removeSmallComponentsInPlace(w, h, TILE.CLIFF, TILE.FOREST, 8),
            (e) => e.enforceExact2x2BundlesInPlace(w, h, TILE.HILL, TILE.FOREST, 1, TILE.CLIFF, TILE.PATH),
            (e) => e.enforceExact2x2BundlesInPlace(w, h, TILE.SAND_PATCH, TILE.FOREST, 0, TILE.CLIFF, TILE.PATH),
            (e) => e.enforceMinThickness2x2InPlace(w, h, TILE.GRASS_PATCH, TILE.FOREST, 3),
            (e) => e.filterComponentsBySizeAndFootprintInPlace(w, h, TILE.GRASS_PATCH, TILE.FOREST, 9, 3, 3),
        ]);
        if (!finalBatchApplied) {
            throw new Error('SkywardCitadel requires generation-kernels.wasm for terrain post-processing (final batch)');
        }
    }

    /**
     * Place GrassSand patches strictly one object at a time:
     * generate candidate -> validate rules -> stamp -> move to next.
     */
    private paintGrassPatchesSequentially(grid: IntGrid, total: number): void {
        if (total <= 0) return;

        let placed = 0;
        let globalAttempts = Math.max(20, total * 16);

        while (placed < total && globalAttempts > 0) {
            globalAttempts--;

            // Keep snakes as occasional accents and prioritize stable rectangular bundles.
            const rollSnake = this.rng() < 0.22;

            let success = false;
            if (rollSnake) {
                success = this.tryPlaceSnakePatchFormation(grid, TILE.GRASS_PATCH)
                    || this.tryPlaceSimplePatchFormation(grid, TILE.GRASS_PATCH);
            } else {
                success = this.tryPlaceSimplePatchFormation(grid, TILE.GRASS_PATCH)
                    || this.tryPlaceSnakePatchFormation(grid, TILE.GRASS_PATCH);
            }

            if (success) placed++;
        }
    }

    /**
     * Stamp simple, fully-closed cliff rings with hill interiors.
     * This intentionally avoids open/freehand chains so cliff tiles always complete.
     */
    private paintSimpleCliffHillFormations(grid: IntGrid, count: number): void {
        const [w, h] = this.levelSize;

        for (let i = 0; i < count; i++) {
            let placed = false;

            for (let attempt = 0; attempt < 28 && !placed; attempt++) {
                const halfW = this.randomInt(2, 4);
                const halfH = this.randomInt(1, 3);
                const cx = this.randomInt(halfW + 2, w - halfW - 3);
                const cy = this.randomInt(halfH + 2, h - halfH - 3);

                const minX = cx - halfW;
                const maxX = cx + halfW;
                const minY = cy - halfH;
                const maxY = cy + halfH;

                const requiredGap = Math.max(this.CLIFF_FORMATION_GAP, this.OBSTACLE_FORMATION_GAP);
                if (!this.isRegionForestWithGap(grid, minX, maxX, minY, maxY, requiredGap)) continue;

                for (let y = minY; y <= maxY; y++) {
                    for (let x = minX; x <= maxX; x++) {
                        const border = x === minX || x === maxX || y === minY || y === maxY;
                        grid.setTile(x, y, border ? TILE.CLIFF : TILE.FOREST);
                    }
                }

                placed = true;
            }
        }
    }

    /**
     * Stamp water as larger lakes and meandering rivers (not puddles).
     */
    private paintSimpleWaterPonds(grid: IntGrid, count: number): void {
        for (let i = 0; i < count; i++) {
            const preferRiver = this.rng() < 0.45;
            const placed = preferRiver
                ? this.tryPaintRiverWaterBody(grid) || this.tryPaintLakeWaterBody(grid)
                : this.tryPaintLakeWaterBody(grid) || this.tryPaintRiverWaterBody(grid);

            // Final fallback: try a lake once more before giving up this slot.
            if (!placed) {
                this.tryPaintLakeWaterBody(grid);
            }
        }
    }

    private tryPaintLakeWaterBody(grid: IntGrid): boolean {
        for (let attempt = 0; attempt < 30; attempt++) {
            const [w, h] = this.levelSize;
            const seedX = this.randomInt(3, w - 4);
            const seedY = this.randomInt(3, h - 4);
            if (this.isNearPath(grid, seedX, seedY, 1)) continue;
            if (grid.getTile(seedX, seedY) !== TILE.FOREST) continue;

            // Reuse cliff-like blob growth to produce natural lake shapes.
            const mask = this.growMaskBlob(grid, seedX, seedY, this.randomInt(12, 28));
            if (mask.size < 10) continue;
            if (this.maskTouchesNonForestWithinGap(grid, mask, Math.max(1, this.OBSTACLE_FORMATION_GAP))) continue;

            for (const cell of mask) {
                const [x, y] = cell.split(',').map(Number);
                grid.setTile(x, y, TILE.WATER);
            }

            if (mask.size >= 10) {
                return true;
            }
        }

        return false;
    }

    private tryPaintRiverWaterBody(grid: IntGrid): boolean {
        const [w, h] = this.levelSize;
        const dirs: Array<[number, number]> = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        for (let attempt = 0; attempt < 40; attempt++) {
            let x = this.randomInt(2, w - 3);
            let y = this.randomInt(2, h - 3);
            if (grid.getTile(x, y) !== TILE.FOREST || this.isNearPath(grid, x, y, 1)) {
                continue;
            }

            let [dx, dy] = dirs[this.randomInt(0, dirs.length - 1)];
            const length = this.randomInt(7, 14);
            const brushRadius = this.rng() < 0.20 ? 2 : 1;
            const cells = new Set<string>();
            let valid = true;

            for (let step = 0; step < length && valid; step++) {
                for (let by = -brushRadius; by <= brushRadius && valid; by++) {
                    for (let bx = -brushRadius; bx <= brushRadius; bx++) {
                        if ((Math.abs(bx) + Math.abs(by)) > (brushRadius + (brushRadius === 2 ? 1 : 0))) continue;

                        const nx = x + bx;
                        const ny = y + by;
                        if (!this.isInBounds(nx, ny) || nx <= 0 || ny <= 0 || nx >= w - 1 || ny >= h - 1) {
                            valid = false;
                            break;
                        }
                        if (grid.getTile(nx, ny) !== TILE.FOREST) {
                            valid = false;
                            break;
                        }
                        cells.add(`${nx},${ny}`);
                    }
                }

                if (!valid) break;

                const turnRoll = this.rng();
                if (turnRoll < 0.30) {
                    [dx, dy] = turnRoll < 0.15 ? [-dy, dx] : [dy, -dx];
                }

                x += dx;
                y += dy;
                if (x <= 1 || y <= 1 || x >= w - 2 || y >= h - 2) {
                    valid = false;
                }
            }

            if (!valid || cells.size < 14) {
                continue;
            }

            for (const cell of cells) {
                const [wx, wy] = cell.split(',').map(Number);
                grid.setTile(wx, wy, TILE.WATER);
            }
            return true;
        }

        return false;
    }

    /**
     * Stamp simple hill features as strict 2x2 clusters.
     */
    private paintSimpleHillFormations(grid: IntGrid, count: number): void {
        const [w, h] = this.levelSize;

        for (let i = 0; i < count; i++) {
            let placed = false;
            for (let attempt = 0; attempt < 40 && !placed; attempt++) {
                const minX = this.randomInt(2, w - 4);
                const minY = this.randomInt(2, h - 4);
                const maxX = minX + 1;
                const maxY = minY + 1;

                if (!this.isRegionForestWithGap(grid, minX, maxX, minY, maxY, this.OBSTACLE_FORMATION_GAP)) continue;

                for (let y = minY; y <= maxY; y++) {
                    for (let x = minX; x <= maxX; x++) {
                        grid.setTile(x, y, TILE.HILL);
                    }
                }

                placed = true;
            }
        }
    }

    /**
     * SandGrass Bush patches must exist only as strict 2x2 bundles.
     */
    private paintSimpleSandPatch2x2Formations(grid: IntGrid, count: number): void {
        const [w, h] = this.levelSize;

        for (let i = 0; i < count; i++) {
            let placed = false;
            for (let attempt = 0; attempt < 40 && !placed; attempt++) {
                const minX = this.randomInt(2, w - 4);
                const minY = this.randomInt(2, h - 4);
                const maxX = minX + 1;
                const maxY = minY + 1;

                if (!this.isRegionForestWithGap(grid, minX, maxX, minY, maxY, this.PATCH_FORMATION_GAP)) continue;

                for (let y = minY; y <= maxY; y++) {
                    for (let x = minX; x <= maxX; x++) {
                        grid.setTile(x, y, TILE.SAND_PATCH);
                    }
                }

                placed = true;
            }
        }
    }

    /**
     * Build irregular but closed cliff/hill masses from blob masks.
     */
    private paintIrregularCliffHillFormations(grid: IntGrid, count: number): void {
        const [w, h] = this.levelSize;

        for (let i = 0; i < count; i++) {
            for (let attempt = 0; attempt < 64; attempt++) {
                const seedX = this.randomInt(3, w - 4);
                const seedY = this.randomInt(3, h - 4);
                if (this.isNearPath(grid, seedX, seedY, 1)) continue;
                if (grid.getTile(seedX, seedY) !== TILE.FOREST) continue;

                const mask = this.growMaskBlob(grid, seedX, seedY, this.randomInt(12, 30));
                if (mask.size < 10) continue;

                const requiredGap = Math.max(this.CLIFF_FORMATION_GAP, this.OBSTACLE_FORMATION_GAP);
                if (this.maskTouchesNonForestWithinGap(grid, mask, requiredGap)) continue;

                for (const cell of mask) {
                    const [x, y] = cell.split(',').map(Number);
                    const border = this.neighbors4([x, y]).some(([nx, ny]) => !mask.has(`${nx},${ny}`));
                    grid.setTile(x, y, border ? TILE.CLIFF : TILE.FOREST);
                }

                break;
            }
        }
    }

    private tryPlaceSimplePatchFormation(grid: IntGrid, patchType: number): boolean {
        const [w, h] = this.levelSize;

        for (let attempt = 0; attempt < 20; attempt++) {
            // Slightly wider range so rectangles are easier to notice in-play.
            const width = this.randomInt(3, 6);
            const height = this.randomInt(3, 6);
            const minX = this.randomInt(2, w - width - 2);
            const minY = this.randomInt(2, h - height - 2);
            const maxX = minX + width - 1;
            const maxY = minY + height - 1;

            const cells: Array<[number, number]> = [];
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    cells.push([x, y]);
                }
            }

            // Keep a hard one-tile moat so separate patch shapes never merge into hybrids.
            const requiredGap = Math.max(1, this.PATCH_FORMATION_GAP);
            if (!this.isPatchCellsPlaceableWithGap(grid, cells, requiredGap)) continue;

            this.stampPatchCells(grid, cells, patchType);
            return true;
        }

        return false;
    }

    private tryPlaceSnakePatchFormation(grid: IntGrid, patchType: number): boolean {
        const [w, h] = this.levelSize;

        for (let attempt = 0; attempt < 120; attempt++) {
            const startX = this.randomInt(2, w - 5);
            const startY = this.randomInt(2, h - 5);

            // Strict snake rule: exactly 2-tiles thick strips only.
            // Allowed shapes are straight, single-turn L, or T forms.
            const dirs: Array<[number, number]> = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            const [dx1, dy1] = dirs[this.randomInt(0, dirs.length - 1)];
            const shapeRoll = this.rng();
            const shapeMode: 'straight' | 'l' | 't' =
                shapeRoll < 0.28 ? 'straight' : shapeRoll < 0.68 ? 'l' : 't';

            const lenA = shapeMode === 't'
                ? (this.rng() < 0.6 ? 3 : 5) // odd block count so stem has a clean center anchor
                : this.randomInt(2, 5);
            const lenB = shapeMode === 'straight' ? 0 : this.randomInt(2, 4);

            const blockAnchors: Array<[number, number]> = [];
            const blockKeys = new Set<string>();

            const pushBlock = (bx: number, by: number): boolean => {
                const key = `${bx},${by}`;
                if (blockKeys.has(key)) return false;
                blockKeys.add(key);
                blockAnchors.push([bx, by]);
                return true;
            };

            let ok = pushBlock(startX, startY);
            if (!ok) continue;

            // Primary segment.
            for (let s = 1; s < lenA && ok; s++) {
                const bx = startX + (dx1 * 2 * s);
                const by = startY + (dy1 * 2 * s);
                ok = pushBlock(bx, by);
            }
            if (!ok) continue;

            // Optional one-time 90-degree branch.
            if (shapeMode === 'l' || shapeMode === 't') {
                const leftTurn: [number, number] = [-dy1, dx1];
                const rightTurn: [number, number] = [dy1, -dx1];
                const [dx2, dy2] = this.rng() < 0.5 ? leftTurn : rightTurn;

                if (shapeMode === 'l') {
                    // L: branch starts at the bar end.
                    const cornerX = startX + (dx1 * 2 * (lenA - 1));
                    const cornerY = startY + (dy1 * 2 * (lenA - 1));

                    for (let s = 1; s < lenB && ok; s++) {
                        const bx = cornerX + (dx2 * 2 * s);
                        const by = cornerY + (dy2 * 2 * s);
                        ok = pushBlock(bx, by);
                    }
                } else {
                    // T: branch starts from the center anchor and extends outward.
                    const mid = Math.floor((lenA - 1) / 2);
                    const centerX = startX + (dx1 * 2 * mid);
                    const centerY = startY + (dy1 * 2 * mid);

                    for (let s = 1; s < lenB && ok; s++) {
                        const bx = centerX + (dx2 * 2 * s);
                        const by = centerY + (dy2 * 2 * s);
                        ok = pushBlock(bx, by);
                    }
                }
            }

            if (!ok || blockAnchors.length < 3) continue;

            const cells = new Set<string>();
            for (const [bx, by] of blockAnchors) {
                cells.add(`${bx},${by}`);
                cells.add(`${bx + 1},${by}`);
                cells.add(`${bx},${by + 1}`);
                cells.add(`${bx + 1},${by + 1}`);
            }

            const coords = Array.from(cells).map((v) => v.split(',').map(Number) as [number, number]);
            if (coords.length < 12) continue;

            // Safety: each snake tile must be part of at least one 2x2 patch block.
            let strictTwoTileThick = true;
            const hasPatch = (px: number, py: number): boolean => cells.has(`${px},${py}`);
            for (const [x, y] of coords) {
                const partOf2x2 =
                    (hasPatch(x, y) && hasPatch(x + 1, y) && hasPatch(x, y + 1) && hasPatch(x + 1, y + 1)) ||
                    (hasPatch(x - 1, y) && hasPatch(x, y) && hasPatch(x - 1, y + 1) && hasPatch(x, y + 1)) ||
                    (hasPatch(x, y - 1) && hasPatch(x + 1, y - 1) && hasPatch(x, y) && hasPatch(x + 1, y)) ||
                    (hasPatch(x - 1, y - 1) && hasPatch(x, y - 1) && hasPatch(x - 1, y) && hasPatch(x, y));
                if (!partOf2x2) {
                    strictTwoTileThick = false;
                    break;
                }
            }
            if (!strictTwoTileThick) continue;

            // Keep snakes isolated from rectangles and other snakes.
            const requiredGap = Math.max(1, this.PATCH_FORMATION_GAP);
            if (!this.isPatchCellsPlaceableWithGap(grid, coords, requiredGap)) continue;

            this.stampPatchCells(grid, coords, patchType);
            return true;
        }

        return false;
    }

    /**
     * Exact-shape patch validator used by sequential placement:
     * each candidate cell must be FOREST, and the requested gap ring
     * around that exact shape must only contain FOREST/PATH.
     */
    private isPatchCellsPlaceableWithGap(
        grid: IntGrid,
        cells: Array<[number, number]>,
        gap: number,
    ): boolean {
        const core = new Set(cells.map(([x, y]) => `${x},${y}`));

        for (const [x, y] of cells) {
            if (!this.isInBounds(x, y)) return false;
            if (x <= 0 || y <= 0 || x >= this.levelSize[0] - 1 || y >= this.levelSize[1] - 1) return false;
            if (grid.getTile(x, y) !== TILE.FOREST) return false;
        }

        for (const [x, y] of cells) {
            for (let dy = -gap; dy <= gap; dy++) {
                for (let dx = -gap; dx <= gap; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (!this.isInBounds(nx, ny)) continue;
                    if (core.has(`${nx},${ny}`)) continue;
                    const t = grid.getTile(nx, ny);
                    if (t !== TILE.FOREST && t !== TILE.PATH) return false;
                }
            }
        }

        return true;
    }

    private stampPatchCells(grid: IntGrid, cells: Array<[number, number]>, patchType: number): void {
        for (const [x, y] of cells) {
            grid.setTile(x, y, patchType);
        }
    }

    private growMaskBlob(grid: IntGrid, seedX: number, seedY: number, targetSize: number): Set<string> {
        const mask = new Set<string>();
        const queue: Array<[number, number]> = [[seedX, seedY]];

        while (queue.length > 0 && mask.size < targetSize) {
            const idx = this.randomInt(0, queue.length - 1);
            const [x, y] = queue.splice(idx, 1)[0];
            if (!this.isInBounds(x, y) || x < 1 || y < 1 || x >= this.levelSize[0] - 1 || y >= this.levelSize[1] - 1) continue;
            if (mask.has(`${x},${y}`)) continue;
            if (grid.getTile(x, y) !== TILE.FOREST) continue;

            mask.add(`${x},${y}`);
            for (const [nx, ny] of this.neighbors4([x, y])) {
                if (this.rng() < 0.8) {
                    queue.push([nx, ny]);
                }
            }
        }

        return mask;
    }

    private isNearPath(grid: IntGrid, x: number, y: number, radius: number): boolean {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (!this.isInBounds(nx, ny)) continue;
                if (grid.getTile(nx, ny) === TILE.PATH) {
                    return true;
                }
            }
        }
        return false;
    }

    private isRegionForestWithGap(
        grid: IntGrid,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        gap: number,
    ): boolean {
        const [w, h] = this.levelSize;
        const fromX = this.clamp(minX - gap, 1, w - 2);
        const toX = this.clamp(maxX + gap, 1, w - 2);
        const fromY = this.clamp(minY - gap, 1, h - 2);
        const toY = this.clamp(maxY + gap, 1, h - 2);

        for (let y = fromY; y <= toY; y++) {
            for (let x = fromX; x <= toX; x++) {
                if (grid.getTile(x, y) !== TILE.FOREST) {
                    return false;
                }
            }
        }

        return true;
    }

    private maskTouchesNonForestWithinGap(grid: IntGrid, mask: Set<string>, gap: number): boolean {
        for (const cell of mask) {
            const [x, y] = cell.split(',').map(Number);
            if (this.hasNearbyNonForestTile(grid, x, y, gap)) {
                return true;
            }
        }

        return false;
    }

    private enforceCliffObstacleClearance(grid: IntGrid, radius: number): void {
        const [w, h] = this.levelSize;
        const toPath: Array<[number, number]> = [];

        // Scan outward from each cliff tile so its perimeter is guaranteed PATH.
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid.getTile(x, y) !== TILE.CLIFF) continue;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (!this.isInBounds(nx, ny)) continue;

                        const t = grid.getTile(nx, ny);
                        // Keep cliff walls and hill interiors intact; force everything else to path.
                        if (t === TILE.CLIFF || t === TILE.HILL || t === TILE.PATH) continue;
                        toPath.push([nx, ny]);
                    }
                }
            }
        }

        for (const [x, y] of toPath) {
            grid.setTile(x, y, TILE.PATH);
        }
    }

    private hasNearbyNonForestTile(grid: IntGrid, x: number, y: number, radius: number): boolean {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (!this.isInBounds(nx, ny)) continue;
                if (grid.getTile(nx, ny) !== TILE.FOREST) {
                    return true;
                }
            }
        }

        return false;
    }

    // =====================================================================
    // Double-Wide Path Fix (same logic as DelaunayMazeAlgorithm)
    // =====================================================================

    private fixDoubleWidePaths(grid: IntGrid): void {
        const usedWasm = generationWasmBridge.tryFixDoubleWide(
            grid,
            this.levelSize[0],
            this.levelSize[1],
            TILE.PATH,
            TILE.FOREST,
            this.MAX_DOUBLE_WIDE_FIX_ITER,
        );
        if (!usedWasm) {
            throw new Error('SkywardCitadel requires generation-kernels.wasm for double-wide path fixing');
        }
    }

    // =====================================================================
    // Dead End Reduction
    // =====================================================================

    /**
     * Reduce dead ends, but preserve dead ends that terminate at house doors.
     * A "door dead end" is a path tile with exactly 1 path neighbor and
     * at least one adjacent HOUSE tile.
     */
    private reduceDeadEnds(grid: IntGrid, houses: PlacedHouse[]): void {
        const [w, h] = this.levelSize;

        // Collect door positions for preservation
        const doorSet = new Set(houses.map(h => `${h.door.x},${h.door.y}`));
        const edgeSet = this.collectBorderPathSet(grid);
        const protectedSet = new Set<string>([...doorSet, ...edgeSet]);

        for (let pass = 0; pass < this.DEAD_END_PASSES; pass++) {
            let changed = false;

            // Find all dead ends
            for (let x = 1; x < w - 1; x++) {
                for (let y = 1; y < h - 1; y++) {
                    if (grid.getTile(x, y) !== TILE.PATH) continue;

                    const pathNeighbors = this.neighbors4([x, y]).filter(
                        ([nx, ny]) => grid.getTile(nx, ny) === TILE.PATH
                    );

                    // Dead end = exactly 1 path neighbor
                    if (pathNeighbors.length !== 1) continue;

                    const key = `${x},${y}`;

                    // Preserve critical path anchors (doors and edge exits)
                    if (protectedSet.has(key)) continue;

                    const chain = this.collectDeadEndChain([x, y], grid, protectedSet);
                    if (chain.length === 0) continue;

                    // Prefer turning dead ends into loops (L-corners / staircase connectors).
                    if (this.tryConvertDeadEndToLoop(chain, grid, protectedSet)) {
                        changed = true;
                        continue;
                    }

                    // Prune the whole dead-end chain, not just one tile.
                    if (this.pruneDeadEndChain(chain, grid, protectedSet)) {
                        changed = true;
                    }
                }
            }

            if (!changed) {
                break;
            }
        }
    }

    /**
     * Remove a dead-end chain until it reaches a junction or protected tile.
     * This removes long dead-end corridors rather than extending them.
     */
    private pruneDeadEndChain(
        chain: [number, number][],
        grid: IntGrid,
        protectedSet: Set<string>,
    ): boolean {
        let changed = false;

        for (const [x, y] of chain) {
            const key = `${x},${y}`;
            if (protectedSet.has(key)) break;
            if (grid.getTile(x, y) !== TILE.PATH) continue;

            // Remove chain tile.
            grid.setTile(x, y, TILE.FOREST);
            changed = true;
        }

        return changed;
    }

    private collectDeadEndChain(
        start: [number, number],
        grid: IntGrid,
        protectedSet: Set<string>,
    ): [number, number][] {
        const chain: [number, number][] = [];
        let current: [number, number] = start;
        let previous: [number, number] | null = null;

        for (let step = 0; step < this.DEAD_END_CHAIN_MAX; step++) {
            const key = `${current[0]},${current[1]}`;
            if (protectedSet.has(key)) break;
            if (grid.getTile(current[0], current[1]) !== TILE.PATH) break;

            chain.push(current);

            const nextNeighbors = this.neighbors4(current)
                .filter(([nx, ny]) => this.isInBounds(nx, ny) && grid.getTile(nx, ny) === TILE.PATH)
                .filter(([nx, ny]) => !previous || nx !== previous[0] || ny !== previous[1]);

            if (nextNeighbors.length !== 1) {
                break;
            }

            previous = current;
            current = nextNeighbors[0];
        }

        return chain;
    }

    private tryConvertDeadEndToLoop(
        chain: [number, number][],
        grid: IntGrid,
        protectedSet: Set<string>,
    ): boolean {
        const chainSet = new Set(chain.map(([x, y]) => `${x},${y}`));
        const source = chain[0];
        const candidates = this.getPathTiles(grid)
            .filter(([x, y]) => !chainSet.has(`${x},${y}`))
            .filter(([x, y]) => {
                const dist = this.manhattan(source, [x, y]);
                return dist >= this.DEAD_END_LOOP_MIN_DIST && dist <= this.DEAD_END_LOOP_MAX_DIST;
            })
            .filter(([x, y]) => !protectedSet.has(`${x},${y}`))
            .sort((a, b) => this.manhattan(source, a) - this.manhattan(source, b))
            .slice(0, 12);

        for (const target of candidates) {
            if (this.tryCarveLCornerConnector(source, target, grid, chainSet)) {
                return true;
            }
            if (this.tryCarveStaircaseConnector(source, target, grid, chainSet)) {
                return true;
            }
        }

        return false;
    }

    private tryCarveLCornerConnector(
        start: [number, number],
        end: [number, number],
        grid: IntGrid,
        chainSet: Set<string>,
    ): boolean {
        const corners: [number, number][] = [
            [start[0], end[1]],
            [end[0], start[1]],
        ];

        for (const corner of corners) {
            const segments: [number, number][][] = [
                this.traceStraightPath(start, corner),
                this.traceStraightPath(corner, end),
            ];

            if (segments.some(segment => !this.canCarveSegment(segment, grid, chainSet))) continue;

            for (const segment of segments) {
                this.carveSegment(segment, grid);
            }
            return true;
        }

        return false;
    }

    private tryCarveStaircaseConnector(
        start: [number, number],
        end: [number, number],
        grid: IntGrid,
        chainSet: Set<string>,
    ): boolean {
        const path = this.traceStaircasePath(start, end);
        if (!this.canCarveSegment(path, grid, chainSet)) return false;
        this.carveSegment(path, grid);
        return true;
    }

    private traceStraightPath(start: [number, number], end: [number, number]): [number, number][] {
        const points: [number, number][] = [];
        let [x, y] = start;
        points.push([x, y]);

        while (x !== end[0] || y !== end[1]) {
            if (x !== end[0]) {
                x += x < end[0] ? 1 : -1;
            } else if (y !== end[1]) {
                y += y < end[1] ? 1 : -1;
            }
            points.push([x, y]);
        }

        return points;
    }

    private traceStaircasePath(start: [number, number], end: [number, number]): [number, number][] {
        const points: [number, number][] = [];
        let [x, y] = start;
        points.push([x, y]);

        while (x !== end[0] || y !== end[1]) {
            const moveX = x !== end[0] && (Math.abs(end[0] - x) >= Math.abs(end[1] - y) || y === end[1]);
            if (moveX) {
                x += x < end[0] ? 1 : -1;
            } else if (y !== end[1]) {
                y += y < end[1] ? 1 : -1;
            }
            points.push([x, y]);
        }

        return points;
    }

    private canCarveSegment(
        segment: [number, number][],
        grid: IntGrid,
        chainSet: Set<string>,
    ): boolean {
        for (const [x, y] of segment) {
            if (!this.isInBounds(x, y)) return false;
            const tile = grid.getTile(x, y);
            if (tile === TILE.HOUSE) return false;
            // Avoid carving back through the dead-end chain except at the source endpoint.
            if (chainSet.has(`${x},${y}`) && !(x === segment[0][0] && y === segment[0][1])) {
                return false;
            }
        }
        return true;
    }

    private carveSegment(segment: [number, number][], grid: IntGrid): void {
        for (const [x, y] of segment) {
            if (grid.getTile(x, y) !== TILE.HOUSE) {
                grid.setTile(x, y, TILE.PATH);
            }
        }
    }

    /**
     * Resolve diagonal/corner near-miss pockets where two routes are visually close
     * but not orthogonally connected. Carves a single-tile L-corner bridge.
     */
    private resolveNearMissCorners(grid: IntGrid): void {
        const [w, h] = this.levelSize;

        for (let x = 0; x < w - 1; x++) {
            for (let y = 0; y < h - 1; y++) {
                const a = grid.getTile(x, y) === TILE.PATH;
                const b = grid.getTile(x + 1, y + 1) === TILE.PATH;
                const c = grid.getTile(x + 1, y) === TILE.PATH;
                const d = grid.getTile(x, y + 1) === TILE.PATH;

                if (a && b && !c && !d) {
                    const openRight = grid.getTile(x + 1, y) !== TILE.HOUSE;
                    const openDown = grid.getTile(x, y + 1) !== TILE.HOUSE;
                    if (openRight && openDown) {
                        if (this.rng() < 0.5) grid.setTile(x + 1, y, TILE.PATH);
                        else grid.setTile(x, y + 1, TILE.PATH);
                    } else if (openRight) {
                        grid.setTile(x + 1, y, TILE.PATH);
                    } else if (openDown) {
                        grid.setTile(x, y + 1, TILE.PATH);
                    }
                }

                const e = grid.getTile(x + 1, y) === TILE.PATH;
                const f = grid.getTile(x, y + 1) === TILE.PATH;
                const g = grid.getTile(x, y) === TILE.PATH;
                const hPath = grid.getTile(x + 1, y + 1) === TILE.PATH;

                if (e && f && !g && !hPath) {
                    const openUpLeft = grid.getTile(x, y) !== TILE.HOUSE;
                    const openDownRight = grid.getTile(x + 1, y + 1) !== TILE.HOUSE;
                    if (openUpLeft && openDownRight) {
                        if (this.rng() < 0.5) grid.setTile(x, y, TILE.PATH);
                        else grid.setTile(x + 1, y + 1, TILE.PATH);
                    } else if (openUpLeft) {
                        grid.setTile(x, y, TILE.PATH);
                    } else if (openDownRight) {
                        grid.setTile(x + 1, y + 1, TILE.PATH);
                    }
                }
            }
        }
    }

    private collectBorderPathSet(grid: IntGrid): Set<string> {
        const [w, h] = this.levelSize;
        const set = new Set<string>();

        for (let x = 0; x < w; x++) {
            if (grid.getTile(x, 0) === TILE.PATH) set.add(`${x},0`);
            if (grid.getTile(x, h - 1) === TILE.PATH) set.add(`${x},${h - 1}`);
        }
        for (let y = 0; y < h; y++) {
            if (grid.getTile(0, y) === TILE.PATH) set.add(`0,${y}`);
            if (grid.getTile(w - 1, y) === TILE.PATH) set.add(`${w - 1},${y}`);
        }

        return set;
    }

    // =====================================================================
    // Utility
    // =====================================================================

    private manhattan(a: [number, number], b: [number, number]): number {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    private getHouseCenter(house: PlacedHouse): { x: number; y: number } {
        const sum = house.tiles.reduce(
            (acc, tile) => ({ x: acc.x + tile.x, y: acc.y + tile.y }),
            { x: 0, y: 0 },
        );
        return {
            x: Math.round(sum.x / house.tiles.length),
            y: Math.round(sum.y / house.tiles.length),
        };
    }

    private randomInt(min: number, max: number): number {
        return min + Math.floor(this.rng() * (max - min + 1));
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    private isInBounds(x: number, y: number): boolean {
        const [w, h] = this.levelSize;
        return x >= 0 && x < w && y >= 0 && y < h;
    }

    private neighbors4(pos: [number, number]): [number, number][] {
        const [x, y] = pos;
        return [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    }

    private neighbors8(pos: [number, number]): [number, number][] {
        const [x, y] = pos;
        return [
            [x - 1, y - 1], [x, y - 1], [x + 1, y - 1],
            [x - 1, y], [x + 1, y],
            [x - 1, y + 1], [x, y + 1], [x + 1, y + 1],
        ];
    }

}

/** @deprecated Use SkywardCitadelAlgorithm instead. */
export const SkywardCitadelGenerator = SkywardCitadelAlgorithm;
