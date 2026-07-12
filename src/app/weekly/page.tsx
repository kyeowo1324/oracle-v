// src/app/weekly/page.tsx
// 今週の運勢 — 별자리 선택 → 그 주의 총합/연애/일 운세 + 럭키 요소.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdBanner from '@/components/AdBanner';
import StarrySky from '@/components/StarrySky';
import { useSound } from '@/lib/useSound';

const SIGNS = [
  { key: 'aries', ja: '牡羊座' }, { key: 'taurus', ja: '牡牛座' }, { key: 'gemini', ja: '双子座' },
  { key: 'cancer', ja: '蟹座' }, { key: 'leo', ja: '獅子座' }, { key: 'virgo', ja: '乙女座' },
  { key: 'libra', ja: '天秤座' }, { key: 'scorpio', ja: '蠍座' }, { key: 'sagittarius', ja: '射手座' },
  { key: 'capricorn', ja: '山羊座' }, { key: 'aquarius', ja: '水瓶座' }, { key: 'pisces', ja: '魚座' },
];

function weekLabel(wk: string): string {
  if (!wk) return '';
  const d = new Date(wk + 'T00:00:00Z');
  const end = new Date(d); end.setUTCDate(end.getUTCDate() + 6);
  const f = (x: Date) => `${x.getUTCMonth() + 1}/${x.getUTCDate()}`;
  return `${f(d)} 〜 ${f(end)}`;
}

export default function WeeklyPage() {
  const sound = useSound();
  const [sign, setSign] = useState('aries');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/weekly?sign=${sign}`);
        const d = await res.json();
        setData(d);
        if (d?.categories?.length) sound.play('reveal');
      } catch {
        setData({ error: true });
      } finally {
        setLoading(false);
      }
    })();
  }, [sign]);

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-2xl px-5 pb-16 pt-8">
        <Link href="/" className="text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</Link>

        <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>今週の運勢</h1>
        {data?.week && <p className="mt-1 text-center text-xs text-[#C9A227]">{weekLabel(data.week)}</p>}
        <p className="mt-2 text-center text-xs text-[#8B8DBC]">星座を選ぶと、今週の運勢が表示されます</p>

        <div className="mt-6 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
          {SIGNS.map((s) => (
            <button key={s.key} onClick={() => { sound.play('tap'); setSign(s.key); }}
              className={`rounded-lg px-1 py-2 text-[12px] transition-colors ${sign === s.key ? 'bg-[#C9A227] font-semibold text-[#14152B]' : 'border border-[#3A3C6B] text-[#B8B4D9] hover:border-[#C9A227]'}`}>
              {s.ja}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-[#8B8DBC]">読み込み中…</p>
        ) : data?.categories?.length ? (
          <div className="mt-8 space-y-4">
            {data.categories.map((c: any) => (
              <div key={c.key} className="rounded-2xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-5">
                <p className="text-[11px] tracking-widest text-[#C9A227]">{c.ja}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#E4E1F2]">{c.text}</p>
                {(c.lucky_color || c.lucky_item) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#B8B4D9]">
                    {c.lucky_color && <span className="rounded-full border border-[#3A3C6B] px-3 py-1">🎨 {c.lucky_color}</span>}
                    {typeof c.lucky_number === 'number' && <span className="rounded-full border border-[#3A3C6B] px-3 py-1">🔢 {c.lucky_number}</span>}
                    {c.lucky_item && <span className="rounded-full border border-[#3A3C6B] px-3 py-1">✨ {c.lucky_item}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-[#8B8DBC]">データを取得できませんでした。</p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/flow?mode=fortune" className="rounded-full bg-[#C9A227] px-5 py-2 text-[13px] font-semibold text-[#14152B]">今日の運勢を占う →</Link>
          <Link href="/lucky" className="rounded-full border border-[#3A3C6B] px-5 py-2 text-[13px] text-[#B8B4D9]">今日のラッキーアイテム →</Link>
        </div>

        <AdBanner slot="0000000000" />
        <p className="mt-6 text-center text-[10px] text-[#5D5F91]">※ エンターテインメントを目的としています</p>
      </div>
    </div>
  );
}
