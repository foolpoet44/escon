// ============================================================================
// Sentry 클라이언트 설정
//
// 프론트엔드에서 발생하는 JavaScript 에러, 성능 이슈를 추적합니다.
// 사용자의 세션, 네비게이션, 상호작용 정보를 포함합니다.
// ============================================================================

import * as Sentry from '@sentry/nextjs';

export function initSentryClient() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn('⚠️  SENTRY_DSN이 설정되지 않았습니다. 에러 추적이 비활성화됩니다.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',

    // ============================================================================
    // 성능 모니터링
    // ============================================================================
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // ============================================================================
    // 리플레이 캡처 (사용자 문제 재현)
    // ============================================================================
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0, // 에러 발생 시 항상 캡처

    // ============================================================================
    // 필터링 및 제외
    // ============================================================================
    denyUrls: [
      // 브라우저 확장 프로그램 에러 무시
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
    ignoreErrors: [
      // 일반적인 에러 무시
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // 외부 스크립트 에러
      /^Non-Error promise rejection captured/,
    ],

    // ============================================================================
    // 보안
    // ============================================================================
    beforeSend(event, hint) {
      // 민감한 정보 제거
      if (event.request) {
        event.request.cookies = undefined;
        event.request.headers = {
          ...event.request.headers,
          Authorization: undefined,
        };
      }

      return event;
    },
  });

  // ============================================================================
  // 사용자 정보 설정 (선택사항)
  // ============================================================================
  if (typeof window !== 'undefined') {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      Sentry.setUser({ id: userId });
    }
  }
}

// ============================================================================
// Sentry와 함께 에러 로깅
// ============================================================================
export function logErrorWithSentry(
  error: Error,
  context?: Record<string, any>
) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

// ============================================================================
// 커스텀 메시지 로깅
// ============================================================================
export function logMessageWithSentry(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}
