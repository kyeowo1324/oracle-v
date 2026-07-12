// src/app/page.tsx
// ホシドタロ 홈 — 카테고리별 재구성 + 자체 완결(self-contained) 버전.
//
// ⚠️ 빌드 안정성 설계:
//   이 파일은 "확실히 존재하는" 3개 컴포넌트(StarrySky / AdBanner / AppInstallCard)만
//   외부 import 한다. 스트릭 배너·서비스 타일·사운드는 전부 이 파일 안에 인라인해서,
//   다른 신규 파일(StreakBanner, ServiceTile, useSound 등)이 레포에 없어도
//   홈 빌드가 절대 깨지지 않도록 했다.
//   → 지금까지 반복된 "module not found" 에러의 근본 차단.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import AppInstallCard from '@/components/AppInstallCard';

// ── 인라인 사운드(효과음) — Web Audio, 파일 0개. useSound가 없어도 홈이 독립 동작 ──
function playTap() {
  try {
    const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
    setTimeout(() => ctx.close().catch(() => {}), 200);
  } catch {
    /* 사운드 OFF 설정이거나 오디오 불가 → 무음 (효과음은 SoundControl 토글이 별도 관리) */
  }
}

// 사운드 전역 on/off (SoundControl과 같은 localStorage 키를 공유)
function sfxEnabled(): boolean {
  try {
    return window.localStorage.getItem('hoshidotaro:sfx:v1') !== 'off';
  } catch {
    return true;
  }
}
function tap() {
  if (sfxEnabled()) playTap();
}

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

        {/* 연속 방문 스트릭 (인라인, localStorage 직접 읽기) */}
        <StreakInline />

        {/* ① 占う */}
        <Section title="占う" icon="🔮">
          <Tile href="/hitokoto" icon="🎴" title="一枚引きタロット" desc="今のあなたへのメッセージを1枚で" accent />
        </Section>

        {/* ② 相性・診断 */}
        <Section title="相性・診断" icon="💞">
          <Tile href="/compat" icon="💗" title="相性占い" desc="二人の星座・血液型・タロットで診断" accent />
          <Tile href="/seikaku" icon="🧭" title="星座×血液型 性格診断" desc="48パターンであなたの性格を" />
          <Tile href="/aisho" icon="⭐" title="星座相性チェッカー" desc="エレメントで見る二人の相性" />
          <Tile href="/aisho-ranking" icon="👑" title="星座相性ランキング" desc="12星座との相性を順位で" />
        </Section>

        {/* ③ 毎日チェック */}
        <Section title="毎日チェック" icon="📅">
          <Tile href="/weekly" icon="🗓" title="今週の運勢" desc="星座別・今週の3運を先取り" />
          <Tile href="/lucky" icon="🍀" title="今日のラッキーアイテム" desc="色・数字・方位で運気アップ" />
          <Tile href="/fortune-2026" icon="🌙" title="2026年 月別運勢" desc="今月のあなたの流れを読む" />
        </Section>

        {/* 광고 */}
        <div className="mt-8"><AdBanner slot="0000000000" /></div>

        {/* ④ コレクション・ガイド */}
        <Section title="コレクション・ガイド" icon="📚">
          <Tile href="/collection" icon="🗂" title="カードコレクション" desc="引いたカードの図鑑・収集率" />
          <Tile href="/guide" icon="📖" title="占いガイド" desc="星座・タロット・開運の読み物" />
        </Section>

        <AppInstallCard />

        {/* SEO 텍스트 (AdSense 심사용 — 홈에 텍스트 콘텐츠 확보) */}
        <section className="mt-8 rounded-xl bg-[#1A1B3A]/60 p-5">
          <h2 className="font-sans text-xs font-medium tracking-wide text-[#C9A227]">占いガイド</h2>
          <ul className="mt-3 space-y-2 font-sans text-sm text-[#D8D5EE]">
            <li><Link href="/guide/astrology-basics" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">星座占いの基本</Link></li>
            <li><Link href="/guide/tarot-basics" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">タロットカードの意味</Link></li>
            <li><Link href="/guide/blood-type-personality" className="hover:text-[#F6F1E4] hover:underline underline-offset-4">血液型でわかる性格</Link></li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-3 text-xs">
            <Link href="/guide" className="text-[#C9A227] hover:underline underline-offset-4">ガイドをもっと見る →</Link>
            <Link href="/fortune-2026" className="text-[#C9A227] hover:underline underline-offset-4">2026年 月別運勢 →</Link>
          </div>
        </section>

        <footer className="mt-8 text-center font-sans text-[11px] text-[#5D5F91]">
          本サービスはエンターテインメント目的です
        </footer>
      </div>
    </div>
  );
}

// ── 인라인 스트릭 배너 (localStorage 직접 읽기, 외부 의존 없음) ──
// 기존 streak.ts와 같은 키('shunpatsu_streak_v1')를 읽어 호환. 없으면 아무것도 안 뜸.
function StreakInline() {
  const [state, setState] = useState<{ count: number; best: number } | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('shunpatsu_streak_v1');
      if (!raw) return;
      const d = JSON.parse(raw) as { last: string; count: number; best: number };
      // JST 오늘/어제 계산
      const jst = (x: Date) => new Date(x.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
      const today = jst(new Date());
      const yesterday = jst(new Date(Date.now() - 24 * 3600 * 1000));
      const alive = d.last === today || d.last === yesterday;
      const count = alive ? d.count : 0;
      if (count > 0 || (d.best ?? 0) > 0) setState({ count, best: d.best ?? 0 });
    } catch {
      /* 스트릭 데이터 없음/파싱 실패 → 배너 미표시 */
    }
  }, []);

  if (!state) return null;

  return (
    <div className="mx-auto mt-6 flex w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-2.5 text-sm">
      <span aria-hidden>🔥</span>
      {state.count > 0 ? (
        <span className="text-[#F5E6A8]">
          連続<span className="mx-1 text-base font-semibold">{state.count}</span>日目
        </span>
      ) : (
        <span className="text-[#8B8DBC]">今日占って連続記録を再開しよう</span>
      )}
      {state.best > 1 && <span className="ml-1 text-xs text-[#8B8DBC]">（最高{state.best}日）</span>}
    </div>
  );
}

// ── 인라인 서비스 타일 (외부 ServiceTile 의존 제거) ──
function Tile({
  href, icon, title, desc, accent = false,
}: {
  href: string; icon: string; title: string; desc: string; accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={tap}
      className={`group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
        accent
          ? 'border-[#C9A227]/50 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] hover:border-[#C9A227]'
          : 'border-[#3A3C6B] bg-[#1A1B3A]/50 hover:border-[#C9A227]/60'
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14152B]/60 text-lg ring-1 ring-[#C9A227]/20">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{title}</span>
        <span className="mt-0.5 block font-sans text-[11px] leading-snug text-[#8B8DBC]">{desc}</span>
      </span>
      <span className="ml-auto self-center font-sans text-[#3A3C6B] transition-colors group-hover:text-[#C9A227]">→</span>
    </Link>
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

// 메인 오미쿠지 카드
function OmikujiCard({
  href, icon, label, desc, cta, rotate,
}: {
  href: string; icon: 'star' | 'tanzaku'; label: string; desc: string; cta: string; rotate: string;
}) {
  return (
    <Link
      href={href}
      onClick={tap}
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
