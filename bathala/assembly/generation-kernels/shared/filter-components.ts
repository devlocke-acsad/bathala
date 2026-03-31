// @ts-nocheck
/**
 * filterComponentsBySizeAndFootprintInPlace — removes tileType components
 * that are either too small in cell count OR whose bounding box is too narrow.
 *
 * A component must satisfy ALL THREE conditions to survive:
 *   1. cell count >= minSize
 *   2. bounding box width >= minWidth
 *   3. bounding box height >= minHeight
 */

import { LABELS, QUEUE, getCell, setCell, inBounds, idx } from '../common/grid';

export function filterComponentsBySizeAndFootprintInPlace(
  width: i32,
  height: i32,
  tileType: i32,
  fillTile: i32,
  minSize: i32,
  minWidth: i32,
  minHeight: i32,
): void {
  const cells: i32 = width * height;

  // Clear labels
  for (let i: i32 = 0; i < cells; i++) {
    unchecked((LABELS[i] = 0));
  }

  let labelId: i32 = 0;

  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      if (getCell(x, y, width) != tileType) continue;
      const cellIdx: i32 = idx(x, y, width);
      if (unchecked(LABELS[cellIdx]) != 0) continue;

      labelId++;
      let qHead: i32 = 0;
      let qTail: i32 = 0;
      let componentSize: i32 = 0;
      let bbMinX: i32 = x;
      let bbMaxX: i32 = x;
      let bbMinY: i32 = y;
      let bbMaxY: i32 = y;

      unchecked((QUEUE[qTail * 2] = x));
      unchecked((QUEUE[qTail * 2 + 1] = y));
      qTail++;
      unchecked((LABELS[cellIdx] = labelId));

      while (qHead < qTail) {
        const cx: i32 = unchecked(QUEUE[qHead * 2]);
        const cy: i32 = unchecked(QUEUE[qHead * 2 + 1]);
        qHead++;
        componentSize++;

        if (cx < bbMinX) bbMinX = cx;
        if (cx > bbMaxX) bbMaxX = cx;
        if (cy < bbMinY) bbMinY = cy;
        if (cy > bbMaxY) bbMaxY = cy;

        const dx4: StaticArray<i32> = [0, 0, -1, 1];
        const dy4: StaticArray<i32> = [-1, 1, 0, 0];
        for (let d: i32 = 0; d < 4; d++) {
          const nx: i32 = cx + unchecked(dx4[d]);
          const ny: i32 = cy + unchecked(dy4[d]);
          if (!inBounds(nx, ny, width, height)) continue;
          if (getCell(nx, ny, width) != tileType) continue;
          const nIdx: i32 = idx(nx, ny, width);
          if (unchecked(LABELS[nIdx]) != 0) continue;
          unchecked((LABELS[nIdx] = labelId));
          unchecked((QUEUE[qTail * 2] = nx));
          unchecked((QUEUE[qTail * 2 + 1] = ny));
          qTail++;
        }
      }

      const bbW: i32 = bbMaxX - bbMinX + 1;
      const bbH: i32 = bbMaxY - bbMinY + 1;

      if (componentSize < minSize || bbW < minWidth || bbH < minHeight) {
        for (let i: i32 = 0; i < cells; i++) {
          if (unchecked(LABELS[i]) == labelId) {
            const fx: i32 = i % width;
            const fy: i32 = i / width;
            setCell(fx, fy, width, fillTile);
          }
        }
      }
    }
  }
}
