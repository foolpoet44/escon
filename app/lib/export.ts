import Papa from 'papaparse';
import type { Skill, EnrichedSkill, Enabler } from './types';

/**
 * 스킬 데이터를 CSV 형식으로 변환하여 다운로드
 */
export function exportToCSV(skills: Skill[], filename: string = 'skills.csv') {
    const csv = Papa.unparse(skills, {
        columns: ['uri', 'label', 'type', 'description'],
        header: true
    });

    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * 스킬 데이터를 JSON 형식으로 다운로드
 */
export function exportToJSON(skills: Skill[], filename: string = 'skills.json') {
    const json = JSON.stringify(skills, null, 2);
    downloadFile(json, filename, 'application/json;charset=utf-8;');
}

/**
 * 파일 다운로드 헬퍼 함수
 */
function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 통계 데이터를 CSV로 내보내기
 */
export function exportStatisticsToCSV(
    domainDistribution: { domain: string; count: number }[],
    filename: string = 'statistics.csv'
) {
    const csv = Papa.unparse(domainDistribution, {
        columns: ['domain', 'count'],
        header: true
    });

    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * 현재 날짜를 파일명에 사용할 형식으로 반환
 */
export function getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

/**
 * 도메인별로 그룹화된 데이터를 내보내기
 */
export function exportByDomain(
    skillsByDomain: Record<string, Skill[]>,
    format: 'csv' | 'json' = 'csv'
) {
    const dateStr = getDateString();

    Object.entries(skillsByDomain).forEach(([domain, skills]) => {
        const filename = `${domain}_skills_${dateStr}.${format}`;

        if (format === 'csv') {
            exportToCSV(skills, filename);
        } else {
            exportToJSON(skills, filename);
        }
    });
}

// ========== 조직 스킬 매칭 시스템용 내보내기 함수 ==========

/**
 * EnrichedSkill 배열을 CSV 친화적 형식으로 변환
 */
export function prepareSkillsForCSV(skills: EnrichedSkill[]) {
    return skills.map((skill) => ({
        URI: skill.uri,
        'Skill Name (EN)': skill.label,
        'Skill Name (KO)': skill.org_context?.korean_label || '',
        Type: skill.type,
        Description: skill.description || '',
        Organization: skill.org_context?.organization || '',
        Enabler: skill.org_context?.enabler || '',
        Importance: skill.org_context?.importance || '',
        'Target Proficiency': skill.org_context?.target_proficiency || '',
        'Priority Rank': skill.org_context?.priority_rank || '',
        'Match Type': skill.match_type || '',
        Notes: skill.org_context?.notes || '',
    }));
}

/**
 * Enabler 배열을 CSV 친화적 형식으로 변환
 */
export function prepareEnablersForCSV(enablers: Enabler[]) {
    return enablers.map((enabler) => ({
        ID: enabler.id,
        'Name (KO)': enabler.name,
        'Name (EN)': enabler.name_en,
        Description: enabler.description,
        Priority: enabler.priority,
        'Skill Count': enabler.skills.length,
        'Expert Skills': enabler.skills.filter((s) => s.target_proficiency === 'Expert').length,
        'High Importance': enabler.skills.filter((s) => s.importance >= 4).length,
    }));
}

/**
 * 통계 데이터를 CSV 친화적 형식으로 변환
 */
export function prepareStatsForCSV(stats: any) {
    const rows = [];

    // 총계
    rows.push({
        Category: 'Total',
        Metric: 'Total Skills',
        Value: stats.totalSkills,
    });
    rows.push({
        Category: 'Total',
        Metric: 'Total Enablers',
        Value: stats.totalEnablers,
    });

    // Enabler별
    stats.byEnabler?.forEach((item: any) => {
        rows.push({
            Category: 'By Enabler',
            Metric: item.name,
            Value: item.count,
        });
    });

    // 중요도별
    stats.byImportance?.forEach((item: any) => {
        rows.push({
            Category: 'By Importance',
            Metric: `Level ${item.level}`,
            Value: item.count,
        });
    });

    // 매칭 타입별
    stats.byMatchType?.forEach((item: any) => {
        rows.push({
            Category: 'By Match Type',
            Metric: item.type,
            Value: item.count,
        });
    });

    // 숙련도별
    stats.byProficiency?.forEach((item: any) => {
        rows.push({
            Category: 'By Proficiency',
            Metric: item.level,
            Value: item.count,
        });
    });

    return rows;
}

/**
 * EnrichedSkill 배열을 CSV로 내보내기
 */
export function exportEnrichedSkillsToCSV(skills: EnrichedSkill[], filename?: string) {
    const dateStr = getDateString();
    const finalFilename = filename || `org_skills_${dateStr}.csv`;
    const preparedData = prepareSkillsForCSV(skills);
    const csv = Papa.unparse(preparedData);
    downloadFile(csv, finalFilename, 'text/csv;charset=utf-8;');
}

/**
 * Enabler 배열을 CSV로 내보내기
 */
export function exportEnablersToCSV(enablers: Enabler[], filename?: string) {
    const dateStr = getDateString();
    const finalFilename = filename || `enablers_${dateStr}.csv`;
    const preparedData = prepareEnablersForCSV(enablers);
    const csv = Papa.unparse(preparedData);
    downloadFile(csv, finalFilename, 'text/csv;charset=utf-8;');
}

/**
 * 통계 데이터를 CSV로 내보내기
 */
export function exportOrgStatsToCSV(stats: any, filename?: string) {
    const dateStr = getDateString();
    const finalFilename = filename || `org_statistics_${dateStr}.csv`;
    const preparedData = prepareStatsForCSV(stats);
    const csv = Papa.unparse(preparedData);
    downloadFile(csv, finalFilename, 'text/csv;charset=utf-8;');
}

