/**
 * useAuditLogs Hook
 *
 * 감사 로그를 조회하고 관리하는 Hook
 *
 * 사용 예:
 * ```typescript
 * const { logs, loading, error } = useAuditLogs({
 *   tableName: 'skills',
 *   recordId: 'uuid',
 *   limit: 20,
 * })
 * ```
 */

import { useState, useEffect } from 'react'
import { fetchJson } from '../apiHandler'

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  organization_id?: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  changes: Record<string, any>
  created_by?: string
  created_at: string
  description?: string
  session_id?: string
  source: 'api' | 'ui' | 'migration' | 'system'
}

export interface AuditLogsFilter {
  tableName?: string
  recordId?: string
  organizationId?: string
  action?: 'CREATE' | 'UPDATE' | 'DELETE'
  fromDate?: Date
  toDate?: Date
  source?: string
  limit?: number
  offset?: number
}

export interface UseAuditLogsResult {
  logs: AuditLog[]
  loading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
}

/**
 * 감사 로그 조회 Hook
 */
export function useAuditLogs(filter?: AuditLogsFilter): UseAuditLogsResult {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)

    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams()
      if (filter?.tableName) params.append('tableName', filter.tableName)
      if (filter?.recordId) params.append('recordId', filter.recordId)
      if (filter?.organizationId) params.append('organizationId', filter.organizationId)
      if (filter?.action) params.append('action', filter.action)
      if (filter?.fromDate) params.append('fromDate', filter.fromDate.toISOString())
      if (filter?.toDate) params.append('toDate', filter.toDate.toISOString())
      if (filter?.source) params.append('source', filter.source)
      if (filter?.limit) params.append('limit', String(filter.limit))
      if (filter?.offset) params.append('offset', String(filter.offset))

      const queryString = params.toString()
      const url = `/api/audit-logs${queryString ? `?${queryString}` : ''}`

      const response = await fetchJson<{
        logs: AuditLog[]
        total: number
      }>(url)

      if (response.success && response.data) {
        setLogs(response.data.logs)
        setTotal(response.data.total)
      } else {
        setError(response.error?.message || 'Failed to fetch audit logs')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [filter])

  return {
    logs,
    loading,
    error,
    total,
    refetch: fetchLogs,
  }
}

/**
 * 단일 레코드의 변경 이력 조회
 */
export function useRecordHistory(tableName: string, recordId: string) {
  return useAuditLogs({
    tableName,
    recordId,
    limit: 50,
  })
}

/**
 * 조직별 활동 로그 조회
 */
export function useOrganizationAuditLogs(organizationId: string) {
  return useAuditLogs({
    organizationId,
    limit: 100,
  })
}
