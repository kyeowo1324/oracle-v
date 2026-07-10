// src/app/api/tarot/draw/route.ts
// 셔플 횟수를 받아 156개(78장 × 정/역) 풀에서 6장을 뽑아 반환.
// 카드 선정·정역·순서는 전부 서버에서 결정(조작 방지). 해석 텍스트까지 함께 반환.
// ── S패치 적용판 ──
//   S-5a) 난수 수정: buf[0] / 0xffffffff 는 이론상 1.0이 나와 배열 범위를 벗어날 수
//         있었음(확률 1/2^32) → / 2**32 로 [0,1) 보장
//   S-5b) 카드 마스터+해석은 정적 데이터이므로 모듈 스코프에 10분 캐시
//         → 웜 인스턴스에서 요청마다 78+156행 전체 조회하던 DB 부하 제거
//   S-3 연장) req.json() 실패 시에도 기본값으로 진행(이 라우트는 body 없이도 동작 가능)
// ── 레어 덱(v3) ──
//   스프레드 단위로 확률 추첨: 오리지널 95% / 출시된 레어 덱(河童 등) 합산 5%.
//   확률·오픈 여부는 decks.config.json + deck-manifest.json이 결정 (코드 수정 불필요).
//   레어 덱은 "스킨"이라 이름·해석은 오리지널 공유, 이미지 경로만 바뀐다.
//   레어 덱 선택 시 풀은 그 덱에 이미지가 있는 카드로 한정(메이저 22장 선행 출시 대응).
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRareDecks, RARE_CHANCE, deckCardSet, deckImageUrl, type DeckKey } from '@/lib/decks';

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
  const { cards: rawCards, interps } = loaded;
  // card_key 기준 중복 제거 — 04 마이그레이션 후 다른 deck_key의 DB행이 추가돼도
  // (레어 덱은 스킨 모델이라 DB행이 필요 없지만) 풀이 오염되지 않게 방어
  const cardMap = new Map<string, CardRow>();
  for (const c of rawCards) if (!cardMap.has(c.card_key)) cardMap.set(c.card_key, c);
  const cards = [...cardMap.values()];

  // 난수 (crypto 기반) — S-5a: 2**32로 나눠 [0, 1) 보장
  const rand = () => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  };

  // 2) 레어 덱 롤 — 스프레드(6장) 단위로 1회. 당첨 시 전 카드가 같은 덱(시각 일관성).
  let deckKey: DeckKey = 'original';
  const rareDecks = getRareDecks();
  if (rareDecks.length > 0 && rand() < RARE_CHANCE) {
    deckKey = rareDecks[Math.floor(rand() * rareDecks.length)].key;
  }
  let poolCards = cards;
  if (deckKey !== 'original') {
    const avail = deckCardSet(deckKey);
    poolCards = cards.filter((c) => avail.has(c.card_key));
    if (poolCards.length < 6) { deckKey = 'original'; poolCards = cards; } // 안전 폴백
  }

  // 3) 풀 구성 (각 카드 × 정/역) 후 셔플 횟수만큼 Fisher-Yates 반복
  const deck: { card_key: string; orientation: Orientation }[] = [];
  for (const c of poolCards) {
    deck.push({ card_key: c.card_key, orientation: 'upright' });
    deck.push({ card_key: c.card_key, orientation: 'reversed' });
  }
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
    deck_key: deckKey, // 레어 덱이면 결과·컬렉션이 그 덱으로 기록되도록 전달
    orientation: card.orientation,
    name: nameMap.get(card.card_key) ?? card.card_key,
    text: interpMap.get(`${card.card_key}_${card.orientation}`) ?? '',
    image_url: deckImageUrl(deckKey, card.card_key),
  }));

  return NextResponse.json({ deck: deckKey, cards: result, shuffleCount: times });
}
