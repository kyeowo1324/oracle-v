// scripts/seed-all.ts
// Oracle V 통합 데이터 파이프라인
// 소스 3종 → Claude Batch API로 ja/ko 가공 → Supabase 적재
// 실행: npx tsx scripts/seed-all.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });   // ⚠️ 'dotenv/config'만 쓰면 기본값은 .env 파일이라 .env.local을 못 찾음. path를 반드시 명시.
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const REQUIRED_ENV = ['ANTHROPIC_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`환경변수 누락: ${key} — .env.local에 값이 있는지, dotenv 경로가 맞는지 확인하세요.`);
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
  console.log('타로 원본 데이터 fetch 중... (tarotapi.dev)');
  const res = await fetch('https://tarotapi.dev/api/v1/cards');
  if (!res.ok) throw new Error(`tarotapi.dev 응답 실패: ${res.status}`);
  const data = await res.json();
  console.log(`  -> ${data.cards.length}장 수신 확인`);
  return data.cards as Array<{
    name: string; name_short: string; suit?: string;
    type: string; meaning_up: string; meaning_rev: string;
  }>;
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

async function runBatch(label: string, requests: Anthropic.Messages.Batches.MessageBatchCreateParams['requests'], resumeBatchId?: string) {
  let batchId = resumeBatchId;
  if (!batchId) {
    const batch = await anthropic.messages.batches.create({ requests });
    batchId = batch.id;
    console.log(`[${label}] Batch 생성: ${batchId} (${requests.length}건 요청)`);
  } else {
    console.log(`[${label}] 기존 batch 이어서 확인: ${batchId}`);
  }

  let status = 'in_progress';
  let tries = 0;
  while (status !== 'ended') {
    await new Promise((r) => setTimeout(r, 20000));
    const check = await anthropic.messages.batches.retrieve(batchId);
    status = check.processing_status;
    tries++;
    const elapsedMin = Math.round((tries * 20) / 60);
    console.log(`[${label}]   ...${status} (성공 ${check.request_counts.succeeded}/${requests.length}, 경과 ${elapsedMin}분)`);

    // 하드 실패 대신 90분(장기 지연 가능성) 지점에서만 경고하고 계속 대기
    // 공식 SLA는 24시간이며, "수요에 따라 느려질 수 있음"이 공식 문서에 명시되어 있음
    if (tries === 270) { // 90분
      console.warn(`[${label}] 90분 경과 — 서버 지연 가능성. status.claude.com에서 장애 공지 확인 권장.`);
      console.warn(`[${label}] 계속 기다리는 중... (중단하려면 Ctrl+C, 나중에 재개하려면 batch id 기록: ${batchId})`);
    }
  }

  const results: Record<string, any> = {};
  let failCount = 0;
  for await (const entry of await anthropic.messages.batches.results(batchId)) {
    if (entry.result.type === 'succeeded') {
      const block = entry.result.message.content[0];
      const text = block.type === 'text' ? block.text : '{}';
      try {
        results[entry.custom_id] = JSON.parse(text);
      } catch {
        failCount++;
        console.error(`[${label}] JSON 파싱 실패: ${entry.custom_id} -> 원문: ${text.slice(0, 80)}`);
      }
    } else {
      failCount++;
      console.error(`[${label}] 요청 실패: ${entry.custom_id} (${entry.result.type})`);
    }
  }
  if (failCount > 0) console.warn(`[${label}] 경고: ${failCount}건 실패/파싱오류 — 검증 단계에서 빈 값 확인 필요`);
  return results;
}

async function main() {
  // 이미 만들어진 batch id가 있으면 재생성하지 않고 그대로 이어서 확인
  // 사용법: npx tsx scripts/seed-all.ts --resume-tarot=msgbatch_xxx
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => a.replace('--', '').split('='))
  );

  console.log('=== 1/3 타로 데이터 수집 + 가공 ===');
  const tarotSource = await fetchTarotSource();
  const tarotRequests = tarotSource.map((c) => ({
    custom_id: `tarot_${c.name_short}`,
    params: {
      model: MODEL,
      max_tokens: 500,
      system: `あなたは日本の占いアプリのタロット解釈ライターです。英語の伝統的解釈を、
現代日本語ユーザー向けの温かいトーンで再解釈してください。
JSON形式のみ出力:{"name_ja":"","name_ko":"","upright_ja":"(80-120字)","upright_ko":"(80-120자)","reversed_ja":"","reversed_ko":""}`,
      messages: [{
        role: 'user' as const,
        content: `Card: ${c.name}\nUpright: ${c.meaning_up}\nReversed: ${c.meaning_rev}`,
      }],
    },
  }));
  const tarotResults = await runBatch('타로', tarotRequests, args['resume-tarot']);

  console.log('=== 2/3 별자리 해석 가공 (마스터 데이터는 코드 내 고정) ===');
  const astroRequests = ZODIAC_MASTER.flatMap((z) =>
    ASTRO_CATEGORIES.map((cat) => ({
      custom_id: `astro_${z.code}_${cat}`,
      params: {
        model: MODEL,
        max_tokens: 300,
        system: `日本の占いアプリ向け、${z.ja}(${z.element}属性)の「${cat}」カテゴリの
今日の運勢を作成。温かく前向きなトーン、60-100字。
JSON形式のみ:{"text_ja":"","text_ko":"","lucky_color":"","lucky_number":0}`,
        messages: [{ role: 'user' as const, content: `${z.ja} / ${cat} の運勢文を生成` }],
      },
    }))
  );
  const astroResults = await runBatch('별자리', astroRequests, args['resume-astro']);

  console.log('=== 3/3 혈액형 해석 가공 (문화적 통념 컨텍스트 제공) ===');
  const bloodRequests = BLOOD_TYPES.map((bt) => ({
    custom_id: `blood_${bt}`,
    params: {
      model: MODEL,
      max_tokens: 400,
      system: `日本で一般的に語られる血液型性格の通念(A型:${BLOOD_TYPE_CONTEXT.A} / B型:${BLOOD_TYPE_CONTEXT.B} / O型:${BLOOD_TYPE_CONTEXT.O} / AB型:${BLOOD_TYPE_CONTEXT.AB})
を踏まえ、エンターテインメント目的の「今日の運勢」を作成。
JSON形式のみ:{"text_ja":"(80-120字)","text_ko":"(80-120자)","advice_ja":"","advice_ko":""}`,
      messages: [{ role: 'user' as const, content: `${bt}型の今日の運勢を生成` }],
    },
  }));
  const bloodResults = await runBatch('혈액형', bloodRequests, args['resume-blood']);

  console.log('=== Supabase 적재 시작 ===');

  const tarotRows = tarotSource.map((c) => {
    const r = tarotResults[`tarot_${c.name_short}`] ?? {};
    return {
      card_key: c.name_short, name_ja: r.name_ja, name_ko: r.name_ko,
      suit: c.suit ?? null, arcana: c.type,
    };
  });
  const { error: e1 } = await supabase.from('tarot_cards').upsert(tarotRows, { onConflict: 'card_key' });
  if (e1) console.error('tarot_cards 적재 오류:', e1.message);

  await supabase.from('tarot_interpretations').delete().not('id', 'is', null);
  const tarotInterpRows = tarotSource.flatMap((c) => {
    const r = tarotResults[`tarot_${c.name_short}`] ?? {};
    return [
      { card_key: c.name_short, orientation: 'upright', text_ja: r.upright_ja, text_ko: r.upright_ko },
      { card_key: c.name_short, orientation: 'reversed', text_ja: r.reversed_ja, text_ko: r.reversed_ko },
    ];
  });
  const { error: e2 } = await supabase.from('tarot_interpretations').insert(tarotInterpRows);
  if (e2) console.error('tarot_interpretations 적재 오류:', e2.message);

  const { error: e3 } = await supabase.from('astrology_zodiac').upsert(
    ZODIAC_MASTER.map((z) => ({
      sign_code: z.code, name_ja: z.ja, name_ko: z.ko,
      date_start: z.dateFrom, date_end: z.dateTo, element: z.element,
    })),
    { onConflict: 'sign_code' }
  );
  if (e3) console.error('astrology_zodiac 적재 오류:', e3.message);

  await supabase.from('astrology_interpretations').delete().not('id', 'is', null);
  const astroInterpRows = ZODIAC_MASTER.flatMap((z) =>
    ASTRO_CATEGORIES.map((cat) => {
      const r = astroResults[`astro_${z.code}_${cat}`] ?? {};
      return {
        sign_code: z.code, category: cat,
        text_ja: r.text_ja, text_ko: r.text_ko,
        lucky_color: r.lucky_color, lucky_number: r.lucky_number,
      };
    })
  );
  const { error: e4 } = await supabase.from('astrology_interpretations').insert(astroInterpRows);
  if (e4) console.error('astrology_interpretations 적재 오류:', e4.message);

  await supabase.from('blood_type_interpretations').delete().not('id', 'is', null);
  const bloodRows = BLOOD_TYPES.map((bt) => {
    const r = bloodResults[`blood_${bt}`] ?? {};
    return {
      blood_type: bt, text_ja: r.text_ja, text_ko: r.text_ko,
      advice_ja: r.advice_ja, advice_ko: r.advice_ko,
    };
  });
  const { error: e5 } = await supabase.from('blood_type_interpretations').insert(bloodRows);
  if (e5) console.error('blood_type_interpretations 적재 오류:', e5.message);

  fs.mkdirSync('data', { recursive: true });
  fs.writeFileSync('data/_backup_all.json', JSON.stringify(
    { tarotResults, astroResults, bloodResults }, null, 2
  ));

  console.log('=== 완료: 타로 78장(156해석) + 별자리 12(48해석) + 혈액형 4건 적재됨 ===');
  console.log('=== 백업 파일: data/_backup_all.json ===');
}

main().catch((err) => {
  console.error('스크립트 실행 실패:', err);
  process.exit(1);
});
