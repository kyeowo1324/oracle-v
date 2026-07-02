// scripts/finish-tarot-and-continue.ts
// 이미 생성된 타로 배치(48분째 진행 중이던 원본)만 대기 → 결과 수집 → 별자리·혈액형 배치 진행 → Supabase 적재
// ⚠️ 이 스크립트는 새 타로 배치를 "절대" 만들지 않음 — batch id를 상수로 고정해서 실수 원천 차단
// 실행: npx tsx scripts/finish-tarot-and-continue.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// ── 여기에 원본 배치 ID를 그대로 고정 ──
const ORIGINAL_TAROT_BATCH_ID = 'msgbatch_012mQGwB5aSJgVLaQwb8cVnJ';

const REQUIRED_ENV = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`환경변수 누락: ${key}`);
    process.exit(1);
  }
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const MODEL = 'claude-haiku-4-5-20251001';

async function fetchTarotSource() {
  const res = await fetch('https://tarotapi.dev/api/v1/cards');
  if (!res.ok) throw new Error(`tarotapi.dev 응답 실패: ${res.status}`);
  const data = await res.json();
  return data.cards as Array<{
    name: string; name_short: string; suit?: string;
    type: string; meaning_up: string; meaning_rev: string;
  }>;
}

// ── 기존 배치를 "대기만" — create() 호출 자체가 코드에 없음 ──
async function waitAndCollect(label: string, batchId: string, expectedCount: number) {
  console.log(`[${label}] 기존 배치 확인 중: ${batchId} (새 배치 생성 없음)`);
  let status = 'in_progress';
  let tries = 0;
  while (status !== 'ended') {
    const check = await anthropic.messages.batches.retrieve(batchId);
    status = check.processing_status;
    const elapsedMin = Math.round((tries * 20) / 60);
    console.log(`[${label}]   ...${status} (성공 ${check.request_counts.succeeded}/${expectedCount}, 확인 ${elapsedMin}분 경과)`);
    if (status !== 'ended') await new Promise((r) => setTimeout(r, 20000));
    tries++;
    if (tries === 270) console.warn(`[${label}] 90분 경과 — status.claude.com 확인 권장, 계속 대기 중...`);
  }

  const results: Record<string, any> = {};
  for await (const entry of await anthropic.messages.batches.results(batchId)) {
    if (entry.result.type === 'succeeded') {
      const block = entry.result.message.content[0];
      const text = block.type === 'text' ? block.text : '{}';
      try { results[entry.custom_id] = JSON.parse(text); }
      catch { console.error(`[${label}] JSON 파싱 실패: ${entry.custom_id}`); }
    } else {
      console.error(`[${label}] 요청 실패: ${entry.custom_id} (${entry.result.type})`);
    }
  }
  return results;
}

// ── 새로 만들어도 되는 배치 (별자리·혈액형은 아직 한 번도 안 만들었으므로 정상 생성) ──
async function runNewBatch(label: string, requests: Anthropic.Messages.Batches.MessageBatchCreateParams['requests']) {
  const batch = await anthropic.messages.batches.create({ requests });
  console.log(`[${label}] 신규 배치 생성: ${batch.id}`);
  return waitAndCollect(label, batch.id, requests.length);
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

async function main() {
  console.log('=== 1/3 타로: 원본 배치 이어받기 (새 배치 생성 없음) ===');
  const tarotSource = await fetchTarotSource();
  const tarotResults = await waitAndCollect('타로', ORIGINAL_TAROT_BATCH_ID, tarotSource.length);

  console.log('=== 2/3 별자리 배치 신규 생성 ===');
  const astroRequests = ZODIAC_MASTER.flatMap((z) =>
    ASTRO_CATEGORIES.map((cat) => ({
      custom_id: `astro_${z.code}_${cat}`,
      params: {
        model: MODEL, max_tokens: 300,
        system: `日本の占いアプリ向け、${z.ja}(${z.element}属性)の「${cat}」カテゴリの今日の運勢を作成。温かく前向きなトーン、60-100字。
JSON形式のみ:{"text_ja":"","text_ko":"","lucky_color":"","lucky_number":0}`,
        messages: [{ role: 'user' as const, content: `${z.ja} / ${cat} の運勢文を生成` }],
      },
    }))
  );
  const astroResults = await runNewBatch('별자리', astroRequests);

  console.log('=== 3/3 혈액형 배치 신규 생성 ===');
  const bloodRequests = BLOOD_TYPES.map((bt) => ({
    custom_id: `blood_${bt}`,
    params: {
      model: MODEL, max_tokens: 400,
      system: `日本で一般的に語られる血液型性格の通念(A型:${BLOOD_TYPE_CONTEXT.A} / B型:${BLOOD_TYPE_CONTEXT.B} / O型:${BLOOD_TYPE_CONTEXT.O} / AB型:${BLOOD_TYPE_CONTEXT.AB})を踏まえ、エンターテインメント目的の「今日の運勢」を作成。
JSON形式のみ:{"text_ja":"(80-120字)","text_ko":"(80-120자)","advice_ja":"","advice_ko":""}`,
      messages: [{ role: 'user' as const, content: `${bt}型の今日の運勢を生成` }],
    },
  }));
  const bloodResults = await runNewBatch('혈액형', bloodRequests);

  console.log('=== Supabase 적재 시작 ===');
  const tarotRows = tarotSource.map((c) => {
    const r = tarotResults[`tarot_${c.name_short}`] ?? {};
    return { card_key: c.name_short, name_ja: r.name_ja, name_ko: r.name_ko, suit: c.suit ?? null, arcana: c.type };
  });
  await supabase.from('tarot_cards').upsert(tarotRows, { onConflict: 'card_key' });

  await supabase.from('tarot_interpretations').delete().not('id', 'is', null);
  const tarotInterpRows = tarotSource.flatMap((c) => {
    const r = tarotResults[`tarot_${c.name_short}`] ?? {};
    return [
      { card_key: c.name_short, orientation: 'upright', text_ja: r.upright_ja, text_ko: r.upright_ko },
      { card_key: c.name_short, orientation: 'reversed', text_ja: r.reversed_ja, text_ko: r.reversed_ko },
    ];
  });
  await supabase.from('tarot_interpretations').insert(tarotInterpRows);

  await supabase.from('astrology_zodiac').upsert(
    ZODIAC_MASTER.map((z) => ({ sign_code: z.code, name_ja: z.ja, name_ko: z.ko, date_start: z.dateFrom, date_end: z.dateTo, element: z.element })),
    { onConflict: 'sign_code' }
  );
  await supabase.from('astrology_interpretations').delete().not('id', 'is', null);
  const astroInterpRows = ZODIAC_MASTER.flatMap((z) =>
    ASTRO_CATEGORIES.map((cat) => {
      const r = astroResults[`astro_${z.code}_${cat}`] ?? {};
      return { sign_code: z.code, category: cat, text_ja: r.text_ja, text_ko: r.text_ko, lucky_color: r.lucky_color, lucky_number: r.lucky_number };
    })
  );
  await supabase.from('astrology_interpretations').insert(astroInterpRows);

  await supabase.from('blood_type_interpretations').delete().not('id', 'is', null);
  const bloodRows = BLOOD_TYPES.map((bt) => {
    const r = bloodResults[`blood_${bt}`] ?? {};
    return { blood_type: bt, text_ja: r.text_ja, text_ko: r.text_ko, advice_ja: r.advice_ja, advice_ko: r.advice_ko };
  });
  await supabase.from('blood_type_interpretations').insert(bloodRows);

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/_backup_all.json', JSON.stringify({ tarotResults, astroResults, bloodResults }, null, 2));
  console.log('=== 완료: 타로 78장(156해석) + 별자리 12(48해석) + 혈액형 4건 적재됨 ===');
}

main().catch((err) => {
  console.error('스크립트 실행 실패:', err);
  process.exit(1);
});
