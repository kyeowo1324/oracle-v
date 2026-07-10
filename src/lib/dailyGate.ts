// src/lib/dailyGate.ts
// 하루 무료 N회 + 이후 쿨다운(AdGateModal) 게이트.
// - JST(일본 기준) 날짜가 바뀌면 자동 리셋
// - 인증 없이 localStorage 기반(기기별) — 제로코스트 원칙에 맞는 가장 단순한 방식.
//   완벽한 어뷰징 방지가 목적이 아니라, 일반 사용자의 반복 조회에 쿨다운/광고 노출 기회를 만드는 것이 목적.
//
// ── v2: 모드별 무료 횟수를 설정값으로 분리 ──
// 기존 v1은 "썼다/안 썼다"(boolean) 1회 고정이었으나, 이제 모드별로 몇 회까지
// 무료인지를 FREE_VIEW_LIMITS 하나로 조정할 수 있다. 운영 런북(RUNBOOK.md) §3/§4 참고.
// 기존 API(hasUsedFreeView/markFreeViewUsed)는 이름·시그니처 그대로 유지 —
// 호출부(flow/page.tsx, result 페이지들)는 수정 없이 그대로 동작한다.
import { getJstDateString } from './daily';

export type GateMode = 'fortune' | 'decision';

const STORAGE_KEY = 'oracle_v_gate_v2';

// ★ 여기 숫자만 바꾸면 모드별 하루 무료 횟수가 바뀐다.
//   fortune: 오늘의 운세 / decision: する・しない
//   (런북 §3: fortune 1→2, §4: decision 1→5 가 각각 이 값)
export const FREE_VIEW_LIMITS: Record<GateMode, number> = {
  fortune: 1,
  decision: 5,
};

interface GateState {
  date: string;
  fortune_count: number;
  decision_count: number;
}

// v1(boolean) 저장값이 남아있어도 깨지지 않도록 방어적으로 읽는다.
function readState(): GateState {
  const today = getJstDateString();
  const empty: GateState = { date: today, fortune_count: 0, decision_count: 0 };
  if (typeof window === 'undefined') return empty;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<GateState> & {
      fortune_used?: boolean; decision_used?: boolean; // v1 잔재 방어
    };
    if (parsed.date !== today) return empty; // 날짜가 바뀜 → 리셋
    return {
      date: today,
      fortune_count: parsed.fortune_count ?? (parsed.fortune_used ? 1 : 0),
      decision_count: parsed.decision_count ?? (parsed.decision_used ? 1 : 0),
    };
  } catch {
    return empty;
  }
}

function writeState(state: GateState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* localStorage 접근 불가(프라이빗 모드 등) → 조용히 무시, 매번 무료로 취급 */
  }
}

function countOf(s: GateState, mode: GateMode): number {
  return mode === 'fortune' ? s.fortune_count : s.decision_count;
}

/** 오늘 이 모드(fortune/decision)의 무료 조회를 이미 다 썼는지 여부 (FREE_VIEW_LIMITS 기준) */
export function hasUsedFreeView(mode: GateMode): boolean {
  return countOf(readState(), mode) >= FREE_VIEW_LIMITS[mode];
}

/** 오늘의 무료 조회 1회를 사용 처리(결과를 실제로 보여주기 직전에 호출) */
export function markFreeViewUsed(mode: GateMode): void {
  const s = readState();
  const next: GateState = {
    ...s,
    [mode === 'fortune' ? 'fortune_count' : 'decision_count']: countOf(s, mode) + 1,
  };
  writeState(next);
}

/** (선택) 오늘 몇 회 남았는지 — 안내 문구 등에 쓰고 싶을 때 사용 */
export function remainingFreeViews(mode: GateMode): number {
  return Math.max(0, FREE_VIEW_LIMITS[mode] - countOf(readState(), mode));
}
