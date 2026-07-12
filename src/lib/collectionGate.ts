// src/lib/collectionGate.ts
// 一枚引き 등 무제한 뽑기로 도감이 순식간에 채워지는 걸 완화.
//
// 설계 의도:
//  - 뽑기 자체는 계속 무제한(엔터테인먼트를 막지 않음)
//  - 단, "도감에 새로 등록되는 카드"는 하루 N장까지만 → 매일 방문 동기(리텐션)
//  - 상한을 넘겨 뽑은 카드는 도감에 안 들어가고, "오늘 등록분 소진" 안내만
//
// 왜 이 방식인가:
//  - 완전 차단(뽑기 제한)은 재미를 해침. 반대로 무제한 등록은 수집의 가치를 붕괴.
//  - "매일 조금씩 모인다"는 가챠/도감의 핵심 리듬을 유지하는 절충안.
//  - 오늘의 운세(3장)·する・しない(1장)는 원래 무료 게이트가 있어 남용이 어려우므로
//    그대로 두고, 무제한인 一枚引き 계열에만 이 게이트를 적용한다.
'use client';

import { getJstDateString } from './daily';

const KEY = 'hoshidotaro:coll_gate:v1';

// 하루 도감 신규 등록 상한 (一枚引き 경로). 필요시 이 값만 조정.
export const DAILY_NEW_CARD_LIMIT = 5;

interface GateState {
  date: string;
  added: number; // 오늘 도감에 새로 등록한 카드 수
}

function read(): GateState {
  const today = getJstDateString();
  if (typeof window === 'undefined') return { date: today, added: 0 };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { date: today, added: 0 };
    const p = JSON.parse(raw) as GateState;
    return p.date === today ? p : { date: today, added: 0 }; // 날짜 바뀌면 리셋
  } catch {
    return { date: today, added: 0 };
  }
}

function write(s: GateState) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

/** 오늘 도감에 새 카드를 더 등록할 수 있는지 */
export function canRegisterNewCard(): boolean {
  return read().added < DAILY_NEW_CARD_LIMIT;
}

/** 오늘 남은 신규 등록 가능 수 */
export function remainingNewCards(): number {
  return Math.max(0, DAILY_NEW_CARD_LIMIT - read().added);
}

/** 신규 등록 1회 소비 (실제로 도감에 새 카드가 추가됐을 때만 호출) */
export function consumeNewCard(): void {
  const s = read();
  write({ date: s.date, added: s.added + 1 });
}
