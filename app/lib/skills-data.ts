import { Skill, SkillsData, Statistics, FilterOptions, DomainKey } from './types';
import { DOMAINS, DOMAIN_KEY_MAP } from './constants';

// 스킬 데이터 로드 (클라이언트 사이드)
export async function loadSkillsData(): Promise<SkillsData> {
    const response = await fetch('/data/skills.json');
    if (!response.ok) {
        throw new Error('Failed to load skills data');
    }
    return response.json();
}

// 도메인별 스킬 가져오기
export function getSkillsByDomain(data: SkillsData, domainKey: DomainKey): Skill[] {
    const jsonKey = DOMAIN_KEY_MAP[domainKey];
    return data[jsonKey as keyof SkillsData] || [];
}

// 모든 스킬 가져오기
export function getAllSkills(data: SkillsData): Skill[] {
    const allSkills: Skill[] = [];
    Object.values(data).forEach((skills) => {
        if (Array.isArray(skills)) {
            allSkills.push(...skills);
        }
    });
    return allSkills;
}

// 스킬 검색
export function searchSkills(skills: Skill[], query: string): Skill[] {
    if (!query.trim()) return skills;

    const lowerQuery = query.toLowerCase();
    return skills.filter(
        (skill) =>
            skill.label.toLowerCase().includes(lowerQuery) ||
            skill.description.toLowerCase().includes(lowerQuery)
    );
}

// 스킬 타입별 필터링
export function filterSkillsByType(skills: Skill[], types: string[]): Skill[] {
    if (types.length === 0) return skills;
    return skills.filter((skill) => types.includes(skill.type));
}

// 복합 필터링
export function filterSkills(
    data: SkillsData,
    options: FilterOptions
): Skill[] {
    let skills: Skill[] = [];

    // 도메인 필터
    if (options.domains.length > 0) {
        options.domains.forEach((domain) => {
            skills.push(...getSkillsByDomain(data, domain));
        });
    } else {
        skills = getAllSkills(data);
    }

    // 타입 필터
    if (options.skillTypes.length > 0) {
        skills = filterSkillsByType(skills, options.skillTypes);
    }

    // 검색
    if (options.searchQuery) {
        skills = searchSkills(skills, options.searchQuery);
    }

    return skills;
}

// 통계 계산
export function calculateStatistics(data: SkillsData): Statistics {
    const allSkills = getAllSkills(data);

    const knowledgeSkills = allSkills.filter((s) => s.type === 'knowledge').length;
    const competenceSkills = allSkills.filter((s) => s.type === 'skill/competence').length;

    const domainDistribution = DOMAINS.map((domain) => ({
        domain: domain.name,
        count: getSkillsByDomain(data, domain.key).length
    }));

    return {
        totalSkills: allSkills.length,
        totalDomains: DOMAINS.length,
        knowledgeSkills,
        competenceSkills,
        domainDistribution
    };
}

// 스킬 설명 자르기
export function truncateDescription(description: string, maxLength: number = 150): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
}

// URI에서 ID 추출
export function extractIdFromUri(uri: string): string {
    const parts = uri.split('/');
    return parts[parts.length - 1];
}

// ==================== 로봇테크 for 스마트팩토리 데이터 로드 ====================

// 로봇테크 스킬 데이터 타입
export interface RobotSkill {
    skill_id: string;
    domain: string;
    domain_en: string;
    esco_uri: string;
    preferred_label_ko: string;
    preferred_label_en: string;
    description_ko: string;
    description_en: string;
    skill_type: 'knowledge' | 'skill' | 'competence';
    proficiency_level: 1 | 2 | 3 | 4;
    role_mapping: ('operator' | 'engineer' | 'developer')[];
    parent_skill_id: string | null;
    related_skills: string[];
    esco_broader: string | null;
    smartfactory_context: string;
}

// 로봇테크 스킬 데이터 로드
export async function loadRobotSmartFactoryData(): Promise<RobotSkill[]> {
    try {
        const response = await fetch('/data/robot-smartfactory.json');
        if (!response.ok) {
            throw new Error(`Failed to load robot smartfactory data: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error loading robot smartfactory data:', error);
        return [];
    }
}

// 로봇테크 도메인별 스킬 가져오기
export function getRobotSkillsByDomain(
    skills: RobotSkill[],
    domain: string
): RobotSkill[] {
    return skills.filter((skill) => skill.domain === domain);
}

// 로봇테크 역할별 스킬 가져오기
export function getRobotSkillsByRole(
    skills: RobotSkill[],
    role: 'operator' | 'engineer' | 'developer'
): RobotSkill[] {
    return skills.filter((skill) => skill.role_mapping.includes(role));
}

// 로봇테크 숙련도별 스킬 가져오기
export function getRobotSkillsByProficiency(
    skills: RobotSkill[],
    level: number
): RobotSkill[] {
    return skills.filter((skill) => skill.proficiency_level === level);
}

// 로봇테크 스킬 타입별 가져오기
export function getRobotSkillsByType(
    skills: RobotSkill[],
    type: 'knowledge' | 'skill' | 'competence'
): RobotSkill[] {
    return skills.filter((skill) => skill.skill_type === type);
}

// 로봇테크 복합 필터링
export interface RobotSkillFilterOptions {
    domains?: string[];
    roles?: ('operator' | 'engineer' | 'developer')[];
    proficiencies?: number[];
    skillTypes?: ('knowledge' | 'skill' | 'competence')[];
    searchQuery?: string;
}

export function filterRobotSkills(
    skills: RobotSkill[],
    options: RobotSkillFilterOptions
): RobotSkill[] {
    let filtered = [...skills];

    // 도메인 필터
    if (options.domains && options.domains.length > 0) {
        filtered = filtered.filter((skill) => options.domains!.includes(skill.domain));
    }

    // 역할 필터
    if (options.roles && options.roles.length > 0) {
        filtered = filtered.filter((skill) =>
            skill.role_mapping.some((role) => options.roles!.includes(role))
        );
    }

    // 숙련도 필터
    if (options.proficiencies && options.proficiencies.length > 0) {
        filtered = filtered.filter((skill) =>
            options.proficiencies!.includes(skill.proficiency_level)
        );
    }

    // 스킬 타입 필터
    if (options.skillTypes && options.skillTypes.length > 0) {
        filtered = filtered.filter((skill) => options.skillTypes!.includes(skill.skill_type));
    }

    // 검색 쿼리 필터
    if (options.searchQuery && options.searchQuery.trim()) {
        const query = options.searchQuery.toLowerCase();
        filtered = filtered.filter(
            (skill) =>
                skill.preferred_label_ko.toLowerCase().includes(query) ||
                skill.preferred_label_en.toLowerCase().includes(query) ||
                skill.description_ko.toLowerCase().includes(query) ||
                skill.description_en.toLowerCase().includes(query)
        );
    }

    return filtered;
}

// 로봇테크 통계 계산
export interface RobotSmartFactoryStatistics {
    totalSkills: number;
    domainCount: number;
    domainDistribution: Array<{ domain: string; count: number }>;
    roleDistribution: Array<{ role: string; count: number }>;
    proficiencyDistribution: Array<{ level: number; count: number }>;
    skillTypeDistribution: Array<{ type: string; count: number }>;
}

export function calculateRobotSmartFactoryStatistics(
    skills: RobotSkill[]
): RobotSmartFactoryStatistics {
    const domainMap = new Map<string, number>();
    const roleMap = new Map<string, number>();
    const proficiencyMap = new Map<number, number>();
    const typeMap = new Map<string, number>();

    skills.forEach((skill) => {
        // 도메인 통계
        domainMap.set(skill.domain, (domainMap.get(skill.domain) || 0) + 1);

        // 역할 통계
        skill.role_mapping.forEach((role) => {
            roleMap.set(role, (roleMap.get(role) || 0) + 1);
        });

        // 숙련도 통계
        proficiencyMap.set(
            skill.proficiency_level,
            (proficiencyMap.get(skill.proficiency_level) || 0) + 1
        );

        // 스킬 타입 통계
        typeMap.set(skill.skill_type, (typeMap.get(skill.skill_type) || 0) + 1);
    });

    return {
        totalSkills: skills.length,
        domainCount: domainMap.size,
        domainDistribution: Array.from(domainMap).map(([domain, count]) => ({ domain, count })),
        roleDistribution: Array.from(roleMap).map(([role, count]) => ({ role, count })),
        proficiencyDistribution: Array.from(proficiencyMap)
            .map(([level, count]) => ({ level, count }))
            .sort((a, b) => a.level - b.level),
        skillTypeDistribution: Array.from(typeMap).map(([type, count]) => ({ type, count })),
    };
}
