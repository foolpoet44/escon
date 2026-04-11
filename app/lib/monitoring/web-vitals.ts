// ============================================================================
// Web Vitals 성능 모니터링
//
// Core Web Vitals(LCP, FID, CLS)과 기타 성능 지표를 수집하여
// Vercel Analytics와 Sentry로 전송합니다.
// ============================================================================

'use client';

import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { logMessageWithSentry } from '../sentry/sentry.client.config';

// ============================================================================
// 성능 지표 임계값
// ============================================================================
const THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  INP: 200, // Interaction to Next Paint (ms)
  CLS: 0.1, // Cumulative Layout Shift
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 600, // Time to First Byte (ms)
};

// ============================================================================
// 성능 지표 분류
// ============================================================================
function getMetricRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];

  if (!threshold) return 'good';

  const poor = threshold * 1.5;
  const needsImprovement = threshold;

  if (value <= needsImprovement) {
    return 'good';
  } else if (value <= poor) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

// ============================================================================
// 성능 지표 기록
// ============================================================================
function reportMetric(
  metricName: string,
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor'
) {
  // Sentry에 전송
  if (rating === 'poor' || rating === 'needs-improvement') {
    logMessageWithSentry(
      `Web Vital: ${metricName} = ${value.toFixed(2)}ms`,
      rating === 'poor' ? 'error' : 'warning',
      {
        metric: metricName,
        value,
        rating,
        threshold: THRESHOLDS[metricName as keyof typeof THRESHOLDS],
      }
    );
  }

  // 개발 환경에서 콘솔 로깅
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `📊 ${metricName}: ${value.toFixed(2)}ms [${rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'}]`
    );
  }
}

// ============================================================================
// 성능 모니터링 초기화
// ============================================================================
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  onLCP((metric) => {
    const rating = getMetricRating('LCP', metric.value);
    reportMetric('LCP', metric.value, rating);
  });

  onINP((metric) => {
    const rating = getMetricRating('INP', metric.value);
    reportMetric('INP', metric.value, rating);
  });

  onCLS((metric) => {
    const rating = getMetricRating('CLS', metric.value * 1000); 
    reportMetric('CLS', metric.value * 1000, rating);
  });

  onFCP((metric) => {
    const rating = getMetricRating('FCP', metric.value);
    reportMetric('FCP', metric.value, rating);
  });

  onTTFB((metric) => {
    const rating = getMetricRating('TTFB', metric.value);
    reportMetric('TTFB', metric.value, rating);
  });
}

// ============================================================================
// 커스텀 성능 지표
// ============================================================================
export function reportCustomMetric(metricName: string, value: number) {
  if (typeof window === 'undefined') return;

  // Performance API에 기록
  if ('measure' in window.performance) {
    try {
      window.performance.measure(metricName, { duration: value });
    } catch (e) {
      // Measure 실패 무시
    }
  }

  // Sentry에 전송
  logMessageWithSentry(
    `Custom Metric: ${metricName} = ${value.toFixed(2)}ms`,
    'info',
    {
      metric: metricName,
      value,
    }
  );
}

// ============================================================================
// 리소스 로딩 시간 추적
// ============================================================================
export function trackResourceTiming(resourceName: string) {
  if (typeof window === 'undefined') return;

  const entries = window.performance.getEntriesByName(resourceName);
  if (entries.length === 0) return;

  const entry = entries[entries.length - 1] as PerformanceResourceTiming;
  const duration = entry.responseEnd - entry.startTime;

  if (duration > 1000) {
    logMessageWithSentry(
      `Slow resource: ${resourceName}`,
      'warning',
      {
        resource: resourceName,
        duration,
      }
    );
  }
}
