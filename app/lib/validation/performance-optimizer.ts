/**
 * 성능 최적화 유틸리티
 * 대용량 온톨로지에서의 DRC 검증 성능 향상
 * 하네스 엔지니어링 Phase 4: Live Collaborative DRC
 */

import type { ValidationResult, ValidationContext, Enabler, EnablerSkill } from './types'

/**
 * 성능 메트릭
 */
export interface PerformanceMetrics {
  /** 마지막 실행 시간 (ms) */
  lastExecutionTime: number
  /** 평균 실행 시간 (ms) */
  avgExecutionTime: number
  /** 총 실행 횟수 */
  totalExecutions: number
  /** 캐시 히트 수 */
  cacheHits: number
  /** 캐시 미스 수 */
  cacheMisses: number
}

/**
 * 메모이제이션 캐시 엔트리
 */
interface CacheEntry<T> {
  value: T
  timestamp: number
  hash: string
}

/**
 * 성능 최적화 설정
 */
export interface PerformanceConfig {
  /** 캐시 TTL (ms) - 기본값 5000 */
  cacheTTL?: number
  /** 최대 캐시 크기 - 기본값 100 */
  maxCacheSize?: number
  /** 성능 메트릭 수집 - 기본값 true */
  enableMetrics?: boolean
  /** 청크 크기 (대용량 데이터) - 기본값 50 */
  chunkSize?: number
}

/**
 * 성능 최적화 클래스
 *
 * - 메모이제이션 캐싱
 * - 청크 기반 처리
 * - 성능 메트릭 수집
 */
export class PerformanceOptimizer {
  private config: Required<PerformanceConfig>
  private metrics: PerformanceMetrics = {
    lastExecutionTime: 0,
    avgExecutionTime: 0,
    totalExecutions: 0,
    cacheHits: 0,
    cacheMisses: 0,
  }
  private cache = new Map<string, CacheEntry<any>>()
  private executionTimes: number[] = []

  constructor(config?: PerformanceConfig) {
    this.config = {
      cacheTTL: config?.cacheTTL ?? 5000,
      maxCacheSize: config?.maxCacheSize ?? 100,
      enableMetrics: config?.enableMetrics ?? true,
      chunkSize: config?.chunkSize ?? 50,
    }
  }

  /**
   * 해시 생성 (캐시 키용)
   */
  private hash(data: any): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  /**
   * 캐시 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) {
      if (this.config.enableMetrics) {
        this.metrics.cacheMisses++
      }
      return null
    }

    // TTL 확인
    if (Date.now() - entry.timestamp > this.config.cacheTTL) {
      this.cache.delete(key)
      if (this.config.enableMetrics) {
        this.metrics.cacheMisses++
      }
      return null
    }

    if (this.config.enableMetrics) {
      this.metrics.cacheHits++
    }
    return entry.value as T
  }

  /**
   * 캐시 저장
   */
  set<T>(key: string, value: T): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.config.maxCacheSize) {
      // 가장 오래된 엔트리 제거
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hash: this.hash(key),
    })
  }

  /**
   * 함수 실행 시간 측정
   */
  async measure<T>(fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    if (this.config.enableMetrics) {
      this.metrics.lastExecutionTime = duration
      this.metrics.totalExecutions++
      this.executionTimes.push(duration)

      // 최근 100 개만 유지
      if (this.executionTimes.length > 100) {
        this.executionTimes.shift()
      }

      // 평균 계산
      this.metrics.avgExecutionTime =
        this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length
    }

    return result
  }

  /**
   * 대용량 배열 청크 처리
   */
  async processInChunks<T, R>(
    items: T[],
    processor: (chunk: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = []
    const chunks = Math.ceil(items.length / this.config.chunkSize)

    for (let i = 0; i < chunks; i++) {
      const start = i * this.config.chunkSize
      const end = Math.min(start + this.config.chunkSize, items.length)
      const chunk = items.slice(start, end)

      const chunkResults = await processor(chunk)
      results.push(...chunkResults)

      // 다음 청크 전 잠시 대기 (UI 블로킹 방지)
      if (i < chunks - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    return results
  }

  /**
   * 디바운스 유틸리티
   */
  debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        fn(...args)
        timeoutId = null
      }, delay)
    }
  }

  /**
   * 스로틀 유틸리티
   */
  throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args)
        inThrottle = true
        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  /**
   * 메모이제이션 래퍼
   */
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string
  ): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      const key = keyFn ? keyFn(...args) : this.hash(args)
      const cached = this.get<ReturnType<T>>(key)

      if (cached !== null) {
        return cached
      }

      const result = fn(...args)
      this.set(key, result)
      return result
    }
  }

  /**
   * DRC 검증 최적화
   * - 캐싱 활용
   * - 청크 처리
   */
  async optimizeDRCValidation(
    context: ValidationContext,
    validateFn: (context: ValidationContext) => Promise<ValidationResult[]>
  ): Promise<ValidationResult[]> {
    // 캐시 키 생성
    const cacheKey = this.hash({
      enablerId: context.enabler.id,
      skillCount: context.skills.length,
      enablerCount: context.allEnablers.length,
    })

    // 캐시 확인
    const cached = this.get<ValidationResult[]>(cacheKey)
    if (cached) {
      console.log('[Performance] Cache hit for DRC validation')
      return cached
    }

    // 검증 실행
    const results = await this.measure(async () => {
      // 대용량 데이터는 청크 처리
      if (context.skills.length > this.config.chunkSize) {
        return this.processInChunks(context.skills, async (chunk) => {
          const chunkContext = { ...context, skills: chunk }
          return validateFn(chunkContext)
        })
      }

      return validateFn(context)
    })

    // 캐시 저장
    this.set(cacheKey, results)

    return results
  }

  /**
   * 성능 메트릭 반환
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.cache.clear()
    console.log('[Performance] Cache cleared')
  }

  /**
   * 성능 리포트 생성
   */
  generateReport(): string {
    const hitRate =
      this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? (this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100
        : 0

    return `
=== Performance Report ===
Total Executions: ${this.metrics.totalExecutions}
Last Execution: ${this.metrics.lastExecutionTime.toFixed(2)}ms
Avg Execution: ${this.metrics.avgExecutionTime.toFixed(2)}ms
Cache Hit Rate: ${hitRate.toFixed(1)}%
Cache Size: ${this.cache.size}/${this.config.maxCacheSize}
========================
`.trim()
  }
}

/**
 * 싱글톤 인스턴스 (전역 최적화)
 */
let _globalOptimizer: PerformanceOptimizer | null = null

export function getGlobalOptimizer(): PerformanceOptimizer {
  if (!_globalOptimizer) {
    _globalOptimizer = new PerformanceOptimizer({
      cacheTTL: 5000,
      maxCacheSize: 100,
      enableMetrics: true,
      chunkSize: 50,
    })
  }
  return _globalOptimizer
}

/**
 * 최적화된 DRC 검증 래퍼
 */
export async function optimizedValidate(
  context: ValidationContext,
  validateFn: (context: ValidationContext) => Promise<ValidationResult[]>
): Promise<ValidationResult[]> {
  const optimizer = getGlobalOptimizer()
  return optimizer.optimizeDRCValidation(context, validateFn)
}
