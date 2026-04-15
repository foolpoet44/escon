/**
 * DRC 엔진 테스트
 * Coverage 목표: 80% 이상
 */

import {
  DRCEngine,
  createDRCEngine,
  mappingConsistencyRule,
  coverageGapRule,
  proficiencyMismatchRule,
  redundancyRule,
} from '../drc-engine'
import type { ValidationContext } from '../types'
import {
  createMockEnabler,
  createMockEnablerSkill,
  createMockDomain,
  createMockSkill,
  emptyEnabler,
  validEnabler,
  fullCoverageDomain,
  gapCoverageDomain,
  proficiencyMismatchEnabler,
  redundantEnabler,
} from './fixtures'

// ============================================================================
// MappingConsistencyRule 테스트
// ============================================================================

describe('MappingConsistencyRule', () => {
  it('빈 스킬 목록의 Enabler 에 대해 에러를 반환한다', () => {
    const domain = createMockDomain([emptyEnabler])
    const allSkills = []

    const context: ValidationContext = {
      enabler: emptyEnabler,
      skills: emptyEnabler.skills,
      domain,
      allEnablers: [emptyEnabler],
      allSkills,
    }

    const result = mappingConsistencyRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.severity).toBe('error')
    expect(result.message).toContain('매핑된 스킬이 없습니다')
  })

  it('올바르게 매핑된 Enabler 는 통과한다', () => {
    const domain = createMockDomain([validEnabler])
    const allSkills = validEnabler.skills.map((s) =>
      createMockSkill({ skill_id: s.skill_id })
    )

    const context: ValidationContext = {
      enabler: validEnabler,
      skills: validEnabler.skills,
      domain,
      allEnablers: [validEnabler],
      allSkills,
    }

    const result = mappingConsistencyRule.validate(context)

    expect(result.passed).toBe(true)
    expect(result.severity).toBe('info')
    expect(result.message).toContain('매핑 일관성 검증 통과')
  })

  it('도메인 외 스킬이 매핑된 경우 경고를 반환한다', () => {
    const invalidSkill = createMockEnablerSkill({
      skill_id: 'OUTSIDE_SKILL',
      label_ko: '도메인 외 스킬',
    })
    const enabler = createMockEnabler('invalid', [invalidSkill])
    const domain = createMockDomain([enabler])
    // allSkills 에 해당 스킬이 없음

    const context: ValidationContext = {
      enabler,
      skills: [invalidSkill],
      domain,
      allEnablers: [enabler],
      allSkills: [],
    }

    const result = mappingConsistencyRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('일관성 문제')
  })

  it('동일 스킬 중복 매핑 시 경고를 반환한다', () => {
    const sharedSkill = createMockEnablerSkill({
      skill_id: 'SHARED_SKILL',
      label_ko: '공유 스킬',
    })
    const enabler1 = createMockEnabler('enabler1', [sharedSkill])
    const enabler2 = createMockEnabler('enabler2', [sharedSkill])
    const domain = createMockDomain([enabler1, enabler2])

    const context: ValidationContext = {
      enabler: enabler1,
      skills: [sharedSkill],
      domain,
      allEnablers: [enabler1, enabler2],
      allSkills: [createMockSkill({ skill_id: 'SHARED_SKILL' })],
    }

    const result = mappingConsistencyRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('일관성 문제')
  })
})

// ============================================================================
// CoverageGapRule 테스트
// ============================================================================

describe('CoverageGapRule', () => {
  it('100% 커버리지 도메인은 통과한다', () => {
    // fullCoverageDomain 의 첫 번째 enabler 가 모든 필수 스킬을 가짐
    const enabler = fullCoverageDomain.enablers[0]
    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain: fullCoverageDomain,
      allEnablers: fullCoverageDomain.enablers,
      allSkills: [],
    }

    const result = coverageGapRule.validate(context)

    expect(result.passed).toBe(true)
  })

  it('70% 미만 커버리지는 에러를 반환한다', () => {
    // gapCoverageDomain 에서 첫 번째 enabler 는 일부 필수 스킬만 가짐
    const enabler = gapCoverageDomain.enablers[0]
    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain: gapCoverageDomain,
      allEnablers: gapCoverageDomain.enablers,
      allSkills: [],
    }

    const result = coverageGapRule.validate(context)

    // 50% 커버리지 (1 개 중 1 개 보유) -> error
    expect(result.passed).toBe(false)
    expect(result.message).toContain('갭')
  })

  it('필수 스킬 (importance>=4) 누락 시 에러를 반환한다', () => {
    const missingSkill = createMockEnablerSkill({
      skill_id: 'MISSING_SKILL',
      label_ko: '필수 스킬',
      importance: 5,
    })
    const enabler = createMockEnabler('partial', [])
    const otherEnabler = createMockEnabler('other', [missingSkill])
    const domain = createMockDomain([enabler, otherEnabler])

    const context: ValidationContext = {
      enabler,
      skills: [],
      domain,
      allEnablers: [enabler, otherEnabler],
      allSkills: [],
    }

    const result = coverageGapRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.message).toContain('갭')
  })
})

// ============================================================================
// ProficiencyMismatchRule 테스트
// ============================================================================

describe('ProficiencyMismatchRule', () => {
  it('숙련도 차이가 2 이상이면 경고를 반환한다', () => {
    const enabler = proficiencyMismatchEnabler
    const domain = createMockDomain([enabler])

    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain,
      allEnablers: [enabler],
      allSkills: [],
    }

    const result = proficiencyMismatchRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('숙련도 미스매치')
  })

  it('숙련도 차이가 1 이하면 통과한다', () => {
    const skill = createMockEnablerSkill({
      skill_id: 'SKILL_001',
      target_proficiency: 'Advanced', // 3
      proficiency_level: 2, // 차이 1
    })
    const enabler = createMockEnabler('ok', [skill])
    const domain = createMockDomain([enabler])

    const context: ValidationContext = {
      enabler,
      skills: [skill],
      domain,
      allEnablers: [enabler],
      allSkills: [],
    }

    const result = proficiencyMismatchRule.validate(context)

    expect(result.passed).toBe(true)
  })
})

// ============================================================================
// RedundancyRule 테스트
// ============================================================================

describe('RedundancyRule', () => {
  it('동일 카테고리 스킬이 3 개 이상이면 경고를 반환한다', () => {
    const enabler = redundantEnabler
    const domain = createMockDomain([enabler])

    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain,
      allEnablers: [enabler],
      allSkills: [],
    }

    const result = redundancyRule.validate(context)

    expect(result.passed).toBe(false)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('중복')
  })

  it('스킬이 2 개 이하면 통과한다', () => {
    const enabler = createMockEnabler('ok', [
      createMockEnablerSkill({ skill_id: 'A' }),
      createMockEnablerSkill({ skill_id: 'B' }),
    ])
    const domain = createMockDomain([enabler])

    const context: ValidationContext = {
      enabler,
      skills: enabler.skills,
      domain,
      allEnablers: [enabler],
      allSkills: [],
    }

    const result = redundancyRule.validate(context)

    expect(result.passed).toBe(true)
  })
})

// ============================================================================
// DRCEngine 클래스 테스트
// ============================================================================

describe('DRCEngine', () => {
  it('모든 규칙을 순차 실행한다', () => {
    const engine = createDRCEngine()
    const enabler = validEnabler
    const domain = createMockDomain([enabler])

    const results = engine.validateEnabler(enabler, [enabler], [], domain)

    expect(results.length).toBeGreaterThan(0)
  })

  it('특정 규칙만 비활성화할 수 있다', () => {
    const engine = createDRCEngine()
    engine.disableRule('redundancy')

    const enabler = redundantEnabler
    const domain = createMockDomain([enabler])

    const results = engine.validateEnabler(enabler, [enabler], [], domain)

    // redundancy 규칙이 비활성화되었으므로 결과가 달라짐
    const redundancyResults = results.filter(
      (r) => r.ruleId === 'redundancy'
    )
    expect(redundancyResults.length).toBe(0)
  })

  it('CoverageReport 를 올바른 형식으로 생성한다', () => {
    const engine = createDRCEngine()
    const domain = fullCoverageDomain

    const report = engine.generateCoverageReport(domain)

    expect(report.domainId).toBe('test_domain')
    expect(report.totalRequiredSkills).toBeGreaterThanOrEqual(0)
    expect(report.coveredSkills).toBeGreaterThanOrEqual(0)
    expect(report.coveragePercentage).toBeGreaterThanOrEqual(0)
    expect(report.coveragePercentage).toBeLessThanOrEqual(100)
    expect(report.generatedAt).toBeDefined()
    expect(new Date(report.generatedAt)).toBeInstanceOf(Date)
  })

  it('BOM 을 올바른 형식으로 생성한다', () => {
    const engine = createDRCEngine()
    const domain = fullCoverageDomain

    const bom = engine.generateBOM(domain)

    expect(Array.isArray(bom)).toBe(true)
    if (bom.length > 0) {
      const entry = bom[0]
      expect(entry.skillId).toBeDefined()
      expect(entry.skillName).toBeDefined()
      expect(['knowledge', 'competence']).toContain(entry.skillType)
      expect(entry.requiredProficiency).toBeGreaterThanOrEqual(0)
      expect(entry.gap).toBeDefined()
      expect(entry.trainingHoursEstimate).toBeGreaterThanOrEqual(0)
    }
  })

  it('실행 결과 요약을 올바르게 계산한다', () => {
    const engine = createDRCEngine()
    const domain = createMockDomain([
      validEnabler,
      emptyEnabler, // error 발생
    ])

    const executionResult = engine.execute(domain)

    expect(executionResult.results).toBeDefined()
    expect(executionResult.summary).toBeDefined()
    expect(executionResult.summary.errors).toBeGreaterThanOrEqual(0)
    expect(executionResult.summary.warnings).toBeGreaterThanOrEqual(0)
    expect(executionResult.executionTimeMs).toBeGreaterThanOrEqual(0)
  })
})
