/**
 * DRC 엔진 테스트용 픽스처
 */

import type { Enabler, EnablerSkill, Domain, Skill } from '../types'

/**
 * 테스트용 기본 스킬 팩토리
 */
export function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    skill_id: overrides.skill_id || 'TEST_SKILL_001',
    preferred_label_ko: overrides.preferred_label_ko || '테스트 스킬',
    preferred_label_en: overrides.preferred_label_en || 'Test Skill',
    skill_type: overrides.skill_type || 'skill/competence',
    ...overrides,
  }
}

/**
 * 테스트용 EnablerSkill 팩토리
 */
export function createMockEnablerSkill(
  overrides: Partial<EnablerSkill> = {}
): EnablerSkill {
  return {
    skill_id: overrides.skill_id || 'TEST_SKILL_001',
    label_ko: overrides.label_ko || '테스트 스킬',
    label_en: overrides.label_en || 'Test Skill',
    type: overrides.type || 'skill/competence',
    importance: overrides.importance || 3,
    target_proficiency: overrides.target_proficiency || 'Intermediate',
    priority_rank: overrides.priority_rank ?? 1,
    match_type: overrides.match_type || 'exact',
    ...overrides,
  }
}

/**
 * 테스트용 Enabler 팩토리
 */
export function createMockEnabler(
  id: string,
  skills: EnablerSkill[] = [],
  overrides: Partial<Enabler> = {}
): Enabler {
  return {
    id,
    name: overrides.name || '테스트 Enabler',
    name_en: overrides.name_en || 'Test Enabler',
    description: overrides.description || '테스트 설명',
    priority: overrides.priority ?? 1,
    skills,
    ...overrides,
  }
}

/**
 * 테스트용 Domain 팩토리
 */
export function createMockDomain(
  enablers: Enabler[] = [],
  overrides: Partial<Domain> = {}
): Domain {
  return {
    id: overrides.id || 'test_domain',
    name: overrides.name || '테스트 도메인',
    name_en: overrides.name_en || 'Test Domain',
    description: overrides.description || '테스트 도메인 설명',
    enablers,
    ...overrides,
  }
}

// ============================================================================
// 테스트 시나리오별 픽스처
// ============================================================================

/**
 * 빈 스킬 목록을 가진 Enabler
 */
export const emptyEnabler = createMockEnabler('empty_enabler', [])

/**
 * 올바른 스킬 매핑을 가진 Enabler
 */
export const validEnabler = createMockEnabler('valid_enabler', [
  createMockEnablerSkill({
    skill_id: 'SKILL_001',
    label_ko: 'Python 프로그래밍',
    importance: 5,
    target_proficiency: 'Expert',
  }),
  createMockEnablerSkill({
    skill_id: 'SKILL_002',
    label_ko: 'REST API 설계',
    importance: 4,
    target_proficiency: 'Advanced',
  }),
])

/**
 * 도메인 외 스킬이 매핑된 Enabler
 */
export const invalidDomainEnabler = createMockEnabler('invalid_domain_enabler', [
  createMockEnablerSkill({
    skill_id: 'OUTSIDE_SKILL',
    label_ko: '도메인 외 스킬',
    importance: 3,
  }),
])

/**
 * 중복 스킬이 있는 Enabler
 */
export const duplicateSkillEnabler = createMockEnabler('duplicate_enabler', [
  createMockEnablerSkill({
    skill_id: 'SHARED_SKILL',
    label_ko: '공유 스킬',
    importance: 4,
  }),
])

export const duplicateSkillEnabler2 = createMockEnabler('duplicate_enabler_2', [
  createMockEnablerSkill({
    skill_id: 'SHARED_SKILL',
    label_ko: '공유 스킬',
    importance: 4,
  }),
])

/**
 * 100% 커버리지 도메인 - 각 Enabler 가 해당 도메인의 모든 필수 스킬을 가짐
 */
export const fullCoverageDomain = createMockDomain([
  createMockEnabler('enabler_1', [
    createMockEnablerSkill({ skill_id: 'SKILL_001', importance: 5 }),
    createMockEnablerSkill({ skill_id: 'SKILL_002', importance: 4 }),
    createMockEnablerSkill({ skill_id: 'SKILL_003', importance: 5 }),
  ]),
])

/**
 * 50% 커버리지 도메인 (갭 있음) - 필수 스킬 중 일부 누락
 */
export const gapCoverageDomain = createMockDomain([
  createMockEnabler('enabler_1', [
    createMockEnablerSkill({ skill_id: 'SKILL_001', importance: 5 }),
    // SKILL_002 가 누락됨 (importance: 4)
  ]),
  createMockEnabler('enabler_2', [
    createMockEnablerSkill({ skill_id: 'SKILL_002', importance: 4 }),
  ]),
])

/**
 * 숙련도 미스매치 Enabler
 */
export const proficiencyMismatchEnabler = createMockEnabler(
  'proficiency_mismatch',
  [
    createMockEnablerSkill({
      skill_id: 'SKILL_001',
      label_ko: '고급 스킬',
      target_proficiency: 'Expert', // 4 레벨 요구
      proficiency_level: 1, // 실제 1 레벨
    }),
  ]
)

/**
 * 중복 스킬이 많은 Enabler (redundancy)
 */
export const redundantEnabler = createMockEnabler('redundant', [
  createMockEnablerSkill({
    skill_id: 'SKILL_A',
    label_ko: '스킬 A',
    type: 'skill/competence',
  }),
  createMockEnablerSkill({
    skill_id: 'SKILL_B',
    label_ko: '스킬 B',
    type: 'skill/competence',
  }),
  createMockEnablerSkill({
    skill_id: 'SKILL_C',
    label_ko: '스킬 C',
    type: 'skill/competence',
  }),
])
