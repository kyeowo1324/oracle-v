// src/lib/luckyReason.ts
// 럭키아이템 "근거" 엔진 — 신뢰성 개선의 핵심.
// 문제: 기존 럭키아이템은 색·숫자·아이템이 "이유 없이" 튀어나와 점(占)이 아니라 뽑기처럼 보였다.
// 해결: 별자리 엘리먼트(火地風水) × 요일의 오행(음양오행) 관계로
//       "왜 오늘 이 색/방위가 당신에게 맞는지"의 논리를 결정론으로 만든다.
// AI 불필요, 비용 $0. (원하면 AI 페르소나가 이 근거를 한 문장으로 각색 가능)

import { SIGN_ELEMENT, type Element } from '@/lib/compat';

// 요일별 오행(전통 음양오행: 月=水/火/木/金/土/日 매핑은 유파가 있으나
// 여기서는 널리 쓰이는 "曜日=五行" 대응을 사용).
// 日=陽, 月=陰… 대신 색·기운 해석에 쓰기 좋은 오행 대응을 채택.
const WEEKDAY_GOGYO: { ja: string; gogyo: string; color: string; hint: string }[] = [
  { ja: '日曜日', gogyo: '陽', color: '金色・赤', hint: '活力とスタートの気' },   // 0 Sun
  { ja: '月曜日', gogyo: '水', color: '白・銀',   hint: '静けさと直感の気' },     // 1 Mon
  { ja: '火曜日', gogyo: '火', color: '赤・朱',   hint: '情熱と行動の気' },       // 2 Tue
  { ja: '水曜日', gogyo: '水', color: '青・水色', hint: 'しなやかさと知性の気' }, // 3 Wed
  { ja: '木曜日', gogyo: '木', color: '緑・翠',   hint: '成長とご縁の気' },       // 4 Thu
  { ja: '金曜日', gogyo: '金', color: '白・金',   hint: '実りと魅力の気' },       // 5 Fri
  { ja: '土曜日', gogyo: '土', color: '黄・土色', hint: '安定と足場の気' },       // 6 Sat
];

const ELEMENT_JA: Record<Element, string> = {
  fire: '火', earth: '地', air: '風', water: '水',
};

// 별자리 엘리먼트와 요일 오행의 "관계"를 사람이 읽는 근거로 변환.
function relationText(el: Element, gogyo: string): string {
  const e = ELEMENT_JA[el];
  // 상생(북돋움) 관계 위주로 긍정적 근거를 만든다.
  if (el === 'fire' && (gogyo === '火' || gogyo === '陽')) return `あなたの${e}のエネルギーと今日の気が響き合い、勢いに乗りやすい日`;
  if (el === 'water' && gogyo === '水') return `あなたの${e}の感受性が今日の気とすっと重なり、直感が冴える日`;
  if (el === 'earth' && gogyo === '土') return `あなたの${e}の落ち着きが今日の気に支えられ、地に足がつく日`;
  if (el === 'air' && (gogyo === '木' || gogyo === '金')) return `あなたの${e}の軽やかさが今日の気と巡り合い、ご縁が動きやすい日`;
  // 그 외: 보완 관계로 해석(부족한 기운을 색·아이템으로 補う)
  return `あなたの${e}の性質に、今日の「${gogyo}」の気をひとつまみ添えると、バランスが整う日`;
}

export type LuckyReason = {
  weekdayJa: string;
  /** 오늘 기운의 근거(1문장) */
  reasonJa: string;
  /** 근거에서 도출된 "今日おすすめの色の傾向" */
  colorHintJa: string;
};

// 날짜 문자열(YYYY-MM-DD, JST 가정) + 별자리 → 근거.
export function luckyReason(dateStr: string, sign: string): LuckyReason {
  const d = new Date(dateStr + 'T00:00:00+09:00');
  const w = WEEKDAY_GOGYO[d.getDay()] ?? WEEKDAY_GOGYO[0];
  const el = SIGN_ELEMENT[sign] ?? 'fire';
  return {
    weekdayJa: w.ja,
    reasonJa: `${w.ja}は${w.hint}。${relationText(el, w.gogyo)}。`,
    colorHintJa: w.color,
  };
}
