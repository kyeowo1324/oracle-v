// src/app/result/decision/page.tsx
// 한다·안한다: 판정 + 확신도 게이지 + 타로 3장 근거(이미지 3:5·역방향 180도) + AI 조언
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFortune } from '@/lib/fortune-context';

function TarotThumb({ card }: { card: any }) {
  const [imgOk, setImgOk] = useState(true);
  const flip = card.orientation === 'reversed' ? 'rotate-180' : '';
  return (
    <div className="relative aspect-[3/5] w-12 shrink-0 overflow-hidden rounded bg-[#2A2D6B]">
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image_url} alt={card.name} onError={() => setImgOk(false)} className={`h-full w-full object-cover ${flip}`} />
      ) : (
        <div className={`flex h-full w-full items-center justify-center text-[10px] text-[#C9A227] ${flip}`}>{card.name}</div>
      )}
    </div>
  );
}

export default function DecisionResultPage() {
  const router = useRouter();
  const f = useFortune();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
    if (!tarotFull.length) { router.replace('/'); return; }
    fetch('/api/decision/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zodiacSign: f.zodiacSign, bloodType: f.bloodType, gender: f.gender, question: f.question, tarotShuffleResult: tarotFull, lang: 'ja' }),
    }).then((r) => r.json()).then(setResult).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] text-[#C9A227]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
          <p className="mt-4 text-sm text-[#B8B4D9]">答えを占っています…</p>
          <div className="mt-8 flex h-16 w-64 items-center justify-center rounded border border-dashed border-[#4A4C86] text-xs text-[#6B6D9E]">広告</div>
        </div>
      </div>
    );
  }
  if (!result) return null;

  const verdictColor = result.verdict === 'する' ? '#4ADE80' : result.verdict === 'しない' ? '#F87171' : '#C9A227';

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto max-w-md px-6 pb-16 pt-10">
        <h1 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>する・しない</h1>
        {result.question && <p className="mt-3 text-center text-sm text-[#B8B4D9]">「{result.question}」</p>}

        <div className="mt-8 text-center">
          <div className="text-6xl font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: verdictColor }}>{result.verdict}</div>
          <div className="mx-auto mt-6 max-w-xs">
            <div className="flex justify-between text-xs text-[#8B8DBC]">
              <span>しない</span><span className="text-[#C9A227]">確信度 {result.confidence}%</span><span>する</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#26284F]">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${result.confidence}%`, backgroundColor: verdictColor }} />
            </div>
          </div>
        </div>

        {result.advice && (
          <div className="mt-8 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5 ring-1 ring-[#C9A227]/20">
            <p className="text-sm leading-relaxed text-[#F0EDDD]">{result.advice}</p>
          </div>
        )}

        <div className="mt-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-[#4A4C86] text-xs text-[#6B6D9E]">広告 · 320×100</div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-[#C9A227]">占いの根拠（タロット3枚）</h2>
          <div className="mt-3 space-y-3">
            {result.tarot.map((c: any, i: number) => (
              <div key={i} className="flex gap-3 rounded-xl bg-[#1A1B3A]/70 p-3">
                <TarotThumb card={c} />
                <div>
                  <p className="text-xs text-[#C9A227]">{c.position} · {c.name}（{c.orientation === 'upright' ? '正位置' : '逆位置'}）</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#D8D5EE]">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-3">
          <button
            onClick={() => {
              const text = `「${result.question || '今日の決断'}」→ ${result.verdict}（確信度${result.confidence}%）🔮 #するしない #OracleV`;
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]"
          >
            結果をシェア
          </button>
          <button onClick={() => { f.reset(); router.push('/'); }} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
            もう一度占う
          </button>
        </div>

        <p className="mt-8 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>
      </div>
    </div>
  );
}
