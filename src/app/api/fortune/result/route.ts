// src/app/api/fortune/result/route.ts
// 오늘의 운세 결과: 별자리 4카테고리(DB) + 타로 3장(전달받음) + 혈액형(DB) + Claude 종합 한 문단
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

// 종합 한 문단 생성용 공통 시스템 프롬프트 (캐싱 대상)
const SUMMARY_SYSTEM = `あなたは「Oracle V」の温かい占いガイドです。
与えられた星座・タロット・血液型の結果を踏まえ、今日一日への総合的な励ましを
2〜3文の自然な日本語で書いてください。JSON形式のみ:{"summary_ja":""}`;

const GENDER_JA: Record<string, string | null> = { male: '男性', female: '女性', na: null };

export async function POST(req: Request) {
  const { zodiacSign, bloodType, gender, tarotShuffleResult, lang = 'ja' } = await req.json();

  // ── 간단 레이트리밋 (IP 기준 일일 카운트) ──
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const id = crypto.createHash('sha256').update(ip).digest('hex');
  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: today }).catch(() => {});

  // ── 1) 별자리 4카테고리 (스킵했으면 null) ──
  let astrology: Record<string, any> = {};
  if (zodiacSign) {
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
  }

  // ── 2) 혈액형 (스킵했으면 null) ──
  let blood = null;
  if (bloodType) {
    const { data } = await supabaseAdmin
      .from('blood_type_interpretations')
      .select('text_ja, text_ko, advice_ja, advice_ko')
      .eq('blood_type', bloodType)
      .single();
    if (data) blood = { text: lang === 'ja' ? data.text_ja : data.text_ko, advice: lang === 'ja' ? data.advice_ja : data.advice_ko };
  }

  // ── 3) 타로 3장 (draw API 결과를 그대로 전달받아 사용) ──
  const tarot = (tarotShuffleResult ?? []).slice(0, 3);
  const positions = ['過去', '現在', '未来'];
  const tarotWithPos = tarot.map((c: any, i: number) => ({ ...c, position: positions[i] }));

  // ── 4) Claude 종합 한 문단 (DB 텍스트를 컨텍스트로, 짧게) ──
  const genderJa = gender ? GENDER_JA[gender] : null; // 답하지 않음(na)이면 컨텍스트에서 생략
  const context = [
    genderJa ? `性別: ${genderJa}` : '',
    zodiacSign ? `星座(総合): ${astrology.general?.text ?? ''}` : '',
    blood ? `血液型: ${blood.text}` : '',
    tarotWithPos.map((c: any) => `${c.position}=${c.name}(${c.orientation})`).join(' / '),
  ].filter(Boolean).join('\n');

  let summary = '';
  try {
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
  } catch {
    summary = ''; // AI 실패해도 나머지 결과는 정상 반환
  }

  return NextResponse.json({
    categories: CATEGORIES.map((cat) => ({ key: cat, ...(astrology[cat] ?? {}) })),
    blood,
    tarot: tarotWithPos,
    summary,
    hasZodiac: !!zodiacSign,
    hasBlood: !!bloodType,
  });
}
