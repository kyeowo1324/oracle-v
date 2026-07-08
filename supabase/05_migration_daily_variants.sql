-- ════════════════════════════════════════════
-- Oracle V — 날짜별 로테이션(방법 A + F) 마이그레이션
-- 카테고리당 여러 개의 텍스트를 두고, 날짜로 그날 것을 고른다.
-- Supabase SQL Editor에서 1회 실행
-- ════════════════════════════════════════════

-- ── 1) 별자리 해석에 variant 컬럼 추가 ──
-- 기존 (sign_code, category)당 1행 → (sign_code, category, variant)당 1행으로 확장
ALTER TABLE astrology_interpretations
  ADD COLUMN IF NOT EXISTS variant SMALLINT NOT NULL DEFAULT 0;

-- 방법 F: 럭키 아이템 + 오늘의 한마디 (매일 바뀌는 체감 요소)
ALTER TABLE astrology_interpretations
  ADD COLUMN IF NOT EXISTS lucky_item_ja TEXT,
  ADD COLUMN IF NOT EXISTS lucky_item_ko TEXT,
  ADD COLUMN IF NOT EXISTS advice_ja TEXT,
  ADD COLUMN IF NOT EXISTS advice_ko TEXT;

-- 기존 유니크/인덱스 갱신: variant 포함 조회가 빠르도록
DROP INDEX IF EXISTS idx_astro_interp_lookup;
CREATE INDEX IF NOT EXISTS idx_astro_interp_lookup
  ON astrology_interpretations(sign_code, category, variant);

-- ── 2) 혈액형 해석에도 variant 추가 ──
ALTER TABLE blood_type_interpretations
  ADD COLUMN IF NOT EXISTS variant SMALLINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_blood_interp_lookup
  ON blood_type_interpretations(blood_type, variant);

-- ── 참고 ──
-- variant는 0..(N-1). seed 스크립트가 카테고리당 N개(권장 7)를 생성해 채운다.
-- 날짜 선택은 애플리케이션(API)에서: variant = hash(날짜 + sign_code) % N
-- 확인용:
-- SELECT sign_code, category, count(*) FROM astrology_interpretations
--   GROUP BY sign_code, category ORDER BY sign_code, category;
--   (각 조합이 7이면 정상)
