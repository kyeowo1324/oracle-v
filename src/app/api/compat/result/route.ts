// src/app/api/compat/result/route.ts
// 궁합 점 결과 — 서버가 점수를 결정론으로 계산하고, Claude는 그 점수를 설명하는
// 리딩 문장만 생성한다(같은 조합=같은 점수 → 신뢰감 + 캐싱 가능).
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { getJstDateString } from '@/lib/daily';
import { enforceDailyAiLimit } from '@/lib/rateLimit';
import { deckImageUrl, resolveDeckKey } from '@/lib/decks';
import {
  computeCompat, RELATION_JA, COMPAT_POSITIONS, SIGN_ELEMENT,
  type RelationKind, type Blood, type CompatCard,
} from '@/lib/compat';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ZODIAC = new Set(Object.keys(SIGN_ELEMENT));
const BLOODS = new Set(['A', 'B', 'O', 'AB']);
const RELATIONS = new Set(['love', 'friend', 'work']);
const GENDERS = new Set(['male', 'female', 'na']);
const CARD_KEY_RE = /^[a-z0-9]{2,12}$/;

const SYSTEM = `あなたは「ホシドタロ」の温かい相性占いガイドです。
与えられた二人の星座・血液型・タロット4枚（あなたの気持ち/相手の気持ち/二人の現在/二人の未来）と
相性スコアをふまえ、二人の相性を占ってください。断定しすぎず、良い面と歩み寄りのヒントの両方を、
前向きなトーンで。関係性（恋愛/友情/仕事）に合った視点で。JSON形式のみ:
{"headline_ja":"一言の見出し","reading_ja":"3〜4文の本文","advice_ja":"1文のワンポイント"}`;

function personLabel(zodiac: string, blood: string | null, gender: string | null): string {
  const g = gender === 'male' ? '男性' : gender === 'female' ? '女性' : '';
  return `${zodiac}${blood ? `・${blood}型` : ''}${g ? `・${g}` : ''}`;
}

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  const lang: 'ja' | 'ko' = body?.lang === 'ko' ? 'ko' : 'ja';
  const relation: RelationKind = RELATIONS.has(body?.relation) ? body.relation : 'love';

  // 두 사람 정보 검증 (별자리는 필수, 혈액형·성별은 선택)
  const pa = body?.personA ?? {};
  const pb = body?.personB ?? {};
  if (!ZODIAC.has(pa?.zodiac) || !ZODIAC.has(pb?.zodiac)) {
    return NextResponse.json({ error: 'need_zodiac' }, { status: 400 });
  }
  const aZodiac: string = pa.zodiac, bZodiac: string = pb.zodiac;
  const aBlood = (BLOODS.has(pa?.blood) ? pa.blood : null) as Blood | null;
  const bBlood = (BLOODS.has(pb?.blood) ? pb.blood : null) as Blood | null;
  const aGender = GENDERS.has(pa?.gender) ? pa.gender : null;
  const bGender = GENDERS.has(pb?.gender) ? pb.gender : null;

  // 타로 4장 검증 (card_key + orientation + deck_key)
  const rawCards = Array.isArray(body?.cards) ? body.cards.slice(0, 4) : [];
  const cardsIn: { card_key: string; orientation: 'upright' | 'reversed'; deck_key: string }[] = [];
  for (const c of rawCards) {
    const key = typeof c?.card_key === 'string' ? c.card_key : '';
    if (!CARD_KEY_RE.test(key)) continue;
    cardsIn.push({
      card_key: key,
      orientation: c?.orientation === 'reversed' ? 'reversed' : 'upright',
      deck_key: resolveDeckKey(c?.deck_key, key),
    });
  }
  if (cardsIn.length < 4) return NextResponse.json({ error: 'need_cards' }, { status: 400 });

  const dateStr = getJstDateString();

  // AI 호출 상한
  const rl = await enforceDailyAiLimit(supabaseAdmin, dateStr);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', message: '本日の利用上限に達しました。また明日お試しください。' },
      { status: 429 }
    );
  }

  // 점수는 서버가 결정론으로 계산
  const compat = computeCompat({
    relation,
    a: { zodiac: aZodiac, blood: aBlood },
    b: { zodiac: bZodiac, blood: bBlood },
    cards: cardsIn as CompatCard[],
  });

  // 카드 이름 조회 (해석 텍스트는 결과에 안 넣음 — 공유/표시에는 이름·이미지만)
  let nameMap = new Map<string, string>();
  try {
    const keys = cardsIn.map((c) => c.card_key);
    const { data } = await supabaseAdmin.from('tarot_cards').select('card_key, name_ja, name_ko').in('card_key', keys);
    nameMap = new Map((data ?? []).map((c) => [c.card_key, lang === 'ja' ? c.name_ja : c.name_ko]));
  } catch { /* 이름 없으면 key로 폴백 */ }

  const cards = cardsIn.map((c, i) => ({
    card_key: c.card_key,
    deck_key: c.deck_key,
    orientation: c.orientation,
    name: nameMap.get(c.card_key) ?? c.card_key,
    image_url: deckImageUrl(c.deck_key, c.card_key),
    position: COMPAT_POSITIONS[i],
  }));

  // 캐시키: 관계 + 두 사람(순서 무관) + 카드 + 날짜
  const persons = [
    `${aZodiac}:${aBlood ?? '-'}:${aGender ?? '-'}`,
    `${bZodiac}:${bBlood ?? '-'}:${bGender ?? '-'}`,
  ].sort().join('|');
  const cardKey = cardsIn.map((c) => `${c.card_key}:${c.orientation}`).join(',');
  const cacheKey = crypto.createHash('sha256')
    .update(`compat|${dateStr}|${relation}|${persons}|${cardKey}`).digest('hex');

  let headline = '', reading = '', advice = '';
  try {
    const { data: cached } = await supabaseAdmin
      .from('fortune_cache').select('conclusion_ja, summary_ja').eq('cache_key', cacheKey).single();
    if (cached?.summary_ja) {
      const parsed = JSON.parse(cached.summary_ja);
      headline = parsed.h ?? ''; reading = parsed.r ?? ''; advice = parsed.a ?? '';
      try { await supabaseAdmin.rpc('touch_fortune_cache', { p_key: cacheKey }); } catch { /* noop */ }
    }
  } catch { /* 미스 → 생성 */ }

  if (!reading) {
    try {
      const context = [
        `関係性: ${RELATION_JA[relation]}`,
        `Aさん: ${personLabel(aZodiac, aBlood, aGender)}`,
        `Bさん: ${personLabel(bZodiac, bBlood, bGender)}`,
        `相性スコア: ${compat.percent}点（星${compat.stars}つ）`,
        `内訳: 星座${compat.breakdown.zodiac} / 血液型${compat.breakdown.blood} / カード${compat.breakdown.tarot}`,
        `タロット: ${cards.map((c) => `${c.position}=${c.name}(${c.orientation === 'upright' ? '正' : '逆'})`).join(' / ')}`,
      ].join('\n');
      const msg = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: context }],
      });
      const block = msg.content[0];
      if (block.type === 'text') {
        const raw = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(raw.slice(raw.indexOf('{')));
        headline = parsed.headline_ja ?? ''; reading = parsed.reading_ja ?? ''; advice = parsed.advice_ja ?? '';
      }
      if (reading) {
        try {
          await supabaseAdmin.from('fortune_cache').upsert(
            { cache_key: cacheKey, summary_ja: JSON.stringify({ h: headline, r: reading, a: advice }) },
            { onConflict: 'cache_key' }
          );
        } catch { /* noop */ }
      }
    } catch { headline = ''; reading = ''; advice = ''; }
  }

  return NextResponse.json({
    relation, relationJa: RELATION_JA[relation],
    stars: compat.stars, percent: compat.percent, breakdown: compat.breakdown, elements: compat.elements,
    personA: { zodiac: aZodiac, blood: aBlood, gender: aGender },
    personB: { zodiac: bZodiac, blood: bBlood, gender: bGender },
    headline, reading, advice, cards, deck: cards[0]?.deck_key ?? 'original',
  });
}
