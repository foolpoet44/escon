// ============================================================================
// GET /api/docs
//
// OpenAPI 3.0 스키마를 반환합니다.
// Swagger UI 또는 다른 API 문서 도구에서 사용할 수 있습니다.
// ============================================================================

import { NextResponse } from 'next/server';
import { OPENAPI_SPEC } from '@/app/lib/api/openapi';

export async function GET() {
  return NextResponse.json(OPENAPI_SPEC, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
