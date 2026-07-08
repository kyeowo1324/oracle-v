// src/app/guide/page.tsx
// 占いガイド一覧 — 목록 중간에 광고 1개 삽입
import Link from 'next/link';
import AdBanner from '@/components/AdBanner';

export const metadata = {
  title: '占いガイド',
  description: '星座占い・タロット・血液型占い・開運の意味と読み解き方をわかりやすく解説。',
};

export const GUIDE_ARTICLES = [
  { slug: 'what-is-uranai', title: '占いとの上手な付き合い方 — 当てるより「活かす」', excerpt: '星座・タロット・血液型などをどう受け止め、日常のヒントとして活かすかを考えます。', category: '基礎', published: true },
  { slug: 'astrology-basics', title: '星座占いの基本 — 12星座の性格と運勢の読み方', excerpt: '12星座それぞれの性格傾向と、日々の運勢をどう読み解くかを丁寧に解説します。', category: '星座', published: true },
  { slug: 'zodiac-compatibility', title: '12星座の相性 — エレメントで見る恋愛・友情の傾向', excerpt: '火・地・風・水の4エレメントから、星座の相性の傾向をやさしく解説します。', category: '星座', published: true },
  { slug: 'tarot-basics', title: 'タロット占いの基本 — 大アルカナと正位置・逆位置の読み方', excerpt: '大アルカナ22枚の意味と、初心者向けの1枚引き（ワンオラクル）のやり方を解説。', category: 'タロット', published: true },
  { slug: 'tarot-three-card-spread', title: 'タロット3枚引きの読み方 — 過去・現在・未来スプレッド', excerpt: '初心者でも扱いやすい3枚スプレッドの手順と、カードをつなげて読むコツ。', category: 'タロット', published: true },
  { slug: 'tarot-love-reading', title: 'タロットで占う恋愛 — 相手の気持ちを読み解くヒント', excerpt: '恋愛でよく登場するカードの意味と、結果との向き合い方を紹介します。', category: 'タロット', published: true },
  { slug: 'blood-type-personality', title: '血液型でわかる性格の傾向 — A・B・O・AB型の特徴', excerpt: '各血液型に語られる性格イメージと相性を、文化的背景とともに紹介します。', category: '血液型', published: true },
  { slug: 'how-to-read-daily-fortune', title: '今日の運勢の見方 — 総合運・恋愛運・金運・仕事運', excerpt: '4カテゴリの運勢をどう受け止め、日常にどう活かすかをまとめました。', category: '基礎', published: true },
  { slug: 'lucky-color-number', title: 'ラッキーカラー・ラッキーナンバーの活用法【2026年】', excerpt: '2026年のラッキーカラーと、日常への無理のない取り入れ方を紹介します。', category: '基礎', published: true },
  { slug: 'kaiun-habits', title: '毎日できる開運習慣 — 今日から始める運気アップの小さな工夫', excerpt: '玄関の掃除、朝のひと工夫など、無理なく続けられる開運アクション。', category: '基礎', published: true },
] as const;

export default function GuideIndexPage() {
  const articles = GUIDE_ARTICLES.filter((a) => a.published);

  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <header className="mb-10">
        <p className="mb-2 text-sm tracking-widest text-indigo-300">GUIDE</p>
        <h1 className="text-2xl font-bold text-white font-mincho">占いガイド</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-300">
          星座・タロット・血液型・開運の意味や読み解き方を、やさしくまとめた読み物です。
          今日の運勢をもっと深く楽しむための手引きとしてご活用ください。
        </p>
      </header>

      <ul className="space-y-4">
        {articles.map((a, i) => (
          <li key={a.slug}>
            <Link
              href={`/guide/${a.slug}`}
              className="block rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <span className="text-xs text-indigo-300">{a.category}</span>
              <h2 className="mt-1 text-lg font-semibold text-white">{a.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{a.excerpt}</p>
            </Link>
            {/* 목록 중간(4번째 뒤)에 광고 1개 */}
            {i === 3 && <AdBanner slot="0000000000" />}
          </li>
        ))}
      </ul>
    </main>
  );
}
