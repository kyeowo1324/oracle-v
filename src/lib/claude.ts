import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 공통 시스템 프롬프트 — 매 요청 동일 텍스트라 캐싱 대상 (cache_control)
// 두 번째 요청부터 이 부분은 90% 할인
const PERSONA_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
与えられた解釈を踏まえ、今日一日への短い励ましの一言(40字以内)を追加してください。
JSON形式のみ出力:{"blessing_ja":""}`;

export async function personalize(interpretationText: string) {
  const msg = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',   // 기본은 비용효율 Haiku (정식 모델 ID, 구 claude-3-5-haiku 표기 아님)
    max_tokens: 100,                       // 짧은 문단만 — 상한을 낮게 고정해 비용 통제
    system: [{ type: 'text', text: PERSONA_SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: interpretationText }],
  });
  const block = msg.content[0];
  return block.type === 'text' ? JSON.parse(block.text).blessing_ja : '';
}
