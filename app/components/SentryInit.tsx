// ============================================================================
// Sentry 클라이언트 초기화 컴포넌트
//
// 클라이언트 사이드에서 Sentry를 초기화하는 컴포넌트입니다.
// RootLayout에서 사용됩니다.
// ============================================================================

'use client';

import { useEffect } from 'react';
import { initSentryClient } from '../lib/sentry/sentry.client.config';
import { initWebVitals } from '../lib/monitoring/web-vitals';

export default function SentryInit() {
  useEffect(() => {
    // 클라이언트 사이드에서 Sentry 초기화
    initSentryClient();

    // Web Vitals 성능 모니터링 초기화
    initWebVitals();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null;
}
