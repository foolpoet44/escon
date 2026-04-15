// Phase 4: Coverage Analysis API
// GET /api/coverage

import { NextRequest, NextResponse } from 'next/server'
import { getCoverageAnalyzer } from '../../lib/validation/coverage-analyzer'
import { loadRobotSmartfactoryData } from '../../lib/validation/data-loader'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get('domainId') || undefined

    // 데이터 로드
    const domain = await loadRobotSmartfactoryData()

    if (domainId && domain.id !== domainId) {
      return NextResponse.json(
        { error: '도메인 데이터를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 커버리지 분석
    const analyzer = getCoverageAnalyzer()
    const result = analyzer.analyze(domain)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Coverage analysis error:', error)
    return NextResponse.json(
      { error: '커버리지 분석 실패' },
      { status: 500 }
    )
  }
}
