// src/app/guide/page.tsx
// 占いガイド一覧
//
// 글이 20편으로 늘어나 "한 줄로 쭉 나열"은 읽기 어려워졌다.
// 카테고리별로 묶고 상단에 점프 링크를 두어, 원하는 주제로 바로 갈 수 있게 했다.
// 목록 데이터는 src/data/guides.ts 단일 출처에서 가져온다.
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';
import { GUIDE_ARTICLES, CATEGORY_ORDER, type GuideMeta } from '@/data/guides';
import { SITE_URL } from '@/lib/site';

export const metadata = {
  title: '占いガイド',
  description:
    '星座占い・タロット・血液型占い・夢占い・開運習慣の意味と読み解き方を、全20記事でやさしく解説。占いをもっと楽しむための読み物です。',
};

/** 목록 데이터는 데이터 파일이 단일 출처. 기존 import 호환을 위해 여기서도 재수출한다. */
export { GUIDE_ARTICLES };

export default function GuideIndexPage() {
  const articles = GUIDE_ARTICLES.filter((a) => a.published);

  // 카테고리별로 묶기 (CATEGORY_ORDER 순서 → 목록에 없는 카테고리는 뒤에 알파벳순)
  const byCategory = new Map<string, GuideMeta[]>();
  for (const a of articles) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }
  const known = CATEGORY_ORDER.filter((c) => byCategory.has(c));
  const unknown = [...byCategory.keys()]
    .filter((c) => !(CATEGORY_ORDER as readonly string[]).includes(c))
    .sort();
  const categories: string[] = [...known, ...unknown];

  // 検索エンジン向け: 記事一覧であることを明示
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '占いガイド',
    description: metadata.description,
    inLanguage: 'ja',
    url: `${SITE_URL}/guide`,
    hasPart: articles.map((a) => ({
      '@type': 'Article',
      headline: a.title,
      url: `${SITE_URL}/guide/${a.slug}`,
    })),
  };

  let sectionCount = 0;

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="mb-8">
        <p className="mb-2 text-sm tracking-widest text-indigo-300">GUIDE</p>
        <h1 className="font-mincho text-2xl font-bold text-white">占いガイド</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          星座・タロット・血液型・夢占い・開運習慣の意味や読み解き方を、やさしくまとめた読み物です。
          今日の運勢をもっと深く楽しむための手引きとしてご活用ください。
        </p>
        <p className="mt-2 text-sm text-slate-500">全 {articles.length} 記事</p>
      </header>

      {/* 카테고리 점프 링크 — 20편을 스크롤로만 찾게 하지 않는다 */}
      <nav aria-label="カテゴリ" className="mb-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <a
            key={c}
            href={`#cat-${encodeURIComponent(c)}`}
            className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[13px] text-slate-300 transition hover:border-indigo-400/50 hover:text-white"
          >
            {c}
            <span className="ml-1.5 text-[11px] text-slate-500">{byCategory.get(c)!.length}</span>
          </a>
        ))}
      </nav>

      {categories.map((c) => {
        const list = byCategory.get(c)!;
        sectionCount += 1;
        const showAd = sectionCount % 2 === 0;
        return (
          <section key={c} id={`cat-${encodeURIComponent(c)}`} className="mb-10 scroll-mt-6">
            <h2 className="mb-4 border-l-2 border-indigo-400/60 pl-3 text-lg font-semibold text-white">
              {c}
            </h2>
            <ul className="space-y-4">
              {list.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/guide/${a.slug}`}
                    className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
                  >
                    <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{a.excerpt}</p>
                  </Link>
                </li>
              ))}
            </ul>
            {/* 카테고리 2개마다 광고 1개 — 글 사이가 아니라 구획 사이라 읽기 흐름을 덜 끊는다 */}
            {showAd && (
              <div className="mt-6">
                <AdBanner slot="0000000000" />
              </div>
            )}
          </section>
        );
      })}

      {/* 읽고 끝내지 않게, 실제로 점칠 수 있는 곳으로 보낸다 */}
      <aside className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-500/[0.07] p-5">
        <p className="text-sm font-semibold text-white">読んだら、占ってみましょう</p>
        <p className="mt-1 text-sm text-slate-300">知識は使ってこそ。気になったものから気軽にどうぞ。</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/" className="rounded-full bg-indigo-500 px-4 py-2 text-[13px] font-medium text-white">
            今日の運勢
          </Link>
          <Link href="/saju" className="rounded-full border border-white/20 px-4 py-2 text-[13px] text-slate-200">
            四柱推命
          </Link>
          <Link href="/compat" className="rounded-full border border-white/20 px-4 py-2 text-[13px] text-slate-200">
            相性占い
          </Link>
        </div>
      </aside>
    </main>
  );
}
