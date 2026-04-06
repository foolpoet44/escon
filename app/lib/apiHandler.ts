/**
 * API 호출 에러 처리 및 재시도 로직을 통합한 미들웨어
 *
 * 특징:
 * - 중앙화된 에러 처리
 * - 자동 재시도 (지수 백오프)
 * - 타입 안전성 (TypeScript)
 * - 요청/응답 로깅
 */

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  retries?: number
}

interface ApiError {
  code: string
  message: string
  status?: number
  timestamp: string
}

interface RetryConfig {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
}

/**
 * 지수 백오프를 사용한 재시도 로직
 */
function calculateDelay(
  retryCount: number,
  config: Required<RetryConfig>
): number {
  const delay = config.initialDelayMs * Math.pow(config.backoffMultiplier, retryCount)
  return Math.min(delay, config.maxDelayMs)
}

/**
 * API 호출 (재시도 포함)
 *
 * @example
 * ```typescript
 * const data = await apiCall<User>(
 *   () => fetch('/api/users/1').then(r => r.json()),
 *   { maxRetries: 3 }
 * )
 * ```
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
  retryConfig?: RetryConfig
): Promise<ApiResponse<T>> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
  let lastError: Error | null = null
  let retryCount = 0

  // 요청 로깅
  console.log(`[API] Starting request (max retries: ${config.maxRetries})`)

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const data = await fn()
      console.log(`[API] ✅ Success on attempt ${attempt + 1}`)
      return {
        success: true,
        data,
        retries: attempt,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      retryCount = attempt

      // 재시도 가능 여부 판단
      if (attempt < config.maxRetries) {
        const delay = calculateDelay(attempt, config)
        console.warn(
          `[API] ⚠️ Attempt ${attempt + 1} failed: ${lastError.message}. ` +
          `Retrying in ${delay}ms...`
        )
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error(
          `[API] ❌ Failed after ${config.maxRetries} retries: ${lastError.message}`
        )
      }
    }
  }

  // 모든 재시도 실패
  const apiError: ApiError = {
    code: 'API_CALL_FAILED',
    message: lastError?.message || 'Unknown error',
    timestamp: new Date().toISOString(),
  }

  return {
    success: false,
    error: apiError,
    retries: retryCount,
  }
}

/**
 * Fetch 기반 API 호출 (JSON 응답)
 *
 * @example
 * ```typescript
 * const response = await fetchJson<User>('/api/users/1')
 * if (response.success) {
 *   console.log(response.data)
 * } else {
 *   console.error(response.error?.message)
 * }
 * ```
 */
export async function fetchJson<T>(
  url: string,
  options?: RequestInit & { retryConfig?: RetryConfig }
): Promise<ApiResponse<T>> {
  const { retryConfig, ...fetchOptions } = options || {}

  return apiCall(
    async () => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      })

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}`
        )
      }

      return response.json() as Promise<T>
    },
    retryConfig
  )
}

/**
 * 에러 바운더리 용 에러 포맷팅
 */
export function formatError(error: ApiError): string {
  return `[${error.code}] ${error.message}`
}

/**
 * 에러 핸들링 헬퍼
 */
export function handleApiError(
  response: ApiResponse<unknown>,
  onError?: (error: ApiError) => void
): boolean {
  if (!response.success && response.error) {
    onError?.(response.error)
    return false
  }
  return true
}
