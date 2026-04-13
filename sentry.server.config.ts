// withSentryConfig가 자동 탐지하는 표준 위치 (루트).
// 실제 설정은 app/lib/sentry/sentry.server.config.ts에 유지.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request) {
        event.request.cookies = undefined;
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
          delete event.request.headers['Cookie'];
        }
      }
      return event;
    },
  });
}
