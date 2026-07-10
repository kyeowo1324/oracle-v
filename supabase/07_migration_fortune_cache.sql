-- ════════════════════════════════════════════
-- ホシドタロ — A단계. fortune_cache 적용 마이그레이션
-- Supabase SQL Editor에서 1회 실행 (몇 번 실행해도 안전)
--
-- 목적: 같은 날·같은 입력 조합(주제×별자리×혈액형×성별×타로3장)의 AI 결론/요약을
--       재사용해 Claude 호출을 절감. 트래픽이 늘수록 절감 효과가 커진다.
--
-- 03_migration_ai_cache.sql(참고본)을 실행했든 안 했든 이 파일 하나로 완결:
--   - 테이블이 없으면 생성, 있으면 conclusion 컬럼만 추가.
--   - 현재 라우트는 conclusion + summary 두 필드를 생성하므로 둘 다 저장.
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS fortune_cache (
  cache_key TEXT PRIMARY KEY,     -- sha256(날짜|주제|별자리|혈액형|성별|타로키셋)
  summary_ja TEXT,
  summary_ko TEXT,
  hit_count INT DEFAULT 1,        -- 재사용 횟수 (인기 조합 파악용)
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now()
);

-- 현재 라우트가 생성하는 conclusion 필드 (구버전 테이블에도 안전하게 추가)
ALTER TABLE fortune_cache ADD COLUMN IF NOT EXISTS conclusion_ja TEXT;
ALTER TABLE fortune_cache ADD COLUMN IF NOT EXISTS conclusion_ko TEXT;

ALTER TABLE fortune_cache ENABLE ROW LEVEL SECURITY;
-- 정책 없음 → deny-by-default. service_role(서버)만 접근 (기존 방침과 동일)

-- 캐시 히트 시 원자적 갱신 (hit_count++, last_used_at)
CREATE OR REPLACE FUNCTION touch_fortune_cache(p_key TEXT)
RETURNS void AS $$
  UPDATE fortune_cache
  SET hit_count = hit_count + 1, last_used_at = now()
  WHERE cache_key = p_key;
$$ LANGUAGE sql;

-- ── 운영 참고 ──
-- 캐시는 키에 날짜가 들어가 하루 단위로 자연 만료됨. 행 자체는 남으므로
-- 월 1회 점검(E단계) 때 아래로 정리:
--   DELETE FROM fortune_cache WHERE last_used_at < now() - interval '14 days';
-- 인기 조합 확인:
--   SELECT hit_count, left(cache_key, 12), created_at FROM fortune_cache
--   ORDER BY hit_count DESC LIMIT 20;
--
-- ※ decision_cache는 의도적으로 만들지 않음: する・しない은 자유 텍스트 질문이
--   키에 들어가 사실상 히트율 0이라, 캐시 조회 왕복만 낭비가 됨.
