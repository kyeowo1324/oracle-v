// src/components/SiteFooter.tsx
// 전역 푸터 — 모든 페이지 하단에 법적 페이지·가이드 링크를 노출.
// AdSense는 개인정보처리방침이 "접근 가능한 위치"에 있어야 하므로 이 푸터가 심사에 필수.

import Link from 'next/link';

const YEAR = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#101128] px-5 py-8 text-slate-400">
      <div className="mx-auto max-w-2xl">
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link href="/" className="hover:text-slate-200">ホーム</Link>
          <Link href="/guide" className="hover:text-slate-200">占いガイド</Link>
          <Link href="/faq" className="hover:text-slate-200">よくある質問</Link>
          <Link href="/about" className="hover:text-slate-200">Oracle Vについて</Link>
          <Link href="/legal/privacy" className="hover:text-slate-200">プライバシーポリシー</Link>
          <Link href="/legal/disclaimer" className="hover:text-slate-200">免責事項</Link>
          <Link href="/legal/contact" className="hover:text-slate-200">お問い合わせ</Link>
        </nav>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Oracle V が提供する占い結果はエンターテインメントを目的としたものです。
          医学・法律・財務等の専門的助言に代わるものではありません。
        </p>
        <p className="mt-3 text-xs text-slate-600">© {YEAR} Oracle V</p>
      </div>
    </footer>
  );
}
