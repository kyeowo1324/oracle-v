// src/app/api/aisho-tarot/route.ts
// 궁합 점 전용 타로 셔플 — 다이아몬드 크로스 4장.
// draw 라우트와 동일한 셔플·레어덱 로직을 쓰되 4장을 뽑는다.
// AI 호출이 없으므로 일일 상한(enforceDailyAiLimit) 대상 아님 (셔플만).
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRareDecks, RARE_CHANCE, deckCardSet, deckImageUrl, type DeckKey } from '@/lib/decks';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Orientation = 'upright' | 'reversed';
type CardRow = { card_key: string; name_ja: string; name_ko: string };

const CACHE_TTL_MS = 10 * 60 * 1000;
let cardCache: { cards: CardRow[]; at: number } | null = null;

async function loadCards(): Promise<CardRow[] | null> {
  if (cardCache && Date.now() - cardCache.at < CACHE_TTL_MS) return cardCache.cards;
  const { data, error } = await supabaseAdmin.from('tarot_cards').select('card_key, name_ja, name_ko');
  if (error || !data?.length) return cardCache?.cards ?? null;
  const seen = new Set<string>();
  const uniq = (data as CardRow[]).filter((c) => (seen.has(c.card_key) ? false : (seen.add(c.card_key), true)));
  cardCache = { cards: uniq, at: Date.now() };
  return uniq;
}

export async function POST(req: Request) {
  let body: any = {};
  try { body = await req.json(); } catch { /* 기본값 진행 */ }
  const lang: 'ja' | 'ko' = body?.lang === 'ko' ? 'ko' : 'ja';
  const times = Math.min(Math.max(Number(body?.shuffleCount) || 1, 1), 20);

  const cards = await loadCards();
  if (!cards) return NextResponse.json({ error: 'DB_ERROR' }, { status: 500 });

  const rand = () => { const b = new Uint32Array(1); crypto.getRandomValues(b); return b[0] / 2 ** 32; };

  // 레어 덱 롤 (스프레드 단위)
  let deckKey: DeckKey = 'original';
  const rareDecks = getRareDecks();
  if (rareDecks.length > 0 && rand() < RARE_CHANCE) {
    deckKey = rareDecks[Math.floor(rand() * rareDecks.length)].key;
  }
  let pool = cards;
  if (deckKey !== 'original') {
    const avail = deckCardSet(deckKey);
    pool = cards.filter((c) => avail.has(c.card_key));
    if (pool.length < 4) { deckKey = 'original'; pool = cards; }
  }

  // 156(정/역) 풀 셔플
  const deck: { card_key: string; orientation: Orientation }[] = [];
  for (const c of pool) {
    deck.push({ card_key: c.card_key, orientation: 'upright' });
    deck.push({ card_key: c.card_key, orientation: 'reversed' });
  }
  for (let t = 0; t < times; t++) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  // 카드 중복 없이 4장
  const drawn: { card_key: string; orientation: Orientation }[] = [];
  const used = new Set<string>();
  for (const c of deck) {
    if (used.has(c.card_key)) continue;
    used.add(c.card_key);
    drawn.push(c);
    if (drawn.length === 4) break;
  }

  const nameMap = new Map(cards.map((c) => [c.card_key, lang === 'ja' ? c.name_ja : c.name_ko]));
  const result = drawn.map((c) => ({
    card_key: c.card_key,
    deck_key: deckKey,
    orientation: c.orientation,
    name: nameMap.get(c.card_key) ?? c.card_key,
    image_url: deckImageUrl(deckKey, c.card_key),
  }));

  return NextResponse.json({ deck: deckKey, cards: result });
}
