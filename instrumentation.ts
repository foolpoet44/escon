// ============================================================================
// Next.js Instrumentation
//
// @sentry/nextjs withSentryConfig가 sentry.server.config.ts를 자동으로
// 주입하므로, 여기서 수동 초기화하면 이중 init이 발생함. 위임.
// ============================================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}
