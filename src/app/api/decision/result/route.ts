// src/app/api/decision/result/route.ts
// する・しない — 원오라클 1장. (변경점: AI 조언 프롬프트에 날짜 반영 = 방법 B)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getJstDateString } from '@/lib/daily';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AMBIGUOUS = new Set(['the-moon', 'the-hanged-man', 'the-high-priestess', 'wheel-of-fortune']);

const ADVICE_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
ユーザーの「する・しない」の迷いに、引かれたタロット1枚をふまえ、
背中をそっと押す一言を1〜2文の日本語で書いてください。
その日ごとに表現を少し変え、断定しすぎず本人に委ねるトーン。JSON形式のみ:{"advice_ja":""}`;

export async function POST(req: Request) {
  const { question, tarotShuffleResult, lang = 'ja' } = await req.json();
  const dateStr = getJstDateString();

  try {
    const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
    const id = crypto.createHash('sha256').update(ip).digest('hex');
    await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: dateStr });
  } catch { /* noop */ }

  const first = (tarotShuffleResult ?? [])[0];
  if (!first) return NextResponse.json({ error: 'no_card' }, { status: 400 });

  const isUpright = first.orientation === 'upright';
  const ambiguous = AMBIGUOUS.has(first.card_key);
  const verdict = ambiguous ? 'どちらでも' : isUpright ? 'する' : 'しない';

  const card = {
    card_key: first.card_key,
    name: first.name ?? first.card_key,
    orientation: first.orientation,
    image_url: first.image_url ?? `/tarot-images/${first.card_key}.jpg`,
    text: first.text ?? '',
  };

  let advice = '';
  try {
    const context = [
      `日付: ${dateStr}`,                               // ← 방법 B: 날짜 반영
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
