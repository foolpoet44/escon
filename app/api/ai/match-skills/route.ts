import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ALGORITHM_CONFIG } from '@/app/lib/constants';

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * skills.json에서 실제 ESCO 스킬 데이터를 로드
 * 하드코딩된 10개 DB 대신 전체 1,640개 스킬 활용
 */
async function loadSkillsDatabase() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'skills.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * 전체 스킬 데이터에서 도메인별 대표 스킬 요약 생성
 * AI 프롬프트에 포함하여 실제 ESCO 데이터 기반 추천 유도
 */
function summarizeSkillsForPrompt(skillsData: Record<string, Array<{ label: string; type: string; uri: string }>>): string {
  const summaries: string[] = [];

  for (const [domain, skills] of Object.entries(skillsData)) {
    const topSkills = skills.slice(0, 15).map(s => `${s.label} (${s.type})`);
    summaries.push(`[${domain}] ${topSkills.join(', ')}`);
  }

  return summaries.join('\n');
}

/**
 * AI 응답의 기본 구조 검증
 */
function validateAIResponse(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['응답이 JSON 객체가 아닙니다'] };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.recommendedSkills)) {
    errors.push('recommendedSkills 배열이 없습니다');
  } else {
    for (const skill of obj.recommendedSkills as Record<string, unknown>[]) {
      if (!skill.skillName) errors.push('추천 스킬에 skillName이 없습니다');
      if (!skill.priority) errors.push('추천 스킬에 priority가 없습니다');
    }
  }

  if (!Array.isArray(obj.skillGap)) {
    errors.push('skillGap 배열이 없습니다');
  }

  if (!obj.careerPath || typeof obj.careerPath !== 'object') {
    errors.push('careerPath 객체가 없습니다');
  }

  return { valid: errors.length === 0, errors };
}

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, currentSkills = [] } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (typeof jobDescription !== 'string' || jobDescription.length > 10000) {
      return NextResponse.json(
        { error: 'Job description must be a string under 10,000 characters' },
        { status: 400 }
      );
    }

    // 실제 ESCO 스킬 데이터 로드
    const skillsData = await loadSkillsDatabase();
    const skillsSummary = summarizeSkillsForPrompt(skillsData);

    const prompt = `
당신은 ESCO(European Skills, Competences, and Occupations) 기반 스킬 매칭 전문가입니다.

아래는 현재 시스템에 등록된 실제 ESCO 스킬 목록입니다. 가능한 한 이 목록에서 스킬을 추천하세요:

${skillsSummary}

[직무 설명]
${jobDescription}

[현재 보유 스킬]
${currentSkills.length > 0 ? currentSkills.join(', ') : '없음'}

다음 형식으로 JSON 응답을 제공해주세요:

{
  "recommendedSkills": [
    {
      "skillName": "스킬 이름",
      "escoCode": "ESCO 코드 (있다면)",
      "category": "카테고리",
      "priority": "high/medium/low",
      "reason": "추천 이유 (한국어)"
    }
  ],
  "skillGap": [
    {
      "skillName": "부족한 스킬",
      "importance": "필수/권장/선택",
      "learningResources": ["학습 리소스 제안"]
    }
  ],
  "careerPath": {
    "shortTerm": ["단기 목표 (1-3개월)"],
    "midTerm": ["중기 목표 (3-6개월)"],
    "longTerm": ["장기 목표 (6-12개월)"]
  }
}

위 ESCO 스킬 목록에서 매칭되는 스킬을 우선 추천하고, 목록에 없는 경우 ESCO 표준을 참고하여 추천해주세요.
`;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: ALGORITHM_CONFIG.AI.MODEL,
      contents: prompt,
      config: {
        temperature: ALGORITHM_CONFIG.AI.TEMPERATURE,
        maxOutputTokens: ALGORITHM_CONFIG.AI.MAX_OUTPUT_TOKENS,
      },
    });

    const responseText = response.text || '';

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답에서 유효한 JSON을 찾을 수 없습니다');
    }

    let result: unknown;
    try {
      result = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('AI 응답 JSON 파싱 실패');
    }

    // 응답 구조 검증
    const validation = validateAIResponse(result);

    return NextResponse.json({
      success: true,
      data: result,
      validation: {
        valid: validation.valid,
        errors: validation.errors,
      },
      analysis: {
        timestamp: new Date().toISOString(),
        model: ALGORITHM_CONFIG.AI.MODEL,
        inputLength: jobDescription.length,
        dataSource: 'ESCO skills database (1,640 skills)',
        disclaimer: 'AI 생성 결과 — 전문가 검증 전 참고용',
      },
    });

  } catch (error) {
    console.error('AI Skill Matching Error:', error);
    return NextResponse.json(
      {
        error: '스킬 분석에 실패했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const skillsData = await loadSkillsDatabase();

    // 전체 스킬 수 계산
    let totalCount = 0;
    const domainSummary: Record<string, number> = {};
    for (const [domain, skills] of Object.entries(skillsData)) {
      const count = (skills as unknown[]).length;
      domainSummary[domain] = count;
      totalCount += count;
    }

    return NextResponse.json({
      total: totalCount,
      domains: domainSummary,
      source: 'ESCO skills database',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load skills database' },
      { status: 500 }
    );
  }
}
