// ============================================================================
// GET /api/audit-logs
//
// 감사 로그를 조회하는 엔드포인트입니다.
// 테이블명, 레코드 ID, 액션 타입으로 필터링할 수 있습니다.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  ApiResponse,
  GetAuditLogsResponse,
  HTTP_STATUS,
  ERROR_CODES,
} from '@/app/lib/api/schemas';
import { logApiCall } from '@/app/lib/sentry/sentry.server.config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
);

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  try {
    // ============================================================================
    // 쿼리 파라미터 파싱
    // ============================================================================
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('tableName');
    const recordId = searchParams.get('recordId');
    const action = searchParams.get('action') as 'CREATE' | 'UPDATE' | 'DELETE' | null;
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // ============================================================================
    // 쿼리 빌드
    // ============================================================================
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (tableName) {
      query = query.eq('table_name', tableName);
    }
    if (recordId) {
      query = query.eq('record_id', recordId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (fromDate) {
      query = query.gte('created_at', fromDate);
    }
    if (toDate) {
      query = query.lte('created_at', toDate);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // ============================================================================
    // 데이터 조회
    // ============================================================================
    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    const durationMs = Date.now() - startTime;
    logApiCall('GET', '/api/audit-logs', HTTP_STATUS.OK, durationMs);

    // ============================================================================
    // 성공 응답
    // ============================================================================
    const response: ApiResponse<GetAuditLogsResponse> = {
      success: true,
      data: {
        logs: data?.map((log) => ({
          id: log.id,
          tableName: log.table_name,
          recordId: log.record_id,
          action: log.action,
          changes: log.changes,
          createdBy: log.created_by,
          source: log.source,
          createdAt: log.created_at,
          ipAddress: log.ip_address,
          userAgent: log.user_agent,
        })) || [],
        total: count || 0,
        limit,
        offset,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, { status: HTTP_STATUS.OK });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    logApiCall('GET', '/api/audit-logs', HTTP_STATUS.INTERNAL_SERVER_ERROR, durationMs, {
      error: errorMessage,
    });

    // ============================================================================
    // 에러 응답
    // ============================================================================
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Failed to fetch audit logs',
        details: {
          error: errorMessage,
        },
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return NextResponse.json(response, {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
