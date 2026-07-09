// src/app/page.tsx
// 일본 전용: JA/KO 토글 제거. 텍스트는 ja 고정(구조는 유지 → 나중에 다국어 복구 쉬움).
'use client';

import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';

export default function HomePage() {
  const t = {
    eyebrow: 'AI占いサービス',
    title: 'ホシドタロ',
    subtitle: '星座とタロットで、今日のあなたを占う',
    cardA: { label: '今日の運勢', desc: '星座・タロットから選んで占う', cta: '占ってみる' },
    cardB: { label: 'する・しない', desc: 'Yes/No、迷いに答えを', cta: '決める' },
    guideTitle: '占いガイド',
    guideA: '星座占いの基本',
    guideB: 'タロットカードの意味',
    guideC: '血液型でわかる性格',
    guideMore: 'ガイドをもっと見る',
    monthly: '2026年 月別運勢',
    footer: '本サービスはエンターテインメント目的です',
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <StarrySky />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10 sm:max-w-2xl">
        {/* 브랜드 헤더 — ホシ(별) · ド(잇다) · タロ(타로카드) 의미를 담은 워드마크 */}
        <header className="mt-6 text-center">
          <p className="font-sans text-[11px] tracking-[0.3em] text-[#C9A227]">{t.eyebrow}</p>

          {/* 엠블럼: 별 —(실)— 타로카드. ド가 둘을 잇는다는 의미를 가는 금색 실로 표현 */}
          <svg className="mx-auto mt-4 h-12 w-44" viewBox="0 0 176 48" fill="none" aria-hidden="true">
            {/* 잇는 실 (완만한 곡선) */}
            <path d="M34 24 C 62 12, 114 12, 142 26" stroke="#C9A227" strokeWidth="1" opacity="0.55" strokeDasharray="1 3" />
            {/* ホシ: 4포인트 별 (은은하게 숨쉬는 트윙클) */}
            <g className="bl-star" style={{ transformOrigin: '24px 24px' }}>
              <path d="M24 12 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3 Z" fill="#C9A227" />
              <path d="M24 17 l1.9 5.1 5.1 1.9 -5.1 1.9 -1.9 5.1 -1.9 -5.1 -5.1 -1.9 5.1 -1.9 Z" fill="#F5E6A8" />
            </g>
            {/* 실 위 작은 매듭 별 */}
            <path className="bl-knot" d="M88 15 l1 2.6 2.6 1 -2.6 1 -1 2.6 -1 -2.6 -2.6 -1 2.6 -1 Z" fill="#F5E6A8" style={{ transformOrigin: '88px 19px' }} />
            {/* タロ: 타로카드 (살짝 기울어진 카드 + 카드 속 작은 별) */}
            <g transform="rotate(8 152 26)">
              <rect x="143" y="10" width="18" height="30" rx="2.5" fill="#1E2050" stroke="#C9A227" strokeWidth="1.2" />
              <rect x="146" y="13" width="12" height="24" rx="1.5" fill="none" stroke="#C9A227" strokeWidth="0.6" opacity="0.5" />
              <path d="M152 21 l1.6 4.4 4.4 1.6 -4.4 1.6 -1.6 4.4 -1.6 -4.4 -4.4 -1.6 4.4 -1.6 Z" fill="#C9A227" />
            </g>
            <style>{`
              .bl-star { animation: blBreath 3.2s ease-in-out infinite; }
              .bl-knot { animation: blTwinkle 3.2s ease-in-out 1.1s infinite; }
              @keyframes blBreath {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(201,162,39,0.35)); }
                50% { transform: scale(1.1); filter: drop-shadow(0 0 7px rgba(245,230,168,0.7)); }
              }
              @keyframes blTwinkle {
                0%, 100% { opacity: 0.25; transform: scale(0.7); }
                50% { opacity: 1; transform: scale(1.1); }
              }
            `}</style>
          </svg>

          {/* 워드마크: 잇는 글자 ド만 금색으로 — "별과 타로를 잇는다" */}
          <h1 className="mt-2 text-5xl tracking-wide text-[#F6F1E4] sm:text-6xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            ホシ<span className="text-[#C9A227]">ド</span>タロ
          </h1>
          <p className="mt-3 font-sans text-sm text-[#B8B4D9]">{t.subtitle}</p>
        </header>

        <svg className="mx-auto mt-10 h-6 w-full max-w-sm" viewBox="0 0 320 24" fill="none" aria-hidden="true">
          <path d="M10 12 Q160 -4 310 12" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* 오미쿠지 선택 카드 2장 */}
        <main className="relative mt-2 flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <OmikujiCard href="/flow?mode=fortune" icon="star" label={t.cardA.label} desc={t.cardA.desc} cta={t.cardA.cta} rotate="-rotate-2" />
          <OmikujiCard href="/flow?mode=decision" icon="tanzaku" label={t.cardB.label} desc={t.cardB.desc} cta={t.cardB.cta} rotate="rotate-2" />
        </main>

        {/* 광고 배너 자리 */}
        <AdBanner slot="0000000000" />

        {/* SEO 텍스트 콘텐츠 */}
        <section className="mt-8 rounded-xl bg-[#1A1B3A]/60 p-5">
          <h2 className="font-sans text-xs font-medium tracking-wide text-[#C9A227]">{t.guideTitle}</h2>
          <ul className="mt-3 space-y-2 font-sans text-sm text-[#D8D5EE]">
            <li>
              <Link href="/guide/astrology-basics" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">{t.guideA}</Link>
            </li>
            <li>
              <Link href="/guide/tarot-basics" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">{t.guideB}</Link>
            </li>
            <li>
              <Link href="/guide/blood-type-personality" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">{t.guideC}</Link>
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-3 text-xs">
            <Link href="/guide" className="text-[#C9A227] hover:underline underline-offset-4">{t.guideMore} →</Link>
            <Link href="/fortune-2026" className="text-[#C9A227] hover:underline underline-offset-4">{t.monthly} →</Link>
          </div>
        </section>

        <footer className="mt-8 text-center font-sans text-[11px] text-[#5D5F91]">
          {t.footer}
        </footer>
      </div>
    </div>
  );
}

// 오미쿠지 카드 — 카드 자체는 정적(기울기만 유지), 아이콘이 움직이는 마이크로 애니메이션.
// star: 별이 숨쉬듯 빛나고 작은 스파클 2개가 교차로 반짝임
// tanzaku: 대나무에 매달린 골드 단자쿠가 바람에 살랑임 + 잎 흔들림
function OmikujiCard({
  href, icon, label, desc, cta, rotate,
}: {
  href: string; icon: 'star' | 'tanzaku'; label: string; desc: string; cta: string; rotate: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex w-56 flex-col items-center rounded-2xl border border-[#C9A227]/30 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] px-6 py-8 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:border-[#C9A227]/60 ${rotate}`}
    >
      <span className="flex h-12 w-12 items-center justify-center">
        {icon === 'star' ? <StarIcon /> : <TanzakuIcon />}
      </span>
      <h3 className="mt-3 text-xl text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{label}</h3>
      <p className="mt-2 font-sans text-xs leading-relaxed text-[#B8B4D9]">{desc}</p>
      <span className="mt-5 rounded-full bg-[#C9A227] px-5 py-1.5 font-sans text-sm font-medium text-[#14152B] transition-opacity group-hover:opacity-90">
        {cta}
      </span>
    </Link>
  );
}

// ⭐ 반짝이는 별: 본체는 숨쉬듯 스케일+글로우, 스파클 2개가 반 박자씩 어긋나게 점멸
function StarIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <g className="oc-star" style={{ transformOrigin: '24px 26px' }}>
        <path
          d="M24 10 l3.4 9.2 9.2 3.4 -9.2 3.4 -3.4 9.2 -3.4 -9.2 -9.2 -3.4 9.2 -3.4 Z"
          fill="#C9A227"
        />
        <path
          d="M24 14.5 l2.4 6.6 6.6 2.4 -6.6 2.4 -2.4 6.6 -2.4 -6.6 -6.6 -2.4 6.6 -2.4 Z"
          fill="#F5E6A8"
        />
      </g>
      <path className="oc-sp1" d="M39 9 l1.1 3 3 1.1 -3 1.1 -1.1 3 -1.1 -3 -3 -1.1 3 -1.1 Z" fill="#F5E6A8" style={{ transformOrigin: '39px 13px' }} />
      <path className="oc-sp2" d="M9 32 l0.9 2.4 2.4 0.9 -2.4 0.9 -0.9 2.4 -0.9 -2.4 -2.4 -0.9 2.4 -0.9 Z" fill="#F5E6A8" style={{ transformOrigin: '9px 36px' }} />
      <style>{`
        .oc-star { animation: ocBreath 2.8s ease-in-out infinite; }
        .oc-sp1 { animation: ocTwinkle 2.8s ease-in-out infinite; }
        .oc-sp2 { animation: ocTwinkle 2.8s ease-in-out 1.4s infinite; }
        @keyframes ocBreath {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(201,162,39,0.4)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 8px rgba(245,230,168,0.8)); }
        }
        @keyframes ocTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </svg>
  );
}

// 🎋 단자쿠: 대나무는 고정, 골드 단자쿠가 매단 지점을 축으로 살랑살랑, 잎이 잔잔히 흔들림
function TanzakuIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      {/* 대나무 줄기 */}
      <rect x="21.5" y="6" width="4" height="36" rx="2" fill="#3E7A4E" />
      <rect x="21.5" y="15" width="4" height="1.4" fill="#2C5A38" />
      <rect x="21.5" y="26" width="4" height="1.4" fill="#2C5A38" />
      {/* 잎 (잔잔히 흔들림) */}
      <g className="oc-leaf" style={{ transformOrigin: '25px 12px' }}>
        <path d="M25 12 q9 -5 15 -2 q-8 6 -15 2 Z" fill="#4E9660" />
      </g>
      <g className="oc-leaf2" style={{ transformOrigin: '22px 22px' }}>
        <path d="M22 22 q-9 -4 -14 0 q7 5 14 0 Z" fill="#4E9660" />
      </g>
      {/* 실 + 단자쿠 (매단 지점을 축으로 스윙) */}
      <g className="oc-tz" style={{ transformOrigin: '31px 17px' }}>
        <line x1="31" y1="17" x2="33" y2="23" stroke="#F5E6A8" strokeWidth="0.8" />
        <rect x="29.5" y="23" width="8" height="15" rx="1" fill="#C9A227" />
        <rect x="31" y="25.5" width="5" height="1.2" rx="0.6" fill="#14152B" opacity="0.55" />
        <rect x="31" y="28.5" width="5" height="1.2" rx="0.6" fill="#14152B" opacity="0.55" />
        <rect x="31" y="31.5" width="3.5" height="1.2" rx="0.6" fill="#14152B" opacity="0.55" />
      </g>
      <style>{`
        .oc-tz { animation: ocSwing 3.2s ease-in-out infinite; }
        .oc-leaf { animation: ocLeaf 3.2s ease-in-out infinite; }
        .oc-leaf2 { animation: ocLeaf 3.2s ease-in-out 1.6s infinite; }
        @keyframes ocSwing {
          0%, 100% { transform: rotate(-7deg); }
          50% { transform: rotate(7deg); }
        }
        @keyframes ocLeaf {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-4deg); }
        }
      `}</style>
    </svg>
  );
}
