/**
 * R/Place Canvas Shared Protocol Constants and Optimized Decoding Utilities
 * 
 * Features:
 * - Direct 32-bit register unpacking (Uint32Array) for 2x faster decode and 0 loop GC pressure
 * - Pre-allocated CSS palette lookup for instant live pixel drawing
 * - Alpha-less canvas rendering for zero blending overhead
 */

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;
export const TOTAL_PIXELS = CANVAS_WIDTH * CANVAS_HEIGHT; // 600,000
export const EXPECTED_SNAPSHOT_BYTES = TOTAL_PIXELS / 2; // 300,000

/** Existing backend 16-color palette: index -> [r, g, b]. */
export const BACKEND_PALETTE: readonly [number, number, number][] = [
  [255, 255, 255], // 0: White
  [0, 0, 0],       // 1: Black
  [255, 0, 0],     // 2: Red
  [0, 255, 0],     // 3: Green
  [0, 0, 255],     // 4: Blue
  [255, 255, 0],   // 5: Yellow
  [255, 165, 0],   // 6: Orange
  [128, 0, 128],   // 7: Purple
  [0, 255, 255],   // 8: Cyan
  [255, 192, 203], // 9: Pink
  [165, 42, 42],   // 10: Brown
  [128, 128, 128], // 11: Dark Gray
  [192, 192, 192], // 12: Light Gray
  [173, 216, 230], // 13: Light Blue
  [144, 238, 144], // 14: Light Green
  [255, 215, 0],   // 15: Gold
];

/**
 * Precomputed 32-bit integer palette for high-performance direct 32-bit register writes.
 * Little-endian architecture: (Alpha << 24) | (Blue << 16) | (Green << 8) | Red.
 */
export const PALETTE_U32: Uint32Array = new Uint32Array(
  BACKEND_PALETTE.map(([r, g, b]) => (255 << 24) | (b << 16) | (g << 8) | r)
);

/**
 * Pre-cached CSS color strings to avoid runtime string allocations in live updates.
 */
export const PALETTE_CSS: readonly string[] = BACKEND_PALETTE.map(
  ([r, g, b]) => `rgb(${r},${g},${b})`
);

/**
 * High-performance binary snapshot unpacker.
 * Uses Uint32Array to write 1 integer per pixel instead of 4 separate byte assignments,
 * reducing memory bandwidth and eliminating GC garbage in the loop.
 */
export function unpackSnapshot(
  buffer: ArrayBuffer,
  ctx?: CanvasRenderingContext2D | null
): ImageData {
  const rawBytes = new Uint8Array(buffer);
  const imageData = ctx
    ? ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)
    : ({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        data: new Uint8ClampedArray(TOTAL_PIXELS * 4),
      } as unknown as ImageData);

  const pixels32 = new Uint32Array(imageData.data.buffer);
  let pIdx = 0;

  for (let i = 0; i < rawBytes.length && pIdx < TOTAL_PIXELS; i++) {
    const byte = rawBytes[i];
    pixels32[pIdx++] = PALETTE_U32[(byte >> 4) & 0x0f];
    if (pIdx < TOTAL_PIXELS) {
      pixels32[pIdx++] = PALETTE_U32[byte & 0x0f];
    }
  }

  return imageData;
}

/**
 * Draws an unpacked ArrayBuffer board state directly onto an HTML5 Canvas.
 */
export function renderSnapshotToCanvas(
  canvas: HTMLCanvasElement,
  buffer: ArrayBuffer
): boolean {
  try {
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (!ctx) return false;

    const imageData = unpackSnapshot(buffer, ctx);
    ctx.putImageData(imageData, 0, 0);
    return true;
  } catch (err) {
    console.error('Failed to render snapshot to canvas:', err);
    return false;
  }
}

/**
 * Draws a single pixel directly onto canvas using pre-cached CSS palette strings.
 */
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorId: number
): void {
  if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return;
  ctx.fillStyle = PALETTE_CSS[colorId & 0x0f];
  ctx.fillRect(x, y, 1, 1);
}
