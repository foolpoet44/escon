// ============================================================================
// Sentry 클라이언트 유틸리티 (클라이언트 전용)
//
// [중요] 이 파일은 클라이언트 컴포넌트(SentryInit.tsx 등)에서 import됩니다.
// @sentry/nextjs 는 서버 런타임에서 opentelemetry, require-in-the-middle 등
// 노드 전용 모듈을 함께 번들링하여 클라이언트 빌드에 Critical dependency 경고를
// 유발합니다.
//
// → Sentry 초기화는 루트 sentry.client.config.ts (withSentryConfig 자동 주입)
//   에서 전담하며, 이 파일은 초기화 이후 호출되는 유틸 함수만 export합니다.
//   initSentryClient()는 no-op으로 유지해 기존 호출부의 하위 호환성을 보장합니다.
// ============================================================================

// 클라이언트 안전 import: @sentry/core는 브라우저/서버 공용 패키지이며
// 노드 전용 모듈을 포함하지 않습니다.
import * as Sentry from '@sentry/core';

/**
 * @deprecated Sentry 초기화는 루트 sentry.client.config.ts에서
 * withSentryConfig가 자동으로 수행합니다. 이 함수는 하위 호환을 위해 유지됩니다.
 */
export function initSentryClient() {
  // no-op: 초기화는 withSentryConfig → sentry.client.config.ts 에서 처리
}

// ============================================================================
// Sentry와 함께 에러 로깅
// ============================================================================
export function logErrorWithSentry(
  error: Error,
  context?: Record<string, unknown>
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
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}
