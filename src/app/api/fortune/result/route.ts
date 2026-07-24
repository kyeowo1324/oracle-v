// src/app/api/fortune/result/route.ts
// ── S패치 적용판 ──
//   S-2) 일일 AI 호출 상한: increment_ai_call이 count를 반환 → 초과 시 429
//        (supabase/06_migration_rate_limit.sql 선행 실행 필요)
//   A단계) fortune_cache: 같은 날·같은 조합의 결론/요약을 재사용 → Claude 호출 절감
//        (supabase/07_migration_fortune_cache.sql 선행 실행 필요.
//         미실행이어도 캐시 조회가 조용히 실패하고 매번 생성 — 서비스 무중단)
//   S-3) 입력 검증:
//        - zodiacSign / bloodType / gender / lang / topic 화이트리스트
//        - 타로는 클라이언트의 name/text를 신뢰하지 않고 card_key + orientation만 받아
//          이름·해석을 서버가 DB에서 재조회 → 프롬프트 인젝션·토큰 비용 부풀리기 차단
//        - req.json() 실패 시 400
// 기존 A+B+F 로직(날짜 variant / lucky / 날짜 반영 결론)과 응답 형태는 그대로 유지.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { getJstDateString, pickVariant } from '@/lib/daily';
import { enforceDailyAiLimit } from '@/lib/rateLimit';
import { deckImageUrl, resolveDeckKey } from '@/lib/decks';
import { personaSystemPrefix, resolvePersona } from '@/lib/personas';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALL_CATEGORIES = ['general', 'love', 'money', 'work', 'health', 'relationship'] as const;
type Topic = (typeof ALL_CATEGORIES)[number];
const TOPIC_JA: Record<Topic, string> = {
  general: '総合運', love: '恋愛運', money: '金運',
  work: '仕事・学業運', health: '健康運', relationship: '対人運',
};
const GENDER_JA: Record<string, string | null> = { male: '男性', female: '女性', na: null };

// ── S-3 화이트리스트 ──
const ZODIAC_CODES = new Set([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);
const BLOOD_TYPES = new Set(['A', 'B', 'O', 'AB']);
const GENDERS = new Set(['male', 'female', 'na']);
// tarotapi.dev name_short 형식: ar00~ar21 / waac, wa02, cuqu, peki ... (영소문자+숫자 2~12자)
const CARD_KEY_RE = /^[a-z0-9]{2,12}$/;

const CONCLUSION_SYSTEM = `あなたは「ホシドタロ」の温かい占いガイドです。
指定された日付とテーマについて、星座・タロット(過去/現在/未来)・血液型の結果をふまえ、
今日の「結論」を最初に一言で示し、続けて2〜3文で理由を添えてください。
日付ごとに切り口を変え、前向きなトーンで。JSON形式のみ:{"conclusion_ja":"","summary_ja":""}`;

// 그날의 variant를 골라 해당 행을 반환하는 헬퍼
async function pickAstroRow(sign: string, category: string, dateStr: string) {
  const { data } = await supabaseAdmin
    .from('astrology_interpretations')
    .select('variant, text_ja, text_ko, lucky_color, lucky_number, lucky_item_ja, lucky_item_ko, advice_ja, advice_ko')
    .eq('sign_code', sign).eq('category', category)
    .order('variant', { ascending: true });
  if (!data || data.length === 0) return null;
  const idx = pickVariant(dateStr, `${sign}_${category}`, data.length);
  return data[idx] ?? data[0];
}

// S-3: 클라이언트가 보낸 배열에서 card_key/orientation/deck_key만 추출·검증
// deck_key는 매니페스트에 실존 + 해당 카드 이미지가 실제로 있을 때만 인정 (아니면 original)
function sanitizeTarotInput(
  raw: unknown
): { card_key: string; orientation: 'upright' | 'reversed'; deck_key: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { card_key: string; orientation: 'upright' | 'reversed'; deck_key: string }[] = [];
  for (const c of raw.slice(0, 3)) {
    const key = typeof c?.card_key === 'string' ? c.card_key : '';
    if (!CARD_KEY_RE.test(key)) continue;
    out.push({
      card_key: key,
      orientation: c?.orientation === 'reversed' ? 'reversed' : 'upright',
      deck_key: resolveDeckKey(c?.deck_key, key),
    });
  }
  return out;
}

// A단계: 캐시키 — 결론/요약에 영향을 주는 입력만 정규화해 해시.
// 날짜가 들어가므로 하루 단위로 자연 갱신. topic 추가가 구버전 참고본과의 차이.
function makeFortuneCacheKey(input: {
  date: string; topic: string; zodiacSign: string | null; bloodType: string | null;
  gender: string | null; persona: string; tarot: { card_key: string; orientation: string }[];
}) {
  const tarotKey = input.tarot.map((c) => `${c.card_key}:${c.orientation}`).join(',');
  const raw = [
    input.date, input.topic,
    input.zodiacSign ?? '-', input.bloodType ?? '-', input.gender ?? '-', input.persona, tarotKey,
  ].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function POST(req: Request) {
  try {
    // S-3: 본문 파싱 실패는 400으로 명확히
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    }

    const t: Topic = (ALL_CATEGORIES as readonly string[]).includes(body?.topic) ? body.topic : 'general';
    const lang: 'ja' | 'ko' = body?.lang === 'ko' ? 'ko' : 'ja';
    const zodiacSign: string | null = ZODIAC_CODES.has(body?.zodiacSign) ? body.zodiacSign : null;
    const bloodType: string | null = BLOOD_TYPES.has(body?.bloodType) ? body.bloodType : null;
    const gender: string | null = GENDERS.has(body?.gender) ? body.gender : null;
    const personaKey = resolvePersona(body?.persona).key;
    const dateStr = getJstDateString();

    // 1) 별자리: 선택 주제 + general(컨텍스트용), 각각 날짜 variant로 선택
    let topicText = '', generalText = '';
    let lucky: { color?: string; number?: number; item?: string } = {};
    let advice = '';
    if (zodiacSign) {
      try {
        const row = await pickAstroRow(zodiacSign, t, dateStr);
        if (row) {
          topicText = lang === 'ja' ? row.text_ja : row.text_ko;
          lucky = {
            color: row.lucky_color, number: row.lucky_number,
            item: lang === 'ja' ? row.lucky_item_ja : row.lucky_item_ko,
          };
          advice = lang === 'ja' ? row.advice_ja : row.advice_ko;
        }
        if (t !== 'general') {
          const g = await pickAstroRow(zodiacSign, 'general', dateStr);
          if (g) generalText = lang === 'ja' ? g.text_ja : g.text_ko;
        } else {
          generalText = topicText;
        }
      } catch { /* noop */ }
    }

    // 2) 혈액형: 날짜 variant로 선택
    let blood: { text: string } | null = null;
    if (bloodType) {
      try {
        const { data } = await supabaseAdmin
          .from('blood_type_interpretations')
          .select('variant, text_ja, text_ko')
          .eq('blood_type', bloodType).order('variant', { ascending: true });
        if (data && data.length) {
          const idx = pickVariant(dateStr, `blood_${bloodType}`, data.length);
          const row = data[idx] ?? data[0];
          blood = { text: lang === 'ja' ? row.text_ja : row.text_ko };
        }
      } catch { /* noop */ }
    }

    // 3) 타로 3장 — S-3: 이름·해석은 DB에서 재조회 (클라이언트 텍스트 불신)
    const requested = sanitizeTarotInput(body?.tarotShuffleResult);
    const positions = ['過去', '現在', '未来'];
    let tarotWithPos: any[] = [];
    if (requested.length > 0) {
      try {
        const keys = requested.map((c) => c.card_key);
        const [{ data: cards }, { data: interps }] = await Promise.all([
          supabaseAdmin.from('tarot_cards').select('card_key, name_ja, name_ko').in('card_key', keys),
          supabaseAdmin.from('tarot_interpretations')
            .select('card_key, orientation, text_ja, text_ko').in('card_key', keys),
        ]);
        const nameMap = new Map((cards ?? []).map((c) => [c.card_key, lang === 'ja' ? c.name_ja : c.name_ko]));
        const interpMap = new Map(
          (interps ?? []).map((it) => [`${it.card_key}_${it.orientation}`, lang === 'ja' ? it.text_ja : it.text_ko])
        );
        tarotWithPos = requested.map((c, i) => ({
          card_key: c.card_key,
          deck_key: c.deck_key, // 레어 덱 스킨 — 이름·해석은 오리지널 공유
          orientation: c.orientation,
          name: nameMap.get(c.card_key) ?? c.card_key,
          text: interpMap.get(`${c.card_key}_${c.orientation}`) ?? '',
          image_url: deckImageUrl(c.deck_key, c.card_key),
          position: positions[i],
        }));
      } catch {
        tarotWithPos = requested.map((c, i) => ({
          card_key: c.card_key, deck_key: c.deck_key, orientation: c.orientation, name: c.card_key,
          text: '', image_url: deckImageUrl(c.deck_key, c.card_key), position: positions[i],
        }));
      }
    }

    // 4) 결론 + 요약 (날짜 반영) — 입력이 하나도 없으면 Claude 호출 생략(비용 절약)
    let conclusion = '', summary = '';
    const hasAnyInput = !!zodiacSign || !!bloodType || tarotWithPos.length > 0;
    // A단계: 캐시 HIT면 Claude 호출 0 (같은 날·같은 조합은 결과 재사용)
    // ※ deck_key는 캐시키에 넣지 않는다 — 레어 덱은 스킨이라 AI 텍스트가 동일함
    const cacheKey = makeFortuneCacheKey({
      date: dateStr, topic: t, zodiacSign, bloodType, gender, persona: personaKey, tarot: requested,
    });
    let cacheHit = false;
    if (hasAnyInput) {
      try {
        const { data: cached } = await supabaseAdmin
          .from('fortune_cache')
          .select('conclusion_ja, summary_ja')
          .eq('cache_key', cacheKey)
          .single();
        if (cached && (cached.conclusion_ja || cached.summary_ja)) {
          conclusion = cached.conclusion_ja ?? '';
          summary = cached.summary_ja ?? '';
          cacheHit = true;
          try { await supabaseAdmin.rpc('touch_fortune_cache', { p_key: cacheKey }); } catch { /* noop */ }
        }
      } catch { /* 캐시 미스 or 테이블 미생성 = 정상, 아래에서 생성 */ }
    }
    if (hasAnyInput && !cacheHit) {
      // S-2: 일일 AI 호출 상한 — 실제로 AI를 부르는 이 지점에서만 소모한다.
      // (캐시 적중은 비용이 0이므로 사용자의 하루 상한을 깎지 않는다)
      const rl = await enforceDailyAiLimit(supabaseAdmin, dateStr);
      if (!rl.ok) {
        return NextResponse.json(
          { error: 'rate_limited', message: '本日の利用上限に達しました。また明日お試しください。' },
          { status: 429 }
        );
      }
      try {
        const genderJa = gender ? GENDER_JA[gender] : null;
        const context = [
          `日付: ${dateStr}`,
          `テーマ: ${TOPIC_JA[t]}`,
          genderJa ? `性別: ${genderJa}` : '',
          zodiacSign ? `星座(${TOPIC_JA[t]}): ${topicText}` : '',
          (zodiacSign && t !== 'general') ? `星座(総合): ${generalText}` : '',
          blood ? `血液型: ${blood.text}` : '',
          tarotWithPos.map((c: any) => `${c.position}=${c.name}(${c.orientation})`).join(' / '),
        ].filter(Boolean).join('\n');

        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 260,
          system: [{ type: 'text', text: personaSystemPrefix(personaKey) + CONCLUSION_SYSTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: context }],
        });
        const block = msg.content[0];
        if (block.type === 'text') {
          const raw = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
          const parsed = JSON.parse(raw.slice(raw.indexOf('{')));
          conclusion = parsed.conclusion_ja ?? '';
          summary = parsed.summary_ja ?? '';
        }
        // A단계: 생성 결과 저장 → 다음 같은 조합은 재사용 (실패해도 응답에는 영향 없음)
        if (conclusion || summary) {
          try {
            await supabaseAdmin.from('fortune_cache').upsert(
              { cache_key: cacheKey, conclusion_ja: conclusion, summary_ja: summary },
              { onConflict: 'cache_key' }
            );
          } catch { /* noop */ }
        }
      } catch { conclusion = ''; summary = ''; }
    }

    return NextResponse.json({
      date: dateStr,
      topic: t, topicJa: TOPIC_JA[t],
      conclusion, summary,
      zodiacText: topicText,
      lucky,              // { color, number, item } ← F: 매일 바뀌는 체감 요소
      zodiacAdvice: advice,
      blood,
      tarot: tarotWithPos,
      hasZodiac: !!zodiacSign, hasBlood: !!bloodType,
    });
  } catch (err) {
    console.error('[fortune/result] fatal:', err);
    return NextResponse.json(
      { error: 'internal', topic: 'general', topicJa: '総合運', conclusion: '', summary: '',
        zodiacText: '', lucky: {}, zodiacAdvice: '', blood: null, tarot: [], hasZodiac: false, hasBlood: false },
      { status: 500 } // 클라이언트는 data.error로 판단하므로 상태코드 변경은 호환됨
    );
  }
}
