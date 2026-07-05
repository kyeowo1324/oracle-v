// src/lib/claude.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 현재 정식 최신 모델 ID (구 claude-3-5-haiku 표기 아님)
export const MODEL_HAIKU = 'claude-haiku-4-5-20251001'; // 기본: 비용효율
export const MODEL_SONNET = 'claude-sonnet-4-6';        // 복잡 추론/고품질용

/**
 * 코드펜스·설명이 붙어 와도 JSON만 안전하게 추출.
 * (데이터 적재 때 겪은 ```json 감쌈 문제 대응)
 */
export function extractJSON(text: string): any {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = t.indexOf('{');
  if (first !== -1) t = t.slice(first);
  try {
    return JSON.parse(t);
  } catch {}
  const lastComplete = t.lastIndexOf('",');
  if (lastComplete !== -1) {
    try {
      return JSON.parse(t.slice(0, lastComplete) + '"}');
    } catch {}
  }
  throw new Error('JSON 파싱 실패');
}

/**
 * 짧은 JSON 응답을 받는 공통 호출.
 * system 프롬프트는 prompt caching 대상(ephemeral).
 * prefill '{' 로 코드펜스·잡설을 원천 차단.
 */
export async function callClaudeJSON(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
}): Promise<any> {
  const { system, user, maxTokens = 300, model = MODEL_HAIKU } = opts;
  const msg = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: [
      { role: 'user', content: user },
      { role: 'assistant', content: '{' }, // prefill
    ],
  });
  const block = msg.content[0];
  const raw = block.type === 'text' ? block.text : '';
  return extractJSON('{' + raw);
}

export { anthropic };
