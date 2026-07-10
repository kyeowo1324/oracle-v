// src/lib/monthlyRelease.ts
// ホシドタロ — 月別運勢 예약공개 헬퍼
//
// 원리: 데이터(monthly-2026.ts)에는 12월분까지 전부 넣어두고,
// "현재 월 이하"만 화면에 노출한다. 커밋은 한 번, 매월 1일 0시(JST)에
// 다음 달이 자동으로 열린다.
//
// ⚠️ 주의: Vercel 서버 시간은 UTC라서 new Date()를 그대로 쓰면
// 일본 기준 1일 오전 9시까지 전월로 판정된다. 그래서 JST로 보정한다.
//
// ⚠️ 정적 페이지는 "빌드 시점"의 날짜로 굳는다. 그래서 이 헬퍼를 쓰는
// 페이지에는 반드시 `export const revalidate = 3600;`(1시간)을 함께 넣어
// 매월 1일에 자동으로 다시 생성되게 한다 (패치 안내 참고).

const RELEASE_YEAR = 2026;

/** 일본 시간(JST) 기준 현재 연·월 */
export function getCurrentMonthJST(): { year: number; month: number } {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return { year: jst.getUTCFullYear(), month: jst.getUTCMonth() + 1 };
}

/** 해당 월이 공개 시점에 도달했는지 */
export function isMonthReleased(month: number): boolean {
  const { year, month: cur } = getCurrentMonthJST();
  if (year > RELEASE_YEAR) return true;   // 2027년 이후에는 전부 공개
  if (year < RELEASE_YEAR) return false;  // (이론상) 2026년 이전에는 비공개
  return month <= cur;
}

/** 공개된 월만 필터링 (목록·sitemap용) */
export function filterReleased<T extends { month: number }>(list: readonly T[]): T[] {
  return list.filter((m) => isMonthReleased(m.month));
}

/** 아직 비공개인 월 목록 (「準備中」 카드 표시용, 선택 기능) */
export function upcomingMonths<T extends { month: number }>(list: readonly T[]): T[] {
  return list.filter((m) => !isMonthReleased(m.month));
}
