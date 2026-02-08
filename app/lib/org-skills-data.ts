import type {
    Organization,
    OrganizationSkillMapping,
    Enabler,
    EnrichedSkill,
    Skill,
    SkillsData,
} from './types';

// ========== 조직 데이터 로딩 ==========

/**
 * 조직 데이터 로딩
 */
export async function loadOrganizationData(orgId: string): Promise<Organization> {
    const response = await fetch(`/data/organizations/${orgId}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load organization data: ${orgId}`);
    }
    return response.json();
}

/**
 * 로봇솔루션 데이터 로딩 (단축 함수)
 */
export async function loadRobotSolutionData(): Promise<Organization> {
    return loadOrganizationData('robot-solution');
}

// ========== Enriched Skills 생성 ==========

/**
 * 조직 스킬과 ESCO 스킬을 결합하여 EnrichedSkill 생성
 */
export async function getEnrichedSkills(
    orgData: Organization,
    baseSkills?: SkillsData
): Promise<EnrichedSkill[]> {
    const enrichedSkills: EnrichedSkill[] = [];

    // 각 Enabler별로 스킬 처리
    for (const enabler of orgData.enablers) {
        for (const orgSkill of enabler.skills) {
            // ESCO URI로 기존 스킬 찾기
            let baseSkill: Skill | null = null;

            if (baseSkills && orgSkill.esco_uri) {
                baseSkill = findSkillByURI(baseSkills, orgSkill.esco_uri);
            }

            // EnrichedSkill 생성
            const enriched: EnrichedSkill = {
                // ESCO 기본 정보 (있으면 사용, 없으면 조직 데이터 사용)
                uri: orgSkill.esco_uri || orgSkill.custom_uri || `custom:${orgSkill.skill_id}`,
                label: baseSkill?.label || orgSkill.label_en,
                type: orgSkill.type,
                description: baseSkill?.description || `${orgSkill.label_ko} - ${orgSkill.label_en}`,

                // 조직 컨텍스트
                org_context: {
                    organization: orgData.organization.name,
                    enabler: enabler.name,
                    importance: orgSkill.importance,
                    target_proficiency: orgSkill.target_proficiency,
                    priority_rank: orgSkill.priority_rank,
                    korean_label: orgSkill.label_ko,
                    notes: orgSkill.notes,
                },

                // 매칭 타입
                match_type: orgSkill.match_type,
            };

            enrichedSkills.push(enriched);
        }
    }

    return enrichedSkills;
}

// ========== 유틸리티 함수 ==========

/**
 * URI로 스킬 찾기
 */
function findSkillByURI(skillsData: SkillsData, uri: string): Skill | null {
    for (const domain of Object.values(skillsData)) {
        const found = domain.find((skill: Skill) => skill.uri === uri);
        if (found) return found;
    }
    return null;
}

/**
 * Enabler별 스킬 필터링
 */
export function getSkillsByEnabler(
    enrichedSkills: EnrichedSkill[],
    enablerId: string
): EnrichedSkill[] {
    return enrichedSkills.filter((skill) => {
        const skillEnablerId = skill.org_context?.enabler
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
        return skillEnablerId === enablerId;
    });
}

/**
 * 중요도별 필터링
 */
export function getSkillsByImportance(
    enrichedSkills: EnrichedSkill[],
    minImportance: number = 1
): EnrichedSkill[] {
    return enrichedSkills.filter(
        (skill) => (skill.org_context?.importance || 0) >= minImportance
    );
}

/**
 * 우선순위 Top N 스킬
 */
export function getTopPrioritySkills(
    enrichedSkills: EnrichedSkill[],
    topN: number = 15
): EnrichedSkill[] {
    return enrichedSkills
        .sort(
            (a, b) =>
                (a.org_context?.priority_rank || 999) - (b.org_context?.priority_rank || 999)
        )
        .slice(0, topN);
}

/**
 * 매칭 타입별 필터링
 */
export function getSkillsByMatchType(
    enrichedSkills: EnrichedSkill[],
    matchType: 'exact' | 'approximate' | 'custom'
): EnrichedSkill[] {
    return enrichedSkills.filter((skill) => skill.match_type === matchType);
}

// ========== 통계 계산 ==========

/**
 * 조직 통계 계산
 */
export function calculateOrgStatistics(org: Organization) {
    const totalSkills = org.enablers.reduce((sum, enabler) => sum + enabler.skills.length, 0);

    const byEnabler = org.enablers.map((enabler) => ({
        id: enabler.id,
        name: enabler.name,
        count: enabler.skills.length,
        priority: enabler.priority,
    }));

    const byImportance = [1, 2, 3, 4, 5].map((level) => ({
        level,
        count: org.enablers
            .flatMap((e) => e.skills)
            .filter((s) => s.importance === level).length,
    }));

    const byMatchType = ['exact', 'approximate', 'custom'].map((type) => ({
        type,
        count: org.enablers
            .flatMap((e) => e.skills)
            .filter((s) => s.match_type === type).length,
    }));

    const byProficiency = ['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => ({
        level,
        count: org.enablers
            .flatMap((e) => e.skills)
            .filter((s) => s.target_proficiency === level).length,
    }));

    return {
        totalSkills,
        totalEnablers: org.enablers.length,
        byEnabler,
        byImportance,
        byMatchType,
        byProficiency,
    };
}

/**
 * Enabler 요약 정보 생성
 */
export function getEnablerSummary(enabler: Enabler) {
    const totalSkills = enabler.skills.length;
    const expertSkills = enabler.skills.filter((s) => s.target_proficiency === 'Expert').length;
    const highImportance = enabler.skills.filter((s) => s.importance >= 4).length;
    const customSkills = enabler.skills.filter((s) => s.match_type === 'custom').length;

    return {
        id: enabler.id,
        name: enabler.name,
        name_en: enabler.name_en,
        priority: enabler.priority,
        totalSkills,
        expertSkills,
        highImportance,
        customSkills,
    };
}
