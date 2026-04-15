/**
 * 규칙 기반 DRC (Design Rule Check) 엔진
 * 하네스 엔지니어링 Phase 4: Validation
 */

import type {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  ValidationSeverity,
  CoverageReport,
  BOMEntry,
  Enabler,
  EnablerSkill,
  Skill,
  Domain,
  DRCSummary,
  DRCExecutionResult,
} from './types'

// ============================================================================
// 검증 규칙 구현
// ============================================================================

/**
 * Rule 1: 매핑 일관성 검증
 * - Enabler 에 할당된 Skill 이 해당 도메인에 속하는지 검증
 * - 동일 Skill 이 여러 Enabler 에 중복 매핑된 경우 경고
 * - Enabler 에 Skill 이 하나도 없는 경우 에러
 */
export const mappingConsistencyRule: ValidationRule = {
  id: 'mapping_consistency',
  name: '매핑 일관성 검증',
  description: 'Enabler-Skill 매핑의 논리적 일관성을 검증합니다',
  severity: 'error',
  category: 'mapping_consistency',
  validate: (context: ValidationContext): ValidationResult => {
    const issues: string[] = []
    const affectedSkills: string[] = []
    const affectedEnablers: string[] = []

    // 1. 빈 스킬 목록 검증
    if (context.skills.length === 0) {
      return {
        ruleId: 'mapping_consistency',
        passed: false,
        severity: 'error',
        message: `Enabler '${context.enabler.name}' 에 매핑된 스킬이 없습니다`,
        details: {
          affectedEnablers: [context.enabler.id],
          suggestion: '최소 1 개 이상의 스킬을 매핑하세요',
        },
      }
    }

    // 2. 도메인 외 스킬 매핑 검증
    const domainSkillIds = new Set(
      context.allSkills.map((s) => s.skill_id)
    )

    for (const skill of context.skills) {
      if (!domainSkillIds.has(skill.skill_id)) {
        issues.push(`스킬 '${skill.label_ko}' 이 도메인에 존재하지 않습니다`)
        affectedSkills.push(skill.skill_id)
      }
    }

    // 3. 동일 스킬 중복 매핑 검증 (전체 Enabler 기준)
    const skillCountMap = new Map<string, number>()
    for (const enabler of context.allEnablers) {
      for (const skill of enabler.skills) {
        skillCountMap.set(skill.skill_id, (skillCountMap.get(skill.skill_id) || 0) + 1)
      }
    }

    for (const skill of context.skills) {
      const count = skillCountMap.get(skill.skill_id) || 0
      if (count > 1) {
        issues.push(`스킬 '${skill.label_ko}' 이 ${count}개의 Enabler 에 중복 매핑되었습니다`)
        affectedSkills.push(skill.skill_id)
      }
    }

    if (issues.length > 0) {
      return {
        ruleId: 'mapping_consistency',
        passed: false,
        severity: 'warning',
        message: `매핑 일관성 문제 발견: ${issues.length}건`,
        details: {
          affectedEnablers: [context.enabler.id],
          affectedSkills: [...new Set(affectedSkills)],
          suggestion: issues.join('; '),
        },
      }
    }

    return {
      ruleId: 'mapping_consistency',
      passed: true,
      severity: 'info',
      message: '매핑 일관성 검증 통과',
    }
  },
}

/**
 * Rule 2: 커버리지 갭 검증
 * - 도메인 내 필수 스킬 (importance >= 4) 중 누락된 것 탐지
 * - 전체 도메인 커버리지가 70% 미만이면 에러, 70-85% 면 경고
 */
export const coverageGapRule: ValidationRule = {
  id: 'coverage_gap',
  name: '커버리지 갭 검증',
  description: '필수 스킬 커버리지 갭을 분석합니다',
  severity: 'error',
  category: 'coverage_gap',
  validate: (context: ValidationContext): ValidationResult => {
    // 현재 Enabler 의 스킬 ID 수집
    const enablerSkillIds = new Set(context.skills.map((s) => s.skill_id))

    // 전체 도메인의 필수 스킬 수집 (모든 Enabler 에서 importance >= 4)
    const requiredSkillsMap = new Map<string, EnablerSkill>()
    for (const enabler of context.allEnablers) {
      for (const skill of enabler.skills) {
        if (skill.importance >= 4) {
          requiredSkillsMap.set(skill.skill_id, skill)
        }
      }
    }

    // 갭 스킬 찾기
    const gapSkills: EnablerSkill[] = []
    for (const [skillId, skill] of requiredSkillsMap.entries()) {
      if (!enablerSkillIds.has(skillId)) {
        gapSkills.push(skill)
      }
    }

    const totalRequired = requiredSkillsMap.size
    const covered = totalRequired - gapSkills.length
    const coveragePercentage = totalRequired > 0 ? (covered / totalRequired) * 100 : 0

    if (gapSkills.length > 0) {
      let severity: ValidationSeverity = 'warning'
      if (coveragePercentage < 70) {
        severity = 'error'
      }

      return {
        ruleId: 'coverage_gap',
        passed: false,
        severity,
        message: `커버리지 갭 발견: ${coveragePercentage.toFixed(1)}% (${covered}/${totalRequired})`,
        details: {
          affectedEnablers: [context.enabler.id],
          affectedSkills: gapSkills.map((s) => s.skill_id),
          suggestion: `누락된 필수 스킬 ${gapSkills.length}개를 추가하세요: ${gapSkills
            .slice(0, 3)
            .map((s) => s.label_ko)
            .join(', ')}${gapSkills.length > 3 ? '...' : ''}`,
        },
      }
    }

    return {
      ruleId: 'coverage_gap',
      passed: true,
      severity: 'info',
      message: `커버리지 검증 통과: ${coveragePercentage.toFixed(1)}%`,
    }
  },
}

/**
 * Rule 3: 숙련도 미스매치 검증
 * - 하네스의 와이어 게이지 매칭에 해당
 * - Skill 의 required proficiency 와 actual proficiency 차이가 2 이상이면 경고
 */
export const proficiencyMismatchRule: ValidationRule = {
  id: 'proficiency_mismatch',
  name: '숙련도 미스매치 검증',
  description: '요구 숙련도와 실제 숙련도 간 갭을 검증합니다',
  severity: 'warning',
  category: 'compatibility',
  validate: (context: ValidationContext): ValidationResult => {
    const proficiencyLevels: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    }

    const issues: string[] = []
    const affectedSkills: string[] = []

    for (const skill of context.skills) {
      const requiredLevel = proficiencyLevels[skill.target_proficiency] || 0
      const actualLevel = skill.proficiency_level || 0

      if (actualLevel > 0 && requiredLevel - actualLevel >= 2) {
        issues.push(
          `'${skill.label_ko}': 요구 ${skill.target_proficiency}, 실제 ${actualLevel}레벨`
        )
        affectedSkills.push(skill.skill_id)
      }
    }

    if (issues.length > 0) {
      return {
        ruleId: 'proficiency_mismatch',
        passed: false,
        severity: 'warning',
        message: `숙련도 미스매치 발견: ${issues.length}건`,
        details: {
          affectedSkills,
          suggestion: issues.join('; '),
        },
      }
    }

    return {
      ruleId: 'proficiency_mismatch',
      passed: true,
      severity: 'info',
      message: '숙련도 미스매치 없음',
    }
  },
}

/**
 * Rule 4: 중복/과잉 검증
 * - 동일 카테고리의 유사 스킬이 하나의 Enabler 에 3 개 이상 매핑된 경우
 * - 하네스에서 불필요한 와이어가 번들에 포함된 것에 해당
 */
export const redundancyRule: ValidationRule = {
  id: 'redundancy',
  name: '중복/과잉 검증',
  description: '유사 스킬의 중복 매핑을 탐지합니다',
  severity: 'warning',
  category: 'redundancy',
  validate: (context: ValidationContext): ValidationResult => {
    // 스킬 타입별로 그룹화
    const skillsByType = new Map<string, EnablerSkill[]>()

    for (const skill of context.skills) {
      const type = skill.type
      const group = skillsByType.get(type) || []
      group.push(skill)
      skillsByType.set(type, group)
    }

    const issues: string[] = []
    const affectedSkills: string[] = []

    for (const [type, skills] of skillsByType.entries()) {
      if (skills.length >= 3) {
        issues.push(`${type} 카테고리에 ${skills.length}개의 스킬이 매핑됨`)
        affectedSkills.push(...skills.map((s) => s.skill_id))
      }
    }

    if (issues.length > 0) {
      return {
        ruleId: 'redundancy',
        passed: false,
        severity: 'warning',
        message: `스킬 중복 발견: ${issues.length}건`,
        details: {
          affectedEnablers: [context.enabler.id],
          affectedSkills,
          suggestion: issues.join('; '),
        },
      }
    }

    return {
      ruleId: 'redundancy',
      passed: true,
      severity: 'info',
      message: '중복 스킬 없음',
    }
  },
}

// ============================================================================
// DRC 엔진 클래스
// ============================================================================

/**
 * DRC 엔진 클래스
 * 규칙 기반 검증을 실행하고 리포트를 생성
 */
export class DRCEngine {
  private rules: Map<string, ValidationRule>
  private disabledRules: Set<string>

  constructor() {
    this.rules = new Map()
    this.disabledRules = new Set()

    // 기본 규칙 등록
    this.addRule(mappingConsistencyRule)
    this.addRule(coverageGapRule)
    this.addRule(proficiencyMismatchRule)
    this.addRule(redundancyRule)
  }

  /**
   * 검증 규칙 추가
   */
  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * 검증 규칙 제거
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId)
  }

  /**
   * 특정 규칙 비활성화
   */
  disableRule(ruleId: string): void {
    this.disabledRules.add(ruleId)
  }

  /**
   * 특정 규칙 활성화
   */
  enableRule(ruleId: string): void {
    this.disabledRules.delete(ruleId)
  }

  /**
   * 단일 Enabler 검증
   */
  validateEnabler(
    enabler: Enabler,
    allEnablers: Enabler[],
    allSkills: Skill[],
    domain: Domain
  ): ValidationResult[] {
    const results: ValidationResult[] = []

    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain,
      allEnablers,
      allSkills,
    }

    for (const rule of this.rules.values()) {
      if (this.disabledRules.has(rule.id)) {
        continue
      }

      try {
        const result = rule.validate(context)
        results.push(result)
      } catch (error) {
        results.push({
          ruleId: rule.id,
          passed: false,
          severity: 'error',
          message: `규칙 실행 중 오류: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }

    return results
  }

  /**
   * 전체 도메인 검증
   */
  validateDomain(domain: Domain): ValidationResult[] {
    const allResults: ValidationResult[] = []

    for (const enabler of domain.enablers) {
      const results = this.validateEnabler(
        enabler,
        domain.enablers,
        domain.enablers.flatMap((e) => e.skills.map((s) => ({ ...s, skill_id: s.skill_id }))),
        domain
      )
      allResults.push(...results)
    }

    return allResults
  }

  /**
   * 전체 온톨로지 검증
   */
  validateAll(domains: Domain[]): ValidationResult[] {
    const allResults: ValidationResult[] = []

    for (const domain of domains) {
      allResults.push(...this.validateDomain(domain))
    }

    return allResults
  }

  /**
   * 커버리지 리포트 생성
   */
  generateCoverageReport(domain: Domain): CoverageReport {
    const allSkillIds = new Set<string>()
    const coveredSkillIds = new Set<string>()

    // 전체 필수 스킬 수집
    for (const enabler of domain.enablers) {
      for (const skill of enabler.skills) {
        if (skill.importance >= 4) {
          allSkillIds.add(skill.skill_id)
          coveredSkillIds.add(skill.skill_id)
        }
      }
    }

    // TODO: 실제 도메인 스킬 풀과 비교하여 gap 계산
    const gapSkills: Skill[] = []
    const redundantSkills: Skill[] = []

    const totalRequired = allSkillIds.size
    const covered = coveredSkillIds.size
    const coveragePercentage = totalRequired > 0 ? (covered / totalRequired) * 100 : 0

    return {
      domainId: domain.id,
      totalRequiredSkills: totalRequired,
      coveredSkills: covered,
      gapSkills,
      redundantSkills,
      coveragePercentage,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * BOM (Bill of Materials) 생성
   */
  generateBOM(domain: Domain): BOMEntry[] {
    const bomMap = new Map<string, BOMEntry>()

    for (const enabler of domain.enablers) {
      for (const skill of enabler.skills) {
        const requiredProficiency = this.proficiencyToNumber(skill.target_proficiency)
        const currentProficiency = skill.proficiency_level || 0
        const gap = requiredProficiency - currentProficiency

        // 갭에 따른 교육 시간 추정 (레벨당 40 시간 가정)
        const trainingHoursEstimate = gap > 0 ? gap * 40 : 0

        bomMap.set(skill.skill_id, {
          skillId: skill.skill_id,
          skillName: skill.label_ko,
          skillType: skill.type === 'knowledge' ? 'knowledge' : 'competence',
          requiredProficiency,
          currentProficiency: currentProficiency || undefined,
          gap,
          trainingHoursEstimate,
        })
      }
    }

    return Array.from(bomMap.values())
  }

  /**
   * 실행 결과 요약
   */
  summarize(results: ValidationResult[]): DRCSummary {
    return {
      errors: results.filter((r) => r.severity === 'error' && !r.passed).length,
      warnings: results.filter((r) => r.severity === 'warning' && !r.passed).length,
      info: results.filter((r) => r.severity === 'info').length,
    }
  }

  /**
   * 전체 검증 실행
   */
  execute(
    domain: Domain,
    enablerId?: string
  ): DRCExecutionResult {
    const startTime = performance.now()

    let results: ValidationResult[]

    if (enablerId) {
      const enabler = domain.enablers.find((e) => e.id === enablerId)
      if (!enabler) {
        return {
          results: [
            {
              ruleId: 'system',
              passed: false,
              severity: 'error',
              message: `Enabler '${enablerId}' 를 찾을 수 없습니다`,
            },
          ],
          summary: { errors: 1, warnings: 0, info: 0 },
          executionTimeMs: performance.now() - startTime,
        }
      }

      results = this.validateEnabler(enabler, domain.enablers, [], domain)
    } else {
      results = this.validateDomain(domain)
    }

    const summary = this.summarize(results)

    return {
      results,
      summary,
      executionTimeMs: performance.now() - startTime,
    }
  }

  /**
   * 숙련도 문자열을 숫자로 변환
   */
  private proficiencyToNumber(level: string): number {
    const map: Record<string, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    }
    return map[level] || 0
  }
}

// ============================================================================
// 팩토리 함수
// ============================================================================

/**
 * 기본 DRC 엔진 인스턴스 생성
 */
export function createDRCEngine(): DRCEngine {
  return new DRCEngine()
}
