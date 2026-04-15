// Phase 4: DRC Validation API
// POST /api/validate

import { NextRequest, NextResponse } from 'next/server'
import { createDRCEngine } from '../../lib/validation/drc-engine'
import { createLLMClient, validateMappingWithAI } from '../../lib/llm/client'
import {
  loadRobotSmartfactoryData,
  loadAllSkills,
} from '../../lib/validation/data-loader'
import type { DRCRequest, DRCResponse, Domain, Enabler, Skill } from '../../lib/validation/types'

/**
 * 데이터 로딩 함수 (public/data/ 에서 JSON 로드)
 */
async function loadDomainData(domainId?: string): Promise<{
  domain: Domain | null
  allEnablers: Enabler[]
  allSkills: Skill[]
}> {
  try {
    // 실제 데이터 로드
    const domain = await loadRobotSmartfactoryData()

    // 도메인 필터링
    if (domainId && domain.id !== domainId) {
      return { domain: null, allEnablers: [], allSkills: [] }
    }

    const allSkills = await loadAllSkills(domain.id)

    return {
      domain,
      allEnablers: domain.enablers,
      allSkills,
    }
  } catch (error) {
    console.error('Failed to load domain data:', error)
    return {
      domain: null,
      allEnablers: [],
      allSkills: [],
    }
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now()

  try {
    const body = await request.json()
    const { domainId, enablerId, mode = 'full' }: DRCRequest = body

    // 데이터 로딩
    const { domain, allEnablers, allSkills } = await loadDomainData(domainId)

    if (!domain) {
      return NextResponse.json(
        { error: '도메인 데이터를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const drcEngine = createDRCEngine()
    const llmClient = createLLMClient()

    let results = []

    if (mode === 'rules') {
      // 규칙 기반 DRC 만 실행
      if (enablerId) {
        const enabler = allEnablers.find((e) => e.id === enablerId)
        if (enabler) {
          results = drcEngine.validateEnabler(enabler, allEnablers, allSkills, domain)
        } else {
          return NextResponse.json(
            { error: `Enabler '${enablerId}' 를 찾을 수 없습니다` },
            { status: 404 }
          )
        }
      } else {
        results = drcEngine.validateDomain(domain)
      }
    } else if (mode === 'ai') {
      // AI 기반 검증만 실행
      if (enablerId) {
        const enabler = allEnablers.find((e) => e.id === enablerId)
        if (enabler) {
          const result = await validateMappingWithAI(enabler, enabler.skills, domain, llmClient)
          results = [result]
        }
      } else {
        // 전체 도메인 AI 검증
        for (const enabler of domain.enablers) {
          const result = await validateMappingWithAI(enabler, enabler.skills, domain, llmClient)
          results.push(result)
        }
      }
    } else if (mode === 'full') {
      // 규칙 기반 + AI 모두 실행
      if (enablerId) {
        const enabler = allEnablers.find((e) => e.id === enablerId)
        if (enabler) {
          // 규칙 기반
          const ruleResults = drcEngine.validateEnabler(enabler, allEnablers, allSkills, domain)
          results.push(...ruleResults)

          // AI 기반
          const aiResult = await validateMappingWithAI(enabler, enabler.skills, domain, llmClient)
          results.push(aiResult)
        }
      } else {
        // 전체 도메인
        const ruleResults = drcEngine.validateDomain(domain)
        results.push(...ruleResults)

        // AI 검증 (각 Enabler 별)
        for (const enabler of domain.enablers) {
          const aiResult = await validateMappingWithAI(enabler, enabler.skills, domain, llmClient)
          results.push(aiResult)
        }
      }
    }

    // 요약
    const summary = {
      errors: results.filter((r) => r.severity === 'error' && !r.passed).length,
      warnings: results.filter((r) => r.severity === 'warning' && !r.passed).length,
      info: results.filter((r) => r.severity === 'info').length,
    }

    const response: DRCResponse = {
      results,
      summary,
      executionTimeMs: performance.now() - startTime,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('DRC validation error:', error)
    return NextResponse.json(
      {
        error: '검증 실패',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
