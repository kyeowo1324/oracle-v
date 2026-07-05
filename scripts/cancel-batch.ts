// scripts/cancel-batch.ts
// 좀비 상태 배치 취소
// 실행: npx tsx scripts/cancel-batch.ts <batch_id>

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const batchId = process.argv[2];

if (!batchId) {
  console.error('사용법: npx tsx scripts/cancel-batch.ts <batch_id>');
  process.exit(1);
}

anthropic.messages.batches.cancel(batchId).then((r) => {
  console.log('취소 요청 완료. processing_status:', r.processing_status);
  console.log('완전히 취소 처리(canceled)되기까지 몇 분 걸릴 수 있음 — check-batch.ts로 재확인 권장');
}).catch((err) => {
  console.error('취소 실패:', err.message ?? err);
});
