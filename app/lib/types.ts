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
