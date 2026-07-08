// src/data/tarot-ja-index.ts
// data/_tarot.json(시딩 원본)의 사본. 78枚 一覧 가이드 글에서 정적 참조용으로 사용.
// ⚠️ Supabase의 실제 서비스 데이터를 고치면(예: fix_tarot_ja.sql), 이 파일도 함께
//   `cp data/_tarot.json src/data/tarot-ja.json` 로 동기화해야 가이드 글도 최신 상태를 반영합니다.
import raw from './tarot-ja.json';

export interface TarotJaEntry {
  name_ja: string;
  name_ko: string;
  upright_ja: string;
  upright_ko: string;
  reversed_ja: string;
  reversed_ko: string;
}

const tarotJa = raw as Record<string, TarotJaEntry>;
export default tarotJa;
