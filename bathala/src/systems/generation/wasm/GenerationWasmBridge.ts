import { IntGrid } from '../toolbox/IntGrid';

type KernelExports = WebAssembly.Exports & {
  memory: WebAssembly.Memory;
  getGridPtr: () => number;
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
};

class GenerationWasmBridge {
  private static singleton: GenerationWasmBridge | null = null;

  private exports: KernelExports | null = null;
  private loadAttempted = false;

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
    void this.loadWasm();
  }

  private async loadWasm(): Promise<void> {
    if (typeof WebAssembly === 'undefined' || typeof fetch === 'undefined') {
      return;
    }

    try {
      const url = '/wasm/generation-kernels.wasm';
      const response = await fetch(url);
      if (!response.ok) return;

      let result: WebAssembly.WebAssemblyInstantiatedSource;
      if ('instantiateStreaming' in WebAssembly) {
        result = await WebAssembly.instantiateStreaming(response, {});
      } else {
        const bytes = await response.arrayBuffer();
        result = await WebAssembly.instantiate(bytes, {});
      }

      const instanceExports = result.instance.exports as unknown as KernelExports;
      if (!instanceExports.memory || !instanceExports.getGridPtr || !instanceExports.getMaxCells) {
        return;
      }

      this.exports = instanceExports;
    } catch {
      // Keep silent and fall back to TypeScript implementation.
    }
  }

  private runKernel(
    grid: IntGrid,
    width: number,
    height: number,
    runner: (e: KernelExports) => void,
  ): boolean {
    const e = this.exports;
    if (!e) return false;

    const cells = width * height;
    const maxCells = e.getMaxCells();
    if (cells <= 0 || cells > maxCells) return false;

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

    runner(e);

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
}

export const generationWasmBridge = GenerationWasmBridge.get();
