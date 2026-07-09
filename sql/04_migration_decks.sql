-- sql/04_migration_decks.sql
-- ホシドタロ — 신규 덱(河童·座敷童子·化け猫) 대비 마이그레이션
--
-- 목적: "카드"의 식별 단위를 card_key 단독 → (deck_key, card_key) 복합으로 확장.
-- 지금 실행해도 안전: 기존 데이터는 전부 deck_key='original'로 채워지고,
-- 기존 코드(.eq('card_key', ...))는 그대로 동작한다 (original 단일 덱이므로 충돌 없음).
-- 몇 번을 실행해도 에러 없음 (IF NOT EXISTS / DO 블록).

-- ── 1) tarot_cards에 deck_key 추가 ──
ALTER TABLE tarot_cards
  ADD COLUMN IF NOT EXISTS deck_key VARCHAR(20) NOT NULL DEFAULT 'original';

-- 기존 UNIQUE(card_key)를 (deck_key, card_key) 복합 유니크로 대체
-- (같은 愚者 카드가 덱마다 1장씩 존재할 수 있어야 함)
DO $$
BEGIN
  -- 기존 단일 유니크 제약이 있으면 제거 (이름은 환경에 따라 다를 수 있어 탐색)
  PERFORM 1 FROM pg_constraint
   WHERE conrelid = 'tarot_cards'::regclass
     AND contype = 'u'
     AND array_length(conkey, 1) = 1;
  IF FOUND THEN
    EXECUTE (
      SELECT 'ALTER TABLE tarot_cards DROP CONSTRAINT ' || quote_ident(conname)
      FROM pg_constraint
      WHERE conrelid = 'tarot_cards'::regclass
        AND contype = 'u'
        AND array_length(conkey, 1) = 1
      LIMIT 1
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'unique constraint drop skipped: %', SQLERRM;
END $$;

DO $$
BEGIN
  ALTER TABLE tarot_cards ADD CONSTRAINT uq_tarot_deck_card UNIQUE (deck_key, card_key);
EXCEPTION WHEN duplicate_table THEN NULL;
          WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_tarot_cards_deck ON tarot_cards(deck_key);

-- ── 2) tarot_interpretations에 deck_key 추가 ──
-- 해석을 덱마다 다르게 쓸 경우를 대비. 그림만 바꾸고 해석은 공용으로 갈 거면
-- 이 컬럼은 'original' 고정으로 두고 앱에서 original 해석을 공용 조회하면 된다.
ALTER TABLE tarot_interpretations
  ADD COLUMN IF NOT EXISTS deck_key VARCHAR(20) NOT NULL DEFAULT 'original';

CREATE INDEX IF NOT EXISTS idx_tarot_interp_deck
  ON tarot_interpretations(deck_key, card_key, orientation);

-- ── 3) 이미지 경로 규약 (참고 주석) ──
-- original : /tarot-images/{card_key}.jpg          (기존 경로 유지)
-- kappa    : /tarot-images/kappa/{card_key}.jpg
-- zashiki  : /tarot-images/zashiki/{card_key}.jpg
-- bakeneko : /tarot-images/bakeneko/{card_key}.jpg
-- 신규 덱 시딩 시: INSERT INTO tarot_cards (deck_key, card_key, name_ja, suit, arcana, image_url)
--                 VALUES ('kappa', 'ar00', '愚者', NULL, 'major', '/tarot-images/kappa/ar00.jpg');

-- ── 4) 확인 쿼리 ──
-- SELECT deck_key, COUNT(*) FROM tarot_cards GROUP BY deck_key;  -- original 78이면 정상
