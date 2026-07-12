// src/app/result/compat/page.tsx
// 궁합 점 결과 — 궁합도(★+%) + 세부 점수 + 다이아몬드 4장 + AI 리딩 + 공유.
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/AdBanner';
import ShareButtons from '@/components/ShareButtons';
import ShareResultImage from '@/components/ShareResultImage';
import FortuneTellerLoader from '@/components/FortuneTellerLoader';
import StarrySky from '@/components/StarrySky';
import DailyLimitScreen from '@/components/DailyLimitScreen';
import { useSound } from '@/lib/useSound';
import { SIGN_ELEMENT, type Element } from '@/lib/compat';

const SIGN_JA: Record<string, string> = {
  aries: '牡羊座', taurus: '牡牛座', gemini: '双子座', cancer: '蟹座', leo: '獅子座', virgo: '乙女座',
  libra: '天秤座', scorpio: '蠍座', sagittarius: '射手座', capricorn: '山羊座', aquarius: '水瓶座', pisces: '魚座',
};

function personLabel(p: { zodiac: string; blood: string | null; gender: string | null }): string {
  const g = p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : '';
  return `${SIGN_JA[p.zodiac] ?? p.zodiac}${p.blood ? ` ${p.blood}型` : ''}${g ? ` ${g}` : ''}`;
}

export default function CompatResultPage() {
  const router = useRouter();
  const sound = useSound();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('compatInput');
    if (!raw) { router.replace('/compat'); return; }
    (async () => {
      try {
        const res = await fetch('/api/compat/result', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...JSON.parse(raw), lang: 'ja' }),
        });
        const text = await res.text();
        const data = res.status === 429 ? { error: 'rate_limited' } : (text ? JSON.parse(text) : { error: 'empty' });
        setResult(data);
        if (!data.error) sound.play('reveal');
      } catch {
        setResult({ error: 'fetch' });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <FortuneTellerLoader message="二人の相性を占っています" />;
  if (result?.error === 'rate_limited') return <DailyLimitScreen />;
  if (!result || result.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] px-6 text-center text-sm text-[#B8B4D9]">
        <div>
          <p>結果を取得できませんでした。</p>
          <div className="mt-4 flex justify-center gap-3">
            <button onClick={() => router.push('/compat')} className="rounded-lg bg-[#C9A227] px-5 py-2 text-[#14152B]">もう一度</button>
            <button onClick={() => router.push('/')} className="rounded-lg border border-[#3A3C6B] px-5 py-2">ホーム</button>
          </div>
        </div>
      </div>
    );
  }

  const shareText = `${personLabel(result.personA)} × ${personLabel(result.personB)} の${result.relationJa}相性は星${result.stars}つ！🔮 #ホシドタロ #相性占い`;
  const shareCards = (result.cards ?? []).map((c: any) => ({
    imageUrl: c.image_url, name: c.name, orientation: c.orientation, position: c.position,
  }));

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <StarrySky />
      <div className="relative mx-auto max-w-md px-6 pb-12 pt-8">
        <button onClick={() => router.push('/')} className="text-xs text-[#8B8DBC] hover:text-[#C9A227]">✦ ホームに戻る</button>

        {/* 두 사람 + 관계 */}
        <p className="mt-4 text-center text-sm text-[#B8B4D9]">
          {personLabel(result.personA)} <span className="mx-1 text-[#C9A227]">×</span> {personLabel(result.personB)}
        </p>
        <p className="mt-1 text-center text-xs tracking-widest text-[#C9A227]">{result.relationJa}相性</p>

        {/* 궁합도 */}
        <div className="mt-4 text-center">
          <p className="text-4xl tracking-widest text-[#F5E6A8]">
            {'★'.repeat(result.stars)}<span className="text-[#3A3C6B]">{'★'.repeat(5 - result.stars)}</span>
          </p>
          <p className="mt-2 text-5xl font-bold text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            {result.percent}<span className="text-2xl text-[#8B8DBC]">点</span>
          </p>
        </div>

        {/* AI 한줄 헤드라인 */}
        {result.headline && (
          <p className="mt-4 text-center text-lg leading-relaxed text-[#F6F1E4]" style={{ fontFamily: "'Shippori Mincho', serif" }}>
            「{result.headline}」
          </p>
        )}

        {/* 세부 점수 */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { label: '星座', v: result.breakdown.zodiac },
            { label: '血液型', v: result.breakdown.blood },
            { label: 'カード', v: result.breakdown.tarot },
          ].map((x) => (
            <div key={x.label} className="rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 py-3 text-center">
              <p className="text-[10px] text-[#8B8DBC]">{x.label}</p>
              <p className="mt-1 text-lg font-semibold text-[#F5E6A8]">{x.v}</p>
            </div>
          ))}
        </div>

        {/* 다이아몬드 크로스 4장 */}
        <div className="mt-8">
          <p className="mb-3 text-center text-[11px] tracking-widest text-[#C9A227]">二人のタロット</p>
          <div className="grid grid-cols-2 gap-3">
            {(result.cards ?? []).map((c: any, i: number) => (
              <div key={i} className="rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 p-3">
                <p className="text-[10px] text-[#8B8DBC]">{c.position}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image_url}
                  alt={c.name}
                  className={`mx-auto mt-2 h-28 rounded-md ring-1 ring-[#C9A227]/30 ${c.orientation === 'reversed' ? 'rotate-180' : ''}`}
                  loading="lazy"
                />
                <p className="mt-2 text-center text-[12px] text-[#D8D5EE]">
                  {c.name}<span className="text-[#8B8DBC]">（{c.orientation === 'upright' ? '正' : '逆'}）</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI 리딩 */}
        {result.reading && (
          <div className="mt-6 rounded-2xl border border-[#C9A227]/40 bg-[#1A1B3A]/70 p-5">
            <p className="text-[10px] tracking-widest text-[#C9A227]">✦ 二人の相性リーディング</p>
            <p className="mt-3 text-[14px] leading-relaxed text-[#E4E1F2]">{result.reading}</p>
            {result.advice && (
              <div className="mt-4 rounded-xl border border-[#3A3C6B] bg-[#14152B]/60 p-4">
                <p className="text-[10px] tracking-widest text-[#C9A227]">ワンポイント</p>
                <p className="mt-2 text-[13px] leading-relaxed text-[#D8D5EE]">{result.advice}</p>
              </div>
            )}
          </div>
        )}

        {/* 相性ランキング 흡수: 나(personA)와 궁합 좋은 별자리 TOP3 (추가 API·비용 0) */}
        {result.personA?.zodiac && (() => {
          const SIGNS = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];
          const me: string = result.personA.zodiac;
          const sc = (a: string, b: string): number => {
            const ea = SIGN_ELEMENT[a] as Element | undefined;
            const eb = SIGN_ELEMENT[b] as Element | undefined;
            if (!ea || !eb) return 60;
            if (a === b) return 90;
            if (ea === eb) return 85;
            const good = (ea==='fire'&&eb==='air')||(ea==='air'&&eb==='fire')||(ea==='earth'&&eb==='water')||(ea==='water'&&eb==='earth');
            if (good) return 92;
            const tough = (ea==='fire'&&eb==='water')||(ea==='water'&&eb==='fire')||(ea==='earth'&&eb==='air')||(ea==='air'&&eb==='earth');
            return tough ? 58 : 72;
          };
          const top = SIGNS.filter((s) => s !== me).map((s) => ({ s, v: sc(me, s) })).sort((x, y) => y.v - x.v).slice(0, 3);
          return (
            <div className="mt-8 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 p-4">
              <p className="text-[11px] tracking-widest text-[#C9A227]">✦ {SIGN_JA[me]}と相性の良い星座 TOP3</p>
              <ol className="mt-3 space-y-1.5">
                {top.map((t, i) => (
                  <li key={t.s} className="flex items-center gap-3 text-sm">
                    <span className="text-[#F5E6A8]">{i + 1}位</span>
                    <span style={{ fontFamily: "'Shippori Mincho', serif" }}>{SIGN_JA[t.s]}</span>
                    <span className="ml-auto text-[11px] text-[#8B8DBC]">相性度 {t.v}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 border-t border-white/10 pt-3">
                <Link href="/seikaku" className="text-[12px] text-[#C9A227] hover:underline underline-offset-4">二人の星座×血液型 性格をもっと見る →</Link>
              </div>
            </div>
          );
        })()}

        <div className="mt-8">
          {shareCards.length > 0 && (
            <ShareResultImage type="fortune" cards={shareCards.slice(0, 3)} conclusion={`${result.relationJa}相性 星${result.stars}つ`} summary={result.reading} />
          )}
          <div className="mt-4"><ShareButtons text={shareText} /></div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={() => router.push('/compat')} className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]">別の相性を占う</button>
          <button onClick={() => router.push('/flow?mode=fortune')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9]">今日の運勢 →</button>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#5D5F91]">
          ※ 相性は傾向を示すものです。エンターテインメントとしてお楽しみください
        </p>
        <AdBanner slot="0000000000" />
      </div>
    </div>
  );
}
