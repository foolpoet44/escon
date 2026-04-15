// Phase 1: ESCO Skill Import API
// POST /api/import/esco

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: ESCO 스킬 임포트 로직 구현
    const result = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}
