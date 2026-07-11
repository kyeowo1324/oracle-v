// src/lib/compat.ts
// 궁합 점수 계산 — 전부 결정론적(입력이 같으면 항상 같은 점수). AI 호출 없음, 비용 $0.
//
// 조사한 일본 궁합 사이트들의 정석을 우리 데이터(별자리·혈액형·타로)로 재구성:
//  - 별자리: 4엘리먼트 상성 (火風 / 地水 好相性, 同エレメント 안정) — /aisho와 동일 관점
//  - 혈액형: 16조합 상성 테이블 (능미 세이히코 계열 통념 기반)
//  - 타로 4장(다이아몬드 크로스): 정/역 밸런스 + 인물카드 "마주봄" 방향성
//  - 관계(연애/우정/일)별 가중치를 달리해 같은 두 사람도 관계에 따라 결과가 달라짐
//
// 최종 ★는 1~5. 세부 점수(별자리/혈액형/카드)도 함께 반환해 결과 화면에서 분해 표시.

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type RelationKind = 'love' | 'friend' | 'work';
export type Blood = 'A' | 'B' | 'O' | 'AB';

export const SIGN_ELEMENT: Record<string, Element> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

// 별자리 엘리먼트 상성 → 0~100
function zodiacScore(a: string, b: string): number {
  const ea = SIGN_ELEMENT[a], eb = SIGN_ELEMENT[b];
  if (!ea || !eb) return 60; // 정보 부족 시 중립
  if (a === b) return 90;                     // 같은 별자리 = 이해도 높음
  if (ea === eb) return 85;                   // 같은 엘리먼트 = 가치관 통함
  const good = (ea === 'fire' && eb === 'air') || (ea === 'air' && eb === 'fire') ||
               (ea === 'earth' && eb === 'water') || (ea === 'water' && eb === 'earth');
  if (good) return 92;                         // 火風·地水 = 왕도 호상성
  const tough = (ea === 'fire' && eb === 'water') || (ea === 'water' && eb === 'fire') ||
                (ea === 'earth' && eb === 'air') || (ea === 'air' && eb === 'earth');
  if (tough) return 58;                        // 서로 다른 템포 = 배려 필요
  return 72;                                   // 그 외(火地, 風水 등) 보통
}

// 혈액형 16조합 상성 → 0~100 (대칭). 통념 기반, 엔터테인먼트 목적.
const BLOOD_TABLE: Record<string, number> = {
  'A-A': 78, 'A-B': 62, 'A-O': 85, 'A-AB': 74,
  'B-B': 70, 'B-O': 76, 'B-AB': 80,
  'O-O': 72, 'O-AB': 68,
  'AB-AB': 75,
};
function bloodScore(a: Blood | null, b: Blood | null): number {
  if (!a || !b) return 70; // 정보 부족 시 중립
  const key = [a, b].sort().join('-');
  return BLOOD_TABLE[key] ?? 70;
}

// 타로 4장(① 나 ② 상대 ③ 현재 ④ 미래) → 0~100
// 정위치 비율 + "①②(두 사람 마음)가 같은 방향인가"로 방향성 반영.
export type CompatCard = { orientation: 'upright' | 'reversed' };
function tarotScore(cards: CompatCard[]): number {
  if (cards.length < 4) return 70;
  const uprightCount = cards.filter((c) => c.orientation === 'upright').length;
  let s = 50 + uprightCount * 10; // 4장 정위치 → 90
  // ①나 ②상대의 마음이 같은 방향(둘 다 정 or 둘 다 역) = 통함
  if (cards[0].orientation === cards[1].orientation) s += 6;
  // ④미래가 정위치면 가산
  if (cards[3].orientation === 'upright') s += 4;
  return Math.max(0, Math.min(100, s));
}

// 관계별 가중치 (합 1.0). 연애는 별자리(가치관)·카드, 일은 혈액형(행동)에 무게.
const WEIGHTS: Record<RelationKind, { z: number; b: number; t: number }> = {
  love: { z: 0.4, b: 0.25, t: 0.35 },
  friend: { z: 0.35, b: 0.3, t: 0.35 },
  work: { z: 0.3, b: 0.4, t: 0.3 },
};

export type CompatInput = {
  relation: RelationKind;
  a: { zodiac: string; blood: Blood | null };
  b: { zodiac: string; blood: Blood | null };
  cards: CompatCard[];
};

export type CompatResult = {
  stars: number;       // 1~5
  percent: number;     // 0~100 (종합)
  breakdown: { zodiac: number; blood: number; tarot: number };
  elements: { a: Element | null; b: Element | null };
};

export function computeCompat(input: CompatInput): CompatResult {
  const z = zodiacScore(input.a.zodiac, input.b.zodiac);
  const b = bloodScore(input.a.blood, input.b.blood);
  const t = tarotScore(input.cards);
  const w = WEIGHTS[input.relation];
  const percent = Math.round(z * w.z + b * w.b + t * w.t);
  // 55~95를 1~5★로 매핑 (극단값 완화 — 궁합 점은 너무 낮으면 이탈)
  const stars = Math.max(1, Math.min(5, Math.round((percent - 45) / 10)));
  return {
    stars,
    percent,
    breakdown: { zodiac: Math.round(z), blood: Math.round(b), tarot: Math.round(t) },
    elements: { a: SIGN_ELEMENT[input.a.zodiac] ?? null, b: SIGN_ELEMENT[input.b.zodiac] ?? null },
  };
}

export const RELATION_JA: Record<RelationKind, string> = {
  love: '恋愛', friend: '友情', work: '仕事',
};

// 다이아몬드 크로스 4포지션 라벨 (조사한 정석: 위=나, 아래=상대, 왼=현재, 오=미래)
export const COMPAT_POSITIONS = ['あなたの気持ち', '相手の気持ち', '二人の現在', '二人の未来'];
