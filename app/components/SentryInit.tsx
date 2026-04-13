// ============================================================================
// Sentry 클라이언트 초기화 컴포넌트
//
// 클라이언트 사이드에서 Sentry를 초기화하는 컴포넌트입니다.
// RootLayout에서 사용됩니다.
//
// [중요] 이 컴포넌트는 'use client' 컴포넌트이므로,
// 서버 전용 노드 모듈(opentelemetry 등)을 끌어오는
// app/lib/sentry/sentry.client.config.ts 를 직접 import하면
// 클라이언트 번들에 서버 모듈이 혼입되어 Critical dependency 경고가 발생합니다.
// → Web Vitals 초기화만 여기서 담당하고, Sentry 초기화는
//   루트 sentry.client.config.ts (withSentryConfig 자동 주입)에 위임합니다.
// ============================================================================

'use client';

import { useEffect } from 'react';
import { initWebVitals } from '../lib/monitoring/web-vitals';

export default function SentryInit() {
  useEffect(() => {
    // Web Vitals 성능 모니터링 초기화
    // Sentry 초기화는 루트 sentry.client.config.ts에서 withSentryConfig가 자동 주입
    initWebVitals();
  }, []);

  // 이 컴포넌트는 UI를 렌더링하지 않습니다
  return null;
}
