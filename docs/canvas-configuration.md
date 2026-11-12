# R/Place Canvas Environment Configuration Guide

This guide explains how to configure the R/Place collaborative pixel canvas using environment variables in the GeekPortal frontend.

---

## 1. What are Environment Variables?

Environment variables are key-value pairs configured outside your application code. They allow you to customize behavior, dimensions, and operational settings for different environments (local development, staging, or production) without modifying the source code.

In Next.js, variables prefixed with `NEXT_PUBLIC_` are embedded into client-side browser JavaScript during build time. Variables without this prefix remain available only to server-side code (such as Next.js Route Handlers).

---

## 2. Where is `.env` Located?

`.env` lives directly in the root directory of the frontend project:

```
gh-portal-frontend/
├── .env                <-- Your local configuration file (Git-ignored)
├── .env.example        <-- Reference template with all options and defaults
└── src/
    └── config/
        └── canvas.config.ts  <-- Centralized configuration loader
```

> **Note:** `.env` is ignored by Git (`.gitignore`). It will never be committed to version control, making it the safest place to customize settings on your machine.

---

## 3. Supported Canvas Environment Variables

The frontend centrally manages eight canonical canvas environment variables:

| Variable Name | Default Value | Data Type | Valid Range | Purpose |
| :--- | :---: | :---: | :---: | :--- |
| `NEXT_PUBLIC_CANVAS_WIDTH` | `1000` | Integer | `10` – `10000` | Width of the canvas in pixels. |
| `NEXT_PUBLIC_CANVAS_HEIGHT` | `600` | Integer | `10` – `10000` | Height of the canvas in pixels. |
| `NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM` | `1.0` | Float | `0.01` – `200.0` | Initial zoom level on mount and when clicking "Reset Zoom". |
| `NEXT_PUBLIC_CANVAS_MIN_ZOOM` | `1.0` | Float | `0.01` – `100.0` | Minimum zoom-out level (stops zooming out). |
| `NEXT_PUBLIC_CANVAS_MAX_ZOOM` | `40.0` | Float | `0.01` – `200.0` | Maximum zoom-in level (stops zooming in). |
| `NEXT_PUBLIC_CANVAS_ZOOM_STEP` | `0.25` | Float | `0.01` – `5.0` | Zoom increment applied per mouse wheel tick or zoom button click. |
| `NEXT_PUBLIC_CANVAS_INITIAL_PAN_X` | `0` | Float | `-100000` – `100000` | Initial horizontal viewport offset in pixels. |
| `NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y` | `0` | Float | `-100000` – `100000` | Initial vertical viewport offset in pixels. |

---

## 4. Copy-Paste Configuration Block

Add or adjust this block in `.env`:

```env
# ==========================================
# R/PLACE CANVAS CONFIGURATION
# ==========================================

# Canvas dimensions (pixels)
NEXT_PUBLIC_CANVAS_WIDTH=1000
NEXT_PUBLIC_CANVAS_HEIGHT=600

# Zoom configuration
NEXT_PUBLIC_CANVAS_DEFAULT_ZOOM=1.0
NEXT_PUBLIC_CANVAS_MIN_ZOOM=1.0
NEXT_PUBLIC_CANVAS_MAX_ZOOM=40.0
NEXT_PUBLIC_CANVAS_ZOOM_STEP=0.25

# Initial canvas position (pixels)
NEXT_PUBLIC_CANVAS_INITIAL_PAN_X=0
NEXT_PUBLIC_CANVAS_INITIAL_PAN_Y=0
```

---

## 5. How to Change Values

1. Open `.env` in your editor.
2. Edit any of the variables above to your desired values.
3. Save the file.
4. Follow the restart/rebuild instructions below to apply the changes.

### Validation & Fallback Rules
The centralized configuration module (`src/config/canvas.config.ts`) validates all values:
- **Dimensions:** Must be positive integers. Non-numeric or negative values automatically fall back to `1000` and `600`.
- **Zoom limits:** Must satisfy `MIN_ZOOM <= DEFAULT_ZOOM <= MAX_ZOOM`. If `MIN_ZOOM > MAX_ZOOM`, safe defaults (`1.0` and `40.0`) are restored automatically.
- **Zoom step:** Must be greater than `0`. Non-positive or invalid inputs fall back to `0.25`.
- **Pan offsets:** Must be valid numbers. Non-numeric inputs fall back to `0`.

---

## 6. Why Restart or Rebuild is Required

Next.js evaluates `NEXT_PUBLIC_*` environment variables during the build step and inlines their values into compiled JavaScript bundles:

- **In Development (`npm run dev`):** Next.js reads `.env` when starting. If you edit `.env`, you must **restart the dev server** (`Ctrl+C` then `npm run dev`) for Next.js to pick up the updated variables.
- **In Production (`npm run build` & `npm start`):** Client bundles are pre-compiled and statically optimized. Editing `.env` in a production environment requires running **`npm run build`** followed by restarting the application so the new variables are compiled into the production bundles.

---

## 7. Backend Compatibility for Custom Dimensions

The frontend canvas works with the separate R/Place backend microservice using a 4-bit binary protocol:
- **Binary representation:** 4 bits per pixel (16 colors), packing **2 pixels per byte**.
- **Buffer calculation:** `Math.ceil((WIDTH * HEIGHT) / 2)` bytes.
  - Default: `1000 × 600` = `600,000` pixels = **`300,000` bytes**.
  - Example custom: `1200 × 800` = `960,000` pixels = **`480,000` bytes**.

### Important Backend Requirement
Changing `NEXT_PUBLIC_CANVAS_WIDTH` or `NEXT_PUBLIC_CANVAS_HEIGHT` in the frontend **does not** change the backend canvas dimensions. 

If you use custom dimensions:
1. **The R/Place backend service** (`http://localhost:3001` or `NEXT_PUBLIC_RPLACE_API_URL`) must also be configured with matching width and height.
2. If frontend and backend dimensions differ:
   - Snapshot byte size mismatch warnings will occur.
   - The pixel grid will suffer a stride distortion (row-major alignment mismatch).
   - Pixel placement coordinates outside the backend's bounds will be rejected.
