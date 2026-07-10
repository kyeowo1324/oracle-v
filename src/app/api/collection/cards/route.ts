// src/app/api/collection/cards/route.ts
// ホシドタロ — 컬렉션 그리드용 카드 마스터 목록 (v2: 레어 덱 대응)
// tarot_cards는 RLS 읽기 공개 정적 데이터라 그대로 반환해도 안전 (해석 텍스트는 미포함).
//
// 레어 덱은 "스킨" 모델: 이름·슈트는 오리지널을 공유하고 이미지 경로만 다르다.
// ?deck=kappa 처럼 요청하면, 매니페스트에 이미지가 존재하는 카드만
// 해당 덱 이미지 경로로 반환한다 (河童가 메이저 22장뿐이면 22장만 반환 → 収集率 22分母).

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getDeck, deckCardSet, deckImageUrl } from '@/lib/decks';

export const revalidate = 3600; // 정적 데이터 — 1시간 캐시

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // 존재하지 않는 덱 키는 getDeck이 original로 폴백 → 파라미터 조작 무해
  const deckInfo = getDeck(searchParams.get('deck') ?? 'original');

  const { data, error } = await supabase
    .from('tarot_cards')
    .select('card_key, name_ja, suit, arcana, image_url')
    .order('id', { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: 'FETCH_FAILED' }, { status: 500 });
  }

  // card_key 중복 제거 — 04 마이그레이션 후 타 덱 DB행이 생겨도 목록이 오염되지 않게 방어
  const seen = new Set<string>();
  const master = data.filter((c) => (seen.has(c.card_key) ? false : (seen.add(c.card_key), true)));

  let rows = master;
  if (deckInfo.key !== 'original') {
    const avail = deckCardSet(deckInfo.key);
    rows = master.filter((c) => avail.has(c.card_key));
  }

  const cards = rows.map((c) => ({
    key: c.card_key,
    nameJa: c.name_ja,
    suit: c.suit,
    arcana: c.arcana,
    imageUrl:
      deckInfo.key === 'original'
        ? (c.image_url ?? deckImageUrl('original', c.card_key))
        : deckImageUrl(deckInfo.key, c.card_key),
  }));

  return NextResponse.json({ deck: deckInfo.key, total: cards.length, cards });
}
