// src/app/result/fortune/page.tsx
// ★ fetch 방어: 응답이 비어있거나 실패해도 화면이 죽지 않음
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  general: { icon: '🌙', label: '総合運' },
  love: { icon: '💗', label: '恋愛運' },
  money: { icon: '💰', label: '金運' },
  work: { icon: '💼', label: '仕事運' },
};

const ZODIAC_JA: Record<string, string> = {
  aries: '牡羊座', taurus: '牡牛座', gemini: '双子座', cancer: '蟹座', leo: '獅子座', virgo: '乙女座',
  libra: '天秤座', scorpio: '蠍座', sagittarius: '射手座', capricorn: '山羊座', aquarius: '水瓶座', pisces: '魚座',
};

function TarotImage({ card }: { card: any }) {
  const [imgOk, setImgOk] = useState(true);
  const flip = card.orientation === 'reversed' ? 'rotate-180' : '';
  return (
    <div className="relative mx-auto aspect-[3/5] w-40 overflow-hidden rounded-lg bg-[#2A2D6B] ring-1 ring-[#C9A227]/30">
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image_url} alt={card.name} onError={() => setImgOk(false)} className={`h-full w-full object-cover ${flip}`} />
      ) : (
        <div className={`flex h-full w-full items-center justify-center text-sm text-[#C9A227] ${flip}`}>{card.name}</div>
      )}
    </div>
  );
}

export default function FortuneResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<any>({});
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
    const m = JSON.parse(sessionStorage.getItem('fortuneMeta') ?? '{}');
    setMeta(m);
    if (!tarotFull.length) { router.replace('/'); return; }

    (async () => {
      try {
        const res = await fetch('/api/fortune/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zodiacSign: m.zodiacSign, bloodType: m.bloodType, gender: m.gender, tarotShuffleResult: tarotFull, lang: 'ja' }),
        });
        // 빈 응답/비JSON 방어: text로 먼저 받고 파싱 시도
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        if (!data || data.error) { setError(true); }
        else setResult(data);
      } catch (e) {
        console.error('fortune fetch failed:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] text-[#C9A227]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
          <p className="mt-4 text-sm text-[#B8B4D9]">占っています…</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] px-6 text-center">
        <div>
          <p className="text-sm text-[#B8B4D9]">結果の取得に失敗しました。<br />もう一度お試しください。</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => router.push('/flow?mode=fortune')} className="rounded-lg bg-[#C9A227] px-5 py-2 text-sm text-[#14152B]">もう一度</button>
            <button onClick={() => router.push('/')} className="rounded-lg border border-[#3A3C6B] px-5 py-2 text-sm text-[#B8B4D9]">ホーム</button>
          </div>
        </div>
      </div>
    );
  }

  const activeCard = result.tarot?.[tab];

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto max-w-md px-6 pb-16 pt-6">
        <button onClick={() => router.push('/')} className="mb-2 text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </button>

        <h1 className="text-center text-3xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>今日の運勢</h1>
        <p className="mt-2 text-center text-xs tracking-widest text-[#C9A227]">
          {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-[#C9A227]">① 星座の運勢</h2>
          {result.hasZodiac ? (
            <div className="mt-3 rounded-xl bg-[#1A1B3A]/70 p-4">
              <p className="text-xs text-[#C9A227]">{ZODIAC_JA[meta.zodiacSign ?? ''] ?? ''}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{result.categories.find((c: any) => c.key === 'general')?.text}</p>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-[#3A3C6B] p-4 text-center text-xs text-[#8B8DBC]">
              星座はスキップされました（星座を選ぶと運勢が表示されます）
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-[#C9A227]">② タロット（過去・現在・未来）</h2>
          <div className="mt-3 flex gap-2">
            {result.tarot.map((c: any, i: number) => (
              <button key={i} onClick={() => setTab(i)}
                className={`flex-1 rounded-lg py-2 text-sm transition-colors ${tab === i ? 'bg-[#C9A227] text-[#14152B]' : 'bg-[#1E2050] text-[#B8B4D9] hover:text-[#F6F1E4]'}`}>
                {c.position}
              </button>
            ))}
          </div>
          {activeCard && (
            <div className="mt-4 rounded-xl bg-[#1A1B3A]/70 p-4">
              <TarotImage card={activeCard} />
              <p className="mt-3 text-center text-xs text-[#C9A227]">
                {activeCard.name}（{activeCard.orientation === 'upright' ? '正位置' : '逆位置'}）
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{activeCard.text}</p>
            </div>
          )}
        </section>

        <div className="mt-8 flex h-24 items-center justify-center rounded-lg border border-dashed border-[#4A4C86] text-xs text-[#6B6D9E]">広告 · 320×100</div>

        <section className="mt-8">
          <h2 className="text-sm font-medium text-[#C9A227]">③ 総合運勢</h2>
          {result.summary && (
            <div className="mt-3 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5 ring-1 ring-[#C9A227]/20">
              <p className="text-sm leading-relaxed text-[#F0EDDD]">{result.summary}</p>
            </div>
          )}
          {result.hasZodiac ? (
            <div className="mt-3 space-y-3">
              {result.categories.map((c: any) => (
                <div key={c.key} className="rounded-xl bg-[#1A1B3A]/70 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_META[c.key].icon}</span>
                    <h3 className="text-sm font-medium text-[#C9A227]">{CATEGORY_META[c.key].label}</h3>
                    {c.lucky_number != null && (
                      <span className="ml-auto text-xs text-[#8B8DBC]">ラッキー: {c.lucky_color} / {c.lucky_number}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{c.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-[#3A3C6B] p-4 text-center text-xs text-[#8B8DBC]">
              星座を選ぶと、総合・恋愛・金運・仕事の詳しい運勢が表示されます
            </div>
          )}
        </section>

        {result.blood && (
          <div className="mt-6 rounded-xl bg-[#1A1B3A]/70 p-4">
            <h3 className="text-sm font-medium text-[#C9A227]">🩸 血液型（参考）</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#D8D5EE]">{result.blood.text}</p>
          </div>
        )}

        <div className="mt-10 flex gap-3">
          <button
            onClick={() => {
              const text = `私の今日の運勢 🔮 #今日の運勢 #OracleV`;
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]"
          >
            結果をシェア
          </button>
          <button onClick={() => router.push('/flow?mode=fortune')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
            もう一度占う
          </button>
        </div>
        <button onClick={() => router.push('/flow?mode=decision')} className="mt-3 w-full rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
          「する・しない」も占う →
        </button>

        <p className="mt-8 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>
      </div>
    </div>
  );
}
