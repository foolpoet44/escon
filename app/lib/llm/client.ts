/**
 * LLM 클라이언트 추상화 레이어
 * Gemini/Claude/OpenAI 프로바이더 통일 인터페이스
 */

import type { ValidationResult } from '../validation/types'

/**
 * LLM 프로바이더 타입
 */
export type LLMProviderType = 'gemini' | 'claude' | 'openai' | 'mock'

/**
 * LLM 클라이언트 인터페이스
 */
export interface LLMClient {
  /**
   * 분석 수행
   */
  analyze(prompt: string): Promise<string>

  /**
   * JSON 응답 분석
   */
  analyzeJSON<T>(prompt: string): Promise<T>
}

/**
 * LLM 설정
 */
export interface LLMConfig {
  provider: LLMProviderType
  apiKey?: string
  model?: string
  baseUrl?: string
}

/**
 * Gemini 클라이언트
 */
class GeminiClient implements LLMClient {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'gemini-1.5-flash') {
    this.apiKey = apiKey
    this.model = model
  }

  async analyze(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  async analyzeJSON<T>(prompt: string): Promise<T> {
    const text = await this.analyze(prompt)
    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0]) as T
  }
}

/**
 * Claude 클라이언트 (Anthropic SDK)
 */
class ClaudeClient implements LLMClient {
  private apiKey: string
  private model: string

  constructor(apiKey: string, model = 'claude-3-haiku-20240307') {
    this.apiKey = apiKey
    this.model = model
  }

  async analyze(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 2048,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || ''
  }

  async analyzeJSON<T>(prompt: string): Promise<T> {
    const text = await this.analyze(prompt)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0]) as T
  }
}

/**
 * OpenAI 클라이언트
 */
class OpenAIClient implements LLMClient {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor(apiKey: string, model = 'gpt-3.5-turbo', baseUrl?: string) {
    this.apiKey = apiKey
    this.model = model
    this.baseUrl = baseUrl || 'https://api.openai.com/v1'
  }

  async analyze(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  }

  async analyzeJSON<T>(prompt: string): Promise<T> {
    const text = await this.analyze(prompt)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0]) as T
  }
}

/**
 * Mock 클라이언트 (테스트용)
 */
class MockClient implements LLMClient {
  async analyze(prompt: string): Promise<string> {
    console.log('[MockLLM] Analyze prompt:', prompt.slice(0, 100) + '...')
    return '{"consistent": true, "issues": [], "suggestions": []}'
  }

  async analyzeJSON<T>(prompt: string): Promise<T> {
    console.log('[MockLLM] Analyze JSON prompt:', prompt.slice(0, 100) + '...')
    return { consistent: true, issues: [], suggestions: [] } as T
  }
}

/**
 * LLM 클라이언트 팩토리
 * 환경변수에 따라 적절한 클라이언트 반환
 */
export function createLLMClient(config?: Partial<LLMConfig>): LLMClient {
  const provider = (config?.provider ||
    process.env.LLM_PROVIDER ||
    'mock') as LLMProviderType

  const apiKey = config?.apiKey || process.env.LLM_API_KEY || ''
  const model = config?.model || process.env.LLM_MODEL
  const baseUrl = config?.baseUrl || process.env.LLM_BASE_URL

  switch (provider) {
    case 'gemini':
      if (!apiKey) {
        console.warn('[LLM] Gemini API key not found, falling back to mock')
        return new MockClient()
      }
      return new GeminiClient(apiKey, model)

    case 'claude':
      if (!apiKey) {
        console.warn('[LLM] Claude API key not found, falling back to mock')
        return new MockClient()
      }
      return new ClaudeClient(apiKey, model)

    case 'openai':
      if (!apiKey) {
        console.warn('[LLM] OpenAI API key not found, falling back to mock')
        return new MockClient()
      }
      return new OpenAIClient(apiKey, model, baseUrl)

    case 'mock':
    default:
      console.log('[LLM] Using mock client')
      return new MockClient()
  }
}

// ============================================================================
// AI-DRC 검증 함수
// ============================================================================

import type { Enabler, EnablerSkill, Domain, ValidationResult } from '../validation/types'

/**
 * AI-DRC 검증 결과
 */
export interface AIDRCResult {
  consistent: boolean
  issues: string[]
  suggestions: string[]
}

/**
 * LLM 기반 스킬 매핑 검증
 */
export async function validateMappingWithAI(
  enabler: Enabler,
  skills: EnablerSkill[],
  domain: Domain,
  client?: LLMClient
): Promise<ValidationResult> {
  const llm = client || createLLMClient()

  const prompt = `당신은 HR 스킬 온톨로지 전문가입니다.
다음 Enabler 에 매핑된 Skill 목록의 논리적 일관성을 검증하세요.

## Enabler 정보
- ID: ${enabler.id}
- 이름: ${enabler.name} (${enabler.name_en})
- 설명: ${enabler.description}
- 도메인: ${domain.name}

## 매핑된 Skill 목록 (${skills.length}개)
${skills
  .map(
    (s, i) => `
${i + 1}. ${s.label_ko} (${s.label_en})
   - 타입: ${s.type}
   - 중요도: ${s.importance}/5
   - 요구 숙련도: ${s.target_proficiency}
   - 매핑 타입: ${s.match_type}
   ${s.notes ? `- 노트: ${s.notes}` : ''}`
  )
  .join('\n')}

## 검증 요청
1. 이 Enabler 에 매핑된 스킬들이 논리적으로 일관성이 있나요?
2. 누락된 중요한 스킬이 있나요?
3. 중복되거나 과잉인 스킬이 있나요?

## 응답 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "consistent": boolean,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`

  try {
    const result = await llm.analyzeJSON<AIDRCResult>(prompt)

    const passed = result.consistent && result.issues.length === 0

    return {
      ruleId: 'ai_validation',
      passed,
      severity: passed ? 'info' : 'warning',
      message: passed
        ? 'AI 검증 통과'
        : `AI 검증 문제 발견: ${result.issues.length}건`,
      details: {
        affectedEnablers: [enabler.id],
        suggestion: result.issues.concat(result.suggestions).join('; '),
      },
    }
  } catch (error) {
    return {
      ruleId: 'ai_validation',
      passed: false,
      severity: 'error',
      message: `AI 검증 실패: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
