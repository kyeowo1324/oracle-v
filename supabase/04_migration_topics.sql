-- ════════════════════════════════════════════
-- Oracle V — 주제(카테고리) 확장 마이그레이션
-- 기존 general/love/money/work 에 health/relationship 2개 추가
-- Supabase SQL Editor에서 1회 실행
-- ════════════════════════════════════════════

-- 기존 CHECK 제약을 6개 카테고리로 교체
ALTER TABLE astrology_interpretations
  DROP CONSTRAINT IF EXISTS chk_category;
ALTER TABLE astrology_interpretations
  ADD CONSTRAINT chk_category
  CHECK (category IN ('general','love','money','work','health','relationship'));

-- 인덱스는 기존 것(sign_code, category) 그대로 사용 — 추가 불필요

-- 확인용: 현재 카테고리별 데이터 개수
-- SELECT category, count(*) FROM astrology_interpretations GROUP BY category ORDER BY category;
-- (health, relationship 이 0이면 아래 seed 스크립트로 채워야 함)
