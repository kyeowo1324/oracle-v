// src/app/api/decision/result/route.ts
// する・しない — 재설계판(원오라클 1장)
// ・타로 1장만 사용. 星座・血液型 미사용.
// ・판정: 정위치=する / 역위치=しない. 애매 카드는 どちらでも.
// ・카드 텍스트는 draw API가 이미 tarotFull에 넣어줌(text 필드) → 추가 DB 조회 불필요.
// ・AI는 마지막 한마디만(실패 허용).
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { headers } from 'next/headers';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Yes/No가 애매한 카드(달·매달린 남자 등)는 どちらでも로
const AMBIGUOUS = new Set(['the-moon', 'the-hanged-man', 'the-high-priestess', 'wheel-of-fortune']);

const ADVICE_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
ユーザーの「する・しない」の迷いに、引かれたタロット1枚をふまえ、
背中をそっと押す一言を1〜2文の日本語で書いてください。
断定しすぎず、最終判断は本人に委ねるトーン。JSON形式のみ:{"advice_ja":""}`;

export async function POST(req: Request) {
  const { question, tarotShuffleResult, lang = 'ja' } = await req.json();

  // 레이트리밋(실패 허용)
  try {
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const id = crypto.createHash('sha256').update(ip).digest('hex');
    const today = new Date().toISOString().slice(0, 10);
    await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: today });
  } catch { /* noop */ }

  // 1) 카드 1장 (원오라클)
  const first = (tarotShuffleResult ?? [])[0];
  if (!first) return NextResponse.json({ error: 'no_card' }, { status: 400 });

  // 2) 판정
  const isUpright = first.orientation === 'upright';
  const ambiguous = AMBIGUOUS.has(first.card_key);
  const verdict = ambiguous ? 'どちらでも' : isUpright ? 'する' : 'しない';

  // 3) 카드 정보 (draw API가 이미 name/text/image_url을 넣어줌)
  const card = {
    card_key: first.card_key,
    name: first.name ?? first.card_key,
    orientation: first.orientation,
    image_url: first.image_url ?? `/tarot-images/${first.card_key}.jpg`,
    text: first.text ?? '',
  };

  // 4) AI 한마디(짧게, 실패 허용)
  let advice = '';
  try {
    const context = [
      question ? `相談: ${question}` : '',
      `結果: ${verdict}`,
      `カード: ${card.name}(${isUpright ? '正位置' : '逆位置'})`,
      card.text ? `カードの意味: ${card.text}` : '',
    ].filter(Boolean).join('\n');

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: [{ type: 'text', text: ADVICE_SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: context }],
    });
    const block = msg.content[0];
    if (block.type === 'text') {
      const t = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
      advice = JSON.parse(t.slice(t.indexOf('{'))).advice_ja ?? '';
    }
  } catch {
    advice = '';
  }

  return NextResponse.json({ verdict, question: question ?? '', card, advice });
}
