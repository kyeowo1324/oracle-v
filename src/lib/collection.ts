// src/lib/collection.ts
// ホシドタロ — 카드 컬렉션(도감) 저장소
//
// 저장 위치: localStorage (브라우저별·기기별). 로그인 없이 동작하며 서버 비용 $0.
// 구조는 처음부터 "덱 구분"을 포함 → 河童·座敷童子·化け猫 덱 추가 시 그대로 확장.
//
// {
//   "original": {
//     "ar00": { seenUpright, seenReversed, count, firstSeenAt, lastSeenAt, nameJa, imageUrl },
//     ...
//   },
//   "kappa": { ... }
// }
'use client';

import type { DeckKey } from '@/lib/decks';

const STORAGE_KEY = 'hoshidotaro:collection:v1';

export type CollectionEntry = {
  seenUpright: boolean;
  seenReversed: boolean;
  count: number;
  firstSeenAt: string; // YYYY-MM-DD
  lastSeenAt: string;
  nameJa?: string;
  imageUrl?: string;
};

export type DeckCollection = Record<string, CollectionEntry>;
export type CollectionData = Partial<Record<DeckKey, DeckCollection>>;

function load(): CollectionData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CollectionData) : {};
  } catch {
    return {};
  }
}

function save(data: CollectionData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 저장 실패(용량 등)는 조용히 무시 — 서비스 본기능에 영향 없음 */
  }
}

/** 결과 객체에서 카드 키를 유연하게 추출 (API 응답 필드명 변화에 대비) */
export function extractCardKey(c: any): string | null {
  return c?.card_key ?? c?.cardKey ?? c?.key ?? c?.name_ja ?? c?.name ?? null;
}

export type SeenCard = {
  key?: string | null;
  name?: string;
  orientation: 'upright' | 'reversed';
  imageUrl?: string;
};

/** 결과 화면이 뜰 때 호출 — 뽑은 카드를 컬렉션에 기록 */
export function recordCards(deck: DeckKey, cards: SeenCard[]) {
  if (typeof window === 'undefined' || !cards.length) return;
  const data = load();
  const deckCol: DeckCollection = data[deck] ?? {};
  const today = new Date().toISOString().slice(0, 10);

  for (const c of cards) {
    const key = c.key ?? c.name;
    if (!key) continue;
    const prev = deckCol[key];
    deckCol[key] = {
      seenUpright: (prev?.seenUpright ?? false) || c.orientation === 'upright',
      seenReversed: (prev?.seenReversed ?? false) || c.orientation === 'reversed',
      count: (prev?.count ?? 0) + 1,
      firstSeenAt: prev?.firstSeenAt ?? today,
      lastSeenAt: today,
      nameJa: c.name ?? prev?.nameJa,
      imageUrl: c.imageUrl ?? prev?.imageUrl,
    };
  }

  data[deck] = deckCol;
  save(data);
}

/** 특정 덱의 수집 현황 조회 */
export function getDeckCollection(deck: DeckKey): DeckCollection {
  return load()[deck] ?? {};
}

/** 수집 통계 */
export function getDeckStats(deck: DeckKey, totalCards: number) {
  const col = getDeckCollection(deck);
  const seen = Object.keys(col).length;
  return { seen, total: totalCards, percent: totalCards ? Math.round((seen / totalCards) * 100) : 0 };
}
