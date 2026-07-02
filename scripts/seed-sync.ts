// scripts/seed-sync.ts  (v3)
// 변경점:
//  1) 소스별 독립 처리 — 타로 78건 다 채워지면 타로만 적재, 별자리 48건 다 채워지면 별자리만 적재, 혈액형도 동일
//  2) 재시도 20회
//  3) max_tokens 상향 + 잘림 감지(Unterminated string 원인) — 타로 900, 별자리 500, 혈액형 600
//  4) 잘린 JSON 복구 파서(최후 안전망) + prefill + 코드펜스 제거
//  5) 소스별 부분 실행:  npx tsx scripts/seed-sync.ts tarot   (또는 astro / blood / all)
// 실행(전체): npx tsx scripts/seed-sync.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const REQUIRED_ENV = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) { console.error(`환경변수 누락: ${key}`); process.exit(1); }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const MODEL = 'claude-haiku-4-5-20251001';
const DELAY_MS = 400;
const MAX_RETRIES = 20;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── JSON 파서: 코드펜스 제거 → 정상 parse → 실패 시 잘린 부분 복구 ──
function extractJSON(text: string): any {
  let t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const first = t.indexOf('{');
  if (first !== -1) t = t.slice(first);
  try { return JSON.parse(t); } catch {}
  const lastComplete = t.lastIndexOf('",');
  if (lastComplete !== -1) {
    try { return JSON.parse(t.slice(0, lastComplete) + '"}'); } catch {}
  }
  throw new Error('JSON 파싱/복구 실패');
}

async function callClaude(system: string, userMsg: string, maxTokens: number, label: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [
          { role: 'user', content: userMsg },
          { role: 'assistant', content: '{' }, // prefill
        ],
      });
      const block = msg.content[0];
      const raw = block.type === 'text' ? block.text : '';
      if (msg.stop_reason === 'max_tokens' && attempt < MAX_RETRIES) {
        console.error(`  [${label}] 시도 ${attempt}/${MAX_RETRIES}: max_tokens 도달로 잘림, 재시도`);
        await sleep(300);
        continue;
      }
      return extractJSON('{' + raw);
    } catch (err: any) {
      if (attempt < MAX_RETRIES) {
        console.error(`  [${label}] 시도 ${attempt}/${MAX_RETRIES} 실패: ${err.message ?? err}`);
        await sleep(500);
      }
    }
  }
  console.error(`  [${label}] ${MAX_RETRIES}회 실패 — 빈 값`);
  return {};
}

async function fetchTarotSource() {
  const res = await fetch('https://tarotapi.dev/api/v1/cards');
  if (!res.ok) throw new Error(`tarotapi.dev 응답 실패: ${res.status}`);
  const data = await res.json();
  return data.cards as Array<{ name: string; name_short: string; suit?: string; type: string; meaning_up: string; meaning_rev: string }>;
}

const ZODIAC_MASTER = [
  { code: 'aries', ja: '牡羊座', ko: '양자리', dateFrom: '3/21', dateTo: '4/19', element: 'fire' },
  { code: 'taurus', ja: '牡牛座', ko: '황소자리', dateFrom: '4/20', dateTo: '5/20', element: 'earth' },
  { code: 'gemini', ja: '双子座', ko: '쌍둥이자리', dateFrom: '5/21', dateTo: '6/20', element: 'air' },
  { code: 'cancer', ja: '蟹座', ko: '게자리', dateFrom: '6/21', dateTo: '7/22', element: 'water' },
  { code: 'leo', ja: '獅子座', ko: '사자자리', dateFrom: '7/23', dateTo: '8/22', element: 'fire' },
  { code: 'virgo', ja: '乙女座', ko: '처녀자리', dateFrom: '8/23', dateTo: '9/22', element: 'earth' },
  { code: 'libra', ja: '天秤座', ko: '천칭자리', dateFrom: '9/23', dateTo: '10/22', element: 'air' },
  { code: 'scorpio', ja: '蠍座', ko: '전갈자리', dateFrom: '10/23', dateTo: '11/21', element: 'water' },
  { code: 'sagittarius', ja: '射手座', ko: '사수자리', dateFrom: '11/22', dateTo: '12/21', element: 'fire' },
  { code: 'capricorn', ja: '山羊座', ko: '염소자리', dateFrom: '12/22', dateTo: '1/19', element: 'earth' },
  { code: 'aquarius', ja: '水瓶座', ko: '물병자리', dateFrom: '1/20', dateTo: '2/18', element: 'air' },
  { code: 'pisces', ja: '魚座', ko: '물고기자리', dateFrom: '2/19', dateTo: '3/20', element: 'water' },
];
const ASTRO_CATEGORIES = ['general', 'love', 'money', 'work'] as const;
const BLOOD_TYPES = ['A', 'B', 'O', 'AB'] as const;
const BLOOD_TYPE_CONTEXT: Record<string, string> = {
  A: '几帳面、真面目、責任感が強い、協調性がある、慎重',
  B: '自由奔放、マイペース、好奇心旺盛、独創的、集中力がある',
  O: 'おおらか、社交的、行動力がある、楽観的、リーダーシップ',
  AB: '二面性、合理的、独創的、柔軟、ミステリアスな魅力',
};

const TAROT_SYS = `あなたは日本の占いアプリのタロット解釈ライターです。英語の伝統的解釈を現代日本語ユーザー向けの温かいトーンで再解釈。
必ず次のキーを持つJSONオブジェクトだけを出力（前置き・コードブロック禁止、各文は簡潔に）:
"name_ja","name_ko","upright_ja"(60-90字),"upright_ko"(60-90자),"reversed_ja"(60-90字),"reversed_ko"(60-90자)`;

const ASTRO_SYS = (ja: string, el: string, cat: string) =>
  `日本の占いアプリ向け、${ja}(${el}属性)の「${cat}」の今日の運勢。温かく前向き、60-90字。
次のキーのJSONオブジェクトだけ出力（前置き・コードブロック禁止）:"text_ja","text_ko","lucky_color","lucky_number"(数値)`;

const BLOOD_SYS = (bt: string) =>
  `日本で一般的な血液型性格の通念(A:${BLOOD_TYPE_CONTEXT.A}/B:${BLOOD_TYPE_CONTEXT.B}/O:${BLOOD_TYPE_CONTEXT.O}/AB:${BLOOD_TYPE_CONTEXT.AB})を踏まえ、エンタメ目的の今日の運勢。
次のキーのJSONオブジェクトだけ出力（前置き・コードブロック禁止）:"text_ja"(70-100字),"text_ko","advice_ja","advice_ko"`;

// ─────────────── 타로 ───────────────
async function seedTarot() {
  console.log('=== 타로 78건 생성 (max_tokens 900) ===');
  const src = await fetchTarotSource();
  const results: Record<string, any> = {};
  for (const [i, c] of src.entries()) {
    results[c.name_short] = await callClaude(TAROT_SYS, `Card: ${c.name}\nUpright: ${c.meaning_up}\nReversed: ${c.meaning_rev}`, 900, `타로 ${i + 1}/78 ${c.name_short}`);
    console.log(`  타로 ${i + 1}/78 ${c.name_short}: ${results[c.name_short]?.upright_ja && results[c.name_short]?.reversed_ko ? 'OK' : '빈값'}`);
    await sleep(DELAY_MS);
  }
  const empty = src.filter((c) => !(results[c.name_short]?.upright_ja && results[c.name_short]?.reversed_ko));
  console.log(`\n타로 결과: 성공 ${78 - empty.length}/78, 빈값 ${empty.length}`);
  fs.writeFileSync('data/_tarot.json', JSON.stringify(results, null, 2));
  if (empty.length > 0) {
    console.warn('⚠️ 타로 빈값 존재 → 타로 적재 건너뜀. `npx tsx scripts/seed-sync.ts tarot` 로 재시도. 빈값:', empty.map((c) => c.name_short).join(', '));
    return;
  }
  await supabase.from('tarot_cards').upsert(
    src.map((c) => ({ card_key: c.name_short, name_ja: results[c.name_short].name_ja, name_ko: results[c.name_short].name_ko, suit: c.suit ?? null, arcana: c.type })),
    { onConflict: 'card_key' }
  );
  await supabase.from('tarot_interpretations').delete().not('id', 'is', null);
  await supabase.from('tarot_interpretations').insert(
    src.flatMap((c) => {
      const r = results[c.name_short];
      return [
        { card_key: c.name_short, orientation: 'upright', text_ja: r.upright_ja, text_ko: r.upright_ko },
        { card_key: c.name_short, orientation: 'reversed', text_ja: r.reversed_ja, text_ko: r.reversed_ko },
      ];
    })
  );
  console.log('✅ 타로 적재 완료 (78장 / 156해석)');
}

// ─────────────── 별자리 ───────────────
async function seedAstro() {
  console.log('=== 별자리 48건 생성 ===');
  const results: Record<string, any> = {};
  let n = 0;
  for (const z of ZODIAC_MASTER) {
    for (const cat of ASTRO_CATEGORIES) {
      n++;
      results[`${z.code}_${cat}`] = await callClaude(ASTRO_SYS(z.ja, z.element, cat), `${z.ja} / ${cat}`, 500, `별자리 ${n}/48`);
      console.log(`  별자리 ${n}/48 ${z.code}/${cat}: ${results[`${z.code}_${cat}`]?.text_ja ? 'OK' : '빈값'}`);
      await sleep(DELAY_MS);
    }
  }
  const empty = Object.entries(results).filter(([, r]) => !r?.text_ja);
  console.log(`\n별자리 결과: 성공 ${48 - empty.length}/48, 빈값 ${empty.length}`);
  fs.writeFileSync('data/_astro.json', JSON.stringify(results, null, 2));
  if (empty.length > 0) {
    console.warn('⚠️ 별자리 빈값 존재 → 적재 건너뜀. `npx tsx scripts/seed-sync.ts astro` 로 재시도. 빈값:', empty.map(([k]) => k).join(', '));
    return;
  }
  await supabase.from('astrology_zodiac').upsert(
    ZODIAC_MASTER.map((z) => ({ sign_code: z.code, name_ja: z.ja, name_ko: z.ko, date_start: z.dateFrom, date_end: z.dateTo, element: z.element })),
    { onConflict: 'sign_code' }
  );
  await supabase.from('astrology_interpretations').delete().not('id', 'is', null);
  await supabase.from('astrology_interpretations').insert(
    ZODIAC_MASTER.flatMap((z) => ASTRO_CATEGORIES.map((cat) => {
      const r = results[`${z.code}_${cat}`];
      return { sign_code: z.code, category: cat, text_ja: r.text_ja, text_ko: r.text_ko, lucky_color: r.lucky_color, lucky_number: r.lucky_number };
    }))
  );
  console.log('✅ 별자리 적재 완료 (12사인 / 48해석)');
}

// ─────────────── 혈액형 ───────────────
async function seedBlood() {
  console.log('=== 혈액형 4건 생성 ===');
  const results: Record<string, any> = {};
  for (const [i, bt] of BLOOD_TYPES.entries()) {
    results[bt] = await callClaude(BLOOD_SYS(bt), `${bt}型の今日の運勢`, 600, `혈액형 ${i + 1}/4`);
    console.log(`  혈액형 ${i + 1}/4 ${bt}: ${results[bt]?.text_ja ? 'OK' : '빈값'}`);
    await sleep(DELAY_MS);
  }
  const empty = Object.entries(results).filter(([, r]) => !r?.text_ja);
  console.log(`\n혈액형 결과: 성공 ${4 - empty.length}/4, 빈값 ${empty.length}`);
  fs.writeFileSync('data/_blood.json', JSON.stringify(results, null, 2));
  if (empty.length > 0) {
    console.warn('⚠️ 혈액형 빈값 존재 → 적재 건너뜀. `npx tsx scripts/seed-sync.ts blood` 로 재시도.');
    return;
  }
  await supabase.from('blood_type_interpretations').delete().not('id', 'is', null);
  await supabase.from('blood_type_interpretations').insert(
    BLOOD_TYPES.map((bt) => ({ blood_type: bt, text_ja: results[bt].text_ja, text_ko: results[bt].text_ko, advice_ja: results[bt].advice_ja, advice_ko: results[bt].advice_ko }))
  );
  console.log('✅ 혈액형 적재 완료 (4건)');
}

async function main() {
  const target = process.argv[2] ?? 'all';
  fs.mkdirSync('data', { recursive: true });
  if (target === 'tarot' || target === 'all') await seedTarot();
  if (target === 'astro' || target === 'all') await seedAstro();
  if (target === 'blood' || target === 'all') await seedBlood();
  console.log('\n=== 종료 ===');
}

main().catch((err) => { console.error('스크립트 실행 실패:', err); process.exit(1); });
