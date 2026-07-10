// src/app/api/decision/result/route.ts
// する・しない — 원오라클 1장.
// ── S패치 적용판 ──
//   S-1) 「どちらでも」 판정 버그 수정: AMBIGUOUS가 'the-moon' 등 존재하지 않는 키를
//        보고 있어 절대 매칭되지 않았음. 실제 card_key(tarotapi.dev name_short)로 교체:
//          ar18=月(The Moon) / ar12=吊るされた男(The Hanged Man)
//          ar02=女教皇(The High Priestess) / ar10=運命の輪(Wheel of Fortune)
//   S-2) 일일 AI 호출 상한 초과 시 429
//   S-3) req.json() try/catch(기존엔 try 밖이라 500 유발) + question 정규화(100자,
//        개행 제거) + 카드 이름·해석을 DB에서 재조회(클라이언트 텍스트 불신)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { getJstDateString } from '@/lib/daily';
import { enforceDailyAiLimit } from '@/lib/rateLimit';
import { deckImageUrl, resolveDeckKey } from '@/lib/decks';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// S-1: 실제 card_key 기준 (구버전: 'the-moon' 등 → 영원히 매칭 안 되던 버그)
const AMBIGUOUS = new Set(['ar18', 'ar12', 'ar02', 'ar10']);

const CARD_KEY_RE = /^[a-z0-9]{2,12}$/;

const ADVICE_SYSTEM = `あなたは「ホシドタロ」の温かい占いガイドです。
ユーザーの「する・しない」の迷いに、引かれたタロット1枚をふまえ、
背中をそっと押す一言を1〜2文の日本語で書いてください。
その日ごとに表現を少し変え、断定しすぎず本人に委ねるトーン。JSON形式のみ:{"advice_ja":""}`;

// S-3: 질문 정규화 — 100자 클램프 + 개행/제어문자 제거(프롬프트 구조 주입 방지)
function sanitizeQuestion(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.replace(/[\r\n\t\u0000-\u001f]+/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 100);
}

export async function POST(req: Request) {
  // S-3: 본문 파싱 실패는 400 (기존엔 try 밖이라 처리 안 된 500)
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const lang: 'ja' | 'ko' = body?.lang === 'ko' ? 'ko' : 'ja';
  const question = sanitizeQuestion(body?.question);
  const dateStr = getJstDateString();

  // S-2: 일일 AI 호출 상한 (기록 겸 차단)
  const rl = await enforceDailyAiLimit(supabaseAdmin, dateStr);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', message: '本日の利用上限に達しました。また明日お試しください。' },
      { status: 429 }
    );
  }

  // S-3: card_key + orientation만 신뢰
  const first = Array.isArray(body?.tarotShuffleResult) ? body.tarotShuffleResult[0] : null;
  const cardKey = typeof first?.card_key === 'string' && CARD_KEY_RE.test(first.card_key)
    ? first.card_key : null;
  if (!cardKey) return NextResponse.json({ error: 'no_card' }, { status: 400 });
  const orientation: 'upright' | 'reversed' =
    first?.orientation === 'reversed' ? 'reversed' : 'upright';
  const isUpright = orientation === 'upright';
  // 레어 덱 스킨: 매니페스트에 실존할 때만 인정, 아니면 original 폴백
  const deckKey = resolveDeckKey(first?.deck_key, cardKey);

  // S-3: 이름·해석은 서버가 DB에서 재조회
  let cardName = cardKey;
  let cardText = '';
  try {
    const [{ data: cardRow }, { data: interpRow }] = await Promise.all([
      supabaseAdmin.from('tarot_cards').select('name_ja, name_ko').eq('card_key', cardKey).single(),
      supabaseAdmin.from('tarot_interpretations').select('text_ja, text_ko')
        .eq('card_key', cardKey).eq('orientation', orientation).single(),
    ]);
    if (cardRow) cardName = (lang === 'ja' ? cardRow.name_ja : cardRow.name_ko) ?? cardKey;
    if (interpRow) cardText = (lang === 'ja' ? interpRow.text_ja : interpRow.text_ko) ?? '';
  } catch { /* DB 조회 실패 시 key/빈 해석으로 폴백 */ }

  const ambiguous = AMBIGUOUS.has(cardKey);
  const verdict = ambiguous ? 'どちらでも' : isUpright ? 'する' : 'しない';

  const card = {
    card_key: cardKey,
    deck_key: deckKey,
    name: cardName,
    orientation,
    image_url: deckImageUrl(deckKey, cardKey),
    text: cardText,
  };

  let advice = '';
  try {
    const context = [
      `日付: ${dateStr}`,
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

  return NextResponse.json({ verdict, question, card, advice });
}
