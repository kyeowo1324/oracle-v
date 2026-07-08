// src/components/FortuneTellerLoader.tsx
// 로딩 화면용 점술가 애니메이션 (순수 SVG+CSS, 이미지 0).
// 점술가가 수정구슬에 손을 올리고, 구슬이 맥동·발광, 파동이 퍼지고 별이 반짝인다.
'use client';

export default function FortuneTellerLoader({ message = '占っています' }: { message?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#14152B]">
      <div className="pointer-events-none fixed inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 30%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative">
        <svg width="200" height="220" viewBox="0 0 180 200" aria-label="占い師">
          <defs>
            <radialGradient id="ftl-orb" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#F5E6A8" />
              <stop offset="45%" stopColor="#C9A227" />
              <stop offset="100%" stopColor="#6B5310" />
            </radialGradient>
          </defs>

          {/* 그림자 */}
          <ellipse cx="90" cy="188" rx="52" ry="7" fill="#000" opacity="0.25" />

          {/* 점술가 몸/두건/얼굴 */}
          <g>
            <path d="M56 150 Q90 110 124 150 L128 172 Q90 182 52 172 Z" fill="#3A3C6B" />
            <path d="M64 150 Q90 122 116 150 L118 168 Q90 176 62 168 Z" fill="#4A4C86" />
            <circle cx="90" cy="96" r="19" fill="#4A4C86" />
            <path d="M71 96 Q90 66 109 96 Q109 78 90 74 Q71 78 71 96 Z" fill="#3A3C6B" />
            <ellipse cx="90" cy="100" rx="12" ry="13" fill="#E9C9A0" />
            <path d="M78 96 Q90 70 102 96 Q102 84 90 82 Q78 84 78 96 Z" fill="#2A2D6B" />
          </g>

          {/* 팔 + 손 (구슬 위) */}
          <g>
            <path d="M60 150 Q52 132 66 122 L74 132 Q66 142 70 152 Z" fill="#4A4C86" />
            <path d="M120 150 Q128 132 114 122 L106 132 Q114 142 110 152 Z" fill="#4A4C86" />
            <ellipse cx="70" cy="120" rx="7" ry="5" fill="#E9C9A0" />
            <ellipse cx="110" cy="120" rx="7" ry="5" fill="#E9C9A0" />
          </g>

          {/* 수정구슬 (맥동) */}
          <g className="ftl-orb">
            <circle cx="90" cy="130" r="24" fill="url(#ftl-orb)" />
            <circle cx="90" cy="130" r="24" fill="none" stroke="#F5E6A8" strokeWidth="1" opacity="0.6" />
            <ellipse cx="82" cy="122" rx="7" ry="5" fill="#FFF8E0" opacity="0.7" />
          </g>
          {/* 파동 링 */}
          <circle className="ftl-ring" cx="90" cy="130" r="30" fill="none" stroke="#C9A227" strokeWidth="1" opacity="0.5" />

          {/* 별 반짝임 */}
          <g className="ftl-tw1">
            <path d="M40 60 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#F5E6A8" />
            <path d="M142 74 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" fill="#F5E6A8" />
          </g>
          <g className="ftl-tw2">
            <path d="M148 48 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" fill="#F5E6A8" />
            <path d="M32 92 l1.5 4 l4 1.5 l-4 1.5 l-1.5 4 l-1.5 -4 l-4 -1.5 l4 -1.5 Z" fill="#F5E6A8" />
          </g>
        </svg>
        <p className="mt-4 text-center text-sm tracking-[3px] text-[#B8B4D9]">
          {message}<span className="ftl-dots" />
        </p>
      </div>

      <style jsx>{`
        .ftl-orb { transform-origin: 90px 130px; animation: ftlPulse 2.4s ease-in-out infinite; }
        .ftl-ring { transform-origin: 90px 130px; animation: ftlRing 2.4s ease-out infinite; }
        .ftl-tw1 { animation: ftlTwinkle 1.8s ease-in-out infinite; }
        .ftl-tw2 { animation: ftlTwinkle 1.8s ease-in-out 0.9s infinite; }
        .ftl-dots::after { content: ''; animation: ftlDots 1.4s steps(4) infinite; }
        @keyframes ftlPulse { 0%,100% { opacity: 0.85; transform: scale(1); } 50% { opacity: 1; transform: scale(1.06); } }
        @keyframes ftlRing { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.4); opacity: 0; } }
        @keyframes ftlTwinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes ftlDots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
      `}</style>
    </div>
  );
}
