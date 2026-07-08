// src/app/api/fortune/result/route.ts
// A+B+F 적용:
//   A) 별자리·혈액형 텍스트를 날짜+별자리 해시로 그날 variant 선택 → 매일 바뀜, 당일 일관
//   F) lucky_item/advice를 함께 반환 → "매일 갱신" 체감
//   B) 결론(conclusion) 프롬프트에 날짜 반영 → AI 부분도 매일 다름
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getJstDateString, pickVariant } from '@/lib/daily';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ALL_CATEGORIES = ['general', 'love', 'money', 'work', 'health', 'relationship'] as const;
type Topic = typeof ALL_CATEGORIES[number];
const TOPIC_JA: Record<Topic, string> = {
  general: '総合運', love: '恋愛運', money: '金運',
  work: '仕事・学業運', health: '健康運', relationship: '対人運',
};
const GENDER_JA: Record<string, string | null> = { male: '男性', female: '女性', na: null };

const CONCLUSION_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
指定された日付とテーマについて、星座・タロット(過去/現在/未来)・血液型の結果をふまえ、
今日の「結論」を最初に一言で示し、続けて2〜3文で理由を添えてください。
日付ごとに切り口を変え、前向きなトーンで。JSON形式のみ:{"conclusion_ja":"","summary_ja":""}`;

// 그날의 variant를 골라 해당 행을 반환하는 헬퍼
async function pickAstroRow(sign: string, category: string, dateStr: string) {
  // 해당 (sign, category)의 모든 variant를 가져와, 날짜 해시로 하나 선택
  const { data } = await supabaseAdmin
    .from('astrology_interpretations')
    .select('variant, text_ja, text_ko, lucky_color, lucky_number, lucky_item_ja, lucky_item_ko, advice_ja, advice_ko')
    .eq('sign_code', sign).eq('category', category)
    .order('variant', { ascending: true });
  if (!data || data.length === 0) return null;
  const idx = pickVariant(dateStr, `${sign}_${category}`, data.length);
  return data[idx] ?? data[0];
}

export async function POST(req: Request) {
  try {
    const { topic = 'general', zodiacSign, bloodType, gender, tarotShuffleResult, lang = 'ja' } = await req.json();
    const t: Topic = (ALL_CATEGORIES as readonly string[]).includes(topic) ? topic : 'general';
    const dateStr = getJstDateString();

    try {
      const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
      const id = crypto.createHash('sha256').update(ip).digest('hex');
      await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: dateStr });
    } catch { /* noop */ }

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
    let blood = null;
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

    // 3) 타로 3장
    const tarot = (tarotShuffleResult ?? []).slice(0, 3);
    const positions = ['過去', '現在', '未来'];
    const tarotWithPos = tarot.map((c: any, i: number) => ({ ...c, position: positions[i] }));

    // 4) 결론 + 요약 (날짜 반영)
    let conclusion = '', summary = '';
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
        system: [{ type: 'text', text: CONCLUSION_SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: context }],
      });
      const block = msg.content[0];
      if (block.type === 'text') {
        const raw = block.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
        const parsed = JSON.parse(raw.slice(raw.indexOf('{')));
        conclusion = parsed.conclusion_ja ?? '';
        summary = parsed.summary_ja ?? '';
      }
    } catch { conclusion = ''; summary = ''; }

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
      { status: 200 }
    );
  }
}
