'use client'

import React, { useState } from 'react'
import { useRecordHistory } from '@/lib/hooks/useAuditLogs'
import type { AuditLog } from '@/lib/hooks/useAuditLogs'
import styles from './AuditLogViewer.module.css'

interface AuditLogViewerProps {
  tableName: string
  recordId: string
  title?: string
}

/**
 * 감사 로그 뷰어 컴포넌트
 *
 * 특정 레코드의 변경 이력을 시간순으로 표시합니다.
 *
 * 사용 예:
 * ```tsx
 * <AuditLogViewer
 *   tableName="skills"
 *   recordId="uuid-1234"
 *   title="스킬 변경 이력"
 * />
 * ```
 */
export default function AuditLogViewer({
  tableName,
  recordId,
  title = '변경 이력',
}: AuditLogViewerProps) {
  const { logs, loading, error } = useRecordHistory(tableName, recordId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'CREATE':
        return '#10b981' // 초록색
      case 'UPDATE':
        return '#f59e0b' // 주황색
      case 'DELETE':
        return '#ef4444' // 빨강색
      default:
        return '#6b7280' // 회색
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const renderChanges = (changes: Record<string, any>) => {
    return Object.entries(changes).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'old' in value && 'new' in value) {
        return (
          <div key={key} className={styles.change}>
            <span className={styles.field}>{key}:</span>
            <div className={styles.comparison}>
              <span className={styles.old}>이전: {JSON.stringify(value.old)}</span>
              <span className={styles.new}>변경: {JSON.stringify(value.new)}</span>
            </div>
          </div>
        )
      }

      return (
        <div key={key} className={styles.change}>
          <span className={styles.field}>{key}:</span>
          <span>{JSON.stringify(value)}</span>
        </div>
      )
    })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h3>{title}</h3>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3>{title}</h3>
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className={styles.container}>
        <h3>{title}</h3>
        <div className={styles.empty}>
          아직 변경 이력이 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3>
        {title}
        <span className={styles.count}>({logs.length})</span>
      </h3>

      <div className={styles.timeline}>
        {logs.map((log, index) => (
          <div key={log.id} className={styles.entry}>
            {/* 타임라인 노드 */}
            <div
              className={styles.node}
              style={{ backgroundColor: getActionColor(log.action) }}
            />

            {/* 엔트리 본체 */}
            <div className={styles.body}>
              <div className={styles.header}>
                <span className={styles.action} style={{ color: getActionColor(log.action) }}>
                  {log.action}
                </span>
                <span className={styles.date}>{formatDate(log.created_at)}</span>
                {log.source !== 'api' && (
                  <span className={styles.source}>{log.source}</span>
                )}
              </div>

              {log.description && (
                <p className={styles.description}>{log.description}</p>
              )}

              {Object.keys(log.changes).length > 0 && (
                <>
                  <button
                    className={styles.toggleBtn}
                    onClick={() =>
                      setExpandedId(expandedId === log.id ? null : log.id)
                    }
                  >
                    {expandedId === log.id ? '▼' : '▶'} 변경 내용
                  </button>

                  {expandedId === log.id && (
                    <div className={styles.changes}>
                      {renderChanges(log.changes)}
                    </div>
                  )}
                </>
              )}

              {log.created_by && (
                <small className={styles.meta}>작성자: {log.created_by}</small>
              )}
            </div>

            {/* 연결선 */}
            {index < logs.length - 1 && <div className={styles.connector} />}
          </div>
        ))}
      </div>
    </div>
  )
}
