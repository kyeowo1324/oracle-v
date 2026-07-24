// src/app/not-found.tsx
// 커스텀 404. 이게 없으면 Next.js 기본 영어 화면이 그대로 노출되어
// 일본 사용자에게 "고장난 사이트"처럼 보인다(심사·이탈률에도 불리).
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#14152B] px-6 text-center text-[#F6F1E4]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #2A2D6B 0%, #1E2050 45%, #14152B 100%)' }}
      />
      <div className="relative">
        <p className="text-[11px] tracking-[0.3em] text-[#C9A227]">404</p>
        <h1 className="mt-4 text-2xl leading-snug" style={{ fontFamily: "'Shippori Mincho', serif" }}>
          そのページは<br />見つかりませんでした
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#B8B4D9]">
          アドレスが変わったか、<br />削除された可能性があります。
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/" className="rounded-full bg-[#C9A227] px-6 py-2.5 text-[13px] font-medium text-[#14152B]">
            ホームへ戻る
          </Link>
          <Link href="/guide" className="rounded-full border border-[#3A3C6B] px-6 py-2.5 text-[13px] text-[#B8B4D9]">
            占いガイドを読む
          </Link>
        </div>
      </div>
    </div>
  );
}
