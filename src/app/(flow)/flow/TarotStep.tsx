// src/app/(flow)/flow/TarotStep.tsx
// 셔플 버튼 → 셔플 애니메이션(최소 1.4초) + API 병렬 → pick 단계
// cardCount: fortune=3, decision=1
'use client';

import { useState } from 'react';
import { useFortune } from '@/lib/fortune-context';
import ShuffleAnimation from '@/components/ShuffleAnimation';

interface DrawnCard {
  card_key: string;
  orientation: 'upright' | 'reversed';
  name: string;
  text: string;
  image_url: string;
}

const POSITIONS = ['過去', '現在', '未来'];

function CardBack({ picked, label }: { picked: boolean; label?: string }) {
  const [imgOk, setImgOk] = useState(true);
  if (picked) return <span className="text-sm font-medium text-[#14152B]">{label}</span>;
  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/tarot-images/back.jpg" alt="" onError={() => setImgOk(false)} className="h-full w-full rounded-md object-cover" />
    );
  }
  return <span className="text-2xl text-[#C9A227]/40">✦</span>;
}

export function TarotStep({
  onDone, onBack, cardCount = 3,
}: {
  onDone: () => void; onBack: () => void; cardCount?: number;
}) {
  const f = useFortune();
  const [phase, setPhase] = useState<'shuffle' | 'shuffling' | 'pick'>('shuffle');
  const [shuffleCount, setShuffleCount] = useState(3);
  const [six, setSix] = useState<DrawnCard[]>([]);
  const [picked, setPicked] = useState<number[]>([]);

  const single = cardCount === 1;

  const doShuffle = async () => {
    setPhase('shuffling');
    // 애니메이션 최소 노출 시간과 API 호출을 병렬로 → 둘 다 끝나야 pick으로
    const minDelay = new Promise((r) => setTimeout(r, 1400));
    const fetchCards = fetch('/api/tarot/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shuffleCount, lang: 'ja' }),
    }).then((res) => res.json()).catch(() => ({ cards: [] }));

    const [, data] = await Promise.all([minDelay, fetchCards]);
    setSix(data.cards ?? []);
    setPicked([]);
    setPhase('pick');
  };

  const pick = (i: number) => {
    if (picked.includes(i) || picked.length >= cardCount) return;
    setPicked([...picked, i]);
  };

  const confirm = () => {
    const chosen = picked.map((i) => six[i]);
    f.setTarotCards(chosen.map((c) => ({ card_key: c.card_key, orientation: c.orientation })));
    sessionStorage.setItem('tarotFull', JSON.stringify(chosen));
    onDone();
  };

  // 셔플 애니메이션 중
  if (phase === 'shuffling') {
    return <ShuffleAnimation label={`${shuffleCount}回シャッフル中…`} />;
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">← 戻る</button>

      {phase === 'shuffle' && (
        <>
          <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>カードをシャッフル</h2>
          <p className="mt-2 text-center text-sm text-[#B8B4D9]">混ぜる回数だけ、あなたのカードが変わります</p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={() => setShuffleCount((n) => Math.max(1, n - 1))} className="h-10 w-10 rounded-full border border-[#3A3C6B] text-xl text-[#F6F1E4] hover:border-[#C9A227]" aria-label="減らす">−</button>
            <div className="w-20 text-center">
              <span className="text-3xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>{shuffleCount}</span>
              <span className="ml-1 text-sm text-[#8B8DBC]">回</span>
            </div>
            <button onClick={() => setShuffleCount((n) => Math.min(20, n + 1))} className="h-10 w-10 rounded-full border border-[#3A3C6B] text-xl text-[#F6F1E4] hover:border-[#C9A227]" aria-label="増やす">＋</button>
          </div>

          <button onClick={doShuffle} className="mt-10 w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B]">
            {shuffleCount}回シャッフルして引く
          </button>
        </>
      )}

      {phase === 'pick' && (
        <>
          <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {single ? '1枚を選ぶ' : '3枚を選ぶ'}
          </h2>
          <p className="mt-2 text-center text-sm text-[#B8B4D9]">
            {single ? `直感で1枚（${picked.length}/1）` : `過去・現在・未来（${picked.length}/3）`}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {six.map((_, i) => {
              const order = picked.indexOf(i);
              const isPicked = order !== -1;
              const label = single ? '✓' : POSITIONS[order];
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked.length >= cardCount && !isPicked}
                  className={`relative flex items-center justify-center overflow-hidden rounded-md border transition-all duration-300 aspect-[3/5] ${
                    isPicked
                      ? '-translate-y-2 border-[#C9A227] bg-[#C9A227]'
                      : 'border-[#4A4C86] bg-gradient-to-b from-[#2A2D6B] to-[#1A1B3A] hover:-translate-y-1 hover:border-[#C9A227] disabled:opacity-40'
                  }`}
                >
                  <CardBack picked={isPicked} label={label} />
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setPhase('shuffle')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
              もう一度シャッフル
            </button>
            <button onClick={confirm} disabled={picked.length < cardCount} className="flex-[2] rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B] transition-opacity disabled:opacity-30">
              結果を見る
            </button>
          </div>
        </>
      )}
    </div>
  );
}
