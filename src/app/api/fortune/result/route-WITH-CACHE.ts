// src/app/api/fortune/result/route.ts  (캐시 적용 버전)
// 흐름: 캐시키 생성 → 캐시 HIT면 저장된 summary 반환(Claude 호출 0) → MISS면 생성 후 저장
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { headers } from 'next/headers';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ['general', 'love', 'money', 'work'] as const;
const SUMMARY_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
与えられた星座・タロット・血液型の結果を踏まえ、今日一日への総合的な励ましを
2〜3文の自然な日本語で書いてください。JSON形式のみ:{"summary_ja":""}`;
const GENDER_JA: Record<string, string | null> = { male: '男性', female: '女性', na: null };

// ── 캐시키: 종합문에 영향을 주는 입력만 정규화해 해시 ──
// 날짜를 넣어 "그날의 조합"으로 한정(운세는 날짜 개념이 있으므로 자연스럽고, 캐시도 하루 단위로 갱신)
function makeFortuneCacheKey(input: {
  date: string; zodiacSign: string | null; bloodType: string | null;
  gender: string | null; tarot: any[];
}) {
  const tarotKey = input.tarot
    .slice(0, 3)
    .map((c) => `${c.card_key}:${c.orientation}`)
    .join(',');
  const raw = [input.date, input.zodiacSign ?? '-', input.bloodType ?? '-', input.gender ?? '-', tarotKey].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { zodiacSign, bloodType, gender, tarotShuffleResult, lang = 'ja' } = await req.json();

    try {
      const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
      const id = crypto.createHash('sha256').update(ip).digest('hex');
      const today = new Date().toISOString().slice(0, 10);
      await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: today });
    } catch {}

    // 별자리/혈액형 DB (생략 없이 기존과 동일)
    const astrology: Record<string, any> = {};
    if (zodiacSign) {
      try {
        const { data } = await supabaseAdmin
          .from('astrology_interpretations')
          .select('category, text_ja, text_ko, lucky_color, lucky_number')
          .eq('sign_code', zodiacSign);
        for (const cat of CATEGORIES) {
          const row = data?.find((d) => d.category === cat);
          astrology[cat] = row
            ? { text: lang === 'ja' ? row.text_ja : row.text_ko, lucky_color: row.lucky_color, lucky_number: row.lucky_number }
            : null;
        }
      } catch {}
    }
    let blood = null;
    if (bloodType) {
      try {
        const { data } = await supabaseAdmin
          .from('blood_type_interpretations')
          .select('text_ja, text_ko, advice_ja, advice_ko')
          .eq('blood_type', bloodType).single();
        if (data) blood = { text: lang === 'ja' ? data.text_ja : data.text_ko, advice: lang === 'ja' ? data.advice_ja : data.advice_ko };
      } catch {}
    }

    const tarot = (tarotShuffleResult ?? []).slice(0, 3);
    const positions = ['過去', '現在', '未来'];
    const tarotWithPos = tarot.map((c: any, i: number) => ({ ...c, position: positions[i] }));

    // ── ① 캐시 조회 ──
    const today = new Date().toISOString().slice(0, 10);
    const cacheKey = makeFortuneCacheKey({ date: today, zodiacSign, bloodType, gender, tarot });
    let summary = '';
    let cacheHit = false;
    try {
      const { data: cached } = await supabaseAdmin
        .from('fortune_cache')
        .select('summary_ja, summary_ko')
        .eq('cache_key', cacheKey)
        .single();
      if (cached) {
        summary = lang === 'ja' ? cached.summary_ja : cached.summary_ko;
        cacheHit = true;
        await supabaseAdmin.rpc('touch_fortune_cache', { p_key: cacheKey }); // hit_count++
      }
    } catch { /* 캐시 미스 = 정상 */ }

    // ── ② 캐시 MISS일 때만 Claude 호출 ──
    if (!cacheHit) {
      try {
        const genderJa = gender ? GENDER_JA[gender] : null;
        const context = [
          genderJa ? `性別: ${genderJa}` : '',
          zodiacSign ? `星座(総合): ${astrology.general?.text ?? ''}` : '',
          blood ? `血液型: ${blood.text}` : '',
          tarotWithPos.map((c: any) => `${c.position}=${c.name}(${c.orientation})`).join(' / '),
        ].filter(Boolean).join('\n');

        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: [{ type: 'text', text: SUMMARY_SYSTEM, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: context }],
        });
        const block = msg.content[0];
        if (block.type === 'text') {
          const t = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
          summary = JSON.parse(t.slice(t.indexOf('{'))).summary_ja ?? '';
        }
        // ── ③ 생성 결과 캐시에 저장 (다음 사람은 재사용) ──
        if (summary) {
          await supabaseAdmin.from('fortune_cache')
            .upsert({ cache_key: cacheKey, summary_ja: summary, summary_ko: summary }, { onConflict: 'cache_key' });
          // ※ 지금은 ja만 생성. ko도 쓰려면 프롬프트에 ko 필드를 추가해 함께 저장.
        }
      } catch { summary = ''; }
    }

    return NextResponse.json({
      categories: CATEGORIES.map((cat) => ({ key: cat, ...(astrology[cat] ?? {}) })),
      blood, tarot: tarotWithPos, summary,
      hasZodiac: !!zodiacSign, hasBlood: !!bloodType,
      _cache: cacheHit ? 'hit' : 'miss', // 디버그용(원하면 제거)
    });
  } catch (err) {
    console.error('[fortune/result] fatal:', err);
    return NextResponse.json(
      { error: 'internal', categories: [], blood: null, tarot: [], summary: '', hasZodiac: false, hasBlood: false },
      { status: 200 }
    );
  }
}
