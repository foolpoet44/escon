/**
 * DRC (Design Rule Check) 엔진 타입 시스템
 * 하네스 엔지니어링 Phase 4: Validation
 */

// ============================================================================
// 기본 도메인 타입 (기존 데이터 구조 기반)
// ============================================================================

/**
 * 스킬 타입 (ESCO 기준)
 */
export interface Skill {
  skill_id: string
  domain?: string
  domain_en?: string
  esco_uri?: string | null
  custom_uri?: string | null
  preferred_label_ko: string
  preferred_label_en: string
  description_ko?: string
  description_en?: string
  skill_type: 'knowledge' | 'skill/competence'
  proficiency_level?: number
  role_mapping?: string[]
  parent_skill_id?: string | null
  related_skills?: string[]
  // Enabler 매핑 관련 필드
  importance?: number // 1-5 중요도
  target_proficiency?: string // 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  priority_rank?: number
  match_type?: 'exact' | 'approximate' | 'custom'
  notes?: string
}

/**
 * Enabler 타입 (역량 활성화 요소)
 */
export interface Enabler {
  id: string
  name: string
  name_en: string
  description: string
  priority: number
  skills: EnablerSkill[]
}

/**
 * Enabler 에 매핑된 스킬 정보
 */
export interface EnablerSkill {
  skill_id: string
  esco_uri?: string | null
  custom_uri?: string | null
  label_ko: string
  label_en: string
  type: 'knowledge' | 'skill/competence'
  importance: number // 1-5
  target_proficiency: string
  priority_rank: number
  match_type: 'exact' | 'approximate' | 'custom'
  notes?: string
}

/**
 * 도메인 타입 (조직/도메인 컨텍스트)
 */
export interface Domain {
  id: string
  name: string
  name_en: string
  description: string
  enablers: Enabler[]
}

// ============================================================================
// DRC 검증 타입
// ============================================================================

/**
 * 검증 규칙 카테고리
 */
export type ValidationCategory =
  | 'mapping_consistency'  // 매핑 일관성
  | 'coverage_gap'         // 커버리지 갭
  | 'redundancy'           // 중복/과잉
  | 'compatibility'        // 호환성

/**
 * 검증 결과 심각도
 */
export type ValidationSeverity = 'error' | 'warning' | 'info'

/**
 * 검증 규칙 인터페이스
 */
export interface ValidationRule {
  /** 규칙 고유 ID */
  id: string
  /** 규칙 이름 */
  name: string
  /** 규칙 설명 */
  description: string
  /** 심각도 */
  severity: ValidationSeverity
  /** 카테고리 */
  category: ValidationCategory
  /** 검증 함수 */
  validate: (context: ValidationContext) => ValidationResult
}

/**
 * 검증 대상 컨텍스트
 */
export interface ValidationContext {
  /** 검증 대상 Enabler */
  enabler: Enabler
  /** 매핑된 스킬 목록 */
  skills: EnablerSkill[]
  /** 도메인 정보 */
  domain: Domain
  /** 교차 검증용 전체 Enabler 목록 */
  allEnablers: Enabler[]
  /** 전체 스킬 풀 (도메인 기준) */
  allSkills: Skill[]
}

/**
 * 검증 결과 상세 정보
 */
export interface ValidationResultDetails {
  /** 영향을 받는 Enabler ID 목록 */
  affectedEnablers?: string[]
  /** 영향을 받는 Skill ID 목록 */
  affectedSkills?: string[]
  /** 제안 사항 */
  suggestion?: string
}

/**
 * 검증 결과
 */
export interface ValidationResult {
  /** 규칙 ID */
  ruleId: string
  /** 통과 여부 */
  passed: boolean
  /** 심각도 */
  severity: ValidationSeverity
  /** 메시지 */
  message: string
  /** 상세 정보 */
  details?: ValidationResultDetails
}

// ============================================================================
// 커버리지 리포트 타입
// ============================================================================

/**
 * 커버리지 분석 리포트
 */
export interface CoverageReport {
  /** 도메인 ID */
  domainId: string
  /** 전체 필수 스킬 수 */
  totalRequiredSkills: number
  /** 커버된 스킬 수 */
  coveredSkills: number
  /** 갭 스킬 목록 */
  gapSkills: Skill[]
  /** 중복 스킬 목록 */
  redundantSkills: Skill[]
  /** 커버리지 백분율 */
  coveragePercentage: number
  /** 생성 일시 */
  generatedAt: string // ISO timestamp
}

// ============================================================================
// BOM (Bill of Materials) 타입
// ============================================================================

/**
 * BOM 엔트리 (스킬별 요구사항)
 */
export interface BOMEntry {
  /** 스킬 ID */
  skillId: string
  /** 스킬 이름 */
  skillName: string
  /** 스킬 타입 */
  skillType: 'knowledge' | 'competence'
  /** 요구 숙련도 */
  requiredProficiency: number
  /** 현재 숙련도 (선택) */
  currentProficiency?: number
  /** 갭 */
  gap: number
  /** 예상 교육 시간 (시간) */
  trainingHoursEstimate: number
}

// ============================================================================
// DRC 엔진 타입
// ============================================================================

/**
 * DRC 검증 요약
 */
export interface DRCSummary {
  errors: number
  warnings: number
  info: number
}

/**
 * DRC 검증 실행 결과
 */
export interface DRCExecutionResult {
  results: ValidationResult[]
  summary: DRCSummary
  executionTimeMs: number
}

/**
 * 검증 모드
 */
export type ValidationMode = 'rules' | 'ai' | 'full'

/**
 * DRC API 요청 바디
 */
export interface DRCRequest {
  domainId?: string
  enablerId?: string
  mode: ValidationMode
}

/**
 * DRC API 응답
 */
export interface DRCResponse {
  results: ValidationResult[]
  summary: DRCSummary
  executionTimeMs: number
}
