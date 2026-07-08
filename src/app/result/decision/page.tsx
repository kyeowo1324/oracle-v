// src/app/result/decision/page.tsx
// する・しない 결과: 판정 → 카드 → 상세토글 → AIひとこと + AdBanner + ShareButtons
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/AdBanner';
import ShareButtons from '@/components/ShareButtons';
import FortuneTellerLoader from '@/components/FortuneTellerLoader';
import ZoomableTarotCard from '@/components/ZoomableTarotCard';
import AdGateScreen from '@/components/AdGateScreen';
import { hasUsedFreeView, markFreeViewUsed } from '@/lib/dailyGate';

export default function DecisionResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [gated, setGated] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const runFetch = async (tarotFull: any[], m: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/decision/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: m.question, tarotShuffleResult: tarotFull, lang: 'ja' }),
      });
      const raw = await res.text();
      setResult(raw ? JSON.parse(raw) : { error: 'empty' });
    } catch {
      setResult({ error: 'fetch' });
    } finally {
      setLoading(false);
      markFreeViewUsed('decision');
    }
  };

  useEffect(() => {
    const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
    const m = JSON.parse(sessionStorage.getItem('fortuneMeta') ?? '{}');
    if (!tarotFull.length) { router.replace('/'); return; }

    if (hasUsedFreeView('decision')) {
      setGated(true);
      setLoading(false);
      return;
    }
    runFetch(tarotFull, m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gated) {
    return (
      <AdGateScreen
        onContinue={() => {
          setGated(false);
          const tarotFull = JSON.parse(sessionStorage.getItem('tarotFull') ?? '[]');
          const m = JSON.parse(sessionStorage.getItem('fortuneMeta') ?? '{}');
          runFetch(tarotFull, m);
        }}
      />
    );
  }

  if (loading) {
    return <FortuneTellerLoader message="答えを占っています" />;
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
  const shareText = `「${result.question || '今日の決断'}」の答えは… ${result.verdict}🔮 #するしない #OracleV`;

  return (
    <div className="relative min-h-screen bg-[#14152B] text-[#F6F1E4]">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }} />
      <div className="relative mx-auto max-w-md px-6 pb-16 pt-6">
        <button onClick={() => router.push('/')} className="mb-2 text-xs text-[#8B8DBC] transition-colors hover:text-[#C9A227]">
          ✦ ホームに戻る
        </button>

        <h1 className="text-center text-2xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>する・しない</h1>
        {result.question && <p className="mt-3 text-center text-sm text-[#B8B4D9]">「{result.question}」</p>}

        <div className="mt-8 text-center">
          <div className="text-7xl font-bold" style={{ fontFamily: "'Shippori Mincho', serif", color: verdictColor }}>{result.verdict}</div>
          <p className="mt-3 text-sm text-[#B8B4D9]">{verdictSub}</p>
        </div>

        <div className="mt-8">
          <ZoomableTarotCard card={card} widthClass="w-32" />
          <p className="mt-3 text-center text-xs text-[#C9A227]">{card.name}（{card.orientation === 'upright' ? '正位置' : '逆位置'}）</p>
        </div>

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

        {result.advice && (
          <div className="mt-6 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5 ring-1 ring-[#C9A227]/20">
            <p className="text-sm leading-relaxed text-[#F0EDDD]">{result.advice}</p>
          </div>
        )}

        {/* 광고 1 */}
        <AdBanner slot="0000000000" />

        {/* 관련 가이드 링크 */}
        <Link
          href="/guide/tarot-basics"
          className="mt-8 flex items-center justify-between rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/50 px-4 py-3 text-sm text-[#D8D5EE] transition-colors hover:border-[#C9A227]"
        >
          <span>📖 タロット占いの基本をもっと詳しく</span>
          <span className="text-[#C9A227]">→</span>
        </Link>

        {/* 공유 */}
        <div className="mt-8">
          <ShareButtons text={shareText} />
        </div>

        {/* 이동 */}
        <div className="mt-8 flex gap-3">
          <button onClick={() => router.push('/flow?mode=decision')} className="flex-1 rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B]">もう一度占う</button>
          <button onClick={() => router.push('/flow?mode=fortune')} className="flex-1 rounded-lg border border-[#3A3C6B] py-3 text-sm text-[#B8B4D9] hover:border-[#C9A227]">今日の運勢 →</button>
        </div>

        <p className="mt-8 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>

        {/* 광고 2: 하단 공통 */}
        <AdBanner slot="0000000000" />
      </div>
    </div>
  );
}
