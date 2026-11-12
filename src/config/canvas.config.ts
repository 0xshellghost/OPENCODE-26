/**
 * Centralized Canvas Configuration Module
 * 
 * Provides environment-driven configuration for the R/Place collaborative canvas.
 * Values are safely parsed, validated, and clamped with sensible defaults.
 * 
 * Client-side variables follow Next.js public convention (NEXT_PUBLIC_CANVAS_*),
 * while also allowing server-side overrides (CANVAS_*).
 */

export interface CanvasConfig {
  width: number;
  height: number;
  totalPixels: number;
  expectedSnapshotBytes: number;
  zoom: {
    default: number;
    min: number;
    max: number;
    step: number;
  };
  initialPan: {
    x: number;
    y: number;
  };
}

export interface CanvasEnvSource {
  NEXT_PUBLIC_CANVAS_WIDTH?: string;
  CANVAS_WIDTH?: string;
  NEXT_PUBLIC_CANVAS_HEIGHT?: string;
  CANVAS_HEIGHT?: string;
  NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM?: string;
  CANVAS_DEFAULT_ZOOM?: string;
  NEXT_PUBLIC_CANVAS_MIN_ZOOM?: string;
  CANVAS_MIN_ZOOM?: string;
  NEXT_PUBLIC_CANVAS_MAX_ZOOM?: string;
  CANVAS_MAX_ZOOM?: string;
  NEXT_PUBLIC_CANVAS_ZOOM_STEP?: string;
  CANVAS_ZOOM_STEP?: string;
  NEXT_PUBLIC_CANVAS_INITIAL_PAN_X?: string;
  CANVAS_INITIAL_PAN_X?: string;
  NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y?: string;
  CANVAS_INITIAL_PAN_Y?: string;
  [key: string]: string | undefined;
}

/**
 * Parses a positive integer within bounds.
 * Rejects empty, whitespace-only, non-integer, non-finite, and out-of-range strings.
 */
export function parsePositiveInt(
  val: string | undefined | null,
  fallback: number,
  min: number = 1,
  max: number = 100000
): number {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (!trimmed || !/^-?\d+$/.test(trimmed)) return fallback;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

/**
 * Parses a positive floating-point number within bounds.
 * Rejects empty, whitespace-only, non-numeric, non-finite, and out-of-range strings.
 */
export function parsePositiveFloat(
  val: string | undefined | null,
  fallback: number,
  min: number = 0.01,
  max: number = 1000
): number {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  const parsed = Number(trimmed);
  if (isNaN(parsed) || !isFinite(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

/**
 * Parses a signed float for pan offsets with bounding.
 * Rejects empty, non-numeric, and non-finite values safely.
 */
export function parseFloatWithFallback(
  val: string | undefined | null,
  fallback: number,
  min: number = -100000,
  max: number = 100000
): number {
  if (typeof val !== 'string') return fallback;
  const trimmed = val.trim();
  if (!trimmed) return fallback;
  const parsed = Number(trimmed);
  if (isNaN(parsed) || !isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

/**
 * Pure function to resolve and validate the complete canvas configuration.
 * Validates all logical constraints:
 * - Dimensions are positive integers
 * - Zoom step is positive
 * - MIN_ZOOM <= DEFAULT_ZOOM <= MAX_ZOOM
 * - Initial pan offsets are finite numbers
 */
export function resolveCanvasConfig(envSource?: CanvasEnvSource): CanvasConfig {
  const env = envSource || (typeof process !== 'undefined' ? process.env : {});

  // 1. Dimensions
  const rawWidth = env.NEXT_PUBLIC_CANVAS_WIDTH || env.CANVAS_WIDTH;
  const rawHeight = env.NEXT_PUBLIC_CANVAS_HEIGHT || env.CANVAS_HEIGHT;

  const width = parsePositiveInt(rawWidth, 1000, 10, 10000);
  const height = parsePositiveInt(rawHeight, 600, 10, 10000);
  const totalPixels = width * height;
  const expectedSnapshotBytes = Math.ceil(totalPixels / 2);

  // 2. Zoom Limits & Step
  const rawMinZoom = env.NEXT_PUBLIC_CANVAS_MIN_ZOOM || env.CANVAS_MIN_ZOOM;
  const rawMaxZoom = env.NEXT_PUBLIC_CANVAS_MAX_ZOOM || env.CANVAS_MAX_ZOOM;
  const rawDefaultZoom = env.NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM || env.CANVAS_DEFAULT_ZOOM;
  const rawZoomStep = env.NEXT_PUBLIC_CANVAS_ZOOM_STEP || env.CANVAS_ZOOM_STEP;

  let minZoom = parsePositiveFloat(rawMinZoom, 1.0, 0.01, 100.0);
  let maxZoom = parsePositiveFloat(rawMaxZoom, 40.0, 0.01, 200.0);

  // Logical validation: minZoom must not exceed maxZoom
  if (minZoom > maxZoom) {
    // If invalid inversion is supplied, fall back to safe default bounds
    minZoom = 1.0;
    maxZoom = 40.0;
  }

  // Clamped default zoom: MIN_ZOOM <= DEFAULT_ZOOM <= MAX_ZOOM
  const parsedDefaultZoom = parsePositiveFloat(rawDefaultZoom, 1.0, 0.01, 200.0);
  const defaultZoom = Math.max(minZoom, Math.min(maxZoom, parsedDefaultZoom));
  const zoomStep = parsePositiveFloat(rawZoomStep, 0.25, 0.01, 5.0);

  // 3. Initial Pan
  const rawPanX = env.NEXT_PUBLIC_CANVAS_INITIAL_PAN_X || env.CANVAS_INITIAL_PAN_X;
  const rawPanY = env.NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y || env.CANVAS_INITIAL_PAN_Y;

  const initialPanX = parseFloatWithFallback(rawPanX, 0, -100000, 100000);
  const initialPanY = parseFloatWithFallback(rawPanY, 0, -100000, 100000);

  return {
    width,
    height,
    totalPixels,
    expectedSnapshotBytes,
    zoom: {
      default: defaultZoom,
      min: minZoom,
      max: maxZoom,
      step: zoomStep,
    },
    initialPan: {
      x: initialPanX,
      y: initialPanY,
    },
  };
}

// -----------------------------------------------------------------------------
// Compile-time literal environment extraction for Next.js bundler static inlining
// -----------------------------------------------------------------------------
const activeConfig = resolveCanvasConfig({
  NEXT_PUBLIC_CANVAS_WIDTH: process.env.NEXT_PUBLIC_CANVAS_WIDTH,
  CANVAS_WIDTH: process.env.CANVAS_WIDTH,
  NEXT_PUBLIC_CANVAS_HEIGHT: process.env.NEXT_PUBLIC_CANVAS_HEIGHT,
  CANVAS_HEIGHT: process.env.CANVAS_HEIGHT,
  NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM: process.env.NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM,
  CANVAS_DEFAULT_ZOOM: process.env.CANVAS_DEFAULT_ZOOM,
  NEXT_PUBLIC_CANVAS_MIN_ZOOM: process.env.NEXT_PUBLIC_CANVAS_MIN_ZOOM,
  CANVAS_MIN_ZOOM: process.env.CANVAS_MIN_ZOOM,
  NEXT_PUBLIC_CANVAS_MAX_ZOOM: process.env.NEXT_PUBLIC_CANVAS_MAX_ZOOM,
  CANVAS_MAX_ZOOM: process.env.CANVAS_MAX_ZOOM,
  NEXT_PUBLIC_CANVAS_ZOOM_STEP: process.env.NEXT_PUBLIC_CANVAS_ZOOM_STEP,
  CANVAS_ZOOM_STEP: process.env.CANVAS_ZOOM_STEP,
  NEXT_PUBLIC_CANVAS_INITIAL_PAN_X: process.env.NEXT_PUBLIC_CANVAS_INITIAL_PAN_X,
  CANVAS_INITIAL_PAN_X: process.env.CANVAS_INITIAL_PAN_X,
  NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y: process.env.NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y,
  CANVAS_INITIAL_PAN_Y: process.env.CANVAS_INITIAL_PAN_Y,
});

// Canonical Individual Constants (for tree-shaking and backward-compatible named imports)
export const CANVAS_WIDTH = activeConfig.width;
export const CANVAS_HEIGHT = activeConfig.height;
export const TOTAL_PIXELS = activeConfig.totalPixels;
export const EXPECTED_SNAPSHOT_BYTES = activeConfig.expectedSnapshotBytes;

export const DEFAULT_ZOOM = activeConfig.zoom.default;
export const MIN_ZOOM = activeConfig.zoom.min;
export const MAX_ZOOM = activeConfig.zoom.max;
export const ZOOM_STEP = activeConfig.zoom.step;

export const INITIAL_PAN_X = activeConfig.initialPan.x;
export const INITIAL_PAN_Y = activeConfig.initialPan.y;

// Consolidated Configuration Object
export const CANVAS_CONFIG = activeConfig;

export default CANVAS_CONFIG;
