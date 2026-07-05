// src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [lang, setLang] = useState<'ja' | 'ko'>('ja');

  const t = {
    ja: {
      eyebrow: 'AI占いサービス',
      title: 'Oracle V',
      subtitle: '星座とタロットで、今日のあなたを占う',
      cardA: { label: '今日の運勢', desc: '星座・タロットから選んで占う', cta: '占ってみる' },
      cardB: { label: 'する・しない', desc: 'Yes/No、迷いに答えを', cta: '決める' },
      adLabel: '広告',
      guideTitle: '占いガイド',
      guideA: '星座占いの読み方',
      guideB: 'タロットカードの意味一覧',
      guideC: '血液型占いって当たるの？',
      footer: '本サービスはエンターテインメント目的です',
    },
    ko: {
      eyebrow: 'AI 운세 서비스',
      title: 'Oracle V',
      subtitle: '별자리와 타로로 오늘의 나를 점친다',
      cardA: { label: '오늘의 운세', desc: '별자리·타로 중 골라서 보기', cta: '운세 보기' },
      cardB: { label: '한다·안한다', desc: 'Yes/No, 망설임에 답을', cta: '결정하기' },
      adLabel: '광고',
      guideTitle: '운세 가이드',
      guideA: '별자리 운세 보는 법',
      guideB: '타로카드 의미 모음',
      guideC: '혈액형 운세, 진짜 맞을까?',
      footer: '본 서비스는 엔터테인먼트 목적입니다',
    },
  }[lang];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      {/* 밤하늘 그라데이션 + 별 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(1px_1px_at_20%_30%,#F5E6A8_100%,transparent),radial-gradient(1px_1px_at_75%_15%,#F5E6A8_100%,transparent),radial-gradient(1.5px_1.5px_at_60%_45%,#F5E6A8_100%,transparent),radial-gradient(1px_1px_at_85%_60%,#F5E6A8_100%,transparent),radial-gradient(1px_1px_at_10%_65%,#F5E6A8_100%,transparent),radial-gradient(1.5px_1.5px_at_40%_10%,#F5E6A8_100%,transparent)]" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-8 sm:max-w-2xl">
        {/* 언어 토글 */}
        <div className="flex justify-end gap-1 text-xs">
          {(['ja', 'ko'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              className={`rounded-full px-3 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227] ${
                lang === l ? 'bg-[#C9A227] text-[#14152B]' : 'text-[#B8B4D9] hover:text-[#F6F1E4]'
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 브랜드 헤더 */}
        <header className="mt-6 text-center">
          <p className="font-sans text-[11px] tracking-[0.3em] text-[#C9A227]">{t.eyebrow}</p>
          <h1
            className="mt-3 text-5xl tracking-wide text-[#F6F1E4] sm:text-6xl"
            style={{ fontFamily: "'Shippori Mincho', serif" }}
          >
            {t.title}
          </h1>
          <p className="mt-3 font-sans text-sm text-[#B8B4D9]">{t.subtitle}</p>
        </header>

        {/* 시메나와(금줄) 실선 */}
        <svg className="mx-auto mt-10 h-6 w-full max-w-sm" viewBox="0 0 320 24" fill="none" aria-hidden="true">
          <path d="M10 12 Q160 -4 310 12" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* 오미쿠지 선택 카드 2장 */}
        <main className="relative mt-2 flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <OmikujiCard
            href="/flow?mode=fortune"
            icon="⭐"
            label={t.cardA.label}
            desc={t.cardA.desc}
            cta={t.cardA.cta}
            rotate="-rotate-2"
            swayDelay="0s"
          />
          <OmikujiCard
            href="/flow?mode=decision"
            icon="🎋"
            label={t.cardB.label}
            desc={t.cardB.desc}
            cta={t.cardB.cta}
            rotate="rotate-2"
            swayDelay="0.6s"
          />
        </main>

        {/* 광고 배너 자리 (AdSense) */}
        <div className="mt-12 flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-[#4A4C86] text-xs text-[#6B6D9E]">
          {t.adLabel} · 320×100
        </div>

        {/* SEO 텍스트 콘텐츠 (AdSense 승인 대비) */}
        <section className="mt-8 rounded-xl bg-[#1A1B3A]/60 p-5">
          <h2 className="font-sans text-xs font-medium tracking-wide text-[#C9A227]">
            {t.guideTitle}
          </h2>
          <ul className="mt-3 space-y-2 font-sans text-sm text-[#D8D5EE]">
            <li>
              <Link href="/guide/astrology" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">
                {t.guideA}
              </Link>
            </li>
            <li>
              <Link href="/guide/tarot" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">
                {t.guideB}
              </Link>
            </li>
            <li>
              <Link href="/guide/blood-type" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">
                {t.guideC}
              </Link>
            </li>
          </ul>
        </section>

        <footer className="mt-8 text-center font-sans text-[11px] text-[#5D5F91]">
          {t.footer}
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&family=Noto+Sans+JP:wght@400;500&display=swap');
        html {
          font-family: 'Noto Sans JP', sans-serif;
        }
        @keyframes sway {
          0%,
          100% {
            transform: rotate(var(--sway-from));
          }
          50% {
            transform: rotate(var(--sway-to));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .omikuji-sway {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function OmikujiCard({
  href,
  icon,
  label,
  desc,
  cta,
  rotate,
  swayDelay,
}: {
  href: string;
  icon: string;
  label: string;
  desc: string;
  cta: string;
  rotate: string;
  swayDelay: string;
}) {
  return (
    <Link
      href={href}
      className={`omikuji-sway group relative w-56 shrink-0 ${rotate} transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 focus-visible:-translate-y-1 focus-visible:rotate-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A227] focus-visible:outline-offset-4`}
      style={
        {
          animation: 'sway 6s ease-in-out infinite',
          animationDelay: swayDelay,
          '--sway-from': rotate.includes('-') ? '-3deg' : '1deg',
          '--sway-to': rotate.includes('-') ? '-1deg' : '3deg',
        } as React.CSSProperties
      }
    >
      {/* 매다는 실 */}
      <div className="mx-auto h-8 w-px bg-[#C9A227]/70" />
      <div className="mx-auto -mt-1 h-2 w-2 rounded-full bg-[#C9A227]" />

      {/* 종이 카드 */}
      <div className="mt-1 rounded-sm bg-[#F6F1E4] px-6 py-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
        <span className="text-3xl">{icon}</span>
        <h3
          className="mt-3 text-2xl text-[#1C1917]"
          style={{ fontFamily: "'Shippori Mincho', serif" }}
        >
          {label}
        </h3>
        <p className="mt-2 font-sans text-xs leading-relaxed text-[#5B5648]">{desc}</p>
        <span className="mt-5 inline-block font-sans text-xs font-medium tracking-wide text-[#B23A48] group-hover:underline">
          {cta} →
        </span>
      </div>
    </Link>
  );
}
