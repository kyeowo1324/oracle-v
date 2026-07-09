// src/components/AdGateModal.tsx
// 오늘 무료 조회를 이미 쓴 상태에서, 다시 점을 보러 들어올 때 뜨는 팝업.
// 배경 클릭으로는 안 닫힘(광고 노출 보장) — 카운트다운 후 버튼으로만 닫을 수 있음.
'use client';

import { useEffect, useState } from 'react';
import AdBanner from '@/components/AdBanner';

export default function AdGateModal({
  onClose,
  seconds = 5,
}: {
  onClose: () => void;
  seconds?: number;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  // 팝업이 떠 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const ready = remaining <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#3A3C6B] bg-[#14152B] p-6 text-[#F6F1E4] shadow-2xl">
        <p className="text-center text-xs tracking-widest text-[#C9A227]">本日の無料分は利用済みです</p>
        <h2 className="mt-2 text-center text-lg" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          広告を見て続ける
        </h2>
        <p className="mt-2 text-center text-xs text-[#B8B4D9]">
          広告表示後、もう一度占うことができます
        </p>

        <div className="mt-5 rounded-xl border border-[#3A3C6B] bg-[#1A1B3A]/60 p-3">
          <AdBanner slot="0000000000" className="my-0" />
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={!ready}
          className="mt-6 w-full rounded-lg bg-[#C9A227] py-3 text-sm font-medium text-[#14152B] transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          {ready ? '閉じて続ける' : `あと${remaining}秒でお進みいただけます`}
        </button>
      </div>
    </div>
  );
}
