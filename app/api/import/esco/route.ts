// Phase 1: ESCO Skill Import API
// POST /api/import/esco

import { NextRequest, NextResponse } from 'next/server'
import { getSkillImportService } from '../../../lib/ontology/import-service'
import { ROBOTICS_KEYWORDS } from '../../../lib/ontology/esco-client'

export interface ImportRequest {
  keywords?: string[]
  domainId: string
  dryRun?: boolean
}

export interface ImportResponse {
  success: boolean
  results: {
    keyword: string
    totalFound: number
    imported: number
    skipped: number
    errors: string[]
  }[]
  totalImported: number
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ImportRequest = await request.json()
    const { keywords, domainId, dryRun = false } = body

    if (!domainId) {
      return NextResponse.json(
        { error: 'domainId 는 필수입니다' },
        { status: 400 }
      )
    }

    // 기본 키워드: 로봇공학/스마트팩토리
    const searchKeywords = keywords || ROBOTICS_KEYWORDS

    console.log(`[ESCO Import] 도메인: ${domainId}, 키워드: ${searchKeywords.length}개, dryRun: ${dryRun}`)

    const importService = getSkillImportService()
    const results = await importService.importByDomain(searchKeywords)

    // dryRun 이 아니면 저장
    if (!dryRun) {
      await importService.saveImportResults(results, domainId, 'api_user')
    }

    const totalImported = results.reduce((sum, r) => sum + r.imported, 0)

    const response: ImportResponse = {
      success: true,
      results: results.map((r) => ({
        keyword: r.keyword,
        totalFound: r.totalFound,
        imported: r.imported,
        skipped: r.skipped,
        errors: r.errors,
      })),
      totalImported,
      message: dryRun
        ? `미리보기: ${totalImported}개 스킬 발견`
        : `${totalImported}개 스킬 임포트 완료`,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[ESCO Import] 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: '임포트 실패',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
