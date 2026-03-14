import type { Organization, SkillsData, Skill, OrganizationSkillMapping } from './types';

/**
 * ESCO URI 검증 결과
 */
export interface ValidationResult {
    totalSkills: number;
    exactMatch: number;
    approximateMatch: number;
    customSkill: number;
    verifiedUris: number;
    unverifiedUris: number;
    details: SkillValidationDetail[];
    qualityScore: number;
}

export interface SkillValidationDetail {
    skillId: string;
    labelKo: string;
    labelEn: string;
    escoUri: string | null;
    matchType: string;
    uriVerified: boolean;
    matchedEscoSkill?: Skill;
}

/**
 * 조직 데이터의 ESCO URI를 skills.json의 실제 URI와 대조 검증
 *
 * 현장 엔지니어를 위한 데이터 신뢰성 지표:
 * - 정확 매칭(exact): ESCO URI가 실제 존재하고 정확히 일치
 * - 유사 매칭(approximate): ESCO URI가 매핑되었으나 별도 확인 필요
 * - 커스텀(custom): ESCO에 없는 도메인 특화 스킬
 */
export function validateOrganizationData(
    orgData: Organization,
    skillsData: SkillsData
): ValidationResult {
    const allEscoUris = new Set<string>();

    // skills.json에서 모든 URI 수집
    for (const domain of Object.values(skillsData)) {
        for (const skill of domain as Skill[]) {
            allEscoUris.add(skill.uri);
        }
    }

    const details: SkillValidationDetail[] = [];
    let exactMatch = 0;
    let approximateMatch = 0;
    let customSkill = 0;
    let verifiedUris = 0;
    let unverifiedUris = 0;

    for (const enabler of orgData.enablers) {
        for (const skill of enabler.skills) {
            const uriVerified = skill.esco_uri ? allEscoUris.has(skill.esco_uri) : false;
            const matchedSkill = skill.esco_uri ? findSkillByUri(skillsData, skill.esco_uri) : undefined;

            if (skill.match_type === 'exact') exactMatch++;
            else if (skill.match_type === 'approximate') approximateMatch++;
            else customSkill++;

            if (skill.esco_uri) {
                if (uriVerified) verifiedUris++;
                else unverifiedUris++;
            }

            details.push({
                skillId: skill.skill_id,
                labelKo: skill.label_ko,
                labelEn: skill.label_en,
                escoUri: skill.esco_uri,
                matchType: skill.match_type,
                uriVerified,
                matchedEscoSkill: matchedSkill,
            });
        }
    }

    const totalSkills = details.length;
    const qualityScore = totalSkills > 0
        ? Math.round(((exactMatch + approximateMatch) / totalSkills) * 100)
        : 0;

    return {
        totalSkills,
        exactMatch,
        approximateMatch,
        customSkill,
        verifiedUris,
        unverifiedUris,
        details,
        qualityScore,
    };
}

function findSkillByUri(skillsData: SkillsData, uri: string): Skill | undefined {
    for (const domain of Object.values(skillsData)) {
        const found = (domain as Skill[]).find(s => s.uri === uri);
        if (found) return found;
    }
    return undefined;
}

/**
 * 조직 데이터 스키마 기본 검증
 * 필수 필드 존재 여부, 값 범위 확인
 */
export interface SchemaValidationError {
    path: string;
    message: string;
}

export function validateOrganizationSchema(data: unknown): SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    if (!data || typeof data !== 'object') {
        errors.push({ path: '', message: '데이터가 객체가 아닙니다' });
        return errors;
    }

    const org = data as Record<string, unknown>;

    if (!org.organization || typeof org.organization !== 'object') {
        errors.push({ path: 'organization', message: '조직 정보가 없습니다' });
    } else {
        const info = org.organization as Record<string, unknown>;
        if (!info.id) errors.push({ path: 'organization.id', message: 'ID가 필요합니다' });
        if (!info.name) errors.push({ path: 'organization.name', message: '조직명이 필요합니다' });
    }

    if (!Array.isArray(org.enablers)) {
        errors.push({ path: 'enablers', message: 'enablers 배열이 필요합니다' });
    } else {
        (org.enablers as Record<string, unknown>[]).forEach((enabler, ei) => {
            if (!enabler.id) errors.push({ path: `enablers[${ei}].id`, message: 'Enabler ID가 필요합니다' });
            if (!enabler.name) errors.push({ path: `enablers[${ei}].name`, message: 'Enabler 이름이 필요합니다' });

            if (!Array.isArray(enabler.skills)) {
                errors.push({ path: `enablers[${ei}].skills`, message: 'skills 배열이 필요합니다' });
            } else {
                (enabler.skills as Record<string, unknown>[]).forEach((skill, si) => {
                    const prefix = `enablers[${ei}].skills[${si}]`;
                    if (!skill.skill_id) errors.push({ path: `${prefix}.skill_id`, message: 'skill_id가 필요합니다' });
                    if (!skill.label_ko) errors.push({ path: `${prefix}.label_ko`, message: '한국어 라벨이 필요합니다' });
                    if (!skill.label_en) errors.push({ path: `${prefix}.label_en`, message: '영어 라벨이 필요합니다' });

                    const importance = skill.importance as number;
                    if (!importance || importance < 1 || importance > 5) {
                        errors.push({ path: `${prefix}.importance`, message: '중요도는 1-5 범위여야 합니다' });
                    }

                    const validProficiencies = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
                    if (!validProficiencies.includes(skill.target_proficiency as string)) {
                        errors.push({ path: `${prefix}.target_proficiency`, message: '유효한 숙련도 레벨이 아닙니다' });
                    }

                    const validMatchTypes = ['exact', 'approximate', 'custom'];
                    if (!validMatchTypes.includes(skill.match_type as string)) {
                        errors.push({ path: `${prefix}.match_type`, message: '유효한 매칭 타입이 아닙니다' });
                    }
                });
            }
        });
    }

    return errors;
}
