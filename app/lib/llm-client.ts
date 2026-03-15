/**
 * LLM 추상화 레이어 (MiroFish BM 적용)
 *
 * 왜 이 파일이 필요한가?
 * route.ts에서 특정 SDK(Gemini, Claude 등)를 직접 import하면
 * 모델을 바꿀 때마다 여러 파일을 수정해야 한다.
 * 이 레이어를 두면 .env.local 한 줄 수정으로 모델 제공자 전체를 교체할 수 있다.
 *
 * 지원 제공자:
 * - gemini: Google Gemini (@google/genai SDK 사용)
 * - claude: Anthropic Claude (openai 호환 endpoint)
 * - openai: OpenAI GPT 시리즈
 *
 * 환경변수:
 *   LLM_PROVIDER=gemini      (기본값)
 *   LLM_MODEL=gemini-2.5-flash
 *   LLM_API_KEY=xxx          (없으면 GEMINI_API_KEY fallback)
 *   LLM_TEMPERATURE=0.2      (선택, 기본 0.2)
 *   LLM_MAX_TOKENS=2048      (선택, 기본 2048)
 */

import { GoogleGenAI } from '@google/genai';

// ---- 타입 정의 ----

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  model: string;
  provider: string;
}

// ---- 제공자별 구현 ----

async function callGemini(
  messages: LLMMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  const apiKey = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || '';
  const model = process.env.LLM_MODEL || 'gemini-2.5-flash';

  const ai = new GoogleGenAI({ apiKey });

  // Gemini는 단일 prompt string 방식 사용
  // system 메시지와 user 메시지를 합쳐서 전달
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const userMsg = messages.filter(m => m.role !== 'system')
    .map(m => m.content)
    .join('\n');

  const fullPrompt = systemMsg ? `${systemMsg}\n\n${userMsg}` : userMsg;

  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt,
    config: {
      temperature: config.temperature ?? 0.2,
      maxOutputTokens: config.maxTokens ?? 2048,
    },
  });

  return {
    text: response.text || '',
    model,
    provider: 'gemini',
  };
}

// Claude / OpenAI 추가 시 이 함수들을 구현하고 callLLM에서 분기
// async function callClaude(...) { ... }
// async function callOpenAI(...) { ... }

// ---- 공개 인터페이스 ----

/**
 * LLM에 메시지를 전송하고 텍스트 응답을 반환한다.
 * 제공자는 LLM_PROVIDER 환경변수로 결정된다.
 */
export async function callLLM(
  messages: LLMMessage[],
  config: LLMConfig = {}
): Promise<LLMResponse> {
  const provider = process.env.LLM_PROVIDER || 'gemini';

  switch (provider) {
    case 'gemini':
      return callGemini(messages, config);
    // case 'claude':
    //   return callClaude(messages, config);
    // case 'openai':
    //   return callOpenAI(messages, config);
    default:
      throw new Error(`지원하지 않는 LLM 제공자: ${provider}. gemini, claude, openai 중 선택하세요.`);
  }
}

/**
 * JSON 응답을 기대하는 LLM 호출 헬퍼.
 * 응답에서 JSON 블록을 추출하고 파싱까지 처리한다.
 */
export async function callLLMForJSON<T>(
  messages: LLMMessage[],
  config: LLMConfig = {}
): Promise<T> {
  const response = await callLLM(messages, config);

  // ```json ... ``` 코드블록 또는 순수 { } 추출
  const jsonMatch = response.text.match(/```json\s*([\s\S]*?)\s*```/) ||
                    response.text.match(/(\{[\s\S]*\})/);

  if (!jsonMatch) {
    throw new Error(`LLM 응답에서 JSON을 찾을 수 없습니다. 원본 응답: ${response.text.slice(0, 200)}`);
  }

  return JSON.parse(jsonMatch[1]) as T;
}
