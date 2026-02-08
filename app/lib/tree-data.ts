import type { EnrichedSkill, Enabler } from './types';

export interface TreeNode {
    name: string;
    attributes?: Record<string, any>;
    children?: TreeNode[];
    nodeSvgShape?: {
        shape: string;
        shapeProps: {
            r?: number;
            width?: number;
            height?: number;
            fill: string;
            stroke?: string;
            strokeWidth?: number;
        };
    };
}

export interface TreeData {
    name: string;
    attributes?: Record<string, any>;
    children: TreeNode[];
}

/**
 * Convert organization data to tree structure
 * Organization → Enablers → Skills
 */
export function createTreeData(
    organizationName: string,
    enablers: Enabler[],
    skills: EnrichedSkill[]
): TreeData {
    const enablerNodes: TreeNode[] = enablers.map(enabler => {
        // Get skills for this enabler
        const enablerSkills = skills.filter(
            skill => skill.org_context?.enabler === enabler.id
        );

        // Group skills by type
        const skillsByType = groupSkillsByType(enablerSkills);

        const children: TreeNode[] = [];

        // Create type nodes
        Object.entries(skillsByType).forEach(([type, typeSkills]) => {
            const typeNode: TreeNode = {
                name: type === 'knowledge' ? '지식 (Knowledge)' : '역량 (Skill/Competence)',
                attributes: {
                    type: 'skill-type',
                    count: typeSkills.length,
                },
                nodeSvgShape: {
                    shape: 'rect',
                    shapeProps: {
                        width: 20,
                        height: 20,
                        fill: type === 'knowledge' ? '#4ECDC4' : '#FFA500',
                        stroke: '#333',
                        strokeWidth: 1,
                    },
                },
                children: typeSkills.map(skill => createSkillNode(skill)),
            };
            children.push(typeNode);
        });

        return {
            name: enabler.name,
            attributes: {
                type: 'enabler',
                priority: enabler.priority,
                skillCount: enablerSkills.length,
                description: enabler.description,
            },
            nodeSvgShape: {
                shape: 'circle',
                shapeProps: {
                    r: 15,
                    fill: getPriorityColor(enabler.priority),
                    stroke: '#333',
                    strokeWidth: 2,
                },
            },
            children,
        };
    });

    return {
        name: organizationName,
        attributes: {
            type: 'organization',
            enablerCount: enablers.length,
            totalSkills: skills.length,
        },
        children: enablerNodes,
    };
}

/**
 * Create a skill node
 */
function createSkillNode(skill: EnrichedSkill): TreeNode {
    const importance = skill.org_context?.importance || 1;
    const proficiency = skill.org_context?.target_proficiency || 'Unknown';

    return {
        name: skill.org_context?.korean_label || skill.label,
        attributes: {
            type: 'skill',
            uri: skill.uri,
            englishLabel: skill.label,
            importance,
            proficiency,
            matchType: skill.match_type,
            priority: skill.org_context?.priority_rank,
        },
        nodeSvgShape: {
            shape: 'circle',
            shapeProps: {
                r: 8 + importance,
                fill: getImportanceColor(importance),
                stroke: getProficiencyColor(proficiency),
                strokeWidth: 2,
            },
        },
    };
}

/**
 * Group skills by type
 */
function groupSkillsByType(skills: EnrichedSkill[]): Record<string, EnrichedSkill[]> {
    const grouped: Record<string, EnrichedSkill[]> = {
        knowledge: [],
        'skill/competence': [],
    };

    skills.forEach(skill => {
        const type = skill.type || 'skill/competence';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(skill);
    });

    // Remove empty groups
    Object.keys(grouped).forEach(key => {
        if (grouped[key].length === 0) {
            delete grouped[key];
        }
    });

    return grouped;
}

/**
 * Get color by priority
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

/**
 * Get color by importance
 */
function getImportanceColor(importance: number): string {
    const colors: Record<number, string> = {
        5: '#FF6B6B',
        4: '#FFA500',
        3: '#FFD93D',
        2: '#6BCF7F',
        1: '#95E1D3',
    };
    return colors[importance] || '#4ECDC4';
}

/**
 * Get color by proficiency level
 */
function getProficiencyColor(proficiency: string): string {
    const colors: Record<string, string> = {
        'Expert': '#FF6B6B',
        'Advanced': '#FFA500',
        'Intermediate': '#FFD93D',
        'Beginner': '#95E1D3',
    };
    return colors[proficiency] || '#999';
}

/**
 * Search tree for nodes matching query
 */
export function searchTree(node: TreeNode, query: string): TreeNode[] {
    const results: TreeNode[] = [];
    const lowerQuery = query.toLowerCase();

    function traverse(n: TreeNode) {
        if (n.name.toLowerCase().includes(lowerQuery)) {
            results.push(n);
        }
        if (n.children) {
            n.children.forEach(traverse);
        }
    }

    traverse(node);
    return results;
}

/**
 * Get tree statistics
 */
export function getTreeStats(data: TreeData) {
    let totalNodes = 0;
    let skillNodes = 0;
    let enablerNodes = 0;
    let maxDepth = 0;

    function traverse(node: TreeNode | TreeData, depth: number = 0) {
        totalNodes++;
        maxDepth = Math.max(maxDepth, depth);

        if ('attributes' in node && node.attributes) {
            if (node.attributes.type === 'skill') {
                skillNodes++;
            } else if (node.attributes.type === 'enabler') {
                enablerNodes++;
            }
        }

        if ('children' in node && node.children) {
            node.children.forEach(child => traverse(child, depth + 1));
        }
    }

    traverse(data);

    return {
        totalNodes,
        skillNodes,
        enablerNodes,
        maxDepth,
    };
}
