import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src/config/features.json');

const DEFAULT_CONFIG = {
  showWinners: true,
  showMilestones: true,
  showLeaderboard: true,
  showRepositories: true,
  showRPlace: true,
  flagshipEvent: 'Opencode',
};

let cache = { ...DEFAULT_CONFIG };

function getConfig() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      cache = { ...cache, ...JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')) };
    }
  } catch {}
  return cache;
}

function getBackendBase() {
  const rawBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
  return rawBase.replace(/\/+$/, '');
}

export async function GET() {
  try {
    const backendBase = getBackendBase();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${backendBase}/api/v1/features`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const data = json?.data || json;
      if (data && typeof data === 'object') {
        const merged = {
          ...getConfig(),
          showWinners: typeof data.showWinners === 'boolean' ? data.showWinners : cache.showWinners,
          showMilestones: typeof data.showMilestones === 'boolean' ? data.showMilestones : cache.showMilestones,
          showLeaderboard: typeof data.showLeaderboard === 'boolean' ? data.showLeaderboard : cache.showLeaderboard,
          showRepositories: typeof data.showRepositories === 'boolean' ? data.showRepositories : cache.showRepositories,
          showRPlace: typeof data.showRPlace === 'boolean' ? data.showRPlace : cache.showRPlace,
        };
        cache = merged;
        return NextResponse.json(merged);
      }
    }
  } catch (err) {
    console.warn('[api/features] Backend fetch failed, using local config fallback:', err);
  }

  return NextResponse.json(getConfig());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getConfig();

    const updated = {
      showWinners: typeof body.showWinners === 'boolean' ? body.showWinners : current.showWinners,
      showMilestones: typeof body.showMilestones === 'boolean' ? body.showMilestones : current.showMilestones,
      showLeaderboard: typeof body.showLeaderboard === 'boolean' ? body.showLeaderboard : current.showLeaderboard,
      showRepositories: typeof body.showRepositories === 'boolean' ? body.showRepositories : current.showRepositories,
      showRPlace: typeof body.showRPlace === 'boolean' ? body.showRPlace : current.showRPlace,
      flagshipEvent: body.flagshipEvent !== undefined ? body.flagshipEvent : (current.flagshipEvent ?? null),
    };

    cache = updated;
    try {
      fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
      fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));
    } catch {}

    // Forward to backend if authorization header is present
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      try {
        const backendBase = getBackendBase();
        await fetch(`${backendBase}/api/v1/admin/features`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify(body),
        });
      } catch (backendErr) {
        console.warn('[api/features] Forwarding update to backend failed:', backendErr);
      }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update features' }, { status: 400 });
  }
}
