// src/app/collection/page.tsx
// ホシドタロ — カードコレクション（도감）
// - 뽑아본 카드는 아트 공개, 아직인 카드는 뒷면(잠금) 표시
// - 카드 탭 → 확대 모달 (정/역 열람 여부, 횟수, 처음 만난 날)
// - 덱 탭: オリジナル(활성) + 河童·座敷童子·化け猫(準備中)
// - 데이터: 마스터 목록은 /api/collection/cards, 수집 현황은 localStorage
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import StarrySky from '@/components/StarrySky';
import { DECKS, DEFAULT_DECK, type DeckKey } from '@/lib/decks';
import { getDeckCollection, type DeckCollection } from '@/lib/collection';

type MasterCard = {
  key: string;
  nameJa: string;
  suit: string | null;
  arcana: string;
  imageUrl: string;
};

const SUIT_ORDER = ['major', 'wands', 'cups', 'swords', 'pentacles'];
const SUIT_JA: Record<string, string> = {
  major: '大アルカナ',
  wands: 'ワンド',
  cups: 'カップ',
  swords: 'ソード',
  pentacles: 'ペンタクル',
};

export default function CollectionPage() {
  const [deck, setDeck] = useState<DeckKey>(DEFAULT_DECK);
  const [cards, setCards] = useState<MasterCard[]>([]);
  const [collection, setCollection] = useState<DeckCollection>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState<MasterCard | null>(null);

  useEffect(() => {
    setCollection(getDeckCollection(deck));
  }, [deck]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch(`/api/collection/cards?deck=${deck}`);
        const data = await res.json();
        if (!data?.cards) throw new Error('no cards');
        setCards(data.cards);
      } catch {
        setFailed(true);
        setCards([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [deck]);

  const seenCount = Object.keys(collection).length;
  const total = cards.length || 78;
  const percent = total ? Math.round((seenCount / total) * 100) : 0;

  // 슈트별 그룹핑 (大アルカナ → ワンド → カップ → ソード → ペンタクル)
  const groups = useMemo(() => {
    const g: Record<string, MasterCard[]> = {};
    for (const c of cards) {
      const s = c.arcana === 'major' ? 'major' : (c.suit ?? 'major');
      (g[s] ??= []).push(c);
    }
    return SUIT_ORDER.filter((s) => g[s]?.length).map((s) => ({ suit: s, cards: g[s] }));
  }, [cards]);

  const zoomEntry = zoom ? collection[zoom.key] : undefined;

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <StarrySky />

      <div className="relative mx-auto max-w-md px-6 pb-16 pt-6 sm:max-w-2xl">
        <Link href="/" className="text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          カードコレクション
        </h1>
        <p className="mt-2 text-center text-xs text-[#8B8DBC]">
          占いで引いたカードが、ここに集まっていきます
        </p>

        {/* 덱 탭 */}
        <div className="mt-6 flex justify-center gap-2">
          {DECKS.map((d) => (
            <button
              key={d.key}
              disabled={!d.available}
              onClick={() => d.available && setDeck(d.key)}
              className={`rounded-full px-4 py-1.5 text-[12px] transition-colors ${
                deck === d.key
                  ? 'bg-[#C9A227] font-semibold text-[#14152B]'
                  : d.available
                    ? 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'
                    : 'border border-[#2A2C55] text-[#5D5F91]'
              }`}
            >
              {d.nameJa}
              {!d.available && <span className="ml-1 text-[10px]">準備中</span>}
            </button>
          ))}
        </div>

        {/* 진행도 */}
        <div className="mx-auto mt-6 max-w-sm">
          <div className="flex items-end justify-between text-xs">
            <span className="text-[#C9A227]">収集率</span>
            <span className="text-[#F6F1E4]">
              {seenCount} <span className="text-[#8B8DBC]">/ {total}枚（{percent}%）</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#26284F]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C9A227] to-[#F5E6A8] transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* 그리드 */}
        {loading ? (
          <p className="mt-12 text-center text-sm text-[#8B8DBC]">読み込み中…</p>
        ) : failed ? (
          <p className="mt-12 text-center text-sm text-[#8B8DBC]">
            カード一覧を取得できませんでした。<br />時間をおいて再度お試しください。
          </p>
        ) : (
          groups.map(({ suit, cards: list }) => (
            <section key={suit} className="mt-8">
              <h2 className="text-sm font-medium text-[#C9A227]">{SUIT_JA[suit] ?? suit}</h2>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {list.map((c) => {
                  const entry = collection[c.key];
                  const unlocked = !!entry;
                  return (
                    <button
                      key={c.key}
                      onClick={() => unlocked && setZoom(c)}
                      className={`group relative aspect-[3/5] overflow-hidden rounded-lg ring-1 transition-transform ${
                        unlocked
                          ? 'ring-[#C9A227]/40 hover:-translate-y-0.5 hover:ring-[#C9A227]'
                          : 'cursor-default ring-[#2A2C55]'
                      }`}
                      aria-label={unlocked ? c.nameJa : '未収集のカード'}
                    >
                      {unlocked ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.imageUrl}
                            alt={c.nameJa}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1 pt-3 text-center text-[9px] leading-tight text-[#F6F1E4]">
                            {c.nameJa}
                          </span>
                        </>
                      ) : (
                        /* 잠금: 카드 뒷면 (별 문양) */
                        <span className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#20224A] to-[#171833]">
                          <span className="text-lg text-[#3A3C6B]">✦</span>
                          <span className="mt-1 text-[8px] tracking-widest text-[#3A3C6B]">？？？</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {/* 아직 하나도 없을 때 */}
        {!loading && !failed && seenCount === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-[#3A3C6B] p-5 text-center">
            <p className="text-sm text-[#B8B4D9]">まだカードがありません</p>
            <Link
              href="/flow?mode=fortune"
              className="mt-4 inline-block rounded-full bg-[#C9A227] px-6 py-2 text-[13px] font-semibold text-[#14152B]"
            >
              今日の運勢を占ってカードを集める
            </Link>
          </div>
        )}

        <p className="mt-10 text-center text-[10px] leading-relaxed text-[#5D5F91]">
          ※ コレクションはこのブラウザに保存されます。<br />
          キャッシュ削除や端末変更でリセットされる場合があります。
        </p>
      </div>

      {/* 확대 모달 */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-6"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs text-center">
            <div className="relative mx-auto aspect-[3/5] w-full overflow-hidden rounded-2xl ring-2 ring-[#C9A227]/60 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={zoom.imageUrl} alt={zoom.nameJa} className="h-full w-full object-cover" />
            </div>
            <p className="mt-4 text-lg text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
              {zoom.nameJa}
            </p>

            {/* 열람 정보 */}
            <div className="mt-2 flex items-center justify-center gap-2 text-[11px]">
              <span
                className={`rounded-full px-3 py-1 ${
                  zoomEntry?.seenUpright
                    ? 'bg-[#C9A227]/20 text-[#F5E6A8] ring-1 ring-[#C9A227]/50'
                    : 'bg-[#1A1B3A] text-[#5D5F91] ring-1 ring-[#2A2C55]'
                }`}
              >
                正位置 {zoomEntry?.seenUpright ? '✓' : '—'}
              </span>
              <span
                className={`rounded-full px-3 py-1 ${
                  zoomEntry?.seenReversed
                    ? 'bg-[#C9A227]/20 text-[#F5E6A8] ring-1 ring-[#C9A227]/50'
                    : 'bg-[#1A1B3A] text-[#5D5F91] ring-1 ring-[#2A2C55]'
                }`}
              >
                逆位置 {zoomEntry?.seenReversed ? '✓' : '—'}
              </span>
            </div>
            {zoomEntry && (
              <p className="mt-2 text-[11px] text-[#8B8DBC]">
                出会った回数 {zoomEntry.count}回 ・ 初めての日 {zoomEntry.firstSeenAt}
              </p>
            )}

            <button
              onClick={() => setZoom(null)}
              className="mt-5 rounded-full border border-[#3A3C6B] px-8 py-2 text-[12px] text-[#B8B4D9] hover:border-[#C9A227]"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
