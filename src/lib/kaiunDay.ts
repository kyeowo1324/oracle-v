// src/lib/kaiunDay.ts
// 開運日(개운일) 계산 엔진 — 一粒万倍日・天赦日・寅の日・巳の日・甲子の日
//
// 왜 만들었나:
//   일본에서 「一粒万倍日」「天赦日」는 결혼·이사·지갑 개시·개업 날짜를 정할 때
//   실제로 검색·활용되는 생활 관습이다. 검색량이 매우 크고, 다른 점술 사이트도
//   대부분 이 캘린더를 갖고 있다.
//
//   그런데 이건 점술 "예언"이 아니라 **역법(曆法) 계산**이다.
//   기준이 명확해서 AI가 필요 없고, 사주 엔진의 간지·절기 계산을 그대로 재사용할 수 있다.
//   → 비용 $0, 결과가 항상 정확, 매일 바뀌므로 재방문 이유가 된다.
//
// 검증:
//   2026년 天赦日 6일(3/5, 5/4, 5/20, 7/19, 10/1, 12/16)이 공개 자료와 완전 일치함을 확인.

import { jdn, solarTerms, STEMS, BRANCHES } from '@/lib/saju/calc';

export type KaiunKind =
  | 'tensha'        // 天赦日 — 최상의 길일
  | 'ichiryu'       // 一粒万倍日 — 작은 것이 만배가 되는 날
  | 'tora'          // 寅の日 — 금전이 돌아오는 날
  | 'mi'            // 巳の日 — 변재천, 금운
  | 'kinoe_ne'      // 甲子の日 — 60간지의 시작, 새 출발
  | 'fujoju';       // 不成就日 — 주의가 필요한 날

export type KaiunInfo = {
  ja: string;
  reading: string;
  short: string;
  /** 길일이면 true, 주의일이면 false */
  good: boolean;
  desc: string;
  /** 이런 일에 좋다 */
  suits: string[];
};

export const KAIUN_INFO: Record<KaiunKind, KaiunInfo> = {
  tensha: {
    ja: '天赦日', reading: 'てんしゃにち', short: '天赦',
    good: true,
    desc: '暦の上で最上の吉日とされ、「天がすべてを赦す日」と言われます。年に5〜6回しかありません。',
    suits: ['新しいことを始める', '入籍・結婚', '開業', 'お財布をおろす'],
  },
  ichiryu: {
    ja: '一粒万倍日', reading: 'いちりゅうまんばいび', short: '一粒万倍',
    good: true,
    desc: '一粒の籾（もみ）が万倍にも実るように、小さく始めたことが大きく育つとされる日です。',
    suits: ['何かを始める', '種まき的な行動', '貯金を始める', '応募・エントリー'],
  },
  tora: {
    ja: '寅の日', reading: 'とらのひ', short: '寅',
    good: true,
    desc: '虎は千里を行って千里を帰るとされ、出したお金が戻ってくる日と言われます。',
    suits: ['お財布の新調', '旅行の出発', '買い物'],
  },
  mi: {
    ja: '巳の日', reading: 'みのひ', short: '巳',
    good: true,
    desc: '蛇は弁財天の使いとされ、金運や芸事にご縁のある日と言われます。',
    suits: ['金運のお参り', '習い事を始める', '通帳の記帳'],
  },
  kinoe_ne: {
    ja: '甲子の日', reading: 'きのえねのひ', short: '甲子',
    good: true,
    desc: '60日で一巡する干支の最初の日。物事のスタートに向くとされます。',
    suits: ['長く続けたいことの開始', '習慣づくり'],
  },
  fujoju: {
    ja: '不成就日', reading: 'ふじょうじゅび', short: '不成就',
    good: false,
    desc: '何事も成就しにくいとされる日。重要な決断は避け、静かに整える日と考えられています。',
    suits: [],
  },
};

/** 그 날의 일간지 인덱스 */
function dayGanzhi(y: number, m: number, d: number) {
  const i = (jdn(y, m, d) + 49) % 60;
  return { index: i, stem: i % 10, branch: i % 12, text: STEMS[i % 10] + BRANCHES[i % 12] };
}

/**
 * 그 날짜가 속한 절기월의 지지(寅=2 …).
 *
 * 중요: 사주(四柱)는 절입 "시각"까지 따지지만, 暦注(一粒万倍日 등)는
 *   **절기가 든 날 하루 전체를 새 달로 친다**(날짜 단위).
 *   예) 2026년 啓蟄은 3/5 22:50이지만, 暦注상 3/5는 이미 卯月로 취급한다.
 *   이 차이를 무시하면 3/5가 一粒万倍日에서 누락된다(공개 자료와 대조해 확인).
 */
function monthBranchOf(y: number, m: number, d: number): number {
  const today = jdn(y, m, d);
  const terms = [...solarTerms(y - 1), ...solarTerms(y), ...solarTerms(y + 1)]
    .sort((a, b) => a.jd - b.jd);
  let cur = terms[0];
  for (const t of terms) {
    const termDay = Math.floor(t.jd + 0.5); // 절기가 든 "날짜"
    if (termDay <= today) cur = t; else break;
  }
  return cur.branch;
}

/**
 * 一粒万倍日 대응표.
 * 절기월(월지)마다 해당하는 일지 2개가 정해져 있다.
 * key = 월지 인덱스(子0 … 亥11), value = 일지 인덱스 배열
 */
const ICHIRYU_TABLE: Record<number, number[]> = {
  2: [1, 6],    // 寅月 → 丑・午
  3: [9, 2],    // 卯月 → 酉・寅
  4: [0, 3],    // 辰月 → 子・卯
  5: [3, 4],    // 巳月 → 卯・辰
  6: [5, 6],    // 午月 → 巳・午
  7: [9, 6],    // 未月 → 酉・午
  8: [0, 7],    // 申月 → 子・未
  9: [3, 8],    // 酉月 → 卯・申
  10: [6, 9],   // 戌月 → 午・酉
  11: [9, 10],  // 亥月 → 酉・戌
  0: [11, 0],   // 子月 → 亥・子
  1: [3, 0],    // 丑月 → 卯・子
};

/**
 * 不成就日 — 절기월 + 음력일 기준이 정석이나 음력 변환이 필요하다.
 * 여기서는 널리 쓰이는 "월지별 해당 일지" 간이 방식을 쓰지 않고,
 * 정확도를 담보할 수 없으므로 계산하지 않는다(과장된 정보를 내보내지 않기 위함).
 */

/** 하루에 해당하는 개운일 종류들 */
export function kaiunKindsOf(y: number, m: number, d: number): KaiunKind[] {
  const { branch, text } = dayGanzhi(y, m, d);
  const mb = monthBranchOf(y, m, d);
  const kinds: KaiunKind[] = [];

  // 天赦日: 계절별로 정해진 간지일
  //   春(寅卯辰)=戊寅 / 夏(巳午未)=甲午 / 秋(申酉戌)=戊申 / 冬(亥子丑)=甲子
  const season =
    [2, 3, 4].includes(mb) ? '戊寅' :
    [5, 6, 7].includes(mb) ? '甲午' :
    [8, 9, 10].includes(mb) ? '戊申' : '甲子';
  if (text === season) kinds.push('tensha');

  // 一粒万倍日
  if (ICHIRYU_TABLE[mb]?.includes(branch)) kinds.push('ichiryu');

  // 寅の日 / 巳の日 / 甲子の日
  if (branch === 2) kinds.push('tora');
  if (branch === 5) kinds.push('mi');
  if (text === '甲子') kinds.push('kinoe_ne');

  return kinds;
}

export type KaiunDay = {
  /** YYYY-MM-DD */
  date: string;
  y: number; m: number; d: number;
  /** 요일 0=일 */
  weekday: number;
  ganzhi: string;
  kinds: KaiunKind[];
  /** 天赦日 + 一粒万倍日이 겹치는 "최강 개운일" */
  strongest: boolean;
  /** 길일 점수 (표시 강조용) */
  score: number;
};

const pad = (n: number) => String(n).padStart(2, '0');

export function kaiunDayOf(y: number, m: number, d: number): KaiunDay {
  const kinds = kaiunKindsOf(y, m, d);
  const { text } = dayGanzhi(y, m, d);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const strongest = kinds.includes('tensha') && kinds.includes('ichiryu');
  const score =
    (kinds.includes('tensha') ? 3 : 0) +
    (kinds.includes('ichiryu') ? 2 : 0) +
    (kinds.includes('kinoe_ne') ? 1 : 0) +
    (kinds.includes('tora') || kinds.includes('mi') ? 1 : 0);
  return {
    date: `${y}-${pad(m)}-${pad(d)}`,
    y, m, d, weekday, ganzhi: text, kinds, strongest, score,
  };
}

/** 한 달치 */
export function kaiunMonth(y: number, m: number): KaiunDay[] {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const out: KaiunDay[] = [];
  for (let d = 1; d <= last; d++) out.push(kaiunDayOf(y, m, d));
  return out;
}

/** 오늘 이후 가장 가까운 "개운일" n개 */
export function upcomingKaiun(fromYmd: string, n = 5, onlyStrong = false): KaiunDay[] {
  const [y0, m0, d0] = fromYmd.split('-').map(Number);
  const out: KaiunDay[] = [];
  const cur = new Date(Date.UTC(y0, m0 - 1, d0));
  for (let i = 0; i < 400 && out.length < n; i++) {
    const y = cur.getUTCFullYear(), m = cur.getUTCMonth() + 1, d = cur.getUTCDate();
    const day = kaiunDayOf(y, m, d);
    const ok = onlyStrong ? day.strongest : day.kinds.some((k) => KAIUN_INFO[k].good);
    if (ok && i > 0) out.push(day);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** 한 해의 天赦日만 */
export function tenshaDaysOfYear(y: number): KaiunDay[] {
  const out: KaiunDay[] = [];
  for (let m = 1; m <= 12; m++) {
    for (const day of kaiunMonth(y, m)) {
      if (day.kinds.includes('tensha')) out.push(day);
    }
  }
  return out;
}
