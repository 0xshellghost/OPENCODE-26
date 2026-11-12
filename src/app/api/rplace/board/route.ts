import { NextRequest, NextResponse } from 'next/server';
import { EXPECTED_SNAPSHOT_BYTES } from 'config/canvas.config';

function getRPlaceBaseUrl(): string {
  const raw =
    process.env.RPLACE_INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_RPLACE_API_URL ||
    'http://localhost:3001';
  return raw.replace(/\/api\/?$/, '').replace(/\/+$/, '');
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Canvas-Sequence, If-None-Match',
  'Access-Control-Expose-Headers': 'X-Canvas-Sequence, ETag',
};


interface CachedSnapshot {
  buffer: ArrayBuffer;
  sequence: string;
  cachedAt: number;
}

// In-memory server-side cache for high-concurrency throttling (1s TTL)
let memoryCache: CachedSnapshot | null = null;
const CACHE_TTL_MS = 1000;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

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
      const baseUrl = getRPlaceBaseUrl();
      const res = await fetch(`${baseUrl}/api/board`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        // If backend fails but we have stale cache, serve stale cache gracefully
        if (memoryCache) {
          buffer = memoryCache.buffer;
          sequence = memoryCache.sequence;
        } else {
          // If backend is completely down (e.g. 502 Bad Gateway), return a clean fallback buffer
          // so the frontend canvas does not crash or trigger direct CORS failures
          console.warn(`[API /api/rplace/board] Backend returned status ${res.status}. Serving blank fallback board.`);
          const fallbackBuffer = new ArrayBuffer(EXPECTED_SNAPSHOT_BYTES);
          return new NextResponse(fallbackBuffer, {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/octet-stream',
              'X-Canvas-Sequence': '0',
              'X-Canvas-Fallback': 'true',
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
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
          ...CORS_HEADERS,
          ETag: etag,
          'X-Canvas-Sequence': sequence,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/octet-stream',
        'X-Canvas-Sequence': sequence,
        ETag: etag,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    // If backend is unreachable but memory cache is available, serve it
    if (memoryCache) {
      return new NextResponse(memoryCache.buffer, {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/octet-stream',
          'X-Canvas-Sequence': memoryCache.sequence,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    console.warn(`[API /api/rplace/board] Backend unreachable (${message}). Serving fallback blank canvas.`);
    
    // Serve clean fallback buffer to keep client canvas working smoothly
    const fallbackBuffer = new ArrayBuffer(EXPECTED_SNAPSHOT_BYTES);
    return new NextResponse(fallbackBuffer, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/octet-stream',
        'X-Canvas-Sequence': '0',
        'X-Canvas-Fallback': 'true',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cookieHeader = req.headers.get('cookie');

    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
    };
    if (authHeader) headers['Authorization'] = authHeader;
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const bodyBuffer = await req.arrayBuffer();
    const baseUrl = getRPlaceBaseUrl();

    const res = await fetch(`${baseUrl}/api/board`, {
      method: 'PUT',
      headers,
      body: bodyBuffer,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { error: `Backend upload failed with status ${res.status}` },
        { status: res.status, headers: CORS_HEADERS }
      );
    }

    // Invalidate cached snapshot so subsequent GET requests fetch the updated board
    memoryCache = null;

    return NextResponse.json(data, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}

