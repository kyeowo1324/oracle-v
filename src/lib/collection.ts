'use client';
import type { DeckKey } from '@/lib/decks';
const STORAGE_KEY = 'hoshidotaro:collection:v1';
export type CollectionEntry = { seenUpright: boolean; seenReversed: boolean; count: number; firstSeenAt: string; lastSeenAt: string; nameJa?: string; imageUrl?: string; };
export type DeckCollection = Record<string, CollectionEntry>;
export type CollectionData = Partial<Record<DeckKey, DeckCollection>>;
function load(): CollectionData { if (typeof window === 'undefined') return {}; try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
function save(data: CollectionData) { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }
export function extractCardKey(c: any): string | null { return c?.card_key ?? c?.cardKey ?? c?.key ?? c?.name_ja ?? c?.name ?? null; }
export type SeenCard = { key?: string | null; name?: string; orientation: 'upright' | 'reversed'; imageUrl?: string; };
export function recordCards(deck: DeckKey, cards: SeenCard[]) {
  if (typeof window === 'undefined' || !cards.length) return;
  const data = load(); const deckCol: DeckCollection = data[deck] ?? {}; const today = new Date().toISOString().slice(0, 10);
  for (const c of cards) { const key = c.key ?? c.name; if (!key) continue; const prev = deckCol[key];
    deckCol[key] = { seenUpright: (prev?.seenUpright ?? false) || c.orientation === 'upright', seenReversed: (prev?.seenReversed ?? false) || c.orientation === 'reversed', count: (prev?.count ?? 0) + 1, firstSeenAt: prev?.firstSeenAt ?? today, lastSeenAt: today, nameJa: c.name ?? prev?.nameJa, imageUrl: c.imageUrl ?? prev?.imageUrl }; }
  data[deck] = deckCol; save(data);
}
export function getDeckCollection(deck: DeckKey): DeckCollection { return load()[deck] ?? {}; }

/**
 * 게이트 적용 기록: 이미 도감에 있는 카드는 그대로 갱신(count++),
 * "도감에 처음 들어오는 신규 카드"만 canRegister()가 true일 때 등록한다.
 * 반환: 이번에 실제로 신규 등록된 카드 키 목록(호출측이 게이트 소비/안내에 사용).
 */
export function recordCardsGated(
  deck: DeckKey,
  cards: SeenCard[],
  canRegister: () => boolean
): { newlyAdded: string[]; blocked: number } {
  const newlyAdded: string[] = [];
  let blocked = 0;
  if (typeof window === 'undefined' || !cards.length) return { newlyAdded, blocked };
  const data = load();
  const deckCol: DeckCollection = data[deck] ?? {};
  const today = new Date().toISOString().slice(0, 10);

  for (const c of cards) {
    const key = c.key ?? c.name;
    if (!key) continue;
    const prev = deckCol[key];
    const isNew = !prev;
    if (isNew) {
      // 신규 카드 — 게이트가 허용할 때만 등록
      if (!canRegister()) { blocked++; continue; }
      newlyAdded.push(key);
    }
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
  return { newlyAdded, blocked };
}
