// src/lib/decks.ts
// ホシドタロ — 덱(카드 세트) 레지스트리 (v2: 매니페스트 구동)
//
// v1은 available을 손으로 true/false 바꾸는 방식이었지만, 이제는
// scripts/generate-deck-manifest.mjs 가 빌드 시 public/tarot-images/<덱>/ 을
// 스캔해 만든 deck-manifest.json 이 오픈/準備中을 자동 결정한다:
//   - 이미지가 minCards(기본 22 = 메이저 아르카나) 이상 → 자동 오픈
//   - 폴더가 없거나 부족 → 準備中
//
// 레어 덱 모델 = "스킨": 카드 이름·해석은 오리지널을 공유하고 이미지만 바뀐다.
//   → DB 시딩 불필요. 새 덱 추가 = 이미지 폴더 + decks.config.json 이름 한 줄.
//
// 기존 export(DECKS/DEFAULT_DECK/DeckKey/DeckInfo/getDeck)는 그대로 유지 —
// collection 페이지·lib은 수정 없이 동작한다.

import manifestJson from '@/data/deck-manifest.json';
import configJson from '@/data/decks.config.json';

type ManifestDeck = { count: number; files: Record<string, string> };
const MANIFEST: Record<string, ManifestDeck> =
  ((manifestJson as unknown as { decks?: Record<string, ManifestDeck> })?.decks) ?? {};
const CONFIG = configJson as unknown as {
  rareChance?: number;
  minCards?: number;
  names?: Record<string, string>;
};

// 덱 키는 자유 문자열로 확장 (신규 덱을 타입 수정 없이 추가하기 위함)
export type DeckKey = string;

/** 레어 덱 등장 확률 (오리지널 = 1 - RARE_CHANCE). decks.config.json에서 조정. */
export const RARE_CHANCE: number = Math.min(Math.max(CONFIG.rareChance ?? 0.05, 0), 0.5);
const MIN_CARDS: number = CONFIG.minCards ?? 22;
const NAMES: Record<string, string> = CONFIG.names ?? {};
const DECK_KEY_RE = /^[a-z0-9_-]{2,20}$/;

export type DeckInfo = {
  key: DeckKey;
  nameJa: string;
  /** 출시 여부 — false면 컬렉션 탭에 「準備中」으로 표시 */
  available: boolean;
  /** 카드 이미지 폴더 (public/ 하위). original은 기존 경로 유지 */
  imageBase: string;
  /** 이 덱에 이미지가 존재하는 카드 수 (original은 78 고정) */
  cardCount: number;
};

function buildDecks(): DeckInfo[] {
  // config 이름 목록 ∪ 매니페스트 폴더 목록 (이름 없는 새 폴더도 자동 등장)
  // 순서: decks.config.json의 names에 적은 순서 우선, 이름 없는 새 폴더는 뒤에 알파벳순
  const ordered = [
    ...Object.keys(NAMES),
    ...Object.keys(MANIFEST).filter((k) => !(k in NAMES)).sort(),
  ];
  const rare = [...new Set(ordered)]
    .filter((k) => k !== 'original' && DECK_KEY_RE.test(k))
    .map((key): DeckInfo => {
      const count = MANIFEST[key] ? Object.keys(MANIFEST[key].files).length : 0;
      return {
        key,
        nameJa: NAMES[key] ?? key,
        available: count >= MIN_CARDS, // ← "이미지가 있으면 오픈"의 판정 지점
        imageBase: `/tarot-images/${key}`,
        cardCount: count,
      };
    });
  return [
    { key: 'original', nameJa: 'オリジナル', available: true, imageBase: '/tarot-images', cardCount: 78 },
    ...rare,
  ];
}

export const DECKS: DeckInfo[] = buildDecks();
export const DEFAULT_DECK: DeckKey = 'original';

export function getDeck(key: string): DeckInfo {
  return DECKS.find((d) => d.key === key) ?? DECKS[0];
}

/** 출시된 레어 덱 목록 (확률 추첨 대상) */
export function getRareDecks(): DeckInfo[] {
  return DECKS.filter((d) => d.available && d.key !== 'original');
}

/** 해당 덱에 이미지가 존재하는 card_key 집합 */
export function deckCardSet(key: DeckKey): Set<string> {
  const m = MANIFEST[key];
  return new Set(m ? Object.keys(m.files) : []);
}

/** 카드 이미지 URL — original은 기존 경로, 레어 덱은 매니페스트의 실제 파일명(확장자 포함) 사용 */
export function deckImageUrl(deck: DeckKey, cardKey: string): string {
  if (deck !== 'original') {
    const file = MANIFEST[deck]?.files?.[cardKey];
    if (file) return `/tarot-images/${deck}/${file}`;
  }
  return `/tarot-images/${cardKey}.jpg`;
}

/**
 * 클라이언트가 보낸 deck_key 검증 (result API용).
 * 형식이 맞고, 매니페스트에 실존하며, 해당 카드 이미지가 실제로 있는 경우에만 인정.
 * 그 외에는 전부 'original'로 폴백 → 경로 조작·없는 이미지 참조 차단.
 */
export function resolveDeckKey(input: unknown, cardKey: string): DeckKey {
  if (typeof input !== 'string' || input === 'original') return 'original';
  if (!DECK_KEY_RE.test(input)) return 'original';
  if (!MANIFEST[input]?.files?.[cardKey]) return 'original';
  return input;
}
