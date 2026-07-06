-- ════════════════════════════════════════════
-- Oracle V — AI 결과 캐시 (비용 절감)
-- Supabase SQL Editor에서 1회 실행
-- ════════════════════════════════════════════
--
-- 아이디어: 같은/비슷한 입력 조합은 이미 만든 AI 문장을 재사용 → Claude 호출 절감.
-- 캐시 키(cache_key)는 "입력을 정규화해 만든 해시". 같은 키면 저장된 결과 반환.

-- ── 오늘의 운세 종합문 캐시 ──
-- 종합문(summary)은 [별자리 + 혈액형 + 성별 + 타로3장(정/역)]의 조합으로 결정됨.
-- 타로는 조합이 방대하므로, "그날의 날짜 + 별자리 + 혈액형 + 성별 + 타로키셋"으로 키를 만든다.
CREATE TABLE IF NOT EXISTS fortune_cache (
  cache_key TEXT PRIMARY KEY,   -- 입력 정규화 해시
  summary_ja TEXT,
  summary_ko TEXT,
  hit_count INT DEFAULT 1,      -- 재사용 횟수(인기 조합 파악용)
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fortune_cache ENABLE ROW LEVEL SECURITY;
-- 정책 없음 → service_role(서버)만 접근

-- ── 한다·안한다 조언 캐시 ──
-- 조언(advice)은 [판정 + 카드 + 질문]으로 결정. 질문은 자유 텍스트라 정규화가 관건(아래 코드 참고).
CREATE TABLE IF NOT EXISTS decision_cache (
  cache_key TEXT PRIMARY KEY,
  advice_ja TEXT,
  advice_ko TEXT,
  hit_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE decision_cache ENABLE ROW LEVEL SECURITY;

-- ── 캐시 조회+갱신 원자적 함수 (hit_count 증가) ──
CREATE OR REPLACE FUNCTION touch_fortune_cache(p_key TEXT)
RETURNS void AS $$
  UPDATE fortune_cache
  SET hit_count = hit_count + 1, last_used_at = now()
  WHERE cache_key = p_key;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION touch_decision_cache(p_key TEXT)
RETURNS void AS $$
  UPDATE decision_cache
  SET hit_count = hit_count + 1, last_used_at = now()
  WHERE cache_key = p_key;
$$ LANGUAGE sql;

-- (선택) 오래된 캐시 정리: 30일 이상 미사용 삭제 — 필요 시 수동/크론 실행
-- DELETE FROM fortune_cache WHERE last_used_at < now() - interval '30 days';
