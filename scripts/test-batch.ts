// scripts/test-batch.ts
// 본격 재시도 전에, 지금 이 순간 Batch API가 정상 동작하는지 2건짜리 미니 배치로 빠르게 검증
// 실행: npx tsx scripts/test-batch.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

async function main() {
  const batch = await anthropic.messages.batches.create({
    requests: [
      { custom_id: 'test-1', params: { model: MODEL, max_tokens: 20, messages: [{ role: 'user', content: '한 단어로 "테스트"라고만 답해줘' }] } },
      { custom_id: 'test-2', params: { model: MODEL, max_tokens: 20, messages: [{ role: 'user', content: '한 단어로 "확인"이라고만 답해줘' }] } },
    ],
  });
  console.log('테스트 배치 생성:', batch.id);

  let status = batch.processing_status;
  let tries = 0;
  while (status !== 'ended' && tries < 10) { // 최대 약 3~4분만 대기 (미니 배치라 오래 걸리면 그 자체가 신호)
    await new Promise((r) => setTimeout(r, 20000));
    const check = await anthropic.messages.batches.retrieve(batch.id);
    status = check.processing_status;
    tries++;
    console.log(`  ...${status} (성공 ${check.request_counts.succeeded}/2, 경과 ${tries * 20}초)`);
  }

  if (status === 'ended') {
    console.log('✅ Batch API 정상 동작 확인됨 — 본 배치(seed-all.ts)를 안심하고 재실행하세요.');
  } else {
    console.log('⚠️ 2건짜리도 3~4분 내에 안 끝남 — 지금 이 순간 계정/리전 단위로 처리 지연이 있을 가능성. 잠시 후 재시도 권장.');
  }
}

main().catch(console.error);
