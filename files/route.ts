/**
 * /api/chat/route.ts
 *
 * ESCON 챗 API 엔드포인트.
 *
 * 흐름:
 *   [사용자 질문]
 *       ↓
 *   SkillContextLoader 실행  ← 이게 하네스의 before_agent 훅
 *       ↓
 *   맥락 + 질문 → Claude API
 *       ↓
 *   [답변 스트리밍]
 */

import { NextRequest, NextResponse } from 'next/server'
import { loadSkillContext } from '@/lib/skillContextLoader'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ESCON 에이전트 기본 성격 정의
const ESCON_BASE_SYSTEM = `당신은 ESCON(Engineering Skill Competency Navigator)입니다.
엔지니어의 스킬 성장 경로를 함께 설계하는 전문 코치입니다.

핵심 역할:
- 현재 스킬 레벨을 기반으로 구체적인 성장 방향 제시
- 갭 분석: 현재 vs 목표 역할의 요구 역량 비교
- 6개월 이내 달성 가능한 학습 경로 우선 추천
- 추상적 조언 금지 — 항상 스킬 데이터에 근거한 구체적 답변

답변 형식:
- 간결하고 실용적으로
- 스킬 레벨(LV1~LV4)을 명시적으로 언급
- 필요 시 우선순위 스킬 최대 3개만 제시`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, userId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 하네스 핵심 — before_agent 훅 실행
    // 사용자 질문이 LLM에 가기 전, 스킬 데이터 먼저 로드
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const skillContext = await loadSkillContext(userId ?? 'anonymous')

    // 시스템 프롬프트 = ESCON 기본 성격 + 사용자 스킬 맥락
    const systemPrompt = `${ESCON_BASE_SYSTEM}

${skillContext.profileSummary}`

    // Claude API 호출 (스트리밍)
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: message }
      ],
    })

    // 스트리밍 응답 반환
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })

  } catch (err: any) {
    console.error('[/api/chat] 오류:', err.message)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
