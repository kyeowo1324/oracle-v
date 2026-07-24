// src/app/error.tsx
// 예기치 못한 오류가 났을 때의 화면(에러 바운더리).
// 이게 없으면 Next.js 기본 오류 화면(영어)이 노출되고, 사용자는 되돌아갈 방법을 잃는다.
// 'use client' 필수 — 에러 바운더리는 클라이언트 컴포넌트여야 한다.
'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 로그로 남겨 원인 추적에 쓴다(사용자에게는 상세 내용을 보여주지 않는다)
    console.error('unhandled error:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#14152B] px-6 text-center text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <div className="relative">
        <p className="text-[11px] tracking-[0.3em] text-[#C9A227]">ERROR</p>
        <h1 className="mt-4 text-2xl leading-snug" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          うまく<br />読み解けませんでした
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#B8B4D9]">
          一時的な不具合かもしれません。<br />もう一度お試しください。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-[#C9A227] px-6 py-2.5 text-[13px] font-medium text-[#14152B]"
          >
            もう一度試す
          </button>
          <Link href="/" className="rounded-full border border-[#3A3C6B] px-6 py-2.5 text-[13px] text-[#B8B4D9]">
            ホームへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
