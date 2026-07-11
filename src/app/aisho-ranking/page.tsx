// src/app/aisho-ranking/page.tsx
// 相性ランキング — 내 별자리를 고르면 12별자리와의 궁합을 순위로. 클라이언트 계산만, $0.
// compat.ts의 엘리먼트 상성 로직을 재사용해 일관성 유지.
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import ShareButtons from '@/components/ShareButtons';
import { useSound } from '@/lib/useSound';
import { SIGN_ELEMENT, type Element } from '@/lib/compat';

const SIGNS = [
  { key: 'aries', ja: '牡羊座' }, { key: 'taurus', ja: '牡牛座' }, { key: 'gemini', ja: '双子座' },
  { key: 'cancer', ja: '蟹座' }, { key: 'leo', ja: '獅子座' }, { key: 'virgo', ja: '乙女座' },
  { key: 'libra', ja: '天秤座' }, { key: 'scorpio', ja: '蠍座' }, { key: 'sagittarius', ja: '射手座' },
  { key: 'capricorn', ja: '山羊座' }, { key: 'aquarius', ja: '水瓶座' }, { key: 'pisces', ja: '魚座' },
];
const EL_JA: Record<Element, string> = { fire: '火', earth: '地', air: '風', water: '水' };

// compat.ts의 zodiacScore와 동일 규칙 (클라이언트 표시용 재구현)
function score(a: string, b: string): number {
  const ea = SIGN_ELEMENT[a], eb = SIGN_ELEMENT[b];
  if (a === b) return 90;
  if (ea === eb) return 85;
  const good = (ea === 'fire' && eb === 'air') || (ea === 'air' && eb === 'fire') ||
               (ea === 'earth' && eb === 'water') || (ea === 'water' && eb === 'earth');
  if (good) return 92;
  const tough = (ea === 'fire' && eb === 'water') || (ea === 'water' && eb === 'fire') ||
                (ea === 'earth' && eb === 'air') || (ea === 'air' && eb === 'earth');
  if (tough) return 58;
  return 72;
}
function stars(s: number): number {
  return Math.max(1, Math.min(5, Math.round((s - 45) / 10)));
}

export default function AishoRankingPage() {
  const sound = useSound();
  const [sign, setSign] = useState('aries');

  const ranking = useMemo(() => {
    return SIGNS
      .filter((s) => s.key !== sign)
      .map((s) => ({ ...s, score: score(sign, s.key), el: SIGN_ELEMENT[s.key] }))
      .sort((a, b) => b.score - a.score);
  }, [sign]);

  const signJa = SIGNS.find((s) => s.key === sign)?.ja ?? '';
  const top = ranking[0];

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>星座相性ランキング</h1>
        <p className="mt-2 text-center text-xs text-[#8B8DBC]">あなたの星座を選ぶと、12星座との相性を順位で表示します</p>

        <div className="mt-6 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {SIGNS.map((s) => (
            <button key={s.key} onClick={() => { sound.play('tap'); setSign(s.key); }}
              className={`rounded-lg px-1 py-2 text-[12px] transition-colors ${sign === s.key ? 'bg-[#C9A227] font-semibold text-[#14152B]' : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'}`}>
              {s.ja}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-[#B8B4D9]">
          <span className="text-[#C9A227]">{signJa}（{EL_JA[SIGN_ELEMENT[sign]]}）</span> と相性がいい星座は…
        </p>

        <ol className="mt-4 space-y-2">
          {ranking.map((r, i) => (
            <li key={r.key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${i === 0 ? 'border-[#C9A227]/60 bg-[#C9A227]/10' : 'border-[#3A3C6B] bg-[#1A1B3A]/50'}`}>
              <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-[#F5E6A8]' : i < 3 ? 'text-[#C9A227]' : 'text-[#8B8DBC]'}`}>{i + 1}</span>
              <span className="flex-1 text-[15px]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{r.ja}<span className="ml-1.5 text-[11px] text-[#8B8DBC]">（{EL_JA[r.el]}）</span></span>
              <span className="text-[13px] tracking-wide text-[#F5E6A8]">{'★'.repeat(stars(r.score))}<span className="text-[#3A3C6B]">{'★'.repeat(5 - stars(r.score))}</span></span>
            </li>
          ))}
        </ol>

        <div className="mt-8"><ShareButtons text={`${signJa}と相性No.1は「${top?.ja}」でした！🔮 #ホシドタロ #相性ランキング`} /></div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/compat" className="rounded-full bg-[#C9A227] px-5 py-2 text-[13px] font-semibold text-[#14152B]">二人の相性を詳しく占う →</Link>
          <Link href="/seikaku" className="rounded-full border border-[#3A3C6B] px-5 py-2 text-[13px] text-[#B8B4D9]">性格診断 →</Link>
        </div>

        <section className="mt-10 space-y-3 text-[14px] leading-relaxed text-[#C9C6E0]">
          <h2 className="text-base font-semibold text-[#F6F1E4]">相性ランキングの見方</h2>
          <p>
            このランキングは、星座を火・地・風・水の4エレメントに分け、その相性の傾向から算出しています。
            「火と風」「地と水」は互いを高め合う好相性、同じエレメント同士は価値観が通じる安心の相性です。
            上位に入らなかった星座とも、違いを楽しめれば素敵な関係になれます。詳しくは
            <Link href="/guide/zodiac-compatibility" className="text-[#C9A227] underline underline-offset-4">12星座の相性</Link>
            をどうぞ。
          </p>
        </section>

        <AdBanner slot="0000000000" />
        <p className="mt-6 text-center text-[10px] text-[#5D5F91]">※ エンターテインメントを目的としています</p>
      </div>
    </div>
  );
}
