// src/lib/daily.ts
// 날짜별 로테이션(방법 A)의 핵심: 날짜+키로 결정론적 variant 선택.
// 같은 날·같은 키 → 항상 같은 결과(당일 일관성). 날이 바뀌면 잘 흩어짐(인접일 변화율 ~83%).
//
// ※ 단순 문자열 해시는 연속된 날짜('...07','...08')에서 값이 뭉치는 문제가 있어,
//   날짜를 정수(epoch day)로 만들고 murmur3 finalizer로 믹싱한다.

// 일본 기준 날짜(JST, UTC+9) 'YYYY-MM-DD'
export function getJstDateString(d: Date = new Date()): string {
  const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

// 문자열 → 32비트 해시 (djb2)
function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// 32비트 정수 믹서 (murmur3 finalizer) — 연속 입력도 고르게 흩어짐
function mix32(n: number): number {
  n = n >>> 0;
  n ^= n >>> 16; n = Math.imul(n, 0x85ebca6b);
  n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35);
  n ^= n >>> 16;
  return n >>> 0;
}

// 'YYYY-MM-DD' → epoch day 수(정수)
function dateToInt(dateStr: string): number {
  return Math.floor(Date.parse(dateStr + 'T00:00:00Z') / 86400000);
}

// 날짜 + 키로 0..(count-1) 범위의 variant 선택
export function pickVariant(dateStr: string, key: string, count: number): number {
  if (count <= 1) return 0;
  const combined = (mix32(dateToInt(dateStr)) ^ hashString(key)) >>> 0;
  return mix32(combined) % count;
}
