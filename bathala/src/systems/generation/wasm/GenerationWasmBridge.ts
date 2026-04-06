import { IntGrid } from '../toolbox/IntGrid';

type KernelExports = WebAssembly.Exports & {
  memory: WebAssembly.Memory;
  ensureCapacity: (requiredCells: number) => number;
  getGridPtr: () => number;
  getPathPtr: () => number;
  getMaxCells: () => number;
  fixDoubleWideInPlace: (
    width: number,
    height: number,
    pathTile: number,
    fillTile: number,
    maxIterations: number,
  ) => void;
  extendDeadEndsInPlace: (
    width: number,
    height: number,
    pathTile: number,
    maxExtend: number,
  ) => void;
  enforceMinThickness2x2InPlace: (
    width: number,
    height: number,
    patchTile: number,
    fillTile: number,
    maxPasses: number,
  ) => void;
  enforceExact2x2BundlesInPlace: (
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    enableNearRule: number,
    nearTile: number,
    nearFillTile: number,
  ) => void;
  removeSmallComponentsInPlace: (
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    minSize: number,
  ) => void;
  filterComponentsBySizeAndFootprintInPlace: (
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    minSize: number,
    minWidth: number,
    minHeight: number,
  ) => void;
  repairCliffGapsInPlace: (
    width: number,
    height: number,
    pathTile: number,
    waterTile: number,
    cliffTile: number,
    maxPasses: number,
  ) => void;
  findRoadPathAStar: (
    width: number,
    height: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    houseTile: number,
    pathTile: number,
    fenceTile: number,
    baseCost: number,
    existingPathCost: number,
    fenceCostMultiplier: number,
    directionChangePenalty: number,
  ) => number;
  enforceCliffShellIntegrityInPlace: (
    width: number,
    height: number,
    pathTile: number,
    waterTile: number,
    cliffTile: number,
    hillTile: number,
    maxPasses: number,
  ) => void;
  getParamsPtr: () => number;
  generateSubmergedVillage: (
    width: number,
    height: number,
    seed: number,
  ) => void;
  sc_getParamsPtr: () => number;
  generateSkywardCitadel: (
    width: number,
    height: number,
    seed: number,
  ) => void;
};

class GenerationWasmBridge {
  private static singleton: GenerationWasmBridge | null = null;

  private exports: KernelExports | null = null;
  private loadAttempted = false;
  private loadPromise: Promise<void> | null = null;
  private warnedLoadFailure = false;
  private lastUnavailableReason = 'not initialized';
  private syncBootstrapAttempted = false;

  /** AssemblyScript stub runtime may import env.abort — provide a no-op. */
  private wasmImports(): WebAssembly.Imports {
    return {
      env: {
        abort: (_msg: number, _file: number, _line: number, _col: number) => {
          if (typeof console !== 'undefined') {
            console.error('[generation-kernels.wasm] abort called');
          }
        },
      },
    };
  }

  private getGlobalWasmBytes(): ArrayBuffer | ArrayBufferView | null {
    const bytes = (globalThis as any).__generation_kernels_wasm_bytes;
    return bytes ?? null;
  }

  private validateAndSetExports(instanceExports: KernelExports): boolean {
    if (
      !instanceExports.memory ||
      !instanceExports.ensureCapacity ||
      !instanceExports.getGridPtr ||
      !instanceExports.getMaxCells ||
      !instanceExports.getPathPtr
    ) {
      this.warnDev('generation-kernels.wasm loaded but required exports are missing');
      return false;
    }

    this.exports = instanceExports;
    return true;
  }

  private tryInstantiateSyncFromGlobalBytes(): boolean {
    if (this.exports) return true;

    let bytes = this.getGlobalWasmBytes();
    if (!bytes) {
      bytes = this.tryFetchSyncWasmBytes();
      if (bytes) {
        (globalThis as any).__generation_kernels_wasm_bytes = bytes;
      }
    }
    if (!bytes) return false;

    try {
      const normalizedBytes = this.toArrayBuffer(bytes);
      const module = new WebAssembly.Module(normalizedBytes);
      const instance = new WebAssembly.Instance(module, this.wasmImports());
      const instanceExports = instance.exports as unknown as KernelExports;
      return this.validateAndSetExports(instanceExports);
    } catch (error) {
      this.warnDev(`Failed to synchronously instantiate generation-kernels.wasm bytes: ${String(error)}`);
      return false;
    }
  }

  private tryFetchSyncWasmBytes(): ArrayBuffer | null {
    if (this.syncBootstrapAttempted) return null;
    this.syncBootstrapAttempted = true;

    if (typeof XMLHttpRequest === 'undefined') {
      this.lastUnavailableReason = 'XMLHttpRequest unavailable for sync bootstrap';
      return null;
    }

    try {
      const request = new XMLHttpRequest();
      request.open('GET', this.getWasmUrl(), false);
      request.responseType = 'arraybuffer';
      request.send(null);

      if (request.status >= 200 && request.status < 300 && request.response instanceof ArrayBuffer) {
        return request.response;
      }

      this.lastUnavailableReason = `sync wasm fetch failed with status ${request.status}`;
      return null;
    } catch (error) {
      this.lastUnavailableReason = `sync wasm fetch threw: ${String(error)}`;
      return null;
    }
  }

  static get(): GenerationWasmBridge {
    if (!GenerationWasmBridge.singleton) {
      GenerationWasmBridge.singleton = new GenerationWasmBridge();
    }
    return GenerationWasmBridge.singleton;
  }

  private constructor() {
    this.startLoad();
  }

  private startLoad(): void {
    if (this.loadAttempted) return;
    this.loadAttempted = true;
    this.loadPromise = this.loadWasm();
  }

  private getWasmUrl(): string {
    const base = ((import.meta as any).env?.BASE_URL as string | undefined) ?? '/';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}wasm/generation-kernels.wasm`;
  }

  private toArrayBuffer(bytes: ArrayBuffer | ArrayBufferView): ArrayBuffer {
    if (bytes instanceof ArrayBuffer) {
      return bytes;
    }

    const view = bytes as ArrayBufferView;
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return copy.buffer;
  }

  private async instantiateFromBytes(bytes: ArrayBuffer | ArrayBufferView): Promise<void> {
    try {
      const normalizedBytes = this.toArrayBuffer(bytes);
      const result = await WebAssembly.instantiate(normalizedBytes, this.wasmImports());
      const instanceExports = result.instance.exports as unknown as KernelExports;
      this.validateAndSetExports(instanceExports);
    } catch (error) {
      this.warnDev(`Failed to instantiate generation-kernels.wasm bytes: ${String(error)}`);
    }
  }

  async initializeFromBinaryBytes(bytes: ArrayBuffer | ArrayBufferView): Promise<boolean> {
    (globalThis as any).__generation_kernels_wasm_bytes = bytes;
    await this.instantiateFromBytes(bytes);
    return this.exports !== null;
  }

  private async loadWasm(): Promise<void> {
    if (typeof WebAssembly === 'undefined' || typeof fetch === 'undefined') {
      return;
    }

    try {
      const url = this.getWasmUrl();
      const response = await fetch(url);
      if (!response.ok) return;

      let result: WebAssembly.WebAssemblyInstantiatedSource;
      if ('instantiateStreaming' in WebAssembly) {
        try {
          result = await WebAssembly.instantiateStreaming(response, this.wasmImports());
        } catch {
          const bytes = await response.arrayBuffer();
          result = await WebAssembly.instantiate(bytes, this.wasmImports());
        }
      } else {
        const bytes = await response.arrayBuffer();
        result = await WebAssembly.instantiate(bytes, this.wasmImports());
      }

      const instanceExports = result.instance.exports as unknown as KernelExports;
      this.validateAndSetExports(instanceExports);
    } catch (error) {
      this.warnDev(`Failed to load generation-kernels.wasm: ${String(error)}`);
    }
  }

  private warnDev(message: string): void {
    if (this.warnedLoadFailure) return;
    this.warnedLoadFailure = true;
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(`[GenerationWasmBridge] ${message}`);
    }
  }

  getUnavailableReason(): string {
    return this.lastUnavailableReason;
  }

  async ensureReady(timeoutMs = 0): Promise<boolean> {
    this.startLoad();
    const pending = this.loadPromise;
    if (!pending) {
      return this.exports !== null;
    }

    if (timeoutMs <= 0) {
      await pending;
      return this.exports !== null;
    }

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    try {
      await Promise.race([
        pending,
        new Promise<void>((resolve) => {
          timeoutHandle = setTimeout(resolve, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutHandle !== null) {
        clearTimeout(timeoutHandle);
      }
    }

    return this.exports !== null;
  }

  isReady(): boolean {
    return this.exports !== null;
  }

  private runKernel(
    grid: IntGrid,
    width: number,
    height: number,
    runner: (e: KernelExports) => void,
  ): boolean {
    return this.runKernelBatch(grid, width, height, [runner]);
  }

  runKernelBatch(
    grid: IntGrid,
    width: number,
    height: number,
    runners: Array<(e: KernelExports) => void>,
  ): boolean {
    const e = this.exports ?? (this.tryInstantiateSyncFromGlobalBytes() ? this.exports : null);
    if (!e) {
      this.lastUnavailableReason = 'wasm exports unavailable';
      return false;
    }

    const cells = width * height;
    if (cells <= 0) return false;
    if (e.ensureCapacity(cells) !== 1) return false;

    const ptr = e.getGridPtr() >>> 0;
    const bytesRequired = ptr + cells * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < bytesRequired) return false;

    const wasmGrid = new Int32Array(e.memory.buffer, ptr, cells);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        wasmGrid[rowOffset + x] = grid.getTile(x, y);
      }
    }

    for (const run of runners) {
      run(e);
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        grid.setTile(x, y, wasmGrid[rowOffset + x]);
      }
    }

    return true;
  }

  tryFixDoubleWide(
    grid: IntGrid,
    width: number,
    height: number,
    pathTile: number,
    fillTile: number,
    maxIterations: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.fixDoubleWideInPlace(width, height, pathTile, fillTile, maxIterations);
    });
  }

  tryExtendDeadEnds(
    grid: IntGrid,
    width: number,
    height: number,
    pathTile: number,
    maxExtend: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.extendDeadEndsInPlace(width, height, pathTile, maxExtend);
    });
  }

  tryEnforceMinThickness2x2(
    grid: IntGrid,
    width: number,
    height: number,
    patchTile: number,
    fillTile: number,
    maxPasses: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.enforceMinThickness2x2InPlace(width, height, patchTile, fillTile, maxPasses);
    });
  }

  tryEnforceExact2x2Bundles(
    grid: IntGrid,
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    enableNearRule: number,
    nearTile: number,
    nearFillTile: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.enforceExact2x2BundlesInPlace(
        width,
        height,
        tileType,
        fillTile,
        enableNearRule,
        nearTile,
        nearFillTile,
      );
    });
  }

  tryRemoveSmallComponents(
    grid: IntGrid,
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    minSize: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.removeSmallComponentsInPlace(width, height, tileType, fillTile, minSize);
    });
  }

  tryFilterComponentsBySizeAndFootprint(
    grid: IntGrid,
    width: number,
    height: number,
    tileType: number,
    fillTile: number,
    minSize: number,
    minWidth: number,
    minHeight: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.filterComponentsBySizeAndFootprintInPlace(
        width,
        height,
        tileType,
        fillTile,
        minSize,
        minWidth,
        minHeight,
      );
    });
  }

  tryRepairCliffGaps(
    grid: IntGrid,
    width: number,
    height: number,
    pathTile: number,
    waterTile: number,
    cliffTile: number,
    maxPasses: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.repairCliffGapsInPlace(width, height, pathTile, waterTile, cliffTile, maxPasses);
    });
  }

  tryFindRoadPath(
    grid: IntGrid,
    width: number,
    height: number,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    houseTile: number,
    pathTile: number,
    fenceTile: number,
    baseCost: number,
    existingPathCost: number,
    fenceCostMultiplier: number,
    directionChangePenalty: number,
  ): [number, number][] | null | undefined {
    const e = this.exports ?? (this.tryInstantiateSyncFromGlobalBytes() ? this.exports : null);
    if (!e) {
      this.lastUnavailableReason = 'wasm exports unavailable';
      return undefined;
    }

    const cells = width * height;
    if (cells <= 0) {
      this.lastUnavailableReason = 'invalid grid dimensions';
      return null;
    }
    if (e.ensureCapacity(cells) !== 1) {
      this.lastUnavailableReason = 'ensureCapacity failed';
      return null;
    }

    let gridPtr = e.getGridPtr() >>> 0;
    let bytesRequired = gridPtr + cells * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < bytesRequired) {
      if (e.ensureCapacity(cells) !== 1) {
        this.lastUnavailableReason = 'ensureCapacity retry failed';
        return null;
      }
      gridPtr = e.getGridPtr() >>> 0;
      bytesRequired = gridPtr + cells * Int32Array.BYTES_PER_ELEMENT;
      if (e.memory.buffer.byteLength < bytesRequired) {
        this.lastUnavailableReason = 'insufficient wasm memory for grid buffer';
        return null;
      }
    }

    const wasmGrid = new Int32Array(e.memory.buffer, gridPtr, cells);
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        wasmGrid[rowOffset + x] = grid.getTile(x, y);
      }
    }

    // WASM kernel uses fixed-point integer costs (×1000) for performance.
    const COST_SCALE = 1000;
    const len = e.findRoadPathAStar(
      width,
      height,
      startX,
      startY,
      endX,
      endY,
      houseTile,
      pathTile,
      fenceTile,
      Math.round(baseCost * COST_SCALE),
      Math.round(existingPathCost * COST_SCALE),
      Math.round(fenceCostMultiplier * COST_SCALE),
      Math.round(directionChangePenalty * COST_SCALE),
    );

    if (len < 0) {
      return null;
    }

    const pathPtr = e.getPathPtr() >>> 0;
    const pathBytesRequired = pathPtr + len * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < pathBytesRequired) {
      this.lastUnavailableReason = 'insufficient wasm memory for path buffer';
      return null;
    }

    const pathIndices = new Int32Array(e.memory.buffer, pathPtr, len);
    const path: [number, number][] = [];
    for (let i = 0; i < len; i++) {
      const idx = pathIndices[i];
      const px = idx % width;
      const py = Math.floor(idx / width);
      path.push([px, py]);
    }

    return path;
  }

  tryEnforceCliffShellIntegrity(
    grid: IntGrid,
    width: number,
    height: number,
    pathTile: number,
    waterTile: number,
    cliffTile: number,
    hillTile: number,
    maxPasses: number,
  ): boolean {
    return this.runKernel(grid, width, height, (e) => {
      e.enforceCliffShellIntegrityInPlace(
        width,
        height,
        pathTile,
        waterTile,
        cliffTile,
        hillTile,
        maxPasses,
      );
    });
  }

  /**
   * Run the ENTIRE SubmergedVillage generation pipeline in WASM.
   * Returns the resulting IntGrid, or null/undefined on failure.
   */
  tryGenerateSubmergedVillage(
    width: number,
    height: number,
    seed: number,
    params: Record<string, number>,
  ): IntGrid | null | undefined {
    const e = this.exports ?? (this.tryInstantiateSyncFromGlobalBytes() ? this.exports : null);
    if (!e) {
      this.lastUnavailableReason = 'wasm exports unavailable';
      return undefined;
    }

    const cells = width * height;
    if (cells <= 0) return null;
    if (e.ensureCapacity(cells) !== 1) return null;

    // Write params to WASM params buffer
    const paramsPtr = e.getParamsPtr() >>> 0;
    const paramsBytesRequired = paramsPtr + 32 * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < paramsBytesRequired) return null;

    const wasmParams = new Int32Array(e.memory.buffer, paramsPtr, 32);
    const S = 1000; // scale for float→int conversion
    wasmParams[0]  = params.houseCount ?? 6;
    wasmParams[1]  = params.houseMinSpacing ?? 2;
    wasmParams[2]  = params.neighborhoodCount ?? 2;
    wasmParams[3]  = Math.round((params.spreadFactor ?? 0.7) * S);
    wasmParams[4]  = params.houseClearRadius ?? 2;
    wasmParams[5]  = Math.round((params.scatterTreeChance ?? 0.08) * S);
    wasmParams[6]  = params.villageGroundGrowth ?? 3;
    wasmParams[7]  = Math.round((params.fenceChance ?? 0.3) * S);
    wasmParams[8]  = Math.round((params.rubbleChance ?? 0.05) * S);
    wasmParams[9]  = params.centerBiasX != null ? Math.round(params.centerBiasX * S) : 2147483647;
    wasmParams[10] = params.centerBiasY != null ? Math.round(params.centerBiasY * S) : 2147483647;
    wasmParams[11] = params.houseSizePreference ?? 1;
    wasmParams[12] = params.roadNeighborCount ?? 2;
    wasmParams[13] = params.doorStubLength ?? 2;
    wasmParams[14] = params.borderJitter ?? 3;
    wasmParams[15] = params.connectorBend ?? 2;
    wasmParams[16] = params.edgeConnectionsPerSide ?? 1;
    wasmParams[17] = params.detourCount ?? 2;
    wasmParams[18] = params.detourMinDistance ?? 6;
    wasmParams[19] = params.detourMaxDistance ?? 14;
    wasmParams[20] = params.fixDoubleWide != null ? (params.fixDoubleWide ? 1 : 0) : 1;
    wasmParams[21] = params.edgeMargin ?? 1;
    wasmParams[22] = params.cliffBandCount ?? 2;
    wasmParams[23] = params.hillClusterCount ?? 3;
    wasmParams[24] = params.grassPatchCount ?? 4;
    wasmParams[25] = params.sandPatchCount ?? 2;
    wasmParams[26] = params.waterPoolCount ?? 1;

    // Run the full algorithm in WASM
    e.generateSubmergedVillage(width, height, seed);

    // Read the grid back
    const gridPtr = e.getGridPtr() >>> 0;
    const gridBytesRequired = gridPtr + cells * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < gridBytesRequired) return null;

    const wasmGrid = new Int32Array(e.memory.buffer, gridPtr, cells);
    const result = new IntGrid(width, height);
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        result.setTile(x, y, wasmGrid[rowOffset + x]);
      }
    }
    return result;
  }

  /**
   * Run the ENTIRE SkywardCitadel generation pipeline in WASM.
   * Returns the resulting IntGrid, or null/undefined on failure.
   * Mirrors tryGenerateSubmergedVillage — separate PARAMS buffer via sc_getParamsPtr.
   */
  tryGenerateSkywardCitadel(
    width: number,
    height: number,
    seed: number,
    params: Record<string, number>,
  ): IntGrid | null | undefined {
    const e = this.exports ?? (this.tryInstantiateSyncFromGlobalBytes() ? this.exports : null);
    if (!e) {
      this.lastUnavailableReason = 'wasm exports unavailable';
      return undefined;
    }
    if (!e.sc_getParamsPtr || !e.generateSkywardCitadel) {
      this.lastUnavailableReason = 'skyward-citadel wasm exports not found (rebuild wasm)';
      return undefined;
    }

    const cells = width * height;
    if (cells <= 0) return null;
    if (e.ensureCapacity(cells) !== 1) return null;

    // Write params to the citadel-specific WASM params buffer
    const paramsPtr = e.sc_getParamsPtr() >>> 0;
    const paramsBytesRequired = paramsPtr + 32 * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < paramsBytesRequired) return null;

    const wasmParams = new Int32Array(e.memory.buffer, paramsPtr, 32);
    const S = 1000; // scale for float→int conversion
    wasmParams[0]  = params.houseCount ?? 6;
    wasmParams[1]  = params.houseMinSpacing ?? 2;
    wasmParams[2]  = params.neighborhoodCount ?? 2;
    wasmParams[3]  = Math.round((params.spreadFactor ?? 0.7) * S);
    wasmParams[4]  = params.houseClearRadius ?? 2;
    wasmParams[5]  = Math.round((params.scatterTreeChance ?? 0.08) * S);
    wasmParams[6]  = params.villageGroundGrowth ?? 3;
    wasmParams[7]  = Math.round((params.fenceChance ?? 0.3) * S);
    wasmParams[8]  = Math.round((params.rubbleChance ?? 0.05) * S);
    wasmParams[9]  = params.centerBiasX != null ? Math.round(params.centerBiasX * S) : 2147483647;
    wasmParams[10] = params.centerBiasY != null ? Math.round(params.centerBiasY * S) : 2147483647;
    wasmParams[11] = params.houseSizePreference ?? 1;
    wasmParams[12] = params.roadNeighborCount ?? 2;
    wasmParams[13] = params.doorStubLength ?? 2;
    wasmParams[14] = params.borderJitter ?? 3;
    wasmParams[15] = params.connectorBend ?? 2;
    wasmParams[16] = params.edgeConnectionsPerSide ?? 1;
    wasmParams[17] = params.detourCount ?? 2;
    wasmParams[18] = params.detourMinDistance ?? 6;
    wasmParams[19] = params.detourMaxDistance ?? 14;
    wasmParams[20] = params.fixDoubleWide != null ? (params.fixDoubleWide ? 1 : 0) : 1;
    wasmParams[21] = params.edgeMargin ?? 1;
    // Skyward Citadel intentionally excludes cliff terrain bands.
    wasmParams[22] = 0;
    wasmParams[23] = params.hillClusterCount ?? 3;
    // Skyward Citadel intentionally excludes grass-sand patch terrain.
    wasmParams[24] = 0;
    wasmParams[25] = params.sandPatchCount ?? 2;
    // Skyward Citadel intentionally excludes lake/water pools.
    wasmParams[26] = 0;

    // Run the full algorithm in WASM
    e.generateSkywardCitadel(width, height, seed);

    // Read the grid back
    const gridPtr = e.getGridPtr() >>> 0;
    const gridBytesRequired = gridPtr + cells * Int32Array.BYTES_PER_ELEMENT;
    if (e.memory.buffer.byteLength < gridBytesRequired) return null;

    const wasmGrid = new Int32Array(e.memory.buffer, gridPtr, cells);
    const result = new IntGrid(width, height);
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        result.setTile(x, y, wasmGrid[rowOffset + x]);
      }
    }
    return result;
  }
}

export const generationWasmBridge = GenerationWasmBridge.get();
