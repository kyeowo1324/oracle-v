// src/app/api/weekly/route.ts
// 今週の運勢 — 별자리별 주간 운세. 기존 astrology_interpretations 재사용.
// AI 호출 없음(정적 데이터에서 주 단위 결정론 선택), 비용 $0.
//
// 오늘의 운세(pickVariant에 날짜)와 달리, "주"를 키로 써서 월~일 같은 결과를 유지.
// 3개 카테고리(총합/연애/일)를 한 번에 반환해 주간 카드형으로 표시.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getJstDateString, pickVariant } from '@/lib/daily';

export const revalidate = 3600;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ZODIAC = new Set([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);
const CATS = ['general', 'love', 'work'] as const;
const CAT_JA: Record<string, string> = { general: '総合運', love: '恋愛運', work: '仕事運' };

// ISO 주 문자열 (그 주 월요일의 날짜) — 주 단위 결정론 키
function weekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = (d.getUTCDay() + 6) % 7; // 월=0
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sign = searchParams.get('sign') ?? '';
  if (!ZODIAC.has(sign)) return NextResponse.json({ error: 'need_sign' }, { status: 400 });

  const wk = weekKey(getJstDateString());

  try {
    const out: Record<string, { text: string; lucky_color?: string; lucky_number?: number; lucky_item?: string }> = {};
    for (const cat of CATS) {
      const { data } = await supabase
        .from('astrology_interpretations')
        .select('variant, text_ja, lucky_color, lucky_number, lucky_item_ja')
        .eq('sign_code', sign).eq('category', cat)
        .order('variant', { ascending: true });
      if (data && data.length) {
        // 주 + 별자리 + 카테고리로 결정론 선택 → 그 주 내내 동일
        const idx = pickVariant(wk, `weekly_${sign}_${cat}`, data.length);
        const row = data[idx] ?? data[0];
        out[cat] = {
          text: row.text_ja,
          lucky_color: row.lucky_color,
          lucky_number: row.lucky_number,
          lucky_item: row.lucky_item_ja,
        };
      }
    }
    return NextResponse.json({
      sign, week: wk,
      categories: CATS.map((c) => ({ key: c, ja: CAT_JA[c], ...out[c] })).filter((c) => c.text),
    });
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 500 });
  }
}
