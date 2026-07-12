// src/app/page.tsx
// ホシドタロ 홈 — 카테고리별 재구성판.
// 구조: 히어로(워드마크) → 메인 오미쿠지 2장(今日の運勢 / する・しない)
//   → ① 占う(一枚引き) → ② 相性・診断 → ③ 毎日チェック → ④ コレクション・ガイド
// 세로로 링크가 무한정 붙던 걸 4개 섹션 그리드로 묶어 정리.
'use client';

import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import AppInstallCard from '@/components/AppInstallCard';
import DailyHomeWidget from '@/components/DailyHomeWidget';
import ServiceTile from '@/components/home/ServiceTile';
import { useSound } from '@/lib/useSound';

export default function HomePage() {
  const t = {
    eyebrow: 'AI占いサービス',
    subtitle: '星座とタロットで、今日のあなたを占う',
    cardA: { label: '今日の運勢', desc: '星座・タロットから占う', cta: '占ってみる' },
    cardB: { label: 'する・しない', desc: 'Yes/No、迷いに答えを', cta: '決める' },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-10 pt-10 sm:max-w-2xl">
        {/* 히어로 */}
        <header className="mt-4 text-center">
          <p className="font-sans text-[11px] tracking-[0.3em] text-[#C9A227]">{t.eyebrow}</p>
          <h1 className="mt-3 text-5xl tracking-wide text-[#F6F1E4] sm:text-6xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            ホシ<span className="text-[#C9A227]">ド</span>タロ
          </h1>
          <p className="mt-3 font-sans text-sm text-[#B8B4D9]">{t.subtitle}</p>
        </header>

        <svg className="mx-auto mt-8 h-6 w-full max-w-sm" viewBox="0 0 320 24" fill="none" aria-hidden="true">
          <path d="M10 12 Q160 -4 310 12" stroke="#C9A227" strokeWidth="1.5" opacity="0.6" />
        </svg>

        {/* 메인 오미쿠지 2장 (간판 기능) */}
        <main className="relative mt-2 flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-start sm:gap-10">
          <OmikujiCard href="/flow?mode=fortune" icon="star" label={t.cardA.label} desc={t.cardA.desc} cta={t.cardA.cta} rotate="-rotate-2" />
          <OmikujiCard href="/flow?mode=decision" icon="tanzaku" label={t.cardB.label} desc={t.cardB.desc} cta={t.cardB.cta} rotate="rotate-2" />
        </main>

        {/* 스트릭 + 今日の一枚 */}
        <DailyHomeWidget />

        {/* ① 占う */}
        <Section title="占う" icon="🔮">
          <ServiceTile href="/hitokoto" icon="🎴" title="一枚引きタロット" desc="今のあなたへのメッセージを1枚で" accent />
        </Section>

        {/* ② 相性・診断 */}
        <Section title="相性・診断" icon="💞">
          <ServiceTile href="/compat" icon="💗" title="相性占い" desc="二人の星座・血液型・タロットで診断" accent />
          <ServiceTile href="/seikaku" icon="🧭" title="星座×血液型 性格診断" desc="48パターンであなたの性格を" />
          <ServiceTile href="/aisho" icon="⭐" title="星座相性チェッカー" desc="エレメントで見る二人の相性" />
          <ServiceTile href="/aisho-ranking" icon="👑" title="星座相性ランキング" desc="12星座との相性を順位で" />
        </Section>

        {/* ③ 毎日チェック */}
        <Section title="毎日チェック" icon="📅">
          <ServiceTile href="/weekly" icon="🗓" title="今週の運勢" desc="星座別・今週の3運を先取り" />
          <ServiceTile href="/lucky" icon="🍀" title="今日のラッキーアイテム" desc="色・数字・方位で運気アップ" />
          <ServiceTile href="/fortune-2026" icon="🌙" title="2026年 月別運勢" desc="今月のあなたの流れを読む" />
        </Section>

        {/* 광고 */}
        <div className="mt-8"><AdBanner slot="0000000000" /></div>

        {/* ④ コレクション・ガイド */}
        <Section title="コレクション・ガイド" icon="📚">
          <ServiceTile href="/collection" icon="🗂" title="カードコレクション" desc="引いたカードの図鑑・収集率" />
          <ServiceTile href="/guide" icon="📖" title="占いガイド" desc="星座・タロット・開運の読み物" />
        </Section>

        <AppInstallCard />

        <footer className="mt-8 text-center font-sans text-[11px] text-[#5D5F91]">
          本サービスはエンターテインメント目的です
        </footer>
      </div>
    </div>
  );
}

// 카테고리 섹션 래퍼
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <h2 className="font-sans text-xs font-medium tracking-widest text-[#C9A227]">{title}</h2>
        <span className="ml-2 h-px flex-1 bg-gradient-to-r from-[#C9A227]/30 to-transparent" />
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

// 메인 오미쿠지 카드 (효과음 추가)
function OmikujiCard({
  href, icon, label, desc, cta, rotate,
}: {
  href: string; icon: 'star' | 'tanzaku'; label: string; desc: string; cta: string; rotate: string;
}) {
  const sound = useSound();
  return (
    <Link
      href={href}
      onClick={() => sound.play('tap')}
      className={`group relative flex w-56 flex-col items-center rounded-2xl border border-[#C9A227]/30 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] px-6 py-8 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:border-[#C9A227]/60 ${rotate}`}
    >
      <span className="flex h-12 w-12 items-center justify-center">
        {icon === 'star' ? (
          <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
            <path d="M24 6 L28 20 L42 24 L28 28 L24 42 L20 28 L6 24 L20 20 Z" fill="#C9A227" opacity="0.9">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </path>
          </svg>
        ) : (
          <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
            <rect x="18" y="8" width="12" height="30" rx="2" fill="#C9A227" opacity="0.9">
              <animateTransform attributeName="transform" type="rotate" values="-3 24 8;3 24 8;-3 24 8" dur="3.5s" repeatCount="indefinite" />
            </rect>
          </svg>
        )}
      </span>
      <span className="mt-4 text-xl text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{label}</span>
      <span className="mt-1.5 font-sans text-[11px] text-[#8B8DBC]">{desc}</span>
      <span className="mt-4 rounded-full bg-[#C9A227] px-5 py-1.5 font-sans text-[12px] font-semibold text-[#14152B]">{cta}</span>
    </Link>
  );
}
