/**
 * ESCO (European Skills, Competences, Qualifications and Occupations) API 클라이언트
 * https://ec.europa.eu/esco/api
 */

import type { Skill } from '../validation/types'

/**
 * ESCO 스킬 응답 타입
 */
export interface ESCOSkill {
  uri: string
  type: 'Skill'
  preferredLabel: {
    label: string
    language: string
  }[]
  altLabel?: {
    label: string
    language: string
  }[]
  description?: {
    label: string
    language: string
  }[]
  skillType?: {
    uri: string
    label: string
  }
  broader?: {
    uri: string
    label: string
  }[]
  narrower?: {
    uri: string
    label: string
  }[]
  exactMapping?: {
    uri: string
  }[]
}

/**
 * ESCO 검색 결과
 */
export interface ESCOSearchResult {
  totalResults: number
  offset: number
  limit: number
  results: {
    uri: string
    preferredLabel: string
    altLabel?: string[]
    skillType?: string
  }[]
}

/**
 * ESCO 분류 체계
 */
export interface ESCOTaxonomy {
  uri: string
  label: string
  narrower: {
    uri: string
    label: string
  }[]
}

/**
 * ESCO 클라이언트 클래스
 */
export class ESCOClient {
  private baseUrl = 'https://ec.europa.eu/esco/api'
  private delayMs = 1000 // Rate limit 방지

  /**
   * 지연 대기
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delayMs))
  }

  /**
   * 재시도 로직
   */
  private async fetchWithRetry<T>(
    url: string,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.warn(`[ESCO] 시도 ${attempt} 실패: ${lastError.message}`)

        if (attempt < maxRetries) {
          await this.delay()
        }
      }
    }

    throw lastError || new Error('Unknown error')
  }

  /**
   * 키워드로 스킬 검색
   */
  async searchSkills(
    keyword: string,
    options?: {
      language?: string
      limit?: number
      offset?: number
    }
  ): Promise<ESCOSearchResult> {
    const language = options?.language || 'en'
    const limit = options?.limit || 20
    const offset = options?.offset || 0

    const url = `${this.baseUrl}/search?text=${encodeURIComponent(keyword)}&type=skill&language=${language}&limit=${limit}&offset=${offset}`

    await this.delay()
    return this.fetchWithRetry<ESCOSearchResult>(url)
  }

  /**
   * URI 로 개별 스킬 상세 조회
   */
  async getSkill(uri: string): Promise<ESCOSkill> {
    const url = `${this.baseUrl}/resource/skill?uri=${encodeURIComponent(uri)}`

    await this.delay()
    return this.fetchWithRetry<ESCOSkill>(url)
  }

  /**
   * 스킬 분류 체계 (taxonomy) 조회
   */
  async getTaxonomy(): Promise<ESCOTaxonomy> {
    const url = `${this.baseUrl}/resource/taxonomy?uri=http://data.europa.eu/esco/skill-type`

    await this.delay()
    return this.fetchWithRetry<ESCOTaxonomy>(url)
  }

  /**
   * ESCO 스킬을 ESCON 내부 Skill 형식으로 변환
   */
  mapToInternalSkill(escoSkill: ESCOSkill, domain?: string): Skill {
    const koreanLabel =
      escoSkill.altLabel?.find((l) => l.language === 'ko')?.label ||
      escoSkill.preferredLabel.find((l) => l.language === 'en')?.label ||
      'Unknown'

    const skillType =
      escoSkill.skillType?.uri?.includes('knowledge') === true
        ? 'knowledge'
        : 'skill/competence'

    return {
      skill_id: `ESCO_${escoSkill.uri.split('/').pop()}`,
      domain,
      domain_en: domain ? domain.replace(/-/g, ' ') : undefined,
      esco_uri: escoSkill.uri,
      preferred_label_ko: koreanLabel,
      preferred_label_en:
        escoSkill.preferredLabel.find((l) => l.language === 'en')?.label ||
        'Unknown',
      description_ko:
        escoSkill.description?.find((d) => d.language === 'ko')?.label,
      description_en:
        escoSkill.description?.find((d) => d.language === 'en')?.label,
      skill_type: skillType,
    }
  }
}

// ============================================================================
// 싱글톤 인스턴스
// ============================================================================

let _instance: ESCOClient | null = null

export function getESCOClient(): ESCOClient {
  if (!_instance) {
    _instance = new ESCOClient()
  }
  return _instance
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * 로봇공학/스마트팩토리 관련 키워드
 */
export const ROBOTICS_KEYWORDS = [
  'robotics',
  'automation',
  'machine learning',
  'computer vision',
  'sensor technology',
  'PLC programming',
  'industrial safety',
  'collaborative robot',
  'AGV',
  'AMR',
  'motion control',
  'path planning',
  'SLAM',
  'robot calibration',
  'end effector',
  'machine tending',
  'quality inspection',
  'predictive maintenance',
  'digital twin',
  'IIoT',
]
