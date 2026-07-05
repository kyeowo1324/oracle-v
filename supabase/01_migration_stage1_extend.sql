-- ════════════════════════════════════════════
-- Oracle V — Stage 1 스키마 확장 마이그레이션
-- 기존 테이블은 그대로 두고 추가/보강만 함. 안전하게 재실행 가능(IF NOT EXISTS 사용).
-- ════════════════════════════════════════════

-- ── 1) 혈액형 테이블 신규 추가 (기존 초안엔 없었음) ──
CREATE TABLE IF NOT EXISTS blood_type_interpretations (
  id SERIAL PRIMARY KEY,
  blood_type VARCHAR(2) NOT NULL CHECK (blood_type IN ('A','B','O','AB')),
  text_ja TEXT, text_ko TEXT,
  advice_ja TEXT, advice_ko TEXT
);

ALTER TABLE blood_type_interpretations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "read" ON blood_type_interpretations FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 2) 조회 성능용 인덱스 (지금 데이터량에선 안 느끼지만, 늘어나면 필수) ──
CREATE INDEX IF NOT EXISTS idx_tarot_cards_key
  ON tarot_cards(card_key);

CREATE INDEX IF NOT EXISTS idx_tarot_interp_lookup
  ON tarot_interpretations(card_key, orientation);

CREATE INDEX IF NOT EXISTS idx_astro_interp_lookup
  ON astrology_interpretations(sign_code, category);

CREATE INDEX IF NOT EXISTS idx_free_usage_lookup
  ON free_usage(identifier, use_date);

-- ── 3) 데이터 무결성 CHECK 제약 (오타로 인한 조회 실패 방지) ──
ALTER TABLE tarot_interpretations
  DROP CONSTRAINT IF EXISTS chk_orientation;
ALTER TABLE tarot_interpretations
  ADD CONSTRAINT chk_orientation CHECK (orientation IN ('upright', 'reversed'));

ALTER TABLE astrology_interpretations
  DROP CONSTRAINT IF EXISTS chk_category;
ALTER TABLE astrology_interpretations
  ADD CONSTRAINT chk_category CHECK (category IN ('general','love','money','work'));

-- ── 4) 외래키는 지금 걸지 않는 게 안전함 ──
-- 이유: seed-all.ts가 tarot_cards → tarot_interpretations 순서로 넣긴 하지만,
-- 재시딩·부분 업데이트 중 순서가 어긋나면 FK 위반으로 배치 전체가 실패할 수 있음.
-- 대신 애플리케이션 레벨에서 card_key/sign_code 일치를 보장(seed 스크립트가 이미 그렇게 함).
-- 나중에 데이터가 안정화되면 아래로 추가 가능:
-- ALTER TABLE tarot_interpretations
--   ADD CONSTRAINT fk_tarot_card FOREIGN KEY (card_key) REFERENCES tarot_cards(card_key);

-- ── 5) free_usage에는 의도적으로 SELECT 정책을 만들지 않음 ──
-- RLS는 켜져 있지만(ALTER TABLE ... ENABLE ROW LEVEL SECURITY) 정책이 없으면
-- anon/authenticated 키로는 기본 거부(deny-by-default) 됨.
-- service_role 키(서버 전용, supabaseAdmin)는 RLS를 우회하므로 서버 코드에서만 읽고 쓸 수 있음.
-- 클라이언트가 자기 사용량을 직접 조작할 수 없게 막는 의도적 설계.

-- ── 6) 광고 언락 원자적 증가 함수 (런타임 코드에서 호출) ──
CREATE OR REPLACE FUNCTION increment_ad_unlock(p_identifier TEXT, p_date DATE)
RETURNS void AS $$
  INSERT INTO free_usage (identifier, use_date, ad_unlocks)
  VALUES (p_identifier, p_date, 1)
  ON CONFLICT (identifier, use_date)
  DO UPDATE SET ad_unlocks = free_usage.ad_unlocks + 1;
$$ LANGUAGE sql;

-- ── 7) tarot_cards.image_url 사용 방침 정리 ──
-- 라이더-웨이트 1909 이미지는 퍼블릭 도메인이라 외부 URL에 의존할 필요 없음.
-- 이미지 파일을 /public/tarot-images/{card_key}.jpg 로 프로젝트에 직접 포함시키고,
-- image_url 컬럼에는 절대 URL 대신 상대 경로만 저장 권장 (외부 호스팅 장애에 영향 안 받음).
-- 예: UPDATE tarot_cards SET image_url = '/tarot-images/' || card_key || '.jpg';
