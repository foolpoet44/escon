'use client'

import React, { useState, useCallback } from 'react'
import styles from './TemporalRangeFilter.module.css'

interface TemporalRangeFilterProps {
  onRangeChange?: (range: TemporalRange) => void
  onApply?: (range: TemporalRange) => void
  defaultRange?: TemporalRange
}

export interface TemporalRange {
  from: Date
  to: Date | null
}

/**
 * 시간 범위 필터 컴포넌트
 *
 * 사용 예:
 * ```tsx
 * <TemporalRangeFilter
 *   onApply={(range) => fetchSkillsInRange(range)}
 *   defaultRange={{ from: new Date('2026-01-01'), to: null }}
 * />
 * ```
 */
export default function TemporalRangeFilter({
  onRangeChange,
  onApply,
  defaultRange,
}: TemporalRangeFilterProps) {
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

  const [range, setRange] = useState<TemporalRange>(
    defaultRange || {
      from: oneYearAgo,
      to: null,
    }
  )

  const [preset, setPreset] = useState<'all' | 'year' | 'quarter' | 'month' | 'custom'>('all')

  // 날짜를 HTML input format (YYYY-MM-DD)으로 변환
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 입력값을 Date 객체로 변환
  const parseInputDate = (input: string): Date => {
    return new Date(input + 'T00:00:00Z')
  }

  // 프리셋 적용
  const applyPreset = useCallback((preset: string) => {
    const today = new Date()
    let newRange: TemporalRange

    switch (preset) {
      case 'all':
        newRange = {
          from: new Date('2020-01-01'),
          to: null,
        }
        break

      case 'year':
        newRange = {
          from: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          to: null,
        }
        break

      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
        quarterStart.setMonth(quarterStart.getMonth() - 1)
        newRange = {
          from: quarterStart,
          to: null,
        }
        break

      case 'month':
        newRange = {
          from: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
          to: null,
        }
        break

      default:
        return
    }

    setPreset(preset as any)
    setRange(newRange)
    onRangeChange?.(newRange)
  }, [onRangeChange])

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = parseInputDate(e.target.value)
    const newRange = { ...range, from: newFrom }
    setRange(newRange)
    setPreset('custom')
    onRangeChange?.(newRange)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = e.target.value ? parseInputDate(e.target.value) : null
    const newRange = { ...range, to: newTo }
    setRange(newRange)
    setPreset('custom')
    onRangeChange?.(newRange)
  }

  const handleApply = () => {
    onApply?.(range)
  }

  const handleReset = () => {
    const resetRange: TemporalRange = {
      from: oneYearAgo,
      to: null,
    }
    setRange(resetRange)
    setPreset('year')
    onRangeChange?.(resetRange)
    onApply?.(resetRange)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>📅 시간 범위 필터</h3>
        <p className={styles.subtitle}>스킬의 유효 기간을 선택하세요</p>
      </div>

      {/* 프리셋 버튼 */}
      <div className={styles.presets}>
        <button
          className={`${styles.presetBtn} ${preset === 'all' ? styles.active : ''}`}
          onClick={() => applyPreset('all')}
        >
          전체 기간
        </button>
        <button
          className={`${styles.presetBtn} ${preset === 'year' ? styles.active : ''}`}
          onClick={() => applyPreset('year')}
        >
          1년
        </button>
        <button
          className={`${styles.presetBtn} ${preset === 'quarter' ? styles.active : ''}`}
          onClick={() => applyPreset('quarter')}
        >
          분기
        </button>
        <button
          className={`${styles.presetBtn} ${preset === 'month' ? styles.active : ''}`}
          onClick={() => applyPreset('month')}
        >
          1개월
        </button>
      </div>

      {/* 커스텀 범위 선택 */}
      <div className={styles.rangeInputs}>
        <div className={styles.inputGroup}>
          <label htmlFor="from-date">시작일</label>
          <input
            id="from-date"
            type="date"
            value={formatDateForInput(range.from)}
            onChange={handleFromChange}
          />
        </div>

        <div className={styles.divider}>~</div>

        <div className={styles.inputGroup}>
          <label htmlFor="to-date">종료일</label>
          <input
            id="to-date"
            type="date"
            value={range.to ? formatDateForInput(range.to) : ''}
            onChange={handleToChange}
            placeholder="없음 (진행 중)"
          />
          {!range.to && (
            <small className={styles.helper}>진행 중인 스킬입니다</small>
          )}
        </div>
      </div>

      {/* 선택 요약 */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>시작:</span>
          <span className={styles.value}>{range.from.toLocaleDateString('ko-KR')}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>종료:</span>
          <span className={styles.value}>
            {range.to ? range.to.toLocaleDateString('ko-KR') : '진행 중'}
          </span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className={styles.actions}>
        <button className={styles.applyBtn} onClick={handleApply}>
          적용
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          초기화
        </button>
      </div>
    </div>
  )
}
