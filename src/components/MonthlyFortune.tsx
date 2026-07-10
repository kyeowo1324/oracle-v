// src/components/MonthlyFortune.tsx
// 2026年 月別運勢の共通レイアウト。各月ページはデータを渡すだけ。
// 星座×タロットの組み合わせ読み物(静的コンテンツ)。実際のシャッフルは行わない。
//
// コンセプト: 「その月の数字だけシャッフルして引いた1枚」を月のテーマカードとして提示。
//   (1月=1回, 2月=2回… という設定を物語として表現)

import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { SITE_URL } from '@/lib/site';

export type SignLuck = {
  sign: string;          // 星座名(日本語)
  reason: string;        // なぜ良い/注意なのか
  color: string;         // ラッキーカラー
  item: string;          // ラッキーアイテム
};

export type MonthlyData = {
  month: number;         // 1..12
  slug: string;          // 例: '2026-01'
  title: string;
  description: string;
  tarot: {
    name: string;        // その月のカード
    orientation: '正位置' | '逆位置';
    theme: string;       // 月全体のテーマ(カードの象意から)
  };
  overview: string;      // 今月の全体の流れ(2026年の星の動きを反映)
  best: SignLuck[];      // 輝く星座 BEST(2〜3)
  caution: SignLuck[];   // 注意したい星座(1〜2)
  action: string;        // 全体の開運アクション
};

export default function MonthlyFortune({ data }: { data: MonthlyData }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    inLanguage: 'ja',
    mainEntityOfPage: `${SITE_URL}/fortune-2026/${data.slug}`,
    publisher: { '@type': 'Organization', name: 'ホシドタロ' },
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs text-slate-500">
        <Link href="/fortune-2026" className="hover:text-slate-300">2026年 月別運勢</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-400">{data.month}月</span>
      </nav>

      <article>
        <p className="mb-2 text-sm tracking-widest text-indigo-300">2026 / {data.month}月</p>
        <h1 className="mb-6 text-2xl font-bold leading-snug text-white font-mincho">{data.title}</h1>

        {/* その月のタロット */}
        <section className="rounded-xl border border-[#C9A227]/30 bg-white/[0.03] p-5">
          <p className="text-xs tracking-wide text-[#C9A227]">今月のタロット</p>
          <p className="mt-1 text-sm text-slate-400">
            {data.month}回シャッフルして引いた1枚
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {data.tarot.name}（{data.tarot.orientation}）
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-200">{data.tarot.theme}</p>
        </section>

        {/* 今月の流れ */}
        <section className="mt-8 space-y-4 text-[15px] leading-relaxed text-slate-200">
          <h2 className="text-lg font-semibold text-white">今月の全体の流れ</h2>
          <p>{data.overview}</p>
        </section>

        <AdBanner slot="0000000000" />

        {/* 輝く星座 */}
        <section className="mt-4">
          <h2 className="text-lg font-semibold text-white">今月輝く星座</h2>
          <div className="mt-3 space-y-3">
            {data.best.map((s, i) => (
              <div key={s.sign} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#C9A227] px-2 py-0.5 text-xs font-bold text-[#14152B]">
                    BEST {i + 1}
                  </span>
                  <span className="font-semibold text-white">{s.sign}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.reason}</p>
                <p className="mt-2 text-xs text-indigo-300">
                  ラッキーカラー: {s.color} ／ ラッキーアイテム: {s.item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 注意したい星座 */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold text-white">今月ちょっと注意したい星座</h2>
          <div className="mt-3 space-y-3">
            {data.caution.map((s) => (
              <div key={s.sign} className="rounded-xl border border-[#F87171]/25 bg-[#F87171]/[0.04] p-4">
                <span className="font-semibold text-white">{s.sign}</span>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{s.reason}</p>
                <p className="mt-2 text-xs text-indigo-300">
                  お守りカラー: {s.color} ／ お守りアイテム: {s.item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 開運アクション */}
        <section className="mt-6 rounded-xl bg-gradient-to-b from-[#26284F] to-[#1A1B3A] p-5 ring-1 ring-[#C9A227]/20">
          <h2 className="text-sm font-semibold text-[#C9A227]">今月の開運アクション</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-[#F0EDDD]">{data.action}</p>
        </section>

        <p className="mt-6 text-sm text-slate-400">
          ※ 本記事はエンターテインメントを目的とした内容です。星の動きの解釈には諸説あります。
        </p>

        {/* 회유 동선 */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
          <Link href="/fortune-2026" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
            ← 月別運勢の一覧
          </Link>
          <Link href="/flow?mode=fortune" className="rounded-lg bg-[#C9A227] px-4 py-2 font-medium text-[#14152B]">
            今日の運勢を占う →
          </Link>
        </div>
      </article>
    </main>
  );
}
