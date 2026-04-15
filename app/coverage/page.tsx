'use client'

/**
 * Phase 4: 커버리지 대시보드
 * 하네스 엔지니어링 Phase 4: Validation
 *
 * 기능:
 * - 도메인 선택기
 * - 전체 커버리지 게이지 (도넛 차트)
 * - 카테고리별 분포 (막대 그래프)
 * - 숙련도 레벨별 히트맵
 * - 스킬 갭 테이블
 * - BOM 섹션
 * - 도메인 비교 모드
 */

import { useState, useEffect } from 'react'
import type { CoverageAnalysisResult, DomainComparisonResult } from '../../lib/validation/coverage-analyzer'
import LoadingSpinner from '../components/LoadingSpinner'
import ExportButton from '../components/ExportButton'

// ============================================================================
// 타입 정의
// ============================================================================

interface DashboardState {
  loading: boolean
  coverageData: CoverageAnalysisResult | null
  comparisonData: DomainComparisonResult | null
  compareMode: boolean
  error: string | null
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export default function CoverageDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    coverageData: null,
    comparisonData: null,
    compareMode: false,
    error: null,
  })

  const [domainBId, setDomainBId] = useState<string>('')

  // 데이터 로드
  const loadData = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const url = state.compareMode && domainBId
        ? `/api/coverage/compare?domainA=robot_solution&domainB=${domainBId}`
        : '/api/coverage'

      const response = await fetch(url)
      if (!response.ok) throw new Error('데이터를 불러올 수 없습니다')
      const data = await response.json()

      if (state.compareMode) {
        setState((prev) => ({
          ...prev,
          comparisonData: data as DomainComparisonResult,
          loading: false,
        }))
      } else {
        setState((prev) => ({
          ...prev,
          coverageData: data as CoverageAnalysisResult,
          loading: false,
        }))
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      }))
    }
  }

  useEffect(() => {
    loadData()
  }, [state.compareMode, domainBId])

  // 토글 핸들러
  const toggleCompareMode = () => {
    setState((prev) => ({
      ...prev,
      compareMode: !prev.compareMode,
      comparisonData: null,
    }))
  }

  const data = state.coverageData || state.comparisonData?.domainA

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                커버리지 대시보드
              </h1>
              <p className="text-gray-600 mt-2">
                하네스 엔지니어링 Phase 4: Validation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleCompareMode}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  state.compareMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {state.compareMode ? '비교 모드 ON' : '비교 모드 OFF'}
              </button>
              <button
                onClick={loadData}
                disabled={state.loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {state.loading ? '새로고침 중...' : '새로고침'}
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{state.error}</p>
          </div>
        )}

        {/* Loading State */}
        {state.loading && !data && (
          <LoadingSpinner text="커버리지 데이터를 불러오는 중..." />
        )}

        {/* Main Content */}
        {data && (
          <>
            {/* Overall Coverage Gauge */}
            <OverallCoverageGauge data={data} />

            {/* Comparison Mode */}
            {state.compareMode && state.comparisonData && (
              <DomainComparison comparison={state.comparisonData} />
            )}

            {/* Category Breakdown */}
            <CategoryBreakdown data={data} />

            {/* Proficiency Heatmap */}
            <ProficiencyHeatmap data={data} />

            {/* Skill Gap Table */}
            <SkillGapTable gaps={data.gaps} />

            {/* BOM Section */}
            <BOMSection bom={data.bom} />
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: 전체 커버리지 게이지
// ============================================================================

function OverallCoverageGauge({ data }: { data: CoverageAnalysisResult }) {
  const { overall } = data
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const progress = (overall.percentage / 100) * circumference

  const gradeColors: Record<string, string> = {
    A: 'text-green-600',
    B: 'text-emerald-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-600',
  }

  const barColors: Record<string, string> = {
    A: 'stroke-green-600',
    B: 'stroke-emerald-600',
    C: 'stroke-yellow-600',
    D: 'stroke-orange-600',
    F: 'stroke-red-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">전체 커버리지</h2>
      <div className="flex items-center justify-center">
        <div className="relative w-64 h-64">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              className="stroke-gray-200"
              strokeWidth="16"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="128"
              cy="128"
              r={radius}
              className={`${barColors[overall.grade]} transition-all duration-1000 ease-out`}
              strokeWidth="16"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gray-900">
              {overall.percentage.toFixed(1)}%
            </span>
            <span className={`text-2xl font-bold mt-2 ${gradeColors[overall.grade]}`}>
              Grade {overall.grade}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">필요 스킬</p>
          <p className="text-2xl font-bold text-gray-900">{overall.totalRequired}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">커버된 스킬</p>
          <p className="text-2xl font-bold text-green-600">{overall.covered}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">갭 스킬</p>
          <p className="text-2xl font-bold text-red-600">{overall.totalRequired - overall.covered}</p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: 카테고리별 분포
// ============================================================================

function CategoryBreakdown({ data }: { data: CoverageAnalysisResult }) {
  const { byCategory } = data
  const categories = [
    { name: 'Knowledge', data: byCategory.knowledge },
    { name: 'Competence', data: byCategory.competence },
  ]

  const maxRequired = Math.max(
    byCategory.knowledge.required,
    byCategory.competence.required
  )

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">카테고리별 분포</h2>
      <div className="space-y-6">
        {categories.map((cat) => (
          <div key={cat.name}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              <span className="text-sm text-gray-500">
                {cat.data.covered} / {cat.data.required} ({cat.data.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${cat.data.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: 숙련도 레벨별 히트맵
// ============================================================================

function ProficiencyHeatmap({ data }: { data: CoverageAnalysisResult }) {
  const { byProficiency } = data
  const levels = [
    { key: 'level5', label: 'Level 5 (Expert)', ...byProficiency.level5 },
    { key: 'level4', label: 'Level 4 (Advanced)', ...byProficiency.level4 },
    { key: 'level3', label: 'Level 3 (Intermediate)', ...byProficiency.level3 },
    { key: 'level2', label: 'Level 2 (Beginner)', ...byProficiency.level2 },
    { key: 'level1', label: 'Level 1 (Basic)', ...byProficiency.level1 },
  ]

  const getHeatColor = (count: number, covered: number) => {
    if (count === 0) return 'bg-gray-100'
    const ratio = covered / count
    if (ratio >= 0.9) return 'bg-green-500'
    if (ratio >= 0.7) return 'bg-green-300'
    if (ratio >= 0.5) return 'bg-yellow-400'
    if (ratio >= 0.3) return 'bg-orange-400'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">숙련도 레벨별 현황</h2>
      <div className="space-y-3">
        {levels.map((level) => {
          const percentage = level.count > 0 ? (level.covered / level.count) * 100 : 0
          return (
            <div key={level.key} className="flex items-center gap-4">
              <span className="w-40 text-sm text-gray-700">{level.label}</span>
              <div
                className={`flex-1 h-10 rounded-md ${getHeatColor(level.count, level.covered)} flex items-center justify-center text-white font-medium transition-all`}
              >
                {level.covered} / {level.count} ({percentage.toFixed(0)}%)
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: 스킬 갭 테이블
// ============================================================================

interface SkillGapTableProps {
  gaps: {
    skillId: string
    skillName: string
    skillType: 'knowledge' | 'competence'
    requiredProficiency: number
    importance: number
    gapSize: number
    suggestion?: string
  }[]
}

function SkillGapTable({ gaps }: SkillGapTableProps) {
  const [sortBy, setSortBy] = useState<'importance' | 'gapSize' | 'trainingHours'>('importance')
  const [filterType, setFilterType] = useState<'all' | 'knowledge' | 'competence'>('all')

  const getTrainingHours = (gapSize: number) => {
    if (gapSize <= 0) return 0
    if (gapSize === 1) return 8
    if (gapSize === 2) return 20
    return 40
  }

  const filteredAndSortedGaps = [...gaps]
    .filter((gap) => filterType === 'all' || gap.skillType === filterType)
    .sort((a, b) => {
      if (sortBy === 'importance') return b.importance - a.importance
      if (sortBy === 'gapSize') return b.gapSize - a.gapSize
      if (sortBy === 'trainingHours') {
        return getTrainingHours(b.gapSize) - getTrainingHours(a.gapSize)
      }
      return 0
    })

  const getPriorityColor = (importance: number) => {
    if (importance >= 5) return 'text-red-600 font-bold'
    if (importance >= 4) return 'text-orange-600 font-semibold'
    return 'text-gray-600'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">스킬 갭 목록 ({gaps.length}개)</h2>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">전체</option>
            <option value="knowledge">Knowledge</option>
            <option value="competence">Competence</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="importance">중요도순</option>
            <option value="gapSize">갭 크기순</option>
            <option value="trainingHours">훈련시간순</option>
          </select>
        </div>
      </div>

      {filteredAndSortedGaps.length === 0 ? (
        <p className="text-gray-500 text-center py-8">표시할 스킬 갭이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">스킬 ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">스킬명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">중요도</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">갭</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">훈련시간</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제안</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedGaps.map((gap) => (
                <tr key={gap.skillId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{gap.skillId}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{gap.skillName}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {gap.skillType}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${getPriorityColor(gap.importance)}`}>
                    {gap.importance}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 font-medium">-{gap.gapSize}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getTrainingHours(gap.gapSize)}h
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{gap.suggestion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: BOM 섹션
// ============================================================================

interface BOMSectionProps {
  bom: {
    skillId: string
    skillName: string
    skillType: 'knowledge' | 'competence'
    gapSize: number
    estimatedTrainingHours: number
    priority: 'critical' | 'high' | 'medium' | 'low'
    importance: number
  }[]
}

function BOMSection({ bom }: BOMSectionProps) {
  const totalHours = bom.reduce((sum, item) => sum + item.estimatedTrainingHours, 0)
  const byPriority = {
    critical: bom.filter((b) => b.priority === 'critical').length,
    high: bom.filter((b) => b.priority === 'high').length,
    medium: bom.filter((b) => b.priority === 'medium').length,
    low: bom.filter((b) => b.priority === 'low').length,
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          BOM (Bill of Materials) - 교육 커리큘럼
        </h2>
        <div className="text-sm text-gray-600">
          총 예상 훈련 시간: <span className="font-bold text-blue-600">{totalHours}시간</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-red-50 rounded-lg text-center">
          <p className="text-sm text-red-600">Critical</p>
          <p className="text-2xl font-bold text-red-800">{byPriority.critical}</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg text-center">
          <p className="text-sm text-orange-600">High</p>
          <p className="text-2xl font-bold text-orange-800">{byPriority.high}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg text-center">
          <p className="text-sm text-yellow-600">Medium</p>
          <p className="text-2xl font-bold text-yellow-800">{byPriority.medium}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-green-600">Low</p>
          <p className="text-2xl font-bold text-green-800">{byPriority.low}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">우선순위</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">스킬 ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">스킬명</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">갭</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">훈련시간</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bom.map((item) => (
              <tr key={item.skillId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.skillId}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.skillName}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {item.skillType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-red-600 font-medium">-{item.gapSize}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                  {item.estimatedTrainingHours}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// 서브 컴포넌트: 도메인 비교 (Compare Mode)
// ============================================================================

interface DomainComparisonProps {
  comparison: DomainComparisonResult
}

function DomainComparison({ comparison }: DomainComparisonProps) {
  const { domainA, domainB, sharedGaps, synergies, crossTrainingPotential } = comparison

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">도메인 비교 분석</h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Domain A */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">{domainA.domain.name}</h3>
          <p className="text-3xl font-bold text-blue-600">{domainA.overall.percentage.toFixed(1)}%</p>
          <p className="text-sm text-blue-700">Grade {domainA.overall.grade}</p>
        </div>

        {/* Domain B */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">{domainB.domain.name}</h3>
          <p className="text-3xl font-bold text-purple-600">{domainB.overall.percentage.toFixed(1)}%</p>
          <p className="text-sm text-purple-700">Grade {domainB.overall.grade}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">공유 갭</p>
          <p className="text-2xl font-bold text-gray-800">{sharedGaps.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">시너지 스킬</p>
          <p className="text-2xl font-bold text-green-800">{synergies.length}</p>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-indigo-600">교차 훈련 잠재력</p>
          <p className="text-2xl font-bold text-indigo-800">{crossTrainingPotential}</p>
        </div>
      </div>
    </div>
  )
}
