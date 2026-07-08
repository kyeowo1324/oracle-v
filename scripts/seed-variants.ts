// scripts/seed-variants.ts
// 방법 A+F 데이터 생성: 카테고리당 7변형(variant 0~6), 럭키아이템·한마디 포함.
//   별자리: 12 × 6주제 × 7 = 504건
//   혈액형: 4 × 7 = 28건
// 부분 실행: npx tsx scripts/seed-variants.ts astro   (또는 blood / all)
// 전체:     npx tsx scripts/seed-variants.ts
//
// ⚠️ 호출량이 많음(532건). Batch가 아닌 순차 호출이라 시간이 걸림(약 10~20분).
//    중간에 끊겨도 소스별(astro/blood) 재실행하면 해당 소스만 다시 함.

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const REQUIRED = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const k of REQUIRED) if (!process.env[k]) { console.error(`환경변수 누락: ${k}`); process.exit(1); }

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MODEL = 'claude-haiku-4-5-20251001';
const VARIANTS = 7;          // 카테고리당 변형 수(주간 로테이션)
const DELAY_MS = 350;
const MAX_RETRIES = 5;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ZODIAC = [
  { code: 'aries', ja: '牡羊座', element: '火' }, { code: 'taurus', ja: '牡牛座', element: '地' },
  { code: 'gemini', ja: '双子座', element: '風' }, { code: 'cancer', ja: '蟹座', element: '水' },
  { code: 'leo', ja: '獅子座', element: '火' }, { code: 'virgo', ja: '乙女座', element: '地' },
  { code: 'libra', ja: '天秤座', element: '風' }, { code: 'scorpio', ja: '蠍座', element: '水' },
  { code: 'sagittarius', ja: '射手座', element: '火' }, { code: 'capricorn', ja: '山羊座', element: '地' },
  { code: 'aquarius', ja: '水瓶座', element: '風' }, { code: 'pisces', ja: '魚座', element: '水' },
];
const CATEGORIES: Record<string, string> = {
  general: '総合運', love: '恋愛運', money: '金運',
  work: '仕事・学業運', health: '健康運（体調・メンタル）', relationship: '対人運（人間関係）',
};
const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const;

function extractJSON(text: string): any {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = t.indexOf('{'); if (first !== -1) t = t.slice(first);
  try { return JSON.parse(t); } catch {}
  const last = t.lastIndexOf('",');
  if (last !== -1) { try { return JSON.parse(t.slice(0, last) + '"}'); } catch {} }
  throw new Error('JSON 파싱 실패');
}

async function callClaude(system: string, user: string, label: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL, max_tokens: 500,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }, { role: 'assistant', content: '{' }],
      });
      const block = msg.content[0];
      return extractJSON('{' + (block.type === 'text' ? block.text : ''));
    } catch (e: any) {
      console.error(`  [${label}] 시도 ${attempt}/${MAX_RETRIES} 실패: ${e.message ?? e}`);
      await sleep(600);
    }
  }
  return {};
}

async function seedAstro() {
  console.log(`=== 별자리 ${12 * 6 * VARIANTS}건 생성 (variant ${VARIANTS}개) ===`);
  const rows: any[] = [];
  let n = 0;
  const total = 12 * 6 * VARIANTS;
  for (const z of ZODIAC) {
    for (const cat of Object.keys(CATEGORIES)) {
      for (let v = 0; v < VARIANTS; v++) {
        n++;
        const sys = `日本の占いアプリ向け、${z.ja}(${z.element}属性)の「${CATEGORIES[cat]}」の運勢文を作成。
温かく前向き、エンタメ目的、60-100字。バリエーション${v + 1}(他の日と重複しない独自の切り口で)。
JSON形式のみ:{"text_ja":"","text_ko":"","lucky_color":"(和名の色)","lucky_number":0,"lucky_item_ja":"(小物1つ)","lucky_item_ko":"","advice_ja":"(一言アドバイス)","advice_ko":""}`;
        const r = await callClaude(sys, `${z.ja} / ${cat} / variant${v}`, `${n}/${total}`);
        if (n % 20 === 0) console.log(`  진행 ${n}/${total}`);
        rows.push({
          sign_code: z.code, category: cat, variant: v,
          text_ja: r.text_ja, text_ko: r.text_ko,
          lucky_color: r.lucky_color, lucky_number: r.lucky_number,
          lucky_item_ja: r.lucky_item_ja, lucky_item_ko: r.lucky_item_ko,
          advice_ja: r.advice_ja, advice_ko: r.advice_ko,
        });
        await sleep(DELAY_MS);
      }
    }
  }
  const empty = rows.filter((r) => !r.text_ja);
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/_variants_astro.json', JSON.stringify(rows, null, 2));
  if (empty.length) { console.warn(`⚠️ 빈값 ${empty.length}건 → 적재 중단. 재실행 권장(백업 저장됨).`); return; }

  await supabase.from('astrology_interpretations').delete().not('id', 'is', null);
  // 배치로 나눠 insert (한 번에 504건은 안전하게 분할)
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from('astrology_interpretations').insert(rows.slice(i, i + 100));
    if (error) { console.error('별자리 적재 오류:', error.message); return; }
  }
  console.log(`✅ 별자리 ${rows.length}건 적재 완료`);
}

async function seedBlood() {
  console.log(`=== 혈액형 ${4 * VARIANTS}건 생성 ===`);
  const rows: any[] = [];
  let n = 0;
  for (const bt of BLOOD_TYPES) {
    for (let v = 0; v < VARIANTS; v++) {
      n++;
      const sys = `日本で語られる${bt}型の性格通念をふまえ、エンタメ目的の今日の運勢を作成。バリエーション${v + 1}。
JSON形式のみ:{"text_ja":"(80-120字)","text_ko":"","advice_ja":"","advice_ko":""}`;
      const r = await callClaude(sys, `${bt}型 / variant${v}`, `${n}/${4 * VARIANTS}`);
      rows.push({
        blood_type: bt, variant: v,
        text_ja: r.text_ja, text_ko: r.text_ko,
        advice_ja: r.advice_ja, advice_ko: r.advice_ko,
      });
      await sleep(DELAY_MS);
    }
  }
  const empty = rows.filter((r) => !r.text_ja);
  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/_variants_blood.json', JSON.stringify(rows, null, 2));
  if (empty.length) { console.warn(`⚠️ 빈값 ${empty.length}건 → 적재 중단.`); return; }

  await supabase.from('blood_type_interpretations').delete().not('id', 'is', null);
  const { error } = await supabase.from('blood_type_interpretations').insert(rows);
  if (error) { console.error('혈액형 적재 오류:', error.message); return; }
  console.log(`✅ 혈액형 ${rows.length}건 적재 완료`);
}

async function main() {
  const arg = process.argv[2] ?? 'all';
  if (arg === 'astro' || arg === 'all') await seedAstro();
  if (arg === 'blood' || arg === 'all') await seedBlood();
  console.log('=== 완료 ===');
}

main().catch((e) => { console.error(e); process.exit(1); });
