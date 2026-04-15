/**
 * 커버리지 분석기 (Coverage Analyzer)
 * 설계 (온톨로지) 와 현실 (요구사항) 간의 스킬 커버리지 분석
 * 하네스 엔지니어링 Phase 4: Validation
 */

import type {
  CoverageReport,
  BOMEntry,
  Domain,
  Enabler,
  EnablerSkill,
  Skill,
} from './types'

/**
 * 커버리지 분석 결과 (API 응답 형식)
 */
export interface CoverageAnalysisResult {
  domain: {
    id: string
    name: string
    name_en: string
  }
  overall: {
    totalRequired: number
    covered: number
    percentage: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
  }
  byCategory: {
    knowledge: { required: number; covered: number; percentage: number }
    competence: { required: number; covered: number; percentage: number }
  }
  byProficiency: {
    level1: { count: number; covered: number }
    level2: { count: number; covered: number }
    level3: { count: number; covered: number }
    level4: { count: number; covered: number }
    level5: { count: number; covered: number }
  }
  gaps: SkillGap[]
  bom: BOMItem[]
  generatedAt: string
}

/**
 * 스킬 갭 정보
 */
export interface SkillGap {
  skillId: string
  skillName: string
  skillType: 'knowledge' | 'competence'
  requiredProficiency: number
  importance: number
  gapSize: number
  suggestion?: string
}

/**
 * BOM 항목 (훈련 계획)
 */
export interface BOMItem {
  skillId: string
  skillName: string
  skillType: 'knowledge' | 'competence'
  gapSize: number
  estimatedTrainingHours: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  importance: number
}

/**
 * 도메인 비교 결과
 */
export interface DomainComparisonResult {
  domainA: CoverageAnalysisResult
  domainB: CoverageAnalysisResult
  sharedGaps: SkillGap[]
  synergies: SynergyItem[]
  crossTrainingPotential: number
}

/**
 * 시너지 항목
 */
export interface SynergyItem {
  skillId: string
  skillName: string
  providedBy: 'A' | 'B'
  neededBy: 'A' | 'B'
  potentialImpact: number
}

/**
 * 숙련도 레벨 매핑
 */
const PROFICIENCY_MAP: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

/**
 * 훈련 시간 추정 로직
 * - proficiency gap 1 = 8 시간 (기초 학습)
 * - proficiency gap 2 = 20 시간 (심화 학습)
 * - proficiency gap 3+ = 40 시간 (전문가 과정)
 */
export function estimateTrainingHours(gap: number): number {
  if (gap <= 0) return 0
  if (gap === 1) return 8
  if (gap === 2) return 20
  return 40
}

/**
 * 우선순위 결정 로직
 * - importance 5 = critical
 * - importance 4 = high
 * - importance 3 = medium
 * - importance 1-2 = low
 */
export function determinePriority(importance: number): 'critical' | 'high' | 'medium' | 'low' {
  if (importance >= 5) return 'critical'
  if (importance >= 4) return 'high'
  if (importance >= 3) return 'medium'
  return 'low'
}

/**
 * 등급 계산 (90%+=A, 80%+=B, 70%+=C, 60%+=D, 60%-=F)
 */
export function calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 90) return 'A'
  if (percentage >= 80) return 'B'
  if (percentage >= 70) return 'C'
  if (percentage >= 60) return 'D'
  return 'F'
}

/**
 * 커버리지 분석기 클래스
 */
export class CoverageAnalyzer {
  /**
   * 단일 도메인 커버리지 분석
   */
  analyze(domain: Domain): CoverageAnalysisResult {
    // 전체 스킬 수집
    const allSkills = this.collectAllSkills(domain)
    const requiredSkills = this.collectRequiredSkills(domain)

    // 카테고리별 분석
    const byCategory = this.analyzeByCategory(requiredSkills, allSkills)

    // 숙련도별 분석
    const byProficiency = this.analyzeByProficiency(requiredSkills, allSkills)

    // 갭 분석
    const gaps = this.analyzeGaps(requiredSkills, allSkills)

    // BOM 생성
    const bom = this.generateBOM(gaps)

    const totalRequired = requiredSkills.length
    const covered = totalRequired - gaps.length
    const percentage = totalRequired > 0 ? (covered / totalRequired) * 100 : 0

    return {
      domain: {
        id: domain.id,
        name: domain.name,
        name_en: domain.name_en,
      },
      overall: {
        totalRequired,
        covered,
        percentage,
        grade: calculateGrade(percentage),
      },
      byCategory,
      byProficiency,
      gaps,
      bom,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * 도메인 간 비교 분석
   */
  compare(domainA: Domain, domainB: Domain): DomainComparisonResult {
    const resultA = this.analyze(domainA)
    const resultB = this.analyze(domainB)

    // 공유 갭 분석 (두 도메인 모두에서 부족한 스킬)
    const gapsA = new Set(resultA.gaps.map((g) => g.skillId))
    const gapsB = new Set(resultB.gaps.map((g) => g.skillId))

    const sharedGaps: SkillGap[] = []
    for (const gap of resultA.gaps) {
      if (gapsB.has(gap.skillId)) {
        sharedGaps.push(gap)
      }
    }

    // 시너지 분석
    const synergies = this.analyzeSynergies(resultA, resultB)

    // 교차 훈련 잠재력 점수 (0-100)
    const crossTrainingPotential = this.calculateCrossTrainingPotential(
      resultA,
      resultB,
      synergies
    )

    return {
      domainA: resultA,
      domainB: resultB,
      sharedGaps,
      synergies,
      crossTrainingPotential,
    }
  }

  /**
   * 전체 스킬 수집
   */
  private collectAllSkills(domain: Domain): Map<string, EnablerSkill> {
    const skills = new Map<string, EnablerSkill>()
    for (const enabler of domain.enablers) {
      for (const skill of enabler.skills) {
        skills.set(skill.skill_id, skill)
      }
    }
    return skills
  }

  /**
   * 필수 스킬 수집 (importance >= 3)
   */
  private collectRequiredSkills(domain: Domain): EnablerSkill[] {
    const required: EnablerSkill[] = []
    for (const enabler of domain.enablers) {
      for (const skill of enabler.skills) {
        if (skill.importance >= 3) {
          required.push(skill)
        }
      }
    }
    return required
  }

  /**
   * 카테고리별 분석
   */
  private analyzeByCategory(
    requiredSkills: EnablerSkill[],
    allSkills: Map<string, EnablerSkill>
  ): CoverageAnalysisResult['byCategory'] {
    const knowledge = requiredSkills.filter((s) => s.type === 'knowledge')
    const competence = requiredSkills.filter((s) => s.type === 'skill/competence')

    const knowledgeCovered = knowledge.filter((s) => allSkills.has(s.skill_id)).length
    const competenceCovered = competence.filter((s) => allSkills.has(s.skill_id)).length

    return {
      knowledge: {
        required: knowledge.length,
        covered: knowledgeCovered,
        percentage: knowledge.length > 0 ? (knowledgeCovered / knowledge.length) * 100 : 0,
      },
      competence: {
        required: competence.length,
        covered: competenceCovered,
        percentage: competence.length > 0 ? (competenceCovered / competence.length) * 100 : 0,
      },
    }
  }

  /**
   * 숙련도별 분석
   */
  private analyzeByProficiency(
    requiredSkills: EnablerSkill[],
    allSkills: Map<string, EnablerSkill>
  ): CoverageAnalysisResult['byProficiency'] {
    const levels: Record<number, { count: number; covered: number }> = {
      1: { count: 0, covered: 0 },
      2: { count: 0, covered: 0 },
      3: { count: 0, covered: 0 },
      4: { count: 0, covered: 0 },
      5: { count: 0, covered: 0 },
    }

    for (const skill of requiredSkills) {
      // importance 를 숙련도 레벨로 간주 (1-5)
      const level = Math.min(5, Math.max(1, skill.importance))
      levels[level].count++
      if (allSkills.has(skill.skill_id)) {
        levels[level].covered++
      }
    }

    return {
      level1: levels[1],
      level2: levels[2],
      level3: levels[3],
      level4: levels[4],
      level5: levels[5],
    }
  }

  /**
   * 갭 분석
   */
  private analyzeGaps(
    requiredSkills: EnablerSkill[],
    allSkills: Map<string, EnablerSkill>
  ): SkillGap[] {
    const gaps: SkillGap[] = []

    for (const skill of requiredSkills) {
      if (!allSkills.has(skill.skill_id)) {
        const requiredProficiency = PROFICIENCY_MAP[skill.target_proficiency] || skill.importance
        const gapSize = requiredProficiency

        gaps.push({
          skillId: skill.skill_id,
          skillName: skill.label_ko,
          skillType: skill.type === 'knowledge' ? 'knowledge' : 'competence',
          requiredProficiency,
          importance: skill.importance,
          gapSize,
          suggestion: this.generateSuggestion(skill),
        })
      }
    }

    // 중요도 순으로 정렬
    return gaps.sort((a, b) => b.importance - a.importance)
  }

  /**
   * 갭 스킬에 대한 제안 생성
   */
  private generateSuggestion(skill: EnablerSkill): string {
    const importanceText = skill.importance >= 5 ? '필수' : skill.importance >= 4 ? '중요' : '권장'
    return `${importanceText} 스킬 - ${skill.type === 'knowledge' ? '이론 학습' : '실습 훈련'} 권장`
  }

  /**
   * BOM 생성
   */
  private generateBOM(gaps: SkillGap[]): BOMItem[] {
    return gaps.map((gap) => ({
      skillId: gap.skillId,
      skillName: gap.skillName,
      skillType: gap.skillType,
      gapSize: gap.gapSize,
      estimatedTrainingHours: estimateTrainingHours(gap.gapSize),
      priority: determinePriority(gap.importance),
      importance: gap.importance,
    }))
  }

  /**
   * 시너지 분석
   */
  private analyzeSynergies(
    resultA: CoverageAnalysisResult,
    resultB: CoverageAnalysisResult
  ): SynergyItem[] {
    const synergies: SynergyItem[] = []

    const gapsA = new Map(resultA.gaps.map((g) => [g.skillId, g]))
    const gapsB = new Map(resultB.gaps.map((g) => [g.skillId, g]))

    // A 의 갭을 B 가 메울 수 있는 경우
    for (const [skillId, gapA] of gapsA.entries()) {
      // B 에 해당 스킬이 있으면 시너지
      const bomB = resultB.bom.find((b) => b.skillId === skillId)
      if (bomB && bomB.gapSize === 0) {
        synergies.push({
          skillId,
          skillName: gapA.skillName,
          providedBy: 'B',
          neededBy: 'A',
          potentialImpact: gapA.importance * 10,
        })
      }
    }

    // B 의 갭을 A 가 메울 수 있는 경우
    for (const [skillId, gapB] of gapsB.entries()) {
      const bomA = resultA.bom.find((b) => b.skillId === skillId)
      if (bomA && bomA.gapSize === 0) {
        synergies.push({
          skillId,
          skillName: gapB.skillName,
          providedBy: 'A',
          neededBy: 'B',
          potentialImpact: gapB.importance * 10,
        })
      }
    }

    return synergies
  }

  /**
   * 교차 훈련 잠재력 점수 계산
   */
  private calculateCrossTrainingPotential(
    resultA: CoverageAnalysisResult,
    resultB: CoverageAnalysisResult,
    synergies: SynergyItem[]
  ): number {
    const totalGaps = resultA.gaps.length + resultB.gaps.length
    if (totalGaps === 0) return 100

    const synergyScore = synergies.reduce((sum, s) => sum + s.potentialImpact, 0)
    const maxScore = totalGaps * 50 // 최대 점수

    return Math.min(100, Math.round((synergyScore / maxScore) * 100))
  }
}

/**
 * 싱글톤 인스턴스
 */
let _instance: CoverageAnalyzer | null = null

export function getCoverageAnalyzer(): CoverageAnalyzer {
  if (!_instance) {
    _instance = new CoverageAnalyzer()
  }
  return _instance
}
