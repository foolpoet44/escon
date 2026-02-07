import { Skill, SkillsData, DomainKey } from './types';
import { DOMAINS } from './constants';

/**
 * 트리 노드 타입 (react-d3-tree 호환)
 */
export interface TreeNode {
    name: string;
    attributes?: {
        type?: string;
        count?: number;
        description?: string;
        uri?: string;
    };
    children?: TreeNode[];
}

/**
 * 전체 도메인과 스킬을 계층적 트리로 변환
 */
export function createDomainSkillTree(data: SkillsData): TreeNode {
    const children: TreeNode[] = [];

    DOMAINS.forEach(domain => {
        const skills = data[domain.key] || [];
        const knowledgeSkills = skills.filter(s => s.type === 'knowledge');
        const competenceSkills = skills.filter(s => s.type === 'skill/competence');

        const domainNode: TreeNode = {
            name: `${domain.icon} ${domain.name}`,
            attributes: {
                type: 'domain',
                count: skills.length
            },
            children: []
        };

        // Knowledge 스킬 그룹
        if (knowledgeSkills.length > 0) {
            domainNode.children!.push({
                name: `🧠 Knowledge (${knowledgeSkills.length})`,
                attributes: {
                    type: 'skill-group',
                    count: knowledgeSkills.length
                },
                children: knowledgeSkills.slice(0, 20).map(skill => ({
                    name: skill.label,
                    attributes: {
                        type: 'knowledge',
                        description: skill.description,
                        uri: skill.uri
                    }
                }))
            });
        }

        // Competence 스킬 그룹
        if (competenceSkills.length > 0) {
            domainNode.children!.push({
                name: `⚡ Competence (${competenceSkills.length})`,
                attributes: {
                    type: 'skill-group',
                    count: competenceSkills.length
                },
                children: competenceSkills.slice(0, 20).map(skill => ({
                    name: skill.label,
                    attributes: {
                        type: 'skill/competence',
                        description: skill.description,
                        uri: skill.uri
                    }
                }))
            });
        }

        children.push(domainNode);
    });

    return {
        name: '🎯 ESCO Skills Ontology',
        attributes: {
            type: 'root',
            count: Object.values(data).reduce((sum, skills) => sum + skills.length, 0)
        },
        children
    };
}

/**
 * 특정 도메인의 스킬 트리 생성
 */
export function createSingleDomainTree(data: SkillsData, domainKey: DomainKey): TreeNode {
    const domain = DOMAINS.find(d => d.key === domainKey);
    const skills = data[domainKey] || [];

    if (!domain) {
        return {
            name: 'Unknown Domain',
            attributes: { type: 'domain' }
        };
    }

    const knowledgeSkills = skills.filter(s => s.type === 'knowledge');
    const competenceSkills = skills.filter(s => s.type === 'skill/competence');

    const children: TreeNode[] = [];

    // Knowledge 스킬 그룹
    if (knowledgeSkills.length > 0) {
        children.push({
            name: `🧠 Knowledge Skills (${knowledgeSkills.length})`,
            attributes: {
                type: 'skill-group',
                count: knowledgeSkills.length
            },
            children: knowledgeSkills.map(skill => ({
                name: skill.label,
                attributes: {
                    type: 'knowledge',
                    description: skill.description,
                    uri: skill.uri
                }
            }))
        });
    }

    // Competence 스킬 그룹
    if (competenceSkills.length > 0) {
        children.push({
            name: `⚡ Competence Skills (${competenceSkills.length})`,
            attributes: {
                type: 'skill-group',
                count: competenceSkills.length
            },
            children: competenceSkills.map(skill => ({
                name: skill.label,
                attributes: {
                    type: 'skill/competence',
                    description: skill.description,
                    uri: skill.uri
                }
            }))
        });
    }

    return {
        name: `${domain.icon} ${domain.name}`,
        attributes: {
            type: 'domain',
            count: skills.length
        },
        children
    };
}

/**
 * 스킬 타입별 트리 생성
 */
export function createSkillTypeTree(data: SkillsData): TreeNode {
    const allSkills: Skill[] = [];

    Object.values(data).forEach(skills => {
        allSkills.push(...skills);
    });

    const knowledgeSkills = allSkills.filter(s => s.type === 'knowledge');
    const competenceSkills = allSkills.filter(s => s.type === 'skill/competence');

    // 도메인별로 그룹화
    const knowledgeByDomain = new Map<DomainKey, Skill[]>();
    const competenceByDomain = new Map<DomainKey, Skill[]>();

    DOMAINS.forEach(domain => {
        const domainSkills = data[domain.key] || [];
        knowledgeByDomain.set(
            domain.key,
            domainSkills.filter(s => s.type === 'knowledge')
        );
        competenceByDomain.set(
            domain.key,
            domainSkills.filter(s => s.type === 'skill/competence')
        );
    });

    const children: TreeNode[] = [];

    // Knowledge 브랜치
    const knowledgeChildren: TreeNode[] = [];
    DOMAINS.forEach(domain => {
        const skills = knowledgeByDomain.get(domain.key) || [];
        if (skills.length > 0) {
            knowledgeChildren.push({
                name: `${domain.icon} ${domain.name} (${skills.length})`,
                attributes: {
                    type: 'domain',
                    count: skills.length
                },
                children: skills.slice(0, 15).map(skill => ({
                    name: skill.label,
                    attributes: {
                        type: 'knowledge',
                        description: skill.description,
                        uri: skill.uri
                    }
                }))
            });
        }
    });

    children.push({
        name: `🧠 Knowledge Skills (${knowledgeSkills.length})`,
        attributes: {
            type: 'skill-type',
            count: knowledgeSkills.length
        },
        children: knowledgeChildren
    });

    // Competence 브랜치
    const competenceChildren: TreeNode[] = [];
    DOMAINS.forEach(domain => {
        const skills = competenceByDomain.get(domain.key) || [];
        if (skills.length > 0) {
            competenceChildren.push({
                name: `${domain.icon} ${domain.name} (${skills.length})`,
                attributes: {
                    type: 'domain',
                    count: skills.length
                },
                children: skills.slice(0, 15).map(skill => ({
                    name: skill.label,
                    attributes: {
                        type: 'skill/competence',
                        description: skill.description,
                        uri: skill.uri
                    }
                }))
            });
        }
    });

    children.push({
        name: `⚡ Competence Skills (${competenceSkills.length})`,
        attributes: {
            type: 'skill-type',
            count: competenceSkills.length
        },
        children: competenceChildren
    });

    return {
        name: '🎯 Skills by Type',
        attributes: {
            type: 'root',
            count: allSkills.length
        },
        children
    };
}

/**
 * 검색어로 필터링된 트리 생성
 */
export function createFilteredTree(
    data: SkillsData,
    searchTerm: string
): TreeNode {
    const lowerSearch = searchTerm.toLowerCase();
    const filteredData: SkillsData = {} as SkillsData;

    DOMAINS.forEach(domain => {
        const skills = data[domain.key] || [];
        const filtered = skills.filter(skill =>
            skill.label.toLowerCase().includes(lowerSearch) ||
            (skill.description && skill.description.toLowerCase().includes(lowerSearch))
        );

        if (filtered.length > 0) {
            filteredData[domain.key] = filtered;
        }
    });

    return createDomainSkillTree(filteredData);
}
