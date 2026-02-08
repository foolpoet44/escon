// 스킬 타입 정의
export type SkillType = 'knowledge' | 'skill/competence';

// 스킬 인터페이스
export interface Skill {
    uri: string;
    label: string;
    type: SkillType;
    description: string;
}

// 도메인 타입
export type DomainKey =
    | 'robotics'
    | 'perception'
    | 'control'
    | 'mechatronics'
    | 'ai_ml'
    | 'manufacturing'
    | 'manipulation'
    | 'navigation'
    | 'safety'
    | 'integration';

// 도메인 인터페이스
export interface Domain {
    key: DomainKey;
    name: string;
    description: string;
    icon: string;
    color: string;
    skillCount: number;
}

// 스킬 데이터 구조 (JSON 파일 형식)
export interface SkillsData {
    robotics: Skill[];
    perception: Skill[];
    control: Skill[];
    mechatronics: Skill[];
    ai_ml: Skill[];
    manufacturing: Skill[];
    manipulation: Skill[];
    navigation: Skill[];
    safety: Skill[];
    integration: Skill[];
}

// 통계 데이터
export interface Statistics {
    totalSkills: number;
    totalDomains: number;
    knowledgeSkills: number;
    competenceSkills: number;
    domainDistribution: {
        domain: string;
        count: number;
    }[];
}

// 필터 옵션
export interface FilterOptions {
    domains: DomainKey[];
    skillTypes: SkillType[];
    searchQuery: string;
}

// ========== 조직 스킬 매칭 타입 ==========

// 숙련도 레벨
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// ESCO 매칭 타입
export type MatchType = 'exact' | 'approximate' | 'custom';

// 조직 스킬 매핑
export interface OrganizationSkillMapping {
    skill_id: string;
    esco_uri: string | null;
    custom_uri?: string;
    label_ko: string;
    label_en: string;
    type: SkillType;
    importance: 1 | 2 | 3 | 4 | 5;
    target_proficiency: ProficiencyLevel;
    priority_rank: number;
    match_type: MatchType;
    notes?: string;
}

// Enabler
export interface Enabler {
    id: string;
    name: string;
    name_en: string;
    description: string;
    priority: number;
    skills: OrganizationSkillMapping[];
}

// 조직 정보
export interface OrganizationInfo {
    id: string;
    name: string;
    name_en: string;
    description: string;
    mission?: string;
}

// 조직 데이터 (전체)
export interface Organization {
    organization: OrganizationInfo;
    enablers: Enabler[];
}

// Enriched Skill (ESCO + 조직 컨텍스트)
export interface EnrichedSkill extends Skill {
    org_context?: {
        organization: string;
        enabler: string;
        importance: number;
        target_proficiency: ProficiencyLevel;
        priority_rank: number;
        korean_label?: string;
        notes?: string;
    };
    match_type?: MatchType;
}
