import Papa from 'papaparse';
import { Skill } from './types';

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
