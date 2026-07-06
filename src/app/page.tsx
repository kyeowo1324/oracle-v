// src/app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

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
      guideA: '星座占いの基本',
      guideB: 'タロットカードの意味',
      guideC: '血液型でわかる性格',
      guideMore: 'ガイドをもっと見る',
      monthly: '2026年 月別運勢',
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
      guideA: '별자리 운세의 기본',
      guideB: '타로카드의 의미',
      guideC: '혈액형으로 보는 성격',
      guideMore: '가이드 더 보기',
      monthly: '2026년 월별 운세',
      footer: '본 서비스는 엔터테인먼트 목적입니다',
    },
  }[lang];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
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
          <h1 className="mt-3 text-5xl tracking-wide text-[#F6F1E4] sm:text-6xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {t.title}
          </h1>
          <p className="mt-3 font-sans text-sm text-[#B8B4D9]">{t.subtitle}</p>
        </header>

        <svg className="mx-auto mt-10 h-6 w-full max-w-sm" viewBox="0 0 320 24" fill="none" aria-hidden="true">
          <path d="M10 12 Q160 -4 310 12" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* 오미쿠지 선택 카드 2장 */}
        <main className="relative mt-2 flex flex-1 flex-col items-center justify-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <OmikujiCard href="/flow?mode=fortune" icon="⭐" label={t.cardA.label} desc={t.cardA.desc} cta={t.cardA.cta} rotate="-rotate-2" swayDelay="0s" />
          <OmikujiCard href="/flow?mode=decision" icon="🎋" label={t.cardB.label} desc={t.cardB.desc} cta={t.cardB.cta} rotate="rotate-2" swayDelay="0.6s" />
        </main>

        {/* 광고 배너 자리 */}
        <AdBanner slot="0000000000" />

        {/* SEO 텍스트 콘텐츠 — 실제 존재하는 slug로 링크 */}
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

// 오미쿠지 카드
function OmikujiCard({
  href, icon, label, desc, cta, rotate, swayDelay,
}: {
  href: string; icon: string; label: string; desc: string; cta: string; rotate: string; swayDelay: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex w-56 flex-col items-center rounded-2xl border border-[#C9A227]/30 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] px-6 py-8 text-center shadow-lg transition-transform hover:-translate-y-1 ${rotate}`}
      style={{ animation: `sway 4s ease-in-out ${swayDelay} infinite` }}
    >
      <span className="text-4xl">{icon}</span>
      <h3 className="mt-4 text-xl text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{label}</h3>
      <p className="mt-2 font-sans text-xs leading-relaxed text-[#B8B4D9]">{desc}</p>
      <span className="mt-5 rounded-full bg-[#C9A227] px-5 py-1.5 font-sans text-sm font-medium text-[#14152B] transition-opacity group-hover:opacity-90">
        {cta}
      </span>
      <style>{`@keyframes sway { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }`}</style>
    </Link>
  );
}
