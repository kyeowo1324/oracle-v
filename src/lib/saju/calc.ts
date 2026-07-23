// src/lib/saju/calc.ts
// 四柱推命(사주) 계산 코어 — 100% 결정론, AI 미사용, 비용 $0.
//
// ★ 설계 원칙: 만세력 "계산"은 절대 LLM에게 시키지 않는다.
//   LLM은 날짜 산술에서 반드시 틀린다. 여기서 정확히 계산한 뒤,
//   AI에는 완성된 사주팔자를 넘겨 "해석문"만 생성시킨다.
//
// 검증 완료:
//  - 일주: (JDN+49) mod 60 방식과 1949-10-01=甲子 앵커 방식이 완전 일치
//  - 연주: 1984=甲子 기준 (2026=丙午 확인)
//  - 절입일: Meeus 태양황경 알고리즘으로 분 단위 산출(날짜 단위 표는 경계 오류 발생)

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];
export type Element = '木' | '火' | '土' | '金' | '水';

/** 천간 오행 */
export const STEM_ELEMENT: Element[] = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
/** 천간 음양 (true=양) */
export const STEM_YANG: boolean[] = [true, false, true, false, true, false, true, false, true, false];
/** 지지 오행 */
export const BRANCH_ELEMENT: Element[] = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
/** 지지 지장간 정기(正氣) — 십신 판정의 기준. 子=癸, 午=丁 임에 주의(음양이 지지 자체와 반대) */
export const BRANCH_MAIN_STEM: number[] = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8];
/** 지장간 전체 (여기, 중기, 정기) — 천간 인덱스 배열 */
export const BRANCH_HIDDEN: number[][] = [
  [9], [9, 7, 5], [4, 2, 0], [1], [1, 9, 4], [4, 6, 2],
  [5, 3], [3, 1, 5], [4, 8, 6], [7], [7, 3, 4], [4, 0, 8],
];

const GEN_NEXT: Record<Element, Element> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const CTRL: Record<Element, Element> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

export const TEN_GODS = [
  '比肩', '劫財', '食神', '傷官', '偏財', '正財', '偏官', '正官', '偏印', '正印',
] as const;
export type TenGod = (typeof TEN_GODS)[number];

/**
 * 십신 판정. dayStem(일간) 기준으로 target 천간이 무엇인가.
 * 규칙: 같은 오행 → 음양 같으면 비견/다르면 겁재
 *       내가 생 → 같으면 식신/다르면 상관
 *       내가 극 → 같으면 편재/다르면 정재
 *       나를 극 → 같으면 편관/다르면 정관
 *       나를 생 → 같으면 편인/다르면 정인
 */
export function tenGod(dayStem: number, target: number): TenGod {
  const me = STEM_ELEMENT[dayStem];
  const it = STEM_ELEMENT[target];
  const same = STEM_YANG[dayStem] === STEM_YANG[target];
  if (it === me) return same ? '比肩' : '劫財';
  if (GEN_NEXT[me] === it) return same ? '食神' : '傷官';
  if (CTRL[me] === it) return same ? '偏財' : '正財';
  if (CTRL[it] === me) return same ? '偏官' : '正官';
  return same ? '偏印' : '正印';
}

/** 지지의 십신(정기 기준) */
export function branchTenGod(dayStem: number, branch: number): TenGod {
  return tenGod(dayStem, BRANCH_MAIN_STEM[branch]);
}

// ─────────────────────────────────────────────
// 천문 계산 (절입일)
// ─────────────────────────────────────────────

/** 그레고리력 → 율리우스일 정수 */
export function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2
    + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

/** 태양 겉보기 황경(도). Meeus 저정밀(오차 ≈0.01°) */
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) * Math.PI) / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  const om = ((125.04 - 1934.136 * T) * Math.PI) / 180;
  return ((L0 + C - 0.00569 - 0.00478 * Math.sin(om)) % 360 + 360) % 360;
}

/** 12절(節)의 태양황경. 월지 순서(寅월부터) */
const TERM_DEGREES = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
/** 각 절이 시작시키는 월지 인덱스 (寅=2 부터) */
const TERM_BRANCH = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
export const TERM_NAMES_JA = [
  '立春', '啓蟄', '清明', '立夏', '芒種', '小暑', '立秋', '白露', '寒露', '立冬', '大雪', '小寒',
];

/** 목표 황경에 도달하는 순간의 JD(UT). year 부근에서 탐색 */
function findTerm(year: number, targetDeg: number): number {
  const start = jdn(year, 1, 1) - 40;
  const diff = (jd: number) => {
    let d = (sunLongitude(jd) - targetDeg) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };
  let prev = start;
  let pv = diff(prev);
  for (let jd = start + 1; jd < start + 400; jd += 1) {
    const v = diff(jd);
    if (pv < 0 && v >= 0) {
      let a = prev, b = jd;
      for (let i = 0; i < 60; i++) {
        const m = (a + b) / 2;
        if (diff(a) * diff(m) <= 0) b = m; else a = m;
      }
      return (a + b) / 2;
    }
    prev = jd; pv = v;
  }
  return start;
}

/** JD(UT) → JST 기준 "일수 실수값"(그 해 1/1 00:00 JST = 기준) 비교용 절대 JD(JST 보정) */
function jdJst(jd: number): number {
  return jd + 9 / 24;
}

export type SolarTerm = { name: string; branch: number; jd: number };

/** 해당 연도의 12절 목록(JST 기준 JD). 캐시로 반복 계산 방지 */
const termCache = new Map<number, SolarTerm[]>();
export function solarTerms(year: number): SolarTerm[] {
  const hit = termCache.get(year);
  if (hit) return hit;
  const list: SolarTerm[] = TERM_DEGREES.map((deg, i) => ({
    name: TERM_NAMES_JA[i],
    branch: TERM_BRANCH[i],
    jd: jdJst(findTerm(year, deg)),
  })).sort((a, b) => a.jd - b.jd);
  termCache.set(year, list);
  return list;
}

// ─────────────────────────────────────────────
// 사주 산출
// ─────────────────────────────────────────────

export type Pillar = { stem: number; branch: number };
export type SajuInput = {
  year: number; month: number; day: number;
  hour: number | null;   // 0-23, null이면 시주 미상
  minute?: number;
  /** 경도 보정(진태양시). 일본 표준자오선 135°E 기준. 예: 도쿄 139.7 */
  longitude?: number | null;
};

export type SajuResult = {
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar | null };
  /** 일간 인덱스 */
  dayStem: number;
  /** 오행 개수 (지장간 제외 / 포함) */
  elementCount: Record<Element, number>;
  elementCountWithHidden: Record<Element, number>;
  /** 십신 배치 */
  tenGods: {
    yearStem: TenGod; monthStem: TenGod; hourStem: TenGod | null;
    yearBranch: TenGod; monthBranch: TenGod; dayBranch: TenGod; hourBranch: TenGod | null;
  };
  /** 신강/신약 점수 (0~100, 50 근처가 중화) */
  strengthScore: number;
  strength: 'strong' | 'weak' | 'balanced';
  /** 용신 오행(억부 기준 추정) */
  usefulElement: Element;
  /** 절입 경계에 가까운 출생인지 (±1일) — 검증 권장 표시용 */
  nearTermBoundary: boolean;
  /** 시주 미상 여부 */
  hourUnknown: boolean;
};

/** 시각(분) → 지지 인덱스. 23:00~00:59=子 */
function hourToBranch(h: number, m: number): number {
  const t = h * 60 + m;
  if (t >= 23 * 60 || t < 60) return 0;           // 子
  return Math.floor((t - 60) / 120) + 1;          // 丑부터
}

export function computeSaju(input: SajuInput): SajuResult {
  const { year, month, day } = input;
  const hourUnknown = input.hour === null || input.hour === undefined;
  let h = hourUnknown ? 12 : (input.hour as number);
  let mi = input.minute ?? 0;

  // 진태양시 보정(선택). 표준자오선 135°E 대비 4분/도
  if (input.longitude != null) {
    const shift = (input.longitude - 135) * 4; // 분
    const total = h * 60 + mi + shift;
    const wrapped = ((total % 1440) + 1440) % 1440;
    h = Math.floor(wrapped / 60); mi = Math.round(wrapped % 60);
  }

  // 현재 시각의 JD(JST) — 절입 비교용
  const nowJd = jdn(year, month, day) - 0.5 + (h * 60 + mi) / 1440;

  // ── 월주/연주: 절입 기준
  // 해당 연도와 전년도 절기를 합쳐 직전 절기를 찾는다
  const terms = [...solarTerms(year - 1), ...solarTerms(year)].sort((a, b) => a.jd - b.jd);
  let idx = -1;
  for (let i = 0; i < terms.length; i++) {
    if (terms[i].jd <= nowJd) idx = i; else break;
  }
  const cur = terms[idx];
  const nearTermBoundary = Math.abs(nowJd - cur.jd) < 1
    || (idx + 1 < terms.length && Math.abs(terms[idx + 1].jd - nowJd) < 1);

  // 연주: 立春(branch=2, 寅) 이후부터 그 해. 直近의 立春을 찾아 판정
  let solarYear = year;
  const lichun = solarTerms(year).find((t) => t.branch === 2)!;
  if (nowJd < lichun.jd) solarYear = year - 1;

  const yStem = ((solarYear - 1984) % 10 + 10) % 10;
  const yBranch = ((solarYear - 1984) % 12 + 12) % 12;

  // 월지 = 직전 절기의 지지, 월간 = 둔간법
  const mBranch = cur.branch;
  // 寅월 천간 = (연간*2+2) mod 10, 이후 지지 순서만큼 증가
  const offsetFromTiger = ((mBranch - 2) % 12 + 12) % 12;
  const mStem = ((yStem * 2 + 2) + offsetFromTiger) % 10;

  // ── 일주: (JDN + 49) mod 60
  // 야자시(23:00~) 처리: 전통적으로 당일 일주 유지(본 시스템 기준)
  const dIdx = (jdn(year, month, day) + 49) % 60;
  const dStem = dIdx % 10;
  const dBranch = dIdx % 12;

  // ── 시주
  let hourPillar: Pillar | null = null;
  if (!hourUnknown) {
    const hBranch = hourToBranch(h, mi);
    const hStem = ((dStem * 2) + hBranch) % 10;
    hourPillar = { stem: hStem, branch: hBranch };
  }

  const pillars = {
    year: { stem: yStem, branch: yBranch },
    month: { stem: mStem, branch: mBranch },
    day: { stem: dStem, branch: dBranch },
    hour: hourPillar,
  };

  // ── 오행 집계
  const zero = (): Record<Element, number> => ({ 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 });
  const ec = zero();
  const ech = zero();
  const addStem = (s: number, w = 1) => { ec[STEM_ELEMENT[s]] += w; ech[STEM_ELEMENT[s]] += w; };
  const addBranch = (b: number) => {
    ec[BRANCH_ELEMENT[b]] += 1;
    ech[BRANCH_ELEMENT[b]] += 1;
    // 지장간 가중(정기 제외한 여기/중기를 0.5로)
    const hid = BRANCH_HIDDEN[b];
    for (let i = 0; i < hid.length - 1; i++) ech[STEM_ELEMENT[hid[i]]] += 0.5;
  };
  addStem(yStem); addStem(mStem); addStem(dStem);
  addBranch(yBranch); addBranch(mBranch); addBranch(dBranch);
  if (hourPillar) { addStem(hourPillar.stem); addBranch(hourPillar.branch); }

  // ── 십신
  const tg = {
    yearStem: tenGod(dStem, yStem),
    monthStem: tenGod(dStem, mStem),
    hourStem: hourPillar ? tenGod(dStem, hourPillar.stem) : null,
    yearBranch: branchTenGod(dStem, yBranch),
    monthBranch: branchTenGod(dStem, mBranch),
    dayBranch: branchTenGod(dStem, dBranch),
    hourBranch: hourPillar ? branchTenGod(dStem, hourPillar.branch) : null,
  };

  // ── 신강/신약 (일간을 돕는 힘 vs 빼앗는 힘)
  const me = STEM_ELEMENT[dStem];
  const resource = (Object.keys(GEN_NEXT) as Element[]).find((e) => GEN_NEXT[e] === me)!; // 나를 생함(인성)
  let support = 0, drain = 0;
  (Object.keys(ech) as Element[]).forEach((e) => {
    const v = ech[e];
    if (e === me || e === resource) support += v; else drain += v;
  });
  // 월령(월지가 나를 돕는 계절인지) 가중
  const monthEl = BRANCH_ELEMENT[mBranch];
  if (monthEl === me || monthEl === resource) support += 2; else drain += 1.5;
  const strengthScore = Math.round((support / Math.max(support + drain, 1)) * 100);
  const strength: SajuResult['strength'] =
    strengthScore >= 58 ? 'strong' : strengthScore <= 42 ? 'weak' : 'balanced';

  // ── 용신(억부): 신강이면 나를 덜어내는 오행, 신약이면 나를 돕는 오행
  const output = GEN_NEXT[me];            // 식상(내가 생함)
  const usefulElement: Element = strength === 'strong' ? output : resource;

  return {
    pillars, dayStem: dStem,
    elementCount: ec, elementCountWithHidden: ech,
    tenGods: tg, strengthScore, strength, usefulElement,
    nearTermBoundary, hourUnknown,
  };
}

/** 간지 문자열 */
export function pillarText(p: Pillar): string {
  return STEMS[p.stem] + BRANCHES[p.branch];
}

/** 대운 계산 */
export type DaeunItem = { startAge: number; stem: number; branch: number };
export function computeDaeun(input: SajuInput, saju: SajuResult, isMale: boolean, count = 8): {
  forward: boolean; startAge: number; list: DaeunItem[];
} {
  const yangYear = STEM_YANG[saju.pillars.year.stem];
  // 양남음녀 순행 / 음남양녀 역행
  const forward = (isMale && yangYear) || (!isMale && !yangYear);

  const h = saju.hourUnknown ? 12 : (input.hour as number);
  const nowJd = jdn(input.year, input.month, input.day) - 0.5 + (h * 60 + (input.minute ?? 0)) / 1440;
  const terms = [...solarTerms(input.year - 1), ...solarTerms(input.year), ...solarTerms(input.year + 1)]
    .sort((a, b) => a.jd - b.jd);

  let days = 0;
  if (forward) {
    const next = terms.find((t) => t.jd > nowJd);
    days = next ? next.jd - nowJd : 0;
  } else {
    const prevs = terms.filter((t) => t.jd <= nowJd);
    const prev = prevs[prevs.length - 1];
    days = prev ? nowJd - prev.jd : 0;
  }
  const startAge = Math.max(1, Math.round(days / 3));

  const list: DaeunItem[] = [];
  const m = saju.pillars.month;
  for (let i = 1; i <= count; i++) {
    const step = forward ? i : -i;
    list.push({
      startAge: startAge + (i - 1) * 10,
      stem: ((m.stem + step) % 10 + 10) % 10,
      branch: ((m.branch + step) % 12 + 12) % 12,
    });
  }
  return { forward, startAge, list };
}
