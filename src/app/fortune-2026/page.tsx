// src/app/fortune-2026/page.tsx
// 2026年 月別運勢の一覧 — 목록 중간에 광고 1개
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { MONTHLY_2026 } from '@/data/monthly-2026';
import { filterReleased } from '@/lib/monthlyRelease';

export const metadata = {
  title: '2026年 月別運勢 — 星座×タロットで読む1年',
  description: '2026年の月別運勢を、12星座とタロットの組み合わせで解説。各月の輝く星座・注意したい星座、ラッキーカラーやアイテムをまとめてお届けします。',
};

export const revalidate = 3600;

export default function Fortune2026IndexPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-10">
        <p className="mb-2 text-sm tracking-widest text-indigo-300">2026 FORTUNE</p>
        <h1 className="text-2xl font-bold text-white font-mincho">2026年 月別運勢</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          星座とタロットを組み合わせて、2026年の毎月の運気を読み解きます。
          その月に輝く星座、ちょっと注意したい星座、そして開運のヒントを、
          月ごとの「テーマカード」とともにお届けします。あなたの星座は今月どんな流れ？
        </p>
      </header>

      <ul className="space-y-4">
        {filterReleased(MONTHLY_2026).map((m, i) => (
          <li key={m.slug}>
            <Link
              href={`/fortune-2026/${m.month}`}
              className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#26284F] px-2 py-0.5 text-xs text-[#C9A227]">{m.month}月</span>
                <span className="text-xs text-indigo-300">今月のカード: {m.tarot.name}</span>
              </div>
              <h2 className="mt-2 text-lg font-semibold text-white">{m.title}</h2>
              <p className="mt-1 text-sm text-slate-400">輝く星座: {m.best.map((b) => b.sign).join('・')}</p>
            </Link>
            {/* 목록 중간(3번째 뒤)에 광고 1개 */}
            {i === 2 && <AdBanner slot="0000000000" />}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-slate-500">
        ※ 8月以降は順次公開予定です。本コンテンツはエンターテインメントを目的としています。
      </p>
    </main>
  );
}
