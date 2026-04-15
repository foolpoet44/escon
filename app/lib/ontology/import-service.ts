/**
 * 스킬 임포트 서비스
 * ESCO API 를 통한 벌크 임포트 및 매칭
 */

import { getESCOClient, type ESCOSkill, ROBOTICS_KEYWORDS } from './esco-client'
import type { Skill } from '../validation/types'

/**
 * 임포트 결과
 */
export interface ImportResult {
  keyword: string
  totalFound: number
  imported: number
  skipped: number
  errors: string[]
  skills: Skill[]
}

/**
 * 매칭 결과
 */
export interface MatchResult {
  internalSkill: Skill
  escoUri?: string
  escoLabel?: string
  confidence: number
  matchType: 'exact' | 'approximate' | 'none'
}

/**
 * 스킬 임포트 서비스 클래스
 */
export class SkillImportService {
  private escoClient = getESCOClient()

  /**
   * 도메인 키워드 기반 벌크 임포트
   */
  async importByDomain(keywords: string[]): Promise<ImportResult[]> {
    const results: ImportResult[] = []

    for (const keyword of keywords) {
      console.log(`[Import] 검색: ${keyword}`)

      try {
        const searchResult = await this.escoClient.searchSkills(keyword, {
          limit: 50,
        })

        const importedSkills: Skill[] = []
        const errors: string[] = []

        for (const item of searchResult.results) {
          try {
            const escoSkill = await this.escoClient.getSkill(item.uri)
            const internalSkill = this.escoClient.mapToInternalSkill(
              escoSkill,
              this.normalizeKeyword(keyword)
            )
            importedSkills.push(internalSkill)
          } catch (error) {
            errors.push(
              `${item.uri}: ${error instanceof Error ? error.message : String(error)}`
            )
          }
        }

        results.push({
          keyword,
          totalFound: searchResult.totalResults,
          imported: importedSkills.length,
          skipped: searchResult.totalResults - importedSkills.length,
          errors,
          skills: importedSkills,
        })
      } catch (error) {
        results.push({
          keyword,
          totalFound: 0,
          imported: 0,
          skipped: 0,
          errors: [error instanceof Error ? error.message : String(error)],
          skills: [],
        })
      }
    }

    return results
  }

  /**
   * 기존 스킬과 ESCO 스킬 간 매칭
   */
  async matchExistingSkills(internalSkills: Skill[]): Promise<MatchResult[]> {
    const results: MatchResult[] = []

    for (const skill of internalSkills) {
      // ESCO URI 가 이미 있으면 exact match
      if (skill.esco_uri) {
        results.push({
          internalSkill: skill,
          escoUri: skill.esco_uri,
          escoLabel: skill.preferred_label_en,
          confidence: 1.0,
          matchType: 'exact',
        })
        continue
      }

      // 키워드로 검색하여 매칭 시도
      try {
        const searchResult = await this.escoClient.searchSkills(
          skill.preferred_label_en,
          { limit: 5 }
        )

        if (searchResult.results.length > 0) {
          const topMatch = searchResult.results[0]
          // 레이블 유사도로 신뢰도 계산
          const confidence = this.calculateSimilarity(
            skill.preferred_label_en.toLowerCase(),
            topMatch.preferredLabel.toLowerCase()
          )

          results.push({
            internalSkill: skill,
            escoUri: topMatch.uri,
            escoLabel: topMatch.preferredLabel,
            confidence,
            matchType: confidence > 0.8 ? 'exact' : 'approximate',
          })
        } else {
          results.push({
            internalSkill: skill,
            confidence: 0,
            matchType: 'none',
          })
        }
      } catch (error) {
        results.push({
          internalSkill: skill,
          confidence: 0,
          matchType: 'none',
        })
      }
    }

    return results
  }

  /**
   * 임포트 결과를 Supabase 에 저장
   */
  async saveImportResults(
    results: ImportResult[],
    domainId: string,
    importedBy?: string
  ): Promise<void> {
    // TODO: Supabase client 구현 후 실제 저장
    console.log('[Save] Results would be saved to Supabase:')
    console.log(`  Domain: ${domainId}`)
    console.log(`  Total skills: ${results.reduce((sum, r) => sum + r.imported, 0)}`)
  }

  /**
   * 키워드 정규화
   */
  private normalizeKeyword(keyword: string): string {
    return keyword.toLowerCase().replace(/\s+/g, '-')
  }

  /**
   * 문자열 유사도 계산 (Levenshtein distance 기반)
   */
  private calculateSimilarity(a: string, b: string): number {
    const longer = a.length > b.length ? a : b
    const shorter = a.length > b.length ? b : a

    if (longer.length === 0) return 1.0

    const costs = new Array(shorter.length + 1)
    for (let i = 0; i <= shorter.length; i++) {
      costs[i] = i
    }

    for (let i = 1; i <= longer.length; i++) {
      let prev = costs[0]
      costs[0] = i

      for (let j = 1; j <= shorter.length; j++) {
        let curr = costs[j]

        if (longer[i - 1].toLowerCase() !== shorter[j - 1].toLowerCase()) {
          curr = Math.min(curr, prev, costs[j - 1]) + 1
        }

        costs[j - 1] = prev
        prev = curr
      }

      costs[shorter.length] = prev
    }

    const distance = costs[shorter.length]
    return 1 - distance / longer.length
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let _instance: SkillImportService | null = null

export function getSkillImportService(): SkillImportService {
  if (!_instance) {
    _instance = new SkillImportService()
  }
  return _instance
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 로봇공학 도메인 임포트
 */
export async function importRoboticsSkills(): Promise<ImportResult[]> {
  const service = getSkillImportService()
  return service.importByDomain(ROBOTICS_KEYWORDS)
}
