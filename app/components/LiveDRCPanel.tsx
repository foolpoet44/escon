'use client'

/**
 * Live DRC 패널 컴포넌트
 * 실시간 검증 결과를 사이드 패널에 표시
 * 하네스 엔지니어링 Phase 4: Live Collaborative DRC
 */

import { useState, useEffect, useRef } from 'react'
import {
  LiveDRCService,
  createLiveDRCService,
  type LiveDRCState,
} from '../lib/validation/live-drc'
import { getSharedOntologyDoc, type SharedOntologyDoc } from '../lib/ontology/shared-doc'
import type { ValidationResult } from '../lib/validation/types'

interface LiveDRCPanelProps {
  /** 패널 초기 열림 상태 - 기본값 true */
  initiallyOpen?: boolean
  /** 대시보드 모드 - 기본값 false */
  dashboardMode?: boolean
}

export default function LiveDRCPanel({
  initiallyOpen = true,
  dashboardMode = false,
}: LiveDRCPanelProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [liveDRC, setLiveDRC] = useState<LiveDRCService | null>(null)
  const [state, setState] = useState<LiveDRCState>({
    running: false,
    lastValidationAt: null,
    currentResults: [],
    changeHistory: [],
    validating: false,
  })
  const [expandedRule, setExpandedRule] = useState<string | null>(null)

  const serviceRef = useRef<LiveDRCService | null>(null)

  // LiveDRC 서비스 초기화
  useEffect(() => {
    const doc = getSharedOntologyDoc()
    const service = createLiveDRCService(doc, {
      debounceMs: 500,
      autoStart: true,
      enableAI: false,
    })

    serviceRef.current = service
    setLiveDRC(service)

    // 상태 구독
    const unsubscribeState = service.onStateUpdate((newState) => {
      setState({ ...newState })
    })

    return () => {
      unsubscribeState()
      service.dispose()
    }
  }, [])

  // 검증 결과 요약
  const summary = {
    errors: state.currentResults.filter((r) => r.severity === 'error' && !r.passed).length,
    warnings: state.currentResults.filter((r) => r.severity === 'warning' && !r.passed).length,
    info: state.currentResults.filter((r) => r.severity === 'info').length,
    passed: state.currentResults.filter((r) => r.passed).length,
  }

  // 마지막 검증 시간 포맷팅
  const formatLastValidation = (date: Date | null) => {
    if (!date) return '검증 없음'
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return '방금 전'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`
    return date.toLocaleTimeString('ko-KR')
  }

  // 심각도별 아이콘
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return '🔴'
      case 'warning':
        return '🟡'
      case 'info':
        return '🔵'
      default:
        return '⚪'
    }
  }

  // 규칙 토글
  const toggleRule = (ruleId: string) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId)
  }

  return (
    <div className="live-drc-panel">
      {/* 헤더 */}
      <div className="live-drc-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="live-drc-title">
          <span className="live-drc-icon">{state.validating ? '⏳' : '✅'}</span>
          <span>Live DRC</span>
          {state.running && (
            <span className="live-drc-badge">실시간</span>
          )}
        </div>
        <div className="live-drc-summary">
          {summary.errors > 0 && (
            <span className="live-drc-count error">{summary.errors}</span>
          )}
          {summary.warnings > 0 && (
            <span className="live-drc-count warning">{summary.warnings}</span>
          )}
        </div>
        <span className={`live-drc-toggle ${isOpen ? 'open' : ''}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* 콘텐츠 */}
      {isOpen && (
        <div className="live-drc-content">
          {/* 상태 바 */}
          <div className="live-drc-status-bar">
            <div className="live-drc-status-item">
              <span className="status-label">상태:</span>
              <span className={`status-value ${state.running ? 'running' : 'stopped'}`}>
                {state.running ? '실시간 검증 중' : '정지됨'}
              </span>
            </div>
            <div className="live-drc-status-item">
              <span className="status-label">마지막 검증:</span>
              <span className="status-time">{formatLastValidation(state.lastValidationAt)}</span>
            </div>
            {state.validating && (
              <div className="live-drc-validating">
                <span className="spinner"></span>
                <span>검증 중...</span>
              </div>
            )}
          </div>

          {/* 요약 카드 */}
          <div className="live-drc-summary-cards">
            <div className="summary-card error">
              <span className="summary-value">{summary.errors}</span>
              <span className="summary-label">에러</span>
            </div>
            <div className="summary-card warning">
              <span className="summary-value">{summary.warnings}</span>
              <span className="summary-label">경고</span>
            </div>
            <div className="summary-card info">
              <span className="summary-value">{summary.info}</span>
              <span className="summary-label">정보</span>
            </div>
            <div className="summary-card passed">
              <span className="summary-value">{summary.passed}</span>
              <span className="summary-label">통과</span>
            </div>
          </div>

          {/* 변경 이력 */}
          {state.changeHistory.length > 0 && (
            <div className="live-drc-changes">
              <h4 className="live-drc-subtitle">
                최근 변경 ({state.changeHistory.length}건)
              </h4>
              <div className="live-drc-change-list">
                {state.changeHistory.slice(-5).reverse().map((change, index) => (
                  <div key={index} className="live-drc-change-item">
                    <span className={`change-icon ${change.type}`}>
                      {change.type === 'add' ? '+' : change.type === 'remove' ? '-' : '●'}
                    </span>
                    <span className="change-info">
                      {change.type === 'add' ? '추가' : change.type === 'remove' ? '삭제' : '수정'}
                      {' - '}
                      {change.enablerId} / {change.skillId || 'N/A'}
                    </span>
                    <span className="change-time">
                      {new Date(change.timestamp).toLocaleTimeString('ko-KR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 검증 결과 목록 */}
          {state.currentResults.length > 0 && (
            <div className="live-drc-results">
              <h4 className="live-drc-subtitle">검증 결과</h4>
              <div className="live-drc-result-list">
                {state.currentResults.map((result, index) => (
                  <div
                    key={index}
                    className={`live-drc-result-item ${result.passed ? 'passed' : result.severity}`}
                  >
                    <div
                      className="live-drc-result-header"
                      onClick={() => toggleRule(result.ruleId)}
                    >
                      <span className="result-severity">{getSeverityIcon(result.severity)}</span>
                      <span className="result-rule">{result.ruleId}</span>
                      <span className={`result-status ${result.passed ? 'pass' : 'fail'}`}>
                        {result.passed ? 'PASS' : result.severity.toUpperCase()}
                      </span>
                      <span className="result-toggle">
                        {expandedRule === result.ruleId ? '▲' : '▼'}
                      </span>
                    </div>

                    {expandedRule === result.ruleId && (
                      <div className="live-drc-result-details">
                        <p className="result-message">{result.message}</p>
                        {result.details?.suggestion && (
                          <p className="result-suggestion">
                            💡 {result.details.suggestion}
                          </p>
                        )}
                        {result.details?.affectedSkills && result.details.affectedSkills.length > 0 && (
                          <p className="result-affected">
                            영향받는 스킬: {result.details.affectedSkills.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {state.currentResults.length === 0 && !state.validating && (
            <div className="live-drc-empty">
              <p>검증 결과가 없습니다.</p>
              <p className="live-drc-empty-hint">
                온톨로지를 편집하면 실시간으로 검증됩니다.
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .live-drc-panel {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-md, 8px);
          box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.1));
          overflow: hidden;
        }

        .live-drc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md, 12px) var(--spacing-lg, 16px);
          background: var(--bg-primary, #f8fafc);
          cursor: pointer;
          transition: background var(--transition-fast, 0.2s);
        }

        .live-drc-header:hover {
          background: var(--bg-secondary, #f1f5f9);
        }

        .live-drc-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          font-weight: 600;
          color: var(--text-primary, #1e293b);
        }

        .live-drc-icon {
          font-size: 1.2rem;
        }

        .live-drc-badge {
          padding: 2px 8px;
          background: #10b981;
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .live-drc-summary {
          display: flex;
          gap: var(--spacing-xs, 4px);
        }

        .live-drc-count {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .live-drc-count.error {
          background: #fee2e2;
          color: #dc2626;
        }

        .live-drc-count.warning {
          background: #fef3c7;
          color: #d97706;
        }

        .live-drc-toggle {
          font-size: 0.75rem;
          color: var(--text-muted, #94a3b8);
          transition: transform var(--transition-fast, 0.2s);
        }

        .live-drc-toggle.open {
          transform: rotate(180deg);
        }

        .live-drc-content {
          padding: var(--spacing-md, 12px);
        }

        .live-drc-status-bar {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 8px);
          padding: var(--spacing-sm, 8px);
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: var(--radius-sm, 6px);
          margin-bottom: var(--spacing-md, 12px);
        }

        .live-drc-status-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }

        .status-label {
          color: var(--text-muted, #64748b);
        }

        .status-value {
          font-weight: 600;
        }

        .status-value.running {
          color: #10b981;
        }

        .status-value.stopped {
          color: #64748b;
        }

        .status-time {
          color: var(--text-secondary, #475569);
        }

        .live-drc-validating {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 4px);
          font-size: 0.85rem;
          color: var(--text-primary, #1e293b);
        }

        .spinner {
          width: 12px;
          height: 12px;
          border: 2px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .live-drc-summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-sm, 8px);
          margin-bottom: var(--spacing-md, 12px);
        }

        .summary-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-sm, 8px);
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: var(--radius-sm, 6px);
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .summary-label {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .summary-card.error .summary-value { color: #dc2626; }
        .summary-card.warning .summary-value { color: #d97706; }
        .summary-card.info .summary-value { color: #3b82f6; }
        .summary-card.passed .summary-value { color: #10b981; }

        .live-drc-subtitle {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary, #1e293b);
          margin-bottom: var(--spacing-sm, 8px);
        }

        .live-drc-change-list,
        .live-drc-result-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs, 4px);
          margin-bottom: var(--spacing-md, 12px);
        }

        .live-drc-change-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
          background: var(--bg-tertiary, #f1f5f9);
          border-radius: var(--radius-sm, 6px);
          font-size: 0.85rem;
        }

        .change-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .change-icon.add {
          background: #dcfce7;
          color: #16a34a;
        }

        .change-icon.remove {
          background: #fee2e2;
          color: #dc2626;
        }

        .change-icon.update {
          background: #dbeafe;
          color: #2563eb;
        }

        .change-info {
          flex-grow: 1;
          color: var(--text-secondary, #475569);
        }

        .change-time {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
        }

        .live-drc-result-item {
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: var(--radius-sm, 6px);
          overflow: hidden;
          transition: all var(--transition-fast, 0.2s);
        }

        .live-drc-result-item.passed {
          border-color: #86efac;
        }

        .live-drc-result-item.error {
          border-color: #fca5a5;
        }

        .live-drc-result-item.warning {
          border-color: #fcd34d;
        }

        .live-drc-result-item.info {
          border-color: #93c5fd;
        }

        .live-drc-result-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 8px);
          padding: var(--spacing-sm, 8px) var(--spacing-md, 12px);
          cursor: pointer;
          background: var(--bg-primary, #ffffff);
        }

        .live-drc-result-header:hover {
          background: var(--bg-secondary, #f8fafc);
        }

        .result-severity {
          font-size: 1rem;
        }

        .result-rule {
          flex-grow: 1;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .result-status {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .result-status.pass {
          background: #dcfce7;
          color: #16a34a;
        }

        .result-status.fail {
          background: #fee2e2;
          color: #dc2626;
        }

        .result-toggle {
          font-size: 0.75rem;
          color: var(--text-muted, #94a3b8);
        }

        .live-drc-result-details {
          padding: var(--spacing-md, 12px);
          background: var(--bg-tertiary, #f1f5f9);
          border-top: 1px solid var(--border-color, #e2e8f0);
        }

        .result-message {
          margin-bottom: var(--spacing-sm, 8px);
          font-size: 0.9rem;
          color: var(--text-primary, #1e293b);
        }

        .result-suggestion {
          font-size: 0.85rem;
          color: var(--text-secondary, #475569);
          padding: var(--spacing-sm, 8px);
          background: var(--bg-primary, #ffffff);
          border-radius: var(--radius-sm, 6px);
        }

        .result-affected {
          font-size: 0.85rem;
          color: var(--text-muted, #64748b);
          margin-top: var(--spacing-sm, 8px);
        }

        .live-drc-empty {
          text-align: center;
          padding: var(--spacing-xl, 32px) var(--spacing-md, 12px);
          color: var(--text-muted, #64748b);
        }

        .live-drc-empty-hint {
          font-size: 0.85rem;
          margin-top: var(--spacing-xs, 4px);
        }
      `}</style>
    </div>
  )
}
