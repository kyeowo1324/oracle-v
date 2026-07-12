// src/app/lucky/page.tsx
// 今日のラッキーアイテム — 별자리(+혈액형) → 오늘의 럭키 색·숫자·아이템·방각·시간대.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import ShareButtons from '@/components/ShareButtons';
import { useSound } from '@/lib/useSound';

const SIGNS = [
  { key: 'aries', ja: '牡羊座' }, { key: 'taurus', ja: '牡牛座' }, { key: 'gemini', ja: '双子座' },
  { key: 'cancer', ja: '蟹座' }, { key: 'leo', ja: '獅子座' }, { key: 'virgo', ja: '乙女座' },
  { key: 'libra', ja: '天秤座' }, { key: 'scorpio', ja: '蠍座' }, { key: 'sagittarius', ja: '射手座' },
  { key: 'capricorn', ja: '山羊座' }, { key: 'aquarius', ja: '水瓶座' }, { key: 'pisces', ja: '魚座' },
];
const BLOODS = ['A', 'B', 'O', 'AB'] as const;

export default function LuckyPage() {
  const sound = useSound();
  const [sign, setSign] = useState('aries');
  const [blood, setBlood] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const q = `sign=${sign}${blood ? `&blood=${blood}` : ''}`;
        const res = await fetch(`/api/lucky?${q}`);
        const d = await res.json();
        setData(d);
        if (d?.lucky) sound.play('chime');
      } catch { setData({ error: true }); }
    })();
  }, [sign, blood]);

  const signJa = SIGNS.find((s) => s.key === sign)?.ja ?? '';
  const l = data?.lucky ?? {};
  const shareText = `${signJa}の今日のラッキーアイテムは「${l.item ?? '?'}」🍀 #ホシドタロ #ラッキーアイテム`;

  const items = [
    { icon: '🎨', label: 'ラッキーカラー', value: l.color },
    { icon: '🔢', label: 'ラッキーナンバー', value: typeof l.number === 'number' ? l.number : null },
    { icon: '✨', label: 'ラッキーアイテム', value: l.item },
    { icon: '🧭', label: 'ラッキー方位', value: l.direction },
    { icon: '⏰', label: 'ラッキータイム', value: l.time },
  ].filter((x) => x.value !== null && x.value !== undefined && x.value !== '');

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>今日のラッキーアイテム</h1>
        <p className="mt-2 text-center text-xs text-[#8B8DBC]">星座（と血液型）で、今日のあなたを後押しする5つのラッキー</p>

        {data?.reason && (
          <p className="mx-auto mt-5 max-w-xl rounded-lg bg-[#26284F] px-4 py-3 text-center text-sm leading-relaxed text-[#F0EDDD]">
            🔮 {data.reason.reasonJa}
          </p>
        )}

        <p className="mt-6 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">星座</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {SIGNS.map((s) => (
            <button key={s.key} onClick={() => { sound.play('tap'); setSign(s.key); }}
              className={`rounded-lg px-1 py-2 text-[12px] transition-colors ${sign === s.key ? 'bg-[#C9A227] font-semibold text-[#14152B]' : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'}`}>
              {s.ja}
            </button>
          ))}
        </div>

        <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-[#C9A227]">血液型 <span className="text-[#8B8DBC]">（任意・精度アップ）</span></p>
        <div className="grid grid-cols-4 gap-2">
          {BLOODS.map((b) => (
            <button key={b} onClick={() => { sound.play('tap'); setBlood(blood === b ? null : b); }}
              className={`rounded-lg border py-2.5 text-sm transition-colors ${blood === b ? 'border-[#C9A227] bg-[#C9A227] text-[#14152B]' : 'border-[#3A3C6B] bg-[#1E2050] text-[#F6F1E4] hover:border-[#C9A227]'}`}>
              {b}型
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((x) => (
            <div key={x.label} className="rounded-2xl border border-[#C9A227]/30 bg-[#1A1B3A]/70 p-4 text-center">
              <p className="text-2xl">{x.icon}</p>
              <p className="mt-1 text-[10px] text-[#8B8DBC]">{x.label}</p>
              <p className="mt-1 text-[15px] font-semibold text-[#F5E6A8]">{x.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8"><ShareButtons text={shareText} /></div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/flow?mode=fortune" className="rounded-full bg-[#C9A227] px-5 py-2 text-[13px] font-semibold text-[#14152B]">今日の運勢 →</Link>
          <Link href="/weekly" className="rounded-full border border-[#3A3C6B] px-5 py-2 text-[13px] text-[#B8B4D9]">今週の運勢 →</Link>
        </div>

        <AdBanner slot="0000000000" />
        <p className="mt-6 text-center text-[10px] text-[#5D5F91]">※ エンターテインメントを目的としています</p>
      </div>
    </div>
  );
}
