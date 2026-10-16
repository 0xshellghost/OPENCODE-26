import { NextRequest, NextResponse } from 'next/server';

const RPLACE_INTERNAL_API_URL =
  process.env.RPLACE_INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_RPLACE_API_URL ||
  'http://localhost:3001';

interface CachedSnapshot {
  buffer: ArrayBuffer;
  sequence: string;
  cachedAt: number;
}

// In-memory server-side cache for high-concurrency throttling (5s TTL)
let memoryCache: CachedSnapshot | null = null;
const CACHE_TTL_MS = 5000;

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    let buffer: ArrayBuffer;
    let sequence: string;

    // Use in-memory cached snapshot if still fresh
    if (memoryCache && now - memoryCache.cachedAt < CACHE_TTL_MS) {
      buffer = memoryCache.buffer;
      sequence = memoryCache.sequence;
    } else {
      const res = await fetch(`${RPLACE_INTERNAL_API_URL}/api/board`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        // If backend fails but we have stale cache, serve stale cache gracefully
        if (memoryCache) {
          buffer = memoryCache.buffer;
          sequence = memoryCache.sequence;
        } else {
          return new NextResponse(`Failed to fetch board snapshot: ${res.statusText}`, {
            status: res.status,
          });
        }
      } else {
        buffer = await res.arrayBuffer();
        sequence = res.headers.get('X-Canvas-Sequence') || '0';
        memoryCache = {
          buffer,
          sequence,
          cachedAt: now,
        };
      }
    }

    const etag = `W/"seq-${sequence}"`;
    const clientIfNoneMatch = req.headers.get('if-none-match');

    // Return 304 Not Modified if client already has this canvas sequence
    if (clientIfNoneMatch && clientIfNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'X-Canvas-Sequence': sequence,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=240',
        },
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Canvas-Sequence': sequence,
        ETag: etag,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=240',
      },
    });
  } catch (error) {
    // If backend is unreachable but memory cache is available, serve it
    if (memoryCache) {
      return new NextResponse(memoryCache.buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Canvas-Sequence': memoryCache.sequence,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    console.error('[API /api/rplace/board] Failed to proxy snapshot:', message);
    return new NextResponse(`Internal Server Error: ${message}`, { status: 500 });
  }
}
