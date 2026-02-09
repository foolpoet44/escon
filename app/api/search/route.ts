import { NextRequest, NextResponse } from 'next/server';

const SKILLS_DATA = [
  { id: 'python', name: 'Python', category: 'programming', domain: ['ai_ml', 'robotics'], level: 'intermediate' },
  { id: 'ros', name: 'ROS (Robot Operating System)', category: 'robotics', domain: ['robotics', 'navigation'], level: 'advanced' },
  { id: 'opencv', name: 'OpenCV', category: 'computer_vision', domain: ['perception', 'ai_ml'], level: 'intermediate' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai_framework', domain: ['ai_ml'], level: 'advanced' },
  { id: 'pytorch', name: 'PyTorch', category: 'ai_framework', domain: ['ai_ml'], level: 'advanced' },
  { id: 'cad', name: 'CAD Design', category: 'design', domain: ['manufacturing', 'mechatronics'], level: 'intermediate' },
  { id: 'plc', name: 'PLC Programming', category: 'control', domain: ['control', 'manufacturing'], level: 'intermediate' },
  { id: 'slam', name: 'SLAM', category: 'navigation', domain: ['navigation', 'robotics'], level: 'expert' },
  { id: 'kinematics', name: 'Robot Kinematics', category: 'robotics', domain: ['robotics', 'manipulation'], level: 'advanced' },
  { id: 'safety', name: 'Functional Safety', category: 'safety', domain: ['safety', 'integration'], level: 'intermediate' },
  { id: 'machine_learning', name: 'Machine Learning', category: 'ai_ml', domain: ['ai_ml'], level: 'advanced' },
  { id: 'deep_learning', name: 'Deep Learning', category: 'ai_ml', domain: ['ai_ml'], level: 'expert' },
  { id: 'computer_vision', name: 'Computer Vision', category: 'perception', domain: ['perception', 'ai_ml'], level: 'advanced' },
  { id: 'natural_language_processing', name: 'Natural Language Processing', category: 'ai_ml', domain: ['ai_ml'], level: 'expert' },
  { id: 'reinforcement_learning', name: 'Reinforcement Learning', category: 'ai_ml', domain: ['ai_ml'], level: 'expert' },
  { id: 'motion_planning', name: 'Motion Planning', category: 'robotics', domain: ['robotics', 'navigation'], level: 'advanced' },
  { id: 'control_systems', name: 'Control Systems', category: 'control', domain: ['control', 'robotics'], level: 'advanced' },
  { id: 'sensor_fusion', name: 'Sensor Fusion', category: 'perception', domain: ['perception', 'robotics'], level: 'advanced' },
  { id: 'path_planning', name: 'Path Planning', category: 'navigation', domain: ['navigation', 'robotics'], level: 'intermediate' },
  { id: 'manipulator_design', name: 'Manipulator Design', category: 'robotics', domain: ['robotics', 'manipulation'], level: 'advanced' },
];

interface SearchFilters {
  domains?: string[];
  categories?: string[];
  levels?: string[];
}

function calculateRelevance(query: string, skill: typeof SKILLS_DATA[0]): number {
  const queryLower = query.toLowerCase();
  const nameLower = skill.name.toLowerCase();
  let score = 0;

  if (nameLower === queryLower) {
    score += 100;
  } else if (nameLower.startsWith(queryLower)) {
    score += 80;
  } else if (nameLower.includes(queryLower)) {
    score += 60;
  }

  if (skill.category.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  if (skill.domain.some(d => d.toLowerCase().includes(queryLower))) {
    score += 20;
  }

  const queryWords = queryLower.split(/\s+/);
  const matchCount = queryWords.filter(word => 
    nameLower.includes(word) || 
    skill.category.toLowerCase().includes(word)
  ).length;
  score += matchCount * 10;

  return score;
}

export async function POST(req: NextRequest) {
  try {
    const { query, filters = {}, limit = 20, offset = 0 } = await req.json();

    let results = [...SKILLS_DATA];

    if (query && query.trim()) {
      const queryLower = query.toLowerCase();
      results = results.map(skill => ({
        ...skill,
        _relevance: calculateRelevance(queryLower, skill),
      })).filter((skill: any) => skill._relevance > 0)
        .sort((a: any, b: any) => b._relevance - a._relevance);
    }

    if (filters.domains && filters.domains.length > 0) {
      results = results.filter(skill => 
        skill.domain.some(d => filters.domains.includes(d))
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(skill => 
        filters.categories.includes(skill.category)
      );
    }

    if (filters.levels && filters.levels.length > 0) {
      results = results.filter(skill => 
        filters.levels.includes(skill.level)
      );
    }

    const total = results.length;
    const paginatedResults = results.slice(offset, offset + limit);

    const facets = {
      domains: {} as Record<string, number>,
      categories: {} as Record<string, number>,
      levels: {} as Record<string, number>,
    };

    SKILLS_DATA.forEach(skill => {
      skill.domain.forEach(d => {
        facets.domains[d] = (facets.domains[d] || 0) + 1;
      });
      facets.categories[skill.category] = (facets.categories[skill.category] || 0) + 1;
      facets.levels[skill.level] = (facets.levels[skill.level] || 0) + 1;
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
  const facets = {
    domains: {} as Record<string, number>,
    categories: {} as Record<string, number>,
    levels: {} as Record<string, number>,
  };

  SKILLS_DATA.forEach(skill => {
    skill.domain.forEach(d => {
      facets.domains[d] = (facets.domains[d] || 0) + 1;
    });
    facets.categories[skill.category] = (facets.categories[skill.category] || 0) + 1;
    facets.levels[skill.level] = (facets.levels[skill.level] || 0) + 1;
  });

  return NextResponse.json({
    skills: SKILLS_DATA,
    total: SKILLS_DATA.length,
    facets,
  });
}
