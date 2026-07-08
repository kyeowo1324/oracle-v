// scripts/seed-topics.ts
// health / relationship 2개 주제의 별자리 해석(각 12 = 24건)을 생성해 적재.
// 기존 seed-sync.ts와 같은 패턴. 실행: npx tsx scripts/seed-topics.ts
//
// 왜 별도 스크립트인가: general/love/money/work 4개는 이미 DB에 있으므로
// 새로 추가된 health/relationship 2개만 채우면 됨(불필요한 재생성 방지 = 비용 절약).

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const REQUIRED = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of REQUIRED) if (!process.env[k]) { console.error(`환경변수 누락: ${k}`); process.exit(1); }

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MODEL = 'claude-haiku-4-5-20251001';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ZODIAC = [
  { code: 'aries', ja: '牡羊座', element: '火' }, { code: 'taurus', ja: '牡牛座', element: '地' },
  { code: 'gemini', ja: '双子座', element: '風' }, { code: 'cancer', ja: '蟹座', element: '水' },
  { code: 'leo', ja: '獅子座', element: '火' }, { code: 'virgo', ja: '乙女座', element: '地' },
  { code: 'libra', ja: '天秤座', element: '風' }, { code: 'scorpio', ja: '蠍座', element: '水' },
  { code: 'sagittarius', ja: '射手座', element: '火' }, { code: 'capricorn', ja: '山羊座', element: '地' },
  { code: 'aquarius', ja: '水瓶座', element: '風' }, { code: 'pisces', ja: '魚座', element: '水' },
];

// 새로 추가하는 2개 주제만
const NEW_CATEGORIES: Record<string, string> = {
  health: '健康運（体調・メンタル・生活習慣）',
  relationship: '対人運（友人・家族・職場の人間関係）',
};

function extractJSON(text: string): any {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = t.indexOf('{');
  if (first !== -1) t = t.slice(first);
  try { return JSON.parse(t); } catch {}
  const last = t.lastIndexOf('",');
  if (last !== -1) { try { return JSON.parse(t.slice(0, last) + '"}'); } catch {} }
  throw new Error('JSON 파싱 실패');
}

async function callClaude(system: string, user: string, label: string) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL, max_tokens: 500,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }, { role: 'assistant', content: '{' }],
      });
      const block = msg.content[0];
      return extractJSON('{' + (block.type === 'text' ? block.text : ''));
    } catch (e: any) {
      console.error(`  [${label}] 시도 ${attempt}/5 실패: ${e.message ?? e}`);
      await sleep(500);
    }
  }
  return {};
}

async function main() {
  console.log('=== health / relationship 24건 생성 ===');
  const rows: any[] = [];
  let n = 0;
  for (const cat of Object.keys(NEW_CATEGORIES)) {
    for (const z of ZODIAC) {
      n++;
      const sys = `日本の占いアプリ向け、${z.ja}(${z.element}属性)の「${NEW_CATEGORIES[cat]}」の今日の運勢を作成。
温かく前向きなトーン、60-100字。エンターテインメント目的。
JSON形式のみ:{"text_ja":"","text_ko":"","lucky_color":"","lucky_number":0}`;
      const r = await callClaude(sys, `${z.ja} / ${cat} の運勢文を生成`, `${n}/24`);
      console.log(`  ${n}/24 ${z.code}/${cat}: ${r.text_ja ? 'OK' : '빈값'}`);
      rows.push({
        sign_code: z.code, category: cat,
        text_ja: r.text_ja, text_ko: r.text_ko,
        lucky_color: r.lucky_color, lucky_number: r.lucky_number,
      });
      await sleep(400);
    }
  }

  const empty = rows.filter((r) => !r.text_ja);
  if (empty.length) {
    console.warn(`⚠️ 빈값 ${empty.length}건 — 적재 중단. 재실행 권장.`);
    return;
  }

  // 기존 health/relationship 데이터가 있으면 지우고 새로 넣기(중복 방지)
  await supabase.from('astrology_interpretations').delete().in('category', ['health', 'relationship']);
  const { error } = await supabase.from('astrology_interpretations').insert(rows);
  if (error) { console.error('적재 오류:', error.message); return; }
  console.log('✅ health/relationship 24건 적재 완료');
}

main().catch((e) => { console.error(e); process.exit(1); });
