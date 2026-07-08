// src/components/ShuffleAnimation.tsx
// 셔플 모션 v2: 덱이 좌·우 두 뭉치로 갈라졌다가, 한 장씩 교차로 겹쳐 합쳐지는
// 리플(riffle) 셔플. 순수 CSS, 이미지 0. 루프가 자연스럽게 이어지도록
// [갈라짐 → 정지 → 교차 합침 → 정돈] 4구간을 하나의 keyframe으로 구성.
'use client';

export default function ShuffleAnimation({ label = 'シャッフル中…' }: { label?: string }) {
  // 8장: 짝수(왼쪽 뭉치) / 홀수(오른쪽 뭉치). 합칠 때 인덱스 순으로 겹침.
  const cards = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center">
      <div className="relative h-52 w-64">
        {/* 덱 아래 은은한 골드 글로우 */}
        <div className="sh-glow absolute left-1/2 top-1/2 h-16 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full" />
        {cards.map((i) => {
          const left = i % 2 === 0;
          return (
            <div
              key={i}
              className={`sh-card ${left ? 'sh-left' : 'sh-right'} absolute left-1/2 top-1/2 h-36 w-[86px] rounded-lg border bg-gradient-to-b shadow-lg ${
                left
                  ? 'border-[#4A4C86] from-[#2A2D6B] to-[#1A1B3A]'
                  : 'border-[#5A5C9E] from-[#30336F] to-[#1E2050]'
              }`}
              style={
                {
                  zIndex: i,
                  // 합칠 때 카드마다 살짝 다른 타이밍으로 겹치게(리플 느낌)
                  '--merge-delay': `${i * 0.06}s`,
                  '--stack-y': `${-i * 1.5}px`,
                } as React.CSSProperties
              }
            >
              <div className="flex h-full items-center justify-center text-xl text-[#C9A227]/35">✦</div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm tracking-[3px] text-[#B8B4D9]">
        {label}
        <span className="sh-dots" />
      </p>

      <style jsx>{`
        .sh-card {
          margin-left: -43px; /* w/2 */
          margin-top: -72px; /* h/2 */
          animation-duration: 2.1s;
          animation-timing-function: cubic-bezier(0.45, 0, 0.25, 1);
          animation-iteration-count: infinite;
          animation-delay: var(--merge-delay);
          will-change: transform;
        }
        .sh-left {
          animation-name: shLeft;
        }
        .sh-right {
          animation-name: shRight;
        }
        .sh-glow {
          background: radial-gradient(ellipse at center, rgba(201, 162, 39, 0.22) 0%, transparent 70%);
          animation: shGlow 2.1s ease-in-out infinite;
        }
        .sh-dots::after {
          content: '';
          animation: shDots 1.4s steps(4) infinite;
        }

        /* 왼쪽 뭉치: 중앙 정돈 → 왼쪽으로 벌어짐 → 살짝 들림 → 중앙으로 겹쳐 합침 */
        @keyframes shLeft {
          0%,
          6% {
            transform: translateY(var(--stack-y)) rotate(0deg);
          }
          24% {
            transform: translate(-56px, var(--stack-y)) rotate(-9deg);
          }
          38% {
            transform: translate(-56px, calc(var(--stack-y) - 8px)) rotate(-9deg);
          }
          64% {
            transform: translate(0, calc(var(--stack-y) - 14px)) rotate(-2deg);
          }
          80%,
          100% {
            transform: translateY(var(--stack-y)) rotate(0deg);
          }
        }
        /* 오른쪽 뭉치: 대칭 + 반 박자 늦게 들려서 교차로 끼어드는 느낌 */
        @keyframes shRight {
          0%,
          6% {
            transform: translateY(var(--stack-y)) rotate(0deg);
          }
          24% {
            transform: translate(56px, var(--stack-y)) rotate(9deg);
          }
          44% {
            transform: translate(56px, calc(var(--stack-y) - 8px)) rotate(9deg);
          }
          68% {
            transform: translate(0, calc(var(--stack-y) - 10px)) rotate(2deg);
          }
          82%,
          100% {
            transform: translateY(var(--stack-y)) rotate(0deg);
          }
        }
        @keyframes shGlow {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
        @keyframes shDots {
          0% {
            content: '';
          }
          25% {
            content: '.';
          }
          50% {
            content: '..';
          }
          75% {
            content: '...';
          }
        }
      `}</style>
    </div>
  );
}
