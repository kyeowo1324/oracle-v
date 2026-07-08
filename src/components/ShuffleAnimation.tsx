// src/components/ShuffleAnimation.tsx
// 셔플 모션: 카드 뭉치가 섞이고 한 장이 빠져나오는 애니메이션(순수 CSS).
// TarotStep에서 셔플 버튼을 누르면 잠깐 이 화면을 보여준 뒤 pick 단계로 넘어감.
'use client';

export default function ShuffleAnimation({ label = 'シャッフル中…' }: { label?: string }) {
  // 뒤섞이는 카드 6장 (각기 다른 딜레이/방향)
  const cards = [0, 1, 2, 3, 4, 5];
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="relative h-48 w-40">
        {cards.map((i) => (
          <div
            key={i}
            className="sa-card absolute left-1/2 top-1/2 h-40 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#4A4C86] bg-gradient-to-b from-[#2A2D6B] to-[#1A1B3A]"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="flex h-full items-center justify-center text-2xl text-[#C9A227]/40">✦</div>
          </div>
        ))}
        {/* 빠져나오는 카드 */}
        <div className="sa-draw absolute left-1/2 top-1/2 h-40 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#C9A227] bg-gradient-to-b from-[#C9A227] to-[#A8841E]">
          <div className="flex h-full items-center justify-center text-2xl text-[#14152B]">✧</div>
        </div>
      </div>
      <p className="mt-8 text-sm tracking-[3px] text-[#B8B4D9]">{label}</p>

      <style jsx>{`
        .sa-card { animation: saShuffle 1.2s ease-in-out infinite; }
        .sa-card:nth-child(1) { animation-name: saShuffleA; }
        .sa-card:nth-child(2) { animation-name: saShuffleB; }
        .sa-card:nth-child(3) { animation-name: saShuffleA; }
        .sa-card:nth-child(4) { animation-name: saShuffleB; }
        .sa-card:nth-child(5) { animation-name: saShuffleA; }
        .sa-card:nth-child(6) { animation-name: saShuffleB; }
        .sa-draw { animation: saDraw 1.8s ease-in-out infinite; opacity: 0; }

        @keyframes saShuffleA {
          0%,100% { transform: translate(-50%,-50%) rotate(-6deg) translateX(-14px); }
          50%     { transform: translate(-50%,-50%) rotate(6deg) translateX(14px); }
        }
        @keyframes saShuffleB {
          0%,100% { transform: translate(-50%,-50%) rotate(6deg) translateX(14px); }
          50%     { transform: translate(-50%,-50%) rotate(-6deg) translateX(-14px); }
        }
        @keyframes saDraw {
          0%,55% { opacity: 0; transform: translate(-50%,-50%) translateY(0) scale(0.9); }
          70%    { opacity: 1; transform: translate(-50%,-50%) translateY(-60px) scale(1.05); }
          100%   { opacity: 0; transform: translate(-50%,-50%) translateY(-100px) scale(1); }
        }
      `}</style>
    </div>
  );
}
