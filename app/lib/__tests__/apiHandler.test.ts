/**
 * API 핸들러 테스트
 */

import {
  apiCall,
  fetchJson,
  formatError,
  handleApiError,
} from '../apiHandler'

describe('apiCall 함수', () => {
  it('성공한 API 호출을 처리해야 함', async () => {
    const mockFn = jest.fn().mockResolvedValue({ id: 1, name: 'Test' })

    const result = await apiCall(mockFn)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 1, name: 'Test' })
    expect(result.retries).toBe(0)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('실패한 API를 재시도해야 함', async () => {
    const mockFn = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ id: 1, name: 'Test' })

    const result = await apiCall(mockFn, { maxRetries: 2 })

    expect(result.success).toBe(true)
    expect(result.retries).toBe(1)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('최대 재시도 횟수 초과 시 실패해야 함', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('API failed'))

    const result = await apiCall(mockFn, {
      maxRetries: 2,
      initialDelayMs: 10, // 테스트 속도 향상
    })

    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('API_CALL_FAILED')
    expect(result.retries).toBe(2)
    expect(mockFn).toHaveBeenCalledTimes(3) // 1 original + 2 retries
  })
})

describe('formatError 함수', () => {
  it('에러를 올바르게 포맷팅해야 함', () => {
    const error = {
      code: 'INVALID_REQUEST',
      message: 'Missing required field',
      timestamp: '2026-04-06T00:00:00Z',
    }

    const formatted = formatError(error)

    expect(formatted).toBe('[INVALID_REQUEST] Missing required field')
  })
})

describe('handleApiError 함수', () => {
  it('성공 응답은 true를 반환해야 함', () => {
    const response = {
      success: true,
      data: { id: 1 },
    }

    const result = handleApiError(response)

    expect(result).toBe(true)
  })

  it('실패 응답은 false를 반환하고 콜백을 실행해야 함', () => {
    const onError = jest.fn()
    const error = {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      timestamp: '2026-04-06T00:00:00Z',
    }
    const response = {
      success: false,
      error,
    }

    const result = handleApiError(response, onError)

    expect(result).toBe(false)
    expect(onError).toHaveBeenCalledWith(error)
  })
})
