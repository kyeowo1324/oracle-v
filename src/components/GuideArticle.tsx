// src/components/GuideArticle.tsx
// 가이드 글 공통 레이아웃. 새 글을 쓸 때 이 컴포넌트로 감싸기만 하면
// 일관된 스타일 + 구조화 데이터(Article) + 본문 광고 + 목록 복귀 링크가 자동 적용됩니다.
// ── S패치: SITE_URL을 @/lib/site 단일 출처로 통일 (S-4) ──

import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { SITE_URL } from '@/lib/site';
import { GUIDE_ARTICLES } from '@/data/guides';
import { pickRelatedGuides } from '@/lib/relatedGuides';

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

  // 화면에는 빵부스러기가 있었지만 구조화 데이터가 없어서 검색결과에 경로가 안 나왔다.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: '占いガイド', item: `${SITE_URL}/guide` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE_URL}/guide/${slug}` },
    ],
  };

  // 관련 글 3편 — 이게 없으면 글이 "막다른 길"이 되어 검색 평가와 광고 노출을 동시에 잃는다.
  const related = pickRelatedGuides(GUIDE_ARTICLES, slug, 3);

  // 글 주제에 맞는 CTA. 전에는 전부 "今日の運勢"로 고정이라
  // 타로 글을 읽고 온 사람에게도 엉뚱한 곳을 권하고 있었다.
  const CTA: Record<string, { href: string; label: string }> = {
    タロット: { href: '/flow?mode=decision', label: 'タロットで「する・しない」を占う →' },
    星座: { href: '/compat', label: '星座で相性を占う →' },
    血液型: { href: '/seikaku', label: '星座×血液型で性格を見る →' },
    夢占い: { href: '/flow?mode=fortune', label: '今日の運勢を占う →' },
    習慣: { href: '/kaiun', label: '開運日カレンダーを見る →' },
    基礎: { href: '/flow?mode=fortune', label: '今日の運勢を占う →' },
  };
  // 실제 글은 category를 "タロット / 入門"처럼 대분류+소분류로 넘긴다.
  // 앞쪽 대분류만 떼어 매칭한다(공백 유무도 흡수).
  const mainCategory = category.split('/')[0].trim();
  const cta = CTA[mainCategory] ?? { href: '/flow?mode=fortune', label: '今日の運勢を占う →' };

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
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

        {/* 관련 글 — 읽고 나서 갈 곳을 만든다(회유율·색인 양쪽에 효과) */}
        {related.length > 0 && (
          <section className="mt-10 border-t border-white/10 pt-6">
            <h2 className="mb-4 text-base font-semibold text-white">あわせて読みたい</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/guide/${r.slug}`}
                    className="block rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
                  >
                    <span className="text-[11px] text-indigo-300">{r.category}</span>
                    <p className="mt-0.5 text-[15px] font-medium leading-snug text-white">{r.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{r.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 목록 복귀 + 회유 동선 (체류시간↑) */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/10 pt-6 text-sm">
          <Link href="/guide" className="rounded-lg border border-white/15 px-4 py-2 text-slate-200 hover:border-indigo-400/50">
            ← 占いガイド一覧
          </Link>
          <Link href={cta.href} className="rounded-lg bg-[#C9A227] px-4 py-2 font-medium text-[#14152B]">
            {cta.label}
          </Link>
        </div>
      </article>
    </main>
  );
}
