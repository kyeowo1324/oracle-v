// src/app/guide/page.tsx
// 占いガイド一覧（AdSense 審査用の情報性コンテンツのハブ）
//
// 記事は data 配列を増やすだけで一覧に追加されます。
// 実際の記事本文は src/app/guide/[slug]/page.tsx またはコロケーションで用意します。

import Link from 'next/link';

export const metadata = {
  title: '占いガイド | Oracle V',
  description:
    '星座占い・タロット・血液型占いの意味と読み解き方をわかりやすく解説。今日の運勢をもっと楽しむための読み物です。',
};

// ⚠️ 審査目安: 各記事 1,500〜2,000字以上・独自の視点で 10〜15本。
//    下記は骨組み。published:false は一覧に出ません(執筆中の下書き扱い)。
export const GUIDE_ARTICLES = [
  {
    slug: 'astrology-basics',
    title: '星座占いの基本 — 12星座の性格と運勢の読み方',
    excerpt: '12星座それぞれの性格傾向と、日々の運勢をどう読み解くかを丁寧に解説します。',
    category: '星座',
    published: true,
  },
  {
    slug: 'tarot-major-arcana',
    title: 'タロット大アルカナ22枚の意味一覧',
    excerpt: '愚者から世界まで、大アルカナ22枚が象徴するテーマを正位置・逆位置で整理。',
    category: 'タロット',
    published: false,
  },
  {
    slug: 'tarot-three-card-spread',
    title: '3枚引き（過去・現在・未来）の読み方',
    excerpt: '初心者でも扱いやすい3枚スプレッドの手順と、カードのつなげ方のコツ。',
    category: 'タロット',
    published: false,
  },
  {
    slug: 'blood-type-personality',
    title: '血液型でわかる性格の傾向（日本の通説）',
    excerpt: 'A・B・O・AB それぞれに語られる性格イメージを、文化的背景とともに紹介。',
    category: '血液型',
    published: false,
  },
  {
    slug: 'how-to-read-daily-fortune',
    title: '今日の運勢の見方 — 総合・恋愛・金運・仕事',
    excerpt: '4カテゴリの運勢をどう受け止め、日常にどう活かすかの考え方をまとめました。',
    category: '基礎',
    published: false,
  },
  {
    slug: 'lucky-color-number',
    title: 'ラッキーカラー・ラッキーナンバーの活用法',
    excerpt: '毎日の運勢に添えられる幸運の色と数字を、無理なく取り入れる方法。',
    category: '基礎',
    published: false,
  },
] as const;

export default function GuideIndexPage() {
  const articles = GUIDE_ARTICLES.filter((a) => a.published);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-10">
        <p className="mb-2 text-sm tracking-widest text-indigo-300">GUIDE</p>
        <h1 className="text-2xl font-bold text-white">占いガイド</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          星座・タロット・血液型の意味や読み解き方を、やさしくまとめた読み物です。
          今日の運勢をもっと深く楽しむための手引きとしてご活用ください。
        </p>
      </header>

      <ul className="space-y-4">
        {articles.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/guide/${a.slug}`}
              className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <span className="text-xs text-indigo-300">{a.category}</span>
              <h2 className="mt-1 text-lg font-semibold text-white">{a.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{a.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>

      {articles.length < 10 && (
        <p className="mt-10 text-xs text-slate-500">
          ※ 現在公開中：{articles.length}本。AdSense 審査には10本以上を推奨します。
          記事を書き終えたら該当記事の <code>published</code> を <code>true</code> にしてください。
        </p>
      )}
    </main>
  );
}
