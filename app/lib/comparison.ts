import { Skill, DomainKey, SkillsData } from './types';
import { DOMAINS } from './constants';

/**
 * 도메인 비교 결과 타입
 */
export interface DomainComparison {
    domain1: DomainKey;
    domain2: DomainKey;
    domain1Name: string;
    domain2Name: string;
    domain1Count: number;
    domain2Count: number;
    domain1Knowledge: number;
    domain1Competence: number;
    domain2Knowledge: number;
    domain2Competence: number;
    commonSkills: Skill[];
    uniqueToDomain1: Skill[];
    uniqueToDomain2: Skill[];
}

/**
 * 두 도메인을 비교하여 통계 및 공통/고유 스킬 반환
 */
export function compareDomains(
    data: SkillsData,
    domain1: DomainKey,
    domain2: DomainKey
): DomainComparison {
    const domain1Skills = data[domain1] || [];
    const domain2Skills = data[domain2] || [];

    // 스킬 URI를 기준으로 비교
    const domain1Uris = new Set(domain1Skills.map(s => s.uri));
    const domain2Uris = new Set(domain2Skills.map(s => s.uri));

    // 공통 스킬
    const commonSkills = domain1Skills.filter(s => domain2Uris.has(s.uri));

    // 고유 스킬
    const uniqueToDomain1 = domain1Skills.filter(s => !domain2Uris.has(s.uri));
    const uniqueToDomain2 = domain2Skills.filter(s => !domain1Uris.has(s.uri));

    // 스킬 타입별 카운트
    const domain1Knowledge = domain1Skills.filter(s => s.type === 'knowledge').length;
    const domain1Competence = domain1Skills.filter(s => s.type === 'skill/competence').length;
    const domain2Knowledge = domain2Skills.filter(s => s.type === 'knowledge').length;
    const domain2Competence = domain2Skills.filter(s => s.type === 'skill/competence').length;

    // 도메인 이름 찾기
    const domain1Info = DOMAINS.find(d => d.key === domain1);
    const domain2Info = DOMAINS.find(d => d.key === domain2);

    return {
        domain1,
        domain2,
        domain1Name: domain1Info?.name || domain1,
        domain2Name: domain2Info?.name || domain2,
        domain1Count: domain1Skills.length,
        domain2Count: domain2Skills.length,
        domain1Knowledge,
        domain1Competence,
        domain2Knowledge,
        domain2Competence,
        commonSkills,
        uniqueToDomain1,
        uniqueToDomain2
    };
}

/**
 * 여러 도메인을 비교하여 교집합 스킬 반환
 */
export function compareMultipleDomains(
    data: SkillsData,
    domains: DomainKey[]
): {
    domains: DomainKey[];
    commonSkills: Skill[];
    skillCounts: Record<DomainKey, number>;
} {
    if (domains.length === 0) {
        return { domains: [], commonSkills: [], skillCounts: {} as Record<DomainKey, number> };
    }

    // 첫 번째 도메인의 스킬로 시작
    let commonUris = new Set((data[domains[0]] || []).map(s => s.uri));

    // 나머지 도메인과 교집합 계산
    for (let i = 1; i < domains.length; i++) {
        const domainUris = new Set((data[domains[i]] || []).map(s => s.uri));
        commonUris = new Set(Array.from(commonUris).filter(uri => domainUris.has(uri)));
    }

    // 공통 스킬 객체 가져오기
    const firstDomainSkills = data[domains[0]] || [];
    const commonSkills = firstDomainSkills.filter(s => commonUris.has(s.uri));

    // 각 도메인의 스킬 수
    const skillCounts = {} as Record<DomainKey, number>;
    domains.forEach(domain => {
        skillCounts[domain] = (data[domain] || []).length;
    });

    return {
        domains,
        commonSkills,
        skillCounts
    };
}

/**
 * 도메인 간 유사도 계산 (Jaccard 유사도)
 */
export function calculateDomainSimilarity(
    data: SkillsData,
    domain1: DomainKey,
    domain2: DomainKey
): number {
    const domain1Skills = data[domain1] || [];
    const domain2Skills = data[domain2] || [];

    const domain1Uris = new Set(domain1Skills.map(s => s.uri));
    const domain2Uris = new Set(domain2Skills.map(s => s.uri));

    // 교집합
    const intersection = [...domain1Uris].filter(uri => domain2Uris.has(uri)).length;

    // 합집합
    const union = new Set([...domain1Uris, ...domain2Uris]).size;

    // Jaccard 유사도
    return union === 0 ? 0 : intersection / union;
}

/**
 * 모든 도메인 쌍의 유사도 매트릭스 생성
 */
export function createSimilarityMatrix(data: SkillsData): {
    domains: DomainKey[];
    matrix: number[][];
} {
    const domainKeys = DOMAINS.map(d => d.key);
    const matrix: number[][] = [];

    for (let i = 0; i < domainKeys.length; i++) {
        matrix[i] = [];
        for (let j = 0; j < domainKeys.length; j++) {
            if (i === j) {
                matrix[i][j] = 1; // 자기 자신과는 100% 유사
            } else {
                matrix[i][j] = calculateDomainSimilarity(data, domainKeys[i], domainKeys[j]);
            }
        }
    }

    return {
        domains: domainKeys,
        matrix
    };
}
