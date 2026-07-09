// src/components/StarrySky.tsx
// 전역 배경 이펙트: C(잔잔한 반짝임 + 가끔 유성)를 메인으로, B(떠오르는 별)를 드물게 섞은 조합.
// - 순수 CSS 애니메이션(JS 없음), pointer-events 없음 → 성능·조작에 영향 없음
// - 위치는 하드코딩된 배열(렌더마다 동일) → SSR/hydration 불일치 없음
// - prefers-reduced-motion 사용자는 모든 움직임 정지(정적인 별만 표시)
'use client';

// [left%, top%, size(px), delay(s)]
const TWINKLE: [number, number, number, number][] = [
  [8, 12, 2, 0], [22, 34, 2, 1.2], [15, 62, 2, 2.4], [31, 8, 3, 0.6],
  [44, 28, 2, 1.8], [52, 55, 2, 3.0], [61, 14, 2, 0.3], [68, 40, 3, 2.1],
  [76, 70, 2, 1.5], [84, 22, 2, 2.7], [91, 48, 2, 0.9], [38, 76, 2, 3.3],
  [57, 84, 2, 1.1], [12, 86, 2, 2.0], [87, 82, 2, 0.4], [26, 50, 2, 3.6],
  [4, 44, 2, 1.6], [18, 20, 2, 3.5], [35, 60, 2, 0.8], [48, 8, 2, 2.9],
  [64, 58, 3, 0.1], [72, 26, 2, 1.4], [80, 60, 2, 3.1], [95, 10, 2, 0.5],
  [47, 92, 2, 2.6], [70, 90, 2, 1.9], [3, 70, 2, 2.3],
  [10, 30, 2, 0.2], [28, 68, 2, 1.3], [41, 44, 2, 2.8], [55, 22, 2, 3.7],
  [66, 74, 2, 0.7], [74, 8, 2, 2.2], [89, 34, 3, 1.0], [96, 66, 2, 3.4],
  [20, 78, 2, 0.45], [33, 24, 2, 1.75], [50, 68, 2, 3.2], [78, 46, 2, 0.95],
  [93, 88, 2, 2.5],
];

// [left%, delay(s)] — 떠오르는 별(드물게: 사이클 자체를 길게)
const RISING: [number, number][] = [
  [8, 0], [24, 2.4], [33, 4.8], [40, 7.2], [50, 9.6],
  [58, 12], [65, 14.4], [70, 16.8], [82, 19.2], [92, 21.6],
];

export default function StarrySky() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* 잔잔한 반짝임 (베이스) */}
      {TWINKLE.map(([l, t, s, d], i) => (
        <span
          key={`tw${i}`}
          className="ss-tw absolute rounded-full bg-[#F5E6A8]"
          style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${d}s` }}
        />
      ))}

      {/* 가끔 흐르는 유성 6개 (서로 다른 주기·경로) */}
      <span className="ss-shoot absolute" style={{ left: '68%', top: '10%', animationDelay: '2s' }} />
      <span className="ss-shoot absolute" style={{ left: '22%', top: '6%', animationDelay: '7.5s', animationDuration: '13s' }} />
      <span className="ss-shoot absolute" style={{ left: '45%', top: '16%', animationDelay: '4.5s', animationDuration: '11s' }} />
      <span className="ss-shoot absolute" style={{ left: '85%', top: '22%', animationDelay: '0.8s', animationDuration: '10s' }} />
      <span className="ss-shoot absolute" style={{ left: '12%', top: '30%', animationDelay: '6.2s', animationDuration: '12s' }} />
      <span className="ss-shoot absolute" style={{ left: '55%', top: '4%', animationDelay: '3.3s', animationDuration: '14s' }} />

      {/* 드물게 떠오르는 별 (B 요소) */}
      {RISING.map(([l, d], i) => (
        <span
          key={`fl${i}`}
          className="ss-rise absolute rounded-full bg-[#F5E6A8]"
          style={{ left: `${l}%`, animationDelay: `${d}s` }}
        />
      ))}

      <style jsx>{`
        .ss-tw {
          opacity: 0.25;
          animation: ssTwinkle 3.8s ease-in-out infinite;
        }
        @keyframes ssTwinkle {
          0%, 100% { opacity: 0.22; }
          50% { opacity: 0.95; }
        }

        .ss-shoot {
          width: 70px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #f5e6a8);
          transform: rotate(-32deg);
          opacity: 0;
          animation: ssShoot 9s ease-in infinite;
        }
        @keyframes ssShoot {
          0%, 90% { opacity: 0; transform: rotate(-32deg) translateX(0); }
          92% { opacity: 0.9; }
          98% { opacity: 0; transform: rotate(-32deg) translateX(-130px); }
          100% { opacity: 0; }
        }

        .ss-rise {
          bottom: -6px;
          width: 2px;
          height: 2px;
          opacity: 0;
          animation: ssRise 24s linear infinite;
        }
        @keyframes ssRise {
          0% { transform: translateY(0); opacity: 0; }
          3% { opacity: 0.85; }
          22% { opacity: 0.5; }
          30% { transform: translateY(-72vh); opacity: 0; }
          100% { transform: translateY(-72vh); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ss-tw, .ss-shoot, .ss-rise { animation: none; }
          .ss-tw { opacity: 0.4; }
          .ss-shoot, .ss-rise { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
