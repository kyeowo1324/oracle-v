// src/app/api/tarot/draw/route.ts
// 셔플 횟수를 받아 156개(78장 × 정/역) 풀에서 6장을 뽑아 반환.
// 카드 선정·정역·순서는 전부 서버에서 결정(조작 방지). 해석 텍스트까지 함께 반환.
// ── S패치 적용판 ──
//   S-5a) 난수 수정: buf[0] / 0xffffffff 는 이론상 1.0이 나와 배열 범위를 벗어날 수
//         있었음(확률 1/2^32) → / 2**32 로 [0,1) 보장
//   S-5b) 카드 마스터+해석은 정적 데이터이므로 모듈 스코프에 10분 캐시
//         → 웜 인스턴스에서 요청마다 78+156행 전체 조회하던 DB 부하 제거
//   S-3 연장) req.json() 실패 시에도 기본값으로 진행(이 라우트는 body 없이도 동작 가능)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Orientation = 'upright' | 'reversed';
type CardRow = { card_key: string; name_ja: string; name_ko: string };
type InterpRow = { card_key: string; orientation: Orientation; text_ja: string; text_ko: string };

// ── S-5b: 정적 데이터 모듈 캐시 (서버리스 웜 인스턴스 간 재사용) ──
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분. 시딩 직후 반영이 급하면 재배포로 즉시 갱신됨.
let deckCache: { cards: CardRow[]; interps: InterpRow[]; at: number } | null = null;

async function loadDeck(): Promise<{ cards: CardRow[]; interps: InterpRow[] } | null> {
  if (deckCache && Date.now() - deckCache.at < CACHE_TTL_MS) {
    return { cards: deckCache.cards, interps: deckCache.interps };
  }
  const [{ data: cards, error: e1 }, { data: interps, error: e2 }] = await Promise.all([
    supabaseAdmin.from('tarot_cards').select('card_key, name_ja, name_ko'),
    supabaseAdmin.from('tarot_interpretations').select('card_key, orientation, text_ja, text_ko'),
  ]);
  if (e1 || e2 || !cards?.length || !interps?.length) {
    // 조회 실패 시: 만료된 캐시라도 있으면 그것으로 서비스 유지 (fail-soft)
    if (deckCache) return { cards: deckCache.cards, interps: deckCache.interps };
    return null;
  }
  deckCache = { cards: cards as CardRow[], interps: interps as InterpRow[], at: Date.now() };
  return { cards: deckCache.cards, interps: deckCache.interps };
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { /* body 없어도 기본값으로 진행 */ }
  const lang: 'ja' | 'ko' = body?.lang === 'ko' ? 'ko' : 'ja';
  const times = Math.min(Math.max(Number(body?.shuffleCount) || 1, 1), 20); // 1~20회로 제한

  // 1) 카드 마스터 + 해석 로드 (모듈 캐시)
  const loaded = await loadDeck();
  if (!loaded) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });
  const { cards, interps } = loaded;

  // 2) 156개 풀 구성 (각 카드 × 정/역)
  const deck: { card_key: string; orientation: Orientation }[] = [];
  for (const c of cards) {
    deck.push({ card_key: c.card_key, orientation: 'upright' });
    deck.push({ card_key: c.card_key, orientation: 'reversed' });
  }

  // 3) 셔플 횟수만큼 Fisher-Yates 반복 (crypto 기반 난수)
  //    S-5a: 2**32로 나눠 [0, 1) 보장 (기존 /0xffffffff는 1.0 가능 → 범위 밖 스왑 버그)
  const rand = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
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
