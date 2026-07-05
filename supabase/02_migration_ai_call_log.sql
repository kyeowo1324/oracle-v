-- AI 호출 카운트 (레이트리밋·비용 모니터링용)
-- Supabase SQL Editor에서 1회 실행
CREATE TABLE IF NOT EXISTS ai_call_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  call_date DATE NOT NULL,
  count INT DEFAULT 0,
  UNIQUE(identifier, call_date)
);
ALTER TABLE ai_call_log ENABLE ROW LEVEL SECURITY;
-- 정책 없음 → service_role만 접근 (클라이언트 조작 차단)

CREATE OR REPLACE FUNCTION increment_ai_call(p_id TEXT, p_date DATE)
RETURNS void AS $$
  INSERT INTO ai_call_log (identifier, call_date, count)
  VALUES (p_id, p_date, 1)
  ON CONFLICT (identifier, call_date)
  DO UPDATE SET count = ai_call_log.count + 1;
$$ LANGUAGE sql;
