// ============================================================================
// Sentry 서버 설정
//
// 백엔드에서 발생하는 에러, API 응답 시간, 데이터베이스 쿼리를 추적합니다.
// ============================================================================

import * as Sentry from '@sentry/nextjs';

export function initSentryServer() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️  SENTRY_DSN이 설정되지 않았습니다. 서버 에러 추적이 비활성화됩니다.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || 'development',

    // ============================================================================
    // 성능 모니터링
    // ============================================================================
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // ============================================================================
    // 통합
    // ============================================================================
    integrations: [
      // 데이터베이스 쿼리 성능 추적 (선택사항)
      new Sentry.Integrations.Postgres(),
      // HTTP 요청 추적
      new Sentry.Integrations.Http({
        tracing: true,
      }),
    ],

    // ============================================================================
    // 필터링
    // ============================================================================
    beforeSend(event, hint) {
      // 민감한 정보 제거
      if (event.request) {
        event.request.cookies = undefined;
        event.request.headers = {
          ...event.request.headers,
          Authorization: undefined,
          Cookie: undefined,
        };
      }

      // 요청 본문에서 민감한 정보 제거
      if (event.request?.data) {
        const data = event.request.data;
        if (typeof data === 'object') {
          // API 키, 토큰 제거
          Object.keys(data).forEach((key) => {
            if (
              key.toLowerCase().includes('password') ||
              key.toLowerCase().includes('token') ||
              key.toLowerCase().includes('key')
            ) {
              data[key] = '[REDACTED]';
            }
          });
        }
      }

      return event;
    },
  });
}

// ============================================================================
// 서버 에러 로깅
// ============================================================================
export function logServerError(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    contexts: {
      server: context,
    },
  });
}

// ============================================================================
// API 요청/응답 추적
// ============================================================================
export function logApiCall(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  context?: Record<string, any>
) {
  Sentry.captureMessage(`${method} ${path} - ${statusCode}`, {
    level: statusCode >= 500 ? 'error' : 'info',
    contexts: {
      api: {
        method,
        path,
        statusCode,
        durationMs,
        ...context,
      },
    },
  });
}

// ============================================================================
// 데이터베이스 성능 추적
// ============================================================================
export function logDatabaseQuery(
  query: string,
  durationMs: number,
  success: boolean
) {
  if (durationMs > 1000) {
    // 1초 이상 소요된 쿼리만 기록
    Sentry.captureMessage(`Slow database query: ${durationMs}ms`, {
      level: 'warning',
      contexts: {
        database: {
          query: query.substring(0, 200), // 첫 200자만
          durationMs,
          success,
        },
      },
    });
  }
}
