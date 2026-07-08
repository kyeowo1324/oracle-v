// src/components/AdGateScreen.tsx
// 오늘 무료 조회를 이미 쓴 사용자에게, 추가 조회 전에 보여주는 전면 광고 화면.
// AdSense는 "시청 완료→보상" 콜백을 제공하지 않으므로, 카운트다운으로 최소 노출 시간을
// 보장하는 방식(인터스티셜 + 타이머)으로 구현. 광고와 버튼 사이 간격을 명확히 둬서
// 오클릭 유도로 보이지 않도록 함(AdSense 정책 고려).
'use client';

import { useEffect, useState } from 'react';
import AdBanner from '@/components/AdBanner';

export default function AdGateScreen({
  onContinue,
  seconds = 5,
}: {
  onContinue: () => void;
  seconds?: number;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const ready = remaining <= 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-[#14152B] text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 40% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-10 pt-14">
        <p className="text-center text-xs tracking-widest text-[#C9A227]">本日の無料分は利用済みです</p>
        <h1 className="mt-2 text-center text-xl" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          広告を見て結果を見る
        </h1>
        <p className="mt-2 text-center text-sm text-[#B8B4D9]">
          追加の占いは、広告表示後にご利用いただけます
        </p>

        {/* 광고 자리 — 콘텐츠와 명확히 분리된 카드 */}
        <div className="mt-8 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-4">
          <AdBanner slot="0000000000" className="my-0" />
        </div>

        {/* 광고와 버튼 사이 여백을 넉넉히 둬 오클릭 유도 방지 */}
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={onContinue}
            disabled={!ready}
            className="w-full rounded-lg bg-[#C9A227] py-3 font-medium text-[#14152B] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
          >
            {ready ? '結果を見る' : `結果を見る（あと${remaining}秒）`}
          </button>
          <p className="mt-3 text-[11px] text-[#5D5F91]">
            {ready ? '準備ができました' : '少々お待ちください…'}
          </p>
        </div>

        <p className="mt-auto pt-10 text-center text-[11px] text-[#5D5F91]">本サービスはエンターテインメント目的です</p>
      </div>
    </div>
  );
}
