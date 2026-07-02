// scripts/check-batch.ts
// 이미 생성된 batch의 상태를 직접 조회 (재실행 없이 진단만)
// 실행: npx tsx scripts/check-batch.ts msgbatch_012mQGwB5aSJgVLaQwb8cVnJ

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

const batchId = process.argv[2];
if (!batchId) {
  console.error('사용법: npx tsx scripts/check-batch.ts <batch_id>');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function main() {
  const batch = await anthropic.messages.batches.retrieve(batchId);
  console.log('id:', batch.id);
  console.log('processing_status:', batch.processing_status);
  console.log('request_counts:', JSON.stringify(batch.request_counts, null, 2));
  console.log('created_at:', batch.created_at);
  console.log('ended_at:', batch.ended_at ?? '(아직 안 끝남)');
  console.log('expires_at:', batch.expires_at);
}

main().catch((err) => {
  console.error('조회 실패:', err.message ?? err);
  process.exit(1);
});
