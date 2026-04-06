// ============================================================================
// Next.js Instrumentation
//
// 서버 시작 시 자동으로 실행되는 초기화 파일입니다.
// Sentry 서버 설정을 여기서 초기화합니다.
// ============================================================================

import { initSentryServer } from './app/lib/sentry/sentry.server.config';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 서버 시작 시 Sentry 초기화
    initSentryServer();
    console.log('✅ Sentry server initialized');
  }
}
