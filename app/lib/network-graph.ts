import { Skill, SkillsData, DomainKey } from './types';
import { DOMAINS } from './constants';

/**
 * 네트워크 그래프 노드 타입
 */
export interface GraphNode {
    id: string;
    label: string;
    type: 'skill' | 'domain';
    skillType?: 'knowledge' | 'skill/competence';
    domain?: DomainKey;
    color?: string;
    size?: number;
}

/**
 * 네트워크 그래프 링크 타입
 */
export interface GraphLink {
    source: string;
    target: string;
    value?: number;
}

/**
 * 네트워크 그래프 데이터 타입
 */
export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

/**
 * 스킬 데이터를 네트워크 그래프 데이터로 변환
 * @param data - 전체 스킬 데이터
 * @param selectedDomains - 선택된 도메인 (비어있으면 모든 도메인)
 * @param maxSkillsPerDomain - 도메인당 최대 스킬 수 (성능 최적화)
 */
export function createNetworkGraphData(
    data: SkillsData,
    selectedDomains: DomainKey[] = [],
    maxSkillsPerDomain: number = 50
): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    const nodeIds = new Set<string>();

    // 선택된 도메인 또는 모든 도메인
    const domainsToProcess = selectedDomains.length > 0
        ? selectedDomains
        : DOMAINS.map(d => d.key);

    // 도메인 노드 추가
    domainsToProcess.forEach(domainKey => {
        const domain = DOMAINS.find(d => d.key === domainKey);
        if (!domain) return;

        const domainNodeId = `domain-${domainKey}`;
        nodes.push({
            id: domainNodeId,
            label: domain.name,
            type: 'domain',
            color: domain.color,
            size: 20
        });
        nodeIds.add(domainNodeId);
    });

    // 스킬 노드 및 링크 추가
    domainsToProcess.forEach(domainKey => {
        const skills = data[domainKey] || [];
        const domain = DOMAINS.find(d => d.key === domainKey);
        if (!domain) return;

        // 성능 최적화: 도메인당 최대 스킬 수 제한
        const limitedSkills = skills.slice(0, maxSkillsPerDomain);

        limitedSkills.forEach(skill => {
            const skillNodeId = skill.uri;

            // 스킬 노드가 아직 추가되지 않았으면 추가
            if (!nodeIds.has(skillNodeId)) {
                nodes.push({
                    id: skillNodeId,
                    label: skill.label,
                    type: 'skill',
                    skillType: skill.type,
                    domain: domainKey,
                    color: skill.type === 'knowledge' ? '#98D8C8' : '#667eea',
                    size: 8
                });
                nodeIds.add(skillNodeId);
            }

            // 도메인-스킬 링크 추가
            links.push({
                source: `domain-${domainKey}`,
                target: skillNodeId,
                value: 1
            });
        });
    });

    // 공통 스킬 찾기 (여러 도메인에 속한 스킬)
    if (domainsToProcess.length > 1) {
        const skillToDomains = new Map<string, Set<DomainKey>>();

        domainsToProcess.forEach(domainKey => {
            const skills = data[domainKey] || [];
            skills.slice(0, maxSkillsPerDomain).forEach(skill => {
                if (!skillToDomains.has(skill.uri)) {
                    skillToDomains.set(skill.uri, new Set());
                }
                skillToDomains.get(skill.uri)!.add(domainKey);
            });
        });

        // 공통 스킬에 대한 추가 링크 생성
        skillToDomains.forEach((domains, skillUri) => {
            if (domains.size > 1) {
                // 이 스킬은 여러 도메인에 속함
                const domainArray = Array.from(domains);
                for (let i = 0; i < domainArray.length; i++) {
                    for (let j = i + 1; j < domainArray.length; j++) {
                        // 이미 도메인-스킬 링크가 있으므로, 
                        // 여기서는 스킬의 크기를 증가시켜 중요도 표시
                        const node = nodes.find(n => n.id === skillUri);
                        if (node) {
                            node.size = (node.size || 8) + 3;
                            node.color = '#F6AD55'; // 공통 스킬은 주황색
                        }
                    }
                }
            }
        });
    }

    return { nodes, links };
}

/**
 * 특정 도메인의 스킬 네트워크 생성
 * 스킬 간 유사성을 기반으로 링크 생성 (설명 텍스트 유사도)
 */
export function createDomainSkillNetwork(
    data: SkillsData,
    domainKey: DomainKey,
    maxSkills: number = 100
): GraphData {
    const skills = (data[domainKey] || []).slice(0, maxSkills);
    const domain = DOMAINS.find(d => d.key === domainKey);

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 도메인 노드
    nodes.push({
        id: `domain-${domainKey}`,
        label: domain?.name || domainKey,
        type: 'domain',
        color: domain?.color || '#667eea',
        size: 25
    });

    // 스킬 노드
    skills.forEach(skill => {
        nodes.push({
            id: skill.uri,
            label: skill.label,
            type: 'skill',
            skillType: skill.type,
            domain: domainKey,
            color: skill.type === 'knowledge' ? '#98D8C8' : '#667eea',
            size: 10
        });

        // 도메인-스킬 링크
        links.push({
            source: `domain-${domainKey}`,
            target: skill.uri,
            value: 2
        });
    });

    // 스킬 간 유사성 링크 (간단한 키워드 매칭)
    for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
            const similarity = calculateTextSimilarity(
                skills[i].label + ' ' + (skills[i].description || ''),
                skills[j].label + ' ' + (skills[j].description || '')
            );

            // 유사도가 일정 수준 이상이면 링크 생성
            if (similarity > 0.3) {
                links.push({
                    source: skills[i].uri,
                    target: skills[j].uri,
                    value: similarity
                });
            }
        }
    }

    return { nodes, links };
}

/**
 * 간단한 텍스트 유사도 계산 (Jaccard 유사도)
 */
function calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set(
        Array.from(words1).filter(word => words2.has(word))
    );
    const union = new Set(Array.from(words1).concat(Array.from(words2)));

    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 스킬 타입별 네트워크 생성
 */
export function createSkillTypeNetwork(data: SkillsData): GraphData {
    const nodes: GraphNode[] = [
        {
            id: 'knowledge',
            label: 'Knowledge Skills',
            type: 'domain',
            color: '#98D8C8',
            size: 30
        },
        {
            id: 'competence',
            label: 'Competence Skills',
            type: 'domain',
            color: '#667eea',
            size: 30
        }
    ];

    const links: GraphLink[] = [];

    // 각 도메인에서 샘플 스킬 추출
    DOMAINS.forEach(domain => {
        const skills = data[domain.key] || [];
        const knowledgeSkills = skills.filter(s => s.type === 'knowledge').slice(0, 5);
        const competenceSkills = skills.filter(s => s.type === 'skill/competence').slice(0, 5);

        knowledgeSkills.forEach(skill => {
            nodes.push({
                id: skill.uri,
                label: skill.label,
                type: 'skill',
                skillType: 'knowledge',
                domain: domain.key,
                color: '#98D8C8',
                size: 8
            });

            links.push({
                source: 'knowledge',
                target: skill.uri,
                value: 1
            });
        });

        competenceSkills.forEach(skill => {
            nodes.push({
                id: skill.uri,
                label: skill.label,
                type: 'skill',
                skillType: 'skill/competence',
                domain: domain.key,
                color: '#667eea',
                size: 8
            });

            links.push({
                source: 'competence',
                target: skill.uri,
                value: 1
            });
        });
    });

    return { nodes, links };
}
