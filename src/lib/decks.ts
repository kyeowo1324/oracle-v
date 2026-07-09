// src/lib/decks.ts
// ホシドタロ — 덱(카드 세트) 레지스트리
// 새 덱을 출시할 때 여기의 available만 true로 바꾸면
// 컬렉션 페이지 탭·기록 로직이 자동으로 대응한다.

export type DeckKey = 'original' | 'kappa' | 'zashiki' | 'bakeneko';

export type DeckInfo = {
  key: DeckKey;
  nameJa: string;
  /** 출시 여부 — false면 컬렉션 탭에 「準備中」으로 표시 */
  available: boolean;
  /** 카드 이미지 폴더 (public/ 하위). original은 기존 경로 유지 */
  imageBase: string;
};

export const DECKS: DeckInfo[] = [
  { key: 'original', nameJa: 'オリジナル', available: true, imageBase: '/tarot-images' },
  { key: 'kappa', nameJa: '河童', available: false, imageBase: '/tarot-images/kappa' },
  { key: 'zashiki', nameJa: '座敷童子', available: false, imageBase: '/tarot-images/zashiki' },
  { key: 'bakeneko', nameJa: '化け猫', available: false, imageBase: '/tarot-images/bakeneko' },
];

export const DEFAULT_DECK: DeckKey = 'original';

export function getDeck(key: string): DeckInfo {
  return DECKS.find((d) => d.key === key) ?? DECKS[0];
}
