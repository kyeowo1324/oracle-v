// src/app/api/lucky/route.ts
// 今日のラッキーアイテム — 별자리(+혈액형) 기반 오늘의 럭키 요소.
// astrology_interpretations의 lucky_* 를 날짜 결정론으로 뽑고,
// 방각(방위)·시간대는 코드로 결정론 계산. AI 없음, 비용 $0.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getJstDateString, pickVariant } from '@/lib/daily';

export const revalidate = 1800;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ZODIAC = new Set([
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
]);
const BLOODS = new Set(['A', 'B', 'O', 'AB']);

const DIRECTIONS = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'];
const TIMES = ['朝（6〜9時）', '午前（9〜12時）', '昼（12〜15時）', '夕方（15〜18時）', '夜（18〜21時）', '深夜（21〜24時）'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sign = searchParams.get('sign') ?? '';
  const blood = searchParams.get('blood') ?? '';
  if (!ZODIAC.has(sign)) return NextResponse.json({ error: 'need_sign' }, { status: 400 });

  const date = getJstDateString();
  const salt = BLOODS.has(blood) ? `_${blood}` : '';

  let color = '', item = '';
  let num = 0;
  try {
    const { data } = await supabase
      .from('astrology_interpretations')
      .select('variant, lucky_color, lucky_number, lucky_item_ja')
      .eq('sign_code', sign).eq('category', 'general')
      .order('variant', { ascending: true });
    if (data && data.length) {
      const idx = pickVariant(date, `lucky_${sign}${salt}`, data.length);
      const row = data[idx] ?? data[0];
      color = row.lucky_color ?? '';
      num = row.lucky_number ?? 0;
      item = row.lucky_item_ja ?? '';
    }
  } catch { /* 폴백은 아래 코드 계산으로 */ }

  // 방각·시간대는 날짜+별자리(+혈액형)로 결정론 계산 (DB 불필요)
  const dir = DIRECTIONS[pickVariant(date, `dir_${sign}${salt}`, DIRECTIONS.length)];
  const time = TIMES[pickVariant(date, `time_${sign}${salt}`, TIMES.length)];

  return NextResponse.json({
    sign, date,
    lucky: { color, number: num, item, direction: dir, time },
  });
}
