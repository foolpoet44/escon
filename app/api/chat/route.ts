import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'

import { loadSkillContext } from '../../lib/skillContextLoader'
import { GoogleGenAI } from '@google/genai'

// 환경변수 로드
const getApiKey = () => process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || ''
const modelName = process.env.LLM_MODEL || 'gemini-1.5-flash'

const ESCON_BASE_SYSTEM = `당신은 ESCON(Engineering Skill Competency Navigator)입니다.
엔지니어의 스킬 성장 경로를 함께 설계하는 전문 코치입니다.

핵심 역할:
- 현재 스킬 레벨을 기반으로 구체적인 성장 방향 제시
- 갭 분석: 현재 vs 목표 역할의 요구 역량 비교
- 6개월 이내 달성 가능한 학습 경로 우선 추천
- 추상적 조언 금지 — 항상 스킬 데이터에 근거한 구체적 답변

답변 형식:
- 간결하고 실용적으로 한국어로 답변하세요.
- 스킬 레벨(LV1~LV4)을 명시적으로 언급
- 필요 시 우선순위 스킬 최대 3개만 제시`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userId, targetEnablerId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: '대화 내역(messages)이 필요합니다.' }, { status: 400 })
    }

    // 1. 스킬 맥락 로드 (before_agent 훅 성격)
    const skillContext = await loadSkillContext(userId ?? 'anonymous', targetEnablerId)
    const systemPrompt = `${ESCON_BASE_SYSTEM}\n\n${skillContext.profileSummary}`

    // 2. [Hook: before_model] 긴 작업 오버플로우 방지 모델 진입 전 컨텍스트 정리
    // 최신 대화 10턴(약 20개 메시지)만 슬라이싱하여 Context Window 폭발 방지
    const MAX_HISTORY_LEN = 10;
    const recentMessages = messages.slice(-MAX_HISTORY_LEN);

    const formattedContents = recentMessages.filter(m => m.content).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    }));

    // 3. Gemini 호출 (스트리밍) - 시스템 프롬프트를 명확히 격리(systemInstruction)
    const genAI = new GoogleGenAI({ apiKey: getApiKey() })
    const responseStream = await genAI.models.generateContentStream({
      model: modelName,
      contents: formattedContents,
      config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          systemInstruction: systemPrompt 
      }
    });

    // 3. ReadableStream으로 변환하여 Response 반환
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            const chunkText = chunk.text || ''
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (err: any) {
    console.error('[/api/chat] 오류:', err.message)
    return NextResponse.json({ error: '서버 오류가 발생했습니다. API 키나 모델 설정을 확인하세요.' }, { status: 500 })
  }
}
