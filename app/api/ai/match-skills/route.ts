/**
 * AI 스킬 매칭 API
 *
 * LLM 추상화 레이어(llm-client.ts)를 통해 호출하므로
 * 모델 제공자 변경 시 이 파일은 수정 불필요.
 * 환경변수 LLM_PROVIDER / LLM_MODEL 만 바꾸면 된다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { callLLMForJSON, LLMMessage } from '@/app/lib/llm-client';

export const dynamic = 'force-dynamic';

// 스킬 진단 흐름에서 참고하는 도메인별 기초 스킬 목록
const SKILLS_DATABASE = [
  { id: 'python', name: 'Python', category: 'programming', domain: ['ai_ml', 'robotics'] },
  { id: 'ros', name: 'ROS (Robot Operating System)', category: 'robotics', domain: ['robotics', 'navigation'] },
  { id: 'opencv', name: 'OpenCV', category: 'computer_vision', domain: ['perception', 'ai_ml'] },
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai_framework', domain: ['ai_ml'] },
  { id: 'pytorch', name: 'PyTorch', category: 'ai_framework', domain: ['ai_ml'] },
  { id: 'cad', name: 'CAD Design', category: 'design', domain: ['manufacturing', 'mechatronics'] },
  { id: 'plc', name: 'PLC Programming', category: 'control', domain: ['control', 'manufacturing'] },
  { id: 'slam', name: 'SLAM', category: 'navigation', domain: ['navigation', 'robotics'] },
  { id: 'kinematics', name: 'Robot Kinematics', category: 'robotics', domain: ['robotics', 'manipulation'] },
  { id: 'safety', name: 'Functional Safety', category: 'safety', domain: ['safety', 'integration'] },
];

interface SkillMatchResult {
  recommendedSkills: {
    skillName: string;
    escoCode?: string;
    category: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  skillGap: {
    skillName: string;
    importance: string;
    learningResources: string[];
  }[];
  careerPath: {
    shortTerm: string[];
    midTerm: string[];
    longTerm: string[];
  };
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

    // LLM 추상화 레이어 사용 — 제공자와 무관한 호출
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: '당신은 ESCO(European Skills, Competences, and Occupations) 기반 스킬 매칭 전문가입니다. 반드시 JSON 형식으로만 응답하세요.',
      },
      {
        role: 'user',
        content: `
[직무 설명]
${jobDescription}

[현재 보유 스킬]
${currentSkills.length > 0 ? currentSkills.join(', ') : '없음'}

다음 JSON 형식으로 응답해주세요:

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

ESCO 표준을 참고하여 가장 관련성 높은 스킬을 추천해주세요.
        `.trim(),
      },
    ];

    const result = await callLLMForJSON<SkillMatchResult>(messages, {
      temperature: 0.2,
      maxTokens: 2048,
    });

    return NextResponse.json({
      success: true,
      data: result,
      analysis: {
        timestamp: new Date().toISOString(),
        model: process.env.LLM_MODEL || 'gemini-2.5-flash',
        provider: process.env.LLM_PROVIDER || 'gemini',
        inputLength: jobDescription.length,
      },
    });

  } catch (error) {
    console.error('AI Skill Matching Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze skills',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    skills: SKILLS_DATABASE,
    total: SKILLS_DATABASE.length,
  });
}
