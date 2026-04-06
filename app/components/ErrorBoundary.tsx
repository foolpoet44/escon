'use client'

import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * React 에러 바운더리 컴포넌트
 * 자식 컴포넌트의 에러를 캐치하고 우아하게 처리
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Error info:', errorInfo)

    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: '20px',
              margin: '20px',
              border: '1px solid #f5222d',
              borderRadius: '4px',
              backgroundColor: '#fff2f0',
            }}
          >
            <h2 style={{ color: '#f5222d', marginTop: 0 }}>
              오류가 발생했습니다
            </h2>
            <p style={{ color: '#666' }}>
              {this.state.error?.message || '알 수 없는 에러'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f5222d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              다시 시도
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
