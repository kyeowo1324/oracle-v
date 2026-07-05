// src/app/api/decision/result/route.ts
// 한다·안한다(する・しない) 결과
// 판정·확신도는 타로 정/역 방향 기반(DB 조회, AI 호출 0). AI는 마지막 조언 한 문단만.
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { callClaudeJSON } from '@/lib/claude';
import { headers } from 'next/headers';
import crypto from 'crypto';

const GENDER_JA: Record<string, string | null> = { male: '男性', female: '女性', na: null };

const ADVICE_SYSTEM = `あなたは「Oracle V」の占いガイドです。
ユーザーの「する・しない」の迷いに対し、タロット・星座・血液型の結果を踏まえた
背中を押す短いアドバイスを2〜3文の日本語で書いてください。
断定しすぎず、最終判断は本人に委ねる温かいトーン。JSON形式のみ:{"advice_ja":""}`;

export async function POST(req: Request) {
  const { zodiacSign, bloodType, gender, question, tarotShuffleResult, lang = 'ja' } =
    await req.json();

  // 레이트리밋(IP 일일 카운트)
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const id = crypto.createHash('sha256').update(ip).digest('hex');
  const today = new Date().toISOString().slice(0, 10);
  await supabaseAdmin.rpc('increment_ai_call', { p_id: id, p_date: today }).catch(() => {});

  // 1) 타로 3장 (과거·현재·미래)
  const tarot = (tarotShuffleResult ?? []).slice(0, 3);
  const positions = ['過去', '現在', '未来'];
  const tarotWithPos = tarot.map((c: any, i: number) => ({ ...c, position: positions[i] }));

  // 2) 판정 + 확신도 (DB/로직만, AI 호출 없음)
  const weights = [1, 1, 1.5]; // 미래 카드에 가중
  let score = 0, max = 0;
  tarotWithPos.forEach((c: any, i: number) => {
    score += (c.orientation === 'upright' ? 1 : -1) * weights[i];
    max += weights[i];
  });
  const confidence = max > 0 ? Math.round(((score + max) / (2 * max)) * 100) : 50;
  const verdict = confidence >= 55 ? 'する' : confidence <= 45 ? 'しない' : 'どちらでも';

  // 3) 별자리 종합운 / 혈액형 (있으면 컨텍스트로만)
  let astrologyGeneral = '';
  if (zodiacSign) {
    const { data } = await supabaseAdmin
      .from('astrology_interpretations')
      .select('text_ja, text_ko')
      .eq('sign_code', zodiacSign).eq('category', 'general').single();
    astrologyGeneral = data ? (lang === 'ja' ? data.text_ja : data.text_ko) : '';
  }
  let bloodText = '';
  if (bloodType) {
    const { data } = await supabaseAdmin
      .from('blood_type_interpretations')
      .select('text_ja, text_ko')
      .eq('blood_type', bloodType).single();
    bloodText = data ? (lang === 'ja' ? data.text_ja : data.text_ko) : '';
  }

  // 4) AI 조언 한 문단 (짧게, 캐싱)
  const genderJa = gender ? GENDER_JA[gender] : null;
  const context = [
    question ? `相談: ${question}` : '',
    genderJa ? `性別: ${genderJa}` : '',
    `占い結果: ${verdict}（確信度${confidence}%）`,
    tarotWithPos.map((c: any) => `${c.position}=${c.name}(${c.orientation === 'upright' ? '正' : '逆'})`).join(' / '),
    astrologyGeneral ? `星座: ${astrologyGeneral}` : '',
    bloodText ? `血液型: ${bloodText}` : '',
  ].filter(Boolean).join('\n');

  let advice = '';
  try {
    const r = await callClaudeJSON({ system: ADVICE_SYSTEM, user: context, maxTokens: 200 });
    advice = r.advice_ja ?? '';
  } catch {
    advice = '';
  }

  return NextResponse.json({
    verdict,
    confidence,
    question: question ?? '',
    tarot: tarotWithPos,
    advice,
    hasZodiac: !!zodiacSign,
    hasBlood: !!bloodType,
  });
}
