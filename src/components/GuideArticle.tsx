// src/components/GuideArticle.tsx
// 가이드 글 공통 레이아웃. 새 글을 쓸 때 이 컴포넌트로 감싸기만 하면
// 일관된 스타일 + 구조화 데이터(Article) + 본문 광고 + 목록 복귀 링크가 자동 적용됩니다.
// ── S패치: SITE_URL을 @/lib/site 단일 출처로 통일 (S-4) ──

import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { SITE_URL } from '@/lib/site';

export default function GuideArticle({
  category,
  title,
  description,
  slug,
  children,
  adSlot = '0000000000',
}: {
  category: string;
  title: string;
  description: string;
  slug: string;
  children: React.ReactNode;
  adSlot?: string;
}) {
  // 検索エンジン向け構造化データ(記事)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    inLanguage: 'ja',
    mainEntityOfPage: `${SITE_URL}/guide/${slug}`,
    publisher: { '@type': 'Organization', name: 'ホシドタロ' },
  };

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 빵부스러기 */}
      <nav className="mb-6 text-xs text-slate-500">
        <Link href="/guide" className="hover:text-slate-300">占いガイド</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-400">{category}</span>
      </nav>

      <article>
        <p className="mb-2 text-sm tracking-widest text-indigo-300">{category}</p>
        <h1 className="mb-6 text-2xl font-bold leading-snug text-white font-mincho">{title}</h1>

        {/* 본문: 상위에서 넘긴 요소들. 일관된 타이포는 아래 wrapper가 부여 */}
        <div className="space-y-5 text-[15px] leading-relaxed text-slate-200 [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_strong]:text-white [&_a]:text-indigo-300 [&_a]:underline">
          {children}
        </div>

        {/* 본문 하단 광고 (충분한 텍스트 뒤) */}
        <AdBanner slot={adSlot} />

        <p className="mt-2 text-sm text-slate-400">
          ※ 本記事はエンターテインメントを目的とした内容です。
        </p>

        {/* 목록 복귀 + 회유 동선 (체류시간↑) */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
          <Link href="/guide" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
            ← 占いガイド一覧
          </Link>
          <Link href="/flow?mode=fortune" className="rounded-lg bg-[#C9A227] px-4 py-2 font-medium text-[#14152B]">
            今日の運勢を占う →
          </Link>
        </div>
      </article>
    </main>
  );
}
