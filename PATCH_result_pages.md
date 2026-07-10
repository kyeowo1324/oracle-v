// ============================================================
// PATCH_result_pages.md — 429(일일 상한) 전용 안내 화면 연결
// ============================================================
// 대상: src/app/result/fortune/page.tsx / src/app/result/decision/page.tsx
// 두 파일 모두 3곳씩만 고치면 됩니다. 아래 "기존" 블록을 찾아 "교체"로 바꾸세요.


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// A. src/app/result/fortune/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── A-1) import 추가 (다른 컴포넌트 import들 옆에) ──
import DailyLimitScreen from '@/components/DailyLimitScreen';

// ── A-2) state 추가 ──
// 기존:
//   const [error, setError] = useState(false);
// 아래 한 줄을 그 다음 줄에 추가:
  const [limited, setLimited] = useState(false);

// ── A-3) fetch 응답 분기 ──
// 기존:
/*
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        if (!data || data.error) setError(true);
        else {
*/
// 교체:
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        if (res.status === 429 || data?.error === 'rate_limited') setLimited(true);
        else if (!data || data.error) setError(true);
        else {

// ── A-4) 렌더 분기 추가 ──
// 기존:
/*
  if (loading) {
    return <FortuneTellerLoader message="占っています" />;
  }
  if (error || !result) {
*/
// 교체 (loading과 error 사이에 limited 분기 삽입):
  if (loading) {
    return <FortuneTellerLoader message="占っています" />;
  }
  if (limited) {
    return <DailyLimitScreen />;
  }
  if (error || !result) {


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// B. src/app/result/decision/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// decision은 429 응답 body 자체가 { error: 'rate_limited', ... } 이고
// 이 페이지는 result.error를 그대로 보관하므로, 렌더 분기만 추가하면 됩니다.

// ── B-1) import 추가 ──
import DailyLimitScreen from '@/components/DailyLimitScreen';

// ── B-2) 렌더 분기 추가 ──
// 기존:
/*
  if (loading) {
    return <FortuneTellerLoader message="答えを占っています" />;
  }
  if (!result || result.error) {
*/
// 교체 (rate_limited를 일반 에러보다 먼저 분기):
  if (loading) {
    return <FortuneTellerLoader message="答えを占っています" />;
  }
  if (result?.error === 'rate_limited') {
    return <DailyLimitScreen />;
  }
  if (!result || result.error) {

// ── B-3) (권장) fetch 견고화 ──
// 기존:
//   const data = raw ? JSON.parse(raw) : { error: 'empty' };
// 교체 (서버가 만약 비-JSON을 반환해도 상태코드로 판정):
  const data = res.status === 429
    ? { error: 'rate_limited' }
    : (raw ? JSON.parse(raw) : { error: 'empty' });


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 참고: markFreeViewUsed는 finally에서 그대로 실행되어도 무방합니다.
// 상한에 걸린 사용자는 어차피 오늘 조회가 불가하므로 게이트 중복 표시 문제 없음.
