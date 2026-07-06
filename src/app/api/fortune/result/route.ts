// src/app/api/fortune/result/route.ts
// 오늘의 운세 결과: 별자리 4카테고리(DB) + 타로 3장(전달받음) + 혈액형(DB) + Claude 종합 한 문단
// ★ 전체를 try/catch로 감싸 어떤 예외에도 반드시 JSON을 반환(빈 응답 → 'Unexpected end of JSON input' 방지)
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

export async function POST(req: Request) {
  try {
    const { zodiacSign, bloodType, gender, tarotShuffleResult, lang = 'ja' } = await req.json();

    // 레이트리밋(실패 허용)
    try {
      const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
      const id = crypto.createHash('sha256').update(ip).digest('hex');
      const today = new Date().toISOString().slice(0, 10);
      await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: today });
    } catch { /* noop */ }

    // 1) 별자리 4카테고리
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
      } catch { /* DB 실패해도 진행 */ }
    }

    // 2) 혈액형
    let blood = null;
    if (bloodType) {
      try {
        const { data } = await supabaseAdmin
          .from('blood_type_interpretations')
          .select('text_ja, text_ko, advice_ja, advice_ko')
          .eq('blood_type', bloodType)
          .single();
        if (data) blood = { text: lang === 'ja' ? data.text_ja : data.text_ko, advice: lang === 'ja' ? data.advice_ja : data.advice_ko };
      } catch { /* noop */ }
    }

    // 3) 타로 3장
    const tarot = (tarotShuffleResult ?? []).slice(0, 3);
    const positions = ['過去', '現在', '未来'];
    const tarotWithPos = tarot.map((c: any, i: number) => ({ ...c, position: positions[i] }));

    // 4) Claude 종합 한 문단 (실패해도 빈 문자열로 계속)
    let summary = '';
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
    } catch { summary = ''; }

    return NextResponse.json({
      categories: CATEGORIES.map((cat) => ({ key: cat, ...(astrology[cat] ?? {}) })),
      blood,
      tarot: tarotWithPos,
      summary,
      hasZodiac: !!zodiacSign,
      hasBlood: !!bloodType,
    });
  } catch (err) {
    // 무슨 일이 있어도 JSON을 반환 → 프론트의 r.json()이 깨지지 않음
    console.error('[fortune/result] fatal:', err);
    return NextResponse.json(
      { error: 'internal', categories: [], blood: null, tarot: [], summary: '', hasZodiac: false, hasBlood: false },
      { status: 200 }
    );
  }
}
