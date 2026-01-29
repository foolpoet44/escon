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
