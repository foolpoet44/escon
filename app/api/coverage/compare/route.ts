// Phase 4: Domain Comparison API
// GET /api/coverage/compare?domainA={id}&domainB={id}

import { NextRequest, NextResponse } from 'next/server'
import { getCoverageAnalyzer } from '../../../lib/validation/coverage-analyzer'
import { loadRobotSmartfactoryData } from '../../../lib/validation/data-loader'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainAId = searchParams.get('domainA')
    const domainBId = searchParams.get('domainB')

    if (!domainAId || !domainBId) {
      return NextResponse.json(
        { error: 'domainA 와 domainB 파라미터가 필요합니다' },
        { status: 400 }
      )
    }

    // 데이터 로드 (현재는 단일 도메인만 지원)
    const domain = await loadRobotSmartfactoryData()

    // 도메인 비교 (현재는 동일 도메인 비교 - 추후 다중 도메인 지원 예정)
    const analyzer = getCoverageAnalyzer()

    // TODO: 다중 도메인 지원 시 실제 다른 도메인 로드
    // 현재는 데모를 위해 동일 도메인으로 비교
    const result = analyzer.compare(domain, domain)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Domain comparison error:', error)
    return NextResponse.json(
      { error: '도메인 비교 실패' },
      { status: 500 }
    )
  }
}
