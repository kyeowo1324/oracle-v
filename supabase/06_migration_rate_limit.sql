-- ════════════════════════════════════════════
-- ホシドタロ — S-2. AI 호출 일일 상한 마이그레이션
-- Supabase SQL Editor에서 1회 실행
--
-- 변경점: increment_ai_call이 void 대신 "증가 후의 count"를 반환.
--   → 서버 코드(src/lib/rateLimit.ts)가 이 값으로 상한 초과를 판단해 429 반환.
--
-- ⚠️ PostgreSQL은 CREATE OR REPLACE로 반환 타입을 바꿀 수 없으므로 DROP 후 재생성.
--    기존 배포 코드는 rpc 호출을 try/catch로 감싸고 반환값을 쓰지 않으므로,
--    이 SQL을 먼저 실행해도(코드 배포 전이어도) 서비스는 정상 동작합니다.
-- ════════════════════════════════════════════

DROP FUNCTION IF EXISTS increment_ai_call(TEXT, DATE);

CREATE FUNCTION increment_ai_call(p_id TEXT, p_date DATE)
RETURNS INTEGER AS $$
  INSERT INTO ai_call_log (identifier, call_date, count)
  VALUES (p_id, p_date, 1)
  ON CONFLICT (identifier, call_date)
  DO UPDATE SET count = ai_call_log.count + 1
  RETURNING count;
$$ LANGUAGE sql;

-- 확인용:
-- SELECT increment_ai_call('test_id', CURRENT_DATE);  -- 1, 2, 3... 증가 확인
-- DELETE FROM ai_call_log WHERE identifier = 'test_id';
