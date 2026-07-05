// src/app/(flow)/flow/TarotStep.tsx
// 셔플 횟수 지정 → 서버가 156풀에서 6장 추출 → 3장 선택(과거·현재·미래)
// 카드 뒷면: /public/tarot-images/back.jpg 있으면 사용, 없으면 CSS 폴백. 카드 비율 3:5.
'use client';

import { useState } from 'react';
import { useFortune } from '@/lib/fortune-context';

interface DrawnCard {
  card_key: string;
  orientation: 'upright' | 'reversed';
  name: string;
  text: string;
  image_url: string;
}

const POSITIONS = ['過去', '現在', '未来'];

// 카드 뒷면: back.jpg 있으면 이미지, 없으면 CSS 별문양
function CardBack({ picked, label }: { picked: boolean; label?: string }) {
  const [imgOk, setImgOk] = useState(true);
  if (picked) {
    return <span className="text-sm font-medium text-[#14152B]">{label}</span>;
  }
  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/tarot-images/back.jpg"
        alt=""
        onError={() => setImgOk(false)}
        className="h-full w-full rounded-md object-cover"
      />
    );
  }
  return <span className="text-2xl text-[#C9A227]/40">✦</span>;
}

export function TarotStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const f = useFortune();
  const [phase, setPhase] = useState<'shuffle' | 'pick'>('shuffle');
  const [shuffleCount, setShuffleCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [six, setSix] = useState<DrawnCard[]>([]);
  const [picked, setPicked] = useState<number[]>([]);

  const doShuffle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tarot/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shuffleCount, lang: 'ja' }),
      });
      const data = await res.json();
      setSix(data.cards ?? []);
      setPicked([]);
      setPhase('pick');
    } finally {
      setLoading(false);
    }
  };

  const pick = (i: number) => {
    if (picked.includes(i) || picked.length >= 3) return;
    setPicked([...picked, i]);
  };

  const confirm = () => {
    const chosen = picked.map((i) => six[i]);
    f.setTarotCards(chosen.map((c) => ({ card_key: c.card_key, orientation: c.orientation })));
    sessionStorage.setItem('tarotFull', JSON.stringify(chosen));
    onDone();
  };

  return (
    <div className="flex flex-1 flex-col justify-center">
      <button onClick={onBack} className="mb-4 self-start text-xs text-[#8B8DBC] hover:text-[#F6F1E4]">
        ← 戻る
      </button>

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

          <button onClick={doShuffle} disabled={loading} className="mt-10 w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B] transition-opacity disabled:opacity-40">
            {loading ? 'シャッフル中…' : `${shuffleCount}回シャッフルして引く`}
          </button>
        </>
      )}

      {phase === 'pick' && (
        <>
          <h2 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>3枚を選ぶ</h2>
          <p className="mt-2 text-center text-sm text-[#B8B4D9]">過去・現在・未来（{picked.length}/3）</p>

          {/* 6장 뒷면 (3:5 비율) */}
          <div className="mt-8 grid grid-cols-3 gap-3">
            {six.map((_, i) => {
              const order = picked.indexOf(i);
              const isPicked = order !== -1;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={picked.length >= 3 && !isPicked}
                  className={`relative flex items-center justify-center overflow-hidden rounded-md border transition-all duration-300 aspect-[3/5] ${
                    isPicked
                      ? '-translate-y-2 border-[#C9A227] bg-[#C9A227]'
                      : 'border-[#4A4C86] bg-gradient-to-b from-[#2A2D6B] to-[#1A1B3A] hover:-translate-y-1 hover:border-[#C9A227] disabled:opacity-40'
                  }`}
                >
                  <CardBack picked={isPicked} label={POSITIONS[order]} />
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setPhase('shuffle')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
              もう一度シャッフル
            </button>
            <button onClick={confirm} disabled={picked.length < 3} className="flex-[2] rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B] transition-opacity disabled:opacity-30">
              結果を見る
            </button>
          </div>
        </>
      )}
    </div>
  );
}
