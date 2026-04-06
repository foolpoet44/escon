# API 에러 처리 가이드

## 개요

ESCON 프로젝트는 중앙화된 API 에러 처리 시스템을 제공합니다. 이를 통해 다음을 구현할 수 있습니다:

- ✅ 자동 재시도 (지수 백오프)
- ✅ 통일된 에러 응답 형식
- ✅ 타입 안전성 (TypeScript)
- ✅ 요청/응답 로깅
- ✅ 에러 바운더리 (React 컴포넌트)

---

## 기본 사용법

### 1. API 호출 (재시도 포함)

```typescript
import { apiCall, fetchJson } from '@/lib/apiHandler'

// 방법 1: 제네릭 함수로 감싸기
const result = await apiCall(
  () => fetch('/api/users/1').then(r => r.json()),
  { maxRetries: 3 }
)

if (result.success) {
  console.log('사용자 데이터:', result.data)
} else {
  console.error('에러:', result.error?.message)
}

// 방법 2: fetchJson 헬퍼 (권장)
const response = await fetchJson<User>('/api/users/1', {
  retryConfig: { maxRetries: 3 },
})

if (response.success) {
  const user = response.data // 타입: User
}
```

### 2. 에러 처리

```typescript
import { handleApiError, formatError } from '@/lib/apiHandler'

const response = await fetchJson<Data>('/api/data')

if (!handleApiError(response, (error) => {
  console.error(formatError(error))
})) {
  // 에러 처리
  return
}

// 성공 처리
const data = response.data
```

---

## 재시도 설정

### 기본값

```typescript
{
  maxRetries: 3,              // 최대 재시도 횟수
  initialDelayMs: 1000,       // 초기 대기 시간 (1초)
  maxDelayMs: 10000,          // 최대 대기 시간 (10초)
  backoffMultiplier: 2,       // 지수 배수 (delay × 2)
}
```

### 커스텀 설정

```typescript
// 빠른 재시도 (로컬 개발 환경)
await fetchJson('/api/users', {
  retryConfig: {
    maxRetries: 2,
    initialDelayMs: 100,
    maxDelayMs: 500,
  },
})

// 느린 네트워크 환경
await fetchJson('/api/users', {
  retryConfig: {
    maxRetries: 5,
    initialDelayMs: 2000,
    maxDelayMs: 30000,
  },
})
```

---

## React 컴포넌트에서 사용

### ErrorBoundary 컴포넌트

```tsx
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // 에러 로깅 서비스에 전송
        console.error('App Error:', error)
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  )
}
```

### 커스텀 폴백

```tsx
<ErrorBoundary
  fallback={
    <div>
      <h1>문제가 발생했습니다</h1>
      <p>나중에 다시 시도해주세요</p>
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>
```

---

## 실제 예제

### 사용자 데이터 조회 (Hook)

```typescript
// hooks/useUsers.ts
import { useState, useEffect } from 'react'
import { fetchJson } from '@/lib/apiHandler'

interface User {
  id: number
  name: string
  email: string
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetchJson<User[]>('/api/users', {
        retryConfig: { maxRetries: 3 },
      })

      setLoading(false)

      if (response.success) {
        setUsers(response.data || [])
        setError(null)
      } else {
        setError(response.error?.message || 'Unknown error')
      }
    }

    fetchUsers()
  }, [])

  return { users, error, loading }
}
```

### 컴포넌트에서 사용

```tsx
import { useUsers } from '@/hooks/useUsers'

export default function UserList() {
  const { users, error, loading } = useUsers()

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error}</div>

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

---

## 로그 분석

### 성공 로그

```
[API] Starting request (max retries: 3)
[API] ✅ Success on attempt 1
```

### 재시도 로그

```
[API] Starting request (max retries: 3)
[API] ⚠️ Attempt 1 failed: Network error. Retrying in 1000ms...
[API] ⚠️ Attempt 2 failed: Network error. Retrying in 2000ms...
[API] ✅ Success on attempt 3
```

### 실패 로그

```
[API] Starting request (max retries: 3)
[API] ⚠️ Attempt 1 failed: Network error. Retrying in 1000ms...
[API] ⚠️ Attempt 2 failed: Network error. Retrying in 2000ms...
[API] ⚠️ Attempt 3 failed: Network error. Retrying in 4000ms...
[API] ❌ Failed after 3 retries: Network error
```

---

## 테스트

### Jest 테스트 예제

```typescript
import { apiCall } from '@/lib/apiHandler'

describe('apiCall', () => {
  it('성공적으로 데이터를 반환해야 함', async () => {
    const mockFn = jest.fn().mockResolvedValue({ id: 1 })

    const result = await apiCall(mockFn)

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ id: 1 })
  })

  it('실패 후 재시도해야 함', async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce({ id: 1 })

    const result = await apiCall(mockFn, { maxRetries: 2 })

    expect(result.success).toBe(true)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
})
```

---

## 모범 사례

✅ **DO**

- 모든 API 호출에 `fetchJson` 또는 `apiCall` 사용
- 중요한 요청에는 `maxRetries` 설정
- ErrorBoundary로 컴포넌트 감싸기
- 에러를 사용자에게 명확하게 표시

❌ **DON'T**

- 직접 `fetch` 호출 (에러 처리 없음)
- 무한 재시도 (리소스 낭비)
- 에러를 조용히 무시하기
- 모든 요청에 동일한 재시도 설정 사용

---

## 마이그레이션 체크리스트

프로젝트의 기존 API 호출을 마이그레이션할 때:

- [ ] 모든 `fetch` 호출을 `fetchJson`으로 변경
- [ ] 에러 응답 처리 추가
- [ ] 타입 제네릭 추가 (`fetchJson<T>`)
- [ ] 테스트 작성
- [ ] ErrorBoundary로 최상위 컴포넌트 감싸기
