
import { Skill, SkillType } from './types';

export interface ComparisonResult {
    domain1Id: string;
    domain2Id: string;
    domain1Name: string;
    domain2Name: string;

    // Skill Counts
    totalSkills1: number;
    totalSkills2: number;
    commonCount: number;
    uniqueCount1: number;
    uniqueCount2: number;

    // Skill Lists
    commonSkills: Skill[];
    uniqueSkills1: Skill[];
    uniqueSkills2: Skill[];

    // Statistics
    similarityScore: number; // Jaccard Similarity (0-1)
    typeDistribution1: Record<SkillType, number>;
    typeDistribution2: Record<SkillType, number>;
}

/**
 * Compare two sets of skills from different domains
 */
export function compareDomains(
    id1: string,
    name1: string,
    skills1: Skill[],
    id2: string,
    name2: string,
    skills2: Skill[]
): ComparisonResult {
    // Skills to Map for fast lookup (using label as key for matching conceptually similar skills)
    // Using lowercase label to match
    const map1 = new Map<string, Skill>();
    skills1.forEach(s => map1.set(s.label.toLowerCase(), s));

    const commonSkills: Skill[] = [];
    const uniqueSkills2: Skill[] = [];

    // Check skills2 against skills1
    skills2.forEach(s2 => {
        const key = s2.label.toLowerCase();
        if (map1.has(key)) {
            commonSkills.push(s2);
            map1.delete(key); // Remove from map1 to identify unique1 later
        } else {
            uniqueSkills2.push(s2);
        }
    });

    // Remaining in map1 are unique to domain 1
    const uniqueSkills1 = Array.from(map1.values());

    // Calculate Statistics
    const intersection = commonSkills.length;
    const union = uniqueSkills1.length + uniqueSkills2.length + intersection;
    const similarity = union === 0 ? 0 : intersection / union;

    return {
        domain1Id: id1,
        domain2Id: id2,
        domain1Name: name1,
        domain2Name: name2,

        totalSkills1: skills1.length,
        totalSkills2: skills2.length,
        commonCount: commonSkills.length,
        uniqueCount1: uniqueSkills1.length,
        uniqueCount2: uniqueSkills2.length,

        commonSkills: commonSkills.sort((a, b) => a.label.localeCompare(b.label)),
        uniqueSkills1: uniqueSkills1.sort((a, b) => a.label.localeCompare(b.label)),
        uniqueSkills2: uniqueSkills2.sort((a, b) => a.label.localeCompare(b.label)),

        similarityScore: similarity,
        typeDistribution1: calculateDetailedDistribution(skills1),
        typeDistribution2: calculateDetailedDistribution(skills2)
    };
}

function calculateDetailedDistribution(skills: Skill[]): Record<SkillType, number> {
    const dist: Record<SkillType, number> = {
        'knowledge': 0,
        'skill/competence': 0
    };

    skills.forEach(s => {
        if (s.type in dist) {
            dist[s.type]++;
        } else {
            // Fallback for unknown types if any
            dist['skill/competence']++;
        }
    });

    return dist;
}
