// src/app/seikaku/page.tsx
// 性格診断 — 별자리 × 혈액형 48패턴. 정적 데이터 + 클라이언트 표시, 비용 $0.
// 검색 유입이 강한 키워드("牡羊座 A型 性格")를 노리는 SEO 콘텐츠 + 인터랙티브 도구.
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import { useSound } from '@/lib/useSound';
import DATA from '@/data/personality-48.json';

const SIGNS = [
  { key: 'aries', ja: '牡羊座' }, { key: 'taurus', ja: '牡牛座' }, { key: 'gemini', ja: '双子座' },
  { key: 'cancer', ja: '蟹座' }, { key: 'leo', ja: '獅子座' }, { key: 'virgo', ja: '乙女座' },
  { key: 'libra', ja: '天秤座' }, { key: 'scorpio', ja: '蠍座' }, { key: 'sagittarius', ja: '射手座' },
  { key: 'capricorn', ja: '山羊座' }, { key: 'aquarius', ja: '水瓶座' }, { key: 'pisces', ja: '魚座' },
];
const BLOODS = ['A', 'B', 'O', 'AB'] as const;

type Entry = { sign_ja: string; blood: string; title: string; personality: string; love: string; work: string };
const TABLE = DATA as unknown as Record<string, Entry>;

export default function SeikakuPage() {
  const sound = useSound();
  const [sign, setSign] = useState('aries');
  const [blood, setBlood] = useState<(typeof BLOODS)[number]>('A');
  const entry = useMemo(() => TABLE[`${sign}_${blood}`], [sign, blood]);
  const tap = () => sound.play('tap');

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          星座×血液型 性格診断
        </h1>
        <p className="mt-2 text-center text-xs text-[#8B8DBC]">
          12星座 × 4血液型、48パターンであなたの性格を診断します
        </p>

        {/* 별자리 */}
        <p className="mt-8 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">星座</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {SIGNS.map((s) => (
            <button key={s.key} onClick={() => { tap(); setSign(s.key); }}
              className={`rounded-lg px-1 py-2 text-[12px] transition-colors ${sign === s.key ? 'bg-[#C9A227] font-semibold text-[#14152B]' : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'}`}>
              {s.ja}
            </button>
          ))}
        </div>

        {/* 혈액형 */}
        <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">血液型</p>
        <div className="grid grid-cols-4 gap-2">
          {BLOODS.map((b) => (
            <button key={b} onClick={() => { tap(); setBlood(b); }}
              className={`rounded-lg border py-3 text-base transition-colors ${blood === b ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]' : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'}`}>
              {b}<span className="text-xs">型</span>
            </button>
          ))}
        </div>

        {/* 결과 */}
        {entry && (
          <div className="mt-8 rounded-2xl border border-[#C9A227]/40 bg-[#1A1B3A]/70 p-6">
            <h2 className="text-center text-xl text-[#F5E6A8]" style={{ fontFamily: "'Shippori Mincho', serif" }}>{entry.title}</h2>
            <div className="mt-5 space-y-4">
              <Section label="🌟 性格の傾向" text={entry.personality} />
              <Section label="💗 恋愛の傾向" text={entry.love} />
              <Section label="💼 仕事の傾向" text={entry.work} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/compat" className="rounded-full bg-[#C9A227] px-5 py-2 text-[13px] font-semibold text-[#14152B]">相手との相性を占う →</Link>
              <Link href="/flow?mode=fortune" className="rounded-full border border-[#3A3C6B] px-5 py-2 text-[13px] text-[#B8B4D9]">今日の運勢 →</Link>
            </div>
          </div>
        )}

        {/* SEO 텍스트 */}
        <section className="mt-10 space-y-3 text-[14px] leading-relaxed text-[#C9C6E0]">
          <h2 className="text-base font-semibold text-[#F6F1E4]">星座と血液型を組み合わせて占う理由</h2>
          <p>
            星座は「深層心理・価値観・恋愛観」を、血液型は「日常的な行動パターン・コミュニケーションの
            スタイル」を表すと考えられています。この2つを組み合わせることで、同じ星座でも血液型が違えば
            性格の出方が変わり、より立体的にあなたの個性を捉えることができます。
          </p>
          <p>
            診断結果はあくまで傾向のひとつです。「当たっている」と感じる部分を楽しみつつ、
            自分でも気づいていなかった一面を発見するきっかけにしてみてください。
            さらに詳しく知りたい方は
            <Link href="/guide/blood-type-personality" className="text-[#C9A227] underline underline-offset-4">血液型でわかる性格の傾向</Link>
            や
            <Link href="/guide/astrology-basics" className="text-[#C9A227] underline underline-offset-4">星座占いの基本</Link>
            もどうぞ。
          </p>
        </section>

        <AdBanner slot="0000000000" />
        <p className="mt-6 text-center text-[10px] text-[#5D5F91]">※ 本コンテンツはエンターテインメントを目的としています</p>
      </div>
    </div>
  );
}

function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-widest text-[#C9A227]">{label}</p>
      <p className="mt-1.5 text-[14px] leading-relaxed text-[#E4E1F2]">{text}</p>
    </div>
  );
}
