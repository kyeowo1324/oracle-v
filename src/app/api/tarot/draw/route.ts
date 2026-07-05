// src/app/api/tarot/draw/route.ts
// 셔플 횟수를 받아 156개(78장 × 정/역) 풀에서 6장을 뽑아 반환.
// 카드 선정·정역·순서는 전부 서버에서 결정(조작 방지). 해석 텍스트까지 함께 반환.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Orientation = 'upright' | 'reversed';

export async function POST(req: Request) {
  const { shuffleCount = 3, lang = 'ja' } = await req.json();
  const times = Math.min(Math.max(Number(shuffleCount) || 1, 1), 20); // 1~20회로 제한

  // 1) 카드 마스터 + 해석 로드 (정적, 캐시 가능)
  const { data: cards, error: e1 } = await supabaseAdmin
    .from('tarot_cards')
    .select('card_key, name_ja, name_ko');
  const { data: interps, error: e2 } = await supabaseAdmin
    .from('tarot_interpretations')
    .select('card_key, orientation, text_ja, text_ko');

  if (e1 || e2 || !cards || !interps) {
    return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
  }

  // 2) 156개 풀 구성 (각 카드 × 정/역)
  const deck: { card_key: string; orientation: Orientation }[] = [];
  for (const c of cards) {
    deck.push({ card_key: c.card_key, orientation: 'upright' });
    deck.push({ card_key: c.card_key, orientation: 'reversed' });
  }

  // 3) 셔플 횟수만큼 Fisher-Yates 반복 (crypto 기반 난수)
  const rand = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0xffffffff;
  };
  for (let t = 0; t < times; t++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  // 4) 같은 카드(정/역 동시) 중복 없이 6장 추출
  const drawn: { card_key: string; orientation: Orientation }[] = [];
  const usedKeys = new Set<string>();
  for (const card of deck) {
    if (usedKeys.has(card.card_key)) continue;
    usedKeys.add(card.card_key);
    drawn.push(card);
    if (drawn.length === 6) break;
  }

  // 5) 해석 텍스트 결합
  const nameMap = new Map(cards.map((c) => [c.card_key, lang === 'ja' ? c.name_ja : c.name_ko]));
  const interpMap = new Map(
    interps.map((it) => [`${it.card_key}_${it.orientation}`, lang === 'ja' ? it.text_ja : it.text_ko])
  );

  const result = drawn.map((card) => ({
    card_key: card.card_key,
    orientation: card.orientation,
    name: nameMap.get(card.card_key) ?? card.card_key,
    text: interpMap.get(`${card.card_key}_${card.orientation}`) ?? '',
    image_url: `/tarot-images/${card.card_key}.jpg`,
  }));

  return NextResponse.json({ cards: result, shuffleCount: times });
}
