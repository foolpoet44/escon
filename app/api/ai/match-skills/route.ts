import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenAI({ apiKey });
}

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

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, currentSkills = [] } = await req.json();

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    const prompt = `
당신은 ESCO(European Skills, Competences, and Occupations) 기반 스킬 매칭 전문가입니다.

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

ESCO 표준을 참고하여 가장 관련성 높은 스킬을 추천해주세요.
`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    });

    const responseText = response.text || '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: result,
      analysis: {
        timestamp: new Date().toISOString(),
        model: 'gemini-2.5-flash',
        inputLength: jobDescription.length,
      },
    });

  } catch (error) {
    console.error('AI Skill Matching Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze skills',
        details: error instanceof Error ? error.message : 'Unknown error'
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
