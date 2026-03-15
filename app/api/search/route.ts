import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { SkillsData, Skill, DomainKey } from '../../lib/types';

type FlatSkill = Skill & {
  id: string;
  domain: DomainKey[];
};

const SMART_FACTORY_DOMAIN_BOOSTS: Record<DomainKey, number> = {
  manufacturing: 15,
  integration: 12,
  control: 10,
  safety: 8,
  perception: 6,
  robotics: 6,
  mechatronics: 5,
  manipulation: 4,
  navigation: 3,
  ai_ml: 2,
};

const SMART_FACTORY_KEYWORDS: Array<{ term: string; weight: number }> = [
  { term: 'plc', weight: 22 },
  { term: 'programmable logic controller', weight: 22 },
  { term: 'scada', weight: 20 },
  { term: 'mes', weight: 18 },
  { term: 'opc ua', weight: 16 },
  { term: 'opcu', weight: 16 },
  { term: 'iiot', weight: 14 },
  { term: 'industrial iot', weight: 14 },
  { term: 'fieldbus', weight: 12 },
  { term: 'modbus', weight: 12 },
  { term: 'profibus', weight: 12 },
  { term: 'profinet', weight: 12 },
  { term: 'ethercat', weight: 12 },
  { term: 'industrial ethernet', weight: 10 },
  { term: 'motion control', weight: 10 },
  { term: 'servo', weight: 10 },
  { term: 'robot cell', weight: 12 },
  { term: 'cell integration', weight: 12 },
  { term: 'line integration', weight: 12 },
  { term: 'automation', weight: 8 },
  { term: 'industrial automation', weight: 10 },
  { term: 'vision inspection', weight: 10 },
  { term: 'machine vision', weight: 10 },
  { term: 'quality control', weight: 8 },
  { term: 'safety plc', weight: 10 },
  { term: 'functional safety', weight: 8 },
  { term: 'risk assessment', weight: 6 },
  { term: 'predictive maintenance', weight: 8 },
  { term: 'condition monitoring', weight: 8 },
  { term: 'digital twin', weight: 6 },
  { term: 'asset tracking', weight: 6 },
];

const DATA_PATH = path.join(process.cwd(), 'public', 'data', 'skills.json');
let cachedData: SkillsData | null = null;

async function loadSkillsData(): Promise<SkillsData> {
  if (cachedData) return cachedData;
  const raw = await readFile(DATA_PATH, 'utf-8');
  cachedData = JSON.parse(raw) as SkillsData;
  return cachedData;
}

function flattenSkills(data: SkillsData): FlatSkill[] {
  const flat: FlatSkill[] = [];
  (Object.keys(data) as DomainKey[]).forEach((domain) => {
    const list = data[domain] || [];
    list.forEach((skill) => {
      flat.push({
        ...skill,
        id: skill.uri || `${domain}:${skill.label}`,
        domain: [domain],
      });
    });
  });
  return flat;
}

interface SearchFilters {
  domains?: DomainKey[];
  types?: Array<Skill['type']>;
  smartFactoryFocus?: boolean;
}

function calculateSmartFactoryBoost(skill: FlatSkill): number {
  const haystack = `${skill.label} ${skill.description}`.toLowerCase();
  let score = 0;

  SMART_FACTORY_KEYWORDS.forEach(({ term, weight }) => {
    if (haystack.includes(term)) {
      score += weight;
    }
  });

  skill.domain.forEach((domain) => {
    score += SMART_FACTORY_DOMAIN_BOOSTS[domain] || 0;
  });

  return score;
}

function calculateRelevance(query: string, skill: FlatSkill, useSmartFactoryFocus: boolean): number {
  const queryLower = query.toLowerCase();
  const labelLower = skill.label.toLowerCase();
  const descriptionLower = skill.description.toLowerCase();
  let score = 0;

  if (labelLower === queryLower) {
    score += 100;
  } else if (labelLower.startsWith(queryLower)) {
    score += 80;
  } else if (labelLower.includes(queryLower)) {
    score += 60;
  }

  if (descriptionLower.includes(queryLower)) {
    score += 20;
  }

  if (skill.type.toLowerCase().includes(queryLower)) {
    score += 15;
  }

  if (skill.domain.some((d) => d.toLowerCase().includes(queryLower))) {
    score += 10;
  }

  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  const matchCount = queryWords.filter((word) =>
    labelLower.includes(word) || descriptionLower.includes(word)
  ).length;
  score += matchCount * 8;

  if (useSmartFactoryFocus) {
    score += calculateSmartFactoryBoost(skill);
  }

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const { query, filters = {}, limit = 20, offset = 0 } = await req.json();
    const useSmartFactoryFocus = Boolean(filters.smartFactoryFocus);
    const data = await loadSkillsData();
    let results = flattenSkills(data);

    if (query && query.trim()) {
      const queryLower = query.toLowerCase();
      results = results
        .map((skill) => ({
          ...skill,
          _relevance: calculateRelevance(queryLower, skill, useSmartFactoryFocus),
        }))
        .filter((skill: any) => skill._relevance > 0)
        .sort((a: any, b: any) => b._relevance - a._relevance);
    } else if (useSmartFactoryFocus) {
      results = results
        .map((skill) => ({
          ...skill,
          _relevance: calculateSmartFactoryBoost(skill),
        }))
        .sort((a: any, b: any) => b._relevance - a._relevance);
    }

    if (filters.domains && filters.domains.length > 0) {
      results = results.filter((skill) =>
        skill.domain.some((d) => filters.domains?.includes(d))
      );
    }

    if (filters.types && filters.types.length > 0) {
      results = results.filter((skill) =>
        filters.types?.includes(skill.type)
      );
    }

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    const facets = {
      domains: {} as Record<string, number>,
      types: {} as Record<string, number>,
    };

    const fullList = flattenSkills(data);
    fullList.forEach((skill) => {
      skill.domain.forEach((d) => {
        facets.domains[d] = (facets.domains[d] || 0) + 1;
      });
      facets.types[skill.type] = (facets.types[skill.type] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        facets,
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const data = await loadSkillsData();
  const fullList = flattenSkills(data);
  const facets = {
    domains: {} as Record<string, number>,
    types: {} as Record<string, number>,
  };

  fullList.forEach((skill) => {
    skill.domain.forEach((d) => {
      facets.domains[d] = (facets.domains[d] || 0) + 1;
    });
    facets.types[skill.type] = (facets.types[skill.type] || 0) + 1;
  });

  return NextResponse.json({
    skills: fullList,
    total: fullList.length,
    facets,
  });
}
