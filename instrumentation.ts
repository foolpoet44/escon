// ============================================================================
// Next.js Instrumentation
//
// @sentry/nextjs withSentryConfig가 sentry.server.config.ts를 자동으로
// 주입하므로, 여기서 수동 초기화하면 이중 init이 발생함.
// 단, SENTRY_AUTH_TOKEN 없이 withSentryConfig를 우회한 경우(next.config.js 참조)
// 에도 Sentry가 동작하도록 명시적으로 import 유지.
//
// [경로 주의] instrumentation.ts는 프로젝트 루트에 위치하므로
// './sentry.server.config' (루트 상대경로) 를 사용해야 합니다.
// '../sentry.server.config' 는 루트 밖을 가리키므로 잘못된 경로입니다.
// ============================================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
