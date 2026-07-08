// src/lib/dailyGate.ts
// 하루 무료 1회 + 이후 광고 시청 게이트.
// - JST(일본 기준) 날짜가 바뀌면 자동 리셋
// - 인증 없이 localStorage 기반(기기별) — 제로코스트 원칙에 맞는 가장 단순한 방식.
//   완벽한 어뷰징 방지가 목적이 아니라, 일반 사용자의 반복 조회에 광고 노출 기회를 만드는 것이 목적.
import { getJstDateString } from './daily';

export type GateMode = 'fortune' | 'decision';

const STORAGE_KEY = 'oracle_v_gate_v1';

interface GateState {
  date: string;
  fortune_used: boolean;
  decision_used: boolean;
}

function readState(): GateState {
  const today = getJstDateString();
  if (typeof window === 'undefined') return { date: today, fortune_used: false, decision_used: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today, fortune_used: false, decision_used: false };
    const parsed = JSON.parse(raw) as GateState;
    if (parsed.date !== today) {
      // 날짜가 바뀜 → 오늘 기준으로 리셋
      return { date: today, fortune_used: false, decision_used: false };
    }
    return parsed;
  } catch {
    return { date: today, fortune_used: false, decision_used: false };
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

/** 오늘 이 모드(fortune/decision)의 무료 조회를 이미 썼는지 여부 */
export function hasUsedFreeView(mode: GateMode): boolean {
  const s = readState();
  return mode === 'fortune' ? s.fortune_used : s.decision_used;
}

/** 오늘의 무료 조회를 사용 처리(결과를 실제로 보여주기 직전에 호출) */
export function markFreeViewUsed(mode: GateMode): void {
  const s = readState();
  const next: GateState = { ...s, [mode === 'fortune' ? 'fortune_used' : 'decision_used']: true };
  writeState(next);
}
