// withSentryConfig가 자동 탐지하는 표준 위치 (루트).
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    denyUrls: [/^chrome:\/\//i, /^moz-extension:\/\//i],
    ignoreErrors: [
      'top.GLOBALS',
      'chrome-extension://',
      /^Non-Error promise rejection captured/,
    ],
    beforeSend(event) {
      if (event.request) {
        event.request.cookies = undefined;
        if (event.request.headers) {
          delete event.request.headers['Authorization'];
        }
      }
      return event;
    },
  });
}
