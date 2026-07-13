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
    cardC: { label: '相性占い', desc: '二人の相性を占う', cta: '占ってみる' },
    cardB: { label: 'する・しない', desc: 'Yes/No、迷いに答えを', cta: '決める' },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <MotionStyles />

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

        {/* 메인 오미쿠지 3장 (간판 기능) */}
        <main className="relative mt-2 flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:gap-8">
          <OmikujiCard href="/flow?mode=fortune" variant="fortune" label={t.cardA.label} desc={t.cardA.desc} cta={t.cardA.cta} rotate="-rotate-2" />
          <OmikujiCard href="/compat" variant="compat" label={t.cardC.label} desc={t.cardC.desc} cta={t.cardC.cta} rotate="rotate-1" />
          <OmikujiCard href="/flow?mode=decision" variant="decision" label={t.cardB.label} desc={t.cardB.desc} cta={t.cardB.cta} rotate="rotate-2" />
        </main>

        {/* 연속 방문 스트릭 (인라인, localStorage 직접 읽기) */}
        <StreakInline />

        {/* ① 毎日チェック */}
        <Section title="毎日チェック" icon="📅">
          <Tile href="/weekly" icon="🗓" anim="flip" title="今週の運勢" desc="星座別・今週の3運を先取り" />
          <Tile href="/lucky" icon="🍀" anim="sway" title="今日のラッキーアイテム" desc="色・数字・方位で運気アップ" />
          <Tile href="/fortune-2026" icon="🌙" anim="glow" title="2026年 月別運勢" desc="今月のあなたの流れを読む" />
        </Section>

        {/* 광고 */}
        <div className="mt-8"><AdBanner slot="0000000000" /></div>

        {/* ④ コレクション・ガイド */}
        <Section title="コレクション・ガイド" icon="📚">
          <Tile href="/collection" icon="🗂" anim="fan" title="カードコレクション" desc="引いたカードの図鑑・収集率" />
          <Tile href="/guide" icon="📖" anim="flut" title="占いガイド" desc="星座・タロット・開運の読み物" />
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
  href, icon, title, desc, accent = false, anim,
}: {
  href: string; icon: string; title: string; desc: string; accent?: boolean; anim?: string;
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
        <span className={`inline-block ${anim ? `tileicon-${anim}` : ''}`}>{icon}</span>
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
  href, variant, label, desc, cta, rotate,
}: {
  href: string; variant: 'fortune' | 'compat' | 'decision'; label: string; desc: string; cta: string; rotate: string;
}) {
  return (
    <Link
      href={href}
      onClick={tap}
      className={`group relative flex w-56 flex-col items-center rounded-2xl border border-[#C9A227]/30 bg-gradient-to-b from-[#26284F] to-[#1A1B3A] px-6 py-8 text-center shadow-lg transition-transform duration-300 hover:-translate-y-1.5 hover:border-[#C9A227]/60 ${rotate}`}
    >
      <span className="flex h-12 w-12 items-center justify-center">
        <OmikujiIcon variant={variant} />
      </span>
      <span className="mt-4 text-xl text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{label}</span>
      <span className="mt-1.5 font-sans text-[11px] text-[#8B8DBC]">{desc}</span>
      <span className="mt-4 rounded-full bg-[#C9A227] px-5 py-1.5 font-sans text-[12px] font-semibold text-[#14152B]">{cta}</span>
    </Link>
  );
}

// 서비스별 아이콘 — 각 점의 본질을 모션으로. 애니메이션은 MotionStyles의
// keyframes로 정의하고 prefers-reduced-motion에서 자동 정지.
function OmikujiIcon({ variant }: { variant: 'fortune' | 'compat' | 'decision' }) {
  if (variant === 'fortune') {
    // 今日の運勢 — 반짝이는 별(천체를 읽는 점)
    return (
      <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
        <path className="omi-twinkle" d="M24 6 L28 20 L42 24 L28 28 L24 42 L20 28 L6 24 L20 20 Z" fill="#C9A227" style={{ transformOrigin: '24px 24px' }} />
        <circle className="omi-spark" cx="37" cy="12" r="1.6" fill="#F5E6A8" />
        <circle className="omi-spark2" cx="11" cy="36" r="1.2" fill="#F5E6A8" />
      </svg>
    );
  }
  if (variant === 'compat') {
    // 相性占い — 서로를 도는 두 빛 + 심장박동(두 사람)
    return (
      <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
        <g className="omi-beat" style={{ transformOrigin: '24px 24px' }}>
          <g className="omi-orbit" style={{ transformOrigin: '24px 24px' }}>
            <line x1="16" y1="24" x2="32" y2="24" stroke="#6E6FA8" strokeWidth="1.2" />
            <circle cx="16" cy="24" r="5" fill="#C9A227" />
            <circle cx="32" cy="24" r="5" fill="#E86AA0" />
          </g>
        </g>
      </svg>
    );
  }
  // する・しない — 흔들리는 진자(양자택일의 저울질), ○와 ✕ 사이
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
      <circle cx="10" cy="38" r="2.2" fill="none" stroke="#6E6FA8" strokeWidth="1.3" />
      <path d="M34 36 l5 5 M39 36 l-5 5" stroke="#6E6FA8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="24" cy="9" r="1.8" fill="#C9A227" />
      <g className="omi-swing" style={{ transformOrigin: '24px 9px' }}>
        <line x1="24" y1="9" x2="24" y2="33" stroke="#C9A227" strokeWidth="1.6" />
        <circle cx="24" cy="35" r="4.5" fill="#C9A227" />
      </g>
    </svg>
  );
}

// 홈 전용 모션 키프레임(자체 완결 — globals.css 불필요). 접근성: 모션 최소화 설정 시 정지.
function MotionStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
@media (prefers-reduced-motion: no-preference) {
  .omi-twinkle { animation: omiTwinkle 2.6s ease-in-out infinite; }
  @keyframes omiTwinkle { 0%,100% { transform: scale(.9); opacity:.72 } 50% { transform: scale(1.08); opacity:1 } }
  .omi-spark { animation: omiSpark 2.6s ease-in-out infinite; transform-origin:37px 12px; }
  .omi-spark2 { animation: omiSpark 2.6s ease-in-out .9s infinite; transform-origin:11px 36px; }
  @keyframes omiSpark { 0%,100% { opacity:0; transform:scale(.4) } 50% { opacity:1; transform:scale(1) } }
  .omi-orbit { animation: omiOrbit 7s linear infinite; }
  @keyframes omiOrbit { to { transform: rotate(360deg) } }
  .omi-beat { animation: omiBeat 2.2s ease-in-out infinite; }
  @keyframes omiBeat { 0%,100% { transform: scale(1) } 12% { transform: scale(1.12) } 24% { transform: scale(1) } }
  .omi-swing { animation: omiSwing 2.4s ease-in-out infinite; }
  @keyframes omiSwing { 0%,100% { transform: rotate(-17deg) } 50% { transform: rotate(17deg) } }

  .tileicon-flip, .tileicon-sway, .tileicon-glow, .tileicon-fan, .tileicon-flut { transition: transform .2s ease; }
  .group:hover .tileicon-flip { animation: tileFlip 1.2s ease-in-out; }
  @keyframes tileFlip { 0%,100% { transform: perspective(80px) rotateX(0) } 40% { transform: perspective(80px) rotateX(-34deg) } }
  .group:hover .tileicon-sway { animation: tileSway 1s ease-in-out; }
  @keyframes tileSway { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-12deg) } 75% { transform: rotate(12deg) } }
  .group:hover .tileicon-glow { animation: tileGlow 1.4s ease-in-out; }
  @keyframes tileGlow { 0%,100% { filter:none; transform:scale(1) } 50% { filter: drop-shadow(0 0 7px rgba(245,230,168,.85)); transform: scale(1.12) } }
  .group:hover .tileicon-fan { animation: tileFan 1s ease-in-out; }
  @keyframes tileFan { 0%,100% { transform: rotate(0) scale(1) } 50% { transform: rotate(9deg) scale(1.1) } }
  .group:hover .tileicon-flut { animation: tileFlut 1.1s ease-in-out; }
  @keyframes tileFlut { 0%,100% { transform: rotateY(0) } 50% { transform: rotateY(30deg) } }
}
` }} />
  );
}
