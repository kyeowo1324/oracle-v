// src/app/hitokoto/page.tsx
// 一枚引きタロット — 정보 입력 없이 카드 1장만 뽑는 가장 가벼운 진입점.
// 기존 /api/tarot/draw(6장 반환)를 재사용해 첫 장만 사용. AI 없음, 비용 $0.
// "今のあなたへのメッセージ" 컨셉 — 오늘의 운세로 유도하는 훅.
'use client';

import Link from 'next/link';
import { useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import ShuffleAnimation from '@/components/ShuffleAnimation';
import ShareButtons from '@/components/ShareButtons';
import { useSound } from '@/lib/useSound';

type Card = { card_key: string; name: string; orientation: 'upright' | 'reversed'; text: string; image_url: string };

export default function HitokotoPage() {
  const sound = useSound();
  const [phase, setPhase] = useState<'intro' | 'shuffle' | 'result'>('intro');
  const [card, setCard] = useState<Card | null>(null);
  const [flipped, setFlipped] = useState(false); // 결과 카드 뒤집기 연출

  const draw = async () => {
    setPhase('shuffle');
    sound.play('shuffle');
    try {
      const res = await fetch('/api/tarot/draw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shuffleCount: 3 + Math.floor(Math.random() * 5), lang: 'ja' }),
      });
      const data = await res.json();
      const first = data?.cards?.[0];
      if (!first) throw new Error('draw failed');
      setCard(first);
      setFlipped(false);
      setPhase('result');
      // 카드백 → 앞면 뒤집기: 살짝 뒤에 flip + reveal 사운드
      setTimeout(() => { setFlipped(true); sound.play('flip'); }, 250);
      setTimeout(() => sound.play('reveal'), 650);
    } catch {
      setPhase('intro');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10">
        <Link href="/" className="mb-2 self-start text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        {phase === 'shuffle' ? (
          <ShuffleAnimation label="カードを引いています…" />
        ) : phase === 'intro' ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h1 className="text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>一枚引きタロット</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#B8B4D9]">
              心を静めて、深呼吸をひとつ。<br />
              「今の私へのメッセージは？」と<br />問いかけながら、カードを引きましょう。
            </p>
            <button onClick={draw} className="mt-8 rounded-full bg-[#C9A227] px-8 py-3 text-sm font-semibold text-[#14152B]">
              カードを引く
            </button>
          </div>
        ) : card ? (
          <div className="flex flex-1 flex-col items-center">
            <p className="mt-2 text-xs tracking-widest text-[#C9A227]">今のあなたへのメッセージ</p>
            {/* 뒤집기 연출: 뒷면(카드백) → 앞면 */}
            <div className="mt-4 h-64 w-40" style={{ perspective: '900px' }}>
              <div
                className="relative h-full w-full transition-transform duration-500"
                style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* 뒷면 */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl border border-[#C9A227]/40 bg-gradient-to-b from-[#26284F] to-[#1A1B3A]"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-3xl text-[#C9A227]/70">✦</span>
                </div>
                {/* 앞면 */}
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image_url}
                    alt={card.name}
                    className={`h-full w-full rounded-xl object-cover ring-1 ring-[#C9A227]/40 ${card.orientation === 'reversed' ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>
            </div>
            <h2 className="mt-4 text-xl text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
              {card.name}<span className="ml-1 text-sm text-[#B8B4D9]">（{card.orientation === 'upright' ? '正位置' : '逆位置'}）</span>
            </h2>
            {card.text && (
              <div className="mt-5 w-full rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/70 p-5">
                <p className="text-[14px] leading-relaxed text-[#E4E1F2]">{card.text}</p>
              </div>
            )}

            <div className="mt-6 w-full">
              <ShareButtons text={`一枚引きで「${card.name}」を引きました🔮 #ホシドタロ #タロット占い`} />
            </div>

            <div className="mt-6 flex w-full gap-3">
              <button onClick={draw} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9]">もう一度引く</button>
              <Link href="/flow?mode=fortune" className="flex-1 rounded-lg bg-[#C9A227] py-3 text-center text-sm font-medium text-[#14152B]">今日の運勢 →</Link>
            </div>

            <div className="mt-8 w-full"><AdBanner slot="0000000000" /></div>
            <p className="mt-4 text-center text-[10px] text-[#5D5F91]">※ エンターテインメントを目的としています</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
