// scripts/cancel-batch.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const batchId = process.argv[2];

anthropic.messages.batches.cancel(batchId).then((r) => {
  console.log('취소 요청 완료:', r.processing_status);
}).catch(console.error);
