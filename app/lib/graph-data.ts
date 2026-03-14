import type { EnrichedSkill, Enabler } from './types';
import { ALGORITHM_CONFIG } from './constants';

export interface GraphNode {
    id: string;
    label: string;
    group: string; // enabler id
    type: 'skill' | 'enabler';
    importance?: number;
    proficiency?: string;
    color?: string;
    priority?: number;
    skillCount?: number;
    original?: EnrichedSkill | Enabler;
    description?: string;
}

export interface GraphLink {
    source: string;
    target: string;
    value: number; // strength of relationship
    type: 'enabler-skill' | 'skill-skill';
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

/**
 * Convert enriched skills and enablers to graph data structure
 */
export function createGraphData(
    skills: EnrichedSkill[],
    enablers: Enabler[]
): GraphData {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Add enabler nodes
    enablers.forEach(enabler => {
        nodes.push({
            id: enabler.id,
            label: enabler.name,
            group: enabler.id,
            type: 'enabler',
            color: getPriorityColor(enabler.priority),
            priority: enabler.priority,
            skillCount: enabler.skills.length,
            original: enabler,
            description: enabler.description
        });
    });

    // Add skill nodes and links to enablers
    skills.forEach(skill => {
        const skillId = skill.uri;
        const enablerId = skill.org_context?.enabler || 'unknown';

        // Add skill node
        nodes.push({
            id: skillId,
            label: skill.org_context?.korean_label || skill.label,
            group: enablerId,
            type: 'skill',
            importance: skill.org_context?.importance,
            proficiency: skill.org_context?.target_proficiency,
            original: skill,
            description: skill.description
        });

        // Add link from enabler to skill
        links.push({
            source: enablerId,
            target: skillId,
            value: skill.org_context?.importance || 1,
            type: 'enabler-skill',
        });
    });

    // Add skill-to-skill links based on shared characteristics
    // (e.g., same domain, similar type, related concepts)
    addSkillToSkillLinks(skills, links);

    return { nodes, links };
}

/**
 * Add links between related skills
 */
function addSkillToSkillLinks(skills: EnrichedSkill[], links: GraphLink[]) {
    for (let i = 0; i < skills.length; i++) {
        for (let j = i + 1; j < skills.length; j++) {
            const skill1 = skills[i];
            const skill2 = skills[j];

            // Link skills of the same type
            if (skill1.type === skill2.type) {
                const relationshipStrength = calculateRelationshipStrength(skill1, skill2);
                if (relationshipStrength > 0) {
                    links.push({
                        source: skill1.uri,
                        target: skill2.uri,
                        value: relationshipStrength,
                        type: 'skill-skill',
                    });
                }
            }
        }
    }
}

/**
 * Calculate relationship strength between two skills
 *
 * 가중치 근거:
 * - SAME_ENABLER (0.3): 동일 Enabler 소속은 업무적 연관성을 직접 반영
 * - SAME_TYPE (0.2): knowledge/competence 동일은 학습 경로 유사성 의미
 * - SIMILAR_IMPORTANCE (0.2): 중요도 차이 ≤1이면 유사한 역할 수준
 * - SAME_PROFICIENCY (0.3): 동일 목표 숙련도는 학습 단계 동기화 의미
 */
export interface RelationshipDetail {
    strength: number;
    factors: {
        sameEnabler: boolean;
        sameType: boolean;
        similarImportance: boolean;
        sameProficiency: boolean;
    };
}

export function calculateRelationshipStrengthWithDetail(
    skill1: EnrichedSkill,
    skill2: EnrichedSkill
): RelationshipDetail {
    const { WEIGHTS, RELATIONSHIP_THRESHOLD } = ALGORITHM_CONFIG;
    let strength = 0;

    const sameEnabler = skill1.org_context?.enabler === skill2.org_context?.enabler;
    if (sameEnabler) strength += WEIGHTS.SAME_ENABLER;

    const sameType = skill1.type === skill2.type;
    if (sameType) strength += WEIGHTS.SAME_TYPE;

    const imp1 = skill1.org_context?.importance || 0;
    const imp2 = skill2.org_context?.importance || 0;
    const similarImportance = Math.abs(imp1 - imp2) <= 1;
    if (similarImportance) strength += WEIGHTS.SIMILAR_IMPORTANCE;

    const sameProficiency = skill1.org_context?.target_proficiency === skill2.org_context?.target_proficiency;
    if (sameProficiency) strength += WEIGHTS.SAME_PROFICIENCY;

    return {
        strength: strength >= RELATIONSHIP_THRESHOLD ? strength : 0,
        factors: { sameEnabler, sameType, similarImportance, sameProficiency },
    };
}

function calculateRelationshipStrength(skill1: EnrichedSkill, skill2: EnrichedSkill): number {
    return calculateRelationshipStrengthWithDetail(skill1, skill2).strength;
}

/**
 * Filter graph data by enabler
 */
export function filterGraphByEnabler(
    graphData: GraphData,
    enablerIds: string[]
): GraphData {
    if (enablerIds.length === 0) return graphData;

    const filteredNodes = graphData.nodes.filter(node => {
        if (node.type === 'enabler') {
            return enablerIds.includes(node.id);
        }
        return enablerIds.includes(node.group);
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link =>
        nodeIds.has(link.source) && nodeIds.has(link.target)
    );

    return {
        nodes: filteredNodes,
        links: filteredLinks,
    };
}

/**
 * Get statistics about the graph
 */
export function getGraphStats(graphData: GraphData) {
    const skillNodes = graphData.nodes.filter(n => n.type === 'skill');
    const enablerNodes = graphData.nodes.filter(n => n.type === 'enabler');

    return {
        totalNodes: graphData.nodes.length,
        skillNodes: skillNodes.length,
        enablerNodes: enablerNodes.length,
        totalLinks: graphData.links.length,
        enablerSkillLinks: graphData.links.filter(l => l.type === 'enabler-skill').length,
        skillSkillLinks: graphData.links.filter(l => l.type === 'skill-skill').length,
        avgConnections: graphData.links.length / graphData.nodes.length,
    };
}

/**
 * Helper function to get color by priority
 */
function getPriorityColor(priority: number): string {
    const colors: Record<number, string> = {
        1: '#FF6B6B',
        2: '#FFA500',
        3: '#4ECDC4',
        4: '#45B7D1',
        5: '#95E1D3',
    };
    return colors[priority] || '#4ECDC4';
}
