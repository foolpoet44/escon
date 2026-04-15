// LLM Abstraction Layer
// Gemini/Claude/OpenAI 추상화

export interface LLMProvider {
  name: 'gemini' | 'claude' | 'openai';
  complete(prompt: string): Promise<string>;
}

export async function complete(prompt: string): Promise<string> {
  // TODO: LLM 추상화 레이어 구현
  throw new Error('Not implemented');
}
