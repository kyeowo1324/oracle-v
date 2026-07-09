// src/app/api/collection/cards/route.ts
// ホシドタロ — 컬렉션 그리드용 78장 마스터 목록
// tarot_cards는 RLS 읽기 공개 정적 데이터라 그대로 반환해도 안전 (해석 텍스트는 미포함).
// ?deck= 파라미터는 지금은 original만 유효 — 신규 덱 마이그레이션(deck_key 컬럼) 후
// .eq('deck_key', deck) 한 줄만 추가하면 확장 완료.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 3600; // 정적 데이터 — 1시간 캐시

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deck = searchParams.get('deck') ?? 'original';

  // 현재는 original 단일 덱 — deck_key 컬럼 도입 후 아래에 .eq('deck_key', deck) 추가
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('card_key, name_ja, suit, arcana, image_url')
    .order('id', { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: 'FETCH_FAILED' }, { status: 500 });
  }

  const cards = data.map((c) => ({
    key: c.card_key,
    nameJa: c.name_ja,
    suit: c.suit,
    arcana: c.arcana,
    imageUrl: c.image_url ?? `/tarot-images/${c.card_key}.jpg`,
  }));

  return NextResponse.json({ deck, total: cards.length, cards });
}
