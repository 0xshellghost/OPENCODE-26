import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join(process.cwd(), 'src/config/features.json');

const DEFAULT_CONFIG = {
  showWinners: true,
  showMilestones: true,
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

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getConfig();

    const updated = {
      showWinners: typeof body.showWinners === 'boolean' ? body.showWinners : current.showWinners,
      showMilestones: typeof body.showMilestones === 'boolean' ? body.showMilestones : current.showMilestones,
    };

    cache = updated;
    try {
      fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true });
      fs.writeFileSync(FILE_PATH, JSON.stringify(updated, null, 2));
    } catch {}

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update features' }, { status: 400 });
  }
}
