// src/app/result/decision/page.tsx
// する・しない 결과(재설계): 판정 크게 → 카드 1장 → 「詳細を見る」 토글 → AIひとこと
// ★ Context 미사용, sessionStorage(fortuneMeta, tarotFull)만 → 크래시 방지
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function TarotCardView({ card }: { card: any }) {
  const [imgOk, setImgOk] = useState(true);
  const flip = card.orientation === 'reversed' ? 'rotate-180' : '';
  return (
    <div className="relative mx-auto aspect-[3/5] w-32 overflow-hidden rounded-lg bg-[#2A2D6B] ring-1 ring-[#C9A227]/30">
      {imgOk && card.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image_url} alt={card.name} onError={() => setImgOk(false)} className={`h-full w-full object-cover ${flip}`} />
      ) : (
        <div className={`flex h-full w-full items-center justify-center p-2 text-center text-xs text-[#C9A227] ${flip}`}>{card.name}</div>
      )}
    </div>
  );
}

export default function DecisionResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
    const m = JSON.parse(sessionStorage.getItem('fortuneMeta') ?? '{}');
    if (!tarotFull.length) { router.replace('/'); return; }
    fetch('/api/decision/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: m.question, tarotShuffleResult: tarotFull, lang: 'ja' }),
    }).then((r) => r.json()).then(setResult).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] text-[#C9A227]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C9A227] border-t-transparent" />
          <p className="mt-4 text-sm text-[#B8B4D9]">答えを占っています…</p>
        </div>
      </div>
    );
  }
  if (!result || result.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14152B] text-center text-sm text-[#B8B4D9]">
        <div>
          <p>結果を取得できませんでした。</p>
          <button onClick={() => router.push('/')} className="mt-4 rounded-lg bg-[#C9A227] px-5 py-2 text-[#14152B]">ホームへ</button>
        </div>
      </div>
    );
  }

  const verdictColor = result.verdict === 'する' ? '#4ADE80' : result.verdict === 'しない' ? '#F87171' : '#C9A227';
  const verdictSub =
    result.verdict === 'する' ? '前へ進んでよさそう' :
    result.verdict === 'しない' ? '今は控えるのが吉' : 'どちらとも言えません';
  const card = result.card;

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto max-w-md px-6 pb-16 pt-6">
        {/* 홈으로 */}
        <button onClick={() => router.push('/')} className="mb-2 text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </button>

        <h1 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>する・しない</h1>
        {result.question && <p className="mt-3 text-center text-sm text-[#B8B4D9]">「{result.question}」</p>}

        {/* 판정 */}
        <div className="mt-8 text-center">
          <div className="text-7xl font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: verdictColor }}>
            {result.verdict}
          </div>
          <p className="mt-3 text-sm text-[#B8B4D9]">{verdictSub}</p>
        </div>

        {/* 카드 1장 */}
        <div className="mt-8">
          <TarotCardView card={card} />
          <p className="mt-3 text-center text-xs text-[#C9A227]">
            {card.name}（{card.orientation === 'upright' ? '正位置' : '逆位置'}）
          </p>
        </div>

        {/* 상세보기 토글 */}
        <div className="mt-6 text-center">
          <button onClick={() => setShowDetail((v) => !v)} className="text-sm text-[#B8B4D9] underline underline-offset-4 hover:text-[#F6F1E4]">
            {showDetail ? '詳細を閉じる' : '詳細を見る（カードの意味）'}
          </button>
        </div>
        {showDetail && card.text && (
          <div className="mt-4 rounded-xl bg-[#1A1B3A]/70 p-4">
            <p className="text-sm leading-relaxed text-[#D8D5EE]">{card.text}</p>
          </div>
        )}

        {/* AI 한마디 */}
        {result.advice && (
          <div className="mt-6 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5 ring-1 ring-[#C9A227]/20">
            <p className="text-sm leading-relaxed text-[#F0EDDD]">{result.advice}</p>
          </div>
        )}

        {/* 광고 */}
        <div className="mt-8 flex h-24 items-center justify-center rounded-lg border border-dashed border-[#4A4C86] text-xs text-[#6B6D9E]">広告 · 320×100</div>

        {/* 공유 / 다시 / 다른 기능 */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              const text = `「${result.question || '今日の決断'}」→ ${result.verdict} 🔮 #するしない #OracleV`;
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
            className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]"
          >
            結果をシェア
          </button>
          <button onClick={() => router.push('/flow?mode=decision')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
            もう一度占う
          </button>
        </div>
        <button onClick={() => router.push('/flow?mode=fortune')} className="mt-3 w-full rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">
          「今日の運勢」も占う →
        </button>

        <p className="mt-8 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>
      </div>
    </div>
  );
}
